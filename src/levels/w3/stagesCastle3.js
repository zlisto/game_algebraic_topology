/**
 * World 3 · Castle — The Counterfeit Station. The Commutator's disguises have the right cohomology
 * groups and the wrong rings. Hatcher Example 3.8 (T vs S¹ ∨ S¹ ∨ S²), Theorem 3.12 (H*(ℂPⁿ) = ℤ[α]/(αⁿ⁺¹)),
 * Proposition 3.38 (the cup product pairing of a closed orientable manifold is nonsingular).
 *
 * Cup Caster (9) throughout.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const C = (text) => ({ speaker: 'The Commutator', portrait: 'commutator', text })

export const STATION_ORDER = ['facade', 'false_powers', 'no_twin']

export const OPENING = [
  C('Welcome to my station. Count my holes, read my groups — I match anything you name.'),
  E('He can copy the groups. He can’t copy what they multiply to. Every disguise he wears, we test with a cup product.'),
  G('Three disguises, three casts.'),
  E('One of his guards has no body at all — a de Rham Spectre, a field circling a hole. Nothing touches it while it circulates. Run a full loop around it to force it exact, then lash it while it’s only a gradient. (Hatcher only mentions de Rham in passing; this one is from beyond the book.)'),
  E('Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  facade: {
    blueprint: 'The Façade',
    arrive: [C('A torus, plain as day. $ℤ$, $ℤ²$, $ℤ$ — check my groups.'), E('$S¹ ∨ S¹ ∨ S²$ has those groups too. Cast $α ⌣ β$ on both lanterns: the real torus lights, his stays dark.')],
    early: [E('Not yet — the façade first. Follow NEXT on the map.')],
    goals: [
      act('Light both lanterns: α ⌣ β on T and on X', [G('Torus: $1$. His: $0$.'), C('A lucky cast.'), E('Same groups, different rings. Not a torus.')]),
      {
        type: 'ask',
        question: 'Same cohomology groups, different cup products. Can the two spaces be homotopy equivalent?',
        options: ['Yes — the groups decide it', 'No — the ring is an invariant too', 'Only if both are surfaces'],
        answer: 'No — the ring is an invariant too',
        wrong: [E('A homotopy equivalence preserves cup products.')],
        right: [C('Then I am something grander.')],
      },
    ],
  },
  false_powers: {
    blueprint: 'False Powers',
    arrive: [C('Then I am $ℂP²$. $ℤ$ in degrees $0$, $2$, $4$. Count them.'), E('So does $S² ∨ S⁴$. On $ℂP²$, $α²$ generates $H⁴$. Climb $ℂP²$ to $α²$, then try his.')],
    early: [E('Not yet — finish the façade first. Follow NEXT on the map.')],
    goals: [
      act('Climb ℂP² to α², then cast α² on his', [G('His $H⁴$ is there — but $α$ can’t reach it.'), E('$α² = 0$ on $S² ∨ S⁴$. $H*(ℂP²) = ℤ[α]/(α³)$. Not $ℂP²$.')]),
      {
        type: 'ask',
        question: 'Why isn’t $S² ∨ S⁴$ homotopy equivalent to $ℂP²$?',
        options: ['$α² = 0$ on the wedge, but generates $H⁴(ℂP²)$', 'Their $H⁴$ groups differ', 'The wedge isn’t connected'],
        answer: '$α² = 0$ on the wedge, but generates $H⁴(ℂP²)$',
        wrong: [E('The groups match. What did the fountain show?')],
        right: [C('Then call me a closed 4-manifold, and be done.')],
      },
    ],
  },
  no_twin: {
    blueprint: 'No Twin',
    arrive: [C('A closed, orientable 4-manifold. Duality and all.'), E('Then every class has a cup partner: Proposition 3.38. Pick $α$ on the left, cast on its partner. Find one.')],
    early: [E('Not yet — the powers first. Follow NEXT on the map.')],
    goals: [
      act('Find α a partner', [G('Dark. $α$ has no partner.'), E('The pairing is singular, so it isn’t a closed orientable manifold.'), C('…The Spire. I still have the Spire.')]),
      {
        type: 'ask',
        question: 'On a closed orientable manifold, the cup product pairing is…',
        options: ['nonsingular (mod torsion)', 'always zero', 'only defined on spheres'],
        answer: 'nonsingular (mod torsion)',
        wrong: [E('Proposition 3.38. Every class has a partner.')],
        right: [E('Unmasked three times. The way to the Spire is open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — the lanterns remember. Lash the spawn and keep casting.'),
  wrongSection: (name) => E(`Next is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'The Commutator’s disguises matched cohomology groups but not cup products: S¹ ∨ S¹ ∨ S² has α ⌣ β = 0 where the torus has a generator; S² ∨ S⁴ has α² = 0 where ℂP² has a generator; and on S² ∨ S⁴ the cup pairing is singular, so it is no closed orientable 4-manifold.',
  cite: 'Hatcher, Algebraic Topology §3.2 (Example 3.8, Theorem 3.12) and §3.3 (Proposition 3.38).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('He’s fled to the Spire. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'facade') return [E('Cup Caster (9) on each lantern — the torus’, then his.')]
  if (current === 'false_powers') return [E('Cup Caster (9) on the left fountain to climb to $α²$; then on his.')]
  return [E('Cup Caster (9): pick $α$ on the left, then cast on the right.')]
}
