import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Html } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { makeTrack } from '../../levels/w0/cells'
import { BastionSky, BeaconTower, TRACK_COLS } from '../../levels/w1/BeaconScene'

/**
 * "Loops at a Point" lesson (videos.json level-1-2-lesson): the fundamental group, slowly.
 *   A 0–11   a loop at x₀: a path f with f(0) = f(1) = x₀ (a bead runs the gold petal)
 *   B 11–21  the product f · g: run f, then g, each at double speed
 *   C 21–31  identity and inverse: out along α and straight back; f · f̄ shrinks onto the pad
 *            (go out only to time 1 − k, come back — Hatcher's homotopy f · f̄ ≃ c)
 *   D 31–43  associativity: (α β) γ and α (β γ) — two beads on the same trail, timed differently
 *   E 43–55  change of basepoint: a path h from x₀ to x₁; [f] ↦ [h f h̄]
 *   F 55–66  how to play: Gyroid runs a petal with the Lash, pad to pad
 *   G 66–72  summary
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k

const X0 = [-2.4, 0.9]
const X1 = [4.3, -0.4]
const ALPHA = makeTrack({ angle: -2.25, length: 2.9 }, X0)
const BETA = makeTrack({ angle: -0.95, length: 2.9 }, X0)
const GAMMA = makeTrack({ angle: 2.75, length: 2.6 }, X0)
const DELTA = makeTrack({ angle: -1.35, length: 2.4 }, X1)
const PETALS = [ALPHA, BETA, GAMMA]
/** h: a gentle path from x₀ to x₁ */
const H = Array.from({ length: 41 }, (_, i) => {
  const u = i / 40
  return [mix(X0[0], X1[0], u), mix(X0[1], X1[1], u) + Math.sin(Math.PI * u) * 1.1]
})
const hAt = (u) => H[Math.round(Math.min(1, Math.max(0, u)) * 40)]
const lift = (pts, y = 0.2) => pts.map(([x, z]) => [x, z, y])
const part = (track, u0, u1) => {
  const n = track.pts.length - 1
  return track.pts.slice(Math.round(u0 * n), Math.max(Math.round(u0 * n) + 2, Math.round(u1 * n) + 1))
}

/** A word's timing: which letter is running at loop time u, and how far round it. */
function runWord(word, u) {
  let at = 0
  for (const [track, w] of word) {
    if (u <= at + w || w === word[word.length - 1][1]) return { track, s: Math.min(1, (u - at) / w) }
    at += w
  }
  return { track: word[word.length - 1][0], s: 1 }
}
const AB_C = [
  [ALPHA, 0.25],
  [BETA, 0.25],
  [GAMMA, 0.5],
]
const A_BC = [
  [ALPHA, 0.5],
  [BETA, 0.25],
  [GAMMA, 0.25],
]

const SHOTS = [
  [0, 43, [[-1.0, 10.6, 5.2], [-1.0, 0, 0.2]], [[-1.0, 10.8, 5.3], [-1.0, 0, 0.2]]],
  [43, 55, [[3.0, 14.4, 6.6], [3.2, 0, 0.5]], [[3.0, 14.6, 6.7], [3.2, 0, 0.5]]],
  [55, 66, [[-1.6, 8.6, 5.0], [-1.6, 0, 0.4]], [[-1.6, 8.4, 4.9], [-1.6, 0, 0.4]]],
  [66, 80, [[-1.0, 10.8, 5.3], [-1.0, 0, 0.2]], [[-1.0, 11.2, 5.5], [-1.0, 0, 0.2]]],
]
function LessonCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(mix(from[0][0], to[0][0], k), mix(from[0][1], to[0][1], k), mix(from[0][2], to[0][2], k))
    look.set(mix(from[1][0], to[1][0], k), mix(from[1][1], to[1][1], k), mix(from[1][2], to[1][2], k))
    camera.lookAt(look)
  })
  return null
}

function Tag({ p, text, color, show }) {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) ref.current.style.opacity = show() ? 1 : 0
  })
  return (
    <Html position={[p[0], 0.7, p[1]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={ref} className="edge-tag loop-tag" style={{ background: color, opacity: 0 }}>
        {text}
      </div>
    </Html>
  )
}

export default function LoopLesson({ tRef }) {
  const bead = useRef()
  const bead2 = useRef()
  const pulse = useRef(0)
  const x1 = useRef()
  const lastLap = useRef(0)
  useFrame(() => {
    const t = tRef.current
    x1.current.visible = t >= 43 && t < 55
    let p = null
    let q = null
    if (t >= 1.5 && t < 11) p = ALPHA.at(seg((t - 1.5) % 4.5, 0, 4))
    else if (t >= 12 && t < 21) {
      const u = seg((t - 12) % 4.5, 0, 4)
      p = u < 0.5 ? ALPHA.at(u * 2) : BETA.at(u * 2 - 1)
    } else if (t >= 21.5 && t < 25.5) p = ALPHA.at(t < 23.5 ? seg(t, 21.5, 23.5) : 1 - seg(t, 23.5, 25.5))
    else if (t >= 26 && t < 31) {
      // f · f̄ ≃ c: go out only to time 1 − k, then come back
      const k = smooth(seg(t, 26.3, 30.3))
      const u = seg((t - 26) % 2, 0, 1.8)
      const reach = (1 - k) * 0.999
      p = ALPHA.at(u < 0.5 ? u * 2 * reach : (1 - (u - 0.5) * 2) * reach)
    } else if (t >= 32 && t < 43) {
      const u = seg((t - 32) % 5.2, 0, 4.8)
      const a = runWord(AB_C, u)
      const b = runWord(A_BC, u)
      p = a.track.at(a.s)
      q = b.track.at(b.s)
    } else if (t >= 44 && t < 55) {
      const u = seg((t - 44) % 5.5, 0, 5)
      p = u < 0.3 ? hAt(u / 0.3) : u < 0.7 ? DELTA.at((u - 0.3) / 0.4) : hAt(1 - (u - 0.7) / 0.3)
    }
    bead.current.visible = !!p
    if (p) bead.current.position.set(p[0], 0.42, p[1])
    bead2.current.visible = !!q
    if (q) bead2.current.position.set(q[0], 0.5, q[1])
    // the pad pulses each time a loop closes
    const lap = t >= 1.5 && t < 21 ? Math.floor((t - (t < 11 ? 1.5 : 12)) / 4.5) + (t < 11 ? 0 : 10) : -1
    if (lap !== lastLap.current) {
      lastLap.current = lap
      if (lap > 0 && lap !== 10) pulse.current = 1
    }
    if (t >= 62.4 && t < 62.5) pulse.current = 1
  })
  const t = () => tRef.current
  // the petals on show in each beat
  const petal = (i) => () => {
    const tt = t()
    if (i === 0) return tt < 26 || (tt >= 31 && tt < 43) || tt >= 55 ? lift(ALPHA.pts) : null
    if (i === 1) return (tt >= 11 && tt < 21) || (tt >= 31 && tt < 43) || tt >= 66 ? lift(BETA.pts) : null
    return (tt >= 31 && tt < 43) || tt >= 66 ? lift(GAMMA.pts) : null
  }
  // A, B: the run so far lights up white
  const runA = () => {
    const tt = t()
    if (tt >= 1.5 && tt < 11) return lift(part(ALPHA, 0, seg((tt - 1.5) % 4.5, 0, 4)), 0.26)
    if (tt >= 21.5 && tt < 25.5) return lift(part(ALPHA, 0, tt < 23.5 ? seg(tt, 21.5, 23.5) : 1 - seg(tt, 23.5, 25.5)), 0.26)
    if (tt >= 57.5 && tt < 62.5) return lift(part(ALPHA, 0, smooth(seg(tt, 57.5, 62.3))), 0.26)
    return null
  }
  const runB = () => {
    const tt = t()
    if (!(tt >= 12 && tt < 21)) return null
    const u = seg((tt - 12) % 4.5, 0, 4)
    return u < 0.5 ? lift(part(ALPHA, 0, u * 2), 0.26) : null
  }
  const runB2 = () => {
    const tt = t()
    if (!(tt >= 12 && tt < 21)) return null
    const u = seg((tt - 12) % 4.5, 0, 4)
    return u >= 0.5 ? lift(part(BETA, 0, u * 2 - 1), 0.26) : null
  }
  // C: the shrinking loop f · f̄ — only out to 1 − k
  const shrink = () => {
    const tt = t()
    if (!(tt >= 26 && tt < 31)) return null
    const k = smooth(seg(tt, 26.3, 30.3))
    return k < 0.98 ? lift(part(ALPHA, 0, 1 - k), 0.26) : null
  }
  // E: h, δ and the carried loop h δ h̄
  const hLine = () => (t() >= 43 && t() < 55 ? lift(H, 0.18) : null)
  const delta = () => (t() >= 43 && t() < 55 ? lift(DELTA.pts) : null)
  const carried = () => (t() >= 47.5 && t() < 55 ? lift([...H, ...DELTA.pts, ...[...H].reverse()], 0.3) : null)
  const gyro = () => {
    const tt = t()
    if (tt < 55 || tt >= 66) return { pos: [-40, -40, -40], rotY: 0, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const walk = smooth(seg(tt, 55.2, 57.2))
    if (tt < 57.5) {
      const p = [mix(X0[0] + 1.6, X0[0], walk), mix(X0[1] + 1.5, X0[1], walk)]
      return { pos: [p[0], 0, p[1]], rotY: Math.atan2(X0[0] - p[0], X0[1] - p[1]) || 0, run: walk > 0 && walk < 1 ? 0.8 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    if (tt < 62.5) {
      const u = smooth(seg(tt, 57.5, 62.3))
      const p = ALPHA.at(u)
      const a = ALPHA.at(Math.min(1, u + 0.03))
      return { pos: [p[0], 0, p[1]], rotY: Math.atan2(a[0] - p[0], a[1] - p[1]), run: u > 0.01 && u < 0.99 ? 0.95 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    return { pos: [X0[0] + 0.2, 0, X0[1] + 0.3], rotY: 0.3, run: 0, cast: 0, whip: tt > 62.6 && tt < 63.6 ? seg(tt, 62.6, 63.6) : 0, loop: 0, loopDrop: 0 }
  }
  return (
    <>
      <BastionSky />
      <mesh position={[0.8, -0.3, 0]}>
        <cylinderGeometry args={[7.6, 7.2, 0.6, 64]} />
        <meshStandardMaterial color="#3a3640" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, 0.02, 0]}>
        <ringGeometry args={[7.45, 7.6, 72]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      <group position={[X0[0], 0, X0[1]]}>
        <BeaconTower pulseRef={pulse} label="x₀" />
      </group>
      <group ref={x1} position={[X1[0], 0, X1[1]]}>
        <BeaconTower scale={0.85} label="x₁" />
      </group>
      {PETALS.map((_, i) => (
        <LiveLine key={i} getPts={petal(i)} color={TRACK_COLS[i]} width={5} />
      ))}
      <LiveLine getPts={runA} color="#fff2c4" width={8} />
      <LiveLine getPts={runB} color="#fff2c4" width={8} />
      <LiveLine getPts={runB2} color="#fff2c4" width={8} />
      <LiveLine getPts={shrink} color="#fff2c4" width={8} />
      <LiveLine getPts={hLine} color="#e8dcc0" width={5} dashed />
      <LiveLine getPts={delta} color={TRACK_COLS[3]} width={5} />
      <LiveLine getPts={carried} color="#ffffff" width={12} opacity={0.18} />
      <Tag p={ALPHA.at(0.5)} text="α" color={TRACK_COLS[0]} show={() => t() < 26 || (t() >= 31 && t() < 43) || t() >= 55} />
      <Tag p={BETA.at(0.5)} text="β" color={TRACK_COLS[1]} show={() => (t() >= 11 && t() < 21) || (t() >= 31 && t() < 43) || t() >= 66} />
      <Tag p={GAMMA.at(0.5)} text="γ" color={TRACK_COLS[2]} show={() => (t() >= 31 && t() < 43) || t() >= 66} />
      <Tag p={DELTA.at(0.5)} text="δ" color={TRACK_COLS[3]} show={() => t() >= 43 && t() < 55} />
      <Tag p={hAt(0.5)} text="h" color="#e8dcc0" show={() => t() >= 43 && t() < 55} />
      <mesh ref={bead}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh ref={bead2}>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshBasicMaterial color="#3ecfbf" toneMapped={false} />
      </mesh>
      <Gyroid scale={S} script={gyro} />
      <LessonCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.12} darkness={0.55} />
      </EffectComposer>
    </>
  )
}

// ---------------------------------------------------------------- the 2D card

const GOLD = '#ffd27a'
const INK = '#e8eefc'
const SOFT = '#9fb0d0'
const PINK = '#ff8ad8'
const MATH = { fontFamily: "'Cambria Math', 'STIX Two Math', serif" }

/** rows: [left, right, isMath] */
function Card({ title, rows, foot, children }) {
  return (
    <svg viewBox="0 0 260 180" className="lesson-svg">
      <text x="130" y="30" textAnchor="middle" fill={GOLD} fontSize="16" fontWeight="700">
        {title}
      </text>
      {rows.map(([a, b, math], i) => (
        <g key={i}>
          <text x="18" y={64 + i * 27} fill={math ? PINK : INK} fontSize="13.5" style={math ? MATH : undefined} fontWeight={math ? 700 : 400}>
            {a}
          </text>
          <text x="242" y={64 + i * 27} fill={SOFT} fontSize="11.5" textAnchor="end">
            {b}
          </text>
        </g>
      ))}
      {children}
      {foot && (
        <text x="130" y="170" textAnchor="middle" fill={SOFT} fontSize="11">
          {foot}
        </text>
      )}
    </svg>
  )
}

/** The two timings of three loops, as bars, with a cursor at loop time u. */
function TimingBars({ u }) {
  const bar = (y, word, label) => {
    let x = 18
    return (
      <g>
        <text x="18" y={y - 5} fill={PINK} fontSize="12" fontWeight="700" style={MATH}>
          {label}
        </text>
        {word.map(([, w], i) => {
          const r = (
            <g key={i}>
              <rect x={x} y={y} width={224 * w - 2} height="15" rx="3" fill={TRACK_COLS[i]} />
              <text x={x + (224 * w) / 2} y={y + 11.5} textAnchor="middle" fill="#1a1206" fontSize="11" fontWeight="800">
                {['α', 'β', 'γ'][i]}
              </text>
            </g>
          )
          x += 224 * w
          return r
        })}
      </g>
    )
  }
  return (
    <g>
      {bar(70, AB_C, '(α β) γ')}
      {bar(112, A_BC, 'α (β γ)')}
      <line x1={18 + 224 * u} x2={18 + 224 * u} y1="56" y2="132" stroke="#ffffff" strokeWidth="2" />
      <text x="130" y="150" textAnchor="middle" fill={INK} fontSize="11.5">
        same trail, re-timed: (α β) γ ≃ α (β γ)
      </text>
    </g>
  )
}

function Steps({ t }) {
  if (t >= 66)
    return (
      <div className="lesson-steps">
        <h4>The fundamental group</h4>
        <p className="lesson-math">π₁(X, x₀)</p>
        <p className="lesson-note">loops at x₀, up to homotopy</p>
        <p className="lesson-math">[f][g] = [f · g], [f]⁻¹ = [f̄]</p>
        <p className="lesson-note">identity: stand still · brackets don’t matter</p>
        <p className="lesson-math">[f] ↦ [h f h̄]</p>
        <p className="lesson-note">a path h makes π₁(X, x₁) ≅ π₁(X, x₀)</p>
      </div>
    )
  const steps = [
    ['1', 'Loop Lash out', t < 57.5],
    ['→', 'leave the amber pad along a petal’s arrows', t >= 57.5 && t < 60],
    ['↺', 'all the way round, step back on the pad', t >= 60 && t < 62.5],
    ['⁻¹', 'against the arrows: the inverse loop', t >= 62.5 && t < 64.5],
    ['E', 'lost? walk up to Emmy', t >= 64.5],
  ]
  return (
    <div className="lesson-steps">
      <h4>⚡ Loop Lash</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

export function LoopLessonOverlay({ t }) {
  if (t >= 69.5) return null
  let body = null
  if (t < 11) body = <Card title="a loop at x₀" rows={[['f : [0, 1] → X', 'a path', true], ['f(0) = f(1) = x₀', 'closed at x₀', true], ['slide it, x₀ pinned', 'same class']]} foot="their classes form π₁(X, x₀)" />
  else if (t < 21) body = <Card title="the product" rows={[['f · g', 'f, then g', true], ['each at double speed', 'one unit of time'], ['[f][g] = [f · g]', 'on classes', true]]} foot="the group law of π₁(X, x₀)" />
  else if (t < 31) body = <Card title="identity and inverse" rows={[['c(s) = x₀', 'identity', true], ['f̄(s) = f(1 − s)', 'backwards', true], ['f · f̄ ≃ c', 'shrinks away', true]]} foot="every loop has an undo" />
  else if (t < 43) {
    const u = t >= 32 ? seg((t - 32) % 5.2, 0, 4.8) : 0
    body = (
      <Card title="brackets don’t matter" rows={[]} foot="associativity: π₁(X, x₀) is a group">
        <TimingBars u={u} />
      </Card>
    )
  } else if (t < 55) body = <Card title="change of basepoint" rows={[['h : x₀ → x₁', 'a path', true], ['[f] ↦ [h f h̄]', 'h, f, back', true], ['π₁(X, x₁) ≅ π₁(X, x₀)', '', true]]} foot="Hatcher, §1.1, Prop. 1.5, p. 28" />
  else body = <Steps t={t} />
  return <div className="lesson-card">{body}</div>
}
