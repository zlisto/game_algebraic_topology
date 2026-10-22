import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import MathText from '../../screens/MathText'

/**
 * The demonstration panels of the Null Crown's trials. Each panel carries an emblem (a small lit
 * 3D picture of what its claim is about) and the claim card itself. The emblem never decides the
 * verdict: the card does. Emblems by `vis`:
 *   hopf     linked Hopf fibres (stereographic S³)       fibre    a circle over each point of S²
 *   slip     a loop sliding off a sphere into its 0-cell  cubes    two boxes sliding round each other
 *   stem     a suspension (double cone) turning           loops    the figure-eight, a and b
 *   helix    ℝ winding over S¹                            paths    the path space shrinking to its base
 *   hurewicz a sphere wrapped by its fundamental class    map      a map f: X → Y, a pulse along it
 *   tower    a Postnikov tower with twisted seams         twin     a twisted tower beside a straight one
 *   torus    the torus with a and b                       cells    a row of cells, one blocked
 */

const GOLD = '#ffd27a'
const VIOLET = '#b07aff'
const CYAN = '#7fe0ff'
const CORAL = '#ff8a7a'
const RED = '#ff4a6a'

/** A lit tube along fixed points. */
export function Tube({ pts, r = 0.04, color = GOLD, glow = 0.8, closed = false, seg = 120 }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed)
    return new THREE.TubeGeometry(curve, seg, r, 8, closed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.35} metalness={0.3} toneMapped={false} />
    </mesh>
  )
}

/** The Hopf fibre over (θ, φ), stereographically projected from (0, 0, 0, 1) and scaled. */
export function hopfFibre(th, ph, s = 0.5, n = 96) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * Math.PI
    const x1 = Math.cos(th / 2) * Math.cos(t)
    const x2 = Math.cos(th / 2) * Math.sin(t)
    const x3 = Math.sin(th / 2) * Math.cos(t + ph)
    const x4 = Math.sin(th / 2) * Math.sin(t + ph)
    const d = Math.max(1 - x4, 0.08)
    pts.push([(s * x1) / d, (s * x3) / d, (s * x2) / d])
  }
  return pts
}
const HOPF_POINTS = [
  [0.35, 0, GOLD],
  [1.0, 0.8, CYAN],
  [1.5, 2.6, '#ff8ad8'],
  [2.1, 4.4, '#9cf0a0'],
]

function Spin({ speed = 0.5, y = 0, children, tilt = 0 }) {
  const g = useRef()
  useFrame((_, dt) => (g.current.rotation.y += dt * speed))
  return (
    <group position={[0, y, 0]} rotation={[tilt, 0, 0]}>
      <group ref={g}>{children}</group>
    </group>
  )
}

function Glass({ r = 0.6, color = '#c8d4ff', opacity = 0.22 }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 32, 20]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.2} metalness={0.1} depthWrite={false} />
    </mesh>
  )
}

function Hopf() {
  return (
    <Spin speed={0.4} y={1.15} tilt={0.35}>
      {HOPF_POINTS.map(([th, ph, c], i) => (
        <Tube key={i} pts={hopfFibre(th, ph, 0.42)} r={0.035} color={c} closed />
      ))}
    </Spin>
  )
}

function Fibre() {
  const pts = [
    [0.5, 0.2],
    [0.9, 2.1],
    [1.2, 4.2],
    [0.4, 3.6],
  ]
  return (
    <Spin speed={0.35} y={0.75}>
      <Glass r={0.55} color="#9ab0ff" opacity={0.35} />
      {pts.map(([th, ph], i) => {
        const n = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]
        const c = [CYAN, GOLD, '#ff8ad8', '#9cf0a0'][i]
        return (
          <group key={i}>
            <mesh position={n.map((v) => v * 0.56)}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            <group position={n.map((v) => v * 1.05)} rotation={[th * 0.6, ph, 0.4]}>
              <mesh>
                <torusGeometry args={[0.2, 0.025, 8, 32]} />
                <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} toneMapped={false} />
              </mesh>
            </group>
          </group>
        )
      })}
    </Spin>
  )
}

function Slip() {
  const loop = useRef()
  const clock = useRef(0)
  useFrame((_, dt) => {
    clock.current += dt
    const u = (clock.current % 4) / 4
    const k = Math.min(1, u / 0.75)
    const th = (Math.PI / 2) * (1 - k * k * (3 - 2 * k)) + 0.02 // equator → the north pole
    loop.current.position.y = 0.8 * Math.cos(th)
    loop.current.scale.setScalar(Math.max(0.02, Math.sin(th)))
    loop.current.visible = u < 0.9
  })
  return (
    <group position={[0, 1.0, 0]}>
      <Glass r={0.8} />
      <group ref={loop}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.81, 0.035, 8, 64]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.07, 12, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Cubes() {
  const a = useRef()
  const b = useRef()
  const clock = useRef(0)
  useFrame((_, dt) => {
    clock.current += dt
    const u = (clock.current % 4) / 4
    const s = u < 0.2 ? 0 : u > 0.8 ? 1 : ((u - 0.2) / 0.6) ** 2 * (3 - 2 * ((u - 0.2) / 0.6))
    const shrink = 1 - 0.45 * Math.sin(Math.PI * s)
    a.current.position.set(-0.42 + 0.84 * s, 0.25, -0.42 * Math.sin(Math.PI * s))
    b.current.position.set(0.42 - 0.84 * s, 0.25, 0.42 * Math.sin(Math.PI * s))
    a.current.scale.setScalar(shrink)
    b.current.scale.setScalar(shrink)
  })
  return (
    <group position={[0, 0.35, 0]} rotation={[0.5, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.9, 0.06, 1.9]} />
        <meshStandardMaterial color="#2a2140" roughness={0.4} metalness={0.4} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.05, 0.08, 1.9]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      ))}
      {[-0.95, 0.95].map((z) => (
        <mesh key={z} position={[0, 0.06, z]}>
          <boxGeometry args={[1.9, 0.08, 0.05]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={a}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color={CORAL} emissive={CORAL} emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={b}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function Stem() {
  return (
    <Spin speed={0.5} y={1.05}>
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.7, 0.9, 32, 1, true]} />
        <meshStandardMaterial color="#7a6ad8" emissive="#3a2a88" emissiveIntensity={0.5} side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.7, 0.9, 32, 1, true]} />
        <meshStandardMaterial color="#7a6ad8" emissive="#3a2a88" emissiveIntensity={0.5} side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.04, 8, 64]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      {[0.92, -0.92].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      ))}
    </Spin>
  )
}

const circle = (cx, cz, r, y = 0, n = 64) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)])

function Loops() {
  return (
    <group position={[0, 0.9, 0]} rotation={[1.0, 0, 0]}>
      <Tube pts={circle(-0.55, 0, 0.55)} closed color={CORAL} r={0.05} />
      <Tube pts={circle(0.55, 0, 0.55)} closed color={CYAN} r={0.05} />
      <mesh>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh position={[-1.1, 0, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.1, 0.24, 8]} />
        <meshBasicMaterial color={CORAL} toneMapped={false} />
      </mesh>
      <mesh position={[1.1, 0, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.24, 8]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Helix() {
  const pts = useMemo(() => Array.from({ length: 160 }, (_, i) => {
    const a = (i / 159) * Math.PI * 2 * 3.2
    return [0.62 * Math.cos(a), 0.35 + (i / 159) * 1.7, 0.62 * Math.sin(a)]
  }), [])
  return (
    <Spin speed={0.6}>
      <Tube pts={pts} color={CYAN} r={0.035} seg={240} />
      <Tube pts={circle(0, 0, 0.62, 0.12)} closed color={GOLD} r={0.05} />
    </Spin>
  )
}

function Paths() {
  const g = useRef()
  const clock = useRef(0)
  const paths = useMemo(
    () => Array.from({ length: 7 }, (_, k) => {
      const a = (k / 7) * Math.PI * 2
      return Array.from({ length: 24 }, (_, i) => {
        const u = i / 23
        return [Math.cos(a) * u * 1.1, Math.sin(Math.PI * u) * 0.55 + u * 0.1, Math.sin(a) * u * 1.1]
      })
    }),
    [],
  )
  useFrame((_, dt) => {
    clock.current += dt
    const u = (clock.current % 4) / 4
    const k = u < 0.5 ? 1 : 1 - 0.92 * Math.sin(((u - 0.5) / 0.5) * Math.PI) ** 2 * (u < 0.75 ? 1 : 1)
    g.current.scale.setScalar(Math.max(0.08, k))
  })
  return (
    <group position={[0, 0.5, 0]}>
      <group ref={g}>
        {paths.map((p, i) => (
          <Tube key={i} pts={p} color={i % 2 ? VIOLET : CYAN} r={0.03} seg={40} />
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[0.1, 12, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[1.12, 1.2, 48]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Hurewicz() {
  return (
    <group position={[0, 1.05, 0]}>
      <Glass r={0.55} color="#ffe2a8" opacity={0.3} />
      <Spin speed={0.8}>
        <mesh>
          <icosahedronGeometry args={[0.78, 1]} />
          <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </Spin>
    </group>
  )
}

function MapArrow() {
  const pulse = useRef()
  const clock = useRef(0)
  const arc = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const u = i / 29
    return [-0.75 + 1.5 * u, 1.0 + Math.sin(Math.PI * u) * 0.45, 0]
  }), [])
  useFrame((_, dt) => {
    clock.current += dt
    const u = (clock.current % 1.6) / 1.6
    pulse.current.position.set(-0.75 + 1.5 * u, 1.0 + Math.sin(Math.PI * u) * 0.45, 0)
  })
  return (
    <group>
      <mesh position={[-1.0, 0.8, 0]}>
        <dodecahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.4} flatShading />
      </mesh>
      <mesh position={[1.0, 0.8, 0]}>
        <sphereGeometry args={[0.38, 20, 14]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.35} />
      </mesh>
      <Tube pts={arc} color={GOLD} r={0.03} seg={40} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** A Postnikov tower: three floors, the seams between them twisted (or straight). */
function Tower({ twisted = true, x = 0, scale = 1 }) {
  const strands = useMemo(() => {
    const out = []
    for (let f = 0; f < 2; f++) {
      for (let k = 0; k < 5; k++) {
        const a0 = (k / 5) * Math.PI * 2
        out.push(Array.from({ length: 16 }, (_, i) => {
          const u = i / 15
          const a = a0 + (twisted ? u * Math.PI * 0.9 : 0)
          return [0.5 * Math.cos(a), 0.3 + f * 0.6 + u * 0.6, 0.5 * Math.sin(a)]
        }))
      }
    }
    return out
  }, [twisted])
  return (
    <group position={[x, 0, 0]} scale={scale}>
      <Spin speed={0.4}>
        {[0, 1, 2].map((f) => (
          <mesh key={f} position={[0, 0.3 + f * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.05, 8, 40]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        ))}
        {strands.map((p, i) => (
          <Tube key={i} pts={p} r={0.02} color={twisted ? '#ff8ad8' : CYAN} seg={24} />
        ))}
      </Spin>
    </group>
  )
}

function Torus() {
  const merid = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const v = (i / 48) * Math.PI * 2
    return [0.6 + 0.26 * Math.cos(v), 0.26 * Math.sin(v), 0]
  }), [])
  return (
    <Spin speed={0.45} y={0.95} tilt={0.6}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.24, 20, 48]} />
        <meshStandardMaterial color="#5a4aa8" emissive="#22184a" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      <Tube pts={circle(0, 0, 0.86, 0)} closed color={CORAL} r={0.03} />
      <Tube pts={merid} closed color={CYAN} r={0.03} />
    </Spin>
  )
}

function Cells({ blocked = 1 }) {
  const bad = useRef()
  useFrame(({ clock }) => {
    if (bad.current) bad.current.emissiveIntensity = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4)
  })
  return (
    <group position={[0, 0.45, 0]}>
      {[-0.75, 0, 0.75].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial
              ref={i === blocked ? bad : undefined}
              color={i === blocked ? RED : '#6a5ad0'}
              emissive={i === blocked ? RED : '#2a1a6a'}
              emissiveIntensity={0.5}
              transparent
              opacity={0.82}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.64, 0.64, 0.64]} />
            <meshBasicMaterial color={GOLD} wireframe toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Emblem({ vis }) {
  if (vis === 'hopf') return <Hopf />
  if (vis === 'fibre') return <Fibre />
  if (vis === 'slip') return <Slip />
  if (vis === 'cubes') return <Cubes />
  if (vis === 'stem') return <Stem />
  if (vis === 'loops') return <Loops />
  if (vis === 'helix') return <Helix />
  if (vis === 'paths') return <Paths />
  if (vis === 'hurewicz') return <Hurewicz />
  if (vis === 'map') return <MapArrow />
  if (vis === 'tower') return <Tower />
  if (vis === 'twin')
    return (
      <>
        <Tower twisted x={-0.7} scale={0.8} />
        <Tower twisted={false} x={0.7} scale={0.8} />
      </>
    )
  if (vis === 'torus') return <Torus />
  if (vis === 'cells') return <Cells />
  return null
}

/** One demonstration: floor disc, emblem, the claim card, and a verdict tag once judged. */
export function Panel({ at, item, state, kind = 'trial' }) {
  const ring = state === 'exposed' ? (kind === 'facet' ? GOLD : RED) : state === 'spared' ? '#ff9a3a' : '#6a4aa8'
  return (
    <group position={[at[0], 0, at[1]]}>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 48]} />
        <meshStandardMaterial color="#141024" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        <ringGeometry args={[1.95, 2.08, 64]} />
        <meshBasicMaterial color={ring} toneMapped={false} />
      </mesh>
      <Emblem vis={item.vis} />
      <Html position={[0, 0.1, 1.55]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`c4-card${kind === 'facet' ? ' proof' : ''}${state !== 'live' ? ' judged' : ''}`}>
          <MathText text={item.claim} shown={item.claim.length} />
        </div>
      </Html>
      {state === 'exposed' && (
        <Html position={[0, 2.4, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className={`verdict-tag ${kind === 'facet' ? 'good' : 'bad'}`}>{kind === 'facet' ? 'PROOF ✓' : 'FORGERY ✕'}</div>
        </Html>
      )}
    </group>
  )
}
