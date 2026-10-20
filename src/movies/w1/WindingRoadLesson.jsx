import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Html, Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { WinderSpawn } from '../../characters/Spawn'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { HELIX_PITCH, HELIX_R, HELIX_TURNS, deformedLoop, liftHeight, onCircle } from '../../levels/w1/WindingRoadScene'
import Seascape from '../../world/Seascape'

/**
 * "The Winding Number" lesson (videos.json level-1-3-lesson): π₁(S¹) ≅ ℤ, slowly.
 *   A 0–12   the covering p : ℝ → S¹ — the helix drops onto the circle; a column of lifts over a point
 *   B 12–24  path lifting: a lap lifts from floor 0 to +1; two laps to +2 (winding number = end floor)
 *   C 24–36  homotopy lifting: the loop deforms, its lift sways, the end stays on +1
 *   D 36–46  +2 then −1: the lift climbs two floors and comes down one — winding numbers add
 *   E 46–56  a Winder holding +2; two clockwise laps strip its coils
 *   F 56–66  how to play: Gyroid runs a lap with the Cord and banks it at the beacon
 *   G 66–72  summary
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const C = [0, 0]
const R = 3.6
const ringPt = (th, r = R) => onCircle(C, r, th)
const START = -Math.PI / 2 // loops start at the bottom of the ring (nearest the camera)

/** Angle (unwrapped, from START) of the bead at story time t, or null. */
function beadU(t) {
  if (t >= 2 && t < 11.5) return TAU * 1.5 * smooth(seg(t, 2, 11.5)) // A: the projection runs round as the lift climbs
  if (t >= 12.5 && t < 17.5) return TAU * smooth(seg(t, 13, 17.2))
  if (t >= 18 && t < 24) return TAU * 2 * smooth(seg(t, 18.2, 23.4))
  if (t >= 36.4 && t < 46) {
    if (t < 41) return TAU * 2 * smooth(seg(t, 36.6, 40.6))
    return TAU * 2 - TAU * smooth(seg(t, 41.2, 45.4))
  }
  if (t >= 51 && t < 56) return -TAU * 2 * smooth(seg(t, 51.2, 55.6))
  if (t >= 57.4 && t < 62) return TAU * smooth(seg(t, 57.6, 61.8))
  return null
}

const SHOTS = [
  [0, 46, [[2.0, 8.4, 14.2], [1.3, 2.4, 0]], [[2.0, 8.6, 14.4], [1.3, 2.4, 0]]],
  [46, 56, [[2.2, 8.0, 12.6], [1.4, 1.6, 0.6]], [[2.2, 8.2, 12.8], [1.4, 1.6, 0.6]]],
  [56, 66, [[1.2, 8.2, 11.8], [0.6, 1.4, 0.6]], [[1.2, 8.0, 11.6], [0.6, 1.4, 0.6]]],
  [66, 80, [[2.0, 8.6, 14.4], [1.3, 2.4, 0]], [[2.0, 9.0, 15.0], [1.3, 2.4, 0]]],
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

const helixAt = (U, dr = 0) => {
  const [x, z] = onCircle(C, HELIX_R + dr, U)
  return [x, z, liftHeight(U)]
}

export default function WindingRoadLesson({ tRef }) {
  const bead = useRef()
  const lift = useRef()
  const endBead = useRef()
  const winder = useMemo(() => ({ x: 2.6, z: -1.4, seed: 0.3, alive: true, dying: 0, face: 0, flash: 0, turns: 2 }), [])
  const winderG = useRef()
  const column = useRef()
  const tube = useMemo(() => {
    const pts = []
    const N = HELIX_TURNS * 2 * 48
    for (let i = 0; i <= N; i++) {
      const U = -HELIX_TURNS * TAU + (i / N) * HELIX_TURNS * 2 * TAU
      const [x, z, y] = helixAt(U)
      pts.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])
  useFrame(() => {
    const t = tRef.current
    const U = beadU(t)
    bead.current.visible = U != null
    lift.current.visible = U != null
    if (U != null) {
      const [x, z] = ringPt(START + U)
      bead.current.position.set(x, 0.3, z)
      const [hx, hz, hy] = helixAt(START + U, 0.12)
      lift.current.position.set(hx, hy, hz)
    }
    // C: the end of the deformed loop's lift, pinned to +1
    endBead.current.visible = t >= 24 && t < 36
    // A: the column of lifts over one point of the circle
    column.current.visible = t >= 5 && t < 12
    // E: the Winder sheds a coil per clockwise lap
    winderG.current.visible = t >= 46 && t < 56
    winder.turns = t < 51 ? 2 : 2 - Math.floor(Math.min(2, (-(beadU(t) ?? 0) + 0.2) / TAU))
  })
  const t = () => tRef.current
  const ring = () => Array.from({ length: 97 }, (_, i) => [...ringPt((i / 96) * TAU), 0.12])
  // the run so far, on the ring and lifted
  const run = () => {
    const U = beadU(t())
    if (U == null) return null
    const n = Math.max(2, Math.ceil(Math.abs(U) / 0.08))
    return Array.from({ length: n + 1 }, (_, i) => [...ringPt(START + (U * i) / n, R), 0.2])
  }
  const runLift = () => {
    const U = beadU(t())
    if (U == null) return null
    const n = Math.max(2, Math.ceil(Math.abs(U) / 0.08))
    return Array.from({ length: n + 1 }, (_, i) => {
      const [x, z, y] = helixAt(START + (U * i) / n, 0.12)
      return [x, z, y]
    })
  }
  // A: drop lines from the lift to its shadow on the circle (that's p)
  const drop = () => {
    const U = beadU(t())
    if (U == null || t() >= 12) return null
    const [hx, hz, hy] = helixAt(START + U)
    const [x, z] = ringPt(START + U)
    return [
      [hx, hz, hy],
      [x, z, 0.3],
    ]
  }
  // C: the deformed loop and its lift
  const ht = () => (t() < 25 ? 0 : t() < 31 ? smooth(seg(t(), 25, 30)) : 1 - 0.6 * smooth(seg(t(), 31.5, 35.5)))
  const deformed = () => (t() >= 24 && t() < 36 ? deformedLoop(ht()).map(({ th, dr }) => [...ringPt(START + th, R + dr), 0.2]) : null)
  const deformedLift = () =>
    t() >= 24 && t() < 36
      ? deformedLoop(ht()).map(({ th, dr }) => {
          const [x, z, y] = helixAt(START + th, dr * 0.45)
          return [x, z, y]
        })
      : null
  const endPos = helixAt(START + TAU)
  const colPts = Array.from({ length: HELIX_TURNS * 2 + 1 }, (_, i) => helixAt(START + (i - HELIX_TURNS) * TAU))
  const gyro = () => {
    const tt = t()
    if (tt < 56 || tt >= 66) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const U = beadU(tt)
    if (U != null) {
      const [x, z] = ringPt(START + U)
      const [ax, az] = ringPt(START + U + 0.1)
      return { pos: [x, 0, z], rotY: Math.atan2(ax - x, az - z), run: 0.95, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    if (tt < 57.4) {
      const [x, z] = ringPt(START)
      return { pos: [x, 0, z], rotY: Math.PI / 2, run: 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    // banking: walk to the beacon
    const k = smooth(seg(tt, 62, 64))
    const [sx, sz] = ringPt(START)
    return { pos: [mix(sx, C[0], k), 0, mix(sz, C[1] + 0.9, k)], rotY: Math.PI, run: k > 0 && k < 1 ? 0.7 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 26, 60]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#9ab8ff', '#0a0a14', 0.5]} />
      <directionalLight position={[-8, 18, 6]} intensity={1.0} color="#cfe0ff" />
      <Stars radius={70} depth={30} count={900} factor={2.2} fade speed={0.2} />
      <Sparkles count={70} scale={[18, 7, 18]} position={[0, 3.5, 0]} size={2} color="#c8a0ff" />
      <Seascape y={-0.9} depth={2.2} area={[0, 0, 50, 50]} seed={303} palette={{ water: '#0e2848', sand: '#3a4458', weed: '#2a4a6a' }} lanterns={8} />
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[5.2, 4.9, 0.6, 56]} />
        <meshStandardMaterial color="#1e1c2a" roughness={0.88} />
      </mesh>
      <LiveLine getPts={ring} color="#a07a3a" width={3} />
      <mesh>
        <tubeGeometry args={[tube, 260, 0.06, 8, false]} />
        <meshStandardMaterial color="#6a5a90" emissive="#8060d0" emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
      </mesh>
      {colPts.map(([x, z, y], i) => {
        const n = i - HELIX_TURNS
        return (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[n === 0 ? 0.12 : 0.09, 10, 8]} />
              <meshBasicMaterial color={n === 0 ? '#ffffff' : '#ffcf6a'} toneMapped={false} />
            </mesh>
            <Html position={[0.45, 0, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <div className="floor-tag">{n > 0 ? `+${n}` : n === 0 ? '0' : `−${-n}`}</div>
            </Html>
          </group>
        )
      })}
      {/* A: the column of points over the start of the circle — one per floor */}
      <group ref={column}>
        <mesh position={[colPts[HELIX_TURNS][0], liftHeight(0) / 2, colPts[HELIX_TURNS][1]]}>
          <cylinderGeometry args={[0.03, 0.03, HELIX_PITCH * HELIX_TURNS * 2 + 1, 6]} />
          <meshBasicMaterial color="#ff8ad8" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
      <LiveLine getPts={run} color="#fff2c4" width={7} />
      <LiveLine getPts={runLift} color="#5ee0d8" width={6} y={0} />
      <LiveLine getPts={drop} color="#ff8ad8" width={2} y={0} dashed />
      <LiveLine getPts={deformed} color="#5ee0d8" width={5} />
      <LiveLine getPts={deformedLift} color="#5ee0d8" width={5} y={0} />
      <mesh ref={endBead} position={[endPos[0], endPos[2], endPos[1]]}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh ref={bead}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh ref={lift}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <group ref={winderG}>
        <WinderSpawn e={winder} />
      </group>
      <mesh position={[C[0], 0.1, C[1]]}>
        <cylinderGeometry args={[0.85, 0.9, 0.2, 24]} />
        <meshStandardMaterial color="#2a3544" emissive="#ffb347" emissiveIntensity={0.3} />
      </mesh>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} intensity={0.8} mipmapBlur />
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
        <h4>The circle</h4>
        <p className="lesson-math">π₁(S¹) ≅ ℤ</p>
        <p className="lesson-note">a loop’s class is where its lift ends</p>
        <p className="lesson-math">[ωₘ][ωₙ] = [ωₘ₊ₙ]</p>
        <p className="lesson-note">laps add; backwards negates</p>
      </div>
    )
  const steps = [
    ['4', 'Winding Cord: run the ring road', t < 59],
    ['↺', 'with the arrows +1, against them −1', t >= 59 && t < 62],
    ['◎', 'step onto the beacon to bank the lap', t >= 62 && t < 64],
    ['3', 'Tide Glass: X / Z deform a banked loop', t >= 64 && t < 65],
    ['1', 'Lash: Winders once their coils are gone', t >= 65],
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

export function WindingRoadLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 12) body = <Card title="the helix covers the circle" rows={[['p : ℝ → S¹', 'drop the helix down', true], ['p(s) = (cos 2πs, sin 2πs)', '', true], ['over each point: ℤ', 'one lift per floor', true]]} foot="the helix is the universal cover of S¹" />
  else if (t < 24) body = <Card title="lifting a loop" rows={[['f̃(0) = 0', 'the lift starts on floor 0', true], ['f̃(1) = n ∈ ℤ', 'it ends on a floor', true], ['n = winding number', 'one lap: n = +1']]} foot="Hatcher, §1.1, the lifting property (a)" />
  else if (t < 36) body = <Card title="sliding can’t change n" rows={[['f ≃ g', 'one loop slides into the other', true], ['f̃(1) = g̃(1)', 'the lifts end together', true], ['ends can’t jump floors', 'ℤ has no in-between']]} foot="Hatcher, §1.1, the lifting property (b)" />
  else if (t < 46) body = <Card title="laps add" rows={[['ω₂ · ω₋₁ ≃ ω₁', 'up two, down one', true], ['[ωₘ][ωₙ] = [ωₘ₊ₙ]', 'a homomorphism ℤ → π₁', true], ['π₁(S¹) ≅ ℤ', 'Theorem 1.7', true]]} foot="Hatcher, §1.1, Theorem 1.7, pp. 29–31" />
  else if (t < 56) body = <Card title="unwinding a Winder" rows={[['holds +2', 'the Lash slides off', true], ['+2 + (−1) + (−1) = 0', 'two clockwise laps', true], ['0: one lash', '']]} foot="cancel its turns, then strike" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
