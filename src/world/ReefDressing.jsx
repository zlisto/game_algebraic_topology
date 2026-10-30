import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { InstancedPart, preloadModels, useModelParts } from '../characters/models'

preloadModels('reef_env')

/**
 * Retract Reef's dressing (World 0 · Level 1), after the level's concept art: chunky basalt rims under every edge of
 * the walkable reef with foam where they meet the sea, sea stacks on the horizon, sculpted coral and kelp on the
 * seabed, lantern posts at the bridgeheads, and the moon with its path on the water.
 * Props are Blender-built (tools/reef_env_blender.py → public/models/reef_env.glb) and all instanced: one draw call
 * per prop and material, however many copies.
 *
 * walkable: { inside(x, z), bounds } (makeWalkable) — the rims follow its edges.
 * area: the sea [cx, cz, w, d]; sea: the water's height; bed: the seabed's height.
 */

function rng(seed) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

/** Points along the walkable edge, about `spacing` apart, each with its outward direction. */
function edgePoints(walkable, step = 0.3, spacing = 1.15) {
  const { inside, bounds } = walkable
  const nx = Math.ceil((bounds.maxX - bounds.minX + 2) / step)
  const nz = Math.ceil((bounds.maxZ - bounds.minZ + 2) / step)
  const x0 = bounds.minX - 1
  const z0 = bounds.minZ - 1
  const grid = new Uint8Array(nx * nz)
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) grid[j * nx + i] = inside(x0 + i * step, z0 + j * step) ? 1 : 0
  const at = (i, j) => (i < 0 || j < 0 || i >= nx || j >= nz ? 0 : grid[j * nx + i])
  const pts = []
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      if (!at(i, j)) continue
      let ox = 0
      let oz = 0
      for (let dj = -2; dj <= 2; dj++)
        for (let di = -2; di <= 2; di++) if (!at(i + di, j + dj)) (ox += di), (oz += dj)
      if (!ox && !oz) continue
      const l = Math.hypot(ox, oz)
      pts.push([x0 + i * step, z0 + j * step, ox / l, oz / l])
    }
  // thin to roughly even spacing (a coarse hash of taken spots)
  const taken = new Map()
  const cell = spacing
  const out = []
  for (const p of pts) {
    const ci = Math.floor(p[0] / cell)
    const cj = Math.floor(p[1] / cell)
    let near = false
    for (let dj = -1; dj <= 1 && !near; dj++)
      for (let di = -1; di <= 1 && !near; di++)
        for (const q of taken.get(`${ci + di},${cj + dj}`) || []) if (Math.hypot(q[0] - p[0], q[1] - p[1]) < spacing) near = true
    if (near) continue
    const k = `${ci},${cj}`
    taken.set(k, [...(taken.get(k) || []), p])
    out.push(p)
  }
  return out
}

/** A soft white ring of foam, drawn once into a canvas. */
let foamTex = null
function foamTexture() {
  if (foamTex) return foamTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  // a soft patch of froth: many small bubbles, thick in the middle, thinning to nothing at the edges
  const r = rng(5)
  for (let k = 0; k < 260; k++) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * 56
    const x = 64 + Math.cos(a) * d
    const y = 64 + Math.sin(a) * d * 0.55
    const fade = 1 - d / 58
    g.beginPath()
    g.arc(x, y, 1 + r() * 3.5, 0, Math.PI * 2)
    g.fillStyle = `rgba(235,245,255,${(0.15 + r() * 0.5) * fade})`
    g.fill()
  }
  foamTex = new THREE.CanvasTexture(c)
  foamTex.colorSpace = THREE.SRGBColorSpace
  return foamTex
}

function Foam({ points, y }) {
  const ref = useRef()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: foamTexture(), transparent: true, depthWrite: false, opacity: 0.5, color: '#c8d8f0' }), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), [])
  useFrame(({ clock }) => {
    mat.opacity = 0.46 + 0.08 * Math.sin(clock.elapsedTime * 0.9)
    if (!ref.current || ref.current.userData.done) return
    const d = new THREE.Object3D()
    points.forEach(([x, z, s, r], i) => {
      d.position.set(x, y, z)
      d.rotation.set(0, r, 0)
      d.scale.set(s, 1, s)
      d.updateMatrix()
      ref.current.setMatrixAt(i, d.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
    ref.current.userData.done = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, points.length]} frustumCulled={false} renderOrder={2} />
}

/** The moon low over the sea to the north, and its broken path of light across the water. */
let glitterTex = null
function glitterTexture() {
  if (glitterTex) return glitterTex
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 512
  const g = c.getContext('2d')
  const r = rng(9)
  for (let k = 0; k < 420; k++) {
    const y = r() * 512
    const spread = 6 + (y / 512) * 26 // narrow far off, wide near
    const x = 32 + (r() - 0.5) * spread * (0.5 + r())
    g.fillStyle = `rgba(230,240,255,${0.25 + r() * 0.6})`
    g.fillRect(x, y, 1 + r() * 3, 1)
  }
  glitterTex = new THREE.CanvasTexture(c)
  glitterTex.colorSpace = THREE.SRGBColorSpace
  glitterTex.wrapS = THREE.ClampToEdgeWrapping
  glitterTex.wrapT = THREE.RepeatWrapping
  return glitterTex
}

function Moon({ at, sea }) {
  const tex = useMemo(() => glitterTexture(), [])
  useFrame(({ clock }) => {
    tex.offset.y = (clock.elapsedTime * 0.012) % 1
  })
  const [mx, mz] = at
  return (
    <>
      <mesh position={[mx, 12, mz]}>
        <sphereGeometry args={[8, 32, 16]} />
        <meshBasicMaterial color="#eef3ff" toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[mx, 12, mz - 1]}>
        <circleGeometry args={[20, 48]} />
        <meshBasicMaterial color="#9fb4e8" transparent opacity={0.18} depthWrite={false} fog={false} />
      </mesh>
      {/* the path of light, from the moon toward the reef */}
      <mesh position={[mx * 0.5, sea + 0.02, mz * 0.5]} rotation={[-Math.PI / 2, 0, Math.atan2(mx, -mz)]} renderOrder={1}>
        <planeGeometry args={[10, Math.hypot(mx, mz)]} />
        <meshBasicMaterial map={tex} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </>
  )
}

function Props({ walkable, area, sea, bed, bridgeheads }) {
  const parts = useModelParts('reef_env')
  const gl = useThree((st) => st.gl)
  if (import.meta.env.DEV) window.__gl = gl // dev: draw calls and triangles (gl.info.render)
  const placed = useMemo(() => {
    const r = rng(17)
    const edge = edgePoints(walkable)
    const rims = [[], [], []]
    const foam = []
    for (const [x, z, ox, oz] of edge) {
      const k = Math.floor(r() * 3)
      const rot = Math.atan2(ox, oz) + (r() - 0.5) * 0.5
      const s = 0.72 + r() * 0.22
      // the cluster's back columns sit just inside the edge, its front ones step down into the sea
      rims[k].push([x + ox * 0.2, -0.14, z + oz * 0.2, s, rot]) // a step below the deck, so the walkable edge stays clear
      if (r() < 0.45) foam.push([x + ox * 1.15, z + oz * 1.15, 1.0 + r() * 0.3, Math.atan2(ox, oz) + (r() - 0.5) * 0.3])
    }
    // the open sea: stacks on the horizon, coral and kelp on the bed (not under the reef)
    const [cx, cz, w, d] = area
    const free = (x, z, pad) => !walkable.inside(x, z) && !walkable.inside(x + pad, z) && !walkable.inside(x - pad, z) && !walkable.inside(x, z + pad) && !walkable.inside(x, z - pad)
    const stacks = []
    for (let k = 0; k < 11; k++) {
      const a = (k / 11) * Math.PI * 2 + r() * 0.4
      const rad = 0.44 + r() * 0.08
      const x = cx + Math.sin(a) * w * rad
      const z = cz + Math.cos(a) * d * rad
      if (free(x, z, 6)) stacks.push([x, sea, z, 0.9 + r() * 0.6, r() * 6.3])
    }
    const bedParts = { coral_branch: [], coral_fan: [], coral_brain: [], coral_tube: [], kelp: [], boulder: [] }
    const counts = { coral_branch: 16, coral_fan: 12, coral_brain: 14, coral_tube: 14, kelp: 18, boulder: 12 }
    const colors = {}
    const PAL = ['#9a6a80', '#a08070', '#7a68a8', '#4a9090', '#a89a6a', '#90708a'] // muted: moonlight, not an aquarium
    for (const [name, n] of Object.entries(counts)) {
      colors[name] = []
      let tries = 0
      while (bedParts[name].length < n && tries++ < n * 8) {
        const [ex, ez, eox, eoz] = edge[Math.floor(r() * edge.length)]
        const off = 2.8 + r() * 2.5
        const x = ex + eox * off + (r() - 0.5) * 1.5
        const z = ez + eoz * off + (r() - 0.5) * 1.5
        if (!free(x, z, 2.6)) continue
        const s = name === 'kelp' ? 0.8 + r() * 0.7 : name === 'boulder' ? 0.8 + r() * 1.2 : 0.9 + r() * 1.1
        bedParts[name].push([x, bed, z, s, r() * 6.3])
        colors[name].push(new THREE.Color(name === 'kelp' ? (r() < 0.5 ? '#3f8a5a' : '#5a9a3a') : name === 'boulder' ? '#ffffff' : PAL[Math.floor(r() * PAL.length)]))
      }
    }
    const posts = bridgeheads.map(([x, z, rot]) => [x, 0, z, 1, rot])
    if (import.meta.env.DEV) window.__reef = { rims: rims.map((x) => x.length), foam: foam.length, stacks: stacks.length, posts: posts.length }
    return { rims, foam, stacks, bedParts, colors, posts }
  }, [walkable, area, sea, bed, bridgeheads])

  return (
    <>
      {placed.rims.map((items, k) => (
        <InstancedPart key={k} parts={parts} name={`rim_${'abc'[k]}`} items={items} />
      ))}
      <Foam points={placed.foam} y={sea + 0.015} />
      <InstancedPart parts={parts} name="stack" items={placed.stacks} />
      {Object.entries(placed.bedParts).map(([name, items]) => (
        <InstancedPart key={name} parts={parts} name={name} items={items} colors={placed.colors[name]} />
      ))}
      <InstancedPart parts={parts} name="post" items={placed.posts} />
    </>
  )
}

export default function ReefDressing({ walkable, area, sea = -0.5, bed = -2.9, moon = [-14, -95], bridgeheads = [] }) {
  return (
    <>
      <Moon at={moon} sea={sea} />
      <Suspense fallback={null}>
        <Props walkable={walkable} area={area} sea={sea} bed={bed} bridgeheads={bridgeheads} />
      </Suspense>
    </>
  )
}
