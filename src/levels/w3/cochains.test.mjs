import {
  coboundary,
  isCocycle,
  isCoboundary,
  coboundaryFromVertices,
  makeSingleTriangle,
  makeDiskPatch,
  makeAnnulusPatch,
  coboundarySigned,
  isCocycleSigned,
  readingAround,
} from './cochains.js'
import { cupOnSpace, swapSign } from './cup.js'
import { predictCohomology, groupLabel } from './uct.js'
import { torusBeds, s2s2Beds } from './kunneth.js'
import { isOrientable, orientationCoverConnected } from './orient.js'
import { middleSquaresToTop, integerDualityOk } from './duality.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assert failed')
}

const tri = makeSingleTriangle()
const phi = { e01: 1, e12: 1, e20: -2 }
assert(isCocycle(phi, tri.triangles), 'balanced triangle is cocycle')
assert(isCoboundary(phi, tri.edges, tri.vertices), 'contractible cocycle is coboundary')

const disk = makeDiskPatch()
const f = { a: 0, b: 1, c: 2, d: 0 }
const delta = coboundaryFromVertices(f, disk.edges)
assert(isCocycleSigned(delta, disk.triangles), 'δf is always a cocycle (δδ=0)')

const ann = makeAnnulusPatch()
// Generator cocycle: φ=1 on every spoke, 0 on cycles → actually check hole reading on outer
const gen = { o01: 1, o12: 0, o20: 0, i01: 1, i12: 0, i20: 0, r0: 0, r1: 0, r2: 0 }
assert(readingAround({ o01: 1, o12: 1, o20: 1 }, ann.holeCycle) === 3, 'hole reading')
// A true cocycle from vertex values is a coboundary
const fAnn = Object.fromEntries(ann.vertices.map((v, i) => [v, i % 2]))
const cob = coboundaryFromVertices(fAnn, ann.edges)
assert(isCocycleSigned(cob, ann.triangles), 'δf cocycle on annulus')
assert(isCoboundary(cob, ann.edges, ann.vertices), 'δf is a coboundary')
void gen

assert(cupOnSpace('torus', 1, 1) === 1, 'torus a⌣b')
assert(cupOnSpace('bouquet', 1, 1) === 0, 'bouquet a⌣b')
assert(swapSign(1, 1) === -1, 'deg1 swap flips')

const rp2 = predictCohomology('rp2', 'Z')
assert(groupLabel(rp2[2]).includes('ℤ/2') || (rp2[2].torsion || []).includes(2), 'RP² H² has ℤ/2 from Ext')

const beds = torusBeds()
assert(beds[0] === 1 && beds[1] === 2 && beds[2] === 1, 'torus Künneth ranks')
assert(s2s2Beds()[4] === 1, 'S²×S² top')

assert(isOrientable([false, false, false]), 'torus orientable')
assert(!isOrientable([true]), 'Möbius flips')
assert(orientationCoverConnected(false), 'non-orientable cover connected')

assert(middleSquaresToTop('cp2') === 1, 'CP² square')
assert(middleSquaresToTop('s2vs4') === 0, 'wedge square dark')
assert(integerDualityOk(true) && !integerDualityOk(false), 'duality needs orientation')

console.log('w3 math tests: ok')
