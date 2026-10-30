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
  N('My marshal is waiting at the ford, Gyroid. He keeps very good order. Try not to make him angry; I’d rather you came to me in one piece.'),
  E('The Abelian Ford. Before the Delta, a loop was a word in $π₁$. Now we ask what that same loop looks like to homology.'),
  E('A loop in the figure-eight is a word in $a$, $b$ and their inverses. In $π₁$ order matters: the only move is cancelling a letter against its inverse right beside it.'),
  G('And in homology?'),
  E('A loop ends where it starts, so its boundary is $0$: it’s a 1-cycle. And a chain is a sum, and sums don’t care about order. So in $H₁$, neighbours may swap.'),
  E('Why can you swap? Going round $a$ then $b$ differs from the chain $a + b$ by the edge of one triangle. And $a + b = b + a$.'),
  E('Blade (7) cancels, Clasp (5) swaps. First ford is north; follow the NEXT ring. Commons sit north-west and north-east of it; the north-east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  totals: {
    blueprint: 'Totals',
    arrive: [
      E('The loop $a b a⁻¹ a b$. Bring it to the form $aᵐbⁿ$: every $a$ first, then every $b$, nothing left to cancel.'),
      E('Clasp in the gap between two tiles to swap them. Blade a tile to cancel it against an inverse right beside it.'),
    ],
    early: [E('Not this ford yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Bring the word to the form aᵐbⁿ', [G('$a b²$. Only the totals are left.'), E('Once you can swap, all that’s left of a loop is its totals: how many times round $a$, how many round $b$, backward turns counted as minus.')]),
      {
        type: 'ask',
        question: 'In $H₁$ of the figure-eight, what decides a loop’s class?',
        options: ['The total number of times round $a$ and round $b$', 'The order of the letters', 'The length of the word'],
        answer: 'The total number of times round $a$ and round $b$',
        wrong: [E('You could reorder as much as you liked. What couldn’t you change?')],
        right: [E('So $H₁$ of the figure-eight is $ℤ²$: one number for $a$, one for $b$. Next ford is north-east, on the NEXT ring.')],
      },
    ],
  },
  dissolve: {
    blueprint: 'Dissolve',
    arrive: [
      E('A Commutator patrol’s route: $a b a⁻¹ b⁻¹$. Round $a$, round $b$, back round $a$, back round $b$. In $π₁$ nothing in it cancels. It’s a real loop that can’t be shrunk.'),
      E('Now let the order go and see what’s left.'),
    ],
    early: [E('Not this ford yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Reduce the patrol’s word as far as it goes', [G('Gone! All of it.'), E('Its totals are $1 − 1 = 0$ for $a$ and $0$ for $b$. A word like $xyx⁻¹y⁻¹$ is called a commutator, and every commutator totals zero, so it dies in $H₁$.')]),
      {
        type: 'ask',
        question: 'Theorem 2A.1: the map $π₁ → H₁$ is onto, and its kernel is…',
        options: ['the commutator subgroup', 'trivial', 'all of $π₁$'],
        answer: 'the commutator subgroup',
        wrong: [E('Which loops just vanished? Products of what?')],
        right: [E('The loops that die are exactly the products of commutators. Dividing them out is called abelianizing: $H₁ = π₁ / [π₁, π₁]$. Next ford is north-west, on the NEXT ring.')],
      },
    ],
  },
  survive: {
    blueprint: 'Not Everything Dies',
    arrive: [
      E('$b a a b⁻¹$: go round $b$, round $a$ twice, then back round $b$. Reduce it.'),
    ],
    early: [E('Not this ford yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Bring the word to the form aᵐbⁿ', [G('$a²$ survives.'), E('Swapping forgets order. It doesn’t forget totals. Twice round $a$ stays twice round $a$.')]),
      {
        type: 'ask',
        question: 'Could $a²$ ever dissolve in $H₁$ of the figure-eight?',
        options: ['No — its $a$-total is $2$, not $0$', 'Yes, by swapping', 'Only in $π₁$'],
        answer: 'No — its $a$-total is $2$, not $0$',
        wrong: [E('Swapping and cancelling never change the totals.')],
        right: [E('Right. Last ford is north-west, on the NEXT ring. He’s there. I can see his banners from here.')],
      },
    ],
  },
  hold: {
    blueprint: 'Hold the Ford',
    arrive: [
      C('So. The post-runner who counts. I’ve marched this word round the Delta for years: $a b a b⁻¹ a⁻¹ a⁻¹$. Make it mean nothing, if you can.'),
      E('Reduce it, Gyroid. If it vanishes, it was a product of commutators all along.'),
    ],
    early: [E('Not this ford yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      act('Reduce the Commutator’s word', [G('Nothing left. It was all commutators!'), C('…Then your homology can’t see my loops at all.'), E('It sees their totals. Yours are zero.')]),
      {
        type: 'ask',
        question: 'What does $H₁$ forget about a loop?',
        options: ['The order of its letters', 'How many times it goes round', 'Which space it lives in'],
        answer: 'The order of its letters',
        wrong: [E('You swapped letters all level. What did that throw away?')],
        right: [E('The order, and nothing else. $H₁ ≅ π₁$ abelianized.'), C('Forgets order. I’ll remember that. So will he.'), E('The gate’s north of this ford. And past it, his engine.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your words are just as you left them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next ford is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Every loop is a 1-cycle, giving a map π₁(X) → H₁(X). For path-connected X it is onto and its kernel is the commutator subgroup, so H₁(X) ≅ π₁(X) abelianized: homology keeps how many times a loop goes round each way and forgets the order.',
  cite: 'Hatcher, Algebraic Topology §2.A, pp. 166–168 (Theorem 2A.1).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every ford is held. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  return [E('Clasp (5) in the gap between two tiles swaps them. Blade (7) on a tile cancels it, if its inverse is right beside it. Walk letters over to their inverses, then cancel.')]
}
