import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import CountNull from '../../characters/CountNull'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import OverworldKit from '../../levels/w0/OverworldKit'
import ReefGame from '../../levels/w0/ReefGame'
import { Throne } from '../../levels/w0/CastleScene'
import SphereCitadel, { Delta, TOP } from './DeltaSet'
import { LIFTS, LOOPS, NULL_AT, PANELS, WORDS } from './stagesCastle1'

/**
 * The Delta Sphere's court (World 1 · Castle): the flattened pole of Null's sphere, the delta far
 * below. Three demonstration panels play each trial's exhibits:
 *   LoopPairDemo — two loops from a post on a ring of rock; beads run them so you can count
 *   LiftDemo     — a loop on the floor and Null's claimed lift on the helix above it
 *   WordDemo     — a word run on a figure-eight (or a torus), with Null's claimed equation
 */

const GOLD = '#ffd27a'
const CYAN = '#6ae0ff'
const RED = '#ff4a6a'
const A_COL = '#ff9a4a'
const B_COL = '#7ab8ff'
const TAU = Math.PI * 2
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)

/** The demo's own clock; frozen once the panel is judged. */
function useClock(frozen) {
  const c = useRef(0)
  useFrame((_, dt) => {
    if (!frozen) c.current += dt
  })
  return c
}

const tagStyle = { pointerEvents: 'none', whiteSpace: 'nowrap', font: '600 13px system-ui, sans-serif', color: '#f4ecff', background: 'rgba(20,10,40,0.78)', border: '1px solid #8a5aff', borderRadius: 6, padding: '2px 8px' }

// ---------------------------------------------------------------- Trial 1

const loopXZ = (id, s) => {
  const [th, r] = LOOPS[id](s)
  return [r * Math.cos(th), -r * Math.sin(th)] // anticlockwise seen from above
}
const loopPts = (id, y) => Array.from({ length: 121 }, (_, i) => {
  const [x, z] = loopXZ(id, i / 120)
  return [x, y, z]
})
const LOOP_CYCLE = 5

function Bead({ color, beadRef, r = 0.11 }) {
  return (
    <mesh ref={beadRef}>
      <sphereGeometry args={[r, 14, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function LoopPairDemo({ pair, frozen }) {
  const clock = useClock(frozen)
  const [A, B] = pair
  const ptsA = useMemo(() => loopPts(A, 0.1), [A])
  const ptsB = useMemo(() => loopPts(B, 0.13), [B])
  const beadA = useRef()
  const beadB = useRef()
  const s = () => seg(clock.current % LOOP_CYCLE, 0.3, LOOP_CYCLE - 0.5)
  useFrame(() => {
    const k = s()
    const [ax, az] = loopXZ(A, k)
    const [bx, bz] = loopXZ(B, k)
    beadA.current.position.set(ax, 0.2, az)
    beadB.current.position.set(bx, 0.24, bz)
  })
  // comet trails: the last stretch each bead ran
  const trail = (id, y) => () => {
    const k = s()
    if (k <= 0) return null
    const a = Math.max(0, k - 0.22)
    return Array.from({ length: 24 }, (_, i) => {
      const [x, z] = loopXZ(id, a + ((k - a) * i) / 23)
      return [x, z, y]
    })
  }
  const trailA = useMemo(() => trail(A, 0.16), [A]) // eslint-disable-line react-hooks/exhaustive-deps
  const trailB = useMemo(() => trail(B, 0.19), [B]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.45, 1.75, 64]} />
        <meshStandardMaterial color="#5a5470" emissive="#2a2040" emissiveIntensity={0.5} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#05030a" />
      </mesh>
      {/* the gold post: both loops start and end here */}
      <mesh position={[1.1, 0.25, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.5, 8]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      {A !== 'still' && <Line points={ptsA} color={GOLD} lineWidth={2.5} transparent opacity={0.55} />}
      {B !== 'still' && <Line points={ptsB} color={CYAN} lineWidth={2.5} transparent opacity={0.55} />}
      <LiveLine getPts={trailA} color={GOLD} width={7} />
      <LiveLine getPts={trailB} color={CYAN} width={7} />
      <Bead color="#fff0b0" beadRef={beadA} />
      <Bead color="#c8f6ff" beadRef={beadB} />
      <Html position={[0, 0.3, 2.35]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div style={tagStyle}>
          <span style={{ color: GOLD }}>●</span> ≃ <span style={{ color: CYAN }}>●</span> ?
        </div>
      </Html>
    </>
  )
}

// ---------------------------------------------------------------- Trial 2

const HR = 1.2 // the helix's radius (= the floor circle's)
const H = 1.1 // height per floor
const levelY = (lv) => 0.35 + (lv + 1) * H // level −1 sits just above the floor
const LIFT_CYCLE = 6
const helixPts = Array.from({ length: 241 }, (_, i) => {
  const lv = -1.25 + (3.5 * i) / 240
  return [HR * Math.cos(lv * TAU), levelY(lv), -HR * Math.sin(lv * TAU)]
})
const floorPts = Array.from({ length: 81 }, (_, i) => [HR * Math.cos((i / 80) * TAU), 0.06, -HR * Math.sin((i / 80) * TAU)])

function LiftDemo({ kind, frozen }) {
  const clock = useClock(frozen)
  const L = LIFTS[kind]
  const up = useRef()
  const down = useRef()
  const plumb = useRef()
  const endTag = useRef()
  const s = () => seg(clock.current % LIFT_CYCLE, 0.4, LIFT_CYCLE - 1.4)
  const upPos = (k) => [HR * Math.cos(L.up(k)), levelY(L.level(k)), -HR * Math.sin(L.up(k))]
  useFrame(() => {
    const k = s()
    const [ux, uy, uz] = upPos(k)
    const a = L.loop(k)
    const [dx, dz] = [HR * Math.cos(a), -HR * Math.sin(a)]
    up.current.position.set(ux, uy, uz)
    down.current.position.set(dx, 0.1, dz)
    // a real lift is right above its loop, on the helix, and never jumps: show where it cheats
    const offOver = Math.hypot(ux - dx, uz - dz) > 0.2
    // on the helix: the height (in floors) and the angle agree up to a whole floor
    const dh = L.level(k) - L.up(k) / TAU
    const offHelix = Math.abs(dh - Math.round(dh)) > 0.08
    const jumping = L.jumpAt !== undefined && Math.abs(k - L.jumpAt) < 0.05
    const bad = offOver || offHelix || jumping
    up.current.material.color.set(bad ? RED : '#fff0b0')
    plumb.current.material.color.set(offOver ? RED : '#c8b0ff')
    plumb.current.position.set(ux, uy / 2, uz)
    plumb.current.scale.set(1, uy, 1)
    if (endTag.current) endTag.current.style.opacity = k >= 1 ? 1 : 0.35
  })
  const liftTrail = () => {
    const k = s()
    if (k <= 0) return null
    const out = []
    for (let i = 0; i <= 60; i++) {
      const kk = (k * i) / 60
      if (L.jumpAt !== undefined && i && kk >= L.jumpAt && (k * (i - 1)) / 60 < L.jumpAt) out.push(null) // a gap where it jumps
      const [x, y, z] = upPos(kk)
      out.push([x, z, y])
    }
    // LiveLine draws one strip: draw only the stretch after the jump once it has happened
    const cut = out.indexOf(null)
    return cut < 0 ? out : out.slice(cut + 1).length > 1 ? out.slice(cut + 1) : out.slice(0, cut)
  }
  const loopTrail = () => {
    const k = s()
    if (k <= 0) return null
    return Array.from({ length: 41 }, (_, i) => {
      const a = L.loop((k * i) / 40)
      return [HR * Math.cos(a), -HR * Math.sin(a), 0.09]
    })
  }
  const end = L.level(1)
  return (
    <>
      <Line points={floorPts} color="#8a7ab8" lineWidth={2} />
      <Line points={helixPts} color="#b88aff" lineWidth={2.5} transparent opacity={0.7} />
      {/* the post, and the fibre over it: the floors −1, 0, 1, 2 */}
      <mesh position={[HR, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh position={[HR, levelY(0.5), 0]}>
        <cylinderGeometry args={[0.012, 0.012, levelY(2) - levelY(-1) + 0.3, 4]} />
        <meshBasicMaterial color="#6a5a98" />
      </mesh>
      {[-1, 0, 1, 2].map((lv) => (
        <group key={lv} position={[HR, levelY(lv), 0]}>
          <mesh>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshBasicMaterial color={lv === 0 ? GOLD : '#d8c8ff'} toneMapped={false} />
          </mesh>
          <Html position={[0.28, 0, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ font: '700 12px system-ui, sans-serif', color: lv === 0 ? GOLD : '#e0d4ff', textShadow: '0 0 4px #000' }}>{lv < 0 ? `−${-lv}` : lv}</div>
          </Html>
        </group>
      ))}
      <LiveLine getPts={loopTrail} color={CYAN} width={6} />
      <LiveLine getPts={liftTrail} color={GOLD} width={6} />
      <mesh ref={plumb}>
        <cylinderGeometry args={[0.015, 0.015, 1, 4]} />
        <meshBasicMaterial color="#c8b0ff" transparent opacity={0.7} />
      </mesh>
      <Bead color="#fff0b0" beadRef={up} r={0.12} />
      <Bead color="#c8f6ff" beadRef={down} r={0.1} />
      <Html position={[0, 0.3, 2.35]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div ref={endTag} style={{ ...tagStyle, opacity: 0.35 }}>
          Null: “the lift ends on {end < 0 ? `−${-end}` : end}”
        </div>
      </Html>
    </>
  )
}

// ---------------------------------------------------------------- Trial 3

const PET = 0.72
const LETTER_T = 0.9
/** The bead's spot on the figure-eight, `k` (0..1) of the way round letter c. */
const eightAt = (c, k) => {
  const sign = c === c.toLowerCase() ? 1 : -1
  if (c.toLowerCase() === 'a') {
    const p = sign * k * TAU // a: the left petal, its centre at (−PET, 0); the post at angle 0
    return [-PET + PET * Math.cos(p), -PET * Math.sin(p)]
  }
  const p = Math.PI + sign * k * TAU // b: the right petal; the post at angle π
  return [PET + PET * Math.cos(p), -PET * Math.sin(p)]
}
const TR = 0.95
const Tr = 0.36
/** On the torus: a runs round the big circle (u), b round the tube (v); the post at u = 0, v = π/2. */
const torusAt = (u, v) => [(TR + Tr * Math.cos(v)) * Math.cos(u), 0.45 + Tr * Math.sin(v), -(TR + Tr * Math.cos(v)) * Math.sin(u)]

function WordDemo({ id, frozen }) {
  const clock = useClock(frozen)
  const W = WORDS[id]
  const word = W.lhs
  const bead = useRef()
  const letterEls = useRef([])
  const RUN = word.length * LETTER_T
  // on the torus the word a b a⁻¹ b⁻¹ bounds the square: shrink that square to its corner (a real null-homotopy)
  const SHRINK = W.space === 'torus' ? 2.8 : 0
  const cycle = RUN + 1.6 + (SHRINK ? SHRINK + 0.8 : 0)
  const lam = () => {
    const t = (clock.current % cycle) - 0.6
    if (!SHRINK || t < RUN) return null
    return 1 - smooth(seg(t, RUN + 0.3, RUN + 0.3 + SHRINK))
  }
  const squarePts = () => {
    const l = lam()
    if (l === null || l < 0.01) return null
    const v0 = Math.PI / 2
    const L = l * TAU
    const out = []
    const n = 24
    for (let i = 0; i <= n; i++) out.push([(L * i) / n, v0])
    for (let i = 1; i <= n; i++) out.push([L, v0 + (L * i) / n])
    for (let i = 1; i <= n; i++) out.push([L - (L * i) / n, v0 + L])
    for (let i = 1; i <= n; i++) out.push([0, v0 + L - (L * i) / n])
    return out.map(([u, v]) => {
      const [x, y, z] = torusAt(u, v)
      return [x, z, y + 0.015]
    })
  }
  const at = () => {
    const t = (clock.current % cycle) - 0.6
    const i = Math.max(0, Math.min(word.length - 1, Math.floor(t / LETTER_T)))
    const k = t < 0 ? 0 : t >= word.length * LETTER_T ? 1 : (t - i * LETTER_T) / LETTER_T
    return [i, t >= word.length * LETTER_T ? 1 : k]
  }
  // where the bead is on the torus after the first i letters, plus k of the next
  const torusPos = (i, k) => {
    let u = 0
    let v = Math.PI / 2
    for (let j = 0; j <= i; j++) {
      const c = word[j]
      const f = j < i ? 1 : k
      const sg = c === c.toLowerCase() ? 1 : -1
      if (c.toLowerCase() === 'a') u += sg * f * TAU
      else v += sg * f * TAU
    }
    return torusAt(u, v)
  }
  useFrame(() => {
    const [i, k] = at()
    if (W.space === 'torus') bead.current.position.set(...(lam() !== null ? torusAt(0, Math.PI / 2) : torusPos(i, k)))
    else {
      const [x, z] = eightAt(word[i], k)
      bead.current.position.set(x, 0.2, z)
    }
    letterEls.current.forEach((el, j) => {
      if (el) el.style.color = j === i && clock.current % cycle > 0.6 ? '#fff' : j < i ? '#9a8ab8' : '#c8b8e8'
    })
  })
  const eightA = useMemo(() => Array.from({ length: 61 }, (_, i) => {
    const [x, z] = eightAt('a', i / 60)
    return [x, 0.1, z]
  }), [])
  const eightB = useMemo(() => Array.from({ length: 61 }, (_, i) => {
    const [x, z] = eightAt('b', i / 60)
    return [x, 0.1, z]
  }), [])
  const torA = useMemo(() => Array.from({ length: 81 }, (_, i) => torusAt((i / 80) * TAU, Math.PI / 2).map((v, j) => (j === 1 ? v + 0.02 : v))), [])
  const torB = useMemo(() => Array.from({ length: 61 }, (_, i) => torusAt(0, Math.PI / 2 + (i / 60) * TAU)), [])
  const pretty = (c) => (c === 'A' ? 'a⁻¹' : c === 'B' ? 'b⁻¹' : c)
  const rhs = W.text.split('=')[1].trim()
  return (
    <>
      {W.space === 'eight' ? (
        <>
          <Line points={eightA} color={A_COL} lineWidth={4} />
          <Line points={eightB} color={B_COL} lineWidth={4} />
          <Html position={[-PET * 2 - 0.25, 0.2, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ font: '700 15px system-ui', color: A_COL, textShadow: '0 0 4px #000' }}>a</div>
          </Html>
          <Html position={[PET * 2 + 0.25, 0.2, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ font: '700 15px system-ui', color: B_COL, textShadow: '0 0 4px #000' }}>b</div>
          </Html>
        </>
      ) : (
        <>
          <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[TR, Tr - 0.02, 20, 48]} />
            <meshStandardMaterial color="#4a3a6a" roughness={0.5} emissive="#2a1850" emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
          <Line points={torA} color={A_COL} lineWidth={4} />
          <Line points={torB} color={B_COL} lineWidth={4} />
        </>
      )}
      <mesh position={W.space === 'torus' ? torusAt(0, Math.PI / 2) : [0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <Bead color="#ffffff" beadRef={bead} r={0.12} />
      {W.space === 'torus' && <LiveLine getPts={squarePts} color="#ffffff" width={5} />}
      <Html position={[0, 0.3, 2.35]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div style={tagStyle}>
          <span style={{ color: '#c8b0ff', marginRight: 6 }}>{W.space === 'torus' ? 'on the torus:' : 'on the figure-eight:'}</span>
          {[...word].map((c, j) => (
            <span key={j} ref={(el) => (letterEls.current[j] = el)} style={{ marginRight: 4 }}>
              {pretty(c)}
            </span>
          ))}
          = {rhs}
        </div>
      </Html>
    </>
  )
}

// ---------------------------------------------------------------- panels and the scene

export function Panel({ at, trial, exhibit, state }) {
  const frozen = state === 'exposed' || state === 'spared'
  return (
    <group position={[at[0], 0, at[1]]}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 48]} />
        <meshStandardMaterial color="#17122a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.95, 2.08, 64]} />
        <meshBasicMaterial color={state === 'exposed' ? RED : state === 'spared' ? '#5ae08a' : '#8a6ad8'} toneMapped={false} />
      </mesh>
      {trial === 0 && <LoopPairDemo pair={exhibit} frozen={frozen} />}
      {trial === 1 && <LiftDemo kind={exhibit} frozen={frozen} />}
      {trial === 2 && <WordDemo id={exhibit} frozen={frozen} />}
      {state === 'exposed' && (
        <Html position={[0, 0.2, -2.4]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="verdict-tag bad">FORGERY ✕</div>
        </Html>
      )}
    </group>
  )
}

export default function Castle1Scene({ trial, round, panelStates, showPanels, nullScript, walkable, game, gameKey, stateRef, frameRef, camYawRef, spawnRef, playEnabled, tool, onEnemies, onHearts }) {
  return (
    <>
      <Delta y={-TOP} fog={[30, 120]} life={0.35} />
      <SphereCitadel />
      <pointLight position={[NULL_AT[0], 5, NULL_AT[1]]} intensity={30} distance={22} color="#a259ff" />
      <pointLight position={[0, 7, 4]} intensity={14} distance={22} color="#ffe0c0" />
      <Throne />
      <group position={[NULL_AT[0], 0.3, NULL_AT[1]]} scale={0.8}>
        <CountNull script={nullScript} />
      </group>
      {showPanels && PANELS.map((at, i) => <Panel key={`${trial}:${round}:${i}`} at={at} trial={trial} exhibit={round[i]} state={panelStates[i]} />)}
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={{ current: null }}
        onAction={() => {}}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} frameRef={frameRef} walkable={walkable} follower={false} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.68} />
      </EffectComposer>
    </>
  )
}
