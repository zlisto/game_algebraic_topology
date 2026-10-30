/**
 * World 3 · Level 3-1 "Reverse Engineering" — Mirror Pools.
 * Hatcher §3.1, pp. 190–197 — cochains Cⁿ(X; G) = Hom(Cₙ(X), G); the coboundary δ is dual to ∂,
 * δφ = φ∂, so δδ = 0; cohomology Hⁿ = Ker δ / Im δ. For a 1-cochain: it is a cocycle when it reads
 * 0 round the boundary of every 2-simplex, and a coboundary δf when it comes from values on points.
 *
 * Reading Wand (0): cycle an edge's (or a point's) value through −2 … 2.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['read_edge', 'balanced', 'from_points', 'around_hole']

export const OPENING = [
  E('Null has the twins somewhere in these gardens. Counting holes couldn’t tell them apart. So we stop counting and start reading.'),
  E('These are the Mirror Pools. In the Delta you built chains out of edges. Here you write a number on every edge instead. That’s a 1-cochain.'),
  E('To read a cochain on a path, add up the numbers along it, and subtract any edge you walk backwards. Hatcher writes $Cⁿ(X; G) = $ Hom$(Cₙ(X), G)$: a rule that turns chains into numbers.'),
  G('So the chain’s the road, and the cochain is a toll on every stretch of it. The whole trip costs the sum.'),
  E('That’s exactly it. Careful, though: something with lattice wings is circling the pools. A Coboundary Harpy. It reads your lashes like a cochain reads chains, and plain lashes feed it.'),
  E('Press G to switch your lash to cochain stance (it glows cyan) and strike it on the dual. Three hits drive its $δα$ to $0$. The Reading Wand, on 0, sets the numbers. First pool’s just ahead.'),
]

export const STATIONS = {
  read_edge: {
    blueprint: 'Read an Edge',
    arrive: [
      E('One triangle, a number on each edge: that’s your cochain $φ$. Each edge points from the lower corner number to the higher one.'),
      E('Now give the triangle a number too: walk round its boundary and add up the tolls. That’s the coboundary, $δφ(σ) = φ(∂σ)$.'),
      E('The boundary is $[v₁v₂] − [v₀v₂] + [v₀v₁]$, so here $δφ = 2 − 0 + 1 = 3$. Change one edge with the Wand until the triangle reads $0$.'),
    ],
    early: [E('Not this pool yet. Finish the one before it first: follow the NEXT ring on your map.')],
    goals: [
      { type: 'action', hint: 'Make the triangle read 0 — click edges with the Reading Wand (0)', done: [G('Zero. The pool went grey.'), E('A cochain with $δφ = 0$ is a cocycle: walk round any triangle, add up the edges, and you get nothing.')] },
      {
        type: 'ask',
        question: 'Why is $δφ(σ)$ computed from the edges of $σ$?',
        options: ['Because $δφ$ is defined as $φ$ applied to $∂σ$', 'Because triangles have three edges', 'Because $φ$ ignores triangles'],
        answer: 'Because $δφ$ is defined as $φ$ applied to $∂σ$',
        wrong: [E('Think about what you did by hand: you walked the triangle’s boundary and added. $δ$ is $∂$, read from the other side.')],
        right: [E('Right. $δφ$ is just $φ$ read on $∂σ$, so $δδφ = φ∂∂ = 0$. We get $δ² = 0$ for free, because $∂² = 0$. Next pool: follow the NEXT ring, north-west.')],
      },
    ],
  },
  balanced: {
    blueprint: 'Balanced Readings',
    arrive: [
      E('A fan of four triangles round a centre point. The rim edges are locked. You set the four spokes so every triangle adds up to $0$ round its edges.'),
      E('A coloured triangle doesn’t balance yet. Grey means it reads zero.'),
    ],
    early: [E('Not this pool yet. Finish the one before it first: follow the NEXT ring on your map.')],
    goals: [
      { type: 'action', hint: 'Set the spokes so all four triangles read 0', done: [G('All grey!'), E('Did you feel that? Once you picked one spoke, each triangle forced the next. You only ever had one free choice.')] },
      {
        type: 'ask',
        question: 'You could start the spokes from different values and still balance. What changed between those answers?',
        options: ['All the spoke values shift together — like adding the same reading at the centre', 'The rim values', 'Nothing could change'],
        answer: 'All the spoke values shift together — like adding the same reading at the centre',
        wrong: [E('Try it in your head. Raise $φ[v₀v₄]$ by one. To keep $[v₀v₁v₄]$ at zero, what has $[v₁v₄]$ got to do?')],
        right: [E('Every spoke points into the centre, so adding $1$ to all four is $δf$ with $f = 1$ at the centre and $0$ on the rim. Readings made from points like that are the next pool: follow NEXT, north.')],
      },
    ],
  },
  from_points: {
    blueprint: 'Readings from Points',
    arrive: [
      E('Now the numbers go on the corners: a 0-cochain $f$. It still gives every edge a number, head minus tail: $δf[v w] = f(w) − f(v)$.'),
      E('Think of $f$ as heights on a hillside. Each edge reads how far it climbs. Set the corners with the Wand so every edge reads its pink tag.'),
    ],
    early: [E('Not this pool yet. Finish the one before it first: follow the NEXT ring on your map.')],
    goals: [
      { type: 'action', hint: 'Set point values so δf matches the target on every edge', done: [G('Every edge matches.'), E('So that edge reading was a coboundary, $φ = δf$. It was never anything more than differences of heights.')] },
      {
        type: 'ask',
        question: 'Is there more than one $f$ that works?',
        options: ['Yes — add the same number to every point', 'No, $f$ is unique', 'Only if an edge is $0$'],
        answer: 'Yes — add the same number to every point',
        wrong: [E('$δf$ only sees differences, $f(w) − f(v)$. What could you do to every corner without changing a single difference?')],
        right: [E('Right. A constant has $δ = 0$, and on a connected space the constants are the only ones that do. That’s $H⁰ = ℤ$. Last pool: follow NEXT, north-east.')],
      },
    ],
  },
  around_hole: {
    blueprint: 'Around the Hole',
    arrive: [
      E('Two triangles side by side. One is a filled tile. The other is only an outline: a missing tile, a hole. Only the filled tile has to balance.'),
      E('Here’s the key. Any $δf$ adds to $0$ round every closed loop: go up and down a hillside and come back to where you started, and you’ve climbed nothing.'),
      E('So find edge numbers that add to $0$ round the filled tile but not round the missing one. That’s a cocycle no heights on the points could give you.'),
    ],
    early: [E('Not this pool yet. Finish the one before it first: follow the NEXT ring on your map.')],
    goals: [
      { type: 'action', hint: 'Make a cocycle that isn’t a coboundary', done: [G('It balances on the tile, but it reads something round the hole!'), E('A cocycle that isn’t a coboundary. That’s a class in $H¹$, and the only reason it exists is the hole.')] },
      {
        type: 'ask',
        question: 'What does $H¹$ = Ker δ / Im δ measure here?',
        options: ['Readings that balance everywhere but aren’t differences of point values — they see the hole', 'The number of edges', 'Readings that are zero everywhere'],
        answer: 'Readings that balance everywhere but aren’t differences of point values — they see the hole',
        wrong: [E('Ker δ is the cocycles, the readings that balance on every filled tile. Im δ is the coboundaries, the ones that come from heights. What’s left once you set those aside?')],
        right: [E('Cohomology sees the same hole homology did. Homology walked round it; this reads round it. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your numbers are where you left them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next pool is ${name}: follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A cochain reads chains: Cⁿ(X; G) = Hom(Cₙ(X), G). Its coboundary is δφ = φ∂, so δδ = 0, and cohomology is Hⁿ = Ker δ / Im δ. A 1-cocycle balances on every triangle; it is a coboundary when it comes from point values — and the ones that don’t, see the holes.',
  cite: 'Hatcher, Algebraic Topology §3.1, pp. 190–197.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every pool is done. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'read_edge') return [E('$δφ = φ[v₁v₂] − φ[v₀v₂] + φ[v₀v₁]$. Lower one of the plus edges, or raise $[v₀v₂]$, until it comes to $0$.')]
  if (current === 'balanced') return [E('Start with $[v₀v₄]$ at $0$. Then $[v₀v₁v₄]$ forces $[v₁v₄]$, and so on round the fan.')]
  if (current === 'from_points') return [E('Fix $v₀$ at $0$. Then each edge tells you the next corner: $f(w) = f(v) + $ the wanted reading.')]
  return [E('Keep the filled tile at $0$. Then make the loop $[v₀v₂] + [v₂v₃] − [v₀v₃]$ round the missing tile add to something other than $0$.')]
}
