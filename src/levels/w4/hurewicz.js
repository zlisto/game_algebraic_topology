/**
 * 4-6 Hurewicz Hurrah — first nonzero πₙ ≅ Hₙ (n≥2); n=1 abelianization.
 * Hatcher pp. 366–375.
 */
import { abelianize } from './spireMath.js'

/** Hurewicz map: send a sphere class to the homology class of its image. */
export function hurewiczNeedle(piClass, opts = {}) {
  const { n = 2, lowerVanish = true } = opts
  if (n === 1) return { H: abelianize(piClass), iso: true, note: 'H₁ = π₁ abelionized' }
  if (!lowerVanish) return { H: piClass, iso: false, note: 'lower groups nonzero — not an iso' }
  return { H: piClass, iso: true, note: `π${n} ≅ H${n}` }
}

export function firstNonzero(groups) {
  // groups: {1: '0'|word, 2: ..., }
  const dims = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
  for (const d of dims) {
    if (groups[d] && groups[d] !== '0' && groups[d] !== 0) return d
  }
  return null
}
