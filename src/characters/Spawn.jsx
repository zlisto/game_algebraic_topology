import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Lightning, cached, merge, piece } from './Beasts'

/**
 * Count Null's spawn, modeled on the concept sheets in assets/characters/enemies/:
 *
 *   SphereSpawn  — an obsidian orb split by a jagged violet mouth of crystal teeth that
 *                  gnashes open, four slit eyes, a floating halo, violet smoke and
 *                  orbiting shards. One lash collapses it to a point.
 *   TorusSpawn   — an armored, spiked ring standing on edge like a wheel, violet
 *                  joints between its plates, one slit eye glaring from the hole, two
 *                  energy loops (around the tube, through the hole) that turn gold as
 *                  each lash catches one. Two lashes.
 *   SnapperSpawn — a cracked obsidian crab with oversized snipping claws, six jointed
 *                  legs that scuttle, eyes on wobbling stalks, gold thread caught in its
 *                  pincers. One lash.
 *
 * Each reads the live enemy record `e` (position, facing, flash, stun, dying, hp…).
 */

const VIOLET = '#b070ff'
const LAVENDER = '#f1e6ff'
const obsidian = (extra = {}) => <meshStandardMaterial color="#17101f" roughness={0.22} metalness={0.6} emissive="#3a1466" emissiveIntensity={0.55} {...extra} />
const glow = (color = VIOLET, extra = {}) => <meshBasicMaterial color={color} toneMapped={false} {...extra} />

/** Common per-frame placement: hover, face, flash, collapse-to-a-point when dying. */
function place(g, e, y, dieTime, t, size = 1) {
  g.visible = e.alive || e.dying > 0
  g.position.set(e.x, y, e.z)
  g.rotation.y = e.face
  g.scale.setScalar(size * (e.dying > 0 ? Math.max(0.001, e.dying / dieTime) : 1 + (e.flash > 0 ? 0.12 : 0)))
}

// The Sphere and Torus spawn are beasts now (Beasts.jsx); re-exported so every level gets them.
export { SphereSpawn, TorusSpawn } from './Beasts'

// ---------------------------------------------------------------- snapper
// After the concept card (assets/characters/enemies/bestiary-snapper.png): a wide domed shell with an
// overhanging rim, cracked with glowing magenta seams and crackling at the edge; a face tucked under the
// rim; five eye-stalks; long pointed legs; two big pincers edged in magenta — one reared high, one
// forward — and a cut golden ribbon fraying beside it. Static parts are merged (see Beasts.jsx).

const SNAP_SHELL = () =>
  cached('snapper-shell', () => {
    // lathe profile: a low dome rising from a thin overhanging rim
    const prof = []
    for (let i = 0; i <= 14; i++) {
      const u = i / 14
      const r = 0.42 * Math.cos(u * Math.PI * 0.5) ** 0.7
      const y = 0.17 * Math.sin(u * Math.PI * 0.5) + (u < 0.08 ? -0.02 * (1 - u / 0.08) : 0)
      prof.push(new THREE.Vector2(Math.max(0.001, r), y))
    }
    const geo = new THREE.LatheGeometry(prof, 36)
    geo.scale(1, 1, 0.82)
    // knobbly plates
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      p.setY(i, p.getY(i) + Math.max(0, Math.sin(x * 23) * Math.sin(z * 19)) * 0.012)
    }
    geo.computeVertexNormals()
    return geo
  })

const SNAP_CRACKS = () =>
  cached('snapper-cracks', () => {
    // a branching network of seams, laid on the dome
    const onDome = (x, z) => {
      const r = Math.hypot(x / 0.42, z / (0.42 * 0.82))
      return 0.17 * Math.sqrt(Math.max(0, 1 - Math.min(1, r) ** 2)) + 0.012
    }
    const paths = [
      [[-0.36, -0.05], [-0.2, 0.02], [-0.06, -0.04], [0.08, 0.03], [0.22, -0.02], [0.37, 0.04]],
      [[-0.06, -0.04], [-0.02, -0.16], [0.05, -0.27]],
      [[0.08, 0.03], [0.1, 0.16], [0.04, 0.28]],
      [[-0.2, 0.02], [-0.25, 0.15], [-0.22, 0.24]],
      [[0.22, -0.02], [0.26, -0.15]],
    ]
    return merge(
      paths.map((pts) =>
        piece(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, onDome(x, z), z))), 24, 0.008, 4, false)),
      ),
    )
  })

const SNAP_FACE = () =>
  cached('snapper-face', () =>
    merge([
      piece(new THREE.SphereGeometry(1, 14, 10), { p: [0, 0.02, 0.22], s: [0.12, 0.08, 0.08], color: '#24142e' }),
      ...[-1, 1].map((sd) => piece(new THREE.SphereGeometry(1, 10, 8), { p: [sd * 0.05, 0.04, 0.29], s: 0.022, color: '#ff6aff' })),
      ...[-0.03, 0, 0.03].map((x) => piece(new THREE.BoxGeometry(0.02, 0.04, 0.01), { p: [x, -0.02, 0.3], color: '#3a2448' })),
    ]),
  )

const SNAP_STALKS = () =>
  cached('snapper-stalks', () =>
    merge(
      [-0.14, -0.07, 0, 0.07, 0.14].flatMap((x, i) => {
        const z = 0.04 + (i % 2) * 0.05
        const h = 0.12 + (i % 2) * 0.04
        return [
          piece(new THREE.CylinderGeometry(0.006, 0.009, h, 5), { p: [x, 0.17 + h / 2, z], r: [0.15, 0, x * 1.5], color: '#4a2e5e' }),
          piece(new THREE.SphereGeometry(0.026, 10, 8), { p: [x - x * 0.12, 0.17 + h, z + 0.02], color: '#d080ff' }),
          piece(new THREE.SphereGeometry(0.011, 6, 5), { p: [x - x * 0.12, 0.17 + h, z + 0.045], color: '#1a0612' }),
        ]
      }),
    ),
  )

/** One curved pincer blade: a thick torus arc, tapered by scale. */
const BLADE = (arc, tube) => cached(`snapper-blade-${arc}-${tube}`, () => new THREE.TorusGeometry(0.11, tube, 6, 16, arc))

function Leg({ side, i, phase }) {
  const hip = useRef()
  const knee = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 11 + phase + i * 2.1 + (side > 0 ? Math.PI : 0)
    hip.current.rotation.y = side * (0.2 + Math.sin(t) * 0.3)
    knee.current.rotation.z = side * (1.0 + Math.max(0, Math.cos(t)) * 0.35)
  })
  return (
    <group position={[side * 0.24, 0.05, 0.1 - i * 0.12]}>
      <group ref={hip}>
        <mesh position={[side * 0.13, 0.07, 0]} rotation={[0, 0, side * -0.75]}>
          <cylinderGeometry args={[0.026, 0.02, 0.3, 6]} />
          {obsidian()}
        </mesh>
        <group position={[side * 0.25, 0.16, 0]}>
          <group ref={knee}>
            <mesh position={[side * 0.12, -0.1, 0]} rotation={[0, 0, side * 0.55]}>
              <coneGeometry args={[0.022, 0.36, 6]} />
              {obsidian()}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/** A pincer on its arm; `reared` holds it high like the card's left claw. */
function Claw({ side, e, reared }) {
  const upper = useRef()
  const lower = useRef()
  const arm = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    const snip = e.snipping > 0 ? Math.abs(Math.sin(t * 30)) : 0.25 + 0.35 * Math.max(0, Math.sin(t * 3 + side))
    upper.current.rotation.z = snip * 0.6
    lower.current.rotation.z = -snip * 0.4
    arm.current.rotation.y = side * (0.3 + Math.sin(t * 2.2) * 0.12)
  })
  return (
    <group position={[side * 0.26, 0.08, 0.2]}>
      <group ref={arm} rotation={[reared ? -1.0 : -0.15, 0, 0]}>
        {/* the arm, in two segments */}
        <mesh position={[side * 0.05, 0.04, 0.09]} rotation={[Math.PI / 2.3, 0, side * -0.3]}>
          <cylinderGeometry args={[0.04, 0.034, 0.2, 7]} />
          {obsidian()}
        </mesh>
        <group position={[side * 0.09, 0.08, 0.22]}>
          <mesh scale={[0.09, 0.08, 0.12]}>
            <sphereGeometry args={[1, 14, 10]} />
            {obsidian()}
          </mesh>
          {/* the pincer: a big curved upper blade and a smaller lower one, both edged in magenta */}
          <group position={[0, 0, 0.08]} rotation={[0, -Math.PI / 2, 0]}>
            <group ref={upper}>
              <mesh geometry={BLADE(Math.PI * 0.75, 0.034)} position={[-0.11, 0, 0]} rotation={[0, 0, 0.05]}>
                {obsidian()}
              </mesh>
              <mesh geometry={BLADE(Math.PI * 0.7, 0.012)} position={[-0.11, -0.022, 0]} rotation={[0, 0, 0.1]}>
                {glow('#ff5cff')}
              </mesh>
            </group>
            <group ref={lower} rotation={[Math.PI, 0, 0]}>
              <mesh geometry={BLADE(Math.PI * 0.55, 0.026)} position={[-0.09, 0, 0]} scale={0.85}>
                {obsidian()}
              </mesh>
              <mesh geometry={BLADE(Math.PI * 0.5, 0.01)} position={[-0.09, -0.016, 0]} scale={0.85}>
                {glow('#ff5cff')}
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/** The golden ribbon it cut: two pieces drifting apart, frayed where the cut is. */
function CutRibbon({ e }) {
  const g = useRef()
  const geo = useMemo(
    () =>
      cached('snapper-ribbon', () => {
        const strip = (pts) => {
          // a flat ribbon along a curve
          const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)))
          const n = 24
          const pos = []
          const idx = []
          for (let i = 0; i <= n; i++) {
            const c = curve.getPoint(i / n)
            const tw = (i / n) * Math.PI
            pos.push(c.x, c.y + Math.cos(tw) * 0.025, c.z + Math.sin(tw) * 0.025, c.x, c.y - Math.cos(tw) * 0.025, c.z - Math.sin(tw) * 0.025)
            if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
          }
          const b = new THREE.BufferGeometry()
          b.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
          b.setIndex(idx)
          b.computeVertexNormals()
          return b.toNonIndexed()
        }
        return merge([
          strip([[-0.3, 0.55, 0.15], [-0.2, 0.68, 0.1], [-0.08, 0.6, 0.18], [0.0, 0.66, 0.12]]),
          strip([[0.1, 0.62, 0.14], [0.2, 0.7, 0.08], [0.3, 0.58, 0.16], [0.42, 0.64, 0.1]]),
        ])
      }),
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    g.current.position.y = Math.sin(t * 1.8) * 0.03
    g.current.rotation.y = Math.sin(t * 0.7) * 0.2
  })
  return (
    <group ref={g}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#ffd27a" emissive="#ffb000" emissiveIntensity={0.7} metalness={0.4} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function SnapperSpawn({ e }) {
  const g = useRef()
  const shell = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.22 + Math.abs(Math.sin(t * 11)) * 0.03, 0.5, t, 1.5)
    shell.current.material.emissiveIntensity = e.flash > 0 ? 2.5 : 0.4
  })
  return (
    <group ref={g}>
      {/* carapace: a low dome with an overhanging rim, glowing seams, a violet rim-light */}
      <mesh ref={shell} geometry={SNAP_SHELL()} position={[0, 0.1, 0]}>
        {obsidian()}
      </mesh>
      <mesh geometry={SNAP_SHELL()} position={[0, 0.1, 0]} scale={1.05}>
        <meshBasicMaterial color={VIOLET} side={THREE.BackSide} transparent opacity={0.45} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh geometry={SNAP_CRACKS()} position={[0, 0.1, 0]}>
        {glow('#ff6aff')}
      </mesh>
      <Lightning radius={0.44} tilt={Math.PI / 2} speed={1.3} seed={e.seed || 0} />
      {/* the face under the rim, and the eye-stalks on top */}
      <mesh geometry={SNAP_FACE()} position={[0, 0.06, 0]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh geometry={SNAP_STALKS()} position={[0, 0.1, 0]}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      {[-1, 1].map((sd) => [0, 1, 2].map((i) => <Leg key={`${sd}${i}`} side={sd} i={i} phase={e.seed} />))}
      <Claw side={-1} e={e} reared />
      <Claw side={1} e={e} />
      <CutRibbon e={e} />
    </group>
  )
}

// ---------------------------------------------------------------- mirror spawn (0-3)

function MirrorBody({ e, ghost, axis }) {
  const g = useRef()
  const core = useRef()
  const eye = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    const x = ghost ? 2 * axis - e.x : e.x
    g.current.visible = ghost ? e.alive : e.alive || e.dying > 0
    g.current.position.set(x, 0.62 + Math.sin(t * 2.6) * 0.07, e.z)
    g.current.rotation.y = ghost ? -e.face : e.face
    const s = e.dying > 0 && !ghost ? Math.max(0.001, e.dying / 0.5) : 1 + (e.flash > 0 && !ghost ? 0.12 : 0)
    g.current.scale.setScalar(1.15 * s)
    core.current.rotation.y = t * 0.9 * (ghost ? -1 : 1)
    core.current.rotation.x = Math.sin(t * 0.7) * 0.3
    eye.current.scale.y = 1 - 0.85 * Math.max(0, Math.sin(t * 0.9) - 0.95) / 0.05
    if (ghost) core.current.material.opacity = 0.32 + Math.sin(t * 7) * 0.08 // the reflection flickers
  })
  return (
    <group ref={g}>
      {/* a faceted mirror-crystal body */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={ghost ? '#6c4aa8' : '#2a1e3d'}
          metalness={1}
          roughness={0.08}
          emissive="#5a1ea8"
          emissiveIntensity={ghost ? 0.9 : 0.5}
          flatShading
          transparent={ghost}
          opacity={ghost ? 0.35 : 1}
          depthWrite={!ghost}
        />
      </mesh>
      <mesh scale={1.1}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={ghost ? 0.35 : 0.85} toneMapped={false} />
      </mesh>
      {/* one wide eye — lavender on the real one, hollow on its reflection */}
      <group ref={eye} position={[0, 0.04, 0.27]}>
        <mesh scale={[0.12, 0.07, 0.04]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshBasicMaterial color={ghost ? '#3a2266' : LAVENDER} transparent opacity={ghost ? 0.6 : 1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.03]} scale={[0.02, 0.06, 0.02]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color={ghost ? '#c58bff' : '#1a0730'} toneMapped={false} />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.46, 0, Math.sin((i * Math.PI) / 2) * 0.46]} rotation={[0, 0, Math.PI / 4]} scale={0.05}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={VIOLET} transparent opacity={ghost ? 0.35 : 0.9} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Mirror spawn: a faceted mirror-crystal creature with one wide eye, always shadowed by
 * its reflection across its reef's mirror line (`e.axis`). Only the real one can be
 * lashed — the reflection flickers, its eye is hollow, and a lash passes through it.
 */
export function MirrorSpawn({ e }) {
  const axis = e.axis ?? e.hx
  return (
    <>
      <MirrorBody e={e} axis={axis} ghost={false} />
      <MirrorBody e={e} axis={axis} ghost />
    </>
  )
}

// ---------------------------------------------------------------- unglue (0-4)

/**
 * Unglue: a violet seam-ripper sprite from the Skeleton Foundry — a hooked needle head
 * with one glaring eye and a whipping tail of torn thread. It goes for forged edges and
 * pulls them loose (a torn edge must be re-forged). One lash.
 */
export function UnglueSpawn({ e }) {
  const g = useRef()
  const hook = useRef()
  const tail = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.7 + Math.sin(t * 4) * 0.08, 0.5, t, 1.25)
    hook.current.rotation.x = e.snipping > 0 ? -0.9 + Math.sin(t * 30) * 0.4 : -0.3 + Math.sin(t * 2.5) * 0.15
    tail.current.children.forEach((c, i) => {
      c.position.set(Math.sin(t * 6 + i * 0.8) * 0.05 * i, -0.1 - i * 0.07, -0.06 - i * 0.05)
    })
  })
  return (
    <group ref={g}>
      {/* the body: a long needle */}
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        {obsidian()}
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]} scale={1.12}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshBasicMaterial color={VIOLET} side={THREE.BackSide} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* the ripper hook */}
      <group ref={hook} position={[0, 0.05, 0.2]}>
        <mesh position={[0, 0.06, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.016, 6, 16, Math.PI * 1.3]} />
          {glow()}
        </mesh>
      </group>
      {/* one eye */}
      <mesh position={[0, 0.06, 0.12]} scale={[0.05, 0.035, 0.03]}>
        <sphereGeometry args={[1, 12, 8]} />
        {glow(LAVENDER)}
      </mesh>
      {/* torn thread trailing behind */}
      <group ref={tail}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} scale={0.035 - i * 0.004}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color={i % 2 ? '#ffd27a' : VIOLET} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- coner (0-5)

/**
 * Coner: a violet engineer drone — a faceted body under a spinning rotor ring, with a
 * projector that throws a cone of violet light down onto a space to plug its hole.
 * While it beams (e.beam > 0) the cone of light grows; lash it before the beam finishes.
 * Two lashes.
 */
export function ConerSpawn({ e }) {
  const g = useRef()
  const rotor = useRef()
  const beam = useRef()
  const eye = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 1.25 + Math.sin(t * 2.4) * 0.08, 0.5, t, 1.2)
    rotor.current.rotation.y += dt * 14
    const b = e.beam > 0 ? 1 - e.beam / 2.6 : 0
    beam.current.visible = e.beam > 0
    beam.current.scale.set(0.3 + b * 0.9, 1, 0.3 + b * 0.9)
    beam.current.material.opacity = 0.18 + b * 0.35
    eye.current.material.color.set(e.beam > 0 ? '#ff6ad5' : LAVENDER)
  })
  return (
    <group ref={g}>
      <mesh scale={[1, 0.7, 1]}>
        <octahedronGeometry args={[0.28, 0]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh scale={[1.08, 0.76, 1.08]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <group ref={rotor} position={[0, 0.28, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.02, 6, 32]} />
          {glow()}
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.015, 0.06]} />
            {obsidian()}
          </mesh>
        ))}
      </group>
      <mesh ref={eye} position={[0, -0.08, 0.2]} scale={[0.07, 0.045, 0.04]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial color={LAVENDER} toneMapped={false} />
      </mesh>
      {/* the coning beam: a cone of light down onto its target */}
      <mesh ref={beam} position={[0, -0.75, 0]}>
        <coneGeometry args={[0.55, 1.3, 32, 1, true]} />
        <meshBasicMaterial color="#c58bff" transparent opacity={0.3} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- loop-biter (0-6)

/**
 * Loop-biter: a violet beetle — an obsidian shell split down the middle, six legs that
 * scuttle, and big crystal mandibles. It perches on a petal loop and chews it (e.beam > 0:
 * the mandibles work and gold splinters fly); lash it before it finishes. Two lashes.
 */
export function LoopBiterSpawn({ e }) {
  const g = useRef()
  const jaws = useRef()
  const legs = useRef()
  const chips = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    const chewing = e.beam > 0
    place(g.current, e, 0.18 + (chewing ? Math.abs(Math.sin(t * 14)) * 0.04 : 0), 0.5, t, 1.25)
    const open = chewing ? 0.25 + Math.abs(Math.sin(t * 16)) * 0.5 : 0.25 + Math.sin(t * 2) * 0.08
    jaws.current.children.forEach((c, i) => (c.rotation.y = (i ? -1 : 1) * open))
    legs.current.children.forEach((c, i) => (c.rotation.x = Math.sin(t * 14 + i * 1.7) * (chewing ? 0.1 : 0.45)))
    chips.current.visible = chewing
    chips.current.children.forEach((c, i) => {
      const u = (t * 2.2 + i * 0.27) % 1
      c.position.set(Math.sin(i * 2.3) * 0.25 * u, 0.1 + u * 0.35 - u * u * 0.3, 0.32 + u * 0.15)
    })
  })
  return (
    <group ref={g}>
      {/* the shell, split down the back */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.085, 0.12, -0.02]} rotation={[0, 0, sd * -0.25]} scale={[0.16, 0.12, 0.3]}>
          <sphereGeometry args={[1, 14, 10, 0, Math.PI]} />
          {obsidian({ side: THREE.DoubleSide })}
        </mesh>
      ))}
      <mesh position={[0, 0.13, -0.02]} scale={[0.02, 0.13, 0.3]}>
        <sphereGeometry args={[1, 8, 6]} />
        {glow()}
      </mesh>
      {/* head and eyes */}
      <mesh position={[0, 0.1, 0.28]} scale={[0.11, 0.08, 0.09]}>
        <sphereGeometry args={[1, 12, 8]} />
        {obsidian()}
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.06, 0.15, 0.34]} scale={0.025}>
          <sphereGeometry args={[1, 8, 6]} />
          {glow(LAVENDER)}
        </mesh>
      ))}
      {/* mandibles */}
      <group ref={jaws} position={[0, 0.08, 0.34]}>
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.05, 0, 0]}>
            <mesh position={[sd * 0.04, 0, 0.09]} rotation={[Math.PI / 2, 0, sd * 0.5]}>
              <coneGeometry args={[0.03, 0.2, 5]} />
              {glow()}
            </mesh>
          </group>
        ))}
      </group>
      {/* six legs */}
      <group ref={legs}>
        {[-1, 1].flatMap((sd) =>
          [-0.14, 0, 0.14].map((z) => (
            <mesh key={`${sd}${z}`} position={[sd * 0.2, 0.05, z]} rotation={[0, 0, sd * 0.9]}>
              <cylinderGeometry args={[0.012, 0.008, 0.2, 5]} />
              {obsidian()}
            </mesh>
          )),
        )}
      </group>
      {/* gold splinters from the chewed loop */}
      <group ref={chips}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} scale={0.022}>
            <boxGeometry args={[1, 1, 2.5]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- castle (castle-0)

/**
 * A judgment beacon: a tall violet crystal on a black-glass stand above one of Null's
 * demonstrations. Lash it to call that demonstration a forgery. It flares gold when hit.
 * (Level code reads e.label for nothing — the beacon is the same everywhere.)
 */
export function BeaconSpawn({ e }) {
  const g = useRef()
  const gem = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0, 0.5, t, 1)
    g.current.rotation.y = 0
    gem.current.rotation.y = t * 0.8
    gem.current.position.y = 1.25 + Math.sin(t * 2) * 0.06
    gem.current.material.emissiveIntensity = e.flash > 0 ? 3 : 0.9 + Math.sin(t * 3) * 0.3
  })
  return (
    <group ref={g}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.12, 0.26, 0.7, 6]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh ref={gem} position={[0, 1.25, 0]} scale={[0.32, 0.55, 0.32]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#c58bff" emissive="#8a3aff" emissiveIntensity={1} roughness={0.15} metalness={0.3} flatShading toneMapped={false} />
      </mesh>
    </group>
  )
}

/** A crown shard: a spinning violet splinter of the Null Crown that dives at Gyroid. One lash. */
export function ShardSpawn({ e }) {
  const g = useRef()
  const m = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.9 + Math.sin(t * 5) * 0.15, 0.4, t, 1.2)
    m.current.rotation.x += dt * 6
    m.current.rotation.z += dt * 4
  })
  return (
    <group ref={g}>
      <mesh ref={m} scale={[0.14, 0.38, 0.14]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#d8b8ff" emissive="#a259ff" emissiveIntensity={1.4} flatShading toneMapped={false} />
      </mesh>
      <mesh scale={0.35}>
        <sphereGeometry args={[1, 10, 8]} />
        {glow(VIOLET, { transparent: true, opacity: 0.18 })}
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- World 1 Â· Bouquet Bastion

/**
 * Hedge-sprout (1-1): a thorny violet seed that roots into a patch of ground. It swells as
 * `e.rooting` (0 â†’ 1) climbs; lash it before it takes root. One lash.
 */
export function HedgeSpawn({ e }) {
  const g = useRef()
  const bud = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.3, 0.4, t, 0.8 + (e.rooting || 0) * 0.7)
    bud.current.rotation.y = t * 2
    bud.current.material.emissiveIntensity = 0.8 + (e.rooting || 0) * 1.6
  })
  return (
    <group ref={g}>
      <mesh ref={bud}>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#17101f" emissive="#8060d0" emissiveIntensity={1} flatShading toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.5, 12]} />
        {glow(VIOLET, { transparent: true, opacity: 0.35 })}
      </mesh>
    </group>
  )
}

/** Retractor drone (1-4): a chained violet drone that tugs toward the rim. Two lashes. */
export function RetractorSpawn({ e }) {
  const g = useRef()
  const ring = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.7 + Math.sin(t * 3) * 0.06, 0.5, t, 1.1)
    ring.current.rotation.z = t * 2.4
  })
  return (
    <group ref={g}>
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.04, 6, 20]} />
        {glow(VIOLET)}
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 5]} />
        {glow('#ffb347')}
      </mesh>
    </group>
  )
}

/** Whirl (1-4): a spinning top that scrambles arrow fields. One lash. */
export function WhirlSpawn({ e }) {
  const g = useRef()
  const top = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55, 0.4, t, 1)
    top.current.rotation.y = t * 9
  })
  return (
    <group ref={g}>
      <mesh ref={top} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 6]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.34, 16]} />
        {glow(LAVENDER, { transparent: true, opacity: 0.6 })}
      </mesh>
    </group>
  )
}

/** Projector imp (1-5): hijacks a map projector until lashed. One lash. */
export function ProjectorImpSpawn({ e }) {
  const g = useRef()
  const cone = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.75 + Math.sin(t * 4) * 0.08, 0.4, t, 1)
    cone.current.rotation.y = t * 1.2
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.26, 10, 8]} />
        {obsidian()}
      </mesh>
      <mesh ref={cone} position={[0, 0.26, 0]}>
        <coneGeometry args={[0.12, 0.28, 6]} />
        <meshStandardMaterial color="#6040a0" emissive="#b090ff" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Ribbon patrol (1-6, 1-7, 1-8): a capsule guard with a torn word-ribbon hung from one
 * shoulder. It shrinks as it takes hits (`e.hp` / `e.maxHp`: one per letter of its word).
 */
export function PatrolSpawn({ e }) {
  const g = useRef()
  const knot = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    const frac = e.maxHp ? Math.max(0.4, e.hp / e.maxHp) : 1
    place(g.current, e, 0.55 + Math.sin(t * 2) * 0.04, 0.5, t, 0.8 + frac * 0.35)
    knot.current.rotation.x = t * 2
  })
  return (
    <group ref={g}>
      <mesh>
        <capsuleGeometry args={[0.28, 0.6, 6, 12]} />
        {obsidian()}
      </mesh>
      <mesh ref={knot} position={[0.38, 0.3, 0]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.22, 0.05, 8, 20]} />
        {glow('#ffb347')}
      </mesh>
      <mesh position={[0, 0.12, 0.27]} scale={[1, 0.18, 0.4]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        {glow(VIOLET)}
      </mesh>
    </group>
  )
}

/** Liftling (1-8, 1-9): a violet octahedron bound to one sheet of a cover. Two lashes. */
export function LiftlingSpawn({ e }) {
  const g = useRef()
  const gem = useRef()
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55 + Math.sin(t * 4) * 0.08, 0.4, t, 1)
    gem.current.rotation.y += dt * 2.2
    gem.current.material.emissiveIntensity = e.refused > 0 ? 0.2 : 1.2
  })
  return (
    <group ref={g}>
      <mesh ref={gem}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#17101f" emissive="#8a5aff" emissiveIntensity={1.2} flatShading toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[0.3, 0.42, 4]} />
        {glow('#a8e0ff', { transparent: true, opacity: 0.5 })}
      </mesh>
    </group>
  )
}

/** Stack sentinel (1-9): a tall obsidian post with a gold cap that guards the start vertex. Two lashes. */
export function StackSentinelSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0, 0.5, t, 1)
    g.current.rotation.y = t * 0.5
  })
  return (
    <group ref={g}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 1.5, 8]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color="#ffb347" emissive="#ffb347" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Deck guard (1-10): one copy of a guard per sheet; every copy dies when one is lashed (only once they stack). */
export function DeckGuardSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.5, 0.5, t, 1)
    g.current.rotation.y = t * 0.4
  })
  return (
    <group ref={g}>
      <mesh>
        <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
        {obsidian()}
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        {glow('#ffb347')}
      </mesh>
    </group>
  )
}

/**
 * Backtrack (1-2): a hooded wisp that runs the beacon's loop tracks the wrong way round —
 * a living α⁻¹. Its tail of chevrons points back the way it came. One lash.
 */
export function BacktrackSpawn({ e }) {
  const g = useRef()
  const body = useRef()
  const tail = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55 + Math.sin(t * 5) * 0.05, 0.4, t, 1)
    body.current.rotation.y = -t * 3
    tail.current.children.forEach((c, i) => (c.material.opacity = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 8 - i * 1.3))))
  })
  return (
    <group ref={g}>
      <mesh ref={body}>
        <coneGeometry args={[0.28, 0.62, 7]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 0.12, 0.2]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        {glow('#ff8ad8')}
      </mesh>
      <group ref={tail}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -0.05, -0.34 - i * 0.24]} rotation={[-Math.PI / 2, 0, Math.PI]}>
            <coneGeometry args={[0.16 - i * 0.03, 0.18, 3]} />
            {glow('#ffb347', { transparent: true, opacity: 0.6 })}
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.4, 14]} />
        {glow(VIOLET, { transparent: true, opacity: 0.35 })}
      </mesh>
    </group>
  )
}

/**
 * Winder (1-3): a spindle wound in stolen turns — one violet coil per turn it holds
 * (`e.turns`, set by the level). The Lash slides off while it holds any; run laps the other
 * way until the coils are gone, and it glows gold and goes down to one lash.
 */
export function WinderSpawn({ e }) {
  const g = useRef()
  const coils = useRef()
  const core = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.75 + Math.sin(t * 2) * 0.06, 0.5, t, 1)
    const n = Math.min(4, Math.abs(e.turns ?? 0))
    coils.current.rotation.y = t * (e.turns >= 0 ? 2.4 : -2.4)
    coils.current.children.forEach((c, i) => (c.visible = i < n))
    core.current.material.color.set(n ? '#9060ff' : '#ffcf6a')
  })
  return (
    <group ref={g}>
      <mesh>
        <octahedronGeometry args={[0.24, 0]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh ref={core} position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshBasicMaterial color="#9060ff" toneMapped={false} />
      </mesh>
      <group ref={coils}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, -0.24 + i * 0.16, 0]} rotation={[Math.PI / 2 + 0.25, 0.4 * i, 0]}>
            <torusGeometry args={[0.36 - i * 0.03, 0.035, 6, 20]} />
            {glow(VIOLET)}
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Echo (3-1): violet reflection — mirrored Gyroid silhouette. */
export function EchoSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55, 0.55, t, 1)
    g.current.rotation.y = t * 0.6
  })
  return (
    <group ref={g}>
      <mesh scale={[-1, 1, 1]}>
        <capsuleGeometry args={[0.2, 0.45, 4, 8]} />
        {obsidian()}
      </mesh>
      <mesh position={[0, 0.55, 0.08]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        {glow('#c090ff')}
      </mesh>
    </group>
  )
}

/** Vine choker (3-2): pulls torsion vines down. */
export function VineChokerSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.4, 0.7, t, 1)
    g.current.rotation.y = Math.sin(t) * 0.4
  })
  return (
    <group ref={g}>
      <mesh>
        <torusGeometry args={[0.35, 0.08, 6, 16]} />
        {obsidian()}
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.04, 0.06, 1.1, 6]} />
        {glow('#a060ff')}
      </mesh>
    </group>
  )
}

/** Moth swarm (3-3): snuffs lanterns — one lash. */
export function MothSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.9 + Math.sin(t * 4) * 0.15, 0.4, t, 0.85)
  })
  return (
    <group ref={g}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.18, 0, 0]} rotation={[0, 0, s * 0.4]}>
          <sphereGeometry args={[0.14, 6, 4]} />
          {obsidian({ flatShading: true })}
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.1, 8, 6]} />
        {glow('#d0a0ff')}
      </mesh>
    </group>
  )
}

/** Seam wraith (3-8): tears the seam — three lashes. */
export function SeamWraithSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.7, 0.9, t, 1.1)
    g.current.rotation.y = t * 0.35
  })
  return (
    <group ref={g}>
      <mesh>
        <coneGeometry args={[0.35, 1.4, 5]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 0.5, 0.1]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        {glow('#ff70d0')}
      </mesh>
    </group>
  )
}

/** Flipper (2-1 / 3-7): flips orientations / compasses. */
export function FlipperSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.35, 0.5, t, 1)
    g.current.rotation.z = Math.sin(t * 3) * 0.5
  })
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[0.45, 0.25, 0.55]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        {glow('#b070ff')}
      </mesh>
    </group>
  )
}

/** Bog spawn (2-2): violet blob that fills missing tiles; two lashes. */
export function BogSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.28 + Math.sin(t * 2) * 0.05, 0.7, t, 1.15)
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.42, 10, 8]} />
        {obsidian()}
      </mesh>
      <mesh position={[0, 0.25, 0.15]} scale={[1.2, 0.6, 0.8]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        {glow('#9060ff')}
      </mesh>
    </group>
  )
}

/** Crumpler (2-3): violet wad that stamps degenerate triangles; one lash. */
export function CrumplerSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.4, 0.45, t, 0.95)
    g.current.rotation.x = Math.sin(t * 2.5) * 0.3
  })
  return (
    <group ref={g}>
      <mesh>
        <dodecahedronGeometry args={[0.28, 0]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0.1, 0.15, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        {glow('#c080ff')}
      </mesh>
    </group>
  )
}

/** Leak sprite (2-4 / 2-8): punctures locks; one lash after seal. */
export function LeakSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.75 + Math.sin(t * 5) * 0.1, 0.4, t, 0.85)
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.16, 8, 6]} />
        {glow('#b070ff')}
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <coneGeometry args={[0.08, 0.3, 6]} />
        {obsidian()}
      </mesh>
    </group>
  )
}

/** Quarry golem (2-5): welds excised pieces; three lashes. */
export function QuarryGolemSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55, 1.0, t, 1.2)
    g.current.rotation.y = Math.sin(t * 0.8) * 0.2
  })
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[0.55, 0.7, 0.45]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.35, 0.35]} />
        {obsidian()}
      </mesh>
      <mesh position={[0, 0.7, 0.15]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        {glow('#ff70d0')}
      </mesh>
    </group>
  )
}

/** Gale spawn (2-6): violet wisps that blow wind; one lash. */
export function GaleSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.85 + Math.sin(t * 3.5) * 0.2, 0.35, t, 0.8)
    g.current.rotation.y = t * 2
  })
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.15, Math.sin(i) * 0.1, Math.sin(i * 2.1) * 0.15]}>
          <sphereGeometry args={[0.1, 6, 4]} />
          {glow('#d0a0ff')}
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- World 4 · Postnikov Spire

/** Cube sentry (4-1): violet cube that pins Gyroid's boundary — lash faces. */
export function CubeSentrySpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55 + Math.sin(t * 2) * 0.05, 0.5, t, 1)
    g.current.rotation.x = t * 0.4
    g.current.rotation.y = t * 0.55
  })
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        {obsidian({ flatShading: true })}
      </mesh>
      <mesh>
        <boxGeometry args={[0.58, 0.58, 0.58]} />
        {glow('#a060ff', { transparent: true, opacity: 0.35, wireframe: true })}
      </mesh>
    </group>
  )
}

/** Glitch (4-2 / 4-8): violet static that knocks maps off the grid. */
export function GlitchSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.7 + Math.sin(t * 9) * 0.12, 0.35, t, 1.2)
  })
  return (
    <group ref={g}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.18, Math.sin(i) * 0.1, 0]}>
          <boxGeometry args={[0.12, 0.28, 0.08]} />
          {glow(i % 2 ? '#c090ff' : '#8060d0')}
        </mesh>
      ))}
    </group>
  )
}

/** Fiber wraith (4-7 / 4-10): slips between fibers — lash on its circle. */
export function FiberWraithSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.85, 0.8, t, 1)
    g.current.rotation.y = t * 1.2
  })
  return (
    <group ref={g}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.05, 6, 24]} />
        {glow('#88ccff')}
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 8, 6]} />
        {obsidian()}
      </mesh>
    </group>
  )
}

/** Twist thief (4-11 / 4-12): violet hand stealing k-invariant brackets. */
export function TwistThiefSpawn({ e }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.5, 0.55, t, 1)
    g.current.rotation.z = Math.sin(t * 3) * 0.35
  })
  return (
    <group ref={g}>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        {obsidian()}
      </mesh>
      <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.35, 0.12, 0.18]} />
        {glow('#e0aaff')}
      </mesh>
    </group>
  )
}
