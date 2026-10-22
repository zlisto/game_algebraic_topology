import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { Bouquet } from '../../levels/w3/CupCounterexampleScene'
import { Fountain } from '../../levels/w3/PolynomialGardenScene'
import { Lantern } from '../../levels/w3/FrontFaceScene'
import { TRIALS } from './stages'

/**
 * The Counterfeit Station's demonstrations, one per panel. Each loops on a CYCLE-second clock and
 * shows the mathematics as it really behaves, with the Commutator's claim on a tag beneath it:
 *   trial 0  cochains on a triangle (δf, δ(δf), loop sums) and the UCT torsion shift on ℝP²
 *   trial 1  cup products cast on the torus and the wedge; the powers of α on projective spaces
 *   trial 2  an orientation carried round a band; Betti towers under duality; the cup pairing
 */

const CYCLE = 7
const RED = '#ff4a6a'
const GOLD = '#ffd27a'
const CYAN = '#7fd6ff'
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const fmt = (n) => (n < 0 ? `−${-n}` : `${n}`)
const SUB = ['₀', '₁', '₂', '₃', '₄']
const SUP = ['⁰', '¹', '²', '³', '⁴']

/** The demo's clock: seconds into the current cycle, frozen once the verdict is in. */
function useCycle(frozen) {
  const t = useRef(0)
  useFrame((_, dt) => {
    if (!frozen) t.current += Math.min(dt, 0.1)
  })
  return t
}
/** A value that changes a few times a cycle, as React state (for Html content and components). */
function useStepped(fn) {
  const [v, setV] = useState(() => fn())
  const last = useRef(v)
  useFrame(() => {
    const n = fn()
    if (n !== last.current) {
      last.current = n
      setV(n)
    }
  })
  return v
}

function Tag({ pos, children, color, size = '0.8rem', cls = 'floor-tag' }) {
  return (
    <Html position={pos} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
      <div className={cls} style={{ fontSize: size, whiteSpace: 'nowrap', ...(color ? { color, borderColor: color } : {}) }}>
        {children}
      </div>
    </Html>
  )
}

/** The Commutator's claim, on a brass plate at the front of the panel. */
export function Claim({ text }) {
  return (
    <Html position={[0, 0.1, 1.98]} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
      <div className="deck-tag" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', borderColor: '#c9a24a', color: '#ffe6b0' }}>
        “{text}”
      </div>
    </Html>
  )
}

// ---------------------------------------------------------------- trial 1: cochains

const TV = [
  [-1.15, 0.55],
  [1.15, 0.55],
  [0, -1.05],
]
const EDGES = [
  [0, 1],
  [1, 2],
  [0, 2],
]
const Y = 0.12
const CX = (TV[0][0] + TV[1][0] + TV[2][0]) / 3
const CZ = (TV[0][1] + TV[1][1] + TV[2][1]) / 3

function CochainDemo({ ex, frozen }) {
  const clock = useCycle(frozen)
  const u = () => (clock.current % CYCLE) / CYCLE
  const pulses = useRef()
  const faceMat = useRef()
  const faceGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TV.flatMap(([x, z]) => [x, 0.05, z])), 3))
    return g
  }, [])
  const loop = ex.kind === 'loop'
  // the loop's running sum: φ[v₀v₁] + φ[v₁v₂] − φ[v₀v₂], edge by edge
  const sumNow = () => {
    const k = u()
    const leg = Math.floor(seg(k, 0.1, 0.82) * 3 - 1e-6)
    if (k < 0.1) return null
    const terms = [ex.edges[0], ex.edges[1], -ex.edges[2]]
    return terms.slice(0, leg + 1).reduce((a, b) => a + b, 0)
  }
  const sum = useStepped(() => (loop ? sumNow() : null))
  const faceOn = useStepped(() => ex.kind === 'dd' && u() > 0.5)
  useFrame(() => {
    const k = u()
    if (pulses.current) {
      pulses.current.children.forEach((m, i) => {
        if (loop) {
          // one runner round the loop v₀ → v₁ → v₂ → v₀
          if (i > 0) return (m.visible = false)
          const s = seg(k, 0.1, 0.82) * 3
          const leg = Math.min(2, Math.floor(s))
          const f = s - leg
          const [a, b] = [[0, 1], [1, 2], [2, 0]][leg]
          m.position.set(TV[a][0] + (TV[b][0] - TV[a][0]) * f, Y + 0.1, TV[a][1] + (TV[b][1] - TV[a][1]) * f)
          m.visible = k > 0.1 && k < 0.84
          return
        }
        // a pulse along each edge, tail to head: δf reads f(head) − f(tail)
        const [a, b] = EDGES[i]
        const f = smooth(seg(k, 0.08 + i * 0.1, 0.3 + i * 0.1))
        m.position.set(TV[a][0] + (TV[b][0] - TV[a][0]) * f, Y + 0.1, TV[a][1] + (TV[b][1] - TV[a][1]) * f)
        m.visible = f > 0 && f < 1
      })
    }
    if (faceMat.current) faceMat.current.opacity = ex.kind === 'dd' ? 0.15 + 0.35 * smooth(seg(k, 0.45, 0.6)) : 0.18
  })
  return (
    <group>
      {!loop && (
        <mesh geometry={faceGeo}>
          <meshBasicMaterial ref={faceMat} color={ex.kind === 'dd' ? '#c58bff' : '#5a4a7a'} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {EDGES.map(([a, b], i) => {
        const p = TV[a]
        const q = TV[b]
        // an arrowhead two-thirds along, pointing tail → head
        const mx = p[0] + (q[0] - p[0]) * 0.62
        const mz = p[1] + (q[1] - p[1]) * 0.62
        const ang = Math.atan2(q[0] - p[0], q[1] - p[1])
        // the label sits just outside the triangle, off the edge's midpoint
        const ox = (p[0] + q[0]) / 2 - CX
        const oz = (p[1] + q[1]) / 2 - CZ
        const L = Math.hypot(ox, oz)
        return (
          <group key={i}>
            <Line points={[[p[0], Y, p[1]], [q[0], Y, q[1]]]} color={loop ? GOLD : '#c8c0d8'} lineWidth={loop ? 4 : 3} />
            <mesh position={[mx, Y, mz]} rotation={[Math.PI / 2, 0, -ang]}>
              <coneGeometry args={[0.09, 0.24, 8]} />
              <meshBasicMaterial color={loop ? GOLD : '#e8e0f0'} />
            </mesh>
            <Tag pos={[(p[0] + q[0]) / 2 + (ox / L) * 0.36, 0.3, (p[1] + q[1]) / 2 + (oz / L) * 0.36]} color={loop ? GOLD : CYAN}>
              {fmt(ex.edges[i])}
            </Tag>
          </group>
        )
      })}
      {TV.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, Y, 0]}>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color="#f2ece0" emissive={GOLD} emissiveIntensity={0.4} />
          </mesh>
          <Tag pos={[i === 2 ? 0 : i === 0 ? -0.35 : 0.35, 0.45, i === 2 ? -0.32 : 0.3]} cls="deck-tag" size="0.8rem">
            v{SUB[i]}
            {ex.f ? ` · f=${fmt(ex.f[i])}` : ''}
          </Tag>
        </group>
      ))}
      <group ref={pulses}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[0.11, 12, 8]} />
            <meshBasicMaterial color={loop ? '#fff2c4' : CYAN} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {ex.kind === 'dd' && faceOn && <Tag pos={[0, 0.3, 0.05]} color="#e0b8ff">δδf = {fmt(ex.face)}</Tag>}
      {loop && sum !== null && <Tag pos={[0, 0.3, 0.05]} color="#fff2c4">Σ = {fmt(sum)}</Tag>}
      {loop && <Tag pos={[0, 0.3, 1.3]} cls="deck-tag" size="0.8rem">φ on a hollow triangle</Tag>}
    </group>
  )
}

/** The UCT on ℝP²: homology on the left, the claimed cohomology on the right; the torsion block moves across. */
function UctDemo({ ex, frozen }) {
  const clock = useCycle(frozen)
  const cube = useRef()
  const floorY = (k) => 0.25 + k * 0.62
  useFrame(() => {
    const k = (clock.current % CYCLE) / CYCLE
    const m = smooth(seg(k, 0.2, 0.7))
    const x = -0.75 + 1.5 * m
    const y = floorY(1) + (floorY(ex.shiftTo) - floorY(1)) * smooth(seg(k, 0.35, 0.7)) + Math.sin(Math.PI * m) * 0.25
    cube.current.position.set(x, y, 0.15)
    cube.current.rotation.y = k * 8
  })
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.9, 0, 0]}>
          <mesh position={[0, 0.95, -0.15]}>
            <boxGeometry args={[0.9, 1.9, 0.12]} />
            <meshStandardMaterial color="#1c1828" roughness={0.4} metalness={0.4} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <group key={k}>
              <mesh position={[0, floorY(k) - 0.18, 0]}>
                <boxGeometry args={[0.95, 0.05, 0.5]} />
                <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} />
              </mesh>
              <Tag pos={[side * 0.95, floorY(k), 0.1]} color={side < 0 ? '#e8e0f0' : CYAN}>
                {side < 0 ? `H${SUB[k]} ${ex.homology[k]}` : `H${SUP[k]} ${ex.cohomology[k]}`}
              </Tag>
            </group>
          ))}
        </group>
      ))}
      <mesh ref={cube}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <Tag pos={[-0.9, 2.15, 0]} cls="deck-tag" size="0.8rem">homology</Tag>
      <Tag pos={[0.9, 2.15, 0]} cls="deck-tag" size="0.8rem">cohomology</Tag>
    </group>
  )
}

// ---------------------------------------------------------------- trial 2: products

function TorusCast({ ex, frozen }) {
  const clock = useCycle(frozen)
  const R = 0.95
  const r = 0.38
  const surf = useRef()
  const a = useRef()
  const b = useRef()
  const tag = useStepped(() => ((clock.current % CYCLE) / CYCLE > 0.55 ? 1 : 0))
  const meridian = useMemo(() => Array.from({ length: 41 }, (_, i) => {
    const v = (i / 40) * Math.PI * 2
    return [R + r * 1.04 * Math.cos(v), 0.7 + r * 1.04 * Math.sin(v), 0]
  }), [])
  const longitude = useMemo(() => Array.from({ length: 61 }, (_, i) => {
    const w = (i / 60) * Math.PI * 2
    return [R * Math.cos(w), 0.7 + r * 1.03, R * Math.sin(w)]
  }), [])
  useFrame(() => {
    const k = (clock.current % CYCLE) / CYCLE
    const on = (m, t0) => m.current && (m.current.material.opacity = 0.25 + 0.75 * smooth(seg(k, t0, t0 + 0.1)))
    on(a, 0.1)
    on(b, 0.28)
    const glow = ex.lights ? smooth(seg(k, 0.45, 0.6)) : 0
    surf.current.emissiveIntensity = 0.1 + glow * 1.2
    surf.current.emissive.set(glow > 0 ? GOLD : '#2a2440')
  })
  return (
    <group>
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, r, 20, 48]} />
        <meshStandardMaterial ref={surf} color="#4a4060" roughness={0.45} transparent opacity={0.85} />
      </mesh>
      <Line ref={a} points={meridian} color="#ffb347" lineWidth={5} transparent opacity={0.3} />
      {ex.loops.includes('b') && <Line ref={b} points={longitude} color={CYAN} lineWidth={5} transparent opacity={0.3} />}
      <Tag pos={[R + 0.75, 0.9, 0]} color="#ffb347">α</Tag>
      {ex.loops.includes('b') && <Tag pos={[0, 1.3, -R - 0.2]} color={CYAN}>β</Tag>}
      {tag ? (
        <Tag pos={[0, 1.55, 0.2]} color={ex.lights ? GOLD : '#9a9aa8'}>
          {ex.lights ? 'α ⌣ β = [T]' : 'α ⌣ α = 0'}
        </Tag>
      ) : null}
    </group>
  )
}

function WedgeCast({ frozen }) {
  const clock = useCycle(frozen)
  const k = useStepped(() => {
    const u = (clock.current % CYCLE) / CYCLE
    return u > 0.55 ? 3 : u > 0.3 ? 2 : u > 0.1 ? 1 : 0
  })
  return (
    <group position={[0, 0, 0.2]}>
      <Bouquet s={0.55} beamA={k >= 1} beamB={k >= 2} sphereVal={0} />
      {k >= 3 && <Tag pos={[0, 1.7, -0.4]} color="#9a9aa8">α ⌣ β = 0</Tag>}
    </group>
  )
}

function FountCast({ ex, frozen }) {
  const clock = useCycle(frozen)
  const pow = useStepped(() => {
    const u = (clock.current % CYCLE) / CYCLE
    if (ex.fake) return 1
    return Math.min(ex.f.n, 1 + Math.floor(seg(u, 0.12, 0.7) * ex.f.n))
  })
  const fizz = useStepped(() => !!ex.fake && (clock.current % CYCLE) / CYCLE > 0.5)
  return <Fountain f={{ ...ex.f, at: [0, -0.3], s: 0.55 }} pow={pow} fizzle={fizz} />
}

// ---------------------------------------------------------------- trial 3: manifolds

const BAND_R = 1.05
const BAND_W = 0.38
const BAND_Y = 0.55
function bandPoint(u, v, twist) {
  const h = twist ? u / 2 : 0
  const w = BAND_R + v * Math.cos(h)
  return [w * Math.cos(u), BAND_Y + v * Math.sin(h), w * Math.sin(u)]
}
function bandFrame(u, twist) {
  const c = bandPoint(u, 0, twist)
  const T = [-Math.sin(u), 0, Math.cos(u)]
  const h = twist ? u / 2 : 0
  const W = [Math.cos(h) * Math.cos(u), Math.sin(h), Math.cos(h) * Math.sin(u)]
  return { c, T, W }
}
/** A little circular arrow in the band's tangent plane at core angle u: the local orientation. */
function arrowPts(u, twist, lift = 0.02) {
  const { c, T, W } = bandFrame(u, twist)
  // lift the arrow off the band along its normal (the side facing up), so the band never hides it
  let Nm = [T[1] * W[2] - T[2] * W[1], T[2] * W[0] - T[0] * W[2], T[0] * W[1] - T[1] * W[0]]
  if (Nm[1] < 0) Nm = Nm.map((v) => -v)
  const off = Nm.map((v) => v * (0.04 + lift))
  const rr = 0.3
  const N = 22
  const pts = []
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 1.55
    const x = c[0] + off[0] + rr * (Math.cos(th) * T[0] + Math.sin(th) * W[0])
    const y = c[1] + off[1] + rr * (Math.cos(th) * T[1] + Math.sin(th) * W[1])
    const z = c[2] + off[2] + rr * (Math.cos(th) * T[2] + Math.sin(th) * W[2])
    pts.push([x, z, y])
  }
  // the arrowhead: two short barbs at the end of the arc
  const th = Math.PI * 1.55
  const tip = pts[pts.length - 1]
  const dir = [-Math.sin(th), Math.cos(th)] // the arc's direction, in (T, W) coordinates
  const back = (s, side) => {
    const bt = -dir[0] * s + -dir[1] * side
    const bw = -dir[1] * s + dir[0] * side
    return [tip[0] + bt * T[0] + bw * W[0], tip[1] + bt * T[2] + bw * W[2], tip[2] + bt * T[1] + bw * W[1]]
  }
  pts.push(back(0.15, 0.09), tip, back(0.15, -0.09))
  return pts
}

function BandDemo({ ex, frozen }) {
  const clock = useCycle(frozen)
  const geo = useMemo(() => {
    const NU = 96
    const NV = 6
    const pos = []
    const idx = []
    for (let i = 0; i <= NU; i++)
      for (let j = 0; j <= NV; j++) pos.push(...bandPoint((i / NU) * Math.PI * 2, -BAND_W + (2 * BAND_W * j) / NV, ex.twist))
    for (let i = 0; i < NU; i++)
      for (let j = 0; j < NV; j++) {
        const a = i * (NV + 1) + j
        const b = a + NV + 1
        idx.push(a, b, a + 1, b, b + 1, a + 1)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [ex.twist])
  const U0 = Math.PI / 2 // start at the front of the band
  const uNow = () => {
    const k = (clock.current % CYCLE) / CYCLE
    return U0 + smooth(seg(k, 0.1, 0.78)) * Math.PI * 2
  }
  const home = useStepped(() => (clock.current % CYCLE) / CYCLE > 0.8)
  const core = useMemo(() => Array.from({ length: 73 }, (_, i) => bandPoint((i / 72) * Math.PI * 2, 0, ex.twist)), [ex.twist])
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={ex.twist ? '#b48ae0' : '#8aa4e0'} emissive={ex.twist ? '#5a2a8a' : '#2a4a8a'} emissiveIntensity={0.45} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Line points={core} color="#8a8aa0" lineWidth={1.5} dashed dashSize={0.08} gapSize={0.06} />
      {/* the start: a ghost of the orientation it set out with */}
      <LiveLine getPts={() => arrowPts(U0, ex.twist, 0.03)} color="#f2ece0" width={4} opacity={0.75} />
      <LiveLine getPts={() => arrowPts(uNow(), ex.twist, 0.05)} color={GOLD} width={6} />
      {home && (
        <Tag pos={[0, 1.35, BAND_R]} color={ex.twist ? RED : GOLD}>
          {ex.twist ? 'home: reversed' : 'home: same way round'}
        </Tag>
      )}
    </group>
  )
}

function rankLabel(r, coef) {
  if (!r) return '0'
  if (coef === 'ℤ₂') return r === 1 ? 'ℤ₂' : `ℤ₂${SUP[r]}`
  return r === 1 ? 'ℤ' : `ℤ${SUP[r]}`
}

function BettiDemo({ ex, frozen }) {
  const clock = useCycle(frozen)
  const n = ex.ranks.length - 1
  const xs = ex.ranks.map((_, k) => -1.35 + (2.7 * k) / Math.max(1, n))
  // the duality arcs, k ↔ n − k, pulse in turn
  const arc = (k) => () => {
    const u = (clock.current % CYCLE) / CYCLE
    const pairs = Math.ceil((n + 1) / 2)
    const i = Math.floor(u * pairs * 1.0)
    if (i !== k) return null
    const a = xs[k]
    const b = xs[n - k]
    if (a === b) return null
    const top = 0.5 + Math.max(ex.ranks[k], ex.ranks[n - k]) * 0.42 + 0.25
    return Array.from({ length: 25 }, (_, j) => {
      const s = j / 24
      return [a + (b - a) * s, 0.35, top + Math.sin(Math.PI * s) * 0.45]
    })
  }
  return (
    <group>
      {ex.ranks.map((r, k) => (
        <group key={k} position={[xs[k], 0, 0.35]}>
          <mesh position={[0, 0.06 + r * 0.21, 0]}>
            <boxGeometry args={[0.42, 0.08 + r * 0.42, 0.42]} />
            <meshStandardMaterial color={r ? (ex.coef === 'ℤ₂' ? '#7fd6ff' : GOLD) : '#3a3a44'} emissive={r ? (ex.coef === 'ℤ₂' ? '#2a7aa8' : '#a07020') : '#000'} emissiveIntensity={0.5} />
          </mesh>
          <Tag pos={[0, 0.3 + r * 0.42 + 0.2, 0]} color={r ? '#f2ece0' : '#8a8a94'} size="0.8rem">
            H{SUB[k]} {rankLabel(r, ex.coef)}
          </Tag>
        </group>
      ))}
      {ex.ranks.map((_, k) => (k < n - k ? <LiveLine key={k} getPts={arc(k)} color="#c58bff" width={4} /> : null))}
      <Tag pos={[0, 0.3, -0.75]} cls="deck-tag" size="0.8rem">
        Hₖ ↔ H{n === 3 ? '₃' : '₂'}₋ₖ · {ex.coef}
      </Tag>
    </group>
  )
}

function PairDemo({ ex, frozen }) {
  const clock = useCycle(frozen)
  const L = [-1.05, 0.55]
  const Rt = [1.05, 0.55]
  const TOP = [0, -0.85]
  const reveal = useStepped(() => (clock.current % CYCLE) / CYCLE > 0.6)
  const beam = () => {
    const u = (clock.current % CYCLE) / CYCLE
    if (u < 0.15 || u > 0.92) return null
    const k = seg(u, 0.15, 0.6)
    const pts = []
    const n = 30
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * k * 2
      const p = s < 1 ? [L[0] + (Rt[0] - L[0]) * s, L[1], 1.3 + Math.sin(Math.PI * s) * 0.4] : [Rt[0] + (TOP[0] - Rt[0]) * (s - 1), Rt[1] + (TOP[1] - Rt[1]) * (s - 1), 1.3]
      pts.push(p)
    }
    return pts
  }
  return (
    <group>
      {[
        [L, 'α'],
        [Rt, 'α'],
      ].map(([p, l], i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 1.0, 8]} />
            <meshStandardMaterial color="#2a2a30" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color={GOLD} emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <Tag pos={[0, 1.6, 0]} color={GOLD}>
            {i === 0 ? 'α ∈ H²' : 'partner?'}
          </Tag>
        </group>
      ))}
      <group scale={0.85}>
        <Lantern pos={[TOP[0] / 0.85, TOP[1] / 0.85]} value={reveal ? ex.value : null} label="⟨α ⌣ α, [M]⟩" size={0.3} />
      </group>
      <LiveLine getPts={beam} color="#ffe6b0" width={4} />
      <Tag pos={[0, 0.3, 0.5]} cls="deck-tag" size="0.8rem">
        {ex.space}
      </Tag>
    </group>
  )
}

// ---------------------------------------------------------------- the panel

export function Demo({ trial, exhibit, frozen }) {
  const ex = TRIALS[trial].ex[exhibit]
  if (!ex) return null
  if (trial === 0) return ex.kind === 'uct' ? <UctDemo ex={ex} frozen={frozen} /> : <CochainDemo ex={ex} frozen={frozen} />
  if (trial === 1) return ex.kind === 'torus' ? <TorusCast ex={ex} frozen={frozen} /> : ex.kind === 'wedge' ? <WedgeCast frozen={frozen} /> : <FountCast ex={ex} frozen={frozen} />
  if (ex.kind === 'band') return <BandDemo ex={ex} frozen={frozen} />
  if (ex.kind === 'betti') return <BettiDemo ex={ex} frozen={frozen} />
  return <PairDemo ex={ex} frozen={frozen} />
}

export function Panel({ at, trial, exhibit, state }) {
  const frozen = state === 'exposed' || state === 'spared'
  const ex = TRIALS[trial].ex[exhibit]
  return (
    <group position={[at[0], 0, at[1]]}>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 48]} />
        <meshStandardMaterial color="#231b36" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[1.95, 2.08, 64]} />
        <meshBasicMaterial color={state === 'exposed' ? RED : state === 'spared' ? GOLD : '#8a6ad8'} toneMapped={false} />
      </mesh>
      <Demo trial={trial} exhibit={exhibit} frozen={frozen} />
      {ex && <Claim text={ex.claim} />}
      {state === 'exposed' && (
        <Html position={[0, 0.2, 2.25]} center zIndexRange={[7, 0]} style={{ pointerEvents: 'none' }}>
          <div className="verdict-tag bad">FORGERY ✕</div>
        </Html>
      )}
    </group>
  )
}
