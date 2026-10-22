import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { hopfFibre, Tube } from './Demos4'
import { NULL_AT } from './stages'

/**
 * The summit of the Postnikov Spire, where the Null Crown hangs. A round floor of indigo stone
 * cut into cells and inlaid with the Chart's gold, open to the sky between obelisks that each
 * carry a turning cube (the Cube Hall far below). Under the rim the Spire's lower floors — X₃,
 * X₂, X₁ — step outward, joined by twisting seams (the k-invariants). Far below, the night sea
 * and the lit islands of the Winding Way; in the sky behind the throne, great linked Hopf circles.
 */

export const ARENA_R = 8.6
export const CROWN_HOME = [NULL_AT[0], 6.2, NULL_AT[1]]
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))

export const GLOW = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(255,236,200,0.85)')
  r.addColorStop(0.5, 'rgba(200,150,255,0.25)')
  r.addColorStop(1, 'rgba(120,80,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

/** A soft additive flash sprite whose size and opacity a ref drives ({ k: 0..1, size }). */
export function Flash({ position, kRef, size = 30, color = '#ffffff' }) {
  const sp = useRef()
  useFrame(() => {
    const k = typeof kRef === 'function' ? kRef() : kRef.current
    sp.current.visible = k > 0.001
    sp.current.material.opacity = Math.min(1, k)
    sp.current.scale.setScalar(size * (0.3 + 0.7 * k))
  })
  return (
    <sprite ref={sp} position={position}>
      <spriteMaterial map={GLOW} color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  )
}

function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

/** The summit floor: cells of stone that pulse with the Crown (violet) and the Chart (gold). */
function Floor({ furyRef }) {
  const tiles = useMemo(() => {
    const out = []
    for (let ring = 0; ring < 7; ring++) {
      const r0 = 1.0 + ring * 1.1
      const n = 8 + ring * 6
      for (let i = 0; i < n; i++) out.push({ a: ((i + 0.5) / n) * Math.PI * 2 + ring * 0.2, r: r0 + 0.55, w: ((Math.PI * 2 * (r0 + 0.55)) / n) * 0.9, ring })
    }
    return out
  }, [])
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const A = useMemo(() => new THREE.Color('#1a1534'), [])
  const B = useMemo(() => new THREE.Color('#4a1f8a'), [])
  const Gd = useMemo(() => new THREE.Color('#6a5220'), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const fury = furyRef?.current ?? 0.4
    tiles.forEach((p, i) => {
      const x = Math.cos(p.a) * p.r
      const z = Math.sin(p.a) * p.r
      const d = Math.hypot(x - NULL_AT[0], z - NULL_AT[1])
      const w = Math.sin(d * 1.1 - t * (1.6 + fury * 2.2))
      dummy.position.set(x, -0.05 + w * 0.02 * (0.5 + fury), z)
      dummy.rotation.set(0, -p.a, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
      col.copy(A).lerp(B, Math.max(0, w) * (0.25 + fury * 0.6))
      if ((i * 7) % 11 === 0) col.lerp(Gd, 0.5 + 0.5 * Math.sin(t * 0.8 + i))
      inst.current.setColorAt(i, col)
    })
    inst.current.instanceMatrix.needsUpdate = true
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true
  })
  return (
    <>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[ARENA_R + 0.5, ARENA_R - 0.3, 0.8, 72]} />
        <meshStandardMaterial color="#100c1e" roughness={0.3} metalness={0.6} />
      </mesh>
      <instancedMesh ref={inst} args={[null, null, tiles.length]}>
        <boxGeometry args={[0.92, 0.07, 0.95]} />
        <meshStandardMaterial roughness={0.35} metalness={0.45} emissive="#1a0a3a" emissiveIntensity={0.5} />
      </instancedMesh>
      {/* the Chart's gold inlay: concentric rings and the rim */}
      {[2.0, 4.2, 6.4].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
          <ringGeometry args={[r - 0.04, r + 0.04, 96]} />
          <meshBasicMaterial color="#d8a84a" toneMapped={false} transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[ARENA_R - 0.1, ARENA_R + 0.3, 128]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[ARENA_R + 0.3, ARENA_R + 0.5, 128]} />
        <meshBasicMaterial color="#8a5aff" toneMapped={false} />
      </mesh>
    </>
  )
}

/** Obelisks round the rim, each with a turning cube over it; a gap at the front where the stair arrives. */
function Obelisks() {
  const cubes = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    cubes.current.forEach((c, i) => {
      if (!c) return
      c.rotation.set(t * 0.4 + i, t * 0.6 + i * 0.5, 0)
      c.position.y = 6.4 + Math.sin(t * 1.2 + i) * 0.2
    })
  })
  const n = 12
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / n
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.4) return null
    const r = ARENA_R + 1.0
    return (
      <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, -a, 0]}>
        <mesh position={[0, 2.7, 0]}>
          <cylinderGeometry args={[0.22, 0.42, 5.6, 4]} />
          <meshStandardMaterial color="#141026" roughness={0.25} metalness={0.7} flatShading />
        </mesh>
        <mesh position={[0, 5.65, 0]}>
          <coneGeometry args={[0.22, 0.5, 4]} />
          <meshStandardMaterial color="#d8a84a" emissive="#8a5a10" emissiveIntensity={0.8} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.3, 2.6, 0]}>
          <boxGeometry args={[0.03, 4.6, 0.1]} />
          <meshBasicMaterial color="#b07aff" toneMapped={false} />
        </mesh>
        <mesh ref={(m) => (cubes.current[i] = m)} position={[0, 6.4, 0]}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color="#2a1f4a" emissive="#7a4aff" emissiveIntensity={0.7} metalness={0.5} roughness={0.3} wireframe={i % 3 === 0} />
        </mesh>
      </group>
    )
  })
}

/** The Spire's lower floors under the rim, stepping outward, with twisting seams between them. */
function LowerFloors() {
  const floors = [
    { y: -3.6, r: 10.6 },
    { y: -8.4, r: 13.0 },
    { y: -14.0, r: 15.8 },
  ]
  const seams = useMemo(() => {
    const out = []
    const top = [{ y: -0.8, r: ARENA_R - 0.2 }, ...floors]
    for (let f = 0; f < floors.length; f++) {
      const A = top[f]
      const B = top[f + 1]
      for (let k = 0; k < 8; k++) {
        const a0 = (k / 8) * Math.PI * 2 + f * 0.4
        out.push({
          key: `${f}:${k}`,
          pts: Array.from({ length: 14 }, (_, i) => {
            const u = i / 13
            const a = a0 + u * 0.55
            const r = A.r * 0.92 + (B.r * 0.92 - A.r * 0.92) * u
            return [Math.cos(a) * r, A.y + (B.y - A.y) * u - 0.4, Math.sin(a) * r]
          }),
          color: f % 2 ? '#ff8ad8' : '#b07aff',
        })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {floors.map((f, i) => (
        <group key={i} position={[0, f.y, 0]}>
          <mesh>
            <cylinderGeometry args={[f.r, f.r - 1.2, 1.4, 64]} />
            <meshStandardMaterial color="#2a2246" emissive="#140c2a" emissiveIntensity={0.7} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.71, 0]}>
            <ringGeometry args={[f.r - 0.35, f.r, 96]} />
            <meshBasicMaterial color="#d8a84a" toneMapped={false} transparent opacity={0.8} />
          </mesh>
          {Array.from({ length: 16 }, (_, k) => {
            const a = (k / 16) * Math.PI * 2 + i
            return (
              <mesh key={k} position={[Math.cos(a) * (f.r - 0.02), 0, Math.sin(a) * (f.r - 0.02)]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.05, 0.6, 0.4]} />
                <meshBasicMaterial color={k % 4 === 0 ? '#ffd27a' : '#7a4aff'} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      ))}
      {seams.map((s) => (
        <Tube key={s.key} pts={s.pts} r={0.04} color={s.color} glow={0.45} seg={30} />
      ))}
    </>
  )
}

/** Great linked Hopf circles turning in the sky behind the throne. */
function HopfSky() {
  const g = useRef()
  useFrame((_, dt) => {
    g.current.rotation.y += dt * 0.05
    g.current.rotation.z = 0.25
  })
  const fibres = useMemo(
    () => [
      [0.4, 0, '#ffd27a'],
      [1.0, 1.2, '#7fe0ff'],
      [1.5, 2.6, '#ff8ad8'],
      [2.0, 4.0, '#9cf0a0'],
      [2.5, 5.3, '#b07aff'],
      [1.2, 3.4, '#ffb070'],
    ],
    [],
  )
  return (
    <group position={[0, 18, -52]}>
      <group ref={g}>
        {fibres.map(([th, ph, c], i) => (
          <Tube key={i} pts={hopfFibre(th, ph, 8, 140)} r={0.14} color={c} glow={0.55} closed seg={200} />
        ))}
      </group>
    </group>
  )
}

/** The Winding Way far below: the night sea and its lit, holed islands. */
function WayBelow({ dimRef }) {
  const islands = useMemo(() => {
    const r = rng(77)
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + r() * 0.5
      const d = 30 + r() * 34
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, R: 2.5 + r() * 2.5, kind: i % 3 }
    })
  }, [])
  const mats = useRef([])
  useFrame(() => {
    const dim = dimRef?.current ?? 0
    mats.current.forEach((m) => m && (m.emissiveIntensity = 1.2 * (1 - dim) + 0.15))
  })
  return (
    <group position={[0, -44, 0]}>
      <Seascape y={0} depth={3} bed={false} lanterns={0} area={[0, 0, 240, 240]} seed={404} palette={{ water: '#101c40', deep: '#050a1c' }} />
      {islands.map((s, i) => (
        <group key={i} position={[s.x, 0.4, s.z]}>
          {s.kind === 1 ? (
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[s.R * 0.6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#2a3a5a" roughness={0.8} />
            </mesh>
          ) : (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[s.R, s.R * 0.32, 12, 32]} />
              <meshStandardMaterial color="#2a3a4a" roughness={0.8} />
            </mesh>
          )}
          {Array.from({ length: 6 }, (_, k) => {
            const a = (k / 6) * Math.PI * 2
            return (
              <mesh key={k} position={[Math.cos(a) * s.R, s.R * 0.35, Math.sin(a) * s.R]}>
                <sphereGeometry args={[0.35, 8, 6]} />
                <meshStandardMaterial ref={(m) => (mats.current[i * 6 + k] = m)} color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.2} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/** Sky, lights and every piece of the summit except the Crown. */
export function Summit({ furyRef, dimRef, rocksCenter = [0, 0, 0], rocksRadius = [19, 34] }) {
  return (
    <>
      <color attach="background" args={['#070512']} />
      <fog attach="fog" args={['#070512', 34, 120]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={['#c8b8ff', '#0a0612', 0.45]} />
      <directionalLight position={[8, 18, 12]} intensity={0.75} color="#e8dcff" />
      <pointLight position={[NULL_AT[0], 6, NULL_AT[1]]} intensity={40} distance={26} color="#a259ff" />
      <pointLight position={[0, 6, 5]} intensity={12} distance={22} color="#ffd8a0" />
      <Stars radius={120} depth={50} count={2200} factor={3} fade speed={0.4} />
      <Sparkles count={180} scale={[22, 8, 22]} position={[0, 2.5, 0]} size={2.4} speed={0.4} color="#c58bff" />
      <Sparkles count={60} scale={[18, 4, 18]} position={[0, 1, 0]} size={3} speed={0.25} color="#ffd27a" />
      <Floor furyRef={furyRef} />
      <Obelisks />
      <LowerFloors />
      <HopfSky />
      <pointLight position={[0, -7, 0]} intensity={40} distance={36} color="#8a5aff" />
      <FloatingRocks center={rocksCenter} radius={rocksRadius} count={30} seed={44} ySpread={[-18, 3]} glow="#a259ff" />
      <Clouds y={-20} area={[0, 0, 120, 120]} count={22} color="#8a6ad8" opacity={0.2} seed={12} speed={0.3} />
      <WayBelow dimRef={dimRef} />
    </>
  )
}

/**
 * The Null Crown, grown huge: a broken black ring of spikes with five law-facets set round it and a
 * core of violet light. `stateRef.current` = { broken: number of facets broken, low: 0..1 (lowered
 * to the floor), shatter: 0..1, fury: 0..1, beam: 0..1 }.
 */
export function Crown({ stateRef, home = CROWN_HOME, lowAt = [NULL_AT[0], 2.2, NULL_AT[1] + 2.6], scale = 1 }) {
  const g = useRef()
  const spin = useRef()
  const facets = useRef([])
  const core = useRef()
  const coreMat = useRef()
  const beam = useRef()
  const spikes = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const a = ((i + 0.5) / 20) * (Math.PI * 2 - 0.5)
        return { a, h: 0.35 + 0.65 * Math.abs(Math.cos(a - Math.PI)) ** 3 }
      }),
    [],
  )
  const FACET_A = [0.4, 1.65, 2.9, 4.15, 5.4]
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = stateRef.current
    const low = s.low || 0
    const sh = s.shatter || 0
    const fury = s.fury ?? 0.5
    g.current.position.set(home[0] + (lowAt[0] - home[0]) * low, home[1] + (lowAt[1] - home[1]) * low + Math.sin(t * 1.3) * 0.18, home[2] + (lowAt[2] - home[2]) * low)
    spin.current.rotation.y += dt * (0.35 + fury * 0.9)
    spin.current.rotation.x = Math.sin(t * 0.7) * 0.08 * (1 + low * 3)
    g.current.scale.setScalar(scale * (1 + sh * 1.5) * (sh > 0.6 ? 1 - seg(sh, 0.6, 1) : 1))
    g.current.visible = sh < 0.999
    facets.current.forEach((f, i) => {
      if (!f) return
      const gone = i < (s.broken || 0)
      f.visible = !gone
      f.rotation.y = t * 1.5 + i
      f.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.08 * fury)
    })
    coreMat.current.emissiveIntensity = 0.7 + fury * 1.5 + Math.sin(t * 5) * 0.3
    core.current.scale.setScalar(0.55 + fury * 0.25 + Math.sin(t * 3) * 0.04)
    beam.current.visible = (s.beam || 0) > 0.01
    beam.current.material.opacity = 0.45 * (s.beam || 0)
    beam.current.scale.set(1 + Math.sin(t * 20) * 0.08, 1, 1 + Math.sin(t * 20) * 0.08)
  })
  return (
    <group ref={g} position={home}>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.13, 10, 80, Math.PI * 2 - 0.5]} />
          <meshStandardMaterial color="#0d0a12" metalness={0.85} roughness={0.25} emissive="#a259ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {spikes.map((p, i) => (
          <mesh key={i} position={[Math.cos(p.a) * 2.2, p.h / 2, Math.sin(p.a) * 2.2]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.08, p.h, 6]} />
            <meshStandardMaterial color="#0d0a12" metalness={0.85} roughness={0.25} emissive="#a259ff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        ))}
        {FACET_A.map((a, i) => (
          <group key={i} position={[Math.cos(a) * 2.2, 0.15, Math.sin(a) * 2.2]}>
            <mesh ref={(m) => (facets.current[i] = m)}>
              <octahedronGeometry args={[0.42, 0]} />
              <meshStandardMaterial color="#e8d0ff" emissive="#b070ff" emissiveIntensity={1.6} metalness={0.4} roughness={0.15} flatShading toneMapped={false} />
            </mesh>
            {/* the socket stays when a facet breaks */}
            <mesh position={[0, -0.3, 0]}>
              <coneGeometry args={[0.16, 0.25, 4]} />
              <meshStandardMaterial color="#1a1424" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial ref={coreMat} color="#1a0a2a" emissive="#c06aff" emissiveIntensity={2} flatShading toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0, -20, 0]}>
        <cylinderGeometry args={[0.35, 1.4, 40, 24, 1, true]} />
        <meshBasicMaterial color="#c08aff" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}
