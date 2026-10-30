/**
 * World 2 · Level 2-5 "Cut and Paste" — Excision Cut.
 * Hatcher §2.1 pp. 114–128 — excision (Theorem 2.20: if the closure of Z lies in the interior of
 * A, then (X − Z, A − Z) → (X, A) induces isomorphisms on homology); good pairs, Hₙ(X, A) ≅ H̃ₙ(X/A)
 * (Proposition 2.22); and H̃ᵢ(Sⁿ) ≅ ℤ for i = n, 0 otherwise (Corollary 2.14).
 *
 * Blade (7): cut a region out of the pair. Suspension Sling (4): crush A to a point.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['cut_deep', 'collapse', 'ladder', 'edge']

export const OPENING = [
  E('After this cut, we can prove his sphere has a hole. He knows that too, so keep your eyes open.'),
  E('The Excision Cut. Each deck holds a pair: a disk $X$, and $A$, the blue collar running round its rim.'),
  E('Relative homology $Hₙ(X, A)$ treats everything in $A$ as $0$. So here’s the question: if the collar counts as nothing, can we cut bits of it away and lose nothing?'),
  G('Sounds too good to be true.'),
  E('It’s true, with one condition, and the condition is the whole lesson. Blade on 7, Suspension Sling on 4. First deck is north-east; follow the NEXT ring.'),
  E('Two commons with beasts sit off that first deck, one west and one north-east. Optional.'),
]

export const STATIONS = {
  cut_deep: {
    blueprint: 'Cut Deep',
    arrive: [
      E('Cut three holes out of the collar $A$ with the Blade. Each cut has to sit well inside $A$, with collar all round it, not touching the collar’s inner edge.'),
      E('Excision: if the closure of $Z$ lies in the interior of $A$, then $H(X − Z, A − Z) ≅ H(X, A)$. Cutting $Z$ out changes nothing.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Cut three holes deep inside the collar A', done: [G('Three holes, and the homology didn’t budge.'), E('Why the margin? Hatcher’s proof chops every chain into tiny pieces. Each piece either misses $Z$ or lies in $A$, where it counts as $0$ anyway. That only works if $A$ wraps all the way round $Z$.')] },
      {
        type: 'ask',
        question: 'When may excision cut $Z$ out of the pair $(X, A)$?',
        options: ['When the closure of $Z$ lies in the interior of $A$', 'Whenever $Z$ is inside $X$', 'Only when $Z$ is a single point'],
        answer: 'When the closure of $Z$ lies in the interior of $A$',
        wrong: [E('Think of the cuts the Blade refused. Where were they?')],
        right: [E('Hatcher’s Theorem 2.20. The closure is $Z$ with its edge; the interior of $A$ is $A$ without its edge. So: $Z$, edge and all, strictly inside $A$.'), E('Next deck is north-west, on the NEXT ring.')],
      },
    ],
  },
  collapse: {
    blueprint: 'Collapse',
    arrive: [
      E('A disk with its rim. If $A$ counts as $0$, why not crush all of $A$ to a single point? For a good pair like this one, that’s allowed: $Hₙ(X, A) ≅ H̃ₙ(X/A)$.'),
      E('$X/A$ means $X$ with all of $A$ squeezed to one point. The tilde is reduced homology: the same groups, except $H̃₀$ counts pieces minus one. Crush the rim with the Suspension Sling (4).'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Crush the rim to a point with the Suspension Sling (4)', done: [G('It closed up into a ball!'), E('Pull the whole rim of a disk together into one point and the disk closes over, like a drawstring bag. A sphere: $D²/S¹ ≅ S²$.')] },
      {
        type: 'ask',
        question: 'So $H₂(D², S¹) ≅ H̃₂(S²)$ is…',
        options: ['$ℤ$', '$0$', '$ℤ₂$'],
        answer: '$ℤ$',
        wrong: [E('You found $H₂(D², S¹)$ already, at the Chase Channels.')],
        right: [E('$ℤ$. The Channels said the disk-and-rim gives $ℤ$; the drawstring says that’s the sphere’s $H₂$.'), G('So the sphere has a hole. In dimension two.'), E('One sphere so far. Next deck is north-east, on the NEXT ring.')],
      },
    ],
  },
  ladder: {
    blueprint: 'The Ladder',
    arrive: [
      E('A grid. Rows are spheres $S⁰$ to $S³$, columns are $H̃₀$ to $H̃₃$. One pad is lit: $H̃₀(S⁰) ≅ ℤ$. $S⁰$ is two points, one piece more than a point.'),
      E('Every disk $Dⁿ$ has edge $Sⁿ⁻¹$, and crushing the edge gives $Sⁿ$. The disk has no holes, so the long exact row gives $H̃ᵢ(Sⁿ) ≅ H̃ᵢ₋₁(Sⁿ⁻¹)$: one row up, one column across.'),
      E('Light every pad that is $ℤ$, all the way up to $H̃₃(S³)$.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Climb the ladder: light each pad that is ℤ, up to H̃₃(S³)', done: [G('A diagonal. All the way up.'), E('Each rung is the same move: the disk and its boundary sphere, exactness, and the zeros the disk gives you.')] },
      {
        type: 'ask',
        question: 'So what is $H̃ᵢ(Sⁿ)$?',
        options: ['$ℤ$ when $i = n$, and $0$ otherwise', '$ℤ$ for every $i ≤ n$', '$0$ always'],
        answer: '$ℤ$ when $i = n$, and $0$ otherwise',
        wrong: [E('Look at the lit pads. How many in each row?')],
        right: [E('Corollary 2.14. Every sphere has exactly one hole, in its own dimension.'), G('Including his. He said my number read zero. It just wasn’t the right number.'), E('Last deck is north-west, on the NEXT ring.')],
      },
    ],
  },
  edge: {
    blueprint: 'Too Close to the Edge',
    arrive: [
      E('Four regions are marked, $a$, $b$, $c$ and $d$. Only some of them may be excised.'),
      E('Cut out every region excision allows. The Blade won’t take the others; ask yourself why before you try.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Cut out every region excision allows', done: [G('Only $a$ and $b$ went.'), E('Both sit inside the collar with room to spare. $c$ pokes out of $A$ into the disk itself, and $d$ is all of $A$.')] },
      {
        type: 'ask',
        question: 'Why can’t you excise $d$, all of $A$?',
        options: ['Its closure isn’t inside the interior of $A$', 'It is too big', 'Because $A$ is blue'],
        answer: 'Its closure isn’t inside the interior of $A$',
        wrong: [E('Size isn’t it. Ring $b$ was big too. Check the condition again.')],
        right: [E('Right. $A$ reaches its own inner edge, and the interior of $A$ doesn’t, so there’s no margin. The gate’s north of this deck.'), E('Next comes the Dynamo Gate. That’s where we put his sphere back.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your cuts are still there. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Excision: if the closure of Z lies in the interior of A, cutting Z out of the pair (X, A) leaves its homology unchanged. For a good pair, Hₙ(X, A) ≅ H̃ₙ(X/A) — so H₂(D², S¹) ≅ H̃₂(S²) — and climbing with the pairs (Dⁿ, Sⁿ⁻¹) gives H̃ᵢ(Sⁿ) ≅ ℤ for i = n and 0 otherwise.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 114–128 (excision, Theorem 2.20; good pairs, Proposition 2.22; spheres, Corollary 2.14).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every deck’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'cut_deep') return [E('Blade (7). Click in the middle of the blue collar, away from its inner edge and inside the gold rim.')]
  if (current === 'collapse') return [E('Sling (4), then click the gold rim.')]
  if (current === 'ladder') return [E('Each lit pad lights the one a row up and a column to the right. Click that one.')]
  return [E('Blade (7) on the marked regions. A region can go only if it sits strictly inside the collar, with collar all round it.')]
}
