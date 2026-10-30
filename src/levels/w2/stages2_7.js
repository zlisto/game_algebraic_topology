/**
 * World 2 · Level 2-7 "Cell Block" — Cell Block.
 * Hatcher §2.2 pp. 137–149 — CW complexes built skeleton by skeleton; the cellular chain complex,
 * whose boundary d₂ on a 2-cell is read off its attaching word (the cellular boundary formula);
 * cellular homology equals singular homology (Theorem 2.35); and χ = Σ(−1)ⁿ cₙ = Σ(−1)ⁿ rank Hₙ
 * (Theorem 2.44).
 *
 * Cell Hammer (2): attach a cell; press "attach e²". Degree Dial (8): set a letter's coefficient in d₂.
 */
import { CELLS } from './CellBlockScene'

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['crates', 'torus', 'doubled', 'census']

export const OPENING = [
  E('The Cell Block. Here places come in crates. A $0$-cell is a point, a $1$-cell is an edge, a $2$-cell is a disk.'),
  E('You build one dimension at a time: points first, then edges with their ends on the points, then disks with their rims glued onto the edges. Hatcher calls that a CW complex.'),
  G('Why bother, if triangles work?'),
  E('Because in triangles the torus took six pieces, and in crates it takes four. Fewer pieces, the same holes. That’s how we worked at the Foundry. He could build a torus in four moves without looking.'),
  E('Cell Hammer on 2, Degree Dial on 8. First block is north-west; follow the NEXT ring. Two commons with beasts sit east and north-west of it.'),
]

const cellAsk = (id, extra) => ({
  type: 'action',
  hint: 'Set each letter’s coefficient with the Dial (8), then click “attach e²” with the Cell Hammer (2)',
  done: extra,
})

export const STATIONS = {
  crates: {
    blueprint: 'Crates',
    arrive: [
      E('Build a torus from crates: one $0$-cell, two $1$-cells $a$ and $b$, and one $2$-cell. Click a crate with the Cell Hammer to attach it.'),
      E('Mind the order. Each cell gets glued along its edge onto what’s already standing.'),
    ],
    early: [E('Not this block yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Attach all four crates in an order that works', done: [G('Point, two loops, and then the disk folds it shut.'), E('Four cells: $χ = 1 − 2 + 1 = 0$. The Tile Yard needed six simplices for the same torus and the same answer.')] },
      {
        type: 'ask',
        question: 'Why can’t the $2$-cell go on before both $1$-cells?',
        options: ['Its rim is glued along $aba⁻¹b⁻¹$, so $a$ and $b$ must already exist', '$2$-cells are always attached last of all', 'It would be too heavy'],
        answer: 'Its rim is glued along $aba⁻¹b⁻¹$, so $a$ and $b$ must already exist',
        wrong: [E('When you attach the disk, where does its rim go?')],
        right: [E('Right. Every $n$-cell is glued onto the cells below it, the $(n−1)$-skeleton. Next block is north-east, on the NEXT ring.')],
      },
    ],
  },
  torus: {
    blueprint: 'The Torus',
    arrive: [
      E('Cellular chains work like the Marsh: one generator per cell. Both loops start and end at the one point, so their boundaries are $0$. The only real work is $d₂$, the boundary of the disk.'),
      E('Here’s the torus disk with its rim word drawn on: $a$, $b$, $a$ backwards, $b$ backwards.'),
      E('Walk once round the rim, counter-clockwise from the bottom-left. For each letter, $+1$ every time its arrow goes your way, $−1$ every time it doesn’t. Those totals are $d₂$.'),
      E('Hold the Degree Dial (8) and click a letter’s lever to step its number. Then switch to the Cell Hammer (2) and click the press to attach the disk.'),
    ],
    early: [E('Not this block yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      cellAsk('torus', [G('Zero and zero.'), E('$d₂ = 0$. So nothing is a boundary, and both loops survive: $H₁ = ℤ²$. And the disk itself has zero boundary, so it’s a cycle: $H₂ = ℤ$.')]),
      {
        type: 'ask',
        question: 'With $d₂ = 0$, what is $H₂$ of the torus?',
        options: ['$ℤ$ — the $2$-cell itself is a cycle', '$0$', '$ℤ²$'],
        answer: '$ℤ$ — the $2$-cell itself is a cycle',
        wrong: [E('$H₂ = $ Ker $d₂$: the $2$-chains with zero boundary. If $d₂$ is zero, which ones are those?')],
        right: [E('Right. Hatcher proves this cell count gives the same homology as the singular one, Theorem 2.35, so four cells is enough.'), E('Next block is north-west, on the NEXT ring.')],
      },
    ],
  },
  doubled: {
    blueprint: 'The Doubled Edge',
    arrive: [
      E('$ℝP²$: one $0$-cell, one $1$-cell $a$, and a $2$-cell whose rim runs round $a$ twice, the same way both times.'),
      E('Read $d₂$ off the rim and attach the cell.'),
    ],
    early: [E('Not this block yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      cellAsk('doubled', [G('Two.'), E('$d₂(e²) = 2a$. So $2a$ is a boundary, but $a$ isn’t: $H₁ = ℤ / 2ℤ = ℤ₂$. And the disk’s boundary isn’t $0$, so it isn’t a cycle: $H₂ = 0$.')]),
      {
        type: 'ask',
        question: 'Why is $H₁(ℝP²) = ℤ₂$?',
        options: ['The loop $a$ is a cycle, but $2a$ is a boundary', 'There are two $0$-cells', 'The disk has two sides'],
        answer: 'The loop $a$ is a cycle, but $2a$ is a boundary',
        wrong: [E('$H₁$ is cycles with the boundaries thrown away. Which multiples of $a$ are boundaries?')],
        right: [E('Going round $a$ twice is the edge of the disk, so it counts as nothing. Once round isn’t. Last block is north-east, on the NEXT ring.')],
      },
    ],
  },
  census: {
    blueprint: 'Census',
    arrive: [
      E('The Klein bottle: the torus square with one pair of arrows turned round. Rim word $a b a⁻¹ b$.'),
      E('Read $d₂$, attach the cell, then check the census: count the cells, count the homology, compare.'),
    ],
    early: [E('Not this block yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      cellAsk('census', [G('$a$ cancels. $b$ counts twice.'), E('$d₂ = 2b$. So $H₁ = ℤ ⊕ ℤ₂$, $a$ free and $b$ only up to doubles, and $H₂ = 0$. Cells: $1 − 2 + 1 = 0$. Ranks of homology: $1 − 1 + 0 = 0$.')]),
      {
        type: 'ask',
        question: 'Theorem 2.44 says $χ = Σ(−1)ⁿ cₙ$ equals…',
        options: ['$Σ(−1)ⁿ$ rank $Hₙ$', '$Σ cₙ$', 'the number of holes'],
        answer: '$Σ(−1)ⁿ$ rank $Hₙ$',
        wrong: [E('You just checked it: $1 − 2 + 1$ against $1 − 1 + 0$. The rank counts copies of $ℤ$; the $ℤ₂$ doesn’t count.')],
        right: [E('So $χ$ belongs to the place, not to how you cut it up. Triangles, crates, anything. The gate’s north of this block.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your cells are still attached. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next block is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A CW complex is built by attaching n-cells to the (n−1)-skeleton. Its cellular chains have one generator per cell, and the boundary of a 2-cell is read off its attaching word — giving H₁ = ℤ², ℤ₂, ℤ ⊕ ℤ₂ for the torus, ℝP² and Klein bottle. And χ = Σ(−1)ⁿ cₙ = Σ(−1)ⁿ rank Hₙ.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 137–149 (cellular homology, Theorem 2.35; Euler characteristic, Theorem 2.44).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every block’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'crates') {
    const b = bag.built || {}
    if (!b.e0) return [E('Everything hangs off the point. Start with the $0$-cell.')]
    if (!b.a || !b.b) return [E('Edges next. Both loops, $a$ and $b$.')]
    return [E('Now the $2$-cell, on the far side.')]
  }
  return [E(`Walk the rim once, counter-clockwise. For each letter: $+1$ with the arrow, $−1$ against.${CELLS[current].letters.length > 1 ? ' Count $a$ and $b$ separately.' : ''}`)]
}
