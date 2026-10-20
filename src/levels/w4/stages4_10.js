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

export const STATION_ORDER = ['lift', 'fibre', 'loops']

export const OPENING = [
  E('Fibration Station. A fibration $p: E → B$ is a map with one promise: any homotopy downstairs lifts upstairs, once you say where it starts.'),
  E('That one promise — the homotopy lifting property — is what gives the long exact sequence.'),
  G('Lifts, then. Which way is up?'),
  E('Sheet Compass on 6.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  lift: {
    blueprint: 'Lift',
    arrive: [E('The helix $ℝ$ over the circle $S¹$ is a fibration — a covering, with discrete fibre. A loop downstairs lifts to a path upstairs, and the start you choose decides the end. Pick the start sheet whose lift ends on ★.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Choose start sheets so each lift ends on ★', [G('Start fixed, lift fixed.'), E('Homotopy lifting: the lift exists, and with a start point chosen it is unique — for a covering, at least.')]),
      {
        type: 'ask',
        question: 'A loop winding $2$ times lifts from sheet $1$. Where does it end?',
        options: ['Sheet $3$', 'Sheet $1$', 'Sheet $2$'],
        answer: 'Sheet $3$',
        wrong: [E('Each turn round the base climbs one sheet.')],
        right: [E('Right. Now a map that isn’t a fibration.')],
      },
    ],
  },
  fibre: {
    blueprint: 'Make It Fibre',
    arrive: [E('$f$ sends two points $p, q$ to the ends of a bar $B$. Over the middle the fibre is empty — no path from an end can lift. Tether each point: $E_f$ is pairs $(a, γ)$, with $γ$ a path in $B$ starting at $f(a)$.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Tether p and q to make E_f', [G('Now every point of the bar has a fibre.'), E('$E_f → B$, $(a, γ) ↦ γ(1)$, is a fibration. Shrink every tether back to its start and $E_f$ retracts onto $A$.')]),
      {
        type: 'ask',
        question: 'Why is $E_f$ as good as $A$?',
        options: ['$E_f$ deformation retracts onto $A$', '$E_f$ is a point', '$E_f = B$'],
        answer: '$E_f$ deformation retracts onto $A$',
        wrong: [E('Shrink each tether back to where it starts. What’s left?')],
        right: [E('So any map is a fibration, up to homotopy. Last floor.')],
      },
    ],
  },
  loops: {
    blueprint: 'The Loop Space',
    arrive: [E('Take $E_f$ for the inclusion of a point: paths in $B$ from the base point. That’s $PB$, it’s contractible, and its fibre is the loop space $ΩB$. The long exact sequence then says $πₙ(ΩB) ≅ πₙ₊₁(B)$. Fill in $ΩS²$.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Set π₁, π₂, π₃ of ΩS²', [G('Everything shifts down one.'), E('$πₙ(ΩS²) = πₙ₊₁(S²)$: $ℤ$, $ℤ$, $ℤ₂$.')]),
      {
        type: 'ask',
        question: 'Why does $ΩB → PB → B$ shift the groups by one?',
        options: ['$PB$ is contractible, so the boundary maps are isomorphisms', '$ΩB$ is contractible', '$B$ is a point'],
        answer: '$PB$ is contractible, so the boundary maps are isomorphisms',
        wrong: [E('Which space in the sequence has nothing in it?')],
        right: [E('Fibrations, done. The gate is open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your lifts stay put. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('All lifted. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'lift') return [E('Each turn of the base loop climbs one sheet; a negative winding climbs down. Count back from ★.')]
  if (current === 'fibre') return [E('Sheet Compass (6) on each pad, $p$ and $q$.')]
  return [E('Each $ΩS²$ tile matches the $S²$ tile above it, one dimension up. Compass cycles the value.')]
}
