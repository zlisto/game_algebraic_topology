import { Html } from '@react-three/drei'
import { Lever } from '../w2/DynamoGateScene'
import YardFrame from '../w2/YardFrame'

/**
 * Product Parterre (3-5): the Künneth formula. With field coefficients (or free cohomology),
 * H*(X × Y) ≅ H*(X) ⊗ H*(Y): every class a ∈ Hᵖ(X) and b ∈ H^q(Y) give a cross product a × b in
 * degree p + q. The parterre is a grid of beds — rows are H*(X), columns H*(Y) — and degree bins
 * along the north edge.
 *   row_col        — S¹ × S¹: put each bed in its degree bin
 *   sphere_sphere  — S² × S²: the same
 *   torsion_soil   — ℝP² × ℝP² with ℤ₂ coefficients: pick every bed of degree 2
 *   design_parterre — choose X and Y so the bins read 1, 1, 1, 1
 */

export const SPACES = {
  S1: { name: 'S¹', classes: [['1', 0], ['α', 1]] },
  S2: { name: 'S²', classes: [['1', 0], ['γ', 2]] },
  T: { name: 'T', classes: [['1', 0], ['α', 1], ['β', 1], ['αβ', 2]] },
  RP2: { name: 'ℝP²', classes: [['1', 0], ['a', 1], ['a²', 2]] },
}
export const BEDS = {
  row_col: ['S1', 'S1'],
  sphere_sphere: ['S2', 'S2'],
  torsion_soil: ['RP2', 'RP2'],
}
export const DESIGN_CHOICES = ['S1', 'S2', 'T']
export const DESIGN_TARGET = [1, 1, 1, 1]
export const MAXDEG = 4
export const LEVERS = { X: [-4.3, 1.4], Y: [4.3, 1.4] }
export const binPos = (n) => [-3.2 + n * 1.6, -3.7]

export function spacesOf(id, bag) {
  if (id === 'design_parterre') return [bag.design?.X || 'S1', bag.design?.Y || 'S1']
  return BEDS[id]
}
export function beds(id, bag) {
  const [X, Y] = spacesOf(id, bag)
  const rows = SPACES[X].classes
  const cols = SPACES[Y].classes
  const sp = rows.length > 3 || cols.length > 3 ? 1.05 : 1.3
  const out = []
  rows.forEach(([a, p], i) =>
    cols.forEach(([b, q], j) => {
      out.push({ key: `${i}-${j}`, a, b, deg: p + q, pos: [(j - (cols.length - 1) / 2) * sp, 1.3 + (i - (rows.length - 1) / 2) * sp] })
    }),
  )
  return out
}
export const ranks = (list) => Array.from({ length: MAXDEG + 1 }, (_, n) => list.filter((b) => b.deg === n).length)

const label = (a, b) => (a === '1' && b === '1' ? '1' : a === '1' ? `1×${b}` : b === '1' ? `${a}×1` : `${a}×${b}`)

function Bed({ bed, state }) {
  const col = state === 'placed' ? '#3a5a3a' : state === 'picked' ? '#ffb347' : state === 'sel' ? '#ff8ad8' : '#3a3428'
  return (
    <group position={[bed.pos[0], 0, bed.pos[1]]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={state && state !== 'placed' ? 0.6 : 0} />
      </mesh>
      <Html position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.62rem', opacity: state === 'placed' ? 0.5 : 1 }}>{label(bed.a, bed.b)}</div>
      </Html>
    </group>
  )
}

function Bin({ n, count, target, live }) {
  const [x, z] = binPos(n)
  const ok = target === undefined ? null : count === target
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 20]} />
        <meshStandardMaterial color={ok ? '#4cff7a' : '#4a4038'} emissive={ok ? '#2a8a3a' : '#000000'} emissiveIntensity={ok ? 0.5 : 0} transparent opacity={live ? 1 : 0.6} />
      </mesh>
      <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.64rem', textAlign: 'center' }}>
          H{'⁰¹²³⁴'[n]}: {count}
          {target !== undefined ? ` / ${target}` : ''}
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag, live }) {
  const id = site.id
  if (!BEDS[id] && id !== 'design_parterre') return null
  const list = beds(id, bag)
  const [X, Y] = spacesOf(id, bag)
  const placed = bag.placed?.[id] || {}
  const picked = bag.picked?.[id] || {}
  const sel = bag.sel?.[id]
  const counts = id === 'design_parterre' ? ranks(list) : id === 'torsion_soil' ? ranks(list.filter((b) => picked[b.key])) : ranks(list.filter((b) => placed[b.key]))
  return (
    <group>
      {list.map((b) => (
        <Bed key={b.key} bed={b} state={placed[b.key] ? 'placed' : picked[b.key] ? 'picked' : sel === b.key ? 'sel' : null} />
      ))}
      {Array.from({ length: MAXDEG + 1 }, (_, n) => (
        <Bin key={n} n={n} count={counts[n]} target={id === 'design_parterre' ? DESIGN_TARGET[n] ?? 0 : undefined} live={live} />
      ))}
      <Html position={[0, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          rows: H*({SPACES[X].name}) · columns: H*({SPACES[Y].name}){id === 'torsion_soil' ? ' · ℤ₂ coefficients' : ''}
        </div>
      </Html>
      {id === 'design_parterre' && (
        <>
          <Lever pos={LEVERS.X} on label={`X = ${SPACES[X].name}`} />
          <Lever pos={LEVERS.Y} on label={`Y = ${SPACES[Y].name}`} />
        </>
      )}
    </group>
  )
}

export default function ProductPlacementScene(props) {
  return <YardFrame {...props} sky={{ bg: '#100e08', water: '#3a3018', deep: '#0a0804', cloud: '#e8d8a8', spark: '#ffe6a8', seed: 35 }} deckColor="#34302a" station={Station} />
}
