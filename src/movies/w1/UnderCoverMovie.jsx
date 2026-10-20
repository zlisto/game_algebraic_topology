import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { LiftlingSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import Seascape from '../../world/Seascape'
import CoverGraph, { liftAt } from './CoverGraph'

/**
 * Intro movie for World 1 · Level 8, "Under Cover" (videos.json level-1-8-intro):
 *   A 0–8    Sheetwater Viaduct: the figure-eight deck, and three sheets hanging above it as a graph
 *   B 8–16   Emmy, stranded up on sheet two, calls down
 *   C 16–26  Gyroid runs the orange petal; his lift (the teal bead) rides the a-edge to another sheet
 *   D 26–30  Liftlings drift down between the sheets
 *   E 30–34  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const TRACKS = [makeTrack({ angle: Math.PI, length: 3.6 }, [0, 0]), makeTrack({ angle: 0, length: 3.6 }, [0, 0])]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.0 }] } }
const NO_PROGRESS = { current: null }
const Y = 3.6
const COVER = { a: [1, 2, 0], b: [1, 0, 2] }
const VERTS = [
  [-2.2, Y, -0.6],
  [0, Y, -2.6],
  [2.2, Y, -0.6],
]
const LAP = [16.6, 21.4]

const SHOTS = [
  [0, 8, [[8, 12, 12], [0, 1.6, 0]], [[1.6, 9.8, 9.4], [0.4, 1.8, 0]]],
  [8, 16, [[1.6, 6.4, 5.4], [0, 3.4, -2.2]], [[1.4, 6.2, 5.0], [0, 3.4, -2.2]]],
  [16, 26, [[0.8, 12.2, 11.0], [0.4, 1.0, 0.4]], [[0.6, 12.4, 11.2], [0.4, 1.0, 0.4]]],
  [26, 30, [[2.4, 5.6, 6.6], [0.6, 2.4, -0.8]], [[2.2, 5.4, 6.2], [0.6, 2.4, -0.8]]],
  [30, 40, [[0, 10, 12], [0, 1.6, 0]], [[0, 12, 15], [0, 1.6, 0]]],
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

function During({ tRef, when, children }) {
  const [on, setOn] = useState(false)
  useFrame(() => {
    const w = when(tRef.current)
    if (w !== on) setOn(w)
  })
  return on ? children : null
}

export default function UnderCoverMovie({ tRef }) {
  const lift = useRef()
  const lings = useMemo(() => [0, 1].map((i) => ({ x: -1 + i * 2.4, z: -1.8 + i * 0.6, seed: i * 1.3, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const lingG = useRef()
  useFrame(() => {
    const t = tRef.current
    const on = t >= LAP[0] - 0.4 && t < 30
    lift.current.visible = on
    if (on) {
      const p = smooth(seg(t, LAP[0], LAP[1]))
      lift.current.position.set(...liftAt(COVER, VERTS, 0, [[0, 1]], p).pos)
    }
    lingG.current.visible = t >= 26
    lingG.current.position.y = mix(4.5, 0, smooth(seg(t, 26, 28)))
  })
  const gyro = () => {
    const t = tRef.current
    if (t >= LAP[0] && t < LAP[1] + 0.3) {
      const u = smooth(seg(t, LAP[0], LAP[1]))
      const q = TRACKS[0].at(u)
      const n = TRACKS[0].at(Math.min(1, u + 0.03))
      return { pos: [q[0], 0, q[1]], rotY: Math.atan2(n[0] - q[0], n[1] - q[1]), run: u < 1 ? 0.95 : 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [0.4, 0, 1.4], rotY: t < 16 ? Math.PI : Math.PI + 0.4, run: 0, cast: 0, whip: t > 28.4 && t < 29.4 ? seg(t, 28.4, 29.4) : 0, loop: 0, loopDrop: 0 }
  }
  // Emmy stands on sheet two, up in the graph
  const emmy = () => {
    const t = tRef.current
    return { pos: [VERTS[1][0], VERTS[1][1] - 0.2, VERTS[1][2] - 0.4], rotY: 0, walk: 0, bow: 0, gesture: t > 8.4 && t < 13 ? 0.9 : 0, talk: (t > 8.4 && t < 13) || (t > 20.8 && t < 26) ? 1 : 0 }
  }
  return (
    <>
      <color attach="background" args={['#0a1424']} />
      <fog attach="fog" args={['#0a1424', 28, 72]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a8d8ff', '#0c0a18', 0.55]} />
      <directionalLight position={[10, 14, 8]} intensity={0.95} color="#c8e8ff" />
      <Stars radius={90} depth={40} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={90} scale={[30, 6, 30]} position={[0, 3, -2]} size={2.2} speed={0.25} color="#a8e0ff" />
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={88} palette={{ water: '#1a3a58', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <Platform site={SITE} lit current />
      {TRACKS.map((tr, i) => (
        <Track key={i} track={tr} edge={{ letter: i, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={i} pos={[0, 0]} />
      ))}
      <During tRef={tRef} when={(t) => t < 30}>
        <CoverGraph cover={COVER} verts={VERTS} />
      </During>
      <mesh ref={lift}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <group ref={lingG}>
        {lings.map((e, i) => (
          <LiftlingSpawn key={i} e={e} />
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
