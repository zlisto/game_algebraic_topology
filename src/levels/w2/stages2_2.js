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
  E('Cancel Marsh. In the Yard we built places out of triangles. Here we add the triangles up.'),
  G('Add them? Like, one triangle plus one triangle?'),
  E('Yes, exactly that. A chain is a list of edges, or triangles, each with a whole number in front: $2[v₀v₁] − [v₁v₂]$ means edge $v₀v₁$ twice, and edge $v₁v₂$ once the wrong way.'),
  E('And this is the Boundary Blade. It takes any chain to its boundary, its edge. He named it after me, back when we still made jokes about our work.'),
  G('He. You mean Null.'),
  E('Equip it with 7. First deck is north-west; follow the NEXT ring. The two islands east and north-east of it are commons, beasts and all, if you want them.'),
]

export const STATIONS = {
  first_cut: {
    blueprint: 'First Cut',
    arrive: [
      E('One triangle, $[v₀v₁v₂]$. Each edge’s arrow points from the lower-numbered corner to the higher one, same rule as the Yard.'),
      E('Cut the triangle with the Blade and watch which edges come out, and with what signs.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Click the triangle with the Boundary Blade (7)', done: [G('Two edges came out plus, and one came out minus?'), E('Walk round it, $v₀ → v₁ → v₂ → v₀$. You go along $[v₀v₁]$ and $[v₁v₂]$ with their arrows, but along $[v₀v₂]$ against it. Against the arrow counts minus.')] },
      {
        type: 'ask',
        question: 'So what is $∂[v₀v₁v₂]$?',
        options: ['$[v₁v₂] − [v₀v₂] + [v₀v₁]$', '$[v₀v₁] + [v₁v₂] + [v₀v₂]$', '$[v₀v₁] − [v₁v₂]$'],
        answer: '$[v₁v₂] − [v₀v₂] + [v₀v₁]$',
        wrong: [E('Read the badges on the three edges again. Two plus, one minus. Which one was minus?')],
        right: [E('That’s it. Hatcher writes it as: drop each corner in turn and alternate the signs, $∂[v₀ … vₙ] = Σ (−1)ⁱ [v₀ … v̂ᵢ … vₙ]$. For an edge it gives $∂[ab] = b − a$, end minus start.'), E('Next deck is north-west again, on the NEXT ring.')],
      },
    ],
  },
  shared: {
    blueprint: 'Shared Edges',
    arrive: [
      E('Four triangles round the middle point $v₄$. Each Blade click sets a triangle’s number: $+1$, then $−1$, then $0$.'),
      E('Every inside edge belongs to two triangles, so it gets two terms in the boundary. Make a chain whose boundary is only the outside rim: every inside edge has to cancel to zero.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Choose coefficients so only the rim is left', done: [G('All the inside edges cancelled!'), E('On each inside edge, one triangle walks it one way and its neighbour walks it the other. $+1$ and $−1$: nothing. Only the rim has nobody on the other side.')] },
      {
        type: 'ask',
        question: 'Why did $[v₀v₃v₄]$ need the opposite sign from the other three?',
        options: ['Its vertex order runs round the other way from the rest', 'It is bigger than the others', 'Triangles touching $v₀$ always get $−1$'],
        answer: 'Its vertex order runs round the other way from the rest',
        wrong: [E('Trace $v₀ → v₃ → v₄$, then $v₀ → v₁ → v₄$. Which way round does each one go?')],
        right: [E('Right. The order of the corners picks a direction round the triangle, and a minus sign turns it round. With all four going the same way, the inside edges cancel.'), E('Next deck is north, on the NEXT ring.')],
      },
    ],
  },
  nothing: {
    blueprint: 'Nothing Left',
    arrive: [
      E('Here’s the rim you just made: $[v₀v₁] + [v₁v₂] + [v₂v₃] − [v₀v₃]$. It’s the boundary of your four triangles, so it’s a boundary.'),
      E('Now cut it again. The Blade cuts an edge $[ab]$ into $b − a$, its end minus its start. Cut all four edges and watch the numbers on the corners.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Cut all four rim edges with the Blade', done: [G('Every corner went back to zero.'), E('Each corner is where one edge ends ($+1$) and the next one starts ($−1$). The rim closes up, so every corner cancels.')] },
      {
        type: 'ask',
        question: 'You cut a boundary and got nothing. What does the book say about $∂∂$?',
        options: ['$∂∂ = 0$ for every chain', 'Only this rim happens to cancel', '$∂∂$ doubles every vertex'],
        answer: '$∂∂ = 0$ for every chain',
        wrong: [E('Could any boundary fail to close up? Think about what an edge of a filled-in shape looks like.')],
        right: [E('$∂∂ = 0$, always. The edge of a filled shape is a closed loop, and a closed loop has no ends.'), E('A chain with zero boundary is called a cycle. So every boundary is a cycle. The real question is the other way round. Last deck is north-east.')],
      },
    ],
  },
  missing: {
    blueprint: 'The Missing Tile',
    arrive: [
      E('Two triangles of marsh. One tile is filled in; the one beside it is missing, open water. Edges only here: each click sets an edge’s number to $+1$, then $−1$, then $0$.'),
      E('Build a cycle, a loop of edges where every corner cancels, that is not the boundary of anything on this deck.'),
    ],
    early: [E('Not this deck yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Build a cycle that bounds nothing', done: [G('It goes round the missing tile.'), E('A loop with no ends, and no triangle here whose edge it is. That’s a hole. Holes are what homology counts.')] },
      {
        type: 'ask',
        question: 'What does $H₁$ = Ker ∂₁ / Im ∂₂ count?',
        options: ['Cycles, ignoring the ones that are boundaries', 'All the edges', 'The filled triangles'],
        answer: 'Cycles, ignoring the ones that are boundaries',
        wrong: [E('Ker ∂ is everything with zero boundary: the cycles. Im ∂ is everything that’s the edge of something: the boundaries. Dividing throws the boundaries away.')],
        right: [E('Yes. The loop round the filled tile is a boundary, so it counts as nothing. The loop round the missing one survives, and so do its multiples: $H₁ ≅ ℤ$, one hole.'), E('That’s homology, Gyroid. You can count a hollow now, or you will soon. The gate’s north of this deck.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your chains are as you left them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next deck is ${name}. Follow the NEXT ring on your map.`),
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
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1), then back to the Blade (7).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every deck’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'first_cut') return [E('Equip the Blade (7) and click inside the triangle.')]
  if (current === 'shared') {
    const e = deckChains('shared', bag).edgeCoef
    const inside = ['0-4', '1-4', '2-4', '3-4'].filter((k) => e[k])
    if (inside.length) return [E(`The inside edge${inside.length > 1 ? 's' : ''} ${inside.map((k) => `$[v${k[0]}v${k[2]}]$`).join(', ')} still ${inside.length > 1 ? 'have' : 'has'} a number on. The two triangles either side have to walk it opposite ways. Check which way round each one goes.`)]
    return [E('Click each triangle to set its number. Every inside edge has to cancel.')]
  }
  if (current === 'nothing') return [E('Click each of the four rim edges with the Blade and watch the totals on the corners.')]
  const j = judgeCycle(bag.edge?.missing || {})
  if (j === 'open') return [E('A corner still has something left over, so that’s not a cycle yet. Every corner needs as much coming in as going out.')]
  if (j === 'boundary') return [E('That loop is the edge of the filled tile, so it’s a boundary: it counts as nothing. Go round the missing tile instead.')]
  return [E('Pick edges that go round the missing tile, with signs set so you can walk all the way round without turning back.')]
}

export { COMPLEXES }
