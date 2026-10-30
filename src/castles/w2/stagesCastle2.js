/**
 * World 2 · Castle "The Retractor": Count Null's three trials, a review of World 2 (Hatcher Ch. 2).
 * Each round Null puts three claims on the floor of his engine-hall, each with a picture and a
 * judgment beacon. Lash the beacons of the forgeries; spare the honest ones.
 *   Trial 1  Boundaries    — ∂ of simplices, ∂∂ = 0, cycles vs boundaries (§2.1, Ex. 2.2, 2.3)
 *   Trial 2  The census    — homology of named spaces, torsion, ℤ₂ coefficients (Ex. 2.36, 2.42, 2.47, 2.50)
 *   Trial 3  Dial & count  — degree (§2.2 (b), (f), Ex. 2.32), χ = Σ(−1)ⁿ rank Hₙ, Mayer–Vietoris (Ex. 2.46)
 * Then the Retractor: Null tries to retract the ball onto its skin; three chain anchors, three
 * lines of Corollary 2.15's proof.
 *
 * Every exhibit: { claim, pic } — the claim card's text and the picture drawn on the panel.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const PANELS = [
  [-5, 0.4],
  [0, 2.9],
  [5, 0.4],
]
export const BEACON_OFFSET = [0, -2.1]
export const NULL_AT = [0, -7.3]
export const ENGINE_AT = [0, -15.5] // the Retractor itself, behind the throne
/** The three chain anchors of the final phase (on the floor, near the rim). */
export const ANCHORS = [
  [-6.2, -3.2],
  [6.2, -3.2],
  [0, 3.5],
]

export const EXHIBITS = {
  // ---- Trial 1: boundaries
  tri: { pic: 'tri', claim: '$∂[v₀,v₁,v₂] = [v₁,v₂] − [v₀,v₂] + [v₀,v₁]$' },
  signs: { pic: 'tri', claim: '$∂[v₀,v₁,v₂] = [v₁,v₂] + [v₀,v₂] + [v₀,v₁]$ — signs are decoration' },
  dd: { pic: 'tri', claim: '$∂∂[v₀,v₁,v₂] = (v₂ − v₁) − (v₂ − v₀) + (v₁ − v₀) = 0$' },
  ringfill: { pic: 'circle1', claim: 'Circle, one vertex $v$, one edge $e$: $∂e = v − v = 0$, so $e$ is a boundary' },
  torusUL: { pic: 'torusSq', claim: 'Torus: $∂U = a + b − c = ∂L$, so $U − L$ is a 2-cycle' },
  torusab: { pic: 'torusSq', claim: 'Same torus: $a + b$ is a boundary' },
  // ---- Trial 2: the census
  sphere: { pic: 'sphere', claim: '$H₀(S²) = ℤ$, $H₁(S²) = 0$, $H₂(S²) = ℤ$' },
  sphereH1: { pic: 'sphere', claim: '$H₁(S²) = ℤ$ — look, an equator' },
  klein: { pic: 'klein', claim: 'Klein bottle: $H₁(K) = ℤ ⊕ ℤ₂$, $H₂(K) = 0$' },
  kleinH2: { pic: 'klein', claim: 'Klein bottle: $H₂(K) = ℤ$, same as the torus' },
  rp2: { pic: 'rp2', claim: '$H₁(ℝP²) = ℤ$' },
  rp2mod2: { pic: 'rp2', claim: 'Mod 2: $H₂(ℝP²; ℤ₂) = ℤ₂$' },
  bitorus: { pic: 'bitorus', claim: 'Bitorus: $H₁(Σ₂) = ℤ⁴$, $H₂(Σ₂) = ℤ$' },
  bitorusF: { pic: 'bitorus', claim: 'Bitorus: $H₁(Σ₂) = ℤ²$' },
  torus: { pic: 'torus', claim: 'Torus: $H₁(T) = ℤ²$, $H₂(T) = ℤ$' },
  // ---- Trial 3: dial and count
  zk: { pic: 'wind3', claim: '$z ↦ z³$ on $S¹$ has degree $3$' },
  anti: { pic: 'antipodal', claim: 'The antipodal map of $S²$ has degree $+1$ — so it’s homotopic to the identity' },
  antiS1: { pic: 'antipodal1', claim: 'The antipodal map of $S¹$ has degree $+1$' },
  compose: { pic: 'wind3', claim: 'deg$(z² ∘ z³) = 2 + 3 = 5$' },
  miss: { pic: 'missing', claim: 'A map $S² → S²$ that misses a point can still have degree $1$' },
  chiT: { pic: 'torus', claim: '$χ(T) = 1 − 2 + 1 = 0$ (ranks of $H₀, H₁, H₂$)' },
  chiK: { pic: 'klein', claim: '$χ(K) = 1 − 2 + 0 = −1$, since $H₁(K) = ℤ ⊕ ℤ₂$' },
  chiS: { pic: 'bitorus', claim: '$χ(Σ₂) = 1 − 4 + 1 = −2$' },
  mv: { pic: 'mv', claim: 'Mayer–Vietoris: $S²$ = two disks meeting in $S¹$, so $H₂(S²) ≅ H₁(S¹) = ℤ$' },
}

export const OPENING = [
  N('Welcome to my Retractor, Gyroid. Emmy knows these plans. We drew the first press together, on the back of a post slip.'),
  E('We drew presses. Not this.'),
  N('You count chains now, I hear. Then three trials of counting. Each round, three claims on my floor.'),
  N('Lash the beacon of every forgery. Spare the honest ones, or my Crown corrects you.'),
]

export const TRIALS = [
  {
    name: 'Boundaries',
    blurb: '∂ drops one vertex at a time with alternating signs, and ∂∂ = 0. A cycle has ∂ = 0; a boundary is ∂ of something. They aren’t the same.',
    intro: [
      N('Trial one: boundaries. Simplices, their faces, and the sums I make of them.'),
      E('Check the signs. And for each chain ask two questions: is it a cycle, and is it a boundary? They’re different questions.'),
    ],
    rounds: [
      ['tri', 'signs', 'dd'],
      ['ringfill', 'torusUL', 'torusab'],
    ],
    honest: ['tri', 'dd', 'torusUL'],
    why: {
      signs: 'Without the signs, ∂∂ = (v₂ − v₁) + (v₂ − v₀) + (v₁ − v₀) = 2v₂ − 2v₀, not 0. The alternating signs are what make ∂∂ = 0.',
      ringfill: '∂e = 0 makes e a cycle, not a boundary. A boundary has to be ∂ of a 2-chain, and this circle has no 2-simplices. So [e] ≠ 0, and H₁(S¹) = ℤ (Hatcher Ex. 2.2).',
      torusab: 'The torus’s boundaries are the multiples of ∂U = a + b − c. a + b isn’t one of them. It’s homologous to c, a nonzero class in H₁(T) = ℤ².',
    },
    spared: {
      tri: 'That was Hatcher’s formula: drop vᵢ and give that face the sign (−1)ⁱ. Honest.',
      dd: 'Every vertex shows up twice with opposite signs, so ∂∂ = 0. Every boundary is a cycle. Honest.',
      torusUL: 'Hatcher’s Example 2.3: ∂(U − L) = 0 and there are no 3-simplices, so U − L generates H₂(T) = ℤ. Honest.',
    },
    done: [N('Hm. You can read a sign.'), N('The Delta’s own beasts, then. Entertain him.')],
  },
  {
    name: 'The census',
    blurb: 'Hₙ = cycles / boundaries. Count what closes up, cancel what bounds, and watch for torsion and coefficients.',
    intro: [
      N('Trial two: the census. I name a place and read its homology aloud. Some readings are false.'),
      E('Remember the cell counts. A 2-cell glued on with boundary 2a kills twice a, not a. And mod 2, a 2 is a 0.'),
    ],
    rounds: [
      ['sphere', 'sphereH1', 'klein'],
      ['rp2', 'bitorus', 'kleinH2'],
      ['rp2mod2', 'bitorusF', 'torus'],
    ],
    honest: ['sphere', 'klein', 'bitorus', 'rp2mod2', 'torus'],
    why: {
      sphereH1: 'The equator bounds a hemisphere, so it’s a boundary and its class is 0. H₁(S²) = 0. The sphere’s hole is in H₂.',
      kleinH2: 'K’s 2-cell is glued along a b a b⁻¹. The b’s cancel and the a’s add, so d₂ = 2a ≠ 0. Nothing is a 2-cycle: H₂(K) = 0 (Hatcher Ex. 2.47 gets it by Mayer–Vietoris).',
      rp2: 'ℝP²’s 2-cell wraps its loop twice: d₂ = 2. Twice the loop bounds, the loop itself doesn’t. H₁(ℝP²) = ℤ₂ (Hatcher Ex. 2.42).',
      bitorusF: 'One 0-cell, four 1-cells, one 2-cell glued along [a₁,b₁][a₂,b₂]. Every cellular boundary is 0, so H₁(Σ₂) = ℤ⁴. Each handle has two loops.',
    },
    spared: {
      sphere: 'Every loop on S² bounds, but the whole skin is a 2-cycle that nothing bounds. H₂(S²) = ℤ. Honest.',
      klein: 'd₂ = 2a: ℤ⟨a, b⟩ divided by 2a is ℤ ⊕ ℤ₂, and nothing survives in degree 2. Honest.',
      bitorus: 'Hatcher’s Example 2.36: the commutators abelianize to 0, so every cellular boundary is 0. H₁ = ℤ⁴, H₂ = ℤ. Honest.',
      rp2mod2: 'Mod 2 the cellular boundary “times 2” becomes 0, so the 2-cell is a cycle. H₂(ℝP²; ℤ₂) = ℤ₂ (Hatcher Ex. 2.50). Honest.',
      torus: 'One vertex, three edges, two triangles: H₁(T) = ℤ², H₂(T) = ℤ. Honest.',
    },
    done: [N('Ranks. Torsion. Coefficients. She taught you well. She taught me too, once.'), E('Don’t, Null.'), N('Spawn.')],
  },
  {
    name: 'Dial and count',
    blurb: 'Degrees multiply, the antipodal map of Sⁿ has degree (−1)ⁿ⁺¹, and a map that misses a point has degree 0. χ = Σ(−1)ⁿ rank Hₙ, and torsion has rank 0.',
    intro: [
      N('Trial three: your Dial and your Euler count. Degrees, χ, and the long sequences you’re so proud of.'),
      E('Degrees multiply. Torsion has rank zero. And in an exact sequence, the image of each map is the kernel of the next.'),
    ],
    rounds: [
      ['zk', 'anti', 'chiT'],
      ['mv', 'compose', 'chiK'],
      ['miss', 'chiS', 'antiS1'],
    ],
    honest: ['zk', 'chiT', 'mv', 'chiS', 'antiS1'],
    why: {
      anti: 'The antipodal map of Sⁿ is n + 1 reflections, so its degree is (−1)ⁿ⁺¹. On S² that’s −1. It is not homotopic to the identity, which is why S² can’t be combed (Theorem 2.28).',
      compose: 'Degrees multiply: deg(f ∘ g) = deg f · deg g. z² ∘ z³ = z⁶, degree 6, not 5.',
      chiK: 'Torsion has rank 0: rank(ℤ ⊕ ℤ₂) = 1. So χ(K) = 1 − 1 + 0 = 0, and the cells agree: 1 − 3 + 2 = 0.',
      miss: 'A map that misses a point factors through S² minus a point, which is contractible. So it has degree 0 (Hatcher §2.2, property (b)).',
    },
    spared: {
      zk: 'Hatcher’s Example 2.32: z ↦ zᵏ wraps the circle k times, so its degree is k. Honest.',
      chiT: 'χ = Σ(−1)ⁿ rank Hₙ = 1 − 2 + 1 = 0. Count cells instead (1 − 3 + 2) and you get the same. Honest.',
      mv: 'Hatcher’s Example 2.46: the disks have no reduced homology, so exactness makes H̃₂(S²) → H̃₁(S¹) an isomorphism. Honest.',
      chiS: 'H₀ = ℤ, H₁ = ℤ⁴, H₂ = ℤ: χ = 1 − 4 + 1 = −2. Honest.',
      antiS1: 'On S¹, n = 1: (−1)² = +1. It’s a half-turn rotation, homotopic to the identity. Honest.',
    },
    done: [N('Enough.')],
  },
]

/** Spawn waves between trials: [type, x, z] (the Delta's beasts: Klein 2-1, bitorus 2-7). */
// (Gyroid is set back at the start, (0, 7.2), when a wave begins: everything spawns across the floor from him)
export const WAVES = [
  [['klein', -3.5, -3], ['torus', 3.5, -3], ['torus', 0, 3], ['shard', -6.5, -3.5], ['shard', 6.5, -3.5]],
  [['projective', -4, -3], ['projective', 4, -3], ['klein', 0, 2.5], ['shard', -6.5, -3], ['shard', 6.5, -3], ['shard', 0, -4.5]],
]

/** The final phase: the Retractor's guard, around the three anchors. */
export const FINAL_GUARD = [
  ['bitorus', 0, -2.5],
  ['shard', -6.5, -1],
  ['shard', 6.5, -1],
  ['klein', -4, 1],
  ['projective', 4, 1],
]
export const ANCHOR_HP = 3

export const PUNISH = [
  ['shard', -2, -5],
  ['shard', 2, -5],
]

export const FINAL_INTRO = [
  N('No more trials. You count well, Gyroid. So count this.'),
  N('My Retractor. A ball is only its skin, stuffed. I squeeze the stuffing out onto the skin, and the whole Delta folds flat with it.'),
  E('He wants a retraction r: B³ → S², the ball onto its own boundary. Gyroid, break the three chain anchors. Three lashes each. Each one you break, I’ll give you a line of the proof.'),
  G('Then let’s write it fast.'),
]

/** One line of Corollary 2.15's proof per anchor broken (in the order they fall). */
export const PROOF = [
  [G('One anchor down! If r worked, it would fix the skin. So S² → B³ → S², in and then back out, is the identity.')],
  [E('Two! Now take H₂ of that round trip: ℤ → H₂(B³) → ℤ. But the ball is contractible, so H₂(B³) = 0.')],
  [G('Three! The identity on ℤ can’t pass through 0. There’s no retraction. Hatcher’s Corollary 2.15!')],
]

export const SEIZE = [
  N('…It’s stuck.'),
  E('It has to be. A retraction would make a hole out of nothing. The ball stays a ball, and the Delta stays whole.'),
]

export const HINTS_CASTLE = {
  wrong: (why) => [N(`No, Gyroid. That one was honest. ${why}`), N('The Crown will have to correct you. I’m sorry.')],
  knockout: E('Up, Gyroid. Hearts are back. He’s reset the floor, so we go again.'),
  knockoutFight: E('Up, Gyroid! Hearts back. Everything you broke stays broken. Go again.'),
}

export const DEFINITION_CASTLE = {
  text: 'World 2 in one breath: a chain is a sum of oriented simplices; ∂ drops one vertex at a time with alternating signs, so ∂∂ = 0; Hₙ = Ker ∂ₙ / Im ∂ₙ₊₁ counts cycles that don’t bound. Cellular homology computes it from cells (Sⁿ: ℤ in degrees 0 and n; Σ₂: ℤ, ℤ⁴, ℤ; ℝP²: ℤ, ℤ₂, 0; Klein bottle: ℤ, ℤ ⊕ ℤ₂, 0). A map Sⁿ → Sⁿ has a degree; degrees multiply, and the antipodal map has degree (−1)ⁿ⁺¹. χ = Σ(−1)ⁿ rank Hₙ. Mayer–Vietoris glues homology from pieces, and ℤ₂ coefficients see top classes of non-orientable surfaces. ∂Dⁿ is not a retract of Dⁿ. But homology groups alone can’t tell the torus from S¹ ∨ S¹ ∨ S².',
  cite: 'Allen Hatcher, Algebraic Topology, Chapter 2: §2.1 (Ex. 2.2–2.5, Cor. 2.15), §2.2 (degree, Ex. 2.32, 2.36, 2.42, 2.46, 2.47, 2.50; Theorem 2.28).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}
