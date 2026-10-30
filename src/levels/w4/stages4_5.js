/**
 * World 4 · Level 4-5 "One Group" — One Group.
 * Hatcher §4.2, pp. 365–366 — Eilenberg–MacLane spaces K(G, n): πₙ = G and all other homotopy groups
 * zero. K(G, 1)s include S¹ = K(ℤ, 1), the torus = K(ℤ², 1), ℝP∞ = K(ℤ₂, 1) (their universal covers
 * are contractible). A K(G, n) is built from a space with the right πₙ by attaching cells of
 * dimension n + 2, n + 3, … to kill the higher homotopy groups one at a time; from S² this gives
 * K(ℤ, 2), which is ℂP∞.
 *
 * Cell Hammer (2): mark a space; attach the cell that kills a group.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['recall', 'kill']

export const OPENING = [
  G('Every terrace up here is a different shape of trouble. What’s this one?'),
  E('One Group. Most spaces have holes in lots of dimensions at once. A few have exactly one kind: $πₙ = G$ in one dimension $n$, and every other homotopy group $0$.'),
  E('Those are called $K(G, n)$, Eilenberg–MacLane spaces. Every floor of his Spire is one of them. Ansel always did like a clean brick.'),
  G('Then let’s see what the bricks are made of.'),
  E('Cell Hammer’s on 2. First station’s north; follow the NEXT ring on your map. Two commons hang off it, north-east and east, if you want them. The east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  recall: {
    blueprint: 'Recall',
    arrive: [
      E('Five spaces on pedestals. A $K(G, 1)$ has its one group in dimension $1$: loops can be tangled, but every sphere of dimension $2$ or more shrinks.'),
      E('Mark the ones that qualify and mark the others “not”. Think about each one’s universal cover, the space that unwinds all its loops.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Mark every space correctly', [
        G('The circle, the torus, and ℝP∞.'),
        E('Their universal covers are $ℝ$, $ℝ²$ and $S∞$, and all three shrink to a point. A covering map doesn’t change $πₙ$ for $n ≥ 2$, so all those groups are $0$ downstairs too.'),
        E('$S²$ fails outright: $π₂(S²) = ℤ$. And $ℝP²$ is covered by $S²$, so it inherits that same $π₂ = ℤ$.'),
      ]),
      {
        type: 'ask',
        question: 'Why is $ℝP∞$ a $K(ℤ₂, 1)$ but $ℝP²$ is not?',
        options: ['ℝP∞’s universal cover $S∞$ is contractible; ℝP²’s is $S²$, with $π₂ = ℤ$', 'ℝP² has the wrong $π₁$', 'ℝP∞ is not a CW complex'],
        answer: 'ℝP∞’s universal cover $S∞$ is contractible; ℝP²’s is $S²$, with $π₂ = ℤ$',
        wrong: [E('They both have $π₁ = ℤ₂$, so that isn’t it. Look upstairs, at what covers each one.')],
        right: [E('That’s it. Now we build one ourselves. Next station’s north-west, on the NEXT ring.')],
      },
    ],
  },
  kill: {
    blueprint: 'Kill Above',
    arrive: [
      E('We start from $S²$. Its $π₂ = ℤ$ is the group we want to keep. The trouble is everything above it: $π₃(S²) = ℤ$, and more after that.'),
      E('To kill $π₃$, take a map $S³ → S²$ that generates it and glue a $4$-ball on along it. Now that sphere bounds a ball, so it shrinks.'),
      E('Go from the bottom up. Click each meter with the Cell Hammer to attach the cell that kills it.'),
    ],
    early: [E('Not yet. Finish the station before this one first; NEXT on your map points the way.')],
    goals: [
      act('Kill π₃, π₄ and π₅ in order', [
        G('Only $π₂ = ℤ$ left.'),
        E('Keep going forever, one dimension at a time, and what you end with is $K(ℤ, 2)$. Hatcher shows that space is $ℂP∞$. We’re taking his word on that one, not building it here.'),
      ]),
      {
        type: 'ask',
        question: 'Why kill from the bottom up?',
        options: ['Attaching $(k+1)$-cells kills $πₖ$ without changing lower groups — but it can change higher ones', 'Higher groups are bigger', 'It doesn’t matter'],
        answer: 'Attaching $(k+1)$-cells kills $πₖ$ without changing lower groups — but it can change higher ones',
        wrong: [E('Remember the Grid Gallery: a small sphere can be slid off a big new cell. So new $(k+1)$-cells can’t touch $πᵢ$ for $i < k$. Above $k$, anything goes.')],
        right: [
          E('Right. The groups below are safe, and the ones above you fix next.'),
          G('So that’s how he builds his floors. One group each, everything else filled in.'),
          E('And that’s all a floor is. What holds them together is a different story. The gate’s open, north of here.'),
        ],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your cells are still attached. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'An Eilenberg–MacLane space K(G, n) has πₙ = G and every other homotopy group zero — S¹, the torus and ℝP∞ are K(G, 1)s. Starting from a space with the right πₙ, attaching cells of dimension n + 2, n + 3, … kills the higher groups one at a time; from S² this builds K(ℤ, 2) = ℂP∞.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 365–366 (Eilenberg–MacLane spaces).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this conversation first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash them (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('One group left standing. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'recall') return [E('Cell Hammer (2): click a pedestal to cycle yes → no → unset. A $K(G, 1)$ has nothing above $π₁$.')]
  return [E('Cell Hammer (2): click $π₃$ first, then $π₄$, then $π₅$. Bottom up.')]
}
