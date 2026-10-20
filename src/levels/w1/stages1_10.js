/**
 * World 1 · Level 10 "Deck the Halls" — deck transformations, normal covers,
 * quotients, and the antipodal sphere hall. Hatcher Ch. 1, §Deck transformations
 * and normal covers (pp. 68–82); RP² as S² mod antipodal (Example 1.14).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['shift_deck', 'lopsided', 'quotient', 'antipodal']

export const OPENING = [
  N('Shift every floor at once. If the ports still line up, nothing changed — and I still win.'),
  E('The Deck Halls. The Sheet Compass (6) turns a whole cover at once, when the cover lands on itself.'),
  E('Lash (1) clears Null’s spawn when a deck shift stacks every copy on one spot.'),
]

export const STATIONS = {
  shift_deck: {
    blueprint: 'Shift the deck',
    arrive: [
      E('Over this hall hangs a three-sheeted cover: $a$ and $b$ both carry sheet 1 to 2, 2 to 3, and 3 back to 1.'),
      E('A deck transformation shuffles the sheets so the whole graph lands on itself — every edge onto an edge with the same letter. Click the wheel with the Sheet Compass (6) to turn the cover a third of the way round.'),
    ],
    goals: [
      {
        type: 'shift',
        cover: 'cyclic3',
        needShift: 1,
        guards: true,
        done: [
          E('A third of a turn, and every edge lands on an edge with the same letter. That turn is a deck transformation — a symmetry of the cover.'),
          E('Here a deck transformation can carry any sheet to any other. That makes the cover normal.'),
          G('The guards stacked. One lash.'),
        ],
      },
    ],
    early: [E('The carousel hall is just north of the landing.')],
  },
  lopsided: {
    blueprint: 'Lopsided cover',
    arrive: [
      E('Another three-sheeted cover: $a$ swaps sheets 1 and 2, $b$ swaps sheets 2 and 3. Look at the loops: sheet 1 has a $b$-loop, sheet 3 an $a$-loop, sheet 2 neither.'),
      N('Turn it all you like. It never lands on itself.'),
    ],
    goals: [
      {
        type: 'ask',
        question: 'Can a deck transformation carry sheet 1 onto sheet 2?',
        options: ['Yes — the cover is normal', 'No — sheet 1 has a b-loop and sheet 2 doesn’t'],
        answer: 'No — sheet 1 has a b-loop and sheet 2 doesn’t',
        right: [E('Right. A deck transformation carries loops to loops, so it can’t move sheet 1 to sheet 2. The only one here is “do nothing” — so the cover is not normal.')],
        wrong: [E('A deck transformation must carry the $b$-loop at sheet 1 to a $b$-loop. Sheet 2 has none.')],
      },
    ],
    early: [E('Finish the carousel first.')],
  },
  quotient: {
    blueprint: 'Divide by a group',
    arrive: [
      E('Covers from symmetry: turn a circle half way round. No point stays put — $ℤ/2$ acts freely. Divide it out, and you get a circle again, covered twice: the map $z ↦ z²$ from Push It Forward.'),
      E('Click the wheel with the Sheet Compass (6): the half-turn swaps the two sheets.'),
    ],
    goals: [
      {
        type: 'shift',
        cover: 'quotient',
        needShift: 1,
        done: [
          E('The two sheets trade places and the cover lands on itself. A group acting freely (and nicely) on a space gives a covering space, and the group is its deck group.'),
          G('Folded once, covered twice.'),
        ],
      },
    ],
    early: [E('The lopsided gallery comes before the quotient forge.')],
  },
  antipodal: {
    blueprint: 'Antipodal hall',
    arrive: [
      E('A sphere hall, with golden doors exactly opposite each other. Glue every point to its opposite and you get the projective plane $ℝP²$ — so the sphere covers $ℝP²$ twice.'),
      E('A loop down in $ℝP²$ lifts to a path up here. Some lifts close; one kind runs from a door to its opposite.'),
    ],
    goals: [
      {
        type: 'ask',
        question: 'Which loop down in ℝP² lifts to a path from a door to the opposite door?',
        options: ['The image of the whole rim', 'The image of half the rim (180°)', 'A tiny loop round one door'],
        answer: 'The image of half the rim (180°)',
        right: [
          E('Yes. Half the rim ends at the point opposite where it started — and downstairs those are the same point, so it’s a loop. Its lift doesn’t close.'),
          E('So that loop can’t be shrunk in $ℝP²$, while going round it twice can: $π₁(ℝP²) ≅ ℤ₂$.'),
          G('Opposite doors, one room — got it.'),
        ],
        wrong: [E('The whole rim already closes up here, and a tiny loop does too. Only half the rim ends at the opposite door.')],
      },
      {
        type: 'walk',
        loopId: 'half',
        done: [E('You walked half the rim: door to opposite door. The north gate is open.')],
      },
    ],
    early: [E('The sphere hall is north — after the quotient forge.')],
  },
}

export const HINTS = {
  knockout: [E('Hearts back. Your deck shifts and port counts are saved — try the Compass again.')],
  refuse_shift: [E('That turn would put an edge on an edge with a different letter. Only shuffles that carry the cover onto itself are deck transformations.')],
  guards: [E('Rotate the deck until every Deck guard copy sits on the same spot, then Lash once.')],
  compass: [E('Sheet Compass (6): click the wheel in the middle of the hall.')],
  walk: [E('Walk the glowing half of the rim, from one golden door to the other.')],
}

export const DEFINITION = {
  text: 'A deck transformation of a covering space is a symmetry of it that lies over the identity: it permutes the sheets and carries the cover onto itself. They form the deck group. A cover is normal when the deck group can carry any sheet to any other. A group acting freely on a space gives a cover with that deck group — so S² double-covers ℝP², and π₁(ℝP²) ≅ ℤ₂.',
  cite: 'Hatcher, Algebraic Topology, §1.3: deck transformations and group actions, pp. 70–74.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
}

export function emmyAdvice110(state) {
  const { current, goal, done, shift, guardsAligned, here, enemies } = state
  if (!current) return [E('All halls clear. Walk out north to leave.')]
  if (here?.site !== current) return [E(`Head to ${STATIONS[current].blueprint} — follow the map’s NEXT ring.`)]
  if (enemies?.[current] > 0 && !guardsAligned) return HINTS.guards
  if (goal?.type === 'shift') return [E(`Rotate with the Compass until shift +${goal.needShift} is valid${goal.guards ? ', stack the guards, then Lash' : ''}.`)]
  if (goal?.type === 'ask') return [E('Answer the question — think about which sheets can reach which.')]
  if (goal?.type === 'walk') return HINTS.walk
  return [E('Sheet Compass (6) on the wheel; Lash (1) when copies stack.')]
}
