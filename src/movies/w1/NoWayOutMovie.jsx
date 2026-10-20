import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { ArrowTile, BasinSky, RetractorEngine, RimRoad } from '../../levels/w1/BasinScene'
import { fieldAngle, fieldStrength } from '../../levels/w1/brouwer'

/**
 * Intro movie for World 1 · Level 4, "No Way Out" (videos.json level-1-4-intro):
 *   A 0–8    Brouwer's Basin from above: the Retractor engine humming in the middle of a disk
 *   B 8–16   Count Null boasts; violet chains pull at the rim
 *   C 16–26  Gyroid runs the rim once; the loop then shrinks through the disk; pushed back out
 *            it would still wind once, until it's a point — the Retractor sparks and seizes
 *   D 26–30  an arrow field swirls up across the basin floor
 *   E 30–34  title card
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const RIM = 3.9
const LAP = [16.2, 20.4]
const SHRINK = [20.8, 25.2]
const SWIRL = { kind: 'swirl', focus: [0.3, -0.2], turn: 2.29 }

const SHOTS = [
  [0, 8, [[8, 13, 13], [0, 0, 0]], [[2.6, 9.6, 9.8], [0.4, 0.4, 0]]],
  [8, 16, [[-7.6, 3.4, 7.4], [-1.4, 1.2, -0.4]], [[-7.2, 3.2, 6.8], [-1.4, 1.2, -0.4]]],
  [16, 26, [[0.6, 10.4, 8.6], [0.4, 0, 0.4]], [[0.4, 10.2, 8.4], [0.4, 0, 0.4]]],
  [26, 30, [[3.4, 7.2, 7.2], [0.2, 0, 0]], [[2.8, 7.6, 7.6], [0.2, 0, 0]]],
  [30, 40, [[0, 10, 12], [0, 0, 0]], [[0, 12, 15], [0, 0, 0]]],
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

export default function NoWayOutMovie({ tRef }) {
  const engine = useRef()
  const field = useRef()
  const tear = useRef()
  const chains = useRef()
  const nullG = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const seized = t >= SHRINK[1] - 0.3
    engine.current.position.x = seized ? 0 : Math.sin(clock.elapsedTime * 50) * 0.04 * smooth(seg(t, SHRINK[0], SHRINK[1]))
    tear.current.visible = t >= SHRINK[1] - 0.6 && t < SHRINK[1] + 1.2
    tear.current.scale.setScalar(0.5 + Math.abs(Math.sin(clock.elapsedTime * 18)) * 0.8)
    field.current.visible = t >= 26
    field.current.scale.set(1, 1, 1)
    field.current.position.y = -0.4 * (1 - smooth(seg(t, 26, 27.5)))
    chains.current.visible = t >= 9 && t < SHRINK[1]
    engine.current.visible = t < 8 || t >= 16
    nullG.current.visible = t >= 8 && t < 16.5
    nullG.current.position.y = 0.4 + Math.sin(t * 1.6) * 0.1
  })
  const t = () => tRef.current
  const lap = () => {
    if (t() < LAP[0] || t() >= SHRINK[0]) return null
    const u = smooth(seg(t(), LAP[0], LAP[1]))
    const n = Math.max(2, Math.round(u * 96))
    return Array.from({ length: n + 1 }, (_, i) => {
      const th = Math.PI / 2 + (TAU * u * i) / n
      return [RIM * Math.cos(th), RIM * Math.sin(th), 0.2]
    })
  }
  const loop = () => {
    if (t() < SHRINK[0] || t() >= SHRINK[1] + 0.4) return null
    const k = smooth(seg(t(), SHRINK[0], SHRINK[1]))
    return Array.from({ length: 73 }, (_, i) => [(1 - k) * RIM * Math.cos((i / 72) * TAU), (1 - k) * RIM * Math.sin((i / 72) * TAU), 0.2])
  }
  const image = () => (t() >= SHRINK[0] && t() < SHRINK[1] - 0.3 ? Array.from({ length: 73 }, (_, i) => [(RIM + 0.75) * Math.cos((i / 72) * TAU), (RIM + 0.75) * Math.sin((i / 72) * TAU), 0.22]) : null)
  const tiles = useMemo(() => {
    const out = []
    for (let x = -4.4; x <= 4.4; x += 0.95)
      for (let z = -4.4; z <= 4.4; z += 0.95) if (x * x + z * z <= 4.4 * 4.4) out.push({ x, z, a: fieldAngle('swirl', x, z, SWIRL), m: fieldStrength('swirl', x, z, SWIRL) })
    return out
  }, [])
  const gyro = () => {
    const tt = t()
    if (tt >= LAP[0] && tt < LAP[1] + 0.2) {
      const u = smooth(seg(tt, LAP[0], LAP[1]))
      const th = Math.PI / 2 + TAU * u
      return { pos: [RIM * Math.cos(th), 0, RIM * Math.sin(th)], rotY: -th + Math.PI, run: u < 1 ? 0.95 : 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [0, 0, RIM], rotY: Math.PI, run: 0, cast: tt > SHRINK[0] && tt < SHRINK[1] ? 0.7 : 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-3.0, 0, 3.2], rotY: 0.6, walk: 0, bow: 0, gesture: tt > 20.8 && tt < 25.6 ? 0.8 : 0, talk: tt > 20.8 && tt < 25.6 ? 1 : 0 }
  }
  const nullScript = () => {
    const tt = t()
    const on = tt >= 8 && tt < 16.5
    return { gesture: on && tt > 8.4 && tt < 12.4 ? 0.8 : 0, crown: on ? 0.4 : 0 }
  }
  return (
    <>
      <BasinSky />
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[5.2, 4.9, 0.6, 56]} />
        <meshStandardMaterial color="#4a4a52" roughness={0.88} />
      </mesh>
      <RimRoad cx={0} cz={0} r={RIM} current />
      <group ref={engine}>
        <RetractorEngine cx={0} cz={0} seized={t() >= SHRINK[1]} strain={0} />
      </group>
      <group ref={chains}>
        {[0.6, 2.2, 3.8, 5.3].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 2.3, 0.6, Math.sin(a) * 2.3]} rotation={[0, -a, Math.PI / 2 - 0.25]}>
            <cylinderGeometry args={[0.035, 0.035, 3.4, 6]} />
            <meshBasicMaterial color="#a259ff" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={field}>
        {tiles.map((p, i) => (
          <ArrowTile key={i} x={p.x} z={p.z} angle={p.a} strength={p.m} />
        ))}
      </group>
      <mesh ref={tear} position={[0, 0.9, 0]}>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial color="#ff5a7a" toneMapped={false} />
      </mesh>
      <LiveLine getPts={lap} color="#fff2c4" width={7} />
      <LiveLine getPts={loop} color="#ffffff" width={5} />
      <LiveLine getPts={image} color="#ff8ad8" width={4} dashed />
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <group ref={nullG} position={[-2.4, 0.4, 0.6]} rotation={[0, -0.69, 0]} scale={S}>
        <CountNull script={nullScript} />
      </group>
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
