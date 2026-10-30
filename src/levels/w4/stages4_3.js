/**
 * World 4 · Level 4-3 "Weak Spot" — Weak Spot.
 * Hatcher §4.1, pp. 346–348 — a weak homotopy equivalence is a map inducing isomorphisms on all
 * homotopy groups; Whitehead's theorem (Theorem 4.5): a weak homotopy equivalence between
 * connected CW complexes is a homotopy equivalence. The map matters: ℝP² and S² × ℝP∞ have
 * isomorphic homotopy groups but are not homotopy equivalent (their H₂ differ) — no map induces
 * those isomorphisms.
 *
 * Reading Wand (0): send a runner along f from one meter to its partner; sort a pair.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['match', 'weak', 'nomap', 'sort']

export const OPENING = [
  N('Two places with the same groups are the same place, Emmy. You always wanted a map for everything. You used to draw them on napkins.'),
  E('…The Weak Spot. Two rooms face each other, and each has meters for $π₁$, $π₂$, $π₃$.'),
  E('A map $f$ from one room to the other moves every sphere-map along with it. So it gives a map $f_*$ on each $πₙ$. The runners carry each meter’s group across along $f$.'),
  E('If every runner arrives intact, every $f_*$ is an isomorphism, and $f$ is called a weak homotopy equivalence.'),
  G('Weak. So it’s not as good as the real thing?'),
  E('For CW complexes it is. That’s Whitehead’s theorem. Reading Wand’s on 0. First room’s north-west; follow the NEXT ring. Two commons off it, north-east and east. The east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  match: {
    blueprint: 'A Map That Matches',
    arrive: [E('The circle, sitting inside the plane with its middle point punched out. The map is just the inclusion. Send a runner from each meter on the left with the Wand.')],
    early: [E('Not this room yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Send a runner from every meter', [G('All green.'), E('A weak equivalence between CW complexes, so Whitehead makes it a homotopy equivalence. You can see it here: the punctured plane shrinks back onto the circle.')]),
      {
        type: 'ask',
        question: 'Whitehead’s theorem: a map of connected CW complexes inducing isomorphisms on every $πₙ$ is…',
        options: ['a homotopy equivalence', 'a homeomorphism', 'constant'],
        answer: 'a homotopy equivalence',
        wrong: [E('Not a homeomorphism. The plane and the circle aren’t even the same dimension.')],
        right: [E('Theorem 4.5. Next room’s north-west, on the NEXT ring.')],
      },
    ],
  },
  weak: {
    blueprint: 'Weakly Equal?',
    arrive: [E('$S²$, crushed to a single point. Send the runners and find where it breaks.')],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Send a runner from every meter', [G('$π₁$ gets through. $π₂$ doesn’t.'), E('$π₂(S²) = ℤ$, and a point’s $π₂$ is $0$. $ℤ → 0$ isn’t an isomorphism, so Whitehead has nothing to say. And $S²$ isn’t contractible.')]),
      {
        type: 'ask',
        question: 'Which homotopy group shows $S² → $ point is not a weak equivalence?',
        options: ['$π₂$', '$π₁$', 'none'],
        answer: '$π₂$',
        wrong: [E('Which runner went red first?')],
        right: [E('Right. Next room’s north, on the NEXT ring.')],
      },
    ],
  },
  nomap: {
    blueprint: 'No Map',
    arrive: [
      E('$ℝP²$ and $S² × ℝP∞$. Read their meters: $π₁ = ℤ₂$ on both, $π₂ = ℤ$, $π₃ = ℤ$. Above $π₁$ both are really just $S²$; their universal covers are $S²$ and $S² × S∞$, which shrinks to $S²$.'),
      E('So every number matches. Now try to send the runners across.'),
    ],
    early: [E('Not this room yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Try to send a runner from every meter', [G('They’ve got nowhere to run. No map between these rooms carries the groups across.'), E('Matching numbers aren’t enough. Homology tells them apart: $H₂(ℝP²) = 0$, but $H₂(S² × ℝP∞) = ℤ$. Not homotopy equivalent, so no map can match them up.'), E('Why $ℤ$? $S²$ sits inside as $S² ×$ a point, and projecting back to $S²$ undoes that. So $H₂(S²) = ℤ$ survives inside.')]),
      {
        type: 'ask',
        question: 'What does Whitehead’s theorem need that these two lack?',
        options: ['A map inducing the isomorphisms', 'More cells', 'Simply connected spaces'],
        answer: 'A map inducing the isomorphisms',
        wrong: [E('The groups matched. What was missing between the rooms?')],
        right: [E('A map. Remember that when Null starts comparing numbers. Last room’s north-east, on the NEXT ring.')],
      },
    ],
  },
  sort: {
    blueprint: 'Spot the Weakness',
    arrive: [E('Four pairs. For each one: does Whitehead certify a homotopy equivalence, or not?')],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Sort all four pairs', [G('Two certified, two not.'), E('There has to be a map, and every runner on it has to arrive green. Nothing else counts.')]),
      {
        type: 'ask',
        question: 'Isomorphic homotopy groups alone (with no map) imply…',
        options: ['nothing about homotopy equivalence', 'homotopy equivalence', 'homeomorphism'],
        answer: 'nothing about homotopy equivalence',
        wrong: [E('Think of $ℝP²$ and $S² × ℝP∞$.')],
        right: [N('A map. Always a map with you, Emmy.'), E('Always. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back, and your runners stay sent. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A map inducing isomorphisms on every homotopy group is a weak homotopy equivalence; between connected CW complexes it is a homotopy equivalence (Whitehead). The map is essential: ℝP² and S² × ℝP∞ have the same homotopy groups but are not homotopy equivalent.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 346–348 (Theorem 4.5).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first. That’s 1.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('We found every weak spot. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it comes up.')]
  if (current === 'sort') return [E('Reading Wand (0): click a pair to change its mark. Certified means there’s a map, and every runner gets across.')]
  return [E('Reading Wand (0): click each meter on the left.')]
}
