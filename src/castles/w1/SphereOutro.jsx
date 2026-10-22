import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import SphereCitadel, { CAP_H, Delta, TOP } from './DeltaSet'
import { Causeway, PORTAL_Z } from './Causeway'
import { Flash, GLOW, ShotCamera, SphereLoop, mix, mix3, seg, smooth } from './fx'

/**
 * Outro movie for World 1 · Castle, "Your Number Reads Zero" (castle1_videos.json castle-1-outro):
 *   A 0–7.6    flung off the citadel: Gyroid lands on the causeway; Emmy runs to him
 *   B 7.6–15   Null raises the whole Delta Sphere up out of the water, lights and all
 *   C 15–26.6  Gyroid throws his winding loop round the sphere: it slides off and shrinks to a
 *              point, twice. The reading: 0 (π₁(S²) = 0)
 *   D 26.6–30  Null, hovering on his ribbon of light, turns the Crown on the sphere
 *   E 30–37.5  the fold: the lights go out, the sphere goes violet, flattens, shrinks to a point;
 *              the point hangs; a flash; a violet whirl on empty water
 *   F 37.5–43  Gyroid's horror; Emmy
 *   G 43–50    Null's taunt — "Your number reads zero, courier" — and he races off into the Delta
 *   H 50–61    dusk on the causeway: a count that sees higher holes. Homology. Down into the Delta.
 *   I 61–67    "World 1 complete"
 */

const S = 0.7
const CY0 = TOP - CAP_H // the sphere's centre, before it rises
const RISE = 9
const G_AT = [0.6, 0, 21.6] // Gyroid on the causeway
const E_FROM = [-0.7, 0, 30]
const E_AT = [-0.8, 0, 22.2]
const NULL_HOVER = [9, 25, 13]
const rise = (t) => RISE * smooth(seg(t, 8.4, 14))
// the fold: corrupt → lights out → flatten → shrink to a point → hang → flash
const fall = (t) => ({
  corrupt: seg(t, 30, 32.2),
  lightsOut: seg(t, 30.4, 33),
  flat: smooth(seg(t, 32.4, 34)),
  shrink: t < 36.3 ? 1 - smooth(seg(t, 34, 35.6)) * 0.985 : 0,
  point: seg(t, 35.2, 35.6),
  flash: seg(t, 36.3, 37.1),
  beam: seg(t, 29.4, 29.9) * (1 - seg(t, 36.0, 36.3)),
})
const center = (t) => [0, CY0 + rise(t), 0]
const nullPos = (t) => {
  // on the court's front rim while the sphere rises, then he steps off onto his ribbon and hovers
  const rim = [0, TOP + rise(t) + 0.3, 8.0]
  if (t < 26.2) return rim
  if (t < 48.6) return mix3(rim, NULL_HOVER, smooth(seg(t, 26.2, 27.4)))
  const k = smooth(seg(t, 48.6, 50.4))
  return [NULL_HOVER[0] + k * 30, NULL_HOVER[1] + k * 8, NULL_HOVER[2] - k * 70]
}

const SHOTS = [
  [0, 7.6, [[2.6, 1.9, 27.6], [0, 1.0, 19]], [[2.1, 1.7, 26.4], [0, 1.0, 19]]],
  [7.6, 10.6, [[3.2, 1.6, 40], [0, 11, 0]], [[2.0, 1.3, 46], [0, 16, 0]]],
  // close on Null at the rim as the sphere carries him up
  [10.6, 15, (t) => {
    const y = TOP + rise(t)
    return [[2.4, y + 2.6, 14.6], [0, y + 1.9, 8]]
  }],
  [15, 24.2, [[3.4, 2.2, 31], [0, 15, 0]], [[2.8, 2.0, 30], [0, 16, 0]]],
  [24.2, 26.6, [[-0.8, 1.55, 18.4], [0.6, 1.0, 21.6]], [[-0.7, 1.5, 18.8], [0.6, 1.0, 21.6]]],
  [26.6, 30, [[5.2, 27.4, 20.5], [NULL_HOVER[0], 26.6, NULL_HOVER[2]]], [[5.6, 27.2, 19.8], [NULL_HOVER[0], 26.6, NULL_HOVER[2]]]],
  [30, 37.6, [[-30, 16, 58], [4, 20, 0]], [[-28, 15.5, 55], [4, 20, 0]]],
  [37.6, 40.6, [[-0.8, 1.55, 18.4], [0.6, 1.0, 21.6]], [[-0.7, 1.5, 18.8], [0.6, 1.0, 21.6]]],
  [40.6, 43, [[-0.1, 1.8, 18.6], [-0.1, 0.7, 22]], [[-0.1, 1.7, 19], [-0.1, 0.7, 22]]],
  [43, 48.6, [[6.6, 27.0, 18.4], [NULL_HOVER[0], 26.7, NULL_HOVER[2]]], [[7.0, 26.9, 17.6], [NULL_HOVER[0], 26.7, NULL_HOVER[2]]]],
  [48.6, 50.4, [[3, 9, 32], [NULL_HOVER[0], 22, NULL_HOVER[2]]], [[3, 10, 32], [30, 28, -40]]],
  [50.4, 55, [[0.3, 3.2, 27.5], [0, -4, 14]], [[0.25, 3.0, 26.8], [0, -4, 14]]],
  [55, 61, [[0.0, 1.55, 19.2], [0, 0.6, 22]], [[0.0, 1.5, 19.6], [0, 0.6, 22]]],
  [61, 70, [[0, 7, 40], [0, 3, 0]], [[0, 11, 46], [0, 4, 0]]],
]
const shake = (t) => seg(t, 36.3, 36.5) * (1 - seg(t, 36.5, 37.6)) * 0.6 + seg(t, 37.6, 37.8) * (1 - seg(t, 37.8, 38.8)) * 0.06

/** The Crown's beam from Null to the sphere's heart. */
function CrownBeam({ tRef }) {
  const ref = useRef()
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const k = fall(t).beam
    ref.current.visible = k > 0.01
    if (!ref.current.visible) return
    const [nx, ny, nz] = nullPos(t)
    a.set(nx, ny + 3.0, nz)
    b.set(...center(t))
    const d = b.clone().sub(a)
    ref.current.position.copy(a).add(b).multiplyScalar(0.5)
    ref.current.quaternion.setFromUnitVectors(up, d.clone().normalize())
    const w = k * (0.7 + Math.sin(t * 40) * 0.3)
    ref.current.scale.set(w, d.length(), w)
  })
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.16, 0.45, 1, 12, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/** Water streaming off the sphere as it rises. */
function Streams({ tRef }) {
  const ref = useRef()
  const drops = useMemo(() => Array.from({ length: 160 }, (_, i) => [Math.random() * Math.PI * 2, 6 + Math.random() * 3, Math.random(), i]), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(() => {
    const t = tRef.current
    const on = t > 8.4 && t < 18
    ref.current.visible = on
    if (!on) return
    const [, cy] = center(t)
    drops.forEach(([a, r, k], i) => {
      const u = ((t * 0.9 + k) % 1)
      const top = cy - 10.5
      dummy.position.set(Math.cos(a) * r, top - u * Math.max(0.5, top), Math.sin(a) * r)
      dummy.scale.set(1, 3, 1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, drops.length]}>
      <sphereGeometry args={[0.07, 6, 4]} />
      <meshBasicMaterial color="#bfefff" transparent opacity={0.7} />
    </instancedMesh>
  )
}

/** The whirl left on the water where the sphere was. */
function Scar({ tRef }) {
  const g = useRef()
  const arms = useMemo(
    () =>
      [0, 1, 2, 3].map((j) => {
        const pts = Array.from({ length: 40 }, (_, i) => {
          const u = i / 39
          const a = j * (Math.PI / 2) + u * Math.PI * 1.6
          const r = 0.8 + u * 13
          return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
        })
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.2, 4, false)
      }),
    [],
  )
  useFrame(() => {
    const t = tRef.current
    const k = seg(t, 36.6, 38)
    g.current.visible = k > 0
    g.current.rotation.z = -t * 0.4
    for (const m of g.current.children) m.material.opacity = 0.5 * k * (1 - 0.6 * seg(t, 52, 60))
  })
  return (
    <group ref={g} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {arms.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#9a5cff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

/** The point the sphere became, hanging for a breath before the flash. */
function HangingPoint({ tRef }) {
  const ref = useRef()
  useFrame(() => {
    const t = tRef.current
    const f = fall(t)
    ref.current.visible = f.point > 0 && t < 36.3
    ref.current.position.set(...center(t))
    ref.current.scale.setScalar(1.5 + Math.sin(t * 30) * 0.2)
  })
  return (
    <sprite ref={ref}>
      <spriteMaterial map={GLOW} color="#ffffff" transparent toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

export default function SphereOutro({ tRef }) {
  const fold = useRef()
  const squash = useRef()
  const nullG = useRef()
  const dusk = useRef()
  const sun = useRef()
  const look = () => fall(tRef.current)
  useFrame(() => {
    const t = tRef.current
    const f = fall(t)
    const [, cy] = center(t)
    // fold pivots on the sphere's centre: flatten to a disk, then shrink to a point
    fold.current.position.set(0, cy, 0)
    fold.current.visible = t < 36.3
    fold.current.scale.setScalar(Math.max(0.0001, f.shrink))
    squash.current.scale.set(1 + f.flat * 0.25, Math.max(0.02, 1 - f.flat * 0.92), 1 + f.flat * 0.25)
    const p = nullPos(t)
    nullG.current.position.set(...p)
    nullG.current.visible = t < 50.3
    // he faces the causeway; on his ribbon he faces the sphere
    nullG.current.rotation.y = t > 26.6 && t < 48.6 ? Math.atan2(-p[0], -p[2]) : 0
    dusk.current.intensity = t > 50 ? 2.0 : 0
    sun.current.visible = t > 50
    sun.current.position.y = 4 - seg(t, 50, 61) * 3
  })
  const gyroScript = () => {
    const t = tRef.current
    // A: flung down onto the causeway
    const drop = 1 - smooth(seg(t, 0.4, 1.2))
    const cast = (t > 15.4 && t < 18.5) || (t > 21.2 && t < 23.8) ? 0.9 : 0
    return { pos: [G_AT[0] / S, (drop * 7) / S, G_AT[2] / S], rotY: t > 55 ? Math.PI * 0.92 : Math.PI, run: 0, cast, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    const k = smooth(seg(t, 1.2, 4.2))
    const [x, , z] = mix3(E_FROM, E_AT, k)
    const grief = t > 37.6 && t < 50 ? 1 : 0
    return { pos: [x / S, 0, z / S], rotY: Math.PI + (t > 40.6 && t < 43 ? 0.6 : 0), walk: k > 0 && k < 1 ? 1 : 0, bow: grief && t < 40.6 ? 1 : 0, gesture: (t > 40.6 && t < 43) || t > 50.4 ? 0.7 : 0, talk: (t > 40.6 && t < 43) || (t > 50.4 && t < 54.8) || (t > 58.6 && t < 61) ? 1 : 0 }
  }
  const nullScript = () => {
    const t = tRef.current
    return { gesture: (t > 8.4 && t < 14.5) || (t > 26.6 && t < 36.4) || (t > 43.2 && t < 48.6) ? 1 : 0.3, crown: 1, crownY: 0 }
  }
  // C: the winding loop, thrown round the sphere twice; each time it slides off to a point
  const throwLoop = (t0, dir) => (t) => {
    if (t < t0 || t > t0 + 4.4) return null
    const k = seg(t, t0 + 0.6, t0 + 4.2)
    return { dir, center: center(t), beta: (t < t0 + 0.6 ? seg(t, t0, t0 + 0.6) : 1) * 1.25 * (1 - smooth(k)) }
  }
  const loop1 = useMemo(() => throwLoop(15.4, [0, -0.3, 1]), []) // eslint-disable-line react-hooks/exhaustive-deps
  const loop2 = useMemo(() => throwLoop(21.2, [0.6, -0.5, 0.8]), []) // eslint-disable-line react-hooks/exhaustive-deps
  // G: Null's ribbon as he races away
  const ribbon = () => {
    const t = tRef.current
    if (t < 26 || t > 50.6) return null
    const pts = []
    const k = seg(t, 48.6, 50.4)
    for (let i = 0; i <= 30; i++) {
      const s = i / 30
      const [x, y, z] = nullPos(Math.max(26.2, t - 1.4 + s * 1.4))
      pts.push([x + Math.sin(s * 9 + t * 3) * 0.25 * (1 - k), z, y - 0.1])
    }
    return pts
  }
  return (
    <>
      <Delta y={0} sky="#120a20" />
      <group ref={fold}>
        <group ref={squash}>
          <group position={[0, CAP_H, 0]}>
            <SphereCitadel look={look} armillary={false} />
          </group>
        </group>
      </group>
      <HangingPoint tRef={tRef} />
      <Flash tRef={tRef} position={[0, CY0 + RISE, 0]} flash={(t) => fall(t).flash} size={40} />
      <Flash tRef={tRef} position={[G_AT[0], 1.2, G_AT[2]]} flash={(t) => seg(t, 0.2, 1.1)} size={5} color="#d8b8ff" />
      <Streams tRef={tRef} />
      <Scar tRef={tRef} />
      <SphereLoop tRef={tRef} get={loop1} width={8} />
      <SphereLoop tRef={tRef} get={loop2} width={8} />
      <CrownBeam tRef={tRef} />
      <LiveLine getPts={ribbon} color="#c58bff" width={10} />
      <group ref={nullG} scale={0.8}>
        <CountNull script={nullScript} />
        <pointLight position={[0, 2.2, 1.2]} color="#c8a0ff" intensity={8} distance={7} />
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 32]} />
          <meshBasicMaterial color="#c58bff" transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Causeway from={PORTAL_Z + 1} to={11.5} />
      <mesh ref={sun} position={[-30, 3, -90]}>
        <sphereGeometry args={[7, 32, 20]} />
        <meshBasicMaterial color="#ff9a60" toneMapped={false} />
      </mesh>
      <directionalLight ref={dusk} position={[-30, 6, -40]} color="#ffb08a" intensity={0} />
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <ShotCamera tRef={tRef} shots={SHOTS} shake={shake} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}

/** The reading on Gyroid's winding gauge while he throws his loops (LevelMovie's Overlay). */
export function WindingGauge({ t }) {
  const on = seg(t, 16, 16.6) * (1 - seg(t, 26.4, 27))
  if (on <= 0) return null
  const sliding = (t > 15.4 && t < 19.6) || (t > 21.2 && t < 25.4)
  const settle = Math.sin(t * 9) * (sliding ? 0.5 : 0) * (1 - seg(t, 24, 25))
  return (
    <div style={{ position: 'absolute', right: 24, top: '22%', opacity: on, pointerEvents: 'none', background: 'rgba(14,8,28,0.82)', border: '1px solid #8a5aff', borderRadius: 10, padding: '10px 16px', color: '#f0e6ff', font: '600 14px system-ui, sans-serif', textAlign: 'center', minWidth: 150 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#c8b0ff' }}>π₁ READING</div>
      <svg width="120" height="64" viewBox="-60 -56 120 64" style={{ display: 'block', margin: '4px auto' }}>
        <path d="M -48 0 A 48 48 0 0 1 48 0" fill="none" stroke="#5a4a88" strokeWidth="4" />
        {[-2, -1, 0, 1, 2].map((n) => {
          const a = (n / 2) * (Math.PI / 2)
          return <text key={n} x={Math.sin(a) * 38} y={-Math.cos(a) * 38 + 4} fill={n === 0 ? '#ffd27a' : '#a898d0'} fontSize="10" textAnchor="middle">{n}</text>
        })}
        <line x1="0" y1="0" x2={Math.sin(settle) * 46} y2={-Math.cos(settle) * 46} stroke="#ff4a6a" strokeWidth="3" strokeLinecap="round" />
        <circle r="4" fill="#ffd27a" />
      </svg>
      <div style={{ fontSize: 26, color: sliding ? '#f0e6ff' : '#ff6a8a' }}>0</div>
    </div>
  )
}
