import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useRef } from 'react'
import Emmy from '../../characters/Emmy'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { DevAdvance } from '../w0/OverworldScene'
import ChaseCamera from '../w0/ChaseCamera'
import { EmmyBubble } from '../w0/FoundryScene'
import Hologram, { LETTER_COLORS } from '../w0/Hologram'
import ReefGame from '../w0/ReefGame'
import { squareSurface } from './delta'
import { S } from './movieKit'

/**
 * The Tile Yard: on each deck lies Hatcher's square of two triangles (§2.1, pp. 102–103). Its
 * sides carry arrows — a (orange, one chevron) on the south and north sides, b (blue, two chevrons)
 * on the west and east sides, the diagonal c (violet) from the south-west corner to the north-east.
 * Clicking an arrow with the Cell Hammer turns it round; the press beside the square folds the
 * square up, matching arrows to arrows, and the hologram shows the surface that made.
 */

export const H = 2.2 // the square's half-side
/** Each arrow's midpoint on the deck (local coords; north is −z) and its +1 direction. */
export const ARROWS = {
  bottom: { mid: [0, H], dir: [1, 0], from: [-H, H], to: [H, H], letter: 0 },
  top: { mid: [0, -H], dir: [1, 0], from: [-H, -H], to: [H, -H], letter: 0 },
  left: { mid: [-H, 0], dir: [0, -1], from: [-H, H], to: [-H, -H], letter: 1 },
  right: { mid: [H, 0], dir: [0, -1], from: [H, H], to: [H, -H], letter: 1 },
  diag: { mid: [0, 0], dir: [1, -1], from: [-H, H], to: [H, -H], letter: 2 },
}
/** At the first deck the two triangles still lie apart, each with its own copy of the diagonal. */
export const SPLIT = 0.6
export const PRESS = [3.9, 1.4]
export const RP2_WORD = [{ e: 0 }, { e: 1 }, { e: 0 }, { e: 1 }]

export function YardSky() {
  return (
    <>
      <color attach="background" args={['#0a1210']} />
      <fog attach="fog" args={['#0a1210', 24, 60]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#c8e8ff', '#1a2018', 0.5]} />
      <directionalLight position={[8, 14, 6]} intensity={0.8} color="#ffe6c8" />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.4} />
      <Seascape y={-5} area={[0, 0, 90, 80]} bed={false} lanterns={5} seed={21} palette={{ water: '#0e2a2a', deep: '#06100e' }} />
      <Clouds y={4} area={[0, 0, 60, 60]} count={10} color="#9cc8b8" opacity={0.2} seed={21} speed={0.2} />
      <FloatingRocks area={[0, 0, 46, 46]} count={9} seed={8} />
      <Sparkles count={40} scale={[40, 6, 40]} size={2} color="#88ffcc" opacity={0.35} />
    </>
  )
}

/** A flat stone deck with a brass rim. */
function Deck({ site, lit }) {
  const rim = useRef()
  useFrame(({ clock }) => {
    if (rim.current) rim.current.material.opacity = lit ? 0.75 + Math.sin(clock.elapsedTime * 2.6) * 0.2 : 0.4
  })
  const r = site.def.add[0].r
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[r, r * 0.92, 0.6, 48]} />
        <meshStandardMaterial color="#26302c" roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r - 0.14, r, 64]} />
        <meshBasicMaterial color="#c9a24a" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/** A strip from p to q with chevrons at its middle pointing the way of the arrow. */
export function Arrow({ from, to, sign, color, chevrons = 1, glow }) {
  const [x0, z0] = from
  const [x1, z1] = to
  const dx = x1 - x0
  const dz = z1 - z0
  const len = Math.hypot(dx, dz)
  const ux = (dx / len) * sign
  const uz = (dz / len) * sign
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, 0.1, (z0 + z1) / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
        <boxGeometry args={[0.12, 0.05, len]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow ? 0.55 : 0.25} />
      </mesh>
      {Array.from({ length: chevrons }, (_, i) => {
        const o = (i - (chevrons - 1) / 2) * 0.62
        return (
          <group key={i} position={[(x0 + x1) / 2 + ux * o, 0.14, (z0 + z1) / 2 + uz * o]} rotation={[0, Math.atan2(-uz, ux), 0]}>
            {/* a flat arrowhead: the triangle's first corner points along +x before the turn */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]}>
              <circleGeometry args={[0.36, 3]} />
              <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={glow ? 0.9 : 0.4} side={2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Tri({ pts, bad }) {
  const [a, b, c] = pts
  const verts = new Float32Array([a[0], 0.07, a[1], b[0], 0.07, b[1], c[0], 0.07, c[1]])
  return (
    <mesh>
      <bufferGeometry key={verts.join(',')}>
        <bufferAttribute attach="attributes-position" array={verts} count={3} itemSize={3} />
      </bufferGeometry>
      <meshBasicMaterial color={bad ? '#a02840' : '#33463c'} side={2} />
    </mesh>
  )
}

/** The square on one deck, its arrows, the press, and (once pressed) the folded hologram. */
function TileSquare({ site, arrows, split, check, fold, live }) {
  const off = useRef()
  const lower = useRef()
  const upper = useRef()
  const kRef = useRef(0)
  const holo = useRef()
  useFrame((_, dt) => {
    const glued = fold?.kind === 'square'
    const s = split ? (glued ? 0 : SPLIT) : 0
    for (const [g, sg] of [
      [lower, 1],
      [upper, -1],
    ])
      if (g.current) {
        g.current.position.x += (sg * s - g.current.position.x) * Math.min(1, dt * 4)
        g.current.position.z += (sg * s - g.current.position.z) * Math.min(1, dt * 4)
      }
    if (fold && fold.kind !== 'square') kRef.current = Math.min(1, kRef.current + dt / 2.4)
    else kRef.current = 0
    if (holo.current) holo.current.rotation.y += dt * 0.35
  })
  const showSides = !split
  const A = (id, props = {}) => (
    <Arrow key={id} from={ARROWS[id].from} to={ARROWS[id].to} sign={arrows[id]} color={LETTER_COLORS[ARROWS[id].letter]} chevrons={ARROWS[id].letter === 1 ? 2 : 1} glow={live} {...props} />
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
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <group ref={lower}>
        <Tri pts={[[-H, H], [H, H], [H, -H]]} bad={check?.lowerCyclic} />
        {showSides ? [A('bottom'), A('right')] : [plain('bottom'), plain('right')]}
        {split ? A('diag', { sign: arrows.diagL }) : A('diag')}
      </group>
      <group ref={upper}>
        <Tri pts={[[-H, H], [H, -H], [-H, -H]]} bad={check?.upperCyclic} />
        {showSides ? [A('top'), A('left')] : [plain('top'), plain('left')]}
        {split && A('diag', { sign: arrows.diag })}
      </group>
      <group ref={off} position={[PRESS[0], 0, PRESS[1]]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 0.9, 6]} />
          <meshStandardMaterial color="#3a3228" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.1, 24]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={live ? 1.6 : 0.4} toneMapped={false} />
        </mesh>
      </group>
      {fold && fold.kind !== 'square' && (
        <group ref={holo} position={[0, 1.9, -0.4]} scale={1.05} key={`${fold.kind}:${fold.n}`}>
          <Hologram kind={fold.kind} kRef={kRef} word={fold.kind === 'rp2' ? RP2_WORD : []} />
        </group>
      )}
    </group>
  )
}

function ExitGate({ exit, open }) {
  const left = useRef()
  const right = useRef()
  useFrame(() => {
    const k = open ? 1 : 0
    if (left.current) left.current.position.x += (-0.8 - k * 1.2 - left.current.position.x) * 0.08
    if (right.current) right.current.position.x += (0.8 + k * 1.2 - right.current.position.x) * 0.08
  })
  return (
    <group position={[exit.gate[0], 0, exit.gate[1]]}>
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[4.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#1a2420" emissive="#ffb347" emissiveIntensity={open ? 0.8 : 0.15} />
      </mesh>
      <mesh ref={left} position={[-0.8, 1.4, 0]}>
        <boxGeometry args={[1.6, 2.8, 0.2]} />
        <meshStandardMaterial color="#3a3020" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={right} position={[0.8, 1.4, 0]}>
        <boxGeometry args={[1.6, 2.8, 0.2]} />
        <meshStandardMaterial color="#3a3020" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export const START_ARROWS = {
  two_tri: { bottom: 1, top: 1, left: 1, right: 1, diag: 1, diagL: -1 },
  torus_glue: { bottom: 1, top: -1, left: 1, right: 1, diag: 1 },
  flip_arrow: { bottom: 1, top: 1, left: 1, right: 1, diag: 1 },
  wrong_order: { bottom: 1, top: -1, left: -1, right: 1, diag: 1 },
}

export default function TileYardScene({
  layout, sites, walkable, game, gameKey, stateRef, frameRef, spawnRef, playEnabled, tool, onAction,
  emmyAt, emmyTalking, showEmmyBubble, exitOpen, current, done, bag, setEnemies, setHearts,
  camYawRef,
}) {
  const ownYaw = useRef(0)
  const yaw = camYawRef || ownYaw // the chase camera's heading (shared with movement)
  const stations = sites.filter((s) => s.stage === 'station')
  const emmyScript = () => ({
    pos: [emmyAt.current.x / S, 0, emmyAt.current.z / S],
    rotY: emmyAt.current.rotY || 0,
    walk: 0,
    gesture: emmyTalking.current ? 0.5 : 0.15,
    talk: emmyTalking.current ? 1 : 0,
    bow: 0,
  })
  return (
    <>
      <YardSky />
      {layout.causeways?.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth || 1.5} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth || 1.5} />}
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <mesh key={s.id} position={[s.pos[0], -0.02, s.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[s.def.add[0].r || 2, 32]} />
            <meshStandardMaterial color="#26302c" roughness={0.85} />
          </mesh>
        ))}
      {stations.map((s) => {
        const arrows = bag?.arrows?.[s.id] || START_ARROWS[s.id]
        const tried = bag?.tried?.[s.id]
        return (
          <group key={s.id}>
            <Deck site={s} lit={s.id === current && !done[s.id]} />
            <TileSquare
              site={s}
              arrows={arrows}
              split={s.id === 'two_tri'}
              check={tried && s.id !== 'two_tri' ? squareSurface(arrows) : null}
              fold={bag?.fold?.[s.id]}
              live={s.id === current}
            />
          </group>
        )
      })}
      <ExitGate exit={layout.exit} open={exitOpen} />
      <group scale={S}>
        <Emmy script={emmyScript} />
      </group>
      <EmmyBubble emmyAt={emmyAt} show={!!showEmmyBubble} />
      <ReefGame
        camYawRef={yaw}
        key={gameKey}
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={{ current: null }}
        onAction={onAction || (() => {})}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={setEnemies}
        onHearts={setHearts}
        onSpooling={() => {}}
      />
      {/* Mario 64-style chase camera for walking and fights; the top view only while a station's puzzle is worked (frameRef) */}
      <ChaseCamera stateRef={stateRef} yawRef={yaw} overheadRef={frameRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}
