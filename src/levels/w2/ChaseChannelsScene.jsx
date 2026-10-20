import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { NEG, POS } from './ChainDeck'
import YardFrame from './YardFrame'

/**
 * Chase Channels (2-4): exact sequences as rows of canal locks. Each lock is a small abelian group
 * laid out as a ring of tiles (ℤₙ: n tiles; 0: one tile; ℤ: a few tiles and "…"); each sluice
 * between neighbouring locks is a homomorphism, drawn tile to tile. At every inner lock, gold rings
 * mark what the incoming sluice delivers (the image) and blue fills mark what the outgoing sluice
 * drains to 0 (the kernel). The lock is exact — and glows green — when the two are the same.
 */

export const GROUPS = { 0: { n: 1, name: '0' }, Z2: { n: 2, name: 'ℤ₂' }, Z4: { n: 4, name: 'ℤ₄' }, Z: { n: 0, name: 'ℤ' } }
export const CANDIDATES = ['0', 'Z2', 'Z', 'Z4']

/** Station rows: locks (left → right) and sluices (map i → i+1, as "1 ↦ k" or a named map). */
export const ROWS = {
  exact: { locks: ['Z4', 'Z4', 'Z2'], maps: [{ k: 0, set: [0, 1, 2, 3] }, { k: 1, fixed: true }] },
  chase: { locks: ['0', 'Z2', 'Z4', 'Z2', '0'], maps: [{ zero: true }, { k: 0, set: [0, 2] }, { k: 0, set: [0, 1] }, { zero: true }] },
  pair: {
    locks: ['0', '?', 'Z', '0'],
    names: ['H₂(D²)', 'H₂(D², S¹)', 'H₁(S¹)', 'H₁(D²)'],
    maps: [{ zero: true }, { label: '∂' }, { zero: true }],
    answer: 'Z',
  },
  five: {
    locks: ['0', 'Z', 'Z', '?', '0'],
    maps: [{ zero: true }, { label: '×2' }, { label: 'q' }, { zero: true }],
    answer: 'Z2',
  },
}

/** Finite exactness at every inner lock of a row of finite groups. */
export function exactness(locks, ks) {
  const els = (g) => Array.from({ length: GROUPS[g].n }, (_, i) => i)
  const map = (i, a) => (ks[i] === null ? 0 : (a * ks[i]) % GROUPS[locks[i + 1]].n)
  return locks.map((g, j) => {
    if (j === 0 || j === locks.length - 1) return null
    const im = new Set(els(locks[j - 1]).map((a) => map(j - 1, a)))
    const ker = new Set(els(g).filter((b) => map(j, b) === 0))
    return { im, ker, exact: im.size === ker.size && [...im].every((x) => ker.has(x)) }
  })
}
/** The row's current maps as generator images (null = zero map). */
export const rowKs = (id, bag) => ROWS[id].maps.map((m, i) => (m.zero ? null : (bag.ks?.[id]?.[i] ?? m.k)))

const W = 2.1
export const ROW_Z = 0.9
export function lockX(row, j) {
  const n = row.locks.length
  return (j - (n - 1) / 2) * (n > 3 ? W : 3.2)
}
const Z_TILES = [-2, -1, 0, 1, 2, 3]
function tilePos(g, i, r) {
  const n = g === 'Z' ? Z_TILES.length : GROUPS[g]?.n || 1
  if (n === 1) return [0, 0]
  const th = -Math.PI / 2 + (2 * Math.PI * i) / n
  return [r * Math.cos(th), r * Math.sin(th)]
}

function Lock({ g, x, info, name, live, unknown, tileR }) {
  const n = g === 'Z' ? Z_TILES.length : GROUPS[g]?.n || 1
  const col = info ? (info.exact ? '#4cff7a' : '#ff5a5a') : '#c9a24a'
  return (
    <group position={[x, 0, ROW_Z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[tileR + 0.32, tileR + 0.44, 40]} />
        <meshBasicMaterial color={col} toneMapped={false} transparent opacity={live ? 0.9 : 0.5} />
      </mesh>
      {unknown ? (
        <Html position={[0, 0.5, 0]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ fontSize: '1rem' }}>?</div>
        </Html>
      ) : (
        Array.from({ length: n }, (_, i) => {
          const [tx, tz] = tilePos(g, i, tileR)
          const label = g === 'Z' ? Z_TILES[i] : i
          const inIm = info?.im.has(i)
          const inKer = info?.ker.has(i)
          return (
            <group key={i} position={[tx, 0, tz]}>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.22, 0.24, 0.2, 18]} />
                <meshStandardMaterial color={inKer ? NEG : '#3a4448'} emissive={inKer ? NEG : '#000000'} emissiveIntensity={inKer ? 0.6 : 0} />
              </mesh>
              {inIm && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
                  <ringGeometry args={[0.26, 0.36, 24]} />
                  <meshBasicMaterial color={POS} toneMapped={false} />
                </mesh>
              )}
              <Html position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
                <div style={{ color: '#ffe6a8', fontSize: '0.68rem', fontWeight: 800 }}>{label}</div>
              </Html>
            </group>
          )
        })
      )}
      <Html position={[0, 0.3, tileR + 0.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ opacity: live ? 1 : 0.6 }}>
          {name ? `${name} = ` : ''}
          {unknown ? '?' : g === 'Z' ? 'ℤ …' : GROUPS[g].name}
        </div>
      </Html>
    </group>
  )
}

/** A sluice: tile-to-tile arcs for a finite map, or a labelled channel. */
function Sluice({ row, i, k, live }) {
  const a = row.locks[i]
  const b = row.locks[i + 1]
  const x0 = lockX(row, i)
  const x1 = lockX(row, i + 1)
  const m = row.maps[i]
  const tileR = row.locks.length > 3 ? 0.55 : 0.85
  const arcs = useMemo(() => {
    if (m.zero || m.label || !GROUPS[a]?.n || !GROUPS[b]?.n || a === 'Z' || b === 'Z') return []
    return Array.from({ length: GROUPS[a].n }, (_, t) => {
      const [ax, az] = tilePos(a, t, tileR)
      const [bx, bz] = tilePos(b, (t * (k ?? 0)) % GROUPS[b].n, tileR)
      const p = [x0 + ax, ROW_Z + az]
      const q = [x1 + bx, ROW_Z + bz]
      return Array.from({ length: 17 }, (_, s) => {
        const u = s / 16
        return [p[0] + (q[0] - p[0]) * u, 0.25 + Math.sin(u * Math.PI) * 0.9, p[1] + (q[1] - p[1]) * u]
      })
    })
  }, [a, b, k, m, tileR, x0, x1])
  const mid = (x0 + x1) / 2
  const text = m.zero ? '' : m.label || `1 ↦ ${k}`
  return (
    <group>
      <mesh position={[mid, 0.04, ROW_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(x1 - x0) - 2 * (tileR + 0.44), 0.5]} />
        <meshBasicMaterial color={m.fixed || m.zero || m.label ? '#2a4a5a' : '#5a8aa0'} transparent opacity={0.7} />
      </mesh>
      {arcs.map((pts, t) => (
        <Line key={t} points={pts} color="#9fe6ff" lineWidth={2} transparent opacity={live ? 0.9 : 0.4} />
      ))}
      {text && (
        <Html position={[mid, 0.5, ROW_Z - 1.5]} center zIndexRange={[10, 0]}>
          <div className="floor-tag" style={{ color: m.fixed || m.label ? '#c8d4cc' : '#9fe6ff', borderColor: '#5a8aa0' }}>{text}</div>
        </Html>
      )}
    </group>
  )
}

/** The disk and its rim circle drawn behind the Pair row. */
function DiskPicture() {
  return (
    <group position={[-1.4, 0, -2.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.05, 40]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.0, 1.12, 48]} />
        <meshBasicMaterial color="#7fd6ff" toneMapped={false} />
      </mesh>
      <Html position={[-1.6, 0.3, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">D² and its rim S¹</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag, live }) {
  const row = ROWS[site.id]
  if (!row) return null
  const locks = row.locks.map((g) => (g === '?' ? bag.pick?.[site.id] || '?' : g))
  const ks = rowKs(site.id, bag)
  const finite = !locks.includes('Z') && !locks.includes('?')
  const solved = row.answer && bag.pick?.[site.id] === row.answer
  const ok = { im: new Set(), ker: new Set(), exact: true }
  const info = finite ? exactness(locks, ks) : locks.map((_, j) => (solved && j > 0 && j < locks.length - 1 ? ok : null))
  const tileR = row.locks.length > 3 ? 0.55 : 0.85
  return (
    <group>
      {site.id === 'pair' && <DiskPicture />}
      {locks.map((g, j) => (
        <Lock key={j} g={g === '?' ? '0' : g} unknown={g === '?'} x={lockX(row, j)} info={info[j]} name={row.names?.[j]} live={live} tileR={tileR} />
      ))}
      {row.maps.map((_, i) => (
        <Sluice key={i} row={{ ...row, locks }} i={i} k={ks[i]} live={live} />
      ))}
    </group>
  )
}

export default function ChaseChannelsScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0e16', water: '#102a48', deep: '#060a14', cloud: '#a0b8e0', spark: '#9fc8ff', seed: 24 }} deckColor="#2a2e36" station={Station} />
}
