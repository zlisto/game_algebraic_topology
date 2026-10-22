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

/** Sites with their shapes, in site-local coordinates. */
export const SITES = layout.sites.map((s) => {
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
