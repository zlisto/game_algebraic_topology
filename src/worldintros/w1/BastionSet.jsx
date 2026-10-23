import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CausewaySlab } from '../../world/ReefScenery'
import { Gatehouse, HedgeBed, smoothRoute } from '../../levels/w1/EndpointGardensScene'
import { HELIX_PITCH, HELIX_R, onCircle } from '../../levels/w1/WindingRoadScene'
import { LiveLine } from '../../levels/w0/FlatsScenery'

/**
 * Bouquet Bastion as one panorama, built from the World 1 levels' own pieces (Endpoint Gardens'
 * gatehouses and hedge bed, the Winding Road's ring road and helix, the Basepoint Beacon, the two
 * loop districts that make the bouquet S¹ ∨ S¹, the Commutator's Keep) and seen from Wayfall
 * Landing, the headland where the Winding Way ends.
 *
 * Coordinates: the camera looks north (−z). The Landing's top is at y = LAND_H round the origin.
 */

export const LAND_H = 4
export const GARDENS = [-11, -15]
export const WINDING = [12, -15]
export const BEACON = [0, -36]
export const PETAL_R = 10
export const PETALS = [
  { c: [-PETAL_R, -36], color: '#ff6a5a', glow: '#ff8a6a', name: 'red' }, // a
  { c: [PETAL_R, -36], color: '#a070ff', glow: '#b890ff', name: 'violet' }, // b
]
export const KEEP = [0, -64]
export const TERRACES = [-25, -46]
export const STACKS = [25, -48]

const STONE = '#3a3f52'
const ROCK = '#20202c'
const GOLD = '#ffb347'
const TAU = Math.PI * 2

/** An annulus of land (lathed), top at y = 0. */
function RingIsland({ r, w = 3, color = STONE, depth = 1.4 }) {
  const geo = useMemo(() => {
    const p = [
      [r - w / 2 + 0.3, -depth],
      [r - w / 2, 0],
      [r + w / 2, 0],
      [r + w / 2 + 0.3, -depth],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const g = new THREE.LatheGeometry(p, 96)
    g.computeVertexNormals()
    return g
  }, [r, w, depth])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} flatShading />
    </mesh>
  )
}

/** A loop district: a ring of land, its glowing road, houses and lamps. `dimRef.current` 0..1 greys it (the Crown's shadow). */
function District({ petal, dimRef, seed }) {
  const [cx, cz] = petal.c
  const road = useRef()
  useFrame(({ clock }) => {
    const d = dimRef?.current || 0
    if (road.current) road.current.material.opacity = (0.55 + Math.sin(clock.elapsedTime * 1.6 + seed) * 0.15) * (1 - d * 0.85)
  })
  return (
    <group position={[cx, 0, cz]}>
      <RingIsland r={PETAL_R} w={3.4} />
      <mesh ref={road} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[PETAL_R - 0.35, PETAL_R + 0.35, 128]} />
        <meshBasicMaterial color={petal.color} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <SharedRingHouses r={PETAL_R} count={30} color={petal.glow} seed={seed} dimRef={dimRef} />
    </group>
  )
}

/** RingHouses whose every window/lamp shares one material (so the dimming reaches them all). */
function SharedRingHouses({ r, count, color, seed, dimRef }) {
  const homes = useMemo(() => {
    let s = seed * 9301 + 49297
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const out = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rnd() * 0.1
      // keep the junction with the other petal clear (near the beacon)
      const near = Math.abs(Math.atan2(Math.sin(a - (seed % 2 ? Math.PI : 0)), Math.cos(a - (seed % 2 ? Math.PI : 0))))
      if (near < 0.32) continue
      const side = i % 2 ? 1 : -1
      const rr = r + side * 1.15
      out.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, rot: Math.PI / 2 - a + (side > 0 ? Math.PI : 0), h: 0.6 + rnd() * 0.8, w: 0.6 + rnd() * 0.35 })
    }
    return out
  }, [r, count, seed])
  const winMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000', emissive: color, emissiveIntensity: 1.6, toneMapped: false }), [color])
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2e2c3a', roughness: 0.85 }), [])
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2e3a', roughness: 0.8 }), [])
  const poleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2830' }), [])
  const base = useMemo(() => new THREE.Color(color), [color])
  const grey = useMemo(() => new THREE.Color('#55555e'), [])
  useFrame(() => {
    const d = dimRef?.current || 0
    winMat.emissive.copy(base).lerp(grey, d)
    winMat.emissiveIntensity = 1.7 * (1 - d) + 0.12
  })
  const lamps = Math.round(count / 2)
  return (
    <group>
      {homes.map((h, i) => (
        <group key={i} position={[h.x, 0, h.z]} rotation={[0, h.rot, 0]}>
          <mesh position={[0, h.h / 2, 0]} material={wallMat}>
            <boxGeometry args={[h.w, h.h, h.w * 0.9]} />
          </mesh>
          <mesh position={[0, h.h + 0.18, 0]} rotation={[0, Math.PI / 4, 0]} material={roofMat}>
            <coneGeometry args={[h.w * 0.78, 0.4, 4]} />
          </mesh>
          <mesh position={[0, h.h * 0.55, h.w * 0.46]} material={winMat}>
            <planeGeometry args={[h.w * 0.42, h.h * 0.36]} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: lamps }, (_, i) => {
        const a = (i / lamps) * TAU + 0.2
        return (
          <group key={`l${i}`} position={[Math.cos(a) * (r - 0.05), 0, Math.sin(a) * (r - 0.05)]}>
            <mesh position={[0, 0.55, 0]} material={poleMat}>
              <cylinderGeometry args={[0.04, 0.05, 1.1, 6]} />
            </mesh>
            <mesh position={[0, 1.18, 0]} material={winMat}>
              <sphereGeometry args={[0.15, 10, 8]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** The Basepoint Beacon where both districts meet: a tall stone tower with an amber lamp and beam. */
function Beacon({ dimRef }) {
  const lamp = useRef()
  const beam = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    lamp.current.rotation.y = t * 0.8
    lamp.current.position.y = 7.4 + Math.sin(t * 1.3) * 0.15
    const dim = dimRef?.current || 0
    beam.current.material.opacity = (0.1 + Math.sin(t * 2.2) * 0.03) * (1 - dim)
    beam.current.visible = dim < 0.98
  })
  return (
    <group position={[BEACON[0], 0, BEACON[1]]}>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[2.6, 3, 1, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[1.9, 2.3, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.6, 1.1, 6, 8]} />
        <meshStandardMaterial color="#2c2a36" roughness={0.75} />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <cylinderGeometry args={[1, 0.7, 0.5, 8]} />
        <meshStandardMaterial color="#3a3446" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh ref={lamp} position={[0, 7.4, 0]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0, 15, 0]}>
        <cylinderGeometry args={[0.35, 1.2, 15, 20, 1, true]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 7.4, 0]} intensity={60} distance={30} color="#ffb070" />
    </group>
  )
}

/** Endpoint Gardens (level 1-1): a round deck, two gatehouses, the hedge bed, gold routes round it. */
function Gardens() {
  const R = 6
  const ga = [-4.2, 0]
  const gb = [4.2, 0]
  const upper = useMemo(() => smoothRoute([ga, [-2, 2.1], [0, 2.5], [2, 2.1], gb], 64).map(([x, z]) => [x, z, 0.2]), [])
  const lower = useMemo(() => smoothRoute([ga, [-2, -2.1], [0, -2.5], [2, -2.1], gb], 64).map(([x, z]) => [x, z, 0.2]), [])
  const wavy = useMemo(() => smoothRoute([ga, [-2.4, 3.6], [0, 3.9], [2.4, 3.4], gb], 64).map(([x, z]) => [x, z, 0.2]), [])
  const topiary = [
    [-4.6, -3.2], [-2.4, -4.6], [2.4, -4.6], [4.6, -3.2], [-4.4, 3.6], [4.4, 3.6], [0, 5.2], [0, -5.2],
  ]
  return (
    <group position={[GARDENS[0], 0, GARDENS[1]]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[R, R - 0.4, 0.7, 56]} />
        <meshStandardMaterial color="#4a5568" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[R - 0.3, 56]} />
        <meshStandardMaterial color="#26402e" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[R - 0.25, R - 0.05, 64]} />
        <meshBasicMaterial color="#c9a84a" toneMapped={false} />
      </mesh>
      <Gatehouse pos={ga} rot={Math.PI / 2} />
      <Gatehouse pos={gb} rot={-Math.PI / 2} />
      <HedgeBed c={[0, 0]} r={1.3} />
      <LiveLine getPts={() => upper} color={GOLD} width={3} />
      <LiveLine getPts={() => lower} color="#c58bff" width={3} />
      <LiveLine getPts={() => wavy} color={GOLD} width={2} opacity={0.6} />
      {topiary.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.45, 12, 10]} />
            <meshStandardMaterial color="#2f5a3a" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#ffe6b0" emissive="#ffc070" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** The Winding Road (level 1-3): a ring road with the helix ℝ standing over its middle. */
function WindingRoad() {
  const c = [0, 0]
  const turns = 3
  const tube = useMemo(() => {
    const pts = []
    const N = turns * 2 * 48
    for (let i = 0; i <= N; i++) {
      const U = -turns * TAU + (i / N) * turns * 2 * TAU
      const [x, z] = onCircle(c, HELIX_R * 1.6, U)
      pts.push(new THREE.Vector3(x, 0.6 + (turns + U / TAU) * HELIX_PITCH * 1.3, z))
    }
    return new THREE.CatmullRomCurve3(pts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const coil = useRef()
  useFrame(({ clock }) => {
    if (coil.current) coil.current.rotation.y = clock.elapsedTime * 0.25
  })
  const r = 4.6
  return (
    <group position={[WINDING[0], 0, WINDING[1]]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[r + 1.4, r + 1, 0.7, 48]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[r - 0.7, r + 0.7, 72]} />
        <meshStandardMaterial color="#3a3346" roughness={0.8} />
      </mesh>
      {[r - 0.7, r + 0.7].map((rr) => (
        <mesh key={rr} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[rr - 0.06, rr + 0.06, 72]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => {
        const th = (i / 10) * TAU + 0.15
        const [x, z] = onCircle(c, r, th)
        return (
          <mesh key={i} position={[x, 0.08, z]} rotation={[-Math.PI / 2, 0, Math.atan2(-Math.sin(th), -Math.cos(th))]}>
            <coneGeometry args={[0.24, 0.46, 3]} />
            <meshBasicMaterial color="#ffcf6a" transparent opacity={0.8} toneMapped={false} />
          </mesh>
        )
      })}
      <group ref={coil}>
        <mesh>
          <tubeGeometry args={[tube, 300, 0.11, 8, false]} />
          <meshStandardMaterial color="#6a5a90" emissive="#8060d0" emissiveIntensity={0.9} roughness={0.6} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0.6 + turns * HELIX_PITCH * 1.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, turns * 2 * HELIX_PITCH * 1.3 + 0.8, 8]} />
        <meshStandardMaterial color="#2a2838" roughness={0.9} />
      </mesh>
      {Array.from({ length: turns * 2 + 1 }, (_, i) => {
        const [x, z] = onCircle(c, HELIX_R * 1.6, 0)
        return (
          <mesh key={i} position={[x, 0.6 + i * HELIX_PITCH * 1.3, z]}>
            <sphereGeometry args={[i === turns ? 0.2 : 0.14, 10, 8]} />
            <meshBasicMaterial color={i === turns ? '#ffffff' : '#ffcf6a'} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

/** The Commutator's Keep: a dark tower crowned with his two loops, a balcony facing the Bastion. */
function Keep() {
  const rings = useRef()
  useFrame(({ clock }) => {
    if (rings.current) rings.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.3
  })
  return (
    <group position={[KEEP[0], 0, KEEP[1]]}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[7, 8, 1.4, 8]} />
        <meshStandardMaterial color={ROCK} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[6, 9, 5]} />
        <meshStandardMaterial color="#1c2030" roughness={0.75} />
      </mesh>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[x, 0, 0.5]}>
          <mesh position={[0, 6, 0]}>
            <cylinderGeometry args={[1.1, 1.3, 12, 10]} />
            <meshStandardMaterial color="#232838" roughness={0.75} />
          </mesh>
          <mesh position={[0, 12.8, 0]}>
            <coneGeometry args={[1.5, 2.6, 10]} />
            <meshStandardMaterial color="#3a2a48" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* the balcony the Commutator watches from */}
      <mesh position={[0, 8.1, 3.1]}>
        <boxGeometry args={[4, 0.3, 1.6]} />
        <meshStandardMaterial color="#2a3044" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 8.6, 3.85]}>
        <boxGeometry args={[4, 0.7, 0.12]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.35} emissive="#3a2408" />
      </mesh>
      {/* lit windows */}
      {[[-1.6, 3], [1.6, 3], [-1.6, 5.6], [1.6, 5.6]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 2.52]}>
          <planeGeometry args={[0.7, 1.1]} />
          <meshStandardMaterial color="#000" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {/* his word on the roof: the two loops, a and b */}
      <group ref={rings} position={[0, 11.4, 0]}>
        <mesh position={[-1.25, 0, 0]}>
          <torusGeometry args={[1.25, 0.13, 10, 48]} />
          <meshStandardMaterial color="#ff6a5a" emissive="#ff6a5a" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <mesh position={[1.25, 0, 0]}>
          <torusGeometry args={[1.25, 0.13, 10, 48]} />
          <meshStandardMaterial color="#a070ff" emissive="#a070ff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 9.5, 6]} intensity={30} distance={14} color="#ffd2a0" />
    </group>
  )
}

/** Torus Terraces and the Sheet Stacks: further landmarks on the Bastion's edge. */
function Terraces() {
  return (
    <group position={[TERRACES[0], 0, TERRACES[1]]}>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[5, 5.5, 1, 40]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 1.1, 20, 48]} />
        <meshStandardMaterial color="#3a5a6a" roughness={0.5} metalness={0.2} emissive="#103040" />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 1.13, 4, 48]} />
        <meshBasicMaterial color="#7fd6ff" wireframe transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </group>
  )
}
function Stacks() {
  const g = useRef()
  useFrame(({ clock }) => {
    if (g.current) g.current.children.forEach((m, i) => (m.position.y = 1 + i * 1.3 + Math.sin(clock.elapsedTime * 0.9 + i) * 0.08))
  })
  return (
    <group position={[STACKS[0], 0, STACKS[1]]}>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[4.5, 5, 1, 40]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>
      <group ref={g}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1 + i * 1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.2, 48]} />
            <meshStandardMaterial color="#a8e0ff" emissive="#4080a0" emissiveIntensity={0.6} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Wayfall Landing: the headland at the end of the Winding Way, and the Way itself, a viaduct south. */
function Landing() {
  return (
    <group>
      {/* the headland: a rock spur rising out of the sea */}
      <mesh position={[0, LAND_H / 2 - 1.4, -0.4]}>
        <cylinderGeometry args={[3.6, 5.2, LAND_H + 2.8, 9]} />
        <meshStandardMaterial color={ROCK} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, LAND_H - 0.1, -0.4]}>
        <cylinderGeometry args={[3.6, 3.6, 0.2, 9]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LAND_H + 0.01, -0.4]}>
        <ringGeometry args={[3.2, 3.45, 9]} />
        <meshBasicMaterial color="#f0b27a" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* two waystones at the edge */}
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, LAND_H, -2.6]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.4, 1.4, 0.4]} />
            <meshStandardMaterial color="#3a3a48" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.16, 10, 8]} />
            <meshStandardMaterial color="#000" emissive="#ff9a2a" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* the Winding Way: a viaduct running back south to Retract Reef */}
      <CausewaySlab a={[0, 70]} b={[0, 2.6]} y={LAND_H} width={2.6} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, (LAND_H - 3.1) / 2 - 1, 8 + i * 7]}>
          <cylinderGeometry args={[0.7, 1, LAND_H + 1.2, 7]} />
          <meshStandardMaterial color={ROCK} roughness={0.95} flatShading />
        </mesh>
      ))}
      {/* steps from the Landing down to the Gardens */}
      <CausewaySlab a={[-2.4, -3.6]} b={[GARDENS[0] + 3.4, GARDENS[1] + 4.6]} y={0} width={2} />
    </group>
  )
}

export default function BastionSet({ violetDimRef, redDimRef, beamRef }) {
  return (
    <group>
      <Landing />
      <Gardens />
      <WindingRoad />
      <District petal={PETALS[0]} dimRef={redDimRef} seed={2} />
      <District petal={PETALS[1]} dimRef={violetDimRef} seed={1} />
      <Beacon dimRef={beamRef} />
      <Keep />
      <Terraces />
      <Stacks />
      {/* causeways tying the landmarks to the districts */}
      <CausewaySlab a={[GARDENS[0], GARDENS[1] - 6]} b={[-PETAL_R, -36 + PETAL_R + 1.6]} width={2} />
      <CausewaySlab a={[WINDING[0], WINDING[1] - 6]} b={[PETAL_R, -36 + PETAL_R + 1.6]} width={2} />
      <CausewaySlab a={[0, -36 - 3]} b={[0, KEEP[1] + 8]} width={2.4} />
      <CausewaySlab a={[-PETAL_R * 2 - 1.6, -36]} b={[TERRACES[0] + 4, TERRACES[1] + 3]} width={2} />
      <CausewaySlab a={[PETAL_R * 2 + 1.6, -36]} b={[STACKS[0] - 4, STACKS[1] + 3]} width={2} />
    </group>
  )
}
