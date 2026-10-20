/**
 * Orientations and the orientation double cover (Hatcher pp. 233–239).
 */

/** Carry a local orientation (±1) along a loop; return whether it flips. */
export function carryOrientation(start, flipsAlongPath) {
  let o = start
  for (const flip of flipsAlongPath) if (flip) o = -o
  return o
}

export function isOrientable(loopFlips) {
  return carryOrientation(1, loopFlips) === 1
}

/**
 * Orientation double cover: two sheets over each point.
 * Connected ⇔ base is non-orientable.
 */
export function orientationCoverConnected(orientable) {
  return !orientable
}

/** Survey cliffs: { id, flips: boolean[] } → { id, orientable }. */
export function surveyCliffs(cliffs) {
  return cliffs.map((c) => ({
    id: c.id,
    orientable: isOrientable(c.flips || []),
    coverConnected: orientationCoverConnected(isOrientable(c.flips || [])),
  }))
}
