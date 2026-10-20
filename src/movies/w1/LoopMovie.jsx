import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { BacktrackSpawn } from '../../characters/Spawn'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { makeTrack } from '../../levels/w0/cells'
import { BastionSky, BeaconTower, TRACK_COLS } from '../../levels/w1/BeaconScene'

/**
 * Intro movie for World 1 · Level 2, "Every Road Comes Home" (videos.json level-1-2-intro):
 *   A 0–7    over the Basepoint Beacon: the amber pad, its gold petal
 *   B 7–15   Emmy wakes the Lash; Gyroid's cord closes into a ring
 *   C 15–23  Gyroid runs the petal along its arrows (the trail grows), then backwards (it shrinks
 *            back to nothing at the pad: α then α⁻¹ is standing still)
 *   D 23–26  two Backtracks slip onto the petal and run it the wrong way; Gyroid readies the Lash
 *   E 26–30  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const HUB = [0, 0]
const PETAL = makeTrack({ angle: -1.9, length: 3.9 }, HUB)
const lift = (pts, y = 0.2) => pts.map(([x, z]) => [x, z, y])
const part = (u0, u1) => {
  const n = PETAL.pts.length - 1
  return PETAL.pts.slice(Math.round(u0 * n), Math.max(Math.round(u0 * n) + 2, Math.round(u1 * n) + 1))
}
// the forward run, and the backward run that eats it
const OUT = [15.2, 18.6]
const BACK = [19.2, 22.6]

const SHOTS = [
  [0, 7, [[9, 12, 14], [0, 0, -1]], [[3.5, 8.5, 9.5], [0, 0, -0.8]]],
  [7, 15, [[2.4, 4.6, 6.4], [0, 1, 0.4]], [[1.8, 4.2, 5.8], [0, 1, 0.4]]],
  [15, 23, [[1.2, 9.4, 7.4], [-0.4, 0, -1.3]], [[0.8, 9.6, 7.6], [-0.4, 0, -1.3]]],
  [23, 26, [[-3.4, 3.6, 4.6], [-0.6, 0.6, -1.6]], [[-3.0, 3.4, 4.2], [-0.6, 0.6, -1.6]]],
  [26, 40, [[0, 9, 12], [0, 0, -0.5]], [[0, 11, 15], [0, 0, -0.5]]],
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

/** Gyroid's place on the petal at story time t (u = how far round). */
function gyroU(t) {
  if (t >= OUT[0] && t < OUT[1]) return smooth(seg(t, OUT[0], OUT[1]))
  if (t >= BACK[0] && t < BACK[1]) return 1 - smooth(seg(t, BACK[0], BACK[1]))
  return null
}

export default function LoopMovie({ tRef }) {
  const pulse = useRef(0)
  const backs = useMemo(() => [0, 1].map((i) => ({ x: 0, z: 0, seed: i * 2.3, alive: true, dying: 0, face: 0, flash: 0, stun: 0, u: 0.75 - i * 0.3 })), [])
  const backG = useRef()
  const pulsed = useRef({})
  useFrame(() => {
    const t = tRef.current
    // the pad pulses when Gyroid comes home
    for (const at of [OUT[1], BACK[1]]) {
      if (t >= at && t < at + 0.3 && !pulsed.current[at]) {
        pulsed.current[at] = true
        pulse.current = 1
      }
      if (t < at) pulsed.current[at] = false
    }
    backG.current.visible = t >= 23
    backs.forEach((e) => {
      const u = (((e.u - (t - 23) * 0.16) % 1) + 1) % 1
      const prev = PETAL.at(Math.min(1, u + 0.01))
      const [x, z] = PETAL.at(u)
      e.x = x
      e.z = z
      e.face = Math.atan2(x - prev[0], z - prev[1])
    })
  })
  const t = () => tRef.current
  const petal = () => lift(PETAL.pts)
  // the run so far: grows on the way out, shrinks back on the way home
  const trail = () => {
    const u = gyroU(t())
    if (u == null) return t() >= OUT[1] && t() < BACK[0] ? lift(PETAL.pts, 0.26) : null
    return t() < OUT[1] ? lift(part(0, u), 0.26) : lift(part(0, u), 0.26)
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-2.2, 0, 1.6], rotY: 0.9, walk: 0, bow: 0, gesture: (tt > 7.4 && tt < 11.5) || (tt > 20 && tt < 23) ? 0.8 : 0, talk: (tt > 0.6 && tt < 4.6) || (tt > 7.4 && tt < 11) || (tt > 20 && tt < 23) ? 1 : 0 }
  }
  const gyro = () => {
    const tt = t()
    const u = gyroU(tt)
    if (u != null) {
      const p = PETAL.at(u)
      const dir = tt < OUT[1] ? 0.03 : -0.03
      const a = PETAL.at(Math.min(1, Math.max(0, u + dir)))
      return { pos: [p[0], 0, p[1]], rotY: Math.atan2(a[0] - p[0], a[1] - p[1]), run: 0.95, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    const lasso = tt >= 8 && tt < 15
    return {
      pos: [0.15, 0, 0.35],
      rotY: tt >= 23 ? Math.PI + 0.5 : tt < 15 ? 0.2 : Math.PI,
      run: 0,
      cast: lasso ? 0.7 : 0,
      loop: lasso ? smooth(seg(tt, 8.5, 11.5)) : 0,
      loopDrop: lasso ? smooth(seg(tt, 12, 14.5)) : 0,
      whip: tt > 24.6 && tt < 25.7 ? seg(tt, 24.6, 25.7) : 0,
    }
  }
  return (
    <>
      <BastionSky />
      <mesh position={[0, -0.3, -0.6]}>
        <cylinderGeometry args={[5.6, 5.3, 0.6, 56]} />
        <meshStandardMaterial color="#3a3640" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.6]}>
        <ringGeometry args={[5.45, 5.6, 64]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      <BeaconTower pulseRef={pulse} label="x₀" />
      <LiveLine getPts={petal} color={TRACK_COLS[0]} width={5} />
      <LiveLine getPts={trail} color="#fff2c4" width={9} />
      <group ref={backG}>
        {backs.map((e, i) => (
          <BacktrackSpawn key={i} e={e} />
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
