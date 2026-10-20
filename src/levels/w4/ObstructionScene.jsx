import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Obstruction Course (4-12), Hatcher §4.3 pp. 415–419: extend a map A → X over W, cell by cell.
 *   cell    — an (n+1)-cell extends when its boundary map Sⁿ → X is nullhomotopic; guaranteed when πₙ(X) = 0 (Lemma 4.7)
 *   blocked — the obstruction on each 3-cell is its boundary class in π₂(S²) = ℤ; extend only where it is 0 (Prop. 4.72)
 *   reroute — changing the map on a shared 2-cell by k ∈ π₂ shifts the two 3-cells by +k and −k (a coboundary);
 *             the class (here the sum) can't move. Cochain-level picture: Hatcher p. 416 defers this to [VBKT],
 *             so this station goes slightly beyond the text.
 *   summit  — Corollary 4.73: if Hⁿ⁺¹(W, A; πₙX) = 0 for all n, every map A → X extends to W
 */

export const CELLS = [
  { id: 'a', dim: 1, grp: 'π₀(S²) = 0', ok: true },
  { id: 'b', dim: 2, grp: 'π₁(S²) = 0', ok: true },
  { id: 'c', dim: 2, grp: 'π₁(S²) = 0', ok: true },
  { id: 'd', dim: 3, grp: 'π₂(S²) = ℤ', ok: false },
]
export const cellX = (i, n = 4) => (i - (n - 1) / 2) * (n === 4 ? 1.8 : 2.4)
export const CELL_Z = 0.6
export const BLOCKS = [0, 2, -1] // boundary degrees of three 3-cells, in π₂(S²) = ℤ
export const REROUTE = [
  [1, -1],
  [2, 0],
]
export const SHARE = [0, 0.4]
export const SEAL = [0, 2.9]
export const DOORS = [
  { id: 'd2', pair: '(D², S¹) → S²', groups: 'H²(D², S¹; π₁S²) = H²(·; 0) = 0', open: true },
  { id: 'd3', pair: '(D³, S²) → S²', groups: 'H³(D³, S²; π₂S²) = ℤ', open: false },
  { id: 'd4', pair: '(D⁴, S³) → S²', groups: 'H⁴(D⁴, S³; π₃S²) = ℤ', open: false },
  { id: 'd1', pair: '(D³, S²) → S¹', groups: 'πₙ(S¹) = 0 for n ≥ 2; H²(D³, S²; ℤ) = 0', open: true },
]
const neg = (n) => (n < 0 ? `−${-n}` : `${n}`)

function Dome({ x, z, r = 0.6, state, label, sub }) {
  const col = state === 'ok' ? '#4cff7a' : state === 'bad' ? '#ff5a5a' : state === 'read' ? '#ffd27a' : '#8a8aa0'
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={state ? 0.35 : 0.08} transparent opacity={state === 'ok' ? 0.95 : 0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[r, r + 0.08, 32]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      <Html position={[0, r + 0.35, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.62rem' }}>{label}</div>
      </Html>
      {sub && (
        <Html position={[0, 0.2, r + 0.6]} center zIndexRange={[10, 0]}>
          <div className="deck-tag" style={{ fontSize: '0.58rem' }}>{sub}</div>
        </Html>
      )}
    </group>
  )
}

function CellRoom({ bag }) {
  const ext = bag.ext || {}
  return (
    <group>
      {CELLS.map((c, i) => (
        <Dome key={c.id} x={cellX(i)} z={CELL_Z} r={0.35 + c.dim * 0.12} state={ext[c.id] ? 'ok' : bag.tried === c.id ? 'bad' : null} label={`e${'¹²³'[c.dim - 1]}`} sub={`∂ in ${c.grp}`} />
      ))}
      <Html position={[0, 0.3, 4.0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">extend A → S² over W, one cell at a time</div>
      </Html>
    </group>
  )
}

function BlockedRoom({ bag }) {
  const read = bag.read || {}
  const ext = bag.ext || {}
  return (
    <group>
      {BLOCKS.map((d, i) => (
        <Dome key={i} x={cellX(i, 3)} z={CELL_Z} r={0.75} state={ext[i] ? 'ok' : read[i] ? (d ? 'bad' : 'read') : null} label={read[i] || ext[i] ? `ω = ${neg(d)}` : 'ω = ?'} sub={ext[i] ? 'extended' : read[i] && d ? 'blocked' : 'e³'} />
      ))}
      <Html position={[0, 0.3, 4.0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">obstruction on each 3-cell: its boundary’s class in π₂(S²) = ℤ</div>
      </Html>
    </group>
  )
}

function RerouteRoom({ bag }) {
  const round = Math.min(bag.round || 0, REROUTE.length - 1)
  const [a0, b0] = REROUTE[round]
  const k = bag.k || 0
  const A = a0 + k
  const B = b0 - k
  return (
    <group>
      <Dome x={-2.6} z={SHARE[1]} r={0.8} state={A === 0 ? 'ok' : 'bad'} label={`A: ω = ${neg(A)}`} />
      <Dome x={2.6} z={SHARE[1]} r={0.8} state={B === 0 ? 'ok' : 'bad'} label={`B: ω = ${neg(B)}`} />
      <Line points={[[-1.7, 0.1, SHARE[1]], [1.7, 0.1, SHARE[1]]]} color="#9fe6ff" lineWidth={4} />
      <group position={[SHARE[0], 0, SHARE[1]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.6, 28]} />
          <meshStandardMaterial color="#2f4a5a" emissive="#9fe6ff" emissiveIntensity={0.25} />
        </mesh>
        <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ fontSize: '0.62rem' }}>shared e²: twist {neg(k)}</div>
        </Html>
      </group>
      <group position={[SEAL[0], 0, SEAL[1]]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.6, 28]} />
          <meshStandardMaterial color="#4a2a30" emissive="#ff5a5a" emissiveIntensity={0.2} />
        </mesh>
        <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ fontSize: '0.62rem' }}>declare: class ≠ 0</div>
        </Html>
      </group>
      <Html position={[0, 0.3, -1.6]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">round {round + 1} / 2 · class = A + B = {neg(A + B)}</div>
      </Html>
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">twisting the shared 2-cell moves ω by a coboundary: +k on A, −k on B</div>
      </Html>
    </group>
  )
}

function SummitRoom({ bag }) {
  const opened = bag.opened || {}
  return (
    <group>
      {DOORS.map((d, i) => {
        const x = cellX(i)
        const st = opened[d.id] ? 'ok' : bag.tried === d.id ? 'bad' : null
        const col = st === 'ok' ? '#4cff7a' : st === 'bad' ? '#ff5a5a' : '#6a6080'
        return (
          <group key={d.id} position={[x, 0, 0.2]}>
            <mesh position={[0, opened[d.id] ? 0.15 : 0.9, 0]}>
              <boxGeometry args={[1.2, opened[d.id] ? 0.3 : 1.8, 0.3]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.25} />
            </mesh>
            <Html position={[0, 2.2, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.6rem' }}>{d.pair}</div>
            </Html>
            <Html position={[0, 0.2, i % 2 ? 1.8 : 1.1]} center zIndexRange={[10, 0]}>
              <div className="deck-tag" style={{ fontSize: '0.55rem', maxWidth: '9rem' }}>{d.groups}</div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.1]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">Cor. 4.73: all Hⁿ⁺¹(W, A; πₙX) = 0 ⇒ every map A → X extends</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  if (site.id === 'cell') return <CellRoom bag={bag} />
  if (site.id === 'blocked') return <BlockedRoom bag={bag} />
  if (site.id === 'reroute') return <RerouteRoom bag={bag} />
  if (site.id === 'summit') return <SummitRoom bag={bag} />
  return null
}

export default function ObstructionScene(props) {
  return <YardFrame {...props} sky={{ bg: '#120a0a', water: '#381e1e', deep: '#0c0606', cloud: '#f0d0c8', spark: '#ff9a7a', seed: 52 }} deckColor="#362a2a" station={Station} />
}
