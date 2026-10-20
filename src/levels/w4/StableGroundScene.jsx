import { Html } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Stable Ground (4-8): the stable homotopy groups of spheres. A wall of tiles πₙ₊ₖ(Sⁿ) — stem k in
 * rows, n = 2…6 across — with the values from Hatcher's table (Chapter 4 opening). By Freudenthal a
 * stem is stable from n = k + 2 on.
 *   settle — mark, in each stem, the first tile of the stable range
 *   table  — set the stable value of each stem in the column on the right
 */

export const NS = [2, 3, 4, 5, 6]
export const STEMS = [
  ['ℤ', 'ℤ', 'ℤ', 'ℤ', 'ℤ'],
  ['ℤ', 'ℤ₂', 'ℤ₂', 'ℤ₂', 'ℤ₂'],
  ['ℤ₂', 'ℤ₂', 'ℤ₂', 'ℤ₂', 'ℤ₂'],
  ['ℤ₂', 'ℤ₁₂', 'ℤ × ℤ₁₂', 'ℤ₂₄', 'ℤ₂₄'],
]
export const STABLE = ['ℤ', 'ℤ₂', 'ℤ₂', 'ℤ₂₄']
export const CANDS = ['0', 'ℤ', 'ℤ₂', 'ℤ₁₂', 'ℤ₂₄']
export const tilePos = (k, j) => [-3.6 + j * 1.55, -2.4 + k * 1.5]
export const stablePos = (k) => [4.4, -2.4 + k * 1.5]
const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (n) => String(n).split('').map((c) => SUB[c]).join('')
const sup = (n) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[n]

export function Station(site, { bag }) {
  const id = site.id
  const marked = bag.marked || {}
  const vals = bag.vals || {}
  return (
    <group>
      {STEMS.map((row, k) =>
        row.map((v, j) => {
          const n = NS[j]
          const [x, z] = tilePos(k, j)
          const stable = n >= k + 2
          const hl = id === 'settle' ? marked[k] !== undefined && n >= marked[k] : id === 'table' && stable
          const col = hl ? '#3a5a3a' : '#33303a'
          return (
            <group key={`${k}-${j}`} position={[x, 0, z]}>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[1.4, 0.24, 1.25]} />
                <meshStandardMaterial color={col} emissive={hl ? '#4cff7a' : '#000000'} emissiveIntensity={hl ? 0.25 : 0} />
              </mesh>
              <Html position={[0, 0.42, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.56rem', textAlign: 'center' }}>
                  π{sub(n + k)}(S{sup(n)})
                  <br />
                  {v}
                </div>
              </Html>
            </group>
          )
        }),
      )}
      {STEMS.map((_, k) => (
        <Html key={`k${k}`} position={[-4.85, 0.3, -2.4 + k * 1.5]} center zIndexRange={[10, 0]}>
          <div className="deck-tag" style={{ fontSize: '0.6rem' }}>k={k}</div>
        </Html>
      ))}
      {id === 'table' &&
        STEMS.map((_, k) => {
          const [x, z] = stablePos(k)
          const v = vals[k]
          const ok = v === STABLE[k]
          return (
            <group key={`s${k}`} position={[x, 0, z]}>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.55, 0.6, 0.4, 16]} />
                <meshStandardMaterial color={ok ? '#4cff7a' : '#ffd27a'} emissive={ok ? '#2a8a3a' : '#ffb347'} emissiveIntensity={0.5} />
              </mesh>
              <Html position={[0, 0.75, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag">πˢ{sub(k)} = {v || '?'}</div>
              </Html>
            </group>
          )
        })}
    </group>
  )
}

export default function StableGroundScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e1012', water: '#2a3438', deep: '#080a0c', cloud: '#e0e8f0', spark: '#ffe6a8', seed: 48 }} deckColor="#2e3236" station={Station} />
}
