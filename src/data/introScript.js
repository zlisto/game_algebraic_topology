/**
 * Intro cinematic: "Count Null's first collapse".
 * All times are in story seconds on one shared clock. The 3D scene, camera,
 * captions and score all read from these tables so the shot list lives in one
 * place. PACE maps story time to real playback time; videos.json holds the
 * timings and words, this file the motion.
 */

import videos from '../../videos.json'

// Timing, pacing, scene list and captions live in videos.json (also shown in the bible's Videos tab).
const INTRO = videos.videos.find((v) => v.id === 'intro')
export const INTRO_START = INTRO.story_start // the exposition plays in negative story time, before the collapse
export const INTRO_TOTAL = INTRO.story_end

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

// ---------- pacing: story time ↔ real seconds ----------
// [story start, story end, playback rate] from videos.json. Below 1 slows the
// scene so its captions can be read; the score stretches with it.
const PACE = INTRO.pace.map(([a, b, rate]) => [a, b ?? Infinity, rate])
/** real seconds from the start of the intro until story time `t` */
export function wallAt(t) {
  let w = 0
  for (const [a, b, rate] of PACE) {
    if (t <= a) break
    w += (Math.min(t, b) - a) / rate
  }
  return w
}
/** story time reached after `w` real seconds */
export function storyAt(w) {
  let left = Math.max(0, w)
  for (const [a, b, rate] of PACE) {
    const span = (b - a) / rate
    if (left <= span) return a + left * rate
    left -= span
  }
  return INTRO_TOTAL
}

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
    loop: 0, // the intro draws its own based loop (BasedLoop in IntroWorld)
    loopDrop: 0,
  }
}

// ---------- Count Null choreography ----------
/** the based loop: it leaves the anchor on the spine, rounds the gap where the walkway fell, comes home */
export const ANCHOR = [3.7, WALK_Z]
export function loopScript(t) {
  return { draw: easeOut(seg(t, 30.9, 32.4)), pin: smooth(seg(t, 32.4, 33.2)) }
}

export function nullScript(t) {
  const raise = seg(t, 9.6, 11) * (1 - seg(t, 12.2, 13))
  const thrust = seg(t, 13.6, 14.4) * (1 - seg(t, 19.5, 21))
  const sneer = seg(t, 36.5, 37.5) * (1 - seg(t, 39, 40))
  return {
    gesture: Math.max(raise * 0.7, thrust, sneer * 0.45),
    crown: Math.max(seg(t, 9.6, 10.6) * 0.6, thrust, 0.15),
    crownY: mix(0.75, 0, smooth(seg(t, 7, 9.6))), // starts low enough to stay inside the letterbox
  }
}

// ---------- ring collapse (torus → ball → point) ----------
export const POINT_AT = 20.4 // the point hangs until here, then flashes out
export function ringScript(t) {
  const k = smooth(seg(t, 14.6, 19))
  const tide = t < 0 ? Math.sin(t * 0.9) * 0.22 : 0 // "the land here is soft": it breathes before the collapse
  return {
    R: (3 + tide) * (1 - k), // hole closes as the core radius → 0
    r: mix(0.7 - tide * 0.3, 1.9, k),
    // the ball shrinks to a small glowing point, which hangs a moment before the flash
    shrink: t < POINT_AT ? 1 - smooth(seg(t, 19.1, 19.8)) * 0.95 : 0,
    point: seg(t, 19.5, 19.8),
    corrupt: seg(t, 14.2, 17),
    flash: seg(t, POINT_AT, POINT_AT + 0.6),
    beam: seg(t, 14.0, 14.5) * (1 - seg(t, POINT_AT - 0.1, POINT_AT)),
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

// camera moves by scene id; each scene's start/end comes from videos.json
const CAMERA = [
  {
    // X1: exposition — slow descent toward the archipelago from far off
    id: 'X1',
    cam: (k) => {
      const e = smooth(k)
      return { pos: mix3([-28, 19, 36], [-8, 11, 29], e), target: mix3([-2, 0, -6], [0, 0, -3], e) }
    },
  },
  {
    // X2: the ringed island, intact, beacons lit
    id: 'X2',
    cam: (k) => {
      const a = 2.15 + 0.6 * k
      return { pos: [Math.cos(a) * 8.5, mix(3.4, 2.4, k), Math.sin(a) * 8.5], target: [0, 0.2, 0] }
    },
  },
  {
    // X3: Gyroid waiting on the Retract Reef walkway
    id: 'X3',
    cam: (k) => ({
      pos: mix3([-7.6, WALK_Y + 2.4, WALK_Z + 7.2], [-9.0, WALK_Y + 1.9, WALK_Z + 5.6], smooth(k)),
      target: [-12, WALK_Y + 1.1, WALK_Z],
    }),
  },
  {
    // A: establishing — orbit over the Winding World
    id: 'A',
    cam: (k) => {
      // orbit, then turn to find the black spire and the figure on it
      const a = 0.75 + 0.4 * k
      return { pos: [Math.cos(a) * 25, 12 - 3.5 * k, Math.sin(a) * 25], target: mix3([-1, 0, -3], [N[0] + 2, N[1] - 1, N[2] + 2], smooth(seg(k, 0.25, 1))) }
    },
  },
  {
    // B: Count Null reveal — rise from robe hem to mask as the crown descends
    id: 'B',
    cam: (k) => {
      const e = smooth(k)
      // pulled back enough that the mask and the descending crown clear the letterbox
      return { pos: nullCam(mix(5.4, 4.3, e), mix(1.2, 0.4, e), mix(0.8, 2.9, e)), target: [N[0], N[1] + mix(1.6, 3.15, e), N[2]] }
    },
  },
  {
    // C1: over Null's shoulder as he thrusts toward the ring
    id: 'C1',
    cam: (k) => ({ pos: nullCam(mix(-2.6, -2.2, k), 1.6, 4.0), target: mix3([N[0] + toRing[0] * 4, N[1], N[2] + toRing[1] * 4], RING, k) }),
  },
  {
    // C2: wide on the ring as its hole closes and it collapses to a point
    id: 'C2',
    cam: (k) => ({ pos: mix3([13, 6.5, 15], [9.5, 4.2, 11], smooth(k)), target: mix3([-1, 0.5, -1], [0, 0.2, 0], k) }),
  },
  {
    // D: high and ahead, looking back down the walkway: Gyroid sprints toward us while the slabs
    // fall away behind them and the amber spine stays (framed high, clear of the caption)
    id: 'D',
    cam: (k, t) => {
      const x = gyroidX(t)
      return { pos: [x + 2.6, WALK_Y + 4.8, WALK_Z + 6.6], target: [x - 2.2, WALK_Y - 1.4, WALK_Z] }
    },
  },
  {
    // E1: over Gyroid's shoulder, back along the ruin: the slabs are gone, the spine still spans the water
    id: 'E1',
    cam: (k) => ({ pos: mix3([8.9, WALK_Y + 2.8, WALK_Z + 3.4], [8.5, WALK_Y + 3.1, WALK_Z + 3.7], smooth(k)), target: [-2, WALK_Y - 0.6, WALK_Z - 0.6] }),
  },
  {
    // E2: cast — pull back and up as the anchored loop opens
    id: 'E2',
    cam: (k) => ({ pos: mix3([8.2, 2.6, 14.2], [9.5, 6.4, 18.5], smooth(k)), target: [2.2, WALK_Y, WALK_Z] }),
  },
  {
    // F: Count Null watches from the spire
    id: 'F',
    // from below: Null high against the sky, the gesture above the caption
    cam: (k) => ({ pos: nullCam(mix(6.2, 5.6, smooth(k)), mix(-2.4, -1.8, k), mix(-2.2, -1.6, k)), target: [N[0], N[1] + 2.4, N[2]] }),
  },
  {
    // G: title — wide pull-back over the reef, the ring now missing
    id: 'G',
    // aimed at the open water where the ring stood
    cam: (k) => ({ pos: mix3([-9, 4.5, 9], [-13, 8.5, 14], smooth(k)), target: mix3([0, -0.6, 0], [1, -1.6, 0], k) }),
  },
]

export const SHOTS = INTRO.scenes.map((s) => ({ ...s, cam: CAMERA.find((c) => c.id === s.id).cam }))

export function cameraAt(t) {
  const shot = SHOTS.find((s) => t >= s.start && t < s.end) || SHOTS[SHOTS.length - 1]
  return shot.cam(seg(t, shot.start, shot.end), t)
}

// ---------- captions ----------
export const CAPTIONS = INTRO.captions

export const TITLE_CARD = INTRO.title_card
