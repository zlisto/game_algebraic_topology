import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useRef } from 'react'
import Hologram, { LETTER_COLORS } from '../w0/Hologram'
import { Arrow } from './TileYardScene'
import { Lever } from './DynamoGateScene'
import YardFrame from './YardFrame'

/**
 * Cell Block (2-7): cellular homology. A 2-cell is drawn with its rim word — coloured arrows round
 * its edge, one colour per 1-cell. Walking once round the rim and adding ±1 for each arrow (+ when
 * it points the way you walk) gives the cellular boundary d₂; then H₁ = ℤᵏ / Im d₂ and H₂ = Ker d₂.
 *   crates   — build the torus cell by cell: e⁰, then e¹ₐ and e¹ᵦ, then e²
 *   torus    — the torus' 2-cell, rim a b a⁻¹ b⁻¹
 *   doubled  — ℝP²: one 1-cell, rim a a
 *   census   — the Klein bottle, rim a b a⁻¹ b
 */

const H = 2.0
/** Square 2-cells: sides walked counter-clockwise from the south-west corner (south, east, north, west). */
const SIDES = {
  south: { from: [-H, H], to: [H, H] },
  east: { from: [H, H], to: [H, -H] },
  north: { from: [H, -H], to: [-H, -H] },
  west: { from: [-H, -H], to: [-H, H] },
}
/** Each rim: [side, letter, ±1 = arrow along / against the walk]. */
export const CELLS = {
  torus: { letters: ['a', 'b'], rim: [['south', 'a', 1], ['east', 'b', 1], ['north', 'a', -1], ['west', 'b', -1]], kind: 'torus' },
  census: { letters: ['a', 'b'], rim: [['south', 'a', 1], ['east', 'b', 1], ['north', 'a', -1], ['west', 'b', 1]], kind: 'klein' },
  doubled: { letters: ['a'], rim: [['upper', 'a', 1], ['lower', 'a', 1]], kind: 'rp2' },
}
export function d2(id) {
  const c = CELLS[id]
  return Object.fromEntries(c.letters.map((l) => [l, c.rim.filter(([, x]) => x === l).reduce((s, [, , e]) => s + e, 0)]))
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
/** Homology of a one-vertex, one-2-cell complex from d₂ (d₁ = 0 when there's one vertex). */
export function homology(id) {
  const d = Object.values(d2(id))
  const k = d.length
  const g = d.reduce((a, b) => gcd(a, b), 0)
  const free = g === 0 ? k : k - 1
  const h1 = [free ? (free === 1 ? 'ℤ' : `ℤ${['', '', '²', '³'][free]}`) : null, g > 1 ? `ℤ${['', '', '₂', '₃', '₄'][g]}` : null].filter(Boolean).join(' ⊕ ') || '0'
  return { H0: 'ℤ', H1: h1, H2: g === 0 ? 'ℤ' : '0', cells: [1, k, 1], ranks: [1, free, g === 0 ? 1 : 0] }
}
export const LETTER_LEVERS = { a: [-3.6, -1.2], b: [-3.6, 1.6] }
export const PRESS = [3.8, 1.4]
export const COEFS = [-2, -1, 0, 1, 2]

export function RimSquare({ id }) {
  const c = CELLS[id]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[2 * H, 2 * H]} />
        <meshBasicMaterial color="#3a3a4a" />
      </mesh>
      {c.rim.map(([side, l, e]) => {
        const { from, to } = SIDES[side]
        const col = LETTER_COLORS[c.letters.indexOf(l)]
        return <Arrow key={side} from={from} to={to} sign={e} color={col} chevrons={l === 'b' ? 2 : 1} glow />
      })}
    </group>
  )
}

/** ℝP² as a 2-gon: a disk whose rim is two arcs, both a, both pointing the same way round. */
export function RimDigon() {
  const R = 2.2
  const arc = (a0, a1) => Array.from({ length: 33 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / 32
    return [R * Math.cos(a), 0.12, R * Math.sin(a)]
  })
  const head = (a) => {
    const p = [R * Math.cos(a), R * Math.sin(a)]
    const dir = [-Math.sin(a), Math.cos(a)]
    return (
      <group key={a} position={[p[0], 0.16, p[1]]} rotation={[0, Math.atan2(-dir[1], dir[0]), 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]}>
          <circleGeometry args={[0.32, 3]} />
          <meshBasicMaterial color={LETTER_COLORS[0]} side={2} toneMapped={false} />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[R, 48]} />
        <meshBasicMaterial color="#3a3a4a" />
      </mesh>
      <Line points={arc(0, Math.PI)} color={LETTER_COLORS[0]} lineWidth={4} />
      <Line points={arc(Math.PI, 2 * Math.PI)} color={LETTER_COLORS[0]} lineWidth={4} />
      {head(Math.PI / 2)}
      {head((3 * Math.PI) / 2)}
      {[0, Math.PI].map((a) => (
        <mesh key={a} position={[R * Math.cos(a), 0.2, R * Math.sin(a)]}>
          <sphereGeometry args={[0.16, 12, 10]} />
          <meshBasicMaterial color="#fff2c4" />
        </mesh>
      ))}
    </group>
  )
}

export function Folded({ kind, on }) {
  const kRef = useRef(0)
  useFrame((_, dt) => {
    kRef.current = on ? Math.min(1, kRef.current + dt / 2.4) : 0
  })
  if (!on) return null
  return (
    <group position={[0, 1.5, -0.6]} scale={0.95}>
      <Hologram kind={kind} kRef={kRef} word={kind === 'rp2' ? [{ e: 0 }, { e: 0 }] : []} />
    </group>
  )
}

/** The Crates deck: four crates to attach, and the growing skeleton in the middle. */
export const CRATES = { e0: [-3.8, -1.6], a: [-3.8, 0.6], b: [-3.8, 2.8], e2: [3.8, 1.4] }
const CRATE_LABEL = { e0: 'e⁰', a: 'e¹ₐ', b: 'e¹ᵦ', e2: 'e²' }
function Skeleton({ built }) {
  const loop = (cx) => Array.from({ length: 41 }, (_, i) => [cx + Math.cos((i / 40) * 2 * Math.PI), 0.14, Math.sin((i / 40) * 2 * Math.PI)])
  return (
    <group>
      {built.e0 && (
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      )}
      {built.a && !built.e2 && <Line points={loop(-1)} color={LETTER_COLORS[0]} lineWidth={4} />}
      {built.b && !built.e2 && <Line points={loop(1)} color={LETTER_COLORS[1]} lineWidth={4} />}
    </group>
  )
}
function Crate({ pos, label, used }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color={used ? '#2a2a30' : '#8a6a3a'} roughness={0.8} transparent opacity={used ? 0.4 : 1} />
      </mesh>
      <Html position={[0, 1.1, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ opacity: used ? 0.4 : 1 }}>{label}</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'crates') {
    const built = bag.built || {}
    return (
      <group>
        {Object.entries(CRATES).map(([k, pos]) => (
          <Crate key={k} pos={pos} label={CRATE_LABEL[k]} used={built[k]} />
        ))}
        <Skeleton built={built} />
        <Folded kind="torus" on={!!built.e2} />
      </group>
    )
  }
  if (!CELLS[id]) return null
  const c = CELLS[id]
  const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[id] || {}) }
  const solved = bag.solved?.[id]
  return (
    <group>
      {id === 'doubled' ? <RimDigon /> : <RimSquare id={id} />}
      {c.letters.map((l) => (
        <Lever key={l} pos={LETTER_LEVERS[l]} on label={`${l}: ${coef[l] > 0 ? '+' : coef[l] < 0 ? '−' : ''}${Math.abs(coef[l])}`} />
      ))}
      <Lever pos={PRESS} on={!!solved} label="attach e²" />
      <Folded kind={c.kind} on={!!solved} />
    </group>
  )
}

export default function CellBlockScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0e12', water: '#1a2a34', deep: '#060a0c', cloud: '#b0c4d0', spark: '#ffe6a8', seed: 27 }} deckColor="#2a2e34" station={Station} />
}
