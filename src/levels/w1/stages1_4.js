/**
 * World 1 · Level 4 "No Way Out" — Brouwer's Basin. Hatcher §1.1, the applications of π₁(S¹) ≅ ℤ:
 *   the Retractor   — no retraction D² → S¹ (the step in the proof of Theorem 1.9)
 *   the Still Point — Brouwer: every map h : D² → D² has a fixed point (Theorem 1.9)
 *   the Roots       — the fundamental theorem of algebra (Theorem 1.8)
 *   the Antipodes   — Borsuk–Ulam for S² (Theorem 1.10)
 *
 * The tool throughout is the boundary count: walk a rim once and count how many times the
 * arrow under you turns. If that count isn't 0, the field must vanish somewhere inside — a loop
 * that winds can't be shrunk in a disk with no zero to wind round.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['retractor', 'still_point', 'roots', 'antipodes']

export const OPENING = [
  N('Squash the basin onto its rim, courier. The way I squashed your home.'),
  E('Null’s Retractor wants to push the whole basin — a disk — onto its rim circle, without moving the rim. You have the tools to show it can’t.'),
  E('The Retractor deck is just ahead.'),
]

export const STATIONS = {
  retractor: {
    blueprint: 'Break the Retractor',
    arrive: [
      E('First the rim. Winding Cord (4): walk the rim road once round. The pink arrow over you points the way the rim loop goes — watch it turn once.'),
      E('Then we’ll shrink that loop through the disk with the Tide Glass, and see what the Retractor does with it.'),
    ],
    goals: [
      {
        type: 'rim',
        winding: 1,
        done: [
          G('One lap, and the arrow turned once.'),
          E('The rim loop winds once: in $π₁(S¹) ≅ ℤ$ it’s $1$. Now take the Tide Glass (3) and press X to shrink it into the disk — in a disk, every loop shrinks to a point.'),
          E('Watch the Retractor: it must push each shrinking loop back out onto the rim.'),
        ],
      },
      {
        type: 'shrink',
        wave: true,
        done: [
          E('There. Every pushed-out loop still wound once — and the last one is a single point, which winds zero. A winding number can’t jump from $1$ to $0$ along a slide. The Retractor tore.'),
          G('So there’s no way to squash the disk onto its rim, holding the rim still.'),
          E('No retraction $D² → S¹$ — so a ring is not a point. Not probably: proved. Now — drones! Lash them (1) before they drag you off.'),
        ],
      },
      { type: 'guard', done: [E('Deck clear. The Still Point is west.')] },
    ],
    early: [E('The Retractor deck is first — straight ahead.')],
  },
  still_point: {
    blueprint: 'Find the still tile',
    arrive: [
      E('The basin’s current carries every tile somewhere else in the basin — a map $h$ of the disk to itself. Each arrow points from a tile toward where it’s carried.'),
      E('Walk the rim once with the Cord (4) and count the arrow over you. If it turns, some tile inside isn’t carried anywhere.'),
    ],
    goals: [
      {
        type: 'rim',
        winding: 1,
        done: [
          E('The arrow turned once on the rim. If no tile were still, every arrow would have a direction, and shrinking the rim loop inward would carry a loop that turns once down to one that doesn’t turn — impossible.'),
          E('So a still tile exists: a fixed point, $h(x) = x$. Find it — the arrows shrink toward it — and click it.'),
        ],
      },
      { type: 'still', done: [G('There — its arrow shrinks to nothing.'), E('Brouwer’s fixed point theorem: every map from the disk to itself keeps some point still. East now, to the root pool.')] },
    ],
    early: [E('Finish the Retractor proof first.')],
  },
  roots: {
    blueprint: 'Three roots',
    arrive: [
      E('The arrows here follow the polynomial $p(z) = z³ − a³$. Walk the rim once with the Cord (4) and count the arrow over you.'),
    ],
    goals: [
      {
        type: 'rim',
        winding: 3,
        done: [
          G('One lap — and the arrow turned three times!'),
          E('On a big circle $z³ − a³$ behaves like $z³$, which winds three times. So $p$ must be zero somewhere inside — that’s Hatcher’s proof of the fundamental theorem of algebra. Find the zeros: the whirlpools where the arrows shrink away. Click each one.'),
        ],
      },
      { type: 'roots', count: 3, done: [G('Three whirlpools, three roots.'), E('A degree-3 polynomial has 3 roots. Last deck: the sphere of Antipodes, north.')] },
    ],
    early: [E('The Still Point comes before the root pool.')],
  },
  antipodes: {
    blueprint: 'Opposite match',
    arrive: [
      E('A sphere, with weather stations. Each reads two numbers — say, temperature and pressure: a map $f : S² → ℝ²$.'),
      N('And I promise no two opposite stations agree.'),
      E('Borsuk–Ulam says he’s wrong: some point and its opposite always read exactly the same. Click a station, then the one opposite it.'),
    ],
    goals: [
      {
        type: 'pair',
        done: [
          E('Opposite stations, identical readings: $f(x) = f(−x)$. That’s the Borsuk–Ulam theorem — no map from the sphere to the plane can keep all opposite points apart.'),
          E('The basin is clear. Gyroid — look south. Something on the horizon just lit up. The exit gate is open to the north.'),
        ],
      },
      { type: 'exit', done: [E('That’s Haven’s beacon. Go on — the Torus Terraces are north, and we have a world to put back.')] },
    ],
    early: [E('Match antipodes after the root pool.')],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Finished decks stay finished; the spawn here are back, and so is any wave you hadn’t cleared.'),
  notStill: E('That tile’s arrow still points somewhere. Follow the arrows: they shrink toward the still tile.'),
  wrongRoot: E('The arrow there still has a direction, so $p$ isn’t zero. Look for a whirlpool, where the arrows swirl round and shrink away.'),
  wrongPair: E('Those two don’t read the same, or they aren’t opposite each other. Opposite means straight through the centre.'),
  tooFar: (what) => `Click right on ${what}`,
}

export const DEFINITION = {
  text: 'There is no retraction of the disk D² onto its boundary circle: a loop that winds once round S¹ shrinks to a point in D², and a retraction would turn that shrink into a homotopy from winding 1 to winding 0 in S¹. The same boundary count proves Brouwer’s theorem (every map D² → D² has a fixed point), the fundamental theorem of algebra (zⁿ + … winds n times on a big circle, so it has a root), and Borsuk–Ulam for S² (every map S² → ℝ² sends some pair of opposite points to the same place).',
  cite: 'Hatcher, Algebraic Topology, §1.1, Theorems 1.8, 1.9 and 1.10, pp. 31–33.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice14(state) {
  const { current, goal, progress, stationId, enemies } = state
  if (!current) return [E('The exit gate is open to the north.')]
  if (stationId !== current) return [E(`Head to ${state.siteName(current)} — follow the NEXT marker on the map.`)]
  if (enemies > 0) return [E('Lash the spawn (1) first — retractor drones drag you about, and whirl tops spin.')]
  if (!goal) return [E('Walk on to the next deck.')]
  if (goal.type === 'rim') return [E(`Winding Cord (4): walk the whole rim road once round without stepping off it. Watch the pink arrow over your head — it should turn ${goal.winding} time${goal.winding === 1 ? '' : 's'}.`)]
  if (goal.type === 'shrink') return [E('Tide Glass (3), then press X: the white loop shrinks toward the centre. Keep going all the way.')]
  if (goal.type === 'still') return [E('Click the tile where the arrows shrink to nothing — they swirl round it.')]
  if (goal.type === 'roots') return [E(`Three whirlpools where the arrows shrink away — click each (${progress.roots ?? 0}/3 found).`)]
  if (goal.type === 'pair') return [E('Click a station, then the station straight opposite it through the centre. You want two opposite ones whose readings are exactly the same, in the same order.')]
  if (goal.type === 'guard') return [E('Lash the retractor drones (1) until the deck is clear.')]
  if (goal.type === 'exit') return [E('The gate is open to the north.')]
  return [E('Cord (4) walks rims, Tide Glass (3) shrinks loops, Lash (1) strikes.')]
}
