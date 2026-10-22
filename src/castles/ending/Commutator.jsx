import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The Commutator — a small procedural figure after assets/characters/commutator.png:
 * slim night-blue armour with copper trim, a pointed helm with two violet ribbon loops
 * above it (his a and b), a copper spiral sash, and a pink-glowing rapier.
 * About 1.8 units tall at scale 1, facing +z.
 *
 * `script(t)` → { pos:[x,y,z], rotY, salute }   salute: 0 blade lowered … 1 blade raised before his face
 */
const ARMOR = { color: '#262a52', roughness: 0.35, metalness: 0.55, flatShading: true }
const COPPER = { color: '#b8603e', roughness: 0.35, metalness: 0.7 }

export default function Commutator({ script, scale = 1 }) {
  const root = useRef()
  const arm = useRef()
  const ribbons = useRef()
  const cur = useRef({ salute: 0 })
  const sash = useMemo(() => {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const u = i / 59
      const a = u * Math.PI * 3.2
      const r = 0.55 * (1 - u * 0.75)
      return new THREE.Vector3(-0.45 - Math.cos(a) * r, 0.75 + Math.sin(a) * r, -0.15)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.035, 5, false)
  }, [])
  const loop = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const a = (i / 39) * Math.PI * 2
      return new THREE.Vector3(Math.sin(a) * 0.16, 0.22 - Math.cos(a) * 0.22, 0)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.018, 5, true)
  }, [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    const c = cur.current
    c.salute += ((s.salute || 0) - c.salute) * Math.min(1, dt * 4)
    root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY || 0
    root.current.children[0].position.y = Math.sin(t * 1.4) * 0.012
    arm.current.rotation.x = THREE.MathUtils.lerp(0.25, -1.9, c.salute)
    arm.current.rotation.z = THREE.MathUtils.lerp(-0.25, 0.35, c.salute)
    ribbons.current.rotation.y = Math.sin(t * 0.9) * 0.25
  })
  return (
    <group ref={root} scale={scale}>
      <group>
        {/* legs */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.1, 0, 0]}>
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.065, 0.045, 0.8, 6]} />
              <meshStandardMaterial {...ARMOR} />
            </mesh>
            <mesh position={[0, 0.45, 0.05]} rotation={[0.3, 0, 0]}>
              <octahedronGeometry args={[0.06, 0]} />
              <meshStandardMaterial {...COPPER} />
            </mesh>
            <mesh position={[0, 0.03, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.055, 0.22, 4]} />
              <meshStandardMaterial {...ARMOR} />
            </mesh>
          </group>
        ))}
        {/* torso: a narrow waist up to broad, spiked pauldrons */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.2, 0.11, 0.48, 6]} />
          <meshStandardMaterial {...ARMOR} />
        </mesh>
        <mesh position={[0, 0.83, 0.02]}>
          <torusGeometry args={[0.12, 0.022, 6, 16]} />
          <meshStandardMaterial {...COPPER} />
        </mesh>
        <mesh position={[0, 1.1, 0.15]} rotation={[0.15, 0, Math.PI]}>
          <coneGeometry args={[0.11, 0.3, 3]} />
          <meshStandardMaterial {...COPPER} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.25, 1.26, 0]} rotation={[0, 0, sd * -0.9]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial {...ARMOR} />
          </mesh>
        ))}
        {/* left arm, open hand */}
        <group position={[-0.25, 1.2, 0]} rotation={[0.1, 0, 0.35]}>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.56, 6]} />
            <meshStandardMaterial {...ARMOR} />
          </mesh>
        </group>
        {/* sword arm */}
        <group ref={arm} position={[0.25, 1.2, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.56, 6]} />
            <meshStandardMaterial {...ARMOR} />
          </mesh>
          <group position={[0, -0.56, 0.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
              <meshStandardMaterial {...COPPER} />
            </mesh>
            <mesh position={[0, -0.5, 0.05]} rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.016, 0.95, 5]} />
              <meshStandardMaterial color="#ff7ad9" emissive="#ff4fd0" emissiveIntensity={2.6} toneMapped={false} />
            </mesh>
          </group>
        </group>
        {/* helm: a tall point, two eye slits */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshStandardMaterial {...ARMOR} />
        </mesh>
        <mesh position={[0, 1.68, -0.01]}>
          <coneGeometry args={[0.11, 0.32, 5]} />
          <meshStandardMaterial {...ARMOR} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.04, 1.51, 0.11]}>
            <boxGeometry args={[0.04, 0.012, 0.01]} />
            <meshBasicMaterial color="#cfe6ff" toneMapped={false} />
          </mesh>
        ))}
        {/* a and b: two ribbon loops above the helm */}
        <group ref={ribbons} position={[0, 1.78, 0]}>
          {[-1, 1].map((sd) => (
            <mesh key={sd} geometry={loop} position={[sd * 0.15, 0, 0]} rotation={[0, 0, sd * -0.35]}>
              <meshStandardMaterial color={sd < 0 ? '#9a6bff' : '#5ab0ff'} emissive={sd < 0 ? '#7a3cff' : '#3a8aff'} emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          ))}
        </group>
        {/* the copper spiral sash */}
        <mesh geometry={sash}>
          <meshStandardMaterial {...COPPER} emissive="#5a2010" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  )
}
