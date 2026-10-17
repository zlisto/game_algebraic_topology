/**
 * Intro cinematic: "Count Null's first collapse".
 * All times in seconds on one shared clock. The 3D scene, camera and captions
 * all read from these tables so the shot list lives in one place.
 */

export const INTRO_TOTAL = 46

// ---------- world layout ----------
export const RING = [0, 0, 0] // the ringed island Null collapses
export const NULL_POS = [-16, 7.2, -14] // top of Null's spire
export const WALK_Z = 10 // Gyroid's walkway (Retract Reef)
export const WALK_Y = 0.5
export const WALK_X0 = -14
export const WALK_X1 = 6

// ---------- helpers ----------
export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const seg = (t, a, b) => clamp01((t - a) / (b - a))
export const smooth = (x) => x * x * (3 - 2 * x)
export const easeOut = (x) => 1 - (1 - x) ** 2
export const mix = (a, b, k) => a + (b - a) * k
export const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

// ---------- Gyroid choreography ----------
const RUN_A = 21
const RUN_B = 27.6
export function gyroidX(t) {
  if (t < RUN_A) return -12
  if (t > RUN_B) return 4.6
  const p = seg(t, RUN_A, RUN_B)
  return -12 + 16.6 * (0.6 * p + 0.4 * easeOut(p)) // steady sprint, easing into the stop
}
/** time at which Gyroid passes x (for the crumble wave behind them) */
export function gyroidTimeAt(x) {
  for (let t = RUN_A; t <= RUN_B; t += 0.05) if (gyroidX(t) >= x) return t
  return Infinity
}

export function gyroidScript(t) {
  const run = t >= RUN_A && t < RUN_B ? 1 : t >= RUN_B && t < RUN_B + 0.6 ? 1 - seg(t, RUN_B, RUN_B + 0.6) : 0
  const cast = seg(t, 30.6, 31.2) * (1 - seg(t, 33.2, 34.2) * 0.6)
  const rotY = mix(Math.PI / 2, 0.85, smooth(seg(t, 28.4, 29.6)))
  return {
    pos: [gyroidX(t), WALK_Y, WALK_Z],
    rotY,
    run,
    cast,
    loop: easeOut(seg(t, 30.9, 32.2)),
    loopDrop: smooth(seg(t, 32.4, 33.4)),
  }
}

// ---------- Count Null choreography ----------
export function nullScript(t) {
  const raise = seg(t, 9.6, 11) * (1 - seg(t, 12.2, 13))
  const thrust = seg(t, 13.6, 14.4) * (1 - seg(t, 19.5, 21))
  const sneer = seg(t, 36.5, 37.5) * (1 - seg(t, 39, 40))
  return {
    gesture: Math.max(raise * 0.7, thrust, sneer * 0.45),
    crown: Math.max(seg(t, 9.6, 10.6) * 0.6, thrust, 0.15),
    crownY: mix(1.4, 0, smooth(seg(t, 7, 9.6))),
  }
}

// ---------- ring collapse (torus → ball → point) ----------
export function ringScript(t) {
  const k = smooth(seg(t, 14.6, 19))
  return {
    R: 3 * (1 - k), // hole closes as the core radius → 0
    r: mix(0.7, 1.9, k),
    shrink: 1 - smooth(seg(t, 19.1, 20)),
    corrupt: seg(t, 14.2, 17),
    flash: seg(t, 19.9, 21.2),
    beam: seg(t, 14.0, 14.5) * (1 - seg(t, 19.6, 20.1)),
  }
}

// ---------- camera shots ----------
const N = NULL_POS
const toRing = (() => {
  const dx = RING[0] - N[0]
  const dz = RING[2] - N[2]
  const l = Math.hypot(dx, dz)
  return [dx / l, dz / l]
})()
export const NULL_ROT_Y = Math.atan2(toRing[0], toRing[1])
const perp = [-toRing[1], toRing[0]]
const nullCam = (dist, side, h) => [N[0] + toRing[0] * dist + perp[0] * side, N[1] + h, N[2] + toRing[1] * dist + perp[1] * side]

export const SHOTS = [
  {
    // A: establishing — orbit over the Winding World
    start: 0,
    end: 6,
    cam: (k) => {
      const a = 0.75 + 0.4 * k
      return { pos: [Math.cos(a) * 25, 12 - 2.5 * k, Math.sin(a) * 25], target: [-1, 0, -3] }
    },
  },
  {
    // B: Count Null reveal — rise from robe hem to mask as the crown descends
    start: 6,
    end: 13,
    cam: (k) => {
      const e = smooth(k)
      return { pos: nullCam(mix(4.6, 3.0, e), mix(1.2, 0.4, e), mix(0.7, 3.0, e)), target: [N[0], N[1] + mix(1.2, 2.85, e), N[2]] }
    },
  },
  {
    // C1: over Null's shoulder as he thrusts toward the ring
    start: 13,
    end: 15.6,
    cam: (k) => ({ pos: nullCam(mix(-2.6, -2.2, k), 1.6, 4.0), target: mix3([N[0] + toRing[0] * 4, N[1], N[2] + toRing[1] * 4], RING, k) }),
  },
  {
    // C2: wide on the ring as its hole closes and it collapses to a point
    start: 15.6,
    end: 21,
    cam: (k) => ({ pos: mix3([13, 6.5, 15], [9.5, 4.2, 11], smooth(k)), target: mix3([-1, 0.5, -1], [0, 0.2, 0], k) }),
  },
  {
    // D: tracking Gyroid along the crumbling walkway
    start: 21,
    end: 28,
    cam: (k, t) => {
      const x = gyroidX(t)
      return { pos: [x + 1.2, WALK_Y + 1.6, WALK_Z + 4.4], target: [x + 0.5, WALK_Y + 1.0, WALK_Z] }
    },
  },
  {
    // E1: Gyroid stops at the edge, turns
    start: 28,
    end: 30.6,
    cam: (k) => ({ pos: mix3([8.6, 1.9, 12.4], [8.0, 1.8, 12.9], k), target: [4.6, WALK_Y + 1.15, WALK_Z] }),
  },
  {
    // E2: cast — pull back and up as the anchored loop opens
    start: 30.6,
    end: 34,
    cam: (k) => ({ pos: mix3([8.2, 2.2, 13.2], [10.5, 5.2, 17.5], smooth(k)), target: [4.6, WALK_Y + 0.6, WALK_Z] }),
  },
  {
    // F: Count Null watches from the spire
    start: 34,
    end: 40,
    cam: (k) => ({ pos: nullCam(mix(3.6, 2.8, smooth(k)), mix(0.9, 0.3, k), 2.9), target: [N[0], N[1] + 2.8, N[2]] }),
  },
  {
    // G: title — wide pull-back over the reef, the ring now missing
    start: 40,
    end: INTRO_TOTAL + 1,
    cam: (k) => ({ pos: mix3([12, 4.5, 21], [17, 9, 30], smooth(k)), target: mix3([3, 1, 8], [-3, 1, 0], k) }),
  },
]

export function cameraAt(t) {
  const shot = SHOTS.find((s) => t >= s.start && t < s.end) || SHOTS[SHOTS.length - 1]
  return shot.cam(seg(t, shot.start, shot.end), t)
}

// ---------- captions ----------
export const CAPTIONS = [
  { t: 0.6, end: 5.8, speaker: 'Narrator', text: 'The Winding World held its shape by its holes — ringed islands, looped causeways, routes that wind away and come back home.' },
  { t: 6.6, end: 9.6, speaker: 'Count Null', portrait: 'count-null', text: 'So many loops. So many… holes.' },
  { t: 9.8, end: 13, speaker: 'Count Null', portrait: 'count-null', text: 'Enough. I will simplify every province — down to a single perfect point.' },
  { t: 13.6, end: 17, speaker: 'Narrator', text: 'But the Null Crown does not simplify. It erases.' },
  { t: 17, end: 21, speaker: 'Narrator', text: 'A ring becomes a ball. A ball becomes a point. Every route that wound through it — gone.' },
  { t: 21.4, end: 27.8, speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: 'Gyroid! The reef is going — stay on the amber spines! Whatever keeps its shape, we can save!' },
  { t: 28.3, end: 30.8, speaker: 'Gyroid', portrait: 'gyroid', text: 'The walkways fell… but the spines held. Bend it, don’t break it.' },
  { t: 30.8, end: 33.9, speaker: 'Gyroid', portrait: 'gyroid', text: 'Anchor set!' },
  { t: 34.5, end: 39.6, speaker: 'Count Null', portrait: 'count-null', text: 'A courier who keeps holes. How… quaint. Run along, little loop.' },
]

export const TITLE_CARD = { t: 40.5, end: INTRO_TOTAL }
