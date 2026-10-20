import { Html, Line } from '@react-three/drei'
import { LETTER_COLORS } from '../w0/Hologram'
import { Lever } from './DynamoGateScene'
import { Arrow } from './TileYardScene'
import YardFrame from './YardFrame'

/**
 * Patchwork Fields (2-8): Mayer–Vietoris. Each deck shows a space X and two patches A (orange) and
 * B (blue) whose interiors cover it. Once both patches are clasped on, a row of the Mayer–Vietoris
 * sequence  … → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B) → …  appears along the north of the deck,
 * with H(X) unknown; exactness pins it down.
 *   hemi    — S² from two caps; A∩B is a band ≃ S¹
 *   annuli  — S¹ from two arcs; A∩B is two short arcs
 *   twist   — the Klein bottle from two Möbius bands; A∩B ≃ S¹, which wraps each band twice
 *   own     — the torus from two annuli; A∩B is two annuli
 */

export const ROWS = {
  hemi: {
    title: 'S² = A ∪ B',
    row: [['H₂(A) ⊕ H₂(B)', '0'], ['H₂(S²)', '?'], ['H₁(A∩B)', 'ℤ'], ['H₁(A) ⊕ H₁(B)', '0']],
    maps: ['', '∂', ''],
    answer: 'ℤ',
  },
  annuli: {
    title: 'S¹ = A ∪ B',
    row: [['H₁(A) ⊕ H₁(B)', '0'], ['H₁(S¹)', '?'], ['H₀(A∩B)', 'ℤ²'], ['H₀(A) ⊕ H₀(B)', 'ℤ²'], ['H₀(S¹)', 'ℤ']],
    maps: ['', '∂', '(x, y) ↦ (x+y, x+y)', ''],
    answer: 'ℤ',
  },
  twist: {
    title: 'K = A ∪ B (Möbius bands)',
    row: [['H₁(A∩B)', 'ℤ'], ['H₁(A) ⊕ H₁(B)', 'ℤ²'], ['H₁(K)', '?'], ['H₀(A∩B)', 'ℤ'], ['H₀(A) ⊕ H₀(B)', 'ℤ²']],
    maps: ['x ↦ (2x, −2x)', '', '∂ = 0', 'one-to-one'],
    answer: 'ℤ ⊕ ℤ₂',
  },
  own: {
    title: 'T = A ∪ B (annuli)',
    row: [['H₁(A∩B)', 'ℤ²'], ['H₁(A) ⊕ H₁(B)', 'ℤ²'], ['H₁(T)', '?'], ['H₀(A∩B)', 'ℤ²'], ['H₀(A) ⊕ H₀(B)', 'ℤ²']],
    maps: ['(x, y) ↦ (x+y, x+y)', '', '∂', '(x, y) ↦ (x+y, x+y)'],
    answer: 'ℤ²',
  },
}
export const CANDIDATES = ['0', 'ℤ', 'ℤ₂', 'ℤ²', 'ℤ ⊕ ℤ₂']
export const PADS = { A: [-4.3, 1.6], B: [4.3, 1.6] }
export const ROW_Z = -2.5
export const rowX = (n, j) => (j - (n - 1) / 2) * (n > 4 ? 2.05 : 2.5)

const ORANGE = '#ff9a5a'
const BLUE = '#7fd6ff'

function circle(r, a0 = 0, a1 = 2 * Math.PI, y = 0.12, n = 64) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [r * Math.cos(a), y, r * Math.sin(a)]
  })
}

/** S² seen from above-side: a translucent ball, cap A on top, cap B underneath, overlapping in a band. */
function TwoCaps({ a, b }) {
  return (
    <group position={[0, 1.6, 1.4]}>
      <mesh>
        <sphereGeometry args={[1.5, 32, 24]} />
        <meshStandardMaterial color="#c8d4e0" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {a && (
        <mesh>
          <sphereGeometry args={[1.53, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={0.4} side={2} depthWrite={false} />
        </mesh>
      )}
      {b && (
        <mesh>
          <sphereGeometry args={[1.56, 32, 16, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.62]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.4} side={2} depthWrite={false} />
        </mesh>
      )}
      {a && b && <Line points={circle(1.58, 0, 2 * Math.PI, 0).map(([x, , z]) => [x, 0, z])} color="#c9a7ff" lineWidth={6} />}
    </group>
  )
}

/** S¹ with arc A over the north and arc B over the south, overlapping near east and west. */
function TwoArcs({ a, b }) {
  const r = 1.7
  return (
    <group position={[0, 0, 1.4]}>
      <Line points={circle(r)} color="#c8d4e0" lineWidth={2} />
      {a && <Line points={circle(r + 0.18, Math.PI - 0.35 + Math.PI, 2 * Math.PI + 0.35 + Math.PI)} color={ORANGE} lineWidth={6} />}
      {b && <Line points={circle(r - 0.18, -0.35, Math.PI + 0.35)} color={BLUE} lineWidth={6} />}
      {a &&
        b &&
        [0, Math.PI].map((c) => <Line key={c} points={circle(r, c - 0.35, c + 0.35, 0.16, 12)} color="#c9a7ff" lineWidth={8} />)}
    </group>
  )
}

/** A square with glued sides (as in the Tile Yard), split into two strips A and B. */
function StripSquare({ a, b, twisted, vertical }) {
  const h = 1.7
  const s = (lo, hi, col) => {
    const w = hi - lo
    const pos = vertical ? [(lo + hi) / 2, 0.07, 0] : [0, 0.07, (lo + hi) / 2]
    const size = vertical ? [w, 2 * h] : [2 * h, w]
    return (
      <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color={col} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    )
  }
  return (
    <group position={[0, 0, 1.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[2 * h, 2 * h]} />
        <meshBasicMaterial color="#3a3a4a" />
      </mesh>
      {/* A: the middle band; B: the two outer bands, which meet across the glued edge */}
      {a && s(-0.95, 0.95, ORANGE)}
      {b && (
        <>
          {s(-h, -0.55, BLUE)}
          {s(0.55, h, BLUE)}
        </>
      )}
      <Arrow from={[-h, h]} to={[h, h]} sign={1} color={LETTER_COLORS[0]} />
      <Arrow from={[-h, -h]} to={[h, -h]} sign={1} color={LETTER_COLORS[0]} />
      <Arrow from={[-h, h]} to={[-h, -h]} sign={1} color={LETTER_COLORS[1]} chevrons={2} />
      <Arrow from={[h, h]} to={[h, -h]} sign={twisted ? -1 : 1} color={LETTER_COLORS[1]} chevrons={2} />
    </group>
  )
}

function MVRow({ id, pick, solved }) {
  const { row, maps } = ROWS[id]
  const n = row.length
  return (
    <group>
      {row.map(([name, g], j) => {
        const x = rowX(n, j)
        const unknown = g === '?'
        const val = unknown ? pick || '?' : g
        const col = unknown ? (solved ? '#4cff7a' : '#ff8ad8') : '#c9a24a'
        return (
          <group key={j} position={[x, 0, ROW_Z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <ringGeometry args={[0.62, 0.78, 36]} />
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
            <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.85rem', color: unknown ? col : '#ffe6a8' }}>{val}</div>
            </Html>
            <Html position={[0, 0.3, 1.05]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.62rem' }}>{name}</div>
            </Html>
          </group>
        )
      })}
      {maps.map((m, i) => (
        <group key={i}>
          <Line points={[[rowX(n, i) + 0.8, 0.1, ROW_Z], [rowX(n, i + 1) - 0.8, 0.1, ROW_Z]]} color="#9fe6ff" lineWidth={2} />
          {m && (
            <Html position={[(rowX(n, i) + rowX(n, i + 1)) / 2, 0.3, ROW_Z - 0.75]} center zIndexRange={[10, 0]}>
              <div style={{ color: '#9fe6ff', fontSize: '0.6rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{m}</div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (!ROWS[id]) return null
  const p = bag.patches?.[id] || {}
  const both = p.A && p.B
  return (
    <group>
      {id === 'hemi' && <TwoCaps a={p.A} b={p.B} />}
      {id === 'annuli' && <TwoArcs a={p.A} b={p.B} />}
      {id === 'twist' && <StripSquare a={p.A} b={p.B} twisted />}
      {id === 'own' && <StripSquare a={p.A} b={p.B} />}
      <Lever pos={PADS.A} on={!!p.A} label="patch A" />
      <Lever pos={PADS.B} on={!!p.B} label="patch B" />
      {both && <MVRow id={id} pick={bag.pick?.[id]} solved={bag.pick?.[id] === ROWS[id].answer} />}
    </group>
  )
}

export default function PatchworkScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e1210', water: '#1e3424', deep: '#081008', cloud: '#c8d8b0', spark: '#ffe6a8', seed: 28 }} deckColor="#2c3230" station={Station} />
}
