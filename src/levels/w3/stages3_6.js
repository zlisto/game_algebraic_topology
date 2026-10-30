/**
 * World 3 · Level 3-6 "Polynomial Garden" — Polynomial Garden.
 * Hatcher §3.2, pp. 220–229 — cohomology rings of projective spaces (Theorem 3.12):
 *   H*(ℝPⁿ; ℤ₂) ≅ ℤ₂[α]/(αⁿ⁺¹) with |α| = 1, and H*(ℂPⁿ; ℤ) ≅ ℤ[α]/(αⁿ⁺¹) with |α| = 2.
 * The last station's consequence — no map ℝP⁴ → ℝP² can be nonzero on H¹(−; ℤ₂), which is the
 * cohomological heart of the Borsuk–Ulam theorem — goes a step beyond the section (Hatcher
 * treats Borsuk–Ulam in §2.B); it is flagged as such in the dialogue.
 *
 * Cup Caster (9): cast α onto the highest lit power.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['square_it', 'climb_powers', 'stops_top', 'antipodes']

export const OPENING = [
  N('Climb your fountains, Gyroid. Every one of them stops somewhere. So does every road.'),
  G('He keeps doing that. Talking about roads like they owe him something.'),
  E('…This is the Polynomial Garden. In some spaces one class makes all the others, just by being multiplied by itself, over and over.'),
  E('Each fountain has a tier for every degree. Cast $α$ onto the highest lit tier with the Cup Caster (9) and the next power lights: $α$, then $α ⌣ α = α²$, then $α³$.'),
  G('How high does it go?'),
  E('That’s the whole question. First fountain: follow the NEXT ring, north-west.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  square_it: {
    blueprint: 'Square It',
    arrive: [
      E('$ℝP³$, read mod 2. $α$ is its degree-1 class: the reading that gives $1$ to the loop that can’t be shrunk, the one that goes halfway round the sphere and closes up.'),
      E('$α$ is lit. Cast it onto itself: $α ⌣ α = α²$.'),
    ],
    early: [E('Not this fountain yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast α ⌣ α', [G('$α²$, in degree $2$, and it’s not zero!'), E('In $ℝP³$, $α²$ generates $H²(ℝP³; ℤ₂)$.')]),
      {
        type: 'ask',
        question: 'Earlier, on the torus, $α ⌣ α = 0$. Why can $α²$ be non-zero here?',
        options: ['With $ℤ₂$ coefficients $−1 = 1$, so the sign argument says nothing', 'ℝP³ has no torus inside', 'Squares are always non-zero'],
        answer: 'With $ℤ₂$ coefficients $−1 = 1$, so the sign argument says nothing',
        wrong: [E('On the torus, $α ⌣ α = −α ⌣ α$ forced $2α² = 0$. Mod 2, $2$ is $0$, so that tells you nothing.')],
        right: [E('Right. The swap rule only gave us $2α² = 0$, and mod 2 that’s always true. Next fountain: follow the NEXT ring, north-west.')],
      },
    ],
  },
  climb_powers: {
    blueprint: 'Climb the Powers',
    arrive: [E('$ℝP⁴$. It has one cell in each dimension up to $4$, so one tier in each degree. Climb as high as the powers go.')],
    early: [E('Not this fountain yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Climb to the top power', [G('$α$, $α²$, $α³$, $α⁴$. Every tier.'), E('$H*(ℝP⁴; ℤ₂) = ℤ₂[α]/(α⁵)$: polynomials in one letter, $α$, with everything from $α⁵$ up set to zero. One class made the whole fountain.')]),
      {
        type: 'ask',
        question: 'What is $H*(ℝPⁿ; ℤ₂)$ as a ring?',
        options: ['$ℤ₂[α]/(αⁿ⁺¹)$, with $α$ in degree $1$', '$ℤ₂$ in degree $0$ only', 'A different generator in each degree'],
        answer: '$ℤ₂[α]/(αⁿ⁺¹)$, with $α$ in degree $1$',
        wrong: [E('One class lit every tier, just by multiplying.')],
        right: [E('Theorem 3.12. Next fountain: follow the NEXT ring, north.')],
      },
    ],
  },
  stops_top: {
    blueprint: 'Stops at the Top',
    arrive: [
      E('$ℂP³$, with ordinary $ℤ$ coefficients. Its cells are all even-dimensional, $0$, $2$, $4$, $6$, so $α$ lives in degree $2$ and only the even tiers can light.'),
      E('Climb to the top, and then try once more.'),
    ],
    early: [E('Not this fountain yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Climb past the top', [G('$α⁴$ fizzled.'), E('$α⁴$ would live in degree $8$, and $ℂP³$ has nothing above degree $6$. So $α⁴ = 0$, and $H*(ℂP³) = ℤ[α]/(α⁴)$.')]),
      {
        type: 'ask',
        question: 'Why must $αⁿ⁺¹ = 0$ in $H*(ℂPⁿ)$?',
        options: ['It would live in degree $2n+2$, above the dimension of $ℂPⁿ$', 'Because $α$ is a torsion class', 'Squares of $α$ cancel'],
        answer: 'It would live in degree $2n+2$, above the dimension of $ℂPⁿ$',
        wrong: [E('Which tier would $α⁴$ need?')],
        right: [E('Right. One more pair of fountains: follow the NEXT ring, north-east.')],
      },
    ],
  },
  antipodes: {
    blueprint: 'Antipodes',
    arrive: [
      E('Two fountains: $ℝP⁴$ and $ℝP²$. Suppose a map $f: ℝP⁴ → ℝP²$ pulled the generator back to the generator, $f*(α) = α$.'),
      E('Pulling back respects cup products, so $f*(αᵏ) = αᵏ$ for every power.'),
      E('Climb both fountains together and see if that can hold. (This goes a step past the section: it’s how cohomology rings prove Borsuk–Ulam.)'),
    ],
    early: [E('Not this fountain yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Climb both fountains together', [G('$α³$ lights on $ℝP⁴$ but fizzles on $ℝP²$!'), E('On $ℝP²$, $α³ = 0$, and $f*$ of zero is zero. But it should be $α³$ on $ℝP⁴$, which isn’t zero. So no such map exists.')]),
      {
        type: 'ask',
        question: 'What does that rule out?',
        options: ['Any map $ℝP⁴ → ℝP²$ that is non-zero on $H¹(−; ℤ₂)$', 'Every map $S⁴ → S²$', 'Nothing at all'],
        answer: 'Any map $ℝP⁴ → ℝP²$ that is non-zero on $H¹(−; ℤ₂)$',
        wrong: [E('Only maps with $f*(α) = α$ were ruled out.')],
        right: [E('A map $S⁴ → S²$ that sent opposite points to opposite points would give exactly such a map. So there isn’t one. That’s the idea behind Borsuk–Ulam. The gate’s open, north.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. The tiers are still lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next fountain is ${name}: follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Cohomology rings of projective spaces are truncated polynomial rings: H*(ℝPⁿ; ℤ₂) = ℤ₂[α]/(αⁿ⁺¹) with α in degree 1, and H*(ℂPⁿ; ℤ) = ℤ[α]/(αⁿ⁺¹) with α in degree 2. Because αⁿ⁺¹ must vanish, there is no map ℝPⁿ → ℝPᵐ (n > m) that is non-zero on H¹ with ℤ₂ coefficients.',
  cite: 'Hatcher, Algebraic Topology §3.2, pp. 220–229 (Theorem 3.12); Borsuk–Ulam itself is in §2.B.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The garden’s in bloom. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  return [E('Cup Caster (9), then click the fountain. Each cast multiplies by $α$ one more time.')]
}
