/**
 * 4-1 Cube Root — πₙ as maps (Iⁿ, ∂Iⁿ) → (X, x₀); πₙ abelian for n ≥ 2.
 * Cubes are stored as ordered lists of "colors" (integers). Stack = concatenate.
 * Slide (n≥2): commute by shrinking into subcubes and swapping in the free direction.
 * Hatcher pp. 339–346.
 */

/** Stack two cube-maps along one axis (group operation). */
export function stack(a, b) {
  return [...a, ...b]
}

/** Inverse: reverse orientation. */
export function invert(cube) {
  return cube.slice().reverse().map((c) => -c)
}

/** Reduce by cancelling adjacent inverse pairs. */
export function reduce(cube) {
  const out = []
  for (const c of cube) {
    if (out.length && out[out.length - 1] === -c) out.pop()
    else out.push(c)
  }
  return out
}

/** Same reduced class? */
export function sameClass(a, b) {
  const ra = reduce(a)
  const rb = reduce(b)
  if (ra.length !== rb.length) return false
  return ra.every((v, i) => v === rb[i])
}

/**
 * Slide past in dimension ≥ 2: f+g ≃ g+f.
 * In dim 1 this is refused (no room to pass).
 */
export function slidePast(a, b, dim = 2) {
  if (dim < 2) return { ok: false, reason: 'dim1', result: stack(a, b) }
  return { ok: true, reason: 'abelian', result: stack(b, a) }
}

/** Check that stacking then sliding yields the swapped order (n≥2). */
export function proveAbelian(a, b, dim = 2) {
  const left = reduce(stack(a, b))
  const slid = slidePast(a, b, dim)
  if (!slid.ok) return { abelian: false, left, right: reduce(stack(a, b)) }
  const right = reduce(slid.result)
  return { abelian: sameClass(left, right) || sameClass(left, reduce(stack(b, a))), left, right: reduce(stack(b, a)) }
}
