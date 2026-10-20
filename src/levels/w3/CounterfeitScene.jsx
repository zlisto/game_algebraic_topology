import YardFrame from '../w2/YardFrame'
import { Station as CupStation } from './CupCounterexampleScene'
import { Fountain } from './PolynomialGardenScene'
import { Station as PairStation } from './PerfectPairingScene'

/**
 * The Counterfeit Station (World 3 castle). The Commutator wears disguises whose cohomology groups match
 * the real thing; the ring structure gives each one away (Hatcher §3.2, §3.3):
 *   facade       — "a torus": S¹ ∨ S¹ ∨ S² has T's groups, but α ⌣ β = 0 (Example 3.8; level 3-4)
 *   false_powers — "ℂP²": S² ∨ S⁴ has ℂP²'s groups, but α² = 0, while α² generates H⁴(ℂP²) (level 3-6)
 *   no_twin      — "a closed 4-manifold": on S² ∨ S⁴, α has no cup partner, so the pairing is singular
 *                  and it can't be one (Proposition 3.38; level 3-9)
 */

export const POWER_FOUNTS = {
  real: { name: 'ℂP²', n: 2, deg: 2, coef: 'ℤ', at: [-2.4, 0.4], s: 0.7 },
  fake: { name: 'S² ∨ S⁴', n: 2, deg: 2, coef: 'ℤ', at: [2.4, 0.4], s: 0.7, labels: { 2: 'γ' }, fizzleLabel: 'α² = 0 ≠ γ' },
}

export function Station(site, { bag }) {
  if (site.id === 'facade') return CupStation({ id: 'nulls_answer' }, { bag })
  if (site.id === 'no_twin') return PairStation({ id: 'wedge_dark' }, { bag })
  if (site.id === 'false_powers') {
    return (
      <group>
        <Fountain f={POWER_FOUNTS.real} pow={bag.cp ?? 1} />
        <Fountain f={POWER_FOUNTS.fake} pow={1} fizzle={bag.fake} />
      </group>
    )
  }
  return null
}

export default function CounterfeitScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0a10', water: '#2a2038', deep: '#06040a', cloud: '#e0c8f0', spark: '#ff8ad8', seed: 39 }} deckColor="#2e2836" station={Station} />
}
