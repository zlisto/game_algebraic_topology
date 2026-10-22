import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAND } from '../../theme/palette'
import { Clouds } from '../../world/Dressing'
import ReefScenery, { CausewaySlab } from '../../world/ReefScenery'
import { LiveLine } from '../../levels/w0/FlatsScenery'

/**
 * The whole Winding World, for the ending movie and the credits fly-over. Every place the
 * Crown folded hangs as a white point until its time `t0` (story seconds, read from tRef);
 * then a Crown shard strikes it and it blooms back: point → ball → shape, hole and all.
 * The credits pass a tRef far past the end, so everything stands restored at sunrise.
 *
 * Map (x east, z south): Retract Reef in the middle (the intro's layout, Ringed Isle at the
 * origin), Haven Ring and its quay to the west, Bouquet Bastion north-west, the Delta's sphere
 * north-east, the torus and its twin south-east, the Cup Product Gardens south, and the
 * Postnikov Spire — where the Crown broke — far to the north.
 */

export const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
export const smooth = (x) => x * x * (3 - 2 * x)
export const mix = (a, b, k) => a + (b - a) * k
export const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
const elastic = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 2 ** (-9 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1)

// ---------------------------------------------------------------- the map

export const SUMMIT = [0, -88] // the Postnikov Spire
export const TOPY = 26 // its summit floor
export const NULL_AT = [SUMMIT[0], TOPY, SUMMIT[1] - 2.2] // where Null stands when the Crown breaks
export const HAVEN = [-47, 20]
export const QUAY = [-37, 20] // Haven's harbour, where the Chart is delivered
export const QY = 0.3
export const DAWN = [44, 56] // night → sunrise (story seconds)

/** The places the Crown folded, in the order they come home. `at`: where the point hangs. */
export const PLACES = [
  { id: 'reef', name: 'Retract Reef & the Ringed Isle', math: 'Homotopy and deformation retraction: the walkways bend back off their spines', t0: 29.6, at: [0, 3, 0] },
  { id: 'haven', name: 'Haven Ring', math: 'π₁(S¹) ≅ ℤ: the winding number proves a ring is not a point', t0: 32.2, at: [HAVEN[0], 3, HAVEN[1]] },
  { id: 'bastion', name: 'Bouquet Bastion', math: 'π₁ of a wedge of circles is a free group', t0: 37.4, at: [-54, 3, -38] },
  { id: 'delta', name: 'The Delta’s Sphere', math: 'H₂(S²) ≅ ℤ: a hollow that loops can’t see, but homology can', t0: 40.4, at: [52, 5, -32] },
  { id: 'torus', name: 'The Torus and its Twin', math: 'Same homology as S¹ ∨ S¹ ∨ S², different cup products: not the same space', t0: 43.4, at: [44, 3, 28] },
  { id: 'gardens', name: 'The Cup Product Gardens', math: 'Cohomology rings: classes multiply', t0: 46.6, at: [-6, 3, 44] },
]
export const PLACE = Object.fromEntries(PLACES.map((p) => [p.id, p]))
export const SPIRE_LIGHT = [48.6, 51] // the Spire's floors relight, bottom to top

const WHITE = new THREE.Color('#ffffff')
const STONE = new THREE.Color(LAND.stone)
const GOLD = new THREE.Color('#ffd27a')
const VIOLET = new THREE.Color('#8a3cff')

export const GLOW = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(255,240,220,0.85)')
  r.addColorStop(0.5, 'rgba(255,200,140,0.22)')
  r.addColorStop(1, 'rgba(255,160,80,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

// ---------------------------------------------------------------- sky, sea, light

const SKY = {
  night: { top: '#02040c', hor: '#0d1830', bot: '#04070f' },
  pre: { top: '#14183a', hor: '#a05478', bot: '#0d0e1c' },
  dawn: { top: '#3d6aa8', hor: '#ffb784', bot: '#1d2438' },
}
const C = (h) => new THREE.Color(h)
const SKYC = Object.fromEntries(Object.entries(SKY).map(([k, v]) => [k, { top: C(v.top), hor: C(v.hor), bot: C(v.bot) }]))
export const dawnAt = (t) => seg(t, DAWN[0], DAWN[1])
export const sunDir = (t, out = new THREE.Vector3()) => {
  const e = mix(-0.1, 0.2, seg(t, DAWN[0], DAWN[1] + 10))
  return out.set(Math.cos(e) * 0.9, Math.sin(e), Math.cos(e) * 0.42).normalize()
}

function Sky({ tRef }) {
  const mesh = useRef()
  const sun = useRef()
  const { camera, scene } = useThree()
  const uni = useMemo(() => ({ top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sun: { value: new THREE.Vector3() }, sunAmt: { value: 0 } }), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const a = seg(t, DAWN[0], DAWN[0] + 5)
    const b = seg(t, DAWN[0] + 5, DAWN[1])
    for (const k of ['top', 'hor', 'bot']) uni[k].value.copy(SKYC.night[k]).lerp(SKYC.pre[k], a).lerp(SKYC.dawn[k], b)
    sunDir(t, uni.sun.value)
    uni.sunAmt.value = a
    mesh.current.position.copy(camera.position)
    if (scene.fog) scene.fog.color.copy(uni.hor.value).multiplyScalar(0.55)
    const d = sunDir(t, v)
    sun.current.position.copy(camera.position).addScaledVector(d, 170)
    sun.current.visible = a > 0
    sun.current.material.opacity = a
  })
  return (
    <>
      <mesh ref={mesh} renderOrder={-2}>
        <sphereGeometry args={[190, 32, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={uni}
          vertexShader={'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={
            'uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sun; uniform float sunAmt; varying vec3 vDir;' +
            'void main(){ float h = vDir.y; vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h,0.0,1.0), 0.45)) : mix(hor, bot, clamp(-h*5.0,0.0,1.0));' +
            ' float s = max(dot(normalize(vDir), normalize(sun)), 0.0); c += vec3(1.0,0.72,0.45) * (pow(s, 6.0) * 0.35 + pow(s, 60.0) * 0.6) * sunAmt;' +
            ' gl_FragColor = vec4(c, 1.0); }'
          }
        />
      </mesh>
      <sprite ref={sun} scale={[22, 22, 1]} renderOrder={-1}>
        <spriteMaterial map={GLOW} color="#ffd9a8" transparent opacity={0} depthWrite={false} fog={false} toneMapped={false} />
      </sprite>
    </>
  )
}

function Lights({ tRef }) {
  const amb = useRef()
  const key = useRef()
  const hemi = useRef()
  const night = useMemo(() => new THREE.Color('#cfe0f4'), [])
  const day = useMemo(() => new THREE.Color('#ffd2a6'), [])
  const sea = useRef()
  const seaNight = useMemo(() => new THREE.Color('#06343a'), [])
  const seaDay = useMemo(() => new THREE.Color('#3a5a78'), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const d = dawnAt(t)
    amb.current.intensity = mix(0.25, 0.5, d)
    hemi.current.intensity = mix(0.5, 0.8, d)
    key.current.color.copy(night).lerp(day, d)
    key.current.intensity = mix(1.0, 2.0, d)
    const s = sunDir(t, v)
    if (d > 0.3) key.current.position.set(s.x * 60, Math.max(8, s.y * 60), s.z * 60)
    else key.current.position.set(10, 18, 12)
    sea.current.emissive.copy(seaNight).lerp(seaDay, d)
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.25} />
      <hemisphereLight ref={hemi} args={['#4a7fa8', '#0a0a14', 0.5]} />
      <directionalLight ref={key} position={[10, 18, 12]} intensity={1.1} color="#cfe8f4" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial ref={sea} color="#04161a" emissive="#06343a" emissiveIntensity={0.4} roughness={0.22} metalness={0.6} />
      </mesh>
    </>
  )
}

function NightStars({ tRef }) {
  const g = useRef()
  useFrame(() => {
    g.current.visible = dawnAt(tRef.current) < 0.55
  })
  return (
    <group ref={g}>
      <Stars radius={120} depth={40} count={2500} factor={4} fade speed={0.4} />
    </group>
  )
}

// ---------------------------------------------------------------- a folded place: the hanging point, then the bloom

/** The white point a place was folded to, hanging over the water until its shard strikes. */
function HangingPoint({ tRef, at, t0 }) {
  const g = useRef()
  const glow = useRef()
  const flash = useRef()
  const wave = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 3 + at[0]) * 0.15
    g.current.visible = t < t0
    glow.current.scale.setScalar(2.2 * pulse)
    // the strike: a gold flash, and a shock ring running out over the water
    const f = seg(t, t0, t0 + 0.9)
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(2 + (1 - (1 - f) ** 3) * 22)
    flash.current.material.opacity = (1 - f) ** 2
    const w = seg(t, t0, t0 + 2.6)
    wave.current.visible = w > 0 && w < 1
    wave.current.scale.setScalar(0.5 + w * 22)
    wave.current.material.opacity = 0.7 * (1 - w)
  })
  return (
    <group>
      <group ref={g} position={at}>
        <mesh>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <sprite ref={glow}>
          <spriteMaterial map={GLOW} color="#efe4ff" transparent opacity={0.9} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <sprite ref={flash} position={at}>
        <spriteMaterial map={GLOW} color="#fff1cf" transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={wave} position={[at[0], -0.5, at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1, 64]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Scale-from-a-point bloom for any group: hidden before t0, then springs out of the point. */
function Bloom({ tRef, t0, at, base = [at[0], 0, at[2]], children, dur = 1.6 }) {
  const g = useRef()
  useFrame(() => {
    const t = tRef.current
    const k = elastic(seg(t, t0 + 0.1, t0 + 0.1 + dur))
    g.current.visible = t >= t0 + 0.1
    g.current.scale.setScalar(Math.max(0.0001, k))
    // rises from where the point hung, settling onto the water
    const lift = 1 - smooth(seg(t, t0 + 0.1, t0 + 0.1 + dur))
    g.current.position.set(mix(base[0], at[0], lift), mix(base[1], at[1], lift), mix(base[2], at[2], lift))
  })
  return <group ref={g}>{children}</group>
}

/**
 * A ring island coming home: the reverse of the Crown's fold. point → ball (it swells out of the
 * point) → the hole opens and the ball flattens back into a ring → its windows and beacons relight.
 */
function RingHome({ tRef, t0, pos, R = 3, r = 0.7, windows = 22, beacons = 8, size = 1, lift = 3 }) {
  const group = useRef()
  const mat = useRef()
  const win = useRef()
  const bea = useRef()
  const last = useRef(-1)
  const SEG_U = 96
  const SEG_V = 28
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.3, SEG_V, SEG_U), [])
  const ball = (R + r) * 0.62
  useFrame(() => {
    const t = tRef.current
    const grow = smooth(seg(t, t0 + 0.05, t0 + 0.7))
    const open = smooth(seg(t, t0 + 0.7, t0 + 1.9))
    const warm = seg(t, t0 + 0.3, t0 + 2.0)
    group.current.visible = t >= t0
    group.current.scale.setScalar(size * Math.max(0.0001, 0.04 + 0.96 * grow))
    group.current.position.set(pos[0], pos[1] + lift * (1 - open), pos[2])
    const key = Math.round(open * 400)
    if (key !== last.current) {
      last.current = key
      const RR = R * open
      const rr = mix(ball, r, open)
      const squash = mix(1, 0.55, open)
      const p = geo.attributes.position
      const n = geo.attributes.normal
      for (let j = 0; j <= SEG_V; j++) {
        const v = (j / SEG_V) * Math.PI * 2
        for (let i = 0; i <= SEG_U; i++) {
          const u = (i / SEG_U) * Math.PI * 2
          const idx = j * (SEG_U + 1) + i
          const w = RR + rr * Math.cos(v)
          p.setXYZ(idx, w * Math.cos(u), rr * Math.sin(v) * squash, w * Math.sin(u))
          n.setXYZ(idx, Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u))
        }
      }
      p.needsUpdate = true
      n.needsUpdate = true
      geo.computeBoundingSphere()
    }
    mat.current.color.copy(WHITE).lerp(STONE, warm)
    mat.current.emissive.copy(GOLD).lerp(STONE, warm)
    mat.current.emissiveIntensity = mix(0.9, 0.2, warm)
    // the lights come back on, one window at a time: people live here again
    const n = win.current.children.length
    win.current.children.forEach((m, i) => {
      const a = (i / n) * Math.PI * 2 + 0.2
      const rr2 = R + (i % 2 ? 0.32 : -0.32) * r
      m.position.set(Math.cos(a) * rr2, r * 0.53, Math.sin(a) * rr2)
      m.rotation.y = -a
      m.visible = t > t0 + 1.9 + ((i * 7) % n) * 0.06
    })
    bea.current.children.forEach((b, i) => {
      const a = (i / beacons) * Math.PI * 2
      b.position.set(Math.cos(a) * R, r * 0.55 + 0.1, Math.sin(a) * R)
      b.scale.setScalar(smooth(seg(t, t0 + 1.7 + i * 0.08, t0 + 2.1 + i * 0.08)))
    })
  })
  return (
    <group ref={group}>
      <mesh geometry={geo}>
        <meshStandardMaterial ref={mat} color={LAND.stone} roughness={0.55} metalness={0.15} emissive={LAND.stone} emissiveIntensity={0.2} />
      </mesh>
      <group ref={win}>
        {Array.from({ length: windows }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.16, 0.12, 0.05]} />
            <meshBasicMaterial color="#ffb860" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={bea}>
        {Array.from({ length: beacons }, (_, i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- Retract Reef's walkway (the intro's), rising back

const WALK_Z = 10
const WALK_Y = 0.5
const WALK_X0 = -14
const WALK_X1 = 6
function Walkway({ tRef, t0 }) {
  const slabs = useMemo(() => {
    const out = []
    for (let x = WALK_X0 + 0.5; x < WALK_X1; x += 1) out.push(x)
    return out
  }, [])
  const refs = useRef([])
  useFrame(() => {
    const t = tRef.current
    slabs.forEach((x, i) => {
      const m = refs.current[i]
      if (!m) return
      // they come up out of the sea in a wave along the spine, from the far end toward the pier
      const k = smooth(seg(t, t0 + i * 0.1, t0 + i * 0.1 + 0.8))
      m.visible = k > 0
      m.position.y = mix(-3, WALK_Y - 0.2, k)
      m.rotation.set((1 - k) * Math.sin(x * 12.9) * 1.2, 0, (1 - k) * Math.sin(x * 7.1))
      m.material.emissiveIntensity = 0.5 + (1 - k) * 3
    })
  })
  return (
    <group>
      {slabs.map((x, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[x, WALK_Y - 0.2, WALK_Z]}>
          <boxGeometry args={[0.96, 0.38, 1.5]} />
          <meshStandardMaterial color={LAND.stone} emissive="#ffcf8a" emissiveIntensity={0.5} roughness={0.55} />
        </mesh>
      ))}
      {/* the amber spine that held all along */}
      <mesh position={[(WALK_X0 + WALK_X1) / 2, WALK_Y - 0.03, WALK_Z]}>
        <boxGeometry args={[WALK_X1 - WALK_X0, 0.07, 0.16]} />
        <meshStandardMaterial color="#f0b27a" emissive="#ff9a2a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {[-12, -7, -2, 3].map((x) => (
        <mesh key={x} position={[x, WALK_Y - 3.6, WALK_Z]}>
          <cylinderGeometry args={[0.18, 0.5, 6.4, 7]} />
          <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- Haven's quay (the delivery)

function Quay() {
  return (
    <group position={[QUAY[0], 0, QUAY[1]]}>
      <mesh position={[0, QY - 1.3, 0]}>
        <cylinderGeometry args={[3.4, 3.9, 2.6, 10]} />
        <meshStandardMaterial color={LAND.stoneDark} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, QY - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 10]} />
        <meshStandardMaterial color={LAND.stone} roughness={0.6} />
      </mesh>
      {/* a gold compass rose inlaid in the quay: the courier guild's mark */}
      <mesh position={[0, QY + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.62, 48]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const a = (i / 10) * Math.PI * 2
        if (i === 2) return null // the gap toward the causeway
        return (
          <mesh key={i} position={[Math.cos(a) * 3.15, QY + 0.22, Math.sin(a) * 3.15]}>
            <cylinderGeometry args={[0.12, 0.15, 0.45, 8]} />
            <meshStandardMaterial color="#2c3240" roughness={0.6} metalness={0.3} />
          </mesh>
        )
      })}
      {/* harbour lamps */}
      {[2.5, 4.3].map((a, i) => (
        <group key={i} position={[Math.cos(a) * 2.9, QY, Math.sin(a) * 2.9]}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 2, 6]} />
            <meshStandardMaterial color="#2c3240" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.05, 0]}>
            <sphereGeometry args={[0.13, 12, 8]} />
            <meshStandardMaterial color="#ffe0a0" emissive="#ffb347" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 2.1, 0]} color="#ffb860" intensity={3} distance={6} />
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- the other provinces

function Stone({ color = LAND.stone, ...p }) {
  return <meshStandardMaterial color={color} roughness={0.6} metalness={0.12} emissive={LAND.stoneEmissive} emissiveIntensity={0.5} {...p} />
}

/**
 * A teardrop petal from the origin and back (th ∈ [0, 2π]), tip at (L, 0): leaves and returns at
 * at ±atan(2W/L) to the +x axis (38.7° for W/L = 0.4), and is narrower everywhere else, so three
 * petals 120° apart touch ONLY at the origin: a true wedge S¹ ∨ S¹ ∨ S¹.
 */
export const petal = (th, L, W) => [L * Math.sin(th / 2) ** 2, W * Math.sin(th) * Math.sin(th / 2)]
const PETAL_L = 7
const PETAL_W = 2.8
const BASTION_ANG = [0, 1, 2].map((i) => (i / 3) * Math.PI * 2 + 0.4)

/** Bouquet Bastion: three petal loops wedged at one point (S¹ ∨ S¹ ∨ S¹), a little bastion at each tip. */
function Bastion({ tRef, t0 }) {
  const loops = useRef([])
  const wedge = useRef()
  const at = PLACE.bastion.at
  const tube = useMemo(() => {
    const pts = Array.from({ length: 97 }, (_, k) => {
      const [x, z] = petal((k / 96) * Math.PI * 2, PETAL_L, PETAL_W)
      return new THREE.Vector3(x, 0, z)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false), 160, 0.5, 10, false)
  }, [])
  useFrame(() => {
    const t = tRef.current
    wedge.current.visible = t > t0
    loops.current.forEach((g, i) => {
      if (!g) return
      // each loop grows out of the wedge point, one after another
      const k = elastic(seg(t, t0 + 0.1 + i * 0.25, t0 + 1.7 + i * 0.25))
      g.visible = t > t0 + 0.1 + i * 0.25
      g.scale.setScalar(Math.max(0.0001, k))
    })
  })
  return (
    <group position={[at[0], 0, at[2]]}>
      {BASTION_ANG.map((a, i) => (
        <group key={i} ref={(el) => (loops.current[i] = el)} rotation={[0, -a, 0]}>
          <mesh geometry={tube} scale={[1, 0.55, 1]}>
            <Stone />
          </mesh>
          {/* the bastion at the petal's tip */}
          <group position={[PETAL_L, 0.2, 0]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.5, 0.6, 1.6, 8]} />
              <Stone color="#5a6178" />
            </mesh>
            <mesh position={[0, 1.95, 0]}>
              <coneGeometry args={[0.65, 0.9, 8]} />
              <meshStandardMaterial color={['#c25a3a', '#3a7ac2', '#3ac28a'][i]} roughness={0.5} />
            </mesh>
            <mesh position={[0.5, 1.0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.18, 0.26, 0.05]} />
              <meshBasicMaterial color="#ffb860" toneMapped={false} />
            </mesh>
            <mesh position={[0, 2.7, 0]}>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
      {/* the wedge point: the only place the three loops meet */}
      <mesh ref={wedge} position={[0, 0.4, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** The Delta's sphere: a pale hollow sphere on a rock, cut open so you can see it is hollow. */
function DeltaSphere({ tRef, t0 }) {
  const at = PLACE.delta.at
  const light = useRef()
  useFrame(() => {
    light.current.intensity = 6 * seg(tRef.current, t0 + 1, t0 + 2.5)
  })
  return (
    <>
      <group position={[at[0], 0, at[2]]}>
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[3.5, 5, 2.4, 9]} />
          <meshStandardMaterial color={LAND.stoneDark} roughness={0.85} flatShading />
        </mesh>
      </group>
      <Bloom tRef={tRef} t0={t0} at={at} base={[at[0], 5, at[2]]}>
        <mesh rotation={[0, 1.2, 0]}>
          {/* a wedge left open: the sphere is a shell around a hollow */}
          <sphereGeometry args={[4.6, 48, 32, 0, Math.PI * 2 - 1.1]} />
          <meshStandardMaterial color="#d9dcef" roughness={0.45} metalness={0.05} side={THREE.DoubleSide} emissive="#3a3f5a" emissiveIntensity={0.25} />
        </mesh>
        {/* the Degree Dial's gold equator */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.75, 0.09, 8, 96]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <pointLight ref={light} color="#ffcf8a" intensity={0} distance={9} />
        <mesh>
          <sphereGeometry args={[0.35, 16, 12]} />
          <meshBasicMaterial color="#fff0d0" toneMapped={false} />
        </mesh>
      </Bloom>
    </>
  )
}

/** The torus (with paired lanterns: its cup product, saved) and its twin S¹ ∨ S¹ ∨ S² beside it. */
function TorusAndTwin({ tRef, t0 }) {
  const at = PLACE.torus.at
  const twinAt = [at[0] + 12, 3, at[2] + 7]
  return (
    <>
      <RingHome tRef={tRef} t0={t0} pos={[at[0], 0, at[2]]} R={4} r={1.3} windows={26} beacons={10} lift={3} />
      <HangingPoint tRef={tRef} at={twinAt} t0={t0 + 0.5} />
      <Bloom tRef={tRef} t0={t0 + 0.5} at={twinAt} base={[twinAt[0], 0, twinAt[2]]}>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 2.4, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.55]}>
            <torusGeometry args={[2.4, 0.42, 12, 56]} />
            <Stone color="#5d6680" />
          </mesh>
        ))}
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[1.6, 32, 20]} />
          <Stone color="#8a92ad" />
        </mesh>
        {/* the wedge point: both circles and the sphere meet only here */}
        <mesh position={[0, 0.05, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      </Bloom>
    </>
  )
}

/** The Cup Product Gardens: hedge rings and lanterns that light in pairs. */
function Gardens({ tRef, t0 }) {
  const at = PLACE.gardens.at
  const lanterns = useRef([])
  const PAIRS = 7
  useFrame(() => {
    const t = tRef.current
    lanterns.current.forEach((m, i) => {
      if (!m) return
      const on = t > t0 + 1.4 + Math.floor(i / 2) * 0.22
      m.emissiveIntensity = on ? 2.6 : 0.05
    })
  })
  return (
    <Bloom tRef={tRef} t0={t0} at={at}>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[7, 7.8, 2, 12]} />
        <meshStandardMaterial color={LAND.stoneDark} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7, 12]} />
        <meshStandardMaterial color="#25402f" roughness={0.9} />
      </mesh>
      {[2.4, 4.6].map((r) => (
        <mesh key={r} position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.28, 8, 48]} />
          <meshStandardMaterial color="#2f6b3e" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: PAIRS * 2 }, (_, i) => {
        const a = (Math.floor(i / 2) / PAIRS) * Math.PI * 2 + (i % 2 ? 0.16 : -0.16)
        const r = 5.9
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
              <meshStandardMaterial color="#2c3240" />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.2, 12, 8]} />
              <meshStandardMaterial ref={(m) => (lanterns.current[i] = m)} color="#ffe0a0" emissive="#ffb347" emissiveIntensity={0.05} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </Bloom>
  )
}

/** The Postnikov Spire: floor on floor, each a dimension up. Violet under Null; gold once the Crown is gone. */
function Spire({ tRef }) {
  const FLOORS = 6
  const H = TOPY / FLOORS
  const bands = useRef([])
  const brackets = useRef([])
  useFrame(() => {
    const t = tRef.current
    for (let i = 0; i < FLOORS; i++) {
      const k = seg(t, SPIRE_LIGHT[0] + i * 0.4, SPIRE_LIGHT[0] + i * 0.4 + 0.6)
      const m = bands.current[i]
      if (m) {
        m.color.copy(VIOLET).lerp(GOLD, k)
        m.emissive.copy(VIOLET).lerp(GOLD, k)
        m.emissiveIntensity = mix(0.9, 2, k)
      }
      const b = brackets.current[i]
      if (b) b.scale.setScalar(Math.max(0.0001, elastic(k)))
    }
  })
  return (
    <group position={[SUMMIT[0], 0, SUMMIT[1]]}>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[11, 14, 3, 12]} />
        <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
      </mesh>
      {Array.from({ length: FLOORS }, (_, i) => {
        const r0 = mix(8.2, 5.2, i / FLOORS)
        const r1 = mix(8.2, 5.2, (i + 1) / FLOORS)
        return (
          <group key={i} position={[0, i * H, 0]} rotation={[0, (i % 2) * (Math.PI / 6), 0]}>
            <mesh position={[0, H / 2, 0]}>
              <cylinderGeometry args={[r1, r0, H, 6]} />
              <meshStandardMaterial color="#1a1724" roughness={0.45} metalness={0.4} flatShading />
            </mesh>
            {/* a band of windows round each floor */}
            <mesh position={[0, H * 0.55, 0]}>
              <cylinderGeometry args={[(r0 + r1) / 2 + 0.03, (r0 + r1) / 2 + 0.03, 0.3, 6, 1, true]} />
              <meshStandardMaterial ref={(m) => (bands.current[i] = m)} color="#8a3cff" emissive="#8a3cff" emissiveIntensity={0.9} toneMapped={false} />
            </mesh>
            {/* the gold bracket between floors: the k-invariant Null threw away, back in place */}
            <mesh ref={(m) => (brackets.current[i] = m)} position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r1 + 0.15, 0.12, 8, 6]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
      {/* the summit floor and its broken parapet */}
      <mesh position={[0, TOPY - 0.1, 0]}>
        <cylinderGeometry args={[6.4, 5.2, 0.4, 24]} />
        <meshStandardMaterial color="#231d30" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, TOPY + 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.55, 48]} />
        <meshStandardMaterial color="#c79bff" emissive="#8a3cff" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        if (i === 3 || i === 4) return null
        return (
          <mesh key={i} position={[Math.cos(a) * 6.1, TOPY + 0.5 - (i % 3) * 0.12, Math.sin(a) * 6.1]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.5, 0.8 - (i % 3) * 0.2, 1.8]} />
            <meshStandardMaterial color="#2a2338" roughness={0.5} metalness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Broken causeways and stumps between provinces, so the sea between them isn't empty. */
function Links() {
  return (
    <>
      {/* Retract Reef's Fork → Haven's quay */}
      <CausewaySlab a={[-21.5, 6]} b={[-34.2, 18.6]} y={QY} />
      <CausewaySlab a={[-40.5, 20]} b={[-39.5, 20]} y={QY} spine={false} />
    </>
  )
}

// ---------------------------------------------------------------- the Crown's shards

/** Where each shard hovers after the burst, above the summit. */
export const SHARD_HOVER = PLACES.map((p, i) => {
  const a = (i / PLACES.length) * Math.PI * 2 + 0.3
  return [NULL_AT[0] + Math.cos(a) * 3.6, TOPY + 5 + (i % 3) * 0.8, NULL_AT[2] + Math.sin(a) * 3.6]
})
export const CROWN_AT = [NULL_AT[0], TOPY + 3.18 * 0.8, NULL_AT[2]]
export const BREAK_AT = 5.0
const LAUNCH = 2.4 // seconds of flight from the summit to a place

function shardPos(i, t, out) {
  const p = PLACES[i]
  const H = SHARD_HOVER[i]
  if (t < BREAK_AT) return null
  const L = p.t0 - LAUNCH
  if (t < L) {
    const k = 1 - (1 - seg(t, BREAK_AT, BREAK_AT + 1.8)) ** 3
    out[0] = mix(CROWN_AT[0], H[0], k)
    out[1] = mix(CROWN_AT[1], H[1], k) + Math.sin(t * 1.3 + i) * 0.15
    out[2] = mix(CROWN_AT[2], H[2], k)
    return out
  }
  if (t >= p.t0) return null
  // a long arc out over the sea to the hanging point
  const u = smooth(seg(t, L, p.t0))
  const m = [(H[0] + p.at[0]) / 2, Math.max(H[1], p.at[1]) + 22, (H[2] + p.at[2]) / 2]
  const a = (1 - u) * (1 - u)
  const b = 2 * (1 - u) * u
  const c = u * u
  out[0] = a * H[0] + b * m[0] + c * p.at[0]
  out[1] = a * H[1] + b * m[1] + c * p.at[1]
  out[2] = a * H[2] + b * m[2] + c * p.at[2]
  return out
}

function Shard({ tRef, i }) {
  const g = useRef()
  const mat = useRef()
  const sp = useRef()
  const v = useMemo(() => [0, 0, 0], [])
  useFrame(({ clock }) => {
    const t = tRef.current
    const p = shardPos(i, t, v)
    g.current.visible = !!p
    if (!p) return
    g.current.position.set(p[0], p[1], p[2])
    g.current.rotation.set(clock.elapsedTime * 1.7 + i, clock.elapsedTime * 2.3, 0)
    // violet while they hover, then they catch fire gold before they fly
    const ig = seg(t, 24.6 + i * 0.12, 25.4 + i * 0.12)
    mat.current.color.copy(VIOLET).lerp(GOLD, ig)
    mat.current.emissive.copy(VIOLET).lerp(GOLD, ig)
    mat.current.emissiveIntensity = 1.4 + ig * 1.6
    sp.current.material.color.copy(VIOLET).lerp(GOLD, ig)
    sp.current.scale.setScalar(0.45 + ig * 0.55)
  })
  // its trail: where it was over the last half second
  const trail = () => {
    const t = tRef.current
    const L = PLACES[i].t0 - LAUNCH
    if (t < L || t >= PLACES[i].t0) return null
    const pts = []
    const tmp = [0, 0, 0]
    for (let k = 0; k <= 16; k++) {
      const tt = Math.max(L, t - 0.6 + (k / 16) * 0.6)
      const p = shardPos(i, tt, tmp)
      if (p) pts.push([p[0], p[2], p[1]])
    }
    return pts
  }
  return (
    <>
      <group ref={g}>
        <mesh>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial ref={mat} color="#8a3cff" emissive="#8a3cff" emissiveIntensity={1.4} toneMapped={false} flatShading />
        </mesh>
        <sprite ref={sp}>
          <spriteMaterial map={GLOW} color="#8a3cff" transparent opacity={0.6} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <LiveLine getPts={trail} color="#ffd27a" width={4} />
    </>
  )
}

// ---------------------------------------------------------------- fireworks

const BURST_N = 64
/** bursts: [{ t, at:[x,y,z], color }] in the clock `getT` returns (story time, or a looping clock). */
export function Fireworks({ getT, bursts }) {
  const pts = useRef()
  const { pos, col, dirs, base } = useMemo(() => {
    const n = bursts.length * (BURST_N + 1)
    const dirs = []
    for (let i = 0; i < BURST_N; i++) {
      // even directions over the sphere (golden spiral)
      const y = 1 - (2 * (i + 0.5)) / BURST_N
      const r = Math.sqrt(1 - y * y)
      const a = i * 2.399963
      dirs.push([Math.cos(a) * r, y, Math.sin(a) * r])
    }
    return { pos: new Float32Array(n * 3), col: new Float32Array(n * 3), dirs, base: bursts.map((b) => new THREE.Color(b.color)) }
  }, [bursts])
  useFrame(() => {
    const t = getT()
    let k = 0
    bursts.forEach((b, bi) => {
      const dt = t - b.t
      const c = base[bi]
      // the rocket climbing
      const up = seg(dt, -0.9, 0)
      const rocketOn = dt > -0.9 && dt < 0
      pos[k * 3] = b.at[0]
      pos[k * 3 + 1] = mix(-0.5, b.at[1], 1 - (1 - up) ** 2)
      pos[k * 3 + 2] = b.at[2]
      const rb = rocketOn ? 1 : 0
      col[k * 3] = rb
      col[k * 3 + 1] = rb * 0.85
      col[k * 3 + 2] = rb * 0.6
      k++
      for (let i = 0; i < BURST_N; i++, k++) {
        const on = dt >= 0 && dt < 2.6
        const s = on ? 6.5 * (1 - Math.exp(-dt * 2.2)) : 0
        const d = dirs[i]
        pos[k * 3] = b.at[0] + d[0] * s
        pos[k * 3 + 1] = b.at[1] + d[1] * s - (on ? 1.2 * dt * dt : 0)
        pos[k * 3 + 2] = b.at[2] + d[2] * s
        const f = on ? (1 - dt / 2.6) ** 1.5 * (i % 5 === 0 ? 1.4 : 1) : 0
        col[k * 3] = c.r * f
        col[k * 3 + 1] = c.g * f
        col[k * 3 + 2] = c.b * f
      }
    })
    const g = pts.current.geometry
    g.attributes.position.needsUpdate = true
    g.attributes.color.needsUpdate = true
  })
  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={pos.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={col} count={col.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={GLOW} size={1.8} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
    </points>
  )
}

// ---------------------------------------------------------------- the whole world

export default function WorldSet({ tRef }) {
  return (
    <>
      <fog attach="fog" args={['#0a1020', 60, 200]} />
      <Sky tRef={tRef} />
      <Lights tRef={tRef} />
      <NightStars tRef={tRef} />
      <Sparkles count={120} scale={[90, 14, 90]} position={[0, 4, 0]} size={2.4} speed={0.25} color="#ffe0a0" />
      <Clouds y={40} area={[0, -10, 220, 200]} count={18} color="#c8a8d8" opacity={0.16} seed={11} speed={0.4} />

      {/* Retract Reef — the same layout the intro and the level use */}
      <ReefScenery y={0.3} staticSites skipSites={['the_walkway']} ruin={false} throne />
      <Walkway tRef={tRef} t0={PLACE.reef.t0 - 0.6} />
      <RingHome tRef={tRef} t0={PLACE.reef.t0} pos={[0, 0, 0]} R={3} r={0.7} />
      <RingHome tRef={tRef} t0={PLACE.haven.t0} pos={[HAVEN[0], -0.1, HAVEN[1]]} R={5} r={1.25} windows={34} beacons={10} lift={3} />
      {/* Haven's guild beacon, tall on the ring's far side */}
      <Bloom tRef={tRef} t0={PLACE.haven.t0 + 2} at={[HAVEN[0] - 5, 3, HAVEN[1] - 1]} base={[HAVEN[0] - 5, 0, HAVEN[1] - 1]} dur={0.9}>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.1, 0.2, 2.8, 6]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 3, 0]} color="#ffb860" intensity={6} distance={16} />
      </Bloom>
      <Quay />
      <Links />
      <Bastion tRef={tRef} t0={PLACE.bastion.t0} />
      <DeltaSphere tRef={tRef} t0={PLACE.delta.t0} />
      <TorusAndTwin tRef={tRef} t0={PLACE.torus.t0} />
      <Gardens tRef={tRef} t0={PLACE.gardens.t0} />
      <Spire tRef={tRef} />

      {PLACES.map((p) => (
        <HangingPoint key={p.id} tRef={tRef} at={p.at} t0={p.t0} />
      ))}
      {PLACES.map((p, i) => (
        <Shard key={p.id} tRef={tRef} i={i} />
      ))}
    </>
  )
}
