/**
 * World 3 · Level 3-9 "Perfect Pairing" — Pairing Pier.
 * Hatcher §3.3, pp. 249–252 — the cup product pairing: for a closed R-orientable n-manifold the
 * pairing Hᵏ × Hⁿ⁻ᵏ → R, (a, b) ↦ (a ⌣ b)[M], is nonsingular for R a field, or for R = ℤ modulo
 * torsion (Proposition 3.38). Corollary: H*(ℂPⁿ) = ℤ[α]/(αⁿ⁺¹) — and, for ℂP², α² generates H⁴,
 * which tells ℂP² apart from S² ∨ S⁴.
 *
 * Cup Caster (9): pick a class on the left, then a partner on the right.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['partners', 'middle_lantern', 'cp2_square', 'wedge_dark']

export const OPENING = [
  E('Pairing Pier. On a closed oriented manifold, every lantern has a partner: cup them, read the result on the whole manifold, and you get $±1$.'),
  E('That’s the cup product pairing. Duality said the groups match; this says the classes really meet.'),
  G('And if a lantern has no partner?'),
  E('Then you’re not on a closed manifold. Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  partners: {
    blueprint: 'Partners',
    arrive: [
      E('The torus. Classes $α$ and $β$ on the left; the same classes on the right as partners. Pick a class, then a partner; the top lantern reads their cup on $[T]$.'),
      E('Find a partner for each class.'),
    ],
    early: [E('Not yet — finish the earlier lantern first. Follow NEXT on the map.')],
    goals: [
      act('Find a partner for α and for β', [G('$α$ goes with $β$, and $β$ with $α$.'), E('$α ⌣ α = 0$, but $α ⌣ β = ±1$: the pairing is perfect.')]),
      {
        type: 'ask',
        question: 'Proposition 3.38: on a closed orientable manifold the cup pairing $Hᵏ × Hⁿ⁻ᵏ → ℤ$ is…',
        options: ['nonsingular, modulo torsion', 'always zero', 'only defined for $k = 0$'],
        answer: 'nonsingular, modulo torsion',
        wrong: [E('Every class you tried had a partner.')],
        right: [E('Right. Next lantern is south-east.')],
      },
    ],
  },
  middle_lantern: {
    blueprint: 'The Middle Lantern',
    arrive: [E('$S² × S²$: in the middle degree, $γ × 1$ and $1 × γ$. Find each one’s partner.')],
    early: [E('Not yet — finish the earlier lantern first. Follow NEXT on the map.')],
    goals: [
      act('Find partners for γ × 1 and 1 × γ', [G('Each pairs with the other one.'), E('Neither squares to the top: $(γ × 1)² = 0$. Their product, though, is the top class.')]),
      {
        type: 'ask',
        question: 'In $S² × S²$, what is $(γ × 1) ⌣ (γ × 1)$?',
        options: ['$0$', 'the top class', '$γ × 1$'],
        answer: '$0$',
        wrong: [E('It’s $γ² × 1$, and $γ² = 0$ on $S²$.')],
        right: [E('Right. Next lantern is south-west.')],
      },
    ],
  },
  cp2_square: {
    blueprint: 'The ℂP² Square',
    arrive: [
      E('$ℂP²$ has just one middle class, $α$, in degree $2$. Its partner must be… itself.'),
    ],
    early: [E('Not yet — finish the earlier lantern first. Follow NEXT on the map.')],
    goals: [
      act('Find α’s partner', [G('$α ⌣ α$ lights the top!'), E('So $α²$ generates $H⁴(ℂP²)$ — exactly the polynomial ring $ℤ[α]/(α³)$ from the Garden.')]),
      {
        type: 'ask',
        question: 'Why must $α²$ generate $H⁴(ℂP²)$?',
        options: ['$α$ needs a partner with $α$ ⌣ (partner) $= ±1$, and the only class in degree 2 is $α$', 'Because squares always generate', 'Because ℂP² is a sphere'],
        answer: '$α$ needs a partner with $α$ ⌣ (partner) $= ±1$, and the only class in degree 2 is $α$',
        wrong: [E('Perfect pairing, and only one candidate.')],
        right: [E('Right — that’s how Hatcher gets the ring of $ℂPⁿ$. Last lantern is further on.')],
      },
    ],
  },
  wedge_dark: {
    blueprint: 'The Wedge Stays Dark',
    arrive: [
      E('$S² ∨ S⁴$ has the same groups as $ℂP²$: $ℤ$, $0$, $ℤ$, $0$, $ℤ$. Try to find $α$’s partner here.'),
    ],
    early: [E('Not yet — finish the earlier lantern first. Follow NEXT on the map.')],
    goals: [
      act('Try to find α’s partner', [G('Dark. $α ⌣ α = 0$ on the wedge.'), E('No partner — so $S² ∨ S⁴$ is not a closed 4-manifold, and certainly not $ℂP²$.')]),
      {
        type: 'ask',
        question: 'So $ℂP²$ and $S² ∨ S⁴$, with the same cohomology groups, are…',
        options: ['not homotopy equivalent', 'the same space', 'both closed manifolds'],
        answer: 'not homotopy equivalent',
        wrong: [E('One lantern lit, one stayed dark.')],
        right: [E('The cup product strikes again. World 3’s gate is open — the Counterfeit Station waits beyond.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your lanterns stay lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next lantern is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'On a closed orientable manifold the cup product pairing Hᵏ × Hⁿ⁻ᵏ → ℤ, (a ⌣ b)[M], is nonsingular modulo torsion: every class has a partner. So in ℂP² the generator α must pair with itself, α² generates H⁴ — and S² ∨ S⁴, where α² = 0, is not ℂP².',
  cite: 'Hatcher, Algebraic Topology §3.3, pp. 249–252 (Proposition 3.38).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every lantern is paired. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  return [E('Cup Caster (9): click a lantern on the left, then a lantern on the right. The top lantern reads their cup.')]
}
