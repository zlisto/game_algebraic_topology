/**
 * World 2 · Level 2-8 "Patchwork" — Patchwork Fields.
 * Hatcher §2.2 pp. 149–153 — the Mayer–Vietoris sequence for X = A ∪ B (interiors covering X):
 *   … → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) →∂ Hₙ₋₁(A∩B) → …
 * with examples: spheres from two caps, and the Klein bottle from two Möbius bands (Example 2.47).
 *
 * Van Kampen Clasp (5): clasp a patch on. Boundary Blade (7): try a group in the unknown lock.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['hemi', 'annuli', 'twist', 'own']

export const OPENING = [
  E('Patchwork Fields. Cover a space with two patches, $A$ and $B$, whose insides overlap — and their homology, with the overlap’s, tells you the whole space’s.'),
  G('Like the Van Kampen clasp at the Glue Works?'),
  E('The same idea, for homology. The Mayer–Vietoris sequence: $… → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B) → …$ It’s exact.'),
  E('Clasp on both patches (5), then find the unknown with the Blade (7). First field is west.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  hemi: {
    blueprint: 'Two Hemispheres',
    arrive: [
      E('The sphere. Clasp on cap $A$ over the top and cap $B$ underneath. They overlap in a band round the middle.'),
      E('Each cap is a disk — no holes at all. The band is a circle, up to homotopy.'),
    ],
    early: [E('Not yet — finish the earlier field first. Follow NEXT on the map.')],
    goals: [
      act('Clasp both patches on (5), then find $H₂(S²)$ with the Blade (7)', [G('ℤ, squeezed between two zeros.'), E('$∂$ takes the whole sphere to the band’s circle — an isomorphism.')]),
      {
        type: 'ask',
        question: 'Here $H₂(S²) ≅ H₁(A∩B)$. What is the overlap $A∩B$, up to homotopy?',
        options: ['A circle', 'A point', 'Two points'],
        answer: 'A circle',
        wrong: [E('The caps meet in a band round the equator.')],
        right: [E('A band round the equator — a circle. Run the same argument one dimension up and you get every sphere. Next field is east.')],
      },
    ],
  },
  annuli: {
    blueprint: 'Two Arcs',
    arrive: [
      E('A circle, covered by two arcs: $A$ over the north, $B$ over the south. Each arc on its own is just an interval.'),
      E('But look at the overlap — two short pieces, east and west. Clasp both on, then find $H₁(S¹)$.'),
    ],
    early: [E('Not yet — finish the earlier field first. Follow NEXT on the map.')],
    goals: [
      act('Clasp both arcs on, then find $H₁(S¹)$', [G('The hole came from the overlap having two pieces!'), E('$H₁(S¹)$ is the kernel of $ℤ² → ℤ²$: the difference of the two pieces, $(1, −1)$.')]),
      {
        type: 'ask',
        question: 'If the overlap $A∩B$ were one piece instead of two, what would $H₁$ be?',
        options: ['$0$', '$ℤ$', '$ℤ²$'],
        answer: '$0$',
        wrong: [E('With one piece, $H₀(A∩B) = ℤ$, and the map $ℤ → ℤ²$ is one-to-one.')],
        right: [E('Right — the hole lives in how the overlap falls apart. Next field is north of the first.')],
      },
    ],
  },
  twist: {
    blueprint: 'The Twisted Patch',
    arrive: [
      E('The Klein bottle — the Tile Yard square with one pair of arrows turned. Patch $A$ is the middle band; patch $B$ the outer bands, which meet across the glued edge.'),
      E('Each patch is a Möbius band. Their overlap is a single circle, and it runs twice round each band.'),
    ],
    early: [E('Not yet — finish the earlier field first. Follow NEXT on the map.')],
    goals: [
      act('Clasp both bands on, then find $H₁$ of the Klein bottle', [G('ℤ ⊕ ℤ₂ — the same as in the Cell Block!'), E('$ℤ²$ divided by the image $(2, −2)$: one free part, and a $ℤ₂$.')]),
      {
        type: 'ask',
        question: 'What is $H₂$ of the Klein bottle, from this row?',
        options: ['$0$ — the map $x ↦ (2x, −2x)$ is one-to-one', '$ℤ$', '$ℤ₂$'],
        answer: '$0$ — the map $x ↦ (2x, −2x)$ is one-to-one',
        wrong: [E('$H₂(K)$ is the kernel of $H₁(A∩B) → H₁(A) ⊕ H₁(B)$. What does $x ↦ (2x, −2x)$ kill?')],
        right: [E('Nothing — so $H₂(K) = 0$. Last field is east.')],
      },
    ],
  },
  own: {
    blueprint: 'Two Annuli',
    arrive: [
      E('The torus: the same square, arrows untwisted. Now each patch is an annulus, and the overlap is two annuli.'),
      E('Two things feed $H₁(T)$: what’s left of $H₁(A) ⊕ H₁(B)$ after the overlap’s loops, and the loop made from the overlap falling into two pieces.'),
    ],
    early: [E('Not yet — finish the earlier field first. Follow NEXT on the map.')],
    goals: [
      act('Clasp both annuli on, then find $H₁$ of the torus', [G('ℤ²: round the tube, and round the ring.'), E('One loop from each side of $∂$ — and they’re independent.')]),
      {
        type: 'ask',
        question: 'Mayer–Vietoris needs $A$ and $B$ to be…',
        options: ['subspaces whose interiors cover $X$', 'disjoint', 'both contractible'],
        answer: 'subspaces whose interiors cover $X$',
        wrong: [E('The patches here weren’t contractible, and they certainly overlapped.')],
        right: [E('That’s all it needs. The gate’s open — south of the last field.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your patches stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next field is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'If the interiors of A and B cover X, the Mayer–Vietoris sequence … → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B) → … is exact. From pieces you know it computes spheres, the circle, the torus, and the Klein bottle as two Möbius bands: H₁ = ℤ ⊕ ℤ₂.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 149–153 (Mayer–Vietoris sequences; Example 2.47).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every field is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  const p = bag.patches?.[current] || {}
  if (!p.A || !p.B) return [E('Van Kampen Clasp (5), then click the two patch pads, A and B.')]
  if (current === 'hemi') return [E('$H₂(S²)$ sits between two zeros. Then it must match $H₁(A∩B)$.')]
  if (current === 'annuli') return [E('Before it: $0$. After it, $ℤ² → ℤ²$ sends $(x, y)$ to $(x+y, x+y)$. Exactness: $H₁(S¹)$ is that map’s kernel.')]
  if (current === 'twist') return [E('$∂$ is zero here, so $H₁(K)$ is everything in $ℤ²$ that’s left after dividing out the image of $x ↦ (2x, −2x)$.')]
  return [E('Cokernel of the first map: $ℤ$. Kernel of the last map: $ℤ$. Together…')]
}
