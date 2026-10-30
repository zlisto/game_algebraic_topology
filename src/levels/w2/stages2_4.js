/**
 * World 2 · Level 2-4 "Chase Scene" — Chase Channels.
 * Hatcher §2.1 pp. 113–118 — exact sequences (Im = Ker at every group), short exact sequences,
 * relative homology and the long exact sequence of a pair (X, A).
 *
 * Each deck is a row of locks (groups) joined by sluices (maps) — ChaseChannelsScene. The Blade
 * (7) resets a sluice: it changes where the generator 1 is sent. On the last two decks it changes
 * an unknown lock's group instead.
 */
import { CANDIDATES, GROUPS, ROWS, exactness, rowKs } from './ChaseChannelsScene'

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['exact', 'chase', 'pair', 'five']

export const OPENING = [
  G('Emmy. On the citadel, he said I don’t look down when I run, and that Wren never did either. Who’s Wren?'),
  E('…Someone who carried the post. Before you were born.'),
  G('That’s not an answer.'),
  E('No. It’s the part I can say standing on a lock gate. Ask me again when the Delta’s safe. I mean that.'),
  E('The Chase Channels. Each lock holds a group, a set of tiles you can add. Each sluice is a map: it carries every tile in one lock to a tile in the next.'),
  E('A row is exact at a lock when what pours in from the left is exactly what the right sluice drains to $0$. Not more, not less.'),
  G('So whatever comes in is exactly what the next gate turns to nothing.'),
  E('The Blade (7) resets a sluice gate. First channel is north-west; follow the NEXT ring. Three commons hang off it, east and north-east. One has beasts.'),
]

export const STATIONS = {
  exact: {
    blueprint: 'Exact Locks',
    arrive: [
      E('$ℤ₄ → ℤ₄ → ℤ₂$. $ℤ₄$ is clock arithmetic with four tiles, $0$ to $3$, where $3 + 1 = 0$. The right sluice is fixed: it sends each tile to even or odd. Blue tiles are the ones it sends to $0$.'),
      E('Gold rings show what the left sluice delivers. Click the left sluice with the Blade to change where it sends $1$, until the gold sits exactly on the blue.'),
    ],
    early: [E('Not this channel yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Make the middle lock exact: gold rings exactly on the blue tiles', done: [G('Gold on blue, and nowhere else.'), E('Send $1 ↦ 2$ and the left sluice delivers {0, 2}. The right sluice drains exactly the evens, {0, 2}, to $0$. Same set.')] },
      {
        type: 'ask',
        question: 'What does “exact at the middle lock” mean?',
        options: ['The image of the map in equals the kernel of the map out', 'Every tile gets delivered', 'The two maps are the same'],
        answer: 'The image of the map in equals the kernel of the map out',
        wrong: [E('Gold is what arrives. Blue is what drains to $0$. Exact means those two are the same set.')],
        right: [E('Right. What arrives is called the image of $f$; what drains to $0$ is the kernel of $g$. Exact: Im $f$ = Ker $g$.'), E('Next channel is east, on the NEXT ring.')],
      },
    ],
  },
  chase: {
    blueprint: 'The Chase',
    arrive: [
      E('$0 → ℤ₂ → ℤ₄ → ℤ₂ → 0$. Both middle sluices are yours. Make all three inner locks exact.'),
      E('The left lock is fed by $0$, so only $0$ arrives, so only $0$ may drain away there. The right lock drains into $0$, so everything drains, so everything must arrive.'),
    ],
    early: [E('Not this channel yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Make all three inner locks exact', done: [G('All three green.'), E('A row with zeros at both ends, exact everywhere, is a short exact sequence: $0 → A → B → C → 0$. Here $ℤ₂$ sits inside $ℤ₄$ as the evens, and what’s left over is $ℤ₂$.')] },
      {
        type: 'ask',
        question: 'In a short exact sequence $0 → A →f B →g C → 0$, what do the ends force?',
        options: ['$f$ is one-to-one and $g$ is onto', '$f$ is onto and $g$ is one-to-one', 'Both maps are zero'],
        answer: '$f$ is one-to-one and $g$ is onto',
        wrong: [E('Exact at $A$: only $0$ drains to $0$. Exact at $C$: everything has to arrive.')],
        right: [E('Right. Only $0$ drains means no two tiles land on the same place. Everything arrives means nothing is missed.'), E('Next channel is west, on the NEXT ring.')],
      },
    ],
  },
  pair: {
    blueprint: 'A Place and a Part',
    arrive: [
      E('Now homology. Take a place $X$ and a part $A$ inside it. Relative homology $Hₙ(X, A)$ counts chains in $X$ but treats anything in $A$ as $0$.'),
      E('So a chain counts as a cycle as long as its boundary lies in $A$.'),
      E('Here $X$ is a disk and $A$ is its rim. The whole disk is a relative cycle: its boundary is the rim, and the rim counts as $0$.'),
      E('Every pair gives a long exact row: $… → Hₙ(A) → Hₙ(X) → Hₙ(X, A) →∂ Hₙ₋₁(A) → …$ One lock is unknown, $H₂(D², S¹)$. Click it with the Blade to try groups until the whole row is exact.'),
      E('It comes from the chase. Chains in $A$ sit inside chains in $X$, and what’s left over is relative chains. A short exact row of chains always stretches into a long one.'),
    ],
    early: [E('Not this channel yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Find $H₂(D², S¹)$ so the row is exact', done: [G('ℤ. Same as the circle.'), E('The disk has no holes, so its locks are $0$ on both sides. Squeezed between two $0$s, $∂$ is one-to-one and onto. It sends the whole disk to its rim, the loop that generates $H₁(S¹)$.')] },
      {
        type: 'ask',
        question: 'If $0 → P → Q → 0$ is exact, what can you say?',
        options: ['$P ≅ Q$', '$P = 0$', 'Nothing'],
        answer: '$P ≅ Q$',
        wrong: [E('Exact at $P$: one-to-one. Exact at $Q$: onto. So the map is…')],
        right: [E('An isomorphism. Zeros on both sides pin a group down completely. Remember that; we’ll lean on it all the way to the sphere.'), E('Last channel is north-east, on the NEXT ring.')],
      },
    ],
  },
  five: {
    blueprint: 'Five Locks',
    arrive: [
      E('$0 → ℤ →×2 ℤ → ? → 0$. The first sluice doubles every number. The next one sends $ℤ$ onto the unknown lock.'),
      E('Find the group that makes the row exact. Click the unknown lock with the Blade.'),
    ],
    early: [E('Not this channel yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Find the last group so the row is exact', done: [G('ℤ₂. Evens and odds!'), E('Doubling delivers the even numbers, so exactness says the evens drain to $0$. What survives is whether a number is even or odd: $ℤ₂$.')] },
      {
        type: 'ask',
        question: 'Exactness at $ℤ$ (the middle) says the map $q$ kills exactly…',
        options: ['the even numbers', 'nothing', 'everything'],
        answer: 'the even numbers',
        wrong: [E('What does $×2$ deliver to the middle lock?')],
        right: [E('Exactly what $×2$ delivers. The gate’s north of this channel.'), G('And you still owe me a name.'), E('I know.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your sluices are still set. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next channel is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A sequence of maps is exact when the image of each map is the kernel of the next. A pair (X, A) gives relative homology Hₙ(X, A) and a long exact sequence … → Hₙ(A) → Hₙ(X) → Hₙ(X, A) → Hₙ₋₁(A) → …; zeros around a group pin it down, as with H₂(D², S¹) ≅ H₁(S¹) ≅ ℤ.',
  cite: 'Hatcher, Algebraic Topology §2.1, pp. 113–118 (exact sequences; relative homology; long exact sequence of a pair).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

/** Is the station's row exact everywhere? */
export function rowExact(id, bag) {
  const row = ROWS[id]
  if (row.answer) return bag.pick?.[id] === row.answer
  return exactness(row.locks, rowKs(id, bag)).every((x) => x === null || x.exact)
}
export const nextCandidate = (g) => CANDIDATES[(CANDIDATES.indexOf(g) + 1) % CANDIDATES.length]
export const groupName = (g) => GROUPS[g]?.name || '?'

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase, bag } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every channel’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'exact') return [E('The blue tiles are $0$ and $2$. Which “$1 ↦ k$” delivers exactly those two?')]
  if (current === 'chase') {
    const info = exactness(ROWS.chase.locks, rowKs('chase', bag))
    if (!info[1].exact) return [E('The left $ℤ₂$ only gets $0$ from the $0$ lock, so only $0$ may drain there. The first sluice mustn’t send $1$ to $0$.')]
    if (!info[3].exact) return [E('The right $ℤ₂$ drains everything into $0$, so everything has to arrive. The second sluice has to hit $1$.')]
    return [E('Now check the middle lock: gold rings on exactly the blue tiles.')]
  }
  if (current === 'pair') return [E('The locks either side of $∂$, apart from $H₁(S¹)$, belong to the disk, and a disk has no holes: they’re $0$. What does that force $∂$ to be?')]
  return [E('The map in delivers the even numbers. The unknown lock is what’s left of $ℤ$ once the evens drain to $0$.')]
}
