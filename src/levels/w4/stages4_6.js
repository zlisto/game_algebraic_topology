/**
 * World 4 · Level 4-6 "Hurewicz" — Hurewicz Hall.
 * Hatcher §4.2, pp. 366–371 — the Hurewicz map h: πₙ(X) → Hₙ(X), and the Hurewicz theorem
 * (Theorem 4.32): if X is (n−1)-connected with n ≥ 2, then H̃ᵢ(X) = 0 for i < n and h is an
 * isomorphism on πₙ; for n = 1, h: π₁(X) → H₁(X) is onto with kernel the commutator subgroup
 * (Theorem 2A.1). Above the first non-zero degree there is no such guarantee: π₃(S²) = ℤ, H₃(S²) = 0.
 *
 * Degree Dial (8): read a pair of meters; test a bridge; name a space's first non-zero degree.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['meters', 'first', 'dim1', 'beyond']

export const OPENING = [
  E('Hurewicz Hall. Two kinds of counting meet here: homotopy, which we’ve been doing all the way up the Spire, and homology, from the Delta.'),
  E('Take a map $f: Sⁿ → X$. Its sphere covers some patch of $X$, so many times over, with signs. That count is a homology class in $Hₙ(X)$.'),
  E('So every element of $πₙ(X)$ gives one of $Hₙ(X)$. That’s the Hurewicz map, $h: πₙ(X) → Hₙ(X)$.'),
  G('A bridge from one kind of count to the other. Does it hold?'),
  E('Sometimes. Finding out when is the whole Hall. Degree Dial’s on 8. First station’s east; follow the NEXT ring. Two commons off it, north-west and west. Beasts on the west one.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  meters: {
    blueprint: 'Two Meters',
    arrive: [
      E('$S²$, with homotopy meters on the left and homology meters on the right, one row per dimension. Read each pair with the Dial.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Read all three pairs of meters', [
        G('Row 1, both zero. Row 2, both $ℤ$. Row 3… $π₃ = ℤ$, but $H₃ = 0$.'),
        E('Right. Homology can’t see the Hopf map at all. The two counts really are different things.'),
      ]),
      {
        type: 'ask',
        question: 'Where do the two columns of $S²$ first agree on a non-zero group?',
        options: ['Degree 2', 'Degree 1', 'Degree 3'],
        answer: 'Degree 2',
        wrong: [E('Go up from the bottom row. Which is the first row where either side reads something other than $0$?')],
        right: [E('Degree $2$. And that isn’t luck. Next station’s north, on the NEXT ring.')],
      },
    ],
  },
  first: {
    blueprint: 'First Nonzero',
    arrive: [
      E('A space is $(n−1)$-connected when every sphere of dimension below $n$ in it shrinks to a point. $S³$ is $2$-connected: loops and $2$-spheres in it all shrink.'),
      E('Three spaces: $S³$, $S² ∨ S²$, $ℂP²$. For each one, click the row of its first non-zero homotopy group, and the Dial tests the bridge there.'),
    ],
    early: [E('Not this one yet. Finish the station before it; NEXT on your map points the way.')],
    goals: [
      act('Find the first non-zero degree of all three spaces', [
        G('All three hold. Every first bridge.'),
        E('That’s the Hurewicz theorem. If $X$ is $(n−1)$-connected and $n ≥ 2$, homology below $n$ is zero too, and at $n$ the bridge is an isomorphism: $πₙ ≅ Hₙ$.'),
        E('So every count you took at the Delta told the truth about spheres. At the first place a space has anything, the two counts agree.'),
      ]),
      {
        type: 'ask',
        question: 'For an $(n−1)$-connected space with $n ≥ 2$, Hurewicz says…',
        options: ['$H̃ᵢ = 0$ for $i < n$ and $πₙ ≅ Hₙ$', '$πᵢ ≅ Hᵢ$ for every $i$', '$πₙ = 0$'],
        answer: '$H̃ᵢ = 0$ for $i < n$ and $πₙ ≅ Hₙ$',
        wrong: [E('You just watched $S²$’s third row disagree. Only the first bridge is guaranteed.')],
        right: [E('Theorem 4.32. Now dimension one, where it’s a bit different. North-west, on the NEXT ring.')],
      },
    ],
  },
  dim1: {
    blueprint: 'Dimension One',
    arrive: [
      E('The figure-eight. Its $π₁$ is the free group on two loops, $a$ and $b$, where order matters. Its $H₁ = ℤ²$ just counts how often you go round each.'),
      E('Test the bridge at degree $1$.'),
    ],
    early: [E('Not yet. NEXT on your map shows which station comes first.')],
    goals: [
      act('Test the bridge at degree 1', [
        G('Every pair of counts gets hit. But $aba⁻¹b⁻¹$ goes to $0$.'),
        E('Count it: $a + b − a − b = 0$. Homology adds, and addition forgets order. Same as Forget the Order, back in World 2.'),
        E('So in degree $1$ the bridge is onto, and what it loses is exactly the commutators. $H₁$ is $π₁$ made abelian.'),
      ]),
      {
        type: 'ask',
        question: 'For $n = 1$, $h: π₁ → H₁$ is…',
        options: ['onto, with kernel the commutator subgroup', 'always an isomorphism', 'zero'],
        answer: 'onto, with kernel the commutator subgroup',
        wrong: [E('Did $aba⁻¹b⁻¹$ survive the bridge? And did anything in $ℤ²$ go unreached?')],
        right: [E('Right. Last station’s west, on the NEXT ring.')],
      },
    ],
  },
  beyond: {
    blueprint: 'Beyond the First',
    arrive: [E('$S²$ again. Test every bridge, degrees $1$, $2$ and $3$, and see which ones the theorem actually covers.')],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Test all three bridges', [
        G('One and two hold. Three fails.'),
        E('$S²$ is $1$-connected, so $n = 2$ and Hurewicz promises degree $2$. Nothing more. Above that, homotopy can be much bigger than homology: $π₃(S²) = ℤ$, $H₃(S²) = 0$.'),
      ]),
      {
        type: 'ask',
        question: 'Does Hurewicz say anything about $π₃(S²) → H₃(S²)$?',
        options: ['No — degree 3 is above the first non-zero group', 'Yes, it’s an isomorphism', 'Yes, it’s zero'],
        answer: 'No — degree 3 is above the first non-zero group',
        wrong: [E('$S²$’s first non-zero group is in degree $2$. That’s the only bridge the theorem vouches for.')],
        right: [
          G('So if he hands us a homology count and says that’s the whole space…'),
          E('…you ask him what it says in degree three. The gate’s open, north of here.'),
        ],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your bridges are still tested. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'The Hurewicz map sends a map Sⁿ → X to the image of the fundamental class: h: πₙ(X) → Hₙ(X). If X is (n−1)-connected, n ≥ 2, then H̃ᵢ(X) = 0 for i < n and h is an isomorphism in degree n; in degree 1 it is abelianization. Above the first non-zero degree there is no such promise.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 366–371 (Theorem 4.32).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this conversation first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash them (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every bridge tested. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'meters') return [E('Degree Dial (8): click each row’s meters.')]
  if (current === 'first') return [E('$S³$ has nothing until degree $3$. $S² ∨ S²$ and $ℂP²$ start at degree $2$. Click that row in each column pair.')]
  return [E('Degree Dial (8): click the post in the middle of a row to test its bridge.')]
}
