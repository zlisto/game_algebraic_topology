import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { Press, Track } from '../../levels/w0/FoundryScene'
import Hologram, { LETTER_COLORS } from '../../levels/w0/Hologram'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { makeTrack } from '../../levels/w0/cells'

/**
 * "Glue Job" lesson (videos.json level-1-7-lesson): relations from disks, and van Kampen.
 *   A 0–12   a loop a at a point; a disk glued along it; a bead runs a, and the loop slides
 *            across the disk to nothing — the relation a = 1
 *   B 12–26  a disk on a b a⁻¹ b⁻¹: the square rolls up into the torus — ab = ba, ℤ × ℤ
 *   C 26–38  a disk on a a: the projective plane — ℤ₂
 *   D 38–54  van Kampen: two pieces overlapping; the overlap's loop is a in one, b in the other
 *   E 54–66  how to play: Gyroid forges the point, walks the edge, walks the word, presses
 *   F 66–72  summary
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const circle = (cx, cz, r, y = 0.12, n = 72) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cz + r * Math.sin((i / n) * 2 * Math.PI), y])

const P = [-1.2, 0] // beat A's point
const LOOP_C = [P[0] - 1.3, P[1]]

const SHOTS = [
  [0, 38, [[0.8, 7.8, 10.6], [0.6, 0.3, 1.8]], [[0.8, 8.0, 10.8], [0.6, 0.3, 1.8]]],
  [38, 54, [[1.6, 11.2, 10.4], [1.4, 0, 2.0]], [[1.6, 11.4, 10.6], [1.4, 0, 2.0]]],
  [54, 66, [[1.6, 7.8, 10.0], [1.0, 0.4, 1.2]], [[1.6, 7.6, 9.8], [1.0, 0.4, 1.2]]],
  [66, 80, [[0.8, 8.0, 10.8], [0.6, 0.3, 1.8]], [[0.8, 8.4, 11.2], [0.6, 0.3, 1.8]]],
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

// ---------------------------------------------------------------- E: Gyroid works a furnace

const HUB = [1.6, -0.8]
const DEMO_TRACK = makeTrack({ angle: Math.PI, length: 2.8 }, HUB)
const DEMO = { walkIn: [54.2, 55.4], point: 55.8, edgeWalk: [56.2, 59.0], edge: 59.1, wordWalk: [59.5, 62.2], press: 62.6 }

function Demo({ tRef }) {
  const hub = useRef()
  const slam = useRef(0)
  const fold = useRef(0)
  const holo = useRef()
  const progressRef = useRef(null)
  const [edge, setEdge] = useState(null)
  useFrame(() => {
    const t = tRef.current
    const lit = t >= DEMO.point
    hub.current.material.color.set(lit ? '#ffd27a' : '#5a3a28')
    hub.current.material.emissiveIntensity = lit ? 1.6 : 0.3
    const walk = (a, b) => (t >= a && t < b ? (t - a) / (b - a) : null)
    const w = walk(...DEMO.edgeWalk) ?? walk(...DEMO.wordWalk)
    progressRef.current = w != null ? { track: 0, dir: 1, best: w } : null
    const want = t >= DEMO.edge
    if (want !== !!edge) setEdge(want ? { letter: 0, dir: 1, torn: false } : null)
    slam.current = t > DEMO.press && t < DEMO.press + 0.5 ? 1 - (t - DEMO.press) / 0.5 : 0
    fold.current = smooth(seg(t, DEMO.press + 0.35, DEMO.press + 2.6))
    holo.current.visible = t >= DEMO.press + 0.3
  })
  const gyro = () => {
    const t = tRef.current
    let x = HUB[0]
    let z = HUB[1]
    let rotY = Math.PI
    let run = 0
    const [a0, a1] = DEMO.walkIn
    if (t < a1) {
      const k = smooth(seg(t, a0, a1))
      x = mix(HUB[0] + 0.4, HUB[0], k)
      z = mix(HUB[1] + 2.4, HUB[1], k)
      run = k > 0 && k < 1 ? 0.7 : 0
    } else {
      const lap = (a, b) => (t >= a && t < b ? (t - a) / (b - a) : null)
      const u = lap(...DEMO.edgeWalk) ?? lap(...DEMO.wordWalk)
      if (u != null) {
        const p = DEMO_TRACK.at(u)
        const q = DEMO_TRACK.at(Math.min(1, u + 0.02))
        x = p[0]
        z = p[1]
        rotY = Math.atan2(q[0] - p[0], q[1] - p[1])
        run = 0.8
      }
    }
    const casting = Math.abs(t - DEMO.point) < 0.5 || Math.abs(t - DEMO.press) < 0.5
    return { pos: [x, 0, z], rotY, run, cast: casting ? 1 : 0.35, whip: 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <mesh position={[HUB[0], 0.06, HUB[1]]}>
        <cylinderGeometry args={[0.85, 0.95, 0.14, 32]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.5} />
      </mesh>
      <mesh ref={hub} position={[HUB[0], 0.14, HUB[1]]}>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 32]} />
        <meshStandardMaterial color="#5a3a28" emissive="#ff8a2a" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <Track track={DEMO_TRACK} trackIdx={0} pos={[0, 0]} edge={edge} progressRef={progressRef} />
      <Press pos={HUB} slamRef={slam} />
      <group ref={holo} position={[HUB[0] - 1.7, 1.7, HUB[1] - 0.4]} scale={0.6}>
        <Hologram kind="disk" word={[{ e: 0, s: 1 }]} kRef={fold} />
      </group>
      <Gyroid scale={S} script={gyro} />
    </>
  )
}

export default function GlueJobLesson({ tRef }) {
  const kTorus = useRef(0)
  const kRp2 = useRef(0)
  const gA = useRef()
  const gTorus = useRef()
  const gRp2 = useRef()
  const gVK = useRef()
  const gDemo = useRef()
  const disk = useRef()
  const bead = useRef()
  useFrame(() => {
    const t = tRef.current
    kTorus.current = smooth(seg(t, 15, 22))
    kRp2.current = smooth(seg(t, 28, 34))
    gA.current.visible = t < 12
    gTorus.current.visible = (t >= 12 && t < 26) || t >= 66
    gRp2.current.visible = t >= 26 && t < 38
    gVK.current.visible = t >= 38 && t < 54
    gDemo.current.visible = t >= 54 && t < 66
    disk.current.visible = t >= 3.5 && t < 12
    disk.current.scale.setScalar(Math.max(0.01, smooth(seg(t, 3.5, 5))))
    // the bead runs the loop, then the loop slides across the disk to the point
    const k = smooth(seg(t, 8, 11))
    const u = seg((t - 5.5) % 2.5, 0, 2.3)
    const r = 1.3 * (1 - k)
    const a = Math.PI * 2 * u
    bead.current.visible = t >= 5.5 && t < 12
    bead.current.position.set(LOOP_C[0] + (1.3 - r) + r * Math.cos(a), 0.3, LOOP_C[1] + r * Math.sin(a))
  })
  const t = () => tRef.current
  // A: loop a at the point; it shrinks across the disk toward the point
  const loopA = () => {
    if (t() >= 12 || t() < 1) return null
    const k = smooth(seg(t(), 8, 11))
    const r = 1.3 * (1 - k)
    return circle(LOOP_C[0] + (1.3 - r), LOOP_C[1], Math.max(0.02, r), 0.14)
  }
  // D: two pieces and their overlap
  const U = () => (t() >= 38 && t() < 54 ? circle(-0.6, 0, 2.6, 0.12) : null)
  const V = () => (t() >= 38 && t() < 54 ? circle(2.6, 0, 2.6, 0.12) : null)
  const omega = () => (t() >= 42 && t() < 54 ? circle(1.0, 0, 0.75, 0.2) : null)
  return (
    <>
      <color attach="background" args={['#0a0708']} />
      <fog attach="fog" args={['#0a0708', 16, 40]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#ffb27a', '#120808', 0.5]} />
      <directionalLight position={[-4, 10, 8]} intensity={1.1} color="#ffe2c4" />
      <pointLight position={[1, 4, 3]} intensity={10} distance={14} color="#ff9a4a" />
      <Stars radius={60} depth={30} count={700} factor={2} fade speed={0.2} />
      <Sparkles count={120} scale={[16, 6, 10]} position={[1, 2, 0]} size={2.4} speed={0.4} color="#ffb070" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#140d0b" roughness={0.85} emissive="#2a0c04" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[1.0, -0.3, 0]}>
        <cylinderGeometry args={[4.6, 4.8, 0.4, 48]} />
        <meshStandardMaterial color="#2a2c36" roughness={0.6} />
      </mesh>

      <group ref={gA}>
        <mesh position={[P[0], 0.2, P[1]]}>
          <sphereGeometry args={[0.16, 20, 14]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
        <mesh ref={disk} position={[LOOP_C[0], 0.1, LOOP_C[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.3, 48]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ff9a2a" emissiveIntensity={0.4} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={bead}>
          <sphereGeometry args={[0.14, 14, 10]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      </group>
      <LiveLine getPts={loopA} color={LETTER_COLORS[0]} width={6} />

      <group ref={gTorus} position={[0.4, 0.4, 0]} scale={0.9}>
        <Hologram kind="torus" kRef={kTorus} />
      </group>
      <group ref={gRp2} position={[0.4, 0.2, 0]}>
        <Hologram kind="rp2" kRef={kRp2} word={[{ e: 0, s: 1 }, { e: 0, s: 1 }]} />
      </group>

      <group ref={gVK}>
        <mesh position={[-0.6, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 2.6, 64]} />
          <meshBasicMaterial color={LETTER_COLORS[0]} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[2.6, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 2.6, 64]} />
          <meshBasicMaterial color={LETTER_COLORS[1]} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <LiveLine getPts={U} color={LETTER_COLORS[0]} width={4} />
      <LiveLine getPts={V} color={LETTER_COLORS[1]} width={4} />
      <LiveLine getPts={omega} color="#ff8ad8" width={7} />

      <group ref={gDemo}>
        <Demo tRef={tRef} />
      </group>

      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
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
        <h4>Disks make relations</h4>
        <p className="lesson-math">⟨ a, b | a b a⁻¹ b⁻¹ ⟩ ≅ ℤ × ℤ</p>
        <p className="lesson-math">⟨ a | a² ⟩ ≅ ℤ₂</p>
        <p className="lesson-note">van Kampen: glue the pieces’ groups along the overlap</p>
      </div>
    )
  const steps = [
    ['2', 'Cell Hammer: click the furnace to forge the point', t < 56.2],
    ['walk', 'out round a track and back: an edge', t >= 56.2 && t < 59.5],
    ['walk', 'walk the word the disk goes along', t >= 59.5 && t < 62.6],
    ['click', 'the furnace: press the disk', t >= 62.6 && t < 64.6],
    ['5', 'Clasp on the overlap deck', t >= 64.6],
  ]
  return (
    <div className="lesson-steps">
      <h4>⚒ Cell Hammer · ⧉ Clasp</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function GlueJobLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 12) body = <Card title="a disk makes a relation" rows={[['glue a disk along a', '', true], ['a ≃ constant', 'it slides across', true], ['a = 1', 'in π₁', true]]} foot="Hatcher, Prop. 1.26" />
  else if (t < 26) body = <Card title="the torus" rows={[['disk on a b a⁻¹ b⁻¹', '', true], ['a b a⁻¹ b⁻¹ = 1', 'so a b = b a', true], ['⟨ a, b | aba⁻¹b⁻¹ ⟩', '≅ ℤ × ℤ', true]]} foot="the square rolls up into the torus" />
  else if (t < 38) body = <Card title="the projective plane" rows={[['disk on a a', 'twice round', true], ['a² = 1', '', true], ['⟨ a | a² ⟩ ≅ ℤ₂', 'two classes', true]]} foot="a survives; a a slides away" />
  else if (t < 54) body = <Card title="van Kampen" rows={[['X = U ∪ V', 'two pieces', true], ['π₁(U) ∗ π₁(V)', 'all their words', true], ['ω in U ∩ V: i(ω) = j(ω)', 'one loop, two names', true]]} foot="Hatcher, Theorem 1.20" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
