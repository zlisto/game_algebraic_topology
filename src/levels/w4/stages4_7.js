/**
 * World 4 · Level 4-7 "Hop Off" — Hopf Ring.
 * Hatcher §4.2, pp. 375–380 — fibre bundles and their long exact sequence of homotopy groups
 * (Theorem 4.41), and the Hopf bundle S¹ → S³ → S² (Example 4.45): the fibres are circles, any two
 * of them linked once. The sequence gives π₃(S²) ≅ π₃(S³) ≅ ℤ, so the Hopf map is not
 * null-homotopic.
 *
 * Sheet Compass (6): light the fibre over a point. Degree Dial (8): try a group in the unknown lock.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['circle', 'linked', 'seq', 'nulls_answer']

export const OPENING = [
  N('Still climbing, Gyroid. I told you at the Gardens: every map from the three-sphere to the two-sphere squashes flat. There’s nothing up here worth the climb.'),
  G('He said that about the sphere, too.'),
  E('The Hopf Ring. If he’s right, the Gardens go back on the block. If he’s wrong, they stay on the Chart for good.'),
  E('Here’s the map he means. Above every point of a little sphere $S²$ sits a whole circle, and all those circles together fill up $S³$.'),
  E('Sheet Compass on 6, Degree Dial on 8. First station’s north; follow the NEXT ring. Two commons off it, north-west and north-east. The north-east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  circle: {
    blueprint: 'A Circle per Point',
    arrive: [
      E('Think of $S³$ as pairs of complex numbers $(z₁, z₂)$ with $|z₁|² + |z₂|² = 1$. The Hopf map keeps only their ratio, $z₁ : z₂$, and the ratios form a sphere $S²$.'),
      E('Multiply both numbers by the same unit complex number and the ratio doesn’t change. Those multiples trace out a circle, and that circle is what sits over one point.'),
      E('The buttons are points of the little $S²$. Click one with the Sheet Compass and its circle lights up. $S³$ is drawn from the inside, by stereographic projection. Light all four.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Light the fibre over all four points', [
        G('Four circles, all tangled up in each other.'),
        E('Every point of $S³$ lies on exactly one of them. Each circle is a fibre, and they all look the same.'),
        E('That makes it a fibre bundle: a circle over each point of $S²$, and over any small patch of $S²$ it’s just the patch times a circle.'),
      ]),
      {
        type: 'ask',
        question: 'What is the fibre of the Hopf map $S³ → S²$?',
        options: ['A circle $S¹$', 'A point', 'A sphere $S²$'],
        answer: 'A circle $S¹$',
        wrong: [E('What lit up over each button?')],
        right: [E('A circle. Next station’s north-east, on the NEXT ring.')],
      },
    ],
  },
  linked: {
    blueprint: 'Linked',
    arrive: [E('Pick any two points and light their circles. Then look closely at how they sit.')],
    early: [E('Not yet. Finish the station before this one; NEXT on your map points the way.')],
    goals: [
      act('Light two fibres', [
        G('They go through each other. Once, exactly.'),
        E('Any two Hopf fibres link once, like two rings of a chain. You can’t pull them apart without cutting one.'),
      ]),
      {
        type: 'ask',
        question: 'How many times do two different Hopf fibres link?',
        options: ['Once', 'Never', 'Twice'],
        answer: 'Once',
        wrong: [E('Follow one circle round and count how often it passes through the other.')],
        right: [
          E('Once. That’s a strong hint the map can’t be squashed flat. A hint isn’t a proof, though.'),
          E('The proof’s next, north-west, on the NEXT ring.'),
        ],
      },
    ],
  },
  seq: {
    blueprint: 'The Sequence',
    arrive: [
      E('A fibre bundle $F → E → B$ gives a long row of groups: $… → πₙ(F) → πₙ(E) → πₙ(B) → πₙ₋₁(F) → …$ (Theorem 4.41).'),
      E('Read it like a relay. At every group, what the incoming map delivers is exactly what the outgoing map sends to $0$. That’s what exact means.'),
      E('Ours, in degree $3$: $π₃(S¹) → π₃(S³) → π₃(S²) → π₂(S¹)$. We know $π₃(S³) = ℤ$. One lock is unknown. Find it with the Dial.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Find π₃(S²) so the row is exact', [
        G('$ℤ$. Squeezed between two zeros again.'),
        E('Both circle terms are $0$. The left zero delivers only $0$, so only $0$ may die in the middle map: it’s one-to-one.'),
        E('The right zero swallows everything, so everything in $π₃(S²)$ must be delivered: it’s onto.'),
        E('So $π₃(S²) ≅ π₃(S³) ≅ ℤ$, and the Hopf map itself is the generator.'),
      ]),
      {
        type: 'ask',
        question: 'Why are $π₃(S¹)$ and $π₂(S¹)$ zero?',
        options: ['The universal cover of $S¹$ is $ℝ$, which is contractible', 'Because $S¹$ is small', 'They aren’t'],
        answer: 'The universal cover of $S¹$ is $ℝ$, which is contractible',
        wrong: [E('Remember One Group: $S¹$ is a $K(ℤ, 1)$. Look at what covers it.')],
        right: [E('Right. Now go and tell him. North-west, on the NEXT ring.')],
      },
    ],
  },
  nulls_answer: {
    blueprint: 'Null’s Answer',
    arrive: [
      N('Well, Gyroid? Lay the three-sphere down on the two-sphere and let it go flat. It doesn’t hurt.'),
      E('Show him. Light the circles over two points.'),
    ],
    early: [E('Not yet. NEXT on your map shows which station comes first.')],
    goals: [
      act('Light the fibres over two points', [
        N('…They’re linked.'),
        N('Two rings that won’t come apart. I used to think that was the saddest thing I knew.'),
        E('The linking is what you see. The row you just filled in is the proof: $π₃(S²) ≅ ℤ$, and the Hopf map generates it. It isn’t trivial.'),
        G('So it’s not nothing. And neither are the Gardens.'),
      ]),
      {
        type: 'ask',
        question: 'Is the Hopf map $S³ → S²$ null-homotopic?',
        options: ['No — it generates $π₃(S²) ≅ ℤ$', 'Yes — $S³$ is bigger than $S²$', 'Only up to sign'],
        answer: 'No — it generates $π₃(S²) ≅ ℤ$',
        wrong: [E('Bigger isn’t a rule. Cellular approximation only kills $πₖ(Sⁿ)$ for $k < n$, and here $k > n$.')],
        right: [
          E('No. His claim’s broken, and the Gardens are on the Chart for good.'),
          G('Write it in ink.'),
          E('Already have. The gate’s open, north of here.'),
        ],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your fibres are still lit. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'The Hopf map S³ → S² has a circle over every point, any two of them linked once. A fibre bundle F → E → B has a long exact sequence … → πₙ(F) → πₙ(E) → πₙ(B) → πₙ₋₁(F) → …; for S¹ → S³ → S² it gives π₃(S²) ≅ π₃(S³) ≅ ℤ, generated by the Hopf map.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 375–380 (Theorem 4.41, Example 4.45).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this conversation first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash them (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The Ring’s answered. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'seq') return [E('Degree Dial (8): click the unknown lock. It sits between two zeros.')]
  return [E('Sheet Compass (6): click the coloured buttons on the left.')]
}
