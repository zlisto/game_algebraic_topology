/**
 * 4-2 Snap to Grid — cellular approximation; πᵢ(Sⁿ)=0 for i<n.
 * Hatcher pp. 348–356.
 */

/** A map is a list of cells {dim, id} it hits, in order. */
export function snapToSkeleton(cells, targetDim) {
  // Cellular approximation: push each k-cell into the k-skeleton.
  return cells.map((c) => ({ ...c, dim: Math.min(c.dim, targetDim), snapped: true }))
}

/** After snapping a map Sⁱ → Sⁿ with i < n into the i-skeleton of Sⁿ (a point), it is nullhomotopic. */
export function slipsOff(i, n) {
  if (i < n) return { trivial: true, reason: 'below_dim' }
  if (i === n) return { trivial: false, reason: 'degree' }
  return { trivial: false, reason: 'above' }
}

/** Build a CW model: list of cells by dimension. */
export function cwModel(counts) {
  // counts: {0: n0, 1: n1, ...}
  const cells = []
  for (const [d, n] of Object.entries(counts)) {
    for (let k = 0; k < n; k++) cells.push({ dim: Number(d), id: `${d}-${k}` })
  }
  return cells
}

export function skeleton(cells, k) {
  return cells.filter((c) => c.dim <= k)
}
