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
  [0, 8, [[5, 9, 12], [0, 1, 0]], [[3, 8, 10], [0, 0.8, 0]]],
  [8, 18, [[-4, 7, 9], [0, 1, 0]], [[2, 6.5, 8], [0, 0.6, 0]]],
  [18, 26, [[4, 7, 8], [0, 0.8, 0]], [[0, 8, 11], [0, 0.5, 0]]],
  [26, 32, [[1, 9, 13], [0, 0.6, 0]], [[0, 8.5, 12], [0, 0.5, 0]]],
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
function gyroidAt(t) {
  if (t < 10) {
    const k = smooth(seg(t, 1, 9))
    return { x: -3 + k * 2.5, z: 2 - k, rotY: 0.5, run: 0.9, cast: 0.3, loop: 0, loopDrop: 0 }
  }
  if (t < 20) {
    const k = smooth(seg(t, 10, 19))
    return { x: -0.5 + Math.sin(k * Math.PI) * 1.5, z: 1, rotY: k * 2, run: 0.6, cast: 0.8, loop: 0.35, loopDrop: 1 }
  }
  return { x: 0.2, z: 0.6, rotY: -0.4, run: 0, cast: 0.55, loop: 0.2, loopDrop: 1 }
}
export default function CounterfeitMovie({ tRef }) {
  return (
    <>
      <color attach="background" args={['#0a0c14']} />
      <fog attach="fog" args={['#0a0c14', 16, 40]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#d0c8b0', '#1a1020', 0.45]} />
      <directionalLight position={[6, 12, 4]} intensity={0.8} />
      <Stars radius={50} depth={28} count={500} factor={2} fade />
      <Sparkles count={24} scale={[16, 5, 16]} size={2} color="#ffcf6a" opacity={0.45} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 40]} /><meshStandardMaterial color="#1a2230" /></mesh>
      <mesh position={[0, 1.8, -2]}>
        <torusGeometry args={[2.2, 0.45, 12, 32]} />
        <meshStandardMaterial color="#3a3428" emissive="#8060a0" emissiveIntensity={0.5} />
      </mesh>
      <Gyroid script={() => { const g = gyroidAt(tRef.current); return { pos: [g.x / S, 0, g.z / S], rotY: g.rotY, run: g.run, cast: g.cast, loop: g.loop, loopDrop: g.loopDrop } }} />
      <Emmy script={() => ({ pos: [-2.5 / S, 0, 2 / S], rotY: 0.6, walk: 0, gesture: 0.7, talk: 1 })} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.3} /><Vignette offset={0.3} darkness={0.6} /></EffectComposer>
    </>
  )
}
