import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { SnapperSpawn } from '../../characters/Spawn'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { GardensSky, Gatehouse, HedgeBed, smoothRoute } from '../../levels/w1/EndpointGardensScene'
import { linearHomotopy, resample } from '../../levels/w1/routes'
import Seascape from '../../world/Seascape'

/**
 * Intro movie for World 1 · Level 1, "Fixed Endpoints" (videos.json level-1-1-intro):
 *   A 0–7    over Endpoint Gardens: gatehouses, gold routes between them
 *   B 7–15   Emmy slides a wavy route onto the straight one — gates pinned the whole time
 *   C 15–23  a hedge bed rises between an upper and a lower route; a slide jams against it
 *   D 23–26  snappers scuttle in; Gyroid readies the Lash
 *   E 26–30  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const GA = [-4, 0]
const GB = [4, 0]
const N = 64
const sm = (p) => resample(smoothRoute(p, 96), N)
const STRAIGHT = sm([GA, [0, 0], GB])
const WAVY = sm([GA, [-2, 1.2], [0, -1.1], [2, 1.1], GB])
const UPPER = sm([GA, [-2, 2], [0, 2.3], [2, 2], GB])
const LOWER = sm([GA, [-2, -2], [0, -2.3], [2, -2], GB])
const HEDGE_R = 1.3
const lift = (pts, y = 0.24) => pts.map(([x, z]) => [x, z, y])
function jammed(a, b, t) {
  return linearHomotopy(a, b, t).map(([x, z]) => {
    const d = Math.hypot(x, z)
    return d < HEDGE_R + 0.15 ? [(x / (d || 1)) * (HEDGE_R + 0.15), (z / (d || 1)) * (HEDGE_R + 0.15)] : [x, z]
  })
}

const SHOTS = [
  [0, 7, [[10, 9, 15], [0, 0, 0]], [[3.5, 8, 11], [0, 0, 0]]],
  [7, 15, [[1.5, 7.4, 8.6], [0, 0, 0.6]], [[1, 7, 8], [0, 0, 0.4]]],
  [15, 23, [[1, 7.6, 8.8], [0, 0, 0.3]], [[0.4, 7.2, 8.2], [0, 0, 0.2]]],
  [23, 26, [[-5.5, 3.2, 7.5], [2.2, 0.6, 2.4]], [[-4.8, 3, 7], [2.4, 0.6, 2.4]]],
  [26, 40, [[0, 8.5, 12], [0, 0, 0]], [[0, 10.5, 15], [0, 0, 0]]],
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

export default function EndpointsMovie({ tRef }) {
  const hedge = useRef()
  const pins = useRef()
  const snappers = useMemo(() => [0, 1].map((i) => ({ x: 6 + i, z: 4 + i, seed: i * 2.1, alive: true, dying: 0, face: 0, flash: 0, snipping: 0 })), [])
  const snapG = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const h = t >= 15 ? smooth(seg(t, 15, 16.5)) : 0
    hedge.current.visible = h > 0.01
    hedge.current.scale.set(1, Math.max(0.01, h), 1)
    pins.current.visible = t >= 8 && t < 23
    pins.current.children.forEach((m) => m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.12))
    snapG.current.visible = t >= 22.5
    const k = smooth(seg(t, 22.5, 25.5))
    snappers.forEach((e, i) => {
      e.x = mix(7 + i * 1.2, 3.2 + i * 1.1, k)
      e.z = mix(5 + i * 0.8, 2.6 + i * 0.9, k)
      e.face = Math.atan2(1.4 - e.x, 1.8 - e.z)
    })
  })
  const t = () => tRef.current
  const straight = () => (t() < 15 ? lift(STRAIGHT) : null)
  const wavy = () => (t() < 15 ? lift(t() < 8 ? WAVY : linearHomotopy(WAVY, STRAIGHT, smooth(seg(t(), 8.5, 14))), t() < 8 ? 0.24 : 0.42) : null)
  const upper = () => (t() >= 15 ? lift(UPPER) : null)
  const lower = () => (t() >= 15 ? lift(LOWER) : null)
  const ghost = () => (t() >= 17.5 && t() < 23 ? lift(jammed(LOWER, UPPER, 0.85 * smooth(seg(t(), 18, 21.5))), 0.42) : null)
  const emmy = () => {
    const tt = t()
    return { pos: [-2.6, 0, 3.4], rotY: 0.4, walk: 0, bow: 0, gesture: (tt > 7.4 && tt < 15) || (tt > 19.6 && tt < 23) ? 0.8 : 0, talk: (tt > 7.4 && tt < 11.6) || (tt > 19.6 && tt < 22.8) ? 1 : 0 }
  }
  const gyro = () => {
    const tt = t()
    return { pos: [1.4, 0, 2.6], rotY: tt > 23 ? 0.9 : Math.PI + 0.3, run: 0, cast: 0, whip: tt > 24.6 && tt < 25.6 ? seg(tt, 24.6, 25.6) : 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <GardensSky />
      <Seascape y={-0.9} depth={2.2} area={[0, 0, 50, 50]} seed={101} palette={{ water: '#123a52', sand: '#3a5a52', weed: '#22503a' }} lanterns={8} />
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[6.6, 6.3, 0.6, 56]} />
        <meshStandardMaterial color="#4a5568" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.45, 6.6, 64]} />
        <meshBasicMaterial color="#c9a84a" toneMapped={false} />
      </mesh>
      <Gatehouse pos={GA} rot={Math.PI / 2} />
      <Gatehouse pos={GB} rot={-Math.PI / 2} />
      <group ref={pins}>
        {[GA, GB].map((p, i) => (
          <mesh key={i} position={[p[0], 0.06, p[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.75, 32]} />
            <meshBasicMaterial color="#ff8ad8" transparent opacity={0.85} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={hedge}>
        <HedgeBed c={[0, 0]} r={HEDGE_R} />
      </group>
      <LiveLine getPts={straight} color="#e8dcc0" width={4} />
      <LiveLine getPts={wavy} color="#3ecfbf" width={6} />
      <LiveLine getPts={upper} color="#ffb347" width={4} />
      <LiveLine getPts={lower} color="#c58bff" width={4} />
      <LiveLine getPts={ghost} color="#3ecfbf" width={6} />
      <group ref={snapG}>
        {snappers.map((e, i) => (
          <SnapperSpawn key={i} e={e} />
        ))}
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.12} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
