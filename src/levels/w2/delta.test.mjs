import assert from 'assert'
import { assembleSurface, squareSurface, STANDARD } from './delta.js'
import { boundary2, dSquaredZero, isZero, boundary1 } from './chains.js'
import { antipodalDegree, canComb, composeDegree, lefschetz } from './degree.js'
import { torusCells, rp2Cells, chiFromCells } from './cellular.js'
import { isCommutator, totals, totalsText } from './abelian.js'

const sq = assembleSurface(STANDARD.square)
assert.equal(sq.surface, 'square')

const tor = assembleSurface(STANDARD.torus)
assert.equal(tor.surface, 'torus')
assert.equal(tor.chi, 0)

const kl = assembleSurface(STANDARD.klein)
assert.equal(kl.surface, 'klein')

const rp = assembleSurface(STANDARD.rp2)
assert.equal(rp.surface, 'rp2')
assert.equal(rp.chi, 1)

assert.ok(dSquaredZero([{ verts: [0, 1, 2] }]))
assert.ok(isZero(boundary1(boundary2([{ verts: [0, 1, 2] }]))))

assert.equal(antipodalDegree(1), 1)
assert.equal(antipodalDegree(2), -1)
assert.equal(composeDegree(2, -1), -2)
assert.equal(canComb(1), true)
assert.equal(canComb(2), false)
assert.equal(lefschetz([1, 0, 1]), 2)

assert.equal(chiFromCells(torusCells().cells), 0)
assert.equal(rp2Cells().homology[1], 'Z_2')

assert.ok(isCommutator("a b a' b'"))
assert.deepEqual(totals('a a b'), { a: 2, b: 1 })
assert.ok(totalsText('a a b').includes('a:2'))

const T = squareSurface({ bottom: 1, top: 1, left: 1, right: 1, diag: 1 })
assert.equal(T.surface, 'torus'); assert.equal(T.verts, 1); assert.equal(T.chi, 0); assert.ok(!T.lowerCyclic && !T.upperCyclic)
assert.ok(squareSurface({ bottom: 1, top: 1, left: 1, right: 1, diag: -1 }).lowerCyclic)
const K = squareSurface({ bottom: 1, top: 1, left: 1, right: -1, diag: 1 })
assert.equal(K.surface, 'klein'); assert.equal(K.verts, 1)
const P = squareSurface({ bottom: 1, top: -1, left: 1, right: -1, diag: 1 })
assert.equal(P.surface, 'rp2'); assert.equal(P.verts, 2); assert.equal(P.chi, 1); assert.ok(!P.lowerCyclic && !P.upperCyclic)
for (const d of [1, -1]) {
  const W = squareSurface({ bottom: 1, top: -1, left: -1, right: 1, diag: d })
  assert.ok(W.lowerCyclic || W.upperCyclic)
}
console.log('w2 math tests ok')
