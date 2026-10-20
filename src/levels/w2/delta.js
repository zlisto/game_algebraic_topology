/**
 * Δ-complexes (Hatcher pp. 102–104): ordered simplices; faces glue by order-preserving maps.
 * Two triangles with edge labels make a torus, Klein bottle, or RP² depending on arrow matches.
 */

/** Ordered edge of a triangle: vertices 0 < 1 < 2; edge i opposite vertex i runs lower→higher. */
export function triangleEdges(id) {
  return [
    { id: `${id}:01`, a: 0, b: 1, arrow: 1 },
    { id: `${id}:12`, a: 1, b: 2, arrow: 1 },
    { id: `${id}:02`, a: 0, b: 2, arrow: 1 },
  ]
}

/** Glue two edges if arrows agree (same orientation after identifying). Returns false if flipped mismatch when requireMatch. */
export function canGlue(e1, e2, { allowFlip = false } = {}) {
  if (!e1 || !e2) return false
  if (e1.arrow === e2.arrow) return true
  return allowFlip
}

/**
 * Identify edges of two triangles into a square then opposite sides.
 * pairings: [{eA, eB, flip?}, ...] where eA/eB are edge ids.
 * Returns { verts, edges, faces, chi, surface } with surface in {square,torus,klein,rp2,unknown}.
 */
export function assembleSurface(pairings, { faces = 2 } = {}) {
  // Start: 2 triangles → 6 edge ends, 6 vertex corners; each glue merges 2 verts + 1 edge
  let V = 6
  let E = 6
  const F = faces
  const flips = []
  for (const p of pairings) {
    if (!p) continue
    V -= 2
    E -= 1
    flips.push(!!p.flip)
  }
  // After three side-pairings of a square: classic Hatcher two-triangle surfaces
  let surface = 'unknown'
  if (pairings.length === 1) surface = 'square'
  else if (pairings.length === 3) {
    const nFlip = flips.filter(Boolean).length
    if (nFlip === 0) surface = 'torus'
    else if (nFlip === 1) surface = 'klein'
    else if (nFlip >= 2) surface = 'rp2'
  }
  // Torus / Klein / RP² from two triangles: V=1, E=3, F=2 → χ=0 (torus/Klein) or χ=1 (RP²)
  if (surface === 'torus' || surface === 'klein') {
    V = 1
    E = 3
  } else if (surface === 'rp2') {
    V = 2 // Hatcher's ℝP²: two vertices, three edges, two triangles; χ = 2 − 3 + 2 = 1
    E = 3
  }
  const chi = V - E + F
  return { verts: V, edges: E, faces: F, chi, surface, flips }
}

/** Standard Hatcher two-triangle gluings. */
export const STANDARD = {
  square: [{ eA: 'U:01', eB: 'L:01', flip: false }],
  torus: [
    { eA: 'U:01', eB: 'L:01', flip: false },
    { eA: 'sq:a', eB: 'sq:a2', flip: false },
    { eA: 'sq:b', eB: 'sq:b2', flip: false },
  ],
  klein: [
    { eA: 'U:01', eB: 'L:01', flip: false },
    { eA: 'sq:a', eB: 'sq:a2', flip: false },
    { eA: 'sq:b', eB: 'sq:b2', flip: true },
  ],
  rp2: [
    { eA: 'U:01', eB: 'L:01', flip: false },
    { eA: 'sq:a', eB: 'sq:a2', flip: true },
    { eA: 'sq:b', eB: 'sq:b2', flip: true },
  ],
}

export function surfaceName(id) {
  return { square: 'square', torus: 'torus', klein: 'Klein bottle', rp2: 'projective plane', unknown: 'unknown surface' }[id] || id
}

/**
 * Hatcher's square of two triangles (pp. 102–103). Corners 0 = SW, 1 = SE, 2 = NE, 3 = NW; the
 * diagonal c runs 0 → 2 and splits the square into the lower triangle [0 1 2] and the upper [0 2 3].
 * `arrows` gives each side's direction: bottom/top +1 = east, left/right +1 = north, diag +1 = 0 → 2.
 * The a-sides (bottom, top) are glued to each other and so are the b-sides (left, right), first
 * vertex to first vertex. Returns which surface that makes, how many vertices survive, and whether
 * each triangle's arrows come from an ordering of its vertices (no cycle) — the Δ-complex condition.
 */
export function squareSurface({ bottom, top, left, right, diag }) {
  const dir = (s, a, b) => (s > 0 ? [a, b] : [b, a])
  const E = { bottom: dir(bottom, 0, 1), top: dir(top, 3, 2), left: dir(left, 0, 3), right: dir(right, 1, 2), diag: dir(diag, 0, 2) }
  const parent = [0, 1, 2, 3]
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const join = (x, y) => (parent[find(x)] = find(y))
  for (const [p, q] of [['bottom', 'top'], ['left', 'right']]) {
    join(E[p][0], E[q][0])
    join(E[p][1], E[q][1])
  }
  const verts = new Set([0, 1, 2, 3].map(find)).size
  const cyclic = (edges) => {
    const out = {}
    for (const [a] of edges) out[a] = (out[a] || 0) + 1
    return Object.keys(out).length === 3
  }
  const aTwist = bottom !== top
  const bTwist = left !== right
  const surface = aTwist && bTwist ? 'rp2' : aTwist || bTwist ? 'klein' : 'torus'
  return {
    surface,
    aTwist,
    bTwist,
    verts,
    chi: verts - 3 + 2,
    lowerCyclic: cyclic([E.bottom, E.right, E.diag]),
    upperCyclic: cyclic([E.diag, E.top, E.left]),
  }
}
