import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Weak Spot (4-3): Whitehead's theorem. Two rooms X and Y, each with a column of homotopy meters
 * π₁, π₂, π₃. A map f: X → Y sends runners from each meter to the matching one; a runner glows
 * green when f* is an isomorphism on that πₙ. If every runner is green, f is a weak equivalence —
 * and between CW complexes, Whitehead says, a homotopy equivalence.
 *   match — S¹ ↪ ℝ² − 0: every runner green
 *   weak  — S² → a point: the π₂ runner fails
 *   nomap — ℝP² and S² × ℝP∞: the same groups, but no map to carry them
 *   sort  — four pairs: which does Whitehead certify?
 */

export const ROOMS = {
  match: { X: 'S¹', Y: 'ℝ² − 0', map: 'inclusion', gx: ['ℤ', '0', '0'], gy: ['ℤ', '0', '0'], iso: [true, true, true] },
  weak: { X: 'S²', Y: 'a point', map: 'collapse', gx: ['0', 'ℤ', 'ℤ'], gy: ['0', '0', '0'], iso: [true, false, false] },
  nomap: { X: 'ℝP²', Y: 'S² × ℝP∞', map: null, gx: ['ℤ₂', 'ℤ', 'ℤ'], gy: ['ℤ₂', 'ℤ', 'ℤ'], iso: [null, null, null] },
}
export const PAIRS = [
  { id: 'p1', label: 'S¹ ↪ ℝ² − 0', ok: true, at: [-2.6, 1.4] },
  { id: 'p2', label: 'core circle ↪ Möbius band', ok: true, at: [2.6, 1.4] },
  { id: 'p3', label: 'S² → point', ok: false, at: [-2.6, -1.4] },
  { id: 'p4', label: 'ℝP² vs S² × ℝP∞', ok: false, at: [2.6, -1.4] },
]
export const meterPos = (side, n) => [side * 2.8, 2.0 - (n - 1) * 1.8]

function Meter({ pos, g, n, sp }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.3, 0.6, 1.0]} />
        <meshStandardMaterial color="#2e3440" />
      </mesh>
      <Html position={[0, 0.85, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.66rem' }}>
          π{'₁₂₃'[n - 1]}({sp}) = {g}
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'sort') {
    const bins = bag.bins || {}
    return (
      <group>
        {PAIRS.map((p) => {
          const b = bins[p.id]
          const col = b === 'yes' ? '#4cff7a' : b === 'no' ? '#ff8ad8' : '#4a4450'
          return (
            <group key={p.id} position={[p.at[0], 0, p.at[1]]}>
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[2.6, 0.4, 1.4]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={b ? 0.4 : 0} />
              </mesh>
              <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.64rem' }}>
                  {p.label}
                  {b ? (b === 'yes' ? ' · equivalent' : ' · not certified') : ''}
                </div>
              </Html>
            </group>
          )
        })}
        <Html position={[0, 0.3, 3.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">click: equivalent → not certified → unset</div>
        </Html>
      </group>
    )
  }
  const R = ROOMS[id]
  if (!R) return null
  const sent = bag.sent?.[id] || {}
  return (
    <group>
      {[1, 2, 3].map((n) => (
        <group key={n}>
          <Meter pos={meterPos(-1, n)} g={R.gx[n - 1]} n={n} sp={R.X} />
          <Meter pos={meterPos(1, n)} g={R.gy[n - 1]} n={n} sp={R.Y} />
          {sent[n] && (
            <Line
              points={[[meterPos(-1, n)[0] + 0.7, 0.4, meterPos(-1, n)[1]], [meterPos(1, n)[0] - 0.7, 0.4, meterPos(1, n)[1]]]}
              color={R.map ? (R.iso[n - 1] ? '#4cff7a' : '#ff5a5a') : '#6a6a74'}
              lineWidth={R.map ? 5 : 2}
              dashed={!R.map}
              dashSize={0.25}
              gapSize={0.2}
            />
          )}
        </group>
      ))}
      <Html position={[0, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">{R.map ? `f: ${R.X} → ${R.Y} (${R.map})` : `${R.X} and ${R.Y}: no map`}</div>
      </Html>
    </group>
  )
}

export default function WeakSpotScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e0a10', water: '#2a1a30', deep: '#08060a', cloud: '#d8b8d0', spark: '#ff8ad8', seed: 43 }} deckColor="#30282e" station={Station} />
}
