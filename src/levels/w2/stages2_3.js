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
  N('You walk the stones round the pond, Gyroid, never the edge. Someone taught you that. Bend my shallows however you like. Water always finds the low place.'),
  G('Does he ever just say hello?'),
  E('Not any more. The Singular Shallows. Each deck is a ring of stone round a pond, and the pond isn’t part of the place. That’s the hole.'),
  E('In the Yard a simplex was a straight tile. Here it can be any continuous map into the place: a path that bends, loops back, or never moves at all. Hatcher calls those singular simplices.'),
  G('Sounds messy.'),
  E('It is. But the Blade works on them just as before. Blade on 7, Tide Glass on 3. First deck is north; follow the NEXT ring. Commons sit north-east and north-west of it; the north-west one has beasts.'),
]

export const STATIONS = {
  any_tri: {
    blueprint: 'Any Triangle',
    arrive: [
      E('Three paths from $p₀$ to $p₁$: one smooth, one wiggly, one that swings wide. Each is a singular 1-simplex, a map from an interval into the stone.'),
      E('And by $p₃$, a path that never moves, just sits on the one point. That’s the constant path. Cut all four with the Blade.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Cut all four paths with the Boundary Blade (7)', done: [G('Same answer three times. Then nothing.'), E('The Blade only looks at the ends: $∂σ = σ(1) − σ(0)$, end minus start, however the path bends. The constant path ends where it starts, so $p₃ − p₃ = 0$.')] },
      {
        type: 'ask',
        question: 'What counts as a singular 1-simplex in $X$?',
        options: ['Any continuous path in $X$, even a constant one', 'Only straight segments', 'Only paths that never cross themselves'],
        answer: 'Any continuous path in $X$, even a constant one',
        wrong: [E('The wiggly one and the constant one both cut cleanly. Hatcher allows any continuous map $σ: Δ¹ → X$.')],
        right: [E('Any map $σ: Δⁿ → X$ at all. No tiles to fit, no gluing to get right, so it works for every space, not only ones we can cut into triangles.'), E('Next deck is north-west, on the NEXT ring.')],
      },
    ],
  },
  pieces: {
    blueprint: 'Pieces',
    arrive: [
      E('Four quarter-paths round the pond, $α$, $β$, $γ$, $δ$, and a wide path $ε$ on the north-west side. Each Blade click sets a path’s number: $+1$, $−1$, $0$.'),
      E('Build a cycle that goes round the pond. A cycle means every point’s total is $0$: each path that ends there is cancelled by one that starts there.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Build a cycle that goes round the pond', done: [G('Four bent pieces, and it closes up.'), E('$α + β + γ + δ$. Every piece is bent, none of them is a tile, and the sum still has no ends. It goes round the hole once.')] },
      {
        type: 'ask',
        question: 'The cycle $γ − ε$ doesn’t go round the pond. Why doesn’t it count as a hole?',
        options: ['It’s a boundary — a singular 2-simplex can fill the strip between the paths', 'Because $ε$ is longer than $γ$', 'Cycles with two pieces never count'],
        answer: 'It’s a boundary — a singular 2-simplex can fill the strip between the paths',
        wrong: [E('Look at the stone between $γ$ and $ε$. Is anything in the way of filling it in?')],
        right: [E('Right. $γ − ε$ goes out one way and back the other, and the strip between them is solid stone. Map a triangle onto that strip and its boundary is $γ − ε$. Round the pond, there’s water in the way.'), E('Next deck is north-east, on the NEXT ring.')],
      },
    ],
  },
  bend: {
    blueprint: 'Bend the Loop',
    arrive: [
      E('A loop round the pond. Click with the Tide Glass (3) and the loop bulges toward where you click. It can’t cross the water.'),
      E('Bend it until it passes over all three buoys.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Bend the loop over all three buoys with the Tide Glass (3)', done: [G('That’s a totally different shape now.'), E('Different loop, same class. Each bend sweeps out a strip of stone between the old loop and the new one. That strip is filled, so old minus new is a boundary, and boundaries count as nothing.')] },
      {
        type: 'ask',
        question: 'If two maps are homotopic, what does Hatcher say about the maps they induce on homology?',
        options: ['They are equal: $f_* = g_*$', 'They differ by the number of bends', 'Nothing can be said'],
        answer: 'They are equal: $f_* = g_*$',
        wrong: [E('Did the loop’s count round the pond change at any point while you bent it?')],
        right: [E('Theorem 2.10. A homotopy is a slow bend from one map to another, and the strip it sweeps fills in the difference. So homotopic maps do exactly the same thing to homology.'), E('Last deck is north-east, on the NEXT ring.')],
      },
    ],
  },
  same: {
    blueprint: 'Same Shape, Same Count',
    arrive: [
      E('A thick ring of stone. Squeeze it onto its middle circle with the Tide Glass: three clicks on the ring.'),
      E('The ring and the circle are homotopy equivalent. You can slide one onto the other without tearing, and slide back.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Squeeze the ring onto its middle circle — click it three times with the Tide Glass (3)', done: [G('Just a circle now.'), E('A deformation retraction. Every point slides straight in or out to the middle circle, and points already on the circle never move.')] },
      {
        type: 'ask',
        question: 'So what is $H₁$ of the thick ring?',
        options: ['$ℤ$ — the same as the circle', '$0$ — it’s too thick to have a hole', '$ℤ²$ — one for each edge of the ring'],
        answer: '$ℤ$ — the same as the circle',
        wrong: [E('Homotopy equivalent places have the same homology. What’s $H₁$ of a circle?')],
        right: [E('$ℤ$. Squeeze, then put back: that round trip is homotopic to doing nothing, either way round. So by 2.10 the two maps undo each other on homology. Corollary 2.11.'), G('So squeezing can’t make a hole go away. Not even his kind of squeezing.'), E('Not a real one. The gate’s north of this deck.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your work’s still there. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A singular n-simplex in X is any continuous map σ: Δⁿ → X — bent, folded or constant. Chains of them, with the same boundary formula, give the singular homology Hₙ(X). Homotopic maps induce the same maps on homology, so homotopy equivalent spaces have isomorphic homology.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 108–113 (singular homology; homotopy invariance, Theorem 2.10, Corollary 2.11).',
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
  if (current === 'any_tri') return [E('Blade (7), then click each path. Don’t forget the ringed dot by $p₃$; that’s the constant path.')]
  if (current === 'pieces') return [E('For a cycle every point’s total has to be $0$. Go round the pond with the quarter-paths, all pointing the same way round.')]
  if (current === 'bend') return [E('Tide Glass (3). Click near a red buoy and the loop bulges toward it. A buoy turns green once the loop passes over it.')]
  return [E('Tide Glass (3), then click the blue ring three times.')]
}
