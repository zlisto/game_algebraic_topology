import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import YardFrame from '../w2/YardFrame'

/**
 * Grid Gallery (4-2): cellular approximation. The deck floor is a CW complex: lattice points are
 * 0-cells, grid lines 1-cells, squares 2-cells. A map of an interval is a wiggly path; cellular
 * approximation homotopes it, rel its ends, into the 1-skeleton — skeleton by skeleton.
 *   snap   — snap each wiggly piece onto grid edges
 *   slip   — S² = e⁰ ∪ e²: a loop in the 2-cell; puncture a point it misses, then push it to e⁰
 *   small  — a board of πₖ(Sⁿ): mark the ones cellular approximation kills (k < n)
 *   approx — endpoints off the grid: snap the 0-cells first, then the 1-cells
 */

export const STEP = 1.6
const wig = (a, b, amp = 0.45, n = 32, phase = 0) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const L = Math.hypot(dx, dz) || 1
    const w = amp * Math.sin(t * Math.PI * 3 + phase) * Math.sin(t * Math.PI)
    return [a[0] + dx * t - (dz / L) * w, a[1] + dz * t + (dx / L) * w]
  })
/** An L-shaped grid path a → corner → b. */
const ell = (a, b) => [a, [b[0], a[1]], b]

export const PATHS = {
  snap: [
    { a: [-3.2, 1.6], b: [-1.6, 0] },
    { a: [-1.6, 0], b: [0, -1.6] },
    { a: [0, -1.6], b: [1.6, 0] },
    { a: [1.6, 0], b: [3.2, -1.6] },
  ],
  approx: [
    { a: [-3.2, 1.6], b: [0, 0] },
    { a: [0, 0], b: [1.6, -1.6] },
  ],
}
export const APPROX_ENDS = { A: { off: [-2.85, 2.1], on: [-3.2, 1.6] }, B: { off: [2.0, -2.15], on: [1.6, -1.6] } }
export const segMid = (s) => [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2]
export const BOARD = [1, 2, 3]
export const boardPos = (k, n) => [(k - 2) * 1.8 + 0.4, (n - 2) * 1.5 + 0.4]

function Grid({ dim }) {
  const lines = []
  for (let i = -2; i <= 2; i++) {
    lines.push([[i * STEP, 0.08, -2 * STEP], [i * STEP, 0.08, 2 * STEP]])
    lines.push([[-2 * STEP, 0.08, i * STEP], [2 * STEP, 0.08, i * STEP]])
  }
  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#5a6470" lineWidth={1.5} transparent opacity={dim ? 0.4 : 0.8} />
      ))}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={i} position={[((i % 5) - 2) * STEP, 0.12, (Math.floor(i / 5) - 2) * STEP]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshBasicMaterial color="#c8d4e0" />
        </mesh>
      ))}
    </group>
  )
}

function PathPiece({ s, snapped, i }) {
  const pts = useMemo(() => (snapped ? ell(s.a, s.b) : wig(s.a, s.b, 0.5, 32, i)).map(([x, z]) => [x, 0.16, z]), [s, snapped, i])
  return <Line points={pts} color={snapped ? '#ffd27a' : '#ff8ad8'} lineWidth={snapped ? 5 : 4} />
}

function Sphere2({ punctured, pushed }) {
  const k = useRef(0)
  const g = useRef()
  useFrame((_, dt) => {
    k.current = pushed ? Math.min(1, k.current + dt / 1.6) : 0
    if (g.current) g.current.scale.setScalar(1 + k.current * 1.15)
  })
  const loop = useMemo(() => Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * 2 * Math.PI
    const r = 1.4 + 0.25 * Math.sin(5 * a)
    return [r * Math.cos(a) + 0.4, 0.16, r * Math.sin(a) - 0.2]
  }), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color="#2e3446" />
      </mesh>
      <Line points={Array.from({ length: 65 }, (_, i) => [3.4 * Math.cos((i / 64) * 2 * Math.PI), 0.12, 3.4 * Math.sin((i / 64) * 2 * Math.PI)])} color="#ffd27a" lineWidth={4} />
      <Html position={[0, 0.4, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">S² = e⁰ ∪ e² — the gold rim is all one point, e⁰</div>
      </Html>
      {punctured && (
        <mesh position={[0.4, 0.1, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 24]} />
          <meshBasicMaterial color="#05060a" />
        </mesh>
      )}
      <group ref={g} position={[0.4, 0, -0.2]}>
        <group position={[-0.4, 0, 0.2]}>
          <Line points={loop} color="#ff8ad8" lineWidth={4} transparent opacity={pushed ? 0.6 : 1} />
        </group>
      </group>
    </group>
  )
}

function Board({ marked }) {
  return (
    <group>
      {BOARD.map((n) =>
        BOARD.map((k) => {
          const [x, z] = boardPos(k, n)
          const m = marked[`${k}-${n}`]
          return (
            <group key={`${k}-${n}`} position={[x, 0, z]}>
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[1.5, 0.24, 1.2]} />
                <meshStandardMaterial color={m ? '#3a4a3a' : '#3a3440'} emissive={m ? '#4cff7a' : '#000000'} emissiveIntensity={m ? 0.3 : 0} />
              </mesh>
              <Html position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
                <div className="floor-tag" style={{ fontSize: '0.66rem' }}>
                  π{'₁₂₃'[k - 1]}(S{'¹²³'[n - 1]}){m ? ' = 0' : ''}
                </div>
              </Html>
            </group>
          )
        }),
      )}
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'snap' || id === 'approx') {
    const snapped = bag.snapped?.[id] || {}
    const ends = bag.ends || {}
    return (
      <group>
        <Grid />
        {PATHS[id].map((s, i) => {
          const seg = id === 'approx' ? { a: i === 0 && !ends.A ? APPROX_ENDS.A.off : s.a, b: i === 1 && !ends.B ? APPROX_ENDS.B.off : s.b } : s
          return <PathPiece key={i} s={seg} snapped={snapped[i]} i={i} />
        })}
        {id === 'approx' &&
          Object.entries(APPROX_ENDS).map(([k, e]) => {
            const p = ends[k] ? e.on : e.off
            return (
              <mesh key={k} position={[p[0], 0.25, p[1]]}>
                <sphereGeometry args={[0.2, 14, 10]} />
                <meshStandardMaterial color={ends[k] ? '#ffd27a' : '#ff8ad8'} emissive={ends[k] ? '#ffb347' : '#ff8ad8'} emissiveIntensity={0.8} />
              </mesh>
            )
          })}
      </group>
    )
  }
  if (id === 'slip') return <Sphere2 punctured={!!bag.punct} pushed={!!bag.pushed} />
  if (id === 'small') return <Board marked={bag.marked || {}} />
  return null
}

export default function GridGalleryScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0c10', water: '#1a2430', deep: '#06080a', cloud: '#b8c8d8', spark: '#e0e8ff', seed: 42 }} deckColor="#2a2e34" station={Station} />
}
