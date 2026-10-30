import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { preloadModels, useModelParts } from './models'

preloadModels('null')

/**
 * Count Null — modeled on assets/characters/count-null.png; the robes, mask and arms are sculpted in Blender
 * (tools/null_blender.py → public/models/null.glb), the crown, orbs and fragments are procedural:
 * a tall pointed hood over a long porcelain mask, a layered mantle with sharp
 * shoulder points, obsidian robes that flare into a pointed trailing hem, a
 * chevroned front panel with dark orbs at collar and chest, a floating spiked
 * halo crown, and torn surface fragments orbiting one open, raised hand.
 * Every cloth part carries a violet back-face rim.
 *
 * `script(t)` → { gesture, crown, crownY }
 *   gesture: 0 hand at side … 1 hand thrust forward
 *   crown:   0..1 crown glow / beam charge
 *   crownOn: false hides the crown (before he forged it) · mask: 0 bare-faced hood … 1 masked · bare: no fragments
 */

const VIOLET = '#a259ff'
const TRIM = { color: '#211a2c', roughness: 0.55, metalness: 0.3 }
export const CROWN_Y = 3.18 // the collapse beam leaves from here

const RIM = new THREE.MeshBasicMaterial({ color: VIOLET, side: THREE.BackSide, transparent: true, opacity: 0.85, toneMapped: false })
const NO_RIM = new Set(['mask', 'slit', 'hollow'])

/** One sculpted part of Null (tools/null_blender.py), each cloth mesh with a slightly inflated back-face shell
 *  behind it that reads as his violet rim light. */
// an outline shell: every vertex pushed out along its normal (a fixed width, unlike scaling from the feet)
const shellCache = new WeakMap()
function shell(geo, d = 0.009) {
  let g = shellCache.get(geo)
  if (!g) {
    g = geo.clone()
    if (!g.attributes.normal) g.computeVertexNormals()
    const p = g.attributes.position
    const n = g.attributes.normal
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d)
    p.needsUpdate = true
    g.computeBoundingSphere()
    shellCache.set(geo, g)
  }
  return g
}

// Ansel's robes before the turn (the prologue): brown wool, not obsidian
const WARM = {
  robe: new THREE.MeshStandardMaterial({ color: '#5a3c28', roughness: 0.85 }),
  robeDark: new THREE.MeshStandardMaterial({ color: '#3e2a1c', roughness: 0.9 }),
  trim: new THREE.MeshStandardMaterial({ color: '#7a5636', roughness: 0.7 }),
  chevron: new THREE.MeshStandardMaterial({ color: '#8a6a40', roughness: 0.6, metalness: 0.3 }),
  glove: new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: 0.7 }),
}

function NullPartInner({ name, rim = true, palette }) {
  const parts = useModelParts('null')
  const list = parts[name]
  if (!list) return null
  return list.map((p, i) => (
    <group key={i}>
      <mesh geometry={p.geometry} material={(palette === 'warm' && WARM[p.material.name]) || p.material} />
      {rim && !NO_RIM.has(p.material.name) && <mesh geometry={shell(p.geometry)} material={RIM} />}
    </group>
  ))
}
const NullPart = (props) => (
  <Suspense fallback={null}>
    <NullPartInner {...props} />
  </Suspense>
)

function Fragments({ count = 18 }) {
  const group = useRef()
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (i / count) * Math.PI * 2 + Math.sin(i * 3.7) * 0.12,
        r: 0.3 + (i % 3) * 0.045,
        y: Math.sin(i * 2.1) * 0.05,
        s: [0.022 + (i % 4) * 0.01, 0.016 + ((i * 5) % 3) * 0.008, 0.012],
        spin: 0.4 + (i % 5) * 0.25,
        kind: i % 3,
      })),
    [count],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current.children.forEach((m, i) => {
      const d = shards[i]
      if (!d) return
      const a = d.a + t * 0.5
      m.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.3 + i) * 0.03, Math.sin(a) * d.r)
      m.rotation.set(t * d.spin + i, t * d.spin * 0.7, i)
    })
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.075, 32, 24]} />
        <meshStandardMaterial color="#050308" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh scale={1.22}>
        <sphereGeometry args={[0.075, 32, 24]} />
        <meshBasicMaterial color={VIOLET} side={THREE.BackSide} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <group ref={group}>
        {shards.map((d, i) => (
          <mesh key={i} scale={d.s}>
            {d.kind === 0 ? <tetrahedronGeometry args={[1, 0]} /> : d.kind === 1 ? <octahedronGeometry args={[1, 0]} /> : <dodecahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color="#1a1222" emissive={VIOLET} emissiveIntensity={1.3} toneMapped={false} flatShading />
          </mesh>
        ))}
      </group>
      <pointLight color={VIOLET} intensity={0.8} distance={1.2} />
    </group>
  )
}

/** Floating halo crown: a broken black ring of upward spikes, tallest at front and back, with short inward prongs. */
export function NullCrown({ glowRef }) {
  const mats = useRef([])
  const GAP = 0.32
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.3, 0.022, 12, 96, Math.PI * 2 - GAP), [])
  useFrame(() => {
    const g = 0.25 + (glowRef?.current ?? 0) * 1.3
    mats.current.forEach((m) => m && (m.emissiveIntensity = g))
  })
  const spikes = useMemo(() => {
    const out = []
    const n = 16
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * (Math.PI * 2 - GAP) // along the ring's arc, skipping the break
      const h = 0.09 + 0.2 * Math.abs(Math.cos(a - Math.PI)) ** 3 + ((i * 7) % 3) * 0.015
      out.push({ a, h, up: true })
    }
    for (let i = 0; i < 8; i++) out.push({ a: ((i + 0.5) / 8) * (Math.PI * 2 - GAP), h: 0.09, up: false })
    return out
  }, [])
  const mat = (i) => (
    <meshStandardMaterial ref={(m) => (mats.current[i] = m)} color="#0d0a12" metalness={0.85} roughness={0.25} emissive={VIOLET} emissiveIntensity={0.6} toneMapped={false} />
  )
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
        {mat(0)}
      </mesh>
      {spikes.map((s, i) => (
        <group key={i} rotation={[0, -s.a, 0]}>
          {s.up ? (
            <mesh position={[0.3, s.h / 2, 0]} rotation={[0, 0, -0.12]}>
              <coneGeometry args={[0.02, s.h, 6]} />
              {mat(i + 1)}
            </mesh>
          ) : (
            // inward prongs, pointing at the empty center
            <mesh position={[0.25, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.014, s.h, 5]} />
              {mat(i + 1)}
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

export default function CountNull({ script, scale = 1, palette }) {
  const root = useRef()
  const arm = useRef()
  const forearm = useRef()
  const crown = useRef()
  const orb = useRef()
  const glowRef = useRef(0)
  const maskG = useRef()
  const lightA = useRef()
  const fragG = useRef()
  const cur = useRef({ gesture: 0 })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    const c = cur.current
    c.gesture = THREE.MathUtils.lerp(c.gesture, s.gesture, Math.min(1, dt * 5))
    glowRef.current = s.crown
    root.current.position.y = Math.sin(t * 1.1) * 0.03
    arm.current.rotation.x = THREE.MathUtils.lerp(-0.5, -1.45, c.gesture)
    arm.current.rotation.z = THREE.MathUtils.lerp(0.42, 0.14, c.gesture)
    forearm.current.rotation.x = THREE.MathUtils.lerp(-1.0, -0.12, c.gesture)
    crown.current.visible = s.crownOn !== false
    maskG.current.visible = (s.mask ?? 1) > 0.5
    fragG.current.visible = !s.bare
    RIM.opacity = 0.85 * (s.rim ?? 1)
    RIM.visible = (s.rim ?? 1) > 0.02
    crown.current.position.y = CROWN_Y + (s.crownY ?? 0) + Math.sin(t * 1.6) * 0.025
    crown.current.rotation.y = Math.sin(t * 0.3) * 0.5
    const lit = s.rim ?? 1 // before the turn: no glow at all
    orb.current.emissiveIntensity = (0.8 + s.crown * 2.5 + Math.sin(t * 2) * 0.2) * lit
    if (lightA.current) lightA.current.intensity = 2.2 * lit
  })

  return (
    <group scale={scale}>
      <group ref={root}>
        {/* robes, drapes, the chevroned panel, the mantle and the pointed hood (sculpted) */}
        <NullPart name="nl_body" palette={palette} />
        <group ref={maskG}>
          <NullPart name="nl_mask" rim={false} />
        </group>
        {/* the chest orb and the collar orb */}
        <group position={[0, 1.72, 0.42]}>
          <mesh>
            <sphereGeometry args={[0.065, 32, 24]} />
            <meshStandardMaterial ref={orb} color="#120818" roughness={0.15} metalness={0.6} emissive={VIOLET} emissiveIntensity={1} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.09, 0.012, 8, 4]} />
            <meshStandardMaterial {...TRIM} emissive={VIOLET} emissiveIntensity={0.3} />
          </mesh>
        </group>
        <mesh position={[0, 2.38, 0.2]}>
          <sphereGeometry args={[0.045, 24, 16]} />
          <meshStandardMaterial color="#120818" roughness={0.15} metalness={0.6} emissive={VIOLET} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>

        {/* floating crown */}
        <group ref={crown} position={[0, CROWN_Y, 0]}>
          <NullCrown glowRef={glowRef} />
        </group>

        {/* resting (right) sleeve and curled hand */}
        <group position={[-0.36, 2.2, 0.02]} rotation={[0.05, 0, -0.12]}>
          <NullPart name="nl_rest" palette={palette} />
        </group>

        {/* raised (left) arm: open palm, fragments orbiting above it */}
        <group ref={arm} position={[0.36, 2.2, 0.02]}>
          <NullPart name="nl_upper" palette={palette} />
          <group ref={forearm} position={[0, -0.52, 0]}>
            <NullPart name="nl_fore" palette={palette} />
            <group ref={fragG} position={[0, -0.72, 0.32]}>
              <Fragments />
            </group>
          </group>
        </group>

        <pointLight ref={lightA} position={[0.9, 2.6, 1.6]} color={VIOLET} intensity={2.2} distance={4} />
        <pointLight position={[-0.7, 0.4, -0.9]} color="#ff9a3c" intensity={1.1} distance={2.6} />
      </group>
    </group>
  )
}
