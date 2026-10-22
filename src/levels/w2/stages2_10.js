/**
 * World 2 · Level 2-10 "Forget the Order" — Abelian Ford.
 * Hatcher §2.A pp. 166–168 — regarding loops as singular 1-cycles gives a homomorphism
 * h: π₁(X, x₀) → H₁(X); for path-connected X it is onto with kernel the commutator subgroup, so
 * H₁(X) ≅ π₁(X) abelianized (Theorem 2A.1).
 *
 * Each ford holds a word in a, b — a loop in the figure-eight. Blade (7): cancel a letter with an
 * inverse neighbour (fine in π₁). Van Kampen Clasp (5): swap two neighbours (fine only in H₁).
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })
const C = (text) => ({ speaker: 'The Commutator', portrait: 'commutator', text })

export const STATION_ORDER = ['totals', 'dissolve', 'survive', 'hold']

export const OPENING = [
  N('Forget the order, courier, and you forget my marshal’s patrols. He won’t forget you.'),
  E('The Abelian Ford. Every loop is a loop — but now we ask what it looks like to homology.'),
  E('A loop in the figure-eight is a word: $a$, $b$, and their inverses. In $π₁$, order matters; you can only cancel a letter against its inverse right next to it.'),
  G('And in homology?'),
  E('In $H₁$ the order is forgotten: neighbours may swap. Blade (7) cancels, Clasp (5) swaps. First ford is west.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  totals: {
    blueprint: 'Totals',
    arrive: [
      E('The loop $a b a⁻¹ a b$. Bring it to the form $aᵐbⁿ$: every $a$ first, then every $b$, nothing left to cancel.'),
      E('Clasp between two tiles to swap them; Blade a tile to cancel it with an inverse beside it.'),
    ],
    early: [E('Not yet — finish the earlier ford first. Follow NEXT on the map.')],
    goals: [
      act('Bring the word to the form aᵐbⁿ', [G('$a b²$. Only the totals were left.'), E('In $H₁$ a loop is just its totals: how many times round $a$, how many round $b$.')]),
      {
        type: 'ask',
        question: 'In $H₁$ of the figure-eight, what decides a loop’s class?',
        options: ['The total number of times round $a$ and round $b$', 'The order of the letters', 'The length of the word'],
        answer: 'The total number of times round $a$ and round $b$',
        wrong: [E('You were allowed to reorder freely. What couldn’t you change?')],
        right: [E('So $H₁ ≅ ℤ²$, the totals. Next ford is east.')],
      },
    ],
  },
  dissolve: {
    blueprint: 'Dissolve',
    arrive: [
      E('A Commutator patrol’s path: $a b a⁻¹ b⁻¹$. In $π₁$ of the figure-eight, nothing cancels — it’s a real, nontrivial loop.'),
      E('Now forget the order.'),
    ],
    early: [E('Not yet — finish the earlier ford first. Follow NEXT on the map.')],
    goals: [
      act('Reduce the patrol’s word as far as it goes', [G('Gone! All of it.'), E('A commutator $aba⁻¹b⁻¹$ totals zero — it dies in $H₁$.')]),
      {
        type: 'ask',
        question: 'Theorem 2A.1: the map $π₁ → H₁$ is onto, and its kernel is…',
        options: ['the commutator subgroup', 'trivial', 'all of $π₁$'],
        answer: 'the commutator subgroup',
        wrong: [E('Which loops just vanished? Products of what?')],
        right: [E('So $H₁ = π₁ / [π₁, π₁]$ — $π₁$ abelianized. Next ford is north of the first.')],
      },
    ],
  },
  survive: {
    blueprint: 'Not Everything Dies',
    arrive: [
      E('$b a a b⁻¹$ — the second $a$ is “conjugated” by $b$. Reduce it.'),
    ],
    early: [E('Not yet — finish the earlier ford first. Follow NEXT on the map.')],
    goals: [
      act('Bring the word to the form aᵐbⁿ', [G('$a²$ survives.'), E('Abelianizing forgets order, not totals. Twice round $a$ stays twice round $a$.')]),
      {
        type: 'ask',
        question: 'Could $a²$ ever dissolve in $H₁$ of the figure-eight?',
        options: ['No — its $a$-total is $2$, not $0$', 'Yes, by swapping', 'Only in $π₁$'],
        answer: 'No — its $a$-total is $2$, not $0$',
        wrong: [E('Swapping and canceling never change the totals.')],
        right: [E('Right. Last ford is east — and the Commutator is watching.')],
      },
    ],
  },
  hold: {
    blueprint: 'Hold the Ford',
    arrive: [
      C('So your counting forgets order. Then try this: $a b a b⁻¹ a⁻¹ a⁻¹$.'),
      E('Reduce it. If it dissolves, it was a product of commutators all along.'),
    ],
    early: [E('Not yet — finish the earlier ford first. Follow NEXT on the map.')],
    goals: [
      act('Reduce the Commutator’s word', [G('Nothing left. It was all commutators!'), C('…Hm. Then your homology can’t see my loops at all.'), E('It sees their totals — and his totals are zero.')]),
      {
        type: 'ask',
        question: 'What does $H₁$ forget about a loop?',
        options: ['The order of its letters', 'How many times it goes round', 'Which space it lives in'],
        answer: 'The order of its letters',
        wrong: [E('You swapped letters freely all level. What did that throw away?')],
        right: [E('$H₁ ≅ π₁$ abelianized: the order, and nothing else. The gate’s open — south of the last ford.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your words stay as they were. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next ford is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Every loop is a 1-cycle, giving a map π₁(X) → H₁(X). For path-connected X it is onto and its kernel is the commutator subgroup, so H₁(X) ≅ π₁(X) abelianized: homology keeps how many times a loop goes round each way and forgets the order.',
  cite: 'Hatcher, Algebraic Topology §2.A, pp. 166–168 (Theorem 2A.1).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every ford is held. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  return [E('Clasp (5) in the gap between two tiles swaps them. Blade (7) on a tile cancels it, if its inverse is right beside it. Move letters next to their inverses, then cancel.')]
}
