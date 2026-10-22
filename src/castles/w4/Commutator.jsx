import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The Commutator — procedural figure after assets/characters/commutator.png: a lean knight in
 * midnight plate with copper trim, a pointed helm with two pale eyes, two violet ribbon loops
 * rising from the helm (his patrol word a b a⁻¹ b⁻¹), a great copper spiral over one shoulder,
 * a dark crescent over the other, and a glowing pink rapier.
 *
 * `script(t)` → { pos:[x,y,z], rotY, lunge (0..1), glow (0..1), walk (0..1) }
 */

const PLATE = { color: '#1c2244', metalness: 0.7, roughness: 0.32, emissive: '#0a0e2a', emissiveIntensity: 0.6 }
const COPPER = { color: '#c0603a', metalness: 0.8, roughness: 0.3, emissive: '#3a1408', emissiveIntensity: 0.5 }

function spiral(turns, r0, r1, n = 120) {
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    const a = u * turns * Math.PI * 2
    const r = r0 + (r1 - r0) * u
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
  })
}
function tube(pts, r, closed = false) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), Math.max(32, pts.length), r, 8, closed)
}

export default function Commutator({ script }) {
  const root = useRef()
  const armR = useRef()
  const legL = useRef()
  const legR = useRef()
  const blade = useRef()
  const ribbons = useRef()
  const cur = useRef({ lunge: 0 })
  const geo = useMemo(
    () => ({
      spiral: tube(spiral(1.6, 0.06, 0.46), 0.055),
      crescent: tube(Array.from({ length: 40 }, (_, i) => {
        const a = -1.2 + (i / 39) * 3.0
        return new THREE.Vector3(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0)
      }), 0.09),
      ribbonA: tube(Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2
        return new THREE.Vector3(-0.2 + Math.sin(a) * 0.22, 0.32 + 0.3 * (1 - Math.cos(a)) * 0.5 + 0.02, Math.sin(2 * a) * 0.05)
      }), 0.02, true),
      ribbonB: tube(Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2
        return new THREE.Vector3(0.2 - Math.sin(a) * 0.22, 0.32 + 0.3 * (1 - Math.cos(a)) * 0.5 + 0.02, -Math.sin(2 * a) * 0.05)
      }), 0.02, true),
    }),
    [],
  )
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    if (!s) return
    root.current.visible = s.visible !== false
    root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY || 0
    const c = cur.current
    c.lunge = THREE.MathUtils.lerp(c.lunge, s.lunge || 0, Math.min(1, dt * 14))
    const w = s.walk || 0
    armR.current.rotation.x = -0.5 - c.lunge * 1.1
    armR.current.rotation.z = -0.25 + c.lunge * 0.2
    legL.current.rotation.x = Math.sin(t * 9) * 0.6 * w + c.lunge * -0.5
    legR.current.rotation.x = -Math.sin(t * 9) * 0.6 * w + c.lunge * 0.5
    root.current.children[0].position.y = Math.abs(Math.sin(t * 9)) * 0.05 * w
    blade.current.emissiveIntensity = 1.6 + (s.glow || 0) * 2 + Math.sin(t * 6) * 0.3
    ribbons.current.rotation.y = Math.sin(t * 1.3) * 0.25
  })
  return (
    <group ref={root}>
      <group>
        {/* legs */}
        {[[-0.13, legL], [0.13, legR]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0.95, 0]}>
            <mesh position={[0, -0.45, 0]}>
              <capsuleGeometry args={[0.075, 0.75, 4, 10]} />
              <meshStandardMaterial {...PLATE} />
            </mesh>
            <mesh position={[0, -0.5, 0.07]} rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.06, 0.2, 4]} />
              <meshStandardMaterial {...COPPER} />
            </mesh>
            <mesh position={[0, -0.92, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.07, 0.3, 4]} />
              <meshStandardMaterial {...PLATE} />
            </mesh>
          </group>
        ))}
        {/* torso: a narrow waist flaring to the chest */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.24, 0.14, 0.62, 8]} />
          <meshStandardMaterial {...PLATE} flatShading />
        </mesh>
        <mesh position={[0, 1.36, 0.13]} rotation={[0.1, 0, Math.PI / 4]}>
          <boxGeometry args={[0.18, 0.18, 0.04]} />
          <meshStandardMaterial {...COPPER} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.12, 8]} />
          <meshStandardMaterial {...COPPER} />
        </mesh>
        {/* pauldrons */}
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 0.3, 1.52, 0]} rotation={[0, 0, sx * -0.5]}>
            <coneGeometry args={[0.13, 0.32, 4]} />
            <meshStandardMaterial {...COPPER} />
          </mesh>
        ))}
        {/* helm */}
        <group position={[0, 1.72, 0]}>
          <mesh>
            <coneGeometry args={[0.13, 0.42, 6]} />
            <meshStandardMaterial {...PLATE} flatShading />
          </mesh>
          {[-0.04, 0.04].map((x) => (
            <mesh key={x} position={[x, -0.04, 0.1]}>
              <sphereGeometry args={[0.018, 8, 6]} />
              <meshBasicMaterial color="#e8f0ff" toneMapped={false} />
            </mesh>
          ))}
          <group ref={ribbons}>
            <mesh geometry={geo.ribbonA}>
              <meshStandardMaterial color="#b07aff" emissive="#8a5aff" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            <mesh geometry={geo.ribbonB}>
              <meshStandardMaterial color="#7fa8ff" emissive="#5a7aff" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          </group>
        </group>
        {/* the copper spiral over the left shoulder, the dark crescent over the right */}
        <mesh geometry={geo.spiral} position={[-0.55, 1.35, -0.12]} rotation={[0, 0.3, 0.4]}>
          <meshStandardMaterial {...COPPER} />
        </mesh>
        <mesh geometry={geo.crescent} position={[0.5, 1.4, -0.15]} rotation={[0, -0.3, 0.2]}>
          <meshStandardMaterial {...PLATE} />
        </mesh>
        {/* left arm, open hand */}
        <group position={[-0.3, 1.45, 0]} rotation={[0.2, 0, 0.45]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.055, 0.5, 4, 8]} />
            <meshStandardMaterial {...PLATE} />
          </mesh>
        </group>
        {/* right arm and the rapier */}
        <group ref={armR} position={[0.3, 1.45, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.055, 0.5, 4, 8]} />
            <meshStandardMaterial {...PLATE} />
          </mesh>
          <group position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.06, 0.012, 6, 16, Math.PI]} />
              <meshStandardMaterial {...COPPER} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.008, 0.022, 1.05, 6]} />
              <meshStandardMaterial ref={blade} color="#ff9ae8" emissive="#ff4ad0" emissiveIntensity={1.8} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
