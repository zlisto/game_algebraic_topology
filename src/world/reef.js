/**
 * Retract Reef world helpers, built from retractReef.json — shared by the playable
 * overworld (Level 0-1) and the intro cinematic.
 */
import layout from './retractReef.json'
import { makeShape } from '../levels/w0/retraction'

export { layout }

const segDist = (x, z, [ax, az], [bx, bz]) => {
  const dx = bx - ax
  const dz = bz - az
  const l2 = dx * dx + dz * dz
  const u = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0
  return Math.hypot(x - (ax + u * dx), z - (az + u * dz))
}

const lerp2 = ([ax, az], [bx, bz], u) => [ax + (bx - ax) * u, az + (bz - az) * u]

/** A site's layout scaled up about its centre (`scale` in the layout): shape, beacons, spawn, spines. */
function scaled(s) {
  const k = s.scale || 1
  if (k === 1) return s
  const prim = (p) => Object.fromEntries(Object.entries(p).map(([key, v]) => [key, typeof v === 'number' ? v * k : v]))
  const pt = ([x, z]) => [x * k, z * k]
  return {
    ...s,
    shape: { ...s.shape, add: (s.shape.add || []).map(prim), sub: s.shape.sub && s.shape.sub.map(prim) },
    beacons: s.beacons && s.beacons.map(pt),
    enemies: s.enemies && s.enemies.map(([type, x, z]) => [type, x * k, z * k]),
    givenSpine: s.givenSpine && s.givenSpine.map((stroke) => stroke.map(pt)),
  }
}

/** Sites with their shapes, in site-local coordinates. */
export const SITES = layout.sites.map(scaled).map((s) => {
  const shape = makeShape(s.shape)
  return {
    ...s,
    def: s.shape, // the shape as written in the layout
    shape,
    toLocal: (x, z) => [x - s.pos[0], z - s.pos[1]],
    toWorld: (x, z) => [x + s.pos[0], z + s.pos[1]],
    containsWorld: (x, z) => shape.inside(x - s.pos[0], z - s.pos[1]),
  }
})
export const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))

/** The two walkable stubs of the broken causeway (the gap between them opens once it's mended). */
export function gateSegments(open) {
  const g = layout.gate
  if (open) return [[g.a, g.b]]
  return [
    [g.a, lerp2(g.a, g.b, g.gap[0])],
    [lerp2(g.a, g.b, g.gap[1]), g.b],
  ]
}

/** Open ground between the puzzle reefs (the third-person overworld only). */
export const COMMONS = (layout.commons || []).map((c) => {
  const shape = makeShape(c.shape)
  return { ...c, def: c.shape, containsWorld: (x, z) => shape.inside(x - c.pos[0], z - c.pos[1]) }
})

/**
 * A bridge drawn only where it's over water: trim a causeway's ends back to where it leaves a
 * platform (a reef, or — with `open` — a common), so it meets the edge instead of lying on top.
 */
export function trimToWater(a, b, open = false) {
  const onLand = (x, z) => SITES.some((s) => s.containsWorld(x, z)) || (open && COMMONS.some((c) => c.containsWorld(x, z)))
  const at = (u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
  const N = 80
  let u0 = 0
  let u1 = 1
  while (u0 < 1 && onLand(...at(u0))) u0 += 1 / N
  while (u1 > u0 && onLand(...at(u1))) u1 -= 1 / N
  if (u1 - u0 < 1 / N) return null
  const tuck = 0.15 / Math.max(0.01, Math.hypot(b[0] - a[0], b[1] - a[1])) // tuck a hair under each edge
  return [at(Math.max(0, u0 - tuck)), at(Math.min(1, u1 + tuck))]
}

/** Sites with holes: inside the outline but not on the reef. */
const HOLES = SITES.filter((s) => s.def.sub?.length).map((s) => {
  const outline = makeShape({ add: s.def.add })
  return { inHole: (x, z) => outline.inside(x - s.pos[0], z - s.pos[1]) && !s.containsWorld(x, z) }
})

/**
 * Is (x, z) solid reef Gyroid can stand on?
 * open: the expansive overworld — wider causeways, plus the commons and the paths to them.
 */
export function makeWalkable({ gateOpen = false, open = false } = {}) {
  const half = (open ? layout.openCausewayWidth || layout.causewayWidth : layout.causewayWidth) / 2
  const gate = gateSegments(gateOpen)
  const paths = open ? [...layout.causeways, ...(layout.commonsCauseways || [])] : layout.causeways
  const inside = (x, z) => {
    // a puzzle's holes (lagoons, the O's middle) stay water, however wide the paths get
    if (open) for (const h of HOLES) if (h.inHole(x, z)) return false
    for (const s of SITES) if (s.containsWorld(x, z)) return true
    for (const c of paths) if (segDist(x, z, c.a, c.b) <= half) return true
    for (const [a, b] of gate) if (segDist(x, z, a, b) <= half) return true
    if (open) for (const c of COMMONS) if (c.containsWorld(x, z)) return true
    return false
  }
  const { minX, maxX, minZ, maxZ } = layout.bounds
  return { inside, bounds: { minX, maxX, minZ, maxZ } }
}

/** The playable site containing world point (x, z), if any. */
export function siteAt(x, z) {
  return SITES.find((s) => s.playable && s.containsWorld(x, z)) || null
}

/** World → bible map units (100 × 60), matching scripts/sync-map. */
export function worldToMap(x, z) {
  const s = 1.395
  return [50 + (x - 0.5) * s, 30 + (z + 8.5) * s]
}
