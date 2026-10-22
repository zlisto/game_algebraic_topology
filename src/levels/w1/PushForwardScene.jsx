import { useFrame } from '@react-three/fiber'
import { Html, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useRef } from 'react'
import * as THREE from 'three'
import { CausewaySlab } from '../../world/ReefScenery'
import CommonsIslands from '../../world/Commons'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import Seascape from '../../world/Seascape'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import ReefGame from '../w0/ReefGame'
import { CordProp, SlingProp } from '../w0/worldTools'

const AMBER = '#ffb347'
const GOLD = '#ffd27a'
const VIOLET = '#b070ff'

export function TerraceSky({ bounds }) {
  // in the level the sea and the sky spread out with the (bigger) layout; the movies keep the old frame
  const area = bounds ? [(bounds.minX + bounds.maxX) / 2, (bounds.minZ + bounds.maxZ) / 2, bounds.maxX - bounds.minX + 20, bounds.maxZ - bounds.minZ + 20] : null
  return (
    <>
      <color attach="background" args={['#120818']} />
      <fog attach="fog" args={bounds ? ['#120818', 30, 84] : ['#120818', 28, 72]} />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={['#ffd0a0', '#0a0818', 0.55]} />
      <directionalLight position={[12, 14, -18]} intensity={1.05} color="#ffc49a" />
      <pointLight position={[0, 8, 4]} intensity={12} distance={36} color="#ffb070" />
      <Stars radius={90} depth={40} count={800} factor={2.1} fade speed={0.18} />
      <Sparkles count={90} scale={[50, 5, 50]} position={[0, 2, -4]} size={2} speed={0.25} color="#ffd2a0" />
      <Seascape y={-2.4} depth={2.4} area={area || [0, -4, 70, 64]} seed={15} palette={{ water: '#1a3050', sand: '#4a5058', weed: '#2a3848' }} lanterns={area ? 14 : 10} />
      <Clouds seed={5} area={area || [-20, -24, 40, 40]} count={area ? 20 : 14} y={14} />
      <FloatingRocks seed={8} count={area ? 18 : 12} center={area ? [area[0], 0, area[1]] : [0, 0, -4]} radius={area ? [30, 44] : [14, 22]} />
    </>
  )
}

function Deck({ site, current }) {
  const rim = useRef()
  const sh = site.def.add[0]
  useFrame(({ clock }) => {
    rim.current.material.opacity = current ? 0.65 + Math.sin(clock.elapsedTime * 2.2) * 0.28 : 0.42
  })
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[sh.r, sh.r * 0.94, 0.6, 48]} />
        <meshStandardMaterial color="#2a2420" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <ringGeometry args={[sh.r - 0.08, sh.r, 48]} />
        <meshStandardMaterial color={GOLD} emissive={AMBER} emissiveIntensity={0.9} transparent toneMapped={false} />
      </mesh>
      <Html position={[0, 1.8, 0]} center zIndexRange={[2, 0]} style={{ pointerEvents: 'none' }}>
        <div className="deck-tag">{site.name}</div>
      </Html>
    </group>
  )
}

export function BeltRing({ cx, cz, r, color = GOLD, label, lit = false }) {
  return (
    <group position={[cx, 0, cz]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[r - 0.45, r + 0.45, 64]} />
        <meshStandardMaterial color="#3a3346" roughness={0.8} />
      </mesh>
      {[r - 0.45, r + 0.45].map((rr, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
          <ringGeometry args={[rr - 0.04, rr + 0.04, 64]} />
          <meshBasicMaterial color={color} transparent opacity={lit ? 1 : 0.55} toneMapped={false} />
        </mesh>
      ))}
      {label && (
        <Html position={[0, 0.5, r + 0.9]} center zIndexRange={[3, 0]} style={{ pointerEvents: 'none' }}>
          <div className="floor-tag">{label}</div>
        </Html>
      )}
    </group>
  )
}

/** Retract Check: an annulus — a ring of stone round a sunken pool. Pushing straight out from the pool's centre retracts it onto the rim. */
export function Pool({ r }) {
  const w = useRef()
  useFrame(({ clock }) => (w.current.material.opacity = 0.75 + Math.sin(clock.elapsedTime * 1.5) * 0.08))
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[r, 40]} />
        <meshStandardMaterial color="#04060c" roughness={1} />
      </mesh>
      <mesh ref={w} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[r * 0.92, 40]} />
        <meshStandardMaterial color="#123a6a" emissive="#1a4a8a" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.6), 0.1, Math.sin(a) * (r + 0.6)]} rotation={[-Math.PI / 2, 0, -a]}>
            <coneGeometry args={[0.1, 0.32, 3]} />
            <meshBasicMaterial color="#ff8ad8" transparent opacity={0.6} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Two Roads: the torus as a square plaza with its opposite gates glued — walk out the east gate
 * and you come in at the west; out the north and you come in at the south. Low hedges close the
 * rest of the edge.
 */
export function TorusPlaza({ half, gate }) {
  const walls = []
  const seg = (x0, z0, x1, z1, k) => {
    const len = Math.hypot(x1 - x0, z1 - z0)
    walls.push(
      <mesh key={k} position={[(x0 + x1) / 2, 0.3, (z0 + z1) / 2]} rotation={[0, Math.atan2(-(z1 - z0), x1 - x0), 0]}>
        <boxGeometry args={[len, 0.6, 0.3]} />
        <meshStandardMaterial color="#2f5a3a" roughness={0.9} flatShading />
      </mesh>,
    )
  }
  const g = gate
  const h = half
  ;[
    [-h, -h, -g, -h],
    [g, -h, h, -h],
    [-h, h, -g, h],
    [g, h, h, h],
    [-h, -h, -h, -g],
    [-h, g, -h, h],
    [h, -h, h, -g],
    [h, g, h, h],
  ].forEach(([a, b, c, d], i) => seg(a, b, c, d, i))
  const gates = [
    { p: [h, 0], rot: Math.PI / 2, col: '#ffb347', label: 'a →' },
    { p: [-h, 0], rot: Math.PI / 2, col: '#ffb347', label: '→ a' },
    { p: [0, -h], rot: 0, col: '#7fe8dc', label: 'b ↑' },
    { p: [0, h], rot: 0, col: '#7fe8dc', label: '↑ b' },
  ]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <planeGeometry args={[2 * h, 2 * h]} />
        <meshStandardMaterial color="#3a3346" roughness={0.85} />
      </mesh>
      {walls}
      {gates.map((q, i) => (
        <group key={i} position={[q.p[0], 0, q.p[1]]} rotation={[0, q.rot, 0]}>
          {[-g, g].map((o) => (
            <mesh key={o} position={[o, 0.9, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 1.8, 8]} />
              <meshStandardMaterial color={q.col} emissive={q.col} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 2 * g, 8]} />
            <meshStandardMaterial color={q.col} emissive={q.col} emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <planeGeometry args={[2 * g, 1.7]} />
            <meshBasicMaterial color={q.col} transparent opacity={0.18} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <Html position={[0, 2.25, 0]} center zIndexRange={[3, 0]} style={{ pointerEvents: 'none' }}>
            <div className="floor-tag">{q.label}</div>
          </Html>
        </group>
      ))}
    </group>
  )
}

export function Projector({ at, pos, active, hijacked, readout }) {
  const beam = useRef()
  useFrame(({ clock }) => {
    const u = 0.55 + Math.sin(clock.elapsedTime * 3) * 0.15
    beam.current.scale.y = u
    beam.current.material.opacity = hijacked ? 0.25 : 0.65
  })
  const [x, z] = [at[0] + pos[0], at[1] + pos[1]]
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.7, 8]} />
        <meshStandardMaterial color="#c98a2a" emissive={AMBER} emissiveIntensity={hijacked ? 0.2 : 0.7} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.12, 0.35, 12]} />
        <meshStandardMaterial color="#ffe6a8" emissive={GOLD} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0.8, 1.0, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.12, 0.35, 2.2, 8, 1, true]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={active ? 1.6 : 0.4} transparent opacity={0.65} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 1.55, 0]} center zIndexRange={[3, 0]} style={{ pointerEvents: 'none' }}>
        <div className="lvl15-readout">{hijacked ? 'scrambled' : readout ?? 'projector'}</div>
      </Html>
    </group>
  )
}

function GridLift({ origin, shadow, visible, liftRef }) {
  const dot = useRef()
  useFrame(() => {
    const L = liftRef?.current
    if (!dot.current || !L) return
    dot.current.position.set((L.m + L.u) * 0.9, 0.08, -(L.n + L.v) * 0.9)
  })
  const g = useRef()
  useFrame(() => {
    if (g.current) g.current.visible = visible
  })
  if (!visible) return null
  const [ox, oz] = origin
  const cells = []
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      cells.push([i, j])
    }
  }
  const [mx, mz] = shadow || [0, 0]
  return (
    <group ref={g} position={[ox, 1.4, oz]} rotation={[0.5, 0, 0]}>
      <Html position={[0, 0.3, -2.7]} center zIndexRange={[3, 0]} style={{ pointerEvents: 'none' }}>
        <div className="floor-tag">the lift in ℝ²: ({mx}, {mz})</div>
      </Html>
      {cells.map(([i, j]) => (
        <mesh key={`${i}-${j}`} position={[i * 0.9, 0, -j * 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial color="#304060" emissive="#6080c0" emissiveIntensity={i === mx && j === mz ? 1.2 : 0.15} transparent opacity={0.45} toneMapped={false} />
        </mesh>
      ))}
      <mesh ref={dot} position={[mx * 0.9, 0.08, -mz * 0.9]} scale={0.22}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#88e0ff" emissive="#a8f0ff" emissiveIntensity={2} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Marker({ at, pos, label }) {
  return (
    <group position={[at[0] + pos[0], 0.2, at[1] + pos[1]]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <Html position={[0, 0.65, 0]} center zIndexRange={[2, 0]} style={{ pointerEvents: 'none' }}>
        <div className="lvl15-marker">{label}</div>
      </Html>
    </group>
  )
}

export default function PushForwardScene({
  layout,
  sites,
  current,
  loops,
  hijacked,
  gridShadow,
  showGrid,
  exitOpen,
  walkable,
  game,
  gameKey,
  stateRef,
  camYawRef,
  talkingRef,
  stars,
  portal,
  frameRef,
  spawnRef,
  ribbonApi,
  playEnabled,
  tool,
  onAction,
  onTrackMove,
  onEnemies,
  onHearts,
  emmyRef,
  liftRef,
}) {
  return (
    <>
      <TerraceSky bounds={layout.bounds} />
      <CommonsIslands sites={sites} />
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {sites
        .filter((s) => s.kind !== 'commons')
        .map((s) => (
          <Deck key={s.id} site={s} current={s.id === current} />
        ))}
      {sites
        .filter((s) => s.projector)
        .map((s) => (
          <Projector
            key={s.id}
            at={s.projector.at}
            pos={s.pos}
            active={current === s.id}
            hijacked={hijacked[s.id]}
            readout={loops?.target != null ? `target w=${loops.target}` : undefined}
          />
        ))}
      {sites
        .filter((s) => s.projector)
        .map((s) => (
          <group key={s.id + ':roads'} position={[s.pos[0], 0, s.pos[1]]}>
            <BeltRing {...s.projector.source} color={GOLD} label="gold · source circle" lit={current === s.id} />
            <BeltRing {...s.projector.target} color="#7fe8dc" label="cyan · target circle" lit={current === s.id} />
          </group>
        ))}
      {sites
        .filter((s) => s.ring)
        .map((s) => (
          <group key={s.id} position={[s.pos[0], 0, s.pos[1]]}>
            <BeltRing {...s.ring} label="the rim" lit={current === s.id} />
            {s.inner && <BeltRing {...s.inner} color="#ff8ad8" label="pink · inner road" lit={current === s.id} />}
            {s.pool && <Pool r={s.pool} />}
          </group>
        ))}
      {sites
        .filter((s) => s.plaza)
        .map((s) => (
          <group key={s.id} position={[s.pos[0], 0, s.pos[1]]}>
            <TorusPlaza {...s.plaza} />
          </group>
        ))}
      {sites
        .filter((s) => s.tube)
        .map((s) => (
          <group key={s.id} position={[s.pos[0], 0, s.pos[1]]}>
            <BeltRing {...s.tube} r={s.tube.r} color={GOLD} label="gold · first factor" lit={current === s.id} />
            {s.hole && <BeltRing {...s.hole} color="#7fe8dc" label="cyan · second factor" lit={current === s.id} />}
          </group>
        ))}
      <GridLift origin={sites.find((s) => s.id === 'two_roads')?.gridOrigin || [12, -9.5]} shadow={gridShadow} visible={showGrid} liftRef={liftRef} />
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {exitOpen && (
        <mesh position={[layout.exit.gate[0], 0.5, layout.exit.gate[1]]}>
          <torusGeometry args={[1.1, 0.08, 8, 32, Math.PI]} />
          <meshStandardMaterial color={GOLD} emissive={AMBER} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      )}
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} talkingRef={talkingRef} frameRef={frameRef} walkable={walkable} stars={stars} portal={portal} exitFrom={layout.exit.a} follower emmyRef={emmyRef} />
      <DevAdvance />
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        purge={!!portal?.open}
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        tool={tool}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={ribbonApi}
        onAction={onAction}
        onTrackMove={onTrackMove}
        onEnemies={onEnemies}
        onHearts={onHearts}
      />
      <CordProp state={stateRef} tool={tool} />
      <SlingProp state={stateRef} tool={tool} />
    </>
  )
}
