/**
 * World 1 · Level 3 "Winding Road" — Bouquet Bastion. Hatcher §1.1, Theorem 1.7: π₁(S¹) ≅ ℤ,
 * via the covering ℝ → S¹ (the helix), path lifting and homotopy lifting.
 *
 * Each deck's ring road is the circle S¹; the helix over it is ℝ. As Gyroid runs the ring, his
 * teal shadow climbs the helix at the same angle — the lift of his path. A closed lap's lift
 * ends a whole number of floors up: its winding number. +1 is counter-clockwise on screen.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['the_helix', 'sliding', 'unwind', 'number_line']

export const OPENING = [
  N('Every loop on a circle is just a number. I wonder if anyone here can read it.'),
  E('The Winding Road. Each ring road is a circle, and over each one stands a helix — the circle unrolled into a line.'),
  E('Each deck you finish leaves a Helix Coil: the helix sitting over its circle, where one lap round the bottom is one floor up. Collect all four and the Warp Portal past the north ring opens.'),
  E('Watch for Möbius prowlers. One lash cuts one down the middle into a band twice as long, and it runs twice as fast. The second lash finishes it, so strike again quickly.'),
  E('The commons on this road are thick with them, and with tori and projective specters too. A specter only flips at the first lash; land the second fast.'),
  E('The Helix deck is straight ahead, past the Landing Commons. Lash (1) in hand. I’ll be right behind you.'),
]

/**
 * Goal types:
 *   lap n           — run laps, bank them at the beacon; the banked lap must have winding n
 *   slide           — Tide Glass deforms the banked loop; then say where its lift ends
 *   unwind winder   — run laps until they cancel the turns a Winder holds, then lash it
 *   gate n          — bank laps until the cord reads n
 */
export const STATIONS = {
  the_helix: {
    blueprint: 'One lap, one floor',
    arrive: [
      E('Watch the helix while you run. Your teal shadow climbs it at the same angle as you — that’s the lift of your path.'),
      E('Hold the Winding Cord (4) and run the ring road once round counter-clockwise, with the arrows. Then step onto the beacon in the middle to bank the lap.'),
    ],
    goals: [
      {
        type: 'lap',
        n: 1,
        done: [
          G('One lap down here — one floor up there!'),
          E('The floor where the lift ends is the winding number, an integer. That’s the heart of $π₁(S¹) ≅ ℤ$.'),
          E('Now the other way: one lap clockwise, against the arrows. Watch your shadow go down the helix instead. Then bank it on the beacon.'),
        ],
      },
      {
        type: 'lap',
        n: -1,
        done: [
          G('Clockwise, and the lift ended one floor down: $−1$.'),
          E('Laps the other way give negative winding numbers. Every loop’s lift starts on floor $0$ and ends on a whole floor, up or down.'),
          E('Next: Sliding Doesn’t Count, east along the causeway.'),
        ],
      },
    ],
    early: [E('The Helix deck first — the round island just ahead.')],
  },
  sliding: {
    blueprint: 'Sliding doesn’t change the count',
    arrive: [
      E('Bank one more counter-clockwise lap here. Then take the Tide Glass (3) and press X to deform it — wiggle it as hard as you like.'),
      E('Keep an eye on the helix: the deformed loop has a lift too. Watch where it ends.'),
    ],
    goals: [
      {
        type: 'lap',
        n: 1,
        done: [E('Banked. Now the Tide Glass (3): X deforms the loop, Z eases it back. Then tell me where the lift ended.')],
      },
      {
        type: 'slide',
        done: [
          G('Wild wiggles — and the lift still ends on floor +1.'),
          E('That’s homotopy lifting: sliding a loop slides its lift, and the lift’s end can’t jump between floors. The winding number doesn’t change.'),
          E('Null can’t slide a $+1$ into a $0$ — and neither can his Crown. Unwind is next — west, past the Helix.'),
        ],
      },
    ],
    early: [E('Sliding Doesn’t Count is the deck to the east — after the Helix.')],
  },
  unwind: {
    blueprint: 'Cancel, then lash',
    arrive: [
      E('Winders. Each one has stolen turns of the road — the violet coils — and the Lash slides right off them.'),
      E('This one holds $+2$. Run laps the other way, clockwise, $−1$ each: $2 + (−1) + (−1) = 0$. With no turns left, one lash finishes it.'),
    ],
    goals: [
      {
        type: 'unwind',
        winder: 2,
        done: [
          G('$+2$, then two clockwise laps — zero. It went down to one lash!'),
          E('Running loops one after another adds their winding numbers; running a loop backwards negates it.'),
          E('The other Winder holds $−3$. Which way, and how many laps?'),
        ],
      },
      {
        type: 'unwind',
        winder: -3,
        done: [E('Three counter-clockwise laps cancel $−3$. Both Winders are down.'), E('The Number Line is last — north.')],
      },
    ],
    early: [E('The Unwind deck is west. Finish Sliding first.')],
  },
  number_line: {
    blueprint: 'Every integer, nothing else',
    arrive: [
      E('Each gate opens for one winding number. Bank laps on the cord — they add; clockwise laps subtract.'),
      E('Make the cord read $+2$, then $−1$, then $+3$. The cord starts at $0$ for each gate.'),
    ],
    goals: [
      { type: 'gate', n: 2, done: [G('$+2$. The first gate opens.')] },
      { type: 'gate', n: -1, done: [G('$−1$. Clockwise laps count down, past zero and below.')] },
      {
        type: 'gate',
        n: 3,
        done: [
          E('Every gate opened for its integer, and laps added like integers do. Loops on the circle up to sliding are exactly the integers: $π₁(S¹) ≅ ℤ$.'),
          G('I can read the floors now. Haven winds once, Null. I can prove it.'),
          E('The exit ring is open to the north.'),
        ],
      },
    ],
    early: [E('The Number Line is last — finish the Winders first.')],
  },
}

export const SLIDE_ASK = {
  question: 'While you deformed the loop, where did its lift end?',
  options: ['It moved with the wiggles', 'On floor $+1$, every time'],
  answer: 'On floor $+1$, every time',
  wrong: [E('Look at the helix again: the wiggly teal lift sways, but its end — the white bead — never leaves floor $+1$. Deforming a loop deforms its lift with the end pinned to one floor.')],
}

export const HINTS13 = {
  knockout: E('Hearts back. Your cord and finished decks are safe; the spawn on this deck are back.'),
  wrongWinding: E('That banked lap had the wrong winding. Counter-clockwise, with the arrows, is $+1$; clockwise is $−1$.'),
}

export const DEFINITION13 = {
  text: 'The fundamental group of the circle is infinite cyclic: π₁(S¹) ≅ ℤ. A loop’s class is its winding number — where its lift to the helix ℝ → S¹ ends. Homotopy lifting keeps that endpoint fixed, and running loops one after another adds their winding numbers.',
  cite: 'Hatcher, Algebraic Topology, §1.1, Theorem 1.7 and its proof, pp. 29–31.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
}

export function emmyAdvice13(state) {
  const { current, goal, here, bank, pendingLap, winders, gateOpen, enemies, met, slideMax } = state
  if (!current) return [E('Every deck is done. Pick up the Helix Coils; the exit ring is north. I’m right behind you.')]
  if (here !== current) return [E(`Head for ${STATIONS[current].blueprint}: follow the NEXT marker on the map, and lash (1) whatever roams the commons on the way. I’ll follow.`)]
  if (enemies?.[current] > 0 && goal?.type !== 'unwind') return [E('Lash the spawn on this deck first (1), then run your laps with the Cord (4).')]
  if (!met?.[current]) return STATIONS[current].arrive.slice(-1)
  if (!goal) return [E('Walk on — the next deck is waiting.')]
  if (pendingLap != null) return [E(`You have a lap of $${pendingLap > 0 ? '+' : '−'}${Math.abs(pendingLap)}$ waiting. Step onto the beacon in the middle to bank it.`)]
  if (goal.type === 'lap')
    return goal.n < 0
      ? [E('Winding Cord (4). Run the ring road all the way round clockwise, against the arrows, then step onto the beacon in the middle.')]
      : [E('Winding Cord (4). Run the ring road all the way round counter-clockwise, with the arrows, then step onto the beacon in the middle.')]
  if (goal.type === 'slide')
    return slideMax < 0.9
      ? [E('Tide Glass (3): press X to deform the loop — all the way. Watch the white bead at the end of its lift on the helix.')]
      : [E('Now press “Where did the lift end?” in the panel and tell me.')]
  if (goal.type === 'unwind') {
    const w = winders?.find((x) => x.site === current && !x.killed && x.winding === goal.winder)
    if (!w) return [E('Lash the unwound Winder.')]
    const h = w.winding + w.net
    if (!h) return [E('It holds nothing now. Lash (1) it!')]
    return [E(`It holds $${h > 0 ? '+' : '−'}${Math.abs(h)}$. Cord (4): run ${Math.abs(h)} lap${Math.abs(h) > 1 ? 's' : ''} ${h > 0 ? 'clockwise ($−1$ each)' : 'counter-clockwise ($+1$ each)'} — no banking needed. Then lash it.`)]
  }
  if (goal.type === 'gate') {
    if (gateOpen?.[goal.n]) return [E('That gate is open.')]
    const need = goal.n - bank
    return [E(`The cord reads $${bank}$; the gate wants $${goal.n}$. Bank ${Math.abs(need)} more lap${Math.abs(need) === 1 ? '' : 's'} ${need > 0 ? 'counter-clockwise' : 'clockwise'}.`)]
  }
  return [E('Cord (4) runs laps, Tide Glass (3) deforms them, Lash (1) strikes.')]
}
