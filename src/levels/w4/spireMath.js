/**
 * Shared helpers for World 4 · Postnikov Spire math engines.
 * Pure functions only — no React. Each level owns a mechanic module that may import these.
 */

/** Clamp to [0,1]. */
export const clamp01 = (x) => Math.min(1, Math.max(0, x))

/** Smoothstep. */
export const smooth = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

/** Homotopy classes of maps (Iⁿ, ∂Iⁿ) → (X, x₀) are written as signed integers when X = Sⁿ. */
export function sphereDegree(n) {
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

/** Freudenthal: πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹) is iso for i < 2n−1, surjective for i = 2n−1. */
export function freudenthalRange(i, n) {
  if (i < 2 * n - 1) return 'iso'
  if (i === 2 * n - 1) return 'surj'
  return 'unstable'
}

/** First stable stems from Hatcher's table (flag: shown, not derived in-game). */
export const STABLE_STEMS = [
  { k: 0, group: 'Z', note: 'π₀ˢ ≅ ℤ (degree)' },
  { k: 1, group: 'Z2', note: 'π₁ˢ ≅ ℤ₂' },
  { k: 2, group: 'Z2', note: 'π₂ˢ ≅ ℤ₂' },
  { k: 3, group: 'Z24', note: 'π₃ˢ ≅ ℤ₂₄' },
]

/** Abelianize a free-group word given as an array of ±letter indices. */
export function abelianize(word) {
  const counts = {}
  for (const L of word) {
    const k = Math.abs(L)
    counts[k] = (counts[k] || 0) + Math.sign(L)
  }
  return Object.entries(counts)
    .filter(([, c]) => c !== 0)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .flatMap(([k, c]) => Array(Math.abs(c)).fill(c > 0 ? Number(k) : -Number(k)))
}
