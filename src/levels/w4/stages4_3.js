/**
 * World 4 · Level 4-3 "Weak Spot" — Weak Spot.
 * Hatcher §4.1, pp. 346–348 — a weak homotopy equivalence is a map inducing isomorphisms on all
 * homotopy groups; Whitehead's theorem (Theorem 4.5): a weak homotopy equivalence between
 * connected CW complexes is a homotopy equivalence. The map matters: ℝP² and S² × ℝP∞ have
 * isomorphic homotopy groups but are not homotopy equivalent (their H₂ differ) — no map induces
 * those isomorphisms.
 *
 * Reading Wand (0): send a courier along f from one meter to its partner; sort a pair.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['match', 'weak', 'nomap', 'sort']

export const OPENING = [
  N('Same groups, Emmy. Same shape. You always needed a map for everything.'),
  E('Weak Spot. Two rooms face each other, each with meters for $π₁$, $π₂$, $π₃$.'),
  E('A map $f$ between them sends couriers meter to meter. If every courier arrives intact — $f_*$ an isomorphism on every $πₙ$ — then $f$ is a weak equivalence.'),
  G('And that’s as good as the real thing?'),
  E('For CW complexes, yes: that’s Whitehead’s theorem. Reading Wand on 0.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  match: {
    blueprint: 'A Map That Matches',
    arrive: [E('The circle, included in the punctured plane. Send a courier from each meter on the left with the Wand.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Send a courier from every meter', [G('All green.'), E('A weak equivalence between CW complexes — so a homotopy equivalence. Indeed, the punctured plane deformation retracts onto the circle.')]),
      {
        type: 'ask',
        question: 'Whitehead’s theorem: a map of connected CW complexes inducing isomorphisms on every $πₙ$ is…',
        options: ['a homotopy equivalence', 'a homeomorphism', 'constant'],
        answer: 'a homotopy equivalence',
        wrong: [E('Not a homeomorphism — the plane and the circle aren’t homeomorphic.')],
        right: [E('Theorem 4.5. Next floor.')],
      },
    ],
  },
  weak: {
    blueprint: 'Weakly Equal?',
    arrive: [E('$S²$, collapsed to a point. Send the couriers and find the weak spot.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Send a courier from every meter', [G('$π₁$ is fine — but $π₂$ fails.'), E('$ℤ → 0$ isn’t an isomorphism. Not a weak equivalence, so Whitehead says nothing — and indeed $S²$ isn’t contractible.')]),
      {
        type: 'ask',
        question: 'Which homotopy group shows $S² → $ point is not a weak equivalence?',
        options: ['$π₂$', '$π₁$', 'none'],
        answer: '$π₂$',
        wrong: [E('Which courier went red first?')],
        right: [E('Right. Next floor.')],
      },
    ],
  },
  nomap: {
    blueprint: 'No Map',
    arrive: [
      E('$ℝP²$ and $S² × ℝP∞$: read their meters. $π₁ = ℤ₂$ on both, $π₂ = ℤ$, $π₃ = ℤ$…'),
      E('Try to send couriers.'),
    ],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Try to send a courier from every meter', [G('No route — there’s no map carrying them.'), E('Matching numbers aren’t enough. These two have different $H₂$, so they aren’t homotopy equivalent.')]),
      {
        type: 'ask',
        question: 'What does Whitehead’s theorem need that these two lack?',
        options: ['A map inducing the isomorphisms', 'More cells', 'Simply connected spaces'],
        answer: 'A map inducing the isomorphisms',
        wrong: [E('The groups matched. What was missing between the rooms?')],
        right: [E('Remember that when Null starts comparing numbers. Last floor.')],
      },
    ],
  },
  sort: {
    blueprint: 'Spot the Weakness',
    arrive: [E('Four pairs. Mark each: does Whitehead certify a homotopy equivalence, or not?')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Sort all four pairs', [G('Two certified, two not.'), E('A map with every courier green — that’s the only certificate.')]),
      {
        type: 'ask',
        question: 'Isomorphic homotopy groups alone (with no map) imply…',
        options: ['nothing about homotopy equivalence', 'homotopy equivalence', 'homeomorphism'],
        answer: 'nothing about homotopy equivalence',
        wrong: [E('Think of ℝP² and S² × ℝP∞.')],
        right: [E('The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your couriers stay sent. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A map inducing isomorphisms on every homotopy group is a weak homotopy equivalence; between connected CW complexes it is a homotopy equivalence (Whitehead). The map is essential: ℝP² and S² × ℝP∞ have the same homotopy groups but are not homotopy equivalent.',
  cite: 'Hatcher, Algebraic Topology §4.1, pp. 346–348 (Theorem 4.5).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The weak spots are found. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'sort') return [E('Reading Wand (0): click a pair to cycle its mark. Certified means: there’s a map, and every courier arrives.')]
  return [E('Reading Wand (0): click each meter on the left.')]
}
