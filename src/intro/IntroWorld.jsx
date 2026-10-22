import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAND } from '../theme/palette'
import ReefScenery from '../world/ReefScenery'
import Gyroid from '../characters/Gyroid'
import CountNull, { CROWN_Y } from '../characters/CountNull'
import {
  ANCHOR,
  INTRO_START,
  loopScript,
  POINT_AT,
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
  storyAt,
  wallAt,
} from '../data/introScript'

const STONE = new THREE.Color(LAND.stone)
const ROUTE = new THREE.Color(LAND.causeway) // causeway glow
const VIOLET = new THREE.Color('#8a3cff')
const WHITE = new THREE.Color('#ffffff')
const LILAC = new THREE.Color('#b99cff')
const easeOutQ = (x) => 1 - (1 - x) ** 3
/** a soft white disc, transparent at the edge: the flash */
const GLOW = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.18, 'rgba(240,225,255,0.85)')
  r.addColorStop(0.45, 'rgba(180,140,255,0.25)')
  r.addColorStop(1, 'rgba(120,80,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

// ---------------------------------------------------------------- islands

/** Ringed island whose hole closes: torus (R, r) → R = 0 ball → point. */
function RingIsland() {
  const group = useRef()
  const mat = useRef()
  const flash = useRef()
  const beacons = useRef()
  const windows = useRef()
  const glow = useRef()
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
    group.current.position.y = s.corrupt * 1.5 // lifted out of the sea as Null's beam takes it, so the ball reads whole
    group.current.visible = s.shrink > 0.001
    group.current.rotation.y = t * 0.05
    // lit, not glowing: keep the emissive low so the ball shows its shading — until it's a point, which burns white
    mat.current.color.copy(STONE).lerp(LILAC, s.corrupt * 0.6).lerp(WHITE, s.point)
    mat.current.emissive.copy(STONE).lerp(VIOLET, s.corrupt).lerp(WHITE, s.point)
    mat.current.emissiveIntensity = 0.12 + s.corrupt * 0.1 + Math.max(0, Math.sin(t * 20)) * 0.12 * s.corrupt + s.point * 6
    glow.current.intensity = s.corrupt * 14 * (1 - s.point * 0.3) * (t < POINT_AT ? 1 : 0)
    windows.current.children.forEach((w, i) => {
      const a = (i / windows.current.children.length) * Math.PI * 2 + 0.2
      const rr = s.R + (i % 2 ? 0.32 : -0.32) * s.r
      w.position.set(Math.cos(a) * rr, s.r * 0.53, Math.sin(a) * rr)
      w.rotation.y = -a
      w.visible = s.corrupt < 0.5 && (i * 7) % 5 !== 0 // a few windows dark, the rest lit: people live here
    })

    beacons.current.children.forEach((b, i) => {
      const a = (i / 8) * Math.PI * 2
      b.position.set(Math.cos(a) * s.R, s.r * 0.55, Math.sin(a) * s.R)
      b.scale.setScalar(1 - s.corrupt)
    })

    // a small, fast white flash where the point was
    const f = s.flash
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(1 + easeOutQ(f) * 9)
    flash.current.position.y = 1.5
    flash.current.material.opacity = (1 - f) ** 2
  })

  return (
    <group position={RING}>
      <group ref={group}>
        <mesh geometry={geo}>
          <meshStandardMaterial ref={mat} color={LAND.stone} roughness={0.55} metalness={0.15} emissive={LAND.stone} emissiveIntensity={0.25} />
        </mesh>
        <pointLight ref={glow} color="#f0e4ff" intensity={0} distance={14} position={[-4.5, 4, 0.5]} />
        <group ref={windows}>
          {Array.from({ length: 22 }, (_, i) => (
            <mesh key={i}>
              <boxGeometry args={[0.16, 0.12, 0.05]} />
              <meshBasicMaterial color="#ffb860" toneMapped={false} />
            </mesh>
          ))}
        </group>
        <group ref={beacons}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
      <sprite ref={flash}>
        <spriteMaterial map={GLOW} color="#f4e8ff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
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
    // the ring is torn up out of the sea: its causeways jolt, snap at the ring end and fall
    const jolt = t > 14.8 && t < 15.3 ? Math.sin(t * 90) * 0.06 : 0
    const f = seg(t, 15.2, 17.6)
    ref.current.position.y = -7 * f * f + jolt
    ref.current.rotation.z = f * 0.3
    mat.current.opacity = 1 - f
    mat.current.emissive.copy(ROUTE).lerp(VIOLET, seg(t, 14.4, 15.2))
  })
  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial ref={mat} color={LAND.causewayCore} emissive={LAND.causeway} emissiveIntensity={0.9} transparent toneMapped={false} />
    </mesh>
  )
}

/** The Ringed Isle's causeways to the real sites — they snap loose when Null collapses it. */
function RingCauseways() {
  return (
    <group>
      <Causeway a={[-1.4, 0.2, 2.6]} b={[-3, WALK_Y, WALK_Z]} fromRing lift={2} />
      <Causeway a={[-2.9, 0.2, 0.4]} b={[-17.3, 0.3, 1.6]} fromRing lift={3} />
      <Causeway a={[-0.9, 0.2, -2.8]} b={[-3.6, 0.3, -9.9]} fromRing lift={2.4} />
      <Causeway a={[2.9, 0.2, -0.6]} b={[12.2, 0.2, -2.2]} fromRing lift={2.6} />
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
          <meshStandardMaterial color={LAND.stone} emissive={LAND.stoneEmissive} emissiveIntensity={0.5} roughness={0.55} transparent opacity={0.95} />
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
          <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- Null's spire + beam

function Spire() {
  const spikes = useRef([])
  useFrame(({ clock }) => {
    const on = clock.elapsedTime >= 0 ? 1.2 : 0 // lit once Null is home
    for (const m of spikes.current) if (m) m.emissiveIntensity = on
  })
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
            <meshStandardMaterial ref={(m) => (spikes.current[i] = m)} color="#0d0a12" emissive="#a259ff" emissiveIntensity={0} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function CollapseBeam() {
  const ref = useRef()
  const from = useMemo(() => new THREE.Vector3(NULL_POS[0], NULL_POS[1] + CROWN_Y + 0.03, NULL_POS[2]), [])
  const to = useMemo(() => new THREE.Vector3(RING[0], RING[1] + 1.5, RING[2]), []) // the ball's centre once it's lifted
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

/** thin spiral arms of a whirlpool, drawn in the xy-plane */
const ARMS = [0, 1, 2, 3].map((j) => {
  const pts = Array.from({ length: 40 }, (_, i) => {
    const u = i / 39
    const a = j * (Math.PI / 2) + u * Math.PI * 1.6
    const r = 0.3 + u * 3.2
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
  })
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.05, 4, false)
})

/** Where the Ringed Isle stood: a slow violet whirlpool, and the snapped stumps of its causeways. */
function EmptySite() {
  const g = useRef()
  const swirl = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const k = seg(t, 21, 24)
    g.current.visible = k > 0
    swirl.current.rotation.z = -t * 0.6
    for (const m of swirl.current.children) m.material.opacity = 0.45 * k
  })
  return (
    <group ref={g} position={[RING[0], -0.44, RING[2]]}>
      <group ref={swirl} rotation={[-Math.PI / 2, 0, 0]}>
        {ARMS.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshBasicMaterial color="#9a5cff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      {[
        [-1.4, 2.6],
        [-2.9, 0.4],
        [-0.9, -2.8],
        [2.9, -0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x * 1.35, 0.2, z * 1.35]} rotation={[0.5, Math.atan2(x, z), 0.3]}>
          <cylinderGeometry args={[0.1, 0.14, 0.9, 6]} />
          <meshStandardMaterial color={LAND.causewayCore} emissive="#6a3aa0" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** "Every loop I walk starts here": a loop that leaves the anchor on the spine, rounds the gap where the walkway fell, and comes back. */
function BasedLoop() {
  const tube = useRef()
  const pin = useRef()
  const geo = useMemo(() => {
    const L = 5.4
    const Wd = 2.4
    const pts = Array.from({ length: 97 }, (_, i) => {
      const th = (i / 96) * Math.PI * 2
      return new THREE.Vector3(ANCHOR[0] - L * Math.sin(th / 2) ** 2, WALK_Y + 0.12, ANCHOR[1] + Wd * Math.sin(th) * Math.sin(th / 2))
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.035, 6, true)
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const s = loopScript(t)
    tube.current.visible = s.draw > 0
    geo.setDrawRange(0, Math.floor(geo.index.count * s.draw / 3) * 3)
    tube.current.material.emissiveIntensity = 2 + s.pin * 1.5 + Math.sin(t * 5) * 0.3
    pin.current.visible = s.draw > 0
    pin.current.scale.setScalar(0.6 + s.pin * 0.8)
  })
  return (
    <group>
      <mesh ref={tube} geometry={geo}>
        <meshStandardMaterial color="#ffcf7a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* the anchor: the basepoint every loop starts and ends at */}
      <mesh ref={pin} position={[ANCHOR[0], WALK_Y + 0.25, ANCHOR[1]]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#fff2c4" emissive="#ffd27a" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Count Null, who is not on his spire until the narrator turns to find him. */
function NullOnSpire() {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.visible = clock.elapsedTime >= 0
  })
  return (
    <group ref={ref} position={NULL_POS} rotation={[0, NULL_ROT_Y, 0]}>
      <CountNull script={nullScript} />
    </group>
  )
}

// ---------------------------------------------------------------- camera

/**
 * Owns the clock: counts real seconds and writes the paced story time into
 * clock.elapsedTime, which every other useFrame in the scene reads.
 * Priority -1 runs it before them each frame.
 */
function Director({ onTick, gate, audioWall }) {
  const { camera, clock } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  // dev: ?t=20 jumps to story time 20; add &pause to hold that frame
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const wall = useRef(null)
  useFrame((_, dt) => {
    if (wall.current === null) wall.current = wallAt(params.has('t') ? Number(params.get('t')) : INTRO_START)
    else if (!params.has('pause')) {
      // captions hold the movie until clicked through (gate returns the time to stop at)
      let next = wall.current + Math.min(dt, 0.1)
      // the score runs on the audio clock: if the picture fell behind it (a slow frame), catch up
      const heard = audioWall?.()
      if (heard != null && heard > next) next = Math.min(heard, wall.current + 0.5)
      else if (heard != null && heard < next - 0.04) next = Math.max(wall.current, wall.current + Math.min(dt, 0.1) * 0.6) // music behind: slow the picture to let it catch up
      const stop = gate ? gate(storyAt(wall.current), storyAt(next)) : null
      wall.current = stop === null ? next : Math.max(wall.current, wallAt(stop))
    }
    const t = storyAt(wall.current)
    clock.elapsedTime = t
    const { pos, target } = cameraAt(t)
    const shake = seg(t, POINT_AT, POINT_AT + 0.15) * (1 - seg(t, POINT_AT + 0.15, POINT_AT + 1)) * 0.25
    camera.position.set(
      pos[0] + (Math.random() - 0.5) * shake,
      pos[1] + (Math.random() - 0.5) * shake,
      pos[2] + (Math.random() - 0.5) * shake,
    )
    look.set(...target)
    camera.lookAt(look)
    onTick(t, wall.current)
  }, -1)
  return null
}

// ---------------------------------------------------------------- scene

export default function IntroWorld({ onTick, gate, audioWall }) {
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 22, 70]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#4a7fa8', '#0a0a14', 0.5]} />
      <directionalLight position={[10, 18, 12]} intensity={1.1} color="#cfe8f4" />
      <pointLight position={[6, 3, 12]} intensity={8} distance={14} color="#ffb347" />
      <pointLight position={[0, 4, 0]} intensity={6} distance={14} color={LAND.light} />

      <Stars radius={90} depth={40} count={2500} factor={3} fade speed={0.4} />
      <Sparkles count={160} scale={[50, 10, 50]} position={[0, 2, 0]} size={2.2} speed={0.25} color="#7fe8dc" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#04161a" emissive="#06343a" emissiveIntensity={0.4} roughness={0.25} metalness={0.6} />
      </mesh>

      <RingIsland />
      {/* the real Retract Reef — the same layout the level and the bible map use */}
      <ReefScenery y={0.3} staticSites skipSites={['the_walkway']} ruin={false} throne={false} />
      <RingCauseways />
      <Walkway />
      <Spire />
      <CollapseBeam />
      <EmptySite />
      <BasedLoop />

      <NullOnSpire />
      <Gyroid script={gyroidScript} />

      <Director onTick={onTick} gate={gate} audioWall={audioWall} />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}
