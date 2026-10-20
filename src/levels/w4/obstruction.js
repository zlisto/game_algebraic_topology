/**
 * 4-12 Obstruction Course — extend maps cell by cell; obstruction in H^{k+1}(X; πₖ(Y)).
 * Hatcher pp. 415–420.
 */

/** Try to extend over one (k+1)-cell given the boundary map in πₖ(Y). */
export function tryExtend(boundaryClass) {
  const obstructs = boundaryClass !== 0 && boundaryClass !== '0'
  return {
    ok: !obstructs,
    obstruction: obstructs ? boundaryClass : 0,
    cochain: obstructs ? 'nonzero in H^{k+1}' : 'zero',
  }
}

/** If the obstruction class vanishes, change lower choices and continue. */
export function reroute(obstructionClass, lowerChoices) {
  if (obstructionClass !== 0 && obstructionClass !== '0') {
    return { ok: false, reason: 'nonzero_class' }
  }
  return { ok: true, newChoices: lowerChoices, continue: true }
}

export function climbSkeleton(dims) {
  // dims: list of successful extensions
  return { reached: dims[dims.length - 1] ?? -1, path: dims }
}
