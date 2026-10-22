/**
 * World 1 · Level 8 "Under Cover" — Sheetwater Viaduct.
 * Hatcher §1.3: covering spaces, path lifting, Prop. 1.31; the covers of S¹ ∨ S¹ (p. 58); ab ≠ ba in F₂.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['two_floors', 'build_cover', 'rescue', 'order_proved']

export const OPENING = [
  E('Sheetwater Viaduct. Over each deck hang glass copies of it — the sheets of a covering space. Wherever you walk, your lift (the white bead) walks the same way on one of the sheets.'),
  E('The Sheet Compass (6) reads which sheet your lift is on. First deck: two sheets over a single loop, past the landing commons.'),
  E('Null’s beasts hold every commons between the decks, and these are the toughest in the Bastion: Möbius prowlers, projective specters, even a Klein bottle. Lash (1) them on the open ground. I’ll stay right behind you — press E whenever you want my advice.'),
  E('Each deck you finish leaves a Cover Stack: glass sheets stacked over one circle, a bead on every sheet above the gold point below. Collect all four and the Warp Portal at the north end opens.'),
]

/**
 * Goal types:
 *   lap      — walk the loop once / twice (circle deck)
 *   wire     — cycle ports until a valid connected 3-sheet cover is wired
 *   rescue   — lift to sheet 2 and reach Emmy
 *   prove    — cover where ab closes and ba does not; confirm with Compass
 *   exit     — walk out
 */
export const STATIONS = {
  two_floors: {
    blueprint: 'Two floors',
    arrive: [
      E('Two sheets over one loop. They’re joined so that going once round carries your lift up to the other sheet. Winding Cord (4): run the orange loop once, beacon to beacon.'),
    ],
    goals: [
      { type: 'lap', count: 1, done: [G('Back on the beacon down here — but my lift is on sheet two. Its path didn’t close up.'), E('Now run it twice more, and watch where the bead ends up.')] },
      { type: 'lap', count: 2, done: [E('Twice round, and the lift is back on sheet two, where that run started — it closed. A loop’s lift closes exactly when the loop comes from the cover’s own loops: here, the ones that go round an even number of times.'), G('So the cover can tell loops apart. West next — the junction.')] },
    ],
    early: [E('The two-sheet deck is first — just north of the landing.')],
  },
  build_cover: {
    blueprint: 'Build a cover',
    arrive: [
      E('Three sheets over the figure-eight. Running $a$ moves your lift from sheet to sheet by some rule, and so does $b$. For a cover, each rule must send the three sheets to three different sheets.'),
      N('Mix the sheets. Maybe every loop will look the same from down there.'),
      E('Ignore him. Use the buttons in the panel to set the rules until they’re valid and every sheet can be reached from every other.'),
    ],
    goals: [
      {
        type: 'wire',
        done: [E('Valid and connected — a three-sheeted cover of the figure-eight.'), G('East, past the crossing commons: Null’s hung the rescue deck’s beacon up on sheet two!')],
      },
    ],
    early: [E('Wire the three-sheet cover at the junction first.')],
  },
  rescue: {
    blueprint: 'Rescue on sheet two',
    arrive: [
      N('The deck’s beacon is mine now. It hangs on sheet two, where your feet can’t reach.'),
      E('Feet can’t, but your lift can. See the gold beacon up on sheet two? Run loops down here until your lift — the white bead — ends on that sheet.'),
      G('I’ll read the Compass and find a word that lands on sheet two.'),
      E('Watch the Möbius prowler. Your first lash cuts it down the middle — one band, twice as long, and twice as fast. Lash it again before it reaches you.'),
    ],
    goals: [
      {
        type: 'rescue',
        targetSheet: 2,
        done: [E('Your lift reached the beacon. You’re back at the start downstairs, but on another sheet up there — a loop whose lift doesn’t close.'), G('Now let’s prove order matters. The last deck, past the ebb commons to the north.')],
      },
    ],
    early: [E('The rescue deck is east of the junction.')],
  },
  order_proved: {
    blueprint: 'Order, proved',
    arrive: [
      E('This cover is wired so that some words close and some don’t. If $a b$ closes and $b a$ doesn’t, they can’t be the same loop — homotopic loops lift to paths that end in the same place.'),
      N('Words, words. They all shrink on a sphere eventually.'),
      E('Not here. Stand on the beacon with the Sheet Compass (6) and click: it lifts $a b$ and $b a$ from sheet one and shows where each ends.'),
    ],
    goals: [
      { type: 'prove', done: [E('There it is: $a b$ closes and $b a$ doesn’t. So $ab ≠ ba$ in $π₁$ of the figure-eight — what Free Word Play claimed, now proved with a cover.'), G('The covers see what the loops downstairs can’t.'), E('The viaduct exit is open north. Gather every Cover Stack and the Warp Portal there will take us on to Sheet Music.')] },
    ],
    early: [E('The last deck — prove $ab ≠ ba$.')],
  },
}

export const HINTS18 = {
  knockout: E('Breathe — your cover wiring stays. Try the current deck again.'),
  far: E('Walk closer to the beacon or port you need.'),
  wrongLap: E('That many laps gave the wrong lift sheet. Count again — one lap opens on the circle deck, two close.'),
  badWire: E('Each label needs a permutation on the sheets — no duplicates. All three sheets must connect through the ports.'),
  rescue: E('Try a word that ends on sheet two. The Compass shows your lift after each loop you walk.'),
  proveNeed: E('Rewire until $ab$ closes from sheet one and $ba$ does not — then press the Compass on the beacon to confirm.'),
  liftling: E('That sprite lives on one sheet only. Match your lift to its sheet, then lash.'),
}

export const DEFINITION18 = {
  text: 'A covering space of the figure-eight is a graph with edges labelled a and b, where every vertex has exactly one a-edge in, one a-edge out, one b-edge in and one b-edge out. A loop lifts to a path that closes exactly when the loop comes from the cover’s fundamental group, and homotopic loops lift to paths with the same end. So a cover in which ab closes but ba does not proves ab ≠ ba.',
  cite: 'Hatcher, Algebraic Topology, §1.3: Proposition 1.30 (homotopy lifting) and Proposition 1.31, and the covers of S¹ ∨ S¹ on p. 58.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATchapter1.pdf',
}

export function emmyAdvice18(state) {
  const { current, done, goal, liftSheet, cover, here, enemies } = state
  if (!current) return [E('The viaduct is clear. Pick up every Cover Stack, then walk north into the Warp Portal.')]
  if (here.site !== current) return [E(`I’m right behind you. Head to ${state.siteName(current)} — follow the map’s NEXT ring. The commons between the decks are open ground: fight the beasts there with the Lash (1), and keep moving so they can’t box you in.`)]
  if (enemies?.[current]) return [E('Lash the patrol — or the Liftling on your lift’s sheet first. A Möbius prowler needs two lashes, and the second must catch it after the first doubles its speed. A projective specter needs two lashes in quick succession.')]
  if (!goal) return [E('Press on — the next goal is close.')]
  if (goal.type === 'lap') return [E(`Winding Cord (4): run the orange loop ${goal.count === 1 ? 'once' : 'twice'}, beacon to beacon. Your lift is on sheet ${liftSheet + 1}.`)]
  if (goal.type === 'wire') return [E('Use the buttons in the panel to set where $a$ and $b$ send each sheet. No two sheets may go to the same sheet, and all three must link up.')]
  if (goal.type === 'rescue') return [E(`Run loops from the center until your lift ends on sheet ${goal.targetSheet}, where the gold beacon hangs. Watch the white bead climb the stack.`)]
  if (goal.type === 'prove') return [E('Wire so ab closes and ba does not, then click the beacon with the Compass to confirm.')]
  if (goal.type === 'exit') return [E('Walk north through the exit gate.')]
  return [E('Sheet Compass (6) for ports and tests · Lash (1) for spawn.')]
}
