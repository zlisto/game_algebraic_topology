import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { ShardSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import Commutator from './Commutator'
import StationSet from './StationSet'
import { BOSS_AT, PANELS } from './stages'

/**
 * Intro movie for World 3 · Castle, "The Counterfeit Station" (scripts.json castle-3-intro-v2):
 *   A 0–7    Gyroid and Emmy sprint the viaduct toward the station; trains of light streak past
 *   B 7–13   the departure boards: every one reads like a torus
 *   C 13–21  the cloaked station master on the dais throws off his cloak: the Commutator
 *   D 21–30  the Crown blazes, Null speaks through it; three sigils light, shards orbit
 *   E 30–34  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

// Gyroid's run: down the viaduct (A), across the boards (B), onto the concourse (C)
const gyroZ = (t) => (t < 7 ? mix(36, 13, seg(t, 0, 7)) : t < 13 ? mix(13, 4.8, smooth(seg(t, 7, 13))) : mix(4.8, 3.3, smooth(seg(t, 13, 15))))
const emmyZ = (t) => gyroZ(t) + 0.3

const SHOTS = [
  [0, 7, null, null], // A: follows the runners (below)
  [7, 13, [[-4.2, 3.4, -3.5], [-9.4, 4.2, -10]], [[-5.8, 4.6, -6.6], [-9.4, 4.4, -10]]], // the board, close, through Emmy's line
  [13, 17.5, [[1.9, 2.3, 7.6], [0, 1.9, -7.3]], [[1.6, 2.0, 5.6], [0, 2.1, -7.3]]], // over Gyroid's shoulder to the dais
  [17.5, 21, [[0.9, 2.3, -3.2], [0, 1.9, -7.3]], [[0.5, 2.1, -4.2], [0, 2.0, -7.3]]], // the cloak comes off
  [21, 25.4, [[0.4, 1.0, -2.2], [0, 5.2, -7.3]], [[0.2, 1.2, -3.0], [0, 5.4, -7.3]]], // up at the Crown
  [25.4, 26.2, [[0, 14.5, 12.5], [0, 0, -2.2]], [[0, 15, 13], [0, 0, -2.4]]], // the sigils, from above
  [26.2, 27.8, [[-1.4, 1.35, 1.2], [-1.1, 1.0, 3.6]], [[-1.3, 1.3, 1.5], [-1.1, 1.0, 3.6]]], // Emmy: we multiply
  [27.8, 30, [[0.9, 1.3, 1.0], [0.5, 0.95, 3.3]], [[0.8, 1.25, 1.3], [0.5, 0.95, 3.3]]], // Gyroid: then let's see
  [30, 40, [[0, 6, 17], [0, 4.5, -9]], [[0, 7.5, 20], [0, 5, -9]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    if (!sh[2]) {
      const z = gyroZ(t)
      // well behind and above the two runners, so they ride in the upper two-thirds, clear of the caption
      camera.position.set(0.9 + Math.sin(t * 0.6) * 0.3, 2.6, z + 7)
      look.set(-0.3, 0.05, z - 5)
    } else {
      const k = smooth(seg(t, sh[0], sh[1]))
      camera.position.set(...mix3(sh[2][0], sh[3][0], k))
      look.set(...mix3(sh[2][1], sh[3][1], k))
    }
    // the Crown blazing: a tremor
    const shake = seg(t, 21.3, 21.6) * (1 - seg(t, 21.6, 23)) * 0.12
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0))
    camera.lookAt(look)
  })
  return null
}

export default function IntroMovie({ tRef }) {
  const sigils = useRef()
  const shardG = useRef()
  const crownGlow = useRef(0.4)
  const shards = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => ({ x: 0, z: 0, seed: i, alive: true, dying: 0, face: 0, flash: 0 })), [])
  useFrame(() => {
    const t = tRef.current
    crownGlow.current = t < 21.2 ? 0.4 : 0.4 + 1.6 * seg(t, 21.2, 21.8)
    sigils.current.children.forEach((m, i) => {
      const k = seg(t, 24.8 + i * 0.35, 25.5 + i * 0.35)
      m.visible = k > 0
      m.material.opacity = k
      m.rotation.z = t * 0.4 * (i % 2 ? 1 : -1)
    })
    shardG.current.visible = t > 26
    shards.forEach((e, i) => {
      const a = t * 1.4 + (i / shards.length) * Math.PI * 2
      e.x = BOSS_AT[0] + Math.cos(a) * 2.8
      e.z = BOSS_AT[1] + Math.sin(a) * 2.8
      e.face = a
    })
  })
  const gyroScript = () => {
    const t = tRef.current
    const z = gyroZ(t)
    const moving = t < 13 || (t < 15 && t > 13)
    return { pos: [0.5 / S, 0, z / S], rotY: Math.PI, run: moving ? 1 : 0, cast: t > 27.8 ? 0.8 : 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    const z = emmyZ(t)
    const moving = t < 15
    const talk = (t > 7.2 && t < 12.8) || (t > 25.6 && t < 27.6)
    return { pos: [-1.1 / S, 0, z / S], rotY: Math.PI, walk: moving ? 1 : 0, bow: 0, gesture: talk ? 0.8 : 0, talk: talk ? 1 : 0 }
  }
  const bossScript = () => {
    const t = tRef.current
    return {
      cloak: 1 - smooth(seg(t, 17.4, 18.4)),
      gesture: t > 13.4 && t < 17.4 ? 0.7 : t > 18.2 && t < 21 ? 1 : 0.2,
      talk: t > 13.4 && t < 17.4 ? 1 : 0,
      crack: 0,
      kneel: 0,
      loops: t < 17.6 ? 0.2 : seg(t, 17.6, 18.6),
    }
  }
  return (
    <>
      <StationSet crownGlow={crownGlow} />
      <group position={[BOSS_AT[0], 0.35, BOSS_AT[1]]} scale={0.95}>
        <Commutator script={bossScript} />
      </group>
      {/* the board's counts, legible for the close shot */}
      <Html position={[-9.4, 4.75, -9.75]} center transform rotation={[0, 0.5, 0]} scale={0.32} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="deck-tag" style={{ fontSize: '1.3rem', padding: '0.4rem 0.8rem', color: '#ffd27a', borderColor: '#ffd27a', background: 'rgba(10,8,18,0.92)', whiteSpace: 'nowrap' }}>
          PLATFORM T · H⁰ ℤ · H¹ ℤ² · H² ℤ
        </div>
      </Html>
      <group ref={sigils} position={[0, 0.08, 0]}>
        {PANELS.map((p, i) => (
          <mesh key={i} position={[p[0], 0, p[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.0, 8]} />
            <meshBasicMaterial color="#b070ff" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <group ref={shardG} position={[0, 1.4, 0]}>
        {shards.map((e, i) => (
          <ShardSpawn key={i} e={e} />
        ))}
      </group>
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}
