/**
 * 4-10 Fibration Station — homotopy lifting property; path fibrations; loop spaces.
 * Hatcher pp. 405–410.
 */

/** Lift a homotopy downstairs given a start upstairs. */
export function liftHomotopy(baseHomotopy, startAbove) {
  if (!baseHomotopy || startAbove == null) return { ok: false, lift: null }
  return { ok: true, lift: { tracks: baseHomotopy.tracks, start: startAbove } }
}

/** Convert any map f: A → B into a fibration by replacing A with path-space data. */
export function makeFibration(map) {
  return { total: `E_f`, base: map.codomain, fiber: 'path fibers', original: map }
}

/** Fiber of the path fibration PB → B is the loop space ΩB. */
export function pathFiber(base) {
  return { fiber: `Ω(${base})`, note: 'loops based at the path’s endpoint' }
}
