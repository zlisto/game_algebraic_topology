/**
 * Simplicial chains (Hatcher pp. 104–108): ∂ with alternating signs, ∂∂ = 0,
 * Hₙ = ker ∂ₙ / im ∂ₙ₊₁. Chains are maps from simplex ids → ℤ (or mod m).
 */

/** Oriented edge boundary of a triangle with vertices [i,j,k] ordered: ∂[i j k] = [j k] − [i k] + [i j]. */
export function triangleBoundary(verts = [0, 1, 2]) {
  const [i, j, k] = verts
  return edgeChain([
    [j, k, 1],
    [i, k, -1],
    [i, j, 1],
  ])
}

/** Build a sparse chain from [a,b,coeff] edges (a < b means + direction a→b). */
export function edgeChain(triples) {
  const c = new Map()
  for (const [a, b, s] of triples) {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const sign = a < b ? s : -s
    const key = `${lo}-${hi}`
    c.set(key, (c.get(key) || 0) + sign)
  }
  return prune(c)
}

export function addChains(a, b, scaleB = 1) {
  const out = new Map(a)
  for (const [k, v] of b) out.set(k, (out.get(k) || 0) + scaleB * v)
  return prune(out)
}

export function prune(c, mod = 0) {
  const out = new Map()
  for (const [k, v] of c) {
    let n = v
    if (mod > 0) n = ((n % mod) + mod) % mod
    if (n !== 0) out.set(k, n)
  }
  return out
}

export function isZero(c) {
  return c.size === 0
}

/** Boundary of a 1-chain (edges → vertices). ∂∂ of a 2-chain is always empty. */
export function boundary1(edges) {
  const verts = new Map()
  for (const [key, coeff] of edges) {
    const [a, b] = key.split('-').map(Number)
    verts.set(a, (verts.get(a) || 0) - coeff)
    verts.set(b, (verts.get(b) || 0) + coeff)
  }
  return prune(verts)
}

/** ∂ of a sum of oriented triangles (each entry: verts [i,j,k] + coeff). */
export function boundary2(faces) {
  let acc = new Map()
  for (const { verts, coeff = 1 } of faces) {
    acc = addChains(acc, triangleBoundary(verts), coeff)
  }
  return acc
}

/** Verify ∂∂ = 0 on a list of triangles. */
export function dSquaredZero(faces) {
  return isZero(boundary1(boundary2(faces)))
}

/**
 * Hole meter for a planar Δ-complex:
 * - H₀: number of path components among vertices after edges
 * - H₁: rank of cycles modulo boundaries (simplified: free cycles not bounding)
 *
 * For the game's "Missing Tile" ring: outer cycle bounds, inner cycle around the hole does not.
 */
export function holeMeter({ components = 1, cycleClasses = 0, faceClasses = 0 } = {}) {
  return { H0: components, H1: cycleClasses, H2: faceClasses }
}

/** Cancel opposite interior edges in a plaza (shared edge with opposite orientation). */
export function cancelInterior(edgeList) {
  const m = new Map()
  for (const { key, coeff } of edgeList) {
    m.set(key, (m.get(key) || 0) + coeff)
  }
  return prune(m)
}

/** Plaza of n triangles sharing interior edges — outer boundary has length depending on shape. */
export function plazaBoundary(n = 4) {
  // Model: square plaza of 2 triangles → outer 4-cycle; for n=6 ring with hole → outer + inner
  if (n === 1) return triangleBoundary()
  if (n === 2) {
    // Two triangles glued on 01: boundary is 02 + 21 + 10_lower wait — outer square
    return edgeChain([
      [0, 2, 1],
      [2, 3, 1],
      [3, 1, 1],
      [1, 0, 1],
    ])
  }
  // Ring of 6 around missing center: outer cycle + inner cycle (inner is a hole)
  return {
    outer: edgeChain([
      [0, 1, 1],
      [1, 2, 1],
      [2, 3, 1],
      [3, 4, 1],
      [4, 5, 1],
      [5, 0, 1],
    ]),
    inner: edgeChain([
      [6, 7, 1],
      [7, 8, 1],
      [8, 9, 1],
      [9, 10, 1],
      [10, 11, 1],
      [11, 6, 1],
    ]),
  }
}
