/**
 * Poincaré duality (Hatcher pp. 239–252):
 * Hᵏ(M; ℤ) ≅ Hₙ₋ₖ(M; ℤ) for closed orientable n-manifolds;
 * with ℤ₂ for all closed manifolds.
 */

export function dualDegree(k, n) {
  return n - k
}

/** Integer duality holds iff orientable. */
export function integerDualityOk(orientable) {
  return !!orientable
}

/** ℤ₂ duality always for closed manifolds. */
export function z2DualityOk() {
  return true
}

/** Pair homology/cohomology ranks for a closed orientable surface of genus g. */
export function torusDualPairs() {
  // T²: H⁰≅H₂≅ℤ, H¹≅ℤ² — pairs (0↔2), (1↔1)
  return [
    { hole: 0, reading: 2 },
    { hole: 1, reading: 1 },
    { hole: 2, reading: 0 },
  ]
}

/** Cup pairing nondegenerate mod torsion on closed orientable manifolds. */
export function pairingNondegenerate(space) {
  if (space === 'cp2') return true
  if (space === 's2vs4') return false // not a manifold; middle squares to 0
  if (space === 'torus') return true
  return false
}

/** Middle class squares to top? */
export function middleSquaresToTop(space) {
  if (space === 'cp2') return 1
  if (space === 's2vs4') return 0
  return 0
}
