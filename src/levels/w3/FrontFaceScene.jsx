import { Html } from '@react-three/drei'
import { Arrow } from '../w2/TileYardScene'
import { Lever } from '../w2/DynamoGateScene'
import YardFrame from '../w2/YardFrame'

/**
 * Lantern Rows (3-3): the cup product. For 1-cochains, (φ ⌣ ψ)[v₀ v₁ v₂] = φ[v₀ v₁] · ψ[v₁ v₂] —
 * φ reads the front face, ψ the back face. Each deck is a triangle (or the torus' square of two,
 * as in the Tile Yard) with lanterns that light with the cast value.
 *   front_back       — one triangle, φ and ψ on its edges: cast φ's front face then ψ's back face
 *   cocycle_products — the torus: α ⌣ β on both triangles; their total on the fundamental class is 1
 *   swap             — β ⌣ α instead: the total is −1
 *   light_row        — choose φ and ψ from α, β so the torus' top lantern lights (+1)
 */

const H = 2.3
export const V = { 0: [-H, H], 1: [H, H], 2: [H, -H], 3: [-H, -H] }
const E3 = { '0-1': [0, 1], '1-2': [1, 2], '0-2': [0, 2] }
/** The torus: lower triangle [0 1 2], upper triangle [0 3 2] (vertex order 0 < 3 < 2). */
export const TORUS_EDGES = { '0-1': { v: [0, 1], name: 'a' }, '1-2': { v: [1, 2], name: 'b' }, '0-3': { v: [0, 3], name: 'b' }, '3-2': { v: [3, 2], name: 'a' }, '0-2': { v: [0, 2], name: 'c' } }
export const TRIS = { L: { v: [0, 1, 2], sign: 1 }, U: { v: [0, 3, 2], sign: -1 } }
export const COCYCLE = {
  α: { '0-1': 1, '3-2': 1, '0-2': 1, '1-2': 0, '0-3': 0 },
  β: { '0-1': 0, '3-2': 0, '0-2': 1, '1-2': 1, '0-3': 1 },
}
export const PHI = { '0-1': 2, '1-2': -1, '0-2': 1 }
export const PSI = { '0-1': 1, '1-2': 3, '0-2': 0 }
/** (φ ⌣ ψ) on an ordered triangle [a b c]: φ on the front face [a b], ψ on the back face [b c]. */
export const cupOn = (phi, psi, [a, b, c]) => (phi[`${a}-${b}`] || 0) * (psi[`${b}-${c}`] || 0)
export function torusCup(f, g) {
  const L = cupOn(COCYCLE[f], COCYCLE[g], TRIS.L.v)
  const U = cupOn(COCYCLE[f], COCYCLE[g], TRIS.U.v)
  return { L, U, total: L * TRIS.L.sign + U * TRIS.U.sign }
}
export const TRI_POS = { L: [0.8, 0.8], U: [-0.8, -0.8] }
export const TOP_LANTERN = [0, -3.8]
export const LEVERS = { f: [-4.0, 0.6], g: [4.0, 0.6], cast: [3.6, -2.8] }

const fmt = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

export function Lantern({ pos, value, label, size = 0.32 }) {
  const lit = value !== undefined && value !== null
  const col = !lit ? '#3a3a44' : value > 0 ? '#ffd27a' : value < 0 ? '#7fd6ff' : '#6a6a74'
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 1.2, 8]} />
        <meshStandardMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[size, 18, 14]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={lit && value ? 1.6 : 0.1} toneMapped={!(lit && value)} />
      </mesh>
      <Html position={[0, 1.95, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ color: col === '#3a3a44' ? '#8a8a94' : col, borderColor: col }}>
          {label}
          {lit ? ` = ${fmt(value)}` : ''}
        </div>
      </Html>
    </group>
  )
}

function Edge({ a, b, tags, name, hl }) {
  const [p, q] = [V[a], V[b]]
  const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
  const nx = -(q[1] - p[1])
  const nz = q[0] - p[0]
  const L = Math.hypot(nx, nz)
  return (
    <group>
      <Arrow from={p} to={q} sign={1} color={hl ? '#ffffff' : '#9aa8b0'} glow={hl} />
      <Html position={[mid[0] + (nx / L) * 0.5, 0.4, mid[1] + (nz / L) * 0.5]} center zIndexRange={[10, 0]}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {name && <span className="deck-tag" style={{ fontSize: '0.62rem' }}>{name}</span>}
          {tags.map(([v, col], i) => (
            <span key={i} className="floor-tag" style={{ fontSize: '0.62rem', color: col, borderColor: col }}>
              {fmt(v)}
            </span>
          ))}
        </div>
      </Html>
    </group>
  )
}

function Studs({ ids }) {
  return ids.map((id) => (
    <group key={id} position={[V[id][0], 0, V[id][1]]}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.32, 14]} />
        <meshStandardMaterial color="#e8e0c8" />
      </mesh>
      <Html position={[0, 0.7, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">v{id}</div>
      </Html>
    </group>
  ))
}

function Fill({ v, color, opacity = 0.5 }) {
  const arr = new Float32Array(v.flatMap((i) => [V[i][0], 0.06, V[i][1]]))
  return (
    <mesh>
      <bufferGeometry key={arr.join(',')}>
        <bufferAttribute attach="attributes-position" array={arr} count={3} itemSize={3} />
      </bufferGeometry>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={2} depthWrite={false} />
    </mesh>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'front_back') {
    const picks = bag.picks?.front_back || []
    const done = picks.length === 2
    return (
      <group>
        <Fill v={[0, 1, 2]} color="#3a4a40" opacity={0.8} />
        {Object.entries(E3).map(([k, [a, b]]) => (
          <Edge key={k} a={a} b={b} hl={picks.includes(k)} tags={[[PHI[k], '#ffb347'], [PSI[k], '#7fd6ff']]} />
        ))}
        <Studs ids={[0, 1, 2]} />
        <Lantern pos={[1.0, 0.9]} value={done ? PHI['0-1'] * PSI['1-2'] : null} label="φ⌣ψ" />
        <Html position={[-2.6, 0.3, -1.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">
            <span style={{ color: '#ffb347' }}>φ</span> · <span style={{ color: '#7fd6ff' }}>ψ</span>
          </div>
        </Html>
      </group>
    )
  }
  const pair = id === 'swap' ? ['β', 'α'] : id === 'light_row' ? [bag.pair?.f || 'α', bag.pair?.g || 'α'] : ['α', 'β']
  const cast = bag.cast?.[id] || {}
  const c = torusCup(...pair)
  const total = cast.L !== undefined && cast.U !== undefined ? c.total : null
  return (
    <group>
      <Fill v={[0, 1, 2]} color="#3a4a40" />
      <Fill v={[0, 3, 2]} color="#3a404a" />
      {Object.entries(TORUS_EDGES).map(([k, e]) => (
        <Edge key={k} a={e.v[0]} b={e.v[1]} name={e.name} tags={[[COCYCLE[pair[0]][k], '#ffb347'], [COCYCLE[pair[1]][k], '#7fd6ff']]} />
      ))}
      <Studs ids={[0, 1, 2, 3]} />
      <Lantern pos={TRI_POS.L} value={cast.L !== undefined ? c.L : null} label="[v₀v₁v₂]" size={0.24} />
      <Lantern pos={TRI_POS.U} value={cast.U !== undefined ? c.U : null} label="[v₀v₃v₂]" size={0.24} />
      <Lantern pos={TOP_LANTERN} value={total} label={`${pair[0]}⌣${pair[1]} on T`} size={0.42} />
      {id === 'light_row' && (
        <>
          <Lever pos={LEVERS.f} on label={`front: ${pair[0]}`} />
          <Lever pos={LEVERS.g} on label={`back: ${pair[1]}`} />
          <Lever pos={LEVERS.cast} on={total === 1} label="cast" />
        </>
      )}
    </group>
  )
}

export default function FrontFaceScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0e0a14', water: '#2a1e40', deep: '#08060c', cloud: '#d8c0f0', spark: '#ffd27a', seed: 33 }} deckColor="#2e2a36" station={Station} />
}
