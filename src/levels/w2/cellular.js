/**
 * Cellular homology (Hatcher pp. 137–149): one ℤ per cell; ∂ via degrees of attaching maps.
 */

/** Sphere: one 0-cell, one n-cell → H₀ ≅ ℤ, Hₙ ≅ ℤ. */
export function sphereCells(n = 2) {
  return { cells: { 0: 1, [n]: 1 }, homology: { 0: 'Z', [n]: 'Z' }, chi: 1 + (n % 2 === 0 ? 1 : -1) }
}

/** Torus CW: one 0, two 1, one 2; all ∂ = 0 → H₀=ℤ, H₁=ℤ², H₂=ℤ. */
export function torusCells() {
  return { cells: { 0: 1, 1: 2, 2: 1 }, degrees: { '2→1': [0, 0] }, homology: { 0: 'Z', 1: 'Z^2', 2: 'Z' }, chi: 0 }
}

/** RP²: one 0, one 1, one 2 with ∂₂ = ×2 → H₀=ℤ, H₁=ℤ₂, H₂=0. */
export function rp2Cells() {
  return { cells: { 0: 1, 1: 1, 2: 1 }, degrees: { '2→1': [2] }, homology: { 0: 'Z', 1: 'Z_2', 2: '0' }, chi: 1 }
}

/** Klein bottle cellular: H₀=ℤ, H₁=ℤ⊕ℤ₂, H₂=0. */
export function kleinCells() {
  return { cells: { 0: 1, 1: 2, 2: 1 }, degrees: { '2→1': [2, 0] }, homology: { 0: 'Z', 1: 'Z⊕Z_2', 2: '0' }, chi: 0 }
}

export function chiFromCells(cells) {
  return Object.entries(cells).reduce((s, [dim, n]) => s + (Number(dim) % 2 === 0 ? 1 : -1) * n, 0)
}

export function chiFromHomologyRanks(ranks) {
  return Object.entries(ranks).reduce((s, [dim, r]) => s + (Number(dim) % 2 === 0 ? 1 : -1) * r, 0)
}
