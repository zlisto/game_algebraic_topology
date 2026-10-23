import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Crown, Flash, Summit } from '../../castles/w4/CrownSet'
import { Emblem } from '../../castles/w4/Demos4'
import VIDEO from './script.json'

/**
 * World 4's intro (script.json): the Postnikov Spire seen whole. The viaduct from the Counterfeit
 * Station ends high over the sea; Gyroid and Emmy stand at its end. The Spire is the Crown's summit
 * set (castles/w4/CrownSet, raised to TOP) on a core whose terraces are the World 4 floors, each
 * carrying its level's emblem (castles/w4/Demos4). Null rises out of the sea beside it, taller
 * than his tower.
 *   A 0–7      establishing: the viaduct's end, the Spire, the Crown
 *   B 7–13     over the pair's shoulders, looking up
 *   C 13–27.5  the camera spirals up the floors to the summit
 *   D 27.5–41  the Crown flares; Null rises and speaks
 *   E 41–47.5  the pair answer; the Chart lights a path down to the Cube Hall
 *   F 47.5–54  they run; crane back for the title card
 */

const S = 0.7
const TOP = 44 // the summit floor's height: the Summit set's sea (−44 inside it) lands at y = 0
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const spans = (who) => VIDEO.captions.filter((c) => c.speaker === who).map((c) => [c.t, c.end])
const within = (t, sp) => sp.some(([a, b]) => t > a && t < b)
const E_TALK = spans('Emmy Boundary')
const G_TALK = spans('Gyroid')
const N_TALK = spans('Count Null')

// the floors of the Spire, bottom to top, each on a terrace round the core (θ = 0 faces the viaduct)
const FLOORS = [
  { name: 'Cube Hall', vis: 'cubes', col: '#ffb347' },
  { name: 'Grid Gallery', vis: 'slip', col: '#7fe0ff' },
  { name: 'Hopf Ring', vis: 'hopf', col: '#ff8ad8' },
  { name: 'Hurewicz Hall', vis: 'hurewicz', col: '#ffd27a' },
  { name: 'The Twist', vis: 'twin', col: '#c08aff' },
  { name: 'Obstruction Course', vis: 'cells', col: '#ff6a8a' },
].map((f, i) => ({ ...f, y: 2.5 + i * 4.4, th: i * 1.05 }))
const RING_R = 10.5
const PAD_R = 4.2
const padAt = (f) => [Math.sin(f.th) * RING_R, f.y, Math.cos(f.th) * RING_R]
const coreR = (y) => mix(7.5, 6.0, (y + 2) / 31)

// the viaduct and the pair at its end
const DECK = 12
const END_Z = 58
const EMMY_AT = [-0.95, DECK, 59.4]
const GYRO_AT = [0.95, DECK, 59.2]
// the Chart path: from the viaduct's end down to the Cube Hall's front edge
const PATH_A = [0, DECK, END_Z - 1.6]
const PATH_B = [0, FLOORS[0].y, RING_R + PAD_R - 0.4]
const PATH_N = 18
const pathAt = (u) => mix3(PATH_A, PATH_B, u)
const PATH_LIT = [44.4, 47.2]
const RUN = [48.2, 54] // they run down the path

// Count Null, rising out of the sea beside his Spire
const NULL_BASE = [-30, 4, -34]
const NULL_ROT = 0.32
const NULL_SCALE = 14
const RISE = [27.6, 30.2]
const nullFace = (along, up) => {
  // a point `along` units in front of Null's face, `up` above his feet
  const d = [Math.sin(NULL_ROT), 0, Math.cos(NULL_ROT)]
  return [NULL_BASE[0] + d[0] * along, NULL_BASE[1] + up, NULL_BASE[2] + d[2] * along]
}
const HEAD = nullFace(1.5, 2.7 * NULL_SCALE) // ≈ the mask

// ---------------------------------------------------------------- camera

const SHOTS = [
  // [t0, t1, [from pos, from look], [to pos, to look]] ('fly' = the spiral up the floors)
  [0, 7, [[18, 7, 104], [0, 24, 0]], [[7, 15.5, 74], [0, 27, 0]]],
  [7, 13, [[2.5, 12.2, 66.6], [-1.5, 16.6, 18]], [[2.2, 12.2, 65.8], [-1.5, 17.4, 18]]],
  [13, 27.5, 'fly'],
  [27.5, 29.9, [[22, 16, 96], [-12, 28, -14]], [[19, 18, 90], [-14, 30, -18]]],
  [29.9, 33.4, [nullFace(70, 38), [HEAD[0], 36.5, HEAD[2]]], [nullFace(64, 37), [HEAD[0], 37, HEAD[2]]]],
  // from the water at his feet, looking up
  [33.4, 37, [[-27, 6, 11], [HEAD[0], 35, HEAD[2]]], [[-25.6, 7, 8.4], [HEAD[0], 35.5, HEAD[2]]]],
  [37, 41, [nullFace(58, 40), [HEAD[0], 41.5, HEAD[2]]], [nullFace(50, 41), [HEAD[0], 42.5, HEAD[2]]]],
  // behind the pair: Null and his Spire ahead of them
  [41, 44.2, [[2.0, 12.25, 66.8], [-6.6, 18.0, 17.8]], [[1.8, 12.3, 66.0], [-6.6, 18.4, 17.8]]],
  // from down the Chart path, looking back up at them as the slabs light towards us
  [44.2, 48, [[2.4, 11.6, 50.5], [0, 13.6, 59.5]], [[2.0, 11.4, 49.2], [0, 13.5, 59.5]]],
  [48, 54, [[4, 16, 74], [-8, 26, -6]], [[8, 26, 100], [-9, 30, -8]]],
]

/** The spiral up the Spire: one key per floor, then the summit. */
const FLY = [
  ...FLOORS.map((f, i) => ({ t: 13.8 + i * 2.05, th: f.th + 0.55, r: 23, h: f.y + 6.2, look: [...padAt(f)].map((v, k) => (k === 1 ? v - 0.6 : v)) })),
  { t: 26.6, th: Math.PI * 2 + 0.05, r: 30, h: TOP + 9, look: [0, TOP + 5.5, -7.3] },
]
function flyCam(t) {
  const first = { ...FLY[0], t: 13, r: 30, h: FLY[0].h + 3 }
  const keys = [first, ...FLY]
  let i = keys.findIndex((k) => k.t > t)
  if (i < 0) i = keys.length - 1
  if (i === 0) i = 1
  const a = keys[i - 1]
  const b = keys[i]
  const k = smooth(seg(t, a.t, b.t))
  const th = mix(a.th, b.th, k)
  const r = mix(a.r, b.r, k)
  return [[Math.sin(th) * r, mix(a.h, b.h, k), Math.cos(th) * r], mix3(a.look, b.look, k)]
}

function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    if (sh[2] === 'fly') {
      const [p, l] = flyCam(t)
      camera.position.set(...p)
      look.set(...l)
    } else {
      const k = smooth(seg(t, sh[0], sh[1]))
      camera.position.set(...mix3(sh[2][0], sh[3][0], k))
      look.set(...mix3(sh[2][1], sh[3][1], k))
    }
    // the sea shudders as Null breaks the surface
    const shake = 0.35 * seg(t, RISE[0], RISE[0] + 0.4) * (1 - seg(t, RISE[1] - 0.6, RISE[1]))
    camera.position.x += Math.sin(t * 53) * shake
    camera.position.y += Math.cos(t * 41) * shake
    camera.lookAt(look)
  })
  return null
}

// ---------------------------------------------------------------- the Spire below the summit

function Core() {
  const seams = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2 + 0.26)
  return (
    <group>
      <mesh position={[0, 13.5, 0]}>
        <cylinderGeometry args={[6.0, 7.5, 31, 48]} />
        <meshStandardMaterial color="#231b3c" emissive="#160c30" emissiveIntensity={0.7} roughness={0.55} metalness={0.35} />
      </mesh>
      {seams.map((a) => (
        <mesh key={a} position={[Math.sin(a) * 6.82, 13.5, Math.cos(a) * 6.82]} rotation={[0.048 * Math.cos(0), a, 0]}>
          <boxGeometry args={[0.12, 31, 0.12]} />
          <meshBasicMaterial color="#8a5aff" toneMapped={false} transparent opacity={0.55} />
        </mesh>
      ))}
      {/* a lit band of windows at every floor */}
      {FLOORS.map((f) => (
        <mesh key={f.name} position={[0, f.y + 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[coreR(f.y + 1.6) + 0.04, 0.1, 6, 72]} />
          <meshBasicMaterial color={f.col} toneMapped={false} />
        </mesh>
      ))}
      {/* the footing in the sea */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[9.5, 12, 2.4, 40]} />
        <meshStandardMaterial color="#1a1428" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.2, 9.5, 64]} />
        <meshBasicMaterial color="#d8a84a" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** One floor's terrace: a hanging stone pad with a gold rim, a bridge to the core, and its emblem. */
function Terrace({ f, i }) {
  const [x, y, z] = padAt(f)
  return (
    <group position={[x, y, z]} rotation={[0, f.th, 0]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[PAD_R, PAD_R - 0.3, 0.7, 40]} />
        <meshStandardMaterial color="#2a2246" emissive="#140c2a" emissiveIntensity={0.6} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[PAD_R - 0.35, 3.2, 40]} />
        <meshStandardMaterial color="#1a1430" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[PAD_R - 0.28, PAD_R, 64]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[PAD_R - 1.0, PAD_R - 0.86, 64]} />
        <meshBasicMaterial color={f.col} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      {/* bridge back to the core */}
      <mesh position={[0, -0.3, -RING_R / 2 - 0.6]}>
        <boxGeometry args={[2.4, 0.6, RING_R - 3]} />
        <meshStandardMaterial color="#2a2246" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* rim posts, lit in the floor's colour */}
      {Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2 + 0.31
        if (Math.cos(a) < -0.85) return null // the bridge
        return (
          <group key={k} position={[Math.sin(a) * (PAD_R - 0.18), 0, Math.cos(a) * (PAD_R - 0.18)]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.14, 0.9, 0.14]} />
              <meshStandardMaterial color="#141026" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.98, 0]}>
              <sphereGeometry args={[0.13, 10, 8]} />
              <meshBasicMaterial color={f.col} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
      <group scale={2.3}>
        <Emblem vis={f.vis} />
      </group>
      {i === 0 && (
        // the Cube Hall's beacon x₀, where every pinned edge goes
        <group position={[0, 0, -2.9]}>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.12, 0.2, 2.2, 10]} />
            <meshStandardMaterial color="#3a3440" />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <sphereGeometry args={[0.36, 16, 12]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
        </group>
      )}
      <pointLight position={[0, 4, 1.5]} color={f.col} intensity={40} distance={11} />
    </group>
  )
}

/** Stairs winding round the core from each terrace to the next. */
function Stairs() {
  const steps = useMemo(() => {
    const out = []
    for (let i = 0; i < FLOORS.length - 1; i++) {
      const A = FLOORS[i]
      const B = FLOORS[i + 1]
      const n = 9
      for (let k = 0; k < n; k++) {
        const u = (k + 0.5) / n
        const a = mix(A.th + 0.44, B.th - 0.44, u)
        out.push({ key: `${i}.${k}`, pos: [Math.sin(a) * 8.4, mix(A.y, B.y, u) - 0.12, Math.cos(a) * 8.4], a })
      }
    }
    return out
  }, [])
  return steps.map((s) => (
    <group key={s.key} position={s.pos} rotation={[0, s.a, 0]}>
      <mesh>
        <boxGeometry args={[1.05, 0.24, 2.4]} />
        <meshStandardMaterial color="#2a2140" emissive="#d8a84a" emissiveIntensity={0.18} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.13, 1.2]}>
        <boxGeometry args={[1.05, 0.04, 0.06]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
    </group>
  ))
}

// ---------------------------------------------------------------- the viaduct

function Viaduct() {
  const len = 110
  const piers = Array.from({ length: 12 }, (_, i) => END_Z + 6 + i * 9)
  return (
    <group>
      <mesh position={[0, DECK - 0.4, END_Z + len / 2]}>
        <boxGeometry args={[3.4, 0.8, len]} />
        <meshStandardMaterial color="#2c2638" roughness={0.75} metalness={0.2} />
      </mesh>
      {/* the round platform at its end */}
      <mesh position={[0, DECK - 0.4, END_Z + 0.6]}>
        <cylinderGeometry args={[3.0, 2.6, 0.8, 40]} />
        <meshStandardMaterial color="#2c2638" roughness={0.75} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK + 0.01, END_Z + 0.6]}>
        <ringGeometry args={[2.72, 2.95, 48]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      {piers.map((z) => (
        <group key={z}>
          <mesh position={[0, DECK / 2 - 1, z]}>
            <boxGeometry args={[2.2, DECK, 2.2]} />
            <meshStandardMaterial color="#221d2e" roughness={0.85} />
          </mesh>
          <mesh position={[0, DECK - 2.4, z + 4.5]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[3.4, 0.45, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#221d2e" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {[-1.62, 1.62].map((x) => (
        <mesh key={x} position={[x, DECK + 0.35, END_Z + 2 + len / 2]}>
          <boxGeometry args={[0.1, 0.1, len]} />
          <meshBasicMaterial color="#b07aff" toneMapped={false} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* lamps down the deck */}
      {Array.from({ length: 10 }, (_, i) => END_Z + 4 + i * 9).map((z, i) => (
        <group key={z} position={[i % 2 ? 1.55 : -1.55, DECK, z]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 1.6, 6]} />
            <meshStandardMaterial color="#1a1624" />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshBasicMaterial color="#ffd8a0" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* low gold bollards round the end platform (low, so they never hide the pair) */}
      {Array.from({ length: 7 }, (_, i) => {
        const b = -1.3 + (i / 6) * 2.6 // round the front (−z) half
        return (
          <mesh key={i} position={[Math.sin(b) * 2.75, DECK + 0.22, END_Z + 0.6 - Math.cos(b) * 2.75]}>
            <cylinderGeometry args={[0.09, 0.12, 0.44, 8]} />
            <meshStandardMaterial color="#d8a84a" emissive="#8a5a10" emissiveIntensity={0.9} metalness={0.8} roughness={0.3} />
          </mesh>
        )
      })}
      <pointLight position={[0, DECK + 3.2, END_Z + 2.4]} color="#ffd8a0" intensity={30} distance={10} />
      <pointLight position={[0, DECK + 2.4, END_Z - 3]} color="#b07aff" intensity={18} distance={9} />
    </group>
  )
}

/** Gold Chart slabs that light one by one, a path from the viaduct's end down to the Cube Hall. */
function ChartPath({ tRef }) {
  const slabs = useRef([])
  useFrame(() => {
    const t = tRef.current
    slabs.current.forEach((g, i) => {
      if (!g) return
      const k = smooth(seg(t, mix(PATH_LIT[0], PATH_LIT[1], i / PATH_N), mix(PATH_LIT[0], PATH_LIT[1], i / PATH_N) + 0.5))
      g.visible = k > 0.01
      g.scale.setScalar(Math.max(0.01, k))
    })
  })
  return Array.from({ length: PATH_N }, (_, i) => {
    const p = pathAt((i + 0.5) / PATH_N)
    return (
      <group key={i} ref={(g) => (slabs.current[i] = g)} position={[p[0], p[1] - 0.14, p[2]]} rotation={[0, (i % 2 ? 1 : -1) * 0.05, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 0.24, 1.6]} />
          <meshStandardMaterial color="#2a2140" emissive="#d8a84a" emissiveIntensity={1.0} roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.13, 0.78]}>
          <boxGeometry args={[2.4, 0.04, 0.05]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
      </group>
    )
  })
}

/** The last of the dawn, low behind the Spire; it goes out when Null rises. */
function Dawn({ tRef }) {
  const k = () => 0.55 * (1 - seg(tRef.current, RISE[0], RISE[1] + 1))
  return (
    <>
      <Flash position={[24, 4, -105]} kRef={k} size={170} color="#ff9a5a" />
      <Flash position={[-50, 14, -100]} kRef={() => 0.35} size={150} color="#5a2a9a" />
    </>
  )
}

// ---------------------------------------------------------------- the scene

export default function SpireIntroScene({ tRef }) {
  const crownRef = useRef({ broken: 0, low: 0, shatter: 0, fury: 0.45, beam: 0 })
  const furyRef = useRef(0.45)
  const dimRef = useRef(0)
  const nullG = useRef()
  const flare = useRef(0)
  const nullLights = useRef([])
  useFrame(() => {
    const t = tRef.current
    const c = crownRef.current
    c.fury = 0.45 + 0.55 * seg(t, RISE[0] - 0.6, RISE[0] + 0.6)
    c.beam = seg(t, RISE[0] - 0.4, RISE[0]) * (1 - seg(t, RISE[1] - 0.4, RISE[1] + 0.6))
    furyRef.current = c.fury
    dimRef.current = 0.65 * seg(t, RISE[0], RISE[1] + 2)
    flare.current = seg(t, RISE[0] - 0.5, RISE[0]) * (1 - seg(t, RISE[0] + 0.2, RISE[0] + 1.6))
    const up = smooth(seg(t, RISE[0], RISE[1]))
    nullG.current.visible = t > RISE[0]
    const lit = smooth(seg(t, RISE[0] + 0.6, RISE[1]))
    if (nullLights.current[0]) nullLights.current[0].intensity = 1600 * lit
    if (nullLights.current[1]) nullLights.current[1].intensity = 900 * lit
    nullG.current.position.y = mix(-52, NULL_BASE[1], up) + (t > RISE[1] ? Math.sin((t - RISE[1]) * 0.8) * 0.5 : 0)
  })
  const nullScript = () => {
    const t = tRef.current
    const talk = within(t, N_TALK)
    return { gesture: talk ? (t > 37 ? 1 : 0.75) : 0.2, crown: talk ? 1 : 0.6, crownY: 0.05 }
  }
  const gyroScript = () => {
    const t = tRef.current
    if (t >= RUN[0]) {
      const u = 0.32 * smooth(seg(t, RUN[0], RUN[1]))
      const p = pathAt(u)
      return { pos: [p[0] + 0.55, p[1], p[2]], rotY: Math.PI, run: 1, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    const talk = within(t, G_TALK)
    const turn = talk && t < 21 ? 0.55 : 0
    return { pos: GYRO_AT, rotY: Math.PI + turn, run: 0, cast: t > 41 ? 0.6 : talk ? 0.35 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    if (t >= RUN[0] + 0.2) {
      const u = 0.29 * smooth(seg(t, RUN[0] + 0.2, RUN[1]))
      const p = pathAt(u)
      return { pos: [p[0] - 0.55, p[1], p[2] + 0.6], rotY: Math.PI, walk: 1, gesture: 0, bow: 0, talk: 0 }
    }
    const talk = within(t, E_TALK)
    const turn = talk && t < 13 ? -0.55 : 0
    return { pos: EMMY_AT, rotY: Math.PI + turn, walk: 0, gesture: talk ? 0.7 : 0.1, bow: 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <color attach="background" args={['#0a0716']} />
      <fog attach="fog" args={['#0d0920', 90, 260]} />
      <Dawn tRef={tRef} />
      <group position={[0, TOP, 0]}>
        <Summit furyRef={furyRef} dimRef={dimRef} rocksCenter={[0, -4, 0]} rocksRadius={[17, 27]} />
        <Crown stateRef={crownRef} scale={1.4} />
        <Flash position={[0, 6.4, -7.3]} kRef={flare} size={60} color="#d0a0ff" />
      </group>
      <Core />
      {FLOORS.map((f, i) => (
        <Terrace key={f.name} f={f} i={i} />
      ))}
      <Stairs />
      <Viaduct />
      <ChartPath tRef={tRef} />

      {/* Count Null, risen out of the sea beside his Spire */}
      <group ref={nullG} position={NULL_BASE} rotation={[0, NULL_ROT, 0]}>
        <group scale={NULL_SCALE}>
          <CountNull script={nullScript} />
        </group>
        <Flash position={[0, 30, -14]} kRef={() => 0.6} size={95} color="#7a3aff" />
      </group>
      {/* his light stays in the scene (intensity 0 until he rises), so nothing recompiles mid-shot */}
      <group position={[NULL_BASE[0], 0, NULL_BASE[2]]} rotation={[0, NULL_ROT, 0]}>
        <pointLight ref={(l) => (nullLights.current[0] = l)} position={[0, 44, 22]} color="#d8c0ff" intensity={0} distance={0} decay={2} />
        <pointLight ref={(l) => (nullLights.current[1] = l)} position={[0, 22, 26]} color="#a259ff" intensity={0} distance={0} decay={2} />
      </group>

      <Emmy scale={S} script={emmyScript} />
      <Gyroid scale={S} script={gyroScript} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.66} />
      </EffectComposer>
    </>
  )
}
