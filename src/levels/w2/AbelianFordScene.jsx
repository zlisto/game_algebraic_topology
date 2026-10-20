import { Html } from '@react-three/drei'
import { LETTER_COLORS } from '../w0/Hologram'
import YardFrame from './YardFrame'

/**
 * Abelian Ford (2-10): a loop in the figure-eight is a word in a, b and their inverses. Its tiles sit
 * in a row across the ford. In π₁ you may only cancel a letter against its inverse next to it; in
 * H₁ you may also swap neighbours, because H₁ is π₁ with the order forgotten.
 *   Clasp (5) between two tiles swaps them; Blade (7) on a tile cancels it with an inverse neighbour.
 */

export const WORDS = {
  totals: 'a b A a b',
  dissolve: 'a b A B',
  survive: 'b a a B',
  hold: 'a b a B A A',
}
export const parse = (w) => w.split(' ').map((c) => ({ l: c.toLowerCase(), e: c === c.toLowerCase() ? 1 : -1 }))
export const totals = (tiles) => tiles.reduce((t, { l, e }) => ({ ...t, [l]: (t[l] || 0) + e }), { a: 0, b: 0 })
export const show = (t) => `${t.l}${t.e < 0 ? '⁻¹' : ''}`
/** Normal form aᵐbⁿ: no inverse neighbours, every a before every b, each letter one sign. */
export function isNormal(tiles) {
  for (let i = 1; i < tiles.length; i++) {
    const [p, q] = [tiles[i - 1], tiles[i]]
    if (p.l === q.l && p.e !== q.e) return false
    if (p.l === 'b' && q.l === 'a') return false
  }
  return true
}
export const SPACING = 1.3
export const tileX = (n, i) => (i - (n - 1) / 2) * SPACING
export const ROW_Z = 0.4

function Tile({ t, x }) {
  const col = LETTER_COLORS[t.l === 'a' ? 0 : 1]
  return (
    <group position={[x, 0, ROW_Z]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.0, 0.5, 1.0]} />
        <meshStandardMaterial color={t.e > 0 ? col : '#2a2e36'} emissive={col} emissiveIntensity={t.e > 0 ? 0.35 : 0.15} />
      </mesh>
      {t.e < 0 && (
        <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.42, 24]} />
          <meshBasicMaterial color={col} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, 0.9, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.95rem', color: col, borderColor: col }}>{show(t)}</div>
      </Html>
    </group>
  )
}

function Ford() {
  return (
    <group>
      {/* the shallow channel the tiles cross */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, ROW_Z]}>
        <planeGeometry args={[9.4, 1.8]} />
        <meshBasicMaterial color="#1e4a5e" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function Station(site, { bag }) {
  if (!WORDS[site.id]) return null
  const tiles = bag.tiles?.[site.id] || parse(WORDS[site.id])
  const t = totals(tiles)
  return (
    <group>
      <Ford />
      {tiles.map((tile, i) => (
        <Tile key={i} t={tile} x={tileX(tiles.length, i)} />
      ))}
      {!tiles.length && (
        <Html position={[0, 0.4, ROW_Z]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">empty word — the loop dissolved</div>
        </Html>
      )}
      <Html position={[0, 0.3, ROW_Z - 1.8]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          totals: a {t.a} · b {t.b}
        </div>
      </Html>
    </group>
  )
}

export default function AbelianFordScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a1014', water: '#123a4a', deep: '#060c10', cloud: '#a8d0e0', spark: '#9fe6ff', seed: 30 }} deckColor="#2a3236" station={Station} />
}
