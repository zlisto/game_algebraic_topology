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
  E('Null’s twins are somewhere in these gardens. Counting can’t separate them. Reading might.'),
  E('Mirror Pools — World 3. Here we turn homology inside out.'),
  E('A chain is a sum of simplices. A cochain is a reading: it assigns a number to each simplex, and so to each chain. Hatcher writes $Cⁿ(X; G) = $ Hom$(Cₙ(X), G)$.'),
  G('So instead of building things out of edges, we put numbers on them?'),
  E('Exactly. The Reading Wand (0) sets the numbers. First pool is just ahead.'),
]

export const STATIONS = {
  read_edge: {
    blueprint: 'Read an Edge',
    arrive: [
      E('A 1-cochain $φ$ puts a number on each edge — the badges. Its coboundary reads the triangle by reading the triangle’s boundary: $δφ(σ) = φ(∂σ)$.'),
      E('Here $δφ = φ[v₁v₂] − φ[v₀v₂] + φ[v₀v₁] = 3$. Change one edge with the Wand until the triangle reads $0$.'),
    ],
    early: [E('Not yet — finish the earlier pool first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make the triangle read 0 — click edges with the Reading Wand (0)', done: [G('Zero — the triangle went grey.'), E('A cochain with $δφ = 0$ is a cocycle.')] },
      {
        type: 'ask',
        question: 'Why is $δφ(σ)$ computed from the edges of $σ$?',
        options: ['Because $δφ$ is defined as $φ$ applied to $∂σ$', 'Because triangles have three edges', 'Because $φ$ ignores triangles'],
        answer: 'Because $δφ$ is defined as $φ$ applied to $∂σ$',
        wrong: [E('δ is the mirror image of ∂: read the boundary.')],
        right: [E('δ is dual to ∂ — so $δδ = φ∂∂ = 0$, for free. Next pool is south-east.')],
      },
    ],
  },
  balanced: {
    blueprint: 'Balanced Readings',
    arrive: [
      E('The fan. The rim’s readings are fixed. Set the four spokes so that every triangle reads $0$.'),
      E('Coloured triangles are out of balance.'),
    ],
    early: [E('Not yet — finish the earlier pool first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Set the spokes so all four triangles read 0', done: [G('All grey!'), E('Each spoke was pinned down by its neighbour — once you chose one, the rest followed.')] },
      {
        type: 'ask',
        question: 'You could start the spokes from different values and still balance. What changed between those answers?',
        options: ['All the spoke values shift together — like adding the same reading at the centre', 'The rim values', 'Nothing could change'],
        answer: 'All the spoke values shift together — like adding the same reading at the centre',
        wrong: [E('Try one more full set in your head: if $φ[v₀v₄]$ goes up by one, what happens to the others?')],
        right: [E('That’s $δ$ of a reading at $v₄$ — the next pool is all about those. South-west of here.')],
      },
    ],
  },
  from_points: {
    blueprint: 'Readings from Points',
    arrive: [
      E('Now put numbers on the points instead: a 0-cochain $f$. Its coboundary reads each edge as $δf[v w] = f(w) − f(v)$.'),
      E('Set the point values with the Wand so every edge reads what it wants (the pink tags).'),
    ],
    early: [E('Not yet — finish the earlier pool first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Set point values so δf matches the target on every edge', done: [G('Every edge matches.'), E('So that edge reading was a coboundary: $φ = δf$.')] },
      {
        type: 'ask',
        question: 'Is there more than one $f$ that works?',
        options: ['Yes — add the same number to every point', 'No, $f$ is unique', 'Only if an edge is $0$'],
        answer: 'Yes — add the same number to every point',
        wrong: [E('$δf$ only sees differences $f(w) − f(v)$.')],
        right: [E('Right: constants have $δ = 0$. That’s $H⁰ = ℤ$ for a connected space. Last pool is south-west.')],
      },
    ],
  },
  around_hole: {
    blueprint: 'Around the Hole',
    arrive: [
      E('A filled tile beside a missing one. Find an edge reading that balances on the filled tile — a cocycle — but that no point values could produce.'),
      E('Hint: a coboundary reads $0$ round every loop. The loop round the missing tile is the one to watch.'),
    ],
    early: [E('Not yet — finish the earlier pool first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make a cocycle that isn’t a coboundary', done: [G('It balances, but it reads non-zero round the hole!'), E('A cocycle that isn’t a coboundary: a class in $H¹$. It detects the hole.')] },
      {
        type: 'ask',
        question: 'What does $H¹$ = Ker δ / Im δ measure here?',
        options: ['Readings that balance everywhere but aren’t differences of point values — they see the hole', 'The number of edges', 'Readings that are zero everywhere'],
        answer: 'Readings that balance everywhere but aren’t differences of point values — they see the hole',
        wrong: [E('Ker δ: the cocycles. Im δ: the coboundaries. What’s left?')],
        right: [E('Cohomology sees the same hole homology does — from the other side of the mirror. The gate’s open, south.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your readings stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next pool is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every pool is done. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'read_edge') return [E('$δφ = φ[v₁v₂] − φ[v₀v₂] + φ[v₀v₁]$. Lower one of the plus edges, or raise $[v₀v₂]$.')]
  if (current === 'balanced') return [E('Start with $[v₀v₄]$ at $0$. Then $[v₀v₁v₄]$ forces $[v₁v₄]$, and so on round the fan.')]
  if (current === 'from_points') return [E('Fix $v₀$ at $0$. Then each edge tells you the next point: $f(w) = f(v) + $ the wanted reading.')]
  return [E('Keep the filled tile at $0$. Then make the loop $[v₀v₂] + [v₂v₃] − [v₀v₃]$ read something other than $0$.')]
}
