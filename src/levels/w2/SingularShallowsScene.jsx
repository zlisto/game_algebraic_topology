import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { NEG, POS } from './ChainDeck'
import YardFrame from './YardFrame'

/**
 * Singular Shallows (2-3). Each deck is a space X: the stone ring round a pond (the pond is not
 * in X). Singular 1-simplices are paths in X — bent, looping, even standing still — drawn as
 * curves with an arrow from start to end.
 *   any_tri — three different paths from p₀ to p₁, and a constant path at p₃
 *   pieces  — quarter-arcs round the pond, plus a wide arc on the north-west side
 *   bend    — one loop the Tide Glass can bend, and three buoys it must pass
 *   same    — the thick ring itself, which the Tide Glass squeezes onto its middle circle
 */

export const R = 3
export const POND = 1.2
const ang = (deg) => (deg * Math.PI) / 180
const at = (th, r) => [r * Math.cos(th), r * Math.sin(th)]
export const PTS = { 0: at(ang(90), R), 1: at(0, R), 2: at(ang(-90), R), 3: at(ang(180), R) }

/** A path from angle a to angle b (degrees) with radius r(t), t ∈ [0, 1]. */
function polar(a, b, r, n = 48) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    return at(ang(a + (b - a) * t), r(t))
  })
}

export const PATHS = {
  any_tri: [
    { id: 's1', from: 0, to: 1, pts: polar(90, 0, (t) => R - 0.7 * Math.sin(t * Math.PI)) },
    { id: 's2', from: 0, to: 1, pts: polar(90, 0, (t) => R + 0.3 * Math.sin(t * Math.PI * 6) * Math.sin(t * Math.PI)) },
    { id: 's3', from: 0, to: 1, pts: polar(90, 0, (t) => R + 1.6 * Math.sin(t * Math.PI)) },
    { id: 's0', from: 3, to: 3, pts: [PTS[3]] },
  ],
  pieces: [
    { id: 'α', from: 0, to: 1, pts: polar(90, 0, () => R) },
    { id: 'β', from: 1, to: 2, pts: polar(0, -90, () => R) },
    { id: 'γ', from: 2, to: 3, pts: polar(-90, -180, () => R) },
    { id: 'δ', from: 3, to: 0, pts: polar(180, 90, () => R) },
    { id: 'ε', from: 2, to: 3, pts: polar(-90, -180, (t) => R + 1.5 * Math.sin(t * Math.PI)) },
  ],
}
/** How far a path turns round the pond, in whole turns (summed over a chain). */
export function turns(path) {
  let s = 0
  for (let i = 1; i < path.pts.length; i++) {
    const [x0, z0] = path.pts[i - 1]
    const [x1, z1] = path.pts[i]
    let d = Math.atan2(z1, x1) - Math.atan2(z0, x0)
    if (d > Math.PI) d -= 2 * Math.PI
    if (d < -Math.PI) d += 2 * Math.PI
    s += d
  }
  return s / (2 * Math.PI)
}

/** The bendable loop: radius r(θ) sampled at N angles. */
export const LOOP_N = 72
export const BUOYS = [
  [ang(20), 4.5],
  [ang(150), 1.9],
  [ang(-100), 4.2],
]
export const loopStart = () => Array.from({ length: LOOP_N }, () => R)
export function bendLoop(loop, x, z) {
  const thc = Math.atan2(z, x)
  const target = Math.max(1.7, Math.min(4.8, Math.hypot(x, z)))
  const i0 = Math.round(((thc + 2 * Math.PI) % (2 * Math.PI)) / ((2 * Math.PI) / LOOP_N)) % LOOP_N
  const dr = target - loop[i0]
  return loop.map((r, i) => {
    let d = Math.abs(i - i0)
    d = Math.min(d, LOOP_N - d) * ((2 * Math.PI) / LOOP_N)
    return Math.max(1.7, Math.min(4.8, r + dr * Math.exp(-((d / 0.42) ** 2))))
  })
}
export function loopRadiusAt(loop, th) {
  const u = (((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / ((2 * Math.PI) / LOOP_N)
  const i = Math.floor(u) % LOOP_N
  const f = u - Math.floor(u)
  return loop[i] * (1 - f) + loop[(i + 1) % LOOP_N] * f
}
export const buoysMet = (loop) => BUOYS.map(([th, r]) => Math.abs(loopRadiusAt(loop, th) - r) < 0.45)

const C0 = '#9aa8a0'
const colorOf = (n) => (n > 0 ? POS : n < 0 ? NEG : C0)

export function Pond() {
  const g = useRef()
  useFrame(({ clock }) => {
    if (g.current) g.current.material.opacity = 0.75 + Math.sin(clock.elapsedTime * 1.4) * 0.08
  })
  return (
    <group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[POND, 40]} />
        <meshBasicMaterial color="#082030" />
      </mesh>
      <mesh ref={g} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[POND - 0.12, POND, 48]} />
        <meshBasicMaterial color="#5fd0ff" transparent opacity={0.8} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** A path drawn as a curve, with a flat arrowhead at its middle; a constant path is a ringed dot. */
export function PathCurve({ path, n = 0, spent, dim, label }) {
  const col = spent ? '#4a524e' : colorOf(n)
  const pts3 = useMemo(() => path.pts.map(([x, z]) => [x, 0.12, z]), [path])
  if (path.pts.length === 1) {
    const [x, z] = path.pts[0]
    return (
      <group position={[x, 0.1, z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.4, 24]} />
          <meshBasicMaterial color={col} toneMapped={false} transparent opacity={dim ? 0.4 : 0.95} />
        </mesh>
        {label && (
          <Html position={[0, 0.5, 0.6]} center zIndexRange={[10, 0]}>
            <div className="floor-tag" style={{ color: col, borderColor: col }}>{label}</div>
          </Html>
        )}
      </group>
    )
  }
  const m = Math.floor(path.pts.length / 2)
  const [x0, z0] = path.pts[m - 1]
  const [x1, z1] = path.pts[m + 1]
  const [mx, mz] = path.pts[m]
  return (
    <group>
      <Line points={pts3} color={col} lineWidth={spent ? 2 : 4} transparent opacity={dim ? 0.4 : 1} />
      <group position={[mx, 0.16, mz]} rotation={[0, Math.atan2(-(z1 - z0), x1 - x0), 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]}>
          <circleGeometry args={[0.3, 3]} />
          <meshBasicMaterial color={col} side={2} toneMapped={false} />
        </mesh>
      </group>
      {label && (
        <Html position={[mx * 1.12, 0.5, mz * 1.12]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ color: col, borderColor: col }}>{label}</div>
        </Html>
      )}
    </group>
  )
}

export function PointStud({ id, p, total }) {
  return (
    <group position={[p[0], 0, p[1]]}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.32, 16]} />
        <meshStandardMaterial color="#e8e0c8" emissive="#ffe6a8" emissiveIntensity={0.3} />
      </mesh>
      <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          p{id}
          {total !== undefined && <b style={{ color: total > 0 ? POS : total < 0 ? NEG : '#c8d4cc', marginLeft: 4 }}>{total > 0 ? `+${total}` : total < 0 ? `−${-total}` : '0'}</b>}
        </div>
      </Html>
    </group>
  )
}

function BendLoop({ loop, live }) {
  const pts = useMemo(() => Array.from({ length: LOOP_N + 1 }, (_, i) => {
    const th = (i / LOOP_N) * 2 * Math.PI
    const r = loop[i % LOOP_N]
    return [r * Math.cos(th), 0.12, r * Math.sin(th)]
  }), [loop])
  const met = buoysMet(loop)
  return (
    <group>
      <Line points={pts} color={POS} lineWidth={4} transparent opacity={live ? 1 : 0.6} />
      {BUOYS.map(([th, r], i) => (
        <group key={i} position={[r * Math.cos(th), 0, r * Math.sin(th)]}>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.24, 16, 12]} />
            <meshStandardMaterial color={met[i] ? '#9cf0a0' : '#ff7a5a'} emissive={met[i] ? '#4cff7a' : '#ff5a3a'} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The thick ring squeezed toward its middle circle: k = 0 (whole ring) … 1 (just the circle). */
function Squeeze({ k }) {
  const g = useRef()
  const cur = useRef(k)
  const last = useRef(-1)
  useFrame(() => {
    cur.current += (k - cur.current) * 0.06
    if (Math.abs(cur.current - last.current) < 1e-3) return
    last.current = cur.current
    const inner = POND + 0.2 + (R - 0.08 - POND - 0.2) * cur.current
    const outer = 4.9 - (4.9 - R - 0.08) * cur.current
    if (g.current) {
      g.current.geometry.dispose()
      g.current.geometry = new g.current.geometry.constructor(inner, outer, 64)
    }
  })
  return (
    <group>
      <mesh ref={g} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[POND + 0.2, 4.9, 64]} />
        <meshBasicMaterial color="#7fd6ff" transparent opacity={0.28} toneMapped={false} side={2} />
      </mesh>
      <Line points={Array.from({ length: 65 }, (_, i) => [R * Math.cos((i / 64) * 2 * Math.PI), 0.12, R * Math.sin((i / 64) * 2 * Math.PI)])} color={POS} lineWidth={k >= 1 ? 5 : 2} transparent opacity={k >= 1 ? 1 : 0.5} />
    </group>
  )
}

export function Station(site, { bag, live }) {
  const id = site.id
  if (id === 'any_tri') {
    const spent = bag.spent?.any_tri || {}
    return (
      <group>
        <Pond />
        {PATHS.any_tri.map((p) => (
          <PathCurve key={p.id} path={p} n={1} spent={spent[p.id]} label={p.id === 's0' ? 'constant path' : null} />
        ))}
        {[0, 1, 3].map((i) => (
          <PointStud key={i} id={i} p={PTS[i]} />
        ))}
      </group>
    )
  }
  if (id === 'pieces') {
    const coef = bag.coef?.pieces || {}
    const totals = { 0: 0, 1: 0, 2: 0, 3: 0 }
    for (const p of PATHS.pieces) {
      const n = coef[p.id] || 0
      totals[p.to] += n
      totals[p.from] -= n
    }
    return (
      <group>
        <Pond />
        {PATHS.pieces.map((p) => (
          <PathCurve key={p.id} path={p} n={coef[p.id] || 0} label={`${coef[p.id] ? (coef[p.id] > 0 ? '+' : '−') : ''}${p.id}`} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <PointStud key={i} id={i} p={PTS[i]} total={totals[i]} />
        ))}
      </group>
    )
  }
  if (id === 'bend') {
    return (
      <group>
        <Pond />
        <BendLoop loop={bag.loop || loopStart()} live={live} />
      </group>
    )
  }
  if (id === 'same') {
    return (
      <group>
        <Pond />
        <Squeeze k={(bag.squeeze || 0) / 3} />
      </group>
    )
  }
  return null
}

export default function SingularShallowsScene(props) {
  return <YardFrame {...props} sky={{ bg: '#081216', water: '#0f3040', deep: '#050c10', cloud: '#a0c8d8', spark: '#9fe6ff', seed: 23 }} deckColor="#2a3236" station={Station} />
}
