import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The Twin Islands as the World 2 castle outro left them (copied and adapted from
 * castles/w2/Castle2Outro.jsx): the torus held half-folded, grey and seamed in violet, its hole
 * drawn shut to a thread, houses sunk, ONE window still lit; and beside it S¹ ∨ S¹ ∨ S².
 * `flicker(t)` (0..1) dims the last window while Null threatens it.
 */

const TUBE = 1.0
const R = TUBE * 1.12 // halted with a thread of a hole left

export function HeldTorus({ tRef, flicker }) {
  const mat = useRef()
  const win = useRef()
  const winLight = useRef()
  const spin = useRef()
  const geo = useMemo(() => new THREE.TorusGeometry(R, TUBE, 24, 72), [])
  useFrame(() => {
    const t = tRef.current
    spin.current.rotation.y = 0.5 + Math.sin(t * 0.15) * 0.08
    mat.current.emissiveIntensity = 0.5 + Math.sin(t * 1.3) * 0.25
    const f = flicker ? flicker(t) : 0
    // the last window: steady, or stuttering while Null speaks of it
    const k = f > 0 ? (Math.sin(t * 37) > 0.2 - f * 0.9 ? 1 : 0.08) * (1 - f * 0.35) : 1
    win.current.material.color.setRGB(1 * k + 0.1, 0.72 * k + 0.05, 0.38 * k + 0.03)
    winLight.current.intensity = 3.2 * k
  })
  return (
    <group>
      {/* the islet underneath */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[4.6, 5.2, 0.9, 40]} />
        <meshStandardMaterial color="#1c2040" roughness={0.7} />
      </mesh>
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[4.4, 2.2, 4.6, 24]} />
        <meshStandardMaterial color="#141628" roughness={0.9} flatShading />
      </mesh>
      <group ref={spin} position={[0, 0.85, 0]}>
        <mesh geometry={geo} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.9]}>
          <meshStandardMaterial color="#4a4c56" roughness={0.75} metalness={0.1} />
        </mesh>
        {/* the Crown's violet seams across the grey */}
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.01, 1.01, 0.91]}>
          <torusGeometry args={[R, TUBE, 8, 24]} />
          <meshStandardMaterial ref={mat} color="#120a20" emissive="#a259ff" emissiveIntensity={0.5} wireframe toneMapped={false} />
        </mesh>
        {/* the sunk houses, grey */}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.2
          return (
            <mesh key={i} position={[Math.cos(a) * R, TUBE * 0.86, Math.sin(a) * R]} rotation={[0, -a, 0]} scale={[1, 0.3, 1]}>
              <boxGeometry args={[0.24, 0.3, 0.2]} />
              <meshStandardMaterial color="#3a3a42" roughness={0.8} />
            </mesh>
          )
        })}
        {/* one house still standing, its window lit (on the side facing south, toward the gate) */}
        <group position={[0.35, TUBE * 0.86, R + 0.25]}>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.34, 0.36, 0.3]} />
            <meshStandardMaterial color="#4a4440" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.28, 0.2, 4]} />
            <meshStandardMaterial color="#2a2630" roughness={0.7} />
          </mesh>
          <mesh ref={win} position={[0, 0.18, 0.16]}>
            <boxGeometry args={[0.14, 0.12, 0.02]} />
            <meshBasicMaterial color="#ffb860" toneMapped={false} />
          </mesh>
          <pointLight ref={winLight} position={[0, 0.3, 0.6]} color="#ffb860" intensity={3.2} distance={5} />
        </group>
      </group>
    </group>
  )
}

/** S¹ ∨ S¹ ∨ S²: two rings and a ball, all tied at one point, on an islet. */
export function BouquetIsle() {
  const stone = <meshStandardMaterial color="#566070" roughness={0.5} metalness={0.2} emissive="#ffd27a" emissiveIntensity={0.18} />
  const P = 1.0
  return (
    <group rotation={[0, -0.5, 0]}>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[4.2, 4.8, 0.9, 40]} />
        <meshStandardMaterial color="#1c2040" roughness={0.7} />
      </mesh>
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[4.0, 2.0, 4.6, 24]} />
        <meshStandardMaterial color="#141628" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-1.25, P, 0]}>
        <torusGeometry args={[1.25, 0.2, 12, 48]} />
        {stone}
      </mesh>
      <mesh position={[1.25, P, 0]}>
        <torusGeometry args={[1.25, 0.2, 12, 48]} />
        {stone}
      </mesh>
      <mesh position={[0, P + 1.1, 0]}>
        <sphereGeometry args={[1.1, 32, 20]} />
        <meshStandardMaterial color="#566070" roughness={0.4} metalness={0.2} emissive="#ffd27a" emissiveIntensity={0.15} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, P, 0]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh position={[0, P / 2 - 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.14, P + 0.2, 8]} />
        <meshStandardMaterial color="#2a2238" />
      </mesh>
    </group>
  )
}
