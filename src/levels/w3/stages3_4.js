/**
 * World 3 · Level 3-4 "A Cup of Counterexample" — Twin Islands.
 * Hatcher §3.2, pp. 212–214 — Example 3.8 and around: the torus T and S¹ ∨ S¹ ∨ S² have isomorphic
 * cohomology groups, but in T the cup product of the two 1-dimensional generators generates H²,
 * while in S¹ ∨ S¹ ∨ S² it is zero (the space retracts onto S¹ ∨ S¹, where H² = 0). So the cup
 * product distinguishes spaces that cohomology groups alone cannot.
 *
 * Cup Caster (9): read a meter; cast on a triangle, a ring, the sphere, or a lantern.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['same_holes', 'cast_torus', 'cast_bouquet', 'nulls_answer']

export const OPENING = [
  N('Two islands, little topologists. The torus, and a bouquet: two rings and a ball, all tied at one point. Count their holes. They’re the same place.'),
  G('Are they?'),
  E('Let’s find out. Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  same_holes: {
    blueprint: 'Same Holes',
    arrive: [
      E('Read both islands’ cohomology meters with the Caster.'),
    ],
    early: [E('Not yet — finish the earlier island first. Follow NEXT on the map.')],
    goals: [
      act('Read both meters', [G('$ℤ$, $ℤ²$, $ℤ$ — both of them.'), E('Same groups in every degree. Null has a point — so far.')]),
      {
        type: 'ask',
        question: 'Same cohomology groups. Does that make them the same space?',
        options: ['Not necessarily — groups aren’t everything', 'Yes, always', 'Only if they have the same cells'],
        answer: 'Not necessarily — groups aren’t everything',
        wrong: [E('Remember the cup product from the Lantern Rows. Groups don’t record it.')],
        right: [E('Let’s compare their products. The torus island is south-east.')],
      },
    ],
  },
  cast_torus: {
    blueprint: 'Cast on the Torus',
    arrive: [E('The torus again: cast $α ⌣ β$ on both triangles.')],
    early: [E('Not yet — finish the earlier island first. Follow NEXT on the map.')],
    goals: [
      act('Cast α ⌣ β on both triangles of the torus', [G('$+1$. The top lantern blazes.'), E('On $T$, $α ⌣ β$ generates $H²$.')]),
      {
        type: 'ask',
        question: 'What does $α ⌣ β ≠ 0$ tell you about the torus?',
        options: ['Its two loop classes multiply to its top class', 'It has three holes', 'Nothing'],
        answer: 'Its two loop classes multiply to its top class',
        wrong: [E('Which class did the product land on?')],
        right: [E('Now the bouquet — south-west.')],
      },
    ],
  },
  cast_bouquet: {
    blueprint: 'Cast on the Bouquet',
    arrive: [
      E('The bouquet $S¹ ∨ S¹ ∨ S²$. Cast $α$ on ring $a$, then $β$ on ring $b$, then cast their cup on the ball.'),
    ],
    early: [E('Not yet — finish the earlier island first. Follow NEXT on the map.')],
    goals: [
      act('Cast α on ring a, β on ring b, then the cup on the ball', [G('Dark. The beams never meet.'), E('$α$ and $β$ live on the rings, and the ball is attached at a single point. There’s no 2-simplex where $α$ reads the front and $β$ the back.')]),
      {
        type: 'ask',
        question: 'Why is $α ⌣ β = 0$ on the bouquet?',
        options: ['It retracts onto $S¹ ∨ S¹$, where $H² = 0$, and cup products are natural', 'Because the ball is too small', 'Because $α = β$'],
        answer: 'It retracts onto $S¹ ∨ S¹$, where $H² = 0$, and cup products are natural',
        wrong: [E('Squash the ball to its base point. Where do $α$, $β$ and their product come from?')],
        right: [E('Hatcher’s argument exactly. Time to answer Null — the last island.')],
      },
    ],
  },
  nulls_answer: {
    blueprint: 'Null’s Answer',
    arrive: [
      N('Well? Same holes. Same place.'),
      E('Cast $α ⌣ β$ on both islands, side by side.'),
    ],
    early: [E('Not yet — finish the earlier island first. Follow NEXT on the map.')],
    goals: [
      act('Light both islands’ α ⌣ β lanterns', [G('One lit, one dark.'), N('…A lantern. You’d trust a lantern over a count?'), E('Homotopy equivalences preserve cup products. These products differ, so the islands are not the same place.')]),
      {
        type: 'ask',
        question: 'So are $T$ and $S¹ ∨ S¹ ∨ S²$ homotopy equivalent?',
        options: ['No — their cup products differ', 'Yes — same groups', 'Only in degree 1'],
        answer: 'No — their cup products differ',
        wrong: [E('Look at the two lanterns.')],
        right: [E('Cohomology is a ring, not just a list of groups. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your casts stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next island is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'The torus and S¹ ∨ S¹ ∨ S² have the same cohomology groups, but on the torus the cup product of the two 1-dimensional classes generates H², while on the bouquet it is zero. Cup products are preserved by homotopy equivalences, so the two spaces are different.',
  cite: 'Hatcher, Algebraic Topology §3.2, pp. 212–214 (Example 3.8).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The answer is given. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'same_holes') return [E('Cup Caster (9), then click each of the two meters at the front of the islands.')]
  if (current === 'cast_torus') return [E('Click inside each of the two triangles.')]
  if (current === 'cast_bouquet') return [E('Ring $a$ (left) first, then ring $b$ (right), then the ball.')]
  return [E('Click each island’s lantern.')]
}
