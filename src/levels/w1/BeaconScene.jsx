import { useFrame } from '@react-three/fiber'
import { Html, Line, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import Emmy from '../../characters/Emmy'
import { CausewaySlab } from '../../world/ReefScenery'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { DevAdvance, FollowCamera } from '../w0/OverworldScene'
import { LiveLine } from '../w0/FlatsScenery'
import { Platform, EmmyBubble } from '../w0/FoundryScene'
import { LOOP_NAMES } from './loops'
import ReefGame from '../w0/ReefGame'
import Seascape from '../../world/Seascape'

const S = 0.7
const NO_PROGRESS = { current: null }
const BEACON_COL = '#ffb347'

export function BeaconTower({ scale = 1, pulseRef, label = 'x₀' }) {
  const glow = useRef()
  const beam = useRef()
  const ring = useRef()
  useFrame(({ clock }) => {
    const p = pulseRef?.current || 0
    if (pulseRef && p > 0) pulseRef.current = Math.max(0, p - 0.02)
    const t = clock.elapsedTime
    glow.current.material.emissiveIntensity = 1.2 + p * 1.6 + Math.sin(t * 2.2) * 0.25
    glow.current.position.y = 3.4 + Math.sin(t * 1.3) * 0.12
    beam.current.material.opacity = 0.1 + p * 0.25
    ring.current.material.opacity = 0.55 + p * 0.4
    ring.current.scale.setScalar(1 + p * 0.25)
  })
  return (
    <group scale={scale}>
      {/* the basepoint: a glowing pad you start and finish every lap on */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.7, 0.95, 40]} />
        <meshBasicMaterial color={BEACON_COL} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.7, 40]} />
        <meshBasicMaterial color="#3a2a14" transparent opacity={0.7} />
      </mesh>
      <mesh ref={beam} position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.18, 0.7, 3.4, 20, 1, true]} />
        <meshBasicMaterial color={BEACON_COL} transparent opacity={0.12} depthWrite={false} side={2} toneMapped={false} />
      </mesh>
      <mesh ref={glow} position={[0, 3.4, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={BEACON_COL} emissive={BEACON_COL} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <Html position={[0, 0.2, 1.25]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="basepoint-tag">{label}</div>
      </Html>
    </group>
  )
}

export const TRACK_COLS = ['#ffcf6a', '#88ccff', '#ff8ad8', '#b8ff9a']
function LoopTrack({ track, edge, progressRef, trackIdx, sitePos, active, nameIdx = trackIdx }) {
  const hue = TRACK_COLS[nameIdx] || '#ffcf6a'
  const color = edge ? hue : active ? hue : '#6a5a48'
  const local = useMemo(() => track.pts.map(([x, z]) => [x - sitePos[0], 0.12, z - sitePos[1]]), [track, sitePos])
  // arrows along the track's forward way (the way that counts as +1)
  const arrows = useMemo(
    () =>
      [0.3, 0.5, 0.7].map((u) => {
        const [x0, z0] = track.at(u - 0.01)
        const [x1, z1] = track.at(u + 0.01)
        return { p: [(x0 + x1) / 2 - sitePos[0], 0.16, (z0 + z1) / 2 - sitePos[1]], rot: Math.atan2(x1 - x0, z1 - z0) }
      }),
    [track, sitePos],
  )
  const lit = () => {
    const pr = progressRef.current
    if (!pr || pr.track !== trackIdx || pr.best <= 0.02) return null
    const n = local.length - 1
    const k = Math.round(pr.best * n)
    const seg = pr.dir > 0 ? local.slice(0, k + 1) : local.slice(n - k)
    return seg.map(([x, , z]) => [x, z, 0.15])
  }
  const tip = track.at(0.5)
  return (
    <group>
      <Line points={local} color={color} lineWidth={edge ? 8 : active ? 6 : 4} transparent opacity={edge || active ? 1 : 0.7} toneMapped={false} />
      <LiveLine getPts={lit} color="#fff2c4" width={8} />
      {arrows.map((a, i) => (
        <mesh key={i} position={a.p} rotation={[Math.PI / 2, 0, -a.rot]}>
          <coneGeometry args={[0.16, 0.36, 3]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      {(active || edge) && (
        <Html position={[tip[0] - sitePos[0], 0.85, tip[1] - sitePos[1]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="edge-tag loop-tag" style={{ background: hue }}>
            {LOOP_NAMES[nameIdx]}
          </div>
        </Html>
      )}
    </group>
  )
}

function ExitGate({ exit, open }) {
  const left = useRef()
  const right = useRef()
  useFrame(() => {
    const k = open ? 1 : 0
    left.current.position.x = -0.8 - k * 1.2
    right.current.position.x = 0.8 + k * 1.2
  })
  return (
    <group position={[exit.gate[0], 0, exit.gate[1]]}>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[3.2, 2.8, 0.35]} />
        <meshStandardMaterial color="#2a2428" emissive="#ffb347" emissiveIntensity={open ? 0.5 : 0.15} />
      </mesh>
      <mesh ref={left} position={[-0.8, 1.7, 0]}>
        <boxGeometry args={[1.6, 3.4, 0.2]} />
        <meshStandardMaterial color="#4a3020" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={right} position={[0.8, 1.7, 0]}>
        <boxGeometry args={[1.6, 3.4, 0.2]} />
        <meshStandardMaterial color="#4a3020" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function BastionSky() {
  return (
    <>
      <color attach="background" args={['#0a0c14']} />
      <fog attach="fog" args={['#0a0c14', 24, 58]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={['#c8d8ff', '#1a1020', 0.42]} />
      <directionalLight position={[8, 20, 6]} intensity={0.85} color="#ffe8c8" />
      <Stars radius={80} depth={36} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={180} scale={[36, 8, 36]} position={[0, 3, -4]} size={2.4} speed={0.35} color="#ffb070" />
      <Clouds area={[-20, -30, 20, 16]} count={12} y={14} />
      <FloatingRocks center={[0, 0, -4]} radius={[14, 22]} count={8} />
      <Seascape y={-0.9} depth={2.2} area={[0, -6, 64, 70]} seed={202} palette={{ water: '#132a4a', sand: '#3a4458', weed: '#3a2a5a' }} lanterns={12} />
    </>
  )
}

export default function BeaconScene({
  layout,
  sites,
  walkable,
  current,
  done,
  tracksBySite,
  forged,
  progressRef,
  beaconPulseRef,
  stateRef,
  frameRef,
  game,
  gameKey,
  spawnRef,
  emmyAt,
  emmyTalking,
  emmyNear,
  exitOpen,
  playEnabled,
  tool,
  onEnemies,
  onHearts,
}) {
  const stations = sites.filter((s) => s.stage === 'station')
  const emmyScript = useMemo(
    () => () => {
      const at = emmyAt.current
      return { pos: [at.x / S, 0, at.z / S], rotY: at.rotY, walk: at.walk || 0, gesture: emmyTalking.current ? 0.7 : 0, talk: emmyTalking.current ? 1 : 0, bow: 0 }
    },
    [emmyAt, emmyTalking],
  )
  return (
    <>
      <BastionSky />
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <mesh key={s.id} position={[s.pos[0], -0.32, s.pos[1]]}>
            <cylinderGeometry args={[s.def.add[0].r, s.def.add[0].r * 0.9, 0.6, 32]} />
            <meshStandardMaterial color="#2a2c36" roughness={0.6} />
          </mesh>
        ))}
      {stations.map((s) => {
        const edges = forged[s.id] || []
        return (
          <group key={s.id}>
            <Platform site={s} lit={s.id === current && !done[s.id]} current={s.id === current} />
            <group position={[s.pos[0], 0, s.pos[1]]}>
              <BeaconTower scale={s.beacon === 'south' ? 0.85 : 1} pulseRef={s.id === current ? beaconPulseRef : null} label={s.beacon === 'south' ? 'x₁' : 'x₀'} />
            </group>
            {(tracksBySite[s.id] || []).map((tr, ti) => (
              <group key={ti} position={[s.pos[0], 0, s.pos[1]]}>
                <LoopTrack track={tr} trackIdx={ti} sitePos={s.pos} edge={edges.find((e) => e.track === ti) || null} progressRef={s.id === current ? progressRef : NO_PROGRESS} active={s.id === current} nameIdx={s.beacon === 'south' ? 3 : ti} />
              </group>
            ))}
          </group>
        )
      })}
      <ExitGate exit={layout.exit} open={exitOpen} />
      <group scale={S}>
        <Emmy script={emmyScript} />
      </group>
      <EmmyBubble emmyAt={emmyAt} show={emmyNear} />
      <ReefGame
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
        onAction={() => {}}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <FollowCamera stateRef={stateRef} frameRef={frameRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}

export { S }
