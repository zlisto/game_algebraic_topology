import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'

/**
 * The Delta Sphere: a vast pale sphere standing in the mouth of Chain Delta, its top sliced flat
 * into Count Null's court (the arena). Villages glow on its flanks; meridian ribs curl up round
 * the court; a gold armillary turns overhead. Shared by the intro, the boss level and the outro.
 *
 * Coordinates: the court's floor is at local y = 0 and the sphere's centre CAP_H below it.
 * In the movies the court sits TOP above the water; in the boss level the water is TOP below.
 */

export const TOP = 20
export const SPH_R = 14
export const CAP_H = 10.55 // the court's floor above the sphere's centre
export const ARENA_R = 8.6
const CAP_THETA = Math.acos(CAP_H / SPH_R) // where the sphere is sliced
const VIOLET = '#a259ff'

const rng = (seed) => {
  let s = seed % 2147483647 || 1
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** A point on the sphere at polar angle th (from the top) and azimuth ph, in court coordinates. */
export const onSphere = (th, ph, lift = 0) => {
  const r = SPH_R + lift
  return [r * Math.sin(th) * Math.cos(ph), -CAP_H + r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)]
}

/**
 * The sphere body (sliced at the court), its villages and its glowing latitudes.
 * `look()` (optional, per frame) → { corrupt 0..1, lightsOut 0..1 } for the outro's fall.
 */
export function SphereBody({ look }) {
  const mat = useRef()
  const lights = useRef()
  const bands = useRef()
  const villages = useMemo(() => {
    const r = rng(17)
    const out = []
    for (let i = 0; i < 150; i++) {
      const th = CAP_THETA + 0.12 + r() * 1.55
      const ph = r() * Math.PI * 2
      out.push([onSphere(th, ph, 0.08), th, ph, r()])
    }
    return out
  }, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const STONE = useMemo(() => new THREE.Color('#d9d2e6'), [])
  const SICK = useMemo(() => new THREE.Color('#6a3cb0'), [])
  useFrame(({ clock }) => {
    const s = look ? look() : { corrupt: 0, lightsOut: 0 }
    const t = clock.elapsedTime
    if (mat.current) {
      mat.current.color.copy(STONE).lerp(SICK, s.corrupt)
      mat.current.emissiveIntensity = 0.08 + s.corrupt * (0.5 + Math.max(0, Math.sin(t * 18)) * 0.25)
    }
    if (lights.current) {
      villages.forEach(([p, th, ph, k], i) => {
        const on = k >= (s.lightsOut || 0)
        dummy.position.set(p[0], p[1], p[2])
        dummy.lookAt(0, -CAP_H, 0)
        dummy.scale.setScalar(on ? 1 + Math.sin(t * 2 + k * 20) * 0.08 : 0.0001)
        dummy.updateMatrix()
        lights.current.setMatrixAt(i, dummy.matrix)
      })
      lights.current.instanceMatrix.needsUpdate = true
    }
    if (bands.current) bands.current.rotation.y = t * 0.03
  })
  return (
    <group>
      <mesh position={[0, -CAP_H, 0]}>
        <sphereGeometry args={[SPH_R, 96, 64, 0, Math.PI * 2, CAP_THETA, Math.PI - CAP_THETA]} />
        <meshStandardMaterial ref={mat} color="#d9d2e6" roughness={0.75} metalness={0.05} emissive="#5a2aa8" emissiveIntensity={0.08} />
      </mesh>
      <instancedMesh ref={lights} args={[null, null, villages.length]}>
        <boxGeometry args={[0.26, 0.26, 0.12]} />
        <meshBasicMaterial color="#ffc070" toneMapped={false} />
      </instancedMesh>
      {/* glowing latitudes and meridians, faint, like a globe's grid */}
      <group ref={bands} position={[0, -CAP_H, 0]}>
        {[0.95, 1.3, 1.65, 2.0, 2.35].map((th) => (
          <mesh key={th} position={[0, SPH_R * Math.cos(th), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[SPH_R * Math.sin(th) + 0.04, 0.05, 6, 120]} />
            <meshBasicMaterial color="#b88aff" transparent opacity={0.55} toneMapped={false} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          // meridians stop at the court's rim: the arc leaves a gap round the sliced top
          <mesh key={i} rotation={[0, (i / 8) * Math.PI, Math.PI / 2 + CAP_THETA]}>
            <torusGeometry args={[SPH_R + 0.04, 0.035, 6, 160, Math.PI * 2 - 2 * CAP_THETA]} />
            <meshBasicMaterial color="#8a5aff" transparent opacity={0.28} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** The flattened pole: Null's court — an engraved floor, its rim, and meridian ribs curling up. */
export function Court() {
  const ribs = useMemo(() => {
    const out = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.3) continue // the gap at +z where Gyroid comes in
      out.push(a)
    }
    return out
  }, [])
  const gyre = useRef()
  useFrame(({ clock }) => {
    if (gyre.current) gyre.current.rotation.y = -clock.elapsedTime * 0.12
  })
  return (
    <group>
      {/* the floor slab, pale stone */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[ARENA_R + 0.5, ARENA_R + 0.2, 0.8, 72]} />
        <meshStandardMaterial color="#cfc6e0" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[ARENA_R + 0.45, 72]} />
        <meshStandardMaterial color="#2a2238" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* engraved latitudes (concentric) and meridians (radial), glowing violet */}
      <group ref={gyre}>
        {[1.6, 3.2, 4.8, 6.4, 8.0].map((r) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
            <ringGeometry args={[r - 0.04, r + 0.04, 96]} />
            <meshBasicMaterial color="#6a3ac0" transparent opacity={0.45} />
          </mesh>
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 4.8, 0.012, Math.sin(a) * 4.8]} rotation={[-Math.PI / 2, 0, -a]}>
              <planeGeometry args={[6.4, 0.06]} />
              <meshBasicMaterial color="#6a3ac0" transparent opacity={0.35} />
            </mesh>
          )
        })}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[ARENA_R - 0.05, ARENA_R + 0.3, 96]} />
        <meshBasicMaterial color="#c9a2ff" toneMapped={false} />
      </mesh>
      {/* the meridian ribs: pale arcs that curl up from the rim and stop short, like a half-built globe */}
      {ribs.map((a) => (
        <group key={a} position={[Math.cos(a) * (ARENA_R + 0.7), 0, Math.sin(a) * (ARENA_R + 0.7)]} rotation={[0, -a, 0]}>
          <mesh position={[-3.2, 0, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[3.2, 0.2, 8, 24, Math.PI * 0.42]} />
            <meshStandardMaterial color="#e2dcef" roughness={0.5} emissive="#5a2aa8" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[-3.2 + 3.2 * Math.cos(Math.PI * 0.42), 3.2 * Math.sin(Math.PI * 0.42), 0]}>
            <sphereGeometry args={[0.2, 12, 10]} />
            <meshStandardMaterial color="#f0e6ff" emissive={VIOLET} emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The gold armillary: three great circles turning slowly round the court. */
export function Armillary({ y = -7, r = 24 }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!g.current) return
    g.current.children.forEach((m, i) => {
      m.rotation.set(0.5 + i * 0.7, t * (0.05 + i * 0.02), 0.3 * i)
    })
  })
  return (
    <group ref={g} position={[0, y, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <torusGeometry args={[r + i * 1.4, 0.09, 6, 180]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ff9a3a" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** The whole citadel: the sphere, the court and the armillary (court floor at local y = 0). */
export default function SphereCitadel({ look, armillary = false }) {
  return (
    <>
      <SphereBody look={look} />
      <Court />
      {armillary && <Armillary />}
    </>
  )
}

/** Reeds standing in the delta's shallows round the sphere. */
function Reeds({ y, inner = 18, outer = 60, count = 420, seed = 5 }) {
  const ref = useRef()
  const spots = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2
      const d = inner + Math.sqrt(r()) * (outer - inner)
      return [Math.cos(a) * d, Math.sin(a) * d, 0.6 + r() * 1.6, r()]
    })
  }, [inner, outer, count, seed])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    spots.forEach(([x, z, h, k], i) => {
      dummy.position.set(x, y + h / 2 - 0.1, z)
      dummy.rotation.set(Math.sin(t * 0.9 + k * 9) * 0.08, 0, Math.cos(t * 0.7 + k * 7) * 0.08)
      dummy.scale.set(1, h, 1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, spots.length]}>
      <coneGeometry args={[0.06, 1, 4]} />
      <meshStandardMaterial color="#5f7a4a" roughness={0.9} emissive="#1a2a10" emissiveIntensity={0.3} />
    </instancedMesh>
  )
}

/** Triangle-tiled mudflats glinting in the delta: Chain Delta, waiting (World 2). */
function Flats({ y }) {
  const tris = useMemo(() => {
    const r = rng(29)
    const out = []
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2
      const d = 26 + r() * 40
      out.push([Math.cos(a) * d, Math.sin(a) * d, r() * Math.PI * 2, 1.2 + r() * 2.2])
    }
    return out
  }, [])
  return tris.map(([x, z, rot, s], i) => (
    <mesh key={i} position={[x, y + 0.03, z]} rotation={[-Math.PI / 2, 0, rot]}>
      <circleGeometry args={[s, 3]} />
      <meshStandardMaterial color="#3a4a3a" roughness={0.8} emissive="#7fe8dc" emissiveIntensity={i % 5 === 0 ? 0.25 : 0.03} />
    </mesh>
  ))
}

/** Sky, delta water, reeds, flats, clouds and rocks. `y` is the water's height. */
export function Delta({ y = 0, sky = '#140c24', fog = [40, 150], life = 0.5, seascape = true }) {
  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, fog[0], fog[1]]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#c8b0ff', '#0a1418', 0.5]} />
      <directionalLight position={[-30, 40, 20]} intensity={0.8} color="#ffd8c0" />
      <Stars radius={140} depth={50} count={2200} factor={3} fade speed={0.3} />
      {seascape && <Seascape y={y} depth={2.6} area={[0, 10, 150, 150]} seed={53} life={life} lanterns={16} palette={{ water: '#163c48', deep: '#071a20', sand: '#33483e', weed: '#2a5038', coral: ['#c58bff', '#7fe8dc', '#ffd27a'] }} />}
      <Reeds y={y} />
      <Flats y={y} />
      <Clouds y={y + 34} area={[0, 0, 160, 160]} count={16} color="#b89ae8" opacity={0.2} seed={12} speed={0.2} />
      <FloatingRocks center={[0, y + 14, 0]} radius={[24, 40]} count={26} seed={19} ySpread={[0, 18]} color="#2a2236" glow={VIOLET} />
      <Sparkles count={120} scale={[50, 20, 50]} position={[0, y + 14, 0]} size={3} speed={0.3} color="#d0a8ff" />
    </>
  )
}
