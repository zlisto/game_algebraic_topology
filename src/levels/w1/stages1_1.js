/**
 * World 1 · Level 1 "Fixed Endpoints" — Endpoint Gardens.
 * Hatcher, Algebraic Topology, Chapter 1, pp. 25–26 (homotopy of paths rel a subspace).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['open_lawn', 'hedges', 'faster', 'chained']

export const OPENING = [
  E('Endpoint Gardens. Couriers log routes between gatehouses — not parcels, but which delivery class a path belongs to.'),
  E('Two routes count as the same if one slides into the other while both ends stay pinned at their gates. That is a path homotopy rel the endpoints.'),
  G('Ledger open. Tide Glass to watch a slide, Spool to pick routes up and sort them. Lost? I’ll ask Emmy — E.'),
]

/**
 * Goal types:
 *   slide          — scrub Tide Glass until routes match (convex homotopy demo)
 *   ledger         — assign every route id to a class bin; validate
 *   pace           — confirm reparametrized route same class
 *   chain          — build A→C from pieces; swap equivalent middle piece
 *   guard          — clear hedge spawn wave
 */
export const STATIONS = {
  open_lawn: {
    blueprint: 'Open lawn · one class',
    arrive: [
      E('No hedges here — any two routes between these gates slide straight into each other.'),
      E('Hold the Tide Glass (3) and scrub $t$ with Z and X: the teal ghost slides the wavy route onto the straight one, gates pinned the whole time.'),
    ],
    goals: [
      {
        type: 'slide',
        pair: ['wavy', 'straight'],
        done: [G('They slid together. Ends never moved.'), E('On a convex lawn that straight-line slide is a homotopy rel the gates. One class for every route here.')],
      },
      {
        type: 'ledger',
        expectClasses: 1,
        done: [E('Ledger stamped: one class. On an open lawn every route between the same gates is the same delivery. North: the hedge bed.')],
      },
    ],
    early: [E('The open lawn is just ahead — start at the near gatehouses.')],
  },
  hedges: {
    blueprint: 'Hedge bed · sort routes',
    arrive: [
      E('A hedge bed is a hole in the lawn. Routes around the left and right don’t slide together — different classes.'),
      E('Hold the Spool (2) and click a route on the deck to pick it up — or click its name in the ledger. Then put it in Bin I or Bin II. Sort by which side of the hedge it passes, not by its shape.'),
    ],
    goals: [
      {
        type: 'ledger',
        expectClasses: 2,
        wave: true,
        done: [
          E('Two classes — left of the hedge and right of the hedge. Two routes share a class exactly when one slides into the other with the gates pinned.'),
          G('Hedge spawn tried to sprout a new bed mid-route. Lash them before they root.'),
        ],
      },
      { type: 'guard', done: [E('Clear ledger. On to the pace garden — north-west along the causeway.')] },
    ],
    early: [E('Finish the open lawn first.')],
  },
  faster: {
    blueprint: 'Same route, new pace',
    arrive: [
      E('Two routes on one curve: the solid one walks it slowly, the dashed copy hurries — more, shorter steps, the very same trail.'),
      E('Is the fast copy the same delivery class as the slow one? Answer in the ledger.'),
    ],
    goals: [
      {
        type: 'pace',
        route: 'slow',
        fast: 'fast',
        done: [G('Fast or slow — same class.'), E('Changing a path’s pace is a homotopy rel the gates: slide the timing, not the trail. Null loves to confuse pace with path. Don’t let him.'), E('Now watch it as a slide: hold the Tide Glass (3) and scrub $t$.')],
      },
      {
        type: 'slide',
        pair: ['slow', 'fast'],
        done: [E('Gates fixed the whole time. East along the causeway: three gatehouses for chaining.')],
      },
    ],
    early: [E('The hedge ledger comes before pace tricks.')],
  },
  chained: {
    blueprint: 'Chained deliveries',
    arrive: [
      E('Three gatehouses: $A$, $B$, $C$. A route $A → B$ followed by a route $B → C$ is a route $A → C$ — that’s concatenation.'),
      E('Swap the second leg for another route in its own class — toggle it in the ledger — and check whether the whole journey’s class changes.'),
    ],
    goals: [
      {
        type: 'chain',
        done: [
          E('Concatenation is well defined on homotopy classes rel endpoints — when the middle gate matches.'),
          G('Swap accepted. Same class.'),
        ],
      },
      {
        type: 'ledger',
        expectClasses: 2,
        done: [E('Master ledger signed. The north causeway is open — walk out to Loop de Loop.')],
      },
    ],
    early: [E('Chaining waits until you’ve seen pace and hedges.')],
  },
}

export const HINTS = {
  knockout: [E('Hearts back. Your ledger is safe — and any spawn you hadn’t cleared are back too.')],
  refuse: {
    ledger: [E('That route doesn’t belong in that bin — try sliding it mentally around the hedge.')],
    slide: [E('Scrub t until the ghost route matches — endpoints stay on the gate posts.')],
    chain: [E('Pick routes that meet at the middle gatehouse, then confirm the swap.')],
  },
}

export const DEFINITION = {
  text: 'Fix a subspace A of a space X. Two paths in X with the same endpoints in A are path homotopic rel A if one can be continuously deformed into the other while keeping the endpoints in A fixed at all times. This is an equivalence relation. On a convex set, any two paths with the same endpoints are homotopic rel those endpoints via a straight-line homotopy. Concatenation of paths is well defined on homotopy classes when endpoints match.',
  cite: 'Paraphrasing Allen Hatcher, Algebraic Topology, Chapter 1, pp. 25–26 (path homotopy rel a subspace; homotopy equivalence relation; concatenation).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export const WRONG = {
  ledgerMix: [E('Those two routes don’t slide together — check which side of the hedge each uses.')],
}

export function emmyAdvice11(s) {
  const lines = []
  if (s.exitOpen) return [E('Exit is north. Walk through the gate — the iris will close behind you.')]
  if (!s.station) return [E('Follow the map’s NEXT ring to the current garden.')]
  if (s.here !== s.station) return [E(`You're not on ${s.name} yet — dashed line on the map.`), E(`Head to ${s.stationName}.`)]
  if (s.enemies) return [E('Clear the spawn first — lash (1). Hedge spawn root if you wait too long.')]
  const g = s.goal
  if (!g) return [E('Section clear. Walk to NEXT on the map.')]
  if (g.type === 'slide') return [E('Tide Glass (3): scrub t until the routes match. Gates stay fixed.')]
  if (g.type === 'ledger') return [E(`Ledger: sort routes into ${g.expectClasses || 2} classes. Click route, then bin.`), E('Same bin iff a homotopy rel the gates exists.')]
  if (g.type === 'pace') return [E('Walk the slow route with Spool (2), then confirm the fast copy is the same class.')]
  if (g.type === 'chain') return [E('Chain A→B and B→C, note the class, swap B→C for an equivalent route, check the class again.')]
  if (g.type === 'guard') return [E('Lash every hedge spawn before it roots (1).')]
  return [E('Spool (2) for routes, Tide Glass (3) for slides, E to talk.')]
}
