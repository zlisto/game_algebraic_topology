import { Html } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Twist Tower (4-11): Postnikov towers, Hatcher §4.3 pp. 410–412, for X = S² (π₁ = 0, π₂ = ℤ, π₃ = ℤ, π₄ = ℤ₂).
 *   stack   — Xₙ keeps πᵢ for i ≤ n and kills the rest (Cell Hammer)
 *   twist   — each Xₙ → Xₙ₋₁ is a fibration with fibre K(πₙX, n) (Cup Caster)
 *   untwist — all kₙ = 0 means X is the product of its K(πₙX, n)'s. S² and S³ × ℂP∞ have the same
 *             groups (p. 348, Example 4.51); the product has k₂ = 0, so S² can't: H₃(S²) = 0, but
 *             H₃(K(ℤ, 2) × K(ℤ, 3)) = ℤ. (That last deduction is ours, from Hurewicz-type reasoning,
 *             not a line in the book.)
 *   rebuild — Xₙ₊₁ is the homotopy fibre of kₙ: Xₙ → K(πₙ₊₁X, n + 2), so build bottom-up (Cell Hammer)
 */

export const PI = ['0', 'ℤ', 'ℤ', 'ℤ₂'] // π₁..π₄ of S²
export const FLOORS = [2, 3, 4]
export const rowZ = (n) => 2.2 - (n - 2) * 1.9
export const colX = (i) => -2.7 + i * 1.8 // π_{i+1}
export const FIB_CANDS = ['K(ℤ, 2)', 'K(ℤ, 3)', 'K(ℤ₂, 4)', 'K(ℤ, 4)']
export const fibreOf = (n) => `K(${PI[n - 1]}, ${n})`
export const TOWERS = { s2: { x: -2.4, name: 'S²', k: '≠ 0', H3: '0' }, prod: { x: 2.4, name: 'S³ × ℂP∞', k: '0', H3: 'ℤ' } }
export const K_CANDS = ['0', '≠ 0']
export const leverPos = (id) => [TOWERS[id].x, 2.7]
const SUB = '₀₁₂₃₄₅'

function Meter({ x, z, label, value, dim, hot }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.4, 0.44, 0.95]} />
        <meshStandardMaterial color={dim ? '#24222a' : '#3a4250'} emissive={hot ? '#ffd27a' : '#000000'} emissiveIntensity={hot ? 0.3 : 0} />
      </mesh>
      <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.62rem', opacity: dim ? 0.55 : 1 }}>
          {label} = {value}
        </div>
      </Html>
    </group>
  )
}

function Floor({ x, z, w = 1.6, y = 0, color = '#3a4a5a', twist = 0, label }) {
  return (
    <group position={[x, y, z]} rotation={[0, twist, 0]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[w, 0.5, 1.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {label && (
        <Html position={[0, 0.75, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ fontSize: '0.6rem' }}>{label}</div>
        </Html>
      )}
    </group>
  )
}

function StackRoom({ bag }) {
  const killed = bag.killed || {}
  return (
    <group>
      {FLOORS.map((n) => (
        <group key={n}>
          <Html position={[-4.2, 0.3, rowZ(n)]} center zIndexRange={[10, 0]}>
            <div className="deck-tag">X{SUB[n]}</div>
          </Html>
          {PI.map((g, i) => {
            const k = killed[`${n}.${i + 1}`]
            return <Meter key={i} x={colX(i)} z={rowZ(n)} label={`π${SUB[i + 1]}`} value={k ? '0' : g} dim={k} hot={!k && i + 1 > n && g !== '0'} />
          })}
        </group>
      ))}
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">S²’s tower: Xₙ keeps π₁ … πₙ, and nothing above</div>
      </Html>
    </group>
  )
}

function TwistRoom({ bag }) {
  const picks = bag.fib || {}
  return (
    <group>
      {FLOORS.map((n) => {
        const v = picks[n]
        const ok = v === fibreOf(n)
        return (
          <group key={n}>
            <Floor x={0} z={rowZ(n)} w={2.4} color={ok ? '#2f6a44' : v ? '#5a3a44' : '#3a3440'} label={v || '?'} />
            <Html position={[-3.0, 0.3, rowZ(n)]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.64rem' }}>
                fibre of X{SUB[n]} → X{SUB[n - 1]}
              </div>
            </Html>
            <Html position={[3.0, 0.3, rowZ(n)]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.64rem' }}>
                π{SUB[n]}(S²) = {PI[n - 1]}
              </div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">each step up the tower adds one K(πₙ, n)</div>
      </Html>
    </group>
  )
}

function UntwistRoom({ bag }) {
  const ks = bag.k || {}
  return (
    <group>
      {Object.entries(TOWERS).map(([id, T]) => {
        const k = ks[id]
        const twist = k === '≠ 0' ? 0.45 : 0
        const H3 = k == null ? '?' : k === '0' ? 'ℤ' : '0'
        return (
          <group key={id}>
            <Floor x={T.x} z={0.2} color="#3a4a5a" label="K(ℤ, 2)" />
            <Floor x={T.x} z={0.2} y={0.55} color={k == null ? '#3a3440' : k === T.k ? '#2f6a44' : '#6a3a3a'} twist={twist} label="K(ℤ, 3)" />
            <group position={[leverPos(id)[0], 0, leverPos(id)[1]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[0.6, 28]} />
                <meshStandardMaterial color="#3a3440" emissive="#ffd27a" emissiveIntensity={k == null ? 0.25 : 0.05} />
              </mesh>
              <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.62rem' }}>k₂ = {k ?? '?'}</div>
              </Html>
            </group>
            <Html position={[T.x, 0.3, -1.9]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.66rem' }}>
                {T.name}: needs H₃ = {T.H3} · tower gives H₃(X₃) = {H3}
              </div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">same groups π₂ = π₃ = ℤ — different twist k₂ ∈ H⁴(K(ℤ, 2); ℤ)</div>
      </Html>
    </group>
  )
}

function RebuildRoom({ bag }) {
  const built = bag.built || 0 // floors X₂ … X_{built+1} are up
  return (
    <group>
      {FLOORS.map((n, j) => {
        const up = j < built
        return (
          <group key={n}>
            <Floor x={0} z={rowZ(n)} w={2.6} color={up ? '#2f6a44' : '#2a2830'} y={up ? 0 : -0.35} label={up ? (n === 2 ? 'X₂ = K(ℤ, 2)' : `X${SUB[n]} = hofib k${SUB[n - 1]}`) : `X${SUB[n]}`} />
            {up && n < 4 && (
              <Html position={[3.2, 0.3, rowZ(n)]} center zIndexRange={[10, 0]}>
                <div className="deck-tag" style={{ fontSize: '0.62rem' }}>
                  k{SUB[n]} ∈ H{['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'][n + 2]}(X{SUB[n]}; {PI[n]})
                </div>
              </Html>
            )}
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">rebuild S²’s tower from the bottom</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  if (site.id === 'stack') return <StackRoom bag={bag} />
  if (site.id === 'twist') return <TwistRoom bag={bag} />
  if (site.id === 'untwist') return <UntwistRoom bag={bag} />
  if (site.id === 'rebuild') return <RebuildRoom bag={bag} />
  return null
}

export default function TwistTowerScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e0a12', water: '#2a1e38', deep: '#08060c', cloud: '#dcc8f0', spark: '#c8b6ff', seed: 51 }} deckColor="#2e2a36" station={Station} />
}
