import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import Seascape from '../../world/Seascape'
import CoverGraph, { liftAt } from './CoverGraph'
import { COVER_AA, During, TreeLines, VERTS_AA } from './SheetMusicLesson'

/**
 * Intro movie for World 1 · Level 9, "Sheet Music" (videos.json level-1-9-intro):
 *   A 0–8    the Sheet Stacks: a figure-eight, and a two-sheeted cover built to order above it
 *   B 8–15   Gyroid runs a twice; his lift opens, then closes
 *   C 15–24  the endless tree grows over the deck — nothing closes there
 *   D 24–26  the plane's grid spreads out
 *   E 26–30  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const TRACKS = [makeTrack({ angle: Math.PI, length: 3.6 }, [0, 0]), makeTrack({ angle: 0, length: 3.6 }, [0, 0])]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.0 }] } }
const NO_PROGRESS = { current: null }
const LAPS = [8.6, 14.4]

const SHOTS = [
  [0, 8, [[8, 13, 13], [0, 1.4, 0]], [[1.6, 11.8, 10.8], [0.6, 1.4, 0]]],
  [8, 15, [[1.2, 11.6, 10.6], [0.6, 1.4, 0]], [[1.0, 11.8, 10.8], [0.6, 1.4, 0]]],
  [15, 24, [[0.6, 13.0, 9.6], [0, 2.4, -1.2]], [[0.4, 13.6, 10.0], [0, 2.4, -1.2]]],
  [24, 26, [[0.4, 13.6, 10.0], [0, 2.4, -1.2]], [[0.2, 14.0, 10.4], [0, 2.4, -1.2]]],
  [26, 40, [[0, 13, 13], [0, 1.4, 0]], [[0, 15, 16], [0, 1.4, 0]]],
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

const GRID = (() => {
  const out = []
  for (let i = -4; i <= 4; i++) {
    out.push([
      [i * 1.4, -1.2 - 5.6, 3.2],
      [i * 1.4, -1.2 + 5.6, 3.2],
    ])
    out.push([
      [-5.6, -1.2 + i * 1.4, 3.2],
      [5.6, -1.2 + i * 1.4, 3.2],
    ])
  }
  return out
})()

export default function SheetMusicMovie({ tRef }) {
  const lift = useRef()
  useFrame(() => {
    const t = tRef.current
    const on = t >= LAPS[0] && t < LAPS[1] + 0.6
    lift.current.visible = on
    if (on) lift.current.position.set(...liftAt(COVER_AA, VERTS_AA, 0, [[0, 1], [0, 1]], 2 * smooth(seg(t, LAPS[0], LAPS[1]))).pos)
  })
  const t = () => tRef.current
  const gyro = () => {
    const tt = t()
    if (tt >= LAPS[0] && tt < LAPS[1]) {
      const p = 2 * seg(tt, LAPS[0], LAPS[1])
      const u = smooth(p % 1)
      const q = TRACKS[0].at(u)
      const n = TRACKS[0].at(Math.min(1, u + 0.03))
      return { pos: [q[0], 0, q[1]], rotY: Math.atan2(n[0] - q[0], n[1] - q[1]), run: 0.95, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [0.4, 0, 1.4], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const tt = t()
    return { pos: [-3.2, 0, 2.4], rotY: 0.7, walk: 0, bow: 0, gesture: tt > 0.6 && tt < 5 ? 0.8 : 0, talk: (tt > 0.6 && tt < 5) || (tt > 15.4 && tt < 20) || (tt > 24.2 && tt < 26) ? 1 : 0 }
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
      <Seascape y={-1.6} depth={2.4} area={[0, 0, 50, 50]} seed={99} palette={{ water: '#1a3a58', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={8} />
      <Platform site={SITE} lit current />
      {TRACKS.map((tr, i) => (
        <Track key={i} track={tr} edge={{ letter: i, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={i} pos={[0, 0]} />
      ))}
      <During tRef={tRef} when={(tt) => tt < 15}>
        <CoverGraph cover={COVER_AA} verts={VERTS_AA} />
      </During>
      <TreeLines show={() => t() >= 15 && t() < 24} reveal={() => smooth(seg(t(), 15.2, 21))} />
      {GRID.map((pts, i) => (
        <LiveLine key={i} getPts={() => (t() >= 24 && t() < 26.5 ? pts : null)} color="#6080c0" width={2} y={0} />
      ))}
      <mesh ref={lift}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
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
