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
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['partners', 'middle_lantern', 'cp2_square', 'wedge_dark']

export const OPENING = [
  E('Pairing Pier. Take a class of degree $k$ and one of degree $n − k$ on a closed orientable $n$-manifold. Cup them and you land in the top degree.'),
  E('Then read that on the whole manifold, $[M]$, and you get a number. That’s the cup product pairing. Duality said the groups match up; this says the classes really meet.'),
  E('Proposition 3.38: every generator has a partner it cups with to give $±1$ (ignoring torsion).'),
  E('Torsion is the exception. $ℝP³$ is closed and orientable, but its $H² = ℤ₂$ has nobody in $H¹ = 0$ to pair with. “Modulo torsion” means we set those aside.'),
  G('And if a lantern can’t find a partner?'),
  E('Then you’re not standing on a closed orientable manifold, whatever it tells you. Cup Caster, on 9. First lantern: follow the NEXT ring, north.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  partners: {
    blueprint: 'Partners',
    arrive: [
      E('The torus. Classes $α$ and $β$ on the left, the same two on the right as candidate partners. Pick a class, then a partner, and the top lantern reads their cup on $[T]$.'),
      E('Find a partner for each class.'),
    ],
    early: [E('Not this lantern yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Find a partner for α and for β', [G('$α$ goes with $β$, and $β$ with $α$.'), E('$α ⌣ α = 0$, so $α$ isn’t its own partner. But $α ⌣ β = 1$ and $β ⌣ α = −1$. Every class found someone.')]),
      {
        type: 'ask',
        question: 'Proposition 3.38: on a closed orientable manifold the cup pairing $Hᵏ × Hⁿ⁻ᵏ → ℤ$ is…',
        options: ['nonsingular, modulo torsion', 'always zero', 'only defined for $k = 0$'],
        answer: 'nonsingular, modulo torsion',
        wrong: [E('Every class you tried had a partner.')],
        right: [E('Right. Next lantern: follow the NEXT ring, north-west.')],
      },
    ],
  },
  middle_lantern: {
    blueprint: 'The Middle Lantern',
    arrive: [E('$S² × S²$, a closed 4-manifold. In the middle degree there are two classes, $γ × 1$ and $1 × γ$. Find each one’s partner.')],
    early: [E('Not this lantern yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Find partners for γ × 1 and 1 × γ', [G('Each one pairs with the other.'), E('Neither squares to the top: $(γ × 1)² = 0$. But their product is the top class, so they’re each other’s partners.')]),
      {
        type: 'ask',
        question: 'In $S² × S²$, what is $(γ × 1) ⌣ (γ × 1)$?',
        options: ['$0$', 'the top class', '$γ × 1$'],
        answer: '$0$',
        wrong: [E('It’s $γ² × 1$, and $γ² = 0$ on $S²$, which has nothing in degree $4$.')],
        right: [E('Right. Next lantern: follow the NEXT ring, north-east.')],
      },
    ],
  },
  cp2_square: {
    blueprint: 'The ℂP² Square',
    arrive: [
      E('$ℂP²$ is a closed orientable 4-manifold with just one middle class, $α$, in degree $2$. So who can its partner be?'),
    ],
    early: [E('Not this lantern yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Find α’s partner', [G('$α ⌣ α$ lights the top!'), E('So $α²$ generates $H⁴(ℂP²)$. That’s the polynomial ring $ℤ[α]/(α³)$ from the Garden, and now you’ve seen why it has to be true.')]),
      {
        type: 'ask',
        question: 'Why must $α²$ generate $H⁴(ℂP²)$?',
        options: ['$α$ needs a partner with $α$ ⌣ (partner) $= ±1$, and the only class in degree 2 is $α$', 'Because squares always generate', 'Because ℂP² is a sphere'],
        answer: '$α$ needs a partner with $α$ ⌣ (partner) $= ±1$, and the only class in degree 2 is $α$',
        wrong: [E('The pairing is perfect, and there’s only one candidate in degree $2$.')],
        right: [E('Its partner is some multiple $mα$, so $m · (α²$ on $[M]) = ±1$. That forces $m = ±1$, and $α²$ to be a generator. That’s how Hatcher gets the ring of $ℂPⁿ$. Last lantern: NEXT, north-east.')],
      },
    ],
  },
  wedge_dark: {
    blueprint: 'The Wedge Stays Dark',
    arrive: [
      E('$S² ∨ S⁴$: a sphere and a 4-sphere touching at a point. Same groups as $ℂP²$: $ℤ$, $0$, $ℤ$, $0$, $ℤ$. Try to find $α$ a partner here.'),
    ],
    early: [E('Not this lantern yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Try to find α’s partner', [
        G('Dark. $α ⌣ α = 0$ on the wedge.'),
        N('A lantern with nothing left to answer it. I know how that sits, Gyroid.'),
        G('I know who she was now. …Ansel.'),
        N('…That name stayed at the Hollow. Go on to my station. My marshal is waiting.'),
        E('$α$ comes from the $S²$, and squashing the $S⁴$ to a point shows $α²$ comes from there too, where $H⁴ = 0$. No partner: so $S² ∨ S⁴$ is no closed orientable 4-manifold, and certainly not $ℂP²$.'),
      ]),
      {
        type: 'ask',
        question: 'So $ℂP²$ and $S² ∨ S⁴$, with the same cohomology groups, are…',
        options: ['not homotopy equivalent', 'the same space', 'both closed manifolds'],
        answer: 'not homotopy equivalent',
        wrong: [E('One lantern lit, one stayed dark.')],
        right: [E('The cup product caught it again. World 3’s gate is open, north, and the Counterfeit Station is waiting past it.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your lanterns are still lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next lantern is ${name}: follow the NEXT ring on your map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every lantern is paired. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  return [E('Cup Caster (9): click a lantern on the left, then a lantern on the right. The top lantern reads their cup.')]
}
