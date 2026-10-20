import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { BeltRing, Pool, Projector, TerraceSky, TorusPlaza } from '../../levels/w1/PushForwardScene'
import Seascape from '../../world/Seascape'

/**
 * "Push It Forward" lesson (videos.json level-1-5-lesson):
 *   A 0–14   induced maps: z ↦ z² carries one lap of the source circle to two laps of the target
 *   B 14–28  retractions: an annulus pushed out onto its rim; a 2-lap loop inside lands as 2 laps
 *            on the rim, so rim loops that differ stay different inside (Prop. 1.17)
 *   C 28–46  the torus: a square with opposite gates glued; a then b, b then a, both reach (1, 1)
 *   D 46–56  products: a loop on S¹ × S¹ is its two shadows (2, 3)
 *   E 56–66  how to play
 *   F 66–72  summary
 * Each beat sits on its own patch of ground, and the camera moves between them.
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const circ = (c, r, u0, u1, y = 0.22, n = 72) => Array.from({ length: n + 1 }, (_, i) => {
  const a = -Math.PI / 2 + TAU * (n ? u0 + ((u1 - u0) * i) / n : u0)
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), y]
})

// the four patches
const PA = [0, 0] // projector: source and target
const SRC = [PA[0] - 2.4, PA[1] + 0.4]
const TGT = [PA[0] + 2.4, PA[1] - 0.4]
const PB = [0, -16] // the annulus
const PC = [0, -32] // the torus plaza
const PD = [0, -48] // shadows
const H = 3.0 // plaza half-size
const GRID = [PC[0] - 8.4, PC[1] + 0.4] // the lift's grid, beside the plaza (west, clear of the card)

const SHOTS = [
  [0, 14, [[2.2, 12.6, 11.4], [2.0, 0, 0.6]], [[2.2, 12.8, 11.6], [2.0, 0, 0.6]]],
  [14, 28, [[2.2, 12.6, -4.6], [2.0, 0, -15.4]], [[2.2, 12.8, -4.4], [2.0, 0, -15.4]]],
  [28, 46, [[-1.6, 12.8, -17.2], [-1.4, 0, -31.0]], [[-1.6, 13.0, -17.0], [-1.4, 0, -31.0]]],
  [46, 56, [[2.2, 12.6, -36.6], [2.0, 0, -47.4]], [[2.2, 12.8, -36.4], [2.0, 0, -47.4]]],
  [56, 66, [[1.8, 10.6, 10.0], [1.2, 0, 0.8]], [[1.8, 10.4, 9.8], [1.2, 0, 0.8]]],
  [66, 80, [[-1.6, 13.0, -17.0], [-1.4, 0, -31.0]], [[-1.6, 13.2, -16.6], [-1.4, 0, -31.0]]],
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

function Deck({ at, r = 5.4 }) {
  return (
    <mesh position={[at[0], -0.28, at[1]]}>
      <cylinderGeometry args={[r, r * 0.94, 0.6, 48]} />
      <meshStandardMaterial color="#2a2420" roughness={0.85} metalness={0.15} />
    </mesh>
  )
}

/** The plaza's path at story time t, as a lift: [m + u, n + v] in the grid, and the plaza point. */
const PLAZA_ORDERS = [
  ['a', 'b', 29.5, 36.5],
  ['b', 'a', 37.5, 44.5],
]
function plazaAt(t) {
  for (const [first, second, t0, t1] of PLAZA_ORDERS) {
    if (t < t0 || t >= t1 + 1.5) continue
    const k = seg(t, t0, t1)
    // four legs: centre → gate 1, (wrap) → centre, centre → gate 2, (wrap) → centre
    const leg = Math.min(3, Math.floor(k * 4))
    const f = smooth(k * 4 - leg)
    const dirOf = (g) => (g === 'a' ? [1, 0] : [0, 1])
    const d1 = dirOf(first)
    const d2 = dirOf(second)
    let lift = [0, 0]
    let local = [0, 0]
    if (leg === 0) (lift = [d1[0] * 0.5 * f, d1[1] * 0.5 * f]), (local = [d1[0] * f, d1[1] * f])
    else if (leg === 1) (lift = [d1[0] * (0.5 + 0.5 * f), d1[1] * (0.5 + 0.5 * f)]), (local = [d1[0] * (f - 1), d1[1] * (f - 1)])
    else if (leg === 2) (lift = [d1[0] + d2[0] * 0.5 * f, d1[1] + d2[1] * 0.5 * f]), (local = [d2[0] * f, d2[1] * f])
    else (lift = [d1[0] + d2[0] * (0.5 + 0.5 * f), d1[1] + d2[1] * (0.5 + 0.5 * f)]), (local = [d2[0] * (f - 1), d2[1] * (f - 1)])
    if (k >= 1) (lift = [1, 1]), (local = [0, 0])
    return { lift, local, first }
  }
  return null
}

export default function PushForwardLesson({ tRef }) {
  const beadA = useRef()
  const beadB = useRef()
  const plazaBead = useRef()
  const gridBead = useRef()
  const shadowA = useRef()
  const shadowB = useRef()
  useFrame(() => {
    const t = tRef.current
    // A: one lap on the source, two on the target, in step
    const ua = t >= 2 && t < 14 ? seg((t - 2) % 6, 0, 5.5) : null
    beadA.current.visible = ua != null || (t >= 57.5 && t < 62.5)
    beadB.current.visible = ua != null
    if (ua != null) {
      const [x, z] = circ(SRC, 2.0, ua, ua, 0.4, 0)[0]
      beadA.current.position.set(x, 0.4, z)
      const [x2, z2] = circ(TGT, 2.0, 2 * ua, 2 * ua, 0.4, 0)[0]
      beadB.current.position.set(x2, 0.4, z2)
    }
    // C: the plaza and its lift
    const p = plazaAt(t)
    plazaBead.current.visible = !!p
    gridBead.current.visible = !!p
    if (p) {
      plazaBead.current.position.set(PC[0] + p.local[0] * H, 0.4, PC[1] - p.local[1] * H)
      gridBead.current.position.set(GRID[0] + (p.lift[0] - 0.5) * 1.6, 0.5, GRID[1] - (p.lift[1] - 0.5) * 1.6)
    }
    // D: the shadows
    const ud = t >= 47 && t < 56 ? seg(t, 47, 55) : null
    shadowA.current.visible = ud != null
    shadowB.current.visible = ud != null
    if (ud != null) {
      const [x, z] = circ([PD[0] - 2.5, PD[1]], 2.0, 2 * ud, 2 * ud, 0.4, 0)[0]
      shadowA.current.position.set(x, 0.4, z)
      const [x2, z2] = circ([PD[0] + 2.5, PD[1]], 2.0, 3 * ud, 3 * ud, 0.4, 0)[0]
      shadowB.current.position.set(x2, 0.4, z2)
    }
  })
  const t = () => tRef.current
  const srcRun = () => {
    const tt = t()
    if (tt >= 2 && tt < 14) return circ(SRC, 2.0, 0, seg((tt - 2) % 6, 0, 5.5), 0.3)
    if (tt >= 57.5 && tt < 62.5) return circ(SRC, 2.0, 0, smooth(seg(tt, 57.5, 62)), 0.3)
    return null
  }
  const tgtRun = () => (t() >= 2 && t() < 14 ? circ(TGT, 2.0, 0, 2 * seg((t() - 2) % 6, 0, 5.5), 0.3, 144) : null)
  // B: two laps of the inner road, then pushed out onto the rim
  const inner = () => (t() >= 15 && t() < 28 ? circ(PB, 2.45, 0, 2 * smooth(seg(t(), 15.5, 21)), 0.3, 144) : null)
  const pushed = () => {
    const k = smooth(seg(t(), 21.5, 24.5))
    if (t() < 21.5 || t() >= 28) return null
    return circ(PB, mix(2.45, 3.9, k), 0, 2, 0.32, 144)
  }
  // C: the lift's path on the grid
  const gridPath = () => {
    const tt = t()
    const out = []
    for (const [, , t0, t1] of PLAZA_ORDERS) {
      if (tt < t0) continue
      for (let s = t0; s <= Math.min(tt, t1); s += 0.1) {
        const p = plazaAt(s)
        if (p) out.push([GRID[0] + (p.lift[0] - 0.5) * 1.6, GRID[1] - (p.lift[1] - 0.5) * 1.6, 0.45])
      }
      if (tt < t1) break
    }
    return tt >= 28 && tt < 46 && out.length > 1 ? out : null
  }
  const gridLines = useMemo(() => {
    const out = []
    for (let i = -1; i <= 2; i++) {
      out.push([
        [GRID[0] + (i - 0.5) * 1.6, GRID[1] + 2.4, 0.4],
        [GRID[0] + (i - 0.5) * 1.6, GRID[1] - 3.2, 0.4],
      ])
      out.push([
        [GRID[0] - 2.4, GRID[1] - (i - 0.5) * 1.6, 0.4],
        [GRID[0] + 3.2, GRID[1] - (i - 0.5) * 1.6, 0.4],
      ])
    }
    return out
  }, [])
  const shadowRunA = () => (t() >= 47 && t() < 56 ? circ([PD[0] - 2.5, PD[1]], 2.0, 0, 2 * seg(t(), 47, 55), 0.3, 144) : null)
  const shadowRunB = () => (t() >= 47 && t() < 56 ? circ([PD[0] + 2.5, PD[1]], 2.0, 0, 3 * seg(t(), 47, 55), 0.3, 216) : null)
  const gyro = () => {
    const tt = t()
    if (tt < 56 || tt >= 66) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    if (tt >= 57.5 && tt < 62.5) {
      const u = smooth(seg(tt, 57.5, 62))
      const [x, z] = circ(SRC, 2.0, u, u, 0, 0)[0]
      const [ax, az] = circ(SRC, 2.0, u + 0.02, u + 0.02, 0, 0)[0]
      return { pos: [x, 0, z], rotY: Math.atan2(ax - x, az - z), run: 0.95, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    if (tt >= 62.5) return { pos: [PA[0] + 1.0, 0, PA[1] + 2.6], rotY: Math.PI, run: 0, cast: 0.6, whip: 0, loop: 0, loopDrop: 0 }
    const [x, z] = circ(SRC, 2.0, 0, 0, 0, 0)[0]
    return { pos: [x, 0, z + 0.6], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <TerraceSky />
      <Seascape y={-2.4} depth={2.4} area={[0, -26, 60, 80]} seed={16} palette={{ water: '#1a3050', sand: '#4a5058', weed: '#2a3848' }} lanterns={10} />
      <Deck at={PA} />
      <BeltRing cx={SRC[0]} cz={SRC[1]} r={2.0} color="#ffd27a" lit />
      <BeltRing cx={TGT[0]} cz={TGT[1]} r={2.0} color="#7fe8dc" lit />
      <Projector at={[0.4, -1.6]} pos={PA} active hijacked={false} readout="z ↦ z²" />
      <LiveLine getPts={srcRun} color="#fff2c4" width={7} />
      <LiveLine getPts={tgtRun} color="#fff2c4" width={7} />

      <Deck at={PB} />
      <group position={[PB[0], 0, PB[1]]}>
        <BeltRing cx={0} cz={0} r={3.9} lit />
        <BeltRing cx={0} cz={0} r={2.45} color="#ff8ad8" lit />
        <Pool r={1.35} />
      </group>
      <LiveLine getPts={inner} color="#fff2c4" width={7} />
      <LiveLine getPts={pushed} color="#ff8ad8" width={6} />

      <Deck at={PC} r={5.6} />
      <group position={[PC[0], 0, PC[1]]}>
        <TorusPlaza half={H} gate={1.0} />
      </group>
      {gridLines.map((pts, i) => (
        <LiveLine key={i} getPts={() => (t() >= 28 && t() < 46) || t() >= 66 ? pts : null} color="#6080c0" width={2} />
      ))}
      <LiveLine getPts={gridPath} color="#5ee0d8" width={6} />

      <Deck at={PD} />
      <BeltRing cx={PD[0] - 2.5} cz={PD[1]} r={2.0} color="#ffd27a" lit />
      <BeltRing cx={PD[0] + 2.5} cz={PD[1]} r={2.0} color="#7fe8dc" lit />
      <LiveLine getPts={shadowRunA} color="#fff2c4" width={7} />
      <LiveLine getPts={shadowRunB} color="#fff2c4" width={7} />

      {[beadA, beadB, plazaBead, shadowA, shadowB].map((r, i) => (
        <mesh key={i} ref={r}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={gridBead}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.8} mipmapBlur />
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
        <h4>Maps push loops forward</h4>
        <p className="lesson-math">f∗ : π₁(X) → π₁(Y)</p>
        <p className="lesson-note">z ↦ z² doubles winding</p>
        <p className="lesson-math">π₁(T²) ≅ ℤ × ℤ</p>
        <p className="lesson-note">a loop on the torus is a pair; ab = ba</p>
      </div>
    )
  const steps = [
    ['4', 'Cord: run the gold source circle once', t < 62.5],
    ['click', 'the brass projector pushes it forward', t >= 62.5 && t < 64],
    ['gates', 'on the torus plaza: out one gate, in its twin', t >= 64 && t < 65.2],
    ['1', 'Lash spawn that jam the projector', t >= 65.2],
  ]
  return (
    <div className="lesson-steps">
      <h4>◎ Winding Cord</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function PushForwardLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 14) body = <Card title="maps push loops forward" rows={[['f : S¹ → S¹, z ↦ z²', '', true], ['γ ↦ f ∘ γ', 'a loop goes along', true], ['f∗(n) = 2n', 'on π₁(S¹) ≅ ℤ', true]]} foot="every map gives a homomorphism f∗" />
  else if (t < 28) body = <Card title="a retraction" rows={[['r : X → A, r ∘ i = id', 'push out to the rim', true], ['2 laps inside ↦ 2 on A', '', true], ['i∗ is one-to-one', 'loops on A stay apart', true]]} foot="Hatcher, Prop. 1.17, p. 36" />
  else if (t < 46) body = <Card title="the torus" rows={[['a then b ↦ (1, 1)', '', true], ['b then a ↦ (1, 1)', 'the same square', true], ['ab = ba', 'π₁(T²) ≅ ℤ × ℤ', true]]} foot="opposite gates glued: the square is a torus" />
  else if (t < 56) body = <Card title="products" rows={[['π₁(X × Y) ≅ π₁(X) × π₁(Y)', '', true], ['(2, 3)', '2 laps, 3 laps', true]]} foot="Hatcher, Prop. 1.12, p. 35" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
