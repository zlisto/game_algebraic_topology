/**
 * The codex's catalogue. Every entry points back to Hatcher, Algebraic Topology (Cambridge UP, 2002).
 *   BEASTS — the bestiary: each enemy's body is a space, its lash count one of its invariants
 *   RELICS — the reward objects, each a picture of the idea its level proved
 *   CELLS  — the building blocks of cell complexes (unlocked once the Skeleton Foundry is cleared)
 */

export const HATCHER = 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html'

export const BEASTS = [
  { type: 'sphere', name: 'Sphere Minion', space: 'S²', facts: [['π₁', '0'], ['H₂', 'ℤ'], ['Lashes', '1']], text: 'Every loop on a sphere contracts to a point, so one lash collapses it.', ref: 'π₁(Sⁿ) = 0 for n ≥ 2: Prop. 1.14' },
  { type: 'torus', name: 'Torus Horror', space: 'T² = S¹ × S¹', facts: [['π₁', 'ℤ ⊕ ℤ'], ['χ', '0'], ['Lashes', '2']], text: 'Two independent loops round a torus. The first lash cuts one (the ring splits into a tube), the second snuffs the eye.', ref: 'π₁(X × Y) = π₁X × π₁Y: Prop. 1.12' },
  { type: 'snapper', name: 'Snapper', space: 'a discontinuity', facts: [['Cuts', 'paths'], ['Lashes', '1']], text: 'A crab of the tidal flats that snips continuous paths. A homotopy may bend a path but never cut it.', ref: 'Homotopy: Ch. 0, p. 3' },
  { type: 'mobius', name: 'Möbius Prowler', space: 'Möbius band', facts: [['π₁', 'ℤ'], ['Orientable', 'no'], ['Lashes', '2']], text: 'Cut down the middle, a Möbius band becomes one band twice as long, so the prowler runs twice as fast after the first lash.', ref: 'deformation retracts onto its core circle: Ch. 0' },
  { type: 'projective', name: 'Projective Specter', space: 'ℝP²', facts: [['π₁', 'ℤ₂'], ['Lashes', '2, fast']], text: '2-torsion: one lash only flips it. Land the second within 2.2 s, or it settles back.', ref: 'π₁(ℝPⁿ) = ℤ₂ for n ≥ 2: Ex. 1.43' },
  { type: 'klein', name: 'Klein Sentinel', space: 'Klein bottle', facts: [['H₁', 'ℤ ⊕ ℤ₂'], ['χ', '0'], ['Lashes', '3']], text: 'One lash for the free loop, then a quick torsion pair.', ref: 'Klein bottle = N₂: Ex. 2.37 (§2.2)' },
  { type: 'bitorus', name: 'Bitorus', space: 'Σ₂ (genus 2)', facts: [['H₁', 'ℤ⁴'], ['χ', '−2'], ['Lashes', '4']], text: 'Each lash cuts a generator: one eye goes dark, then that ring collapses, then the other side.', ref: 'surfaces as cell complexes: Ch. 0 and Ex. 2.36' },
  { type: 'earring', name: 'Hawaiian Earring', space: '⋃ circles of radius 1/n', facts: [['π₁', 'uncountable'], ['CW complex', 'no'], ['Lashes', '5']], text: 'Each lash shatters the biggest ring; it shrinks and speeds up until the accumulation point is struck.', ref: 'shrinking wedge of circles: Ex. 1.25' },
  { type: 'harpy', name: 'Coboundary Harpy', space: 'δ² = 0', facts: [['Stance', 'cochain'], ['Lashes', '3']], text: '⟨δα, c⟩ = ⟨α, ∂c⟩. Chain-stance lashes feed it; strike in the cochain stance (G).', ref: 'cohomology: Ch. 3.1' },
  { type: 'spider', name: 'Cup Spider', space: 'α ⌣ β', facts: [['Rule', 'alternate stances'], ['Lashes', '4 (5 graded)']], text: 'α ⌣ β = (−1)^pq β ⌣ α: switch stance with G between every lash, or the web snaps back. Touching you grades it up: slower, armored.', ref: 'Thm. 3.11' },
  { type: 'spectre', name: 'de Rham Spectre', space: 'dω = 0, ω ≠ df', facts: [['Weak to', 'a full loop'], ['Lashes', '3']], text: 'Invulnerable until you run a full loop round it (∮ω ≠ 0), then exact for a few seconds. Beyond Hatcher’s core text.', ref: 'beyond the book (de Rham cohomology)' },
  { type: 'colossus', name: 'Poincaré Colossus', space: 'Hᵏ ≅ Hₙ₋ₖ', facts: [['Rule', 'stone, light, stone…'], ['Lashes', '6']], text: 'Alternate chain (stone) and cochain (light); each pairing shatters a joint. Duality holds for a closed orientable n-manifold (Thm. 3.30).', ref: 'Poincaré duality: Thm. 3.30' },
  { type: 'mirror', name: 'Mirror Imp', space: 'a reflection', where: '0-3', facts: [['Lashes', '1']], text: 'Always shadowed by its reflection across the mirror line. Only the real one can be lashed; the reflection is just another view of the same thing.', ref: 'homotopy equivalence: Ch. 0' },
  { type: 'coner', name: 'Coner Drone', space: 'the cone CX', where: '0-5', facts: [['Lashes', '2']], text: 'Beams a cone of light onto a space to plug its hole: the cone on anything is contractible. Lash it before the beam finishes.', ref: 'cones: Ch. 0' },
  { type: 'biter', name: 'Loop-Biter', space: 'a cut edge', where: '0-6', facts: [['Lashes', '2']], text: 'Chews through a petal loop. Cutting an edge outside the spanning tree kills a loop of the wedge.', ref: 'graphs and spanning trees: Ch. 0' },
  { type: 'backtrack', name: 'Backtrack', space: 'α⁻¹', where: '1-2', facts: [['Lashes', '1']], text: 'Runs a loop the wrong way round: a living inverse. α · α⁻¹ is homotopic to the constant loop.', ref: 'π₁ is a group: §1.1' },
  { type: 'winder', name: 'Winder', space: 'n turns of S¹', where: '1-3', facts: [['Immune', 'while it holds turns'], ['Lashes', '1']], text: 'Wound in stolen turns. Run laps the other way until its winding number is 0, then lash.', ref: 'π₁(S¹) = ℤ: Thm. 1.7' },
  { type: 'retractor', name: 'Retractor Drone', space: 'r: D² → S¹', where: '1-4', facts: [['Lashes', '2']], text: 'Tugs everything toward the rim, as if the disk retracted onto its boundary. No such retraction exists; that is Brouwer.', ref: 'Brouwer fixed point theorem: Thm. 1.9' },
  { type: 'patrol', name: 'Ribbon Patrol', space: 'a word in a, b', where: '1-6', facts: [['Lashes', 'one per letter (2 elsewhere)']], text: 'Carries a word in the free group; each lash cancels a letter.', ref: 'free products: §1.2' },
  { type: 'unglue', name: 'Unglue', space: 'a torn seam', where: '0-4', facts: [['Lashes', '1']], text: 'A seam-ripper that pulls glued edges loose: a torn attaching map must be re-forged. In World 1 it rips the path-connected overlap van Kampen needs.', ref: 'van Kampen: Thm. 1.20' },
  { type: 'liftling', name: 'Liftling', space: 'a lift', where: '1-8', facts: [['Lashes', '2 (own sheet)']], text: 'Bound to one sheet of a cover. Only a lash on its own sheet lands: lifts are unique once you fix the start.', ref: 'lifting: Prop. 1.30, 1.34' },
  { type: 'deck_guard', name: 'Deck Guard', space: 'a deck orbit', where: '1-10', facts: [['Lashes', '1 for all copies']], text: 'One copy per sheet. Stack them and one lash clears every copy: a deck transformation moves them all together.', ref: 'deck transformations: §1.3' },
  { type: 'cube_sentry', name: 'Cube Sentry', space: 'a cell of a Postnikov stage', where: '4-1', facts: [['Lashes', '2']], text: 'A slow cube guarding the Spire’s lower floors.', ref: 'Postnikov towers: §4.3' },
  { type: 'glitch', name: 'Glitch', space: 'static', where: '4-2', facts: [['Lashes', '1']], text: 'Violet static that knocks maps off the grid.', ref: '—' },
  { type: 'fiber_wraith', name: 'Fiber Wraith', space: 'a fiber F → E → B', where: '4-7', facts: [['Lashes', '2']], text: 'Slips between the fibers of a bundle; catch it on its circle.', ref: 'fiber bundles: §4.2' },
  { type: 'twist_thief', name: 'Twist Thief', space: 'a k-invariant', where: '4-11', facts: [['Lashes', '2']], text: 'A hand that steals the brackets twisting one Postnikov stage onto the next.', ref: 'k-invariants: §4.3' },
  { type: 'whirl', name: 'Whirl', space: 'a scrambled field', where: '1-4', facts: [['Lashes', '1']], text: 'A spinning top that scrambles the arrows on the deck. A map with no fixed point would have to scramble them all.', ref: 'Brouwer fixed point theorem: Thm. 1.9' },
  { type: 'projector_imp', name: 'Projector Imp', space: 'a stolen map', where: '1-5', facts: [['Lashes', '1']], text: 'It hijacks the projector that throws one map onto another. Lash it and the induced map comes back.', ref: 'induced homomorphisms: §1.1' },
  { type: 'flipper', name: 'Flipper', space: 'an orientation', where: '2-1', facts: [['Lashes', '1']], text: 'A manta marked with an arrow. It flips the orientation of whatever it passes over, and a flipped simplex counts with a minus sign.', ref: 'oriented simplices: §2.1' },
  { type: 'bog', name: 'Bog Toad', space: 'a missing tile', where: '2-2', facts: [['Lashes', '2']], text: 'A mud-toad that squats in the gaps of a tiling. Where it sits, a chain has a hole in its boundary.', ref: 'chains and boundaries: §2.1' },
  { type: 'crumpler', name: 'Crumpler', space: 'a degenerate simplex', where: '2-3', facts: [['Lashes', '1']], text: 'A crumpled wad that stamps triangles flat. A singular simplex may be squashed, and it still counts.', ref: 'singular homology: §2.1' },
  { type: 'leak', name: 'Leak', space: 'a puncture', where: '2-4', facts: [['Lashes', '1']], text: 'A drop with a needle for a nose. It punctures the locks between chain groups.', ref: 'chain maps: §2.1' },
  { type: 'quarry_golem', name: 'Quarry Golem', space: 'an excised piece', where: '2-5', facts: [['Lashes', '3']], text: 'Stacked stone that tries to weld back the piece you cut out. Excision says you may cut it, and the relative homology stays the same.', ref: 'excision: Thm. 2.20' },
  { type: 'gale', name: 'Gale', space: 'a degree', where: '2-6', facts: [['Lashes', '1']], text: 'A knot of wind that spins the dial. How many times a sphere wraps round a sphere is its degree.', ref: 'degree: §2.2' },
  { type: 'echo', name: 'Echo', space: 'a cochain', where: '3-1', facts: [['Lashes', '1']], text: 'A violet ghost of Gyroid. A cochain is a shadow of a chain: it reads a number off every chain.', ref: 'cochains: §3.1' },
  { type: 'vine_choker', name: 'Vine Choker', space: 'torsion', where: '3-2', facts: [['Lashes', '2']], text: 'A thorned vine that strangles the torsion in a group. The Ext term remembers what it tries to choke off.', ref: 'universal coefficient theorem: Thm. 3.2' },
  { type: 'moth', name: 'Lantern Moth', space: 'a dark lantern', where: '3-3', facts: [['Lashes', '1']], text: 'A moth with eyes on its wings that snuffs the garden lanterns. One lash.', ref: '—' },
  { type: 'seam_wraith', name: 'Seam Wraith', space: 'a torn seam', where: 'World 3 castle', facts: [['Lashes', '3']], text: 'A tall wraith whose front is torn down a stitched seam. It tears the gluing that a product space depends on.', ref: 'Künneth formula: §3.2' },
  { type: 'shard', name: 'Crown Shard', space: 'a splinter of the Null Crown', facts: [['Lashes', '1']], text: 'A cracked obsidian spike torn from Null’s Crown, diving point-first like a hornet.', ref: '—' },
]

export const RELICS = [
  { kind: 'walkway', name: 'Spine Shard · the bar', level: '0-1', text: 'The Walkway deformation-retracts onto a single segment.' },
  { kind: 'fork', name: 'Spine Shard · the Y', level: '0-1', text: 'The Fork retracts onto a tree, and every tree is contractible.' },
  { kind: 'ring', name: 'Spine Shard · the circle', level: '0-1', text: 'The O retracts onto its core circle; the hole stays.' },
  { kind: 'lagoons', name: 'Spine Shard · the figure-eight', level: '0-1', text: 'Twin Lagoons retracts onto a figure-eight: one loop per lagoon.' },
  { kind: 'forgeries', name: 'Spine Shard · Null’s broken spine', level: '0-1', text: 'A spine with a gap. Not a deformation retract: the reef can’t slide onto it.' },
  { kind: 'hourglass', name: 'Tide Hourglass', level: '0-2', text: 'A ribbon bending inside the glass: a homotopy is a movie of maps, frame by frame.' },
  { kind: 'lens', name: 'Mirror Lens', level: '0-3', text: 'A figure-eight on one face, a theta on the other: two looks, one homotopy type.' },
  { kind: 'tile', name: 'Blueprint Tile', level: '0-4', text: 'One square 2-cell glued along a b a⁻¹ b⁻¹: the torus.' },
  { kind: 'cone', name: 'Cone Crystal', level: '0-5', text: 'A ring with every point joined to one apex: the cone on a circle is a disk, and every cone is contractible.' },
  { kind: 'rose', name: 'Petal Rose', level: '0-6', text: 'Fell a spanning tree and a graph becomes loops on one point: a wedge of circles.' },
  { kind: 'path', name: 'Path Seal', level: '1-1', text: 'Two paths with the same endpoints and the sweep between them: a homotopy rel endpoints.' },
  { kind: 'basepoint', name: 'Basepoint Ring', level: '1-2', text: 'Two loops at one basepoint, run one after the other: the group operation of π₁.' },
  { kind: 'helix', name: 'Helix Coil', level: '1-3', text: 'The helix over the circle: each lap lifts one floor. π₁(S¹) = ℤ.' },
  { kind: 'stillpoint', name: 'Still Point', level: '1-4', text: 'A swirling disk with one point that never moves: Brouwer’s fixed point.' },
  { kind: 'toruspair', name: 'Torus Pair', level: '1-5', text: 'A torus with its two generating loops: π₁ of a product is the product.' },
  { kind: 'freeloops', name: 'Free Loops', level: '1-6', text: 'The figure-eight’s loops a and b: π₁ is free on them, so ab ≠ ba.' },
  { kind: 'gluerings', name: 'Glue Rings', level: '1-7', text: 'Two pieces glued on their overlap: van Kampen.' },
  { kind: 'coverstack', name: 'Cover Stack', level: '1-8', text: 'Sheets stacked over a circle, a lift climbing between them: a covering space.' },
  { kind: 'utree', name: 'Tree Seed', level: '1-9', text: 'The universal cover of the figure-eight: a tree branching four ways at every node.' },
  { kind: 'decksphere', name: 'Deck Sphere', level: '1-10', text: 'A sphere with an antipodal swap: S² double-covers ℝP², and the swap is a deck transformation.' },
]

export const CELLS = [
  { id: 'e0', name: '0-cell', sym: 'e⁰', text: 'A point. The 0-skeleton of a cell complex is a discrete set of points.' },
  { id: 'e1', name: '1-cell', sym: 'e¹', text: 'An open interval, glued at its two ends to 0-cells: an edge.' },
  { id: 'e2', name: '2-cell', sym: 'e²', text: 'An open disk, glued along its boundary circle to the 1-skeleton, e.g. by a word in the edges like aba⁻¹b⁻¹.' },
  { id: 'e3', name: '3-cell', sym: 'e³', text: 'An open ball, glued along its boundary sphere S² to the 2-skeleton.' },
]
export const CELLS_REF = 'cell complexes: Hatcher Ch. 0, p. 5'
/** The cells unlock once the Skeleton Foundry (0-4) has been cleared. */
export const cellsUnlocked = (notes) => Object.keys(notes).some((k) => /World 0 · Level 4/.test(k))
