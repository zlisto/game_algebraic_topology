import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import CountNull, { NullCrown } from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Wren from '../../characters/Wren'
import { Hall, Press } from '../../levels/w0/FoundryScene'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import layout from '../../world/foundry.movie.json'
import { buildSites } from '../../world/sites'

/**
 * The prologue, "The Road Round the Hollow" (prologue.json): why Count Null wants the world flat.
 *   A 0–13.5   the Skeleton Foundry, warm: Ansel at the great press, Emmy at the bench
 *   B 13.5–27  Wren runs in with the post, and out again
 *   C 27–38    the Hollow road at dusk, in a storm: the rim gives way, her lantern falls
 *   D 38–50    night and rain: Ansel at the broken edge; her satchel; Emmy can't reach him
 *   E 50–68    the Foundry, cold and violet: the Crown is forged, the mask goes on
 *   F 68–74    "Twenty years later"
 * The Foundry is the World 0 · Level 4 hall; the Hollow is a new set, far off to the east (HX).
 */

const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const SITES = buildSites(layout)
const [PX, PZ] = SITES.find((s) => s.id === 'sphere_press').pos
const HX = 400 // the Hollow set's centre
const ROAD_R = 7.6 // the ring road round the Hollow
const HOLE_R = 5.6
const FALL = [-0.55, 0.15] // the arc of rim (radians, 0 = +z toward the camera) that gives way
const FALL_T = 33.4
const NS = 0.5 // Ansel's scale (Null's model is ~2.9 m without the crown)
const ES = 0.7 // Emmy's
const WS = 0.66 // Wren's

const scene = (t) => (t < 27 ? 'foundry' : t < 50 ? 'hollow' : 'foundry')
const roadPt = (a, r = ROAD_R) => [HX + Math.sin(a) * r, 0, Math.cos(a) * r]

// --- Wren: in at the Foundry door (B), round the Hollow road (C)
function wrenAt(t) {
  if (t < 13.6) return { visible: false }
  if (t < 27) {
    // runs in from the landing, stops by her father, runs out again
    const inK = smooth(seg(t, 13.6, 16))
    const outK = smooth(seg(t, 25, 27.2))
    const stop = [PX + 0.2, 0, PZ + 3.0]
    const door = [0, 0, 14]
    const p = outK > 0 ? mix3(stop, door, outK) : mix3(door, stop, inK)
    const moving = (t < 16) || t > 25
    return { pos: p, rotY: outK > 0 ? 0 : Math.PI, run: moving ? 1 : 0, lantern: 0.4, wave: t > 24.4 && t < 25.4 ? 1 : 0 }
  }
  if (t < 38) {
    // walks the road from the far side toward the front, into the arc that falls
    const a = mix(-2.3, -0.2, seg(t, 27, FALL_T))
    const p = roadPt(a)
    let y = 0
    if (t > FALL_T) y = -6 * seg(t, FALL_T, FALL_T + 1.4) ** 2 // she falls with the road
    return { pos: [p[0], y, p[2]], rotY: a + Math.PI / 2, walk: t < FALL_T ? 1 : 0, lantern: 1, visible: t < FALL_T + 0.3 } // gone with the road: the lantern carries the moment
  }
  return { visible: false }
}

// --- Ansel: at the press (A, B, E), at the broken edge (D)
function anselAt(t) {
  if (t < 27) return { pos: [PX - 1.4, 0, PZ + 1.0], rotY: t > 14 && t < 24.6 ? 0.5 : 1.2 } // to Emmy, then to Wren
  if (t < 38) return { visible: false }
  if (t < 50) {
    const a = mix(0.9, 0.3, smooth(seg(t, 38, 42)))
    const kneel = smooth(seg(t, 42.6, 43.6)) * 0.22
    const p = roadPt(a, ROAD_R - 0.4)
    return { pos: [p[0], -kneel, p[2]], rotY: a + Math.PI } // at the broken lip, facing the hole
  }
  // at the press, his back to us; on his last line he turns, and the mask is on
  return { pos: [PX - 0.6, 0, PZ + 1.2], rotY: mix(Math.PI * 0.95, 0.15, smooth(seg(t, 62.4, 64))) }
}
function emmyAt(t) {
  if (t < 27) return { pos: [PX + 2.0, 0, PZ + 1.8], rotY: t < 14 ? -1.2 : -0.6, talk: (t > 5.2 && t < 9) || (t > 25 && t < 27) ? 1 : 0 }
  if (t < 38) return { visible: false }
  if (t < 50) {
    const a = mix(1.6, 0.5, smooth(seg(t, 40, 43)))
    return { pos: roadPt(a), rotY: a - Math.PI / 2, walk: t > 40 && t < 43 ? 1 : 0, talk: t > 41.6 && t < 45 ? 1 : 0 }
  }
  return { pos: [PX + 2.4, 0, PZ + 3.6], rotY: -2.4, talk: (t > 50.6 && t < 54.4) || (t > 59.4 && t < 62) || t > 66.2 ? 1 : 0, bow: t > 66 ? 1 : 0 }
}

const SHOTS = [
  // A: into the warm Foundry, then Emmy, then Ansel at the press
  [0, 5, [[0, 4, 18], [PX, 1.4, PZ]], [[0, 3, 12], [PX, 1.3, PZ]]],
  [5, 9.1, [[PX + 3.6, 1.6, PZ + 4.6], [PX + 2.0, 1.0, PZ + 1.8]], [[PX + 3.2, 1.5, PZ + 4.0], [PX + 2.0, 1.0, PZ + 1.8]]],
  [9.1, 13.6, [[PX - 0.2, 1.7, PZ + 4.2], [PX - 1.4, 1.2, PZ + 1.0]], [[PX - 0.5, 1.6, PZ + 3.6], [PX - 1.2, 1.2, PZ + 0.6]]],
  // B: Wren runs in; two-shot; she runs out
  [13.6, 16, [[PX + 4.2, 1.5, PZ + 4.4], [PX - 0.6, 0.9, PZ + 2.0]], [[PX + 3.9, 1.45, PZ + 4.1], [PX - 0.6, 0.9, PZ + 2.0]]], // side-on: father and daughter
  [16, 18, [[PX + 0.9, 0.95, PZ + 1.7], [PX + 0.2, 0.78, PZ + 3.0]], [[PX + 0.8, 0.92, PZ + 1.9], [PX + 0.2, 0.78, PZ + 3.0]]], // Wren's face
  [18, 21.5, [[PX + 3.9, 1.45, PZ + 4.1], [PX - 0.6, 0.9, PZ + 2.0]], [[PX + 3.6, 1.4, PZ + 3.8], [PX - 0.6, 0.9, PZ + 2.0]]],
  [21.5, 27, [[PX - 2.6, 1.0, PZ + 4.6], [PX + 0.2, 0.7, PZ + 3.0]], [[PX - 2.2, 1.6, PZ + 6.4], [0, 0.8, 12]]],
  // C: the Hollow from high above, then down beside the road, then the fall
  [27, 31.6, [[HX + 2, 16, 26], [HX, 0, 0]], [[HX + 1, 11, 20], [HX, 0, 0]]],
  [31.6, FALL_T + 0.2, [[HX - 5, 2.2, 11], [HX - 2.6, 0.6, 7.2]], [[HX - 3.4, 1.8, 11], [HX - 0.8, 0.5, 7.4]]],
  [FALL_T + 0.2, 38, [[HX + 2, 4.4, 13], [HX - 0.5, -2, 7]], [[HX + 1.5, 5.5, 12], [HX - 0.5, -6, 6.2]]],
  // D: Ansel at the edge in the rain; Emmy behind him; his face
  [38, 41.6, [[HX + 5, 2.2, 13], [HX + 2.2, 0.6, 6.8]], [[HX + 4.2, 1.8, 11.2], [HX + 2.2, 0.6, 6.8]]],
  [41.6, 45.2, [[HX + 6.6, 1.6, 8.6], [HX + 3.5, 0.7, 6.6]], [[HX + 6, 1.5, 8.2], [HX + 2.4, 0.8, 6.8]]],
  [45.2, 50, [[HX + 0.6, 1.0, 5.0], [HX + 2.1, 0.8, 6.8]], [[HX + 0.9, 0.95, 5.4], [HX + 2.1, 0.8, 6.8]]],
  // E: the cold Foundry, the press, the Crown, the mask
  [50, 54.6, [[PX + 4.4, 2.2, PZ + 6.4], [PX - 0.4, 1.0, PZ + 1.0]], [[PX + 3.6, 2.0, PZ + 5.2], [PX - 0.4, 1.0, PZ + 1.0]]],
  [54.6, 62.2, [[PX - 1.6, 1.4, PZ + 3.4], [PX - 0.6, 1.3, PZ + 1.2]], [[PX - 1.2, 1.35, PZ + 3.0], [PX - 0.6, 1.35, PZ + 1.2]]],
  [62.2, 68, [[PX - 0.4, 1.5, PZ + 3.4], [PX - 0.6, 1.4, PZ + 1.2]], [[PX - 0.5, 1.45, PZ + 2.7], [PX - 0.6, 1.45, PZ + 1.2]]],
  [68, 74, [[PX, 3, PZ + 8], [PX, 2, PZ]], [[PX, 6, PZ + 14], [PX, 2.5, PZ]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, sh[0], sh[1]))
    camera.position.set(...mix3(sh[2][0], sh[3][0], k))
    look.set(...mix3(sh[2][1], sh[3][1], k))
    // the rim breaking: a jolt
    const shake = seg(t, FALL_T, FALL_T + 0.2) * (1 - seg(t, FALL_T + 0.2, FALL_T + 1.6)) * 0.18
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0))
    camera.lookAt(look)
  })
  return null
}

/** Rain: falling streaks over the Hollow. */
function Rain({ heavy }) {
  const ref = useRef()
  const N = 1400
  const data = useMemo(() => Array.from({ length: N }, (_, i) => [((i * 7919) % 1000) / 1000, ((i * 104729) % 1000) / 1000, ((i * 1299709) % 1000) / 1000]), [])
  const d = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach(([u, v, w], i) => {
      d.position.set(HX + (u - 0.5) * 40, ((v * 14 - t * 11) % 14 + 14) % 14 - 2, (w - 0.5) * 40)
      d.rotation.set(0, 0, 0.12)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.material.opacity = heavy.current
  })
  return (
    <instancedMesh ref={ref} args={[null, null, N]} frustumCulled={false}>
      <boxGeometry args={[0.012, 0.45, 0.012]} />
      <meshBasicMaterial color="#9fb4d8" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  )
}

/** The Hollow: an island with a sheer hole through it, the old ring road round the rim, lamps along the road. */
function HollowSet({ tRef }) {
  const fallPiece = useRef()
  const lamps = useRef()
  const flash = useRef()
  const heavy = useRef(0.4)
  const lanternFall = useRef()
  const land = useMemo(() => {
    // the island: a thick annulus, cut away where the rim falls
    const sh = new THREE.Shape()
    sh.absarc(0, 0, 22, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, HOLE_R, 0, Math.PI * 2, true)
    sh.holes.push(hole)
    const g = new THREE.ExtrudeGeometry(sh, { depth: 7, bevelEnabled: false, curveSegments: 96 })
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  const road = useMemo(() => new THREE.RingGeometry(ROAD_R - 0.75, ROAD_R + 0.75, 128, 1), [])
  // the piece of rim and road that falls: an arc wedge from the hole's edge to beyond the road
  const wedge = useMemo(() => {
    const sh = new THREE.Shape()
    const [a0, a1] = FALL
    const r0 = HOLE_R
    const r1 = ROAD_R + 1.4
    const n = 24
    // in shape space, x = sin(a)·r and y = cos(a)·r (rotated into the xz plane below)
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n
      sh[i ? 'lineTo' : 'moveTo'](Math.sin(a) * r1, Math.cos(a) * r1)
    }
    for (let i = n; i >= 0; i--) {
      const a = a0 + ((a1 - a0) * i) / n
      sh.lineTo(Math.sin(a) * r0 * (1 + 0.04 * Math.sin(i * 3.1)), Math.cos(a) * r0)
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false })
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  const lampSpots = useMemo(() => Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2 + 0.11).filter((a) => !(a > Math.PI * 2 + FALL[0] || a < FALL[1])), [])
  useFrame(() => {
    const t = tRef.current
    const k = seg(t, FALL_T, FALL_T + 2.4)
    fallPiece.current.position.y = -40 * k * k + 0.01
    fallPiece.current.rotation.x = 0.4 * k
    fallPiece.current.visible = k < 0.98
    heavy.current = t < 31 ? 0.25 : 0.5
    // lightning: two flashes before the fall, one on it
    const fl = [29.2, 32.1, FALL_T].reduce((m, a) => Math.max(m, seg(t, a, a + 0.05) * (1 - seg(t, a + 0.05, a + 0.5))), 0)
    flash.current.intensity = fl * 6
    // the lantern: carried, then falling, a spark shrinking into the dark
    const lk = seg(t, FALL_T + 0.3, FALL_T + 4)
    lanternFall.current.visible = t > FALL_T + 0.3 && t < FALL_T + 4
    const p = roadPt(-0.2, ROAD_R - 0.6 - lk * 1.4)
    lanternFall.current.position.set(p[0], -1 - 26 * lk * lk, p[2])
  })
  return (
    <group>
      <color attach="background" args={['#0b0f18']} />
      <fog attach="fog" args={['#0b0f18', 14, 46]} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={['#5a6a90', '#05060a', 0.35]} />
      <directionalLight position={[HX + 10, 20, 8]} intensity={0.35} color="#9fb4ff" />
      <directionalLight ref={flash} position={[HX - 6, 30, 10]} intensity={0} color="#dfe8ff" />
      <Stars radius={90} depth={30} count={300} factor={2} fade speed={0.1} />
      <group position={[HX, 0, 0]}>
        <mesh geometry={land}>
          <meshStandardMaterial color="#26302c" roughness={0.95} />
        </mesh>
        {/* the Hollow's wall, falling away into the dark */}
        <mesh position={[0, -14, 0]}>
          <cylinderGeometry args={[HOLE_R, HOLE_R * 0.92, 28, 64, 1, true]} />
          <meshStandardMaterial color="#141a18" side={THREE.BackSide} roughness={1} />
        </mesh>
        <mesh position={[0, -27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[HOLE_R, 48]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh geometry={road} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <meshStandardMaterial color="#6b5d4a" roughness={0.85} />
        </mesh>
        <group ref={fallPiece}>
          <mesh geometry={wedge}>
            <meshStandardMaterial color="#26302c" roughness={0.95} />
          </mesh>
        </group>
        {/* lamps along the road */}
        <group ref={lamps}>
          {lampSpots.map((a, i) => (
            <group key={i} position={[Math.sin(a) * (ROAD_R + 1.0), 0, Math.cos(a) * (ROAD_R + 1.0)]}>
              <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 2.2, 8]} />
                <meshStandardMaterial color="#2a2420" />
              </mesh>
              <mesh position={[0, 2.25, 0]}>
                <sphereGeometry args={[0.11, 12, 10]} />
                <meshBasicMaterial color="#ffc46a" toneMapped={false} />
              </mesh>
              {i % 3 === 0 && <pointLight position={[0, 2.2, 0]} color="#ffb347" intensity={3} distance={7} />}
            </group>
          ))}
        </group>
        {/* a few trees and stones beyond the road */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + 0.2
          const r = 12 + ((i * 37) % 7)
          return (
            <mesh key={i} position={[Math.sin(a) * r, 0.9, Math.cos(a) * r]}>
              <coneGeometry args={[0.7 + (i % 3) * 0.2, 2.4 + (i % 4) * 0.5, 7]} />
              <meshStandardMaterial color="#1b2620" roughness={1} flatShading />
            </mesh>
          )
        })}
      </group>
      <group ref={lanternFall}>
        <mesh>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
        <pointLight color="#ffb347" intensity={4} distance={6} />
      </group>
      <Rain heavy={heavy} />
    </group>
  )
}

/** The satchel she left at the edge (D). */
function Satchel({ tRef }) {
  const g = useRef()
  useFrame(() => {
    g.current.visible = tRef.current > 38 && tRef.current < 50
  })
  const p = roadPt(0.22, ROAD_R + 0.8) // snagged on the lamp post just past the break
  useFrame(() => {
    const t = tRef.current
    // he picks it up at 43.4 and holds it to his chest
    const k = smooth(seg(t, 43, 44))
    const a = anselAt(t)
    if (a.pos && k > 0) {
      const f = [Math.sin(a.rotY) * 0.28, Math.cos(a.rotY) * 0.28]
      g.current.position.set(mix(p[0], a.pos[0] + f[0], k), mix(0.08, a.pos[1] + 0.95, k), mix(p[2], a.pos[2] + f[1], k))
      g.current.rotation.set(0, a.rotY, 0)
    } else {
      g.current.position.set(p[0], 0.08, p[2])
      g.current.rotation.set(0, 0.4, 0.2)
    }
  })
  return (
    <group ref={g} scale={0.7}>
      <mesh>
        <boxGeometry args={[0.36, 0.22, 0.12]} />
        <meshStandardMaterial color="#6b4428" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.08, 0.002]}>
        <boxGeometry args={[0.37, 0.09, 0.125]} />
        <meshStandardMaterial color="#5a3820" roughness={0.7} />
      </mesh>
      <mesh position={[0.05, 0.14, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.16, 0.1, 0.01]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** The Foundry in both its moods: warm in A–B, cold and violet in E, with the Crown being forged. */
function FoundrySet({ tRef }) {
  const slam = useRef(0)
  const violet = useRef()
  const warm = useRef()
  const crownG = useRef()
  const crownGlow = useRef(0.2)
  useFrame(() => {
    const t = tRef.current
    const cold = t > 50
    // the press thumps steadily in A–B; in E it slams once for every line, then stops
    const beat = cold ? (t < 61 ? (t % 2.6) / 2.6 : 1) : (t % 1.8) / 1.8
    slam.current = beat < 0.25 ? 1 - beat / 0.25 : 0
    violet.current.intensity = cold ? 70 + 25 * Math.sin(t * 2) : 0
    warm.current.intensity = cold ? 0 : 20
    // the Crown: rises from the press in E, lit when the mask goes on
    crownG.current.visible = t > 53.5 && t < 74
    crownG.current.position.y = mix(1.2, 2.9, smooth(seg(t, 53.5, 58)))
    crownGlow.current = t > 64 ? 1.4 : 0.3
    crownG.current.rotation.y = t * 0.4
  })
  return (
    <>
      <Hall layout={layout} />
      <Press pos={[PX, PZ]} slamRef={slam} />
      <pointLight ref={warm} position={[PX, 3, PZ + 2]} color="#ffb347" distance={16} intensity={20} />
      <pointLight ref={violet} position={[PX, 3, PZ]} color="#a259ff" distance={26} intensity={0} />
      <group ref={crownG} position={[PX, 2.9, PZ - 0.2]} scale={0.6}>
        <NullCrown glowRef={crownGlow} />
      </group>
      <group position={[PX, 2.0, PZ]}>
        <Sparkles count={60} scale={[4, 3, 3]} size={4} speed={0.5} color="#ffb070" />
      </group>
    </>
  )
}

export default function PrologueMovie({ tRef }) {
  const [where, setWhere] = useState('foundry')
  const [turned, setTurned] = useState(false)
  useFrame(() => {
    const w = scene(tRef.current)
    if (w !== where) setWhere(w)
    const tn = tRef.current > 50
    if (tn !== turned) setTurned(tn)
  })
  const nullScript = () => {
    const t = tRef.current
    const a = anselAt(t)
    return { gesture: t > 45.2 && t < 49.6 ? 0.35 : t > 54.8 && t < 59 ? 0.6 : 0, crown: t > 64 ? 0.8 : 0, crownOn: false, mask: t > 63.2 ? 1 : 0, bare: true, rim: seg(t, 63.2, 65), ...a }
  }
  return (
    <>
      {where === 'foundry' ? <FoundrySet tRef={tRef} /> : <HollowSet tRef={tRef} />}
      <Satchel tRef={tRef} />
      <AnselLantern tRef={tRef} />
      <AnselFigure script={nullScript} palette={turned ? undefined : 'warm'} />
      <group scale={ES}>
        <Emmy
          script={() => {
            const e = emmyAt(tRef.current)
            return { ...e, pos: e.pos ? [e.pos[0] / ES, 0, e.pos[2] / ES] : [0, -200, 0] }
          }}
        />
      </group>
      <group scale={WS}>
        <Wren
          script={() => {
            const w = wrenAt(tRef.current)
            return { ...w, pos: w.pos ? [w.pos[0] / WS, w.pos[1] / WS, w.pos[2] / WS] : [0, -200, 0] }
          }}
        />
      </group>
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.8} />
      </EffectComposer>
    </>
  )
}

/** Ansel, before and as he becomes Null: Null's own robes (no crown, no fragments; the mask goes on in E). */
function AnselFigure({ script, palette }) {
  const g = useRef()
  useFrame(() => {
    const s = script()
    g.current.visible = s.visible !== false
    if (s.pos) g.current.position.set(...s.pos)
    g.current.rotation.y = s.rotY || 0
  })
  return (
    <group ref={g} scale={NS}>
      <CountNull script={script} palette={palette} />
    </group>
  )
}

/** D: Ansel's lantern, set down at the broken lip, lighting his face from below. */
function AnselLantern({ tRef }) {
  const g = useRef()
  useFrame(() => {
    const t = tRef.current
    g.current.visible = t > 38 && t < 50
    const a = roadPt(0.24, ROAD_R - 0.8)
    g.current.position.set(a[0], 0.15, a[2])
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <pointLight color="#ffb347" intensity={2.4} distance={3.2} />
    </group>
  )
}
