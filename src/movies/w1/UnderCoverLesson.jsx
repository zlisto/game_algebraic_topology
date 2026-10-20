import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import Seascape from '../../world/Seascape'
import CoverGraph, { liftAt } from './CoverGraph'

/**
 * "Under Cover" lesson (videos.json level-1-8-lesson): covering spaces of loops.
 *   A 0–14   the circle and a 2-sheeted cover: one lap of a carries the lift from sheet 1 to 2,
 *            two laps bring it home — a a's lift closes, a's doesn't
 *   B 14–28  covers of the figure-eight: a graph where every sheet has one a in, one a out,
 *            one b in, one b out
 *   C 28–46  the proof: in the cover a = (1 2 3), b = (1 2), the lift of a b closes and the lift of
 *            b a doesn't — so a b and b a are different loops
 *   D 46–62  how to play
 *   E 62–72  summary
 * Downstairs is the base (petals on the deck); upstairs, the cover as a graph.
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const TRACKS = [makeTrack({ angle: Math.PI, length: 3.6 }, [0, 0]), makeTrack({ angle: 0, length: 3.6 }, [0, 0])]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.0 }] } }
const NO_PROGRESS = { current: null }
const Y = 3.6 // height of the cover graph

const COVER2 = { a: [1, 0] }
const VERTS2 = [
  [-1.6, Y, -1.2],
  [1.6, Y, -1.2],
]
const COVER3 = { a: [1, 2, 0], b: [1, 0, 2] } // a = (1 2 3), b = (1 2)
const VERTS3 = [
  [-2.2, Y, -0.6],
  [0, Y, -2.6],
  [2.2, Y, -0.6],
]
const A = [0, 1]
const B = [1, 1]
/** Words run in story time: [t0, seconds per letter, word, cover, verts]. */
const RUNS = [
  [3, 3.6, [A, A], COVER2, VERTS2],
  [18, 3.0, [A, B], COVER3, VERTS3],
  [30, 3.4, [A, B], COVER3, VERTS3],
  [38, 3.4, [B, A], COVER3, VERTS3],
  [48.6, 4.4, [A], COVER3, VERTS3],
]
const runFor = (t) => RUNS.find(([t0, per, w]) => t >= t0 && t < t0 + per * w.length + 1.2) || null

const SHOTS = [
  [0, 46, [[1.2, 12.4, 11.0], [1.2, 1.0, 0.4]], [[1.2, 12.6, 11.2], [1.2, 1.0, 0.4]]],
  [46, 62, [[1.2, 11.4, 10.4], [1.0, 0.8, 0.6]], [[1.2, 11.2, 10.2], [1.0, 0.8, 0.6]]],
  [62, 80, [[1.2, 12.6, 11.2], [1.2, 1.0, 0.4]], [[1.2, 13.0, 11.6], [1.2, 1.0, 0.4]]],
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

/** Mount children only while `when(t)` holds (their HTML labels ignore visibility). */
function During({ tRef, when, children }) {
  const [on, setOn] = useState(false)
  useFrame(() => {
    const w = when(tRef.current)
    if (w !== on) setOn(w)
  })
  return on ? children : null
}

export default function UnderCoverLesson({ tRef }) {
  const bead = useRef()
  const lift = useRef()
  const petalB = useRef()
  useFrame(() => {
    const t = tRef.current
    const r = runFor(t)
    bead.current.visible = !!r
    lift.current.visible = !!r
    petalB.current.visible = t >= 14
    if (!r) return
    const [t0, per, word, cover, verts] = r
    const p = Math.min(word.length, (t - t0) / per)
    const i = Math.min(word.length - 1, Math.floor(p))
    const u = smooth(Math.min(1, p - i))
    const [k] = word[i]
    const q = TRACKS[k].at(u)
    bead.current.position.set(q[0], 0.4, q[1])
    const L = liftAt(cover, verts, 0, word, Math.min(word.length, i + u))
    lift.current.position.set(...L.pos)
  })
  const gyro = () => {
    const tt = tRef.current
    if (tt < 46 || tt >= 62) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const r = RUNS[4]
    const p = (tt - r[0]) / r[1]
    if (p >= 0 && p < 1) {
      const u = smooth(p)
      const q = TRACKS[0].at(u)
      const n = TRACKS[0].at(Math.min(1, u + 0.03))
      return { pos: [q[0], 0, q[1]], rotY: Math.atan2(n[0] - q[0], n[1] - q[1]), run: 0.95, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [0.3, 0, 0.7], rotY: Math.PI, run: 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <color attach="background" args={['#0a1424']} />
      <fog attach="fog" args={['#0a1424', 28, 72]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a8d8ff', '#0c0a18', 0.55]} />
      <directionalLight position={[10, 14, 8]} intensity={0.95} color="#c8e8ff" />
      <Stars radius={90} depth={40} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={90} scale={[30, 6, 30]} position={[0, 3, -2]} size={2.2} speed={0.25} color="#a8e0ff" />
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={88} palette={{ water: '#1a3a58', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <Platform site={SITE} lit current />
      <Track track={TRACKS[0]} edge={{ letter: 0, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={0} pos={[0, 0]} />
      <group ref={petalB}>
        <Track track={TRACKS[1]} edge={{ letter: 1, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={1} pos={[0, 0]} />
      </group>
      <During tRef={tRef} when={(t) => t < 14}>
        <CoverGraph cover={COVER2} verts={VERTS2} />
      </During>
      <During tRef={tRef} when={(t) => t >= 14}>
        <CoverGraph cover={COVER3} verts={VERTS3} />
      </During>
      <mesh ref={bead}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh ref={lift}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.75} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}

// ---------------------------------------------------------------- the 2D card

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

function Steps({ t }) {
  if (t >= 62)
    return (
      <div className="lesson-steps">
        <h4>Covers tell loops apart</h4>
        <p className="lesson-note">homotopic loops lift to paths with the same end</p>
        <p className="lesson-math">a b closes, b a doesn’t</p>
        <p className="lesson-math">⇒ ab ≠ ba</p>
      </div>
    )
  const steps = [
    ['4', 'Cord: run a petal, beacon to beacon', t < 50],
    ['●', 'the white bead is your lift, on its sheet', t >= 50 && t < 54],
    ['6', 'Compass: panel buttons set where a and b send each sheet', t >= 54 && t < 58],
    ['6', 'click the beacon to test a b and b a', t >= 58],
  ]
  return (
    <div className="lesson-steps">
      <h4>◎ Cord · ◈ Sheet Compass</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function UnderCoverLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 14) body = <Card title="a two-sheeted cover" rows={[['a: sheet 1 → 2 → 1', '', true], ['lift of a ends on 2', 'it doesn’t close', true], ['lift of a a closes', 'back on sheet 1', true]]} foot="a lift closes ⇔ the loop comes from the cover" />
  else if (t < 28) body = <Card title="covers of the figure-eight" rows={[['each sheet: one a in, one a out', '', false], ['one b in, one b out', '', false], ['a, b permute the sheets', '', true]]} foot="Hatcher draws them as graphs, §1.3 p. 58" />
  else if (t < 46) body = <Card title="a b ≠ b a" rows={[['a = (1 2 3), b = (1 2)', '', true], ['a b from 1: 1 → 2 → 1', 'closes', true], ['b a from 1: 1 → 2 → 3', 'doesn’t', true]]} foot="homotopic loops lift to paths with the same end" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
