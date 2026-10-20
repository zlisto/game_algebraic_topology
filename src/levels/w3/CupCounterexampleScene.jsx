import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useRef } from 'react'
import Hologram from '../w0/Hologram'
import { Lantern, Station as TorusStation } from './FrontFaceScene'
import YardFrame from '../w2/YardFrame'

/**
 * Twin Islands (3-4): the torus T and the bouquet X = S¹ ∨ S¹ ∨ S² have the same cohomology groups
 * (ℤ, ℤ², ℤ) but different cup products: on T, α ⌣ β generates H²; on X it is 0, because X
 * retracts onto S¹ ∨ S¹, whose H² is 0. So they are not homotopy equivalent (Hatcher Example 3.8).
 *   same_holes   — read both islands' cohomology meters: identical
 *   cast_torus   — cast α ⌣ β on the torus: +1
 *   cast_bouquet — cast α on ring a, β on ring b, then their cup on the sphere: 0
 *   nulls_answer — the two islands side by side; light both lanterns to show Null the difference
 */

export const ISLES = { T: [-2.6, 0.6], X: [2.6, 0.6] }
export const BOUQ = { a: [-1.25, 0.9], b: [1.25, 0.9], sphere: [0, -1.4], base: [0, 0.9] }

function Spin({ children, y = 0 }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.35
  })
  return (
    <group ref={g} position={[0, y, 0]}>
      {children}
    </group>
  )
}

function MiniTorus({ pos }) {
  const kRef = useRef(1)
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Spin y={0.9}>
        <group scale={0.55}>
          <Hologram kind="torus" kRef={kRef} />
        </group>
      </Spin>
    </group>
  )
}

/** S¹ ∨ S¹ ∨ S²: two rings and a ball, all through one base point. */
export function Bouquet({ pos = [0, 0], s = 1, beamA, beamB, sphereVal }) {
  const ring = (cx, col, on) => (
    <Line
      points={Array.from({ length: 49 }, (_, i) => [cx * s + 1.25 * s * Math.cos((i / 48) * 2 * Math.PI), 0.14, (BOUQ.a[1] + 1.25 * Math.sin((i / 48) * 2 * Math.PI)) * s])}
      color={on ? col : '#6a6a74'}
      lineWidth={on ? 6 : 3}
    />
  )
  return (
    <group position={[pos[0], 0, pos[1]]}>
      {ring(-1.25, '#ffb347', beamA)}
      {ring(1.25, '#7fd6ff', beamB)}
      <mesh position={[0, 0.3, BOUQ.base[1] * s]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshBasicMaterial color="#fff2c4" />
      </mesh>
      <Line points={[[0, 0.3, BOUQ.base[1] * s], [0, 1.0 * s, BOUQ.sphere[1] * s * 0.5 + 0.2]]} color="#8a8a94" lineWidth={2} />
      <mesh position={[0, 1.1 * s, BOUQ.sphere[1] * s * 0.5 - 0.6 * s]}>
        <sphereGeometry args={[0.8 * s, 28, 20]} />
        <meshStandardMaterial
          color={sphereVal ? '#ffd27a' : '#c8d4e0'}
          emissive={sphereVal ? '#ffb347' : '#000000'}
          emissiveIntensity={sphereVal ? 1 : 0}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Meter({ pos, revealed, label }) {
  return (
    <group position={[pos[0], 0, pos[1] + 2.4]}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.5]} />
        <meshStandardMaterial color={revealed ? '#3a4a5a' : '#2a2a30'} emissive={revealed ? '#7fd6ff' : '#000000'} emissiveIntensity={revealed ? 0.3 : 0} />
      </mesh>
      <Html position={[0, 0.9, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ fontSize: '0.66rem', textAlign: 'center' }}>
          {label}
          <br />
          {revealed ? 'H⁰ ℤ · H¹ ℤ² · H² ℤ' : 'H⁰ ? · H¹ ? · H² ?'}
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'same_holes') {
    const r = bag.read || {}
    return (
      <group>
        <MiniTorus pos={ISLES.T} />
        <Bouquet pos={ISLES.X} s={0.55} />
        <Meter pos={ISLES.T} revealed={r.T} label="T" />
        <Meter pos={ISLES.X} revealed={r.X} label="S¹ ∨ S¹ ∨ S²" />
      </group>
    )
  }
  if (id === 'cast_torus') return TorusStation({ id: 'cocycle_products' }, { bag: { cast: { cocycle_products: bag.cast?.cast_torus || {} } } })
  if (id === 'cast_bouquet') {
    const c = bag.cast?.cast_bouquet || {}
    return (
      <group>
        <Bouquet beamA={c.a} beamB={c.b} sphereVal={0} />
        <Lantern pos={[2.8, -2.2]} value={c.sphere ? 0 : null} label="α⌣β on S²" />
      </group>
    )
  }
  if (id === 'nulls_answer') {
    const c = bag.cast?.nulls_answer || {}
    return (
      <group>
        <MiniTorus pos={ISLES.T} />
        <Bouquet pos={ISLES.X} s={0.55} beamA={c.X} beamB={c.X} />
        <Lantern pos={[ISLES.T[0], -2.4]} value={c.T ? 1 : null} label="α⌣β on T" />
        <Lantern pos={[ISLES.X[0], -2.4]} value={c.X ? 0 : null} label="α⌣β on X" />
      </group>
    )
  }
  return null
}

export default function CupCounterexampleScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0a0e12', water: '#14324a', deep: '#060a0e', cloud: '#b8d0e8', spark: '#ffd27a', seed: 34 }} deckColor="#2a3036" station={Station} />
}
