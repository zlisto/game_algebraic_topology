import { Html } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Torsion Terrace (3-2): the universal coefficient theorem,
 *   Hⁿ(X; G) ≅ Hom(Hₙ(X), G) ⊕ Ext(Hₙ₋₁(X), G).
 * Each deck has two terraces: homology on the left (floors H₀, H₁, H₂), cohomology on the right.
 * Every plant on the left is a summand ℤ or ℤ₂; the player transplants it to the right — a free ℤ
 * stays on its floor (Hom), a torsion ℤ₂ climbs one floor (Ext). In ℤ₂ soil both rules change.
 */

export const TERRACES = {
  free_floors: { space: 'the torus T', soil: 'Z', hom: [['t0', 0, 'Z'], ['t1a', 1, 'Z'], ['t1b', 1, 'Z'], ['t2', 2, 'Z']] },
  climbing_vine: { space: 'ℝP²', soil: 'Z', hom: [['r0', 0, 'Z'], ['r1', 1, 'Z2']] },
  change_soil: { space: 'ℝP²', soil: 'Z2', hom: [['r0', 0, 'Z'], ['r1', 1, 'Z2']] },
  plan_terrace: { space: 'the Klein bottle K', soil: 'Z', hom: [['k0', 0, 'Z'], ['k1', 1, 'Z'], ['k1t', 1, 'Z2']] },
}
export const FLOORS = 3
const G_NAME = { Z: 'ℤ', Z2: 'ℤ₂' }
export const gName = (g) => G_NAME[g]

/** Where each homology summand must go in cohomology: [{floor, g, kind: 'Hom' | 'Ext'}]. */
export function required(id, plant) {
  const { soil } = TERRACES[id]
  const [, n, g] = plant
  if (soil === 'Z') return g === 'Z' ? [{ floor: n, g: 'Z', kind: 'Hom' }] : n + 1 < FLOORS ? [{ floor: n + 1, g: 'Z2', kind: 'Ext' }] : []
  return g === 'Z' ? [{ floor: n, g: 'Z2', kind: 'Hom' }] : [{ floor: n, g: 'Z2', kind: 'Hom' }, ...(n + 1 < FLOORS ? [{ floor: n + 1, g: 'Z2', kind: 'Ext' }] : [])]
}
export const allRequired = (id) => TERRACES[id].hom.flatMap((p) => required(id, p).map((r) => ({ ...r, plant: p[0] })))

export const floorPos = (side, n) => [side * 2.7, 2.4 - n * 2.1]
export const plantPos = (id, plant) => {
  const same = TERRACES[id].hom.filter((p) => p[1] === plant[1])
  const i = same.indexOf(plant)
  const [x, z] = floorPos(-1, plant[1])
  return [x + (i - (same.length - 1) / 2) * 1.0, z]
}

function Floor({ side, n, label, hl }) {
  const [x, z] = floorPos(side, n)
  return (
    <group position={[x, n * 0.18, z]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.6, 0.12 + n * 0.36, 1.6]} />
        <meshStandardMaterial color={hl ? '#4a5a3a' : '#3a4034'} roughness={0.8} />
      </mesh>
      <Html position={[side * 1.8, 0.4, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.65rem' }}>{label}</div>
      </Html>
    </group>
  )
}

function Plant({ pos, g, y = 0, dim, sel }) {
  const col = g === 'Z' ? '#7ad06a' : '#ff8ad8'
  return (
    <group position={[pos[0], y, pos[1]]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
        <meshStandardMaterial color="#4a7a3a" transparent opacity={dim ? 0.35 : 1} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        {g === 'Z' ? <sphereGeometry args={[0.24, 14, 10]} /> : <torusGeometry args={[0.2, 0.08, 8, 18]} />}
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={sel ? 1.2 : 0.4} transparent opacity={dim ? 0.35 : 1} toneMapped={!sel} />
      </mesh>
      <Html position={[0, 1.35, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.7rem', color: col, borderColor: sel ? '#ffffff' : col, opacity: dim ? 0.5 : 1 }}>{G_NAME[g]}</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  const T = TERRACES[id]
  if (!T) return null
  const placed = bag.placed?.[id] || []
  const sel = bag.sel?.[id]
  return (
    <group>
      {Array.from({ length: FLOORS }, (_, n) => (
        <group key={n}>
          <Floor side={-1} n={n} label={`H${'₀₁₂'[n]}`} />
          <Floor side={1} n={n} label={`H${'⁰¹²'[n]}${T.soil === 'Z2' ? '(;ℤ₂)' : ''}`} hl={!!sel} />
        </group>
      ))}
      {T.hom.map((p) => {
        const done = required(id, p).every((r) => placed.some((q) => q.plant === p[0] && q.floor === r.floor && q.kind === r.kind))
        return <Plant key={p[0]} pos={plantPos(id, p)} g={p[2]} y={p[1] * 0.18 + 0.12 + p[1] * 0.18} dim={done} sel={sel === p[0]} />
      })}
      {Array.from({ length: FLOORS }, (_, n) => {
        const here = placed.filter((q) => q.floor === n)
        return here.map((q, i) => {
          const [x, z] = floorPos(1, n)
          return <Plant key={`${n}-${i}`} pos={[x + (i - (here.length - 1) / 2) * 1.0, z]} g={q.g} y={n * 0.18 + 0.12 + n * 0.18} />
        })
      })}
      <Html position={[0, 0.3, -4.4]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">
          {T.space} · coefficients {T.soil === 'Z' ? 'ℤ' : 'ℤ₂'}
        </div>
      </Html>
    </group>
  )
}

export default function TorsionShiftScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c120a', water: '#24381c', deep: '#080c06', cloud: '#c8e0a8', spark: '#e8ffb0', seed: 32 }} deckColor="#30362a" station={Station} />
}
