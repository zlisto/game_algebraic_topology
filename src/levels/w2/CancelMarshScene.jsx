import { Html } from '@react-three/drei'
import ChainDeck, { d1, d2 } from './ChainDeck'
import YardFrame from './YardFrame'

/**
 * Cancel Marsh (2-2): on each deck a small Δ-complex whose chains the Boundary Blade works on.
 *   first_cut — one triangle [v0 v1 v2]; cutting it shows its boundary
 *   shared    — a fan of four triangles round v4; the inside edges must cancel
 *   nothing   — the fan's rim, ready to be cut again: ∂∂ = 0
 *   missing   — a filled triangle and a missing one beside it
 */

const H = 2.4
const SQ = { 0: [-H, H], 1: [H, H], 2: [H, -H], 3: [-H, -H] }
export const COMPLEXES = {
  first_cut: { V: { 0: SQ[0], 1: SQ[1], 2: SQ[2] }, E: [[0, 1], [1, 2], [0, 2]], T: [{ v: [0, 1, 2] }] },
  shared: {
    V: { ...SQ, 4: [0, 0] },
    E: [[0, 1], [1, 2], [2, 3], [0, 3], [0, 4], [1, 4], [2, 4], [3, 4]],
    T: [{ v: [0, 1, 4] }, { v: [1, 2, 4] }, { v: [2, 3, 4] }, { v: [0, 3, 4] }],
  },
  nothing: { V: SQ, E: [[0, 1], [1, 2], [2, 3], [0, 3]] },
  missing: { V: SQ, E: [[0, 1], [1, 2], [2, 3], [0, 3], [0, 2]], T: [{ v: [0, 1, 2] }, { v: [0, 2, 3], filled: false }] },
}
/** The rim of the fan, [v0v1] + [v1v2] + [v2v3] − [v0v3]. */
export const RIM = { '0-1': 1, '1-2': 1, '2-3': 1, '0-3': -1 }

/** The chain each deck shows, from the level's state. */
export function deckChains(id, bag) {
  const cx = COMPLEXES[id]
  const verts = Object.keys(cx.V).map(Number)
  if (id === 'first_cut' || id === 'shared') {
    const tri = bag.tri?.[id] || {}
    return { triCoef: tri, edgeCoef: d2(tri) }
  }
  if (id === 'nothing') {
    const spent = bag.spent?.[id] || {}
    const cut = Object.fromEntries(Object.keys(spent).map((k) => [k, RIM[k]]))
    return { edgeCoef: RIM, spent, vertCoef: d1(cut, verts) }
  }
  const edge = bag.edge?.[id] || {}
  return { edgeCoef: edge, vertCoef: d1(edge, verts) }
}

export function Station(site, { bag, live }) {
  const cx = COMPLEXES[site.id]
  if (!cx) return null
  return (
    <>
      <ChainDeck complex={cx} live={live} {...deckChains(site.id, bag)} />
      {site.id === 'missing' && (
        <Html position={[-0.8, 0.3, -0.8]} center zIndexRange={[10, 0]}>
          <div className="deck-tag" style={{ opacity: live ? 1 : 0.6 }}>missing tile</div>
        </Html>
      )}
    </>
  )
}

export default function CancelMarshScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0b120e', water: '#1a2c22', deep: '#070e0a', cloud: '#a8c0a0', spark: '#c8ff88', seed: 22 }} deckColor="#28302a" station={Station} />
}
