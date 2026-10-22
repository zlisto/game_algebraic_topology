/**
 * World 4 · Level 4-5 "One Group" — One Group.
 * Hatcher §4.2, pp. 365–366 — Eilenberg–MacLane spaces K(G, n): πₙ = G and all other homotopy groups
 * zero. K(G, 1)s include S¹ = K(ℤ, 1), the torus = K(ℤ², 1), ℝP∞ = K(ℤ₂, 1) (their universal covers
 * are contractible). A K(G, n) is built from a space with the right πₙ by attaching cells of
 * dimension n + 2, n + 3, … to kill the higher homotopy groups one at a time; from S² this gives
 * K(ℤ, 2), which is ℂP∞.
 *
 * Cell Hammer (2): mark a space; attach the cell that kills a group.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['recall', 'kill']

export const OPENING = [
  E('One Group. Some spaces have exactly one non-zero homotopy group: $πₙ = G$, everything else $0$. They’re called $K(G, n)$.'),
  G('A space that only has one kind of hole?'),
  E('Exactly. Cell Hammer on 2.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  recall: {
    blueprint: 'Recall',
    arrive: [E('Five spaces. Mark the $K(G, 1)$s — $π₁ = G$ and nothing above — and mark the others “not”.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Mark every space correctly', [G('The circle, the torus, and ℝP∞.'), E('Each has a contractible universal cover, so nothing survives above $π₁$. $S²$ and $ℝP²$ both have $π₂ = ℤ$.')]),
      {
        type: 'ask',
        question: 'Why is $ℝP∞$ a $K(ℤ₂, 1)$ but $ℝP²$ is not?',
        options: ['ℝP∞’s universal cover $S∞$ is contractible; ℝP²’s is $S²$, with $π₂ = ℤ$', 'ℝP² has the wrong $π₁$', 'ℝP∞ is not a CW complex'],
        answer: 'ℝP∞’s universal cover $S∞$ is contractible; ℝP²’s is $S²$, with $π₂ = ℤ$',
        wrong: [E('Both have $π₁ = ℤ₂$. Look at their universal covers.')],
        right: [E('Right. Next floor: build one.')],
      },
    ],
  },
  kill: {
    blueprint: 'Kill Above',
    arrive: [
      E('Start with $S²$: $π₂ = ℤ$ — keep that. But $π₃(S²) = ℤ$ too, and more above.'),
      E('Attach cells to kill the higher groups, one at a time, from the bottom up. Click each meter to attach the cell that kills it.'),
    ],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Kill π₃, π₄ and π₅ in order', [G('Only $π₂ = ℤ$ left.'), E('Keep going forever and you get $K(ℤ, 2)$ — which turns out to be $ℂP∞$.')]),
      {
        type: 'ask',
        question: 'Why kill from the bottom up?',
        options: ['Attaching $(k+1)$-cells kills $πₖ$ without changing lower groups — but it can change higher ones', 'Higher groups are bigger', 'It doesn’t matter'],
        answer: 'Attaching $(k+1)$-cells kills $πₖ$ without changing lower groups — but it can change higher ones',
        wrong: [E('Cellular approximation: new $(k+1)$-cells can’t affect $πᵢ$ for $i < k$.')],
        right: [E('One group left standing. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your cells stay attached. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'An Eilenberg–MacLane space K(G, n) has πₙ = G and every other homotopy group zero — S¹, the torus and ℝP∞ are K(G, 1)s. Starting from a space with the right πₙ, attaching cells of dimension n + 2, n + 3, … kills the higher groups one at a time; from S² this builds K(ℤ, 2) = ℂP∞.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 365–366 (Eilenberg–MacLane spaces).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('One group stands. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'recall') return [E('Cell Hammer (2): click a pedestal to cycle yes → no → unset. A $K(G, 1)$ has nothing above $π₁$.')]
  return [E('Cell Hammer (2): click $π₃$ first, then $π₄$, then $π₅$.')]
}
