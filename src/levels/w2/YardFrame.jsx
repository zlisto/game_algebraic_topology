import { useFrame } from '@react-three/fiber'
import Commons from '../../world/CommonsIsland'
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
import ReefGame from '../w0/ReefGame'
import { ACTION_TOOLS } from '../w0/worldTools'

/** In World 2 the Tide Glass works on the deck too (2-3 bends and squeezes with it). */
const YARD_ACTIONS = new Set([...ACTION_TOOLS, 'glass'])
import { S } from './movieKit'

/**
 * The common frame of a World 2 level scene (LevelShell's `Scene`): sky and sea, causeways, a
 * stone deck per station, the exit gate, Emmy, the player and spawn, and the camera. Each level
 * passes `station(site, {current, done, bag, live})` to draw its puzzle on a deck.
 */

export function YardSky({ bg = '#0a1210', water = '#0e2a2a', deep = '#06100e', cloud = '#9cc8b8', spark = '#88ffcc', seed = 21 }) {
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 24, 60]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#c8e8ff', '#1a2018', 0.5]} />
      <directionalLight position={[8, 14, 6]} intensity={0.8} color="#ffe6c8" />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.4} />
      <Seascape y={-5} area={[0, 0, 90, 80]} bed={false} lanterns={5} seed={seed} palette={{ water, deep }} />
      <Clouds y={4} area={[0, 0, 60, 60]} count={10} color={cloud} opacity={0.2} seed={seed} speed={0.2} />
      <FloatingRocks area={[0, 0, 46, 46]} count={9} seed={seed % 13} />
      <Sparkles count={40} scale={[40, 6, 40]} size={2} color={spark} opacity={0.35} />
    </>
  )
}

/** A flat stone deck with a brass rim that pulses while it holds the current station. */
export function Deck({ site, lit, color = '#26302c' }) {
  const rim = useRef()
  useFrame(({ clock }) => {
    if (rim.current) rim.current.material.opacity = lit ? 0.75 + Math.sin(clock.elapsedTime * 2.6) * 0.2 : 0.4
  })
  const r = site.def.add[0].r
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[r, r * 0.92, 0.6, 48]} />
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.1} />
      </mesh>
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r - 0.14, r, 64]} />
        <meshBasicMaterial color="#c9a24a" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function ExitGate({ exit, open }) {
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

export default function YardFrame({
  layout, sites, walkable, game, gameKey, stateRef, frameRef, spawnRef, playEnabled, tool, onAction,
  emmyAt, emmyTalking, showEmmyBubble, exitOpen, current, done, bag, setEnemies, setHearts,
  sky = {}, deckColor, station,
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
      <YardSky {...sky} />
      {layout.causeways?.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth || 1.5} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth || 1.5} />}
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <mesh key={s.id} position={[s.pos[0], -0.02, s.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[s.def.add[0].r || 2, 32]} />
            <meshStandardMaterial color={deckColor || '#26302c'} roughness={0.85} />
          </mesh>
        ))}
      {sites
        .filter((s) => s.kind === 'commons')
        .map((s) => (
          <Commons key={s.id} site={s} color={deckColor} />
        ))}
      {stations.map((s) => (
        <group key={s.id}>
          <Deck site={s} lit={s.id === current && !done[s.id]} color={deckColor} />
          <group position={[s.pos[0], 0, s.pos[1]]}>{station?.(s, { current, done, bag: bag || {}, live: s.id === current })}</group>
        </group>
      ))}
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
        actionTools={YARD_ACTIONS}
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
