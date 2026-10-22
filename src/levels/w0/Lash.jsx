import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The Fundamental Lash as a real whip: a wrapped leather handle with a pommel, a braided thong
 * that tapers to a fine fall, and a cracker tuft at the tip. A throw has four beats — the hand
 * rears the lash back over the shoulder, throws it out on a slight diagonal (so a camera behind
 * Gyroid still sees it), a wave rolls along it and the tip cracks (flash, shockwave, sparks),
 * then it recoils. Between throws it hangs coiled on Gyroid's belt.
 *
 * state.current: { x, z, face, whip } with whip = 0 at rest, rising through (0, 1] over a throw.
 */
const N = 34 // points along the thong
const RADIAL = 12
const R_BASE = 0.042 // thong thickness at the handle (world units)
const R_TIP = 0.016
const HANDLE = 0.3
const SPARKS = 14
const DIAG = 0.08 // a hair off the facing, toward Gyroid's right: it lands where you aimed (the camera's shoulder shift keeps it in view)
const REACH = 1.18 // the lash looks a touch longer than its hit range
const GROW = 0.08 // the thong pays out of the coil over this much of the throw

const LEATHER = new THREE.Color('#4a2a12')
const PLAIT = new THREE.Color('#b8925a')
const GLOW = new THREE.Color('#ffcf6a')

const smooth = (x) => x * x * (3 - 2 * x)
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const mix = (a, b, k) => a + (b - a) * k

/** The throw's beats at whip = w. */
function beats(w, hitAt) {
  const rear = smooth(clamp01(w / 0.3)) * (1 - smooth(clamp01((w - 0.3) / 0.15)))
  const throwK = smooth(clamp01((w - 0.3) / (hitAt - 0.3)))
  const recoil = smooth(clamp01((w - 0.72) / 0.28))
  return { rear, throwK, recoil, ext: throwK * (1 - recoil * 0.85), grow: smooth(clamp01(w / GROW)) }
}

/** Where the hand is: hip at rest, up by the shoulder on the rear-back, reaching out on the throw. */
function handAt(out, s, b) {
  const fx = Math.sin(s.face)
  const fz = Math.cos(s.face)
  const start = b.grow // 0 → 1 over the first moment: from the belt into the hand
  const fwd = mix(mix(mix(0.02, 0.12, start), -0.08, b.rear), 0.42, b.ext)
  const side = mix(mix(0.3, 0.22, start), 0.26, b.rear)
  const y = mix(mix(mix(0.5, 0.66, start), 1.18, b.rear), 0.98, b.ext)
  out.set(s.x + fx * fwd - fz * side, y, s.z + fz * fwd + fx * side)
}

/** Where each point of the thong is, mid-throw. u runs 0 (handle) → 1 (tip). */
function whipCurve(out, s, hand, range, hitAt, b) {
  const w = s.whip
  const fx = Math.sin(s.face)
  const fz = Math.cos(s.face)
  const rx = -fz // Gyroid's right
  const rz = fx
  // the throw goes out on a diagonal toward the right
  const ox = fx * Math.cos(DIAG) + rx * Math.sin(DIAG)
  const oz = fz * Math.cos(DIAG) + rz * Math.sin(DIAG)
  const reach = 0.35 + range * REACH * b.ext
  // the wave rolls out from the handle during the throw, then dies away after the crack
  const front = clamp01((w - 0.3) / (hitAt + 0.05 - 0.3)) * 1.3
  const waveLife = 1 - smooth(clamp01((w - hitAt) / 0.1))
  const rear = b.rear
  for (let k = 0; k < N; k++) {
    const u = k / (N - 1)
    // reared back: up over the shoulder, trailing behind
    const backX = -fx * u * 0.85 + rx * u * 0.3
    const backZ = -fz * u * 0.85 + rz * u * 0.3
    const backY = Math.sin(u * Math.PI * 0.85) * 1.1
    // thrown: out along the diagonal, dropping toward the ground at the tip
    const sag = Math.sin(u * Math.PI) * 0.18 * (1 - b.ext) + u * u * 0.7 * b.ext
    const d = front - u
    const wave = d > 0 && d < 0.5 ? Math.sin((d / 0.5) * Math.PI) * 0.32 * (1 - u * 0.4) * waveLife : 0
    const slack = Math.sin(u * Math.PI * 2 + w * 9) * 0.05 * (1 - b.ext) // a little life in the slack
    const x = hand.x + backX * rear + ox * reach * u * (1 - rear) + rx * slack
    const z = hand.z + backZ * rear + oz * reach * u * (1 - rear) + rz * slack
    const y = hand.y + backY * rear - sag * (1 - rear) + wave
    out[k].set(x, Math.max(0.04, y), z)
  }
  if (b.grow < 1) for (const p of out) p.lerpVectors(hand, p, Math.max(0.05, b.grow))
}

/** A tube's index buffer and per-vertex braid colours, built once; the tip is capped. */
function makeTube() {
  const g = new THREE.BufferGeometry()
  const verts = N * RADIAL + 1 // + the tip cap's centre
  const pos = new Float32Array(verts * 3)
  const nor = new Float32Array(verts * 3)
  const col = new Float32Array(verts * 3)
  const idx = []
  for (let k = 0; k < N; k++) {
    for (let j = 0; j < RADIAL; j++) {
      // a plait: two strands spiralling round each other, so the stripes chevron along the thong
      const a = (j / RADIAL) * Math.PI * 2
      const c = Math.sin(a * 2 + k * 0.6) > 0.1 ? PLAIT : LEATHER
      const i = (k * RADIAL + j) * 3
      col[i] = c.r
      col[i + 1] = c.g
      col[i + 2] = c.b
      if (k < N - 1) {
        const a0 = k * RADIAL + j
        const a1 = k * RADIAL + ((j + 1) % RADIAL)
        idx.push(a0, a0 + RADIAL, a1, a1, a0 + RADIAL, a1 + RADIAL)
      }
    }
  }
  const cap = N * RADIAL
  col.set([LEATHER.r, LEATHER.g, LEATHER.b], cap * 3)
  for (let j = 0; j < RADIAL; j++) idx.push((N - 1) * RADIAL + j, cap, (N - 1) * RADIAL + ((j + 1) % RADIAL))
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.setIndex(idx)
  return g
}

/** The handle: wrapped grip, brass rings, a collar where the thong starts, a pommel knob. */
function Handle() {
  return (
    <>
      <mesh>
        <cylinderGeometry args={[0.032, 0.036, HANDLE, 10]} />
        <meshStandardMaterial color="#3b2412" roughness={0.8} />
      </mesh>
      {[-0.09, -0.03, 0.03, 0.09].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.036, 0.008, 6, 14]} />
          <meshStandardMaterial color="#c98b3a" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, HANDLE / 2, 0]}>
        <cylinderGeometry args={[0.042, 0.04, 0.03, 12]} />
        <meshStandardMaterial color="#e8c070" roughness={0.3} metalness={0.8} emissive="#ffb347" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -HANDLE / 2 - 0.02, 0]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#e8c070" roughness={0.3} metalness={0.8} emissive="#ffb347" emissiveIntensity={0.3} />
      </mesh>
    </>
  )
}

export default function Lash({ state, range = 1.35, hitAt = 0.45, equipped = true }) {
  const thong = useRef()
  const handle = useRef()
  const tip = useRef()
  const coil = useRef()
  const flash = useRef()
  const ring = useRef()
  const sparks = useRef()
  const geo = useMemo(makeTube, [])
  const pts = useMemo(() => Array.from({ length: N }, () => new THREE.Vector3()), [])
  const v = useMemo(
    () => ({ hand: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), b: new THREE.Vector3(), prev: new THREE.Vector3(), x: new THREE.Vector3(1, 0, 0), up: new THREE.Vector3(0, 1, 0) }),
    [],
  )
  const crack = useRef({ armed: false, at: null, x: 0, y: 0, z: 0, dirs: Array.from({ length: SPARKS }, () => [0, 0, 0]) })
  const sparkPos = useMemo(() => new Float32Array(SPARKS * 3), [])

  useFrame((_, rawDt) => {
    const s = state.current
    const on = s.whip > 0
    thong.current.visible = on
    const co = s.stance === 'cochain'
    thong.current.material.emissive.set(co ? '#5cf0ff' : '#ffcf6a')
    thong.current.material.emissiveIntensity = co ? 0.9 : 0.1
    tip.current.visible = on
    handle.current.visible = on || equipped
    coil.current.visible = !on && equipped
    const { hand, t, n, b, prev, up } = v
    const c = crack.current
    if (!on) {
      // at rest: handle hangs at the right hip, the thong coiled beside it
      const fx = Math.sin(s.face)
      const fz = Math.cos(s.face)
      const side = 0.3
      coil.current.position.set(s.x - fz * side, 0.46, s.z + fx * side)
      coil.current.rotation.set(0, s.face, 0)
      // handle tucked behind the coil, leaning forward ~30°
      handle.current.position.set(s.x - fz * side - fx * 0.12, 0.55, s.z + fx * side - fz * 0.12)
      handle.current.rotation.set(0.52, s.face, 0, 'YXZ')
    } else {
      const bt = beats(s.whip, hitAt)
      handAt(hand, s, bt)
      whipCurve(pts, s, hand, range, hitAt, bt)

      // handle: from the hand back along the first stretch of thong
      t.subVectors(pts[1], pts[0]).normalize()
      handle.current.position.copy(hand).addScaledVector(t, -HANDLE * 0.5)
      handle.current.quaternion.setFromUnitVectors(up, t)

      // tube vertices round the curve (parallel-transported frame), radius tapering to the fall
      const pos = geo.attributes.position.array
      const nor = geo.attributes.normal.array
      for (let k = 0; k < N; k++) {
        t.subVectors(pts[Math.min(N - 1, k + 1)], pts[Math.max(0, k - 1)]).normalize()
        if (k === 0) n.copy(Math.abs(t.y) > 0.9 ? v.x : up)
        else n.copy(prev)
        n.addScaledVector(t, -n.dot(t)).normalize()
        b.crossVectors(t, n)
        prev.copy(n)
        const u = k / (N - 1)
        const r = R_TIP + (R_BASE - R_TIP) * Math.pow(1 - u, 0.8)
        for (let j = 0; j < RADIAL; j++) {
          const ang = (j / RADIAL) * Math.PI * 2
          const cx = Math.cos(ang)
          const cy = Math.sin(ang)
          const i = (k * RADIAL + j) * 3
          const nx = n.x * cx + b.x * cy
          const ny = n.y * cx + b.y * cy
          const nz = n.z * cx + b.z * cy
          pos[i] = pts[k].x + nx * r
          pos[i + 1] = pts[k].y + ny * r
          pos[i + 2] = pts[k].z + nz * r
          nor[i] = nx
          nor[i + 1] = ny
          nor[i + 2] = nz
        }
      }
      const end = pts[N - 1]
      const capI = N * RADIAL * 3
      pos[capI] = end.x
      pos[capI + 1] = end.y
      pos[capI + 2] = end.z
      nor[capI] = t.x
      nor[capI + 1] = t.y
      nor[capI + 2] = t.z
      geo.attributes.position.needsUpdate = true
      geo.attributes.normal.needsUpdate = true

      // the cracker tuft rides the tip, pointing on along the lash
      t.subVectors(end, pts[N - 3]).normalize()
      tip.current.position.copy(end)
      tip.current.quaternion.setFromUnitVectors(up, t)

      // the crack: once per throw, as the whip passes the hit moment
      if (s.whip < hitAt) c.armed = true
      else if (c.armed) {
        c.armed = false
        c.at = 0
        c.x = end.x
        c.y = end.y
        c.z = end.z
        // the shockwave faces along the lash's last direction
        ring.current.quaternion.setFromUnitVectors(v.x.set(0, 0, 1), t)
        v.x.set(1, 0, 0)
        for (const d of c.dirs) {
          const a = Math.random() * Math.PI * 2
          const sp = 1.6 + Math.random() * 1.6
          d[0] = Math.cos(a) * sp + t.x * 1.5
          d[1] = 0.8 + Math.random() * 2.2
          d[2] = Math.sin(a) * sp + t.z * 1.5
        }
      }
    }

    // crack effects play out over ~0.4 s, even after the whip is put away
    const live = c.at !== null && c.at < 0.4
    flash.current.visible = live && c.at < 0.1
    ring.current.visible = live
    sparks.current.visible = live
    if (live) {
      c.at += Math.min(rawDt, 0.05)
      const k = c.at / 0.4
      flash.current.position.set(c.x, c.y, c.z)
      flash.current.scale.setScalar(1 + (c.at / 0.1) * 1.2)
      flash.current.material.opacity = 0.9 * (1 - c.at / 0.1)
      ring.current.position.set(c.x, c.y, c.z)
      ring.current.scale.setScalar(0.2 + k * 1.3)
      ring.current.material.opacity = 0.75 * (1 - k)
      for (let i = 0; i < SPARKS; i++) {
        const d = c.dirs[i]
        sparkPos[i * 3] = c.x + d[0] * c.at
        sparkPos[i * 3 + 1] = Math.max(0.03, c.y + d[1] * c.at - 5 * c.at * c.at)
        sparkPos[i * 3 + 2] = c.z + d[2] * c.at
      }
      sparks.current.geometry.attributes.position.needsUpdate = true
      sparks.current.material.opacity = 1 - k
    }
  })

  return (
    <>
      <mesh ref={thong} geometry={geo} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.05} emissive={GLOW} emissiveIntensity={0.1} />
      </mesh>
      <group ref={handle}>
        <Handle />
      </group>
      {/* coiled on the belt between throws */}
      <group ref={coil}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.018, -i * 0.02, (i - 1) * 0.012]} rotation={[(i - 1) * 0.15, Math.PI / 2, 0]}>
            <torusGeometry args={[0.11 - i * 0.008, 0.017, 6, 22]} />
            <meshStandardMaterial color={i % 2 ? '#b8925a' : '#4a2a12'} roughness={0.6} emissive={GLOW} emissiveIntensity={0.08} />
          </mesh>
        ))}
      </group>
      {/* cracker: a frayed tuft at the tip */}
      <group ref={tip}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.26) * 0.012, 0.05, Math.sin(i * 1.26) * 0.012]} rotation={[Math.cos(i * 1.26) * 0.35, 0, Math.sin(i * 1.26) * 0.35]}>
            <coneGeometry args={[0.009, 0.11, 4]} />
            <meshBasicMaterial color="#fff2c4" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={flash}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshBasicMaterial color="#fff6d8" toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[0.32, 0.016, 6, 32]} />
        <meshBasicMaterial color="#ffe08a" toneMapped={false} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <points ref={sparks}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={sparkPos} count={SPARKS} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#ffd27a" size={0.13} transparent opacity={1} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </>
  )
}
