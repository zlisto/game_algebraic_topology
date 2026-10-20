/**
 * Künneth formula for cohomology (Hatcher pp. 214–220):
 * H*(X×Y; R) ≅ H*(X; R) ⊗ H*(Y; R) when H*(Y; R) is free and finitely generated.
 */

/** Tensor of two graded free modules: generators at (i,j) → degree i+j. */
export function crossProduct(HX, HY) {
  const out = {}
  for (const [di, ci] of Object.entries(HX)) {
    for (const [dj, cj] of Object.entries(HY)) {
      const d = Number(di) + Number(dj)
      out[d] = (out[d] || 0) + ci * cj
    }
  }
  return out
}

/** Circle: H⁰=ℤ, H¹=ℤ. */
export const CIRCLE = { 0: 1, 1: 1 }

/** Sphere Sⁿ: H⁰=ℤ, Hⁿ=ℤ. */
export function sphere(n) {
  const h = { 0: 1 }
  if (n > 0) h[n] = 1
  return h
}

/** Torus = S¹ × S¹ → degrees 0,1,1,2. */
export function torusBeds() {
  return crossProduct(CIRCLE, CIRCLE) // {0:1, 1:2, 2:1}
}

/** S² × S² → 0,2,2,4. */
export function s2s2Beds() {
  return crossProduct(sphere(2), sphere(2))
}

/** Triple product S¹×S¹×S¹ grades. */
export function tripleCircleBeds() {
  return crossProduct(crossProduct(CIRCLE, CIRCLE), CIRCLE)
}

export function bedsLabel(beds) {
  return Object.entries(beds)
    .sort(([a], [b]) => a - b)
    .map(([d, c]) => (c === 1 ? `deg ${d}` : `${c}× deg ${d}`))
    .join(', ')
}
