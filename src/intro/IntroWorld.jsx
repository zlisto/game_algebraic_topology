import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../characters/Gyroid'
import CountNull from '../characters/CountNull'
import {
  NULL_POS,
  NULL_ROT_Y,
  RING,
  WALK_X0,
  WALK_X1,
  WALK_Y,
  WALK_Z,
  cameraAt,
  gyroidScript,
  gyroidTimeAt,
  nullScript,
  ringScript,
  seg,
} from '../data/introScript'

const TEAL = new THREE.Color('#3ecfbf')
const VIOLET = new THREE.Color('#8a3cff')

// ---------------------------------------------------------------- islands

/** Ringed island whose hole closes: torus (R, r) → R = 0 ball → point. */
function RingIsland() {
  const group = useRef()
  const mat = useRef()
  const flash = useRef()
  const beacons = useRef()
  const SEG_U = 96
  const SEG_V = 32
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.3, SEG_V, SEG_U), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const s = ringScript(t)
    const squash = 0.55 + 0.45 * s.corrupt // flat island → round ball as it collapses
    const pos = geo.attributes.position
    const nor = geo.attributes.normal
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

    group.current.scale.setScalar(Math.max(0.0001, s.shrink))
    group.current.visible = s.shrink > 0.001
    group.current.rotation.y = t * 0.05
    mat.current.color.copy(TEAL).lerp(VIOLET, s.corrupt).multiplyScalar(0.55)
    mat.current.emissive.copy(TEAL).lerp(VIOLET, s.corrupt)
    mat.current.emissiveIntensity = 0.35 + s.corrupt * 0.9 + Math.sin(t * 20) * 0.2 * s.corrupt

    beacons.current.children.forEach((b, i) => {
      const a = (i / 8) * Math.PI * 2
      b.position.set(Math.cos(a) * s.R, s.r * 0.55, Math.sin(a) * s.R)
      b.scale.setScalar(1 - s.corrupt)
    })

    const f = s.flash
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(0.2 + f * 9)
    flash.current.material.opacity = (1 - f) ** 2
  })

  return (
    <group position={RING}>
      <group ref={group}>
        <mesh geometry={geo}>
          <meshStandardMaterial ref={mat} color="#2a8c84" roughness={0.45} metalness={0.2} emissive="#3ecfbf" emissiveIntensity={0.35} />
        </mesh>
        <group ref={beacons}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh ref={flash}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#d9b8ff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function Rock({ radius = 2, depth = 3 }) {
  return (
    <mesh position={[0, -depth / 2, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[radius, depth, 7, 1]} />
      <meshStandardMaterial color="#1a2329" roughness={0.95} flatShading />
    </mesh>
  )
}

function TorusIsland({ position, R = 1.6, r = 0.4, tilt = 0 }) {
  return (
    <group position={position} rotation={[tilt, 0, tilt * 0.5]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, r, 20, 64]} />
        <meshStandardMaterial color="#2a7f78" roughness={0.45} emissive="#3ecfbf" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function WedgeIsland({ position }) {
  // two loops meeting at one point — a wedge of circles
  return (
    <group position={position}>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.28, 16, 48]} />
          <meshStandardMaterial color="#2a7f78" roughness={0.45} emissive="#3ecfbf" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.35, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <group position={[0, -0.3, 0]}>
        <Rock radius={1.2} depth={2.4} />
      </group>
    </group>
  )
}

function OrbIsland({ position, radius = 1.3 }) {
  return (
    <group position={position}>
      <mesh scale={[1, 0.45, 1]}>
        <sphereGeometry args={[radius, 24, 16]} />
        <meshStandardMaterial color="#25605c" roughness={0.6} emissive="#1e8a80" emissiveIntensity={0.25} />
      </mesh>
      <group position={[0, -0.2, 0]}>
        <Rock radius={radius * 0.9} depth={radius * 2.2} />
      </group>
    </group>
  )
}

/** Arched causeway; if `fromRing`, it snaps loose and falls when the ring collapses. */
function Causeway({ a, b, lift = 2.5, fromRing = false }) {
  const ref = useRef()
  const mat = useRef()
  const geo = useMemo(() => {
    const A = new THREE.Vector3(...a)
    const B = new THREE.Vector3(...b)
    const M = A.clone().add(B).multiplyScalar(0.5)
    M.y += lift
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, M, B), 48, 0.09, 6, false)
  }, [a, b, lift])
  useFrame(({ clock }) => {
    if (!fromRing) return
    const t = clock.elapsedTime
    const f = seg(t, 19.6, 22.5)
    ref.current.position.y = -9 * f * f
    ref.current.rotation.z = f * 0.25
    mat.current.opacity = 1 - f
    mat.current.emissive.copy(TEAL).lerp(VIOLET, seg(t, 15, 18))
  })
  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial ref={mat} color="#1d4e4a" emissive="#3ecfbf" emissiveIntensity={1.1} transparent toneMapped={false} />
    </mesh>
  )
}

function Archipelago() {
  const isl = {
    west: [-12, 1, -4],
    east: [12, -0.5, -5],
    north: [5, 2, -16],
    far: [-4, -0.5, -22],
    wedge: [16, 1.5, 6],
    sw: [-11, 0, 6],
  }
  return (
    <group>
      <TorusIsland position={isl.west} R={1.7} r={0.42} tilt={0.08} />
      <OrbIsland position={isl.east} radius={1.6} />
      <TorusIsland position={isl.north} R={2.2} r={0.5} tilt={-0.06} />
      <OrbIsland position={isl.far} radius={2} />
      <WedgeIsland position={isl.wedge} />
      <TorusIsland position={isl.sw} R={1.2} r={0.35} tilt={0.12} />
      <Causeway a={[-3.2, 0.2, 0]} b={isl.west} fromRing />
      <Causeway a={[3.2, 0.2, -0.5]} b={isl.east} fromRing />
      <Causeway a={[1.2, 0.2, -3]} b={isl.north} fromRing lift={3} />
      <Causeway a={[-1, 0.2, 3]} b={[-4, WALK_Y, WALK_Z]} fromRing lift={2} />
      <Causeway a={isl.west} b={isl.far} lift={4} />
      <Causeway a={isl.north} b={isl.far} lift={3} />
      <Causeway a={isl.east} b={isl.wedge} lift={3} />
      <Causeway a={isl.west} b={isl.sw} lift={2} />
      <Causeway a={isl.wedge} b={[WALK_X1, WALK_Y, WALK_Z]} lift={2.5} />
    </group>
  )
}

// ---------------------------------------------------------------- Retract Reef walkway

function Walkway() {
  const SLAB = 1
  const slabs = useMemo(() => {
    const out = []
    for (let x = WALK_X0 + SLAB / 2; x < WALK_X1; x += SLAB) {
      const fallsAt = x < 2.6 ? gyroidTimeAt(x) + 0.7 : Infinity
      out.push({ x, fallsAt, spin: Math.sin(x * 12.9) })
    }
    return out
  }, [])
  const refs = useRef([])
  const spineMat = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    slabs.forEach((s, i) => {
      const m = refs.current[i]
      if (!m) return
      const dt = t - s.fallsAt
      if (dt > 0) {
        m.position.y = WALK_Y - 0.2 - 4.9 * dt * dt
        m.rotation.set(dt * s.spin * 1.5, 0, dt * s.spin)
        m.material.opacity = Math.max(0, 0.9 - dt * 0.35)
        m.material.emissive.copy(VIOLET)
        m.visible = dt < 3
      } else {
        m.position.y = WALK_Y - 0.2 + (dt > -0.4 ? Math.sin(t * 60 + i) * 0.02 : 0) // shudder before falling
      }
    })
    const held = seg(t, 27.5, 29) * 0.8 + seg(t, 32.4, 33.4) * 1.6
    spineMat.current.emissiveIntensity = 1.2 + held + Math.sin(t * 4) * 0.15
  })

  return (
    <group>
      {slabs.map((s, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[s.x, WALK_Y - 0.2, WALK_Z]}>
          <boxGeometry args={[SLAB * 0.96, 0.38, 1.5]} />
          <meshStandardMaterial color="#2d6e6a" emissive="#1a6b63" emissiveIntensity={0.35} roughness={0.5} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* the amber spine: the part that stays fixed */}
      <mesh position={[(WALK_X0 + WALK_X1) / 2, WALK_Y - 0.03, WALK_Z]}>
        <boxGeometry args={[WALK_X1 - WALK_X0, 0.07, 0.16]} />
        <meshStandardMaterial ref={spineMat} color="#f0b27a" emissive="#ff9a2a" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {[-12, -7, -2, 3].map((x) => (
        <mesh key={x} position={[x, WALK_Y - 3.6, WALK_Z]}>
          <cylinderGeometry args={[0.18, 0.5, 6.4, 7]} />
          <meshStandardMaterial color="#14262b" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- Null's spire + beam

function Spire() {
  return (
    <group position={[NULL_POS[0], 0, NULL_POS[2]]}>
      <mesh position={[0, (NULL_POS[1] - 7) / 2 - 0.15, 0]}>
        <coneGeometry args={[1.6, NULL_POS[1] + 7, 6, 1, true]} />
        <meshStandardMaterial color="#0e0b13" roughness={0.4} metalness={0.5} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, NULL_POS[1] - 0.08, 0]}>
        <cylinderGeometry args={[1.1, 0.9, 0.16, 6]} />
        <meshStandardMaterial color="#120d18" metalness={0.6} roughness={0.3} emissive="#5a2a9a" emissiveIntensity={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.05, NULL_POS[1] + 0.35, Math.sin(a) * 1.05]} rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]}>
            <coneGeometry args={[0.07, 0.8, 4]} />
            <meshStandardMaterial color="#0d0a12" emissive="#a259ff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function CollapseBeam() {
  const ref = useRef()
  const from = useMemo(() => new THREE.Vector3(NULL_POS[0], NULL_POS[1] + 3.05, NULL_POS[2]), [])
  const to = useMemo(() => new THREE.Vector3(RING[0], RING[1] + 0.3, RING[2]), [])
  const { mid, quat, len } = useMemo(() => {
    const d = to.clone().sub(from)
    return {
      mid: from.clone().add(to).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()),
      len: d.length(),
    }
  }, [from, to])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const b = ringScript(t).beam
    ref.current.visible = b > 0.01
    const w = b * (0.7 + Math.sin(t * 40) * 0.3)
    ref.current.scale.set(w, 1, w)
  })
  return (
    <mesh ref={ref} position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.12, 0.3, len, 12, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

// ---------------------------------------------------------------- camera

function Director({ onTick }) {
  const { camera, clock } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  // dev: ?t=20 jumps to 20s; add &pause to hold that frame
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const seek = useRef(Number(params.get('t')) || 0)
  const hold = useMemo(() => (params.has('pause') ? seek.current : null), [params])
  useFrame(() => {
    if (seek.current) {
      clock.elapsedTime = seek.current // after the clock has started, or start() would reset it
      seek.current = 0
    }
    if (hold !== null) clock.elapsedTime = hold
    const t = clock.elapsedTime
    const { pos, target } = cameraAt(t)
    const shake = seg(t, 19.8, 20.2) * (1 - seg(t, 20.2, 21.2)) * 0.25
    camera.position.set(
      pos[0] + (Math.random() - 0.5) * shake,
      pos[1] + (Math.random() - 0.5) * shake,
      pos[2] + (Math.random() - 0.5) * shake,
    )
    look.set(...target)
    camera.lookAt(look)
    onTick(t)
  })
  return null
}

// ---------------------------------------------------------------- scene

export default function IntroWorld({ onTick }) {
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 22, 70]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#4a7fa8', '#0a0a14', 0.5]} />
      <directionalLight position={[10, 18, 12]} intensity={1.1} color="#cfe8f4" />
      <pointLight position={[6, 3, 12]} intensity={8} distance={14} color="#ffb347" />
      <pointLight position={[0, 4, 0]} intensity={6} distance={14} color="#3ecfbf" />

      <Stars radius={90} depth={40} count={2500} factor={3} fade speed={0.4} />
      <Sparkles count={160} scale={[50, 10, 50]} position={[0, 2, 0]} size={2.2} speed={0.25} color="#7fe8dc" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#04161a" emissive="#06343a" emissiveIntensity={0.4} roughness={0.25} metalness={0.6} />
      </mesh>

      <RingIsland />
      <Archipelago />
      <Walkway />
      <Spire />
      <CollapseBeam />

      <group position={NULL_POS} rotation={[0, NULL_ROT_Y, 0]}>
        <CountNull script={nullScript} />
      </group>
      <Gyroid script={gyroidScript} />

      <Director onTick={onTick} />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}
