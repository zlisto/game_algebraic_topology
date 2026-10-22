import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Count Null's two oldest spawn as beasts (concept refs: the bestiary's Sphere Minion and Torus Horror).
 *
 *   SphereSpawn — S², π₁ = 0, one lash: a swollen, lumpy orb of black-violet ooze split by a glowing
 *                 magenta jaw of crystal teeth that gnashes, a cluster of milky eyes, a smoky
 *                 crackling halo above and ectoplasm drips stretching below.
 *   TorusSpawn  — T², π₁ = ℤ ⊕ ℤ, two lashes: a ribbed, veined ring of flesh and horn with a lidless
 *                 slit eye floating in the hole and violet lightning wrapped round it. The first lash
 *                 cuts one loop — the ring splits open into a tube; the second snuffs the eye.
 *
 * Each reads the live enemy record `e` (position, facing, flash, stun, dying, hp…).
 */

const MAGENTA = '#e05cff'
const VIOLET = '#b070ff'
const MILK = '#f4ecff'

/** Common per-frame placement: hover, face, flash, collapse-to-a-point when dying. */
function place(g, e, y, dieTime, size = 1) {
  g.visible = e.alive || e.dying > 0
  g.position.set(e.x, y, e.z)
  g.rotation.y = e.face
  g.scale.setScalar(size * (e.dying > 0 ? Math.max(0.001, e.dying / dieTime) : 1 + (e.flash > 0 ? 0.12 : 0)))
}

/** Cheap smooth 3D noise from sines — enough to make flesh lumpy. */
const lump = (x, y, z, seed) =>
  Math.sin(x * 4.3 + seed) * Math.sin(y * 3.9 + seed * 1.7) * Math.sin(z * 4.7 + seed * 0.6) +
  0.35 * Math.sin(x * 11.3 + y * 3.1 + seed) * Math.sin(z * 9.7 - seed)

/** Push a geometry's vertices out along their normals by lumpy noise; `keep(y)` (0..1) damps it (e.g. at a seam). */
function lumpify(geo, amp, seed, keep = () => 1) {
  const p = geo.attributes.position
  const n = geo.attributes.normal
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const d = lump(x, y, z, seed) * amp * keep(y)
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d)
  }
  geo.computeVertexNormals()
  return geo
}

/** A burst of ooze and sparks as a spawn collapses to a point. */
export function Burst({ e, color = MAGENTA, dieTime = 0.5 }) {
  const g = useRef()
  const dirs = useMemo(() => Array.from({ length: 12 }, (_, i) => [Math.cos(i * 2.4), 0.4 + ((i * 7) % 5) / 6, Math.sin(i * 2.4)]), [])
  useFrame(() => {
    const live = !e.alive && e.dying > 0
    g.current.visible = live
    if (!live) return
    const k = 1 - e.dying / dieTime
    g.current.position.set(e.x, 0.7, e.z)
    g.current.children.forEach((m, i) => {
      if (i === 0) {
        m.scale.setScalar(0.2 + k * 1.6)
        m.material.opacity = 0.8 * (1 - k)
        return
      }
      const d = dirs[i - 1]
      m.position.set(d[0] * k * 0.9, d[1] * k * 0.9 - k * k * 0.5, d[2] * k * 0.9)
      m.material.opacity = 1 - k
    })
  })
  return (
    <group ref={g} visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.03, 6, 32]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {dirs.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.035 + (i % 3) * 0.012, 6, 5]} />
          <meshBasicMaterial color={i % 2 ? color : '#5a1a8a'} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** A soft violet rim around a silhouette (back-face shell). */
const rim = (opacity = 0.35) => <meshBasicMaterial color="#9a5cff" side={THREE.BackSide} transparent opacity={opacity} toneMapped={false} depthWrite={false} />

const ooze = (extra = {}) => <meshPhysicalMaterial color="#1b1024" roughness={0.18} metalness={0.15} clearcoat={1} clearcoatRoughness={0.15} emissive="#3a0f5e" emissiveIntensity={0.35} {...extra} />
const glow = (color = VIOLET, extra = {}) => <meshBasicMaterial color={color} toneMapped={false} {...extra} />


// ---------------------------------------------------------------- batching
// Each beast's static pieces are merged into one geometry per material (vertex colours carry the
// per-piece colour), built once per look and shared by every copy: a dozen draw calls a beast, not ninety.

const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _e = new THREE.Euler()
const _p = new THREE.Vector3()
const _s = new THREE.Vector3()
const _c = new THREE.Color()

/** A piece for merging: geometry moved into place, uv dropped, coloured if asked. */
export function piece(geo, { p = [0, 0, 0], r = [0, 0, 0], s = 1, color } = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone()
  _m.compose(_p.set(...p), _q.setFromEuler(_e.set(...r)), Array.isArray(s) ? _s.set(...s) : _s.set(s, s, s))
  g.applyMatrix4(_m)
  g.deleteAttribute('uv')
  if (color) {
    _c.set(color)
    const n = g.attributes.position.count
    const col = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) col.set([_c.r, _c.g, _c.b], i * 3)
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  }
  return g
}
export const merge = (parts) => mergeGeometries(parts)
const CACHE = new Map()
/** Build once per key, share forever. */
export const cached = (key, make) => (CACHE.has(key) ? CACHE.get(key) : CACHE.set(key, make()).get(key))
const variant = (seed) => Math.abs(Math.round((seed || 0) * 10)) % 4 // four looks are plenty

// ---------------------------------------------------------------- sphere minion

const SR = 0.34
const EYES = [
  [-0.12, 0.2, 0.27, 0.045], [-0.2, 0.15, 0.22, 0.035], [-0.05, 0.27, 0.22, 0.04], [-0.17, 0.25, 0.16, 0.028],
  [0.02, 0.22, 0.26, 0.026], [-0.24, 0.08, 0.22, 0.024], [-0.1, 0.3, 0.12, 0.022], [0.08, 0.28, 0.18, 0.02],
]
const DRIPS = [[-0.12, 0.05], [0.06, 0.12], [0.14, -0.06], [-0.04, -0.13], [0.0, 0.0]]
const TEETH = Array.from({ length: 22 }, (_, i) => ({ a: (i / 22) * Math.PI * 2, h: 0.06 + ((i * 37) % 5) * 0.012 }))

function sphereGeos(v) {
  return cached(`sphere:${v}`, () => {
    const R = SR
    const upper = lumpify(new THREE.SphereGeometry(R, 26, 13, 0, Math.PI * 2, 0, Math.PI / 2), 0.07, v * 1.7, (y) => Math.min(1, y / (R * 0.35)))
    const lower = lumpify(new THREE.SphereGeometry(R, 26, 13, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0.075, v * 1.7 + 3, (y) => Math.min(1, -y / (R * 0.35)))
    const tooth = (h) => new THREE.ConeGeometry(0.03, h, 4)
    // lower jaw's glowing parts: bottom teeth, the gum line, the dark maw
    const lowerGlow = merge([
      ...TEETH.map(({ a, h }) => piece(tooth(h), { p: [Math.sin(a) * R * 0.93, 0.02 + h / 2, Math.cos(a) * R * 0.93], r: [0, a, 0], color: '#f0a8ff' })),
      piece(new THREE.TorusGeometry(R * 0.97, 0.045, 8, 48), { r: [Math.PI / 2, 0, 0], color: '#ff8cff' }),
      piece(new THREE.CircleGeometry(R * 0.9, 32), { p: [0, 0.005, 0], r: [-Math.PI / 2, 0, 0], color: '#7a1aa8' }),
    ])
    const upperTeeth = merge(TEETH.map(({ a, h }) => piece(tooth(h), { p: [Math.sin(a + 0.14) * R * 0.93, -0.02 - h / 2, Math.cos(a + 0.14) * R * 0.93], r: [Math.PI, a, 0], color: '#f0a8ff' })))
    const whites = merge(EYES.map(([x, y, z, r]) => piece(new THREE.SphereGeometry(r, 12, 10), { p: [x, y, z] })))
    const irises = merge(
      EYES.flatMap(([x, y, z, r]) => [
        piece(new THREE.SphereGeometry(r, 10, 8), { p: [x, y, z + r * 0.72], s: [0.55, 0.55, 0.25], color: '#ffcf3a' }),
        piece(new THREE.SphereGeometry(r, 8, 6), { p: [x, y, z + r * 0.86], s: [0.14, 0.5, 0.15], color: '#1a0612' }),
      ]),
    )
    const haloGlow = merge([
      piece(new THREE.TorusGeometry(0.24, 0.022, 6, 40), { r: [Math.PI / 2, 0, 0], color: MAGENTA }),
      ...[0, 1, 2, 3, 4].map((i) => piece(new THREE.OctahedronGeometry(1, 0), { p: [Math.cos(i * 1.26) * 0.25, Math.sin(i * 3.1) * 0.03, Math.sin(i * 1.26) * 0.25], s: 0.018, color: '#ffb8ff' })),
    ])
    const haloDark = new THREE.TorusGeometry(0.24, 0.035, 8, 40).rotateX(Math.PI / 2)
    const drips = merge(
      DRIPS.flatMap(([x, z]) => [
        piece(new THREE.CylinderGeometry(0.02, 0.01, 0.09, 6), { p: [x, -R * 0.85 - 0.04, z], color: '#2a1438' }),
        piece(new THREE.SphereGeometry(0.03, 10, 8), { p: [x, -R * 0.85 - 0.09, z], color: '#3a1a52' }),
      ]),
    )
    return { upper, lower, lowerGlow, upperTeeth, whites, irises, haloGlow, haloDark, drips }
  })
}

export function SphereSpawn({ e }) {
  const g = useRef()
  const top = useRef()
  const halo = useRef()
  const shell = useRef()
  const irises = useRef()
  const drips = useRef()
  const seed = e.seed || 0
  const G = sphereGeos(variant(seed))
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed
    place(g.current, e, 0.7 + Math.sin(t * 2.6) * 0.06, 0.5, 1.15)
    const open = e.stun > 0 ? 0.6 : 0.26 + 0.4 * Math.max(0, Math.sin(t * 5)) ** 3
    top.current.rotation.x = -open
    halo.current.position.y = SR + 0.23 + Math.sin(t * 2) * 0.02
    halo.current.rotation.z = Math.sin(t * 1.3) * 0.12
    halo.current.rotation.y = t * 1.2
    irises.current.visible = Math.sin(t * 0.9) < 0.97 // the odd blink
    drips.current.scale.y = 1 + ((t * 0.55) % 1) * 0.6 // the ooze stretches, snaps, regrows
    shell.current.material.emissiveIntensity = e.flash > 0 ? 2.5 : 0.35
  })
  return (
    <>
      <Burst e={e} />
      <group ref={g}>
        {/* tipped back ~15 degrees so the maw faces the camera */}
        <group rotation={[-0.26, 0, 0]}>
          <mesh geometry={G.lower}>{ooze()}</mesh>
          <mesh geometry={G.lower} scale={1.06}>{rim()}</mesh>
          <mesh geometry={G.lowerGlow}>{glow('#ffffff', { vertexColors: true })}</mesh>
          {/* upper half, hinged at the back so the mouth opens toward its prey */}
          <group position={[0, 0, -SR * 0.9]}>
            <group ref={top}>
              <group position={[0, 0, SR * 0.9]}>
                <mesh ref={shell} geometry={G.upper}>{ooze()}</mesh>
                <mesh geometry={G.upper} scale={1.06}>{rim()}</mesh>
                <mesh geometry={G.upperTeeth}>{glow('#ffffff', { vertexColors: true })}</mesh>
                <mesh geometry={G.whites}>
                  <meshStandardMaterial color={MILK} emissive="#d8c8ff" emissiveIntensity={0.5} roughness={0.2} />
                </mesh>
                <mesh ref={irises} geometry={G.irises}>{glow('#ffffff', { vertexColors: true })}</mesh>
              </group>
            </group>
          </group>
          {/* smoky, crackling halo */}
          <group ref={halo}>
            <mesh geometry={G.haloDark}>
              <meshStandardMaterial color="#2a1040" roughness={0.6} emissive="#8a2ad8" emissiveIntensity={0.9} />
            </mesh>
            <mesh geometry={G.haloGlow}>{glow('#ffffff', { vertexColors: true, transparent: true, opacity: 0.95 })}</mesh>
          </group>
          {/* ectoplasm drips */}
          <group position={[0, -SR * 0.85, 0]}>
            <mesh ref={drips} geometry={G.drips} position={[0, SR * 0.85, 0]}>
              <meshStandardMaterial vertexColors roughness={0.2} emissive="#7a2ab8" emissiveIntensity={0.55} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  )
}

// ---------------------------------------------------------------- torus horror

/** One flickering lightning loop wrapped round the ring. */
export function Lightning({ radius, tilt, speed, seed }) {
  const line = useRef()
  const N = 64
  const pos = useMemo(() => new Array((N + 1) * 3).fill(0), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + seed
    const jitter = Math.floor(t * 12) // re-crackle a dozen times a second
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2
      const j = Math.sin(i * 12.9898 + jitter * 78.233) * 43758.5453
      const r = radius + ((j - Math.floor(j)) - 0.5) * 0.06
      pos[i * 3] = Math.cos(a + t * 0.5) * r
      pos[i * 3 + 1] = Math.sin(a + t * 0.5) * r * Math.cos(tilt)
      pos[i * 3 + 2] = Math.sin(a + t * 0.5) * r * Math.sin(tilt)
    }
    line.current.geometry.setPositions(pos)
    line.current.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 7))
  })
  return <Line ref={line} points={Array.from({ length: N + 1 }, () => [0, 0, 0])} color="#e0b8ff" lineWidth={3} transparent opacity={0.9} toneMapped={false} />
}

const TR = 0.44
const Tr = 0.17
const SPIKES = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * Math.PI * 2 + 0.1, len: 0.14 + ((i * 7) % 4) * 0.03, tilt: ((i * 5) % 3) - 1 }))

function torusGeos(v) {
  return cached(`torus:${v}`, () => {
    const makeRing = (arc) => {
      const geo = new THREE.TorusGeometry(TR, Tr, 16, 48, arc)
      const p = geo.attributes.position
      const n = geo.attributes.normal
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i)
        const y = p.getY(i)
        const z = p.getZ(i)
        const rib = Math.max(0, Math.sin(Math.atan2(y, x) * 22)) * 0.04 // segment ridges
        const d = rib + lump(x, y, z, v * 1.7) * 0.02
        p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d)
      }
      geo.computeVertexNormals()
      return geo
    }
    const spikes = (maxA) =>
      merge(
        SPIKES.filter(({ a }) => a <= maxA).map(({ a, len, tilt }) =>
          piece(new THREE.ConeGeometry(0.035, len, 6), { p: [Math.cos(a) * (TR + Tr * 0.9), Math.sin(a) * (TR + Tr * 0.9), tilt * 0.05], r: [tilt * 0.3, 0, a - Math.PI / 2] }),
        ),
      )
    const veins = merge([0.3, 1.9, 3.4, 4.8].map((a) => piece(new THREE.TorusGeometry(Tr * 1.04, 0.008, 4, 18, Math.PI * 1.2), { p: [Math.cos(a) * TR, Math.sin(a) * TR, 0], r: [0, 0, a] })))
    return { whole: makeRing(Math.PI * 2), split: makeRing(Math.PI * 1.5), spikesWhole: spikes(Math.PI * 2), spikesCut: spikes(Math.PI * 1.5), veins }
  })
}

export function TorusSpawn({ e, maxHp = 2 }) {
  const g = useRef()
  const wheel = useRef()
  const eye = useRef()
  const pupil = useRef()
  const RR = TR
  const r = Tr
  const seed = e.seed || 0
  const G = torusGeos(variant(seed))
  const cut = maxHp - e.hp >= 1
  const veins = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + seed
    // a cut ring sags; the whole thing always turns its eye toward Gyroid
    place(g.current, e, 0.85 + Math.sin(t * 2.2) * 0.06 - (cut ? 0.15 : 0), 0.6)
    if (e.px !== undefined) g.current.rotation.y = Math.atan2(e.px - e.x, e.pz - e.z)
    if (!cut) wheel.current.rotation.z += dt * (e.stun > 0 ? 6 : 0.9) // churns on its axle, until it's cut open
    veins.current.material.opacity = 0.45 + 0.45 * Math.max(0, Math.sin(t * 3))
    // the eye tracks, twitches, and narrows when hurt
    eye.current.rotation.y = Math.sin(t * 0.9) * 0.25
    pupil.current.scale.x = (cut ? 0.5 : 1) * (0.9 + 0.1 * Math.sin(t * 6))
    eye.current.scale.setScalar(e.dying > 0 ? Math.max(0.01, e.dying / 0.6) : 1)
  })
  return (
    <>
    <Burst e={e} dieTime={0.6} />
    <group ref={g}>
      <group rotation={[-0.25, 0, 0]}>
        <group ref={wheel}>
          <mesh geometry={cut ? G.split : G.whole}>
            {ooze({ color: '#24122e', emissive: '#4a1670', emissiveIntensity: e.flash > 0 ? 2 : 0.3 })}
          </mesh>
          {/* veins */}
          <mesh ref={veins} geometry={G.veins}>{glow('#c070ff', { transparent: true, opacity: 0.8 })}</mesh>
          {/* horn spikes round the outer edge */}
          <mesh geometry={cut ? G.spikesCut : G.spikesWhole}>
            <meshStandardMaterial color="#e2d2b8" roughness={0.45} metalness={0.1} emissive="#8a6a48" emissiveIntensity={0.6} />
          </mesh>
          {/* the open wound where the first lash cut the loop */}
          {cut && (
            <>
              {[Math.PI * 1.5, 0].map((a, i) => (
                <group key={i} position={[Math.cos(a) * RR, Math.sin(a) * RR, 0]}>
                  <mesh>
                    <sphereGeometry args={[r * 1.0, 14, 10]} />
                    {glow(MAGENTA, { transparent: true, opacity: 0.9 })}
                  </mesh>
                  {/* ooze dripping from the wound */}
                  <mesh position={[0, -r * 1.2, 0]} scale={[0.4, 1.6, 0.4]}>
                    <sphereGeometry args={[r * 0.4, 8, 6]} />
                    {glow('#a040ff', { transparent: true, opacity: 0.8 })}
                  </mesh>
                </group>
              ))}
            </>
          )}
        </group>
        {/* the lidless watcher in the hole — it doesn't spin with the ring */}
        <group ref={eye}>
          <mesh scale={[0.11, 0.12, 0.07]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial color="#c79bff" emissive="#9a5cff" emissiveIntensity={1.1} roughness={0.15} />
          </mesh>
          <mesh ref={pupil} position={[0, 0, 0.065]} scale={[0.022, 0.1, 0.015]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color="#12041e" />
          </mesh>
          <mesh scale={0.15}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color="#a060ff" transparent opacity={0.15} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
        <Lightning radius={RR + r + 0.12} tilt={0.5} speed={1.1} seed={seed} />
        <Lightning radius={RR + r + 0.2} tilt={-0.9} speed={0.8} seed={seed + 5} />
      </group>
    </group>
    </>
  )
}
