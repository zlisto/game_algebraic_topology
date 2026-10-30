/**
 * World 2 · Level 2-6 "The Third Degree" — Dynamo Gate.
 * Hatcher §2.2 pp. 134–138 — the degree of f: Sⁿ → Sⁿ (f_* multiplies Hₙ(Sⁿ) ≅ ℤ by deg f);
 * homotopic maps have equal degree; deg(fg) = deg f · deg g; a reflection has degree −1, so the
 * antipodal map has degree (−1)ⁿ⁺¹; and Theorem 2.28: Sⁿ has a nowhere-zero tangent vector
 * field only when n is odd.
 *
 * The Degree Dial (8) does everything here: it tightens a band, sets a map's power, flips a mirror,
 * and turns the comb.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['hollow', 'wrap', 'antipode', 'hairy']

export const OPENING = [
  N('A dial. I made one once, for someone who liked to watch the needle move. Turn yours, Gyroid. My sphere is still a point.'),
  E('The Dynamo Gate. We know a sphere has one hole, $Hₙ(Sⁿ) ≅ ℤ$. Any map from the sphere to itself has to send that $ℤ$ to itself, and all it can do is multiply by a whole number.'),
  E('That number is the map’s degree. On a circle it’s how many times the map winds round, with backward turns counted as minus.'),
  G('And the Dial reads it?'),
  E('The Dial changes it, and reads it. Degree Dial on 8. First gate is north-west; follow the NEXT ring. Two commons sit north-east and east of it, one with beasts.'),
]

export const STATIONS = {
  hollow: {
    blueprint: 'The Hollow, Seen',
    arrive: [
      E('This band is a map $S¹ → S¹$: each point of a circle sent somewhere round the post. It goes forward, back, then forward again.'),
      E('Pull it tight with the Dial. Each click takes out one back-and-forth. Watch what doesn’t change.'),
    ],
    early: [E('Not this gate yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Pull the band tight with the Degree Dial (8)', done: [G('Every turn back cancelled a turn forward.'), E('Pulling tight is a homotopy, a slow change of the map. Degree is a number read off homology, and homotopic maps act the same on homology. So it can’t move.')] },
      {
        type: 'ask',
        question: 'What is the degree of this map?',
        options: ['$2$', '$4$', '$5$'],
        answer: '$2$',
        wrong: [E('Count the turns round the post now that it’s tight. Or count crossings of the pink line, minus for each one going backward.')],
        right: [E('Two. Next gate is north-west, on the NEXT ring.')],
      },
    ],
  },
  wrap: {
    blueprint: 'Wrap Count',
    arrive: [
      E('Two maps of the circle, $f(z) = zᵃ$ and $g(z) = zᵇ$. Think of $z$ as a point on the unit circle; $z ↦ zᵏ$ multiplies its angle by $k$, so it winds $k$ times: degree $k$.'),
      E('The band shows $f ∘ g$, first $g$, then $f$. Use the Dial on each lever to set $a$ and $b$ so the composite has degree $−6$.'),
    ],
    early: [E('Not this gate yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Set a and b so that f ∘ g has degree −6', done: [G('Six turns. The other way round.'), E('$(zᵇ)ᵃ = zᵃᵇ$. If $g$ multiplies the hole by $b$ and $f$ by $a$, doing both multiplies by $ab$.')] },
      {
        type: 'ask',
        question: 'For any maps of spheres, $deg(f ∘ g)$ =',
        options: ['$deg f · deg g$', '$deg f + deg g$', '$deg f − deg g$'],
        answer: '$deg f · deg g$',
        wrong: [E('Look at your levers. What did $a$ and $b$ have to do to make $−6$?')],
        right: [E('Because $(fg)_* = f_* g_*$: multiplying by one number, then another, multiplies by their product. Next gate is north, on the NEXT ring.')],
      },
    ],
  },
  antipode: {
    blueprint: 'Through the Center',
    arrive: [
      E('A sphere, a point $P$ on it, and three mirrors. Each mirror flips one coordinate, and a reflection turns the sphere inside out: degree $−1$.'),
      E('Switch mirrors on with the Dial until the map sends $P$ to $−P$, the point straight through the centre. That map is the antipodal map.'),
    ],
    early: [E('Not this gate yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Send P to −P using the mirror levers', done: [G('All three mirrors.'), E('$−P$ flips all three coordinates, so the antipodal map on $S²$ is three reflections. Degrees multiply: $(−1)³ = −1$.')] },
      {
        type: 'ask',
        question: 'The antipodal map on $Sⁿ$ is $n + 1$ reflections. What is its degree?',
        options: ['$(−1)ⁿ⁺¹$', '$−1$ always', '$n + 1$'],
        answer: '$(−1)ⁿ⁺¹$',
        wrong: [E('Each reflection multiplies the degree by $−1$. How many reflections are there?')],
        right: [E('So on the circle it’s $+1$, just a half turn. On $S²$ it’s $−1$. Hold on to that. Last gate is north-east, on the NEXT ring.')],
      },
    ],
  },
  hairy: {
    blueprint: 'The Hairy Ball',
    arrive: [
      E('A hairy sphere. Comb it so every hair lies flat along the surface. The red dots are calm spots, where a hair has nowhere to point.'),
      E('Click anywhere on the sphere with the Dial to comb round that point instead. Try three times and see if you can get rid of the calm spots.'),
    ],
    early: [E('Not this gate yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Comb the sphere three ways with the Dial', done: [G('There’s always a calm spot. Always two!'), E('You can’t comb $S²$ flat. A circle you can: point every hair the same way round.')] },
      {
        type: 'ask',
        question: 'Why can’t $S²$ be combed? If it could, the antipodal map would be homotopic to…',
        options: ['the identity — but their degrees, $−1$ and $1$, differ', 'a constant map — but degree $0$ is impossible', 'a reflection, which is impossible'],
        answer: 'the identity — but their degrees, $−1$ and $1$, differ',
        wrong: [E('A perfect combing lets every point walk along its hair, half way round the sphere, to its opposite point. Walking from the identity to what?')],
        right: [E('If every hair lay flat, each point could slide along its hair to its opposite. That’s a homotopy from the identity, degree $1$, to the antipodal map, degree $−1$. Impossible. Theorem 2.28: $Sⁿ$ combs only when $n$ is odd.'), E('And a number like $−1$ can’t be folded. The Delta Sphere goes on the Chart, Gyroid. Look up.'), G('The lights. They’re coming back on.'), N('…Ten thousand windows. Someone will sit up by every one of them tonight.'), E('The gate’s north of this one.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your settings are all still there. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next gate is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A map f: Sⁿ → Sⁿ multiplies Hₙ(Sⁿ) ≅ ℤ by an integer, its degree. Homotopic maps have equal degree, degrees multiply under composition, a reflection has degree −1, and so the antipodal map has degree (−1)ⁿ⁺¹ — which is why S² has no nowhere-zero tangent field.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 134–138 (degree; Theorem 2.28, the hairy ball).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every gate’s done. The exit is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'hollow') return [E('Degree Dial (8), then click the band or the post.')]
  if (current === 'wrap') return [E('Each lever runs its power from $−3$ to $3$. $−6$ is $2 × (−3)$, or $(−2) × 3$, or…')]
  if (current === 'antipode') return [E('Each mirror flips one coordinate of $f(P)$. $−P$ has all three flipped.')]
  return [E('Click a different spot on the sphere each time. The calm spots jump about, but they never go away.')]
}
