import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * The Commutator, Null's marshal: a tall, stiff figure in a station master's long coat and cap,
 * a white porcelain mask, and four loop pauldrons, a, b, a⁻¹, b⁻¹, two on each shoulder (his
 * word, a b a⁻¹ b⁻¹). Optional cloak for his disguise.
 *
 * `script()` → { gesture 0..1 (baton arm up), cloak 0..1 (cloak on), crack 0..1 (mask cracked),
 *                kneel 0..1, loops 0..1 (pauldron rings: 1 full, 0 folded to points), talk 0|1 }
 */

const COAT = '#1c2236'
const TRIM = '#c9a24a'
const LOOP_COLS = ['#ffb347', '#7fd6ff', '#a86a20', '#2a7aa8'] // a, b, a⁻¹, b⁻¹

export default function Commutator({ script, scale = 1 }) {
  const root = useRef()
  const body = useRef()
  const arm = useRef()
  const cloak = useRef()
  const crack = useRef()
  const loops = useRef([])
  const loopMats = useRef([])
  const head = useRef()
  useFrame(({ clock }) => {
    const s = script()
    const t = clock.elapsedTime
    const kn = s.kneel || 0
    body.current.position.y = -0.55 * kn
    body.current.rotation.x = 0.35 * kn
    arm.current.rotation.x = -0.3 - (s.gesture || 0) * 1.9
    arm.current.rotation.z = 0.15 + Math.sin(t * 1.3) * 0.04
    const c = s.cloak ?? 0
    cloak.current.visible = c > 0.02
    cloak.current.scale.set(1, Math.max(0.02, c), 1)
    cloak.current.position.y = 1.0 + (1 - c) * 0.6
    crack.current.visible = (s.crack || 0) > 0.05
    crack.current.scale.y = s.crack || 0
    head.current.rotation.x = (s.talk ? Math.sin(t * 9) * 0.04 : 0) + kn * 0.35
    const k = s.loops ?? 1
    loops.current.forEach((m, i) => {
      if (!m) return
      m.scale.setScalar(Math.max(0.05, k))
      m.rotation.z = t * (i % 2 ? -1.2 : 1.2)
    })
    loopMats.current.forEach((m) => m && (m.emissiveIntensity = 0.4 + k * 1.4))
  })
  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {/* legs */}
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.45, 0]}>
            <capsuleGeometry args={[0.09, 0.7, 4, 10]} />
            <meshStandardMaterial color="#10131f" roughness={0.6} />
          </mesh>
        ))}
        {/* the long coat */}
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.3, 0.46, 1.2, 16]} />
          <meshStandardMaterial color={COAT} roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[0, 1.15, 0.27]}>
          <boxGeometry args={[0.04, 1.15, 0.04]} />
          <meshStandardMaterial color={TRIM} metalness={0.8} roughness={0.3} />
        </mesh>
        {[0.1, 0.35, 0.6].map((y) => (
          <mesh key={y} position={[0, 0.9 + y * 0.6, 0.31]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color={TRIM} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 1.78, 0]}>
          <cylinderGeometry args={[0.36, 0.3, 0.12, 16]} />
          <meshStandardMaterial color={TRIM} metalness={0.7} roughness={0.35} />
        </mesh>
        {/* the four loop pauldrons: a and b on the right shoulder, a⁻¹ and b⁻¹ on the left */}
        {[0, 1, 2, 3].map((i) => {
          const side = i < 2 ? 1 : -1
          const off = i % 2 ? 0.12 : -0.08
          return (
            <group key={i} position={[side * 0.42, 1.78 + off, i % 2 ? -0.06 : 0.06]} rotation={[0, side * 0.5, 0]}>
              <mesh ref={(m) => (loops.current[i] = m)}>
                <torusGeometry args={[0.17, 0.035, 8, 28]} />
                <meshStandardMaterial ref={(m) => (loopMats.current[i] = m)} color={LOOP_COLS[i]} emissive={LOOP_COLS[i]} emissiveIntensity={1.6} toneMapped={false} />
              </mesh>
            </group>
          )
        })}
        {/* the baton arm (right) and the still arm (left) */}
        <group ref={arm} position={[0.38, 1.66, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
            <meshStandardMaterial color={COAT} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.72, 0.08]} rotation={[0.6, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
            <meshStandardMaterial color="#e8e0c8" emissive="#ffd27a" emissiveIntensity={0.6} />
          </mesh>
        </group>
        <mesh position={[-0.38, 1.34, 0]} rotation={[0, 0, -0.12]}>
          <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
          <meshStandardMaterial color={COAT} roughness={0.55} />
        </mesh>
        {/* head: the porcelain mask and the station master's cap */}
        <group ref={head} position={[0, 2.05, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 18, 14]} />
            <meshStandardMaterial color="#20242e" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.06]} scale={[1, 1.15, 0.8]}>
            <sphereGeometry args={[0.18, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color="#f2ece0" roughness={0.25} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {[-0.07, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.03, 0.2]}>
              <sphereGeometry args={[0.025, 8, 6]} />
              <meshBasicMaterial color="#b070ff" toneMapped={false} />
            </mesh>
          ))}
          <mesh ref={crack} position={[0.03, 0.0, 0.215]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.012, 0.3, 0.01]} />
            <meshBasicMaterial color="#120a18" />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.22, 0.2, 0.12, 18]} />
            <meshStandardMaterial color={COAT} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.13, 0.13]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.14]} />
            <meshStandardMaterial color="#0c0e16" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.18, 0.2]}>
            <torusGeometry args={[0.035, 0.01, 6, 16]} />
            <meshStandardMaterial color={TRIM} emissive={TRIM} emissiveIntensity={0.8} />
          </mesh>
        </group>
        {/* the disguise: a hooded cloak over everything */}
        <mesh ref={cloak} position={[0, 1.0, 0]}>
          <coneGeometry args={[0.62, 2.4, 20, 1, true]} />
          <meshStandardMaterial color="#2a2236" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}
