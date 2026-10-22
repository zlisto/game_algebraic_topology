import { Line, Sparkles, Stars } from '@react-three/drei'
import { NearLabel } from './SheetMusicScene'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import Seascape from '../../world/Seascape'
import { CausewaySlab } from '../../world/ReefScenery'
import CommonsIslands from '../../world/Commons'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { makeTrack } from '../w0/cells'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import ReefGame from '../w0/ReefGame'

const GLASS = '#88ccff'
const AMBER = '#ffb347'

function ViaductSky() {
  return (
    <>
      <color attach="background" args={['#0a1424']} />
      <fog attach="fog" args={['#0a1424', 28, 72]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#a8d8ff', '#0c0a18', 0.55]} />
      <directionalLight position={[10, 14, -18]} intensity={0.95} color="#c8e8ff" />
      <Stars radius={90} depth={40} count={800} factor={2} fade speed={0.15} />
      <Sparkles count={90} scale={[50, 6, 50]} position={[0, 3, -4]} size={2.2} speed={0.25} color="#a8e0ff" />
      <Seascape y={-2.4} depth={2.4} area={[0, 4, 96, 112]} seed={88} palette={{ water: '#1a3a58', sand: '#3a4a58', weed: '#2a4a48' }} lanterns={16} />
      <Clouds y={15} area={[0, 4, 90, 100]} count={14} seed={8} color="#a8c8ff" opacity={0.25} />
      <FloatingRocks center={[0, 0, 4]} radius={[34, 46]} count={12} seed={18} glow="#66aaff" />
    </>
  )
}

/**
 * The cover, stacked over the deck: one glass copy of the deck per sheet. The white bead is the
 * lift of Gyroid — straight above him, on the sheet his path has carried him to.
 */
function GlassSheets({ site, sheets, liftSheet, current, stateRef, lantern, onDeck }) {
  const bead = useRef()
  const y0 = 1.9
  const step = 1.25
  useFrame(() => {
    const st = stateRef?.current
    if (!bead.current) return
    // only over the deck: off it, Gyroid's lift isn't on these sheets
    const on = current && st && Math.hypot(st.x - site.pos[0], st.z - site.pos[1]) < (site.def.add[0].r || 5)
    bead.current.visible = !!on
    if (on) bead.current.position.set(st.x - site.pos[0], y0 + (liftSheet - 1) * step + 0.14, st.z - site.pos[1])
  })
  if (!sheets || sheets < 2) return null
  const sh = site.def.add[0]
  const r = sh.r || 5
  const posts = [0.25, 1.82, 3.39, 4.96].map((a) => [Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93])
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      {Array.from({ length: sheets }, (_, i) => {
        const lit = i === liftSheet - 1 && current
        return (
          <group key={i} position={[0, y0 + i * step, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r * 0.55, r * 0.92, 48]} />
              <meshStandardMaterial color={lit ? '#ffe6a8' : GLASS} transparent opacity={lit ? 0.32 : 0.16} depthWrite={false} emissive={lit ? '#ffb347' : '#66aaff'} emissiveIntensity={current ? 0.4 : 0.15} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* bright rims, so each sheet reads as its own floor from the chase camera */}
            {[r * 0.92, r * 0.55].map((rr) => (
              <mesh key={rr} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[rr, 0.035, 6, 64]} />
                <meshBasicMaterial color={lit ? '#ffd27a' : '#a8e0ff'} transparent opacity={current ? 0.95 : 0.5} toneMapped={false} />
              </mesh>
            ))}
            {current && onDeck && (
              <NearLabel position={[-r * 0.95, 0.1, 0]} maxDist={16} style={{ color: lit ? '#1a1200' : '#dff2ff', background: lit ? '#ffd27a' : 'rgba(20,40,70,0.75)' }}>
                sheet {i + 1}
              </NearLabel>
            )}
          </group>
        )
      })}
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, (y0 + (sheets - 1) * step) / 2, z]}>
          <cylinderGeometry args={[0.05, 0.05, y0 + (sheets - 1) * step, 6]} />
          <meshStandardMaterial color="#88aacc" transparent opacity={0.5} emissive="#4488cc" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* the lift: straight above Gyroid, on the sheet his path has carried it to */}
      <mesh ref={bead}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      {lantern && (
        <group position={[lantern.x, y0 + (lantern.sheet - 1) * step + 0.35, lantern.z]}>
          <mesh>
            <octahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <pointLight color="#ffb347" intensity={6} distance={6} />
        </group>
      )}
    </group>
  )
}

export function Deck({ site, current }) {
  const rim = useRef()
  useFrame(({ clock }) => {
    rim.current.material.opacity = current ? 0.65 + Math.sin(clock.elapsedTime * 2.2) * 0.22 : 0.38
  })
  const r = site.def.add[0].r
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[r, r * 1.02, 0.35, 40]} />
        <meshStandardMaterial color="#3a4558" roughness={0.85} />
      </mesh>
      <mesh ref={rim} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.92, r * 0.98, 48]} />
        <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.2} transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </group>
  )
}

function TrackLoop({ track, origin, label, current }) {
  const pts = track.pts.map(([x, z]) => [x, 0.18, z])
  const col = label === 'a' ? '#ff9a5a' : '#7fd6ff'
  return (
    <>
      <Line points={pts} color={col} lineWidth={current ? 4 : 2.5} toneMapped={false} />
      <mesh position={[origin[0], 0.25, origin[1]]}>
        <cylinderGeometry args={[0.35, 0.45, 0.5, 16]} />
        <meshStandardMaterial color="#2a3544" emissive={AMBER} emissiveIntensity={0.5} />
      </mesh>
    </>
  )
}

function PortMarkers({ site, onPortClick, show }) {
  if (!show || !site.ports) return null
  return site.ports.map(([x, z, label], i) => (
    <mesh
      key={i}
      position={[site.pos[0] + x, 0.55, site.pos[1] + z]}
      onClick={(e) => (e.stopPropagation(), onPortClick?.(label))}
    >
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial color={label === 'a' ? '#ff9a5a' : '#7fd6ff'} emissive="#fff2c4" emissiveIntensity={1.6} toneMapped={false} />
    </mesh>
  ))
}

export default function UnderCoverScene({
  layout,
  sites,
  current,
  liftSheet,
  cover,
  emmyRef,
  beacon,
  onDeck,
  exitOpen,
  walkable,
  game,
  gameKey,
  stateRef,
  frameRef,
  camYawRef,
  talkingRef,
  stars,
  portal,
  spawnRef,
  playEnabled,
  tool,
  tracksBySite,
  onAction,
  onTrackMove,
  onEnemies,
  onHearts,
  onPortClick,
  showPorts,
}) {
  const stations = sites.filter((s) => s.stage === 'station')
  return (
    <>
      <ViaductSky />
      <CommonsIslands sites={sites} />
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <mesh key={s.id} position={[s.pos[0], -0.2, s.pos[1]]}>
            <cylinderGeometry args={[s.def.add[0].r, s.def.add[0].r * 0.92, 0.35, 32]} />
            <meshStandardMaterial color="#3a4558" roughness={0.85} />
          </mesh>
        ))}
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {stations.map((s) => (
        <group key={s.id}>
          <Deck site={s} current={s.id === current} />
          <GlassSheets site={s} sheets={s.sheets} liftSheet={s.id === current ? liftSheet + 1 : 1} current={s.id === current} stateRef={stateRef} lantern={beacon && beacon.site === s.id ? beacon : null} onDeck={onDeck === s.id} />
          {(tracksBySite[s.id] || []).map((tr, i) => (
            <TrackLoop key={i} track={tr} origin={s.pos} label={s.tracks[i]?.label || (i ? 'b' : 'a')} current={s.id === current} />
          ))}
          <PortMarkers site={s} show={showPorts && s.id === current} onPortClick={onPortClick} />
        </group>
      ))}
      {exitOpen && (
        <mesh position={[layout.exit.gate[0], 1.2, layout.exit.gate[1]]}>
          <torusGeometry args={[1.4, 0.12, 8, 32]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      )}
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        purge={!!portal?.open}
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        onAction={onAction}
        onTrackMove={onTrackMove}
        onEnemies={onEnemies}
        onHearts={onHearts}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} talkingRef={talkingRef} frameRef={frameRef} walkable={walkable} stars={stars} portal={portal} exitFrom={layout.exit.a} follower emmyRef={emmyRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.6} luminanceSmoothing={0.22} />
        <Vignette offset={0.3} darkness={0.62} />
      </EffectComposer>
    </>
  )
}

export function buildTracks(sites) {
  return Object.fromEntries(
    sites
      .filter((s) => s.tracks)
      .map((s) => [s.id, s.tracks.map((t) => makeTrack(t, s.pos))]),
  )
}
