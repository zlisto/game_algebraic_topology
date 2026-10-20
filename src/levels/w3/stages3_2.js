/**
 * World 3 · Level 3-2 "Torsion Shift" — Torsion Terrace.
 * Hatcher §3.1, pp. 190–206 — the universal coefficient theorem (Theorem 3.2):
 *   Hⁿ(X; G) ≅ Hom(Hₙ(X), G) ⊕ Ext(Hₙ₋₁(X), G),
 * and Corollary 3.3: with ℤ coefficients and finitely generated homology, Hⁿ is the free part of
 * Hₙ plus the torsion of Hₙ₋₁ — torsion shifts up one degree. Ext(ℤ₂, ℤ₂) = ℤ₂ and
 * Hom(ℤ₂, ℤ₂) = ℤ₂, so in ℤ₂ coefficients a ℤ₂ appears twice.
 *
 * Reading Wand (0): pick a plant on the homology terrace, then a floor on the cohomology terrace.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['free_floors', 'climbing_vine', 'change_soil', 'plan_terrace']

export const OPENING = [
  E('Torsion Terrace. If you know a space’s homology, you already know its cohomology — almost.'),
  E('The universal coefficient theorem: $Hⁿ(X; G) ≅$ Hom$(Hₙ(X), G) ⊕$ Ext$(Hₙ₋₁(X), G)$.'),
  G('Hom I know. What’s Ext?'),
  E('With $ℤ$ coefficients: free parts stay on their floor, and torsion climbs one floor up. You’ll see. Wand on 0.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  free_floors: {
    blueprint: 'Free Floors',
    arrive: [
      E('The torus: $H₀ = ℤ$, $H₁ = ℤ²$, $H₂ = ℤ$ on the left terrace. Every summand is free.'),
      E('Click a plant with the Wand, then the floor of the right-hand terrace where it belongs in cohomology.'),
    ],
    early: [E('Not yet — finish the earlier terrace first. Follow NEXT on the map.')],
    goals: [
      act('Transplant every summand to its cohomology floor', [G('Same on both sides.'), E('Hom$(ℤ, ℤ) = ℤ$, so each free summand stays put: $H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$.')]),
      {
        type: 'ask',
        question: 'For a space whose homology is all free, how does $Hⁿ(X; ℤ)$ compare with $Hₙ(X)$?',
        options: ['They are the same', '$Hⁿ$ is always $0$', '$Hⁿ$ is $Hₙ₋₁$'],
        answer: 'They are the same',
        wrong: [E('Look at your two terraces.')],
        right: [E('Right — when there’s no torsion. Next terrace is south-east.')],
      },
    ],
  },
  climbing_vine: {
    blueprint: 'The Climbing Vine',
    arrive: [
      E('$ℝP²$: $H₀ = ℤ$, $H₁ = ℤ₂$, $H₂ = 0$. That $ℤ₂$ is torsion.'),
      E('Hom$(ℤ₂, ℤ) = 0$ — there’s nowhere for it to go on its own floor. But Ext$(ℤ₂, ℤ) = ℤ₂$, one floor up.'),
    ],
    early: [E('Not yet — finish the earlier terrace first. Follow NEXT on the map.')],
    goals: [
      act('Transplant ℝP²’s homology into cohomology', [G('The vine climbed!'), E('$H⁰ = ℤ$, $H¹ = 0$, $H² = ℤ₂$. The torsion moved up one degree.')]),
      {
        type: 'ask',
        question: 'Why is $H¹(ℝP²; ℤ) = 0$ when $H₁ = ℤ₂$?',
        options: ['Hom$(ℤ₂, ℤ) = 0$: no map from $ℤ₂$ to $ℤ$ except zero', '$ℝP²$ has no loops', 'Cohomology ignores degree 1'],
        answer: 'Hom$(ℤ₂, ℤ) = 0$: no map from $ℤ₂$ to $ℤ$ except zero',
        wrong: [E('Where would a homomorphism $ℤ₂ → ℤ$ send $1$? Twice that must be $0$.')],
        right: [E('Right. Next terrace is south-west.')],
      },
    ],
  },
  change_soil: {
    blueprint: 'Change the Soil',
    arrive: [
      E('$ℝP²$ again, but now with $ℤ₂$ coefficients. Hom$(ℤ, ℤ₂) = ℤ₂$, Hom$(ℤ₂, ℤ₂) = ℤ₂$, and Ext$(ℤ₂, ℤ₂) = ℤ₂$.'),
      E('So the $ℤ₂$ plant goes to two places: its own floor and the next one up.'),
    ],
    early: [E('Not yet — finish the earlier terrace first. Follow NEXT on the map.')],
    goals: [
      act('Transplant into ℤ₂ cohomology — the ℤ₂ plant twice', [G('ℤ₂ on every floor!'), E('$Hⁿ(ℝP²; ℤ₂) = ℤ₂$ for $n = 0, 1, 2$ — just like the homology with $ℤ₂$ coefficients you found at the Mod Mill.')]),
      {
        type: 'ask',
        question: 'Which two pieces give $H¹(ℝP²; ℤ₂)$ and $H²(ℝP²; ℤ₂)$?',
        options: ['Hom$(ℤ₂, ℤ₂)$ and Ext$(ℤ₂, ℤ₂)$', 'Hom$(ℤ, ℤ₂)$ twice', 'Ext$(ℤ, ℤ₂)$ and Hom$(0, ℤ₂)$'],
        answer: 'Hom$(ℤ₂, ℤ₂)$ and Ext$(ℤ₂, ℤ₂)$',
        wrong: [E('Both come from the one $ℤ₂$ in $H₁$.')],
        right: [E('Right — one plant, two flowers. Last terrace is further south-west.')],
      },
    ],
  },
  plan_terrace: {
    blueprint: 'Plan the Terrace',
    arrive: [
      E('The Klein bottle: $H₀ = ℤ$, $H₁ = ℤ ⊕ ℤ₂$, $H₂ = 0$. Plan its integer cohomology.'),
    ],
    early: [E('Not yet — finish the earlier terrace first. Follow NEXT on the map.')],
    goals: [
      act('Transplant the Klein bottle’s homology into cohomology', [G('$H⁰ = ℤ$, $H¹ = ℤ$, $H² = ℤ₂$.'), E('The free $ℤ$ stayed, the $ℤ₂$ climbed. Cohomology has a $ℤ₂$ on top even though $H₂ = 0$.')]),
      {
        type: 'ask',
        question: 'Corollary 3.3 in one line: with $ℤ$ coefficients, $Hⁿ$ is…',
        options: ['the free part of $Hₙ$ plus the torsion of $Hₙ₋₁$', 'the same as $Hₙ$', 'the torsion of $Hₙ$ only'],
        answer: 'the free part of $Hₙ$ plus the torsion of $Hₙ₋₁$',
        wrong: [E('Which plants stayed, and which climbed?')],
        right: [E('Free stays, torsion climbs. The gate’s open — south of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your plants stay where you put them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next terrace is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Universal coefficients: Hⁿ(X; G) ≅ Hom(Hₙ(X), G) ⊕ Ext(Hₙ₋₁(X), G). With ℤ coefficients the free part of Hₙ stays in degree n and the torsion of Hₙ₋₁ shifts up into degree n — so H²(ℝP²; ℤ) = ℤ₂ though H₂(ℝP²) = 0.',
  cite: 'Hatcher, Algebraic Topology §3.1, pp. 190–206 (Theorem 3.2, Corollary 3.3).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every terrace is planted. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'change_soil') return [E('In ℤ₂ soil: a $ℤ$ becomes $ℤ₂$ on its own floor. A $ℤ₂$ goes to its own floor AND the floor above — pick it twice.')]
  return [E('Wand (0): click a plant on the left, then a floor on the right. Free $ℤ$: same floor. Torsion $ℤ₂$: one floor up.')]
}
