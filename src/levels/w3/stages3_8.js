/**
 * World 3 · Level 3-8 "Both Sides of the Story" — The Seam.
 * Hatcher §3.3, pp. 239–249 — Poincaré duality (Theorem 3.30): for a closed R-orientable
 * n-manifold M with fundamental class [M], the map Hᵏ(M; R) → Hₙ₋ₖ(M; R), φ ↦ [M] ⌢ φ, is an
 * isomorphism. The dual cell structure gives the idea: k-cells correspond to dual (n−k)-cells.
 * Every manifold is ℤ₂-orientable, so with ℤ₂ coefficients duality holds even for ℝP².
 *
 * Sheet Compass (6): pick a tower and its twin; light a cell's dual; switch coefficients; raise a tower.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['twin_towers', 'dual_cells', 'broken_mirror', 'across_seam']

export const OPENING = [
  G('Emmy? Did Wren ever bring the post this far north?'),
  E('Once. She said the Seam looked like the sea arguing with itself. …Come on. There’s work here.'),
  E('Cohomology towers on this side, homology on that one. On a closed, orientable $n$-manifold they mirror each other: $Hᵏ(M) ≅ Hₙ₋ₖ(M)$. That’s Poincaré duality.'),
  E('Both words matter. Closed means no edge: a disk has $H⁰ = ℤ$ but nothing in $H₂$. Orientable means there’s a top class $[M]$, the whole surface added up with matching signs, and duality is built from it.'),
  E('The Poincaré Colossus guards the Seam: stone below, light above. Strike the stone in chain stance, then the light in cochain stance (G), back and forth. Six pairings and it falls.'),
  E('Sheet Compass, on 6. First pair of towers is ahead.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  twin_towers: {
    blueprint: 'Twin Towers',
    arrive: [E('The torus, so $n = 2$. Click a cohomology tower on the left, then its twin on the right: $Hᵏ$ goes with $H₂₋ₖ$.')],
    early: [E('Not this tower yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Pair each Hᵏ with its twin Hₙ₋ₖ', [G('$H⁰$ with $H₂$, $H¹$ with $H₁$, $H²$ with $H₀$.'), E('And each pair matches: $ℤ$, $ℤ²$, $ℤ$. Duality turns the degrees upside down.')]),
      {
        type: 'ask',
        question: 'On a closed orientable $n$-manifold, $Hᵏ$ is isomorphic to…',
        options: ['$Hₙ₋ₖ$', '$Hₖ$', '$Hₖ₊ₙ$'],
        answer: '$Hₙ₋ₖ$',
        wrong: [E('Which tower did $H⁰$ pair with?')],
        right: [E('Theorem 3.30. The map is “cap with $[M]$”: a $k$-cochain eats the first $k$ corners of each simplex of $[M]$ and leaves the rest. Next tower: follow the NEXT ring, east.')],
      },
    ],
  },
  dual_cells: {
    blueprint: 'Dual Cells',
    arrive: [
      E('Why should it work? Draw the dual cells: a new cell structure with one dual cell crossing each old one. The torus has one corner, edges $a$ and $b$, and one face.'),
      E('Click each cell (the corner, the label $a$, the label $b$, the middle) and its dual cell lights in pink.'),
    ],
    early: [E('Not this tower yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Light the dual of every cell', [G('The face turned into a point, each edge into an edge crossing it, and the corner into a whole face!'), E('Each $k$-cell meets exactly one dual $(n−k)$-cell. The dual cells’ boundary map is the old coboundary map turned round, so their homology is the old cohomology.')]),
      {
        type: 'ask',
        question: 'In an $n$-manifold, the dual of a $k$-cell is a cell of dimension…',
        options: ['$n − k$', '$k$', '$n + k$'],
        answer: '$n − k$',
        wrong: [E('The 2-dimensional face’s dual was a point.')],
        right: [E('Right. Next tower: follow the NEXT ring back west.')],
      },
    ],
  },
  broken_mirror: {
    blueprint: 'The Broken Mirror',
    arrive: [
      E('$ℝP²$ is closed but not orientable. Pair its towers with $ℤ$ coefficients and watch what happens.'),
      E('Then switch the coefficients with the lever by the Seam and try again.'),
    ],
    early: [E('Not this tower yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Make every pair match', [G('Mod 2, every pair matches.'), E('Mod 2 there are no signs to clash, so every manifold is $ℤ₂$-orientable, and with $ℤ₂$ coefficients duality always holds.')]),
      {
        type: 'ask',
        question: 'Why did the mirror break over $ℤ$?',
        options: ['ℝP² isn’t orientable, so it has no ℤ fundamental class', 'ℝP² has no cells', 'Cohomology can’t see ℤ₂'],
        answer: 'ℝP² isn’t orientable, so it has no ℤ fundamental class',
        wrong: [E('Duality caps with a fundamental class. Does ℝP² have one over ℤ? What was its $H₂$?')],
        right: [E('Right: $H₂(ℝP²) = 0$, so there’s nothing to cap with. Last tower: follow the NEXT ring, north-east.')],
      },
    ],
  },
  across_seam: {
    blueprint: 'Across the Seam',
    arrive: [
      E('The 3-torus, $n = 3$. Its cohomology is $ℤ$, $ℤ³$, $ℤ³$, $ℤ$. Homology $H₀$ and $H₁$ are already known. Raise $H₂$ and $H₃$ to what duality says they must be.'),
    ],
    early: [E('Not this tower yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Raise H₂ and H₃ to their duals', [G('$H₂ = ℤ³$ and $H₃ = ℤ$.'), E('$H₃ ≅ H⁰ = ℤ$: that’s the fundamental class. $H₂ ≅ H¹ = ℤ³$. You never had to compute them.')]),
      {
        type: 'ask',
        question: 'For a closed connected orientable $n$-manifold, what is $Hₙ(M; ℤ)$?',
        options: ['$ℤ$, generated by the fundamental class', '$0$', 'It depends on $n$'],
        answer: '$ℤ$, generated by the fundamental class',
        wrong: [E('$Hₙ ≅ H⁰$, and $M$ is connected.')],
        right: [E('Both sides of the Seam agree. The gate’s open, north.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your towers are still standing. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next tower is ${name}: follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Poincaré duality: for a closed R-orientable n-manifold, capping with the fundamental class gives Hᵏ(M; R) ≅ Hₙ₋ₖ(M; R). Dual cells explain it — each k-cell meets one dual (n−k)-cell. Every manifold is ℤ₂-orientable, so with ℤ₂ coefficients it holds for ℝP² too.',
  cite: 'Hatcher, Algebraic Topology §3.3, pp. 239–249 (Theorem 3.30).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet wraith first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Both sides agree. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'dual_cells') return [E('Click the corner stud, the $a$ label, the $b$ label, and the middle of the square.')]
  if (current === 'broken_mirror') return [E('Pair them first and look at the colours. Then try the lever by the Seam.')]
  if (current === 'across_seam') return [E('Click $H₂$ and $H₃$ on the right to raise them. Each has to match its twin across the Seam.')]
  return [E('Left tower $Hᵏ$, then the right tower $Hₙ₋ₖ$ straight across.')]
}
