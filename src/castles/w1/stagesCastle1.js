/**
 * World 1 · Castle "The Delta Sphere" — Count Null's three trials on the flattened pole of his
 * sphere, a review of World 1 (Hatcher Ch. 1). Each round, three demonstrations on the floor and a
 * judgment beacon by each: lash the forgeries, spare the honest ones.
 *   Trial 1  Same loop?     — two loops at a post on a ring; homotopic rel the post ⇔ same winding
 *                             number (π₁(S¹) = ℤ, Thm 1.7; the annulus deformation retracts to S¹)
 *   Trial 2  Forged lifts   — lifts of loops to the helix ℝ → S¹ (path lifting, Prop 1.30;
 *                             the lift's end level is the winding number)
 *   Trial 3  Word claims    — π₁(S¹ ∨ S¹) is free on a, b: only free reductions (§1.2); on the
 *                             torus π₁ = ℤ × ℤ (Prop 1.12), so a b a⁻¹ b⁻¹ = 1 there
 * Then the Crown's guard (the final wave), and Null sends them off his sphere → the outro movie.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const PANELS = [
  [-5, 0.6],
  [0, 3.4],
  [5, 0.6],
]
export const BEACON_OFFSET = [0, -2.1]
export const NULL_AT = [0, -7.3]
export const START = [0, 7.2]

// ---------------------------------------------------------------- Trial 1: loops on a ring
/**
 * Loops on a ring of rock (an annulus round a hole), all based at the gold post at angle 0,
 * radius 1.1. Each is s ∈ [0, 1] → [θ, r] (θ the continuous angle, anticlockwise seen from
 * above; r stays inside the rock, 0.45 < r < 1.75). Its winding number is (θ(1) − θ(0)) / 2π.
 */
const TAU = Math.PI * 2
export const LOOPS = {
  once: (s) => [TAU * s, 1.1 + 0.3 * Math.sin(TAU * s)],
  wobble: (s) => [TAU * s + 0.5 * Math.sin(TAU * s), 1.1 + 0.32 * Math.sin(3 * TAU * s)],
  back: (s) => [-TAU * s, 1.1 + 0.3 * Math.sin(TAU * s)],
  backwob: (s) => [-TAU * s - 0.4 * Math.sin(2 * TAU * s), 1.1 - 0.35 * Math.sin(2 * TAU * s)],
  twice: (s) => [2 * TAU * s, 1.1 + 0.4 * Math.sin(TAU * s)],
  petal: (s) => [0.9 * Math.sin(TAU * s), 1.1 + 0.45 * Math.sin(Math.PI * s)],
  thereback: (s) => [TAU * (1 - Math.abs(2 * s - 1)), 1.1 + 0.3 * Math.sin(TAU * s)],
  still: () => [0, 1.1],
}
export const windingOf = (id) => Math.round((LOOPS[id](1)[0] - LOOPS[id](0)[0]) / TAU)

// ---------------------------------------------------------------- Trial 2: lifts to the helix
/**
 * The helix over a circle on the floor (the cover ℝ → S¹, Hatcher §1.1). Each exhibit is a loop
 * downstairs (its angle) and Null's claimed lift (its angle, and its level: height in floors of
 * the helix, level k sitting over the post). s ∈ [0, 1].
 *   honest: the lift sits over the loop, on the helix, and is continuous — so it ends at
 *   start + winding number. Forgeries break exactly one of those three.
 */
export const LIFTS = {
  lift1: { loop: (s) => TAU * s, up: (s) => TAU * s, level: (s) => s },
  lift2: { loop: (s) => 2 * TAU * s, up: (s) => 2 * TAU * s, level: (s) => 2 * s },
  liftback: { loop: (s) => -TAU * s, up: (s) => -TAU * s, level: (s) => -s },
  from1: { loop: (s) => TAU * s, up: (s) => TAU * s, level: (s) => 1 + s },
  // forgery: over the loop and on the helix, but it drops a whole floor halfway (not continuous)
  jump: { loop: (s) => 2 * TAU * s, up: (s) => 2 * TAU * s, level: (s) => (s < 0.5 ? 2 * s : 2 * s - 1), jumpAt: 0.5 },
  // forgery: the loop goes half round and back (winding 0); the "lift" keeps climbing — not over the loop
  drift: { loop: (s) => Math.PI * (1 - Math.abs(2 * s - 1)), up: (s) => TAU * s, level: (s) => s },
  // forgery: over the loop, but flat at level 0 — off the helix (not in the covering space)
  lazy: { loop: (s) => TAU * s, up: (s) => TAU * s, level: () => 0 },
}

// ---------------------------------------------------------------- Trial 3: words
/** a, A = a⁻¹, b, B = b⁻¹. */
export const WORDS = {
  cancel: { space: 'eight', lhs: 'abBA', rhs: '', text: 'a b b⁻¹ a⁻¹ = 1' },
  cancel2: { space: 'eight', lhs: 'baABa', rhs: 'a', text: 'b a a⁻¹ b⁻¹ a = a' },
  torus: { space: 'torus', lhs: 'abAB', rhs: '', text: 'a b a⁻¹ b⁻¹ = 1' },
  comm: { space: 'eight', lhs: 'abAB', rhs: '', text: 'a b a⁻¹ b⁻¹ = 1' },
  swap: { space: 'eight', lhs: 'ab', rhs: 'ba', text: 'a b = b a' },
  conj: { space: 'eight', lhs: 'abA', rhs: 'b', text: 'a b a⁻¹ = b' },
}
/** Free reduction: cancel a letter next to its own inverse until none are left. */
export function reduceFree(w) {
  const out = []
  for (const c of w) {
    const top = out[out.length - 1]
    if (top && top !== c && top.toLowerCase() === c.toLowerCase()) out.pop()
    else out.push(c)
  }
  return out.join('')
}
/** In ℤ × ℤ (the torus) only the exponent sums of a and of b matter. */
const sums = (w) => [...w].reduce(([x, y], c) => (c === 'a' ? [x + 1, y] : c === 'A' ? [x - 1, y] : c === 'b' ? [x, y + 1] : c === 'B' ? [x, y - 1] : [x, y]), [0, 0])
export function wordClaimTrue(id) {
  const c = WORDS[id]
  if (c.space === 'torus') {
    const [p, q] = [sums(c.lhs), sums(c.rhs)]
    return p[0] === q[0] && p[1] === q[1]
  }
  return reduceFree(c.lhs) === reduceFree(c.rhs)
}

// ---------------------------------------------------------------- the dialogue
export const OPENING = [
  N('Welcome to the top of my sphere, courier. Haven has its hole back, and its proof sits on Emmy’s Chart. Well done.'),
  N('Here, every loop comes home to nothing. Three trials. Each round I show you three things on my floor. Some honest, some forged.'),
  N('Lash the beacon by a forgery and spare the honest ones. Lash an honest one, and my Crown cuts you.'),
  E('Everything we learned in the Bastion, Gyroid: paths, lifts, words. Watch each one all the way through before you lash.'),
]

export const TRIALS = [
  {
    name: 'Same loop?',
    blurb: 'Two loops from the gold post. They deform into each other, post held still, exactly when they wind round the hole the same number of times.',
    intro: [
      N('Trial one. Pairs of loops on rings of rock, both starting at the gold post. I say each pair deforms into each other, with the post held still.'),
      E('Then they must have the same winding number. Count the laps round the hole, and watch which way each bead runs: anticlockwise is +1, clockwise is −1.'),
    ],
    rounds: [
      [['once', 'wobble'], ['once', 'back'], ['twice', 'once']],
      [['petal', 'once'], ['thereback', 'still'], ['back', 'backwob']],
    ],
    honest: ['once+wobble', 'thereback+still', 'back+backwob'],
    why: {
      'once+back': 'One winds once anticlockwise, +1. The other winds once clockwise, −1. Different winding numbers, so no deformation with the post fixed can carry one to the other.',
      'twice+once': 'One goes round the hole twice, the other once: 2 against 1. π₁ of a ring is ℤ, and different numbers are different loops.',
      'petal+once': 'The petal never goes round the hole, so its winding number is 0. The other winds once. 0 ≠ 1.',
    },
    spared: {
      'once+wobble': 'Both wind once anticlockwise. Wobbles don’t matter: same winding number, so they deform into each other. Honest.',
      'thereback+still': 'Once round and straight back is +1 then −1, which is 0. It shrinks to the loop that just stays at the post. Honest.',
      'back+backwob': 'Both wind once clockwise: −1 and −1. The same element of π₁, so they’re homotopic. Honest.',
    },
    done: [N('You can count to one. Charming.'), N('Count while you run, then. Spawn!')],
  },
  {
    name: 'Forged lifts',
    blurb: 'A lift sits right above its loop at every moment, stays on the helix, and never jumps. From level 0 it ends at the winding number.',
    intro: [
      N('Trial two. My helix. Every loop on the floor has a lift: a path on the helix, sitting right above the loop the whole way.'),
      E('Once you know where a lift starts, it’s unique. From level 0 it ends at the loop’s winding number. A real lift never jumps, never leaves the helix, and never strays from above its loop.'),
      G('Watch the bead up top and the bead on the floor together. Got it.'),
    ],
    rounds: [
      ['lift1', 'jump', 'liftback'],
      ['drift', 'from1', 'lazy'],
      ['lift2', 'lazy', 'jump'],
    ],
    honest: ['lift1', 'lift2', 'liftback', 'from1'],
    why: {
      jump: 'His lift dropped a whole floor halfway round. A lift is a path, so it can’t jump. Over a loop that winds twice, the lift from 0 has to climb to 2.',
      drift: 'The lift kept climbing while the loop below turned back. A lift has to sit right above its loop the whole time. Half round and back lifts to up and back down, ending at 0.',
      lazy: 'That flat circle isn’t on the helix at all. A lift has to stay in the covering space, and the only lift of that loop from level 0 climbs to level 1.',
    },
    spared: {
      lift1: 'Once round, one floor up: from 0 to 1. Exactly the winding number. Honest.',
      lift2: 'Twice round, two floors up: from 0 to 2. Honest.',
      liftback: 'Once round clockwise, one floor down: from 0 to −1. Honest.',
      from1: 'It started on level 1, not 0. That’s allowed: it’s the same lift moved up a floor. Once round still climbs one floor, from 1 to 2. Honest.',
    },
    done: [N('Floors. Ladders. Little beads.'), N('Let us see how your ladders hold up against my menagerie.')],
  },
  {
    name: 'Word claims',
    blurb: 'On the figure-eight, π₁ is free on a and b: cancel a letter only next to its own inverse. Nothing commutes. On the torus, a b a⁻¹ b⁻¹ = 1.',
    intro: [
      N('Trial three. Words. A loop on my figure-eight spells a word in a and b, and I tell you which words are equal.'),
      E('On the figure-eight, π₁ is the free group on a and b. The only legal move is cancelling a letter next to its own inverse. Nothing commutes.'),
      E('A torus is different. Its square glues a disk along a b a⁻¹ b⁻¹, so on the torus that word shrinks. Check which space each claim is about.'),
    ],
    rounds: [
      ['cancel', 'comm', 'torus'],
      ['swap', 'cancel2', 'conj'],
    ],
    honest: ['cancel', 'cancel2', 'torus'],
    why: {
      comm: 'No letter in a b a⁻¹ b⁻¹ sits next to its own inverse, so it’s already reduced, and it isn’t 1. On the figure-eight, a and b don’t commute.',
      swap: 'a b and b a are different reduced words. In a free group, reduced words are equal only when they’re identical.',
      conj: 'a b a⁻¹ is reduced, and it isn’t b. It would equal b only if a and b commuted, and on the figure-eight they don’t.',
    },
    spared: {
      cancel: 'b b⁻¹ cancels, then a a⁻¹ cancels: nothing is left. Free reduction, nothing else. Honest.',
      cancel2: 'a a⁻¹ cancels, then b b⁻¹. What’s left is a. Honest.',
      torus: 'On the torus, π₁ is ℤ × ℤ. The loop a b a⁻¹ b⁻¹ runs round the edge of the square, and the square shrinks to its corner, taking the loop with it. Honest, on the torus.',
    },
    done: [N('Enough!'), N('Crown! Guard me!')],
  },
]

/** Waves after each trial; the third is the final phase (the Crown's guard). */
export const WAVES = [
  [['sphere', -3, 2], ['sphere', 3, 2], ['torus', 0, -3.2], ['mobius', -5.5, 3], ['shard', -5, -3], ['shard', 5, -3]],
  [['torus', -4, 3], ['mobius', 4, 3], ['projective', 0, -3.4], ['sphere', -6, 2.5], ['shard', -5, -2], ['shard', 5, -2]],
  [['projective', -5.5, 3], ['projective', 5.5, 3], ['mobius', 0, -2.6], ['torus', -5.5, 0], ['torus', 5.5, 0], ['sphere', -3, -4], ['sphere', 3, -4], ['shard', -6, -2], ['shard', 6, -2], ['shard', 0, -4.6]],
]

export const PUNISH = [
  ['shard', -2, -5],
  ['shard', 2, -5],
]

/** Before the final phase. */
export const GUARD = [
  N('The Crown’s own guard, then. My sphere’s children, and my Möbius hounds.'),
  E('Projectives need two lashes, close together. Möbius beasts speed up after the first cut. Keep moving!'),
]

/** After the final phase, into the end card and the outro. */
export const FINAL = [
  N('Every forgery exposed. Every guard broken. You’re very good at loops, Gyroid.'),
  G('Then it’s over. Take off the Crown.'),
  N('Over? We haven’t talked about my sphere yet.'),
  N('Off my sphere, courier. Stand on the causeway with Emmy. You’ll want a good view.'),
]

export const HINTS_CASTLE = {
  wrong: (why) => [N(`Ha! That one was honest. ${why}`), N('My Crown punishes the unjust. Shards!')],
  knockout: E('Up, Gyroid! Shake it off. Null has restarted the round.'),
}

export const DEFINITION_CASTLE1 = {
  text: 'World 1 in one paragraph: paths are homotopic rel endpoints when one deforms into the other with the ends held fixed; loops at a basepoint, up to homotopy, form the fundamental group π₁(X, x₀), multiplied by running one loop then the other. Lifting loops to the helix ℝ → S¹ shows π₁(S¹) ≅ ℤ, counted by the winding number; so the disk does not retract onto its rim, and Brouwer’s fixed-point theorem follows. π₁(X × Y) ≅ π₁(X) × π₁(Y); π₁ of a wedge of circles is free, and van Kampen computes π₁ of spaces glued together, so attaching a disk along a word kills that word. For nice spaces, connected covering spaces correspond, up to isomorphism, to subgroups of π₁ (Thm 1.38), and their deck transformations act on the sheets; S² double-covers ℝP², so π₁(ℝP²) ≅ ℤ₂. And every loop on the sphere S² shrinks: π₁(S²) = 0.',
  cite: 'Allen Hatcher, Algebraic Topology, Chapter 1: §1.1 (Thm 1.7, Thm 1.9, Prop 1.12, Prop 1.14), §1.2 (van Kampen), §1.3 (covering spaces, Prop 1.30, deck transformations).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
}
