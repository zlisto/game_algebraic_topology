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

export const STATION_ORDER = ['hollow', 'wrap', 'antipode', 'hairy']

export const OPENING = [
  E('The Dynamo Gate. A map from a sphere to itself sends its one hole, $Hₙ(Sⁿ) ≅ ℤ$, to itself — and all it can do is multiply by a whole number.'),
  E('That number is the map’s degree. On a circle, it’s how many times the map winds round, counting backward turns as minus.'),
  G('So the Dial reads degrees?'),
  E('It changes them. Degree Dial on 8. First gate is west.'),
]

export const STATIONS = {
  hollow: {
    blueprint: 'The Hollow, Seen',
    arrive: [
      E('This band is a map $S¹ → S¹$, wound round the post. It goes forward, back, forward again.'),
      E('Pull it tight with the Dial — each click takes out one back-and-forth. Watch what stays the same.'),
    ],
    early: [E('Not yet — finish the earlier gate first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Pull the band tight with the Degree Dial (8)', done: [G('Every turn back canceled a turn forward.'), E('Pulling tight is a homotopy, and homotopic maps have the same degree.')] },
      {
        type: 'ask',
        question: 'What is the degree of this map?',
        options: ['$2$', '$4$', '$5$'],
        answer: '$2$',
        wrong: [E('Count the turns round the post now that it’s tight — or count crossings of the pink line, minus for each one going backward.')],
        right: [E('Two. Next gate is east.')],
      },
    ],
  },
  wrap: {
    blueprint: 'Wrap Count',
    arrive: [
      E('Two maps of the circle: $f(z) = zᵃ$ and $g(z) = zᵇ$. The map $z ↦ zᵏ$ winds $k$ times, so it has degree $k$.'),
      E('The band shows $f ∘ g$. Use the Dial on each lever to set $a$ and $b$, and make the composite have degree $−6$.'),
    ],
    early: [E('Not yet — finish the earlier gate first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Set a and b so that f ∘ g has degree −6', done: [G('Six turns, the other way round.'), E('$(zᵇ)ᵃ = zᵃᵇ$: degrees multiply.')] },
      {
        type: 'ask',
        question: 'For any maps of spheres, $deg(f ∘ g)$ =',
        options: ['$deg f · deg g$', '$deg f + deg g$', '$deg f − deg g$'],
        answer: '$deg f · deg g$',
        wrong: [E('Try it with your levers: what did $a$ and $b$ have to do to give $−6$?')],
        right: [E('Because $(fg)_* = f_* g_*$. Next gate is north of the first.')],
      },
    ],
  },
  antipode: {
    blueprint: 'Through the Center',
    arrive: [
      E('A sphere, a point $P$, and three mirrors. A reflection in a mirror has degree $−1$.'),
      E('Turn mirrors on with the Dial until the map sends $P$ to $−P$, the point straight through the center. That’s the antipodal map.'),
    ],
    early: [E('Not yet — finish the earlier gate first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Send P to −P using the mirror levers', done: [G('All three mirrors.'), E('The antipodal map on $S²$ is three reflections, so its degree is $(−1)³ = −1$.')] },
      {
        type: 'ask',
        question: 'The antipodal map on $Sⁿ$ is $n + 1$ reflections. What is its degree?',
        options: ['$(−1)ⁿ⁺¹$', '$−1$ always', '$n + 1$'],
        answer: '$(−1)ⁿ⁺¹$',
        wrong: [E('Each reflection multiplies the degree by $−1$. How many are there?')],
        right: [E('So on the circle it’s $+1$ — just a half turn — but on $S²$ it’s $−1$. Last gate is east.')],
      },
    ],
  },
  hairy: {
    blueprint: 'The Hairy Ball',
    arrive: [
      E('A hairy sphere. Comb it so every hair lies flat along the surface. The red dots are calm spots, where there’s no direction to comb.'),
      E('Click anywhere on the sphere with the Dial to comb round that point instead. Try three times to get rid of the calm spots.'),
    ],
    early: [E('Not yet — finish the earlier gate first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Comb the sphere three ways with the Dial', done: [G('There’s always a calm spot. Always two!'), E('You can’t comb $S²$ flat. On a circle you can — just point every hair the same way round.')] },
      {
        type: 'ask',
        question: 'Why can’t $S²$ be combed? If it could, the antipodal map would be homotopic to…',
        options: ['the identity — but their degrees, $−1$ and $1$, differ', 'a constant map — but degree $0$ is impossible', 'a reflection, which is impossible'],
        answer: 'the identity — but their degrees, $−1$ and $1$, differ',
        wrong: [E('A combing lets you slide each point along its hair round to its opposite. What would that make the antipodal map homotopic to?')],
        right: [E('That’s Theorem 2.28: $Sⁿ$ can be combed only when $n$ is odd. The gate’s open — south of the last one.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your settings stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next gate is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A map f: Sⁿ → Sⁿ multiplies Hₙ(Sⁿ) ≅ ℤ by an integer, its degree. Homotopic maps have equal degree, degrees multiply under composition, a reflection has degree −1, and so the antipodal map has degree (−1)ⁿ⁺¹ — which is why S² has no nowhere-zero tangent field.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 134–138 (degree; Theorem 2.28, the hairy ball).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every gate is done. Walk through the exit to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'hollow') return [E('Degree Dial (8), then click the band or the post.')]
  if (current === 'wrap') return [E('Each lever cycles its power from $−3$ to $3$. $−6$ is $2 × (−3)$, or $(−2) × 3$, or…')]
  if (current === 'antipode') return [E('Each mirror flips one coordinate of $f(P)$. $−P$ has all three flipped.')]
  return [E('Click a different spot on the sphere each time. The calm spots jump — but never vanish.')]
}
