import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { ArrowTile, BasinSky, RetractorEngine, RimRoad, SphereCap } from '../../levels/w1/BasinScene'
import { fieldAngle, fieldStrength, unitRoots } from '../../levels/w1/brouwer'
import layout from '../../world/basin.json'

/**
 * "No Way Out" lesson (videos.json level-1-4-lesson): the boundary count, slowly.
 *   A 0–12   the rim loop: walk the rim, the arrow (the loop's direction from the centre) turns once
 *   B 12–24  the Retractor: shrink the rim loop through the disk; pushed back to the rim it would
 *            still wind once — until the last loop is a point, which winds 0. It tears.
 *   C 24–38  the Still Point: a map h of the disk to itself; arrows h(x) − x turn once on the rim,
 *            so some arrow is zero — a fixed point (Brouwer)
 *   D 38–50  the Roots: p(z) = z³ − a³ turns three times on the rim, so it has zeros (three)
 *   E 50–58  the Antipodes: opposite stations reading the same (Borsuk–Ulam)
 *   F 58–66  how to play
 *   G 66–72  summary
 */

const S = 0.7
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const RIM = 3.9
const SWIRL = { kind: 'swirl', focus: [0.3, -0.2], turn: 2.29 }
const POLY = { kind: 'poly', degree: 3, scale: 0.42, rootRadius: 2.15 }
const ROOTS = unitRoots(3, 2.15)
const SPHERE = { ...layout.sites.find((s) => s.id === 'antipodes'), pos: [0, 0] }

/** Which rim walk is on at story time t: [start, end, field] — one lap each. */
const WALKS = [
  [2.5, 10.5, { kind: 'radial' }],
  [26, 33, SWIRL],
  [39.5, 46.5, POLY],
]
const walkAt = (t) => {
  for (const [a, b, f] of WALKS) if (t >= a && t < b + 1.4) return { u: smooth(seg(t, a, b)), f }
  return null
}
/** How far the arrow has turned at story time t (shown on the card). */
export const arrowTurns = (t) => {
  const w = walkAt(t)
  if (!w) return null
  return (w.f.kind === 'poly' ? 3 : 1) * w.u
}
const fieldOn = (t) => (t >= 24 && t < 38 ? SWIRL : t >= 38 && t < 50 ? POLY : null)

const SHOTS = [
  [0, 50, [[-0.4, 10.6, 7.6], [1.2, 0, 0.6]], [[-0.4, 10.8, 7.8], [1.2, 0, 0.6]]],
  [50, 58, [[-0.6, 9.6, 12.6], [1.3, 0.6, 1.8]], [[-0.6, 9.8, 12.8], [1.3, 0.6, 1.8]]],
  [58, 66, [[-0.8, 9.2, 7.4], [0.8, 0, 0.8]], [[-0.8, 9.0, 7.2], [0.8, 0, 0.8]]],
  [66, 80, [[-0.4, 10.8, 7.8], [1.2, 0, 0.6]], [[-0.4, 11.2, 8.2], [1.2, 0, 0.6]]],
]
function LessonCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(mix(from[0][0], to[0][0], k), mix(from[0][1], to[0][1], k), mix(from[0][2], to[0][2], k))
    look.set(mix(from[1][0], to[1][0], k), mix(from[1][1], to[1][1], k), mix(from[1][2], to[1][2], k))
    camera.lookAt(look)
  })
  return null
}

/** The field's tiles, built once per field. */
function Field({ field, show, mark }) {
  const g = useRef()
  useFrame(() => (g.current.visible = show()))
  const tiles = useMemo(() => {
    const out = []
    const r = 4.4
    for (let x = -r; x <= r; x += 0.95)
      for (let z = -r; z <= r; z += 0.95) {
        if (x * x + z * z > r * r) continue
        out.push({ x, z, a: fieldAngle(field.kind, x, z, field), m: fieldStrength(field.kind, x, z, field) })
      }
    return out
  }, [field])
  return (
    <group ref={g}>
      {tiles.map((p, i) => (
        <ArrowTile key={i} x={p.x} z={p.z} angle={p.a} strength={p.m} />
      ))}
      {mark}
    </group>
  )
}

function Pulse({ x, z, show }) {
  const m = useRef()
  useFrame(({ clock }) => {
    m.current.visible = show()
    m.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.15)
  })
  return (
    <mesh ref={m} position={[x, 0.12, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.36, 0.5, 28]} />
      <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
    </mesh>
  )
}

export default function NoWayOutLesson({ tRef }) {
  const bead = useRef()
  const compass = useRef()
  const arrow = useRef()
  const deckG = useRef()
  const sphereG = useRef()
  const tear = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const w = walkAt(t)
    bead.current.visible = !!w && t < 58
    compass.current.visible = !!w && t < 58
    if (w) {
      const th = Math.PI / 2 + TAU * w.u
      const x = RIM * Math.cos(th)
      const z = RIM * Math.sin(th)
      bead.current.position.set(x, 0.35, z)
      compass.current.position.set(x, 1.4, z)
      arrow.current.rotation.set(0, -fieldAngle(w.f.kind, x, z, w.f), 0)
    }
    deckG.current.visible = t < 50 || t >= 58
    sphereG.current.visible = t >= 50 && t < 58
    // B: the tear at the centre when the shrink reaches a point
    tear.current.visible = t >= 21 && t < 24.5
    tear.current.scale.setScalar(0.6 + Math.abs(Math.sin(clock.elapsedTime * 18)) * 0.8)
  })
  const t = () => tRef.current
  const shrink = () => (t() >= 13 && t() < 24.5 ? smooth(seg(t(), 13.5, 21)) : null)
  const run = () => {
    const w = walkAt(t())
    if (!w || t() >= 58) return null
    const n = Math.max(2, Math.round(w.u * 96))
    return Array.from({ length: n + 1 }, (_, i) => {
      const th = Math.PI / 2 + (TAU * w.u * i) / n
      return [RIM * Math.cos(th), RIM * Math.sin(th), 0.2]
    })
  }
  const gyro = () => {
    const tt = t()
    if (tt < 58 || tt >= 66) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const u = smooth(seg(tt, 59, 63.5))
    const th = Math.PI / 2 + TAU * u
    const th2 = th + 0.1
    return { pos: [RIM * Math.cos(th), 0, RIM * Math.sin(th)], rotY: Math.atan2(RIM * Math.cos(th2) - RIM * Math.cos(th), RIM * Math.sin(th2) - RIM * Math.sin(th)), run: u > 0 && u < 1 ? 0.95 : 0, cast: 0.3, whip: 0, loop: 0, loopDrop: 0 }
  }
  // F: Gyroid's own compass while he walks the rim
  const demoRun = () => {
    const tt = t()
    if (tt < 59 || tt >= 66) return null
    const u = smooth(seg(tt, 59, 63.5))
    const n = Math.max(2, Math.round(u * 96))
    return Array.from({ length: n + 1 }, (_, i) => {
      const th = Math.PI / 2 + (TAU * u * i) / n
      return [RIM * Math.cos(th), RIM * Math.sin(th), 0.2]
    })
  }
  return (
    <>
      <BasinSky />
      <group ref={deckG}>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[5.2, 4.9, 0.6, 56]} />
          <meshStandardMaterial color="#4a4a52" roughness={0.88} />
        </mesh>
        <RimRoad cx={0} cz={0} r={RIM} current />
        <Field field={SWIRL} show={() => t() >= 24 && t() < 38} mark={<Pulse x={0.3} z={-0.2} show={() => t() >= 33.5 && t() < 38} />} />
        <Field
          field={POLY}
          show={() => (t() >= 38 && t() < 50) || t() >= 66}
          mark={
            <>
              {ROOTS.map((r, i) => (
                <Pulse key={i} x={r.x} z={r.z} show={() => (t() >= 47 && t() < 50) || t() >= 66} />
              ))}
            </>
          }
        />
        <RetractorEngineShow tRef={tRef} />
        <ShrinkProofShow get={shrink} />
      </group>
      <group ref={sphereG}>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[5.2, 4.9, 0.6, 56]} />
          <meshStandardMaterial color="#4a4a52" roughness={0.88} />
        </mesh>
        <SphereCapShow tRef={tRef} />
      </group>
      <mesh ref={tear} position={[0, 0.8, 0]}>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial color="#ff5a7a" toneMapped={false} />
      </mesh>
      <LiveLine getPts={run} color="#fff2c4" width={7} />
      <LiveLine getPts={demoRun} color="#fff2c4" width={7} />
      <mesh ref={bead}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <group ref={compass}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.62, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
        </mesh>
        <group ref={arrow}>
          <mesh position={[0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.44, 6]} />
            <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
          </mesh>
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.12, 0.2, 8]} />
            <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.5} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  )
}

function RetractorEngineShow({ tRef }) {
  const g = useRef()
  useFrame(() => (g.current.visible = tRef.current >= 12 && tRef.current < 24.5))
  return (
    <group ref={g}>
      <RetractorEngine cx={0} cz={0} seized={false} strain={0.6} />
    </group>
  )
}
function ShrinkProofShow({ get }) {
  // ShrinkProof reads t at render; drive it with live lines instead
  const loop = () => {
    const k = get()
    return k == null ? null : Array.from({ length: 73 }, (_, i) => [(1 - k) * RIM * Math.cos((i / 72) * TAU), (1 - k) * RIM * Math.sin((i / 72) * TAU), 0.2])
  }
  const image = () => {
    const k = get()
    return k == null || k > 0.97 ? null : Array.from({ length: 73 }, (_, i) => [(RIM + 0.75) * Math.cos((i / 72) * TAU), (RIM + 0.75) * Math.sin((i / 72) * TAU), 0.22])
  }
  return (
    <>
      <LiveLine getPts={loop} color="#ffffff" width={5} />
      <LiveLine getPts={image} color="#ff8ad8" width={4} dashed />
    </>
  )
}
/** Mount the sphere only during its beat (its station labels are HTML and ignore group visibility). */
function SphereCapShow({ tRef }) {
  const [on, setOn] = useState(false)
  useFrame(() => {
    const want = tRef.current >= 50 && tRef.current < 58
    if (want !== on) setOn(want)
  })
  return on ? <SphereCapInner tRef={tRef} /> : null
}
function SphereCapInner({ tRef }) {
  const g = useRef()
  const a = useRef()
  const b = useRef()
  useFrame(({ clock }) => {
    const on = tRef.current >= 53
    for (const m of [a.current, b.current]) {
      m.visible = on
      m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.15)
    }
  })
  const n = SPHERE.stations.find((s) => s.id === 'n')
  const s = SPHERE.stations.find((s) => s.id === 's')
  return (
    <group ref={g}>
      <SphereCap site={SPHERE} pickA={null} pickB={null} />
      {[n, s].map((p, i) => (
        <mesh key={i} ref={i ? b : a} position={[p.x, 1.38, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.58, 28]} />
          <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- the 2D card

const GOLD = '#ffd27a'
const INK = '#e8eefc'
const SOFT = '#9fb0d0'
const PINK = '#ff8ad8'
const MATH = { fontFamily: "'Cambria Math', 'STIX Two Math', serif" }

/** rows: [left, right, isMath] */
function Card({ title, rows, foot }) {
  return (
    <svg viewBox="0 0 260 180" className="lesson-svg">
      <text x="130" y="30" textAnchor="middle" fill={GOLD} fontSize="16" fontWeight="700">
        {title}
      </text>
      {rows.map(([a, b, math], i) => (
        <g key={i}>
          <text x="18" y={64 + i * 27} fill={math ? PINK : INK} fontSize="13.5" style={math ? MATH : undefined} fontWeight={math ? 700 : 400}>
            {a}
          </text>
          <text x="242" y={64 + i * 27} fill={SOFT} fontSize="11.5" textAnchor="end">
            {b}
          </text>
        </g>
      ))}
      {foot && (
        <text x="130" y="170" textAnchor="middle" fill={SOFT} fontSize="11">
          {foot}
        </text>
      )}
    </svg>
  )
}

function Steps({ t }) {
  if (t >= 66)
    return (
      <div className="lesson-steps">
        <h4>The boundary count</h4>
        <p className="lesson-math">winds ≠ 0 on the rim</p>
        <p className="lesson-note">⇒ the arrows vanish somewhere inside</p>
        <p className="lesson-note">no retraction D² → S¹ · Brouwer · roots · Borsuk–Ulam</p>
      </div>
    )
  const steps = [
    ['4', 'Cord: walk a rim road once round', t < 61],
    ['↻', 'count the pink arrow over your head', t >= 61 && t < 63],
    ['3', 'Tide Glass: X shrinks the Retractor’s loop', t >= 63 && t < 64.5],
    ['click', 'still tiles, roots, opposite stations', t >= 64.5 && t < 65.5],
    ['1', 'Lash the drones', t >= 65.5],
  ]
  return (
    <div className="lesson-steps">
      <h4>◎ Winding Cord · ◑ Tide Glass</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function NoWayOutLessonOverlay({ t }) {
  if (t >= 69.5) return null
  const turns = arrowTurns(t)
  const count = turns == null ? '' : `arrow turned: ${turns.toFixed(1)}`
  let body = null
  if (t < 12) body = <Card title="the rim loop" rows={[['f(s) = (cos 2πs, sin 2πs)', '', true], ['winds once', 'the arrow turns once'], [count, '', true]]} foot="in π₁(S¹) ≅ ℤ it is 1" />
  else if (t < 24) body = <Card title="the Retractor" rows={[['F(s, t) = (1 − t) f(s)', 'shrinks in D²', true], ['r ∘ F', 'pushed back to the rim', true], ['winds 1 … then 0?', 'can’t jump: it tears']]} foot="no retraction D² → S¹" />
  else if (t < 38) body = <Card title="the still point" rows={[['h : D² → D²', 'the current', true], ['v(x) = h(x) − x', 'the arrows', true], [count || 'turns ≠ 0 ⇒ v = 0', '', true]]} foot="a fixed point h(x) = x — Brouwer, Thm 1.9" />
  else if (t < 50) body = <Card title="the roots" rows={[['p(z) = z³ − a³', 'the arrows', true], [count || 'winds 3 on the rim', '', true], ['⇒ p(z) = 0 inside', 'three roots', true]]} foot="fundamental theorem of algebra, Thm 1.8" />
  else if (t < 58) body = <Card title="the antipodes" rows={[['f : S² → ℝ²', 'two readings', true], ['f(x) = f(−x)', 'for some x', true]]} foot="Borsuk–Ulam, Thm 1.10" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
