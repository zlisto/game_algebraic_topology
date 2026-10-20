import { Html } from '@react-three/drei'
import { Band, Lever, Post } from '../w2/DynamoGateScene'
import YardFrame from '../w2/YardFrame'

/**
 * Classing Room (4-9): cohomology classes are maps into Eilenberg–MacLane spaces,
 * Hⁿ(X; G) ≅ [X, K(G, n)], by f ↦ f*(ι) with ι the fundamental class. With K(ℤ, 1) = S¹:
 *   pull — a map S¹ → S¹ of degree d pulls ι back to dα; dial the maps that give 3α, then −2α
 *   read — a map T² → S¹ winds a times round one loop and b round the other: the class aα + bβ
 */

export const TARGETS = [3, -2]
export const READ_TARGET = { a: 2, b: -1 }
export const LEVERS = { d: [-3.8, 2.4], a: [-3.8, 2.4], b: [3.8, 2.4] }
const fmt = (n, s) => (n === 0 ? '' : n === 1 ? s : n === -1 ? `−${s}` : n < 0 ? `−${-n}${s}` : `${n}${s}`)
export const cls = (a, b = 0) => [fmt(a, 'α'), b ? (b > 0 ? `+ ${fmt(b, 'β')}` : `− ${fmt(-b, 'β')}`) : ''].join(' ').trim() || '0'

export function Station(site, { bag }) {
  if (site.id === 'pull') {
    const d = bag.d ?? 1
    const step = bag.step || 0
    return (
      <group>
        <group position={[0.8, 0, 0.2]}>
          <Post label={`f*ι = ${cls(d)}`} />
          {d !== 0 && <Band segs={[d]} color={d < 0 ? '#7fd6ff' : '#ffb347'} />}
        </group>
        <Lever pos={LEVERS.d} on label={`degree ${d}`} />
        <Html position={[0.8, 0.3, 4.2]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">S¹ → K(ℤ, 1) = S¹ · wanted: {step < TARGETS.length ? cls(TARGETS[step]) : 'done'}</div>
        </Html>
      </group>
    )
  }
  if (site.id === 'read') {
    const a = bag.wa ?? 0
    const b = bag.wb ?? 0
    return (
      <group>
        <group position={[-1.6, 0, 0.3]} scale={0.6}>
          <Post label={`round a: ${a}`} />
          {a !== 0 && <Band segs={[a]} color="#ffb347" />}
        </group>
        <group position={[1.8, 0, 0.3]} scale={0.6}>
          <Post label={`round b: ${b}`} />
          {b !== 0 && <Band segs={[b]} color="#7fd6ff" />}
        </group>
        <Lever pos={LEVERS.a} on label={`a-winding ${a}`} />
        <Lever pos={LEVERS.b} on label={`b-winding ${b}`} />
        <Html position={[0, 0.3, 4.2]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">T² → S¹ gives {cls(a, b)} · wanted: {cls(READ_TARGET.a, READ_TARGET.b)}</div>
        </Html>
      </group>
    )
  }
  return null
}

export default function MapsClassesScene(props) {
  return <YardFrame {...props} sky={{ bg: '#100c0a', water: '#3a2818', deep: '#0a0806', cloud: '#e8d0b0', spark: '#ffd27a', seed: 49 }} deckColor="#342e28" station={Station} />
}
