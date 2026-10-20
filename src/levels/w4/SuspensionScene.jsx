import { Html } from '@react-three/drei'
import { Lever } from '../w2/DynamoGateScene'
import YardFrame from '../w2/YardFrame'

/**
 * Sling Landing (4-4): suspension and Freudenthal. The Sling lifts a map f: Sⁱ → Sⁿ to its
 * suspension Σf: Sⁱ⁺¹ → Sⁿ⁺¹. The shaft has one floor per group πᵢ(Sⁿ); the map rides up it.
 * Freudenthal: πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹) is an isomorphism for i < 2n − 1 (onto for i = 2n − 1).
 *   upone  — dial a degree for f: S¹ → S¹, then sling it up to S² → S²
 *   degree — sling a degree-k map from π₁(S¹) to π₃(S³): the degree survives
 *   stable — a board of suspension maps: mark the isomorphisms
 *   climb  — the Hopf class in π₃(S²), slung up stem 1: ℤ, then ℤ₂, ℤ₂, …
 */

export const SHAFTS = {
  upone: [{ g: 'π₁(S¹)', v: 'ℤ' }, { g: 'π₂(S²)', v: 'ℤ' }],
  degree: [{ g: 'π₁(S¹)', v: 'ℤ' }, { g: 'π₂(S²)', v: 'ℤ' }, { g: 'π₃(S³)', v: 'ℤ' }],
  climb: [{ g: 'π₃(S²)', v: 'ℤ', cls: 'η' }, { g: 'π₄(S³)', v: 'ℤ₂', cls: 'Ση' }, { g: 'π₅(S⁴)', v: 'ℤ₂', cls: 'Σ²η' }, { g: 'π₆(S⁵)', v: 'ℤ₂', cls: 'Σ³η' }],
}
/** The board: suspension πₙ₊ₖ(Sⁿ) → πₙ₊ₖ₊₁(Sⁿ⁺¹) for stem k and n = 1…4. */
export const BOARD = [0, 1].flatMap((k) => [1, 2, 3, 4].map((n) => ({ k, n, i: n + k, iso: n + k < 2 * n - 1 })))
export const boardPos = (k, n) => [(n - 2.5) * 2.0, k === 0 ? 0.6 : -1.6]
export const DIAL = [-3.8, 2.6]
export const SLING = [3.8, 2.6]
const SUB = '₀₁₂₃₄₅₆₇'
const SUP = '⁰¹²³⁴⁵⁶'

function Shaft({ floors, at, label }) {
  return (
    <group>
      {floors.map((f, i) => {
        const z = 2.4 - i * (5.4 / Math.max(floors.length - 1, 1))
        const on = i === at
        const col = on ? '#ffd27a' : i < at ? '#5a6a50' : '#3a3a44'
        return (
          <group key={i} position={[0, 0, z]}>
            <mesh position={[0, 0.1 + i * 0.25, 0]}>
              <boxGeometry args={[2.4, 0.2 + i * 0.5, 1.2]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={on ? 0.8 : 0.1} />
            </mesh>
            <Html position={[0, 0.6 + i * 0.5, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.66rem', opacity: on || i < at ? 1 : 0.6 }}>
                {f.g} = {f.v}
                {on && label ? ` · ${label}` : ''}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'stable') {
    const marked = bag.marked || {}
    return (
      <group>
        {BOARD.map((b) => {
          const [x, z] = boardPos(b.k, b.n)
          const m = marked[`${b.k}-${b.n}`]
          return (
            <group key={`${b.k}-${b.n}`} position={[x, 0, z]}>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[1.8, 0.24, 1.6]} />
                <meshStandardMaterial color={m ? '#3a5a3a' : '#3a3440'} emissive={m ? '#4cff7a' : '#000000'} emissiveIntensity={m ? 0.35 : 0} />
              </mesh>
              <Html position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.56rem', textAlign: 'center' }}>
                  π{SUB[b.i]}(S{SUP[b.n]}) → π{SUB[b.i + 1]}(S{SUP[b.n + 1]})
                  {m ? <><br />≅</> : null}
                </div>
              </Html>
            </group>
          )
        })}
        <Html position={[-4.4, 0.3, 0.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">stem 0</div>
        </Html>
        <Html position={[-4.4, 0.3, -1.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">stem 1</div>
        </Html>
      </group>
    )
  }
  const floors = SHAFTS[id]
  if (!floors) return null
  const at = bag.at?.[id] || 0
  const deg = bag.deg ?? 1
  const label = id === 'climb' ? floors[at].cls : `degree ${deg}`
  return (
    <group>
      <Shaft floors={floors} at={at} label={label} />
      {id !== 'climb' && <Lever pos={DIAL} on label={`degree ${deg}`} />}
      <Lever pos={SLING} on={at === floors.length - 1} label="sling up (Σ)" />
    </group>
  )
}

export default function SuspensionScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0e14', water: '#1a2c40', deep: '#060a0e', cloud: '#b8d0e8', spark: '#ffd27a', seed: 44 }} deckColor="#2a3038" station={Station} />
}
