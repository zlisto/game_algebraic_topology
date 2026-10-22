import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Lightning, cached, merge, piece } from './Beasts'

/**
 * The cohomology wing of the bestiary (World 3, the Cup Product Gardens; design/BESTIARY.md).
 * They answer to the lash's STANCE (G toggles): chain (gold) strikes chains, cochain (cyan) strikes
 * the dual — it evaluates rather than cuts.
 *
 *   HarpySpawn    — a cochain α with its coboundary: ⟨δα, c⟩ = ⟨α, ∂c⟩. Chain lashes are chains it
 *                   evaluates, so they feed it; three cochain lashes drive δα to 0.
 *   SpiderSpawn   — the cup product, α ⌣ β = (−1)^pq β ⌣ α. Touch it and it cups itself up to an armored
 *                   degree-2 form. Four lashes, alternating stance; repeat a stance and the web recoils.
 *   SpectreSpawn  — a closed, non-exact 1-form (dω = 0, ω ≠ df). Invulnerable while it circulates a hole:
 *                   run a full loop round it (∮ω ≠ 0) and it is forced exact for a few seconds. Three lashes.
 *                   (de Rham cohomology is beyond Hatcher's core text — flagged in the bestiary.)
 *   ColossusSpawn — Poincaré duality, Hᵏ ≅ Hₙ₋ₖ: a stone body (chains) under a luminous one (cochains).
 *                   Six lashes, alternating stone and light; each resolved pairing shatters a joint.
 */

const CYAN = '#5cf0ff'
const VIOLET = '#b070ff'

function place(g, e, y, dieTime, size = 1) {
  g.visible = e.alive || e.dying > 0
  g.position.set(e.x, y, e.z)
  g.rotation.y = e.face
  g.scale.setScalar(size * (e.dying > 0 ? Math.max(0.001, e.dying / dieTime) : 1 + (e.flash > 0 ? 0.12 : 0)))
}

// ---------------------------------------------------------------- Coboundary Harpy

/** A wing: a fan of triangles drawn as a glowing lattice (wireframe), seen from the dual side. */
function wingGeo() {
  return cached('harpy-wing', () => {
    const g = new THREE.PlaneGeometry(0.9, 0.42, 6, 3)
    g.translate(0.45, 0, 0)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * (1 - (p.getX(i) / 0.9) * 0.6)) // taper to the tip
    return g
  })
}
/** A floating measurement plane: a sheet with its dual graph (dots joined across edges). */
function planeGeo() {
  return cached('harpy-plane', () => {
    const pts = []
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) pts.push([(i - 1.5) * 0.08, (j - 1) * 0.08])
    const lines = []
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      if (i < 3) lines.push(...[(i - 1.5) * 0.08, (j - 1) * 0.08, 0.01, (i - 0.5) * 0.08, (j - 1) * 0.08, 0.01])
      if (j < 2) lines.push(...[(i - 1.5) * 0.08, (j - 1) * 0.08, 0.01, (i - 1.5) * 0.08, j * 0.08, 0.01])
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3))
    return g
  })
}

export function HarpySpawn({ e }) {
  const g = useRef()
  const wings = useRef([])
  const planes = useRef()
  const body = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + (e.seed || 0)
    place(g.current, e, 1.05 + Math.sin(t * 2.2) * 0.1, 0.5, 1.2)
    const flap = Math.sin(t * 7) * 0.55
    wings.current.forEach((w, i) => w && (w.rotation.z = (i ? -1 : 1) * (0.25 + flap)))
    planes.current.rotation.y = t * 0.9
    // healing glow when it has just eaten a chain lash
    body.current.material.emissiveIntensity = e.fed > 0 ? 2 : 0.6
  })
  return (
    <group ref={g}>
      {/* the lattice body: a crystal of triangles */}
      <mesh ref={body} scale={[0.17, 0.24, 0.17]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3a2a5a" emissive="#7a4ad8" emissiveIntensity={0.6} flatShading roughness={0.3} />
      </mesh>
      <mesh scale={[0.18, 0.25, 0.18]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={CYAN} wireframe toneMapped={false} />
      </mesh>
      {/* head, beak and cold eyes */}
      <group position={[0, 0.3, 0.06]}>
        <mesh scale={0.09}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#3a2a5a" emissive="#7a4ad8" emissiveIntensity={0.6} flatShading />
        </mesh>
        <mesh position={[0, -0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.025, 0.09, 4]} />
          <meshBasicMaterial color="#e8d8ff" toneMapped={false} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.04, 0.02, 0.075]}>
            <sphereGeometry args={[0.014, 8, 6]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* lattice wings */}
      {[1, -1].map((s, i) => (
        <group key={s} position={[s * 0.12, 0.12, 0]} scale={[s, 1, 1]} ref={(el) => (wings.current[i] = el)}>
          <mesh geometry={wingGeo()}>
            <meshBasicMaterial color="#c0a0ff" wireframe transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <mesh geometry={wingGeo()}>
            <meshBasicMaterial color="#6a3aaa" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* measurement planes orbiting it, each etched with its dual graph */}
      <group ref={planes}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 0.55, 0.1 + (i % 2) * 0.2, Math.sin(a) * 0.55]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh>
                <planeGeometry args={[0.32, 0.24]} />
                <meshBasicMaterial color="#9fe6ff" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
              </mesh>
              <lineSegments geometry={planeGeo()}>
                <lineBasicMaterial color={CYAN} toneMapped={false} />
              </lineSegments>
            </group>
          )
        })}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- Cup Spider

function legsGeo() {
  return cached('spider-legs', () => {
    const parts = []
    for (let k = 0; k < 8; k++) {
      const side = k < 4 ? 1 : -1
      const i = k % 4
      const a = (i - 1.5) * 0.45
      const ox = Math.sin(a) * 0.08
      const oz = Math.cos(a) * 0.08
      const kx = side * (0.28 + Math.abs(Math.cos(a)) * 0.05)
      const kz = (i - 1.5) * 0.14
      // thigh up to the knee, shin down to the floor: glowing 1-cochain threads
      const seg = (x0, y0, z0, x1, y1, z1) => {
        const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0
        const len = Math.hypot(dx, dy, dz)
        const g = new THREE.CylinderGeometry(0.014, 0.012, len, 5)
        const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(dx, dy, dz), new THREE.Vector3(0, 1, 0))
        g.rotateX(Math.PI / 2).applyMatrix4(m).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        return piece(g)
      }
      parts.push(seg(side * 0.08 + ox * 0.2, 0, oz * 0.2 + kz * 0.3, kx, 0.18, kz), seg(kx, 0.18, kz, kx * 1.55, -0.32, kz * 1.4))
    }
    return merge(parts)
  })
}

export function SpiderSpawn({ e }) {
  const g = useRef()
  const legs = useRef()
  const web = useRef()
  const graded = !!e.graded
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + (e.seed || 0)
    place(g.current, e, 0.42 + Math.abs(Math.sin(t * 9)) * (graded ? 0.01 : 0.03), 0.5, graded ? 1.35 : 1.05)
    legs.current.rotation.y = Math.sin(t * (graded ? 4 : 12)) * 0.08 // a skittering scuttle
    web.current.visible = graded
    if (graded) web.current.rotation.y = t * 0.4
  })
  return (
    <group ref={g}>
      <mesh ref={legs} geometry={legsGeo()}>
        <meshBasicMaterial color={graded ? '#ffd27a' : VIOLET} toneMapped={false} />
      </mesh>
      {/* abdomen with the two crossed sigils (α and β), and the head with its eye cluster */}
      <mesh position={[0, 0.06, -0.14]} scale={[0.2, 0.17, 0.24]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshPhysicalMaterial color={graded ? '#3a2410' : '#1f1028'} clearcoat={1} roughness={0.25} emissive={graded ? '#8a5a10' : '#3a0f5e'} emissiveIntensity={e.flash > 0 ? 2 : 0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.05, 0.22, -0.14]} rotation={[Math.PI / 2, 0, s * 0.6]}>
          <torusGeometry args={[0.06, 0.008, 4, 16, Math.PI]} />
          <meshBasicMaterial color="#ff8cff" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 0.12]} scale={[0.11, 0.09, 0.11]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshPhysicalMaterial color="#1f1028" clearcoat={1} roughness={0.25} emissive="#3a0f5e" emissiveIntensity={0.5} />
      </mesh>
      {[[-0.04, 0.08], [0.04, 0.08], [-0.02, 0.11], [0.02, 0.11]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.22]}>
          <sphereGeometry args={[0.013, 6, 5]} />
          <meshBasicMaterial color="#f4e8ff" toneMapped={false} />
        </mesh>
      ))}
      {/* graded up: a filled 2-form web beneath it — lines became a plane */}
      <mesh ref={web} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]} visible={false}>
        <circleGeometry args={[0.75, 8]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.25} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- de Rham Spectre

export function SpectreSpawn({ e }) {
  const g = useRef()
  const swirl = useRef()
  const flow = useRef()
  const streams = useMemo(
    () =>
      cached('spectre-streams', () =>
        Array.from({ length: 7 }, (_, k) => {
          const r = 0.16 + k * 0.06
          const pts = []
          for (let i = 0; i <= 48; i++) {
            const a = (i / 48) * Math.PI * 1.7 + k
            pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 0.3 + k) * 0.03 + (k - 3) * 0.035, Math.sin(a) * r))
          }
          return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.008, 4, false)
        }),
      ),
    [],
  )
  const gradient = useMemo(
    () =>
      cached('spectre-gradient', () =>
        merge(Array.from({ length: 7 }, (_, k) => piece(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 4), { p: [(k - 3) * 0.08, 0, 0], r: [Math.PI / 2, 0, 0] }))),
      ),
    [],
  )
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + (e.seed || 0)
    place(g.current, e, 0.85 + Math.sin(t * 1.3) * 0.07, 0.6, 1.3)
    const exact = e.exact > 0
    swirl.current.visible = !exact
    flow.current.visible = exact
    swirl.current.rotation.y += dt * 2.4 // circulating round its hole
    swirl.current.children.forEach((m, i) => (m.material.opacity = 0.45 + 0.4 * Math.sin(t * 3 + i)))
    if (exact) flow.current.position.z = ((t * 0.8) % 0.3) - 0.15 // a mere gradient, flowing one way
  })
  return (
    <group ref={g}>
      <group ref={swirl}>
        {streams.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshBasicMaterial color={i % 2 ? '#7fe8dc' : '#b8f4ff'} transparent opacity={0.8} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
        {/* the hole the field circulates round */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.012, 6, 24]} />
          <meshBasicMaterial color="#1a3a44" toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={flow} geometry={gradient} visible={false}>
        <meshBasicMaterial color="#9fe6ff" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* a faint face in the swirl */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.06, 0.12, 0.3]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} />
        </mesh>
      ))}
      {/* the loop you've run round it so far, glowing as it closes */}
      {e.windFrac > 0 && !e.exact && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
          <ringGeometry args={[1.0, 1.08, 48, 1, 0, Math.min(1, e.windFrac) * Math.PI * 2]} />
          <meshBasicMaterial color="#ffd27a" transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------- Poincaré Duality Colossus

export function ColossusSpawn({ e }) {
  const g = useRef()
  const top = useRef()
  const maxHp = e.maxHp || 6
  const broken = maxHp - e.hp // joints shattered so far
  const next = e.nextStance || 'chain'
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + (e.seed || 0)
    place(g.current, e, 0.95 + Math.sin(t * 1.1) * 0.04, 0.8, 1.6)
    top.current.rotation.z = Math.sin(t * 0.8) * 0.12 // the two halves pivot about the waist
  })
  return (
    <group ref={g}>
      {/* the heavy stone body, upside down below (chains) — glows when it's the one to strike */}
      <mesh position={[0, -0.32, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.12, 10, 24]} />
        <meshStandardMaterial color="#3a3644" roughness={0.95} flatShading emissive={next === 'chain' ? '#ffb347' : '#000000'} emissiveIntensity={next === 'chain' ? 0.35 : 0} />
      </mesh>
      {/* the luminous body above (cochains) */}
      <group ref={top}>
        <mesh position={[0, 0.32, 0]}>
          <torusGeometry args={[0.3, 0.12, 10, 24]} />
          <meshStandardMaterial color="#c9a8ff" emissive={next === 'cochain' ? CYAN : '#8a5aff'} emissiveIntensity={next === 'cochain' ? 1.4 : 0.7} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* the single intersection point at the waist */}
      <mesh>
        <sphereGeometry args={[0.07, 14, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {/* six interlocking joints: one shatters with each resolved pairing */}
      {Array.from({ length: 6 }, (_, i) => {
        if (i < broken) return null
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, Math.sin(a) * 0.3 * 0.2 + (i % 2 ? 0.32 : -0.32), Math.sin(a) * 0.1]} rotation={[0, a, Math.PI / 2]}>
            <torusGeometry args={[0.07, 0.014, 6, 16]} />
            <meshStandardMaterial color="#d8c8b0" metalness={0.6} roughness={0.3} emissive="#6a5a48" emissiveIntensity={0.5} />
          </mesh>
        )
      })}
      <Lightning radius={0.6} tilt={0.2} speed={0.7} seed={e.seed || 0} />
    </group>
  )
}
