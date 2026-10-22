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
  E('One more step and we can prove his sphere is hollow. Stay sharp — he knows it too.'),
  E('Excision Cut. Each deck holds a pair: a disk $X$, and $A$, the blue collar round its rim.'),
  E('Relative homology $Hₙ(X, A)$ ignores everything in $A$. So — can we just cut pieces of $A$ away and lose nothing?'),
  G('That sounds too good to be true.'),
  E('It’s true, with one condition. Blade on 7, Suspension Sling on 4. First deck is west.'),
]

export const STATIONS = {
  cut_deep: {
    blueprint: 'Cut Deep',
    arrive: [
      E('Cut three holes out of the collar $A$ with the Blade. Each cut must sit well inside $A$ — not touching its inner edge.'),
      E('Excision says $H(X − Z, A − Z) ≅ H(X, A)$ whenever the closure of $Z$ lies in the interior of $A$.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Cut three holes deep inside the collar A', done: [G('Three holes, and the homology didn’t budge.'), E('Inside $A$, everything already counted as zero. Cutting it away changes nothing.')] },
      {
        type: 'ask',
        question: 'When may excision cut $Z$ out of the pair $(X, A)$?',
        options: ['When the closure of $Z$ lies in the interior of $A$', 'Whenever $Z$ is inside $X$', 'Only when $Z$ is a single point'],
        answer: 'When the closure of $Z$ lies in the interior of $A$',
        wrong: [E('Think of the cuts the Blade refused. Where were they?')],
        right: [E('That’s Hatcher’s Theorem 2.20. Next deck is east.')],
      },
    ],
  },
  collapse: {
    blueprint: 'Collapse',
    arrive: [
      E('A disk, rim and all. The disk with its rim is a good pair — so $Hₙ(X, A) ≅ H̃ₙ(X/A)$, the homology of $X$ with all of $A$ crushed to one point.'),
      E('Crush the rim with the Suspension Sling (4) and watch what $X/A$ is.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Crush the rim to a point with the Suspension Sling (4)', done: [G('It closed up into a ball!'), E('A disk with its whole rim pinched to one point is a sphere: $D²/S¹ ≅ S²$.')] },
      {
        type: 'ask',
        question: 'So $H₂(D², S¹) ≅ H̃₂(S²)$ is…',
        options: ['$ℤ$', '$0$', '$ℤ₂$'],
        answer: '$ℤ$',
        wrong: [E('You found $H₂(D², S¹)$ already, back in the Chase Channels.')],
        right: [E('$ℤ$ — the same answer two ways. Next deck is north of the first.')],
      },
    ],
  },
  ladder: {
    blueprint: 'The Ladder',
    arrive: [
      E('A grid: rows are spheres $S⁰$ to $S³$, columns are $H̃₀$ to $H̃₃$. One pad is lit: $H̃₀(S⁰) ≅ ℤ$ — two points, one more piece than a point.'),
      E('The pair $(Dⁿ, Sⁿ⁻¹)$ gives $H̃ᵢ(Sⁿ) ≅ H̃ᵢ₋₁(Sⁿ⁻¹)$: one rung up, one rung across. Light the pads that are $ℤ$, all the way to $H̃₃(S³)$.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Climb the ladder: light each pad that is ℤ, up to H̃₃(S³)', done: [G('A diagonal, all the way up.'), E('Every step uses the long exact sequence of the disk and its boundary sphere.')] },
      {
        type: 'ask',
        question: 'So what is $H̃ᵢ(Sⁿ)$?',
        options: ['$ℤ$ when $i = n$, and $0$ otherwise', '$ℤ$ for every $i ≤ n$', '$0$ always'],
        answer: '$ℤ$ when $i = n$, and $0$ otherwise',
        wrong: [E('Look at the lit pads: one per row.')],
        right: [E('Exactly — Corollary 2.14. A sphere has one hole, in its own dimension. Last deck is east.')],
      },
    ],
  },
  edge: {
    blueprint: 'Too Close to the Edge',
    arrive: [
      E('Four regions are marked $a$, $b$, $c$, $d$. Only some of them may be excised.'),
      E('Cut out every region that excision allows. The Blade won’t take the others.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Cut out every region excision allows', done: [G('Only $a$ and $b$ went.'), E('Both sit inside the collar with room to spare. $c$ pokes out of $A$, and $d$ is $A$ itself.')] },
      {
        type: 'ask',
        question: 'Why can’t you excise $d$, all of $A$?',
        options: ['Its closure isn’t inside the interior of $A$', 'It is too big', 'Because $A$ is blue'],
        answer: 'Its closure isn’t inside the interior of $A$',
        wrong: [E('Size isn’t the issue — ring $b$ was big too. Check the condition again.')],
        right: [E('Right: $A$ touches its own inner edge, so excision doesn’t apply. The gate’s open — south of the last deck.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your cuts stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Excision: if the closure of Z lies in the interior of A, cutting Z out of the pair (X, A) leaves its homology unchanged. For a good pair, Hₙ(X, A) ≅ H̃ₙ(X/A) — so H₂(D², S¹) ≅ H̃₂(S²) — and climbing with the pairs (Dⁿ, Sⁿ⁻¹) gives H̃ᵢ(Sⁿ) ≅ ℤ for i = n and 0 otherwise.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 114–128 (excision, Theorem 2.20; good pairs, Proposition 2.22; spheres, Corollary 2.14).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every deck is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'cut_deep') return [E('Blade (7). Click in the middle of the blue collar — away from its inner edge and inside the gold rim.')]
  if (current === 'collapse') return [E('Sling (4), then click the gold rim.')]
  if (current === 'ladder') return [E('Each lit pad lights the one a row up and a column right. Click that one.')]
  return [E('Blade (7) on the marked regions. A region may go only if it sits strictly inside the collar.')]
}
