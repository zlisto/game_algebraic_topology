import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Hurewicz Hall (4-6): the Hurewicz map h: πₙ(X) → Hₙ(X). Homotopy meters on the left, homology on
 * the right, a bridge between each pair. Hurewicz: if X is (n−1)-connected, n ≥ 2, then H̃ᵢ(X) = 0
 * for i < n and h: πₙ(X) → Hₙ(X) is an isomorphism; for n = 1, H₁ is π₁ abelianized.
 *   meters — S²: read every pair of meters
 *   first  — S³, S² ∨ S², ℂP²: find each one's first non-zero group, where the bridge holds
 *   dim1   — the figure-eight: π₁ = F(a, b) → H₁ = ℤ², the abelianization
 *   beyond — S²: test the bridges above the first one
 */

export const COLS = {
  meters: { name: 'S²', pi: ['0', 'ℤ', 'ℤ'], H: ['0', 'ℤ', '0'] },
  dim1: { name: 'S¹ ∨ S¹', pi: ['F(a, b)', '0', '0'], H: ['ℤ²', '0', '0'] },
  beyond: { name: 'S²', pi: ['0', 'ℤ', 'ℤ'], H: ['0', 'ℤ', '0'] },
}
export const FIRSTS = [
  { id: 'S3', name: 'S³', pi: ['0', '0', 'ℤ'], H: ['0', '0', 'ℤ'], first: 3, x: -3.2 },
  { id: 'S2vS2', name: 'S² ∨ S²', pi: ['0', 'ℤ²', '…'], H: ['0', 'ℤ²', '0'], first: 2, x: 0 },
  { id: 'CP2', name: 'ℂP²', pi: ['0', 'ℤ', '…'], H: ['0', 'ℤ', '0'], first: 2, x: 3.2 },
]
export const rowZ = (n) => 2.2 - (n - 1) * 1.9
const SUB = '₀₁₂₃₄'

function Meter({ x, z, label, show }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.5, 1.0]} />
        <meshStandardMaterial color={show ? '#3a4a5a' : '#2a2a30'} emissive={show ? '#7fd6ff' : '#000000'} emissiveIntensity={show ? 0.25 : 0} />
      </mesh>
      <Html position={[0, 0.75, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.62rem', opacity: show ? 1 : 0.6 }}>{show ? label : label.split('=')[0] + '= ?'}</div>
      </Html>
    </group>
  )
}

function Bridge({ z, x0 = -1.0, x1 = 1.0, state }) {
  if (!state) return null
  const col = state === 'iso' ? '#4cff7a' : state === 'onto' ? '#ffd27a' : '#ff5a5a'
  return <Line points={[[x0, 0.4, z], [x1, 0.4, z]]} color={col} lineWidth={5} dashed={state === 'none'} dashSize={0.2} gapSize={0.15} />
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'first') {
    const found = bag.found || {}
    return (
      <group>
        {FIRSTS.map((s) => (
          <group key={s.id}>
            {[1, 2, 3].map((n) => (
              <group key={n}>
                <Meter x={s.x - 0.75} z={rowZ(n)} label={`π${SUB[n]} = ${s.pi[n - 1]}`} show={found[s.id] >= n || found[s.id] === s.first} />
                <Meter x={s.x + 0.75} z={rowZ(n) - 0.0} label={`H${SUB[n]} = ${s.H[n - 1]}`} show={found[s.id] >= n || found[s.id] === s.first} />
              </group>
            ))}
            {found[s.id] === s.first && <Bridge z={rowZ(s.first)} x0={s.x - 0.1} x1={s.x + 0.1} state="iso" />}
            <Html position={[s.x, 0.3, 3.7]} center zIndexRange={[10, 0]}>
              <div className="deck-tag">{s.name}</div>
            </Html>
          </group>
        ))}
      </group>
    )
  }
  const C = COLS[id]
  if (!C) return null
  const read = bag.read?.[id] || {}
  const bridges = bag.bridges?.[id] || {}
  return (
    <group>
      {[1, 2, 3].map((n) => (
        <group key={n}>
          <Meter x={-2.2} z={rowZ(n)} label={`π${SUB[n]} = ${C.pi[n - 1]}`} show={read[n] || id !== 'meters'} />
          <Meter x={2.2} z={rowZ(n)} label={`H${SUB[n]} = ${C.H[n - 1]}`} show={read[n] || id !== 'meters'} />
          <Bridge z={rowZ(n)} state={bridges[n]} />
          {id !== 'meters' && (
            <mesh position={[0, 0.15, rowZ(n)]}>
              <cylinderGeometry args={[0.35, 0.4, 0.3, 12]} />
              <meshStandardMaterial color="#4a4450" />
            </mesh>
          )}
        </group>
      ))}
      <Html position={[0, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">{C.name}: homotopy ← h → homology</div>
      </Html>
    </group>
  )
}

export default function HurewiczScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0c12', water: '#1a2a40', deep: '#06080c', cloud: '#c0d0f0', spark: '#7fd6ff', seed: 46 }} deckColor="#2a2e38" station={Station} />
}
