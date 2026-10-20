import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useRef, useState } from 'react'
import Hologram, { LETTER_COLORS } from '../../levels/w0/Hologram'
import { ARROWS, Arrow, H, RP2_WORD, SPLIT, Tri } from '../../levels/w2/TileYardScene'

/**
 * Hatcher's square of two triangles for the 2-1 movies, driven by a script:
 *   script(t) → { arrows, split ∈ [0, 1], sides (draw a/b arrows?), kind, k, bad: {lower, upper}, labels }
 * Discrete parts (arrows, which surface, red triangles) re-render on change; the slide and the
 * fold run per frame from refs.
 */
export function MovieTiles({ tRef, script, position = [0, 0, 0] }) {
  const [view, setView] = useState(null)
  const keyRef = useRef('')
  const lower = useRef()
  const upper = useRef()
  const kRef = useRef(0)
  const holo = useRef()
  useFrame((_, dt) => {
    const s = script(tRef.current)
    const key = JSON.stringify([s.arrows, s.sides, s.kind, s.bad, s.labels, s.hideFlat, s.hideUpper])
    if (key !== keyRef.current) {
      keyRef.current = key
      setView(s)
    }
    const o = SPLIT * (s.split || 0)
    if (lower.current) lower.current.position.set(o, 0, o)
    if (upper.current) upper.current.position.set(-o, 0, -o)
    kRef.current = s.k || 0
    if (holo.current) holo.current.rotation.y += dt * 0.3
  })
  if (!view) return null
  const { arrows, sides = true, kind, bad = {}, labels, hideFlat, hideUpper } = view
  const A = (id, sign = arrows[id]) => (
    <Arrow key={`${id}${sign}`} from={ARROWS[id].from} to={ARROWS[id].to} sign={sign} color={LETTER_COLORS[ARROWS[id].letter]} chevrons={ARROWS[id].letter === 1 ? 2 : 1} glow />
  )
  const plain = (id) => {
    const { from, to } = ARROWS[id]
    const dx = to[0] - from[0]
    const dz = to[1] - from[1]
    return (
      <mesh key={id} position={[(from[0] + to[0]) / 2, 0.09, (from[1] + to[1]) / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
        <boxGeometry args={[0.1, 0.04, Math.hypot(dx, dz)]} />
        <meshStandardMaterial color="#8a9a90" />
      </mesh>
    )
  }
  const lbl = (txt, p) => (
    <Html key={txt + p} position={[p[0], 0.4, p[1]]} center zIndexRange={[10, 0]}>
      <div className="floor-tag">{txt}</div>
    </Html>
  )
  return (
    <group position={position}>
      <group visible={!hideFlat}>
        <group ref={lower}>
          <Tri pts={[[-H, H], [H, H], [H, -H]]} bad={bad.lower} />
          {sides ? [A('bottom'), A('right')] : [plain('bottom'), plain('right')]}
          {A('diag', arrows.diagL ?? arrows.diag)}
          {labels === 'lower' && [lbl('0', [-H - 0.4, H + 0.4]), lbl('1', [H + 0.4, H + 0.4]), lbl('2', [H + 0.4, -H - 0.4])]}
        </group>
        <group ref={upper} visible={!hideUpper}>
          <Tri pts={[[-H, H], [H, -H], [-H, -H]]} bad={bad.upper} />
          {sides === true ? [A('top'), A('left')] : [plain('top'), plain('left')]}
          {arrows.diagL !== undefined && A('diag')}
        </group>
      </group>
      {kind && (
        <group ref={holo} position={[0, 1.9, -0.4]} scale={1.05} key={kind}>
          <Hologram kind={kind} kRef={kRef} word={kind === 'rp2' ? RP2_WORD : []} />
        </group>
      )}
    </group>
  )
}

/** A stone deck with a brass rim, for movie sets. */
export function MovieDeck({ r = 5.4 }) {
  return (
    <group>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[r, r * 0.92, 0.6, 48]} />
        <meshStandardMaterial color="#26302c" roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r - 0.14, r, 64]} />
        <meshBasicMaterial color="#c9a24a" toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
