/**
 * World 2 · Level 2-3 "Any Simplex Will Do" — Singular Shallows.
 * Hatcher §2.1 pp. 108–113 — singular simplices are any maps σ: Δⁿ → X; singular homology;
 * homotopic maps induce the same map on homology (Theorem 2.10), so homotopy equivalent spaces
 * have the same homology (Corollary 2.11).
 *
 * Every deck is the stone ring round a pond (SingularShallowsScene). Blade (7): cut a path to its
 * ends, or set a path's coefficient. Tide Glass (3): bend the loop; squeeze the ring.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['any_tri', 'pieces', 'bend', 'same']

export const OPENING = [
  N('Bend my shallows any way you like, Emmy. Everything bends to me in the end.'),
  E('The Singular Shallows. Each deck here is a space — the stone ring — with a pond in the middle that isn’t part of it.'),
  E('In the Tile Yard, simplices were straight tiles fitted together. Here a simplex can be any map into the space: bent, looped, even squashed to a point.'),
  G('That sounds like it could get messy.'),
  E('It does — but the boundary works exactly the same way. Blade on 7, Tide Glass on 3. First deck is west.'),
]

export const STATIONS = {
  any_tri: {
    blueprint: 'Any Triangle',
    arrive: [
      E('Three paths from $p₀$ to $p₁$: one smooth, one wiggly, one that swings wide. Each is a singular 1-simplex — a map from an interval into the space.'),
      E('And by $p₃$, a path that never moves: the constant path. Cut all four with the Blade.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Cut all four paths with the Boundary Blade (7)', done: [G('Same answer three times, and then nothing.'), E('$∂σ = σ(1) − σ(0)$: end minus start, however the path bends. A constant path ends where it starts, so its boundary is $0$.')] },
      {
        type: 'ask',
        question: 'What counts as a singular 1-simplex in $X$?',
        options: ['Any continuous path in $X$, even a constant one', 'Only straight segments', 'Only paths that never cross themselves'],
        answer: 'Any continuous path in $X$, even a constant one',
        wrong: [E('The wiggly one and the constant one both cut cleanly. Hatcher allows any map $σ: Δ¹ → X$.')],
        right: [E('Any map $σ: Δⁿ → X$ at all. That’s what makes singular homology work for every space.'), E('Next deck is east.')],
      },
    ],
  },
  pieces: {
    blueprint: 'Pieces',
    arrive: [
      E('Four quarter-paths round the pond, $α$, $β$, $γ$, $δ$, and a wide path $ε$ on the north-west side. Each Blade click sets a path’s coefficient: $+1$, $−1$, $0$.'),
      E('Build a cycle that goes round the pond. The totals on the points tell you whether the ends cancel.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Build a cycle that goes round the pond', done: [G('Four bent pieces, and it closes up.'), E('A cycle built out of singular simplices. No straight edges anywhere, and it still goes round the hole.')] },
      {
        type: 'ask',
        question: 'The cycle $γ − ε$ doesn’t go round the pond. Why doesn’t it count as a hole?',
        options: ['It’s a boundary — a singular 2-simplex can fill the strip between the paths', 'Because $ε$ is longer than $γ$', 'Cycles with two pieces never count'],
        answer: 'It’s a boundary — a singular 2-simplex can fill the strip between the paths',
        wrong: [E('Look at the stone between $γ$ and $ε$. Is there anything in the way of filling it in?')],
        right: [E('Right — the strip between them is part of the space, so the cycle bounds. Round the pond, nothing can fill it.'), E('Next deck is north of the first.')],
      },
    ],
  },
  bend: {
    blueprint: 'Bend, Don’t Change',
    arrive: [
      E('A loop round the pond. Click with the Tide Glass (3) and the loop bends toward where you click — but it can’t cross the water.'),
      E('Bend it so it passes over all three buoys.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Bend the loop over all three buoys with the Tide Glass (3)', done: [G('It’s a totally different shape now.'), E('Different map, same homology class: it still goes round the pond once. Bending sweeps out a strip, and the strip is a boundary.')] },
      {
        type: 'ask',
        question: 'If two maps are homotopic, what does Hatcher say about the maps they induce on homology?',
        options: ['They are equal: $f_* = g_*$', 'They differ by the number of bends', 'Nothing can be said'],
        answer: 'They are equal: $f_* = g_*$',
        wrong: [E('Did the loop’s count round the pond ever change while you bent it?')],
        right: [E('Theorem 2.10: homotopic maps induce the same homomorphism on homology.'), E('Last deck is to the east.')],
      },
    ],
  },
  same: {
    blueprint: 'Same Shape, Same Count',
    arrive: [
      E('A thick ring of stone. Squeeze it onto its middle circle with the Tide Glass — three clicks on the ring.'),
      E('The ring and the circle are homotopy equivalent: you can slide one onto the other without tearing.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Squeeze the ring onto its middle circle — click it three times with the Tide Glass (3)', done: [G('Just a circle now.'), E('A deformation retraction: every point slides inward or outward to the middle circle, and the circle itself never moves.')] },
      {
        type: 'ask',
        question: 'So what is $H₁$ of the thick ring?',
        options: ['$ℤ$ — the same as the circle', '$0$ — it’s too thick to have a hole', '$ℤ²$ — one for each edge of the ring'],
        answer: '$ℤ$ — the same as the circle',
        wrong: [E('Homotopy equivalent spaces have the same homology. What is $H₁$ of a circle?')],
        right: [E('$ℤ$. Homotopy equivalences induce isomorphisms on homology — Corollary 2.11.'), E('The gate’s open, south of the last deck.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your work stays. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A singular n-simplex in X is any continuous map σ: Δⁿ → X — bent, folded or constant. Chains of them, with the same boundary formula, give the singular homology Hₙ(X). Homotopic maps induce the same maps on homology, so homotopy equivalent spaces have isomorphic homology.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 108–113 (singular homology; homotopy invariance, Theorem 2.10, Corollary 2.11).',
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
  if (current === 'any_tri') return [E('Blade (7), then click each path — and the ringed dot by $p₃$, the constant path.')]
  if (current === 'pieces') return [E('Every point’s total must be $0$ for a cycle. Go round the pond with the quarter-paths, all the same way.')]
  if (current === 'bend') return [E('Tide Glass (3). Click near a red buoy and the loop bulges toward it. A buoy turns green when the loop passes over it.')]
  return [E('Tide Glass (3), then click the blue ring three times.')]
}
