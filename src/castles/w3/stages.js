/**
 * World 3 · Castle "The Counterfeit Station": the Commutator's three trials, a review of World 3
 * (Hatcher Ch. 3). Each round shows three demonstrations on the concourse, with a judgment beacon
 * by each. Lash the beacons of the forgeries and spare the honest ones.
 *   Trial 1  Coboundaries  : δf = f∘∂ read as head minus tail, δ² = 0, loop sums and H¹,
 *                            and the universal coefficient theorem's torsion shift (3-1, 3-2)
 *   Trial 2  Products      : cup products tell apart spaces with equal groups (3-3 to 3-6)
 *   Trial 3  Manifolds     : orientation round a band, Poincaré duality, the cup pairing (3-7 to 3-9)
 * Waves of the cohomology wing come between trials; the final phase is the Commutator's guard.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })
const C = (text) => ({ speaker: 'The Commutator', portrait: 'commutator', text })

export const PANELS = [
  [-5, 0.6],
  [0, 3.4],
  [5, 0.6],
]
export const BEACON_OFFSET = [0, -2.1]
export const BOSS_AT = [0, -7.3] // the Commutator's dais, under the Crown
export const START = [0, 7.2]

export const OPENING = [
  C('Welcome to the Counterfeit Station, post-runner. Every train in the Winding World stops here, and I am whatever your counts say I am. a b a⁻¹ b⁻¹. Order in all things.'),
  N('Gyroid. My marshal has three trials for you. Each round he puts three demonstrations on his floor. Some are honest. Some are his forgeries.'),
  N('Lash the beacon over every forgery and spare the honest ones. Lash an honest one and my Crown will cut you. Fail him, and I fold the Cup Product Gardens, gently. Every lantern. Every path.'),
  E('He’s speaking through the Crown. Gyroid, counting is what fooled us at the twins. Read every number on a demonstration, and check his claim, before you lash anything.'),
]

/**
 * Trial 1 demos: cochains on a triangle v₀v₁v₂ (edges oriented v₀→v₁, v₁→v₂, v₀→v₂).
 *   f       : the 0-cochain on the vertices (shown)
 *   edges   : the 1-cochain on [v₀v₁], [v₁v₂], [v₀v₂] (Null's claim when kind is 'df')
 *   face    : the claimed value on the face (kind 'dd')
 *   hollow  : the triangle's boundary only (a circle), kind 'loop'
 *   uct     : homology vs claimed cohomology of ℝP² (kind 'uct')
 */
export const COCHAIN_EX = {
  df_ok: { kind: 'df', f: [0, 2, 5], edges: [2, 3, 5], claim: 'edges = δf' },
  df_bad: { kind: 'df', f: [1, 4, 2], edges: [3, -2, 3], claim: 'edges = δf' },
  dd_ok: { kind: 'dd', f: [0, 2, 5], edges: [2, 3, 5], face: 0, claim: 'δ(δf) = 0' },
  dd_bad: { kind: 'dd', f: [1, 4, 2], edges: [3, -2, 1], face: 2, claim: 'δ(δf) = 2' },
  h1_ok: { kind: 'loop', edges: [1, 0, 0], claim: 'φ is no δf' },
  h1_bad: { kind: 'loop', edges: [1, 1, 2], claim: 'φ is no δf' },
  uct_ok: { kind: 'uct', homology: ['ℤ', 'ℤ₂', '0'], cohomology: ['ℤ', '0', 'ℤ₂'], shiftTo: 2, claim: 'H*(ℝP²; ℤ)' },
  uct_bad: { kind: 'uct', homology: ['ℤ', 'ℤ₂', '0'], cohomology: ['ℤ', 'ℤ₂', '0'], shiftTo: 1, claim: 'H*(ℝP²; ℤ)' },
}

/** Trial 2 demos: a cup product (or a ring's powers) cast on a space, with Null's claim. */
export const CUP_EX = {
  torus_ab: { kind: 'torus', loops: ['a', 'b'], lights: true, claim: 'α ⌣ β generates H²(T)' },
  torus_aa: { kind: 'torus', loops: ['a'], lights: false, claim: 'α ⌣ α generates H²(T)' },
  wedge_ab: { kind: 'wedge', claim: 'on S¹∨S¹∨S², α ⌣ β generates H²' },
  cp2: { kind: 'fount', f: { name: 'ℂP²', n: 2, deg: 2, coef: 'ℤ' }, claim: 'α² generates H⁴(ℂP²)' },
  s2s4: { kind: 'fount', f: { name: 'S² ∨ S⁴', n: 2, deg: 2, coef: 'ℤ', labels: { 2: 'γ' }, fizzleLabel: 'α² = 0 ≠ γ' }, fake: true, claim: 'on S²∨S⁴, α² generates H⁴' },
  rp3: { kind: 'fount', f: { name: 'ℝP³', n: 3, deg: 1, coef: 'ℤ₂' }, claim: 'H*(ℝP³; ℤ₂) = ℤ₂[α]/(α⁴)' },
}

/** Trial 3 demos: orientation carried round a band; Betti towers under duality; the cup pairing. */
export const MANIFOLD_EX = {
  cyl: { kind: 'band', twist: false, claim: 'the annulus is orientable' },
  mob: { kind: 'band', twist: true, claim: 'the Möbius band is orientable' },
  pd_torus: { kind: 'betti', ranks: [1, 2, 1], coef: 'ℤ', claim: 'torus T: closed, orientable' },
  pd_bad: { kind: 'betti', ranks: [1, 1, 0, 1], coef: 'ℤ', claim: 'a closed orientable 3-manifold' },
  rp2: { kind: 'betti', ranks: [1, 1, 1], coef: 'ℤ₂', claim: 'ℝP², duality mod 2' },
  pair_ok: { kind: 'pair', space: 'ℂP²', value: 1, claim: 'ℂP²: a closed orientable 4-manifold' },
  pair_bad: { kind: 'pair', space: 'S² ∨ S⁴', value: 0, claim: 'S²∨S⁴: a closed orientable 4-manifold' },
}

export const TRIALS = [
  {
    name: 'Coboundaries',
    blurb: 'δf on an edge is head minus tail. δ(δf) = 0 always. A δf sums to 0 round a loop.',
    intro: [
      C('Trial one: coboundaries. My cochain f puts a number on each corner. My δ writes numbers on the edges and the faces. Do my numbers add up? Check them, if you can subtract.'),
      E('Same as the Mirror Pools. $δf$ on an edge is head minus tail: $δf[v₀v₁] = f(v₁) − f(v₀)$. On a face, $δφ[v₀v₁v₂] = φ[v₁v₂] − φ[v₀v₂] + φ[v₀v₁]$, and $δ$ of $δ$ is always zero.'),
      E('On a hollow triangle, add φ round the loop: $φ[v₀v₁] + φ[v₁v₂] − φ[v₀v₂]$. Every $δf$ adds to 0 there, like heights round a hill. And if he shows you ℝP²: torsion in $H₁$ climbs one degree in cohomology.'),
    ],
    rounds: [
      ['df_ok', 'df_bad', 'dd_ok'],
      ['h1_ok', 'dd_bad', 'uct_ok'],
      ['uct_bad', 'dd_ok', 'h1_bad'],
    ],
    ex: COCHAIN_EX,
    honest: ['df_ok', 'dd_ok', 'h1_ok', 'uct_ok'],
    why: {
      df_bad: 'On $[v₀v₂]$, $δf = f(v₂) − f(v₀) = 2 − 1 = 1$, not 3. δf reads each edge as head minus tail.',
      dd_bad: 'On the face, $δ(δf) = δf[v₁v₂] − δf[v₀v₂] + δf[v₀v₁] = −2 − 1 + 3 = 0$. δ² = 0, always.',
      h1_bad: 'Round the loop, $1 + 1 − 2 = 0$, and indeed $φ = δf$ for $f = (0, 1, 2)$. It IS a coboundary.',
      uct_bad: '$H¹(ℝP²; ℤ) = Hom(H₁, ℤ) = Hom(ℤ₂, ℤ) = 0$. The torsion shifts up: $H² = Ext(ℤ₂, ℤ) = ℤ₂$ (Hatcher Theorem 3.2).',
    },
    spared: {
      df_ok: '$f(v₁) − f(v₀) = 2$, $f(v₂) − f(v₁) = 3$, $f(v₂) − f(v₀) = 5$. Head minus tail, every edge. Honest.',
      dd_ok: '$3 − 5 + 2 = 0$. δ of a coboundary is always 0. Honest.',
      h1_ok: 'Any δf sums to 0 round the loop, but φ sums to 1. So φ is no coboundary: a class in $H¹$ of the circle. Honest.',
      uct_ok: '$Hⁿ ≅ Hom(Hₙ, ℤ) ⊕ Ext(Hₙ₋₁, ℤ)$: $H¹ = 0$ and the ℤ₂ lands in $H²$. Honest.',
    },
    done: [C('A clerk’s trick. Anyone can subtract.'), N('Then let him meet your guard, marshal.'), E('Coboundary Harpies! A plain chain lash feeds them. Press G for cochain stance, then strike.')],
  },
  {
    name: 'Products',
    blurb: 'Same groups, different rings. Watch whether the product lights, then read his claim.',
    intro: [
      C('Trial two: products. Every one of my spaces wears the right groups. Go on. Multiply them.'),
      E('Watch each demonstration: does the product light, or stay dark? Then read his claim underneath. He can copy the groups. He can’t copy what they multiply to.'),
    ],
    rounds: [
      ['torus_ab', 'wedge_ab', 'cp2'],
      ['s2s4', 'rp3', 'torus_aa'],
    ],
    ex: CUP_EX,
    honest: ['torus_ab', 'cp2', 'rp3'],
    why: {
      wedge_ab: 'Same groups as the torus, but on $S¹ ∨ S¹ ∨ S²$, $α ⌣ β = 0$: both classes live on the circles, whose wedge has no $H²$ (Hatcher §3.2).',
      s2s4: 'Same groups as ℂP², but α comes from S², where $H⁴ = 0$. So $α² = 0$ and the $H⁴$ class γ is no power of α.',
      torus_aa: 'For a degree-1 class, $α ⌣ α = −α ⌣ α$ (graded commutativity, Theorem 3.11). So $2α² = 0$ in $H²(T) = ℤ$, and $α² = 0$.',
    },
    spared: {
      torus_ab: 'On the torus, $α ⌣ β$ generates $H²(T)$. Honest.',
      cp2: '$H*(ℂP²) = ℤ[α]/(α³)$: $α²$ generates $H⁴$ (Theorem 3.12). Honest.',
      rp3: '$H*(ℝPⁿ; ℤ₂) = ℤ₂[α]/(αⁿ⁺¹)$ with $|α| = 1$: ℝP³ climbs to $α³$ and stops (Theorem 3.12). Honest.',
    },
    done: [C('Then I will wear something grander.'), N('Spiders, marshal. Let him mind his signs.'), E('Cup Spiders: $α ⌣ β = −β ⌣ α$, so alternate stances, chain then cochain, or the web snaps back. The Projectives need two lashes, quickly.')],
  },
  {
    name: 'Manifolds',
    blurb: 'Carry the arrow round the core. On a closed orientable n-manifold, rank Hₖ = rank Hₙ₋ₖ, and every class of infinite order has a cup partner.',
    intro: [
      C('Trial three: manifolds. Carry an arrow round my bands, read my towers, pair my classes. I am closed and orientable, duality and all.'),
      E('Like the Compass Cliffs: carry the little arrow round the core. If it comes home reversed, the band is non-orientable.'),
      E('On a closed orientable n-manifold, duality forces $rank Hₖ = rank Hₙ₋ₖ$, and every generator of the free part has a cup partner giving $±1$. Mod 2, every closed manifold obeys duality.'),
    ],
    rounds: [
      ['cyl', 'mob', 'pd_torus'],
      ['pd_bad', 'rp2', 'pair_ok'],
      ['pair_ok', 'pair_bad', 'cyl'],
    ],
    ex: MANIFOLD_EX,
    honest: ['cyl', 'pd_torus', 'rp2', 'pair_ok'],
    why: {
      mob: 'Carried once round the core, the arrow came home reversed. The Möbius band is non-orientable.',
      pd_bad: 'Duality with UCT forces $rank H₂ = rank H₁ = 1$ on a closed orientable 3-manifold. Ranks 1, 1, 0, 1 don’t mirror.',
      pair_bad: '$H²(S² ∨ S⁴) = ℤ$, and $α ⌣ α = 0$. α has no partner, so the pairing is singular: no closed orientable 4-manifold (Proposition 3.38).',
    },
    spared: {
      cyl: 'Round the core and back, the arrow turns the same way. The annulus is orientable. Honest.',
      pd_torus: 'Ranks 1, 2, 1: $Hᵏ ≅ H₂₋ₖ$ mirrors perfectly. Honest.',
      rp2: 'ℤ₂, ℤ₂, ℤ₂. Every closed manifold is ℤ₂-orientable, so duality holds mod 2. Honest.',
      pair_ok: '$⟨α ⌣ α, [ℂP²]⟩ = 1$: α is its own partner. The pairing is perfect. Honest.',
    },
    done: [C('Enough! You want to see what I really am?'), C('Colossus, wake! Spectre, rise! And my own loops will finish you.'), E('A Poincaré Colossus: chain, then cochain, alternating. And a de Rham Spectre: run a full loop round it, then lash it while it’s exact. (De Rham forms go beyond our book.)'), G('His loops are shaking. He’s more scared of the Crown than of us.')],
  },
]

/** Spawn waves between trials (cohomology wing + Crown shards); the last one is the final phase. */
export const WAVES = [
  [['harpy', -3, 2], ['harpy', 3, 2], ['mobius', 0, 1.5], ['shard', -5, -3], ['shard', 5, -3]],
  [['spider', -3.5, 2.5], ['projective', 3.5, 2.5], ['harpy', 0, 5.5], ['shard', -5, -2], ['shard', 5, -2]],
  [['colossus', 0, 1.5], ['spectre', -4.5, 3.5], ['spider', 4.5, 3.5], ['shard', -5, -2.5], ['shard', 5, -2.5], ['shard', 0, -4.2]],
]

export const PUNISH = [
  ['shard', -2, -5],
  ['shard', 2, -5],
]

/** The final phase is the Commutator's turn: his taunts as his loops fling Crown shards at Gyroid. */
export const COMMUTES = [
  'The Commutator: “a b a⁻¹ b⁻¹! Order, runner!”',
  'The Commutator: “Every loop answers to me!”',
  'The Commutator: “Round and back, and you’re nowhere!”',
  'The Commutator: “Stand still and be simplified!”',
]

/** After the final wave: the Commutator unmasked, and Null arriving. Then the outro. */
export const FINALE = [
  C('No. No, no. Every disguise… Master! Master, I kept your station. Every board, every train. I can still—'),
  N('Hush, marshal.'),
  N('Gyroid. Emmy. Stay where you are. I’m coming down. There’s something I want you both to see.'),
]

export const HINTS_CASTLE = {
  wrong: (why) => [C(`Ha! That one was honest. ${why}`), N('Careful, Gyroid. The Crown doesn’t forgive carelessness.')],
  knockout: (fight) => (fight ? E('Up, Gyroid! Shake it off. His guard has closed ranks again.') : E('Up, Gyroid. The round starts over. Read the numbers again, slowly.')),
}

export const DEFINITION_CASTLE = {
  text: 'World 3 in one breath: cochains are functions on chains, and the coboundary δ is the dual of ∂, so δ² = 0 and cohomology is defined. The universal coefficient theorem ties it back to homology: Hⁿ ≅ Hom(Hₙ, ℤ) ⊕ Ext(Hₙ₋₁, ℤ), so torsion moves up a degree. The cup product makes cohomology a ring, graded-commutative, and the ring tells apart spaces whose groups agree (T and S¹ ∨ S¹ ∨ S²; ℂP² and S² ∨ S⁴). On a closed orientable n-manifold, Poincaré duality gives Hᵏ ≅ Hₙ₋ₖ, and the cup pairing is nonsingular mod torsion.',
  cite: 'Allen Hatcher, Algebraic Topology, Chapter 3: §3.1 (Theorem 3.2, universal coefficients), §3.2 (cup products; Theorems 3.11 and 3.12), §3.3 (Poincaré duality, Proposition 3.38).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}
