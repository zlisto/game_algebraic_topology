import { Html, Line } from '@react-three/drei'
import { Lever } from '../w2/DynamoGateScene'
import YardFrame from '../w2/YardFrame'

/**
 * The Seam (3-8): Poincaré duality. For a closed R-orientable n-manifold, Hᵏ(M; R) ≅ Hₙ₋ₖ(M; R)
 * (cap product with the fundamental class). Towers on the left are the groups Hᵏ in degree k; on
 * the right, homology Hⱼ; duality links degree k on one side with n − k on the other.
 *   twin_towers   — the torus: pair each cohomology tower with its homology twin
 *   dual_cells    — the torus' cells and their dual cells: a k-cell crosses one (n−k)-cell
 *   broken_mirror — ℝP²: with ℤ coefficients the pairs don't match; switch to ℤ₂
 *   across_seam   — the 3-torus: given H⁰…H³, raise the homology towers to match
 */

export const TOWERS = {
  twin_towers: { n: 2, name: 'T', coh: ['ℤ', 'ℤ²', 'ℤ'], hom: ['ℤ', 'ℤ²', 'ℤ'] },
  broken_mirror: {
    n: 2,
    name: 'ℝP²',
    Z: { coh: ['ℤ', '0', 'ℤ₂'], hom: ['ℤ', 'ℤ₂', '0'] },
    Z2: { coh: ['ℤ₂', 'ℤ₂', 'ℤ₂'], hom: ['ℤ₂', 'ℤ₂', 'ℤ₂'] },
  },
  across_seam: { n: 3, name: 'T³', coh: ['ℤ', 'ℤ³', 'ℤ³', 'ℤ'] },
}
export const RANKS = ['0', 'ℤ', 'ℤ²', 'ℤ³']
export const towerPos = (side, k, n) => [side * 2.7, 2.6 - (k * 5.0) / Math.max(n, 1)]
const height = (g) => (g === '0' ? 0.12 : g.startsWith('ℤ₂') ? 0.5 : g === 'ℤ' ? 0.9 : g === 'ℤ²' ? 1.5 : 2.1)

function Tower({ pos, g, label, sel, ok }) {
  const h = height(g)
  const col = ok === false ? '#ff5a5a' : ok ? '#4cff7a' : sel ? '#ff8ad8' : g === '0' ? '#3a3a40' : g.includes('₂') ? '#c9a7ff' : '#ffb347'
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.7, h, 0.7]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={sel || ok ? 0.6 : 0.15} />
      </mesh>
      <Html position={[0, h + 0.4, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.64rem' }}>
          {label} = {g}
        </div>
      </Html>
    </group>
  )
}

function Seam() {
  return <Line points={[[0, 0.1, -4.4], [0, 0.1, 4.4]]} color="#ff8ad8" lineWidth={3} dashed dashSize={0.3} gapSize={0.18} />
}

const SUB = ['₀', '₁', '₂', '₃']
const SUP = ['⁰', '¹', '²', '³']

/** The torus square and its dual: the dual vertex is the centre, dual edges cross the edges, the dual face is everything. */
function DualTorus({ lit }) {
  const H = 2.0
  const sq = [[-H, H], [H, H], [H, -H], [-H, -H], [-H, H]].map(([x, z]) => [x, 0.12, z])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[2 * H, 2 * H]} />
        <meshBasicMaterial color={lit.v ? '#4a3a6a' : '#2e3438'} />
      </mesh>
      <Line points={sq} color="#c8d4e0" lineWidth={3} />
      {/* the original cells, as click targets: the vertex (corner), edges a (south/north) and b (west/east), the face (middle) */}
      <mesh position={[-H, 0.25, H]}>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshBasicMaterial color={lit.v ? '#ffd27a' : '#fff2c4'} />
      </mesh>
      <Html position={[0, 0.3, H + 0.45]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ color: lit.a ? '#ffd27a' : undefined }}>a</div>
      </Html>
      <Html position={[H + 0.45, 0.3, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ color: lit.b ? '#ffd27a' : undefined }}>b</div>
      </Html>
      {/* the dual cells */}
      {lit.f && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.26, 16, 12]} />
          <meshStandardMaterial color="#ff8ad8" emissive="#ff8ad8" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      )}
      {lit.a && <Line points={[[0, 0.16, -H], [0, 0.16, H]]} color="#ff8ad8" lineWidth={5} />}
      {lit.b && <Line points={[[-H, 0.16, 0], [H, 0.16, 0]]} color="#ff8ad8" lineWidth={5} />}
      <Html position={[0, 0.3, -H - 0.6]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.62rem' }}>dual cells in pink</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'dual_cells') return <DualTorus lit={bag.dual || {}} />
  const T = TOWERS[id]
  if (!T) return null
  const coef = id === 'broken_mirror' ? bag.coef || 'Z' : null
  const coh = coef ? T[coef].coh : T.coh
  const hom = id === 'across_seam' ? T.coh.map((_, j) => bag.hom?.[j] ?? (j < 2 ? ['ℤ', 'ℤ³'][j] : '0')) : coef ? T[coef].hom : T.hom
  const pairs = bag.pairs?.[id] || {}
  const sel = bag.sel?.[id]
  return (
    <group>
      <Seam />
      {coh.map((g, k) => (
        <Tower key={`c${k}`} pos={towerPos(-1, k, T.n)} g={g} label={`H${SUP[k]}`} sel={sel === k} ok={pairs[k] === undefined ? undefined : pairs[k]} />
      ))}
      {hom.map((g, j) => (
        <Tower key={`h${j}`} pos={towerPos(1, T.n - j, T.n)} g={g} label={`H${SUB[j]}`} ok={id === 'across_seam' ? (g === coh[T.n - j] ? true : undefined) : Object.entries(pairs).some(([k, v]) => v && T.n - Number(k) === j) ? true : undefined} />
      ))}
      <Html position={[-2.7, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">cohomology of {T.name}</div>
      </Html>
      <Html position={[2.7, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">homology</div>
      </Html>
      {id === 'broken_mirror' && <Lever pos={[0, 3.9]} on={coef === 'Z2'} label={`coefficients ${coef === 'Z2' ? 'ℤ₂' : 'ℤ'}`} />}
    </group>
  )
}

export default function BothSidesScene(props) {
  return <YardFrame {...props} sky={{ bg: '#100a10', water: '#3a1a34', deep: '#0a060a', cloud: '#e8b8d8', spark: '#ff8ad8', seed: 38 }} deckColor="#32282e" station={Station} />
}
