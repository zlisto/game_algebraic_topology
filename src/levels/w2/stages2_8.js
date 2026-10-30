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
  E('Patchwork Fields. Cover a place with two patches, $A$ and $B$, overlapping a little. If you know the holes in each patch and in the overlap, you can work out the holes in the whole place.'),
  G('Like the Van Kampen Clasp at the Glue Works?'),
  E('Same idea, for homology. Here’s why it works: any cycle in the whole place can be cut into a piece in $A$ and a piece in $B$. Where the two pieces meet is a cycle in the overlap.'),
  E('Written as a row, that’s Mayer–Vietoris: $… → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B) → …$, and it’s exact. The last map is the “where they meet” map.'),
  E('Clasp both patches on (5), then find the unknown with the Blade (7). First field is west; follow the NEXT ring. Commons sit north-east and east of it; the east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  hemi: {
    blueprint: 'Two Hemispheres',
    arrive: [
      E('The sphere. Clasp cap $A$ over the top and cap $B$ underneath. They overlap in a band round the middle.'),
      E('Each cap is a disk, no holes at all. The band squeezes down to a circle, the equator.'),
    ],
    early: [E('Not this field yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Clasp both patches on (5), then find $H₂(S²)$ with the Blade (7)', [G('ℤ. Squeezed between two zeros.'), E('Cut the sphere’s skin along the equator: a top cap plus a bottom cap. Where they meet is the equator, once round. So $∂$ sends the whole sphere to that circle, one-to-one and onto.')]),
      {
        type: 'ask',
        question: 'Here $H₂(S²) ≅ H₁(A∩B)$. What is the overlap $A∩B$, up to homotopy?',
        options: ['A circle', 'A point', 'Two points'],
        answer: 'A circle',
        wrong: [E('The caps meet in a band round the equator. Squeeze the band thin.')],
        right: [E('A circle. Do the same one dimension up, two caps of $S³$ meeting in an $S²$, and you get the next sphere, and the next. Next field is north, on the NEXT ring.')],
      },
    ],
  },
  annuli: {
    blueprint: 'Two Arcs',
    arrive: [
      E('A circle, covered by two arcs: $A$ over the north, $B$ over the south. Each arc on its own is just a bent interval. No holes.'),
      E('But the overlap is two short pieces, one east and one west. Clasp both on, then find $H₁(S¹)$.'),
    ],
    early: [E('Not this field yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Clasp both arcs on, then find $H₁(S¹)$', [G('The hole came from the overlap being in two pieces!'), E('A loop round the circle is a path through $A$ from the west piece to the east piece, then back through $B$. Where they meet: east minus west, $(1, −1)$. That’s the kernel of $ℤ² → ℤ²$.')]),
      {
        type: 'ask',
        question: 'If the overlap $A∩B$ were one piece instead of two, what would $H₁$ be?',
        options: ['$0$', '$ℤ$', '$ℤ²$'],
        answer: '$0$',
        wrong: [E('With one piece, $H₀(A∩B) = ℤ$, and the map $ℤ → ℤ²$ is one-to-one. Its kernel is…')],
        right: [E('Right. Then the two arcs make one longer arc. The hole lives in how the overlap falls apart. Next field is north-east, on the NEXT ring.')],
      },
    ],
  },
  twist: {
    blueprint: 'The Twisted Patch',
    arrive: [
      E('The Klein bottle, the Tile Yard square with one pair of arrows turned. Patch $A$ is the middle band. Patch $B$ is the two outer bands, which meet across the glued edge.'),
      E('Each patch is a Möbius band, and a Möbius band squeezes to its centre circle. Their overlap is a single circle that runs twice round each band.'),
    ],
    early: [E('Not this field yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Clasp both bands on, then find $H₁$ of the Klein bottle', [G('ℤ ⊕ ℤ₂. Same as the Cell Block!'), E('The overlap circle goes in as $x ↦ (2x, −2x)$: twice round each band. Divide $ℤ²$ by $(2, −2)$ and you keep one free loop and one that dies when doubled.')]),
      {
        type: 'ask',
        question: 'What is $H₂$ of the Klein bottle, from this row?',
        options: ['$0$ — the map $x ↦ (2x, −2x)$ is one-to-one', '$ℤ$', '$ℤ₂$'],
        answer: '$0$ — the map $x ↦ (2x, −2x)$ is one-to-one',
        wrong: [E('$H₂(K)$ is the kernel of $H₁(A∩B) → H₁(A) ⊕ H₁(B)$. What does $x ↦ (2x, −2x)$ send to zero?')],
        right: [E('Only $0$. So $H₂(K) = 0$. Hatcher does exactly this in Example 2.47, and it agrees with the crates. Last field is east, on the NEXT ring.')],
      },
    ],
  },
  own: {
    blueprint: 'Two Annuli',
    arrive: [
      E('The torus: the same square, arrows untwisted. Now each patch is an annulus, a ring of land, and the overlap is two annuli.'),
      E('Two things feed $H₁(T)$. What’s left of $H₁(A) ⊕ H₁(B)$ once the overlap’s loops are divided out, and a new loop made because the overlap falls into two pieces, like the arcs.'),
    ],
    early: [E('Not this field yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Clasp both annuli on, then find $H₁$ of the torus', [G('ℤ². Round the tube, and round the ring.'), E('One loop is the core of an annulus, running round inside a patch. The other crosses: out through $A$, over one overlap into $B$, back over the other. It exists because the overlap is in two pieces.'), E('And the overlap’s two core loops, run opposite ways, die in $A ⊕ B$. That kernel is $H₂(T) ≅ ℤ$, the torus’s skin.')]),
      {
        type: 'ask',
        question: 'Mayer–Vietoris needs $A$ and $B$ to be…',
        options: ['subspaces whose interiors cover $X$', 'disjoint', 'both contractible'],
        answer: 'subspaces whose interiors cover $X$',
        wrong: [E('These patches weren’t contractible, and they definitely overlapped.')],
        right: [E('That’s all it needs, a little overlap all along the seam. Same reason as excision: chains have to be cut small enough to land in one patch or the other.'), E('The gate’s north of this field.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your patches are still on. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next field is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'If the interiors of A and B cover X, the Mayer–Vietoris sequence … → Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B) → … is exact. From pieces you know it computes spheres, the circle, the torus, and the Klein bottle as two Möbius bands: H₁ = ℤ ⊕ ℤ₂.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 149–153 (Mayer–Vietoris sequences; Example 2.47).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every field’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  const p = bag.patches?.[current] || {}
  if (!p.A || !p.B) return [E('Van Kampen Clasp (5), then click the two patch pads, A and B.')]
  if (current === 'hemi') return [E('$H₂(S²)$ sits between two zeros, the caps’ groups. So it has to match $H₁(A∩B)$.')]
  if (current === 'annuli') return [E('Before it in the row: $0$. After it, $ℤ² → ℤ²$ sends $(x, y)$ to $(x+y, x+y)$. Exactness says $H₁(S¹)$ is that map’s kernel.')]
  if (current === 'twist') return [E('$∂$ is zero here, so $H₁(K)$ is all of $ℤ²$ with the image of $x ↦ (2x, −2x)$ divided out.')]
  return [E('What’s left after the first map: $ℤ$. What the last map sends to zero: $ℤ$. Put them together…')]
}
