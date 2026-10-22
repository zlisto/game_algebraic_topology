import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import CommonsIslands from '../../world/Commons'
import { LAND } from '../../theme/palette'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import ReefGame from '../w0/ReefGame'
import CoverGraph from '../../movies/w1/CoverGraph'

/**
 * The cover each hall is built on, drawn as Hatcher draws covers of a wedge of circles: one dot
 * per sheet, a-edges orange and b-edges blue. A deck transformation permutes the sheets and
 * must carry the graph onto itself.
 *   cyclic3  — a = b = (1 2 3): turning by a third lands it on itself (normal)
 *   lopsided — a = (1 2), b = (2 3): no turn lands it on itself (not normal)
 *   quotient — the circle's double cover z ↦ z²: a half-turn swaps the two sheets
 */
export const HALL_COVERS = {
  cyclic3: { a: [1, 2, 0], b: [1, 2, 0] },
  lopsided: { a: [1, 0, 2], b: [0, 2, 1] },
  quotient: { a: [1, 0] },
}
function CoverSpin({ site, shift }) {
  const g = useRef()
  const cover = HALL_COVERS[site.cover]
  const n = cover.a.length
  const verts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const th = -Math.PI / 2 + (2 * Math.PI * i) / n
        return [2.4 * Math.cos(th), 2.6, 2.4 * Math.sin(th)]
      }),
    [n],
  )
  useFrame(() => {
    if (!g.current) return
    const target = (-shift * 2 * Math.PI) / n
    g.current.rotation.y += (target - g.current.rotation.y) * 0.08
  })
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <group ref={g}>
        <CoverGraph cover={cover} verts={verts} />
      </group>
    </group>
  )
}

function HallSky() {
  return (
    <>
      <color attach="background" args={['#0a1430']} />
      <fog attach="fog" args={['#0a1430', 30, 86]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#a8c8ff', '#0a0818', 0.6]} />
      <directionalLight position={[8, 18, -10]} intensity={1.0} color="#d0e4ff" />
      <Stars radius={90} depth={40} count={1400} factor={2.4} fade speed={0.25} />
      <Sparkles count={120} scale={[60, 6, 140]} position={[0, 2, 16]} size={2.2} speed={0.25} color="#ffd6f0" />
      <Seascape y={-2.4} depth={2.4} area={[0, 16, 96, 160]} seed={110} palette={{ water: '#16305a', sand: '#3a4458', weed: '#2a3a5a' }} lanterns={20} />
      <Clouds y={15} area={[0, 16, 90, 150]} count={16} color="#a8b8ee" opacity={0.25} seed={11} speed={0.2} />
      <FloatingRocks center={[0, 0, 16]} radius={[38, 62]} count={16} seed={3} glow="#ff8ad8" />
    </>
  )
}

/** Calls onReady once the halls have drawn a few frames, so the opening never plays over black. */
function FirstFrames({ onReady, after = 3 }) {
  const n = useRef(0)
  useFrame(() => {
    n.current += 1
    if (n.current === after) onReady()
  })
  return null
}

/** Every hall stands on a basalt slab and a rock pillar down into the sea. */
function HallBase({ site }) {
  const a = site.def.add[0]
  const [x, z] = site.pos
  if (a.type === 'rect') {
    const w = a.x1 - a.x0
    const d = a.z1 - a.z0
    return (
      <group position={[x + (a.x0 + a.x1) / 2, 0, z + (a.z0 + a.z1) / 2]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[w, 0.4, d]} />
          <meshStandardMaterial color="#26304a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -2.2, 0]}>
          <boxGeometry args={[w * 0.8, 3.6, d * 0.8]} />
          <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
        </mesh>
      </group>
    )
  }
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[a.r, a.r * 0.96, 0.4, 48]} />
        <meshStandardMaterial color="#26304a" roughness={0.8} />
      </mesh>
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[a.r * 0.9, a.r * 0.5, 3.6, 20]} />
        <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

function GlassDeck({ site, current, shift, sheets = 3 }) {
  const rim = useRef()
  useFrame(({ clock }) => {
    if (rim.current) rim.current.material.emissiveIntensity = current ? 1.2 + Math.sin(clock.elapsedTime * 2.2) * 0.4 : 0.7
  })
  const [x, z] = site.pos
  const layers = Array.from({ length: sheets }, (_, i) => i)
  return (
    <group position={[x, 0, z]}>
      {layers.map((i) => {
        const perm = Array.from({ length: sheets }, (_, j) => (j + shift) % sheets)
        const layer = perm.indexOf(i)
        return (
          <mesh key={i} position={[0, 0.12 + layer * 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[site.def.add[0].r || 5, 48]} />
            <meshStandardMaterial color="#1a2838" transparent opacity={0.35 + layer * 0.08} roughness={0.2} metalness={0.4} />
          </mesh>
        )
      })}
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[(site.def.add[0].r || 5) - 0.15, (site.def.add[0].r || 5) + 0.08, 64]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.8} toneMapped={false} transparent opacity={current ? 0.9 : 0.45} />
      </mesh>
    </group>
  )
}

function DeckWheel({ site, onClick, active }) {
  const g = useRef()
  const [x, z] = site.pos
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * (active ? 0.5 : 0.15)
  })
  return (
    <group ref={g} position={[x + (site.wheel?.[0] || 0), 0.4, z + (site.wheel?.[1] || 0)]} onClick={(e) => (e.stopPropagation(), onClick?.())}>
      <mesh>
        <torusGeometry args={[0.55, 0.12, 10, 32]} />
        <meshStandardMaterial color="#c98a2a" emissive="#ffb347" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[Math.sin((i * Math.PI * 2) / 3) * 0.35, 0, Math.cos((i * Math.PI * 2) / 3) * 0.35]}>
          <boxGeometry args={[0.12, 0.2, 0.35]} />
          <meshStandardMaterial color="#ffe6a8" emissive="#fff2c4" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function AntipodalSphere({ site, current }) {
  const [x, z] = site.pos
  const pulse = useRef()
  useFrame(({ clock }) => {
    if (pulse.current) pulse.current.material.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 2) * 0.5
  })
  return (
    <group position={[x, 0, z]}>
      <mesh>
        <sphereGeometry args={[5.5, 32, 24]} />
        <meshStandardMaterial color="#182030" transparent opacity={0.25} roughness={0.1} metalness={0.5} />
      </mesh>
      {(site.doors || []).map(([dx, dz], i) => (
        <group key={i} position={[dx, 1.2, dz]}>
          <mesh ref={i === 0 ? pulse : undefined}>
            <boxGeometry args={[1.2, 2.4, 0.2]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.8, 5.2, 64]} />
        <meshStandardMaterial color="#ff8ad8" emissive="#ff8ad8" emissiveIntensity={current ? 1.2 : 0.4} toneMapped={false} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function LoopTrack({ site, loopId, active }) {
  const [x, z] = site.pos
  const col = loopId === 'half' ? '#ffb347' : '#506080'
  const scale = loopId === 'meridian' ? [0.35, 1] : [1, 1]
  const rot = loopId === 'meridian' ? Math.PI / 2 : 0
  return (
    <mesh rotation={[-Math.PI / 2, rot, 0]} position={[x, 0.08, z]} scale={scale}>
      {/* the half rim runs from the south door, round the east side, to the north door */}
      <ringGeometry args={[loopId === 'half' ? 4.2 : 4.5, loopId === 'half' ? 4.9 : 4.85, loopId === 'half' ? 32 : 64, 1, loopId === 'half' ? -Math.PI / 2 : 0, loopId === 'half' ? Math.PI : Math.PI * 2]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={active ? 1.6 : 0.35} toneMapped={false} transparent opacity={active ? 0.95 : 0.35} />
    </mesh>
  )
}

export default function DeckHallsScene({
  layout,
  sites,
  current,
  shift,
  guardsAligned,
  walkLoop,
  onWheelClick,
  gameKey,
  game,
  walkable,
  playEnabled,
  stateRef,
  frameRef,
  emmyRef,
  onFirstFrames,
  onEnemies,
  onHearts,
  tool,
  onAction,
  spawnRef,
  ribbonApi,
  exitOpen,
  camYawRef,
  talkingRef,
  stars,
  portal,
}) {
  return (
    <>
      <HallSky />
      {onFirstFrames && <FirstFrames onReady={onFirstFrames} />}
      <CommonsIslands sites={sites} />
      {sites
        .filter((s) => s.stage === 'station' || s.kind === 'start' || s.id === 'exit_path' || s.id === 'north_gate')
        .map((s) => (
          <HallBase key={s.id} site={s} />
        ))}
      {layout.causeways?.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth || 1.5} />
      ))}
      {exitOpen && layout.exit && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth || 1.5} />}
      {sites.map((site) => {
        if (site.kind === 'start' || site.id === 'exit_path' || site.id === 'north_gate') {
          const [x, z] = site.pos
          return (
            <mesh key={site.id} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[site.def.add[0].r || 2, 32]} />
              <meshStandardMaterial color="#1c2430" roughness={0.85} />
            </mesh>
          )
        }
        if (site.id === 'antipodal') {
          return (
            <group key={site.id}>
              <AntipodalSphere site={site} current={current === site.id} />
              {site.loops?.map((lid) => (
                <LoopTrack key={lid} site={site} loopId={lid} active={walkLoop === lid || (current === site.id && lid === 'half')} />
              ))}
            </group>
          )
        }
        const sheets = site.cover === 'quotient' ? 2 : site.cover === 'lopsided' || site.cover === 'cyclic3' ? 3 : 1
        return (
          <group key={site.id}>
            <GlassDeck site={site} current={current === site.id} shift={current === site.id ? shift : 0} sheets={sheets} />
            {site.wheel && current === site.id && <DeckWheel site={site} active onClick={onWheelClick} />}
            {current === site.id && HALL_COVERS[site.cover] && <CoverSpin site={site} shift={shift} />}
          </group>
        )
      })}
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        purge={!!portal?.open}
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={ribbonApi}
        onAction={onAction}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} talkingRef={talkingRef} frameRef={frameRef} walkable={walkable} stars={stars} portal={portal} exitFrom={layout.exit.a} follower emmyRef={emmyRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={0.85} />
        <Vignette eskil offset={0.12} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
