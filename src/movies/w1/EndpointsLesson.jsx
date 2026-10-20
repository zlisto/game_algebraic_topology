import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { GardensSky, Gatehouse, HedgeBed, smoothRoute } from '../../levels/w1/EndpointGardensScene'
import { linearHomotopy, resample } from '../../levels/w1/routes'

/**
 * "Fixed Endpoints" lesson (videos.json level-1-1-lesson): path homotopy rel the endpoints, slowly.
 *   A 0–12   a route is a path f : [0, 1] → X from gate A to gate B (a bead walks it)
 *   B 12–26  one route slides into another: a homotopy F(s, t) with F(0, t) = A, F(1, t) = B
 *   C 26–38  a hedge in the way: the upper and lower routes can't slide together — the slide
 *            jams at the hedge (proving no slide exists at all waits for 1-3, π₁(S¹) ≅ ℤ)
 *   D 38–47  pace: the same curve walked faster is the same class (a reparametrization)
 *   E 47–57  chains: a route A → B then B → C is a route A → C
 *   F 57–66  how to play: the Spool picks a route, bins sort it, the Tide Glass scrubs t
 *   G 66–72  summary
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const A = [-4, 0]
const B = [4, 0]
const C = [4, -4.2]
const STRAIGHT = [A, [0, 0], B]
const WAVY = [A, [-2, 1.3], [0, -1.1], [2, 1.2], B]
const UPPER = [A, [-2, 2], [0, 2.3], [2, 2], B]
const LOWER = [A, [-2, -2], [0, -2.3], [2, -2], B]
const AB = [A, [-1.5, 1.6], [1.5, 1.6], B]
const BC = [B, [5.6, -1.6], C]
const HEDGE_R = 1.3

const N = 64
const sm = (p) => resample(smoothRoute(p, 96), N)
const S_STRAIGHT = sm(STRAIGHT)
const S_WAVY = sm(WAVY)
const S_UPPER = sm(UPPER)
const S_LOWER = sm(LOWER)
const S_AB = sm(AB)
const S_BC = sm(BC)
const lift = (pts, y = 0.24) => pts.map(([x, z]) => [x, z, y])
const at = (pts, u) => pts[Math.min(pts.length - 1, Math.max(0, Math.round(u * (pts.length - 1))))]

/** The slide jams at the hedge: each frame is the straight-line mix, but points stop at the hedge's rim. */
function jammed(a, b, t) {
  return linearHomotopy(a, b, t).map(([x, z]) => {
    const d = Math.hypot(x, z)
    return d < HEDGE_R + 0.15 ? [(x / (d || 1)) * (HEDGE_R + 0.15), (z / (d || 1)) * (HEDGE_R + 0.15)] : [x, z]
  })
}

const SHOTS = [
  [0, 57, [[3.0, 14.5, 11.5], [2.6, 0, 1.4]], [[2.9, 14.8, 11.8], [2.6, 0, 1.3]]],
  [57, 66, [[2.6, 12.6, 10.6], [2.0, 0, 1.6]], [[2.5, 12.4, 10.3], [1.9, 0, 1.6]]],
  [66, 80, [[3.0, 14.8, 11.8], [2.6, 0, 1.3]], [[3.0, 15.2, 12.2], [2.6, 0, 1.3]]],
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

/** The two pinned gates glow while a homotopy runs (they never move). */
function GatePins({ tRef }) {
  const a = useRef()
  const b = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const on = (t >= 14 && t < 38) || (t >= 40 && t < 47)
    for (const m of [a.current, b.current]) {
      m.visible = on
      m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.12)
    }
  })
  return (
    <>
      {[A, B].map((p, i) => (
        <mesh key={i} ref={i ? b : a} position={[p[0], 0.06, p[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.75, 32]} />
          <meshBasicMaterial color="#ff8ad8" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}

export default function EndpointsLesson({ tRef }) {
  const hedge = useRef()
  const bead = useRef()
  const cGate = useRef()
  useFrame(() => {
    const t = tRef.current
    // the hedge rises for beat C and stays out of the way otherwise
    const h = t >= 26 && t < 38 ? smooth(seg(t, 26, 27.5)) : 0
    hedge.current.visible = h > 0.01
    hedge.current.scale.set(1, Math.max(0.01, h), 1)
    cGate.current.visible = t >= 47 && t < 57
    // the bead: walks the straight route in A, the slow/fast walks in D, the chain in E
    let p = null
    if (t >= 2 && t < 12) p = at(S_STRAIGHT, smooth(seg((t - 2) % 5, 0, 4.5)))
    else if (t >= 40 && t < 47) p = at(S_UPPER, seg((t - 40) % 3.5, 0, 3))
    else if (t >= 49 && t < 57) {
      const u = seg((t - 49) % 4, 0, 3.6)
      p = u < 0.5 ? at(S_AB, u * 2) : at(S_BC, u * 2 - 1)
    }
    bead.current.visible = !!p
    if (p) bead.current.position.set(p[0], 0.4, p[1])
  })
  const t = () => tRef.current
  // A, B, D: the routes on show; B: the teal ghost slides wavy → straight; C: upper → lower, jammed
  const straight = () => (t() < 12 || (t() >= 12 && t() < 26) ? lift(S_STRAIGHT) : null)
  const wavy = () => (t() >= 12 && t() < 26 ? lift(S_WAVY) : null)
  const ghostB = () => (t() >= 14 && t() < 26 ? lift(linearHomotopy(S_WAVY, S_STRAIGHT, smooth(seg(t(), 15, 23))), 0.42) : null)
  const upper = () => ((t() >= 26 && t() < 38) || (t() >= 38 && t() < 47) ? lift(S_UPPER) : null)
  const lower = () => (t() >= 26 && t() < 38 ? lift(S_LOWER) : null)
  const ghostC = () => (t() >= 29 && t() < 38 ? lift(jammed(S_UPPER, S_LOWER, 0.85 * smooth(seg(t(), 30, 34.5))), 0.42) : null)
  const fast = () => (t() >= 40 && t() < 47 ? lift(S_UPPER, 0.3) : null)
  const ab = () => (t() >= 47 && t() < 57 ? lift(S_AB) : null)
  const bc = () => (t() >= 47 && t() < 57 ? lift(S_BC) : null)
  const joined = () => (t() >= 52 && t() < 57 ? lift([...S_AB, ...S_BC.slice(1)], 0.36) : null)
  // F: the controls demo — the picked route glows white, then the ghost scrubs
  const picked = () => (t() >= 58.5 && t() < 62 ? lift(S_WAVY, 0.3) : null)
  const scrub = () => (t() >= 62 && t() < 66 ? lift(linearHomotopy(S_WAVY, S_STRAIGHT, 0.5 - 0.5 * Math.cos((t() - 62) * 1.6)), 0.42) : null)
  const demoBase = () => (t() >= 57 && t() < 66 ? lift(S_WAVY) : null)
  const demoStraight = () => (t() >= 57 && t() < 66 ? lift(S_STRAIGHT) : null)
  const summary = () => (t() >= 66 ? lift(S_UPPER) : null)
  const summary2 = () => (t() >= 66 ? lift(S_LOWER) : null)
  const gyro = () => {
    const tt = t()
    const k = smooth(seg(tt, 57, 58.4))
    return {
      pos: [mix(5.6, 2.2, k), 0, mix(2.6, 2.4, k)],
      rotY: -2.4,
      run: k > 0 && k < 1 ? 0.7 : 0,
      cast: (tt > 58.3 && tt < 59) || (tt > 62 && tt < 66) ? 1 : 0.2,
      whip: 0,
      loop: 0,
      loopDrop: 0,
    }
  }
  return (
    <>
      <GardensSky />
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[6.6, 6.3, 0.6, 56]} />
        <meshStandardMaterial color="#4a5568" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[6.45, 6.6, 64]} />
        <meshBasicMaterial color="#c9a84a" toneMapped={false} />
      </mesh>
      <Gatehouse pos={A} rot={Math.PI / 2} />
      <Gatehouse pos={B} rot={-Math.PI / 2} />
      <group ref={cGate}>
        <Gatehouse pos={C} rot={0} />
      </group>
      <GatePins tRef={tRef} />
      <group ref={hedge}>
        <HedgeBed c={[0, 0]} r={HEDGE_R} />
      </group>
      <LiveLine getPts={straight} color="#e8dcc0" width={4} />
      <LiveLine getPts={wavy} color="#ffb347" width={4} />
      <LiveLine getPts={ghostB} color="#3ecfbf" width={7} />
      <LiveLine getPts={upper} color="#ffb347" width={4} />
      <LiveLine getPts={lower} color="#c58bff" width={4} />
      <LiveLine getPts={ghostC} color="#3ecfbf" width={7} />
      <LiveLine getPts={fast} color="#fff2c4" width={2} dashed />
      <LiveLine getPts={ab} color="#ffb347" width={4} />
      <LiveLine getPts={bc} color="#7fe8dc" width={4} />
      <LiveLine getPts={joined} color="#ffffff" width={8} opacity={0.35} />
      <LiveLine getPts={demoBase} color="#ffb347" width={4} />
      <LiveLine getPts={demoStraight} color="#e8dcc0" width={4} />
      <LiveLine getPts={picked} color="#ffffff" width={9} />
      <LiveLine getPts={scrub} color="#3ecfbf" width={7} />
      <LiveLine getPts={summary} color="#ffb347" width={4} />
      <LiveLine getPts={summary2} color="#c58bff" width={4} />
      <mesh ref={bead}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.12} darkness={0.55} />
      </EffectComposer>
    </>
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
        <h4>Fixed endpoints</h4>
        <p className="lesson-math">F(0, t) = A, F(1, t) = B</p>
        <p className="lesson-note">same class: one route slides into the other, gates pinned</p>
        <p className="lesson-math">[f]·[g] = [f·g]</p>
        <p className="lesson-note">chains respect classes when the middle gate matches</p>
      </div>
    )
  const steps = [
    ['2', 'Spool: click a route to pick it up', t < 60],
    ['I/II', 'drop it in a ledger bin — same bin, same class', t >= 60 && t < 62],
    ['3', 'Tide Glass: scrub t with Z / X to watch a slide', t >= 62 && t < 64.5],
    ['E', 'lost? walk up to Emmy', t >= 64.5],
  ]
  return (
    <div className="lesson-steps">
      <h4>◎ Spool · ◑ Tide Glass</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function EndpointsLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 12) body = <Card title="a route is a path" rows={[['f : [0, 1] → X', 's runs along the route', true], ['f(0) = A, f(1) = B', 'it starts and ends at the gates', true]]} foot="different routes, same two gates" />
  else if (t < 26)
    body = <Card title="sliding one route into another" rows={[['F(s, t)', 'route s, time t', true], ['F(0, t) = A, F(1, t) = B', 'the gates never move', true], ['every frame is a route A → B', '']]} foot="a path homotopy rel the endpoints" />
  else if (t < 38) body = <Card title="a hedge in the way" rows={[['upper ≄ lower', 'no slide gets past the hedge', true], ['two classes', 'two bins in the ledger']]} foot="why no slide can exist: Winding Road (1-3)" />
  else if (t < 47) body = <Card title="pace doesn’t matter" rows={[['f(φ(s))', 'same curve, new timing', true], ['same class', 'slide the timing, not the trail']]} foot="a reparametrization is a homotopy rel the gates" />
  else if (t < 57) body = <Card title="chains" rows={[['f : A → B, g : B → C', '', true], ['f · g : A → C', 'first f, then g', true], ['[f] · [g] = [f · g]', 'swap a leg in its class: same chain', true]]} foot="Hatcher, Chapter 1, pp. 25–27" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
