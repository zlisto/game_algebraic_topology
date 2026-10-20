/**
 * World 3 · Level 3-7 "Which Way Is Up" — Compass Cliffs.
 * Hatcher §3.3, pp. 233–239 — a local orientation of an n-manifold M at x is a choice of generator
 * of Hₙ(M, M − {x}) ≅ ℤ; an orientation is a choice that is locally consistent; the orientable
 * double cover M̃ has two points over each x, one per local orientation (Proposition 3.25: a
 * connected M is orientable iff M̃ has two components); and Theorem 3.26: a closed connected
 * n-manifold is orientable iff Hₙ(M; ℤ) ≅ ℤ.
 *
 * Sheet Compass (6): flip a compass; carry a compass to the next patch; ride the double cover.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['set_compasses', 'the_flip', 'two_sheets', 'survey']

export const OPENING = [
  E('Compass Cliffs. Near any point of a surface you can pick a way round — clockwise or counter-clockwise. That’s a local orientation.'),
  E('An orientation is a choice at every point that agrees with its neighbours. Some places allow it. Some don’t.'),
  G('A place where “which way is round” can’t be decided? That sounds like a flipper trick.'),
  E('Sheet Compass on 6. First cliff is ahead.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  set_compasses: {
    blueprint: 'Set the Compasses',
    arrive: [
      E('An annulus, split into six patches, each with a compass: gold for counter-clockwise, blue for clockwise.'),
      E('Click compasses to flip them until every one agrees with its neighbours.'),
    ],
    early: [E('Not yet — finish the earlier cliff first. Follow NEXT on the map.')],
    goals: [
      act('Make every compass agree with its neighbours', [G('All gold — or all blue would work too.'), E('A consistent choice: the annulus is orientable, and it has exactly two orientations.')]),
      {
        type: 'ask',
        question: 'How many orientations does a connected orientable surface have?',
        options: ['Two', 'One', 'One per patch'],
        answer: 'Two',
        wrong: [E('Once one compass is set, the rest are forced. How many ways can the first one go?')],
        right: [E('Right. Next cliff is south-east.')],
      },
    ],
  },
  the_flip: {
    blueprint: 'The Flip',
    arrive: [
      E('A Möbius band. The pink seam has a half-twist: across it, agreeing means pointing the opposite way.'),
      E('Patch 0 is set. Carry its compass round — click the next patch each time — and close the loop back at patch 0.'),
    ],
    early: [E('Not yet — finish the earlier cliff first. Follow NEXT on the map.')],
    goals: [
      act('Carry the compass all the way round and back to patch 0', [G('It came back the wrong way round!'), E('No choice works all the way round. The Möbius band is non-orientable.')]),
      {
        type: 'ask',
        question: 'What makes a manifold non-orientable?',
        options: ['Some loop carries a local orientation back to its opposite', 'It has a boundary', 'It is curved'],
        answer: 'Some loop carries a local orientation back to its opposite',
        wrong: [E('The annulus has a boundary too, and it was fine.')],
        right: [E('Right. Next cliff is south-west.')],
      },
    ],
  },
  two_sheets: {
    blueprint: 'Two Sheets',
    arrive: [
      E('Above each point of the Möbius band sit two points, one for each local orientation: the orientable double cover $M̃$. Outer ring: $+$. Inner ring: $−$.'),
      E('Ride it with the Compass: each click carries you two patches on. Go round the band twice.'),
    ],
    early: [E('Not yet — finish the earlier cliff first. Follow NEXT on the map.')],
    goals: [
      act('Ride the double cover twice round the band', [G('Once round, I was on the other ring. Twice round, home.'), E('So $M̃$ is one connected loop — exactly because $M$ is non-orientable.')]),
      {
        type: 'ask',
        question: 'For a connected manifold $M$, Proposition 3.25 says $M$ is orientable exactly when…',
        options: ['$M̃$ has two components', '$M̃$ is connected', '$M̃ = M$'],
        answer: '$M̃$ has two components',
        wrong: [E('For the annulus the two rings never meet. For the Möbius band they do.')],
        right: [E('One component for each orientation. Last cliff is further on.')],
      },
    ],
  },
  survey: {
    blueprint: 'Survey',
    arrive: [
      E('Three bands: no twist, one half-twist, two half-twists. Survey each: click it, and the Compass carries an orientation round.'),
    ],
    early: [E('Not yet — finish the earlier cliff first. Follow NEXT on the map.')],
    goals: [
      act('Survey all three bands', [G('Two twists came back the right way!'), E('Two half-twists cancel: that band is orientable. Only an odd number of flips spoils it.')]),
      {
        type: 'ask',
        question: 'For a closed connected $n$-manifold, Theorem 3.26 ties orientability to…',
        options: ['$Hₙ(M; ℤ) ≅ ℤ$ (orientable) or $0$ (not)', 'its Euler characteristic', 'whether it has a boundary'],
        answer: '$Hₙ(M; ℤ) ≅ ℤ$ (orientable) or $0$ (not)',
        wrong: [E('Remember the Mod Mill: the torus and sphere had $H₂ = ℤ$, ℝP² and the Klein bottle $0$.')],
        right: [E('A fundamental class exists exactly when orientations fit together. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your compasses stay set. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next cliff is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A local orientation at x is a generator of Hₙ(M, M − x) ≅ ℤ; an orientation is a locally consistent choice of them. The orientable double cover M̃ has one point per local orientation; a connected M is orientable exactly when M̃ falls into two pieces, and a closed connected M is orientable exactly when Hₙ(M; ℤ) ≅ ℤ.',
  cite: 'Hatcher, Algebraic Topology §3.3, pp. 233–239 (Proposition 3.25, Theorem 3.26).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The survey’s done. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'set_compasses') return [E('Sheet Compass (6). Click the blue compasses to turn them gold.')]
  if (current === 'the_flip') return [E('Click the highlighted patch each time — the compass is carried across the seam to it. The last click goes back to patch 0.')]
  if (current === 'two_sheets') return [E('Click anywhere on the band with the Compass. Watch which ring the bead is on.')]
  return [E('Click each of the three bands with the Compass.')]
}
