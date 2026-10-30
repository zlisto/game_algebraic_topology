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
  N('Turn every floor at once, Gyroid, and nothing changes. You’ll find that’s true of most things.'),
  E('The Deck Halls. The Sheet Compass (6) turns a whole cover at once, whenever the turn lands the cover on itself.'),
  E('And when a turn stacks every copy of a spawn on one spot, a single Lash (1) clears the lot.'),
  E('This is the last stretch of the Bastion, and Null’s packed the commons between the halls, mostly with projective specters. They’re built like $ℝP²$, so one lash only flips them. Land the second within two seconds.'),
  E('I’ll stay right behind you. Press E for advice.'),
  E('Each hall you finish leaves a Deck Sphere: a glass sphere with two opposite points joined by one deck swap, the sphere covering $ℝP²$ twice. Bring all four together and the Warp Portal past the north gate opens.'),
]

export const STATIONS = {
  shift_deck: {
    blueprint: 'Shift the deck',
    arrive: [
      E('Over this hall hangs a three-sheeted cover: $a$ and $b$ both carry sheet 1 to 2, 2 to 3, and 3 back to 1.'),
      E('A deck transformation shuffles the sheets so that the whole graph lands on itself, every edge onto an edge with the same letter.'),
      N('My Deck guards stand on every sheet at once, Gyroid. Strike one copy and the others simply carry on.'),
      E('He’s right. A guard copied on three sheets can’t be hit until its copies stack. Click the wheel with the Sheet Compass (6) to turn the cover a third of the way round, and keep away from them until then.'),
    ],
    goals: [
      {
        type: 'shift',
        cover: 'cyclic3',
        needShift: 1,
        guards: true,
        // said the moment the turn lands, before the lash
        stacked: [
          E('A third of a turn, and every edge lands on an edge with the same letter. That turn is a deck transformation, a symmetry of the cover, and it’s carried each guard’s copies onto one spot.'),
          G('They’re stacked. One lash.'),
        ],
        done: [E('Every copy gone at once. He’s sending more. Turn the deck again when they come.')],
      },
      {
        type: 'shift',
        cover: 'cyclic3',
        needShift: 2,
        guards: true,
        stacked: [E('Two thirds of a turn: the graph lands on itself again. That’s a second deck transformation. Lash them while they’re stacked!')],
        done: [],
      },
      {
        type: 'ask',
        question: 'Counting “do nothing”, how many deck transformations does this three-sheeted cover have?',
        options: ['1', '2', '3'],
        answer: '3',
        right: [
          E('Three: do nothing, a third of a turn, and two thirds. Sheet 1 can be carried to sheet 1, 2 or 3, so any sheet can reach any other. That makes this cover normal.'),
          E('West, across the Carousel Commons, to the lopsided gallery. Its cover won’t be so kind.'),
        ],
        wrong: [E('Count the turns that landed the graph on itself: “do nothing”, and then each turn you made with the wheel. Each one carries sheet 1 to a different sheet.')],
      },
    ],
    early: [E('The carousel hall is north, past the landing commons.')],
  },
  lopsided: {
    blueprint: 'Lopsided cover',
    arrive: [
      E('Another three-sheeted cover: $a$ swaps sheets 1 and 2, $b$ swaps sheets 2 and 3. Look at the loops. Sheet 1 has a $b$-loop, sheet 3 has an $a$-loop, and sheet 2 has neither.'),
      N('Turn it all you like. It will never land on itself.'),
      E('And that’s a projective specter. It’s built like $ℝP²$, where a loop traced twice shrinks away, so one lash only flips it. Land the second within two seconds, or it settles back.'),
    ],
    goals: [
      {
        type: 'ask',
        question: 'Can a deck transformation carry sheet 1 onto sheet 2?',
        options: ['Yes — the cover is normal', 'No — sheet 1 has a b-loop and sheet 2 doesn’t'],
        answer: 'No — sheet 1 has a b-loop and sheet 2 doesn’t',
        right: [E('Right. A deck transformation carries loops to loops, so it can’t move sheet 1 to sheet 2. The only one here is “do nothing”, so this cover isn’t normal.')],
        wrong: [E('A deck transformation has to carry the $b$-loop at sheet 1 to a $b$-loop. Sheet 2 doesn’t have one.')],
      },
    ],
    early: [E('Finish the carousel first.')],
  },
  quotient: {
    blueprint: 'Divide by a group',
    arrive: [
      E('Symmetry makes covers too. Turn a circle half way round and no point stays put: $ℤ/2$ acts freely. Divide it out and you get a circle again, covered twice. That’s the map $z ↦ z²$ from Push It Forward.'),
      E('Click the wheel with the Sheet Compass (6). The half-turn swaps the two sheets.'),
    ],
    goals: [
      {
        type: 'shift',
        cover: 'quotient',
        needShift: 1,
        done: [
          E('The two sheets trade places and the cover lands on itself. When a group acts freely (and nicely) on a space, dividing it out gives a covering space, and that group is its deck group.'),
          G('So the half-turn is the whole deck group. Two sheets, two symmetries.'),
        ],
      },
    ],
    early: [E('The lopsided gallery comes before the quotient forge.')],
  },
  antipodal: {
    blueprint: 'Antipodal hall',
    arrive: [
      E('A sphere hall, with golden doors exactly opposite each other. Glue every point to its opposite and you get the projective plane, $ℝP²$, so the sphere covers $ℝP²$ twice.'),
      E('A loop down in $ℝP²$ lifts to a path up here. Some lifts close; one kind runs from a door to the door opposite.'),
    ],
    goals: [
      {
        type: 'ask',
        question: 'Which loop down in ℝP² lifts to a path from a door to the opposite door?',
        options: ['The image of the whole rim', 'The image of half the rim (180°)', 'A tiny loop round one door'],
        answer: 'The image of half the rim (180°)',
        right: [
          E('Yes. Half the rim ends at the point opposite where it started, and downstairs those are the same point, so it’s a loop. But its lift doesn’t close.'),
          E('A loop that shrinks lifts to a closed path, so this one can’t shrink. Twice round lifts to the whole rim, which shrinks on the sphere. Two sheets, two classes: $π₁(ℝP²) ≅ ℤ₂$.'),
          G('Two doors up here, one door down there. Got it.'),
        ],
        wrong: [E('The whole rim already closes up here, and a tiny loop does too. Only half the rim ends at the opposite door.')],
      },
      {
        type: 'walk',
        loopId: 'half',
        done: [
          E('Half the rim, door to opposite door. That’s the whole Bastion proved, Gyroid. It goes on the Chart.'),
          G('Inked?'),
          E('Inked. The north gate’s open, and Null’s trail runs straight through it. Gather every Deck Sphere and the Warp Portal there will take us out of the Bastion.'),
        ],
      },
    ],
    early: [E('The sphere hall is north — after the quotient forge.')],
  },
}

export const HINTS = {
  knockout: [E('Hearts back. Your deck shifts and port counts are saved. Try the Compass again.')],
  refuse_shift: [E('That turn would put an edge on an edge with a different letter. Only shuffles that carry the cover onto itself count as deck transformations.')],
  guards: [E('Turn the deck until every copy of a Deck guard sits on the same spot, then lash once.')],
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
  if (!current) return [E('All halls clear. Pick up every Deck Sphere, then walk north into the Warp Portal.')]
  if (here?.site !== current) return [E(`I’m right behind you. Head to ${STATIONS[current].blueprint}: follow the map’s NEXT ring. On the commons, lash each projective specter twice in quick succession; a Klein bottle takes three.`)]
  if (goal?.guards && enemies?.[current] > 0 && !guardsAligned) return [E(`Don’t waste lashes on the guards yet. Each one’s copied on every sheet. Sheet Compass (6) on the wheel: turn the cover to shift +${goal.needShift}, and the copies stack.`)]
  if (goal?.guards && guardsAligned) return [E('They’re stacked on one spot now. Lash (1) them. One strike takes every copy.')]
  if (goal?.type === 'shift') return [E(`Sheet Compass (6) on the wheel in the middle: turn until shift +${goal.needShift}.`)]
  if (goal?.type === 'ask') return [E('Answer the question. Think about which sheets can reach which.')]
  if (goal?.type === 'walk') return HINTS.walk
  return [E('Sheet Compass (6) on the wheel; Lash (1) when copies stack.')]
}
