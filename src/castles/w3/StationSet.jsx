import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { NullCrown } from '../../characters/CountNull'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { BOSS_AT } from './stages'

/**
 * The Counterfeit Station: a round marble concourse raised high over a night sea, where four
 * viaducts meet. Trains of violet light run the rails. Behind the dais stands the Façade, a
 * colossal stone torus arch with a station clock at its crown, flanked by departure boards whose
 * flaps flicker through cohomology counts. Brass lamps ring the platform edge.
 */

export const ARENA_R = 8.6
export const FACADE = [0, 0, -15] // the torus arch, behind the dais
export const FACADE_R = 7.2
const RAIL_ANGLES = [Math.PI * 0.22, Math.PI * 0.78, Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.5] // radiating viaducts (0.5π = the way in, +z)

function rng(seed) {
  let s = seed % 2147483647 || 1
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** One viaduct: a deck from the platform edge out across the sea, rails, and piers to the water. */
function Viaduct({ angle, len = 70 }) {
  const dir = [Math.cos(angle), Math.sin(angle)]
  const mid = ARENA_R + len / 2
  const piers = Math.floor(len / 6)
  return (
    <group position={[dir[0] * mid, 0, dir[1] * mid]} rotation={[0, -angle, 0]}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[len, 0.5, 2.4]} />
        <meshStandardMaterial color="#2a2634" roughness={0.6} metalness={0.2} />
      </mesh>
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[0, 0.0, z]}>
          <boxGeometry args={[len, 0.07, 0.08]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.25} emissive="#7a5a20" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {Array.from({ length: piers }, (_, i) => (
        <group key={i} position={[-len / 2 + 3 + i * 6, 0, 0]}>
          <mesh position={[0, -3.6, 0]}>
            <boxGeometry args={[0.7, 6, 1.6]} />
            <meshStandardMaterial color="#1e1a28" roughness={0.7} />
          </mesh>
          <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.4, 0.18, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#1e1a28" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Trains of violet light, streaking in and out along the viaducts. */
function Trains() {
  const g = useRef()
  const plan = useMemo(() => RAIL_ANGLES.map((a, i) => ({ a, sp: 9 + i * 2.3, ph: i * 17, dir: i % 2 ? 1 : -1 })), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    g.current.children.forEach((m, i) => {
      const p = plan[i]
      const L = 90
      const u = ((t * p.sp + p.ph) % L) / L
      const r = ARENA_R + 2 + (p.dir > 0 ? u : 1 - u) * 70
      m.position.set(Math.cos(p.a) * r, 0.36, Math.sin(p.a) * r)
      m.rotation.y = -p.a
      m.visible = r > ARENA_R + 3 && p.a !== Math.PI * 0.5
    })
  })
  return (
    <group ref={g}>
      {plan.map((p, i) => (
        <group key={i}>
          {[0, 1, 2, 3].map((c) => (
            <mesh key={c} position={[c * 1.7, 0, 0]}>
              <boxGeometry args={[1.5, 0.6, 0.9]} />
              <meshStandardMaterial color="#2a1840" emissive="#b070ff" emissiveIntensity={c === 0 ? 2.2 : 1.1} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** A departure board on two legs: a dark panel of flaps that flicker as the counts roll over. */
function Board({ position, rotY = 0 }) {
  const flaps = useRef()
  const cells = useMemo(() => {
    const out = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) out.push([c, r])
    return out
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    flaps.current.children.forEach((m, i) => {
      const [c, r] = cells[i]
      const on = Math.sin(t * 2.3 + c * 1.7 + r * 3.1) > -0.2 || (c + r + Math.floor(t * 1.5)) % 5 === 0
      m.material.emissiveIntensity = on ? 1.1 : 0.12
    })
  })
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, -4.2, 0]}>
        <boxGeometry args={[4.8, 8.6, 1.6]} />
        <meshStandardMaterial color="#1e1a28" roughness={0.7} />
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 3.2, 8]} />
          <meshStandardMaterial color="#2a2634" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[4.4, 1.6, 0.25]} />
        <meshStandardMaterial color="#0c0a12" metalness={0.5} roughness={0.3} />
      </mesh>
      <group ref={flaps} position={[-1.8, 4.1, 0.14]}>
        {cells.map(([c, r], i) => (
          <mesh key={i} position={[c * 0.45, -r * 0.34, 0]}>
            <planeGeometry args={[0.36, 0.26]} />
            <meshStandardMaterial color="#1a1420" emissive={c < 2 ? '#ffd27a' : '#c8a8ff'} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** The Façade: a colossal stone torus standing on its edge, seamed in violet, a clock at its crown. */
export function Facade({ glowRef }) {
  const hands = useRef()
  const seam = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (hands.current) {
      hands.current.children[0].rotation.z = -t * 0.05
      hands.current.children[1].rotation.z = -t * 0.6
    }
    if (seam.current) seam.current.material.emissiveIntensity = (glowRef?.current ?? 1) * (1.2 + Math.sin(t * 1.4) * 0.3)
  })
  return (
    <group position={FACADE}>
      <mesh position={[0, FACADE_R - 1.5, 0]}>
        <torusGeometry args={[FACADE_R, 1.5, 20, 64]} />
        <meshStandardMaterial color="#3a3446" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh ref={seam} position={[0, FACADE_R - 1.5, 0.02]}>
        <torusGeometry args={[FACADE_R, 1.53, 4, 64]} />
        <meshStandardMaterial color="#120a20" emissive="#a259ff" emissiveIntensity={1.2} wireframe toneMapped={false} />
      </mesh>
      {/* the clock at its crown */}
      <group position={[0, FACADE_R * 2 - 1.5, 1.6]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.3, 40]} />
          <meshStandardMaterial color="#f2e8cc" emissive="#ffd27a" emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <torusGeometry args={[1.5, 0.12, 8, 40]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.25} />
        </mesh>
        <group ref={hands} position={[0, 0, 0.2]}>
          <mesh>
            <boxGeometry args={[0.1, 0.9, 0.04]} />
            <meshStandardMaterial color="#120e18" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.06, 1.3, 0.04]} />
            <meshStandardMaterial color="#120e18" />
          </mesh>
        </group>
      </group>
      {/* the plinths the arch stands on */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * FACADE_R, -4.4, 0]}>
          <boxGeometry args={[3.6, 9.2, 3.6]} />
          <meshStandardMaterial color="#221e2c" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** The concourse floor: marble tiles in rings, a gold platform line, lamps at the edge. */
function Concourse() {
  const tiles = useMemo(() => {
    const out = []
    const r = rng(31)
    for (let R = 1.0; R < ARENA_R; R += 0.9) {
      const n = Math.round((2 * Math.PI * R) / 0.9)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + R * 0.7
        out.push({ x: Math.cos(a) * R, z: Math.sin(a) * R, rot: a, dark: (i + Math.round(R)) % 2 === 0, j: r() })
      }
    }
    return out
  }, [])
  const light = useRef()
  const dark = useRef()
  const m = useMemo(() => new THREE.Object3D(), [])
  const placed = useRef(false)
  useFrame(() => {
    if (placed.current || !light.current || !dark.current) return
    let li = 0
    let di = 0
    for (const t of tiles) {
      m.position.set(t.x, -0.04 + t.j * 0.012, t.z)
      m.rotation.set(0, -t.rot, 0)
      m.updateMatrix()
      if (t.dark) dark.current.setMatrixAt(di++, m.matrix)
      else light.current.setMatrixAt(li++, m.matrix)
    }
    light.current.count = li
    dark.current.count = di
    light.current.instanceMatrix.needsUpdate = true
    dark.current.instanceMatrix.needsUpdate = true
    placed.current = true
  })
  const lamps = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2).filter((a) => RAIL_ANGLES.every((r) => Math.abs(Math.atan2(Math.sin(a - r), Math.cos(a - r))) > (r === Math.PI * 0.5 ? 0.5 : 0.22))),
    [],
  )
  return (
    <>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[ARENA_R + 0.5, ARENA_R - 0.4, 0.7, 72]} />
        <meshStandardMaterial color="#2a2434" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* the station's underside, tapering down toward the sea */}
      <mesh position={[0, -4.2, 0]}>
        <cylinderGeometry args={[ARENA_R - 0.4, 2.6, 7, 36]} />
        <meshStandardMaterial color="#1a1622" roughness={0.7} />
      </mesh>
      <instancedMesh ref={light} args={[null, null, tiles.length]}>
        <boxGeometry args={[0.8, 0.07, 0.8]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.25} metalness={0.15} />
      </instancedMesh>
      <instancedMesh ref={dark} args={[null, null, tiles.length]}>
        <boxGeometry args={[0.8, 0.07, 0.8]} />
        <meshStandardMaterial color="#3a3046" roughness={0.25} metalness={0.3} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        <ringGeometry args={[ARENA_R - 0.12, ARENA_R + 0.12, 96]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      {lamps.map((a, i) => (
        <group key={i} position={[Math.cos(a) * (ARENA_R + 0.25), 0, Math.sin(a) * (ARENA_R + 0.25)]}>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 2.8, 8]} />
            <meshStandardMaterial color="#2a2232" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.95, 0]}>
            <sphereGeometry args={[0.2, 12, 10]} />
            <meshStandardMaterial color="#ffe0a0" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** The dais the Commutator stands on, and the Crown hovering above it (Null's voice). */
export function Dais({ crownGlow }) {
  const crown = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (crown.current) {
      crown.current.rotation.y = t * 0.5
      crown.current.position.y = 5.2 + Math.sin(t * 1.1) * 0.18
    }
  })
  return (
    <group position={[BOSS_AT[0], 0, BOSS_AT[1]]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.9, 2.1, 0.45, 8]} />
        <meshStandardMaterial color="#221c2e" roughness={0.3} metalness={0.5} flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.36, 0]}>
        <ringGeometry args={[1.55, 1.7, 8]} />
        <meshBasicMaterial color="#c9a24a" toneMapped={false} />
      </mesh>
      <group ref={crown} position={[0, 5.2, 0]} scale={3.2}>
        <NullCrown glowRef={crownGlow} />
      </group>
      <pointLight position={[0, 5, 0]} intensity={26} distance={20} color="#a259ff" />
    </group>
  )
}

/** Everything around the play floor: sky, sea, viaducts and trains, the Façade, boards, the concourse. */
export default function StationSet({ crownGlow, facadeGlow, dais = true, sea = true, facade = true }) {
  return (
    <>
      <color attach="background" args={['#080812']} />
      <fog attach="fog" args={['#080812', 26, 80]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={['#c8b8ff', '#0a0814', 0.45]} />
      <directionalLight position={[10, 18, 12]} intensity={0.75} color="#e8dcff" />
      <pointLight position={[0, 6, 5]} intensity={12} distance={22} color="#ffd8a0" />
      <Stars radius={110} depth={50} count={2000} factor={2.8} fade speed={0.3} />
      <Sparkles count={120} scale={[22, 6, 22]} position={[0, 2.5, 0]} size={2} speed={0.3} color="#ffcf6a" opacity={0.5} />
      {sea && <Seascape y={-7.5} area={[0, 0, 140, 140]} bed={false} lanterns={16} seed={39} palette={{ water: '#241a3a', deep: '#06040c' }} />}
      <Clouds y={-3.5} area={[0, 0, 90, 90]} count={16} color="#b89ae0" opacity={0.18} seed={39} speed={0.2} />
      <FloatingRocks center={[0, 0, 0]} radius={[14, 30]} count={26} seed={39} ySpread={[-9, -2]} />
      {RAIL_ANGLES.map((a, i) => (
        <Viaduct key={i} angle={a} />
      ))}
      <Trains />
      {facade && <Facade glowRef={facadeGlow} />}
      <Board position={[-9.4, 0, -10]} rotY={0.5} />
      <Board position={[9.4, 0, -10]} rotY={-0.5} />
      <Concourse />
      {dais && <Dais crownGlow={crownGlow} />}
    </>
  )
}
