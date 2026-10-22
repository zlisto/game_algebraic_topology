import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { ShardSpawn } from '../../characters/Spawn'
import { Throne } from '../../levels/w0/CastleScene'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { DeltaHall, Retractor } from './Castle2Scene'
import { NULL_AT, PANELS } from './stagesCastle2'

/**
 * Intro movie for World 2 · Castle, "The Retractor" (videos2.js INTRO_VIDEO):
 *   A 0–6    aerial over the night Delta: the Retractor straining at its chains
 *   B 6–13   Gyroid runs the triangle causeway; each tile lights gold behind him; Emmy at its foot
 *   C 13–21  into the hall: the ball pulses, the gears turn; Null under the Crown
 *   D 21–29  three triangle sigils light on the floor; Crown shards orbit; Gyroid readies the Lash
 *   E 29–33  title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const CAUSE_Z = [8.8, 34]
const GYRO_Z = (t) => (t < 6 ? 32.6 : t < 13 ? mix(32.6, 9.6, smooth(seg(t, 6, 13)) * 0.15 + seg(t, 6, 13) * 0.85) : mix(9.6, 4.4, smooth(seg(t, 13, 15.4))))

const SHOTS = [
  [0, 6, [[26, 18, 40], [0, 4, -8]], [[15, 13, 31], [0, 5, -11]]],
  [6, 13, null, null], // tracking Gyroid down the causeway (below)
  [13, 17.4, [[1.8, 1.0, 7.6], [0, 3.0, -10]], [[1.2, 1.1, 4.8], [0, 3.2, -10]]],
  [17.4, 21, [[0.9, 2.5, -3.6], [NULL_AT[0], 2.1, NULL_AT[1]]], [[0.6, 2.4, -4.2], [NULL_AT[0], 2.2, NULL_AT[1]]]],
  [21, 25, [[0, 12.5, 10], [0, 0.5, -2.8]], [[0, 13.5, 11], [0, 0.5, -3.2]]],
  [25, 29, [[1.5, 1.5, 8.2], [0, 1.7, -7.3]], [[1.2, 1.45, 7.8], [0, 1.7, -7.3]]],
  [29, 40, [[0, 9, 21], [0, 5, -10]], [[0, 11, 27], [0, 5, -10]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    if (!sh[2]) {
      const z = GYRO_Z(t)
      const k = seg(t, 6, 13)
      camera.position.set(mix(3.2, 2.0, k), 2.0, z + 9)
      look.set(0, 1.0, z - 8)
    } else {
      const k = smooth(seg(t, sh[0], sh[1]))
      camera.position.set(...mix3(sh[2][0], sh[3][0], k))
      look.set(...mix3(sh[2][1], sh[3][1], k))
    }
    // the engine's heartbeat shakes the hall as he arrives
    const shake = t > 13 && t < 21 ? 0.025 * (0.5 + 0.5 * Math.sin(t * 9)) : 0
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0))
    camera.lookAt(look)
  })
  return null
}

/** The causeway of triangle tiles across the water; each lights gold once Gyroid has run over it. */
function Causeway({ tRef }) {
  const tiles = useMemo(() => {
    const out = []
    const side = 0.9
    const h = (side * Math.sqrt(3)) / 2
    for (let row = 0; CAUSE_Z[0] + row * h < CAUSE_Z[1]; row++)
      for (let col = -3; col <= 3; col++) {
        const up = (row + col) % 2 === 0
        const x = (col * side) / 2
        out.push([x, CAUSE_Z[0] + row * h + (up ? h / 3 : (2 * h) / 3), up ? 0 : Math.PI])
      }
    return out
  }, [])
  const g = useRef()
  useFrame(() => {
    const gz = GYRO_Z(tRef.current)
    g.current.children.forEach((m, i) => {
      const z = tiles[i][1]
      const lit = z > gz - 0.4 && tRef.current > 6 ? 1 : 0
      m.material.emissiveIntensity += ((lit ? 1.6 : 0.15) - m.material.emissiveIntensity) * 0.12
    })
  })
  return (
    <>
      <mesh position={[0, -0.45, (CAUSE_Z[0] + CAUSE_Z[1]) / 2]}>
        <boxGeometry args={[3.4, 0.7, CAUSE_Z[1] - CAUSE_Z[0]]} />
        <meshStandardMaterial color="#c9902a" emissive="#c9902a" emissiveIntensity={0.5} />
      </mesh>
      <group ref={g}>
        {tiles.map(([x, z, rot], i) => (
          <mesh key={i} position={[x, -0.04, z]} rotation={[0, rot + Math.PI / 6, 0]}>
            <cylinderGeometry args={[0.47, 0.47, 0.08, 3]} />
            <meshStandardMaterial color="#1a1c34" roughness={0.35} metalness={0.45} emissive="#ffb347" emissiveIntensity={0.15} />
          </mesh>
        ))}
      </group>
      {/* the bridgehead where Emmy waits */}
      <mesh position={[0, -0.35, CAUSE_Z[1] + 1.6]}>
        <cylinderGeometry args={[2.6, 2.8, 0.6, 3]} />
        <meshStandardMaterial color="#1c2040" roughness={0.6} />
      </mesh>
    </>
  )
}

export default function Castle2Intro({ tRef }) {
  const sigils = useRef()
  const shardG = useRef()
  const engine = useRef({ squeeze: 0.35, seized: false })
  const shards = useMemo(() => [0, 1, 2, 3, 4].map((i) => ({ x: 0, z: 0, seed: i, alive: true, dying: 0, face: 0, flash: 0 })), [])
  useFrame(() => {
    const t = tRef.current
    engine.current.squeeze = t < 13 ? 0.5 : 0.5 + seg(t, 17.6, 21) * 0.45
    sigils.current.children.forEach((m, i) => {
      const k = seg(t, 21.8 + i * 0.5, 22.6 + i * 0.5)
      m.visible = k > 0
      m.material.opacity = k
      m.rotation.z = t * 0.4 * (i % 2 ? 1 : -1)
    })
    shardG.current.visible = t > 23
    shards.forEach((e, i) => {
      const a = t * 1.4 + (i / 5) * Math.PI * 2
      e.x = NULL_AT[0] + Math.cos(a) * 2.6
      e.z = NULL_AT[1] + Math.sin(a) * 2.6
      e.face = a
    })
  })
  const gyroScript = () => {
    const t = tRef.current
    const z = GYRO_Z(t)
    const running = (t > 6 && t < 13) || (t > 13 && t < 15.4)
    return { pos: [0.1 / S, 0, z / S], rotY: Math.PI, run: running ? 1 : 0, cast: t > 25 ? 0.8 : 0, whip: t > 27.4 && t < 28.4 ? seg(t, 27.4, 28.4) : 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    return { pos: [1.1 / S, 0, 33.4 / S], rotY: t < 6 ? -0.6 : Math.PI, walk: 0, bow: 0, gesture: t > 6.2 && t < 10 ? 0.8 : 0, talk: t > 6.4 && t < 9.9 ? 1 : 0 }
  }
  const nullScript = () => {
    const t = tRef.current
    return { gesture: (t > 14 && t < 21) || t > 21.6 ? 1 : 0.2, crown: 0.5 + seg(t, 21.6, 22.6) * 0.5, crownY: 0 }
  }
  return (
    <>
      <DeltaHall />
      <Retractor stateRef={engine} />
      <Throne />
      <Causeway tRef={tRef} />
      <group position={[NULL_AT[0], 0.3, NULL_AT[1]]} scale={0.8}>
        <CountNull script={nullScript} />
      </group>
      <group ref={sigils} position={[0, 0.08, 0]}>
        {PANELS.map((p, i) => (
          <mesh key={i} position={[p[0], 0, p[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.4, 2.0, 3]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <group ref={shardG} position={[0, 1.2, 0]}>
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
        <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
