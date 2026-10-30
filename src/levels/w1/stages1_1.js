/**
 * World 1 · Level 1 "Fixed Endpoints" — Endpoint Gardens.
 * Hatcher, Algebraic Topology, Chapter 1, pp. 25–26 (homotopy of paths rel a subspace).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['open_lawn', 'hedges', 'faster', 'chained']

export const OPENING = [
  E('Endpoint Gardens. The Bastion’s post-runners keep a ledger here. Not of parcels: of which routes count as the same delivery.'),
  G('Haven had one of those, pinned up by the sorting desk. I used to scribble my times in the margin.'),
  E('Then you already know how it works. Two routes go in the same column if one slides onto the other while both ends stay pinned at their gates. The slide is called a path homotopy rel the endpoints.'),
  E('Each garden you settle leaves a Path Seal: two routes between the same gates, and the sweep that slides one onto the other. Collect all four and the Warp Portal at the far end of the gardens opens.'),
  E('Null’s beasts roam the open commons between the gardens: spheres, tori, the odd Möbius band. Lash (1) them and keep moving. I’ll be right behind you.'),
  G('Tide Glass to watch a slide, Spool to pick up routes and sort them. And if I get stuck, E, and you talk me through it.'),
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
      E('No hedges here, so any two routes between these gates slide straight onto each other.'),
      E('Hold the Tide Glass (3) and scrub $t$ with Z and X. The teal ghost slides the wavy route onto the straight one, and the gates stay pinned the whole way.'),
    ],
    goals: [
      {
        type: 'slide',
        pair: ['wavy', 'straight'],
        done: [G('They slid together, and the ends never moved.'), E('With nothing in the way, you can pull every point of one route straight across to the other. That straight-line slide is a homotopy rel the gates, so every route here is one class.')],
      },
      {
        type: 'ledger',
        expectClasses: 1,
        done: [E('Ledger stamped: one class. On an open lawn every route between the same two gates is the same delivery. The hedge bed’s north.')],
      },
    ],
    early: [E('Start with the open lawn, by the near gatehouses.')],
  },
  hedges: {
    blueprint: 'Hedge bed · sort routes',
    arrive: [
      E('This hedge bed is a hole in the lawn. A route round its left side and a route round its right won’t slide together. You’d have to drag one through the hedge.'),
      E('Hold the Spool (2) and click a route on the deck to pick it up, or click its name in the ledger. Then drop it in Bin I or Bin II. Sort by which side of the hedge it goes, not by how wiggly it is.'),
    ],
    goals: [
      {
        type: 'ledger',
        expectClasses: 2,
        wave: true,
        done: [
          E('Two classes: left of the hedge and right of it. Two routes share a class exactly when one slides onto the other with the gates pinned.'),
          G('Haven’s road went round the lake like that. Nobody ever had to prove you couldn’t drag it across.'),
          E('Nobody had to, until him. Next time someone asks, you’ll have the proof.'),
          G('Hedge spawn! They’re sprouting a new bed across the routes. Lash them before they root.'),
        ],
      },
      { type: 'guard', done: [E('Ledger’s clean. The pace garden’s next, north-west along the causeway.')] },
    ],
    early: [E('Finish the open lawn first.')],
  },
  faster: {
    blueprint: 'Same route, new pace',
    arrive: [
      E('Two routes on one curve. The solid one walks it slowly; the dashed copy hurries along the very same trail in more, shorter steps.'),
      E('Is the fast copy the same delivery as the slow one? Answer in the ledger.'),
    ],
    goals: [
      {
        type: 'pace',
        route: 'slow',
        fast: 'fast',
        done: [G('Fast or slow, it’s the same class.'), E('Right. Changing a path’s pace is a homotopy rel the gates: you slide the timing and leave the trail where it is. A route run faster is still the same delivery.'), E('Now watch it happen as a slide. Hold the Tide Glass (3) and scrub $t$.')],
      },
      {
        type: 'slide',
        pair: ['slow', 'fast'],
        done: [E('Gates fixed the whole time. East along the causeway now: three gatehouses, for chaining.')],
      },
    ],
    early: [E('Sort the hedge ledger first. Pace comes after.')],
  },
  chained: {
    blueprint: 'Chained deliveries',
    arrive: [
      E('Three gatehouses: $A$, $B$, $C$. A route $A → B$ followed by a route $B → C$ makes a route $A → C$. Running them end to end is called concatenation.'),
      E('Now swap the second leg for another route in its own class (toggle it in the ledger) and see whether the whole journey’s class changes.'),
    ],
    goals: [
      {
        type: 'chain',
        done: [
          E('It doesn’t. You can chain classes, not just routes, as long as the middle gate matches: concatenation is well defined on homotopy classes rel the endpoints.'),
          G('Swap accepted. Same class.'),
        ],
      },
      {
        type: 'ledger',
        expectClasses: 2,
        done: [
          E('Master ledger signed. The north causeway’s open: walk out to Loop de Loop.'),
          G('I’d have signed Haven’s ledger tonight. If there were still a Haven.'),
          E('There will be. Keep walking.'),
        ],
      },
    ],
    early: [E('Chaining waits until you’ve seen pace and hedges.')],
  },
}

export const HINTS = {
  knockout: [E('Hearts back. Your ledger’s safe, but any spawn you hadn’t cleared are back too.')],
  refuse: {
    ledger: [E('That route doesn’t go in that bin. Picture sliding it across: would it have to go through the hedge?')],
    slide: [E('Scrub t until the ghost matches the route. The ends stay on the gate posts.')],
    chain: [E('Pick routes that meet at the middle gatehouse, then confirm the swap.')],
  },
}

export const DEFINITION = {
  text: 'Fix a subspace A of a space X. Two paths in X with the same endpoints in A are path homotopic rel A if one can be continuously deformed into the other while keeping the endpoints in A fixed at all times. This is an equivalence relation. On a convex set, any two paths with the same endpoints are homotopic rel those endpoints via a straight-line homotopy. Concatenation of paths is well defined on homotopy classes when endpoints match.',
  cite: 'Paraphrasing Allen Hatcher, Algebraic Topology, Chapter 1, pp. 25–26 (path homotopy rel a subspace; homotopy equivalence relation; concatenation).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export const WRONG = {
  ledgerMix: [E('Those two don’t slide together. Check which side of the hedge each one goes.')],
}

export function emmyAdvice11(s) {
  const lines = []
  if (s.exitOpen) return [E('Every garden’s settled. Pick up the Path Seals, then out through the far gate to the Warp Portal. I’m right behind you.')]
  if (!s.station) return [E('Follow the NEXT ring on the map to the next garden. I’ll follow.')]
  if (s.here !== s.station) return [E(`${s.stationName} is next. Follow the NEXT ring on the map, and lash (1) whatever’s roaming the commons on the way. I’m right on your heels.`)]
  if (s.enemies) return [E('Clear the spawn on this deck first with the Lash (1). Hedge spawn put down roots if you leave them.')]
  const g = s.goal
  if (!g) return [E('This garden’s done. Walk to NEXT on the map.')]
  if (g.type === 'slide') return [E('Tide Glass (3): scrub t with Z and X until the routes match. The gates stay put.')]
  if (g.type === 'ledger') return [E(`Sort the routes into ${g.expectClasses || 2} class(es): click a route, then a bin.`), E('Two routes share a bin exactly when one slides onto the other with the gates pinned.')]
  if (g.type === 'pace') return [E('The solid route walks the curve slowly; the dashed one hurries along the very same trail. Same class or not? Answer in the panel.')]
  if (g.type === 'chain') return [E('Chain A→B and B→C and note the class. Then swap B→C for an equivalent route and check the class again.')]
  if (g.type === 'guard') return [E('Lash (1) every hedge spawn before it roots.')]
  return [E('Spool (2) for routes, Tide Glass (3) for slides, E to talk.')]
}
