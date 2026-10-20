import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
const SHOTS = [
  [0, 10, [[4, 8, 11], [0, 1, 0]], [[2, 10, 9], [0, 3, -2]]],
  [10, 20, [[3, 12, 10], [0, 5, -4]], [[1, 16, 8], [0, 8, -6]]],
  [20, 34, [[2, 18, 12], [0, 10, -8]], [[0, 22, 14], [0, 14, -10]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(from[0], to[0], k))
    look.set(...mix3(from[1], to[1], k))
    camera.lookAt(look)
  })
  return null
}
export default function SpireOutro({ tRef }) {
  return (
    <>
      <color attach="background" args={['#080a12']} />
      <fog attach="fog" args={['#080a12', 20, 55]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 20, 6]} intensity={0.7} color="#c8b0ff" />
      <Stars radius={70} depth={40} count={900} factor={2.5} fade />
      <Sparkles count={40} scale={[20, 30, 20]} size={2.5} color="#b070ff" opacity={0.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 1.5 + i * 2.8, -6 - i]}>
          <boxGeometry args={[3.5 - i * 0.3, 2.2, 3.5 - i * 0.3]} />
          <meshStandardMaterial color="#1a1830" emissive="#6030a0" emissiveIntensity={0.25 + i * 0.08} />
        </mesh>
      ))}
      <mesh position={[0, 16, -12]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#b070ff" emissive="#ff40c0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[10, 40]} /><meshStandardMaterial color="#12141c" /></mesh>
      <Gyroid script={() => {
        const t = tRef.current
        const k = smooth(seg(t, 2, 14))
        return { pos: [(-1.5 + k * 1.2) / S, 0, (2 - k * 1.5) / S], rotY: -0.3, run: k > 0.05 && k < 0.95 ? 0.8 : 0, cast: 0.3, loop: 0, loopDrop: 0 }
      }} />
      <Emmy script={() => ({ pos: [-2.8 / S, 0, 2.4 / S], rotY: 0.5, walk: 0, gesture: 0.6, talk: 1 })} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer><Bloom intensity={0.55} luminanceThreshold={0.28} /><Vignette offset={0.28} darkness={0.65} /></EffectComposer>
    </>
  )
}
