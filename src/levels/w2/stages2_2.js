/**
 * World 2 · Level 2-2 "Boundary Issues" — Cancel Marsh.
 * Hatcher §2.1 pp. 104–106 — simplicial chains Δₙ(X), the boundary map
 * ∂[v₀ … vₙ] = Σᵢ (−1)ⁱ [v₀ … v̂ᵢ … vₙ], ∂∂ = 0, and Hₙ = Ker ∂ₙ / Im ∂ₙ₊₁.
 *
 * The Boundary Blade (7) works the chains on each deck (CancelMarshScene): it cuts a triangle
 * into its boundary edges, cycles a coefficient 0 → +1 → −1, and cuts an edge into its ends.
 */
import { d1, d2, isZeroChain, sameChain } from './ChainDeck'
import { COMPLEXES, deckChains, RIM } from './CancelMarshScene'

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['first_cut', 'shared', 'nothing', 'missing']

export const OPENING = [
  E('Cancel Marsh. Out here we don’t just build with triangles — we add them up.'),
  G('Add triangles? Like, one triangle plus one triangle?'),
  E('Exactly. A chain is a sum of simplices with whole-number coefficients — $2[v₀v₁] − [v₁v₂]$, say. And the Boundary Blade takes any chain to its boundary.'),
  E('Equip the Blade with 7. The first deck is to the west.'),
]

export const STATIONS = {
  first_cut: {
    blueprint: 'First Cut',
    arrive: [
      E('One triangle, $[v₀v₁v₂]$. Every edge points from its lower vertex to its higher one.'),
      E('Cut the triangle with the Blade and see what its boundary is.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Click the triangle with the Boundary Blade (7)', done: [G('Two edges came out plus, and one minus?'), E('Walk round the triangle $v₀ → v₁ → v₂ → v₀$. You go along $[v₀v₁]$ and $[v₁v₂]$ forwards, but $[v₀v₂]$ backwards.')] },
      {
        type: 'ask',
        question: 'So what is $∂[v₀v₁v₂]$?',
        options: ['$[v₁v₂] − [v₀v₂] + [v₀v₁]$', '$[v₀v₁] + [v₁v₂] + [v₀v₂]$', '$[v₀v₁] − [v₁v₂]$'],
        answer: '$[v₁v₂] − [v₀v₂] + [v₀v₁]$',
        wrong: [E('Read the badges on the three edges again: two plus, one minus.')],
        right: [E('Drop each vertex in turn, with alternating signs: $∂[v₀ … vₙ] = Σ (−1)ⁱ [v₀ … v̂ᵢ … vₙ]$.'), E('Next deck is east along the causeway.')],
      },
    ],
  },
  shared: {
    blueprint: 'Shared Edges',
    arrive: [
      E('Four triangles round $v₄$. Each click of the Blade sets a triangle’s coefficient: $+1$, then $−1$, then $0$.'),
      E('Make a chain whose boundary is just the outside rim — every inside edge must come to zero.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Choose coefficients so only the rim is left', done: [G('All the inside edges canceled!'), E('Each inside edge belongs to two triangles, and with the right signs its two terms cancel.')] },
      {
        type: 'ask',
        question: 'Why did $[v₀v₃v₄]$ need the opposite sign from the other three?',
        options: ['Its vertex order runs round the other way from the rest', 'It is bigger than the others', 'Triangles touching $v₀$ always get $−1$'],
        answer: 'Its vertex order runs round the other way from the rest',
        wrong: [E('Trace $v₀ → v₃ → v₄$ and compare with $v₀ → v₁ → v₄$. Which way round does each go?')],
        right: [E('Right — the order of the vertices picks an orientation, and a minus sign turns it round.'), E('Next deck is north of the first.')],
      },
    ],
  },
  nothing: {
    blueprint: 'Nothing Left',
    arrive: [
      E('Here’s the rim you just made: $[v₀v₁] + [v₁v₂] + [v₂v₃] − [v₀v₃]$. It’s a boundary.'),
      E('Now cut it again. The Blade cuts an edge $[ab]$ into $b − a$. Cut every edge and watch the vertices.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Cut all four rim edges with the Blade', done: [G('Every vertex went back to zero.'), E('Each vertex is the end of one edge and the start of the next, so it gets $+1$ and $−1$.')] },
      {
        type: 'ask',
        question: 'You cut a boundary and got nothing. What does the book say about $∂∂$?',
        options: ['$∂∂ = 0$ for every chain', 'Only this rim happens to cancel', '$∂∂$ doubles every vertex'],
        answer: '$∂∂ = 0$ for every chain',
        wrong: [E('Would any boundary behave differently? A boundary always closes up.')],
        right: [E('$∂∂ = 0$, always: a boundary has no boundary. So every boundary is a cycle.'), E('Last deck is to the east.')],
      },
    ],
  },
  missing: {
    blueprint: 'The Missing Tile',
    arrive: [
      E('One tile is filled; the one beside it is missing. Edges only: each click sets an edge’s coefficient to $+1$, then $−1$, then $0$.'),
      E('Make a cycle — a chain with zero boundary at every vertex — that is not the boundary of anything here.'),
    ],
    early: [E('Not yet — finish the earlier deck first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Build a cycle that bounds nothing', done: [G('It goes round the missing tile.'), E('A cycle that isn’t a boundary — that’s a hole. It’s what homology counts.')] },
      {
        type: 'ask',
        question: 'What does $H₁$ = Ker ∂₁ / Im ∂₂ count?',
        options: ['Cycles, ignoring the ones that are boundaries', 'All the edges', 'The filled triangles'],
        answer: 'Cycles, ignoring the ones that are boundaries',
        wrong: [E('Ker ∂ is the cycles; Im ∂ is the boundaries. Dividing throws the boundaries away.')],
        right: [E('Exactly. Here $H₁ ≅ ℤ$: one hole.'), E('The gate’s open — south of the last deck.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your chains stay as they were. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A chain is a sum of simplices with integer coefficients. The boundary of a simplex drops each vertex in turn with alternating signs, ∂[v₀ … vₙ] = Σ (−1)ⁱ [v₀ … v̂ᵢ … vₙ], and ∂∂ = 0. Homology Hₙ = Ker ∂ₙ / Im ∂ₙ₊₁ keeps the cycles that are not boundaries — the holes.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 104–106 (simplicial homology).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

/** The edge chain on the Missing Tile deck: 'none' | 'open' (∂ ≠ 0) | 'boundary' | 'hole'. */
export function judgeCycle(edge) {
  if (isZeroChain(edge)) return 'none'
  if (!isZeroChain(d1(edge))) return 'open'
  const tri = d2({ '0-1-2': 1 })
  for (const k of [1, -1, 2, -2, 3, -3]) if (sameChain(edge, tri, k)) return 'boundary'
  return 'hole'
}
export const rimDone = (tri) => sameChain(d2(tri), RIM) || sameChain(d2(tri), RIM, -1)

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1), then back to the Blade (7).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every deck is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'first_cut') return [E('Equip the Blade (7) and click inside the triangle.')]
  if (current === 'shared') {
    const e = deckChains('shared', bag).edgeCoef
    const inside = ['0-4', '1-4', '2-4', '3-4'].filter((k) => e[k])
    if (inside.length) return [E(`The inside edge${inside.length > 1 ? 's' : ''} ${inside.map((k) => `$[v${k[0]}v${k[2]}]$`).join(', ')} still ${inside.length > 1 ? 'have' : 'has'} a coefficient. The two triangles on each side of an inside edge must cancel it — check which way round each one goes.`)]
    return [E('Click each triangle to set its coefficient. Inside edges must cancel.')]
  }
  if (current === 'nothing') return [E('Click each of the four rim edges with the Blade, and watch the totals on the vertices.')]
  const j = judgeCycle(bag.edge?.missing || {})
  if (j === 'open') return [E('A vertex still has a leftover — a cycle has zero boundary everywhere. Each vertex needs as much coming in as going out.')]
  if (j === 'boundary') return [E('That loop is the boundary of the filled tile. Go round the missing one instead.')]
  return [E('Pick edges that go round the missing tile, signs set so you can walk all the way round.')]
}

export { COMPLEXES }
