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
  E('The Chase Channels. Each lock is a group; each sluice is a map that carries one lock’s tiles into the next.'),
  E('A row of locks is exact when, at every lock, what pours in is exactly what drains away to $0$ on the way out.'),
  G('In equals drained. Got it, I think.'),
  E('The Blade (7) resets a sluice gate. First channel is west.'),
]

export const STATIONS = {
  exact: {
    blueprint: 'Exact Locks',
    arrive: [
      E('$ℤ₄ → ℤ₄ → ℤ₂$. The right sluice is fixed: it sends each tile to its remainder mod 2. Blue tiles in the middle lock drain to $0$.'),
      E('Gold rings show what the left sluice delivers. Click the left sluice with the Blade to change where it sends $1$, until gold matches blue.'),
    ],
    early: [E('Not yet — finish the earlier channel first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make the middle lock exact: gold rings exactly on the blue tiles', done: [G('Gold on blue, nowhere else.'), E('$1 ↦ 2$ delivers {0, 2}, and {0, 2} is exactly what drains to $0$ mod 2.')] },
      {
        type: 'ask',
        question: 'What does “exact at the middle lock” mean?',
        options: ['The image of the map in equals the kernel of the map out', 'Every tile gets delivered', 'The two maps are the same'],
        answer: 'The image of the map in equals the kernel of the map out',
        wrong: [E('Gold is what arrives; blue is what drains to $0$. Exact means those are the same set.')],
        right: [E('Im $f$ = Ker $g$. Next channel is east.')],
      },
    ],
  },
  chase: {
    blueprint: 'The Chase',
    arrive: [
      E('$0 → ℤ₂ → ℤ₄ → ℤ₂ → 0$. Both middle sluices are yours. Make all three inner locks exact.'),
      E('The left lock is fed by $0$, so nothing may drain there except $0$. The right lock drains into $0$, so everything must arrive.'),
    ],
    early: [E('Not yet — finish the earlier channel first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Make all three inner locks exact', done: [G('All three green.'), E('That’s a short exact sequence: $0 → A → B → C → 0$.')] },
      {
        type: 'ask',
        question: 'In a short exact sequence $0 → A →f B →g C → 0$, what do the ends force?',
        options: ['$f$ is one-to-one and $g$ is onto', '$f$ is onto and $g$ is one-to-one', 'Both maps are zero'],
        answer: '$f$ is one-to-one and $g$ is onto',
        wrong: [E('Exact at $A$: only $0$ drains to $0$. Exact at $C$: everything must arrive.')],
        right: [E('Right. Next channel is north of the first.')],
      },
    ],
  },
  pair: {
    blueprint: 'A Place and a Part',
    arrive: [
      E('A place $X$ and a part $A$ inside it give relative homology $Hₙ(X, A)$ — chains of $X$ where anything in $A$ counts as $0$.'),
      E('They fit in a long exact sequence: $… → Hₙ(A) → Hₙ(X) → Hₙ(X, A) →∂ Hₙ₋₁(A) → …$ Here $X$ is the disk and $A$ its rim circle.'),
      E('One lock is unknown: $H₂(D², S¹)$. Click it with the Blade to try a group, until the whole row is exact.'),
    ],
    early: [E('Not yet — finish the earlier channel first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Find $H₂(D², S¹)$ so the row is exact', done: [G('ℤ. Same as the circle.'), E('Squeezed between two $0$s, $∂$ has to be one-to-one and onto. It sends the whole disk to its rim.')] },
      {
        type: 'ask',
        question: 'If $0 → P → Q → 0$ is exact, what can you say?',
        options: ['$P ≅ Q$', '$P = 0$', 'Nothing'],
        answer: '$P ≅ Q$',
        wrong: [E('Exact at $P$: one-to-one. Exact at $Q$: onto. So the map is…')],
        right: [E('An isomorphism. Zeros on both sides pin a group down. Last channel is east.')],
      },
    ],
  },
  five: {
    blueprint: 'Five Locks',
    arrive: [
      E('$0 → ℤ →×2 ℤ → ? → 0$. The first sluice doubles; the next one sends ℤ onto the unknown lock.'),
      E('Find the group that makes it exact — click the unknown lock with the Blade.'),
    ],
    early: [E('Not yet — finish the earlier channel first. Follow NEXT on the map.')],
    goals: [
      { type: 'action', hint: 'Find the last group so the row is exact', done: [G('ℤ₂ — evens and odds!'), E('What arrives is the even numbers, so they must drain to $0$ — and what’s left is “even or odd”.')] },
      {
        type: 'ask',
        question: 'Exactness at $ℤ$ (the middle) says the map $q$ kills exactly…',
        options: ['the even numbers', 'nothing', 'everything'],
        answer: 'the even numbers',
        wrong: [E('What does $×2$ deliver to the middle lock?')],
        right: [E('Exactly the image of $×2$. The gate’s open — south of the last channel.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your sluices stay set. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next channel is ${name} — follow NEXT on the map.`),
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
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every channel is done. Walk through the gate to the south.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'exact') return [E('Blue tiles are $0$ and $2$. Which choice of “$1 ↦ k$” delivers exactly those?')]
  if (current === 'chase') {
    const info = exactness(ROWS.chase.locks, rowKs('chase', bag))
    if (!info[1].exact) return [E('The left $ℤ₂$ gets only $0$ from the $0$ lock, so only $0$ may drain there. The first sluice must not send $1$ to $0$.')]
    if (!info[3].exact) return [E('The right $ℤ₂$ drains everything into $0$, so everything must arrive. The second sluice has to hit $1$.')]
    return [E('Check the middle lock: gold rings on exactly the blue tiles.')]
  }
  if (current === 'pair') return [E('The locks on both sides of $∂$ that aren’t $H₁(S¹)$ are $0$. What does that force $∂$ to be?')]
  return [E('The map in delivers the even numbers. The unknown lock is what’s left of ℤ when the evens drain to $0$.')]
}
