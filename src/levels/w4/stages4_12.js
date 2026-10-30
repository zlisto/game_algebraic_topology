/**
 * World 4 · Level 4-12 "Obstruction Course".
 * Hatcher §4.3 pp. 415–419 — the extension problem: given a CW pair (W, A) and a map A → X, does it
 * extend to W? Lemma 4.7: yes if πₙ(X) = 0 whenever W − A has (n+1)-cells. Proposition 4.72: at each
 * stage the lift exists iff the obstruction ωₙ ∈ Hⁿ⁺¹(W, A; πₙX) vanishes. Corollary 4.73: if all those
 * groups are 0 (X abelian), every map A → X extends. The reroute station uses the cellular picture
 * Hatcher points to in [VBKT]; it goes slightly beyond the text.
 *
 * Cell Hammer (2): extend over cells, open doors. Cup Caster (9): read obstructions, twist cells.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['cell', 'blocked', 'reroute', 'summit']

export const OPENING = [
  G('Emmy. When we get up there… can I say her name to him? Wren’s?'),
  E('…Say it like she was a person. He’s only heard it as a reason for twenty years.'),
  G('Okay.'),
  E('The Obstruction Course, the last floor under the Crown. It asks one question. You know a map on part of a space, $A$. Can you fill it in over the whole of $W$?'),
  E('You fill it in one cell at a time. When a cell won’t take the map, the thing blocking it turns out to be a cohomology class: the obstruction.'),
  G('So even the walls are readings.'),
  E('Cell Hammer on 2, Cup Caster on 9. First station’s west; follow the NEXT ring. There are commons north-east and east of it. The east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  cell: {
    blueprint: 'Cell by Cell',
    arrive: [
      E('The map is already set on $A$, landing in $S²$. $W$ is $A$ with cells glued on. Each new cell’s rim is already mapped, because the rim sits in what you’ve done.'),
      E('An $(n+1)$-cell’s rim is a sphere $Sⁿ$. The cell fills in exactly when that rim map shrinks to a point in $S²$, and it always does when $πₙ(S²) = 0$. Cell Hammer the cells that are safe.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Extend over every cell whose boundary lands in a zero group', [G('The $3$-cell’s rim lands in $π₂(S²) = ℤ$. Not safe.'), E('That’s Lemma 4.7: the map extends if $πₙ(X) = 0$ for every $(n+1)$-cell of $W − A$.')]),
      {
        type: 'ask',
        question: 'Lemma 4.7 guarantees an extension over the $(n+1)$-cells when…',
        options: ['$πₙ(X) = 0$', '$Hₙ(X) ≠ 0$', '$X$ is a sphere'],
        answer: '$πₙ(X) = 0$',
        wrong: [E('The boundary of an $(n+1)$-cell is an $Sⁿ$. Which group does a map of $Sⁿ$ live in?')],
        right: [E('Right. Now the $3$-cells that aren’t safe. North, on the NEXT ring.')],
      },
    ],
  },
  blocked: {
    blueprint: 'Blocked',
    arrive: [
      E('Three $3$-cells. Each rim is a map $S² → S²$, so it has a degree: an element of $π₂(S²) = ℤ$. Degree $0$ means the rim shrinks and the cell fills.'),
      E('Write each cell’s number on it and you have the obstruction cochain. Read them with the Caster; extend only where it’s $0$.'),
    ],
    early: [E('Not yet. Finish the station before this one first.')],
    goals: [
      act('Read all three; extend where ω = 0', [G('Degree $0$ fills in. Degree $2$ and $−1$ don’t.'), E('Proposition 4.72: if you may redo the map on the $n$-cells below, you get past this stage exactly when the class $ωₙ ∈ Hⁿ⁺¹(W, A; πₙX)$ is $0$. That needs $π₁$ acting trivially, as on $S²$.')]),
      {
        type: 'ask',
        question: 'Proposition 4.72: the next stage extends exactly when…',
        options: ['the obstruction $ωₙ = 0$', '$W$ is a disk', 'every cell has dimension $2$'],
        answer: 'the obstruction $ωₙ = 0$',
        wrong: [E('Which cells filled in?')],
        right: [E('Right. But $ωₙ$ is a class, not just the numbers on the cells. Next station’s north-east; I’ll show you why.')],
      },
    ],
  },
  reroute: {
    blueprint: 'Reroute',
    arrive: [
      E('Two $3$-cells, $A$ and $B$, share a $2$-cell. You’re allowed to change the map on that $2$-cell. Twist it by $k ∈ π₂$, and $A$’s number goes up by $k$ while $B$’s goes down by $k$.'),
      E('A change like that, $+k$ here and $−k$ there, is a coboundary. Clear both cells if you can. If you can’t, declare the class nonzero.'),
      E('Same move as in the Gardens: a cochain is the numbers on the cells, and its class is what’s left once you may add any coboundary.'),
    ],
    early: [E('Not yet. Two stations come first; the NEXT ring shows where.')],
    goals: [
      act('Clear the obstructions, or declare the class nonzero', [G('The sum never moved.'), E('Changing the lower cells only ever adds a coboundary to the cochain. What it can’t change is the class, so the class is the real obstruction.')]),
      {
        type: 'ask',
        question: 'Changing the map on lower cells changes the obstruction cochain by…',
        options: ['a coboundary — the class stays put', 'anything you like', 'nothing at all'],
        answer: 'a coboundary — the class stays put',
        wrong: [E('$+k$ here, $−k$ there. What didn’t change?')],
        right: [E('Right. One station left, the summit. It’s east, on the NEXT ring.')],
      },
    ],
  },
  summit: {
    blueprint: 'The Summit',
    arrive: [
      E('Four doors, four extension problems. Each obstruction lives in a group $Hⁿ⁺¹(W, A; πₙX)$. If every one of those groups is $0$, no obstruction can be anything but $0$.'),
      E('That’s Corollary 4.73: then every map $A → X$ extends. Open only the doors that are guaranteed.'),
    ],
    early: [E('Not yet. Three stations come first; follow the NEXT ring.')],
    goals: [
      act('Open the doors where every obstruction group is 0', [G('Two open. Two stay shut.'), E('The shut ones might still extend. Nothing guarantees it, that’s all.')]),
      {
        type: 'ask',
        question: 'Corollary 4.73: every map $A → X$ extends to $W$ if…',
        options: ['$Hⁿ⁺¹(W, A; πₙX) = 0$ for all $n$', '$πₙ(X) ≠ 0$ for some $n$', '$W = A$ only'],
        answer: '$Hⁿ⁺¹(W, A; πₙX) = 0$ for all $n$',
        wrong: [E('What was written under the doors that opened?')],
        right: [E('Right.'), E('The gate’s north. After that it’s the stair, and the Crown. He’ll have the whole Way spread out under him.'), G('Then he can watch us come up it.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. The cells you filled are still filled. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The course is done. The gate’s north, and the Crown’s above it.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'cell') return [E('Cell Hammer (2) on each dome whose boundary group is $0$.')]
  if (current === 'blocked') return [E('Cup Caster (9) reads a dome’s $ω$. Cell Hammer (2) extends over the one with $ω = 0$.')]
  if (current === 'reroute') return [E('Cup Caster (9) on the shared $2$-cell twists it. If $A + B ≠ 0$, no twist works; use the red pad.')]
  return [E('Cell Hammer (2) on a door opens it, if every obstruction group under it is $0$.')]
}
