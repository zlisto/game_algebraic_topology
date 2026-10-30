import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { relicGot } from '../../codex/store'
import * as THREE from 'three'
import { REWARDS_W1 } from '../w1/Rewards1'

/**
 * Super Mario 64-style rewards for the open overworld: a Star that rises over each reef once its
 * puzzle is solved (walk into it to collect it), and the Warp Portal at the level's exit, which
 * stays sealed until every Star is in hand.
 */

function starShape(outer = 0.42, inner = 0.18) {
  const sh = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer
    const a = Math.PI / 2 + (i / 10) * Math.PI * 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) sh.moveTo(x, y)
    else sh.lineTo(x, y)
  }
  sh.closePath()
  return sh
}

/** The spine each kind of reef retracts onto, as polylines (unit-ish size). */
const SPINES = {
  walkway: [[[-0.5, 0], [0.5, 0]]], // a bar
  fork: [[[-0.45, -0.25], [0, 0.05]], [[0.45, -0.25], [0, 0.05]], [[0, 0.05], [0, 0.5]]], // a tree: the Y
  ring: [Array.from({ length: 33 }, (_, i) => [Math.cos((i / 32) * Math.PI * 2) * 0.38, Math.sin((i / 32) * Math.PI * 2) * 0.38])], // a circle
  lagoons: [
    Array.from({ length: 33 }, (_, i) => [-0.24 + Math.cos((i / 32) * Math.PI * 2) * 0.24, Math.sin((i / 32) * Math.PI * 2) * 0.24]),
    Array.from({ length: 33 }, (_, i) => [0.24 - Math.cos((i / 32) * Math.PI * 2) * 0.24, Math.sin((i / 32) * Math.PI * 2) * 0.24]),
  ], // a figure-eight
  forgeries: [[[-0.5, 0], [-0.08, 0.06]], [[0.08, -0.06], [0.5, 0]]], // Null's spine, snapped in two
}

/** One tube per polyline: an amber wire sculpture. */
function spineGeometry(kind) {
  return (SPINES[kind] || SPINES.walkway).map((poly) => {
    const curve = new THREE.CatmullRomCurve3(poly.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'catmullrom', 0.1)
    return new THREE.TubeGeometry(curve, Math.max(8, poly.length * 3), 0.045, 8, false)
  })
}

/** One Spine Shard. `state`: 'waiting' (floating, collectable) or 'taken' (a quick spin-up, then gone). */
/** A Tide Hourglass (0-2's reward): two glass bulbs, a golden ribbon inside that bends and unbends — a homotopy, frame by frame. */
function Hourglass() {
  const ribbon = useRef()
  const pts = useMemo(() => Array.from({ length: 24 }, () => new THREE.Vector3()), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    pts.forEach((p, i) => {
      const u = i / (pts.length - 1)
      p.set(Math.sin(u * Math.PI * 2 + t * 1.5) * 0.13 * Math.sin(u * Math.PI), (u - 0.5) * 0.62, Math.cos(u * Math.PI * 3 + t) * 0.05)
    })
    ribbon.current.geometry.setFromPoints(pts)
  })
  return (
    <group>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * 0.18, 0]} rotation={[s > 0 ? Math.PI : 0, 0, 0]}>
          <coneGeometry args={[0.24, 0.36, 20, 1, true]} />
          <meshPhysicalMaterial color="#e8f6ff" transmission={0.8} roughness={0.05} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {[0.38, -0.38].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 20]} />
          <meshStandardMaterial color="#c98b3a" metalness={0.7} roughness={0.3} emissive="#ff9a2a" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <line ref={ribbon}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffd27a" toneMapped={false} />
      </line>
    </group>
  )
}

/**
 * A Mirror Lens (0-3's reward): a silver-glass disc with a figure-eight wire on one face and a theta
 * on the other. As it turns you see one, then the other: two looks, one homotopy type.
 */
const LENS_WIRES = (() => {
  const circ = (cx, cy, rx, ry = rx) => Array.from({ length: 33 }, (_, i) => [cx + Math.cos((i / 32) * Math.PI * 2) * rx, cy + Math.sin((i / 32) * Math.PI * 2) * ry])
  const tube = (poly, z) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(poly.map(([x, y]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.1), Math.max(8, poly.length * 3), 0.03, 6, false)
  return {
    eight: [circ(-0.17, 0, 0.17), circ(0.17, 0, 0.17)].map((p) => tube(p, 0.05)),
    theta: [circ(0, 0, 0.32, 0.24), [[-0.32, 0], [0.32, 0]]].map((p) => tube(p, -0.05)),
  }
})()
function Lens() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.05, 40]} />
        <meshPhysicalMaterial color="#cfe8ff" metalness={0.9} roughness={0.08} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.47, 0.04, 8, 48]} />
        <meshStandardMaterial color="#e8eefc" metalness={0.9} roughness={0.2} emissive="#9fd8ff" emissiveIntensity={0.5} />
      </mesh>
      {LENS_WIRES.eight.map((geo, i) => (
        <mesh key={`e${i}`} geometry={geo}>
          <meshStandardMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}
      {LENS_WIRES.theta.map((geo, i) => (
        <mesh key={`t${i}`} geometry={geo}>
          <meshStandardMaterial color="#c8f0ff" emissive="#7fd8ff" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

const wireTube = (pts, r = 0.03, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z)), closed, 'catmullrom', 0.05), Math.max(12, pts.length * 4), r, 6, closed)
const gold = <meshStandardMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={1.3} toneMapped={false} />

/**
 * A Blueprint Tile (0-4): one square 2-cell with its edge word a b a⁻¹ b⁻¹ — the torus recipe —
 * each side an arrow in its letter's colour, the four corners one point.
 */
const TILE = (() => {
  const C = [[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]]
  const sides = [0, 1, 2, 3].map((i) => {
    const [a, b] = [C[i], C[(i + 1) % 4]]
    return wireTube([a, b], 0.028)
  })
  return { sides, heads: [0, 1, 2, 3].map((i) => {
    const [a, b] = [C[i], C[(i + 1) % 4]]
    const fwd = i < 2 // a, b forward; a⁻¹, b⁻¹ run backward
    return { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], rot: Math.atan2(b[1] - a[1], b[0] - a[0]) + (fwd ? 0 : Math.PI) - Math.PI / 2 }
  }) }
})()
function Tile() {
  const COL = ['#ff7a8a', '#7fd8ff', '#ff7a8a', '#7fd8ff'] // a, b, a⁻¹, b⁻¹
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.64, 0.64, 0.04]} />
        <meshStandardMaterial color="#5a3a1a" emissive="#ff9a2a" emissiveIntensity={0.35} transparent opacity={0.7} />
      </mesh>
      {TILE.sides.map((geo, i) => (
        <mesh key={i} geometry={geo} position={[0, 0, 0.03]}>
          <meshStandardMaterial color={COL[i]} emissive={COL[i]} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
      {TILE.heads.map((h, i) => (
        <mesh key={`h${i}`} position={[h.p[0], h.p[1], 0.04]} rotation={[0, 0, h.rot]}>
          <coneGeometry args={[0.06, 0.12, 4]} />
          <meshStandardMaterial color={COL[i]} emissive={COL[i]} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-0.32, -0.32, 0.04]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** A Cone Crystal (0-5): a glowing ring, every point of it joined by a line to one apex — the cone on a circle, a disk. */
const CONE = (() => {
  const ring = Array.from({ length: 33 }, (_, i) => [Math.cos((i / 32) * Math.PI * 2) * 0.34, -0.22, Math.sin((i / 32) * Math.PI * 2) * 0.34])
  const apex = [0, 0.36, 0]
  return { ring: wireTube(ring, 0.03, true), spokes: Array.from({ length: 10 }, (_, i) => wireTube([ring[Math.round((i / 10) * 32)], apex], 0.012)), apex }
})()
function ConeCrystal() {
  return (
    <group>
      <mesh geometry={CONE.ring}>{gold}</mesh>
      {CONE.spokes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#c8f0ff" emissive="#7fd8ff" emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={CONE.apex}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <coneGeometry args={[0.33, 0.57, 32, 1, true]} />
        <meshPhysicalMaterial color="#cfe8ff" transmission={0.6} roughness={0.1} transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** A Petal Rose (0-6): three loops on one stem point — a graph with its spanning tree felled, a wedge of circles. */
const ROSE = [0, 1, 2].map((k) => {
  const a0 = (k / 3) * Math.PI * 2 + Math.PI / 2
  return wireTube(
    Array.from({ length: 25 }, (_, i) => {
      const u = (i / 24) * Math.PI * 2
      // a teardrop petal leaving the centre and coming back
      const r = 0.38 * Math.sin(u / 2) ** 2
      const a = a0 + Math.sin(u) * 0.45
      return [Math.cos(a) * r, Math.sin(a) * r]
    }),
    0.028,
  )
})
function PetalRose() {
  const COL = ['#ff7a8a', '#7fd8ff', '#b9f27a']
  return (
    <group>
      {ROSE.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={COL[i]} emissive={COL[i]} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.56, 6]} />
        <meshStandardMaterial color="#6fae5a" emissive="#3a7a2a" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

const MODELS = { hourglass: Hourglass, lens: Lens, tile: Tile, cone: ConeCrystal, rose: PetalRose, ...REWARDS_W1 }

/** One reward. kind = a reef stage (a Spine Shard of that shape), 'hourglass' (a Tide Hourglass) or 'lens' (a Mirror Lens). */
export function Star({ pos, state, kind = 'walkway' }) {
  useEffect(() => {
    if (state === 'taken') relicGot(kind) // the codex's relics
  }, [state, kind])
  const g = useRef()
  const takenAt = useRef(null) // scene-clock time it was collected
  const Model = MODELS[kind]
  const tubes = useMemo(() => (MODELS[kind] ? [] : spineGeometry(kind)), [kind])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!g.current) return
    if (state === 'taken') {
      if (takenAt.current === null) takenAt.current = t
      const k = Math.min(1, (t - takenAt.current) / 0.7)
      g.current.visible = k < 1
      g.current.position.set(pos[0], 1.4 + k * 2.2, pos[1])
      g.current.rotation.y = t * 14
      g.current.scale.setScalar(1 - k * 0.8)
      return
    }
    g.current.visible = true
    g.current.position.set(pos[0], 1.4 + Math.sin(t * 2) * 0.12, pos[1])
    g.current.rotation.y = t * 2.2
  })
  return (
    <group ref={g}>
      {Model && <Model />}
      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={1.2} metalness={0.5} roughness={0.25} toneMapped={false} />
        </mesh>
      ))}
      {/* a faint crystal shell around the wire */}
      <mesh>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshPhysicalMaterial color="#fff2c8" transmission={0.7} roughness={0.1} transparent opacity={0.18} flatShading depthWrite={false} />
      </mesh>
      {/* a beam of light marking where it waits */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.12, 0.35, 5, 16, 1, true]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.22} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.09, 0]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {state === 'waiting' && <Sparkles count={14} scale={1.2} size={3} speed={0.6} color="#fff2a8" />}
    </group>
  )
}

/** The Warp Portal: a standing swirl of light in a stone ring. Sealed (grey, still) until `open`. */
export function WarpPortal({ pos, facing = 0, open, need, warping }) {
  const swirl = useRef()
  const swirl2 = useRef()
  const ring = useRef()
  const beam = useRef()
  const swirlTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const x = c.getContext('2d')
    const grad = x.createRadialGradient(128, 128, 4, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.35, 'rgba(160,220,255,0.9)')
    grad.addColorStop(0.75, 'rgba(120,80,255,0.55)')
    grad.addColorStop(1, 'rgba(60,20,160,0)')
    x.fillStyle = grad
    x.fillRect(0, 0, 256, 256)
    // spiral arms
    x.strokeStyle = 'rgba(255,255,255,0.55)'
    x.lineWidth = 7
    for (let arm = 0; arm < 4; arm++) {
      x.beginPath()
      for (let i = 0; i < 80; i++) {
        const a = arm * (Math.PI / 2) + i * 0.09
        const r = 6 + i * 1.5
        const px = 128 + Math.cos(a) * r
        const py = 128 + Math.sin(a) * r
        if (i === 0) x.moveTo(px, py)
        else x.lineTo(px, py)
      }
      x.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const spin = open ? (warping ? 9 : 2.2) : 0.15
    swirl.current.rotation.z -= dt * spin
    swirl2.current.rotation.z += dt * spin * 0.6
    swirl.current.material.opacity = open ? 0.95 : 0.18
    swirl2.current.material.opacity = open ? 0.5 : 0.08
    ring.current.material.emissiveIntensity = open ? 0.8 + Math.sin(t * 3) * 0.2 : 0.05
    beam.current.visible = open
    beam.current.material.opacity = (warping ? 0.8 : 0.25) + Math.sin(t * 4) * 0.05
  })
  return (
    <group position={[pos[0], 0, pos[1]]} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial color="#2a2f3e" roughness={0.8} />
      </mesh>
      <mesh ref={ring} position={[0, 1.35, 0]}>
        <torusGeometry args={[1.1, 0.16, 12, 48]} />
        <meshStandardMaterial color={open ? '#c9b8ff' : '#55586a'} roughness={0.4} metalness={0.5} emissive="#8a6cff" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={swirl} position={[0, 1.35, 0.01]}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial map={swirlTex} transparent opacity={0.95} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={swirl2} position={[0, 1.35, -0.01]} scale={0.8}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial map={swirlTex} transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={beam} position={[0, 4, 0]}>
        <cylinderGeometry args={[0.9, 1.2, 8, 24, 1, true]} />
        <meshBasicMaterial color="#b9a8ff" transparent opacity={0.25} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {open && <Sparkles count={40} scale={[2.4, 3, 1]} position={[0, 1.35, 0]} size={4} speed={1.2} color="#d8ccff" />}
      {!open && need > 0 && (
        // five star sockets round the ring: lit for each star collected
        <group position={[0, 1.35, 0.18]}>
          {Array.from({ length: 5 }, (_, i) => {
            const a = Math.PI / 2 - (i / 5) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0]}>
                <sphereGeometry args={[0.09, 10, 8]} />
                <meshBasicMaterial color={i < 5 - need ? '#ffd23f' : '#3a3d4a'} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}
