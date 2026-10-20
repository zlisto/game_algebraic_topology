import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useRef } from 'react'
import Hologram from '../w0/Hologram'
import ChainDeck, { d2 as boundary2 } from './ChainDeck'
import { COMPLEXES } from './CancelMarshScene'
import { CELLS, Folded, RimDigon, RimSquare, d2 as cellD2 } from './CellBlockScene'
import { Lever } from './DynamoGateScene'
import YardFrame from './YardFrame'

/**
 * Mod Mill (2-9): homology with ℤ₂ coefficients — every coefficient is 0 or 1, and 1 + 1 = 0, so
 * signs and orientations stop mattering.
 *   even   — the fan of four triangles from Cancel Marsh: with ℤ₂, all four at 1 leave just the rim
 *   rp2    — ℝP²'s 2-cell: d₂ = 2a ≡ 0 mod 2
 *   frogs  — the Klein bottle's 2-cell: d₂ = 2b ≡ 0 mod 2
 *   sort   — four closed surfaces on pedestals, to sort orientable / non-orientable
 */

export const mod2 = (c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, ((v % 2) + 2) % 2]))
export const FAN = COMPLEXES.shared
export const fanBoundary2 = (tri) => mod2(boundary2(tri))

export const CELL_OF = { rp2: 'doubled', frogs: 'census' }
export const cellD2mod2 = (id) => mod2(cellD2(CELL_OF[id]))
export const LETTER_LEVERS = { a: [-3.6, -1.2], b: [-3.6, 1.6] }
export const PRESS = [3.8, 1.4]

export const SURFACES = [
  { id: 'sphere', name: 'S²', pos: [-3.0, -1.4], orientable: true, kind: 'sphere' },
  { id: 'torus', name: 'T', pos: [-1.0, -2.6], orientable: true, kind: 'torus' },
  { id: 'rp2', name: 'ℝP²', pos: [1.0, -2.6], orientable: false, kind: 'rp2' },
  { id: 'klein', name: 'K', pos: [3.0, -1.4], orientable: false, kind: 'klein' },
]
export const BINS = { yes: [-3.2, 2.6], no: [3.2, 2.6] }

function Pedestal({ s, bin }) {
  const kRef = useRef(1)
  const g = useRef()
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.4
  })
  const at = bin ? BINS[bin] : s.pos
  const col = bin === 'yes' ? '#ffb347' : bin === 'no' ? '#7fd6ff' : '#4a4450'
  return (
    <group position={[at[0] + (bin ? (SURFACES.indexOf(s) % 2 ? 0.7 : -0.7) : 0), 0, at[1] + (bin ? (SURFACES.indexOf(s) < 2 ? -0.5 : 0.5) : 0)]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
        <meshStandardMaterial color={col} />
      </mesh>
      <group ref={g} position={[0, 1.0, 0]} scale={0.32}>
        <Hologram kind={s.kind} kRef={kRef} word={s.kind === 'rp2' ? [{ e: 0 }, { e: 0 }] : []} />
      </group>
      <Html position={[0, 1.9, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag">{s.name}</div>
      </Html>
    </group>
  )
}

function Bin({ pos, label, color }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.3, 1.45, 40]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html position={[0, 0.3, 1.75]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ color }}>{label}</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'even') {
    const tri = bag.tri?.even || {}
    return <ChainDeck complex={FAN} live triCoef={tri} edgeCoef={fanBoundary2(tri)} />
  }
  if (CELL_OF[id]) {
    const c = CELLS[CELL_OF[id]]
    const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[id] || {}) }
    const solved = bag.solved?.[id]
    return (
      <group>
        {id === 'rp2' ? <RimDigon /> : <RimSquare id="census" />}
        {c.letters.map((l) => (
          <Lever key={l} pos={LETTER_LEVERS[l]} on label={`${l}: ${coef[l]} (mod 2)`} />
        ))}
        <Lever pos={PRESS} on={!!solved} label="attach e²" />
        <Folded kind={c.kind} on={!!solved} />
      </group>
    )
  }
  if (id === 'sort') {
    const bins = bag.bins || {}
    return (
      <group>
        <Bin pos={BINS.yes} label="orientable" color="#ffb347" />
        <Bin pos={BINS.no} label="non-orientable" color="#7fd6ff" />
        {SURFACES.map((s) => (
          <Pedestal key={s.id} s={s} bin={bins[s.id]} />
        ))}
      </group>
    )
  }
  return null
}

export default function ModMillScene(props) {
  return <YardFrame {...props} sky={{ bg: '#120e0a', water: '#3a2a18', deep: '#0c0804', cloud: '#e0c8a0', spark: '#ffd27a', seed: 29 }} deckColor="#322c26" station={Station} />
}
