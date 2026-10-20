import { Html, Line } from '@react-three/drei'
import { Lantern } from './FrontFaceScene'
import YardFrame from '../w2/YardFrame'

/**
 * Pairing Pier (3-9): the cup product pairing. On a closed orientable n-manifold the pairing
 * Hᵏ × Hⁿ⁻ᵏ → ℤ, (a, b) ↦ (a ⌣ b)[M], is nonsingular modulo torsion (Proposition 3.38): every
 * class (of infinite order, indivisible) has a partner it cups with to ±1 on the top class.
 * Lanterns on the left are the classes; on the right, candidate partners; the top lantern shows
 * (a ⌣ b)[M].
 *   partners       — the torus: α, β
 *   middle_lantern — S² × S²: γ × 1 and 1 × γ
 *   cp2_square     — ℂP²: α's only partner is α, so α² generates H⁴
 *   wedge_dark     — S² ∨ S⁴: α ⌣ α = 0, so no partner — it can't be a closed 4-manifold
 */

export const PIERS = {
  partners: { space: 'T', n: 2, classes: ['α', 'β'], table: { α: { α: 0, β: 1 }, β: { α: -1, β: 0 } } },
  middle_lantern: { space: 'S² × S²', n: 4, classes: ['γ×1', '1×γ'], table: { 'γ×1': { 'γ×1': 0, '1×γ': 1 }, '1×γ': { 'γ×1': 1, '1×γ': 0 } } },
  cp2_square: { space: 'ℂP²', n: 4, classes: ['α'], table: { α: { α: 1 } } },
  wedge_dark: { space: 'S² ∨ S⁴', n: 4, classes: ['α'], table: { α: { α: 0 } } },
}
export const lanternPos = (side, i, count) => [side * 2.6, 0.9 + (i - (count - 1) / 2) * 2.0]
export const TOP = [0, -3.4]

export function Station(site, { bag }) {
  const P = PIERS[site.id]
  if (!P) return null
  const found = bag.found?.[site.id] || {}
  const sel = bag.sel?.[site.id]
  const last = bag.last?.[site.id]
  return (
    <group>
      {P.classes.map((c, i) => {
        const pos = lanternPos(-1, i, P.classes.length)
        return <Lantern key={`l${c}`} pos={pos} value={found[c] !== undefined ? found[c] : null} label={sel === c ? `▸ ${c}` : c} size={0.28} />
      })}
      {P.classes.map((c, i) => (
        <Lantern key={`r${c}`} pos={lanternPos(1, i, P.classes.length)} value={null} label={c} size={0.28} />
      ))}
      {Object.entries(found).map(([a, v]) => {
        const b = P.classes.find((x) => Math.abs(P.table[a][x]) === 1) || a
        const p = lanternPos(-1, P.classes.indexOf(a), P.classes.length)
        const q = lanternPos(1, P.classes.indexOf(b), P.classes.length)
        return v ? <Line key={a} points={[[p[0], 1.35, p[1]], [q[0], 1.35, q[1]]]} color="#ffd27a" lineWidth={3} /> : null
      })}
      <Lantern pos={TOP} value={last === undefined ? null : last} label={`⌣ on [${P.space}]`} size={0.45} />
      <Html position={[0, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          {P.space} · classes in degree {P.n / 2} · top degree {P.n}
        </div>
      </Html>
    </group>
  )
}

export default function PerfectPairingScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0c14', water: '#18284a', deep: '#06080e', cloud: '#c0c8f0', spark: '#ffd27a', seed: 39 }} deckColor="#2a2e3a" station={Station} />
}
