import { Html } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Polynomial Garden (3-6): cohomology rings of projective spaces are truncated polynomial rings,
 *   H*(ℝPⁿ; ℤ₂) = ℤ₂[α]/(αⁿ⁺¹), |α| = 1;   H*(ℂPⁿ; ℤ) = ℤ[α]/(αⁿ⁺¹), |α| = 2.
 * Each fountain has one tier per degree; casting α onto the highest lit power lights the next.
 *   square_it    — ℝP³: square α
 *   climb_powers — ℝP⁴: climb to α⁴
 *   stops_top    — ℂP³: α, α², α³ in degrees 2, 4, 6 — then α⁴ fizzles
 *   antipodes    — ℝP⁴ and ℝP² side by side, as if joined by a map f with f*(α) = α: climb both
 */

export const FOUNTS = {
  square_it: [{ name: 'ℝP³', n: 3, deg: 1, coef: 'ℤ₂', at: [0, 0.4] }],
  climb_powers: [{ name: 'ℝP⁴', n: 4, deg: 1, coef: 'ℤ₂', at: [0, 0.4] }],
  stops_top: [{ name: 'ℂP³', n: 3, deg: 2, coef: 'ℤ', at: [0, 0.4] }],
  antipodes: [
    { name: 'ℝP⁴', n: 4, deg: 1, coef: 'ℤ₂', at: [-2.4, 0.4], s: 0.7 },
    { name: 'ℝP²', n: 2, deg: 1, coef: 'ℤ₂', at: [2.4, 0.4], s: 0.7 },
  ],
}
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸']
export const pw = (k) => (k === 0 ? '1' : k === 1 ? 'α' : `α${SUP[k]}`)

export function Fountain({ f, pow, fizzle }) {
  const s = f.s || 1
  const top = f.n * f.deg
  return (
    <group position={[f.at[0], 0, f.at[1]]} scale={s}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[2.3, 2.4, 0.3, 40]} />
        <meshStandardMaterial color="#2a3a3a" />
      </mesh>
      {Array.from({ length: top + 1 }, (_, d) => {
        const k = d / f.deg
        const isPow = Number.isInteger(k)
        const lit = isPow && k <= pow
        const r = 2.1 - d * (1.7 / Math.max(top, 1))
        const col = lit ? '#ffd27a' : isPow ? '#4a5050' : '#2a2e30'
        return (
          <group key={d} position={[0, 0.35 + d * (2.8 / Math.max(top, 1)), 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[Math.max(0.12, r - 0.18), r, 40]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={lit ? 1.4 : 0} side={2} toneMapped={!lit} />
            </mesh>
            {isPow && (
              <Html position={[r + 0.25, 0.1, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.62rem', opacity: lit ? 1 : 0.55 }}>
                  {f.labels?.[k] ?? pw(k)} · H{SUP[d] ?? d}
                </div>
              </Html>
            )}
          </group>
        )
      })}
      {fizzle && (
        <Html position={[0, 3.6, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ color: '#ff8ad8', borderColor: '#ff8ad8' }}>
            {f.fizzleLabel ?? `${pw(f.n + 1)} = 0`}
          </div>
        </Html>
      )}
      <Html position={[0, 0.3, 2.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          H*({f.name}; {f.coef})
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const list = FOUNTS[site.id]
  if (!list) return null
  const pow = bag.pow?.[site.id] ?? 1
  const fizz = bag.fizz?.[site.id]
  return (
    <group>
      {list.map((f, i) => (
        <Fountain key={i} f={f} pow={Math.min(pow, f.n)} fizzle={fizz && pow > f.n} />
      ))}
    </group>
  )
}

export default function PolynomialGardenScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a1012', water: '#183a40', deep: '#060c0e', cloud: '#a8e0e0', spark: '#ffd27a', seed: 36 }} deckColor="#2a3434" station={Station} />
}
