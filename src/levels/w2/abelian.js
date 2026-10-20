/**
 * H₁(X) ≅ π₁(X)ᵃᵇ (Hatcher pp. 166–168): forget order; commutators → 0.
 * A word is a list of letters ±a, ±b, …; totals are the abelian image.
 */

/** Parse "a b a' b'" style words. a' / A / a⁻¹ mean inverse of a. */
export function parseWord(str) {
  if (!str || !String(str).trim()) return []
  return String(str)
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const inv = /['⁻¹]$/i.test(tok) || (tok.length === 1 && tok === tok.toUpperCase() && tok !== tok.toLowerCase())
      const base = tok.replace(/['⁻¹]+$/i, '').toLowerCase()
      return { letter: base, sign: inv ? -1 : 1 }
    })
}

/** Abelian totals: map letter → net count. */
export function totals(word) {
  const t = {}
  for (const { letter, sign } of typeof word === 'string' ? parseWord(word) : word) {
    t[letter] = (t[letter] || 0) + sign
  }
  return t
}

export function isCommutator(word) {
  const t = totals(word)
  return Object.values(t).every((n) => n === 0)
}

export function totalsEqual(a, b) {
  const A = totals(a)
  const B = totals(b)
  const keys = new Set([...Object.keys(A), ...Object.keys(B)])
  for (const k of keys) if ((A[k] || 0) !== (B[k] || 0)) return false
  return true
}

export function totalsText(word) {
  const t = totals(word)
  const keys = Object.keys(t).sort()
  if (!keys.length) return '(0)'
  return '(' + keys.map((k) => `${k}:${t[k]}`).join(', ') + ')'
}
