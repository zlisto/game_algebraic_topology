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
  E('The Spire — and the Crown at the top of it. Here we go back to homotopy, but in every dimension.'),
  E('A loop was a map of an interval with both ends at the base point. Now take a square, a cube, any $Iⁿ$ — with its whole boundary sent to the base point $x₀$.'),
  G('A square with its edge squashed to a point… that’s a sphere!'),
  E('A map of $Sⁿ$, exactly. Their homotopy classes form $πₙ(X, x₀)$. Tide Glass on 3.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  pinned: {
    blueprint: 'Pinned Cubes',
    arrive: [E('A square with a map $f$ painted on it. For an element of $π₂$, every edge must go to the beacon $x₀$. Pin all four edges with the Tide Glass.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Pin all four edges of the square to the beacon', [G('The whole edge goes to $x₀$.'), E('Collapse the edge and the square becomes $S²$: this is a map $S² → X$.')]),
      {
        type: 'ask',
        question: 'An element of $πₙ(X, x₀)$ is a homotopy class of maps…',
        options: ['$(Iⁿ, ∂Iⁿ) → (X, x₀)$ — the whole boundary to the base point', '$Iⁿ → X$ with any boundary', '$X → Sⁿ$'],
        answer: '$(Iⁿ, ∂Iⁿ) → (X, x₀)$ — the whole boundary to the base point',
        wrong: [E('Which edges did you pin?')],
        right: [E('Right. Next floor up the Spire.')],
      },
    ],
  },
  stack: {
    blueprint: 'Stack',
    arrive: [E('Add $f$ and $g$: squash $f$ into the left half of the square and $g$ into the right. Click a cube, then its half.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Put f in the left half and g in the right half', [G('$f$ then $g$, side by side.'), E('That’s $f + g$. Reflect $f$ and you get $−f$, its inverse.')]),
      {
        type: 'ask',
        question: 'How is $f + g$ defined in $πₙ$?',
        options: ['Squeeze $f$ and $g$ into the two halves of $Iⁿ$, side by side', 'Multiply their values', 'Draw $g$ on top of $f$'],
        answer: 'Squeeze $f$ and $g$ into the two halves of $Iⁿ$, side by side',
        wrong: [E('Look at where you put them.')],
        right: [E('Just like joining loops end to end. Next floor.')],
      },
    ],
  },
  pass: {
    blueprint: 'Pass Each Other',
    arrive: [E('Is $f + g = g + f$? Use the Tide Glass to deform step by step: shrink both, slide them past each other, then regrow.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Deform f + g into g + f', [G('They swapped places — and it was a homotopy the whole way.'), E('Everything outside the two boxes stays at $x₀$, so it never leaves $πₙ$. For $n ≥ 2$, $πₙ$ is abelian.')]),
      {
        type: 'ask',
        question: 'What made the swap possible?',
        options: ['A second direction to slide in — only there when $n ≥ 2$', 'The colours', 'The beacon moving'],
        answer: 'A second direction to slide in — only there when $n ≥ 2$',
        wrong: [E('They went up and down to get past each other.')],
        right: [E('Right. One more floor — one dimension down.')],
      },
    ],
  },
  dim1: {
    blueprint: 'One Dimension Down',
    arrive: [E('The same trick on an interval — loops, $π₁$. Try to pass $f$ and $g$ with the Tide Glass.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Try to pass f and g on the interval', [G('Stuck. They’d have to go through each other.'), E('On a line there’s no room. That’s why $π₁$ can fail to be abelian — like the figure-eight.')]),
      {
        type: 'ask',
        question: 'So for which $n$ is $πₙ(X)$ always abelian?',
        options: ['$n ≥ 2$', 'all $n$', '$n = 1$ only'],
        answer: '$n ≥ 2$',
        wrong: [E('The square worked; the interval didn’t.')],
        right: [E('The gate’s open, south of the Hall.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your cubes stay put. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'πₙ(X, x₀) consists of homotopy classes of maps (Iⁿ, ∂Iⁿ) → (X, x₀), i.e. maps of Sⁿ. Two classes add by placing their cubes side by side. For n ≥ 2 they can be shrunk and slid past each other, so πₙ is abelian; for n = 1 there is no room, and π₁ need not be.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 339–346.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The Hall is done. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'pinned') return [E('Tide Glass (3): click each grey edge of the square.')]
  if (current === 'stack') return [E('Click the $f$ crate, then the left half; then the $g$ crate, then the right half.')]
  return [E('Click the square with the Tide Glass — each click is one step of the deformation.')]
}
