/** Shared movie/lesson helpers for World 2 — Gyroid uses run/cast/loop/loopDrop, never walk. */
export const S = 0.7
export const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
export const smooth = (x) => x * x * (3 - 2 * x)
export const mix3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]

/** Idle Gyroid pose with subtle cast bob — keeps animation alive between caption beats. */
export function gyroidIdle(x, z, rotY = 0, t = 0) {
  return {
    x,
    z,
    rotY,
    run: 0,
    cast: 0.15 + Math.sin(t * 2) * 0.05,
    loop: 0,
    loopDrop: 0,
    whip: 0,
  }
}

/** Run from A to B over [t0,t1]. */
export function gyroidRun(t, t0, t1, from, to, rotY) {
  const k = smooth(seg(t, t0, t1))
  const x = from[0] + (to[0] - from[0]) * k
  const z = from[1] + (to[1] - from[1]) * k
  return {
    x,
    z,
    rotY: rotY ?? Math.atan2(to[0] - from[0], to[1] - from[1]),
    run: k > 0.02 && k < 0.98 ? 0.9 : 0,
    cast: 0.2,
    loop: 0,
    loopDrop: 0,
    whip: 0,
  }
}

export function emmyScript(x, z, rotY = 0, talk = 0) {
  return () => ({
    pos: [x, 0, z],
    rotY,
    walk: 0,
    gesture: talk > 0 ? 0.4 : 0.1,
    talk,
    bow: 0,
  })
}
