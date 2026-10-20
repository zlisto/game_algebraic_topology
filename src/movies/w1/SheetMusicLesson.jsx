import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import { LETTER_COLORS } from '../../levels/w0/Hologram'
import Seascape from '../../world/Seascape'
import CoverGraph, { liftAt } from './CoverGraph'

/**
 * "Sheet Music" lesson (videos.json level-1-9-lesson): covers ↔ subgroups, and universal covers.
 *   A 0–14   a cover built to order: two sheets, a swaps them, b fixes both — a² and b close, a doesn't
 *   B 14–28  moving the start: a three-sheeted cover where, from sheet 1, b closes and a doesn't,
 *            and from sheet 3 the other way round — conjugate subgroups
 *   C 28–42  the universal cover of the figure-eight: the tree, where only the trivial loop closes
 *   D 42–54  the universal cover of the torus: the plane; a b lifts to (1, 1), a a⁻¹ b b⁻¹ to (0, 0)
 *   E 54–66  how to play
 *   F 66–72  summary
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const TRACKS = [makeTrack({ angle: Math.PI, length: 3.6 }, [0, 0]), makeTrack({ angle: 0, length: 3.6 }, [0, 0])]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.0 }] } }
const NO_PROGRESS = { current: null }
const Y = 3.6

export const COVER_AA = { a: [1, 0], b: [0, 1] }
export const VERTS_AA = [
  [-1.6, Y, -1.4],
  [1.6, Y, -1.4],
]
export const COVER_CONJ = { a: [1, 0, 2], b: [0, 2, 1] }
export const VERTS_CONJ = [
  [-2.4, Y, -0.8],
  [0, Y, -2.4],
  [2.4, Y, -0.8],
]

/** The Cayley tree of F₂ to a few levels: [{ from, to, k }] edges and word → position. */
const DIRS = { a: [1, 0], A: [-1, 0], b: [0, -1], B: [0, 1] }
const INV = { a: 'A', A: 'a', b: 'B', B: 'b' }
export function cayleyTree(origin = [0, Y, -1.2], len = 2.6, depth = 3) {
  const edges = []
  const pos = { '': origin }
  const grow = (word, p, L, d) => {
    if (!d) return
    for (const c of ['a', 'A', 'b', 'B']) {
      if (word && INV[word[word.length - 1]] === c) continue
      const [dx, dz] = DIRS[c]
      const q = [p[0] + dx * L, p[1], p[2] + dz * L]
      const w = word + c
      pos[w] = q
      edges.push({ from: p, to: q, k: c === 'a' || c === 'A' ? 0 : 1, depth: word.length })
      grow(w, q, L / 2, d - 1)
    }
  }
  grow('', origin, len, depth)
  return { edges, pos }
}
const TREE = cayleyTree(undefined, 2.6, 4)
/** Where a reduced word sits on the tree (any depth). */
const treePos = (keys, origin = [0, Y, -1.2], len = 2.6) => {
  const p = [...origin]
  let L = len
  for (const c of keys) {
    p[0] += DIRS[c][0] * L
    p[2] += DIRS[c][1] * L
    L /= 2
  }
  return p
}

/** Mount children only while `when(t)` holds (their HTML labels ignore visibility). */
export function During({ tRef, when, children }) {
  const [on, setOn] = useState(false)
  useFrame(() => {
    const w = when(tRef.current)
    if (w !== on) setOn(w)
  })
  return on ? children : null
}

/** The tree, drawn with a reveal k ∈ [0, 1] (edges appear level by level). */
export function TreeLines({ show, reveal = () => 1 }) {
  return (
    <>
      {TREE.edges.map((e, i) => (
        <LiveLine
          key={i}
          getPts={() => {
            if (!show()) return null
            const k = reveal()
            const lvl = Math.min(1, Math.max(0, k * 4 - e.depth))
            if (lvl <= 0) return null
            return [
              [e.from[0], e.from[2], e.from[1]],
              [mix(e.from[0], e.to[0], lvl), mix(e.from[2], e.to[2], lvl), e.from[1]],
            ]
          }}
          color={LETTER_COLORS[e.k]}
          width={3}
          y={0}
        />
      ))}
    </>
  )
}

const GRID_C = [0, Y - 0.4, -1.2]
const GRID_STEP = 1.4
const gridLines = () => {
  const out = []
  for (let i = -3; i <= 3; i++) {
    out.push([
      [GRID_C[0] + i * GRID_STEP, GRID_C[2] - 3 * GRID_STEP, GRID_C[1]],
      [GRID_C[0] + i * GRID_STEP, GRID_C[2] + 3 * GRID_STEP, GRID_C[1]],
    ])
    out.push([
      [GRID_C[0] - 3 * GRID_STEP, GRID_C[2] + i * GRID_STEP, GRID_C[1]],
      [GRID_C[0] + 3 * GRID_STEP, GRID_C[2] + i * GRID_STEP, GRID_C[1]],
    ])
  }
  return out
}
const GRID = gridLines()

/** Words run in story time: [t0, seconds per letter, word as [k, dir]]. */
const A = [0, 1]
const B = [1, 1]
const Ai = [0, -1]
const Bi = [1, -1]
const RUNS = {
  aa: [2, 2.6, [A, A]],
  b: [8.4, 2.6, [B]],
  conj1: [17, 2.6, [A]],
  conj3: [22, 2.6, [A]],
  tree: [30, 2.2, [A, B, Ai, Bi]],
  plane1: [43, 2.0, [A, B]],
  plane2: [47.6, 1.5, [A, Ai, B, Bi]],
}
const runFor = (t) => Object.entries(RUNS).find(([, [t0, per, w]]) => t >= t0 && t < t0 + per * w.length + 0.8) || null
const TREE_KEY = (w) => w.map(([k, d]) => (k === 0 ? (d > 0 ? 'a' : 'A') : d > 0 ? 'b' : 'B'))

const SHOTS = [
  [0, 66, [[1.2, 12.4, 11.0], [1.2, 1.2, 0.0]], [[1.2, 12.6, 11.2], [1.2, 1.2, 0.0]]],
  [66, 80, [[1.2, 12.6, 11.2], [1.2, 1.2, 0.0]], [[1.2, 13.0, 11.6], [1.2, 1.2, 0.0]]],
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

export default function SheetMusicLesson({ tRef }) {
  const bead = useRef()
  const lift = useRef()
  const startRing = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const r = runFor(t)
    bead.current.visible = !!r
    lift.current.visible = !!r
    // B: the start sheet, ringed
    const st = t >= 14 && t < 28 ? (t < 20.5 ? 0 : 2) : null
    startRing.current.visible = st != null
    if (st != null) {
      startRing.current.position.set(...VERTS_CONJ[st])
      startRing.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.12)
    }
    if (!r) return
    const [name, [t0, per, word]] = r
    const p = Math.min(word.length, (t - t0) / per)
    const i = Math.min(word.length - 1, Math.floor(p))
    const u = smooth(Math.min(1, p - i))
    const [k, d] = word[i]
    const q = TRACKS[k].at(d > 0 ? u : 1 - u)
    bead.current.position.set(q[0], 0.4, q[1])
    const pp = Math.min(word.length, i + u)
    if (name === 'aa' || name === 'b') lift.current.position.set(...liftAt(COVER_AA, VERTS_AA, 0, word, pp).pos)
    else if (name === 'conj1' || name === 'conj3') lift.current.position.set(...liftAt(COVER_CONJ, VERTS_CONJ, name === 'conj1' ? 0 : 2, word, pp).pos)
    else if (name === 'tree') {
      const keys = TREE_KEY(word)
      const a = treePos(keys.slice(0, i))
      const b = treePos(keys.slice(0, i + 1))
      lift.current.position.set(mix(a[0], b[0], u), a[1], mix(a[2], b[2], u))
    } else {
      // the plane: a = +x, b = −z (north)
      let m = 0
      let n = 0
      word.slice(0, i).forEach(([kk, dd]) => (kk === 0 ? (m += dd) : (n += dd)))
      const dm = k === 0 ? d * u : 0
      const dn = k === 1 ? d * u : 0
      lift.current.position.set(GRID_C[0] + (m + dm) * GRID_STEP, GRID_C[1] + 0.1, GRID_C[2] - (n + dn) * GRID_STEP)
    }
  })
  const t = () => tRef.current
  const gyro = () => {
    const tt = t()
    if (tt < 54 || tt >= 66) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    return { pos: [0.4, 0, 1.2], rotY: Math.PI + 0.3, run: 0, cast: tt > 56 && tt < 60 ? 0.8 : 0.2, whip: tt > 62 && tt < 63 ? seg(tt, 62, 63) : 0, loop: 0, loopDrop: 0 }
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
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={99} palette={{ water: '#1a3a58', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <Platform site={SITE} lit current />
      {TRACKS.map((tr, i) => (
        <Track key={i} track={tr} edge={{ letter: i, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={i} pos={[0, 0]} />
      ))}
      <During tRef={tRef} when={(tt) => tt < 14}>
        <CoverGraph cover={COVER_AA} verts={VERTS_AA} />
      </During>
      <During tRef={tRef} when={(tt) => tt >= 14 && tt < 28}>
        <CoverGraph cover={COVER_CONJ} verts={VERTS_CONJ} />
      </During>
      <TreeLines show={() => (t() >= 28 && t() < 42) || t() >= 66} reveal={() => (t() >= 66 ? 1 : smooth(seg(t(), 28, 30)))} />
      {GRID.map((pts, i) => (
        <LiveLine key={i} getPts={() => (t() >= 42 && t() < 54 ? pts : null)} color="#6080c0" width={2} y={0} />
      ))}
      <mesh ref={startRing} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.44, 28]} />
        <meshBasicMaterial color="#ff8ad8" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
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
  if (t >= 66)
    return (
      <div className="lesson-steps">
        <h4>Covers and subgroups</h4>
        <p className="lesson-note">a connected cover ↔ a subgroup H of π₁, up to conjugacy</p>
        <p className="lesson-math">H = loops whose lifts close</p>
        <p className="lesson-note">the universal cover: H = 1 (a tree; a plane)</p>
      </div>
    )
  const steps = [
    ['5', 'Clasp a port: re-glue the sheets', t < 58],
    ['1', 'Lash the Stack sentinel: move the start', t >= 58 && t < 61],
    ['6', 'Compass: branch tips on the tree, pedestals on the torus', t >= 61],
  ]
  return (
    <div className="lesson-steps">
      <h4>⧉ Clasp · ◈ Compass</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function SheetMusicLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 14) body = <Card title="a cover built to order" rows={[['a swaps, b stays', 'two sheets', false], ['a opens; a², b close', '', true], ['H = ⟨a², b, a b a⁻¹⟩', 'the loops that close', true]]} foot="every connected cover is a subgroup like this" />
  else if (t < 28) body = <Card title="moving the start" rows={[['from sheet 1: b closes, a opens', '', true], ['from sheet 3: a closes, b opens', '', true], ['H′ = g H g⁻¹', 'conjugate subgroups', true]]} foot="same cover, a different start" />
  else if (t < 42) body = <Card title="the universal cover" rows={[['the tree of F₂', 'every word its own dot', false], ['a b a⁻¹ b⁻¹', 'ends somewhere new', true], ['H = 1', 'only standing still closes', true]]} foot="Hatcher, §1.3, Theorem 1.38" />
  else if (t < 54) body = <Card title="over the torus: the plane" rows={[['a ↦ (1, 0), b ↦ (0, 1)', '', true], ['a b ↦ (1, 1)', '', true], ['a a⁻¹ b b⁻¹ ↦ (0, 0)', 'closes', true]]} foot="ℝ² is the universal cover of the torus" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
