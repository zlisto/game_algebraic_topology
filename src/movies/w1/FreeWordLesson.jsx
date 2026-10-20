import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { PatrolSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import { LETTER_COLORS } from '../../levels/w0/Hologram'
import Seascape from '../../world/Seascape'

/**
 * "Free Word Play" lesson (videos.json level-1-6-lesson): the free group on a figure-eight.
 *   A 0–12   a loop is a word: a bead runs a, then b; the tape reads a b
 *   B 12–26  cancelling: a then a⁻¹ cancels; a b a⁻¹ b⁻¹ doesn't (no letter beside its inverse)
 *   C 26–40  order: a b and b a are different reduced words — different loops
 *   D 40–52  inverses: the tape a b a⁻¹ is undone by a, b⁻¹, a⁻¹ (its letters reversed and flipped)
 *   E 52–62  the patrol marches a b a⁻¹ b⁻¹ and is unravelled from its last letter
 *   F 62–68  how to play
 *   G 68–72  summary
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const HUB = [0, 0]
const TRACKS = [makeTrack({ angle: Math.PI, length: 4.2 }, HUB), makeTrack({ angle: 0, length: 4.2 }, HUB)]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.6 }] } }
const NO_PROGRESS = { current: null }

/** A letter is [track, dir]. */
const A = [0, 1]
const B = [1, 1]
const Ai = [0, -1]
const Bi = [1, -1]
/** Laps run in story time: [start, seconds per lap, letters, starting tape]. */
const RUNS = [
  [2, 4.5, [A, B], []],
  [13, 3.5, [A, Ai], []],
  [20.5, 1.4, [A, B, Ai, Bi], []],
  [27, 4, [A, B], []],
  [41, 3.4, [A, Bi, Ai], [A, B, Ai]],
  [62.6, 4, [A], []],
]
const RUN2 = [27, 4, [B, A], []] // C: the other order, a second bead at once
const runAt = (run, t) => {
  const [t0, per, letters] = run
  const i = Math.floor((t - t0) / per)
  if (t < t0 || i >= letters.length) return null
  const u = smooth(seg(t - t0 - i * per, 0, per * 0.9))
  const [k, d] = letters[i]
  return TRACKS[k].at(d > 0 ? u : 1 - u)
}
const reduce = (w) => {
  const out = []
  for (const l of w) {
    const top = out[out.length - 1]
    if (top && top[0] === l[0] && top[1] === -l[1]) out.pop()
    else out.push(l)
  }
  return out
}
/** The tape after a run, at story time t (letters land as each lap finishes). */
const tapeOf = (run, t) => {
  const [t0, per, letters, start] = run
  const n = Math.max(0, Math.min(letters.length, Math.floor((t - t0) / per + 0.1)))
  return reduce([...start, ...letters.slice(0, n)])
}
const runFor = (t) => RUNS.find((r) => t >= r[0] - 0.5 && t < r[0] + r[1] * r[2].length + 3) || null

const SHOTS = [
  [0, 52, [[1.7, 12.6, 10.6], [1.6, 0, 0.6]], [[1.7, 12.8, 10.8], [1.6, 0, 0.6]]],
  [52, 62, [[1.6, 11.4, 9.6], [1.5, 0, 0.5]], [[1.6, 11.6, 9.8], [1.5, 0, 0.5]]],
  [62, 80, [[1.7, 12.6, 10.6], [1.6, 0, 0.6]], [[1.7, 13.0, 11.0], [1.6, 0, 0.6]]],
]
function LessonCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(mix(from[0][0], to[0][0], k), mix(from[0][1], to[0][1], k), mix(from[0][2], to[0][2], k))
    look.set(mix(from[1][0], to[1][0], k), mix(from[1][1], to[1][1], k), mix(from[1][2], to[1][2], k))
    camera.lookAt(look)
  })
  return null
}

export default function FreeWordLesson({ tRef }) {
  const bead = useRef()
  const bead2 = useRef()
  const patrol = useMemo(() => ({ x: 0, z: 0, seed: 0.4, alive: true, dying: 0, face: 0, flash: 0, hp: 4, maxHp: 4 }), [])
  const patrolG = useRef()
  useFrame(() => {
    const t = tRef.current
    const r = t < 62 ? runFor(t) : null
    const p = r ? runAt(r, t) : null
    bead.current.visible = !!p
    if (p) bead.current.position.set(p[0], 0.4, p[1])
    const q = runAt(RUN2, t)
    bead2.current.visible = !!q
    if (q) bead2.current.position.set(q[0], 0.55, q[1])
    // E: the patrol marches its word; struck from the end, it shrinks and goes
    const on = t >= 52 && t < 62
    patrolG.current.visible = on
    if (on) {
      const letters = [A, B, Ai, Bi]
      const per = 2.2
      const i = Math.floor((t - 52) / per) % 4
      const u = seg((t - 52) % per, 0, per)
      const [k, d] = letters[i]
      const [x, z] = TRACKS[k].at(d > 0 ? u : 1 - u)
      const [x2, z2] = TRACKS[k].at(Math.min(1, Math.max(0, d > 0 ? u + 0.02 : 1 - u - 0.02)))
      patrol.x = x
      patrol.z = z
      patrol.face = Math.atan2(x2 - x, z2 - z)
      patrol.hp = 4 - patrolStruck(t)
      patrol.flash = [56.4, 57.9, 59.4, 60.9].some((s) => t >= s && t < s + 0.2) ? 0.15 : 0
      patrol.dying = t >= 61.1 ? Math.max(0, 0.5 - (t - 61.1)) : 0
      patrol.alive = t < 61.1
    }
  })
  const gyro = () => {
    const tt = tRef.current
    if (tt < 62 || tt >= 68) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const p = runAt(RUNS[5], tt)
    if (p) {
      const u = seg(tt - 62.6, 0, 3.6)
      const q = TRACKS[0].at(Math.min(1, u + 0.03))
      return { pos: [p[0], 0, p[1]], rotY: Math.atan2(q[0] - p[0], q[1] - p[1]), run: 0.95, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [0.3, 0, 0.6], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <color attach="background" args={['#080a12']} />
      <fog attach="fog" args={['#080a12', 24, 58]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#a8b8ff', '#120818', 0.5]} />
      <directionalLight position={[-8, 16, 6]} intensity={0.9} color="#ffe2c4" />
      <Stars radius={80} depth={36} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={120} scale={[24, 5, 24]} position={[0, 2, -2]} size={2.2} speed={0.35} color="#b090ff" />
      <Seascape y={-1.2} depth={2.2} area={[0, 0, 50, 50]} seed={66} lanterns={8} />
      <Platform site={SITE} lit current />
      {TRACKS.map((tr, i) => (
        <Track key={i} track={tr} edge={{ letter: i, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={i} pos={[0, 0]} />
      ))}
      <mesh ref={bead}>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh ref={bead2}>
        <sphereGeometry args={[0.18, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <group ref={patrolG}>
        <PatrolSpawn e={patrol} />
      </group>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.45} intensity={0.75} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}

/** E: how many of the patrol's letters have been struck off its end by story time t. */
const patrolStruck = (t) => [56.4, 57.9, 59.4, 60.9].filter((s) => t >= s).length

// ---------------------------------------------------------------- the 2D card and the tape

const GOLD = '#ffd27a'
const INK = '#e8eefc'
const SOFT = '#9fb0d0'
const PINK = '#ff8ad8'
const MATH = { fontFamily: "'Cambria Math', 'STIX Two Math', serif" }

/** rows: [left, right, isMath] */
function Card({ title, rows, foot }) {
  return (
    <svg viewBox="0 0 260 180" className="lesson-svg">
      <text x="130" y="30" textAnchor="middle" fill={GOLD} fontSize="16" fontWeight="700">
        {title}
      </text>
      {rows.map(([a, b, math], i) => (
        <g key={i}>
          <text x="18" y={64 + i * 27} fill={math ? PINK : INK} fontSize="13.5" style={math ? MATH : undefined} fontWeight={math ? 700 : 400}>
            {a}
          </text>
          <text x="242" y={64 + i * 27} fill={SOFT} fontSize="11.5" textAnchor="end">
            {b}
          </text>
        </g>
      ))}
      {foot && (
        <text x="130" y="170" textAnchor="middle" fill={SOFT} fontSize="11">
          {foot}
        </text>
      )}
    </svg>
  )
}

/** The word tape, as coloured chips. */
function Tape({ label, word, color = '#fff2c4' }) {
  return (
    <div className="lesson-tape">
      <span className="lesson-tape-label" style={{ color }}>
        {label}
      </span>
      {word.length ? (
        word.map(([k, d], i) => (
          <span key={i} className="w16-bead" style={{ background: LETTER_COLORS[k], color: '#1a1206', fontWeight: 800, padding: '0 0.3rem', width: 'auto' }}>
            {'ab'[k]}
            {d < 0 ? '⁻¹' : ''}
          </span>
        ))
      ) : (
        <span className="w16-bead empty">empty</span>
      )}
    </div>
  )
}

function Steps({ t }) {
  if (t >= 68)
    return (
      <div className="lesson-steps">
        <h4>The free group F₂</h4>
        <p className="lesson-math">π₁(S¹ ∨ S¹) ≅ F₂</p>
        <p className="lesson-note">loops are reduced words in a, b</p>
        <p className="lesson-math">ab ≠ ba</p>
        <p className="lesson-note">only a letter beside its inverse cancels</p>
      </div>
    )
  const steps = [
    ['walk', 'leave the beacon, run a petal, come back: a letter', t < 65],
    ['⁻¹', 'against the arrows: the inverse letter', t >= 65 && t < 66.5],
    ['1', 'Lash the patrol from its last letter', t >= 66.5],
  ]
  return (
    <div className="lesson-steps">
      <h4>Laps are letters</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function FreeWordLessonOverlay({ t }) {
  if (t >= 69.5) return null
  const r = runFor(t)
  let body = null
  let tape = null
  if (t < 12) {
    body = <Card title="a loop is a word" rows={[['π₁(S¹ ∨ S¹) = F₂', 'the figure-eight', true], ['a, b', 'one petal each', true], ['a⁻¹, b⁻¹', 'run backwards', true]]} foot="each lap prints a letter" />
    tape = r && <Tape label="tape" word={tapeOf(r, t)} />
  } else if (t < 26) {
    body = <Card title="cancelling" rows={[['a a⁻¹ = (nothing)', 'side by side: cancel', true], ['a b a⁻¹ b⁻¹', 'nothing cancels', true]]} foot="only a letter beside its own inverse" />
    tape = r && <Tape label="tape" word={tapeOf(r, t)} />
  } else if (t < 40) {
    body = <Card title="order matters" rows={[['a b ≠ b a', 'different reduced words', true], ['different words', 'different loops']]} foot="unlike the torus, where ab = ba" />
    tape = (
      <>
        <Tape label="white" word={tapeOf(RUNS[3], t)} />
        <Tape label="teal" word={tapeOf(RUN2, t)} color="#5ee0d8" />
      </>
    )
  } else if (t < 52) {
    body = <Card title="undoing a word" rows={[['(a b a⁻¹)⁻¹', '', true], ['= a b⁻¹ a⁻¹', 'reverse, and flip each', true]]} foot="each new lap cancels the last letter" />
    tape = r && <Tape label="tape" word={tapeOf(r, t)} />
  } else if (t < 62) {
    body = <Card title="the patrol" rows={[['a b a⁻¹ b⁻¹', 'its word: already reduced', true], ['strike the end first', 'b⁻¹, a⁻¹, b, a']]} foot="unravel it like running its inverse" />
    tape = <Tape label="patrol" word={[A, B, Ai, Bi].slice(0, 4 - patrolStruck(t))} color={PINK} />
  } else body = <Steps t={t} />
  return (
    <div className="lesson-card">
      {body}
      {tape && <div className="lesson-tapes">{tape}</div>}
    </div>
  )
}
