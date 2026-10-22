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
  N('Climb your little fountains. Everything stops somewhere, courier. Everything.'),
  E('The Polynomial Garden. In some spaces one cohomology class makes all the others, just by multiplying it by itself.'),
  E('Each fountain has a tier for every degree. Cast $α$ onto the highest lit tier with the Cup Caster (9), and the next power lights.'),
  G('How high does it go?'),
  E('That’s the question. First fountain is ahead.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  square_it: {
    blueprint: 'Square It',
    arrive: [E('$ℝP³$ with $ℤ₂$ coefficients. $α$, in degree $1$, is lit. Cast it onto itself: $α ⌣ α = α²$.')],
    early: [E('Not yet — finish the earlier fountain first. Follow NEXT on the map.')],
    goals: [
      act('Cast α ⌣ α', [G('$α²$ — in degree $2$, and it’s not zero!'), E('In $ℝP³$, $α²$ generates $H²(ℝP³; ℤ₂)$.')]),
      {
        type: 'ask',
        question: 'Earlier, on the torus, $α ⌣ α = 0$. Why can $α²$ be non-zero here?',
        options: ['With $ℤ₂$ coefficients $−1 = 1$, so the sign argument says nothing', 'ℝP³ has no torus inside', 'Squares are always non-zero'],
        answer: 'With $ℤ₂$ coefficients $−1 = 1$, so the sign argument says nothing',
        wrong: [E('$α ⌣ α = −α ⌣ α$ forced $2α² = 0$. Mod 2, that’s no information.')],
        right: [E('Right. Next fountain is south-east.')],
      },
    ],
  },
  climb_powers: {
    blueprint: 'Climb the Powers',
    arrive: [E('$ℝP⁴$. Climb as high as the powers go.')],
    early: [E('Not yet — finish the earlier fountain first. Follow NEXT on the map.')],
    goals: [
      act('Climb to the top power', [G('$α$, $α²$, $α³$, $α⁴$ — every tier.'), E('$H*(ℝP⁴; ℤ₂) = ℤ₂[α]/(α⁵)$: one generator, and its powers fill every degree.')]),
      {
        type: 'ask',
        question: 'What is $H*(ℝPⁿ; ℤ₂)$ as a ring?',
        options: ['$ℤ₂[α]/(αⁿ⁺¹)$, with $α$ in degree $1$', '$ℤ₂$ in degree $0$ only', 'A different generator in each degree'],
        answer: '$ℤ₂[α]/(αⁿ⁺¹)$, with $α$ in degree $1$',
        wrong: [E('One class made every tier light.')],
        right: [E('Theorem 3.12. Next fountain is south-west.')],
      },
    ],
  },
  stops_top: {
    blueprint: 'Stops at the Top',
    arrive: [
      E('$ℂP³$, with $ℤ$ coefficients. Here $α$ lives in degree $2$, so only the even tiers can light.'),
      E('Climb to the top — and then try once more.'),
    ],
    early: [E('Not yet — finish the earlier fountain first. Follow NEXT on the map.')],
    goals: [
      act('Climb past the top', [G('$α⁴$ fizzled.'), E('$ℂP³$ has nothing above degree $6$, so $α⁴ = 0$. $H*(ℂP³) = ℤ[α]/(α⁴)$.')]),
      {
        type: 'ask',
        question: 'Why must $αⁿ⁺¹ = 0$ in $H*(ℂPⁿ)$?',
        options: ['It would live in degree $2n+2$, above the dimension of $ℂPⁿ$', 'Because $α$ is a torsion class', 'Squares of $α$ cancel'],
        answer: 'It would live in degree $2n+2$, above the dimension of $ℂPⁿ$',
        wrong: [E('Which tier would $α⁴$ need?')],
        right: [E('Right. One more fountain pair, further on.')],
      },
    ],
  },
  antipodes: {
    blueprint: 'Antipodes',
    arrive: [
      E('Two fountains: $ℝP⁴$ and $ℝP²$. Suppose a map $f: ℝP⁴ → ℝP²$ pulled the generator back to the generator, $f*(α) = α$.'),
      E('Then $f*(αᵏ) = αᵏ$ for every power. Climb both fountains together and see whether that can be true. (This goes a step beyond the section: it’s how cohomology rings prove Borsuk–Ulam.)'),
    ],
    early: [E('Not yet — finish the earlier fountain first. Follow NEXT on the map.')],
    goals: [
      act('Climb both fountains together', [G('$α³$ lights on $ℝP⁴$ but fizzles on $ℝP²$!'), E('$f*$ would send $0$ to a non-zero class. Impossible — so no such map exists.')]),
      {
        type: 'ask',
        question: 'What does that rule out?',
        options: ['Any map $ℝP⁴ → ℝP²$ that is non-zero on $H¹(−; ℤ₂)$', 'Every map $S⁴ → S²$', 'Nothing at all'],
        answer: 'Any map $ℝP⁴ → ℝP²$ that is non-zero on $H¹(−; ℤ₂)$',
        wrong: [E('Only maps with $f*(α) = α$ were ruled out.')],
        right: [E('An odd map $S⁴ → S²$ would give exactly such a map — so there isn’t one. That’s Borsuk–Ulam’s spirit. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your tiers stay lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next fountain is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The garden is in bloom. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  return [E('Cup Caster (9), then click the fountain. Each cast multiplies by $α$ once more.')]
}
