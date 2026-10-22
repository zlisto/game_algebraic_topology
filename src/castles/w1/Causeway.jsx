import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

/** The causeway across the delta to the sphere's foot, and the Warp Portal Gyroid arrives by. */

export const PORTAL_Z = 44

export function Causeway({ from = PORTAL_Z + 1, to = 11.5 }) {
  const n = Math.floor((from - to) / 0.5)
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[0, 0.12, from - i * 0.5]}>
          <boxGeometry args={[1.9, 0.16, 0.42]} />
          <meshStandardMaterial color="#6a5a48" roughness={0.85} emissive="#ffb070" emissiveIntensity={0.06} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(n / 6) }, (_, i) => {
        const z = from - i * 3 - 0.2
        return [-1.05, 1.05].map((x) => (
          <group key={`${i}:${x}`} position={[x, 0, z]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 1.1, 6]} />
              <meshStandardMaterial color="#3a2e24" roughness={0.9} />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0, 1.02, 0]}>
                <sphereGeometry args={[0.1, 10, 8]} />
                <meshStandardMaterial color="#ffd8a0" emissive="#ffa040" emissiveIntensity={2} toneMapped={false} />
              </mesh>
            )}
          </group>
        ))
      })}
      {/* the landing at the portal end */}
      <mesh position={[0, -0.05, from + 1.6]}>
        <cylinderGeometry args={[2.8, 2.8, 0.4, 32]} />
        <meshStandardMaterial color="#3a3240" roughness={0.8} />
      </mesh>
    </group>
  )
}

/** The Warp Portal from 1-10: a standing ring of light at the causeway's start. */
export function Portal({ tRef }) {
  const ring = useRef()
  const film = useRef()
  useFrame(({ clock }) => {
    const t = tRef?.current ?? clock.elapsedTime
    ring.current.rotation.z = clock.elapsedTime * 0.4
    film.current.material.opacity = 0.25 + 0.15 * Math.sin(clock.elapsedTime * 3) + (t < 1.5 ? 0.4 * (1 - t / 1.5) : 0)
  })
  return (
    <group position={[0, 1.7, PORTAL_Z + 1.6]}>
      <mesh ref={ring}>
        <torusGeometry args={[1.5, 0.12, 10, 48]} />
        <meshStandardMaterial color="#c8f0ff" emissive="#5ad6c8" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={film}>
        <circleGeometry args={[1.42, 40]} />
        <meshBasicMaterial color="#7fe8dc" transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
