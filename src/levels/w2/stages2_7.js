/**
 * World 2 · Level 2-7 "Cell Block" — Cell Block.
 * Hatcher §2.2 pp. 137–149 — CW complexes built skeleton by skeleton; the cellular chain complex,
 * whose boundary d₂ on a 2-cell is read off its attaching word (the cellular boundary formula);
 * cellular homology equals singular homology (Theorem 2.35); and χ = Σ(−1)ⁿ cₙ = Σ(−1)ⁿ rank Hₙ
 * (Theorem 2.44).
 *
 * Cell-Smith (2): attach a cell; press "attach e²". Degree Dial (8): set a letter's coefficient in d₂.
 */
import { CELLS } from './CellBlockScene'

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['crates', 'torus', 'doubled', 'census']

export const OPENING = [
  E('The Cell Block. Here spaces come in crates: a $0$-cell is a point, a $1$-cell an edge, a $2$-cell a disk.'),
  E('You build a CW complex one dimension at a time — points first, then edges on the points, then disks on the edges.'),
  G('And then we count holes with way fewer pieces than triangles!'),
  E('Exactly. Cell-Smith on 2, Degree Dial on 8. First block is west.'),
]

const cellAsk = (id, extra) => ({
  type: 'action',
  hint: 'Set each letter’s coefficient with the Dial (8), then click “attach e²” with the Cell-Smith (2)',
  done: extra,
})

export const STATIONS = {
  crates: {
    blueprint: 'Crates',
    arrive: [
      E('Build a torus from crates: one $0$-cell, two $1$-cells $a$ and $b$, and one $2$-cell. Click a crate with the Cell-Smith to attach it.'),
      E('Mind the order. Each cell is glued along its edge onto what’s already there.'),
    ],
    early: [E('Not yet — finish the earlier block first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Attach all four crates in an order that works', done: [G('Point, two loops, then the disk folds it shut.'), E('Four cells: $χ = 1 − 2 + 1 = 0$. The Tile Yard’s torus needed six simplices for the same answer.')] },
      {
        type: 'ask',
        question: 'Why can’t the $2$-cell go on before both $1$-cells?',
        options: ['Its rim is glued along $aba⁻¹b⁻¹$, so $a$ and $b$ must already exist', '$2$-cells are always attached last of all', 'It would be too heavy'],
        answer: 'Its rim is glued along $aba⁻¹b⁻¹$, so $a$ and $b$ must already exist',
        wrong: [E('Where does the disk’s rim go when you attach it?')],
        right: [E('Each $n$-cell is attached to the $(n−1)$-skeleton. Next block is east.')],
      },
    ],
  },
  torus: {
    blueprint: 'The Torus',
    arrive: [
      E('The torus’ $2$-cell, with its rim word drawn on: $a$, $b$, $a$ backwards, $b$ backwards.'),
      E('Walk once round the rim, counter-clockwise from the bottom-left. For each letter, add $+1$ when the arrow goes your way and $−1$ when it doesn’t. That’s $d₂$.'),
    ],
    early: [E('Not yet — finish the earlier block first. Follow NEXT on the map.')],
    goals: [
      cellAsk('torus', [G('Zero and zero.'), E('$d₂ = 0$, so nothing is a boundary: $H₁ = ℤ²$ and $H₂ = ℤ$.')]),
      {
        type: 'ask',
        question: 'With $d₂ = 0$, what is $H₂$ of the torus?',
        options: ['$ℤ$ — the $2$-cell itself is a cycle', '$0$', '$ℤ²$'],
        answer: '$ℤ$ — the $2$-cell itself is a cycle',
        wrong: [E('$H₂ = $ Ker $d₂$. If $d₂$ is zero, what’s its kernel?')],
        right: [E('Right. Next block is north of the first.')],
      },
    ],
  },
  doubled: {
    blueprint: 'The Doubled Edge',
    arrive: [
      E('$ℝP²$: one $0$-cell, one $1$-cell $a$, and a $2$-cell whose rim runs along $a$ twice, the same way.'),
      E('Read $d₂$ off the rim and attach the cell.'),
    ],
    early: [E('Not yet — finish the earlier block first. Follow NEXT on the map.')],
    goals: [
      cellAsk('doubled', [G('Two.'), E('$d₂(e²) = 2a$. So $H₁ = ℤ / 2ℤ = ℤ₂$, and $H₂ = 0$.')]),
      {
        type: 'ask',
        question: 'Why is $H₁(ℝP²) = ℤ₂$?',
        options: ['The loop $a$ is a cycle, but $2a$ is a boundary', 'There are two $0$-cells', 'The disk has two sides'],
        answer: 'The loop $a$ is a cycle, but $2a$ is a boundary',
        wrong: [E('$H₁$ is cycles modulo boundaries. Which multiples of $a$ are boundaries?')],
        right: [E('Going round $a$ twice bounds the disk; once doesn’t. Last block is east.')],
      },
    ],
  },
  census: {
    blueprint: 'Census',
    arrive: [
      E('The Klein bottle: the torus’ square with one pair of arrows turned round. Rim word $a b a⁻¹ b$.'),
      E('Read $d₂$, attach the cell, and then check the census: cells against homology.'),
    ],
    early: [E('Not yet — finish the earlier block first. Follow NEXT on the map.')],
    goals: [
      cellAsk('census', [G('$a$ cancels, $b$ counts twice.'), E('$H₁ = ℤ ⊕ ℤ₂$, $H₂ = 0$. Cells: $1 − 2 + 1 = 0$. Ranks: $1 − 1 + 0 = 0$.')]),
      {
        type: 'ask',
        question: 'Theorem 2.44 says $χ = Σ(−1)ⁿ cₙ$ equals…',
        options: ['$Σ(−1)ⁿ$ rank $Hₙ$', '$Σ cₙ$', 'the number of holes'],
        answer: '$Σ(−1)ⁿ$ rank $Hₙ$',
        wrong: [E('You just checked it: $1 − 2 + 1$ against $1 − 1 + 0$.')],
        right: [E('So $χ$ depends only on the space, not on how you cut it into cells. The gate’s open — south of the last block.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your cells stay attached. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next block is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'A CW complex is built by attaching n-cells to the (n−1)-skeleton. Its cellular chains have one generator per cell, and the boundary of a 2-cell is read off its attaching word — giving H₁ = ℤ², ℤ₂, ℤ ⊕ ℤ₂ for the torus, ℝP² and Klein bottle. And χ = Σ(−1)ⁿ cₙ = Σ(−1)ⁿ rank Hₙ.',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 137–149 (cellular homology, Theorem 2.35; Euler characteristic, Theorem 2.44).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every block is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'crates') {
    const b = bag.built || {}
    if (!b.e0) return [E('Everything hangs off the point. Start with the $0$-cell.')]
    if (!b.a || !b.b) return [E('Edges next — both loops, $a$ and $b$.')]
    return [E('Now the $2$-cell, on the far side.')]
  }
  return [E(`Walk the rim once, counter-clockwise. Count each letter: $+1$ with the arrow, $−1$ against.${CELLS[current].letters.length > 1 ? ' Do $a$ and $b$ separately.' : ''}`)]
}
