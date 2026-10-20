/**
 * 4-4 Suspension of Disbelief — Freudenthal suspension; πₙ(Sⁿ) ≅ ℤ via degree.
 * Hatcher pp. 360–366.
 */
import { freudenthalRange, sphereDegree } from './spireMath.js'

/** Suspend a map Sⁱ → Sⁿ to Sⁱ⁺¹ → Sⁿ⁺¹ (same degree when applicable). */
export function suspend(map) {
  return { i: map.i + 1, n: map.n + 1, degree: map.degree }
}

/** Classify maps Sⁿ → Sⁿ by degree. */
export function byDegree(deg) {
  return { class: sphereDegree(deg), group: 'Z' }
}

/** Is the suspension map an isomorphism / surjection / neither? */
export function suspensionType(i, n) {
  return freudenthalRange(i, n)
}

/** Climb shaft: list of suspended maps until stable range says iso. */
export function climbShaft(start, steps) {
  let m = { ...start }
  const path = [m]
  for (let s = 0; s < steps; s++) {
    m = suspend(m)
    path.push(m)
  }
  return path
}
