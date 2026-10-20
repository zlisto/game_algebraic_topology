import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { PatrolSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Platform, Track } from '../../levels/w0/FoundryScene'
import { makeTrack } from '../../levels/w0/cells'
import Seascape from '../../world/Seascape'

/**
 * Intro movie for World 1 · Level 6, "Free Word Play" (videos.json level-1-6-intro):
 *   A 0–8    the Free-Word Forge: a figure-eight of two petals round an amber beacon
 *   B 8–16   Gyroid runs the orange petal (a), then runs it backwards (a⁻¹) — the two cancel
 *   C 16–24  the Commutator's ribbon patrol marches a, b, a⁻¹, b⁻¹ — nothing cancels
 *   D 24–28  the patrol turns on Gyroid; he readies the Lash
 *   E 28–32  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const TRACKS = [makeTrack({ angle: Math.PI, length: 4.2 }, [0, 0]), makeTrack({ angle: 0, length: 4.2 }, [0, 0])]
const SITE = { pos: [0, 0], def: { add: [{ type: 'circle', cx: 0, cz: 0, r: 5.6 }] } }
const NO_PROGRESS = { current: null }

const SHOTS = [
  [0, 8, [[8, 12, 12], [0, 0, 0]], [[1.6, 9.6, 8.6], [0.6, 0, 0.2]]],
  [8, 16, [[-1.6, 8.4, 7.4], [-1.6, 0, 0]], [[-1.4, 8.2, 7.2], [-1.4, 0, 0]]],
  [16, 24, [[1.4, 10.4, 8.8], [0.8, 0, 0]], [[1.2, 10.6, 9.0], [0.8, 0, 0]]],
  [24, 28, [[0.4, 3.6, 5.6], [0.4, 0.8, 0]], [[0.4, 3.4, 5.2], [0.4, 0.8, 0]]],
  [28, 40, [[0, 11, 12], [0, 0, 0]], [[0, 13, 15], [0, 0, 0]]],
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

/** Gyroid's lap at story time t: [track, u] or null. */
function gyroLap(t) {
  if (t >= 8.6 && t < 12) return [0, smooth(seg(t, 8.6, 11.8))]
  if (t >= 12.2 && t < 15.6) return [0, 1 - smooth(seg(t, 12.2, 15.4))]
  return null
}

export default function FreeWordMovie({ tRef }) {
  const patrol = useMemo(() => ({ x: 0, z: 0, seed: 0.4, alive: true, dying: 0, face: 0, flash: 0, hp: 4, maxHp: 4 }), [])
  const patrolG = useRef()
  useFrame(() => {
    const t = tRef.current
    patrolG.current.visible = t >= 16
    if (t < 16) return
    if (t < 24) {
      const letters = [[0, 1], [1, 1], [0, -1], [1, -1]]
      const per = 2
      const i = Math.min(3, Math.floor((t - 16) / per))
      const u = seg(t - 16 - i * per, 0, per)
      const [k, d] = letters[i]
      const [x, z] = TRACKS[k].at(d > 0 ? u : 1 - u)
      const [x2, z2] = TRACKS[k].at(Math.min(1, Math.max(0, d > 0 ? u + 0.02 : 1 - u - 0.02)))
      patrol.x = x
      patrol.z = z
      patrol.face = Math.atan2(x2 - x, z2 - z)
    } else {
      patrol.x = mix(0, 1.2, smooth(seg(t, 24, 26)))
      patrol.z = mix(0, -0.6, smooth(seg(t, 24, 26)))
      patrol.face = Math.atan2(-1.6 - patrol.x, 2.2 - patrol.z)
    }
  })
  const gyro = () => {
    const t = tRef.current
    const L = gyroLap(t)
    if (L) {
      const [k, u] = L
      const p = TRACKS[k].at(u)
      const fwd = t < 12
      const q = TRACKS[k].at(Math.min(1, Math.max(0, u + (fwd ? 0.03 : -0.03))))
      return { pos: [p[0], 0, p[1]], rotY: Math.atan2(q[0] - p[0], q[1] - p[1]), run: 0.95, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [-1.6, 0, 2.2], rotY: t >= 24 ? Math.atan2(1.2 + 1.6, -0.6 - 2.2) : Math.PI, run: 0, cast: 0, whip: t > 26.6 && t < 27.6 ? seg(t, 26.6, 27.6) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    return { pos: [-3.6, 0, 3.0], rotY: 0.7, walk: 0, bow: 0, gesture: t > 8.4 && t < 12.4 ? 0.8 : 0, talk: (t > 8.4 && t < 12.4) || (t > 20.6 && t < 24) || (t > 24.4 && t < 27.6) ? 1 : 0 }
  }
  return (
    <>
      <color attach="background" args={['#080a12']} />
      <fog attach="fog" args={['#080a12', 24, 58]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#a8b8ff', '#120818', 0.5]} />
      <directionalLight position={[-8, 16, 6]} intensity={0.9} color="#ffe2c4" />
      <Stars radius={80} depth={36} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={120} scale={[24, 5, 24]} position={[0, 2, -2]} size={2.2} speed={0.35} color="#b090ff" />
      <Seascape y={-1.2} depth={2.2} area={[0, 0, 50, 50]} seed={66} lanterns={8} />
      <Platform site={SITE} lit current />
      {TRACKS.map((tr, i) => (
        <Track key={i} track={tr} edge={{ letter: i, dir: 1, torn: false }} progressRef={NO_PROGRESS} trackIdx={i} pos={[0, 0]} />
      ))}
      <group ref={patrolG}>
        <PatrolSpawn e={patrol} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.45} intensity={0.75} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
