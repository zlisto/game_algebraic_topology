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
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['settle', 'table']

export const OPENING = [
  N('Sit a moment, Gyroid. She always stopped on the last landing before the climb home. Said the view was worth the ache.'),
  G('…'),
  E('Don’t answer him. Not here.'),
  G('I wasn’t going to.'),
  E('Stable Ground. On the Landing, lifting a map one dimension sometimes changed its group. Up here it stops changing. The numbers settle.'),
  E('The wall is Hatcher’s table of sphere groups. Each row is a stem: fix $k$ and read $πₙ₊ₖ(Sⁿ)$ as $n$ goes from $2$ to $6$.'),
  E('Sling’s on 4. First station’s north-west; follow the NEXT ring. Two commons off it, north-east and east. Beasts on the east one.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  settle: {
    blueprint: 'Settle',
    arrive: [
      E('Moving one tile right along a row is one suspension: a map $Sⁿ⁺ᵏ → Sⁿ$ slung up to $Sⁿ⁺ᵏ⁺¹ → Sⁿ⁺¹$.'),
      E('Freudenthal says that step is an isomorphism once the sphere is big enough compared with the stem: $n ≥ k + 2$. For each stem, mark the first tile where that kicks in. Click it with the Sling.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Mark where each of the four stems settles', [
        G('Stem $0$ at $n = 2$, stem $1$ at $3$… each one settles a step later than the one before.'),
        E('Because the condition is $n ≥ k + 2$. It’s the same as $i = n + k < 2n − 1$, the range you learned on the Landing, written for a stem.'),
      ]),
      {
        type: 'ask',
        question: 'Stem 3 is $ℤ₂$, $ℤ₁₂$, $ℤ × ℤ₁₂$, then $ℤ₂₄$, $ℤ₂₄$. Why does it keep changing at first?',
        options: ['Below $n = k + 2$ the suspension needn’t be an isomorphism', 'The table is wrong', 'Stems never settle'],
        answer: 'Below $n = k + 2$ the suspension needn’t be an isomorphism',
        wrong: [E('Freudenthal only promises an isomorphism inside its range. Where does stem $3$’s range start?')],
        right: [E('Right. Before $n = 5$ nothing’s promised, and the group jumps about. Now write down where each stem ends up. Next station’s north, on the NEXT ring.')],
      },
    ],
  },
  table: {
    blueprint: 'The Table',
    arrive: [
      E('Once a stem settles, its value is the same however high you go. That value is the stable homotopy group, $πₖˢ$.'),
      E('Set each stem’s stable value on the pedestals to the right. Click a pedestal with the Sling to change it.'),
    ],
    early: [E('Not yet. Finish the station before this one; NEXT on your map points the way.')],
    goals: [
      act('Set all four stable values', [
        G('$ℤ$, $ℤ₂$, $ℤ₂$, $ℤ₂₄$.'),
        E('Stem $0$ is degree, $ℤ$. Stem $1$ is the Hopf map, slung up until it’s $ℤ₂$. Further out the stems get wild. Nobody knows them all.'),
        G('Nothing’s moved since we walked in. I keep waiting for it to.'),
        E('Up here it won’t. Remember what that’s like. The top won’t be this kind.'),
      ]),
      {
        type: 'ask',
        question: 'What is the stable group $π₃ˢ$?',
        options: ['$ℤ₂₄$', '$ℤ₁₂$', '$ℤ × ℤ₁₂$'],
        answer: '$ℤ₂₄$',
        wrong: [E('Read stem $3$ at its right-hand end, where it has stopped changing.')],
        right: [E('$ℤ₂₄$. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your marks are still there. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Along each stem πₙ₊ₖ(Sⁿ), the suspension is an isomorphism once n ≥ k + 2 (Freudenthal), so the groups settle to the stable homotopy groups πₖˢ: ℤ, ℤ₂, ℤ₂, ℤ₂₄ for k = 0, 1, 2, 3.',
  cite: 'Hatcher, Algebraic Topology, table of πᵢ(Sⁿ), p. 339; §4.2 pp. 360–364.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this conversation first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash them (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every stem’s settled. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'settle') return [E('In stem $k$, click the tile with $n = k + 2$.')]
  return [E('Each pedestal cycles through $0$, $ℤ$, $ℤ₂$, $ℤ₁₂$, $ℤ₂₄$. Match the right-hand end of each row.')]
}
