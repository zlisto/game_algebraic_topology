import { useFrame } from '@react-three/fiber'
import { Html, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import { klein, surface } from '../../characters/Bestiary'
import { Throne } from '../../levels/w0/CastleScene'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import OverworldKit from '../../levels/w0/OverworldKit'
import ReefGame from '../../levels/w0/ReefGame'
import SpaceModel from '../../levels/w0/SpaceModel'
import MathText from '../../screens/MathText'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks, Gear } from '../../world/Dressing'
import { ANCHORS, ENGINE_AT, EXHIBITS, PANELS } from './stagesCastle2'

/**
 * The Retractor: Count Null's engine-hall at the mouth of Chain Delta. The floor is a disk of
 * oriented triangle tiles over a gold underplate, so every shared edge glows as a seam. A
 * palisade of triangular press-plates rings it, open to the south where the causeway comes in.
 * Behind the throne the Retractor itself: a hollow ball of triangles (a Δ-complex sphere)
 * gripped by gyroscope clamps and six violet chains, with two great gears turning beside it.
 */

export const ARENA_R = 8.6
const GOLD = '#ffd27a'
const VIOLET = '#a259ff'
const RED = '#ff4a6a'
const BALL_Y = 6.8
const BALL_R = 4.2

// ---------------------------------------------------------------- the hall

/** Triangle tiles in a triangular lattice, inside radius r; up and down triangles alternate. */
function useTriTiles(r, side = 0.9) {
  return useMemo(() => {
    const out = []
    const h = (side * Math.sqrt(3)) / 2
    for (let row = -Math.ceil(r / h) - 1; row <= Math.ceil(r / h) + 1; row++) {
      for (let col = -Math.ceil((2 * r) / side) - 2; col <= Math.ceil((2 * r) / side) + 2; col++) {
        const up = (row + col) % 2 === 0
        const x = (col * side) / 2
        const z = row * h + (up ? h / 3 : (2 * h) / 3) - h / 2
        if (Math.hypot(x, z) > r - 0.35) continue
        out.push([x, z, up ? 0 : Math.PI])
      }
    }
    return out
  }, [r, side])
}

export function DeltaHall({ seamGlow = 1, opening = true }) {
  const tiles = useTriTiles(ARENA_R)
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const under = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    tiles.forEach(([x, z, rot], i) => {
      const d = Math.hypot(x - ENGINE_AT[0], z - ENGINE_AT[1])
      dummy.position.set(x, -0.04 + Math.sin(d * 1.1 - t * 2.0) * 0.03, z)
      dummy.rotation.set(0, rot + Math.PI / 6, 0) // a 3-sided cylinder: rotate so one edge lies along x
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
    if (under.current) under.current.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.15 * seamGlow
  })
  const avoid = useMemo(() => (x, z) => Math.hypot(x, z) < ARENA_R + 3 || Math.hypot(x - ENGINE_AT[0], z - ENGINE_AT[1]) < 9 || (Math.abs(x) < 2 && z > 0), [])
  return (
    <>
      <color attach="background" args={['#070914']} />
      <fog attach="fog" args={['#070914', 26, 72]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#a8c0ff', '#141030', 0.6]} />
      <directionalLight position={[10, 18, 12]} intensity={0.75} color="#e0e4ff" />
      <pointLight position={[0, 5, -7]} intensity={26} distance={22} color={VIOLET} />
      <pointLight position={[0, 6, 4]} intensity={10} distance={20} color="#ffd8a0" />
      <Stars radius={95} depth={40} count={1800} factor={2.6} fade speed={0.3} />
      <Sparkles count={140} scale={[22, 6, 22]} position={[0, 2, 0]} size={2} speed={0.3} color={GOLD} opacity={0.5} />
      {/* the delta: dark channels with lanterns, cloud banks, rocks drifting below */}
      <Seascape y={-1.1} depth={2.2} area={[0, -6, 110, 110]} seed={22} life={0.55} lanterns={14} avoid={avoid} palette={{ water: '#1d3468', deep: '#0a1028', sand: '#2a3050', weed: '#2a2a5a', coral: ['#ffd27a', '#c58bff', '#5ad6c8', '#ff7a8a', '#8aa8ff'] }} />
      <DeltaIslets />
      <Clouds y={-3} area={[0, 0, 90, 90]} count={16} color="#8a7ad8" opacity={0.2} seed={12} speed={0.22} />
      <FloatingRocks center={[0, 0, -4]} radius={[16, 30]} count={26} seed={17} ySpread={[-9, -2]} />
      {/* the floor: a gold underplate, so the gaps between tiles glow as seams */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[ARENA_R + 0.4, ARENA_R - 0.4, 0.8, 72]} />
        <meshStandardMaterial color="#0e0c1a" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh ref={under} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.075, 0]}>
        <circleGeometry args={[ARENA_R - 0.2, 72]} />
        <meshBasicMaterial color="#e0a83a" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <instancedMesh ref={inst} args={[null, null, tiles.length]}>
        <cylinderGeometry args={[0.44, 0.44, 0.08, 3]} />
        <meshStandardMaterial color="#1a1c34" roughness={0.35} metalness={0.45} emissive="#151040" emissiveIntensity={0.4} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[ARENA_R - 0.1, ARENA_R + 0.25, 96]} />
        <meshBasicMaterial color="#8a5aff" toneMapped={false} />
      </mesh>
      <Palisade opening={opening} />
    </>
  )
}

/** Little triangle-tiled islets out in the delta, each with a lantern. */
function DeltaIslets() {
  const spots = useMemo(
    () => [
      [-22, -6, 2.6], [-19, 10, 1.8], [21, -4, 2.2], [24, 12, 2.8], [-30, -22, 3.2], [30, -26, 3], [-12, 24, 1.6], [14, 26, 2], [-36, 6, 2.4], [38, 2, 2.6],
    ],
    [],
  )
  return (
    <>
      {spots.map(([x, z, r], i) => (
        <group key={i} position={[x, -1.05, z]}>
          <mesh rotation={[0, i * 0.7, 0]}>
            <cylinderGeometry args={[r, r * 1.1, 0.4, 3]} />
            <meshStandardMaterial color="#1c2040" roughness={0.6} emissive="#20184a" emissiveIntensity={0.3} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, i * 0.7 + Math.PI / 2]} position={[0, 0.21, 0]}>
            <ringGeometry args={[r * 0.46, r * 0.5, 3]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 1.0, 6]} />
            <meshStandardMaterial color="#2a2238" />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color={i % 3 ? GOLD : '#c58bff'} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** Tall triangular press-plates round the floor, each with a glowing oriented edge; open to the south. */
function Palisade({ opening }) {
  const plate = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.9, 0)
    s.lineTo(0.9, 0)
    s.lineTo(0, 4.6)
    s.closePath()
    return new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false })
  }, [])
  const n = 18
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        if (opening && Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.25) return null // the gap the causeway enters by
        const flip = i % 2 === 1
        return (
          <group key={i} position={[Math.cos(a) * (ARENA_R + 0.9), 0, Math.sin(a) * (ARENA_R + 0.9)]} rotation={[0, -a - Math.PI / 2, 0]}>
            <group rotation={[flip ? 0.1 : -0.18, 0, 0]} scale={flip ? 0.72 : 1}>
              <mesh geometry={plate} position={[0, 0, -0.09]}>
                <meshStandardMaterial color="#2c2856" roughness={0.3} metalness={0.5} emissive="#3a2490" emissiveIntensity={0.55} />
              </mesh>
              {/* the oriented edge: a gold seam up the left side, and its arrowhead */}
              <mesh position={[-0.45, 2.3, 0.1]} rotation={[0, 0, -Math.atan2(0.9, 4.6)]}>
                <boxGeometry args={[0.05, 4.7, 0.04]} />
                <meshBasicMaterial color={GOLD} toneMapped={false} />
              </mesh>
              <mesh position={[-0.2, 3.6, 0.1]} rotation={[0, 0, -Math.atan2(0.9, 4.6)]}>
                <coneGeometry args={[0.12, 0.3, 3]} />
                <meshBasicMaterial color={GOLD} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0.06, 0.1]}>
                <boxGeometry args={[1.8, 0.05, 0.04]} />
                <meshBasicMaterial color="#8a5aff" toneMapped={false} />
              </mesh>
              <mesh position={[0.45, 2.3, 0.1]} rotation={[0, 0, Math.atan2(0.9, 4.6)]}>
                <boxGeometry args={[0.04, 4.7, 0.04]} />
                <meshBasicMaterial color="#8a5aff" toneMapped={false} />
              </mesh>
            </group>
          </group>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------- the Retractor

function Chain({ from, to, links = 16, color = '#b070ff', slack = 0, linkR = 0.16 }) {
  // a sagging line of links from `from` to `to`
  const items = useMemo(() => {
    const out = []
    for (let i = 0; i <= links; i++) {
      const k = i / links
      const p = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k - Math.sin(Math.PI * k) * slack, from[2] + (to[2] - from[2]) * k]
      out.push(p)
    }
    return out
  }, [from, to, links, slack])
  const dir = useMemo(() => new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize(), [from, to])
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir), [dir])
  return (
    <group>
      {items.map((p, i) => (
        <group key={i} position={p} quaternion={quat}>
          <mesh rotation-x={i % 2 ? Math.PI / 2 : 0}>
            <torusGeometry args={[linkR, linkR * 0.28, 6, 12]} />
            <meshStandardMaterial color="#1a1028" metalness={0.8} roughness={0.3} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The engine. `stateRef.current` (optional) = { squeeze: 0..1, seized: bool, broken: 0..3 } drives it:
 * the ball pulses inward while it squeezes; when seized, the clamps lock and the chains go dark.
 */
export function Retractor({ stateRef, position = [ENGINE_AT[0], 0, ENGINE_AT[1]] }) {
  const ball = useRef()
  const edges = useRef()
  const core = useRef()
  const clampA = useRef()
  const clampB = useRef()
  const gearL = useRef()
  const gearR = useRef()
  const chains = useRef()
  const ico = useMemo(() => new THREE.IcosahedronGeometry(BALL_R, 1), [])
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(ico), [ico])
  const anchors = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        return { foot: [Math.cos(a) * 8.4, 0.4, Math.sin(a) * 5.4], top: [Math.cos(a) * BALL_R * 0.92, BALL_Y, Math.sin(a) * BALL_R * 0.92] }
      }),
    [],
  )
  const spin = useRef(0)
  const clamps = useRef()
  const burst = useRef()
  const seizedAt = useRef(null)
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const st = stateRef?.current || {}
    const seized = !!st.seized
    const sq = st.squeeze ?? 0.35
    spin.current += dt * (seized ? 0 : 0.6 + sq * 1.4)
    const pulse = seized ? 1 : 1 - sq * 0.06 * (0.5 + 0.5 * Math.sin(t * (3 + sq * 6)))
    ball.current.scale.setScalar(pulse)
    edges.current.scale.setScalar(pulse * 1.002)
    ball.current.rotation.y = edges.current.rotation.y = t * 0.08
    clampA.current.rotation.z = spin.current
    clampB.current.rotation.x = spin.current * 0.7
    core.current.material.opacity = seized ? 0.25 : 0.5 + sq * 0.4 + Math.sin(t * 5) * 0.08
    core.current.scale.setScalar(seized ? 1.4 : 1.2 + Math.sin(t * 3) * 0.1)
    // seized: the gears lock where they stand
    gearL.current.children.forEach((g) => {
      const spinner = g.children[0]
      if (!spinner) return
      if (seized) spinner.rotation.z = spinner.userData.lock ?? (spinner.userData.lock = spinner.rotation.z)
      else spinner.userData.lock = undefined
    })
    // the moment it seizes: a burst from the core, and the clamps drop onto the pedestal
    if (seized && seizedAt.current === null) seizedAt.current = t
    if (!seized) seizedAt.current = null
    const k = seizedAt.current === null ? 0 : Math.min(1, (t - seizedAt.current) / 1.4)
    const fall = k * k
    clamps.current.position.y = BALL_Y - fall * (BALL_Y - 1.4)
    clamps.current.rotation.x = fall * 0.5
    clamps.current.rotation.z = fall * 0.25
    burst.current.visible = k > 0 && k < 1
    burst.current.scale.setScalar(1 + k * 9)
    burst.current.material.opacity = (1 - k) * 0.8
    edges.current.material.color.set(seized ? '#8a6a2a' : GOLD)
    chains.current.children.forEach((c, i) => {
      c.visible = !seized || i % 2 === 0
    })
  })
  return (
    <group position={position}>
      {/* the pedestal */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[6.2, 7, 1.2, 6]} />
        <meshStandardMaterial color="#121024" roughness={0.3} metalness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[1.2, 2.4, 2.4, 6]} />
        <meshStandardMaterial color="#141228" roughness={0.3} metalness={0.6} flatShading />
      </mesh>
      {/* the hollow ball of triangles */}
      <mesh ref={ball} position={[0, BALL_Y, 0]} geometry={ico}>
        <meshStandardMaterial color="#1a1036" emissive="#3a1a80" emissiveIntensity={0.6} transparent opacity={0.55} roughness={0.75} metalness={0.05} flatShading depthWrite={false} />
      </mesh>
      <lineSegments ref={edges} position={[0, BALL_Y, 0]} geometry={edgeGeo}>
        <lineBasicMaterial color={GOLD} toneMapped={false} />
      </lineSegments>
      <mesh ref={core} position={[0, BALL_Y, 0]}>
        <sphereGeometry args={[1.0, 24, 16]} />
        <meshBasicMaterial color="#c58bff" transparent opacity={0.6} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, BALL_Y, 0]} color="#b070ff" intensity={30} distance={26} />
      {/* gyroscope clamps */}
      <mesh ref={burst} position={[0, BALL_Y, 0]} visible={false}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#f4e8ff" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={clamps} position={[0, BALL_Y, 0]}>
        <mesh ref={clampA}>
          <torusGeometry args={[BALL_R + 0.7, 0.2, 8, 64]} />
          <meshStandardMaterial color="#201a30" metalness={0.8} roughness={0.3} emissive={VIOLET} emissiveIntensity={0.5} />
        </mesh>
        <mesh ref={clampB}>
          <torusGeometry args={[BALL_R + 1.2, 0.16, 8, 64]} />
          <meshStandardMaterial color="#201a30" metalness={0.8} roughness={0.3} emissive={VIOLET} emissiveIntensity={0.4} />
        </mesh>
      </group>
      {/* the press: a triangular plate hanging over the ball */}
      <mesh position={[0, BALL_Y + BALL_R + 2.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[3.2, 1.6, 3]} />
        <meshStandardMaterial color="#141228" roughness={0.25} metalness={0.7} emissive="#2a1060" emissiveIntensity={0.5} flatShading />
      </mesh>
      <group ref={gearL}>
        <Gear position={[-8.6, 5.4, -1]} rotation={[0, 0.35, 0]} r={2.6} teeth={16} speed={0.35} color="#2a2040" emissive="#5a2aa8" />
        <Gear position={[8.6, 5.4, -1]} rotation={[0, -0.35, 0]} r={2.6} teeth={16} speed={-0.35} color="#2a2040" emissive="#5a2aa8" />
        <Gear position={[-6.4, 9.6, -2]} rotation={[0, 0.3, 0]} r={1.4} teeth={10} speed={-0.6} color="#2a2040" emissive="#5a2aa8" />
        <Gear position={[6.4, 9.6, -2]} rotation={[0, -0.3, 0]} r={1.4} teeth={10} speed={0.6} color="#2a2040" emissive="#5a2aa8" />
      </group>
      {/* six chains from pylons to the ball */}
      <group ref={chains}>
        {anchors.map((a, i) => (
          <group key={i}>
            <Chain from={a.foot} to={a.top} links={14} slack={0.4} />
          </group>
        ))}
      </group>
      {anchors.map((a, i) => (
        <mesh key={i} position={[a.foot[0], 0.9, a.foot[2]]}>
          <cylinderGeometry args={[0.35, 0.6, 1.8, 6]} />
          <meshStandardMaterial color="#141228" roughness={0.3} metalness={0.6} emissive="#3a1a80" emissiveIntensity={0.4} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/** The final phase's three chains: from each live anchor on the floor up to the Retractor's ball. */
function AnchorChains({ live }) {
  return (
    <>
      {ANCHORS.map((a, i) =>
        live[i] ? <Chain key={i} from={[a[0], 1.2, a[1]]} to={[ENGINE_AT[0] + Math.sign(a[0]) * 2.4, BALL_Y - 1.5, ENGINE_AT[1] + 2.4]} links={26} slack={0.9} linkR={0.13} color="#e05cff" /> : null,
      )}
    </>
  )
}

// ---------------------------------------------------------------- the exhibits

const goldMat = (opacity = 0.62) => (
  <meshStandardMaterial color={GOLD} emissive="#ff9a2a" emissiveIntensity={0.4} metalness={0.3} roughness={0.35} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
)
const rimMat = (c = '#fff2c4') => <meshBasicMaterial color={c} toneMapped={false} />

function Rod({ a, b, r = 0.035, color = '#fff2c4', arrow = false }) {
  const { mid, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a)
    const B = new THREE.Vector3(...b)
    const d = B.clone().sub(A)
    return { mid: A.clone().add(B).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len: d.length() }
  }, [a, b])
  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <cylinderGeometry args={[r, r, len, 6]} />
        {rimMat(color)}
      </mesh>
      {arrow && (
        <mesh position={[0, len * 0.08, 0]}>
          <coneGeometry args={[r * 3.4, r * 7, 8]} />
          {rimMat(color)}
        </mesh>
      )}
    </group>
  )
}
function Dot({ p, r = 0.08, color = '#fff2c4' }) {
  return (
    <mesh position={p}>
      <sphereGeometry args={[r, 12, 8]} />
      {rimMat(color)}
    </mesh>
  )
}
function Label({ p, children }) {
  return (
    <Html position={p} center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
      <div style={{ color: '#fff2c4', fontSize: 12, fontWeight: 700, textShadow: '0 0 4px #000, 0 0 2px #000', whiteSpace: 'nowrap' }}>{children}</div>
    </Html>
  )
}

/** A 2-simplex [v₀, v₁, v₂] lying on the floor, edges oriented from lower index to higher. */
function TriPic({ bad }) {
  const v = [[-1.05, 0.15, 0.55], [1.05, 0.15, 0.55], [0, 0.15, -1.15]]
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(v[0][0], -v[0][2])
    s.lineTo(v[1][0], -v[1][2])
    s.lineTo(v[2][0], -v[2][2])
    s.closePath()
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const c = bad ? RED : '#fff2c4'
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <shapeGeometry args={[shape]} />
        {goldMat(0.4)}
      </mesh>
      <Rod a={v[0]} b={v[1]} arrow color={c} />
      <Rod a={v[1]} b={v[2]} arrow color={c} />
      <Rod a={v[0]} b={v[2]} arrow color={c} />
      {v.map((p, i) => (
        <Dot key={i} p={p} />
      ))}
      <Label p={[-1.3, 0.3, 0.75]}>v₀</Label>
      <Label p={[1.3, 0.3, 0.75]}>v₁</Label>
      <Label p={[0, 0.3, -1.45]}>v₂</Label>
    </>
  )
}

/** The circle as a Δ-complex: one vertex, one edge round an empty middle. */
function CirclePic() {
  const pts = useMemo(() => Array.from({ length: 13 }, (_, i) => [Math.cos((i / 12) * Math.PI * 2) * 1.1, 0.15, Math.sin((i / 12) * Math.PI * 2) * 1.1]), [])
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshBasicMaterial color="#020108" />
      </mesh>
      {pts.slice(0, -1).map((p, i) => (
        <Rod key={i} a={p} b={pts[i + 1]} arrow={i === 3} />
      ))}
      <Dot p={[1.1, 0.15, 0]} r={0.11} />
      <Label p={[1.45, 0.3, 0]}>v</Label>
      <Label p={[0, 0.3, -1.4]}>e</Label>
    </>
  )
}

/** Hatcher's Δ-complex torus: a square, a on top and bottom, b on the sides, diagonal c; U upper-left, L lower-right. */
function TorusSquarePic() {
  const s = 1.05
  const bl = [-s, 0.15, s]
  const br = [s, 0.15, s]
  const tl = [-s, 0.15, -s]
  const tr = [s, 0.15, -s]
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[2 * s, 2 * s]} />
        {goldMat(0.3)}
      </mesh>
      <Rod a={bl} b={br} arrow color="#ffd27a" />
      <Rod a={tl} b={tr} arrow color="#ffd27a" />
      <Rod a={bl} b={tl} arrow color="#7fe8dc" />
      <Rod a={br} b={tr} arrow color="#7fe8dc" />
      <Rod a={bl} b={tr} arrow color="#ff9ad0" />
      <Label p={[0, 0.3, s + 0.3]}>a</Label>
      <Label p={[-s - 0.3, 0.3, 0]}>b</Label>
      <Label p={[0.34, 0.3, 0.0]}>c</Label>
      <Label p={[-0.45, 0.3, -0.45]}>U</Label>
      <Label p={[0.5, 0.3, 0.5]}>L</Label>
    </>
  )
}

const crossCap = (u, v) => {
  const a = u * Math.PI * 2
  const b = v * (Math.PI / 2)
  const r = 0.75
  return [r * Math.cos(a) * Math.sin(2 * b), r * (Math.cos(b) ** 2 - Math.cos(a) ** 2 * Math.sin(b) ** 2) * 1.2, r * Math.sin(a) * Math.sin(2 * b)]
}
const kleinBig = (u, v) => klein(u, v).map((x) => x * 2.4)

function Spinner({ children, y = 0.95, speed = 0.4 }) {
  const g = useRef()
  useFrame((_, dt) => {
    g.current.rotation.y += dt * speed
  })
  return (
    <group ref={g} position={[0, y, 0]}>
      {children}
    </group>
  )
}

function SurfacePic({ f, scale = 1 }) {
  const geo = useMemo(() => {
    const g = surface(f, 72, 28)
    g.center()
    return g
  }, [f])
  return (
    <group scale={scale}>
      <mesh geometry={geo}>{goldMat(0.6)}</mesh>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#fff2c4" wireframe transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  )
}

function BitorusPic() {
  return (
    <group rotation={[-0.5, 0, 0]}>
      {[-0.52, 0.52].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.2, 16, 40]} />
          {goldMat(0.62)}
        </mesh>
      ))}
    </group>
  )
}

/** z ↦ z³: a band that wraps round the circle three times. */
function WindPic() {
  const geo = useMemo(() => {
    const pts = Array.from({ length: 220 }, (_, i) => {
      const s = i / 219
      const a = s * Math.PI * 2 * 3
      const r = 0.95 + 0.14 * s
      return new THREE.Vector3(Math.cos(a) * r, 0.2 + s * 0.55, Math.sin(a) * r)
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 260, 0.045, 6, false)
  }, [])
  return (
    <Spinner y={0} speed={0.5}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <torusGeometry args={[0.9, 0.03, 8, 64]} />
        {rimMat('#7fe8dc')}
      </mesh>
      <mesh geometry={geo}>{rimMat(GOLD)}</mesh>
    </Spinner>
  )
}

/** The antipodal map x ↦ −x: a pair of points through the center, on a sphere (or a circle). */
function AntipodalPic({ dim = 2 }) {
  return (
    <Spinner y={1} speed={0.5}>
      {dim === 2 ? (
        <mesh>
          <sphereGeometry args={[0.85, 32, 20]} />
          {goldMat(0.3)}
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.035, 8, 64]} />
          {rimMat()}
        </mesh>
      )}
      <Rod a={[-0.6, 0.45, 0.4]} b={[0.6, -0.45, -0.4]} r={0.02} color="#ff9ad0" />
      <Dot p={dim === 2 ? [-0.6, 0.45, 0.4] : [-0.85, 0, 0]} r={0.09} color="#7fe8dc" />
      <Dot p={dim === 2 ? [0.6, -0.45, -0.4] : [0.85, 0, 0]} r={0.09} color="#ff9ad0" />
    </Spinner>
  )
}

/** A map that misses a point: the sphere with a cap left dark. */
function MissingPic() {
  return (
    <Spinner y={1} speed={0.4}>
      <mesh>
        <sphereGeometry args={[0.85, 32, 20, 0, Math.PI * 2, 0.55, Math.PI - 0.55]} />
        {goldMat(0.6)}
      </mesh>
      <Dot p={[0, 0.85, 0]} r={0.08} color="#ff4a6a" />
    </Spinner>
  )
}

/** Mayer–Vietoris on S²: two disks (hemispheres) meeting in a circle. */
function MvPic() {
  const g = useRef()
  useFrame(({ clock }) => {
    const k = 0.18 + Math.sin(clock.elapsedTime * 1.4) * 0.14
    g.current.children[0].position.y = k
    g.current.children[1].position.y = -k
  })
  return (
    <Spinner y={1} speed={0.3}>
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {goldMat(0.55)}
        </mesh>
        <mesh>
          <sphereGeometry args={[0.8, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#7fe8dc" emissive="#2a9a8a" emissiveIntensity={0.4} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.03, 8, 64]} />
        {rimMat('#ff9ad0')}
      </mesh>
    </Spinner>
  )
}

function Picture({ pic, bad }) {
  switch (pic) {
    case 'tri':
      return <TriPic bad={bad} />
    case 'circle1':
      return <CirclePic />
    case 'torusSq':
      return <TorusSquarePic />
    case 'sphere':
      return (
        <Spinner>
          <group scale={1.8}>
            <SpaceModel kind="sphere" />
          </group>
        </Spinner>
      )
    case 'torus':
      return (
        <Spinner>
          <group scale={1.9} rotation={[0.5, 0, 0]}>
            <SpaceModel kind="torus" />
          </group>
        </Spinner>
      )
    case 'klein':
      return (
        <Spinner y={1.05}>
          <group rotation={[-Math.PI / 2 + 0.5, 0, 0]}>
            <SurfacePic f={kleinBig} />
          </group>
        </Spinner>
      )
    case 'rp2':
      return (
        <Spinner y={1.05}>
          <SurfacePic f={crossCap} />
        </Spinner>
      )
    case 'bitorus':
      return (
        <Spinner y={0.95}>
          <BitorusPic />
        </Spinner>
      )
    case 'wind3':
      return <WindPic />
    case 'antipodal':
      return <AntipodalPic dim={2} />
    case 'antipodal1':
      return <AntipodalPic dim={1} />
    case 'missing':
      return <MissingPic />
    case 'mv':
      return <MvPic />
    default:
      return null
  }
}

const CARD = {
  width: 196,
  padding: '6px 9px',
  background: 'rgba(10, 6, 22, 0.88)',
  border: '1px solid #8a5aff',
  borderRadius: 7,
  color: '#f4e8ff',
  fontSize: 12.5,
  lineHeight: 1.35,
  textAlign: 'center',
  boxShadow: '0 0 14px rgba(138, 90, 255, 0.35)',
}

export function Panel({ at, exhibit, state, playerRef }) {
  const ex = EXHIBITS[exhibit]
  const card = useRef()
  // the card is an overlay: fade it while Gyroid walks behind it, so he never vanishes
  useFrame(() => {
    const p = playerRef?.current
    if (!card.current || !p) return
    // (anywhere on the panel or in front of it: the card and the picture sit over him there)
    const d = Math.min(Math.hypot(p.x - at[0], (p.z - at[1] - 1.75) * 1.6), Math.max(0, Math.hypot(p.x - at[0], p.z - at[1]) - 1.2))
    card.current.style.opacity = String(d < 1.3 ? 0.18 : d < 2.1 ? 0.18 + (d - 1.3) * 1.0 : 1)
  })
  if (!ex) return null
  const bad = state === 'exposed'
  return (
    <group position={[at[0], 0, at[1]]}>
      <mesh position={[0, 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 48]} />
        <meshStandardMaterial color="#10101e" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.95, 2.08, 64]} />
        <meshBasicMaterial color={bad ? RED : state === 'spared' ? '#7fe8dc' : '#6a4aa8'} toneMapped={false} />
      </mesh>
      <Picture pic={ex.pic} bad={bad} />
      <Html position={[0, 0.2, 1.75]} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={card} style={{ ...CARD, borderColor: bad ? RED : state === 'spared' ? '#7fe8dc' : '#8a5aff', transition: 'opacity 0.15s' }}>
          <MathText text={ex.claim} />
          {bad && <div style={{ color: RED, fontWeight: 800, marginTop: 3, letterSpacing: 1 }}>FORGERY ✕</div>}
        </div>
      </Html>
    </group>
  )
}

export default function Castle2Scene({ trial, round, panelStates, showPanels, anchorsLive, engineRef, nullScript, walkable, game, gameKey, stateRef, frameRef, camYawRef, spawnRef, playEnabled, tool, onEnemies, onHearts }) {
  return (
    <>
      <DeltaHall />
      <Retractor stateRef={engineRef} />
      <Throne />
      <group position={[0, 0.3, -7.3]} scale={0.8}>
        <CountNull script={nullScript} />
      </group>
      {anchorsLive && <AnchorChains live={anchorsLive} />}
      {showPanels && PANELS.map((at, i) => <Panel key={`${trial}:${round.join()}:${i}`} at={at} exhibit={round[i]} state={panelStates[i]} playerRef={stateRef} />)}
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={{ current: null }}
        onAction={() => {}}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} frameRef={frameRef} walkable={walkable} follower={false} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}
