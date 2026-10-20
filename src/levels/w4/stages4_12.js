/**
 * World 4 · Level 4-12 "Obstruction Course".
 * Hatcher §4.3 pp. 415–419 — the extension problem: given a CW pair (W, A) and a map A → X, does it
 * extend to W? Lemma 4.7: yes if πₙ(X) = 0 whenever W − A has (n+1)-cells. Proposition 4.72: at each
 * stage the lift exists iff the obstruction ωₙ ∈ Hⁿ⁺¹(W, A; πₙX) vanishes. Corollary 4.73: if all those
 * groups are 0 (X abelian), every map A → X extends. The reroute station uses the cellular picture
 * Hatcher points to in [VBKT]; it goes slightly beyond the text.
 *
 * Cell-Smith (2): extend over cells, open doors. Cup Caster (9): read obstructions, twist cells.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['cell', 'blocked', 'reroute', 'summit']

export const OPENING = [
  E('The Obstruction Course — the top of the Spire. One question: given a map on $A$, can it extend over all of $W$?'),
  E('Go one cell at a time. When a cell won’t take the map, what blocks it is a cohomology class: the obstruction.'),
  G('So even the walls are readings.'),
  E('Cell-Smith on 2, Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  cell: {
    blueprint: 'Cell by Cell',
    arrive: [E('A map $A → S²$, and $W$ is $A$ plus cells. An $(n+1)$-cell extends if its boundary map $Sⁿ → S²$ is nullhomotopic — always, when $πₙ(S²) = 0$. Cell-Smith the cells that are safe.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Extend over every cell whose boundary lands in a zero group', [G('The $3$-cell’s boundary lands in $π₂(S²) = ℤ$. Not safe.'), E('Lemma 4.7: extensions exist if $πₙ(X) = 0$ for every $(n+1)$-cell of $W − A$.')]),
      {
        type: 'ask',
        question: 'Lemma 4.7 guarantees an extension over the $(n+1)$-cells when…',
        options: ['$πₙ(X) = 0$', '$Hₙ(X) ≠ 0$', '$X$ is a sphere'],
        answer: '$πₙ(X) = 0$',
        wrong: [E('The boundary of an $(n+1)$-cell is an $Sⁿ$. Where does its map live?')],
        right: [E('Right. Now the $3$-cells.')],
      },
    ],
  },
  blocked: {
    blueprint: 'Blocked',
    arrive: [E('Three $3$-cells. Each boundary is a map $S² → S²$: a degree, an element of $π₂(S²) = ℤ$. That number is the obstruction on the cell. Read them with the Caster; extend only where it’s $0$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Read all three; extend where ω = 0', [G('Degree $0$ fills in. Degree $2$ and $−1$ don’t.'), E('Proposition 4.72: the lift exists iff the obstruction $ωₙ ∈ Hⁿ⁺¹(W, A; πₙX)$ is zero.')]),
      {
        type: 'ask',
        question: 'Proposition 4.72: the next stage extends exactly when…',
        options: ['the obstruction $ωₙ = 0$', '$W$ is a disk', 'every cell has dimension $2$'],
        answer: 'the obstruction $ωₙ = 0$',
        wrong: [E('Which cells filled in?')],
        right: [E('Right. But an obstruction is a class — not just numbers on cells.')],
      },
    ],
  },
  reroute: {
    blueprint: 'Reroute',
    arrive: [E('Two $3$-cells $A$ and $B$ share a $2$-cell. Twist the map on it by $k ∈ π₂$, and $A$’s obstruction moves by $+k$, $B$’s by $−k$ — a coboundary. Clear both if you can. If you can’t, declare the class nonzero.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Clear the obstructions, or declare the class nonzero', [G('The sum never moved.'), E('Rerouting lower cells changes the cochain by a coboundary. What survives is the class — and that’s the real obstruction.')]),
      {
        type: 'ask',
        question: 'Changing the map on lower cells changes the obstruction cochain by…',
        options: ['a coboundary — the class stays put', 'anything you like', 'nothing at all'],
        answer: 'a coboundary — the class stays put',
        wrong: [E('$+k$ here, $−k$ there. What didn’t change?')],
        right: [E('One floor left. The summit.')],
      },
    ],
  },
  summit: {
    blueprint: 'The Summit',
    arrive: [E('Four doors, four extension problems. Corollary 4.73: if every $Hⁿ⁺¹(W, A; πₙX)$ is $0$, every map $A → X$ extends. Open only the doors that are guaranteed.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Open the doors where every obstruction group is 0', [G('Two open. Two stay shut.'), E('Where all the obstruction groups vanish, nothing can block you. That’s the summit.')]),
      {
        type: 'ask',
        question: 'Corollary 4.73: every map $A → X$ extends to $W$ if…',
        options: ['$Hⁿ⁺¹(W, A; πₙX) = 0$ for all $n$', '$πₙ(X) ≠ 0$ for some $n$', '$W = A$ only'],
        answer: '$Hⁿ⁺¹(W, A; πₙX) = 0$ for all $n$',
        wrong: [E('What was written on the doors that opened?')],
        right: [E('Homotopy, read through cohomology. The Spire is climbed. The gate is open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — the cells stay filled. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Obstruction theory: to extend A → X over W one cell at a time, an (n+1)-cell extends when its boundary is null in πₙ(X). The obstructions form a class ωₙ ∈ Hⁿ⁺¹(W, A; πₙX); the extension goes on iff ωₙ = 0 (Prop. 4.72), and if all those groups vanish every map extends (Cor. 4.73).',
  cite: 'Hatcher, Algebraic Topology §4.3, pp. 415–419; Lemma 4.7.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The summit is yours. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'cell') return [E('Cell-Smith (2) on each dome whose boundary group is $0$.')]
  if (current === 'blocked') return [E('Cup Caster (9) reads a dome’s $ω$. Cell-Smith (2) extends over the one with $ω = 0$.')]
  if (current === 'reroute') return [E('Cup Caster (9) on the shared $2$-cell twists it. If $A + B ≠ 0$, no twist works — use the red pad.')]
  return [E('Cell-Smith (2) on a door opens it — if every obstruction group under it is $0$.')]
}
