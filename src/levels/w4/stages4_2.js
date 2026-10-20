/**
 * World 4 · Level 4-2 "Snap to Grid" — Grid Gallery.
 * Hatcher §4.1, pp. 348–351 — the cellular approximation theorem (Theorem 4.8): every map between
 * CW complexes is homotopic to a cellular map (one taking the k-skeleton into the k-skeleton),
 * by a homotopy that is stationary where the map is already cellular. Consequence: πₖ(Sⁿ) = 0 for
 * k < n, since a cellular map from Sᵏ into Sⁿ = e⁰ ∪ eⁿ lands in the 0-cell.
 *
 * Cell-Smith (2): snap a piece of a path; puncture and push; mark a group.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['snap', 'slip', 'small', 'approx']

export const OPENING = [
  E('The Grid Gallery. The floor is a CW complex: dots are 0-cells, grid lines 1-cells, squares 2-cells.'),
  E('A map can wander anywhere. Cellular approximation says you can always slide it — without moving what’s already tidy — so that it uses only the right skeleton.'),
  G('Snap it to the grid.'),
  E('Snap it to the grid. Cell-Smith on 2.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  snap: {
    blueprint: 'Snap',
    arrive: [E('A path — a map of an interval — wiggling across the squares, with its ends at 0-cells. Snap each piece onto the grid lines.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Snap every piece of the path into the 1-skeleton', [G('All on the grid lines now.'), E('A 1-dimensional map, homotoped into the 1-skeleton, rel its ends. That’s a cellular map.')]),
      {
        type: 'ask',
        question: 'Cellular approximation says every map of CW complexes is homotopic to one that…',
        options: ['sends each $k$-skeleton into the $k$-skeleton', 'is constant', 'avoids every cell'],
        answer: 'sends each $k$-skeleton into the $k$-skeleton',
        wrong: [E('Where did the 1-dimensional path end up?')],
        right: [E('Theorem 4.8. Next floor up.')],
      },
    ],
  },
  slip: {
    blueprint: 'Slip Off',
    arrive: [
      E('$S²$ as one 0-cell and one 2-cell: the disk, with its whole gold rim being a single point.'),
      E('A loop runs around inside the 2-cell. Puncture a point it misses, then push the loop out to the rim.'),
    ],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Puncture the 2-cell where the loop isn’t, then push the loop to e⁰', [G('Pushed onto the rim — which is one point.'), E('Every loop in $S²$ slips off like that, so $π₁(S²) = 0$.')]),
      {
        type: 'ask',
        question: 'Why could the loop be pushed off?',
        options: ['A 1-dimensional map can be made to miss a point of the 2-cell', 'The loop was short', 'S² has no 0-cell'],
        answer: 'A 1-dimensional map can be made to miss a point of the 2-cell',
        wrong: [E('What did you punch through first?')],
        right: [E('Right — that’s the heart of the theorem. Next floor.')],
      },
    ],
  },
  small: {
    blueprint: 'Too Small to Wrap',
    arrive: [E('A board of $πₖ(Sⁿ)$. Mark every one that cellular approximation forces to be $0$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Mark every πₖ(Sⁿ) that must be 0', [G('All the ones with $k < n$.'), E('A $k$-sphere is too small to wrap round an $n$-sphere when $k < n$.')]),
      {
        type: 'ask',
        question: 'What does cellular approximation say about $π₃(S²)$?',
        options: ['Nothing — $k > n$ isn’t covered (in fact $π₃(S²) = ℤ$)', 'It is $0$', 'It equals $π₂(S²)$'],
        answer: 'Nothing — $k > n$ isn’t covered (in fact $π₃(S²) = ℤ$)',
        wrong: [E('Cellular approximation only pushes maps down into lower skeleta.')],
        right: [E('The Hopf map will show you that one. Next floor.')],
      },
    ],
  },
  approx: {
    blueprint: 'Approximate',
    arrive: [
      E('This path’s ends are off the grid. The theorem works one skeleton at a time: 0-cells first, then 1-cells.'),
      E('Snap the two endpoints to dots, then the pieces to lines.'),
    ],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Snap the endpoints, then the pieces', [G('Dots first, lines second.'), E('That’s the induction in the proof: once the $k$-skeleton is cellular, move on to the $(k+1)$-cells, leaving the rest alone.')]),
      {
        type: 'ask',
        question: 'Why snap the endpoints first?',
        options: ['The pieces must start and end at 0-cells before they can lie in the 1-skeleton', 'Endpoints are prettier', 'It doesn’t matter'],
        answer: 'The pieces must start and end at 0-cells before they can lie in the 1-skeleton',
        wrong: [E('Could a piece lie along grid lines if its end is in the middle of a square?')],
        right: [E('Right. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your snaps stay snapped. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Cellular approximation: every map between CW complexes is homotopic, skeleton by skeleton and rel the part already cellular, to a cellular map. So a k-sphere mapped into Sⁿ = e⁰ ∪ eⁿ can be slid into the 0-cell when k < n: πₖ(Sⁿ) = 0 for k < n.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 348–351 (Theorem 4.8).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The Gallery is tidy. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'slip') return [E('Cell-Smith (2): click a spot inside the loop to puncture it, then click the gold rim to push.')]
  if (current === 'small') return [E('Click the tiles where the sphere’s dimension $k$ is smaller than $n$.')]
  if (current === 'approx') return [E('The pink dots first, then each wiggly piece.')]
  return [E('Cell-Smith (2): click each wiggly pink piece.')]
}
