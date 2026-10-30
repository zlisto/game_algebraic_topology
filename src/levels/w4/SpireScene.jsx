import { useFrame } from '@react-three/fiber'
import Commons from '../../world/Commons'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useRef } from 'react'
import Emmy from '../../characters/Emmy'
import { CausewaySlab } from '../../world/ReefScenery'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { DevAdvance } from '../w0/OverworldScene'
import ChaseCamera from '../w0/ChaseCamera'
import { EmmyBubble } from '../w0/FoundryScene'
import ReefGame from '../w0/ReefGame'

const S = 0.7

function SpireSky({ accent = '#c9a0ff' }) {
  return (
    <>
      <color attach="background" args={['#0c0814']} />
      <fog attach="fog" args={['#0c0814', 28, 62]} />
      <ambientLight intensity={0.36} />
      <hemisphereLight args={['#d8c8ff', '#140c1c', 0.4]} />
      <directionalLight position={[8, 16, 6]} intensity={0.85} color="#ffe8c8" />
      <pointLight position={[0, 8, 0]} intensity={8} distance={40} color={accent} />
      <Stars radius={80} depth={40} count={900} factor={2.2} fade />
      <Sparkles count={140} scale={[40, 12, 50]} position={[0, 4, -5]} size={2.4} color={accent} />
      <Clouds />
      <FloatingRocks />
    </>
  )
}

function FloorPad({ site, accent, active }) {
  const r = site.r || 5.2
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[r, 40]} />
        <meshStandardMaterial color={active ? '#2a2038' : '#1a1624'} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 0.8, r - 0.5, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 0.7 : 0.2} toneMapped={false} />
      </mesh>
      {site.beacon && (
        <mesh position={[0, 2.4, 0]}>
          <sphereGeometry args={[0.45, 12, 10]} />
          <meshStandardMaterial color="#ffb347" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function ExitGate({ exit, open }) {
  const left = useRef()
  const right = useRef()
  useFrame(() => {
    const k = open ? 1 : 0
    if (!left.current) return
    left.current.position.x = -0.8 - k * 1.2
    right.current.position.x = 0.8 + k * 1.2
  })
  return (
    <group position={[exit.gate[0], 0, exit.gate[1]]}>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3.2, 2.8, 0.35]} />
        <meshStandardMaterial color="#2a2428" emissive="#c9a0ff" emissiveIntensity={open ? 0.55 : 0.12} />
      </mesh>
      <mesh ref={left} position={[-0.8, 1.7, 0]}>
        <boxGeometry args={[1.6, 3.4, 0.2]} />
        <meshStandardMaterial color="#3a2848" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={right} position={[0.8, 1.7, 0]}>
        <boxGeometry args={[1.6, 3.4, 0.2]} />
        <meshStandardMaterial color="#3a2848" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

/**
 * Shared World 4 scene: stacked Spire floors, ReefGame, Emmy bubble.
 * ReefGame API matches World 1: `stage` + `shape` (walkable with `.bounds`).
 */
export default function SpireScene({
  layout,
  sites,
  walkable,
  stateRef,
  frameRef,
  spawnRef,
  game,
  playEnabled,
  tool,
  onAction,
  onEnemies,
  onHearts,
  exitOpen,
  current,
  emmyAt,
  emmyTalking,
  emmyNear,
  accent = '#c9a0ff',
  gameKey,
  camYawRef,
}) {
  const ownYaw = useRef(0)
  const yaw = camYawRef || ownYaw // the chase camera's heading (shared with movement)
  const emmyScript = () => ({
    pos: [emmyAt.current.x / S, 0, emmyAt.current.z / S],
    rotY: emmyAt.current.rotY,
    walk: emmyAt.current.walk || 0,
    gesture: emmyTalking.current ? 0.7 : 0.15,
    talk: emmyTalking.current ? 1 : 0,
    bow: 0,
  })

  return (
    <>
      <SpireSky accent={accent} />
      {layout.causeways?.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth || 1.4} />
      ))}
      {exitOpen && layout.exit && (
        <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth || 1.4} />
      )}
      {sites
        .filter((s) => s.stage === 'station' || s.kind === 'start')
        .map((s) => (
          <FloorPad key={s.id} site={s} accent={accent} active={s.id === current} />
        ))}
      {sites
        .filter((s) => s.kind === 'commons')
        .map((s) => (
          <Commons key={s.id} site={s} color="#1c1a2a" accent={accent || '#a259ff'} />
        ))}
      <ExitGate exit={layout.exit} open={exitOpen} />
      <group scale={S}>
        <Emmy script={emmyScript} />
      </group>
      <EmmyBubble emmyAt={emmyAt} show={!!emmyNear} />
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
        onAction={onAction}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      {/* Mario 64-style chase camera for walking and fights; the top view only while a station's puzzle is worked (frameRef) */}
      <ChaseCamera stateRef={stateRef} yawRef={yaw} overheadRef={frameRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.28} intensity={0.8} />
        <Vignette offset={0.14} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
