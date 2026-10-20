/**
 * 4-11 A Twist in the Tower — Postnikov towers and k-invariants.
 * Same homotopy groups + different k-invariants ⇒ different spaces.
 * Hatcher pp. 410–415.
 */

export function stackStage(below, pi_n, n, kInvariant = 0) {
  return {
    below,
    fiber: `K(${pi_n},${n})`,
    n,
    k: kInvariant,
    twisted: kInvariant !== 0 && kInvariant !== '0',
  }
}

export function untwist(tower) {
  return { ...tower, k: 0, twisted: false, note: 'product of Eilenberg–MacLane floors' }
}

export function sameGroupsDifferentTwist(a, b) {
  return a.fiber === b.fiber && a.n === b.n && Boolean(a.twisted) !== Boolean(b.twisted)
}
