import { Html } from '@react-three/drei'
import ChainDeck, { d2, ekey } from '../w2/ChainDeck'
import { COMPLEXES } from '../w2/CancelMarshScene'
import YardFrame from '../w2/YardFrame'

/**
 * Mirror Pools (3-1): cochains. A 1-cochain φ reads a number off every edge; its coboundary reads
 * a triangle by reading the triangle's boundary, δφ(σ) = φ(∂σ). A 0-cochain f reads the points,
 * and δf[v w] = f(w) − f(v). Edge badges show φ, triangle badges δφ, point badges f.
 *   read_edge   — one triangle: make it balance (δφ = 0)
 *   balanced    — the fan: the rim is fixed; set the spokes so every triangle balances
 *   from_points — set point values so δf matches the target on every edge
 *   around_hole — a filled tile beside a missing one: a cocycle that no point values give
 */

const H = 2.4
const SQ = { 0: [-H, H], 1: [H, H], 2: [H, -H], 3: [-H, -H] }
export const DECKS = {
  read_edge: COMPLEXES.first_cut,
  balanced: COMPLEXES.shared,
  from_points: { V: SQ, E: [[0, 1], [1, 2], [2, 3], [0, 3], [0, 2]], T: [{ v: [0, 1, 2] }, { v: [0, 2, 3] }] },
  around_hole: COMPLEXES.missing,
}
export const START = {
  read_edge: { '0-1': 1, '1-2': 2, '0-2': 0 },
  balanced: { '0-1': 1, '1-2': 0, '2-3': 1, '0-3': 2, '0-4': 0, '1-4': 0, '2-4': 0, '3-4': 0 },
  around_hole: {},
}
export const LOCKED = { balanced: ['0-1', '1-2', '2-3', '0-3'] }
export const TARGET = { '0-1': 1, '1-2': 1, '2-3': -1, '0-3': 1, '0-2': 2 }

/** δφ on each filled triangle: φ applied to ∂σ. */
export function delta1(cx, phi) {
  const out = {}
  for (const t of cx.T || []) {
    if (t.filled === false) continue
    const k = t.v.join('-')
    const b = d2({ [k]: 1 })
    out[k] = Object.entries(b).reduce((s, [e, c]) => s + c * (phi[e] || 0), 0)
  }
  return out
}
/** δf on each edge: f(w) − f(v). */
export function delta0(cx, f) {
  return Object.fromEntries(cx.E.map(([a, b]) => [ekey(a, b), (f[b] || 0) - (f[a] || 0)]))
}
export const phiOf = (id, bag) => ({ ...(START[id] || {}), ...(bag.phi?.[id] || {}) })

function TargetTags({ cx }) {
  return cx.E.map(([a, b]) => {
    const [p, q] = [cx.V[a], cx.V[b]]
    const n = TARGET[ekey(a, b)]
    return (
      <Html key={`${a}-${b}`} position={[(p[0] + q[0]) / 2 - (q[1] - p[1]) * 0.16, 0.4, (p[1] + q[1]) / 2 + (q[0] - p[0]) * 0.16]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.62rem', color: '#ff8ad8' }}>
          want {n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0'}
        </div>
      </Html>
    )
  })
}

export function Station(site, { bag, live }) {
  const id = site.id
  const cx = DECKS[id]
  if (!cx) return null
  if (id === 'from_points') {
    const f = { 0: 0, 1: 0, 2: 0, 3: 0, ...(bag.f || {}) }
    return (
      <group>
        <ChainDeck complex={cx} live={live} edgeCoef={delta0(cx, f)} vertCoef={f} labels />
        <TargetTags cx={cx} />
      </group>
    )
  }
  const phi = phiOf(id, bag)
  const dphi = delta1(cx, phi)
  return (
    <group>
      <ChainDeck complex={cx} live={live} edgeCoef={phi} triCoef={dphi} />
      {id === 'around_hole' && (
        <Html position={[-0.8, 0.3, -0.8]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">missing tile</div>
        </Html>
      )}
    </group>
  )
}

export default function ReverseEngineeringScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0e16', water: '#2a3a5a', deep: '#06080e', cloud: '#c8d4f0', spark: '#e0e8ff', seed: 31 }} deckColor="#2e323c" station={Station} />
}
