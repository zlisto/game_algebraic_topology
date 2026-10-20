import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { WinderSpawn } from '../../characters/Spawn'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { HELIX_R, HELIX_TURNS, liftHeight, onCircle } from '../../levels/w1/WindingRoadScene'
import Seascape from '../../world/Seascape'

/**
 * Intro movie for World 1 · Level 3, "The Winding Road" (videos.json level-1-3-intro):
 *   A 0–8    over the Helix deck: the ring road, and the helix standing over it
 *   B 8–16   Gyroid runs one lap counter-clockwise; his teal shadow climbs the helix to floor +1
 *   C 16–24  a wiggly lap — the shadow sways, and still ends on floor +1
 *   D 24–28  two Winders rise, wound in violet coils
 *   E 28–32  title card
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const C = [0, 0]
const R = 3.8
const START = -Math.PI / 2
const LAP1 = [8.6, 14.8]
const LAP2 = [16.4, 23]
const wig = (u) => 0.6 * Math.sin(3 * TAU * u) // C's lap wanders in and out
const helixAt = (U, dr = 0) => {
  const [x, z] = onCircle(C, HELIX_R + dr, U)
  return [x, z, liftHeight(U)]
}
/** Where Gyroid is round the ring (unwrapped angle from START) and how far off the centre line. */
function lapAt(t) {
  if (t >= LAP1[0] && t < LAP1[1] + 1.2) return { U: TAU * smooth(seg(t, LAP1[0], LAP1[1])), dr: 0, base: 0 }
  if (t >= LAP2[0] && t < 24) {
    const u = smooth(seg(t, LAP2[0], LAP2[1]))
    return { U: TAU * u, dr: wig(u), base: 0 }
  }
  return null
}

const SHOTS = [
  [0, 8, [[9, 11, 15], [0, 2.4, 0]], [[3.4, 8.8, 13.6], [0, 2.6, 0]]],
  [8, 16, [[2.8, 8.6, 13.6], [0, 2.6, 0]], [[2.4, 8.8, 13.8], [0, 2.7, 0]]],
  [16, 24, [[-2.6, 8.6, 13.6], [0, 2.6, 0]], [[-2.2, 8.8, 13.8], [0, 2.7, 0]]],
  [24, 28, [[0.2, 5.4, 9.6], [0, 1.4, -0.6]], [[0.2, 5.0, 9.0], [0, 1.4, -0.6]]],
  [28, 40, [[0, 9, 14], [0, 2.4, 0]], [[0, 11, 17], [0, 2.4, 0]]],
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

export default function WindingRoadMovie({ tRef }) {
  const shadow = useRef()
  const winders = useMemo(
    () => [
      { x: 2.3, z: -1.2, seed: 0.4, alive: true, dying: 0, face: 0, flash: 0, turns: 2 },
      { x: -2.4, z: -0.8, seed: 1.9, alive: true, dying: 0, face: 0, flash: 0, turns: -3 },
    ],
    [],
  )
  const winG = useRef()
  const tube = useMemo(() => {
    const pts = []
    const N = HELIX_TURNS * 2 * 48
    for (let i = 0; i <= N; i++) {
      const U = -HELIX_TURNS * TAU + (i / N) * HELIX_TURNS * 2 * TAU
      const [x, z, y] = helixAt(U)
      pts.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])
  useFrame(() => {
    const t = tRef.current
    const L = lapAt(t)
    shadow.current.visible = !!L
    if (L) {
      const [x, z, y] = helixAt(START + L.U, L.dr * 0.45)
      shadow.current.position.set(x, y, z)
    }
    winG.current.visible = t >= 24
    const rise = smooth(seg(t, 24, 25.5))
    winders.forEach((w, i) => {
      w.x = [2.3, -2.4][i]
      w.z = [-1.2, -0.8][i]
      w.face = Math.atan2(-w.x, 3.8 - w.z)
    })
    winG.current.position.y = -1.2 * (1 - rise)
  })
  const t = () => tRef.current
  const ring = () => Array.from({ length: 97 }, (_, i) => [...onCircle(C, R, (i / 96) * TAU), 0.12])
  const trail = () => {
    const L = lapAt(t())
    if (!L) return null
    const n = Math.max(2, Math.ceil(L.U / 0.07))
    const wiggly = t() >= LAP2[0]
    return Array.from({ length: n + 1 }, (_, i) => {
      const U = (L.U * i) / n
      return [...onCircle(C, R + (wiggly ? wig(U / TAU) : 0), START + U), 0.2]
    })
  }
  const lifted = () => {
    const L = lapAt(t())
    if (!L) return null
    const n = Math.max(2, Math.ceil(L.U / 0.07))
    const wiggly = t() >= LAP2[0]
    return Array.from({ length: n + 1 }, (_, i) => {
      const U = (L.U * i) / n
      return helixAt(START + U, wiggly ? wig(U / TAU) * 0.45 : 0)
    })
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-4.4, 0, 1.2], rotY: 1.2, walk: 0, bow: 0, gesture: (tt > 8.4 && tt < 12.6) || (tt > 20.8 && tt < 24) ? 0.8 : 0, talk: (tt > 8.4 && tt < 12.6) || (tt > 20.8 && tt < 27.8) ? 1 : 0 }
  }
  const gyro = () => {
    const tt = t()
    const L = lapAt(tt)
    if (L) {
      const [x, z] = onCircle(C, R + L.dr, START + L.U)
      const [ax, az] = onCircle(C, R + L.dr, START + L.U + 0.08)
      const moving = (tt < LAP1[1] || (tt >= LAP2[0] && tt < LAP2[1])) && tt > LAP1[0]
      return { pos: [x, 0, z], rotY: Math.atan2(ax - x, az - z), run: moving ? 0.95 : 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    const [x, z] = tt >= 24 ? onCircle(C, 1.6, -0.4) : onCircle(C, R, START)
    return { pos: [x, 0, z + (tt < 8 ? 0.6 * (1 - seg(tt, 5, 8)) : 0)], rotY: tt >= 24 ? Math.PI : Math.PI / 2, run: 0, cast: 0, whip: tt > 26.6 && tt < 27.6 ? seg(tt, 26.6, 27.6) : 0, loop: 0, loopDrop: 0 }
  }
  const floorPts = Array.from({ length: HELIX_TURNS * 2 + 1 }, (_, i) => helixAt(START + (i - HELIX_TURNS) * TAU))
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 26, 60]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#9ab8ff', '#0a0a14', 0.5]} />
      <directionalLight position={[-8, 18, 6]} intensity={1.0} color="#cfe0ff" />
      <Stars radius={70} depth={30} count={900} factor={2.2} fade speed={0.2} />
      <Sparkles count={90} scale={[22, 8, 22]} position={[0, 3.5, 0]} size={2} color="#ffe2a0" />
      <Seascape y={-0.9} depth={2.2} area={[0, 0, 56, 56]} seed={303} palette={{ water: '#0e2848', sand: '#3a4458', weed: '#2a4a6a' }} lanterns={10} />
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[5.4, 5.1, 0.6, 56]} />
        <meshStandardMaterial color="#1e1c2a" roughness={0.88} />
      </mesh>
      <LiveLine getPts={ring} color="#ffb347" width={4} />
      <mesh>
        <tubeGeometry args={[tube, 260, 0.06, 8, false]} />
        <meshStandardMaterial color="#6a5a90" emissive="#8060d0" emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
      </mesh>
      {floorPts.map(([x, z, y], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[i === HELIX_TURNS ? 0.12 : 0.09, 10, 8]} />
          <meshBasicMaterial color={i === HELIX_TURNS ? '#ffffff' : '#ffcf6a'} toneMapped={false} />
        </mesh>
      ))}
      <LiveLine getPts={trail} color="#fff2c4" width={7} />
      <LiveLine getPts={lifted} color="#5ee0d8" width={6} y={0} />
      <mesh ref={shadow}>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <mesh position={[C[0], 0.1, C[1]]}>
        <cylinderGeometry args={[0.85, 0.9, 0.2, 24]} />
        <meshStandardMaterial color="#2a3544" emissive="#ffb347" emissiveIntensity={0.3} />
      </mesh>
      <group ref={winG}>
        {winders.map((w, i) => (
          <WinderSpawn key={i} e={w} />
        ))}
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
