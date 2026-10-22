import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { ShardSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Throne } from '../../levels/w0/CastleScene'
import SphereCitadel, { CAP_H, Delta, SPH_R, TOP } from './DeltaSet'
import { Causeway, PORTAL_Z, Portal } from './Causeway'
import { Flash, ShotCamera, SphereLoop, mix, seg, smooth } from './fx'
import { NULL_AT, PANELS } from './stagesCastle1'

/**
 * Intro movie for World 1 · Castle, "The Delta Sphere" (castle1_videos.json castle-1-intro):
 *   A 0–7     out of the Warp Portal at the Delta's edge; Null's sphere stands in the water,
 *             loops crawling over it and shrinking to points
 *   B 7–13    Gyroid sprints the causeway; Emmy stays at the portal
 *   C 13–19   the meridian lift carries him up the sphere's curve to the court
 *   D 19–28   the court on the flattened pole: Null before his throne, the Crown overhead
 *   E 28–33.6 three sigils light; Crown shards orbit; "Not this time."
 *   F 33.6–38 title card
 */

const S = 0.7
const CY = TOP - CAP_H // the sphere's centre height
/** The meridian lift's rail: up the sphere's near (+z) side, 1.2 out from its curve. */
const railAt = (k) => {
  const y = mix(0.3, TOP, k)
  return [0, y, Math.sqrt(Math.max(0, SPH_R * SPH_R - (y - CY) ** 2)) + 1.2]
}
const LIFT_START = railAt(0)[2]
const climb = (t) => smooth(seg(t, 13, 19))

const SHOTS = [
  [0, 7, [[4.2, 2.6, PORTAL_Z + 5.5], [0, 5, 0]], [[3.0, 2.0, PORTAL_Z + 3.6], [0, 7, 0]]],
  [7, 13, (t) => {
    const z = gyroZ(t)
    const k = smooth(seg(t, 9.5, 13))
    return [[3.0 + k * 5, 1.5 + k * 1.5, z + 3.2 + k * 5], [0, 1.0 + k * 1.2, z - 7 + k * 5]]
  }],
  [13, 19, (t) => {
    const [, y, z] = railAt(climb(t))
    return [[10, y + 2.5, z + 8], [0, y + 0.6, z - 1]]
  }],
  [19, 21.6, [[1.4, TOP + 4.6, 16], [0, TOP - 0.4, 6]], [[0.9, TOP + 4.2, 12.6], [0, TOP, 2]]],
  [21.6, 28, [[0, TOP + 3.6, 4.6], [NULL_AT[0], TOP + 2.7, NULL_AT[1]]], [[1.2, TOP + 3.2, 0.8], [NULL_AT[0], TOP + 2.9, NULL_AT[1]]]],
  [28, 33.6, [[0, TOP + 7, 13], [0, TOP + 1.5, -3]], [[0, TOP + 7.6, 14.2], [0, TOP + 1.6, -3]]],
  [33.6, 40, [[-28, 16, 42], [0, 13, 0]], [[-32, 19, 48], [0, 14, 0]]],
]
function gyroZ(t) {
  return mix(PORTAL_Z - 1.5, LIFT_START + 0.2, smooth(seg(t, 7, 12.8)))
}

/** Loops crawling over the sphere and shrinking to points, staggered round its flank. */
const CRAWL = [0, 1, 2, 3, 4, 5].map((i) => {
  const ph = Math.PI / 2 + (i - 2.5) * 0.45
  const th = 1.45 + (i % 2) * 0.35
  return { dir: [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)], off: i * 1.3 }
})

export default function SphereIntro({ tRef }) {
  const sigils = useRef()
  const shardG = useRef()
  const gyroG = useRef()
  const lift = useRef()
  const shards = useMemo(() => [0, 1, 2, 3, 4].map((i) => ({ x: 0, z: 0, seed: i, alive: true, dying: 0, face: 0, flash: 0 })), [])
  useFrame(() => {
    const t = tRef.current
    sigils.current.children.forEach((m, i) => {
      const k = seg(t, 28.2 + i * 0.5, 29 + i * 0.5)
      m.visible = k > 0
      m.material.opacity = k
    })
    shardG.current.visible = t > 29.6
    shards.forEach((e, i) => {
      const a = t * 1.4 + (i / 5) * Math.PI * 2
      e.x = NULL_AT[0] + Math.cos(a) * 2.6
      e.z = NULL_AT[1] + Math.sin(a) * 2.6
      e.face = a
    })
    gyroG.current.visible = t > 0.75
    const [, ly, lz] = railAt(climb(t))
    lift.current.position.set(0, ly - 0.08, lz)
  })
  const gyroScript = () => {
    const t = tRef.current
    if (t < 7) return { pos: [0.7 / S, 0, (PORTAL_Z - 1.5) / S], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    if (t < 13) {
      const k = seg(t, 7, 12.8)
      return { pos: [mix(0.7, 0, k) / S, 0, gyroZ(t) / S], rotY: Math.PI, run: k > 0 && k < 1 ? 1 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    if (t < 19) {
      const [, y, z] = railAt(climb(t))
      return { pos: [0, y / S, z / S], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    // off the lift, onto the court, up to the sigils
    const k = smooth(seg(t, 19, 21.6))
    return { pos: [0, TOP / S, mix(railAt(1)[2], 4.2, k) / S], rotY: Math.PI, run: k > 0 && k < 1 ? 0.8 : 0, cast: t > 31.2 ? 0.7 : 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    return { pos: [-0.8 / S, 0, (PORTAL_Z - 1.2) / S], rotY: Math.PI, walk: 0, bow: 0, gesture: t > 7.2 && t < 11.6 ? 0.9 : 0, talk: t > 7.4 && t < 11.4 ? 1 : 0 }
  }
  const nullScript = () => {
    const t = tRef.current
    return { gesture: (t > 21.8 && t < 28) || t > 28.4 ? 1 : 0.2, crown: 0.5 + seg(t, 28, 29) * 0.5, crownY: 0 }
  }
  const crawl = (c) => (t) => {
    const u = ((t + c.off) % 7.8) / 7.8
    if (t > 19) return null
    return { dir: c.dir, center: [0, CY, 0], beta: 0.38 * (1 - smooth(seg(u, 0.1, 0.85))) }
  }
  // the rail: a golden meridian arc up the sphere's near side
  const rail = useMemo(() => {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const [x, y, z] = railAt(i / 59)
      return new THREE.Vector3(x + 0.6, y - 0.1, z)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.07, 6, false)
  }, [])
  const rail2 = useMemo(() => rail.clone().translate(-1.2, 0, 0), [rail])
  return (
    <>
      <Delta y={0} />
      <group position={[0, TOP, 0]}>
        <SphereCitadel armillary={false} />
        <Throne />
        <group position={[NULL_AT[0], 0.3, NULL_AT[1]]} scale={0.8}>
          <CountNull script={nullScript} />
        </group>
        <group ref={sigils} position={[0, 0.06, 0]}>
          {PANELS.map((p, i) => (
            <mesh key={i} position={[p[0], 0, p[1]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 2.0, 6]} />
              <meshBasicMaterial color="#b070ff" transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        <group ref={shardG} position={[0, 1.2, 0]}>
          {shards.map((e, i) => (
            <ShardSpawn key={i} e={e} />
          ))}
        </group>
        <pointLight position={[NULL_AT[0], 5, NULL_AT[1]]} intensity={30} distance={22} color="#a259ff" />
        <pointLight position={[0, 6, 4]} intensity={12} distance={20} color="#ffd8a0" />
      </group>
      {CRAWL.map((c, i) => (
        <SphereLoop key={i} tRef={tRef} get={crawl(c)} />
      ))}
      <Causeway from={PORTAL_Z + 1} to={LIFT_START - 0.4} />
      <Portal tRef={tRef} />
      <Flash tRef={tRef} position={[0, 1.6, PORTAL_Z]} flash={(t) => seg(t, 0.4, 1.3)} size={10} color="#c8f0ff" />
      {/* the meridian lift */}
      <mesh geometry={rail}>
        <meshStandardMaterial color="#ffd27a" emissive="#ff9a3a" emissiveIntensity={0.9} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh geometry={rail2}>
        <meshStandardMaterial color="#ffd27a" emissive="#ff9a3a" emissiveIntensity={0.9} metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={lift}>
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.14, 32]} />
          <meshStandardMaterial color="#2a2238" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.86, 40]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
      </group>
      <group ref={gyroG} scale={S}>
        <Gyroid script={gyroScript} />
      </group>
      <group scale={S}>
        <Emmy script={emmyScript} />
      </group>
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
