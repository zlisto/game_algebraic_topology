import { useFrame } from '@react-three/fiber'
import { Html, Line, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Emmy from '../../characters/Emmy'
import { CausewaySlab } from '../../world/ReefScenery'
import { DevAdvance, FollowCamera } from '../w0/OverworldScene'
import ReefGame from '../w0/ReefGame'
import { EmmyBubble } from '../w0/FoundryScene'
import { LiveLine, Post } from '../w0/FlatsScenery'
import { linearHomotopy } from './routes'
import Seascape from '../../world/Seascape'

/** How each route is named on the deck (the ledger's ids are terse). */
export const ROUTE_LABEL = {
  straight: 'straight',
  wavy: 'wavy',
  bow: 'bow',
  slow: 'slow',
  fast: 'fast',
  AC_left: 'A→C upper',
  AC_right: 'A→C lower',
  'AB_left·BC_left': 'A→B→C upper',
  'AB_right·BC_right': 'A→B→C lower',
}
export const BIN_COLORS = ['#ffb347', '#c58bff', '#7fe8dc']

/** A route drawn smooth: the ledger stores a few control points; draw the curve through them. */
export function smoothRoute(pts, n = 64) {
  if (!pts || pts.length < 3) return pts || []
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal')
  return curve.getPoints(n).map((v) => [v.x, v.z])
}

/** The point of a route farthest from the line between its gates: where its label sits. */
function labelSpot(pts) {
  const a = pts[0]
  const b = pts[pts.length - 1]
  let best = pts[Math.floor(pts.length / 2)]
  let bd = -1
  const dx = b[0] - a[0]
  const dz = b[1] - a[1]
  const l = Math.hypot(dx, dz) || 1
  for (const p of pts) {
    const d = Math.abs((p[0] - a[0]) * dz - (p[1] - a[1]) * dx) / l
    if (d > bd) (bd = d), (best = p)
  }
  return best
}

/** Garden dressing round a deck's rim: clipped topiary and lamp posts, kept clear of the routes (which run near the gate axis). */
function GardenDressing({ r, rect }) {
  const spots = useMemo(() => {
    const out = []
    if (rect) {
      for (const x of [-5, -2.5, 0, 2.5, 5]) for (const z of [-4, 4]) out.push([x, z, (x + z) % 2 === 0])
      return out
    }
    for (const a of [1.15, 1.6, 2.0, 4.3, 4.75, 5.15]) out.push([Math.cos(a) * (r - 0.55), Math.sin(a) * (r - 0.55), a > 3 ? a < 4.6 : a < 1.4])
    return out
  }, [r, rect])
  return (
    <>
      {spots.map(([x, z, lamp], i) =>
        lamp ? (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 1.4, 8]} />
              <meshStandardMaterial color="#3a3a44" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.15, 12, 10]} />
              <meshStandardMaterial color="#ffe6b0" emissive="#ffc070" emissiveIntensity={1.8} toneMapped={false} />
            </mesh>
          </group>
        ) : (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.28, 0.32, 0.36, 10]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <sphereGeometry args={[0.42, 14, 10]} />
              <meshStandardMaterial color="#2f5a3a" roughness={0.9} flatShading />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[Math.cos(k * 2.1) * 0.3, 0.85, Math.sin(k * 2.1) * 0.3]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <meshStandardMaterial color={['#ff8ab0', '#ffe08a', '#c58bff'][k]} emissive={['#ff8ab0', '#ffe08a', '#c58bff'][k]} emissiveIntensity={0.6} />
              </mesh>
            ))}
          </group>
        ),
      )}
    </>
  )
}

const S = 0.7
const STONE = '#5a6678'
const HEDGE = '#1a3028'
const GOLD = '#ffb347'
const GATE = '#c9a84a'

export function GardensSky() {
  return (
    <>
      <color attach="background" args={['#0e1424']} />
      <fog attach="fog" args={['#0e1424', 28, 72]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a8c8ff', '#0a0a14', 0.55]} />
      <directionalLight position={[12, 18, -8]} intensity={0.9} color="#c8d8ff" />
      <pointLight position={[-8, 5, 6]} intensity={8} distance={28} color="#ffd2a0" />
      <Stars radius={80} depth={35} count={700} factor={2} fade speed={0.15} />
      <Sparkles count={80} scale={[50, 3, 50]} position={[0, 2, 0]} size={1.8} speed={0.2} color="#ffe6a8" />
    </>
  )
}

export function Gatehouse({ pos, rot = 0 }) {
  return (
    <group position={[pos[0], 0, pos[1]]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.4, 1.8, 1.1]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.6, 0.35, 1.3]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0.58]}>
        <boxGeometry args={[0.55, 1.1, 0.08]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>
      <mesh position={[0.45, 2.35, 0.5]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={GATE} emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <pointLight position={[0.45, 2.35, 0.6]} intensity={4} distance={5} color="#ffb070" />
    </group>
  )
}

export function HedgeBed({ c, r }) {
  return (
    <group position={[c[0], 0, c[1]]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[r, r * 1.05, 1.1, 24]} />
        <meshStandardMaterial color={HEDGE} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[r * 0.92, r, 0.35, 20]} />
        <meshStandardMaterial color="#243830" roughness={0.9} />
      </mesh>
    </group>
  )
}

const TIDE = '#3ecfbf' // Gyroid teal — contrast against gold route threads

// route points are deck-local [x, z]; the deck's group is already at the site's position
function RouteThread({ pts, color = GOLD, opacity = 1, dashed = false, y = 0.22, width = 2.4, smooth = true }) {
  const linePts = useMemo(() => (smooth ? smoothRoute(pts) : pts).map(([x, z]) => [x, y, z]), [pts, y, smooth])
  return (
    <Line points={linePts} color={color} lineWidth={dashed ? width * 0.55 : width} transparent opacity={opacity} dashed={dashed} dashSize={0.35} gapSize={0.22} />
  )
}

/** Tide Glass ghost: thick teal tube sitting above the flat gold paths so scrubbing is obvious. */
function GhostHomotopy({ a, b, t }) {
  const pts = useMemo(() => linearHomotopy(a, b, t), [a, b, t])
  const geom = useMemo(() => {
    if (!pts?.length) return null
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.48, z)))
    return new THREE.TubeGeometry(curve, Math.max(24, pts.length * 8), 0.09, 10, false)
  }, [pts])
  useEffect(() => () => geom?.dispose(), [geom])
  if (!geom) return null
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color={TIDE} emissive={TIDE} emissiveIntensity={1.6} roughness={0.35} metalness={0.15} toneMapped={false} />
      </mesh>
      <RouteThread pts={pts} color="#b8fff4" opacity={0.95} y={0.58} width={4.2} />
    </group>
  )
}

function GardenDeck({ site, current, ledger, glassT, slidePair, routes, selected, labels }) {
  const [px, pz] = site.pos
  const gates = site.gates
  const showRoutes = routes || site.routes || {}
  const sh = site.def.add[0]
  const deckR = sh.r || 5
  return (
    <group position={[px, 0, pz]}>
      {sh.type === 'rect' ? (
        <mesh position={[(sh.x0 + sh.x1) / 2, -0.28, (sh.z0 + sh.z1) / 2]}>
          <boxGeometry args={[sh.x1 - sh.x0, 0.6, sh.z1 - sh.z0]} />
          <meshStandardMaterial color="#4a5568" roughness={0.88} />
        </mesh>
      ) : (
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[deckR, deckR * 0.94, 0.6, 48]} />
          <meshStandardMaterial color="#4a5568" roughness={0.88} />
        </mesh>
      )}
      <GardenDressing r={deckR} rect={sh.type === 'rect'} />
      {sh.type !== 'rect' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[deckR - 0.15, deckR, 64]} />
          <meshStandardMaterial color={current ? GOLD : '#6a7896'} emissive={current ? '#ffb347' : '#000'} emissiveIntensity={current ? 0.35 : 0} transparent opacity={0.85} />
        </mesh>
      )}
      {(site.hedges || []).map((h, i) => (
        <HedgeBed key={i} c={h.c} r={h.r} />
      ))}
      {gates && (
        <>
          <Gatehouse pos={gates.a} rot={Math.PI / 2} />
          <Gatehouse pos={gates.b} rot={-Math.PI / 2} />
          <Post pos={gates.a} />
          <Post pos={gates.b} />
        </>
      )}
      {gates?.c && <Gatehouse pos={gates.c} rot={0} />}
      {Object.entries(showRoutes).map(([id, pts], ri) => {
        const cls = ledger?.[id]
        // unsorted routes are pale; sorted ones take their bin's colour; the picked one glows white
        const picked = selected === id
        const col = picked ? '#ffffff' : cls != null ? BIN_COLORS[cls] : '#b89a62'
        const inPair = slidePair?.includes(id)
        // While scrubbing, dim the paths so the teal tide tube reads clearly
        const opacity = slidePair ? (inPair ? 0.55 : 0.22) : picked ? 1 : 0.85
        // stagger the tags along each route so routes that peak together don't stack their names
        const sm = smoothRoute(pts)
        const spot = Object.keys(showRoutes).length > 2 ? sm[Math.round((sm.length - 1) * [0.3, 0.5, 0.7][ri % 3])] : labelSpot(sm)
        return (
          <group key={id}>
            <RouteThread pts={pts} color={col} opacity={opacity} dashed={id.includes('fast')} width={picked ? 5 : 2.8} />
            {picked && <RouteThread pts={pts} color="#ffffff" opacity={0.25} width={12} />}
            {(labels || inPair) && (
              <Html position={[spot[0], 0.5, spot[1]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
                <div className={`route-tag${picked ? ' picked' : ''}`} style={{ borderColor: col, color: picked ? '#1a1206' : col, background: picked ? '#ffffff' : 'rgba(12,16,26,0.85)' }}>
                  {ROUTE_LABEL[id] || id}
                  {cls != null ? ` · ${cls === 0 ? 'I' : cls === 1 ? 'II' : 'III'}` : ''}
                </div>
              </Html>
            )}
          </group>
        )
      })}
      {slidePair?.length === 2 && showRoutes[slidePair[0]] && showRoutes[slidePair[1]] && (
        <GhostHomotopy a={showRoutes[slidePair[0]]} b={showRoutes[slidePair[1]]} t={glassT} />
      )}
      {site.id === current && (
        <Html position={[0, 3.2, 0]} center className="deck-label" style={{ pointerEvents: 'none' }}>
          {site.name}
        </Html>
      )}
    </group>
  )
}

const ZERO_T = { current: 0 }

/** The Garden Gate: a plain stone disc where the player arrives (no puzzle on it). */
function LandingPad({ site }) {
  const r = site.def?.add?.[0]?.r ?? 2
  return (
    <group position={[site.pos[0], 0, site.pos[1]]}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[r, r, 0.24, 40]} />
        <meshStandardMaterial color="#5e6a80" roughness={0.7} metalness={0.1} emissive="#1c2230" emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[r * 0.55, r * 0.62, 40]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function EndpointGardensScene({
  layout,
  sites,
  walkable,
  current,
  frameRef,
  checkpoint,
  gameKey,
  enemies,
  spawnRef,
  stateRef,
  emmyAt,
  emmyTalking,
  nearEmmy,
  playEnabled,
  tool,
  onAction,
  ribbonApi,
  onEnemies,
  onHearts,
  ledger,
  glassT,
  slidePair,
  routeOverrides,
  selectedRoute,
  showLabels,
  onSpoolClick,
}) {
  const emmyRef = useRef()
  const game = useMemo(() => ({ mode: 'overworld', bySite: true, start: checkpoint, enemies }), [checkpoint, enemies])
  useFrame(() => {
    const e = emmyAt.current
    if (!emmyRef.current || !e) return
    emmyRef.current.position.set(e.x, 0, e.z)
    emmyRef.current.rotation.y = e.rotY ?? 0
  })
  return (
    <>
      <GardensSky />
      <Seascape y={-0.9} depth={2.2} area={[0, -2, 64, 64]} seed={101} palette={{ water: '#123a52', sand: '#3a5a52', weed: '#22503a' }} lanterns={10} />
      {layout.causeways.map((c, i) => (
        <CausewaySlab key={i} a={c.a} b={c.b} width={layout.causewayWidth} tint="#6a7588" />
      ))}
      {sites.map((s) =>
        s.stage === 'station' ? (
          <GardenDeck
            key={s.id}
            site={s}
            current={s.id === current}
            ledger={ledger[s.id]}
            glassT={glassT}
            slidePair={s.id === current ? slidePair : null}
            routes={routeOverrides?.[s.id]}
            selected={s.id === current ? selectedRoute : null}
            labels={s.id === current && showLabels}
          />
        ) : (
          <LandingPad key={s.id} site={s} />
        ),
      )}
      <FollowCamera stateRef={stateRef} frameRef={frameRef} checkpoint={checkpoint} />
      <ReefGame
        key={gameKey}
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled
        tool={tool}
        sim={null}
        tRef={ZERO_T}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={ribbonApi}
        onAction={onAction}
        onStrokeStart={(x, z, cx, cz) => (onSpoolClick?.(cx, cz), false)}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <group ref={emmyRef}>
        <Emmy scale={S} script={() => ({ pos: [0, 0, 0], rotY: 0, walk: emmyAt.current.walk, gesture: emmyTalking.current ? 0.8 : 0, talk: emmyTalking.current ? 1 : 0, bow: 0 })} />
      </group>
      {/* Always mounted (like World 0) — mounting only when near used to crash (missing emmyAt). */}
      <EmmyBubble emmyAt={emmyAt} show={nearEmmy && playEnabled} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.35} intensity={0.85} mipmapBlur />
        <Vignette eskil offset={0.12} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
