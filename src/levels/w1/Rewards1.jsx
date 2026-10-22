import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * World 1's rewards: one small wire sculpture per level, each the picture its level proves.
 * All roughly unit-sized (radius ≈ 0.45), drawn in gold / cyan / rose wire.
 */

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z)
const tube = (pts, r = 0.028, closed = false) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => (Array.isArray(p) ? V(...p) : p)), closed, 'catmullrom', 0.1), Math.max(16, pts.length * 3), r, 6, closed)
const circle = (cx, cy, r, n = 40, z = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r, z])
const COL = { gold: '#ffc861', cyan: '#7fd8ff', rose: '#ff7a8a', lime: '#b9f27a', white: '#fff2c4', violet: '#c39bff' }

function Wire({ geo, c = 'gold' }) {
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={COL[c]} emissive={COL[c]} emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  )
}
function Dot({ p, r = 0.055, c = 'white' }) {
  return (
    <mesh position={p}>
      <sphereGeometry args={[r, 10, 8]} />
      <meshBasicMaterial color={COL[c]} toneMapped={false} />
    </mesh>
  )
}
function Arrow({ p, dir, c = 'gold' }) {
  return (
    <mesh position={p} rotation={[0, 0, Math.atan2(dir[1], dir[0]) - Math.PI / 2]}>
      <coneGeometry args={[0.05, 0.12, 6]} />
      <meshStandardMaterial color={COL[c]} emissive={COL[c]} emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
  )
}

// 1-1 Endpoint Gardens: two paths with the same endpoints, and the sweep between them (a homotopy rel endpoints)
const PATHS = (() => {
  const a = [-0.38, -0.1]
  const b = [0.38, -0.1]
  const arc = (h) => Array.from({ length: 17 }, (_, i) => {
    const u = i / 16
    return [a[0] + (b[0] - a[0]) * u, a[1] + Math.sin(u * Math.PI) * h]
  })
  return { top: tube(arc(0.42)), low: tube(arc(0.05)), mid: [0.14, 0.28].map((h) => tube(arc(h), 0.01)), a, b }
})()
function PathSeal() {
  return (
    <group>
      <Wire geo={PATHS.top} />
      <Wire geo={PATHS.low} c="cyan" />
      {PATHS.mid.map((g, i) => (
        <Wire key={i} geo={g} c="white" />
      ))}
      <Dot p={[...PATHS.a, 0]} r={0.07} />
      <Dot p={[...PATHS.b, 0]} r={0.07} />
    </group>
  )
}

// 1-2 Loop de Loop: two loops at one basepoint — and their product, one after the other
const LOOPS = [0, 1].map((k) => {
  const s = k ? -1 : 1
  return tube(Array.from({ length: 25 }, (_, i) => {
    const t = (i / 24) * Math.PI * 2
    return [s * 0.36 * Math.sin(t / 2) ** 2, 0.22 * Math.sin(t) * Math.sin(t / 2)]
  }))
})
function BasepointRing() {
  return (
    <group>
      <Wire geo={LOOPS[0]} />
      <Wire geo={LOOPS[1]} c="cyan" />
      <Dot p={[0, 0, 0]} r={0.08} />
      <Arrow p={[0.3, 0.12, 0]} dir={[1, -0.6]} />
      <Arrow p={[-0.3, -0.12, 0]} dir={[-1, 0.6]} c="cyan" />
    </group>
  )
}

// 1-3 Winding Road: the helix over the circle — a lap is a step up
const HELIX = {
  coil: tube(Array.from({ length: 80 }, (_, i) => {
    const t = (i / 79) * Math.PI * 2 * 2.5
    return [Math.cos(t) * 0.28, -0.36 + (i / 79) * 0.72, Math.sin(t) * 0.28]
  })),
  base: tube(circle(0, 0, 0.28, 40).map(([x, y]) => [x, -0.46, y]), 0.022, true),
}
function HelixCoil() {
  return (
    <group>
      <Wire geo={HELIX.coil} />
      <Wire geo={HELIX.base} c="cyan" />
      {[-0.22, 0.07, 0.36].map((y) => (
        <Dot key={y} p={[0.28, y - 0.07, 0]} r={0.045} />
      ))}
    </group>
  )
}

// 1-4 Brouwer's Basin: a disk, every arrow swirling — and one still point that doesn't move
const BASIN = { rim: tube(circle(0, 0, 0.42, 48), 0.03, true), swirl: [0.14, 0.27].map((r) => tube(circle(0.04, 0.02, r, 36), 0.012, true)) }
function StillPoint() {
  const g = useRef()
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = clock.elapsedTime * 1.2
  })
  return (
    <group>
      <Wire geo={BASIN.rim} c="cyan" />
      <group ref={g}>
        {BASIN.swirl.map((s, i) => (
          <Wire key={i} geo={s} c="white" />
        ))}
        <Arrow p={[0.31, 0, 0]} dir={[0, 1]} c="white" />
        <Arrow p={[-0.1, 0.14, 0]} dir={[-1, -0.6]} c="white" />
      </group>
      <Dot p={[0.04, 0.02, 0.01]} r={0.08} c="gold" />
    </group>
  )
}

// 1-5 Torus Terraces: a torus with its two generating loops, a and b
const TOR = {
  body: new THREE.TorusGeometry(0.3, 0.12, 14, 40),
  a: tube(circle(0, 0, 0.42, 48), 0.022, true),
  b: tube(circle(0, 0, 0.13, 24).map(([x, y]) => [0.3 + x, 0, y]), 0.022, true),
}
function TorusPair() {
  return (
    <group rotation={[0.9, 0, 0]}>
      <mesh geometry={TOR.body}>
        <meshPhysicalMaterial color="#cfe8ff" transmission={0.5} roughness={0.2} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <Wire geo={TOR.a} />
      <mesh geometry={TOR.b} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={COL.cyan} emissive={COL.cyan} emissiveIntensity={1.3} toneMapped={false} />
      </mesh>
    </group>
  )
}

// 1-6 Free-Word Forge: the figure-eight's two loops a and b, arrowed — and a word spelled along them
const EIGHT = [tube(circle(-0.2, 0, 0.2, 32), 0.028, true), tube(circle(0.2, 0, 0.2, 32), 0.028, true)]
function FreeLoops() {
  return (
    <group>
      <Wire geo={EIGHT[0]} c="rose" />
      <Wire geo={EIGHT[1]} c="cyan" />
      <Arrow p={[-0.2, 0.2, 0]} dir={[-1, 0]} c="rose" />
      <Arrow p={[0.2, 0.2, 0]} dir={[1, 0]} c="cyan" />
      <Dot p={[0, 0, 0]} r={0.07} />
    </group>
  )
}

// 1-7 Glue Works: two pieces glued on their overlap (van Kampen) — two rings, the overlap glowing
const GLUE = { l: tube(circle(-0.14, 0, 0.27, 40), 0.026, true), r: tube(circle(0.14, 0, 0.27, 40), 0.026, true) }
function GlueRings() {
  return (
    <group>
      <Wire geo={GLUE.l} c="rose" />
      <Wire geo={GLUE.r} c="cyan" />
      <mesh>
        <circleGeometry args={[0.15, 24]} />
        <meshBasicMaterial color={COL.gold} transparent opacity={0.45} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 1-8 Sheetwater: a covering — three sheets over the circle, a lift climbing between them
const COVER = {
  sheets: [0.22, 0.04, -0.14].map((y) => tube(circle(0, 0, 0.3, 40).map(([x, z]) => [x, y, z]), 0.016, true)),
  base: tube(circle(0, 0, 0.3, 40).map(([x, z]) => [x, -0.38, z]), 0.026, true),
}
function CoverStack() {
  return (
    <group rotation={[0.35, 0, 0]}>
      {COVER.sheets.map((g, i) => (
        <Wire key={i} geo={g} c="cyan" />
      ))}
      <Wire geo={COVER.base} />
      {[0.22, 0.04, -0.14].map((y) => (
        <Dot key={y} p={[0.3, y, 0]} r={0.04} />
      ))}
      <Dot p={[0.3, -0.38, 0]} r={0.06} c="gold" />
    </group>
  )
}

// 1-9 Sheet stacks: the universal cover of the figure-eight — a tree branching four ways at every node
const TREE = (() => {
  const segs = []
  const grow = (p, dir, len, depth) => {
    if (depth === 0) return
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (d[0] === -dir[0] && d[1] === -dir[1]) continue
      const q = [p[0] + d[0] * len, p[1] + d[1] * len]
      segs.push([p, q, depth])
      grow(q, d, len * 0.5, depth - 1)
    }
  }
  grow([0, 0], [0, 0], 0.22, 3)
  return segs.map(([a, b, depth]) => ({ geo: tube([a, b], 0.008 + depth * 0.006), c: depth === 3 ? 'gold' : depth === 2 ? 'cyan' : 'white' }))
})()
function UniversalTree() {
  return (
    <group>
      {TREE.map((s, i) => (
        <Wire key={i} geo={s.geo} c={s.c} />
      ))}
      <Dot p={[0, 0, 0]} r={0.06} c="gold" />
    </group>
  )
}

// 1-10 Deck Halls: the sphere double-covering ℝP² — two antipodal points, one deck swap between them
const DECK = { eq: tube(circle(0, 0, 0.36, 48), 0.016, true), swap: tube([[0.25, 0.26, 0], [0, 0.1, 0.3], [-0.25, -0.26, 0]], 0.012) }
function DeckSphere() {
  const g = useRef()
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.8
  })
  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[0.36, 24, 16]} />
        <meshPhysicalMaterial color="#e8eefc" transmission={0.5} roughness={0.15} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <Wire geo={DECK.eq} c="cyan" />
      <Wire geo={DECK.swap} c="violet" />
      <Dot p={[0.25, 0.26, 0]} r={0.06} c="gold" />
      <Dot p={[-0.25, -0.26, 0]} r={0.06} c="gold" />
    </group>
  )
}

export const REWARDS_W1 = {
  path: PathSeal,
  basepoint: BasepointRing,
  helix: HelixCoil,
  stillpoint: StillPoint,
  toruspair: TorusPair,
  freeloops: FreeLoops,
  gluerings: GlueRings,
  coverstack: CoverStack,
  utree: UniversalTree,
  decksphere: DeckSphere,
}
