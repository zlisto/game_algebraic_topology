import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { Causeway } from '../../castles/w1/Causeway'
import { Sparkles, Stars } from '@react-three/drei'
import { Flash, GLOW, ShotCamera, mix3, seg, smooth } from '../../castles/w1/fx'
import { Retractor } from '../../castles/w2/Castle2Scene'
import { LETTER_COLORS } from '../../levels/w0/Hologram'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Folded, RimDigon, RimSquare } from '../../levels/w2/CellBlockScene'
import { Band, MESSY, Post } from '../../levels/w2/DynamoGateScene'
import { MovieDeck, MovieTiles } from '../../movies/w2/TileMovieKit'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks, Gear } from '../../world/Dressing'

/**
 * World 2 intro, "Chain Delta" (script.js):
 *   A 0–5.4     low over the violet whirl where the Delta Sphere stood; rise to the north gate
 *   B 5.4–14.5  Gyroid and Emmy on the gate's parapet; over their shoulders, the Delta at dawn
 *   C 14.5–30.6 flyover: Tile Yard (the square folds into a torus), Dynamo Gate (the wound band),
 *               Cell Block, the Mod Mill, the Abelian Ford; up to the Retractor in its chains
 *   D 30.6–46.2 Count Null rises over the Retractor, huge; the Crown touches the whirl and the grey
 *               creeps out over the water; he threatens, then vanishes
 *   E 46.2–52   "The Tile Yard first, to the west." "Then let's roll."
 *   F 52–57     the pair from behind, looking out over the Delta; G 57–63 the title card
 * Everything in the Delta is the real World 2 kit: the 2-1 tiles, the 2-6 post and band, the 2-7
 * rim square and its hologram, the 2-9 digon, and the castle's Retractor.
 */

const S = 0.7
const TERR_Y = 3 // the north gate's parapet
const TERR = [0, 14] // its centre (x, z)
const G_AT = [0.75, 12.0]
const E_AT = [-0.8, 12.3]
const SITES = {
  tile: [-20, -6],
  dynamo: [19, -16],
  cell: [-16, -32],
  mill: [22, -38],
  ford: [-2, -50],
  retractor: [0, -80],
}
const NULL_AT = [0, 12, -74] // feet
const NULL_S = 5.5
const NULL_FACE = NULL_AT[1] + 2.4 * NULL_S // his mask, roughly

const nullScale = (t) => smooth(seg(t, 30.9, 32.0)) * (1 - smooth(seg(t, 45.4, 46.0)))
const greyR = (t) => 1.5 + 17 * smooth(seg(t, 35.6, 41.0))
const beamOn = (t) => seg(t, 34.8, 35.6) * (1 - seg(t, 44.8, 45.4))

// ---------------------------------------------------------------- camera
const HEAD = TERR_Y + 1.15 // the pair's eye line on the parapet
const SHOTS = [
  // A: low over the whirl, rising and turning to find the pair on the gate
  [0, 5.4, [[7, 1.6, -7], [0, 0.4, 0]], [[2.4, HEAD + 0.6, 6.0], [0, HEAD - 0.6, 12.2]]],
  // B: front two-shot (heads in the upper half, clear of the caption), then over their shoulders
  [5.4, 8.8, [[1.1, HEAD + 0.15, 8.8], [0, HEAD - 0.6, 12.2]], [[0.9, HEAD + 0.1, 9.2], [0, HEAD - 0.6, 12.2]]],
  [8.8, 14.5, [[0.3, 5, 20], [-2, -5.6, -30]], [[0.1, 5.2, 21], [-3, -5.6, -30]]], // through the gate, under its lintel, between its pylons
  // C: the flyover; each site is aimed below its deck so the deck sits above the caption box
  [14.5, 18.6, [[-12, 8.5, 5], [SITES.tile[0], -1, SITES.tile[1]]], [[-27, 8, 4.5], [SITES.tile[0], -1, SITES.tile[1]]]],
  [18.6, 25.2, [[7, 7, 4.6], [SITES.dynamo[0], 3.6, SITES.dynamo[1] - 1]], [[35, 7.5, 2], [SITES.dynamo[0], 3.6, SITES.dynamo[1] - 1]]], // post, band, pylons and coil all in frame
  [25.2, 27.6, [[-6, 13, -20], [SITES.cell[0], -3, SITES.cell[1]]], [[10, 13, -26], [SITES.mill[0], -2, SITES.mill[1]]]],
  [27.6, 29.5, [[8, 9, -38], [SITES.ford[0], -2.5, SITES.ford[1]]], [[0, 8, -38], [SITES.ford[0], -2.5, SITES.ford[1]]]],
  [29.5, 31.2, [[0, 8, -38], [0, 3, -70]], [[0, 8.5, -40], [0, 8, -78]]],
  // D: Null
  [31.2, 35.2, [[0, 6, -6], [0, 15, -74]], [[0, 6.5, -10], [0, 15, -74]]], // Null over the Retractor, the water below him for scale
  [35.2, 39.5, [[16, 21, 30], [-3, 0, -4]], [[12, 23, 30], [-4, 0, -6]]],
  [39.5, 41.5, [[1.8, HEAD + 0.1, 9.4], [G_AT[0], HEAD - 0.55, G_AT[1]]], [[1.7, HEAD + 0.1, 9.6], [G_AT[0], HEAD - 0.55, G_AT[1]]]],
  [41.5, 46.2, [[11, NULL_FACE + 0.6, -42.5], [0, NULL_FACE - 1.2, -74]], [[9.5, NULL_FACE + 0.4, -44.5], [0, NULL_FACE - 1.2, -74]]],
  // E: ready
  [46.2, 49.7, [[1.0, HEAD + 0.15, 8.8], [-0.1, HEAD - 0.6, 12.2]], [[0.8, HEAD + 0.1, 9.2], [-0.1, HEAD - 0.6, 12.2]]],
  [49.7, 52, [[3.3, 5, 15.0], [SITES.tile[0], -0.5, SITES.tile[1]]], [[3.6, 5.2, 15.3], [SITES.tile[0], -0.5, SITES.tile[1]]]], // behind them on the line to the Tile Yard
  // F: the pair from behind, looking out over the whole Delta (52–57), then the title card (57–63)
  [52, 70, [[0, 5, 20], [-2, -5.6, -30]], [[0, 5.6, 23], [-2, -6, -34]]],
]
const shake = (t) => (t > 30.9 && t < 32.2 ? 0.08 * (1 - seg(t, 30.9, 32.2)) : 0) + (t > 45.4 && t < 46.2 ? 0.05 : 0)

// ---------------------------------------------------------------- sky and light

/** A dawn sky dome: night overhead, a warm band low in the west where the sun comes up. */
function DawnSky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { sun: { value: new THREE.Vector3(-0.45, 0.06, -0.89).normalize() } },
        vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `
          uniform vec3 sun; varying vec3 vDir;
          void main(){
            float h = clamp(vDir.y, -0.2, 1.0);
            vec3 top = vec3(0.07, 0.06, 0.16);
            vec3 mid = vec3(0.30, 0.18, 0.34);
            vec3 low = vec3(0.78, 0.42, 0.36);
            vec3 c = mix(low, mid, smoothstep(0.0, 0.18, h));
            c = mix(c, top, smoothstep(0.18, 0.7, h));
            float s = max(dot(normalize(vDir), sun), 0.0);
            c += vec3(1.0, 0.55, 0.3) * pow(s, 24.0) * 0.9 + vec3(0.9, 0.45, 0.35) * pow(s, 3.0) * 0.25;
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  )
  const ref = useRef()
  const { camera } = useThree()
  useFrame(() => ref.current.position.copy(camera.position)) // follows the camera, so the far plane never cuts it
  return (
    <mesh ref={ref} material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[180, 32, 20]} />
    </mesh>
  )
}

// ---------------------------------------------------------------- the north gate (vantage)

function NorthGate() {
  const [x, z] = TERR
  return (
    <group>
      {/* the bastion: a stone drum rising out of the water, its parapet at TERR_Y */}
      <mesh position={[x, TERR_Y / 2 - 0.6, z]}>
        <cylinderGeometry args={[3.6, 4.4, TERR_Y + 1.2, 10]} />
        <meshStandardMaterial color="#4a4050" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[x, TERR_Y - 0.05, z]}>
        <cylinderGeometry args={[3.75, 3.75, 0.12, 40]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, TERR_Y + 0.02, z]}>
        <ringGeometry args={[3.45, 3.7, 48]} />
        <meshBasicMaterial color="#ffb070" toneMapped={false} transparent opacity={0.55} />
      </mesh>
      {/* the gate's two pylons and lintel behind them */}
      {[-2.5, 2.5].map((px) => (
        <group key={px} position={[x + px, TERR_Y, z + 2.4]}>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[0.8, 4.8, 0.8]} />
            <meshStandardMaterial color="#5a4e5e" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 5.0, 0]}>
            <coneGeometry args={[0.6, 0.9, 4]} />
            <meshStandardMaterial color="#6a5a6a" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 3.6, -0.45]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial color="#ffd8a0" emissive="#ffa040" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[x, TERR_Y + 4.4, z + 2.4]}>
        <boxGeometry args={[5.8, 0.5, 0.7]} />
        <meshStandardMaterial color="#5a4e5e" roughness={0.85} flatShading />
      </mesh>
      {/* the Bastion's figure-eight emblem on the lintel */}
      {[-0.42, 0.42].map((ox) => (
        <mesh key={ox} position={[x + ox, TERR_Y + 4.4, z + 2.02]}>
          <torusGeometry args={[0.36, 0.05, 6, 24]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[x, TERR_Y + 2.4, z - 1.5]} color="#ffc890" intensity={6} distance={9} />
      {/* the Bastion causeway running back behind the gate, on piers */}
      <group position={[0, TERR_Y - 0.12, 0]}>
        <Causeway from={44} to={17.6} />
      </group>
      {[20, 25, 30, 35, 40].map((pz) => (
        <mesh key={pz} position={[0, TERR_Y / 2 - 0.6, pz]}>
          <cylinderGeometry args={[0.45, 0.6, TERR_Y + 1.2, 8]} />
          <meshStandardMaterial color="#3a3240" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- the whirl and the grey

/** The violet whirl on the water where the Delta Sphere was folded (as the World 1 outro left it). */
function Whirl({ tRef }) {
  const g = useRef()
  const arms = useMemo(
    () =>
      [0, 1, 2, 3].map((j) => {
        const pts = Array.from({ length: 40 }, (_, i) => {
          const u = i / 39
          const a = j * (Math.PI / 2) + u * Math.PI * 1.6
          const r = 0.6 + u * 9
          return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
        })
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.16, 4, false)
      }),
    [],
  )
  useFrame(() => {
    const t = tRef.current
    g.current.rotation.z = -t * 0.35
    const flare = beamOn(t)
    for (const m of g.current.children) m.material.opacity = 0.42 + flare * 0.35
  })
  return (
    <group ref={g} position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {arms.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#9a5cff" transparent opacity={0.42} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

/** Null's grey: a dead, colourless film creeping out over the water from the whirl. */
function Grey({ tRef }) {
  const film = useRef()
  const rim = useRef()
  useFrame(() => {
    const t = tRef.current
    const r = greyR(t)
    film.current.scale.setScalar(r)
    rim.current.scale.setScalar(r)
    rim.current.material.opacity = 0.35 + 0.5 * beamOn(t) * (0.7 + 0.3 * Math.sin(t * 9))
  })
  return (
    <group position={[0, 0.16, 0]}>
      <mesh ref={film} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color="#5c5a62" transparent opacity={0.78} depthWrite={false} />
      </mesh>
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.96, 1.0, 96]} />
        <meshBasicMaterial color="#c79bff" transparent opacity={0.4} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- the triangle wetlands

const hash = (x, z) => {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return s - Math.floor(s)
}
/** Shallows tiled with oriented triangles: patches of a triangular lattice, gold seams between. */
function TriangleWetlands() {
  const fill = useRef()
  const seam = useRef()
  const tiles = useMemo(() => {
    const side = 2.4
    const h = (side * Math.sqrt(3)) / 2
    const out = []
    const near = (x, z) => Object.values(SITES).some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 7.5) || Math.hypot(x - TERR[0], z - TERR[1]) < 6 || Math.hypot(x, z) < 11
    for (let row = -40; row <= 8; row++)
      for (let col = -56; col <= 56; col++) {
        const up = (row + col) % 2 === 0
        const x = (col * side) / 2
        const z = row * h + (up ? h / 3 : (2 * h) / 3)
        if (near(x, z) || Math.hypot(x, z + 30) > 70) continue
        // patches: a coarse noise, so the tiles gather into islands of wetland
        const cx = Math.floor(x / 9)
        const cz = Math.floor(z / 9)
        if (hash(cx, cz) < 0.42 && hash(x, z) > 0.12) continue
        out.push([x, z, up ? 0 : Math.PI, hash(z, x)])
      }
    return out
  }, [])
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    {
      const c = new THREE.Color()
      tiles.forEach(([x, z, rot, k], i) => {
        d.position.set(x, 0.06, z)
        d.rotation.set(-Math.PI / 2, 0, rot - Math.PI / 2) // apex toward +z for an up tile, as the lattice expects
        d.scale.setScalar(1)
        d.updateMatrix()
        seam.current.setMatrixAt(i, d.matrix)
        d.position.y = 0.08
        d.scale.setScalar(0.86)
        d.updateMatrix()
        fill.current.setMatrixAt(i, d.matrix)
        c.set(k > 0.93 ? '#4a7a5e' : k > 0.6 ? '#2c4a3c' : '#24392f')
        fill.current.setColorAt(i, c)
      })
      seam.current.instanceMatrix.needsUpdate = true
      fill.current.instanceMatrix.needsUpdate = true
      if (fill.current.instanceColor) fill.current.instanceColor.needsUpdate = true
    }
  }, [tiles])
  const r = 2.4 / Math.sqrt(3)
  return (
    <>
      <instancedMesh ref={seam} args={[null, null, tiles.length]}>
        <circleGeometry args={[r, 3]} />
        <meshBasicMaterial color="#d8a040" toneMapped={false} transparent opacity={0.35} />
      </instancedMesh>
      <instancedMesh ref={fill} args={[null, null, tiles.length]}>
        <circleGeometry args={[r, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.85} emissive="#0e3a2c" emissiveIntensity={0.4} />
      </instancedMesh>
    </>
  )
}

// ---------------------------------------------------------------- landmarks

/** An islet: a rock base under a level's stone deck, with two lanterns. */
function Islet({ at, r = 5.4, children }) {
  return (
    <group position={[at[0], 0.35, at[1]]}>
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[r * 0.98, r * 1.25, 2.2, 9]} />
        <meshStandardMaterial color="#2a2830" roughness={0.95} flatShading />
      </mesh>
      <MovieDeck r={r} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (r - 0.6), 0, r * 0.55]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 1.4, 6]} />
            <meshStandardMaterial color="#2a2238" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  )
}

/** 2-1's square of two triangles, gluing and folding into a torus, over and over. */
function TileYard({ tRef }) {
  const script = (t) => {
    const u = (t + 2) % 11
    const arrows = { bottom: 1, top: 1, left: 1, right: 1, diag: 1 }
    if (u < 4) return { arrows, sides: true, split: 1 - smooth(seg(u, 1, 3)) }
    return { arrows, kind: 'torus', k: smooth(seg(u, 4.4, 8)) }
  }
  return <MovieTiles tRef={tRef} script={script} />
}

/** 2-6's post and the wound band, under a great gate with a turning dynamo coil. */
function DynamoGate() {
  const coil = useRef()
  useFrame((_, dt) => {
    if (coil.current) coil.current.rotation.y += dt * 0.8
  })
  return (
    <group>
      <Post />
      <Band segs={MESSY} />
      {[-4.6, 4.6].map((x) => (
        <mesh key={x} position={[x, 3.2, -2.6]}>
          <boxGeometry args={[0.9, 6.4, 0.9]} />
          <meshStandardMaterial color="#3a3046" roughness={0.6} metalness={0.4} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 6.6, -2.6]}>
        <boxGeometry args={[10.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#3a3046" roughness={0.6} metalness={0.4} />
      </mesh>
      <group ref={coil} position={[0, 8.4, -2.6]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, i * 0.28 - 0.56, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2 - Math.abs(i - 2) * 0.12, 0.08, 8, 40]} />
            <meshStandardMaterial color="#ffb347" emissive="#ff9a2a" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 7.4, -1.6]} color="#ffb347" intensity={14} distance={14} />
    </group>
  )
}

/** 2-7's torus cell with its rim word, the folded torus over it, and the block-house behind. */
function CellBlock() {
  return (
    <group>
      <RimSquare id="torus" />
      <Folded kind="torus" on />
      <group position={[0, 0, -3.6]}>
        {[[-2.2, 0], [0, 0], [2.2, 0], [-1.1, 1], [1.1, 1], [0, 2]].map(([bx, by], i) => (
          <group key={i} position={[bx, 0.9 + by * 1.8, 0]}>
            <mesh>
              <boxGeometry args={[2.0, 1.7, 1.4]} />
              <meshStandardMaterial color="#3a3a44" roughness={0.8} flatShading />
            </mesh>
            <mesh position={[0, 0, 0.71]}>
              <planeGeometry args={[0.7, 0.5]} />
              <meshBasicMaterial color={i % 2 ? '#ffe6a8' : '#ffc070'} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** 2-9's ℝP² digon on the deck, and the mill-house with its water-wheel turning. */
function ModMill() {
  return (
    <group>
      <RimDigon />
      <group position={[0, 0, -3.4]}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[4.2, 3.2, 2.4]} />
          <meshStandardMaterial color="#4a3a2c" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0, 3.9, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.2, 1.6, 4]} />
          <meshStandardMaterial color="#6a3a2a" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[1.1, 1.8, 1.21]}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshBasicMaterial color="#ffd27a" toneMapped={false} />
        </mesh>
        <Gear position={[-2.6, 2.4, 0.2]} rotation={[0, Math.PI / 2, 0]} r={2.2} teeth={16} speed={0.5} color="#6a5030" emissive="#ff9a3a" />
        <Gear position={[2.3, 3.4, 1.3]} r={0.8} teeth={10} speed={-1.2} color="#8a6a3a" emissive="#ff9a3a" />
      </group>
    </group>
  )
}

/** The Abelian Ford: a channel across the deck, its stepping tiles spelling a b a⁻¹ b⁻¹. */
function AbelianFord() {
  const word = [['a', 1], ['b', 1], ['a', -1], ['b', -1]]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.4]}>
        <planeGeometry args={[9.4, 1.8]} />
        <meshBasicMaterial color="#1e4a5e" transparent opacity={0.8} />
      </mesh>
      {word.map(([l, e], i) => {
        const col = LETTER_COLORS[l === 'a' ? 0 : 1]
        return (
          <group key={i} position={[(i - 1.5) * 1.3, 0, 0.4]}>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[1.0, 0.5, 1.0]} />
              <meshStandardMaterial color={e > 0 ? col : '#2a2e36'} emissive={col} emissiveIntensity={e > 0 ? 0.45 : 0.2} />
            </mesh>
            {e < 0 && (
              <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.32, 0.42, 24]} />
                <meshBasicMaterial color={col} toneMapped={false} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

/** Causeways strung across the Delta, gate to castle, in the order the levels run. */
const ROUTE = [[0, 9.6], [-9, 7], [SITES.tile[0], SITES.tile[1]], SITES.dynamo, SITES.cell, SITES.mill, SITES.ford, [0, -68]]
function Route() {
  return ROUTE.slice(1).map((b, i) => <CausewaySlab key={i} a={ROUTE[i]} b={b} y={0.3} width={1.4} />)
}

// ---------------------------------------------------------------- Null

function CrownBeam({ tRef }) {
  const ref = useRef()
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const a = useMemo(() => new THREE.Vector3(NULL_AT[0], NULL_AT[1] + 3.3 * NULL_S, NULL_AT[2]), [])
  const b = useMemo(() => new THREE.Vector3(0, 0.2, 0), [])
  const d = useMemo(() => b.clone().sub(a), [a, b])
  useFrame(() => {
    const t = tRef.current
    const k = beamOn(t) * (nullScale(t) > 0.5 ? 1 : 0)
    ref.current.visible = k > 0.01
    if (!ref.current.visible) return
    ref.current.position.copy(a).add(b).multiplyScalar(0.5)
    ref.current.quaternion.setFromUnitVectors(up, d.clone().normalize())
    const w = k * (0.8 + Math.sin(t * 40) * 0.25)
    ref.current.scale.set(w, d.length(), w)
  })
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.25, 0.7, 1, 12, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.8} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

function GiantNull({ tRef }) {
  const g = useRef()
  const halo = useRef()
  useFrame(() => {
    const t = tRef.current
    const k = nullScale(t)
    g.current.visible = k > 0.002
    g.current.scale.setScalar(Math.max(0.0001, k * NULL_S))
    g.current.position.set(NULL_AT[0], NULL_AT[1] + Math.sin(t * 0.8) * 0.4, NULL_AT[2])
    halo.current.visible = k > 0.002
    halo.current.scale.setScalar(26 * k * (1 + Math.sin(t * 1.3) * 0.04))
  })
  const script = () => {
    const t = tRef.current
    const talk = (t > 31.8 && t < 35) || (t > 35.4 && t < 39.4) || (t > 41.6 && t < 45.4)
    return { gesture: (t > 35.4 && t < 39.4) || (t > 42.6 && t < 45.4) ? 1 : talk ? 0.45 : 0.2, crown: 0.4 + beamOn(t) * 0.6, crownY: 0 }
  }
  return (
    <>
      <sprite ref={halo} position={[NULL_AT[0], NULL_AT[1] + 2.0 * NULL_S, NULL_AT[2] - 4]}>
        <spriteMaterial map={GLOW} color="#7a4ad0" transparent opacity={0.55} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={g}>
        <CountNull script={script} />
        <pointLight position={[0, 2.4, 1.6]} color="#c8a0ff" intensity={10} distance={6} />
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.9, 40]} />
          <meshBasicMaterial color="#c58bff" transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  )
}

// ---------------------------------------------------------------- the scene

export default function ChainDeltaIntro({ tRef }) {
  const engine = useRef({ squeeze: 0.6, seized: false })
  useFrame(() => {
    const t = tRef.current
    engine.current.squeeze = 0.5 + 0.4 * beamOn(t)
  })
  const gyroScript = () => {
    const t = tRef.current
    const k = smooth(seg(t, 50.0, 51.2))
    const [x, , z] = mix3([G_AT[0], 0, G_AT[1]], [G_AT[0] - 0.5, 0, G_AT[1] - 0.9], k)
    const turn = t > 39.4 && t < 41.6 ? 0.25 : t > 46 && t < 50 ? -0.35 : t >= 50 ? 0.4 : 0 // at the end he faces west, toward the Tile Yard
    return {
      pos: [x / S, TERR_Y / S, z / S],
      rotY: Math.PI + turn,
      run: k > 0.02 && k < 0.98 ? 0.9 : 0,
      cast: (t > 39.6 && t < 41.4) || t > 51 ? 0.8 : 0.15 + Math.sin(t * 2) * 0.05,
      whip: t > 40.2 && t < 41.2 ? seg(t, 40.2, 41.2) : 0,
      loop: 0,
      loopDrop: 0,
    }
  }
  const emmyScript = () => {
    const t = tRef.current
    const talk = (t > 8.9 && t < 12.6) || (t > 14.6 && t < 18.4) || (t > 21.4 && t < 25) || (t > 25.4 && t < 29.4) || (t > 46.4 && t < 49.6)
    const point = (t > 9.6 && t < 12.6) || (t > 47.2 && t < 49.6)
    return { pos: [E_AT[0] / S, TERR_Y / S, E_AT[1] / S], rotY: Math.PI + (t > 46.2 ? -0.5 : 0.15), walk: 0, bow: 0, gesture: point ? 1 : talk ? 0.45 : 0.1, talk: talk ? 1 : 0 }
  }
  const avoid = useMemo(() => (x, z) => Object.values(SITES).some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 8) || Math.hypot(x - TERR[0], z - TERR[1]) < 6, [])
  return (
    <>
      {/* the Delta's air (as in the World 1 castle's Delta set, with the rocks kept off Null's sightlines) */}
      <color attach="background" args={['#3a2a48']} />
      <fog attach="fog" args={['#3a2a48', 55, 210]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#c8b0ff', '#0a1418', 0.5]} />
      <directionalLight position={[-30, 40, 20]} intensity={0.8} color="#ffd8c0" />
      <Stars radius={140} depth={50} count={2200} factor={3} fade speed={0.3} />
      <Clouds y={34} area={[0, -20, 160, 160]} count={16} color="#e8b8c8" opacity={0.2} seed={12} speed={0.2} />
      <FloatingRocks center={[0, -2, 10]} radius={[30, 46]} count={22} seed={19} ySpread={[-6, -2]} color="#2a2236" glow="#a259ff" />
      <Sparkles count={120} scale={[60, 16, 60]} position={[0, 6, -20]} size={3} speed={0.3} color="#d0a8ff" />
      <DawnSky />
      <Seascape y={0} depth={2.6} area={[0, -30, 170, 200]} seed={53} life={0.5} lanterns={18} avoid={avoid} palette={{ water: '#1c4450', deep: '#081a20', sand: '#33483e', weed: '#2a5038', coral: ['#c58bff', '#7fe8dc', '#ffd27a'] }} />
      <directionalLight position={[-60, 18, -120]} intensity={1.1} color="#ffb08a" />
      <hemisphereLight args={['#ffc8b0', '#1a2430', 0.35]} />
      <TriangleWetlands />
      <Whirl tRef={tRef} />
      <Grey tRef={tRef} />
      <Route />
      <NorthGate />
      <Islet at={SITES.tile}>
        <TileYard tRef={tRef} />
      </Islet>
      <Islet at={SITES.dynamo}>
        <DynamoGate />
      </Islet>
      <Islet at={SITES.cell}>
        <CellBlock />
      </Islet>
      <Islet at={SITES.mill}>
        <ModMill />
      </Islet>
      <Islet at={SITES.ford}>
        <AbelianFord />
      </Islet>
      {/* the Retractor, far off at the Delta's mouth, on its dark islet */}
      <mesh position={[SITES.retractor[0], -0.6, SITES.retractor[1]]}>
        <cylinderGeometry args={[11, 13, 2, 12]} />
        <meshStandardMaterial color="#141226" roughness={0.6} metalness={0.4} flatShading />
      </mesh>
      <Retractor stateRef={engine} position={[SITES.retractor[0], 0.4, SITES.retractor[1]]} />
      <pointLight position={[SITES.retractor[0], 9, SITES.retractor[1] + 6]} color="#a259ff" intensity={60} distance={30} />
      <GiantNull tRef={tRef} />
      {/* a cold key light on his front, so the mask reads against the dawn */}
      <pointLight position={[4, NULL_FACE + 2, NULL_AT[2] + 14]} color="#d8c8ff" intensity={420} distance={45} />
      <CrownBeam tRef={tRef} />
      <Flash tRef={tRef} position={[NULL_AT[0], NULL_AT[1] + 2 * NULL_S, NULL_AT[2]]} flash={(t) => seg(t, 30.9, 31.9)} size={40} />
      <Flash tRef={tRef} position={[NULL_AT[0], NULL_AT[1] + 2 * NULL_S, NULL_AT[2]]} flash={(t) => seg(t, 45.6, 46.4)} size={30} color="#c8a0ff" />
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <ShotCamera tRef={tRef} shots={SHOTS} shake={shake} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.62} />
      </EffectComposer>
    </>
  )
}
