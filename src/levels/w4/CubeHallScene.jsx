import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Cube Hall (4-1): higher homotopy groups. An element of πₙ(X, x₀) is a map of the cube Iⁿ whose
 * whole boundary goes to the base point x₀ (the gold beacon) — equivalently a map of Sⁿ. Two such
 * maps add by putting their cubes side by side.
 *   pinned — pin all four edges of the square to the beacon
 *   stack  — place f in the left half and g in the right: f + g
 *   pass   — with the Tide Glass: shrink, slide past, regrow — f + g becomes g + f
 *   dim1   — the same on an interval: there's no room to slide past
 */

export const H = 2.2
export const EDGES = { s: [[-H, H], [H, H]], e: [[H, H], [H, -H]], n: [[H, -H], [-H, -H]], w: [[-H, -H], [-H, H]] }
export const SLOTS = { L: [-H / 2, 0], R: [H / 2, 0] }
export const TRAYS = { f: [-3.9, 3.2], g: [3.9, 3.2] }
const ORANGE = '#ffb347'
const BLUE = '#7fd6ff'

/** Rectangles [cx, cz, w, d] for f and g at each stage of the swap (2-D) — 5 = swapped. */
export const PASS = [
  { f: [-H / 2, 0, H, 2 * H], g: [H / 2, 0, H, 2 * H] },
  { f: [-H / 2, 0, 1.2, 1.2], g: [H / 2, 0, 1.2, 1.2] },
  { f: [-H / 2, -H / 2, 1.2, 1.2], g: [H / 2, H / 2, 1.2, 1.2] },
  { f: [H / 2, -H / 2, 1.2, 1.2], g: [-H / 2, H / 2, 1.2, 1.2] },
  { f: [H / 2, 0, 1.2, 1.2], g: [-H / 2, 0, 1.2, 1.2] },
  { f: [H / 2, 0, H, 2 * H], g: [-H / 2, 0, H, 2 * H] },
]
export const LINE_STAGES = [
  { f: [-H / 2, 0, H, 0.5], g: [H / 2, 0, H, 0.5] },
  { f: [-H / 2, 0, 0.8, 0.5], g: [H / 2, 0, 0.8, 0.5] },
]

function Rect({ r, color, label, y = 0.08 }) {
  if (!r) return null
  const [cx, cz, w, d] = r
  return (
    <group position={[cx, y, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.85} />
      </mesh>
      <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ color, borderColor: color }}>{label}</div>
      </Html>
    </group>
  )
}

function Frame({ pinned = { s: true, e: true, n: true, w: true }, line }) {
  if (line)
    return (
      <group>
        <Line points={[[-H, 0.1, 0], [H, 0.1, 0]]} color="#c8d4e0" lineWidth={3} />
        {[-H, H].map((x) => (
          <mesh key={x} position={[x, 0.3, 0]}>
            <sphereGeometry args={[0.22, 14, 10]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
        <Html position={[0, 0.3, -0.9]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">I¹ — both ends at the beacon</div>
        </Html>
      </group>
    )
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[2 * H, 2 * H]} />
        <meshBasicMaterial color="#2a2e3a" />
      </mesh>
      {Object.entries(EDGES).map(([k, [p, q]]) => (
        <Line key={k} points={[[p[0], 0.12, p[1]], [q[0], 0.12, q[1]]]} color={pinned[k] ? '#ffd27a' : '#6a6a74'} lineWidth={pinned[k] ? 6 : 3} />
      ))}
    </group>
  )
}

function Beacon() {
  return (
    <group position={[0, 0, -3.9]}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 10]} />
        <meshStandardMaterial color="#3a3440" />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <Html position={[0, 2.4, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">x₀</div>
      </Html>
    </group>
  )
}

function Tray({ pos, color, label, used }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.4, 1.1]} />
        <meshStandardMaterial color={used ? '#2a2a30' : color} emissive={color} emissiveIntensity={used ? 0 : 0.4} />
      </mesh>
      <Html position={[0, 0.8, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ opacity: used ? 0.4 : 1 }}>{label}</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'pinned') {
    const p = bag.pinned || {}
    return (
      <group>
        <Beacon />
        <Frame pinned={p} />
        <Rect r={[0.3, 0.2, 2.2, 1.8]} color={ORANGE} label="f" />
      </group>
    )
  }
  if (id === 'stack') {
    const placed = bag.placed || {}
    const sel = bag.sel?.stack
    return (
      <group>
        <Beacon />
        <Frame />
        <Tray pos={TRAYS.f} color={ORANGE} label={sel === 'f' ? '▸ f' : 'f'} used={placed.f} />
        <Tray pos={TRAYS.g} color={BLUE} label={sel === 'g' ? '▸ g' : 'g'} used={placed.g} />
        {placed.f && <Rect r={[SLOTS[placed.f][0], 0, H, 2 * H]} color={ORANGE} label="f" />}
        {placed.g && <Rect r={[SLOTS[placed.g][0], 0, H, 2 * H]} color={BLUE} label="g" />}
        {Object.entries(SLOTS).map(([k, [x]]) => (
          <Html key={k} position={[x, 0.3, H + 0.5]} center zIndexRange={[10, 0]}>
            <div className="deck-tag">{k === 'L' ? 'left half' : 'right half'}</div>
          </Html>
        ))}
      </group>
    )
  }
  if (id === 'pass') {
    const s = PASS[Math.min(bag.stage?.pass || 0, PASS.length - 1)]
    return (
      <group>
        <Beacon />
        <Frame />
        <Rect r={s.f} color={ORANGE} label="f" y={0.09} />
        <Rect r={s.g} color={BLUE} label="g" y={0.1} />
      </group>
    )
  }
  if (id === 'dim1') {
    const s = LINE_STAGES[Math.min(bag.stage?.dim1 || 0, 1)]
    return (
      <group>
        <Beacon />
        <Frame line />
        <Rect r={s.f} color={ORANGE} label="f" y={0.09} />
        <Rect r={s.g} color={BLUE} label="g" y={0.1} />
        {bag.blocked && (
          <Html position={[0, 0.4, 1.2]} center zIndexRange={[10, 0]}>
            <div className="floor-tag" style={{ color: '#ff8ad8', borderColor: '#ff8ad8' }}>no room to pass</div>
          </Html>
        )}
      </group>
    )
  }
  return null
}

export default function CubeHallScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0a14', water: '#241a40', deep: '#06060c', cloud: '#c8b8f0', spark: '#c9a0ff', seed: 41 }} deckColor="#2c2a36" station={Station} />
}
