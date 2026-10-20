import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { Arrow } from './TileYardScene'

/**
 * A small Δ-complex laid out on a deck, drawn so its chains can be read off at a glance:
 * vertices as studs labelled v0, v1, …; each edge [a b] (a < b) with an arrow from a to b;
 * each triangle tinted by its coefficient. Coefficients are shown as badges: amber for +,
 * blue for −; zero is left unmarked.
 *   complex  { V: {id: [x, z]}, E: [[a, b]], T: [{ v: [a, b, c], filled }] }
 *   triCoef  { 'a-b-c': n }   edgeCoef { 'a-b': n }   vertCoef { id: n }   spent { 'a-b': true }
 */

export const POS = '#ffb347'
export const NEG = '#7fd6ff'
const ZERO = '#56605a'
const colorOf = (n) => (n > 0 ? POS : n < 0 ? NEG : ZERO)
const fmt = (n) => (n > 0 ? `+${n}` : `−${-n}`)
export const ekey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`
export const tkey = (v) => v.join('-')

function Badge({ at, n, small }) {
  if (!n) return null
  return (
    <Html position={[at[0], 0.5, at[1]]} center zIndexRange={[10, 0]}>
      <div className="floor-tag" style={{ color: colorOf(n), borderColor: colorOf(n), fontSize: small ? '0.7rem' : undefined }}>
        {fmt(n)}
      </div>
    </Html>
  )
}

function Fill({ pts, color, opacity }) {
  const arr = useMemo(() => new Float32Array(pts.flatMap(([x, z]) => [x, 0.06, z])), [pts])
  return (
    <mesh>
      <bufferGeometry key={arr.join(',')}>
        <bufferAttribute attach="attributes-position" array={arr} count={3} itemSize={3} />
      </bufferGeometry>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={2} depthWrite={false} />
    </mesh>
  )
}

export default function ChainDeck({ complex, triCoef = {}, edgeCoef = {}, vertCoef = {}, spent = {}, live, labels = true }) {
  const { V, E, T = [] } = complex
  return (
    <group>
      {T.map((t) => {
        const k = tkey(t.v)
        const n = triCoef[k] || 0
        const pts = t.v.map((i) => V[i])
        const c = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3]
        return (
          <group key={k}>
            {t.filled !== false && <Fill pts={pts} color={n ? colorOf(n) : '#33463c'} opacity={n ? 0.4 : 0.85} />}
            {t.filled !== false && labels && (
              <Html position={[c[0], 0.3, c[1]]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ color: n ? colorOf(n) : '#c8d4cc', borderColor: n ? colorOf(n) : '#56605a', opacity: live ? 1 : 0.6 }}>
                  {n ? `${fmt(n)} ` : ''}[{t.v.join(' ')}]
                </div>
              </Html>
            )}
          </group>
        )
      })}
      {E.map(([a, b]) => {
        const k = ekey(a, b)
        const n = spent[k] ? 0 : edgeCoef[k] || 0
        const [p, q] = [V[a], V[b]]
        return (
          <group key={k}>
            <Arrow from={p} to={q} sign={1} color={spent[k] ? '#3a403c' : colorOf(n)} glow={!!n && live} />
            <Badge at={[(p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.12, (p[1] + q[1]) / 2 - (q[0] - p[0]) * 0.12]} n={n} small />
          </group>
        )
      })}
      {Object.entries(V).map(([id, [x, z]]) => (
        <group key={id} position={[x, 0, z]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.32, 16]} />
            <meshStandardMaterial color="#e8e0c8" emissive="#ffe6a8" emissiveIntensity={live ? 0.5 : 0.15} />
          </mesh>
          {labels && (
            <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ opacity: live ? 1 : 0.6 }}>
                v{id}
                {vertCoef[id] !== undefined && <b style={{ color: colorOf(vertCoef[id]), marginLeft: 4 }}>{vertCoef[id] ? fmt(vertCoef[id]) : '0'}</b>}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}

/** What a click at local (x, z) lands on: an edge (within 0.45 of it) or a filled triangle. */
export function pickCell(complex, x, z) {
  const { V, E, T = [] } = complex
  let best = null
  let bd = 0.45
  for (const [a, b] of E) {
    const [p, q] = [V[a], V[b]]
    const dx = q[0] - p[0]
    const dz = q[1] - p[1]
    const L2 = dx * dx + dz * dz
    const s = Math.max(0, Math.min(1, ((x - p[0]) * dx + (z - p[1]) * dz) / L2))
    const d = Math.hypot(x - p[0] - s * dx, z - p[1] - s * dz)
    if (d < bd) [best, bd] = [{ edge: ekey(a, b) }, d]
  }
  if (best) return best
  for (const t of T) {
    if (t.filled === false) continue
    const [A, B, C] = t.v.map((i) => V[i])
    const sgn = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1])
    const d1 = sgn([x, z], A, B)
    const d2 = sgn([x, z], B, C)
    const d3 = sgn([x, z], C, A)
    const neg = d1 < 0 || d2 < 0 || d3 < 0
    const pos = d1 > 0 || d2 > 0 || d3 > 0
    if (!(neg && pos)) return { tri: tkey(t.v) }
  }
  return null
}

/** ∂ of a 2-chain {'a-b-c': n} → 1-chain {'a-b': n}: ∂[a b c] = [b c] − [a c] + [a b]. */
export function d2(triCoef) {
  const out = {}
  for (const [k, n] of Object.entries(triCoef)) {
    if (!n) continue
    const [a, b, c] = k.split('-').map(Number)
    for (const [e, s] of [
      [ekey(b, c), 1],
      [ekey(a, c), -1],
      [ekey(a, b), 1],
    ])
      out[e] = (out[e] || 0) + s * n
  }
  return out
}

/** ∂ of a 1-chain {'a-b': n} → 0-chain {v: n}: ∂[a b] = b − a. */
export function d1(edgeCoef, verts) {
  const out = Object.fromEntries((verts || []).map((v) => [v, 0]))
  for (const [k, n] of Object.entries(edgeCoef)) {
    if (!n) continue
    const [a, b] = k.split('-').map(Number)
    out[a] = (out[a] || 0) - n
    out[b] = (out[b] || 0) + n
  }
  return out
}

export const isZeroChain = (c) => Object.values(c).every((n) => !n)
export const sameChain = (c1, c2, s = 1) => [...new Set([...Object.keys(c1), ...Object.keys(c2)])].every((k) => (c1[k] || 0) === s * (c2[k] || 0))
