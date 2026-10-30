import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

/**
 * A side island off the main route (kind 'commons', from tools/relayout.py): a deck of dark stone with a
 * cluster of violet crystals and a lamp, so it reads as somewhere worth walking to. Beasts roam some of them.
 */
export default function Commons({ site, color = '#26302c', accent = '#a259ff' }) {
  const lamp = useRef()
  const r = site.def.add[0].r
  const seed = site.id.length * 7 + site.pos[0] * 3 + site.pos[1]
  useFrame(({ clock }) => {
    if (lamp.current) lamp.current.intensity = 2.2 + Math.sin(clock.elapsedTime * 1.7 + seed) * 0.4
  })
  const crystals = [0, 1, 2, 3, 4].map((k) => {
    const a = seed + k * 1.3
    return { x: Math.cos(a) * r * 0.55, z: Math.sin(a) * r * 0.55, h: 0.5 + ((k * 37 + seed) % 5) * 0.18, tilt: ((k % 3) - 1) * 0.25 }
  })
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[r, r * 0.88, 0.6, 40]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r - 0.12, r, 48]} />
        <meshBasicMaterial color="#6a5a8a" toneMapped={false} transparent opacity={0.45} />
      </mesh>
      {crystals.map((c, i) => (
        <mesh key={i} position={[c.x, c.h / 2, c.z]} rotation={[c.tilt, i, c.tilt * 0.6]}>
          <coneGeometry args={[0.13 + (i % 2) * 0.05, c.h, 5]} />
          <meshStandardMaterial color="#3a2458" emissive={accent} emissiveIntensity={0.55} roughness={0.3} flatShading />
        </mesh>
      ))}
      <group position={[-r * 0.35, 0, r * 0.3]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 1.6, 8]} />
          <meshStandardMaterial color="#2a2420" />
        </mesh>
        <mesh position={[0, 1.66, 0]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshBasicMaterial color="#ffc46a" toneMapped={false} />
        </mesh>
        <pointLight ref={lamp} position={[0, 1.6, 0]} color="#ffb347" intensity={2.2} distance={6} />
      </group>
    </group>
  )
}
