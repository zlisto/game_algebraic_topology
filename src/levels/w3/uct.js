/**
 * Universal Coefficient Theorem (Hatcher pp. 190–206):
 *   Hⁿ(X; G) ≅ Hom(Hₙ(X), G) ⊕ Ext(Hₙ₋₁(X), G)
 * Free parts stay; torsion climbs one degree (Ext).
 */

/** Ext(ℤ/m, ℤ) ≅ ℤ/m; Ext(ℤ, ℤ) = 0; Ext(ℤ/m, ℤ/n) ≅ ℤ/gcd(m,n). */
export function ext(A, G = 'Z') {
  if (A.free && !A.torsion) return { free: 0, torsion: [] }
  const tors = A.torsion || []
  if (G === 'Z') return { free: 0, torsion: [...tors] }
  if (G === 'Z2') {
    // Ext(ℤ/2^k, ℤ/2) ≅ ℤ/2 for k≥1; Hom handled separately
    return { free: 0, torsion: tors.map(() => 2) }
  }
  return { free: 0, torsion: [...tors] }
}

/** Hom(H, G) for finitely generated abelian H. */
export function hom(H, G = 'Z') {
  if (G === 'Z') return { free: H.free || 0, torsion: [] }
  if (G === 'Z2') {
    // Hom(ℤ, ℤ/2)≅ℤ/2; Hom(ℤ/2, ℤ/2)≅ℤ/2; Hom(ℤ/m, ℤ/2)≅ℤ/gcd(m,2)
    const freeToZ2 = H.free || 0
    const tors = (H.torsion || []).map((m) => (m % 2 === 0 ? 2 : 0)).filter(Boolean)
    return { free: 0, torsion: [...Array(freeToZ2).fill(2), ...tors] }
  }
  return { free: H.free || 0, torsion: [] }
}

/** Predict Hⁿ from homology of degrees n and n−1. */
export function cohomologyFromHomology(Hn, HnMinus1, G = 'Z') {
  const homPart = hom(Hn || { free: 0, torsion: [] }, G)
  const extPart = ext(HnMinus1 || { free: 0, torsion: [] }, G)
  return {
    free: (homPart.free || 0) + (extPart.free || 0),
    torsion: [...(homPart.torsion || []), ...(extPart.torsion || [])],
  }
}

/** Known spaces (Hatcher examples). */
export const SPACES = {
  torus: {
    H: {
      0: { free: 1, torsion: [] },
      1: { free: 2, torsion: [] },
      2: { free: 1, torsion: [] },
    },
  },
  rp2: {
    H: {
      0: { free: 1, torsion: [] },
      1: { free: 0, torsion: [2] },
      2: { free: 0, torsion: [] },
    },
  },
  lens3: {
    // L(3,1): H₁≅ℤ/3, H₂=0, H₃≅ℤ
    H: {
      0: { free: 1, torsion: [] },
      1: { free: 0, torsion: [3] },
      2: { free: 0, torsion: [] },
      3: { free: 1, torsion: [] },
    },
  },
}

export function predictCohomology(spaceId, G = 'Z') {
  const sp = SPACES[spaceId]
  if (!sp) return null
  const out = {}
  const degrees = Object.keys(sp.H).map(Number)
  const max = Math.max(...degrees)
  for (let n = 0; n <= max + 1; n++) {
    out[n] = cohomologyFromHomology(sp.H[n], sp.H[n - 1], G)
  }
  return out
}

export function groupLabel(g) {
  if (!g) return '0'
  const parts = []
  if (g.free === 1) parts.push('ℤ')
  else if (g.free > 1) parts.push(`ℤ^${g.free}`)
  for (const m of g.torsion || []) parts.push(`ℤ/${m}`)
  return parts.length ? parts.join(' ⊕ ') : '0'
}
