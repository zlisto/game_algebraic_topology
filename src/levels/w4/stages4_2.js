/**
 * World 4 · Level 4-2 "Snap to Grid" — Grid Gallery.
 * Hatcher §4.1, pp. 348–351 — the cellular approximation theorem (Theorem 4.8): every map between
 * CW complexes is homotopic to a cellular map (one taking the k-skeleton into the k-skeleton),
 * by a homotopy that is stationary where the map is already cellular. Consequence: πₖ(Sⁿ) = 0 for
 * k < n, since a cellular map from Sᵏ into Sⁿ = e⁰ ∪ eⁿ lands in the 0-cell.
 *
 * Cell Hammer (2): snap a piece of a path; puncture and push; mark a group.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['snap', 'slip', 'small', 'approx']

export const OPENING = [
  E('The Grid Gallery. The floor is a CW complex: the dots are 0-cells, the grid lines 1-cells, the squares 2-cells.'),
  E('The $k$-skeleton is everything up to dimension $k$. Dots alone are the 0-skeleton; dots and lines together are the 1-skeleton.'),
  G('And the maps don’t care about any of that. They cut straight across.'),
  E('They can. But you can always slide one, without moving the parts that are already tidy, until each $k$-dimensional piece lies in the $k$-skeleton. That’s cellular approximation.'),
  E('Cell Hammer’s on 2. First station’s east; follow the NEXT ring on your map. Two commons off it, north-west and west. The west one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  snap: {
    blueprint: 'Snap',
    arrive: [E('A path, which is just a map of an interval, wiggling across the squares. Its ends already sit on dots. Snap each piece onto the grid lines.')],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Snap every piece of the path into the 1-skeleton', [G('All on the lines now.'), E('A 1-dimensional map, slid into the 1-skeleton with its ends held still. That’s a cellular map: $k$-skeleton into $k$-skeleton.')]),
      {
        type: 'ask',
        question: 'Cellular approximation says every map of CW complexes is homotopic to one that…',
        options: ['sends each $k$-skeleton into the $k$-skeleton', 'is constant', 'avoids every cell'],
        answer: 'sends each $k$-skeleton into the $k$-skeleton',
        wrong: [E('Where did the 1-dimensional path end up?')],
        right: [E('That’s Theorem 4.8. Next one’s north, on the NEXT ring.')],
      },
    ],
  },
  slip: {
    blueprint: 'Slip Off',
    arrive: [
      E('Here’s $S²$ built from two cells: one 0-cell, and one 2-cell, a disk whose whole gold rim is glued to that single point.'),
      E('A loop can fill a disk, oddly, but nudge it into straight pieces first and it can’t. So there’s a point it misses. Puncture there, then push the loop out to the rim.'),
    ],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Puncture the 2-cell where the loop isn’t, then push the loop to e⁰', [G('Pushed onto the rim. Which is one point.'), E('So the loop shrank to the base point. Any loop in $S²$ can do that, so $π₁(S²) = 0$.')]),
      {
        type: 'ask',
        question: 'Why could the loop be pushed off?',
        options: ['A 1-dimensional map can be made to miss a point of the 2-cell', 'The loop was short', 'S² has no 0-cell'],
        answer: 'A 1-dimensional map can be made to miss a point of the 2-cell',
        wrong: [E('What did you punch through first?')],
        right: [E('Right. Once there’s a hole in the cell, everything can be pushed away from it to the edge. That’s how the proof works. Next one’s north-west, on the NEXT ring.')],
      },
    ],
  },
  small: {
    blueprint: 'Too Small to Wrap',
    arrive: [
      E('$Sⁿ$ is one 0-cell plus one $n$-cell. Map a $k$-sphere in with $k < n$ and it can be made cellular: it lands in the $k$-skeleton, which is just the point.'),
      E('This board lists $πₖ(Sⁿ)$. Mark every one that argument forces to be $0$.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Mark every πₖ(Sⁿ) that must be 0', [G('Every one with $k < n$.'), E('A smaller sphere can’t wrap round a bigger one. It always slides off.')]),
      {
        type: 'ask',
        question: 'What does cellular approximation say about $π₃(S²)$?',
        options: ['Nothing — $k > n$ isn’t covered (in fact $π₃(S²) = ℤ$)', 'It is $0$', 'It equals $π₂(S²)$'],
        answer: 'Nothing — $k > n$ isn’t covered (in fact $π₃(S²) = ℤ$)',
        wrong: [E('Cellular approximation only pushes a $k$-dimensional map into the $k$-skeleton. For $S³ → S²$ that’s all of $S²$, so it tells you nothing.')],
        right: [E('Right. A bigger sphere can wrap a smaller one, and the Hopf map will show you how. Last one’s west, on the NEXT ring.')],
      },
    ],
  },
  approx: {
    blueprint: 'Approximate',
    arrive: [
      E('This path’s ends are off the grid. The theorem goes one skeleton at a time: the 0-cells first, then the 1-cells.'),
      E('Snap the two endpoints onto dots, then snap the pieces onto lines.'),
    ],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Snap the endpoints, then the pieces', [G('Dots first, lines second.'), E('That’s the induction in Hatcher’s proof. Once everything up to dimension $k$ is cellular, move to the $(k+1)$-cells and leave the rest alone.')]),
      {
        type: 'ask',
        question: 'Why snap the endpoints first?',
        options: ['The pieces must start and end at 0-cells before they can lie in the 1-skeleton', 'Endpoints are prettier', 'It doesn’t matter'],
        answer: 'The pieces must start and end at 0-cells before they can lie in the 1-skeleton',
        wrong: [E('Could a piece lie along the grid lines if its end is in the middle of a square?')],
        right: [E('Exactly. Every floor of his Spire is made of cells, Gyroid. That’s useful. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back, and your snaps held. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Cellular approximation: every map between CW complexes is homotopic, skeleton by skeleton and rel the part already cellular, to a cellular map. So a k-sphere mapped into Sⁿ = e⁰ ∪ eⁿ can be slid into the 0-cell when k < n: πₖ(Sⁿ) = 0 for k < n.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 348–351 (Theorem 4.8).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first. That’s 1.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The Gallery’s tidy. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it comes up.')]
  if (current === 'slip') return [E('Cell Hammer (2): click a spot inside the loop to puncture it, then click the gold rim to push.')]
  if (current === 'small') return [E('Click the tiles where the sphere’s dimension $k$ is smaller than $n$.')]
  if (current === 'approx') return [E('The pink dots first, then each wiggly piece.')]
  return [E('Cell Hammer (2): click each wiggly pink piece.')]
}
