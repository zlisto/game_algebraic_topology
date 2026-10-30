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
  E('Torsion Terrace. Good news: if you already know a space’s homology, you very nearly know its cohomology. You don’t have to read every pool by hand.'),
  E('A cohomology class reads cycles, and it reads every boundary as $0$. So it gives a map from $Hₙ$ to the numbers: that’s the Hom$(Hₙ(X), G)$ part.'),
  E('The universal coefficient theorem says that’s almost all of it: $Hⁿ(X; G) ≅$ Hom$(Hₙ(X), G) ⊕$ Ext$(Hₙ₋₁(X), G)$.'),
  G('Hom I can follow. What’s Ext?'),
  E('The bit Hom misses: the torsion from one floor down. With $ℤ$ coefficients, Ext$(ℤₘ, ℤ) = ℤₘ$ and Ext$(ℤ, ℤ) = 0$. So free parts stay on their floor and torsion climbs one up. Wand on 0.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  free_floors: {
    blueprint: 'Free Floors',
    arrive: [
      E('The torus: $H₀ = ℤ$, $H₁ = ℤ²$, $H₂ = ℤ$ on the left terrace. Every piece is free, a plain $ℤ$ with no torsion.'),
      E('Click a plant with the Wand, then the floor of the right-hand terrace where it belongs in cohomology.'),
    ],
    early: [E('Not this terrace yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Transplant every summand to its cohomology floor', [G('Same on both sides.'), E('A map $ℤ → ℤ$ is decided by where $1$ goes, so Hom$(ℤ, ℤ) = ℤ$. Each free piece stays put: $H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$.')]),
      {
        type: 'ask',
        question: 'For a space whose homology is all free, how does $Hⁿ(X; ℤ)$ compare with $Hₙ(X)$?',
        options: ['They are the same', '$Hⁿ$ is always $0$', '$Hⁿ$ is $Hₙ₋₁$'],
        answer: 'They are the same',
        wrong: [E('Look at your two terraces. Did anything move?')],
        right: [E('Right, as long as there’s no torsion. Next terrace: follow the NEXT ring, east.')],
      },
    ],
  },
  climbing_vine: {
    blueprint: 'The Climbing Vine',
    arrive: [
      E('$ℝP²$: $H₀ = ℤ$, $H₁ = ℤ₂$, $H₂ = 0$. That $ℤ₂$ is torsion: the loop that goes round twice and shrinks.'),
      E('Here’s why it climbs. The disk of $ℝP²$ is glued on round its edge twice. So $δ$ of an edge reading $φ$ is $2φ$ on the face.'),
      E('No non-zero $φ$ survives that, so $H¹ = 0$. And face readings, counted up to even numbers, leave $ℤ₂$. Hom$(ℤ₂, ℤ) = 0$, but Ext$(ℤ₂, ℤ) = ℤ₂$, one floor up.'),
    ],
    early: [E('Not this terrace yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Transplant ℝP²’s homology into cohomology', [G('The vine climbed!'), E('$H⁰ = ℤ$, $H¹ = 0$, $H² = ℤ₂$. The torsion moved up one degree, even though $H₂(ℝP²) = 0$.')]),
      {
        type: 'ask',
        question: 'Why is $H¹(ℝP²; ℤ) = 0$ when $H₁ = ℤ₂$?',
        options: ['Hom$(ℤ₂, ℤ) = 0$: no map from $ℤ₂$ to $ℤ$ except zero', '$ℝP²$ has no loops', 'Cohomology ignores degree 1'],
        answer: 'Hom$(ℤ₂, ℤ) = 0$: no map from $ℤ₂$ to $ℤ$ except zero',
        wrong: [E('Where could a homomorphism $ℤ₂ → ℤ$ send $1$? Twice that has to be $0$, and in $ℤ$ only $0$ does that.')],
        right: [E('Right. Next terrace: follow the NEXT ring back west.')],
      },
    ],
  },
  change_soil: {
    blueprint: 'Change the Soil',
    arrive: [
      E('$ℝP²$ again, but now the readings are mod 2: $ℤ₂$ coefficients. That “twice” on the face is now $0$, so every cell reading is a cocycle and only $0$ is a coboundary.'),
      E('In the formula: Hom$(ℤ, ℤ₂) = ℤ₂$, Hom$(ℤ₂, ℤ₂) = ℤ₂$, and Ext$(ℤ₂, ℤ₂) = ℤ₂$. So the $ℤ₂$ plant grows in two places: its own floor and the one above.'),
    ],
    early: [E('Not this terrace yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Transplant into ℤ₂ cohomology — the ℤ₂ plant twice', [G('ℤ₂ on every floor!'), E('$Hⁿ(ℝP²; ℤ₂) = ℤ₂$ for $n = 0, 1, 2$, the same as the mod 2 homology you found at the Mod Mill.')]),
      {
        type: 'ask',
        question: 'Which two pieces give $H¹(ℝP²; ℤ₂)$ and $H²(ℝP²; ℤ₂)$?',
        options: ['Hom$(ℤ₂, ℤ₂)$ and Ext$(ℤ₂, ℤ₂)$', 'Hom$(ℤ, ℤ₂)$ twice', 'Ext$(ℤ, ℤ₂)$ and Hom$(0, ℤ₂)$'],
        answer: 'Hom$(ℤ₂, ℤ₂)$ and Ext$(ℤ₂, ℤ₂)$',
        wrong: [E('Both come from the one $ℤ₂$ in $H₁$: once through Hom, once through Ext.')],
        right: [E('Right. One plant, two floors. Last terrace: follow the NEXT ring, north-east.')],
      },
    ],
  },
  plan_terrace: {
    blueprint: 'Plan the Terrace',
    arrive: [
      E('The Klein bottle: $H₀ = ℤ$, $H₁ = ℤ ⊕ ℤ₂$, $H₂ = 0$. No hints this time. Plant its integer cohomology yourself.'),
    ],
    early: [E('Not this terrace yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Transplant the Klein bottle’s homology into cohomology', [G('$H⁰ = ℤ$, $H¹ = ℤ$, $H² = ℤ₂$.'), E('The free $ℤ$ stayed and the $ℤ₂$ climbed. There’s a $ℤ₂$ on the top floor even though $H₂ = 0$.')]),
      {
        type: 'ask',
        question: 'Corollary 3.3 in one line: with $ℤ$ coefficients, $Hⁿ$ is…',
        options: ['the free part of $Hₙ$ plus the torsion of $Hₙ₋₁$', 'the same as $Hₙ$', 'the torsion of $Hₙ$ only'],
        answer: 'the free part of $Hₙ$ plus the torsion of $Hₙ₋₁$',
        wrong: [E('Which plants stayed on their floor, and which climbed?')],
        right: [E('That’s the whole terrace. Free parts stay, torsion goes up one. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your plants are where you put them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next terrace is ${name}: follow the NEXT ring on your map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every terrace is planted. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'change_soil') return [E('In ℤ₂ soil, a $ℤ$ becomes $ℤ₂$ on its own floor. A $ℤ₂$ goes on its own floor and on the floor above, so pick it twice.')]
  return [E('Wand (0): click a plant on the left, then a floor on the right. A free $ℤ$ stays on the same floor. A torsion $ℤ₂$ goes one floor up.')]
}
