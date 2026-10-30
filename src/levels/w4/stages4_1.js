/**
 * World 4 · Level 4-1 "Cube Root" — Cube Hall.
 * Hatcher §4.1, pp. 339–346 — πₙ(X, x₀) is the set of homotopy classes of maps (Iⁿ, ∂Iⁿ) → (X, x₀);
 * since collapsing ∂Iⁿ gives Sⁿ, these are maps of the n-sphere. The sum f + g puts f and g side
 * by side in the first coordinate; −f reflects it. For n ≥ 2 the group is abelian: shrink f and g,
 * slide them past each other in the second coordinate, and regrow. For n = 1 there is no room.
 *
 * Tide Glass (3): pin an edge; pick a cube and its slot; step through the swap.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['pinned', 'stack', 'pass', 'dim1']

export const OPENING = [
  G('He built all of this. Floor after floor, for twenty years.'),
  E('Ansel never did anything by halves. Even grieving.'),
  G('…Okay. Then we climb it. What’s on this floor?'),
  E('Loops again, but in every dimension. A loop was an interval with both ends sent to the base point. Now take a square, a cube, any $Iⁿ$, and send its whole boundary to the base point $x₀$.'),
  G('A square with its whole edge squashed to one point… that closes up into a ball. A sphere!'),
  E('Right. So each of these is a map of $Sⁿ$ into the space. Count them up to sliding, and you get the group $πₙ(X, x₀)$.'),
  E('Tide Glass is 3. First station’s north-east; follow the NEXT ring on your map. Two commons hang off it, west and north-east, both with beasts. They’re optional.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  pinned: {
    blueprint: 'Pinned Cubes',
    arrive: [E('A square with a map $f$ painted on it. To count as an element of $π₂$, every point of its edge has to sit on the beacon $x₀$. Pin all four edges with the Tide Glass.')],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Pin all four edges of the square to the beacon', [G('The whole edge, on $x₀$.'), E('Now crush that edge to a single point and the square closes up like a drawstring bag: it’s $S²$. So this is a map $S² → X$.')]),
      {
        type: 'ask',
        question: 'An element of $πₙ(X, x₀)$ is a homotopy class of maps…',
        options: ['$(Iⁿ, ∂Iⁿ) → (X, x₀)$ — the whole boundary to the base point', '$Iⁿ → X$ with any boundary', '$X → Sⁿ$'],
        answer: '$(Iⁿ, ∂Iⁿ) → (X, x₀)$ — the whole boundary to the base point',
        wrong: [E('Which edges did you just pin, and where to?')],
        right: [E('That’s it. Next one’s north-west, on the NEXT ring.')],
      },
    ],
  },
  stack: {
    blueprint: 'Stack',
    arrive: [
      E('Two loops add by running one, then the other. Squares add the same way: squeeze $f$ into the left half and $g$ into the right.'),
      E('Click a cube’s crate, then the half it goes in.'),
    ],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Put f in the left half and g in the right half', [G('$f$ on the left, $g$ on the right.'), E('That’s $f + g$. Flip $f$ left to right and you get $−f$: put the two side by side and the pair shrinks back to nothing.')]),
      {
        type: 'ask',
        question: 'How is $f + g$ defined in $πₙ$?',
        options: ['Squeeze $f$ and $g$ into the two halves of $Iⁿ$, side by side', 'Multiply their values', 'Draw $g$ on top of $f$'],
        answer: 'Squeeze $f$ and $g$ into the two halves of $Iⁿ$, side by side',
        wrong: [E('Look at where you put them.')],
        right: [E('Same as joining loops end to end, just with more room. Next one’s north-east, on the NEXT ring.')],
      },
    ],
  },
  pass: {
    blueprint: 'Pass Each Other',
    arrive: [
      E('Question: is $f + g$ the same as $g + f$? For loops, often not. Here, watch.'),
      E('Use the Tide Glass to step through it: shrink both into small boxes, slide one up and one down, move them past each other, then grow them back.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Deform f + g into g + f', [G('They swapped sides, and it stayed one smooth slide the whole way.'), E('Everything outside the two boxes sits on $x₀$ at every step, so the edge never comes unpinned. Every step is still inside $πₙ$, and $f + g = g + f$.')]),
      {
        type: 'ask',
        question: 'What made the swap possible?',
        options: ['A second direction to slide in — only there when $n ≥ 2$', 'The colours', 'The beacon moving'],
        answer: 'A second direction to slide in — only there when $n ≥ 2$',
        wrong: [E('Watch how they got past each other. Which way did they go?')],
        right: [E('Right. One more, one dimension down. It’s north-west, on the NEXT ring.')],
      },
    ],
  },
  dim1: {
    blueprint: 'One Dimension Down',
    arrive: [E('Same trick on an interval. That’s loops, $π₁$. Try to pass $f$ and $g$ with the Tide Glass.')],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Try to pass f and g on the interval', [G('Stuck. On a line they’d have to go through each other.'), E('No sideways to step into. That’s why $π₁$ can fail to be abelian: on the figure-eight, $ab$ and $ba$ are different loops.')]),
      {
        type: 'ask',
        question: 'So for which $n$ is $πₙ(X)$ always abelian?',
        options: ['$n ≥ 2$', 'all $n$', '$n = 1$ only'],
        answer: '$n ≥ 2$',
        wrong: [E('The square let them pass. The interval didn’t.')],
        right: [E('From two up, order stops mattering. The Commutator’s word $aba⁻¹b⁻¹$ is just zero here.'), G('No wonder Null threw him out.'), E('The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back, and your cubes stayed put. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'πₙ(X, x₀) consists of homotopy classes of maps (Iⁿ, ∂Iⁿ) → (X, x₀), i.e. maps of Sⁿ. Two classes add by placing their cubes side by side. For n ≥ 2 they can be shrunk and slid past each other, so πₙ is abelian; for n = 1 there is no room, and π₁ need not be.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 339–346.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first. That’s 1.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('That’s the Hall done. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it comes up.')]
  if (current === 'pinned') return [E('Tide Glass (3): click each grey edge of the square.')]
  if (current === 'stack') return [E('Click the $f$ crate, then the left half. Then the $g$ crate, then the right half.')]
  return [E('Click the square with the Tide Glass. Each click is one step of the slide.')]
}
