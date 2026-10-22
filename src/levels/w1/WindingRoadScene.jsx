import { useFrame } from '@react-three/fiber'
import { Html, Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CausewaySlab } from '../../world/ReefScenery'
import Seascape from '../../world/Seascape'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import { DevAdvance } from '../w0/OverworldScene'
import OverworldKit from '../w0/OverworldKit'
import { LiveLine } from '../w0/FlatsScenery'
import ReefGame from '../w0/ReefGame'
import CommonsIslands from '../../world/Commons'

/**
 * World 1 · Level 3 "Winding Road". Each deck is a circle S¹ (the ring road) with the helix ℝ
 * standing over its middle. As Gyroid runs the ring, a teal shadow climbs the helix at the
 * same angle: that's the lift of the path. The floor where the shadow ends is the winding number.
 *
 * Orientation: +1 is counter-clockwise as seen from above (on screen). In world (x, z) with
 * the camera looking north (−z), that is the angle θ = atan2(−(z − cz), x − cx).
 */

const S = 0.7
const TAU = Math.PI * 2
export const HELIX_R = 1.15
export const HELIX_PITCH = 0.95
export const HELIX_TURNS = 3 // the helix runs from floor −3 to floor +3
export const HELIX_BASE = 0.45 + HELIX_TURNS * HELIX_PITCH // height of floor 0
/** A point at angle θ (screen-counter-clockwise) and radius r around a centre. */
export const onCircle = (c, r, th) => [c[0] + r * Math.cos(th), c[1] - r * Math.sin(th)]
/** Height on the helix for an unwrapped angle U (U = 2π·n is floor n). */
export const liftHeight = (U) => HELIX_BASE + (HELIX_PITCH * U) / TAU

/** The Tide Glass deformation of the banked lap: wiggles in angle and radius, ends fixed. */
export function deformedLoop(t, n = 96) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const s = i / n
    out.push({ th: TAU * s + 0.85 * t * Math.sin(2 * TAU * s), dr: 0.55 * t * Math.sin(3 * TAU * s) })
  }
  return out
}

function RingRoad({ ring, current }) {
  const rim = useRef()
  useFrame(({ clock }) => {
    if (rim.current) rim.current.material.opacity = current ? 0.75 + Math.sin(clock.elapsedTime * 2.2) * 0.2 : 0.45
  })
  // chevrons pointing the +1 way (counter-clockwise on screen)
  const chevrons = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const th = (i / 10) * TAU + 0.15
        const [x, z] = onCircle([ring.cx, ring.cz], ring.r, th)
        return { x, z, rot: Math.atan2(-Math.sin(th), -Math.cos(th)) }
      }),
    [ring],
  )
  const [sx, sz] = onCircle([ring.cx, ring.cz], ring.r, 0)
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ring.cx, 0.03, ring.cz]}>
        <ringGeometry args={[ring.inner, ring.outer, 72]} />
        <meshStandardMaterial color="#3a3346" roughness={0.8} />
      </mesh>
      {[ring.inner, ring.outer].map((r, i) => (
        <mesh key={i} ref={i ? rim : undefined} rotation={[-Math.PI / 2, 0, 0]} position={[ring.cx, 0.05, ring.cz]}>
          <ringGeometry args={[r - 0.05, r + 0.05, 72]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
      {chevrons.map((c, i) => (
        <mesh key={i} position={[c.x, 0.08, c.z]} rotation={[-Math.PI / 2, 0, c.rot]}>
          <coneGeometry args={[0.22, 0.42, 3]} />
          <meshBasicMaterial color="#ffcf6a" transparent opacity={current ? 0.85 : 0.35} toneMapped={false} />
        </mesh>
      ))}
      {/* the start line: angle 0, where the helix's floors sit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.07, sz]}>
        <planeGeometry args={[ring.outer - ring.inner, 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** The helix ℝ over the circle, with its integer floors, Gyroid's lifted shadow and the slide's lift. */
function Helix({ ring, liftRef, homotopyT, current }) {
  const c = [ring.cx, ring.cz]
  const tube = useMemo(() => {
    const pts = []
    const N = HELIX_TURNS * 2 * 48
    for (let i = 0; i <= N; i++) {
      const U = -HELIX_TURNS * TAU + (i / N) * HELIX_TURNS * 2 * TAU
      const [x, z] = onCircle(c, HELIX_R, U)
      pts.push(new THREE.Vector3(x, liftHeight(U), z))
    }
    return new THREE.CatmullRomCurve3(pts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ring])
  const shadow = useRef()
  const trail = useRef([])
  useFrame(() => {
    const L = liftRef?.current
    const on = current && L && L.U != null
    shadow.current.visible = !!on
    if (!on) {
      trail.current = []
      return
    }
    const [x, z] = onCircle(c, HELIX_R, L.U)
    shadow.current.position.set(x, liftHeight(L.U), z)
    const last = trail.current[trail.current.length - 1]
    if (!last || Math.abs(last[3] - L.U) > 0.05) trail.current.push([x, z, liftHeight(L.U), L.U])
    if (L.U0 != null && trail.current.length && Math.abs(trail.current[0][3] - L.U0) > 0.06) trail.current = []
    if (trail.current.length > 400) trail.current.shift()
  })
  const lifted = () => {
    if (!current || homotopyT == null) return null
    return deformedLoop(homotopyT).map(({ th, dr }) => {
      const [x, z] = onCircle(c, HELIX_R + dr * 0.45, th)
      return [x, z, liftHeight(th)]
    })
  }
  const end = homotopyT != null && current ? onCircle(c, HELIX_R, TAU) : null
  return (
    <group>
      <mesh>
        <tubeGeometry args={[tube, 260, 0.07, 8, false]} />
        <meshStandardMaterial color="#6a5a90" emissive="#8060d0" emissiveIntensity={current ? 0.55 : 0.2} roughness={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[c[0], liftHeight(0) - 0.2, c[1]]}>
        <cylinderGeometry args={[0.1, 0.1, HELIX_TURNS * 2 * HELIX_PITCH + 0.6, 8]} />
        <meshStandardMaterial color="#2a2838" roughness={0.9} />
      </mesh>
      {Array.from({ length: HELIX_TURNS * 2 + 1 }, (_, i) => {
        const n = i - HELIX_TURNS
        const [x, z] = onCircle(c, HELIX_R, 0)
        return (
          <group key={n} position={[x, liftHeight(n * TAU), z]}>
            <mesh>
              <sphereGeometry args={[n === 0 ? 0.13 : 0.1, 10, 8]} />
              <meshBasicMaterial color={n === 0 ? '#ffffff' : '#ffcf6a'} toneMapped={false} />
            </mesh>
            {current && Math.abs(n) <= 3 && (
              <Html position={[0.42, 0, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
                <div className="floor-tag">{n > 0 ? `+${n}` : n === 0 ? '0' : `−${-n}`}</div>
              </Html>
            )}
          </group>
        )
      })}
      <mesh ref={shadow}>
        <sphereGeometry args={[0.2, 14, 10]} />
        <meshBasicMaterial color="#5ee0d8" toneMapped={false} />
      </mesh>
      <LiveLine getPts={() => (current ? trail.current.map(([x, z, y]) => [x, z, y]) : null)} color="#5ee0d8" width={4} y={0} />
      <LiveLine getPts={lifted} color="#5ee0d8" width={5} y={0} />
      {end && (
        <mesh position={[end[0], liftHeight(TAU), end[1]]}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

/** The Tide Glass's deformed loop, drawn on the ring road. */
function DeformedRoad({ ring, homotopyT }) {
  const pts = () => {
    if (homotopyT == null) return null
    return deformedLoop(homotopyT).map(({ th, dr }) => {
      const [x, z] = onCircle([ring.cx, ring.cz], ring.r + dr, th)
      return [x, z, 0.16]
    })
  }
  return <LiveLine getPts={pts} color="#5ee0d8" width={5} />
}

function WinderPillar({ x, z, turns }) {
  const coil = useRef()
  useFrame(({ clock }) => {
    if (coil.current) coil.current.rotation.y = clock.elapsedTime * (turns >= 0 ? 0.8 : -0.8)
  })
  const n = Math.abs(turns)
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 1.8, 10]} />
        <meshStandardMaterial color="#1c1a22" roughness={0.9} />
      </mesh>
      <group ref={coil} position={[0, 0.5, 0]}>
        {Array.from({ length: n }, (_, i) => (
          <mesh key={i} position={[0, 0.3 * i, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.05, 8, 24]} />
            <meshStandardMaterial color="#6040a0" emissive="#9060ff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <Html position={[0, 2.3, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`floor-tag ${n ? 'held' : 'free'}`}>{n ? `holds ${turns > 0 ? '+' : '−'}${n}` : 'unwound — lash!'}</div>
      </Html>
    </group>
  )
}

function WindingGate({ x, z, n, open, active }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.2, 0]}>
        <torusGeometry args={[0.75, 0.08, 8, 32]} />
        <meshStandardMaterial color={open ? '#ffcf6a' : '#6040a0'} emissive={open ? '#ffb347' : '#8060d0'} emissiveIntensity={open ? 1.6 : active ? 1.1 : 0.4} toneMapped={false} />
      </mesh>
      <Html center position={[0, 2.25, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`floor-tag ${open ? 'free' : active ? 'held' : ''}`}>{n > 0 ? `+${n}` : `−${-n}`}</div>
      </Html>
    </group>
  )
}

export default function WindingRoadScene({
  layout,
  sites,
  walkable,
  current,
  exitOpen,
  homotopyT,
  winders,
  gatesOpen,
  gateGoal,
  frameRef,
  gameKey,
  stage,
  tool,
  tRef,
  sim,
  stateRef,
  spawnRef,
  onTrackMove,
  onEnemies,
  onHearts,
  emmyRef,
  liftRef,
  playEnabled,
  camYawRef,
  talkingRef,
  camLockRef,
  stars,
  portal,
}) {
  const b = layout.bounds
  const cz = (b.minZ + b.maxZ) / 2
  const w = b.maxX - b.minX
  const d = b.maxZ - b.minZ
  return (
    <>
      <color attach="background" args={['#060912']} />
      <fog attach="fog" args={['#060912', 30, 76]} />
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#9ab8ff', '#0a0a14', 0.5]} />
      <directionalLight position={[-10, 22, -8]} intensity={1.05} color="#cfe0ff" />
      <Stars radius={80} depth={36} count={1400} factor={2.4} fade speed={0.25} />
      <Sparkles count={220} scale={[w, 8, d]} position={[0, 4, cz]} size={2} speed={0.35} color="#ffe2a0" />
      <Seascape y={-0.9} depth={2.2} area={[0, cz, w + 24, d + 24]} seed={303} palette={{ water: '#0e2848', sand: '#3a4458', weed: '#2a4a6a' }} lanterns={18} />
      <Clouds y={-2} area={[0, cz, w + 30, d + 30]} count={20} color="#8898cc" opacity={0.22} seed={13} speed={0.28} />
      <FloatingRocks center={[0, 0, cz]} radius={[w * 0.5, w * 0.75]} count={14} />
      {/* the open battle commons between the decks */}
      <CommonsIslands sites={sites} />

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

      {sites
        .filter((s) => s.stage === 'station')
        .map((site) => {
          const ring = { ...site.ring, cx: site.pos[0] + site.ring.cx, cz: site.pos[1] + site.ring.cz }
          const here = current === site.id
          return (
            <group key={site.id}>
              <mesh position={[site.pos[0], -0.3, site.pos[1]]}>
                <cylinderGeometry args={[site.def.add[0].r, site.def.add[0].r * 0.94, 0.6, 56]} />
                <meshStandardMaterial color="#1e1c2a" roughness={0.88} />
              </mesh>
              <RingRoad ring={ring} current={here} />
              {/* the beacon in the middle banks a lap */}
              <mesh position={[ring.cx, 0.1, ring.cz]}>
                <cylinderGeometry args={[0.85, 0.9, 0.2, 24]} />
                <meshStandardMaterial color="#2a3544" emissive="#ffb347" emissiveIntensity={here ? 0.35 : 0.1} />
              </mesh>
              <Helix ring={ring} liftRef={liftRef} homotopyT={here ? homotopyT : null} current={here} />
              {here && <DeformedRoad ring={ring} homotopyT={homotopyT} />}
              {(site.winders || []).map(([w, dx, dz], i) => {
                const st = winders?.find((x) => x.id === `${site.id}-${i}`)
                if (st?.killed) return null
                return <WinderPillar key={i} x={site.pos[0] + dx} z={site.pos[1] + dz} turns={st ? st.winding + st.net : w} />
              })}
              {site.gates?.map((n, i) => {
                const [gx, gz] = [site.pos[0] + 2.35 * Math.cos((i / 3) * TAU - Math.PI / 2), site.pos[1] + 2.35 * Math.sin((i / 3) * TAU - Math.PI / 2)]
                return <WindingGate key={i} x={gx} z={gz} n={n} open={gatesOpen?.[n]} active={here && gateGoal === n} />
              })}
            </group>
          )
        })}

      {exitOpen && layout.exit && (
        // a halo over the causeway, high enough that the chase camera never flies through it
        <mesh position={[layout.exit.gate[0], 4.2, layout.exit.gate[1]]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.12, 8, 32]} />
          <meshStandardMaterial color="#ffcf6a" emissive="#ffb347" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      )}

      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} talkingRef={talkingRef} frameRef={frameRef} lockRef={camLockRef} walkable={walkable} stars={stars} portal={portal} exitFrom={layout.exit.a} follower emmyRef={emmyRef} />
      <DevAdvance />
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        purge={!!portal?.open}
        stage={stage}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={sim}
        tRef={tRef}
        stateRef={stateRef}
        spawnRef={spawnRef}
        onTrackMove={onTrackMove}
        onEnemies={onEnemies}
        onHearts={onHearts}
      />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.85} intensity={0.8} mipmapBlur />
        <Vignette eskil offset={0.22} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
