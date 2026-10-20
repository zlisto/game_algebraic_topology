import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { ProjectorImpSpawn } from '../../characters/Spawn'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { BeltRing, Projector, TerraceSky, TorusPlaza } from '../../levels/w1/PushForwardScene'
import { CausewaySlab } from '../../world/ReefScenery'

/**
 * Intro movie for World 1 · Level 5, "Push It Forward" (videos.json level-1-5-intro):
 *   A 0–8    over the Torus Terraces: the Projector terrace, a causeway, the torus plaza beyond
 *   B 8–15   the projector: one lap of the source circle becomes two laps of the target
 *   C 15–24  Gyroid on the plaza: out the east gate, in at the west; out the north, in at the south
 *   D 24–26  a projector imp hops onto the projector
 *   E 26–30  title card
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const onC = (c, r, u) => [c[0] + r * Math.cos(-Math.PI / 2 + TAU * u), c[1] + r * Math.sin(-Math.PI / 2 + TAU * u)]

const PA = [0, 0]
const SRC = [-2.4, 0.4]
const TGT = [2.4, -0.4]
const PROJ = [0.4, -1.8]
const PC = [0, -14]
const H = 3.0

const SHOTS = [
  [0, 8, [[10, 16, 12], [0, 0, -6]], [[3, 12, 9], [0.6, 0, -2]]],
  [8, 15, [[1.6, 9.4, 8.2], [0.8, 0, 0]], [[1.4, 9.2, 8.0], [0.8, 0, 0]]],
  [15, 24, [[1.4, 10.4, -5.2], [0.6, 0, -14]], [[1.2, 10.6, -5.0], [0.6, 0, -14]]],
  [24, 26, [[1.8, 5.4, 6.2], [0.2, 0.4, -0.8]], [[1.6, 5.2, 5.8], [0.2, 0.4, -0.8]]],
  [26, 40, [[0, 14, 6], [0, 0, -7]], [[0, 16, 9], [0, 0, -7]]],
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

/** Gyroid on the plaza: centre → east gate, wrap to west → centre → north gate, wrap to south → centre. */
function plazaPos(t) {
  const k = seg(t, 15.6, 23.4)
  const leg = Math.min(3, Math.floor(k * 4))
  const f = smooth(k * 4 - leg)
  if (leg === 0) return { x: f * H, z: 0, dir: [1, 0] }
  if (leg === 1) return { x: (f - 1) * H, z: 0, dir: [1, 0] }
  if (leg === 2) return { x: 0, z: -f * H, dir: [0, -1] }
  return { x: 0, z: (1 - f) * H, dir: [0, -1] }
}

export default function PushForwardMovie({ tRef }) {
  const beadA = useRef()
  const beadB = useRef()
  const imp = useMemo(() => ({ x: PROJ[0] + 2, z: PROJ[1] + 1, seed: 0.7, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const impG = useRef()
  useFrame(() => {
    const t = tRef.current
    const u = t >= 8.6 && t < 15 ? seg(t, 8.8, 14.2) : null
    beadA.current.visible = u != null
    beadB.current.visible = u != null
    if (u != null) {
      const [x, z] = onC(SRC, 2.0, u)
      beadA.current.position.set(x, 0.4, z)
      const [x2, z2] = onC(TGT, 2.0, 2 * u)
      beadB.current.position.set(x2, 0.4, z2)
    }
    impG.current.visible = t >= 24
    const k = smooth(seg(t, 24, 25.2))
    imp.x = mix(PROJ[0] + 2.2, PROJ[0], k)
    imp.z = mix(PROJ[1] + 1.4, PROJ[1], k)
    imp.face = Math.atan2(PROJ[0] - imp.x, PROJ[1] - imp.z)
  })
  const t = () => tRef.current
  const run = (c, laps) => () => {
    const tt = t()
    if (tt < 8.6 || tt >= 15) return null
    const u = seg(tt, 8.8, 14.2) * laps
    const n = Math.max(2, Math.round(u * 72))
    return Array.from({ length: n + 1 }, (_, i) => [...onC(c, 2.0, (u * i) / n), 0.3])
  }
  const gyro = () => {
    const tt = t()
    if (tt >= 15 && tt < 24) {
      const p = plazaPos(tt)
      return { pos: [PC[0] + p.x, 0, PC[1] + p.z], rotY: Math.atan2(p.dir[0], p.dir[1]), run: 0.95, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [PROJ[0] - 1.2, 0, PROJ[1] + 2.4], rotY: tt >= 24 ? Math.PI + 0.5 : Math.PI, run: 0, cast: 0, whip: tt > 25 && tt < 26 ? seg(tt, 25, 26) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-4.0, 0, 2.4], rotY: 0.8, walk: 0, bow: 0, gesture: tt > 0.6 && tt < 4.6 ? 0.8 : 0, talk: (tt > 0.6 && tt < 4.6) || (tt > 15.4 && tt < 19.6) ? 1 : 0 }
  }
  return (
    <>
      <TerraceSky />
      <mesh position={[PA[0], -0.28, PA[1]]}>
        <cylinderGeometry args={[5.4, 5.1, 0.6, 48]} />
        <meshStandardMaterial color="#2a2420" roughness={0.85} metalness={0.15} />
      </mesh>
      <BeltRing cx={SRC[0]} cz={SRC[1]} r={2.0} color="#ffd27a" lit />
      <BeltRing cx={TGT[0]} cz={TGT[1]} r={2.0} color="#7fe8dc" lit />
      <Projector at={PROJ} pos={[0, 0]} active hijacked={false} readout="z ↦ z²" />
      <LiveLine getPts={run(SRC, 1)} color="#fff2c4" width={7} />
      <LiveLine getPts={run(TGT, 2)} color="#fff2c4" width={7} />
      <CausewaySlab a={[0, -5.4]} b={[0, -8.4]} width={1.5} />
      <mesh position={[PC[0], -0.28, PC[1]]}>
        <cylinderGeometry args={[5.6, 5.3, 0.6, 48]} />
        <meshStandardMaterial color="#2a2420" roughness={0.85} metalness={0.15} />
      </mesh>
      <group position={[PC[0], 0, PC[1]]}>
        <TorusPlaza half={H} gate={1.0} />
      </group>
      {[beadA, beadB].map((r, i) => (
        <mesh key={i} ref={r}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      ))}
      <group ref={impG}>
        <ProjectorImpSpawn e={imp} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
