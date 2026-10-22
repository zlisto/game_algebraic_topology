import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Hall, Platform, Press, Track, ForgeDoor } from '../w0/FoundryScene'
import Hologram from '../w0/Hologram'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import ReefGame from '../w0/ReefGame'
import { ClaspProp } from '../w0/worldTools'
import { CausewaySlab } from '../../world/ReefScenery'
import { FloatingRocks } from '../../world/Dressing'
import CommonsIslands from '../../world/Commons'
import { presentationLabel } from './glue.js'

const S = 0.7

/**
 * Where a press's hologram floats (as in the Foundry, 0-4). Over the press by default; while Gyroid
 * stands on that press it glides to just in front of him at eye height, so the chase camera sees the
 * space he just glued up close instead of losing it off the top of the frame.
 */
function HoloAnchor({ site, stateRef, camYawRef, children }) {
  const g = useRef()
  const snapped = useRef(false)
  useFrame((_, dt) => {
    if (!g.current) return
    const s = stateRef.current
    let tx = site.pos[0]
    let ty = 3.2
    let tz = site.pos[1] - 1.1
    if (s && site.containsWorld(s.x, s.z)) {
      const yaw = camYawRef.current ?? 0
      tx = s.x - Math.sin(yaw) * 3.2
      ty = 1.3
      tz = s.z - Math.cos(yaw) * 3.2
    }
    const k = snapped.current ? Math.min(1, dt * 3) : 1
    snapped.current = true
    g.current.position.x += (tx - g.current.position.x) * k
    g.current.position.y += (ty - g.current.position.y) * k
    g.current.position.z += (tz - g.current.position.z) * k
    g.current.rotation.y += dt * 0.35
  })
  return (
    <group ref={g} scale={1.05}>
      {children}
    </group>
  )
}

// FoundryScene's Platform draws a round deck; a rectangular station gets a round hub plus a slab
const platformSite = (s) => {
  const a = s.def.add[0]
  return a.type === 'rect' ? { ...s, def: { add: [{ r: Math.min(a.x1 - a.x0, a.z1 - a.z0) / 2 }] } } : s
}

function ClaspPedestal({ pos, active }) {
  const glow = useRef()
  return (
    <group position={[pos[0], 0.12, pos[1]]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.65, 0.2, 24]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.6} />
      </mesh>
      <mesh ref={glow}>
        <torusGeometry args={[0.42, 0.06, 8, 32]} />
        <meshStandardMaterial color="#ffb347" emissive="#ffb347" emissiveIntensity={active ? 2.2 : 0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function GlueScene({
  layout,
  sites,
  walkable,
  game,
  gameKey,
  frameRef,
  stateRef,
  camYawRef,
  talkingRef,
  stars,
  portal,
  spawnRef,
  emmyRef,
  exitOpen,
  ribbonApi,
  playEnabled,
  tool,
  onAction,
  onEnemies,
  onHearts,
  complexes,
  tracks,
  progressRef,
  slamRefs,
  holoKRef,
  holograms,
  current,
  presentation,
  claspReady,
}) {
  const stations = sites.filter((s) => s.stage === 'station')
  // the hall's plates, lava channels and pillars spread out with the (bigger) works
  const hallLayout = useMemo(() => ({ bounds: layout.bounds, decorScale: layout.decorScale || 1 }), [layout])
  return (
    <>
      <Hall layout={hallLayout} />
      <CommonsIslands sites={sites} />
      <FloatingRocks count={16} center={[0, 0, 2]} radius={[36, 50]} color="#2a3544" />
      <Sparkles count={160} scale={[60, 8, 80]} position={[0, 3, 2]} size={2.2} speed={0.35} color="#ffb070" />
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {stations.map((s) => {
        const cx = complexes[s.id]
        return (
          <group key={s.id}>
            <Platform site={platformSite(s)} lit={!!cx?.point} current={s.id === current} />
            {s.def.add[0].type === 'rect' && (
              <mesh position={[s.pos[0] + (s.def.add[0].x0 + s.def.add[0].x1) / 2, -0.32, s.pos[1] + (s.def.add[0].z0 + s.def.add[0].z1) / 2]}>
                <boxGeometry args={[s.def.add[0].x1 - s.def.add[0].x0, 0.6, s.def.add[0].z1 - s.def.add[0].z0]} />
                <meshStandardMaterial color="#2a2c36" roughness={0.6} metalness={0.15} />
              </mesh>
            )}
            {(tracks[s.id] || []).map((tr, ti) => (
              <Track key={ti} track={tr} trackIdx={ti} pos={s.pos} edge={cx?.edges.find((e) => e.track === ti) || null} progressRef={s.id === current ? progressRef : { current: null }} />
            ))}
            <Press pos={s.pos} slamRef={slamRefs[s.id]} />
            {holograms[s.id] && (
              <HoloAnchor site={s} stateRef={stateRef} camYawRef={camYawRef}>
                <Hologram kind={holograms[s.id].kind} word={holograms[s.id].word} kRef={holoKRef[s.id]} />
              </HoloAnchor>
            )}
            {s.id === 'two_pieces' && <ClaspPedestal pos={s.overlap.map((v, i) => v + s.pos[i])} active={claspReady} />}
          </group>
        )
      })}
      <ForgeDoor exit={layout.exit} open={exitOpen} />
      <group scale={S}>
        <ClaspProp state={stateRef} tool={tool} />
      </group>
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
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
      {presentation && current && (
        <Html position={[stations.find((s) => s.id === current).pos[0] + 4.2, 2.2, stations.find((s) => s.id === current).pos[1] - 3.8]} className="glue-pres-hud">
          <div className="glue-pres-panel">
            <div className="glue-pres-title">Group</div>
            <div className="lesson-math">{presentationLabel(presentation)}</div>
          </div>
        </Html>
      )}
    </>
  )
}
