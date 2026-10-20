import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import YardFrame from '../w2/YardFrame'

/**
 * Hopf Ring (4-7): the Hopf fibration S¹ → S³ → S². Over each point of S² sits a whole circle in
 * S³; drawn here by stereographic projection of S³ into space, every fibre is a circle and any two
 * link exactly once. Its long exact sequence of homotopy groups gives π₃(S²) ≅ π₃(S³) ≅ ℤ.
 *   circle       — click points of S² (the coloured buttons): their fibres light up
 *   linked       — pick two points: their circles link once
 *   seq          — the exact row π₃(S¹) → π₃(S³) → π₃(S²) → π₂(S¹): find π₃(S²)
 *   nulls_answer — show Null the Hopf map's linked fibres
 */

/** Points of S² as (polar θ, azimuth φ), with their button on the deck and colour. */
export const POINTS = [
  { id: 'a', th: 0.3, ph: 0, col: '#ffb347', btn: [-4.2, 2.6] },
  { id: 'b', th: 0.8, ph: 0.6, col: '#7fd6ff', btn: [-4.2, 1.0] },
  { id: 'c', th: 1.2, ph: 2.6, col: '#ff8ad8', btn: [-4.2, -0.6] },
  { id: 'd', th: 1.5, ph: 4.4, col: '#9cf0a0', btn: [-4.2, -2.2] },
]
const BASE = [-2.8, 2.2, 2.6] // the little S² floating by the buttons
const CENTER = [1.0, 2.3, -0.2]
const SCALE = 1.0

/** The Hopf fibre over (θ, φ), stereographically projected from (0, 0, 0, 1). */
export function fibre(th, ph, n = 96) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI
    const x1 = Math.cos(th / 2) * Math.cos(t)
    const x2 = Math.cos(th / 2) * Math.sin(t)
    const x3 = Math.sin(th / 2) * Math.cos(t + ph)
    const x4 = Math.sin(th / 2) * Math.sin(t + ph)
    const d = Math.max(1 - x4, 0.05)
    pts.push([CENTER[0] + (SCALE * x1) / d, CENTER[1] + (SCALE * x3) / d, CENTER[2] + (SCALE * x2) / d])
  }
  return pts
}
const onS2 = (th, ph, r = 0.75) => [BASE[0] + r * Math.sin(th) * Math.cos(ph), BASE[1] + r * Math.cos(th), BASE[2] + r * Math.sin(th) * Math.sin(ph)]

function Fibre({ p }) {
  const pts = useMemo(() => fibre(p.th, p.ph), [p])
  return <Line points={pts} color={p.col} lineWidth={4} />
}

function Base({ lit }) {
  return (
    <group>
      <mesh position={BASE}>
        <sphereGeometry args={[0.75, 28, 20]} />
        <meshStandardMaterial color="#c8d4e0" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {POINTS.map((p) => (
        <mesh key={p.id} position={onS2(p.th, p.ph, 0.78)}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshBasicMaterial color={p.col} toneMapped={false} transparent opacity={lit[p.id] ? 1 : 0.45} />
        </mesh>
      ))}
      <Html position={[BASE[0], BASE[1] + 1.1, BASE[2]]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">S²</div>
      </Html>
      {POINTS.map((p) => (
        <group key={p.id} position={[p.btn[0], 0, p.btn[1]]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.45, 0.5, 0.4, 16]} />
            <meshStandardMaterial color={p.col} emissive={p.col} emissiveIntensity={lit[p.id] ? 0.9 : 0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export const ROW = [['π₃(S¹)', '0'], ['π₃(S³)', 'ℤ'], ['π₃(S²)', '?'], ['π₂(S¹)', '0']]
export const CANDS = ['0', 'ℤ', 'ℤ₂', 'ℤ²']
export const rowX = (j) => (j - 1.5) * 2.4
function SeqRow({ pick }) {
  return (
    <group>
      {ROW.map(([name, g], j) => {
        const unknown = g === '?'
        const v = unknown ? pick || '?' : g
        const ok = unknown && pick === 'ℤ'
        return (
          <group key={j} position={[rowX(j), 0, 0.6]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <ringGeometry args={[0.7, 0.86, 36]} />
              <meshBasicMaterial color={ok ? '#4cff7a' : unknown ? '#ff8ad8' : '#c9a24a'} toneMapped={false} />
            </mesh>
            <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.85rem' }}>{v}</div>
            </Html>
            <Html position={[0, 0.3, 1.25]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.64rem' }}>{name}</div>
            </Html>
            {j < ROW.length - 1 && <Line points={[[0.9, 0.1, 0], [1.5, 0.1, 0]]} color="#9fe6ff" lineWidth={2} />}
          </group>
        )
      })}
      <Html position={[0, 0.3, -1.6]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">S¹ → S³ → S²: … → π₃(S¹) → π₃(S³) → π₃(S²) → π₂(S¹) → …  (exact)</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'seq') return <SeqRow pick={bag.pick} />
  const lit = bag.lit?.[id] || {}
  return (
    <group>
      <Base lit={lit} />
      {POINTS.filter((p) => lit[p.id]).map((p) => (
        <Fibre key={p.id} p={p} />
      ))}
      <Html position={[CENTER[0], 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">{id === 'nulls_answer' ? 'the Hopf map S³ → S²: fibres over two points' : 'S³, seen from inside (stereographic)'}</div>
      </Html>
    </group>
  )
}

export default function HopfRingScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0a10', water: '#2a1e34', deep: '#08060a', cloud: '#d8c8e8', spark: '#ffd27a', seed: 47 }} deckColor="#2e2a34" station={Station} />
}
