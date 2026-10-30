/**
 * World 4 · Level 4-10 "Fibration Station".
 * Hatcher pp. 375–376 (fibrations: the homotopy lifting property) and §4.3 pp. 405–410 — any map
 * f: A → B becomes a fibration E_f → B with E_f ≃ A (Proposition 4.64), and the path fibration
 * ΩB → PB → B, with PB contractible, gives πₙ(ΩB) ≅ πₙ₊₁(B).
 *
 * Sheet Compass (6): choose a start, string a tether, set a group.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['lift', 'fibre', 'loops']

export const OPENING = [
  N('Lift whatever you like, Gyroid. Carry it as high as you can. I’ll fold it gently when you set it down.'),
  G('He sounds tired.'),
  E('He sounds like a man who stopped sleeping a long time ago. Come on.'),
  E('Fibration Station. A fibration is a map $p: E → B$ with one promise: if you move something downstairs in $B$ and say where it starts upstairs, the motion lifts to $E$.'),
  E('One consequence: over a connected $B$, every fibre, everything sitting over one point, looks the same up to homotopy. And that promise is what gives the long exact sequence.'),
  G('Lifts, then. Which way’s up?'),
  E('Sheet Compass on 6. First station’s north-west; follow the NEXT ring. Three commons hang east and north-east of it. One of them has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  lift: {
    blueprint: 'Lift',
    arrive: [
      E('The helix $ℝ$ over the circle $S¹$. Every point of the circle has a whole stack of points above it, one per turn of the helix: the sheets. That’s a covering, the simplest kind of fibration.'),
      E('A loop below lifts to a climb above. Each turn round the base climbs one sheet, so winding $w$ times from sheet $s$ ends on sheet $s + w$. Pick the start sheet whose lift ends on ★.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Choose start sheets so each lift ends on ★', [G('Start fixed, lift fixed.'), E('That’s homotopy lifting: the lift exists, and once you choose the start it’s unique, for a covering at least.')]),
      {
        type: 'ask',
        question: 'A loop winding $2$ times lifts from sheet $1$. Where does it end?',
        options: ['Sheet $3$', 'Sheet $1$', 'Sheet $2$'],
        answer: 'Sheet $3$',
        wrong: [E('Each turn round the base climbs one sheet. Two turns from sheet $1$…')],
        right: [E('Right. Now a map that isn’t a fibration. It’s east, on the NEXT ring.')],
      },
    ],
  },
  fibre: {
    blueprint: 'Make It Fibre',
    arrive: [
      E('$f$ sends two points, $p$ and $q$, to the two ends of a bar $B$. Over the middle of the bar there’s nothing at all. Start a path at one end, walk it inward, and there’s nowhere upstairs for it to go.'),
      E('So give each point a tether. $E_f$ is pairs $(a, γ)$: a point $a$, and a path $γ$ in $B$ that starts at $f(a)$. Its map to $B$ reads off where the tether ends. Tether $p$ and $q$.'),
    ],
    early: [E('Not yet. The station before this one comes first; the NEXT ring shows it.')],
    goals: [
      act('Tether p and q to make E_f', [G('Now every point of the bar has something over it.'), E('$E_f → B$, $(a, γ) ↦ γ(1)$, is a fibration. And reel every tether back to its start, and $E_f$ shrinks back onto $A$.')]),
      {
        type: 'ask',
        question: 'Why is $E_f$ as good as $A$?',
        options: ['$E_f$ deformation retracts onto $A$', '$E_f$ is a point', '$E_f = B$'],
        answer: '$E_f$ deformation retracts onto $A$',
        wrong: [E('Reel each tether back to where it starts. What’s left?')],
        right: [E('So any map at all is a fibration, once you swap $A$ for the homotopy-equivalent $E_f$. Proposition 4.64.'), E('Last station’s north-west, on the NEXT ring.')],
      },
    ],
  },
  loops: {
    blueprint: 'The Loop Space',
    arrive: [
      E('Do the tether trick to the inclusion of just the base point. You get $PB$: every path in $B$ that starts at the base point. Reel them all in and $PB$ shrinks to a point.'),
      E('The fibre over the base point is the paths that start and end there: the loops. That’s the loop space $ΩB$. So we have a fibration $ΩB → PB → B$.'),
      E('In its long exact sequence every $PB$ term is $0$, so each step from $πₙ₊₁(B)$ to $πₙ(ΩB)$ passes straight through: an isomorphism. Fill in $ΩS²$.'),
    ],
    early: [E('Not yet. Two stations come before this one; the NEXT ring shows where.')],
    goals: [
      act('Set π₁, π₂, π₃ of ΩS²', [G('Everything slides down one.'), E('$πₙ(ΩS²) = πₙ₊₁(S²)$: $ℤ$, $ℤ$, $ℤ₂$. Read the loops, and you’ve read the sphere one floor higher.')]),
      {
        type: 'ask',
        question: 'Why does $ΩB → PB → B$ shift the groups by one?',
        options: ['$PB$ is contractible, so the boundary maps are isomorphisms', '$ΩB$ is contractible', '$B$ is a point'],
        answer: '$PB$ is contractible, so the boundary maps are isomorphisms',
        wrong: [E('Which space in the sequence has nothing in it?')],
        right: [E('Right. Between two zeros, a map has to be an isomorphism.'), E('The gate’s north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your lifts are where you left them. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A fibration p: E → B has the homotopy lifting property. Any map f: A → B becomes a fibration E_f → B with E_f ≃ A. The path fibration ΩB → PB → B has PB contractible, so πₙ(ΩB) ≅ πₙ₊₁(B).',
  cite: 'Hatcher, Algebraic Topology pp. 375–376; §4.3, pp. 405–410 (Proposition 4.64).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Everything’s lifted. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'lift') return [E('Each turn of the base loop climbs one sheet; a negative winding climbs down. Count back from ★.')]
  if (current === 'fibre') return [E('Sheet Compass (6) on each pad, $p$ and $q$.')]
  return [E('Each $ΩS²$ tile matches the $S²$ tile one dimension up: $π₁(ΩS²)$ is $π₂(S²)$, and so on. The Compass cycles the value.')]
}
