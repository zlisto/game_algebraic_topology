/**
 * Cup product on cochains (Hatcher pp. 206–215).
 * For simplicial cochains: (φ ⌣ ψ)(σ) = φ(front face) · ψ(back face).
 * Graded commutativity: αβ = (−1)^{deg α · deg β} βα.
 */

/** Cup of two degree-1 cochains on a 2-simplex with vertices [v0,v1,v2]:
 *  front face = edge v0v1, back face = edge v1v2. */
export function cupOnTriangle(phi, psi, frontEdge, backEdge) {
  return (phi[frontEdge] || 0) * (psi[backEdge] || 0)
}

/** Cup product cochain on a list of triangles: { triId → value }. */
export function cupProduct(phi, psi, triangles) {
  const out = {}
  for (const t of triangles) {
    const front = t.front || t.edges[0]
    const back = t.back || t.edges[1]
    out[t.id] = cupOnTriangle(phi, psi, front, back)
  }
  return out
}

/** Graded sign when swapping degrees k and ℓ. */
export function swapSign(degA, degB) {
  return (degA * degB) % 2 === 0 ? 1 : -1
}

/** Torus: a ⌣ b = top generator (1). Bouquet S¹∨S¹∨S²: a ⌣ b = 0. */
export function cupOnSpace(space, a, b) {
  if (space === 'torus') return (a || 0) * (b || 0) // nonzero when both lit
  if (space === 'bouquet') return 0
  if (space === 'cp2') return (a || 0) * (a || 0) // middle squared → top
  if (space === 's2vs4') return 0
  return 0
}

/** Coboundary Leibniz: δ(φ⌣ψ) = δφ⌣ψ ± φ⌣δψ (sign (−1)^deg φ). */
export function cupLeibnizHolds(degPhi = 1) {
  return { signOnSecond: degPhi % 2 === 0 ? 1 : -1 }
}
