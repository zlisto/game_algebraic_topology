import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../characters/CountNull'
import Emmy from '../characters/Emmy'
import Gyroid from '../characters/Gyroid'
import { LiveLine } from '../levels/w0/FlatsScenery'
import { DevAdvance } from '../levels/w0/OverworldScene'
import { NULL_AT } from '../levels/w0/stagesCastle'
import CastleSet, { TOP } from './CastleSet'

/**
 * Outro movie for World 0 · Castle, "A Ring Is a Ring" (videos.json castle-0-outro):
 *   A  0–8    the arena still; Null lifts a glowing ring
 *   B  8–16   on the floor, a loop round a hole tries to shrink — every slide stops at the hole
 *   H1 16–19  Null raises the Crown at the spire's edge; its beam lances out across the sea
 *   H2 19–25  Haven Ring, far off on the water: lit windows go violet; ring → ball → point → flash
 *   H3 25–28.5 Gyroid runs to the edge: horror
 *   H4 28.5–31 Emmy, far below at the bridgehead, devastated
 *   C  31–37  Null taunts, steps back off the spire onto a violet ribbon racing north
 *   D  37–45  dawn at the bridgehead: grief turns to resolve
 *   E  45–51  “World 0 complete”
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const HOLE = [0, -1.5] // the hole on the arena floor (B)
const EDGE = [NULL_AT[0] + 0.5, NULL_AT[1] - 1.8] // where Null steps off
const HAVEN = [-34, -1.9, -46] // Haven Ring, far off on the sea to the north-west
const HAVEN_SIZE = 2.6
const G_EDGE = [EDGE[0] - 1.6, EDGE[1] + 1.4] // where Gyroid runs to, at the rim, looking out at Haven
const TO_HAVEN = (() => {
  const dx = HAVEN[0] - G_EDGE[0]
  const dz = HAVEN[2] - G_EDGE[1]
  const l = Math.hypot(dx, dz)
  return [dx / l, dz / l]
})()
const CROWN_TIP = [NULL_AT[0], TOP + 3.0, NULL_AT[1]]
// Haven's fall: torus → ball (hole closes) → point (hangs) → flash
const havenFall = (t) => {
  const k = smooth(seg(t, 21.4, 23.3))
  return {
    corrupt: seg(t, 19.6, 22),
    R: 3 * (1 - k),
    r: mix(0.75, 1.9, k),
    shrink: t < 25.0 ? 1 - smooth(seg(t, 23.4, 24.1)) * 0.95 : 0, // the point hangs 24.1–25
    point: seg(t, 23.8, 24.1),
    flash: seg(t, 25.0, 25.7),
    beam: seg(t, 17.2, 17.7) * (1 - seg(t, 24.8, 25.0)),
  }
}
const WHITE = new THREE.Color('#ffffff')
const STONE = new THREE.Color('#3a4250')
const VIOLET = new THREE.Color('#8a3cff')
const LILAC = new THREE.Color('#b99cff')
const GLOW = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(240,225,255,0.85)')
  r.addColorStop(0.5, 'rgba(180,140,255,0.25)')
  r.addColorStop(1, 'rgba(120,80,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

/** Haven Ring: the guild island — lit windows, a beacon, its roads — until the Crown folds it to a point. */
function HavenRing({ tRef }) {
  const group = useRef()
  const mat = useRef()
  const windows = useRef()
  const flash = useRef()
  const scar = useRef()
  const houses = useRef()
  const beacon = useRef()
  const SEG_U = 72
  const SEG_V = 24
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.3, SEG_V, SEG_U), [])
  useFrame(() => {
    const t = tRef.current
    const s = havenFall(t)
    const pos = geo.attributes.position
    const nor = geo.attributes.normal
    const squash = 0.55 + 0.45 * s.corrupt
    for (let j = 0; j <= SEG_V; j++) {
      const v = (j / SEG_V) * Math.PI * 2
      for (let i = 0; i <= SEG_U; i++) {
        const u = (i / SEG_U) * Math.PI * 2
        const idx = j * (SEG_U + 1) + i
        const w = s.R + s.r * Math.cos(v)
        pos.setXYZ(idx, w * Math.cos(u), s.r * Math.sin(v) * squash, w * Math.sin(u))
        nor.setXYZ(idx, Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u))
      }
    }
    pos.needsUpdate = true
    nor.needsUpdate = true
    geo.computeBoundingSphere()
    group.current.visible = s.shrink > 0.001
    group.current.scale.setScalar(HAVEN_SIZE * Math.max(0.0001, s.shrink))
    group.current.position.y = HAVEN[1] + 0.4 + s.corrupt * 2.2
    group.current.rotation.y = t * 0.06
    mat.current.color.copy(STONE).lerp(LILAC, s.corrupt * 0.6).lerp(WHITE, s.point)
    mat.current.emissive.copy(STONE).lerp(VIOLET, s.corrupt).lerp(WHITE, s.point)
    mat.current.emissiveIntensity = 0.15 + s.corrupt * 0.15 + Math.max(0, Math.sin(t * 22)) * 0.12 * s.corrupt + s.point * 6
    windows.current.children.forEach((w, i) => {
      const a = (i / windows.current.children.length) * Math.PI * 2
      const rr = s.R + (i % 2 ? 0.3 : -0.3) * s.r
      w.position.set(Math.cos(a) * rr, s.r * 0.5, Math.sin(a) * rr)
      w.rotation.y = -a
      // the lights go out one by one as the violet takes them
      w.visible = s.corrupt < (i % 7) / 7 + 0.05
    })
    houses.current.children.forEach((h, i) => {
      const a = (i / houses.current.children.length) * Math.PI * 2 + 0.3
      const sink = Math.max(0.001, 1 - s.corrupt * 1.4)
      h.position.set(Math.cos(a) * s.R, s.r * 0.5 + 0.25 * sink - 0.1, Math.sin(a) * s.R)
      h.rotation.y = -a
      h.scale.set(1, sink, 1)
    })
    beacon.current.position.set(0, s.r * 0.5 + 0.7, -s.R)
    beacon.current.visible = s.corrupt < 0.7
    const f = s.flash
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(2 + (1 - (1 - f) ** 3) * 26)
    flash.current.material.opacity = (1 - f) ** 2
    // afterwards: a slow violet whirl on the empty water
    const k = seg(t, 25.2, 26.4)
    scar.current.visible = k > 0
    scar.current.rotation.z = -t * 0.5
    for (const m of scar.current.children) m.material.opacity = 0.5 * k
  })
  const arms = useMemo(
    () =>
      [0, 1, 2, 3].map((j) => {
        const pts = Array.from({ length: 40 }, (_, i) => {
          const u = i / 39
          const a = j * (Math.PI / 2) + u * Math.PI * 1.6
          const r = 0.6 + u * 8
          return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
        })
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.12, 4, false)
      }),
    [],
  )
  return (
    <group position={[HAVEN[0], 0, HAVEN[2]]}>
      <group ref={group}>
        <mesh geometry={geo}>
          <meshStandardMaterial ref={mat} color="#3a4250" roughness={0.55} metalness={0.15} emissive="#3a4250" emissiveIntensity={0.15} />
        </mesh>
        <group ref={windows}>
          {Array.from({ length: 28 }, (_, i) => (
            <mesh key={i}>
              <boxGeometry args={[0.12, 0.09, 0.04]} />
              <meshBasicMaterial color="#ffb860" toneMapped={false} />
            </mesh>
          ))}
        </group>
        {/* the guild's houses, sinking as the violet takes them */}
        <group ref={houses}>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i}>
              <boxGeometry args={[0.32, 0.5, 0.28]} />
              <meshStandardMaterial color="#5a5048" roughness={0.7} emissive="#ffb860" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
        {/* the guild beacon */}
        <mesh ref={beacon} position={[0, 0.9, -3]}>
          <cylinderGeometry args={[0.06, 0.12, 1.4, 6]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
      <sprite ref={flash} position={[0, 2.4, 0]}>
        <spriteMaterial map={GLOW} color="#f4e8ff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={scar} position={[0, -2.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {arms.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshBasicMaterial color="#9a5cff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 4, 0]} color="#c8a8ff" intensity={0} distance={40} />
    </group>
  )
}

/** The Crown's beam, from the crown tip across the sea to Haven. */
function CrownBeam({ tRef }) {
  const ref = useRef()
  const from = useMemo(() => new THREE.Vector3(...CROWN_TIP), [])
  const to = useMemo(() => new THREE.Vector3(HAVEN[0], HAVEN[1] + 2.4, HAVEN[2]), [])
  const { mid, quat, len } = useMemo(() => {
    const d = to.clone().sub(from)
    return { mid: from.clone().add(to).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len: d.length() }
  }, [from, to])
  useFrame(() => {
    const t = tRef.current
    const b = havenFall(t).beam
    ref.current.visible = b > 0.01
    const w = b * (0.7 + Math.sin(t * 40) * 0.3)
    ref.current.scale.set(w, 1, w)
  })
  return (
    <mesh ref={ref} position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.18, 0.5, len, 12, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

const SHOTS = [
  [0, 8, [[1.2, TOP + 2.2, NULL_AT[1] + 4.2], [NULL_AT[0], TOP + 2.0, NULL_AT[1]]], [[0.6, TOP + 2.1, NULL_AT[1] + 3.4], [NULL_AT[0], TOP + 2.2, NULL_AT[1]]]],
  [8, 16, [[0, TOP + 5.5, HOLE[1] + 5.5], [HOLE[0], TOP, HOLE[1]]], [[1, TOP + 4.6, HOLE[1] + 4.4], [HOLE[0], TOP, HOLE[1]]]],
  // H1: over Null's shoulder as the Crown takes aim at Haven, far off on the water
  // (aimed left of Haven, so it sits clear in the right third of the frame)
  [16, 19, [[NULL_AT[0] + 2.6, TOP + 3.4, NULL_AT[1] + 4.5], [-28, TOP - 8, -20]], [[NULL_AT[0] + 1.8, TOP + 3.8, NULL_AT[1] + 3.6], [-44, TOP - 18, -34]]],
  // H2: Haven Ring on the sea, as it folds
  [19, 26.4, [[HAVEN[0] + 26, 9, HAVEN[2] + 30], [HAVEN[0], 0.6, HAVEN[2]]], [[HAVEN[0] + 19, 7, HAVEN[2] + 22], [HAVEN[0], 1.2, HAVEN[2]]]],
  // H3: Gyroid at the rim, from out over the void, facing him
  [26.4, 28.5, [[G_EDGE[0] + TO_HAVEN[0] * 4.2, TOP + 2.0, G_EDGE[1] + TO_HAVEN[1] * 4.2], [G_EDGE[0], TOP + 1.0, G_EDGE[1]]], [[G_EDGE[0] + TO_HAVEN[0] * 2.6, TOP + 1.5, G_EDGE[1] + TO_HAVEN[1] * 2.6], [G_EDGE[0], TOP + 1.1, G_EDGE[1]]]],
  // H4: Emmy, far below at the bridgehead
  [28.5, 31, [[-1.9, 1.75, 24.3], [-0.8, 1.05, 26.4]], [[-1.5, 1.7, 24.9], [-0.8, 1.05, 26.4]]], // close on her face, above the caption
  // C: Null steps off the spire and is carried away north
  // C: close on Null for the taunt, then wide as he steps off the spire
  [31, 33.8, [[NULL_AT[0] + 0.9, TOP + 2.4, NULL_AT[1] + 3.4], [NULL_AT[0], TOP + 2.1, NULL_AT[1]]], [[NULL_AT[0] + 0.6, TOP + 2.3, NULL_AT[1] + 2.6], [NULL_AT[0], TOP + 2.2, NULL_AT[1]]]],
  [33.8, 37, [[4, TOP + 3, 2], [EDGE[0], TOP + 1.5, EDGE[1]]], [[6, TOP + 5, 8], [0, TOP + 4, -40]]],
  // D: the two of them at dawn, from in front; then close on Gyroid for his vow
  [37, 41.6, [[0.2, 1.5, 23.4], [0.05, 1.0, 26.5]], [[0.1, 1.4, 23.9], [0.05, 1.0, 26.5]]],
  [41.6, 45, [[0.75, 1.25, 25.0], [0.9, 1.05, 26.6]], [[0.8, 1.2, 25.4], [0.9, 1.1, 26.6]]],
  [45, 53, [[0, 6, 36], [0, 6, -10]], [[0, 7, 38], [0, 7, -10]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(from[0], to[0], k))
    const shake = seg(t, 25.0, 25.2) * (1 - seg(t, 25.2, 26.2)) * 0.6 + seg(t, 26.4, 26.7) * (1 - seg(t, 26.7, 27.8)) * 0.08
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake))
    look.set(...mix3(from[1], to[1], k))
    camera.lookAt(look)
  })
  return null
}

export default function CastleOutro({ tRef }) {
  const ring = useRef()
  const nullG = useRef()
  const dawn = useRef()
  const sun = useRef()
  // B: the loop round the hole: it shrinks toward the hole and stalls at its rim, again and again
  const loopPts = () => {
    const t = tRef.current
    if (t < 8 || t > 16.2) return null
    const u = ((t - 8) % 2.6) / 2.6
    const r = 0.62 + 1.1 * (1 - Math.sin(Math.PI * Math.min(1, u * 1.4)))
    const wob = 0.12 * Math.sin(t * 3)
    return Array.from({ length: 49 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2
      const rr = r + wob * Math.sin(3 * a)
      return [HOLE[0] + rr * Math.cos(a), HOLE[1] + rr * Math.sin(a), TOP + 0.12]
    })
  }
  // C: Null's ribbon of light, racing north
  const ribbon = () => {
    const t = tRef.current
    if (t < 35 || t > 37) return null
    const k = seg(t, 35, 36.8)
    const n = 40
    return Array.from({ length: n }, (_, i) => {
      const s = (i / (n - 1)) * k
      return [EDGE[0] + Math.sin(s * 3) * 3, EDGE[1] - s * 60, TOP + 0.5 + s * 6 + Math.sin(s * 8) * 0.6]
    })
  }
  useFrame(() => {
    const t = tRef.current
    ring.current.visible = t > 1.5 && t < 16.2
    ring.current.rotation.y = t * 0.9
    // C: Null walks back off the edge and is carried away
    const back = smooth(seg(t, 33.8, 35))
    const fly = smooth(seg(t, 35, 36.8))
    const x = mix(NULL_AT[0], EDGE[0], back) + Math.sin(fly * 3) * 3
    const z = mix(NULL_AT[1], EDGE[1], back) - fly * 60
    nullG.current.position.set(x, TOP + 0.3 + fly * 6, z)
    nullG.current.visible = t < 36.8
    // he turns from the ring to face Haven while the Crown fires
    nullG.current.rotation.y = t > 16 && t < 31 ? Math.atan2(HAVEN[0] - NULL_AT[0], HAVEN[2] - NULL_AT[1]) : 0
    dawn.current.intensity = t > 37 ? 2.2 : 0
    sun.current.visible = t > 37
    sun.current.position.y = 2 + seg(t, 37, 45) * 5
  })
  const nullScript = () => {
    const t = tRef.current
    return { gesture: t < 16 || (t > 16.6 && t < 24.6) ? 1 : t > 31 ? 0.5 : 0.3, crown: 1, crownY: 0 }
  }
  const gyroScript = () => {
    const t = tRef.current
    if (t >= 37) return { pos: [0.9 / S, 0, 26.6 / S], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    const home = [HOLE[0] + 1.6, HOLE[1] + 2.4]
    if (t < 25.4) return { pos: [home[0] / S, TOP / S, home[1] / S], rotY: Math.PI + 0.5, run: 0, cast: t > 8 && t < 16 ? 0.8 : 0, whip: 0, loop: 0, loopDrop: 0 }
    // the flash: he runs to the rim and stops dead, staring out at where his home was
    const k = smooth(seg(t, 25.4, 26.6))
    const facing = Math.atan2(TO_HAVEN[0], TO_HAVEN[1])
    return { pos: [mix(home[0], G_EDGE[0], k) / S, TOP / S, mix(home[1], G_EDGE[1], k) / S], rotY: facing, run: k > 0 && k < 1 ? 1 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    // H4: she sees the flash on the horizon and crumples; D: she steadies, then talks
    const grief = t > 28.5 && t < 37 ? 1 : 0
    return { pos: [-0.8 / S, 0, 26.4 / S], rotY: Math.PI + (grief ? 0.35 : 0), walk: 0, bow: grief ? 1 : 0, gesture: t > 37.4 ? 0.6 : grief ? 1 : 0, talk: (t > 28.6 && t < 31) || (t > 37.4 && t < 41.6) ? 1 : 0 }
  }
  return (
    <>
      <CastleSet />
      <mesh ref={sun} position={[-25, 3, -70]}>
        <sphereGeometry args={[6, 32, 20]} />
        <meshBasicMaterial color="#ffb070" toneMapped={false} />
      </mesh>
      <directionalLight ref={dawn} position={[30, 8, -20]} color="#ffb88a" intensity={0} />
      <group ref={nullG} scale={0.8}>
        <CountNull script={nullScript} />
        <group ref={ring} position={[0.45, 2.1, 0.5]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.32, 0.04, 10, 40]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* B: a hole in the arena floor, and a loop that won't shrink past it */}
      <mesh position={[HOLE[0], TOP + 0.08, HOLE[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 40]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <HavenRing tRef={tRef} />
      <CrownBeam tRef={tRef} />
      <LiveLine getPts={loopPts} color="#ffd27a" width={7} />
      <LiveLine getPts={ribbon} color="#c58bff" width={10} />
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
