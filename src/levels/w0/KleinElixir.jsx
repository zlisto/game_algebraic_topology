import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { klein, surface } from '../../characters/Bestiary'

/**
 * The Klein Elixir: a heal pickup some spawn drop. A glass Klein bottle — its neck passing back
 * through its own wall — filled with glowing violet elixir, turning slowly about the axis of its
 * self-intersection and bobbing over the reef. Walk over it for every heart back.
 */
const HEART = (() => {
  const h = new THREE.Shape()
  h.moveTo(0, -1.2)
  h.bezierCurveTo(-0.2, -0.9, -1.4, -0.4, -1.4, 0.4)
  h.bezierCurveTo(-1.4, 1.2, -0.4, 1.4, 0, 0.7)
  h.bezierCurveTo(0.4, 1.4, 1.4, 1.2, 1.4, 0.4)
  h.bezierCurveTo(1.4, -0.4, 0.2, -0.9, 0, -1.2)
  return h
})()

export default function KleinElixir({ x, z }) {
  const g = useRef()
  const spin = useRef()
  const glass = useMemo(() => {
    const geo = surface(klein, 72, 24)
    geo.center()
    return geo
  }, [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    g.current.position.set(x, 0.55 + Math.sin(t * 2.4) * 0.07, z)
    spin.current.rotation.y += dt * 1.4 // about the self-intersection axis
  })
  return (
    <group ref={g}>
      {/* stand the bottle up so the neck's crossing through the wall lies on the vertical spin axis */}
      <group ref={spin}>
        <group rotation={[0, 0, Math.PI / 2]} scale={0.95}>
          {/* glass */}
          <mesh geometry={glass}>
            <meshPhysicalMaterial color="#e8dcff" roughness={0.05} metalness={0} transmission={0.9} thickness={0.25} ior={1.45} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {/* the elixir inside: the same surface, a little smaller, glowing */}
          <mesh geometry={glass} scale={0.82}>
            <meshStandardMaterial color="#9a4cff" emissive="#b070ff" emissiveIntensity={1.7} transparent opacity={0.85} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* a little heart floating over it: this one heals */}
      <mesh position={[0, 0.62, 0]} scale={0.08}>
        <shapeGeometry args={[HEART]} />
        <meshBasicMaterial color="#ff6aa8" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color="#ff6aa8" transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
      <Sparkles count={14} scale={1.1} size={3} speed={0.5} color="#ffd0e4" />
    </group>
  )
}
