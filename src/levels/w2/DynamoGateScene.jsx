import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import YardFrame from './YardFrame'

/**
 * Dynamo Gate (2-6): degree. A map S¹ → S¹ is drawn as a band wound round a post — a spiral
 * whose angle follows the map, so every turn shows. The degree is the net number of turns.
 *   hollow   — a band that winds on and back; the Degree Dial pulls it tight, one backtrack at a time
 *   wrap     — f = z^a, g = z^b; their composite winds a·b times
 *   antipode — a sphere, a marked point P, and three mirrors; turn them on to send P to −P
 *   hairy    — a combed sphere always keeps two calm spots, wherever you comb from
 */

export const MESSY = [1.25, -0.75, 0.5, -0.25, 1.25]
/** One Dial pull: cancel the first back-and-forth, then merge runs that go the same way. */
export function tighten(segs) {
  const s = [...segs]
  const i = s.findIndex((v, j) => j > 0 && Math.sign(v) !== Math.sign(s[j - 1]))
  if (i > 0) {
    const m = Math.min(Math.abs(s[i]), Math.abs(s[i - 1]))
    s[i - 1] -= Math.sign(s[i - 1]) * m
    s[i] -= Math.sign(s[i]) * m
  }
  const out = []
  for (const v of s.filter((v) => Math.abs(v) > 1e-9)) {
    if (out.length && Math.sign(out[out.length - 1]) === Math.sign(v)) out[out.length - 1] += v
    else out.push(v)
  }
  return out
}
export const net = (segs) => segs.reduce((a, b) => a + b, 0)

/** The band for turn-segments `segs`: a spiral, radius growing along it so each wrap shows. */
function bandPoints(segs, r0 = 1.4, r1 = 3.6) {
  const total = segs.reduce((a, b) => a + Math.abs(b), 0) || 1
  const pts = []
  let ang = 0
  let s = 0
  for (const v of segs) {
    const n = Math.max(8, Math.round(Math.abs(v) * 64))
    for (let i = 0; i <= n; i++) {
      const u = i / n
      const a = ang + 2 * Math.PI * v * u
      const r = r0 + (r1 - r0) * ((s + Math.abs(v) * u) / total)
      pts.push([r * Math.cos(-a), 0.14, r * Math.sin(-a)])
    }
    ang += 2 * Math.PI * v
    s += Math.abs(v)
  }
  return pts
}

export function Band({ segs, color = '#ffb347' }) {
  const pts = useMemo(() => bandPoints(segs), [segs])
  const heads = useMemo(() => {
    const out = []
    for (let i = 24; i < pts.length - 2; i += 48) {
      const [x0, , z0] = pts[i - 1]
      const [x1, , z1] = pts[i + 1]
      out.push({ p: pts[i], yaw: Math.atan2(-(z1 - z0), x1 - x0) })
    }
    return out
  }, [pts])
  return (
    <group>
      <Line points={pts} color={color} lineWidth={4} />
      {heads.map(({ p, yaw }, i) => (
        <group key={i} position={[p[0], 0.18, p[2]]} rotation={[0, yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]}>
            <circleGeometry args={[0.22, 3]} />
            <meshBasicMaterial color={color} side={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Post({ label }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 1.2, 32]} />
        <meshStandardMaterial color="#3a3440" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.22, 0]}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      {/* the marker ray: count the band's signed crossings here */}
      <Line points={[[1.0, 0.16, 0], [4.0, 0.16, 0]]} color="#ff8ad8" lineWidth={2} dashed dashSize={0.2} gapSize={0.12} />
      {label && (
        <Html position={[0, 1.7, 0]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">{label}</div>
        </Html>
      )}
    </group>
  )
}

export function Lever({ pos, on, label }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.5, 6]} />
        <meshStandardMaterial color={on ? '#ffd27a' : '#4a4450'} emissive={on ? '#ffb347' : '#000000'} emissiveIntensity={on ? 0.9 : 0} toneMapped={!on} />
      </mesh>
      <Html position={[0, 0.9, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag">{label}</div>
      </Html>
    </group>
  )
}

const SUPS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³' }
export const sup = (k) => String(k).split('').map((c) => SUPS[c] ?? c).join('')
export const minus = (k) => String(k).replace('-', '−')
export const WRAP_LEVERS = { a: [-3.6, 1.6], b: [3.6, 1.6] }
export const MIRROR_LEVERS = { x: [-3.7, 0.6], y: [0, 3.6], z: [3.7, 0.6] }
export const SR = 1.7 // sphere radius
export const SY = 2.4 // sphere centre height
export const P0 = (() => {
  const v = [0.55, 0.65, -0.52]
  const n = Math.hypot(...v)
  return v.map((c) => (c / n) * SR)
})()

function Sphere({ children, opacity = 0.22 }) {
  return (
    <group position={[0, SY, 0]}>
      <mesh>
        <sphereGeometry args={[SR, 40, 28]} />
        <meshStandardMaterial color="#8fb8ff" transparent opacity={opacity} roughness={0.2} metalness={0.3} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[SR * 1.001, 20, 14]} />
        <meshBasicMaterial color="#c8dcff" wireframe transparent opacity={0.12} />
      </mesh>
      {children}
    </group>
  )
}

function Dot({ p, color, label }) {
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {label && (
        <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ color, borderColor: color }}>{label}</div>
        </Html>
      )}
    </group>
  )
}

function Mirrors({ m }) {
  const img = [P0[0] * (m.x ? -1 : 1), P0[1] * (m.y ? -1 : 1), P0[2] * (m.z ? -1 : 1)]
  const plane = (axis) => {
    const rot = axis === 'x' ? [0, Math.PI / 2, 0] : axis === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
    return (
      <mesh key={axis} rotation={rot}>
        <planeGeometry args={[SR * 2.3, SR * 2.3]} />
        <meshBasicMaterial color="#ff8ad8" transparent opacity={0.12} side={2} depthWrite={false} />
      </mesh>
    )
  }
  return (
    <>
      <Sphere>
        <Dot p={P0} color="#ffd27a" label="P" />
        <Dot p={img} color="#ff8ad8" label="f(P)" />
        <Dot p={P0.map((c) => -c)} color="#7fd6ff" label="−P" />
        {['x', 'y', 'z'].filter((a) => m[a]).map(plane)}
      </Sphere>
      {Object.entries(MIRROR_LEVERS).map(([k, pos]) => (
        <Lever key={k} pos={pos} on={!!m[k]} label={`${k}-mirror`} />
      ))}
    </>
  )
}

/** Unit vector for the comb axis from a ground click: the upper-hemisphere point above it. */
export function axisFromClick(x, z) {
  const r = Math.hypot(x, z)
  const s = Math.min(r, SR * 0.98)
  const ux = r > 1e-6 ? (x / r) * s : 0
  const uz = r > 1e-6 ? (z / r) * s : 0
  const uy = Math.sqrt(Math.max(0, SR * SR - ux * ux - uz * uz))
  const n = Math.hypot(ux, uy, uz)
  return [ux / n, uy / n, uz / n]
}

/** Tufts combed round `axis` (east along each latitude); the two calm spots are ±axis. */
function Combed({ axis }) {
  const tufts = useMemo(() => {
    const a = axis
    // an orthonormal frame (e1, e2, a)
    const t = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
    const e1 = norm(cross(a, t))
    const e2 = cross(a, e1)
    const out = []
    for (const lat of [-60, -30, 0, 30, 60].map((d) => (d * Math.PI) / 180)) {
      const n = Math.round(14 * Math.cos(lat)) + 2
      for (let i = 0; i < n; i++) {
        const lon = (i / n) * 2 * Math.PI
        const p = add3(scale3(a, Math.sin(lat)), add3(scale3(e1, Math.cos(lat) * Math.cos(lon)), scale3(e2, Math.cos(lat) * Math.sin(lon))))
        const v = cross(a, p) // tangent, pointing "east" round the axis
        const len = Math.hypot(...v)
        out.push({ p: scale3(p, SR * 1.01), q: scale3(add3(p, scale3(v, 0.22 / Math.max(len, 0.2))), SR * 1.01) })
      }
    }
    return out
  }, [axis])
  return (
    <Sphere opacity={0.3}>
      {tufts.map((t, i) => (
        <Line key={i} points={[t.p, t.q]} color="#c8f0a0" lineWidth={2} />
      ))}
      <Dot p={scale3(axis, SR * 1.02)} color="#ff5a5a" label="calm" />
      <Dot p={scale3(axis, -SR * 1.02)} color="#ff5a5a" />
    </Sphere>
  )
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (v) => {
  const n = Math.hypot(...v)
  return v.map((c) => c / n)
}
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale3 = (a, k) => a.map((c) => c * k)

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'hollow')
    return (
      <group>
        <Post />
        <Band segs={bag.segs || MESSY} />
      </group>
    )
  if (id === 'wrap') {
    const { a = 1, b = 1 } = bag.wrap || {}
    return (
      <group>
        <Post label={`deg = ${minus(a)} · ${minus(b)} = ${minus(a * b)}`} />
        {a * b !== 0 && <Band segs={[a * b]} color={a * b < 0 ? '#7fd6ff' : '#ffb347'} />}
        <Lever pos={WRAP_LEVERS.a} on label={`f = z${sup(a)}`} />
        <Lever pos={WRAP_LEVERS.b} on label={`g = z${sup(b)}`} />
      </group>
    )
  }
  if (id === 'antipode') return <Mirrors m={bag.mirrors || {}} />
  if (id === 'hairy')
    return <Combed axis={bag.axis || [0, 1, 0]} />
  return null
}

export default function DynamoGateScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e0c16', water: '#221a40', deep: '#08060e', cloud: '#b8a8f0', spark: '#ffd27a', seed: 26 }} deckColor="#2c2a36" station={Station} />
}
