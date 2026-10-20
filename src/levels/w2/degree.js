/**
 * Degree of maps Sⁿ → Sⁿ (Hatcher pp. 134–137).
 * deg(id)=1, deg(reflection)=−1, deg(f∘g)=deg(f)deg(g), antipodal has deg (−1)^{n+1}.
 */

export function antipodalDegree(n) {
  return (-1) ** (n + 1)
}

export function composeDegree(a, b) {
  return a * b
}

/** Hairy ball: Sⁿ admits a nowhere-zero tangent field iff n is odd. */
export function canComb(n) {
  return n % 2 === 1
}

/** H̃ₖ(Sⁿ) ≅ ℤ for k=n, else 0 (reduced). */
export function sphereHomology(n, k) {
  if (k === n) return 'Z'
  return '0'
}

/** Lefschetz number for a map with given traces on H_i (alternating sum). */
export function lefschetz(traces) {
  return traces.reduce((s, t, i) => s + (i % 2 === 0 ? 1 : -1) * t, 0)
}
