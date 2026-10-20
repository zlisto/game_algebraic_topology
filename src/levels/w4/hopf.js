/**
 * 4-7 Hop Off — Hopf fibration S¹ → S³ → S²; π₃(S²) ≅ ℤ.
 * Refutes Null's World-3 claim that every map S³ → S² is trivial.
 * Hatcher pp. 375–384.
 */

/** Linking number of two Hopf fibers (any two distinct fibers link once). */
export function fiberLink(a, b) {
  if (a === b) return 0
  return 1
}

/**
 * Long exact sequence of the Hopf fibration (sketch):
 * … → π₃(S¹) → π₃(S³) → π₃(S²) → π₂(S¹) → …
 * π₃(S¹)=0, π₂(S¹)=0 ⇒ π₃(S³) ≅ π₃(S²). Generator = Hopf map.
 */
export function hopfSequence() {
  return {
    pi3_S1: 0,
    pi3_S3: 'Z',
    pi3_S2: 'Z',
    pi2_S1: 0,
    iso: true,
    hopfGenerator: 1,
  }
}

export function hopfEssential() {
  const seq = hopfSequence()
  return { trivial: false, degree: seq.hopfGenerator, refutes: 'Null World-3 claim' }
}
