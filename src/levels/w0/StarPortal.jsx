import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

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

/** One reward. kind = a reef stage (a Spine Shard of that shape) or 'hourglass' (a Tide Hourglass). */
export function Star({ pos, state, kind = 'walkway' }) {
  const g = useRef()
  const takenAt = useRef(null) // scene-clock time it was collected
  const tubes = useMemo(() => (kind === 'hourglass' ? [] : spineGeometry(kind)), [kind])
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
      {kind === 'hourglass' && <Hourglass />}
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
