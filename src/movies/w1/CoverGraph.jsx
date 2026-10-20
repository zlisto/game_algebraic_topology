import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { LETTER_COLORS } from '../../levels/w0/Hologram'

/**
 * A covering space of a wedge of circles, drawn the way Hatcher draws them (§1.3, p. 58): one
 * vertex per sheet, and for each letter an edge from every sheet to where that letter sends it.
 * `cover` = { a: [σ(0), σ(1), …], b: […] } (b optional); `verts` = vertex positions [x, y, z].
 *
 * Shared by the 1-8 movie and lesson.
 */

const ARC = 0.9 // how far an edge bows out, so a→ and its return don't overlap

/** Points along the edge from vertex i to vertex j for letter k (a self-loop if i === j). */
export function edgePts(verts, i, j, k, n = 32) {
  const [x0, y0, z0] = verts[i]
  const [x1, y1, z1] = verts[j]
  if (i === j) {
    // a small loop beside the vertex, a's on one side and b's on the other
    const side = k === 0 ? -1 : 1
    return Array.from({ length: n + 1 }, (_, s) => {
      const a = (s / n) * Math.PI * 2
      return [x0 + side * (0.45 + 0.45 * Math.cos(a + Math.PI)), z0 + 0.45 * Math.sin(a), y0]
    })
  }
  const mx = (x0 + x1) / 2
  const mz = (z0 + z1) / 2
  const dx = x1 - x0
  const dz = z1 - z0
  const l = Math.hypot(dx, dz) || 1
  const bow = (k === 0 ? 1 : -1) * ARC
  const cx = mx + (-dz / l) * bow
  const cz = mz + (dx / l) * bow
  return Array.from({ length: n + 1 }, (_, s) => {
    const u = s / n
    const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1
    const z = (1 - u) * (1 - u) * z0 + 2 * (1 - u) * u * cz + u * u * z1
    const y = (1 - u) * y0 + u * y1
    return [x, z, y]
  })
}

/** Where a word's lift is at progress p ∈ [0, letters]: { pos, sheet }. Letters are [k, dir]. */
export function liftAt(cover, verts, start, word, p) {
  let v = start
  const letters = [cover.a, cover.b]
  const inv = (perm) => perm.map((_, i) => perm.indexOf(i))
  for (let i = 0; i < word.length; i++) {
    const [k, d] = word[i]
    const perm = d > 0 ? letters[k] : inv(letters[k])
    const w = perm[v]
    if (p < i + 1) {
      const u = Math.max(0, p - i)
      const pts = d > 0 ? edgePts(verts, v, w, k) : edgePts(verts, w, v, k).slice().reverse()
      const q = pts[Math.round(u * (pts.length - 1))]
      return { pos: [q[0], q[2], q[1]], sheet: v }
    }
    v = w
  }
  return { pos: verts[v], sheet: v }
}

/** The graph itself: vertices with sheet numbers, a-edges orange, b-edges blue, arrowheads. */
export default function CoverGraph({ cover, verts, show = () => true, labels = true }) {
  const g = useRef()
  useFrame(() => (g.current.visible = show()))
  const edges = useMemo(() => {
    const out = []
    ;[cover.a, cover.b].forEach((perm, k) => {
      if (!perm) return
      perm.forEach((j, i) => out.push({ k, pts: edgePts(verts, i, j, k) }))
    })
    return out
  }, [cover, verts])
  return (
    <group ref={g}>
      {edges.map((e, i) => {
        const mid = e.pts[Math.floor(e.pts.length * 0.55)]
        const pre = e.pts[Math.floor(e.pts.length * 0.5)]
        return (
          <group key={i}>
            <LiveLine getPts={() => (show() ? e.pts : null)} color={LETTER_COLORS[e.k]} width={4} y={0} />
            <group position={[mid[0], mid[2], mid[1]]} rotation={[0, Math.atan2(mid[0] - pre[0], mid[1] - pre[1]), 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.13, 0.3, 8]} />
                <meshBasicMaterial color={LETTER_COLORS[e.k]} toneMapped={false} />
              </mesh>
            </group>
          </group>
        )
      })}
      {verts.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshBasicMaterial color="#e8eefc" toneMapped={false} />
          </mesh>
          {labels && (
            <Html position={[0, 0.45, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <div className="floor-tag">sheet {i + 1}</div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}
