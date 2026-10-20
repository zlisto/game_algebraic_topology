import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useRef } from 'react'
import Hologram from '../w0/Hologram'
import YardFrame from './YardFrame'

/**
 * Excision Cut (2-5). On most decks lies a pair (X, A): X a disk, A the collar round its rim.
 *   cut_deep — Blade cuts small holes Z out of the collar; allowed when Z's closure sits in A's interior
 *   collapse — the Sling crushes the rim to a point and the disk closes into a sphere: X/A
 *   ladder   — a grid of H̃ᵢ(Sⁿ) pads; each step climbs from Sⁿ⁻¹ to Sⁿ
 *   edge     — four marked regions Z; only some may be excised
 */

export const XR = 4.2 // X: the disk
export const AIN = 2.6 // A: the collar AIN ≤ r ≤ XR
export const CUT_R = 0.45
const circle = (cx, cz, r, n = 48, y = 0.12) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), y, cz + r * Math.sin((i / n) * 2 * Math.PI)])

/** May a round cut of radius CUT_R at (x, z) be excised? → null if fine, else why not. */
export function cutProblem(x, z) {
  const r = Math.hypot(x, z)
  if (r + CUT_R > XR + 0.01) return 'outside'
  if (r - CUT_R < AIN + 0.08) return r < AIN ? 'notA' : 'edge'
  return null
}

/** The marked regions on the Too Close to the Edge deck. */
export const ZONES = [
  { id: 'a', kind: 'disk', c: [3.4 * Math.cos(2.4), 3.4 * Math.sin(2.4)], r: 0.45, ok: true },
  { id: 'b', kind: 'ring', r0: 3.2, r1: 3.8, ok: true },
  { id: 'c', kind: 'disk', c: [AIN * Math.cos(-0.6), AIN * Math.sin(-0.6)], r: 0.55, ok: false, why: 'Z reaches past A’s inner edge into the rest of X.' },
  { id: 'd', kind: 'ring', r0: AIN, r1: XR, ok: false, why: 'That’s all of A — its closure isn’t inside A’s interior: it touches A’s inner edge.' },
]
export function zoneAt(x, z) {
  const r = Math.hypot(x, z)
  for (const zn of ZONES.filter((q) => q.kind === 'disk')) if (Math.hypot(x - zn.c[0], z - zn.c[1]) < zn.r + 0.15) return zn
  if (r > 3.2 && r < 3.8) return ZONES[1]
  if ((r > AIN && r < 3.15) || (r > 3.85 && r < XR)) return ZONES[3]
  return null
}

function Pair({ dim }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[AIN, 48]} />
        <meshBasicMaterial color="#3a4a40" transparent opacity={dim ? 0.5 : 0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[AIN, XR, 64]} />
        <meshBasicMaterial color="#7fd6ff" transparent opacity={dim ? 0.2 : 0.35} />
      </mesh>
      <Line points={circle(0, 0, AIN)} color="#7fd6ff" lineWidth={2} />
      <Line points={circle(0, 0, XR)} color="#ffd27a" lineWidth={3} />
      <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">X</div>
      </Html>
      <Html position={[0, 0.3, (AIN + XR) / 2]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ color: '#7fd6ff' }}>A</div>
      </Html>
    </group>
  )
}

function Hole({ c, r }) {
  return (
    <group position={[c[0], 0, c[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial color="#05080a" />
      </mesh>
      <Line points={circle(0, 0, r, 32, 0.1)} color="#ffb347" lineWidth={2} />
    </group>
  )
}

function Collapse({ on }) {
  const kRef = useRef(0)
  useFrame((_, dt) => {
    kRef.current = on ? Math.min(1, kRef.current + dt / 2.6) : 0
  })
  return (
    <group position={[0, 0.08, 0]} scale={XR / 1.3}>
      <Hologram kind="sphere" kRef={kRef} />
    </group>
  )
}

export const LADDER_N = 4
export const padPos = (n, i) => [(i - (LADDER_N - 1) / 2) * 1.6 + 0.4, ((LADDER_N - 1) / 2 - n) * 1.4 + 0.4]
function Ladder({ lit }) {
  const cells = []
  for (let n = 0; n < LADDER_N; n++)
    for (let i = 0; i < LADDER_N; i++) {
      const [x, z] = padPos(n, i)
      const on = lit[`${n}-${i}`]
      cells.push(
        <group key={`${n}-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 0.16, 6]} />
            <meshStandardMaterial color={on ? '#ffd27a' : '#2e3a40'} emissive={on ? '#ffb347' : '#000000'} emissiveIntensity={on ? 0.9 : 0} toneMapped={!on} />
          </mesh>
          <Html position={[0, 0.4, 0]} center zIndexRange={[10, 0]}>
            <div style={{ color: on ? '#1a1206' : '#8a9aa0', fontWeight: 800, fontSize: '0.72rem' }}>{on ? 'ℤ' : '0'}</div>
          </Html>
        </group>,
      )
    }
  return (
    <group>
      {cells}
      {Array.from({ length: LADDER_N }, (_, n) => (
        <Html key={`r${n}`} position={[padPos(n, 0)[0] - 1.25, 0.3, padPos(n, 0)[1]]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">S{['⁰', '¹', '²', '³'][n]}</div>
        </Html>
      ))}
      {Array.from({ length: LADDER_N }, (_, i) => (
        <Html key={`c${i}`} position={[padPos(LADDER_N - 1, i)[0], 0.3, padPos(LADDER_N - 1, i)[1] - 1.0]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">H̃{['₀', '₁', '₂', '₃'][i]}</div>
        </Html>
      ))}
    </group>
  )
}

function Zones({ cut }) {
  return (
    <group>
      {ZONES.map((zn) =>
        zn.kind === 'disk' ? (
          <group key={zn.id}>
            {cut[zn.id] ? <Hole c={zn.c} r={zn.r} /> : <Line points={circle(zn.c[0], zn.c[1], zn.r, 32, 0.14)} color="#ff8ad8" lineWidth={2} dashed dashSize={0.18} gapSize={0.12} />}
            <Html position={[zn.c[0], 0.4, zn.c[1]]} center zIndexRange={[10, 0]}>
              <div className="floor-tag">{zn.id}</div>
            </Html>
          </group>
        ) : (
          <group key={zn.id}>
            {cut[zn.id] ? (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[zn.r0, zn.r1, 64]} />
                <meshBasicMaterial color="#05080a" />
              </mesh>
            ) : (
              <>
                <Line points={circle(0, 0, zn.r0 + 0.03, 64, 0.14)} color="#ff8ad8" lineWidth={2} dashed dashSize={0.25} gapSize={0.15} />
                <Line points={circle(0, 0, zn.r1 - 0.03, 64, 0.14)} color="#ff8ad8" lineWidth={2} dashed dashSize={0.25} gapSize={0.15} />
              </>
            )}
            <Html position={[0, 0.4, zn.id === 'b' ? -3.5 : -(XR - 0.25)]} center zIndexRange={[10, 0]}>
              <div className="floor-tag">{zn.id}</div>
            </Html>
          </group>
        ),
      )}
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'cut_deep')
    return (
      <group>
        <Pair />
        {(bag.cuts?.cut_deep || []).map((c, i) => (
          <Hole key={i} c={c} r={CUT_R} />
        ))}
      </group>
    )
  if (id === 'collapse') return <Collapse on={!!bag.collapsed} />
  if (id === 'ladder') return <Ladder lit={bag.lit || { '0-0': true }} />
  if (id === 'edge')
    return (
      <group>
        <Pair dim />
        <Zones cut={bag.zones || {}} />
      </group>
    )
  return null
}

export default function ExcisionCutScene(props) {
  return <YardFrame {...props} sky={{ bg: '#100c14', water: '#2a1a3a', deep: '#0a0610', cloud: '#c8a8e0', spark: '#ffb0e8', seed: 25 }} deckColor="#2c2a32" station={Station} />
}
