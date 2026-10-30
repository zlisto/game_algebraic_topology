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
  N('Two islands, Gyroid. The torus, and a bouquet: two rings and a ball, tied at one point. Count their holes. Every count agrees.'),
  N('Same counts, same place. Fold one and nothing is lost. I’ll take the torus. It’s been tired for a long time.'),
  G('There are people on that torus. Somebody’s still got a light on.'),
  E('Then we prove the islands are different, and counting won’t do it. Multiplying will. Cup Caster, on 9. First island: follow the NEXT ring, north.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  same_holes: {
    blueprint: 'Same Holes',
    arrive: [
      E('First, let’s give Null his due. Read both islands’ cohomology meters with the Caster.'),
    ],
    early: [E('Not this island yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Read both meters', [G('$ℤ$, $ℤ²$, $ℤ$. Both of them.'), E('Same groups in every degree. On the bouquet the two rings give $H¹ = ℤ²$ and the ball gives $H² = ℤ$. So far, Null’s right.')]),
      {
        type: 'ask',
        question: 'Same cohomology groups. Does that make them the same space?',
        options: ['Not necessarily — groups aren’t everything', 'Yes, always', 'Only if they have the same cells'],
        answer: 'Not necessarily — groups aren’t everything',
        wrong: [E('Remember the Lantern Rows. The groups don’t record what happens when you multiply.')],
        right: [E('So let’s compare their products. Torus first: follow the NEXT ring, north-east.')],
      },
    ],
  },
  cast_torus: {
    blueprint: 'Cast on the Torus',
    arrive: [E('The torus, just like the Lantern Rows: $α$ on the $a$ edges, $β$ on the $b$ edges. Cast $α ⌣ β$ on both triangles.')],
    early: [E('Not this island yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast α ⌣ β on both triangles of the torus', [G('$+1$. The top lantern’s blazing.'), E('On the torus, $α ⌣ β$ generates $H²$. There’s a triangle where $a$ is the front edge and $b$ is the back, so the two loops meet.')]),
      {
        type: 'ask',
        question: 'What does $α ⌣ β ≠ 0$ tell you about the torus?',
        options: ['Its two loop classes multiply to its top class', 'It has three holes', 'Nothing'],
        answer: 'Its two loop classes multiply to its top class',
        wrong: [E('Which class did the product land on?')],
        right: [E('Now the bouquet. Follow the NEXT ring, north-west.')],
      },
    ],
  },
  cast_bouquet: {
    blueprint: 'Cast on the Bouquet',
    arrive: [
      E('The bouquet, $S¹ ∨ S¹ ∨ S²$. Cast $α$ on ring $a$, then $β$ on ring $b$, then cast their cup on the ball.'),
    ],
    early: [E('Not this island yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast α on ring a, β on ring b, then the cup on the ball', [G('Dark. The beams never meet.'), E('$α$ lives on one ring, $β$ on the other, and the ball only touches them at one point. There’s no triangle anywhere with $a$ in front and $b$ behind.')]),
      {
        type: 'ask',
        question: 'Why is $α ⌣ β = 0$ on the bouquet?',
        options: ['It retracts onto $S¹ ∨ S¹$, where $H² = 0$, and cup products are natural', 'Because the ball is too small', 'Because $α = β$'],
        answer: 'It retracts onto $S¹ ∨ S¹$, where $H² = 0$, and cup products are natural',
        wrong: [E('Squash the ball down to the point it hangs from. What’s left, and does it have any $H²$ at all?')],
        right: [E('“Natural” means pulling back along a map keeps products: $r*(a ⌣ b) = r*a ⌣ r*b$.'), E('Exactly Hatcher’s argument. Squashing the ball is a retraction onto two rings. $α$, $β$ and their product all come from there, and two rings have no $H²$. Last island: NEXT, north-west.')],
      },
    ],
  },
  nulls_answer: {
    blueprint: 'Null’s Answer',
    arrive: [
      N('Well, Gyroid? Same holes. Same place. Let me close it.'),
      E('Cast $α ⌣ β$ on both islands, side by side. Let him watch.'),
    ],
    early: [E('Not this island yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Light both islands’ α ⌣ β lanterns', [G('One lit. One dark.'), N('…You’d stake an island on a lantern?'), G('There’s someone at that window. Yes.'), E('If one island could be deformed into the other, the deformation would carry $α$, $β$ and their product along with it. A lit lantern can’t turn into a dark one.')]),
      {
        type: 'ask',
        question: 'So are $T$ and $S¹ ∨ S¹ ∨ S²$ homotopy equivalent?',
        options: ['No — their cup products differ', 'Yes — same groups', 'Only in degree 1'],
        answer: 'No — their cup products differ',
        wrong: [E('Look at the two lanterns.')],
        right: [E('Cohomology isn’t just a list of groups. It’s a ring, and the ring told them apart. The torus goes on the Chart, and he can’t touch it now. The gate’s open, north.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your casts held. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next island is ${name}: follow the NEXT ring on your map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The torus is safe. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'same_holes') return [E('Cup Caster (9), then click each of the two meters at the front of the islands.')]
  if (current === 'cast_torus') return [E('Click inside each of the two triangles.')]
  if (current === 'cast_bouquet') return [E('Ring $a$ (left) first, then ring $b$ (right), then the ball.')]
  return [E('Click each island’s lantern.')]
}
