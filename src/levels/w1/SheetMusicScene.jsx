import { Html, Line, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Seascape from '../../world/Seascape'
import { CausewaySlab } from '../../world/ReefScenery'
import CommonsIslands from '../../world/Commons'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import ReefGame from '../w0/ReefGame'
import { coverThreeSheetConj, coverTwoSheetAA, letterText } from './covers.js'

// a tower that isn't being worked on shows its finished cover
const towerDone = { to_order: coverTwoSheetAA(), moving_start: coverThreeSheetConj() }

const GLASS = '#a8e0ff'
const GOLD = '#ffb347'

export function StacksSky() {
  return (
    <>
      <color attach="background" args={['#0a1428']} />
      <fog attach="fog" args={['#0a1428', 28, 72]} />
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#c8e8ff', '#080818', 0.55]} />
      <directionalLight position={[12, 18, -8]} intensity={1.05} color="#d0f0ff" />
      <pointLight position={[0, 8, 4]} intensity={12} distance={36} color="#88ccff" />
      <Stars radius={80} depth={36} count={1100} factor={2} fade speed={0.15} />
      <Sparkles count={90} scale={[50, 6, 50]} position={[0, 2, -4]} size={2.2} speed={0.25} color="#ffe6a8" />
      <Seascape y={-2.4} depth={2.4} area={[2, 4, 100, 104]} seed={19} palette={{ water: '#1a3050', sand: '#3a4a58', weed: '#2a4858' }} lanterns={16} />
      <Clouds y={15} area={[2, 4, 96, 100]} count={14} seed={19} color="#b8d8ff" opacity={0.25} />
      <FloatingRocks center={[2, 0, 4]} radius={[36, 48]} count={12} seed={9} glow="#88ccff" />
    </>
  )
}

function GlassDeck({ site, current, done, children }) {
  const rim = useRef()
  const pulse = current && !done
  useFrame(({ clock }) => {
    if (!rim.current) return
    rim.current.material.emissiveIntensity = pulse ? 0.9 + Math.sin(clock.elapsedTime * 3) * 0.35 : done ? 0.35 : 0.15
  })
  const [x, z] = site.pos
  const r = site.def?.add?.[0]?.r || 5
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[r, 32]} />
        <meshStandardMaterial color="#2a3548" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh ref={rim} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[r - 0.15, r + 0.08, 48]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.2} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <circleGeometry args={[r * 0.92, 32]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.22} emissive="#4488cc" emissiveIntensity={0.25} />
      </mesh>
      {children}
    </group>
  )
}

/**
 * A small HTML tag in the scene that hides itself when it's behind the camera or far away, so
 * it never pins itself to the screen edge over the HUD.
 */
/** Calls onReady once the scene has drawn a few frames, so the opening never plays over black. */
function FirstFrames({ onReady, after = 3 }) {
  const n = useRef(0)
  useFrame(() => {
    n.current += 1
    if (n.current === after) onReady()
  })
  return null
}

const _v = new THREE.Vector3()
export function NearLabel({ position, maxDist = 14, style, children }) {
  const g = useRef()
  const el = useRef()
  useFrame(({ camera }) => {
    if (!g.current || !el.current) return
    g.current.getWorldPosition(_v)
    const d = _v.distanceTo(camera.position)
    _v.project(camera)
    const show = d < maxDist && _v.z < 1 && Math.abs(_v.x) < 0.92 && Math.abs(_v.y) < 0.8
    el.current.style.display = show ? '' : 'none'
  })
  return (
    <group ref={g} position={position}>
      <Html center zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={el} style={{ display: 'none', font: '700 12px system-ui', padding: '1px 6px', borderRadius: 6, whiteSpace: 'nowrap', ...style }}>
          {children}
        </div>
      </Html>
    </group>
  )
}

/**
 * The cover as a tower of glass sheets over the figure-eight on the deck floor (Hatcher's
 * pictures of covers of S¹ ∨ S¹, p. 58). Each sheet has its own copy of the basepoint; every
 * lifted edge leaves the basepoint on one sheet, runs round its loop, and lands on the sheet the
 * glue sends it to — so an edge that swaps sheets climbs (or drops) as it goes round. The gold
 * cone marks the start sheet. Ports (to_order) are where the Clasp re-glues a letter.
 */
const EDGE_COL = { a: '#ff7a4a', b: '#a080ff' }
const LOOP = { a: { c: [1.7, 0.4], th0: Math.PI, dir: 1 }, b: { c: [-1.7, 0.4], th0: 0, dir: -1 } }
const LOOP_R = 1.7
const sheetY = (i) => 1.25 + i * 1.15
const smooth = (t) => t * t * (3 - 2 * t)
function edgePath(L, yFrom, yTo, n = 44) {
  const { c, th0, dir } = LOOP[L]
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n
    const th = th0 + dir * Math.PI * 2 * t
    return [c[0] + LOOP_R * Math.cos(th), yFrom + (yTo - yFrom) * smooth(t), c[1] + LOOP_R * Math.sin(th)]
  })
}

function SheetTower({ cover, base, ports, labels = true }) {
  if (!cover) return null
  const n = cover.n
  const top = sheetY(n - 1)
  return (
    <group>
      {/* downstairs: the figure-eight itself, gold on the deck floor */}
      {['a', 'b'].map((L) => (
        <Line key={L} points={edgePath(L, 0.17, 0.17)} color={GOLD} lineWidth={3} toneMapped={false} />
      ))}
      <mesh position={[0, 0.2, 0.4]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      {/* the fiber over the basepoint: one copy of it on every sheet */}
      <Line points={[[0, 0.2, 0.4], [0, top + 0.4, 0.4]]} color="#fff2c4" lineWidth={1} dashed dashSize={0.15} gapSize={0.12} transparent opacity={0.7} toneMapped={false} />
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, sheetY(i), 0.4]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.9, 48]} />
            <meshStandardMaterial color={GLASS} transparent opacity={i === base ? 0.16 : 0.08} depthWrite={false} emissive="#4488cc" emissiveIntensity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.9, 0.035, 6, 64]} />
            <meshBasicMaterial color={i === base ? GOLD : '#a8e0ff'} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.14, 12, 10]} />
            <meshBasicMaterial color={i === base ? GOLD : '#dff2ff'} toneMapped={false} />
          </mesh>
          {i === base && (
            <mesh position={[0, 0.34, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.14, 0.32, 10]} />
              <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={2} toneMapped={false} />
            </mesh>
          )}
          {labels && (
            <NearLabel position={[-4.2, 0, 0]} style={{ color: i === base ? '#1a1200' : '#dff2ff', background: i === base ? GOLD : 'rgba(20,40,70,0.75)' }}>
              sheet {i + 1}
              {i === base ? ' · start' : ''}
            </NearLabel>
          )}
        </group>
      ))}
      {/* upstairs: every lifted edge, climbing to the sheet its glue sends it to */}
      {Array.from({ length: n }, (_, v) =>
        ['a', 'b'].map((L) => {
          const w = cover.adj[v][L]
          return <Line key={`${v}${L}`} points={edgePath(L, sheetY(v), sheetY(w))} color={EDGE_COL[L]} lineWidth={w === v ? 2.5 : 3.5} toneMapped={false} />
        }),
      )}
      {(ports || []).map(([px, pz, L]) => (
        <group key={L} position={[px, 0, pz]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.45, 0.55, 0.7, 20]} />
            <meshStandardMaterial color="#2a3548" emissive={EDGE_COL[L]} emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <octahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial color={EDGE_COL[L]} emissive={EDGE_COL[L]} emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
          <NearLabel position={[0, 1.45, 0]} style={{ font: '800 13px system-ui', color: '#0b1220', background: EDGE_COL[L] }}>
            {L}-port: {cover.adj[0][L] === 0 ? 'stays' : 'swaps'}
          </NearLabel>
        </group>
      ))}
    </group>
  )
}

function TreeViaduct({ treeWord, targets, treeHits }) {
  const branches = useMemo(
    () => [
      { letter: 'a', from: [0, 0], to: [3.5, -1.2], color: '#e04040' },
      { letter: 'A', from: [0, 0], to: [-3.5, -1.2], color: '#ff6688' },
      { letter: 'b', from: [0, 0], to: [0.8, 3.8], color: '#8060d0' },
      { letter: 'B', from: [0, 0], to: [-0.8, 3.8], color: '#b090ff' },
    ],
    [],
  )
  const wStr = treeWord?.map((L) => (L === 'A' ? 'A' : L === 'B' ? 'B' : L)).join('') || ''
  return (
    <group position={[0, 0.15, 0]}>
      {branches.map((b) => (
        <group key={b.letter}>
          <Line points={[[b.from[0], 0.2, b.from[1]], [b.to[0], 0.35, b.to[1]]]} color={b.color} lineWidth={2.5} toneMapped={false} />
          <mesh position={[b.to[0], 0.4, b.to[1]]}>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={targets?.includes(wStr) || treeHits?.[wStr] ? 1.8 : 0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <Html position={[0, 1.2, -4]} center className="sheet-label">
        <span>{treeWord?.length ? treeWord.map((L) => letterText(L)).join(' ') : 'origin'}</span>
      </Html>
    </group>
  )
}

function TorusGrid({ site, highlight }) {
  const [tx, tz] = site.pos
  const cells = []
  for (let m = -2; m <= 2; m++) for (let n = -2; n <= 2; n++) cells.push([m, n])
  return (
    <group position={[tx, 1.2, tz - 2]}>
      {cells.map(([m, n]) => {
        const hit = highlight && highlight[0] === m && highlight[1] === n
        return (
          <mesh key={`${m},${n}`} position={[m * 1.1, 0, n * 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshStandardMaterial color={hit ? GOLD : GLASS} transparent opacity={hit ? 0.85 : 0.25} emissive={hit ? GOLD : '#4488aa'} emissiveIntensity={hit ? 1.5 : 0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function SheetMusicScene({
  layout,
  sites,
  current,
  done,
  cover,
  base,
  treeWord,
  treeTargets,
  treeHits,
  torusHighlight,
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
  onEnemies,
  onHearts,
  emmyRef,
  onDeck,
  onFirstFrames,
  camYawRef,
  talkingRef,
  stars,
  portal,
}) {
  return (
    <>
      <StacksSky />
      {onFirstFrames && <FirstFrames onReady={onFirstFrames} />}
      <CommonsIslands sites={sites} />
      {sites
        .filter((s) => s.kind === 'start')
        .map((s) => (
          <mesh key={s.id} position={[s.pos[0], -0.2, s.pos[1]]}>
            <cylinderGeometry args={[s.def.add[0].r, s.def.add[0].r * 0.92, 0.35, 32]} />
            <meshStandardMaterial color="#2a3548" roughness={0.85} />
          </mesh>
        ))}
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} />
      ))}
      {exitOpen && <CausewaySlab a={layout.exit.a} b={layout.exit.b} width={layout.causewayWidth} />}
      {sites
        .filter((s) => s.stage)
        .map((s) => (
          <GlassDeck key={s.id} site={s} current={current === s.id} done={done[s.id]}>
            {s.id === 'to_order' && <SheetTower cover={current === 'to_order' ? cover : towerDone.to_order} base={current === 'to_order' ? base : 0} ports={current === 'to_order' && onDeck === 'to_order' ? s.cover.ports : null} labels={current === 'to_order' && onDeck === 'to_order'} />}
            {s.id === 'moving_start' && <SheetTower cover={current === 'moving_start' ? cover : towerDone.moving_start} base={current === 'moving_start' ? base : 0} labels={current === 'moving_start' && onDeck === 'moving_start'} />}
            {s.id === 'endless_tree' && <TreeViaduct treeWord={treeWord} targets={treeTargets} treeHits={treeHits} />}
            {s.id === 'plane_torus' && <TorusGrid site={{ pos: [0, 0] }} highlight={torusHighlight} />}
          </GlassDeck>
        ))}
      {exitOpen && (
        <mesh position={[layout.exit.gate[0], 0.5, layout.exit.gate[1]]}>
          <torusGeometry args={[1.4, 0.12, 12, 32]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.2} toneMapped={false} />
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
        stateRef={stateRef}
        spawnRef={spawnRef}
        onAction={onAction}
        onEnemies={onEnemies}
        onHearts={onHearts}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} talkingRef={talkingRef} frameRef={frameRef} walkable={walkable} stars={stars} portal={portal} exitFrom={layout.exit.a} follower emmyRef={emmyRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={0.85} />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
