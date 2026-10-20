/**
 * World 1 · Level 2 "Loop de Loop" — Basepoint Beacon. Hatcher §1.1: π₁(X, x₀) is a group
 * under concatenation of based loops; change of base along h gives π₁(X,x₀) ≅ π₁(X,x₁).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['home_base', 'there_back', 'brackets', 'second_beacon']

export const OPENING = [
  E('The Basepoint Beacon — every lap you run from here and back is a loop at this point.'),
  E('Your Lash closes them now. Run a loop, and it lands in your loop ledger.'),
  G('And the hooded things running the tracks the wrong way?'),
  E('Backtracks. Each one is a loop run backwards — an inverse with teeth. One lash apiece.'),
]

/**
 * Goal types:
 *   loop n          — complete n laps (each {track, dir}) in order from the beacon
 *   reduce expect   — after laps in `seq`, reduced word must match expect (default [])
 *   ask             — prediction question before confirming
 *   arrive_b        — walk to the second beacon along the causeway
 *   carry           — at beacon B, show loops carried by change of base
 */
export const STATIONS = {
  home_base: {
    blueprint: 'Home base',
    arrive: [
      E('A loop must leave the beacon and come back to the same point — the basepoint.'),
      E('Standing still is a loop too: the identity. With the Lash (1) out, leave the amber pad along the arrows, run the petal all the way round, and step back onto the pad.'),
    ],
    goals: [{ type: 'loop', seq: [{ track: 0, dir: 1 }], done: [G('One lap, closed. The ledger remembers it as $α$.'), E('That’s an element of the fundamental group $π₁(X, x₀)$ — based loops up to sliding.')] }],
    early: [E('The beacon first — just ahead on the red-lantern ring.')],
  },
  there_back: {
    blueprint: 'There and back',
    arrive: [
      E('Every loop has an undo: run it backwards. Run $α$ along the arrows, then run it again against them — that’s $α⁻¹$.'),
      E('$α$ followed by $α⁻¹$ should slide all the way down to standing still.'),
    ],
    goals: [
      {
        type: 'reduce',
        seq: [
          { track: 0, dir: 1 },
          { track: 0, dir: -1 },
        ],
        expect: [],
        done: [G('$α$ then $α⁻¹$ — nothing left. Standing still.'), E('Inverses are built in. That’s what makes loops a group, not just a pile of routes.')],
      },
    ],
    early: [E('There and Back is east on the violet ring — not yet.')],
  },
  brackets: {
    blueprint: 'Brackets don’t matter',
    arrive: [
      E('Three petals: $α$, $β$, $γ$. A loop is one trip in one unit of time, so chaining three means choosing how to share the time.'),
      E('First run them as $(α β) γ$: $α$ and $β$ squeezed into the first half, $γ$ taking the second. Then as $α (β γ)$: $α$ gets the first half. Watch the timing bar.'),
    ],
    goals: [
      {
        type: 'loop',
        runs: 2,
        seq: [
          { track: 0, dir: 1 },
          { track: 1, dir: 1 },
          { track: 2, dir: 1 },
        ],
        mid: [E('Now the same three as $α (β γ)$ — $α$ gets the first half this time.')],
        done: [E('Both chains wrote $α β γ$ in the ledger. Only the timing differed.')],
      },
      {
        type: 'ask',
        question: 'Are $(α β) γ$ and $α (β γ)$ the same loop class?',
        options: ['No — different brackets, different loops', 'Yes — they differ only in timing'],
        answer: 'Yes — they differ only in timing',
        wrong: [E('Both runs follow the very same trail; only how long each petal takes changes. Re-timing a loop is a homotopy — so $(α β) γ ≃ α (β γ)$.')],
        right: [
          G('Same trail, different stopwatch. Brackets don’t matter.'),
          E('That’s associativity — the last thing a group needs. Now take the causeway north to the second beacon.'),
        ],
      },
    ],
    early: [E('The triple-loop deck is north — finish There and Back first.')],
    enemies: [['torus', -2.5, 3], ['backtrack', 0, 0]],
  },
  second_beacon: {
    blueprint: 'A second beacon',
    arrive: [
      E('A new basepoint, $x₁$. The causeway you just walked is a path $h$ from $x₀$ to $x₁$.'),
      E('Any loop $γ$ back at $x₀$ has a twin here: $h⁻¹ γ h$ — walk back along $h$, run $γ$, walk out again.'),
    ],
    goals: [
      { type: 'arrive_b', done: [E('And it works the other way: run this beacon’s own petal, $δ$, and it can be carried back to $x₀$ as $h δ h⁻¹$.')] },
      {
        type: 'carry',
        path: [{ track: 0, dir: 1 }],
        done: [
          G('$δ$ at $x₁$ — which reads $h δ h⁻¹$ back at $x₀$.'),
          E('Every loop has a twin at the other beacon, and the matching respects concatenation: $π₁(X, x₀) ≅ π₁(X, x₁)$. That’s change of basepoint. The exit is open — north.'),
        ],
      },
    ],
    early: [E('The second beacon waits at the end of the north causeway.')],
    enemies: [['sphere', -3, 2], ['sphere', 3, 2]],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Laps you closed stay in the ledger, but the spawn on unfinished decks are back. Lash them and keep going.'),
  notHub: E('Start and finish each lap at the amber beacon in the middle.'),
  abandon: E('Go all the way round the gold ring and back to the beacon.'),
  wrongSection: (name) => E(`The ledger work is at ${name} — follow the map’s NEXT pulse.`),
  needLash: E('Switch to the Lash (1). It closes loops on these rings.'),
  patrol: G('Ribbon scouts — they’re only watching for now.'),
}

export const DEFINITION = {
  text: 'Loops at a basepoint x₀, up to homotopy, form a group π₁(X, x₀): concatenation is the product, the constant loop is the identity, a loop run backwards is its inverse, and re-timing makes the product associative. A path h from x₀ to x₁ gives an isomorphism π₁(X, x₁) → π₁(X, x₀), [f] ↦ [h f h̄], where h̄ is h run backwards.',
  cite: 'Hatcher, Algebraic Topology, §1.1 (Paths and homotopy; the fundamental group, Prop. 1.3 and 1.5), pp. 26–28.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATchapter1.pdf',
}

export function emmyAdvice12(state) {
  const { current, done, goal, here, bag, lapIdx, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the spawn on this deck first (a torus takes two hits; a Backtrack, one) — then run your laps.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('All sections done — walk north through the exit gate.')]
  }
  if (!goal) return [E('Walk out through the exit when you’re ready.')]
  if (goal.type === 'loop' || goal.type === 'reduce') {
    const need = goal.seq?.[lapIdx || 0]
    if (need) return [E(`Next lap: $${['α', 'β', 'γ'][need.track] || '?'}${need.dir < 0 ? '⁻¹' : ''}$. Start on the amber pad, run the ${['gold', 'blue', 'pink'][need.track]} petal ${need.dir < 0 ? 'against' : 'along'} its arrows, and step back onto the pad.`)]
    return [E('Run the laps in order from the beacon.')]
  }
  if (goal.type === 'arrive_b') return [E('Follow the causeway to the smaller beacon at the north end.')]
  if (goal.type === 'carry') return [E('Run this beacon’s petal $δ$ once, pad to pad.')]
  if (goal.type === 'ask') return [E('You ran the same three petals twice, timed two ways. Same trail — same class?')]
  return [E('Keep the beacon at your back when you start each lap.')]
}
