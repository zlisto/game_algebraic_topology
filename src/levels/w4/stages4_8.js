/**
 * World 4 · Level 4-8 "Stable Ground" — Stable Ground.
 * Hatcher, the table of πᵢ(Sⁿ) at the opening of Chapter 4 (p. 339) and §4.2 pp. 360–364: by
 * Freudenthal, the stem πₙ₊ₖ(Sⁿ) stops changing once n ≥ k + 2; its common value is the stable
 * homotopy group πₖˢ. The first four: ℤ, ℤ₂, ℤ₂, ℤ₂₄.
 *
 * Suspension Sling (4): mark where a stem settles; set a stem's stable value.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['settle', 'table']

export const OPENING = [
  E('Stable Ground. Up here, suspending changes nothing — the numbers settle.'),
  G('First calm place in four worlds.'),
  E('The wall shows Hatcher’s table: stem $k$ in each row, $πₙ₊ₖ(Sⁿ)$ for $n = 2$ to $6$ across. Sling on 4.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  settle: {
    blueprint: 'Settle',
    arrive: [E('For each stem, mark the first tile where Freudenthal says the suspensions are all isomorphisms from then on. Click it with the Sling.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Mark where each of the four stems settles', [G('Each stem settles one step later than the one before.'), E('$n ≥ k + 2$: that’s $i = n + k < 2n − 1$, the Freudenthal range.')]),
      {
        type: 'ask',
        question: 'Stem 3 is $ℤ₂$, $ℤ₁₂$, $ℤ × ℤ₁₂$, then $ℤ₂₄$, $ℤ₂₄$. Why does it keep changing at first?',
        options: ['Below $n = k + 2$ the suspension needn’t be an isomorphism', 'The table is wrong', 'Stems never settle'],
        answer: 'Below $n = k + 2$ the suspension needn’t be an isomorphism',
        wrong: [E('Freudenthal only promises isomorphisms in its range.')],
        right: [E('Right. Next: write down the stable values.')],
      },
    ],
  },
  table: {
    blueprint: 'The Table',
    arrive: [E('Set each stem’s stable value — $πₖˢ$ — on the pedestals to the right. Click a pedestal with the Sling to change it.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Set all four stable values', [G('$ℤ$, $ℤ₂$, $ℤ₂$, $ℤ₂₄$.'), E('The stable homotopy groups of spheres. Nobody knows them all — but the first few are on our wall.')]),
      {
        type: 'ask',
        question: 'What is the stable group $π₃ˢ$?',
        options: ['$ℤ₂₄$', '$ℤ₁₂$', '$ℤ × ℤ₁₂$'],
        answer: '$ℤ₂₄$',
        wrong: [E('Read the stable end of stem 3.')],
        right: [E('Stable ground. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your marks stay. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Along each stem πₙ₊ₖ(Sⁿ), the suspension is an isomorphism once n ≥ k + 2 (Freudenthal), so the groups settle to the stable homotopy groups πₖˢ: ℤ, ℤ₂, ℤ₂, ℤ₂₄ for k = 0, 1, 2, 3.',
  cite: 'Hatcher, Algebraic Topology, table of πᵢ(Sⁿ), p. 339; §4.2 pp. 360–364.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Stable ground reached. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'settle') return [E('In stem $k$, click the tile with $n = k + 2$.')]
  return [E('Each pedestal cycles through $0$, $ℤ$, $ℤ₂$, $ℤ₁₂$, $ℤ₂₄$. Match the right-hand end of each row.')]
}
