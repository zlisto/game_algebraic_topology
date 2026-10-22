import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { ShardSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import Commutator from './Commutator'
import { CROWN_HOME, Crown, Flash, Summit } from './CrownSet'
import { NULL_AT } from './stages'

/**
 * Intro movie for the World 4 castle, "The Null Crown" (introScript.js):
 *   A 0–6.5    from below: the Spire, the Crown's beam pulling violet threads up from the Way
 *   B 6.5–14   the march: Gyroid and Emmy run up a stair of Chart slabs that light under their feet
 *   C 14–23    the summit: Null on his dais under the huge Crown
 *   D 23–28.4  Null rises; shards orbit him, then dive at the pair
 *   E 28.4–38.6 a violet ribbon streaks down: the Commutator lands, cuts the shards apart, turns on Null
 *   F 38.6–45  the line-up, title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

// the stair of Chart slabs, from far below up to the summit's front edge
const R0 = [0, -15, 36]
const R1 = [0, 0, 9.2]
const stairAt = (u) => mix3(R0, R1, u)
const STEPS = 26
const G_END = [-0.5, 0, 6.0] // where Gyroid stops on the summit
const E_END = [-2.1, 0, 7.0] // and Emmy
const C_LAND = [1.7, 0, 5.2] // where the Commutator lands
const RIBBON_FROM = [16, 14, -6]
// Gyroid's progress up the stair (0 at the bottom, 1 at the top edge), then onto the floor
const gU = (t) => mix(0.18, 1, smooth(seg(t, 6.5, 14.6)))
const eU = (t) => mix(0.14, 1, smooth(seg(t, 6.5, 15.0)))

const SHOTS = [
  // [t0, t1, [from pos, from look], [to pos, to look]]  (null = tracking shot)
  [0, 6.5, [[10, 1.4, 17], [0, 3.6, -6]], [[7.5, 2.2, 13], [0, 4.6, -7]]],
  [6.5, 14, null, null],
  [14, 17, [[1.8, 2.4, 13.5], [0, 3.2, -6]], [[1.2, 2.2, 10.5], [0, 3.6, -7]]],
  [17, 23, [[2.6, 2.0, 1.6], [0, 3.3, -7.3]], [[1.6, 2.2, 0.2], [0, 3.5, -7.3]]],
  [23, 25.5, [[-1.4, 1.6, 2.8], [-1.0, 1.2, 6.4]], [[-1.0, 1.5, 3.2], [-1.0, 1.2, 6.4]]],
  [25.5, 27.7, [[0.5, 0.8, 3.0], [0, 4.6, -7.3]], [[0.2, 0.6, 1.6], [0, 5.6, -7.3]]],
  [27.7, 32.7, [[6.8, 1.9, 2.2], [0.4, 1.3, 4.8]], [[5.0, 1.5, 3.0], [1.2, 1.4, 5.2]]],
  [32.7, 36.0, [[-2.2, 2.2, 1.4], [0, 3.6, -7.3]], [[-1.4, 2.6, 0.0], [0, 4.0, -7.3]]],
  [36.0, 38.6, [[-3.6, 1.6, 4.4], [-2.1, 1.3, 7.0]], [[-3.2, 1.5, 4.8], [-2.1, 1.3, 7.0]]],
  [38.6, 46, [[5.5, 1.0, 13.5], [0, 2.6, -5]], [[0, 5.5, 17], [0, 3.2, -6]]],
]

function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    if (!sh[2]) {
      // tracking beside the runners, up the stair
      const p = stairAt(Math.min(1, gU(t)))
      camera.position.set(p[0] + 7.0, p[1] + 1.6, p[2] + 8.6)
      look.set(p[0] - 1.0, p[1] + 0.4, p[2] + 0.6)
    } else {
      const k = smooth(seg(t, sh[0], sh[1]))
      camera.position.set(...mix3(sh[2][0], sh[3][0], k))
      look.set(...mix3(sh[2][1], sh[3][1], k))
    }
    // the Crown's roar shakes the frame when Null rises, and when the Commutator lands
    const shake = 0.06 * (seg(t, 25.6, 26.2) * (1 - seg(t, 27.4, 28))) + 0.12 * (seg(t, 28.3, 28.4) * (1 - seg(t, 28.4, 29)))
    camera.position.x += Math.sin(t * 61) * shake
    camera.position.y += Math.cos(t * 47) * shake
    camera.lookAt(look)
  })
  return null
}

/** The stair of Chart slabs: gold-rimmed treads that light as the runners pass. */
function ChartStair({ tRef }) {
  const mats = useRef([])
  useFrame(() => {
    const t = tRef.current
    const u = gU(t)
    mats.current.forEach((m, i) => {
      if (!m) return
      const ui = (i + 0.5) / STEPS
      m.emissiveIntensity = ui < u + 0.03 ? 1.1 : 0.25
    })
  })
  return Array.from({ length: STEPS }, (_, i) => {
    const p = stairAt((i + 0.5) / STEPS)
    return (
      <group key={i} position={[p[0], p[1] - 0.14, p[2]]} rotation={[0, (i % 2 ? 1 : -1) * 0.04, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 0.26, 1.15]} />
          <meshStandardMaterial ref={(m) => (mats.current[i] = m)} color="#2a2140" emissive="#d8a84a" emissiveIntensity={0.25} roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.14, 0.56]}>
          <boxGeometry args={[2.6, 0.04, 0.05]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
      </group>
    )
  })
}

/** Violet threads drawn up from the Way into the Crown (scene A), fading as the march begins. */
function Threads({ tRef }) {
  const mats = useRef([])
  const lines = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3
        const d = 30 + (i % 3) * 10
        const from = new THREE.Vector3(Math.cos(a) * d, -43, Math.sin(a) * d)
        const to = new THREE.Vector3(...CROWN_HOME)
        const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(Math.cos(a + 1) * 6, 6, Math.sin(a + 1) * 6))
        return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), 48, 0.12, 6, false)
      }),
    [],
  )
  useFrame(() => {
    const t = tRef.current
    const k = 1 - seg(t, 8, 11) + seg(t, 25.8, 27)
    mats.current.forEach((m, i) => m && (m.opacity = Math.min(0.7, k) * (0.55 + 0.45 * Math.sin(t * 4 + i))))
  })
  return lines.map((g, i) => (
    <mesh key={i} geometry={g}>
      <meshBasicMaterial ref={(m) => (mats.current[i] = m)} color="#b07aff" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  ))
}

/** The Commutator's arrival: a violet ribbon streaking down from the sky to where he lands. */
function Ribbon({ tRef }) {
  const mesh = useRef()
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...RIBBON_FROM)
    const b = new THREE.Vector3(C_LAND[0], 1.0, C_LAND[2])
    const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3(-3, 5, 4))
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 80, 0.14, 8, false)
  }, [])
  useFrame(() => {
    const t = tRef.current
    const draw = seg(t, 27.6, 28.4)
    const fade = 1 - seg(t, 28.6, 30.5)
    mesh.current.visible = draw > 0 && fade > 0
    mesh.current.geometry.setDrawRange(0, Math.floor(draw * geo.index.count / 3) * 3)
    mesh.current.material.opacity = 0.9 * fade
  })
  return (
    <mesh ref={mesh} geometry={geo}>
      <meshBasicMaterial color="#c98aff" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  )
}

export default function CastleIntro4({ tRef }) {
  const crownRef = useRef({ broken: 0, low: 0, shatter: 0, fury: 0.6, beam: 1 })
  const furyRef = useRef(0.6)
  const dimRef = useRef(0)
  const landFlash = useRef(0)
  const riseFlash = useRef(0)
  const nullG = useRef()
  const shardG = useRef([])
  const shards = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: 0, z: 0, seed: i * 1.7, alive: true, dying: 0, face: 0, flash: 0, hp: 1, maxHp: 1 })), [])
  useFrame(() => {
    const t = tRef.current
    const c = crownRef.current
    c.beam = (1 - seg(t, 7, 9)) + seg(t, 25.8, 26.4) * (1 - seg(t, 28.2, 28.6))
    c.fury = 0.6 + 0.4 * seg(t, 22.4, 26.2)
    furyRef.current = c.fury
    dimRef.current = 0.3 * (1 - seg(t, 7, 9)) + 0.6 * seg(t, 25.8, 27.5)
    nullG.current.position.y = 0.42 + smooth(seg(t, 25.8, 27.4)) * 1.4 + Math.sin(t * 1.4) * 0.06 * seg(t, 26, 27)
    landFlash.current = t < 28.4 ? 0 : Math.max(0, 1 - (t - 28.4) / 0.9)
    riseFlash.current = seg(t, 25.8, 26.2) * (1 - seg(t, 26.2, 27.2)) * 0.6
    // shards: orbit Null, then dive at the pair; cut apart when the Commutator lands
    shards.forEach((e, i) => {
      const a = t * 1.5 + (i / 6) * Math.PI * 2
      const ox = NULL_AT[0] + Math.cos(a) * 2.8
      const oz = NULL_AT[1] + Math.sin(a) * 2.8
      const dive = smooth(seg(t, 27.0 + i * 0.05, 28.4))
      const tx = -0.4 + (i - 2.5) * 0.7
      const tz = 4.0
      e.x = mix(ox, tx, dive)
      e.z = mix(oz, tz, dive)
      e.face = dive > 0 ? Math.atan2(tx - ox, tz - oz) : a + Math.PI / 2
      const g = shardG.current[i]
      if (g) {
        // cut apart as the Commutator lands: they flare, spin and shrink away
        const cut = seg(t, 28.4 + i * 0.04, 29.0 + i * 0.04)
        g.visible = t > 23.2 && cut < 1
        g.position.y = 1.6 * (1 - dive) + cut * 0.8
        // (the shard's own dying ramp: its dieTime is 0.4, so dying 0.4 → 0 shrinks it to nothing)
        e.alive = cut === 0
        e.dying = cut > 0 ? Math.max(0.001, 0.4 * (1 - cut)) : 0
        if (cut > 0) e.face += cut * 6
      }
    })
  })
  const gyroScript = () => {
    const t = tRef.current
    if (t < 14.6) {
      const p = stairAt(Math.min(1, gU(t)))
      return { pos: [(p[0] - 0.5) / S, p[1] / S, p[2] / S], rotY: Math.PI, run: t < 6.5 ? 0 : 1, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    const k = smooth(seg(t, 14.6, 16.4))
    const p = mix3(R1, G_END, k)
    const whip = t > 27.6 && t < 28.6 ? seg(t, 27.6, 28.4) : 0
    return { pos: [(p[0] - 0.5 * (1 - k)) / S, 0, p[2] / S], rotY: Math.PI, run: k > 0 && k < 1 ? 0.8 : 0, cast: t > 23 && t < 27.6 ? 0.6 : 0, whip, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    if (t < 15.4) {
      const p = stairAt(Math.min(1, eU(t)))
      return { pos: [(p[0] - 1.6) / S, p[1] / S, (p[2] + 0.9) / S], rotY: Math.PI, walk: t < 6.5 ? 0 : 1, gesture: 0, bow: 0, talk: t > 7 && t < 10.2 ? 1 : 0 }
    }
    const k = smooth(seg(t, 15.4, 17.2))
    const p = mix3([R1[0] - 1.6, 0, R1[2] + 0.9], E_END, k)
    return { pos: [p[0] / S, 0, p[2] / S], rotY: Math.PI - 0.15, walk: k > 0 && k < 1 ? 1 : 0, gesture: t > 36 ? 0.8 : 0.1, bow: 0, talk: t > 36 && t < 38.6 ? 1 : 0 }
  }
  const nullScript = () => {
    const t = tRef.current
    const talking = (t > 14.6 && t < 22.6) || (t > 25.6 && t < 27.6) || (t > 32.8 && t < 35.8)
    return { gesture: talking || (t > 25.8 && t < 28.4) ? 1 : 0.25, crown: 0.6 + 0.4 * seg(t, 22.4, 26), crownY: 0 }
  }
  const comScript = () => {
    const t = tRef.current
    const lunge = t > 28.4 && t < 29.0 ? 1 - seg(t, 28.4, 29.0) : t > 31.6 && t < 38.6 ? 0.55 : 0
    return { visible: t >= 28.35, pos: C_LAND, rotY: t < 29.2 ? Math.PI : Math.PI + 0.12, lunge, walk: 0, glow: t > 28.4 && t < 29.2 ? 1 : 0.3 }
  }
  return (
    <>
      <Summit furyRef={furyRef} dimRef={dimRef} rocksCenter={[0, -4, -42]} rocksRadius={[26, 44]} />
      <pointLight position={[0, 3.2, -3.5]} intensity={14} distance={10} color="#e8d8ff" />
      <ChartStair tRef={tRef} />
      <Threads tRef={tRef} />
      <Ribbon tRef={tRef} />
      <group position={[NULL_AT[0], 0, NULL_AT[1]]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[2.1, 2.3, 0.4, 6]} />
          <meshStandardMaterial color="#120e1a" roughness={0.2} metalness={0.6} flatShading />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[1.5, 1.7, 0.2, 6]} />
          <meshStandardMaterial color="#1a1426" roughness={0.2} metalness={0.6} flatShading />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.9, 2.4, -1.5]} rotation={[0, 0, s * -0.12]}>
            <boxGeometry args={[0.45, 4.6, 0.3]} />
            <meshStandardMaterial color="#0e0b13" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
      </group>
      <Crown stateRef={crownRef} scale={1.25} />
      <group ref={nullG} position={[NULL_AT[0], 0.42, NULL_AT[1]]}>
        <group scale={0.85}>
          <CountNull script={nullScript} />
        </group>
      </group>
      {shards.map((e, i) => (
        <group key={i} ref={(g) => (shardG.current[i] = g)}>
          <ShardSpawn e={e} />
        </group>
      ))}
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <group scale={0.95}>
        <Commutator script={() => ({ ...comScript(), pos: C_LAND.map((v) => v / 0.95) })} />
      </group>
      <Flash position={[C_LAND[0], 1.2, C_LAND[2]]} kRef={landFlash} size={9} color="#e8b8ff" />
      {shards.map((e, i) => (
        <Flash key={i} position={[-0.4 + (i - 2.5) * 0.7, 1.1, 4.0]} kRef={() => { const t = tRef.current; const k = seg(t, 28.4 + i * 0.04, 29.0 + i * 0.04); return k > 0 && k < 1 ? Math.sin(Math.PI * k) * 0.9 : 0 }} size={2.6} color="#ff9ae8" />
      ))}
      <pointLight position={[C_LAND[0] + 0.6, 2.2, C_LAND[2] - 2.2]} intensity={6} distance={6} color="#ffd8f0" />
      <Flash position={[NULL_AT[0], 4.5, NULL_AT[1]]} kRef={riseFlash} size={26} color="#c08aff" />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.74} />
      </EffectComposer>
    </>
  )
}
