/**
 * World 2 · Level 2-1 "Tile and Error" — Tile Yard.
 * Hatcher §2.1 pp. 102–104 — Δ-complexes: the torus, Klein bottle and ℝP² each from two
 * triangles, glued edge to edge with the arrows matching; every triangle's arrows must come from
 * an ordering of its vertices.
 *
 * Every station is the same square of two triangles (TileYardScene). The Cell Hammer turns an
 * arrow round; the press folds the square, gluing a to a and b to b, first vertex to first vertex.
 */
import { squareSurface } from './delta'
import { START_ARROWS } from './TileYardScene'

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['two_tri', 'torus_glue', 'flip_arrow', 'wrong_order']

export const OPENING = [
  G('Ten thousand lights on that sphere, Emmy. I counted loops round it and every one slid off.'),
  E('Loops only feel a hole they can wind round. A sphere’s hole is a hollow. To see it we need to count the pieces a place is made of, all of them.'),
  E('So we start where the Delta starts: the Tile Yard. Every island out here is triangles, glued along their edges.'),
  G('Glued how? Can I just stick any edge onto any edge?'),
  E('Only with the arrows matching. An edge’s arrow says which end comes first, and first goes onto first. Glue triangles that way and Hatcher calls it a Δ-complex.'),
  E('Hold the Cell Hammer, that’s 2, and click an arrow to turn it round. Click the gold press to fold the tiles. First yard is west of here; follow the NEXT ring on your map.'),
  E('The two little islands off the first yard, north-east and east, are commons. The east one has beasts. Go if you want the practice; the work doesn’t need them.'),
]

export const STATIONS = {
  two_tri: {
    blueprint: 'Two Triangles',
    target: 'square',
    arrive: [
      E('Two triangles. Each one has its own copy of the violet edge $c$. Glue them along $c$ and you get a square.'),
      E('Look at the arrows on the two copies, though. They point opposite ways, so the press would put a start on an end. Turn one round, then press.'),
    ],
    early: [E('Not this one yet. There’s an earlier yard to finish; follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make both copies of $c$ point the same way, then click the press', done: [G('Oh, they just slid together.'), E('First corner onto first corner, last onto last. Two triangles, one edge shared: a square.')] },
      {
        type: 'ask',
        question: 'Why did the two arrows on $c$ have to agree?',
        options: ['Gluing sends each edge’s first vertex onto the other’s first vertex', 'Edges can only be glued if they point north', 'The longer edge has to go on top'],
        answer: 'Gluing sends each edge’s first vertex onto the other’s first vertex',
        wrong: [E('What does an arrow actually record? Which end of the edge comes first.')],
        right: [E('Yes. In a Δ-complex every simplex has its corners in order, and gluing has to keep that order.'), E('Next yard is north. Follow the NEXT ring; we fold this square into a torus.')],
      },
    ],
  },
  torus_glue: {
    blueprint: 'The Torus',
    target: 'torus',
    arrive: [
      E('Now the outside edges. Both orange sides are called $a$, both blue sides are $b$. The press glues $a$ onto $a$ and $b$ onto $b$, arrows matching.'),
      E('Set the arrows so it folds into a torus. Or press it first and see what you get. I won’t tell.'),
    ],
    early: [E('Not this one yet. There’s an earlier yard to finish; follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Set the arrows so the square folds into a torus, then press', done: [G('A doughnut!'), E('Both $a$ arrows the same way, both $b$ arrows the same way. $a$ onto $a$ rolls a tube; $b$ onto $b$ bends the tube round and closes it.')] },
      {
        type: 'ask',
        question: 'After gluing, how many vertices does this torus have?',
        options: ['1', '2', '4'],
        answer: '1',
        wrong: [E('Follow the corners. Each gluing pulls two corners together. Where do all four end up?')],
        right: [E('One. So the torus is one vertex, three edges $a$, $b$, $c$, and two triangles. That’s the whole list, and it’s Hatcher’s torus.'), E('Next yard is north-east. Follow the NEXT ring.')],
      },
    ],
  },
  flip_arrow: {
    blueprint: 'Flip an Arrow',
    target: 'klein',
    arrive: [
      E('Same two tiles, set up as a torus again. Turn just one outside arrow round and press.'),
      G('One arrow? That’s it?'),
      E('That’s it. Make me a Klein bottle.'),
    ],
    early: [E('Not this one yet. There’s an earlier yard to finish; follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Fold the square into a Klein bottle', done: [G('It goes straight through itself!'), E('Only in our picture. The Klein bottle doesn’t cross itself. It just can’t be drawn in three dimensions without crossing.')] },
      {
        type: 'ask',
        question: 'The torus and the Klein bottle use the same two triangles. What makes them different?',
        options: ['One pair of matching arrows points opposite ways', 'The Klein bottle has an extra vertex', 'The Klein bottle’s diagonal is longer'],
        answer: 'One pair of matching arrows points opposite ways',
        wrong: [E('Count the pieces again: one vertex, three edges, two triangles, same as the torus. The only thing you touched was an arrow.')],
        right: [E('Same pieces, glued differently. So a list of pieces can’t be the whole story; how they’re glued matters. Last yard is east, on the NEXT ring.')],
      },
    ],
  },
  wrong_order: {
    blueprint: 'Wrong Order',
    target: 'rp2',
    arrive: [
      E('Twist both pairs and you get the projective plane, $ℝP²$. These arrows are already twisted. Press and see.'),
      E('If a triangle turns red, its three arrows chase each other round in a circle. Then no corner comes first, and it isn’t a simplex any more: a simplex needs its corners in order.'),
    ],
    early: [E('Not this one yet. There’s an earlier yard to finish; follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Fold an ℝP² whose triangles both have a first vertex', done: [G('Got it. Neither triangle’s red.'), E('Both pairs twisted, and every triangle still has a first, second and third corner. That’s Hatcher’s $ℝP²$.')] },
      {
        type: 'ask',
        question: 'How many vertices does this $ℝP²$ have?',
        options: ['1', '2', '3'],
        answer: '2',
        wrong: [E('Follow the corners again. With both pairs twisted, the four corners fall into two groups, not one.')],
        right: [E('Two vertices, three edges, two triangles. Count them with alternating signs and $χ = 2 − 3 + 2 = 1$; the torus gave $χ = 0$.'), E('At the Cell Block we’ll see $χ$ can’t change however you cut a place. Then different numbers really do mean different places.'), E('That’s the yard. The gate is north of this one. Somewhere past it, those lights are waiting to be counted.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back, Gyroid. Your tiles are just as you left them. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next yard is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A Δ-complex is built from simplices — points, edges, triangles, … — each with its vertices in order, glued face to face by maps that keep that order. Two triangles make a torus, a Klein bottle or ℝP², depending only on which way the edge arrows match.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 102–104 (Δ-complexes).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  const check = current && current !== 'two_tri' ? squareSurface(bag?.arrows?.[current] || START_ARROWS[current]) : null
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1), then we get back to the tiles.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every yard’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'two_tri') return [E('Both violet arrows sit on the same edge $c$. Click one with the Cell Hammer (2) so they agree, then click the press.')]
  if (current === 'torus_glue') return [E('For a torus, the two orange $a$ arrows point the same way, and so do the two blue $b$ arrows.')]
  if (current === 'flip_arrow') return [E('One pair the same way, the other pair opposite. Turn one outside arrow round and leave everything else alone.')]
  if (check?.lowerCyclic || check?.upperCyclic)
    return [E('A red triangle’s arrows chase each other round, so no corner comes first. Turning $c$ only moves the problem to the other triangle. Turn a whole pair of outside arrows instead, keeping them twisted.')]
  return [E('Both pairs twisted, and no triangle whose arrows go round in a circle.')]
}
