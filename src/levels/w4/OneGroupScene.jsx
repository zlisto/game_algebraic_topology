import { Html } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * One Group (4-5): Eilenberg–MacLane spaces. K(G, n) has πₙ = G and every other homotopy group 0.
 *   recall — five spaces on pedestals: sort the K(G, 1)s from the rest
 *   kill   — start from S² and attach cells to kill π₃, π₄, π₅ in turn, leaving K(ℤ, 2) = ℂP∞
 */

export const SPACES = [
  { id: 'S1', name: 'S¹', k: true, why: 'π₁ = ℤ, nothing above: K(ℤ, 1)', at: [-3.2, 1.6] },
  { id: 'T', name: 'T²', k: true, why: 'π₁ = ℤ², universal cover ℝ² contractible: K(ℤ², 1)', at: [0, 1.6] },
  { id: 'RPinf', name: 'ℝP∞', k: true, why: 'π₁ = ℤ₂, universal cover S∞ contractible: K(ℤ₂, 1)', at: [3.2, 1.6] },
  { id: 'S2', name: 'S²', k: false, why: 'π₂(S²) = ℤ ≠ 0', at: [-1.6, -1.4] },
  { id: 'RP2', name: 'ℝP²', k: false, why: 'π₂(ℝP²) = π₂(S²) = ℤ ≠ 0', at: [1.6, -1.4] },
]
export const KILLS = [
  { n: 3, before: 'ℤ', cell: 'e⁴' },
  { n: 4, before: '?', cell: 'e⁵' },
  { n: 5, before: '?', cell: 'e⁶' },
]
export const meterPos = (i) => [2.2, 2.0 - i * 1.6]

function Pedestal({ s, mark }) {
  const col = mark === 'yes' ? '#4cff7a' : mark === 'no' ? '#ff8ad8' : '#4a4450'
  return (
    <group position={[s.at[0], 0, s.at[1]]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.5, 8]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={mark ? 0.4 : 0} />
      </mesh>
      <Html position={[0, 0.85, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag">
          {s.name}
          {mark === 'yes' ? ' · K(G,1)' : mark === 'no' ? ' · not' : ''}
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  if (site.id === 'recall') {
    const m = bag.marks || {}
    return (
      <group>
        {SPACES.map((s) => (
          <Pedestal key={s.id} s={s} mark={m[s.id]} />
        ))}
        <Html position={[0, 0.3, 3.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">K(G, 1): π₁ = G, every higher πₙ = 0 · click: yes → no → unset</div>
        </Html>
      </group>
    )
  }
  if (site.id === 'kill') {
    const killed = bag.killed || 0
    return (
      <group>
        <group position={[-2.2, 0, 0.4]}>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.9 + killed * 0.25, 28, 20]} />
            <meshStandardMaterial color="#9fb8ff" transparent opacity={0.35 + killed * 0.1} depthWrite={false} />
          </mesh>
          <Html position={[0, 0.3, 2.2]} center zIndexRange={[10, 0]}>
            <div className="deck-tag">{killed === 0 ? 'S²' : `S² ∪ ${KILLS.slice(0, killed).map((q) => q.cell).join(' ∪ ')}${killed === 3 ? ' ∪ …' : ''}`}</div>
          </Html>
        </group>
        <group position={[meterPos(-1)[0], 0, meterPos(-1)[1]]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.8, 0.6, 1.1]} />
            <meshStandardMaterial color="#3a4a5a" emissive="#ffd27a" emissiveIntensity={0.3} />
          </mesh>
          <Html position={[0, 0.85, 0]} center zIndexRange={[10, 0]}>
            <div className="floor-tag">π₂ = ℤ (keep)</div>
          </Html>
        </group>
        {KILLS.map((q, i) => {
          const [x, z] = meterPos(i)
          const dead = i < killed
          return (
            <group key={q.n} position={[x, 0, z]}>
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[1.8, 0.6, 1.1]} />
                <meshStandardMaterial color={dead ? '#2a2a30' : '#5a3a4a'} emissive={dead ? '#000000' : '#ff8ad8'} emissiveIntensity={dead ? 0 : 0.3} />
              </mesh>
              <Html position={[0, 0.85, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ opacity: dead ? 0.55 : 1 }}>
                  π{'₀₁₂₃₄₅'[q.n]} = {dead ? '0' : q.before}
                </div>
              </Html>
            </group>
          )
        })}
      </group>
    )
  }
  return null
}

export default function OneGroupScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0e12', water: '#1c3038', deep: '#06080a', cloud: '#b0d0d0', spark: '#ffd27a', seed: 45 }} deckColor="#2a3034" station={Station} />
}
