import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Fibration Station (4-10), Hatcher §4.2–4.3 pp. 375–376, 405–410:
 *   lift  — the homotopy lifting property for the covering ℝ → S¹ (a fibration with discrete fibre):
 *           a loop downstairs lifts uniquely once its start is chosen; pick the start sheet that ends where asked
 *   fibre — f: {p, q} → [0, 1] onto the ends is no fibration (the fibre over the middle is empty).
 *           E_f = {(a, γ) : γ(0) = f(a)} fixes it: every fibre is nonempty, and E_f ≃ A
 *   loops — the path fibration ΩB → PB → B with PB contractible: πₙ(ΩB) ≅ πₙ₊₁(B). Fill in πₙ(ΩS²)
 */

// ── lift ────────────────────────────────────────────────────────────────────
export const HELIX = { c: [0, -0.6], R: 1.5, y0: 0.35, pitch: 0.75, sheets: 4 }
export const ROUNDS = [
  { w: 2, end: 3 },
  { w: -1, end: 1 },
]
export const padPos = (k) => [-2.7 + k * 1.8, 3.0]
const helixPt = (th) => [HELIX.c[0] + HELIX.R * Math.cos(th), HELIX.y0 + (th / (2 * Math.PI)) * HELIX.pitch, HELIX.c[1] + HELIX.R * Math.sin(th)]
const helixPts = (a, b, n = 160) => Array.from({ length: n + 1 }, (_, i) => helixPt(a + ((b - a) * i) / n))

function LiftRoom({ bag }) {
  const round = Math.min(bag.round || 0, ROUNDS.length - 1)
  const { w, end } = ROUNDS[round]
  const tau = 2 * Math.PI
  const start = bag.start
  const lifted = start != null ? start + w : null
  return (
    <group>
      <Line points={helixPts(-0.3, tau * (HELIX.sheets - 1) + 0.3)} color="#6a7f9a" lineWidth={2} />
      {start != null && lifted >= 0 && lifted < HELIX.sheets && <Line points={helixPts(tau * start, tau * lifted)} color={lifted === end ? '#4cff7a' : '#ff8a5a'} lineWidth={5} />}
      {Array.from({ length: HELIX.sheets }, (_, k) => {
        const p = helixPt(tau * k)
        const col = k === end ? '#ffd27a' : k === start ? '#7fd6ff' : '#c8d0e0'
        return (
          <group key={k}>
            <mesh position={p}>
              <sphereGeometry args={[0.13, 16, 12]} />
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
            <Html position={[p[0] + 0.45, p[1], p[2]]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.6rem' }}>{k === end ? `${k} ★` : k}</div>
            </Html>
          </group>
        )
      })}
      {/* the base circle S¹ on the floor, with the base point */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[HELIX.c[0], 0.03, HELIX.c[1]]}>
        <ringGeometry args={[HELIX.R - 0.06, HELIX.R + 0.06, 64]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      <mesh position={[HELIX.c[0] + HELIX.R, 0.08, HELIX.c[1]]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {Array.from({ length: HELIX.sheets }, (_, k) => {
        const [x, z] = padPos(k)
        return (
          <group key={k} position={[x, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <circleGeometry args={[0.55, 28]} />
              <meshStandardMaterial color={k === start ? '#2f5a7a' : '#3a3440'} emissive={k === start ? '#7fd6ff' : '#000'} emissiveIntensity={0.3} />
            </mesh>
            <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.62rem' }}>start {k}</div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.2]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">ℝ → S¹ · base loop winds {w > 0 ? w : `−${-w}`} · lift must end on sheet {end} ★</div>
      </Html>
    </group>
  )
}

// ── fibre ───────────────────────────────────────────────────────────────────
export const BAR = { x0: -2.5, x1: 2.5, z: -0.8 }
export const APTS = { p: [BAR.x0, 2.0], q: [BAR.x1, 2.0] } // floor pads for the points of A
const PROBES = [BAR.x0, 0, BAR.x1]
const fx = { p: BAR.x0, q: BAR.x1 }

function FibreRoom({ bag }) {
  const teth = bag.teth || {}
  return (
    <group>
      {/* B = [0, 1] */}
      <Line points={[[BAR.x0, 0.12, BAR.z], [BAR.x1, 0.12, BAR.z]]} color="#ffb347" lineWidth={6} />
      {/* A = {p, q}, hovering over the ends */}
      {Object.entries(APTS).map(([id, [x, z]]) => (
        <group key={id}>
          <mesh position={[fx[id], 1.6, BAR.z]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshBasicMaterial color={teth[id] ? '#4cff7a' : '#ff8ad8'} toneMapped={false} />
          </mesh>
          <Line points={[[fx[id], 1.45, BAR.z], [fx[id], 0.15, BAR.z]]} color="#ff8ad8" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
          <group position={[x, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <circleGeometry args={[0.6, 28]} />
              <meshStandardMaterial color={teth[id] ? '#2f6a44' : '#3a3440'} />
            </mesh>
            <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.62rem' }}>{teth[id] ? `${id}: tethered` : `tether ${id}`}</div>
            </Html>
          </group>
        </group>
      ))}
      {/* tethers: (a, γ) with γ a path in B from f(a) — drawn to each probe */}
      {Object.keys(teth).map((id, i) =>
        PROBES.map((b) => {
          const y = 0.5 + i * 0.25
          return <Line key={id + b} points={[[fx[id], 0.15, BAR.z], [(fx[id] + b) / 2, y + Math.abs(fx[id] - b) * 0.12, BAR.z], [b, 0.15, BAR.z]]} color={i ? '#7fd6ff' : '#4cff7a'} lineWidth={2} />
        })
      )}
      {PROBES.map((b) => {
        const n = Object.keys(teth).length ? Object.keys(teth).length : b === BAR.x0 || b === BAR.x1 ? 1 : 0
        return (
          <group key={b} position={[b, 0, BAR.z]}>
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.1, 10, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <Html position={[0, 0.2, -0.9]} center zIndexRange={[10, 0]}>
              <div className="floor-tag" style={{ fontSize: '0.6rem', color: n ? undefined : '#ff7a7a' }}>{n ? `fibre: ${n} pt${n > 1 ? 's' : ''}` : 'fibre: ∅'}</div>
            </Html>
          </group>
        )
      })}
      <Html position={[0, 0.3, 4.0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">{Object.keys(teth).length === 2 ? 'E_f → B: every fibre ≃ A' : 'f: A = {p, q} → B — no lifts across the middle'}</div>
      </Html>
    </group>
  )
}

// ── loops ───────────────────────────────────────────────────────────────────
export const SPHERE = ['ℤ', 'ℤ', 'ℤ₂'] // π₂, π₃, π₄ of S²
export const LOOP_CANDS = ['0', 'ℤ', 'ℤ₂']
export const colX = (j) => (j - 1) * 2.6
export const LOOP_Z = 1.3
const SUB = '₀₁₂₃₄₅'

function Tile({ x, z, label, value, state }) {
  const col = state === 'ok' ? '#4cff7a' : state === 'ask' ? '#ff8ad8' : '#c9a24a'
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.7, 0.86, 36]} />
        <meshBasicMaterial color={col} toneMapped={false} />
      </mesh>
      <Html position={[0, 0.35, 0]} center zIndexRange={[10, 0]}>
        <div className="floor-tag" style={{ fontSize: '0.85rem' }}>{value}</div>
      </Html>
      <Html position={[0, 0.3, 1.2]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.64rem' }}>{label}</div>
      </Html>
    </group>
  )
}

function LoopsRoom({ bag }) {
  const picks = bag.picks || {}
  return (
    <group>
      {SPHERE.map((g, j) => (
        <group key={j}>
          <Tile x={colX(j)} z={-2.0} label={`π${SUB[j + 2]}(S²)`} value={g} />
          <Tile x={colX(j)} z={LOOP_Z} label={`π${SUB[j + 1]}(ΩS²)`} value={picks[j] || '?'} state={picks[j] === g ? 'ok' : 'ask'} />
          <Line points={[[colX(j), 0.1, LOOP_Z - 0.95], [colX(j), 0.1, -2.0 + 0.95]]} color="#9fe6ff" lineWidth={2} dashed dashSize={0.15} gapSize={0.1} />
        </group>
      ))}
      <Html position={[0, 0.3, 3.9]} center zIndexRange={[10, 0]}>
        <div className="deck-tag">ΩS² → PS² → S², PS² ≃ point ⇒ πₙ(ΩS²) ≅ πₙ₊₁(S²)</div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  if (site.id === 'lift') return <LiftRoom bag={bag} />
  if (site.id === 'fibre') return <FibreRoom bag={bag} />
  if (site.id === 'loops') return <LoopsRoom bag={bag} />
  return null
}

export default function FibrationScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0e12', water: '#1e2e3a', deep: '#060a0e', cloud: '#c8dcec', spark: '#9fe6ff', seed: 50 }} deckColor="#2a3038" station={Station} />
}
