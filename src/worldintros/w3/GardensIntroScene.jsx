import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull, { CROWN_Y } from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { Facade } from '../../castles/w3/StationSet'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Deck } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { Station as PoolStation } from '../../levels/w3/ReverseEngineeringScene'
import { Lantern, Station as LanternStation } from '../../levels/w3/FrontFaceScene'
import { Station as FountainStation } from '../../levels/w3/PolynomialGardenScene'
import { Station as CompassStation } from '../../levels/w3/WhichWayScene'
import { ShotCamera, within } from '../../movies/w2/shots'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { VIDEO } from './script'
import { BouquetIsle, HeldTorus } from './Twins'

/**
 * World 3 intro (script.js): the Cup Product Gardens seen from a cliff-top garden gate.
 *   A  0–9.5    aerial over the night gardens; Gyroid and Emmy walk through the gate
 *   B  9.5–16   behind them, the Gardens below
 *   C  16–34.6  fly-over: Mirror Pools (3-1), Lantern Rows (3-3), the Polynomial Garden (3-6),
 *               the Compass Cliffs (3-7), the Counterfeit Station on the horizon (castle 3)
 *   D  34.6–39  the Twin Islands (3-4): the torus half-folded, one window lit
 *   E  39–59.4  Null rises behind the islands; the last window flickers
 *   F  59.4–76  they run down the stair toward the Mirror Pools; title
 * The landmarks are the levels' own stations, drawn with the same Station() the levels use.
 */

const mix = (a, b, k) => a + (b - a) * k
const VY = 4 // the terrace on the cliff
const G0 = [0.85, -1.2] // Gyroid's place at the rail
const E0 = [-0.85, -1.0] // Emmy's
const POOLS = [-10, -15]
const LANTERN_DECK = [13, -25]
const FOUNT = [-21, -33]
const CLIFFS = [25, -41]
const CLIFF_Y = 3
const TORUS = [-7, -58]
const BOUQ = [8, -60]
const NULL_AT = [0.5, -78]
const NULL_SCALE = 10
const NULL_FEET = -4
const STATION_FAR = [42, -2, -92]
// close-up cameras: south of each hero, so the lit Gardens (Mirror Pools for Emmy, Lantern Rows for Gyroid) fill the background
const E_CAM = [E0[0] + 1.6, E0[1] + 2.1]
const G_CAM = [G0[0] - 1.2, G0[1] + 2.3]

// Null rises out of the mist behind the twins
const nullRise = (t) => smooth(seg(t, 39.2, 41.4))
const nullY = (t) => mix(-42, NULL_FEET, nullRise(t))

const caps = VIDEO.captions
const spans = (who) => caps.filter((c) => c.speaker === who).map((c) => [c.t, c.end])
const E_TALK = spans('Emmy Boundary')
const G_TALK = spans('Gyroid')
const N_TALK = spans('Count Null')

/** Where each of them stands (world units) at story time t: walk in through the gate, then run down the stair. */
function pathOf(home, t, lane) {
  // walk in from behind the gate
  const kin = smooth(seg(t, 6.4, 8.8))
  let x = home[0]
  let z = mix(3.4, home[1], kin)
  let y = VY
  let moving = kin > 0 && kin < 1
  let face = Math.PI
  // the close: they step up to the stair head and turn toward the Mirror Pools, the first level
  if (t > 66.8) {
    const a = smooth(seg(t, 66.8, 68.6))
    x = mix(home[0], lane * 0.7, a)
    z = mix(home[1], -3.4, a)
    moving = a > 0 && a < 1
    face = Math.atan2(POOLS[0] - x, POOLS[1] - z)
  }
  return { pos: [x, y, z], moving, face }
}

/** The cliff, the terrace, the garden gate and the stair down to the water. */
function Vantage() {
  const stair = useMemo(() => Array.from({ length: 11 }, (_, i) => i), [])
  const shrubs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = Math.PI * 0.25 + (i / 15) * Math.PI * 1.5 // round the south half, clear of the stair
        return [Math.cos(a) * 3.7, Math.sin(a) * 3.7, 0.35 + ((i * 7) % 5) * 0.05, i]
      }).filter(([x, z]) => !(Math.abs(x) < 2.4 && z > 1.6) && z > -1.2),
    [],
  )
  return (
    <group>
      {/* the cliff */}
      <mesh position={[0, (VY - 7) / 2, 0.6]}>
        <cylinderGeometry args={[4.6, 7.6, VY + 7, 11, 3]} />
        <meshStandardMaterial color="#232a26" roughness={0.95} flatShading />
      </mesh>
      {/* the terrace */}
      <mesh position={[0, VY - 0.16, 0]}>
        <cylinderGeometry args={[4.3, 4.4, 0.32, 48]} />
        <meshStandardMaterial color="#3c4440" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, VY + 0.01, 0]}>
        <ringGeometry args={[4.08, 4.28, 64]} />
        <meshBasicMaterial color="#c9a24a" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* hedges and blossoms round the rim */}
      {shrubs.map(([x, z, r, i]) => (
        <group key={i} position={[x, VY, z]}>
          <mesh position={[0, r * 0.8, 0]}>
            <sphereGeometry args={[r, 10, 8]} />
            <meshStandardMaterial color="#1e3a26" roughness={0.9} />
          </mesh>
          <mesh position={[0, r * 1.5, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshBasicMaterial color={i % 2 ? '#ffd27a' : '#7fe8dc'} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* the garden gate they walk through */}
      <group position={[0, VY, 2.6]}>
        {[-1.6, 1.6].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[0.42, 2.8, 0.42]} />
              <meshStandardMaterial color="#4a5048" roughness={0.6} />
            </mesh>
            <mesh position={[0, 3.0, 0]}>
              <sphereGeometry args={[0.22, 14, 10]} />
              <meshStandardMaterial color="#ffe0a0" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 2.8, 0]}>
          <torusGeometry args={[1.6, 0.12, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} emissive="#7a5a20" emissiveIntensity={0.4} />
        </mesh>
        <pointLight position={[0, 3.2, -0.6]} color="#ffcf8a" intensity={10} distance={9} />
      </group>
      {/* the stair, down the cliff's north face to the water's causeway */}
      {stair.map((i) => (
        <mesh key={i} position={[0, VY - (i + 0.5) * (VY / 11), -4.2 - i * 0.5]}>
          <boxGeometry args={[2.0, VY / 11 + 0.05, 0.56]} />
          <meshStandardMaterial color="#3c4440" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/** Pillars under a deck, down to the sea. */
function Piers({ at, r, top = 0 }) {
  return (
    <mesh position={[at[0], top - 3.2, at[1]]}>
      <cylinderGeometry args={[r * 0.6, r * 0.35, 5.6, 10]} />
      <meshStandardMaterial color="#1a1e22" roughness={0.9} flatShading />
    </mesh>
  )
}

const site = (pos, r) => ({ pos, def: { add: [{ r }] } })

/** The landmarks the player is about to visit, drawn by the levels' own Station(). */
function Landmarks() {
  const pools = useMemo(() => ({ phi: { around_hole: { '0-2': 1, '2-3': 1, '0-1': 1 } } }), [])
  const lantern = useMemo(() => ({ cast: { cocycle_products: { L: 1, U: 1 } } }), [])
  const fount = useMemo(() => ({ pow: { climb_powers: 4 } }), [])
  const cliffs = useMemo(() => ({ surveyed: { b0: true, b1: true, b2: true } }), [])
  // the Lantern Rows: two rows from the stair's foot to the lantern deck, gold and blue
  const rows = useMemo(() => {
    const out = []
    const a = [2.2, -10.2]
    const b = [LANTERN_DECK[0] - 3.2, LANTERN_DECK[1] + 3.4]
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const L = Math.hypot(dx, dz)
    const nx = -dz / L
    const nz = dx / L
    for (let i = 0; i < 7; i++) {
      const k = i / 6
      const p = [mix(a[0], b[0], k), mix(a[1], b[1], k)]
      out.push({ pos: [p[0] + nx * 1.3, p[1] + nz * 1.3], v: 1 })
      out.push({ pos: [p[0] - nx * 1.3, p[1] - nz * 1.3], v: -1 })
    }
    return { out, a, b }
  }, [])
  return (
    <group>
      {/* causeways between the landmarks */}
      <CausewaySlab a={[0, -9.6]} b={[POOLS[0] + 3.6, POOLS[1] + 3.2]} width={1.6} />
      <CausewaySlab a={rows.a} b={rows.b} width={1.6} />
      <CausewaySlab a={[POOLS[0] - 1.2, POOLS[1] - 5.4]} b={[FOUNT[0] + 2.2, FOUNT[1] + 4.6]} width={1.6} />
      <CausewaySlab a={[LANTERN_DECK[0] + 2.6, LANTERN_DECK[1] - 4.6]} b={[CLIFFS[0] - 3.6, CLIFFS[1] + 4.2]} width={1.6} />
      <CausewaySlab a={[FOUNT[0] + 4.4, FOUNT[1] - 3.4]} b={[TORUS[0] - 2.4, TORUS[1] + 4.6]} width={1.6} />
      {/* Mirror Pools (3-1) */}
      <Piers at={POOLS} r={5.5} />
      <Deck site={site(POOLS, 5.5)} lit color="#2e323c" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[POOLS[0], 0.015, POOLS[1]]}>
        <circleGeometry args={[5.2, 48]} />
        <meshStandardMaterial color="#1a2a44" metalness={0.3} roughness={0.35} emissive="#2a4a7a" emissiveIntensity={0.3} />
      </mesh>
      <group position={[POOLS[0], 0, POOLS[1]]}>{PoolStation({ id: 'around_hole' }, { bag: pools, live: true })}</group>
      {/* Lantern Rows (3-3) */}
      {rows.out.map((l, i) => (
        <Lantern key={i} pos={l.pos} value={l.v} label="" size={0.26} />
      ))}
      <Piers at={LANTERN_DECK} r={5.5} />
      <Deck site={site(LANTERN_DECK, 5.5)} lit color="#2a3036" />
      <group position={[LANTERN_DECK[0], 0, LANTERN_DECK[1]]}>{LanternStation({ id: 'cocycle_products' }, { bag: lantern })}</group>
      {/* the Polynomial Garden's fountain (3-6) */}
      <Piers at={FOUNT} r={5} />
      <Deck site={site(FOUNT, 5)} lit color="#2a3434" />
      <group position={[FOUNT[0], 0, FOUNT[1]]}>{FountainStation({ id: 'climb_powers' }, { bag: fount })}</group>
      {/* the Compass Cliffs (3-7), on a crag */}
      <mesh position={[CLIFFS[0], (CLIFF_Y - 7) / 2, CLIFFS[1]]}>
        <cylinderGeometry args={[6.2, 8.4, CLIFF_Y + 7, 9, 2]} />
        <meshStandardMaterial color="#232a30" roughness={0.95} flatShading />
      </mesh>
      <group position={[0, CLIFF_Y, 0]}>
        <Deck site={site(CLIFFS, 5.8)} lit color="#2c3038" />
        <group position={[CLIFFS[0], 0, CLIFFS[1]]}>{CompassStation({ id: 'survey' }, { bag: cliffs })}</group>
      </group>
      <pointLight position={[CLIFFS[0], CLIFF_Y + 5, CLIFFS[1] + 4]} color="#ffd27a" intensity={14} distance={16} />
      <pointLight position={[FOUNT[0], 5, FOUNT[1] + 3]} color="#ffd27a" intensity={14} distance={14} />
      <pointLight position={[POOLS[0], 6, POOLS[1] + 2]} color="#9cc8ff" intensity={5} distance={14} />
    </group>
  )
}

/** The Crown's thread, still holding the torus half-folded. */
function CrownThread({ tRef }) {
  const ref = useRef()
  const from = useMemo(() => new THREE.Vector3(), [])
  const to = useMemo(() => new THREE.Vector3(TORUS[0], 2.2, TORUS[1]), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  useFrame(() => {
    const t = tRef.current
    const k = nullRise(t)
    ref.current.visible = k > 0.6
    from.set(NULL_AT[0], nullY(t) + (CROWN_Y + 0.35) * NULL_SCALE, NULL_AT[1] + 0.6)
    const d = to.clone().sub(from)
    ref.current.position.copy(from).add(to).multiplyScalar(0.5)
    ref.current.quaternion.setFromUnitVectors(up, d.clone().normalize())
    const w = 0.6 + Math.sin(t * 9) * 0.25 + (within(t, [[48.6, 52.4]]) ? 0.7 : 0)
    ref.current.scale.set(w, d.length(), w)
  })
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.06, 0.14, 1, 8, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/** Fireflies of the Gardens: lanterns in the air that blink in pairs. */
function Fireflies({ tRef }) {
  const g = useRef()
  const spots = useMemo(
    () => Array.from({ length: 48 }, (_, i) => [((i * 37) % 70) - 35 + (i % 2) * 0.8, 1.5 + ((i * 13) % 9) * 0.5, -8 - ((i * 23) % 56)]),
    [],
  )
  useFrame(() => {
    const t = tRef.current
    g.current.children.forEach((m, i) => {
      m.material.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.6 + Math.floor(i / 2) * 1.3))
      m.position.y = spots[i][1] + Math.sin(t * 0.7 + i) * 0.3
    })
  })
  return (
    <group ref={g}>
      {spots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshBasicMaterial color={i % 2 ? '#7fe8dc' : '#ffd27a'} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

const BG = '#0b1110'

// [start, end, [fromPos, fromLook], [toPos, toLook]]
const SHOTS = [
  // A: aerial from the south, over the cliff, toward the Gardens
  [0, 6.4, [[0, 26, 34], [0, 0, -30]], [[0, 13, 16], [0, 2, -14]]],
  // A2: in front of the terrace as they walk through the gate
  [6.4, 9.5, [[0, VY + 2.0, -7.2], [0, VY + 1.0, 1.2]], [[0, VY + 1.8, -6.4], [0, VY + 0.9, 0.4]]],
  // B: behind their shoulders, through the gate, the Gardens below
  [9.5, 16, [[0.3, VY + 2.6, 3.9], [-1.5, -5.5, -30]], [[0.2, VY + 2.5, 3.3], [-1, -5, -32]]],
  // C1: down over the Mirror Pools
  [16, 20.8, [[-3, 13, -2], [POOLS[0], -6, POOLS[1] - 2]], [[-5, 11.5, -3.5], [POOLS[0], -6.5, POOLS[1] - 3]]],
  // C2: along the Lantern Rows
  [20.8, 25, [[2, 6, -6], [8, -1.5, -20]], [[6, 7, -12], [LANTERN_DECK[0], -1.5, LANTERN_DECK[1] - 2]]],
  // C3: from the fountain across to the Compass Cliffs
  [25, 27.2, [[-12, 8, -22], [FOUNT[0], -2, FOUNT[1] - 1]], [[-14, 7.5, -23], [FOUNT[0], -2, FOUNT[1] - 1]]],
  [27.2, 29.4, [[11, 11, -29], [CLIFFS[0], -1, CLIFFS[1] - 1]], [[13, 10.5, -30], [CLIFFS[0], -1, CLIFFS[1] - 1]]],
  // C4: the station on the horizon
  [29.4, 34.6, [[22, 8, -55], [STATION_FAR[0], -1.5, STATION_FAR[2]]], [[25, 7.5, -61], [STATION_FAR[0], -1, STATION_FAR[2]]]],
  // D: the Twin Islands
  [34.6, 39, [[-1, 8, -42], [TORUS[0] + 3, -1, TORUS[1]]], [[-2, 6, -46], [TORUS[0] + 3, -0.5, TORUS[1]]]],
  // E1: back on the terrace, behind them at head height; Null rises over the islands
  [39, 44.2, [[0.1, VY + 0.4, 2.3], [0.5, 13.5, -78]], [[0, VY + 0.4, 2.0], [0.5, 14, -78]]],
  // E2: Null, close: head and crown clear of the caption and the letterbox
  [44.2, 48.4, [[NULL_AT[0] + 3.8, 22.6, NULL_AT[1] + 45], [NULL_AT[0], 22.5, NULL_AT[1]]], [[NULL_AT[0] + 2.5, 22.6, NULL_AT[1] + 42.5], [NULL_AT[0], 22.5, NULL_AT[1]]]],
  // E3: the last window, the thread above it
  [48.4, 52.6, [[-2.3, 4.2, -50.2], [-5.9, 1.5, -56.8]], [[-3.0, 3.6, -51.6], [-5.9, 1.6, -56.8]]],
  // E4: Emmy, from the front
  [52.6, 56.4, [[E_CAM[0], VY + 1.85, E_CAM[1]], [E0[0], VY + 0.9, E0[1]]], [[mix(E0[0], E_CAM[0], 0.9), VY + 1.8, mix(E0[1], E_CAM[1], 0.9)], [E0[0], VY + 0.9, E0[1]]]],
  // E5: Null again
  [56.4, 59.4, [[NULL_AT[0] - 3.8, 22.5, NULL_AT[1] + 44], [NULL_AT[0], 22.5, NULL_AT[1]]], [[NULL_AT[0] - 2.5, 22.6, NULL_AT[1] + 42.5], [NULL_AT[0], 22.5, NULL_AT[1]]]],
  // F1: Gyroid, from the front
  [59.4, 63, [[G_CAM[0], VY + 1.85, G_CAM[1]], [G0[0], VY + 0.9, G0[1]]], [[mix(G0[0], G_CAM[0], 0.9), VY + 1.8, mix(G0[1], G_CAM[1], 0.9)], [G0[0], VY + 0.9, G0[1]]]],
  // F2: both of them, from the front
  [63, 66.8, [[0, VY + 2.9, -6.2], [0, VY + 0.3, -0.6]], [[0, VY + 3.0, -6.6], [0, VY + 0.25, -1.0]]],
  // F3: from behind, as they step to the stair head and turn toward the Mirror Pools (plays out before the title)
  [66.8, 71.6, [[3.6, VY + 2.3, 0.8], [-9, -1, -14]], [[2.9, VY + 2.0, 0.0], [POOLS[0], -1.5, POOLS[1]]]],
  // title: hold over the Gardens
  [71.6, 80, [[2.9, VY + 2.0, 0.0], [POOLS[0], -1.5, POOLS[1]]], [[3.4, VY + 3.2, 0.8], [POOLS[0], -2, POOLS[1]]]],
]

export default function GardensIntroScene({ tRef }) {
  const nullG = useRef()
  const nullLight = useRef()
  useFrame(() => {
    const t = tRef.current
    nullG.current.position.set(NULL_AT[0], nullY(t), NULL_AT[1])
    nullG.current.visible = t > 39
    nullLight.current.intensity = nullRise(t) * 140
  })
  const nullScript = () => {
    const t = tRef.current
    return { gesture: within(t, N_TALK) ? 0.9 : 0.2, crown: 1, crownY: 0 }
  }
  const gyro = () => {
    const t = tRef.current
    const p = pathOf(G0, t, 1)
    const talk = within(t, G_TALK)
    const lookTorus = t > 34.6 && t < 66.8
    return {
      pos: [p.pos[0] / S, p.pos[1] / S, p.pos[2] / S],
      rotY: t > 59.4 && t < 63 ? Math.atan2(G_CAM[0] - G0[0], G_CAM[1] - G0[1]) : lookTorus ? Math.atan2(TORUS[0] - G0[0], TORUS[1] - G0[1]) : p.face,
      run: p.moving ? 1 : 0,
      cast: talk ? 0.45 : 0.08,
      whip: 0,
      loop: 0,
      loopDrop: 0,
    }
  }
  const emmy = () => {
    const t = tRef.current
    const p = pathOf(E0, t, -1)
    const talk = within(t, E_TALK)
    return {
      pos: [p.pos[0] / S, p.pos[1] / S, p.pos[2] / S],
      rotY: t > 52.6 && t < 56.4 ? Math.atan2(E_CAM[0] - E0[0], E_CAM[1] - E0[1]) : p.face,
      walk: p.moving ? 1 : 0,
      bow: 0,
      gesture: talk ? 0.6 : 0,
      talk: talk ? 1 : 0,
    }
  }
  const flicker = (t) => (t > 48.6 && t < 52.4 ? 1 : 0)
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 45, 150]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#c8e8ff', '#1a2018', 0.55]} />
      <directionalLight position={[-12, 16, -24]} intensity={0.9} color="#dfe8ff" />
      <directionalLight position={[8, 10, 14]} intensity={0.35} color="#ffe6c8" />
      <Stars radius={120} depth={50} count={2200} factor={3.2} fade speed={0.4} />
      {/* the moon over the Gardens */}
      <mesh position={[-46, 34, -110]}>
        <sphereGeometry args={[6, 32, 20]} />
        <meshBasicMaterial color="#f2ecd8" fog={false} toneMapped={false} />
      </mesh>
      <Seascape y={-5} area={[0, -40, 170, 170]} bed={false} lanterns={18} seed={33} palette={{ water: '#1c3040', deep: '#060a0e' }} />
      <Clouds y={-2.5} area={[0, -40, 110, 90]} count={14} color="#b8d0c8" opacity={0.16} seed={33} speed={0.2} />
      <Clouds y={18} area={[0, -60, 140, 80]} count={10} color="#c8b8f0" opacity={0.14} seed={34} speed={0.15} />
      <FloatingRocks center={[0, 0, -40]} radius={[70, 95]} count={18} seed={33} ySpread={[-2, 10]} />
      <Sparkles count={160} scale={[60, 8, 60]} position={[0, 2, -28]} size={2.4} color="#ffd27a" opacity={0.4} />
      <Fireflies tRef={tRef} />
      <Vantage />
      <Landmarks />
      {/* the Twin Islands */}
      <group position={[TORUS[0], 0, TORUS[1]]} scale={1.2}>
        <HeldTorus tRef={tRef} flicker={flicker} />
      </group>
      <group position={[BOUQ[0], 0, BOUQ[1]]} scale={1.1}>
        <BouquetIsle />
      </group>
      <pointLight position={[TORUS[0] + 2, 6, TORUS[1] + 6]} color="#b8a0ff" intensity={18} distance={20} />
      {/* the Counterfeit Station, far off on the horizon */}
      <group position={STATION_FAR} scale={0.8}>
        <group position={[0, 0, 15]}>
          <Facade />
        </group>
        <pointLight position={[0, 8, 6]} color="#b070ff" intensity={30} distance={30} />
      </group>
      {/* Null, huge, over the islands */}
      <group ref={nullG} scale={NULL_SCALE} rotation={[0, Math.atan2(-NULL_AT[0], -NULL_AT[1]), 0]}>
        <CountNull script={nullScript} />
      </group>
      <pointLight ref={nullLight} position={[NULL_AT[0], 20, NULL_AT[1] + 14]} color="#d8c0ff" intensity={0} distance={60} />
      <CrownThread tRef={tRef} />
      <group scale={S}>
        <Gyroid script={gyro} />
        <Emmy script={emmy} />
      </group>
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.65} />
      </EffectComposer>
    </>
  )
}

const PLACES = [
  [16, 20.8, 'Mirror Pools', 'Level 3-1'],
  [20.8, 25, 'Lantern Rows', 'Level 3-3'],
  [25, 27.2, 'The Polynomial Garden', 'Level 3-6'],
  [27.2, 29.4, 'Compass Cliffs', 'Level 3-7'],
  [29.4, 34.6, 'The Counterfeit Station', 'World 3 · Castle'],
  [34.6, 39, 'The Twin Islands', 'Level 3-4'],
]

/** Place names during the fly-over; the levels' floor tags are hidden (they're for play, not the vista). */
export function GardensIntroOverlay({ t }) {
  const p = PLACES.find(([a, b]) => t >= a && t < b)
  const k = p ? Math.min(1, (t - p[0]) / 0.5, (p[1] - t) / 0.4) : 0
  return (
    <>
      <style>{'.screen.intro .deck-tag, .screen.intro .floor-tag { display: none !important; }'}</style>
      {p && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(9vh + 3.2rem)',
            left: '1.5rem',
            opacity: k,
            pointerEvents: 'none',
            padding: '0.45rem 0.9rem',
            borderLeft: '3px solid #ffd27a',
            background: 'linear-gradient(90deg, rgba(8, 14, 12, 0.75), rgba(8, 14, 12, 0))',
            color: '#fff2c4',
            textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffd27a' }}>{p[3]}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{p[2]}</div>
        </div>
      )}
    </>
  )
}
