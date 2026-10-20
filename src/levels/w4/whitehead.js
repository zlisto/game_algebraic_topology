/**
 * 4-3 Weak Spot — Whitehead's theorem.
 * A map of CW complexes inducing isomorphisms on all πₙ is a homotopy equivalence.
 * Matching groups abstractly (no inducing map) is not enough — Hatcher p. 348 example.
 */

/** Does f induce isos on listed groups? */
export function inducesIsos(piMap) {
  // piMap: [{n, domain, codomain, induced}] — induced true means iso
  return piMap.every((row) => row.induced === true)
}

/** Whitehead: CW + weak equivalence ⇒ homotopy equivalence. */
export function whitehead(opts) {
  const { cwDomain, cwCodomain, weakEquiv } = opts
  if (!cwDomain || !cwCodomain) return { equiv: false, reason: 'not_cw' }
  if (!weakEquiv) return { equiv: false, reason: 'not_weak' }
  return { equiv: true, reason: 'whitehead' }
}

/** Famous counterexample shape: isomorphic groups, no inducing map. */
export const FAKE_TWINS = {
  left: { name: 'S² × RP³', groups: { 1: 'Z2', 2: 'Z', 3: 'Z2' } },
  right: { name: 'RP² × S³', groups: { 1: 'Z2', 2: 'Z', 3: 'Z2' } },
  inducingMap: false,
  note: 'Hatcher p. 348 — same groups, no map inducing the isomorphisms.',
}

export function groupsMatch(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) if (a[k] !== b[k]) return false
  return true
}
