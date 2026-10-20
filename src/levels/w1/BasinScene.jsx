import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, Gear } from '../../world/Dressing'
import { DevAdvance, FollowCamera } from '../w0/OverworldScene'
import ReefGame from '../w0/ReefGame'
import { EmmyBubble } from '../w0/FoundryScene'
import { fieldAngle, fieldStrength, unitRoots } from './brouwer'
import { LiveLine } from '../w0/FlatsScenery'

const S = 0.7
const GOLD = '#ffb347'
const STONE = '#4a4a52'
const VIOLET = '#8060d0'

export function BasinSky() {
  return (
    <>
      <color attach="background" args={['#120818']} />
      <fog attach="fog" args={['#120818', 28, 72]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#c8a0ff', '#0a0610', 0.55]} />
      <directionalLight position={[12, 14, -8]} intensity={0.95} color="#e8c8ff" />
      <pointLight position={[0, 8, 4]} intensity={14} distance={36} color="#ffb070" />
      <Seascape y={-2.4} depth={2.4} area={[0, 4, 70, 50]} seed={14} palette={{ water: '#1a2840', sand: '#3a4048', weed: '#2a3848' }} lanterns={6} />
      <Clouds y={14} area={[0, 0, 70, 55]} count={12} seed={4} />
      <Gear position={[-16, 0.2, 12]} r={2.1} speed={0.15} />
      <Gear position={[17, 0.4, 8]} r={1.6} speed={-0.12} rotation={[0, 1.2, 0]} />
    </>
  )
}

function Deck({ site, current }) {
  const r = site.def.add[0].r
  const pulse = current ? 0.35 + Math.sin(performance.now() * 0.003) * 0.15 : 0.12
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[r, r * 0.94, 0.6, 56]} />
        <meshStandardMaterial color={STONE} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[r - 0.08, r, 64]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={pulse} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function RimRoad({ cx, cz, r, current }) {
  return (
    <group position={[cx, 0, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[r - 0.55, r + 0.55, 72]} />
        <meshStandardMaterial color="#3a3346" roughness={0.8} />
      </mesh>
      {[r - 0.55, r + 0.55].map((rr, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[rr - 0.04, rr + 0.04, 72]} />
          <meshBasicMaterial color="#ffcf6a" transparent opacity={current ? 0.85 : 0.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The arrow under Gyroid's feet on a field deck: the field's direction where he stands.
 * Walking the rim, this is the loop the boundary index counts.
 */
function FieldCompass({ stateRef, site }) {
  const g = useRef()
  const arrow = useRef()
  useFrame(() => {
    const st = stateRef.current
    const on = st && site && Math.hypot(st.x - site.pos[0], st.z - site.pos[1]) < site.def.add[0].r
    g.current.visible = !!on
    if (!on) return
    const lx = st.x - site.pos[0]
    const lz = st.z - site.pos[1]
    const f = site.field || { kind: 'radial' }
    const ang = fieldAngle(f.kind, lx, lz, f)
    const m = fieldStrength(f.kind, lx, lz, f)
    g.current.position.set(st.x, 1.75, st.z)
    arrow.current.rotation.set(0, -ang, 0)
    arrow.current.scale.setScalar(0.35 + 0.65 * m)
  })
  return (
    <group ref={g}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.56, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <group ref={arrow}>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
        </mesh>
        <mesh position={[0.46, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.18, 8]} />
          <meshBasicMaterial color="#ff8ad8" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The Retractor's proof, on its deck: the Tide Glass shrinks the rim loop to the centre (that
 * shrink is fine in the disk). The engine would have to push each shrinking loop back out to
 * the rim — every one of those images goes once round (pink). At the centre it has nowhere to
 * send the point: it tears.
 */
export function ShrinkProof({ cx, cz, r, t }) {
  const loop = () => (t == null ? null : Array.from({ length: 73 }, (_, i) => [cx + (1 - t) * r * Math.cos((i / 72) * Math.PI * 2), cz + (1 - t) * r * Math.sin((i / 72) * Math.PI * 2), 0.18]))
  const image = () => (t == null || t > 0.97 ? null : Array.from({ length: 73 }, (_, i) => [cx + (r + 0.75) * Math.cos((i / 72) * Math.PI * 2), cz + (r + 0.75) * Math.sin((i / 72) * Math.PI * 2), 0.2]))
  return (
    <>
      <LiveLine getPts={loop} color="#ffffff" width={5} />
      <LiveLine getPts={image} color="#ff8ad8" width={4} dashed />
    </>
  )
}

export function RetractorEngine({ cx, cz, seized, strain = 0 }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const k = seized ? 0 : strain
    g.current.position.x = cx + Math.sin(clock.elapsedTime * 60) * 0.06 * k
  })
  return (
    <group ref={g} position={[cx, 0, cz]} scale={0.55}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.8, 2.4, 2.2]} />
        <meshStandardMaterial color="#1a1028" emissive={VIOLET} emissiveIntensity={seized ? 0.2 : 1.2} roughness={0.5} metalness={0.4} />
      </mesh>
      {[-1.2, 1.2].map((sd) => (
        <mesh key={sd} position={[sd * 1.8, 0.6, 0]} rotation={[0, 0, sd * 0.4]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
          <meshStandardMaterial color="#2a1838" emissive={VIOLET} emissiveIntensity={seized ? 0.15 : 0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.5, 0.65, 0.5, 12]} />
        <meshStandardMaterial color="#0e0814" emissive="#a259ff" emissiveIntensity={seized ? 0.3 : 2.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function ArrowTile({ x, z, angle, dim = false, highlight = false, strength = 1 }) {
  const len = dim ? 0.15 : 0.12 + 0.3 * strength
  const fx = Math.cos(angle) * len
  const fz = Math.sin(angle) * len
  return (
    <group position={[x, 0.08, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshStandardMaterial color="#3a3848" roughness={0.9} emissive={highlight ? GOLD : '#000000'} emissiveIntensity={highlight ? 1.4 : 0} />
      </mesh>
      {!dim && (
        <>
          <group position={[-fx * 0.5, 0.03, -fz * 0.5]} rotation={[0, -angle, 0]}>
            <mesh position={[len * 0.5, 0, 0]}>
              <boxGeometry args={[len, 0.04, 0.07]} />
              <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            <mesh position={[len + 0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.13, 0.22, 6]} />
              <meshStandardMaterial color="#ffe6a8" emissive={GOLD} emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        </>
      )}
    </group>
  )
}

function FieldGrid({ site, field, foundRoots = [], stillFound = false }) {
  if (!field) return null
  const step = site.gridStep || 1.05
  const r = site.def.add[0].r - 0.9
  const roots = field.kind === 'poly' ? unitRoots(field.degree, 2.15) : []
  const tiles = []
  for (let x = -r; x <= r; x += step) {
    for (let z = -r; z <= r; z += step) {
      if (x * x + z * z > r * r) continue
      const ang = fieldAngle(field.kind, x, z, field)
      const strength = fieldStrength(field.kind, x, z, field)
      const nearStill = field.still && Math.hypot(x - field.still[0], z - field.still[1]) < step * 0.55
      const rootIdx = roots.findIndex((rt) => Math.hypot(x - rt.x, z - rt.z) < 0.55)
      const found = rootIdx >= 0 && foundRoots.includes(rootIdx)
      tiles.push(
        <ArrowTile
          key={`${x}-${z}`}
          x={x}
          z={z}
          angle={ang}
          strength={strength}
          dim={nearStill && stillFound}
          highlight={found || (nearStill && stillFound)}
        />,
      )
    }
  }
  return <group position={[site.pos[0], 0, site.pos[1]]}>{tiles}</group>
}

/**
 * The Antipodes: a globe resting in the deck, its weather stations round the equator — so a
 * station's opposite (straight through the centre) really is its antipode on the sphere.
 */
export const SPHERE_Y = 1.0
export function SphereCap({ site, pickA, pickB }) {
  const ringR = Math.hypot(site.stations?.[0]?.x || 0, site.stations?.[0]?.z || 0) || 2.8
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, SPHERE_Y, 0]}>
        <sphereGeometry args={[ringR, 40, 28]} />
        <meshStandardMaterial color="#2c3a5a" roughness={0.6} metalness={0.1} emissive="#1a2440" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, SPHERE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringR, 0.035, 8, 72]} />
        <meshBasicMaterial color="#ffcf6a" toneMapped={false} />
      </mesh>
      {site.stations?.map((st) => {
        const on = pickA === st.id || pickB === st.id
        const d = Math.hypot(st.x, st.z) || 1
        return (
          <group key={st.id} position={[st.x, SPHERE_Y, st.z]}>
            <mesh rotation={[0, Math.atan2(st.x, st.z), 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.5, 14]} />
              <meshStandardMaterial color={on ? GOLD : '#5a5870'} emissive={on ? GOLD : VIOLET} emissiveIntensity={on ? 1.8 : 0.7} toneMapped={false} />
            </mesh>
            <Html position={[(st.x / d) * 0.55, 0.55, (st.z / d) * 0.55]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
              <div className={`w1-14-station-label floor-tag ${on ? 'free' : ''}`}>({st.readings.join(', ')})</div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function ExitGate({ open, gate }) {
  if (!open) return null
  return (
    <group position={[gate[0], 0, gate[1]]}>
      <mesh position={[0, 2.2, 0]}>
        <torusGeometry args={[1.4, 0.12, 8, 32]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function BasinScene({
  layout,
  sites,
  current,
  basinState,
  emmyAt,
  emmyTalking,
  emmyNear,
  exitOpen,
  walkable,
  game,
  gameKey,
  stateRef,
  frameRef,
  spawnRef,
  playEnabled,
  tool,
  onAction,
  onTrackMove,
  onEnemies,
  onHearts,
  shrinkT,
}) {
  const emmyScript = useMemo(
    () => () => {
      const at = emmyAt.current
      return { pos: [at.x / S, 0, at.z / S], rotY: at.rotY, walk: at.walk || 0, gesture: emmyTalking.current ? 0.75 : 0, talk: emmyTalking.current ? 1 : 0, bow: 0 }
    },
    [emmyAt, emmyTalking],
  )
  const stations = sites.filter((s) => s.stage === 'station')
  return (
    <>
      <BasinSky />
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <Deck key={s.id} site={s} current={false} />
        ))}
      {stations.map((s) => (
        <group key={s.id}>
          <Deck site={s} current={s.id === current} />
          {s.rimRadius && <RimRoad cx={s.pos[0]} cz={s.pos[1]} r={s.rimRadius} current={s.id === current} />}
          {s.id === 'retractor' && (
            <>
              <RetractorEngine cx={s.pos[0]} cz={s.pos[1]} seized={basinState.retractorSeized} strain={shrinkT ?? 0} />
              <ShrinkProof cx={s.pos[0]} cz={s.pos[1]} r={s.rimRadius} t={s.id === current ? shrinkT : null} />
            </>
          )}
          {s.field && (
            <FieldGrid
              site={s}
              field={s.field}
              foundRoots={basinState.foundRoots[s.id] || []}
              stillFound={basinState.stillFound[s.id]}
            />
          )}
          {s.stations && (
            <SphereCap site={s} pickA={basinState.pairPick.a} pickB={basinState.pairPick.b} />
          )}
        </group>
      ))}
      <ExitGate open={exitOpen} gate={layout.exit.gate} />
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {current && sites.find((x) => x.id === current)?.rimRadius && <FieldCompass stateRef={stateRef} site={sites.find((x) => x.id === current)} />}
      <group scale={S}>
        <Emmy script={emmyScript} />
      </group>
      <EmmyBubble emmyAt={emmyAt} show={emmyNear} />

      <ReefGame
        key={gameKey}
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
      <FollowCamera stateRef={stateRef} frameRef={frameRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.58} luminanceSmoothing={0.22} />
        <Vignette offset={0.28} darkness={0.62} />
      </EffectComposer>
    </>
  )
}
