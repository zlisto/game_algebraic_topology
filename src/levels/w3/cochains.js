/**
 * Cochains / coboundaries for World 3 · Level 3-1 (Hatcher pp. 190–197).
 * Pure math — no React. Coefficients in ℤ.
 *
 * A 1-cochain φ assigns an integer to each oriented edge.
 * For a triangle with edges [e01, e12, e20] matching ∂σ = e01 + e12 + e20
 * (e20 already carries the opposite orientation of v0→v2), δφ(σ) = Σ φ(ei).
 */

export function coboundaryOnTriangle(phi, edgeIds) {
  return edgeIds.reduce((s, id) => s + (phi[id] || 0), 0)
}

export function coboundary(phi, triangles) {
  const out = {}
  for (const t of triangles) out[t.id] = coboundaryOnTriangle(phi, t.edges)
  return out
}

export function isCocycle(phi, triangles) {
  return Object.values(coboundary(phi, triangles)).every((v) => v === 0)
}

/** (δf)(v→w) = f(w) − f(v). */
export function coboundaryFromVertices(f, edges) {
  const phi = {}
  for (const e of edges) phi[e.id] = (f[e.to] || 0) - (f[e.from] || 0)
  return phi
}

/** Solve whether φ = δf by BFS from the first vertex. */
export function isCoboundary(phi, edges, vertices) {
  if (!vertices.length) return true
  const f = Object.fromEntries(vertices.map((v) => [v, 0]))
  const seen = new Set([vertices[0]])
  const q = [vertices[0]]
  while (q.length) {
    const u = q.shift()
    for (const e of edges) {
      if (e.from === u && !seen.has(e.to)) {
        f[e.to] = f[u] + (phi[e.id] || 0)
        seen.add(e.to)
        q.push(e.to)
      } else if (e.to === u && !seen.has(e.from)) {
        f[e.from] = f[u] - (phi[e.id] || 0)
        seen.add(e.from)
        q.push(e.from)
      }
    }
  }
  if (seen.size < vertices.length) return false
  const rebuilt = coboundaryFromVertices(f, edges)
  return edges.every((e) => (rebuilt[e.id] || 0) === (phi[e.id] || 0))
}

export function cycleValue(v, step = 1, lo = -2, hi = 2) {
  let n = (v || 0) + step
  if (n > hi) n = lo
  if (n < lo) n = hi
  return n
}

export function readingAround(phi, edgeIds) {
  return edgeIds.reduce((s, id) => s + (phi[id] || 0), 0)
}

/** One triangle — teach reading edges → pool. */
export function makeSingleTriangle() {
  const vertices = ['v0', 'v1', 'v2']
  const edges = [
    { id: 'e01', from: 'v0', to: 'v1' },
    { id: 'e12', from: 'v1', to: 'v2' },
    { id: 'e20', from: 'v2', to: 'v0' },
  ]
  const triangles = [{ id: 't0', edges: ['e01', 'e12', 'e20'] }]
  return { vertices, edges, triangles }
}

/** Contractible disk: two triangles sharing an edge. Every cocycle is a coboundary. */
export function makeDiskPatch() {
  const vertices = ['a', 'b', 'c', 'd']
  const edges = [
    { id: 'ab', from: 'a', to: 'b' },
    { id: 'bc', from: 'b', to: 'c' },
    { id: 'ca', from: 'c', to: 'a' },
    { id: 'ad', from: 'a', to: 'd' },
    { id: 'bd', from: 'b', to: 'd' },
    { id: 'cd', from: 'c', to: 'd' },
  ]
  // Oriented boundaries: ∂(abd)=ab+bd−ad, etc. (signs parallel to edges).
  const triangles = [
    { id: 'tab', edges: ['ab', 'bd', 'ad'], signs: [1, 1, -1] },
    { id: 'tbc', edges: ['bc', 'cd', 'bd'], signs: [1, 1, -1] },
    { id: 'tca', edges: ['ca', 'ad', 'cd'], signs: [1, 1, -1] },
  ]
  return { vertices, edges, triangles }
}

/**
 * Annulus (cylinder triangulation strip): outer cycle o0→o1→o2→o0, inner i0→i1→i2→i0,
 * three rectangles split into triangles. Hole cycle = outer.
 * Generator: φ=1 on one radial edge, 0 elsewhere — wait, that may be a coboundary.
 * Better: φ=1 on every outer edge, 0 elsewhere → reading around hole = 3; reduce to
 * φ=1 on o01 only… For H¹(annulus)≅ℤ the generator pairs with the hole cycle.
 * Playable cocycle: φ(o01)=φ(o12)=φ(o20)=1, all other edges 0 — but δ may be nonzero
 * on triangles touching the outer. Use a consistent model:
 * φ = 1 on the three spokes (radial), 0 on cycles → actually coboundary.
 * Standard: φ = 1 on all three edges of the hole cycle oriented consistently,
 * and 0 on every other edge that appears with compensating signs in ∂ of triangles.
 *
 * Simplified playable annulus: only the hole cycle edges exist as "read" edges;
 * triangles enforce balanced readings on the filled band.
 */
export function makeAnnulusPatch() {
  const vertices = ['o0', 'o1', 'o2', 'i0', 'i1', 'i2']
  const edges = [
    { id: 'o01', from: 'o0', to: 'o1' },
    { id: 'o12', from: 'o1', to: 'o2' },
    { id: 'o20', from: 'o2', to: 'o0' },
    { id: 'i01', from: 'i0', to: 'i1' },
    { id: 'i12', from: 'i1', to: 'i2' },
    { id: 'i20', from: 'i2', to: 'i0' },
    { id: 'r0', from: 'o0', to: 'i0' },
    { id: 'r1', from: 'o1', to: 'i1' },
    { id: 'r2', from: 'o2', to: 'i2' },
  ]
  // Each band triangle: outer edge + spoke + (−inner) + (−spoke). Store edge ids with
  // orientation baked into φ: we use edges as oriented and triangles list with signs
  // via a `signs` array parallel to edges.
  const triangles = [
    { id: 't0', edges: ['o01', 'r1', 'i01', 'r0'], signs: [1, 1, -1, -1] },
    { id: 't1', edges: ['o12', 'r2', 'i12', 'r1'], signs: [1, 1, -1, -1] },
    { id: 't2', edges: ['o20', 'r0', 'i20', 'r2'], signs: [1, 1, -1, -1] },
  ]
  const holeCycle = ['o01', 'o12', 'o20']
  return { vertices, edges, triangles, holeCycle }
}

/** Signed coboundary that respects triangle.signs when present. */
export function coboundarySigned(phi, triangles) {
  const out = {}
  for (const t of triangles) {
    const signs = t.signs || t.edges.map(() => 1)
    out[t.id] = t.edges.reduce((s, id, i) => s + signs[i] * (phi[id] || 0), 0)
  }
  return out
}

export function isCocycleSigned(phi, triangles) {
  return Object.values(coboundarySigned(phi, triangles)).every((v) => v === 0)
}
