import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { HALL_COVERS } from '../../levels/w1/DeckHallsScene'
import Seascape from '../../world/Seascape'
import CoverGraph from './CoverGraph'
import { During } from './SheetMusicLesson'

/**
 * "Deck the Halls" lesson (videos.json level-1-10-lesson): deck transformations.
 *   A 0–14   a 3-sheeted cover with a = b = (1 2 3): a third of a turn lands it on itself
 *   B 14–26  a = (1 2), b = (2 3): a third of a turn doesn't (the loops end up in the wrong place);
 *            no deck transformation moves sheet 1 to sheet 2 — not normal
 *   C 26–36  the circle's double cover: the half-turn swaps the sheets
 *   D 36–52  the sphere over ℝP²: half the rim runs door to opposite door
 *   E 52–64  how to play
 *   F 64–72  summary
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const ring = (n, r = 2.4, y = 2.4) => Array.from({ length: n }, (_, i) => [r * Math.cos(-Math.PI / 2 + (TAU * i) / n), y, r * Math.sin(-Math.PI / 2 + (TAU * i) / n)])
const V3 = ring(3)
const V2 = ring(2)
const SPHERE_C = [0, 1.6, -0.6]
const SPHERE_R = 3.2

const SHOTS = [
  [0, 36, [[0.9, 9.4, 8.6], [0.9, 1.2, 0]], [[0.9, 9.6, 8.8], [0.9, 1.2, 0]]],
  [36, 52, [[1.6, 11.6, 9.8], [1.2, 1.2, -0.2]], [[1.4, 11.8, 10.0], [1.2, 1.2, -0.2]]],
  [52, 80, [[0.9, 9.6, 8.8], [0.9, 1.2, 0]], [[0.9, 10.0, 9.2], [0.9, 1.2, 0]]],
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

/** A cover graph turned by `turn(t)` (radians); a ghost of the unturned graph stays put. */
function Turning({ tRef, cover, verts, turn, ghost = true }) {
  const g = useRef()
  useFrame(() => (g.current.rotation.y = turn(tRef.current)))
  return (
    <>
      <group ref={g}>
        <CoverGraph cover={cover} verts={verts} />
      </group>
      {ghost &&
        verts.map((p, i) => (
          <mesh key={i} position={p} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.38, 24]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        ))}
    </>
  )
}

export function SphereHall({ show }) {
  const g = useRef()
  useFrame(() => (g.current.visible = show()))
  return (
    <group ref={g} position={SPHERE_C}>
      <mesh>
        <sphereGeometry args={[SPHERE_R, 40, 28]} />
        <meshStandardMaterial color="#2c3a5a" transparent opacity={0.35} roughness={0.3} metalness={0.3} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SPHERE_R, 0.04, 8, 96]} />
        <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, s * SPHERE_R]}>
          <boxGeometry args={[0.7, 1.3, 0.12]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function DeckHallsLesson({ tRef }) {
  const bead = useRef()
  useFrame(() => {
    const t = tRef.current
    const on = t >= 38.5 && t < 52
    bead.current.visible = on
    if (on) {
      // half the equator, from the south door round the east side to the north door
      const u = smooth(seg((t - 38.5) % 6.5, 0, 5))
      const th = Math.PI / 2 - Math.PI * u
      bead.current.position.set(SPHERE_C[0] + SPHERE_R * Math.cos(th), SPHERE_C[1], SPHERE_C[2] + SPHERE_R * Math.sin(th))
    }
  })
  const t = () => tRef.current
  const halfRim = () => {
    if (t() < 38.5 || t() >= 52) return null
    const u = smooth(seg((t() - 38.5) % 6.5, 0, 5))
    return Array.from({ length: 49 }, (_, i) => {
      const th = Math.PI / 2 - Math.PI * u * (i / 48)
      return [SPHERE_C[0] + SPHERE_R * Math.cos(th), SPHERE_C[2] + SPHERE_R * Math.sin(th), SPHERE_C[1] + 0.02]
    })
  }
  const gyro = () => {
    const tt = t()
    if (tt < 52 || tt >= 64) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    return { pos: [0.6, 0, 2.4], rotY: Math.PI, run: 0, cast: tt > 54 && tt < 58 ? 0.9 : 0.2, whip: tt > 59.5 && tt < 60.5 ? seg(tt, 59.5, 60.5) : 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 22, 58]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a8c8ff', '#0a0818', 0.55]} />
      <directionalLight position={[8, 18, 6]} intensity={0.95} color="#d0e4ff" />
      <Stars radius={80} depth={36} count={1200} factor={2.4} fade speed={0.25} />
      <Sparkles count={90} scale={[30, 6, 30]} position={[0, 3, -2]} size={2.2} speed={0.25} color="#ffe6a8" />
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={110} palette={{ water: '#0f2848', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[5.4, 5.1, 0.6, 56]} />
        <meshStandardMaterial color="#1c2430" roughness={0.85} />
      </mesh>
      <During tRef={tRef} when={(tt) => tt < 14 || (tt >= 52 && tt < 64)}>
        <Turning tRef={tRef} cover={HALL_COVERS.cyclic3} verts={V3} turn={(tt) => (tt >= 52 ? 0 : (-TAU / 3) * smooth(seg(tt, 5, 9)))} />
      </During>
      <During tRef={tRef} when={(tt) => tt >= 14 && tt < 26}>
        <Turning tRef={tRef} cover={HALL_COVERS.lopsided} verts={V3} turn={(tt) => (-TAU / 3) * smooth(seg(tt, 17, 20)) * (1 - smooth(seg(tt, 22.5, 24.5)))} />
      </During>
      <During tRef={tRef} when={(tt) => tt >= 26 && tt < 36}>
        <Turning tRef={tRef} cover={HALL_COVERS.quotient} verts={V2} turn={(tt) => -Math.PI * smooth(seg(tt, 28.5, 31.5))} />
      </During>
      <SphereHall show={() => (t() >= 36 && t() < 52) || t() >= 64} />
      <LiveLine getPts={halfRim} color="#fff2c4" width={7} y={0} />
      <mesh ref={bead}>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
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
  if (t >= 64)
    return (
      <div className="lesson-steps">
        <h4>Deck transformations</h4>
        <p className="lesson-note">shuffles of the sheets that carry the cover onto itself</p>
        <p className="lesson-note">normal: they reach every sheet</p>
        <p className="lesson-math">S² → ℝP², π₁(ℝP²) ≅ ℤ₂</p>
      </div>
    )
  const steps = [
    ['6', 'Compass on the wheel: turn the whole cover', t < 57],
    ['1', 'Lash the Deck guards once they stack', t >= 57 && t < 61],
    ['walk', 'half the sphere’s rim, door to door', t >= 61],
  ]
  return (
    <div className="lesson-steps">
      <h4>◈ Sheet Compass</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function DeckHallsLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 14) body = <Card title="a deck transformation" rows={[['a = b = (1 2 3)', '', true], ['turn by a third', 'lands on itself', false], ['sheet 1 ↦ 2 ↦ 3', 'any sheet to any', true]]} foot="the cover is normal" />
  else if (t < 26) body = <Card title="a cover that isn’t normal" rows={[['a = (1 2), b = (2 3)', '', true], ['turned, the loops land wrong', '', false], ['only “do nothing” works', 'not normal', false]]} foot="a deck transformation carries loops to loops" />
  else if (t < 36) body = <Card title="covers from symmetry" rows={[['ℤ/2 turns a circle half way', 'freely', true], ['circle / ℤ₂ = circle', 'z ↦ z²', true], ['deck group = ℤ₂', 'swaps the sheets', true]]} foot="a free action gives a cover" />
  else if (t < 52) body = <Card title="the sphere over ℝP²" rows={[['x ~ −x', 'glue opposite points', true], ['half the rim: a loop below', 'its lift doesn’t close', false], ['π₁(ℝP²) ≅ ℤ₂', '', true]]} foot="Hatcher, §1.3, pp. 70–74" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
