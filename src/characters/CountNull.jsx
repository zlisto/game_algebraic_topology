import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Count Null — procedural figure modeled on assets/characters/count-null.png:
 * tall obsidian robes with violet rim glow, pale porcelain mask under a hood,
 * floating broken crown of inward prongs, dark orb at the chest, and torn
 * surface fragments orbiting one raised hand.
 *
 * `script(t)` → { gesture, crown, crownY }
 *   gesture: 0 hand at side … 1 hand thrust forward
 *   crown:   0..1 crown glow / beam charge
 */

const VIOLET = '#a259ff'
const ROBE = { color: '#15111c', roughness: 0.75, metalness: 0.15 }

function jaggedCone(radiusTop, radiusBottom, height, seg, jag, seed = 1) {
  const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, seg, 6, true)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i)
    if (y < -height / 2 + 0.001) {
      const a = Math.atan2(p.getZ(i), p.getX(i))
      const n = Math.abs(Math.sin(a * 4.5 + seed) * Math.cos(a * 2.3 + seed * 2))
      p.setY(i, y - n * jag)
    }
  }
  g.computeVertexNormals()
  return g
}

/** Mesh plus a slightly inflated back-face shell that reads as the violet rim light. */
function Rimmed({ geometry, children, rim = 1.035, rimColor = VIOLET, rimOpacity = 0.9, ...props }) {
  return (
    <group {...props}>
      <mesh geometry={geometry}>{children}</mesh>
      <mesh geometry={geometry} scale={rim}>
        <meshBasicMaterial color={rimColor} side={THREE.BackSide} transparent opacity={rimOpacity} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Fragments({ count = 14 }) {
  const group = useRef()
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (i / count) * Math.PI * 2,
        r: 0.34 + (i % 3) * 0.06,
        y: Math.sin(i * 2.1) * 0.14,
        s: 0.03 + (i % 4) * 0.012,
        spin: 0.5 + (i % 5) * 0.3,
      })),
    [count],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current.children.forEach((m, i) => {
      const d = shards[i]
      if (!d) return
      const a = d.a + t * 0.6
      m.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.3 + i) * 0.04, Math.sin(a) * d.r)
      m.rotation.set(t * d.spin, t * d.spin * 0.7, 0)
    })
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.08, 16, 12]} />
        <meshStandardMaterial color="#050308" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshBasicMaterial color={VIOLET} side={THREE.BackSide} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <group ref={group}>
        {shards.map((d, i) => (
          <mesh key={i} scale={d.s}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#1a1222" emissive={VIOLET} emissiveIntensity={1.4} toneMapped={false} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function NullCrown({ glowRef }) {
  const mat = useRef()
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.3, 0.025, 8, 40, Math.PI * 1.85), [])
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = 0.35 + (glowRef?.current ?? 0) * 2
  })
  const prongs = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 1.85
        return { a, h: 0.16 + ((i * 7) % 5) * 0.045 }
      }),
    [],
  )
  return (
    <group>
      <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial ref={mat} color="#0d0a12" metalness={0.8} roughness={0.3} emissive={VIOLET} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {prongs.map((p, i) => (
        <mesh
          key={i}
          position={[Math.cos(p.a) * 0.3, p.h / 2, -Math.sin(p.a) * 0.3]}
          rotation={[Math.sin(p.a) * 0.25, 0, Math.cos(p.a) * 0.25]}
        >
          <coneGeometry args={[0.022, p.h, 5]} />
          <meshStandardMaterial color="#0d0a12" metalness={0.8} roughness={0.3} emissive={VIOLET} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function CountNull({ script, scale = 1 }) {
  const root = useRef()
  const arm = useRef()
  const forearm = useRef()
  const crown = useRef()
  const orb = useRef()
  const glowRef = useRef(0)
  const cur = useRef({ gesture: 0 })

  const geo = useMemo(
    () => ({
      robe: jaggedCone(0.32, 0.85, 2.3, 18, 0.28, 1),
      inner: jaggedCone(0.22, 0.5, 2.0, 12, 0.22, 3),
      collar: jaggedCone(0.18, 0.62, 0.32, 14, 0.14, 5),
      // open at the front (+z is phi = π/2) so the mask shows
      hood: new THREE.SphereGeometry(0.2, 20, 14, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.62),
      sleeve: jaggedCone(0.07, 0.17, 0.55, 10, 0.1, 7),
      sleeveR: jaggedCone(0.08, 0.2, 0.9, 10, 0.18, 9),
    }),
    [],
  )

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    const c = cur.current
    c.gesture = THREE.MathUtils.lerp(c.gesture, s.gesture, Math.min(1, dt * 5))
    glowRef.current = s.crown
    root.current.position.y = Math.sin(t * 1.1) * 0.04
    arm.current.rotation.x = THREE.MathUtils.lerp(-0.55, -1.45, c.gesture)
    arm.current.rotation.z = THREE.MathUtils.lerp(0.35, 0.12, c.gesture)
    forearm.current.rotation.x = THREE.MathUtils.lerp(-0.9, -0.15, c.gesture)
    crown.current.position.y = 3.02 + (s.crownY ?? 0) + Math.sin(t * 1.6) * 0.03
    crown.current.rotation.y = t * 0.35
    orb.current.emissiveIntensity = 0.8 + s.crown * 2.5 + Math.sin(t * 2) * 0.2
  })

  return (
    <group scale={scale}>
      <group ref={root}>
        {/* robes */}
        <Rimmed geometry={geo.robe} position={[0, 1.15, 0]}>
          <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
        </Rimmed>
        <mesh geometry={geo.inner} position={[0, 1.05, 0.08]} scale={[1, 1, 0.8]}>
          <meshStandardMaterial color="#1d1726" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* chevron panel */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1.75 - i * 0.16, 0.3 + i * 0.02]} rotation={[0.1, 0, Math.PI / 4]}>
            <boxGeometry args={[0.16, 0.16, 0.02]} />
            <meshStandardMaterial color="#2a2236" emissive={VIOLET} emissiveIntensity={0.25} />
          </mesh>
        ))}
        {/* chest orb */}
        <mesh position={[0, 2.08, 0.25]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshStandardMaterial ref={orb} color="#120818" emissive={VIOLET} emissiveIntensity={1} toneMapped={false} />
        </mesh>
        {/* collar / mantle */}
        <Rimmed geometry={geo.collar} position={[0, 2.38, 0]} rim={1.05}>
          <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
        </Rimmed>
        <mesh position={[0, 2.43, 0.14]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#120818" emissive={VIOLET} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>

        {/* head: hood + porcelain mask */}
        <group position={[0, 2.68, 0]}>
          <Rimmed geometry={geo.hood} scale={[1, 1.35, 1.05]} rim={1.06}>
            <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
          </Rimmed>
          <mesh position={[0, -0.03, 0.09]} scale={[0.66, 1.05, 0.58]}>
            <sphereGeometry args={[0.16, 24, 18]} />
            <meshStandardMaterial color="#e9e4ec" roughness={0.25} metalness={0.05} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.048, 0.005, 0.185]} rotation={[0, sd * 0.35, sd * 0.5]}>
              <boxGeometry args={[0.07, 0.016, 0.02]} />
              <meshBasicMaterial color="#c78bff" toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, -0.1, 0.17]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.012, 0.06, 0.02]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>

        {/* floating crown */}
        <group ref={crown} position={[0, 3.02, 0]}>
          <NullCrown glowRef={glowRef} />
        </group>

        {/* resting (right) sleeve */}
        <group position={[-0.36, 2.28, 0]} rotation={[0, 0, -0.18]}>
          <Rimmed geometry={geo.sleeveR} position={[0, -0.45, 0]}>
            <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
          </Rimmed>
          <mesh position={[0, -0.92, 0.04]} scale={[0.8, 1.3, 0.7]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color="#1b1424" />
          </mesh>
        </group>

        {/* raised (left) arm with fragment orbit */}
        <group ref={arm} position={[0.38, 2.28, 0]}>
          <Rimmed geometry={geo.sleeve} position={[0, -0.27, 0]}>
            <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
          </Rimmed>
          <group ref={forearm} position={[0, -0.52, 0]}>
            <Rimmed geometry={geo.sleeve} position={[0, -0.25, 0]} scale={[0.9, 0.95, 0.9]}>
              <meshStandardMaterial {...ROBE} side={THREE.DoubleSide} />
            </Rimmed>
            <group position={[0, -0.6, 0.05]}>
              <mesh scale={[0.8, 1.2, 0.5]}>
                <sphereGeometry args={[0.065, 12, 10]} />
                <meshStandardMaterial color="#1b1424" emissive={VIOLET} emissiveIntensity={0.6} />
              </mesh>
              <group position={[0, -0.32, 0.1]}>
                <Fragments />
              </group>
            </group>
          </group>
        </group>
        <pointLight position={[0.9, 2.6, 1.6]} color={VIOLET} intensity={2.2} distance={4} />
      </group>
    </group>
  )
}
