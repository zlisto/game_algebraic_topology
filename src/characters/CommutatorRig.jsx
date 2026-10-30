import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Part, preloadModels } from './models'

preloadModels('commutator')

/**
 * The Commutator, Null's marshal, after assets/characters/commutator.png: a lean knight in midnight plate
 * with copper trim, a pointed helm, a copper spiral band over one shoulder and a segmented crescent over the
 * other, a rapier, and two glowing ribbon loops above the helm (his a and b). The armour is sculpted in
 * Blender (tools/commutator_blender.py → public/models/commutator.glb); the ribbons, the blade's glow, the
 * mask crack and the disguise cloak are procedural. About 1.95 units tall at scale 1, facing +z.
 *
 * `pose(t, dt)` → { pos, rotY, visible, armRx, armRz, legL, legR, bob, kneel, loops, glow, cloak, crack, nod }
 * (every field optional). The scene-specific wrappers (castles/w3, w4, ending) map their scripts onto it.
 */

function ribbon(sign) {
  const pts = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2
    // a tall teardrop pinched at the helm's tip
    return new THREE.Vector3(sign * 0.17 * Math.sin(a) * (1 - Math.cos(a)) / 2, 0.4 * (1 - Math.cos(a)) / 2, Math.sin(2 * a) * 0.03)
  })
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.02, 8, true)
}

export default function CommutatorRig({ pose, scale = 1 }) {
  const root = useRef()
  const body = useRef()
  const armR = useRef()
  const legL = useRef()
  const legR = useRef()
  const ribbons = useRef()
  const cloak = useRef()
  const crack = useRef()
  const ribA = useRef()
  const ribB = useRef()
  const blade = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff9ae8', emissive: '#ff4ad0', emissiveIntensity: 1.8, toneMapped: false }), [])
  const geo = useMemo(() => ({ a: ribbon(1), b: ribbon(-1) }), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = pose(t, dt) || {}
    root.current.visible = s.visible !== false
    if (s.pos) root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY || 0
    const kn = s.kneel || 0
    body.current.position.y = (s.bob || 0) - 0.5 * kn
    body.current.rotation.x = 0.3 * kn + (s.nod || 0)
    armR.current.rotation.x = s.armRx ?? -0.5
    armR.current.rotation.z = s.armRz ?? -0.25
    legL.current.rotation.x = (s.legL || 0) - 1.2 * kn
    legR.current.rotation.x = (s.legR || 0) + 0.3 * kn
    blade.emissiveIntensity = 1.6 + (s.glow || 0) * 2 + Math.sin(t * 6) * 0.3
    ribbons.current.rotation.y = Math.sin(t * 1.3) * 0.25
    const lp = Math.max(0.05, s.loops ?? 1)
    ribbons.current.scale.setScalar(lp)
    ;[ribA, ribB].forEach((r) => r.current && (r.current.emissiveIntensity = 0.4 + lp * 1.1))
    const c = s.cloak || 0
    cloak.current.visible = c > 0.02
    cloak.current.scale.set(1, Math.max(0.02, c), 1)
    cloak.current.position.y = 1.0 + (1 - c) * 0.6
    crack.current.visible = (s.crack || 0) > 0.05
    crack.current.scale.y = s.crack || 0
  })
  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        <Part model="commutator" name="cm_body" />
        {[[-0.13, legL], [0.13, legR]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0.95, 0]}>
            <Part model="commutator" name="cm_leg" />
          </group>
        ))}
        {/* the still arm, open hand */}
        <group position={[-0.31, 1.47, 0]} rotation={[0.2, 0, 0.45]}>
          <Part model="commutator" name="cm_arm" scale={[-1, 1, 1]} />
        </group>
        {/* the sword arm and the rapier */}
        <group ref={armR} position={[0.31, 1.47, 0]}>
          <Part model="commutator" name="cm_arm" />
          <group position={[0, -0.62, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
            <Part model="commutator" name="cm_rapier" mats={{ blade }} />
          </group>
        </group>
        {/* the copper spiral over the left shoulder, the dark crescent over the right */}
        <group position={[-0.58, 1.2, -0.15]} rotation={[0, 0.3, 0.4]} scale={1.25}>
          <Part model="commutator" name="cm_spiral" />
        </group>
        <group position={[0.48, 1.4, -0.18]} rotation={[0, -0.3, 0.2]}>
          <Part model="commutator" name="cm_crescent" />
        </group>
        {/* his two ribbon loops, a and b, rising from the helm */}
        <group ref={ribbons} position={[0, 2.0, 0]}>
          <mesh geometry={geo.a} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial ref={ribA} color="#b07aff" emissive="#8a5aff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh geometry={geo.b} rotation={[0, 0, 0.3]}>
            <meshStandardMaterial ref={ribB} color="#7fa8ff" emissive="#5a7aff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
        {/* the crack across his helm (when his order breaks) */}
        <mesh ref={crack} position={[0.02, 1.72, 0.128]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.01, 0.26, 0.01]} />
          <meshBasicMaterial color="#ff9ae8" toneMapped={false} />
        </mesh>
        {/* the disguise: a hooded cloak over everything */}
        <mesh ref={cloak} position={[0, 1.0, 0]}>
          <coneGeometry args={[0.6, 2.3, 24, 1, true]} />
          <meshStandardMaterial color="#2a2236" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

