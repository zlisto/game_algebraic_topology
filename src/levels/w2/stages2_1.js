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
  E('The grey is already in the Delta, Gyroid. Null’s sphere is folding, and no loop can prove it shouldn’t. So we learn to count with triangles.'),
  E('The Tile Yard. Out here every space is built from triangles — simplices — glued along their edges.'),
  G('Glued how? Can I just stick any edge to any edge?'),
  E('Only edge to edge with the arrows matching: an edge’s first vertex goes onto the other edge’s first vertex. Hatcher calls the result a Δ-complex.'),
  E('Click an arrow with the Cell Hammer (2) to turn it round. Click the gold press to fold the tiles up. The first yard is to the west.'),
]

export const STATIONS = {
  two_tri: {
    blueprint: 'Two Triangles',
    target: 'square',
    arrive: [
      E('Two triangles, each with its own copy of the violet edge $c$. Glue them along it and you get a square.'),
      E('But look at the arrows on the two copies. They point opposite ways. Turn one round, then press.'),
    ],
    early: [E('Not yet — finish the earlier yard first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make both copies of $c$ point the same way, then click the press', done: [G('They slid right together!'), E('Matching arrows: first corner onto first corner, last onto last. That’s a square.')] },
      {
        type: 'ask',
        question: 'Why did the two arrows on $c$ have to agree?',
        options: ['Gluing sends each edge’s first vertex onto the other’s first vertex', 'Edges can only be glued if they point north', 'The longer edge has to go on top'],
        answer: 'Gluing sends each edge’s first vertex onto the other’s first vertex',
        wrong: [E('Think about what the arrow records: which end of the edge comes first.')],
        right: [E('Right. In a Δ-complex the vertices come in order, and gluing keeps the order.'), E('Next yard, east along the causeway: fold this square into a torus.')],
      },
    ],
  },
  torus_glue: {
    blueprint: 'The Torus',
    target: 'torus',
    arrive: [
      E('Now the outside edges. The two orange sides are both $a$; the two blue sides are both $b$. The press glues $a$ to $a$ and $b$ to $b$.'),
      E('Make this fold into a torus. Try the press first if you like — see what you get.'),
    ],
    early: [E('Not yet — finish the earlier yard first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Set the arrows so the square folds into a torus, then press', done: [G('A doughnut!'), E('Both $a$ arrows the same way, both $b$ arrows the same way. Roll $a$ to $a$ into a tube, then $b$ to $b$ closes it into a ring.')] },
      {
        type: 'ask',
        question: 'After gluing, how many vertices does this torus have?',
        options: ['1', '2', '4'],
        answer: '1',
        wrong: [E('Follow the corners: the gluing sends all four corners of the square to the same point.')],
        right: [E('One vertex, three edges $a$, $b$, $c$, two triangles. That’s Hatcher’s torus.'), E('Next yard is north of the first one.')],
      },
    ],
  },
  flip_arrow: {
    blueprint: 'Flip an Arrow',
    target: 'klein',
    arrive: [
      E('Same tiles, set up as a torus. Turn just one arrow round and press, and see what happens.'),
      G('Just one?'),
      E('Make me a Klein bottle.'),
    ],
    early: [E('Not yet — finish the earlier yard first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Fold the square into a Klein bottle', done: [G('It goes through itself!'), E('Only in our three-dimensional picture. The Klein bottle itself doesn’t cross itself; it just won’t fit in 3D without doing so.')] },
      {
        type: 'ask',
        question: 'The torus and the Klein bottle use the same two triangles. What makes them different?',
        options: ['One pair of matching arrows points opposite ways', 'The Klein bottle has an extra vertex', 'The Klein bottle’s diagonal is longer'],
        answer: 'One pair of matching arrows points opposite ways',
        wrong: [E('Count again: one vertex, three edges, two triangles, same as the torus. Only the arrows changed.')],
        right: [E('Exactly — same pieces, different gluing. Last yard is to the east.')],
      },
    ],
  },
  wrong_order: {
    blueprint: 'Wrong Order',
    target: 'rp2',
    arrive: [
      E('Twist both pairs and you get the projective plane, $ℝP²$. These arrows are already twisted — press and see.'),
      E('If a triangle turns red, its arrows run round in a circle. Then no corner comes first, so it isn’t a simplex with ordered vertices.'),
    ],
    early: [E('Not yet — finish the earlier yard first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Fold an ℝP² whose triangles both have a first vertex', done: [G('Got it — and neither triangle is red.'), E('That’s Hatcher’s ℝP²: both pairs twisted, with an order on every triangle.')] },
      {
        type: 'ask',
        question: 'How many vertices does this $ℝP²$ have?',
        options: ['1', '2', '3'],
        answer: '2',
        wrong: [E('Follow the corners again. With both pairs twisted, the corners fall into two groups.')],
        right: [E('Two vertices, three edges, two triangles. $χ = 2 − 3 + 2 = 1$, while the torus had $χ = 0$.'), E('The gate’s open — south of the last yard.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your tiles stay as they were. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next yard is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A Δ-complex is built from simplices — points, edges, triangles, … — each with its vertices in order, glued face to face by maps that keep that order. Two triangles make a torus, a Klein bottle or ℝP², depending only on which way the edge arrows match.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 102–104 (Δ-complexes).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  const check = current && current !== 'two_tri' ? squareSurface(bag?.arrows?.[current] || START_ARROWS[current]) : null
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1), then get back to the tiles.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every yard is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'two_tri') return [E('The two violet arrows sit on the same edge $c$. Click one with the Cell Hammer so they agree, then click the press.')]
  if (current === 'torus_glue') return [E('For a torus, the two orange $a$ arrows must point the same way, and so must the two blue $b$ arrows.')]
  if (current === 'flip_arrow') return [E('One pair the same way, the other pair opposite. Turn one outside arrow round, nothing else.')]
  if (check?.lowerCyclic || check?.upperCyclic)
    return [E('A red triangle’s arrows chase each other in a circle. Turning $c$ round just moves the problem to the other triangle — turn a whole pair of outside arrows instead, keeping them twisted.')]
  return [E('Both pairs twisted, and no triangle whose arrows go round in a circle.')]
}
