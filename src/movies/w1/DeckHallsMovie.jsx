import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { DeckGuardSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { HALL_COVERS } from '../../levels/w1/DeckHallsScene'
import Seascape from '../../world/Seascape'
import CoverGraph from './CoverGraph'
import { SphereHall } from './DeckHallsLesson'
import { During } from './SheetMusicLesson'

/**
 * Intro movie for World 1 · Level 10, "Deck the Halls" (videos.json level-1-10-intro):
 *   A 0–8    the Deck Halls: a three-sheeted cover hangs over the hall
 *   B 8–15   it turns a third of the way round and lands on itself
 *   C 15–24  the sphere hall, its golden doors exactly opposite
 *   D 24–26  three Deck guards stack on one spot; Gyroid lashes
 *   E 26–30  title card
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const V3 = Array.from({ length: 3 }, (_, i) => [2.4 * Math.cos(-Math.PI / 2 + (TAU * i) / 3), 2.4, 2.4 * Math.sin(-Math.PI / 2 + (TAU * i) / 3)])

const SHOTS = [
  [0, 8, [[8, 12, 12], [0, 1.2, 0]], [[1.2, 9.4, 8.8], [0.6, 1.4, 0]]],
  [8, 15, [[1.2, 9.4, 8.8], [0.6, 1.4, 0]], [[1.0, 9.6, 9.0], [0.6, 1.4, 0]]],
  [15, 24, [[2.4, 6.4, 8.6], [0, 1.6, -0.6]], [[-2.4, 6.6, 8.6], [0, 1.6, -0.6]]],
  [24, 26, [[1.6, 4.4, 6.4], [0, 0.6, 0.6]], [[1.4, 4.2, 6.0], [0, 0.6, 0.6]]],
  [26, 40, [[0, 10, 12], [0, 1.2, 0]], [[0, 12, 15], [0, 1.2, 0]]],
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

function Spin({ tRef }) {
  const g = useRef()
  useFrame(() => (g.current.rotation.y = (-TAU / 3) * smooth(seg(tRef.current, 9, 12.5))))
  return (
    <group ref={g}>
      <CoverGraph cover={HALL_COVERS.cyclic3} verts={V3} />
    </group>
  )
}

export default function DeckHallsMovie({ tRef }) {
  const guards = useMemo(() => [0, 1, 2].map((i) => ({ x: 0, z: 0, seed: i, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const gG = useRef()
  useFrame(() => {
    const t = tRef.current
    gG.current.visible = t >= 24 && t < 26.4
    const k = smooth(seg(t, 24, 25))
    guards.forEach((e, i) => {
      const th = (TAU * i) / 3
      e.x = mix(1.8 * Math.cos(th), 0, k)
      e.z = mix(1.8 * Math.sin(th), 0.6, k) + 0.6 * (1 - k)
      e.alive = t < 25.9
      e.dying = t >= 25.9 ? 0.3 : 0
    })
  })
  const t = () => tRef.current
  const gyro = () => {
    const tt = t()
    return { pos: [0.4, 0, 2.2], rotY: Math.PI, run: 0, cast: tt > 9 && tt < 12.5 ? 0.8 : 0, whip: tt > 25 && tt < 26 ? seg(tt, 25, 26) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-3.2, 0, 2.2], rotY: 0.7, walk: 0, bow: 0, gesture: tt > 8.4 && tt < 13 ? 0.8 : 0, talk: (tt > 8.4 && tt < 13) || (tt > 20 && tt < 24) ? 1 : 0 }
  }
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 22, 58]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a8c8ff', '#0a0818', 0.55]} />
      <directionalLight position={[8, 18, 6]} intensity={0.95} color="#d0e4ff" />
      <Stars radius={80} depth={36} count={1200} factor={2.4} fade speed={0.25} />
      <Sparkles count={90} scale={[30, 6, 30]} position={[0, 3, -2]} size={2.2} speed={0.25} color="#ffe6a8" />
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={110} palette={{ water: '#0f2848', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[5.4, 5.1, 0.6, 56]} />
        <meshStandardMaterial color="#1c2430" roughness={0.85} />
      </mesh>
      <During tRef={tRef} when={(tt) => tt < 15}>
        <Spin tRef={tRef} />
      </During>
      <SphereHall show={() => t() >= 15 && t() < 24} />
      <group ref={gG}>
        {guards.map((e, i) => (
          <DeckGuardSpawn key={i} e={e} />
        ))}
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.75} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
