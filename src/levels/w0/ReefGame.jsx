import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import { sfxCrack, sfxHit, sfxHurt, sfxPop, sfxWhoosh } from '../../audio/chip'
import { MirrorSpawn, SnapperSpawn, SphereSpawn, TorusSpawn } from '../../characters/Spawn'

/**
 * The playable layer of Retract Reef. Gyroid runs (WASD / arrows) and carries two
 * weapons: the Fundamental Lash (click to crack it toward the mouse) and the Spool,
 * a thick amber loop (click to start paying out spine thread, walk, click to stop).
 *
 *   sphere spawn — one lash: every loop slides right off a sphere, so it collapses to a point
 *   torus spawn  — two lashes: it holds two loops it can't shed (around the tube, through
 *                  the hole); each lash lights one, and with both caught it collapses
 *   snapper      — one lash: a crab from Tidewarp Flats (0-2) that goes for ribbons and
 *                  clips them (a clipped ribbon is no longer a continuous map)
 *
 * (A preview of World 1, where the torus has two independent loops and the sphere none.)
 */

export const GYROID_SCALE = 0.7
const SPEED = 3.6
const WHIP_TIME = 0.42
const WHIP_HIT_AT = 0.45 // fraction of the swing when the lash lands
const WHIP_RANGE = 1.35
const WHIP_ARC = Math.PI * 0.42
const CONTACT = 0.36
const HEARTS = 3

const ENEMY = {
  sphere: { hp: 1, speed: 0.95, radius: 0.32 },
  torus: { hp: 2, speed: 0.72, radius: 0.44 },
  snapper: { hp: 1, speed: 1.25, radius: 0.42 },
  mirror: { hp: 1, speed: 0.9, radius: 0.36 },
}

/** The Fundamental Lash: an amber cord cracked from Gyroid's hand. */
function Lash({ state }) {
  const line = useRef()
  const flash = useRef()
  const pts = useMemo(() => Array.from({ length: 16 }, () => new THREE.Vector3()), [])
  useFrame(() => {
    const s = state.current
    const on = s.whip > 0
    line.current.visible = on
    flash.current.visible = on && s.whip > WHIP_HIT_AT && s.whip < WHIP_HIT_AT + 0.25
    if (!on) return
    const fx = Math.sin(s.face)
    const fz = Math.cos(s.face)
    const hx = s.x + fx * 0.17 - fz * 0.22 // right hand
    const hz = s.z + fz * 0.17 + fx * 0.22
    const ext = s.whip < 0.3 ? 0.25 : Math.min(1, (s.whip - 0.3) / 0.25) * (1 - Math.max(0, s.whip - 0.75) / 0.5)
    const reach = 0.25 + WHIP_RANGE * ext
    const arr = []
    for (let k = 0; k < pts.length; k++) {
      const u = k / (pts.length - 1)
      const sway = Math.sin(u * Math.PI) * (0.35 - ext * 0.3) * (s.whip < 0.3 ? -1 : 1)
      const x = hx + fx * reach * u - fz * sway
      const z = hz + fz * reach * u + fx * sway
      const y = 0.85 - u * 0.6 + Math.sin(u * Math.PI) * 0.3 * (1 - ext)
      arr.push(x, y, z)
    }
    line.current.geometry.setPositions(arr)
    flash.current.position.set(arr[arr.length - 3], arr[arr.length - 2], arr[arr.length - 1])
  })
  return (
    <>
      <Line ref={line} points={pts.map(() => [0, 0, 0])} color="#ffcf6a" lineWidth={4} toneMapped={false} />
      <mesh ref={flash}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
    </>
  )
}

// ---------------------------------------------------------------- the game

/** Renders the spawn list, picking up spawn added mid-play. */
function EnemyList({ enemies }) {
  const [n, setN] = useState(enemies.current.length)
  useFrame(() => {
    if (enemies.current.length !== n) setN(enemies.current.length)
  })
  return enemies.current
    .slice(0, n)
    .map((e, i) =>
      e.type === 'torus' ? <TorusSpawn key={i} e={e} maxHp={ENEMY.torus.hp} /> : e.type === 'snapper' ? <SnapperSpawn key={i} e={e} /> : e.type === 'mirror' ? <MirrorSpawn key={i} e={e} /> : <SphereSpawn key={i} e={e} />,
    )
}

/** Aim marker on the reef under the mouse. */
function Reticle({ aim, tool }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const a = aim.current
    g.current.visible = !!a
    if (!a) return
    g.current.position.set(a[0], 0.06, a[1])
    g.current.rotation.z = clock.elapsedTime * (tool === 'spool' ? 1.5 : 3)
  })
  return (
    <group ref={g} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={tool === 'spool' ? [0.14, 0.2, 24] : [0.1, 0.14, 4]} />
        <meshBasicMaterial color={tool === 'spool' ? '#ffd27a' : '#fff2c4'} transparent opacity={0.8} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** The Spool weapon: a thick amber loop carried in Gyroid's hand; it spins while paying out thread. */
function SpoolLoop({ state, tool }) {
  const g = useRef()
  useFrame((_, dt) => {
    const s = state.current
    g.current.visible = tool === 'spool'
    const fx = Math.sin(s.face)
    const fz = Math.cos(s.face)
    g.current.position.set(s.x + fx * 0.28 - fz * 0.2, 0.62, s.z + fz * 0.28 + fx * 0.2)
    g.current.rotation.y = s.face
    g.current.rotation.x += dt * (s.spooling ? 9 : 1.2)
  })
  return (
    <group ref={g}>
      <mesh>
        <torusGeometry args={[0.16, 0.045, 10, 32]} />
        <meshStandardMaterial color="#ffcf6a" emissive="#ffb347" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** The Tide Glass (0-2): a small amber hourglass held up while scrubbing time. */
function GlassProp({ state, tool }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const s = state.current
    g.current.visible = tool === 'glass'
    const fx = Math.sin(s.face)
    const fz = Math.cos(s.face)
    g.current.position.set(s.x + fx * 0.3 - fz * 0.18, 0.72 + Math.sin(clock.elapsedTime * 2) * 0.03, s.z + fz * 0.3 + fx * 0.18)
    g.current.rotation.y = clock.elapsedTime * 0.8
  })
  return (
    <group ref={g}>
      {[1, -1].map((sd) => (
        <mesh key={sd} position={[0, sd * 0.07, 0]} rotation={[sd > 0 ? Math.PI : 0, 0, 0]}>
          <coneGeometry args={[0.08, 0.14, 16, 1, true]} />
          <meshStandardMaterial color="#ffe6a8" emissive="#ffb347" emissiveIntensity={1.2} transparent opacity={0.75} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      {[1, -1].map((sd) => (
        <mesh key={`c${sd}`} position={[0, sd * 0.15, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#c98a2a" emissive="#ffb347" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export default function ReefGame({ stage, shape, playEnabled, spoolEnabled, tool, sim, tRef, stateRef, spawnRef, ribbonApi, onStrokeStart, onStrokeMove, onStrokeEnd, onEnemies, onHearts, onSpooling }) {
  const b = shape.bounds
  const start = stage.start || [b.minX + 0.4, b.maxZ - 0.4]
  const pier = useMemo(() => [b.minX - 0.9, b.maxZ * 0.5], [b])
  const onPier = stage.mode === 'forgery'

  const state = useRef(null)
  if (!state.current) {
    state.current = {
      x: onPier ? pier[0] : start[0],
      z: onPier ? pier[1] : start[1],
      face: Math.PI / 2,
      moving: 0,
      whip: 0,
      hitDone: false,
      hearts: HEARTS,
      hurt: 0,
      spooling: false,
      slideFrom: null,
    }
  }
  const enemies = useRef(null)
  const makeEnemy = (def, i) => {
      const [type, x, z, site] = Array.isArray(def) ? def : [def.type, def.x, def.z, def.site]
      return {
      axis: Array.isArray(def) ? undefined : def.axis, // mirror spawn: their reflection's mirror line
      type,
      site,
      x,
      z,
      hx: x, // home: spawn stay near where they were placed
      hz: z,
      hp: ENEMY[type].hp,
      alive: true,
      dying: 0,
      stun: 0,
      flash: 0,
      face: 0,
      seed: i * 1.7,
      tx: x,
      tz: z,
      retarget: 0,
      snipping: 0,
      cooldown: type === 'snapper' ? 3.5 : 0, // Snappers size things up before the first snip
      }
  }
  if (!enemies.current) enemies.current = (stage.enemies || []).map(makeEnemy)
  if (stateRef) stateRef.current = state.current
  if (spawnRef) {
    // levels can add spawn mid-play (waves, Snappers arriving)
    spawnRef.current = (defs) => {
      const n = enemies.current.length
      enemies.current.push(...defs.map((d, k) => makeEnemy(d, n + k)))
      report()
    }
  }
  // alive spawn per site (or the total, for single-stage boards)
  const report = () => {
    const by = {}
    for (const e of enemies.current) if (e.alive) by[e.site ?? 'all'] = (by[e.site ?? 'all'] || 0) + 1
    onEnemies?.(stage.bySite || stage.enemies?.some((d) => !Array.isArray(d)) ? by : by.all || 0)
  }
  const keys = useRef({})
  const aim = useRef(null) // reef point under the mouse
  const clicks = useRef([]) // clicks waiting for the game loop
  if (import.meta.env.DEV) {
    // dev inspection / test shortcuts
    window.__game = {
      state: state.current,
      enemies: enemies.current,
      click: (x, z) => clicks.current.push([x, z]),
      killSite: (site) => {
        for (const e of enemies.current) if (e.site === site) e.alive = false
        report()
      },
    }
  }

  useEffect(() => {
    report()
    onHearts?.(state.current.hearts)
    const MOVE = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    const down = (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return
      if (MOVE.includes(e.code)) {
        keys.current[e.code] = true
        e.preventDefault() // movement keys never nudge a focused slider or scroll the page
      }
    }
    const up = (e) => (keys.current[e.code] = false)
    const blur = () => (keys.current = {})
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
    // run once per mount (the board remounts per stage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inside = (x, z) => shape.inside(x, z)
  const enemyInside = (x, z) => (shape.insideForSpawn || shape.inside)(x, z)

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = state.current
    const t = tRef.current

    // ride the slide: Gyroid's own point is carried to the spine like every other
    if (sim && t > 0 && !onPier) {
      if (!s.slideFrom) {
        const end = sim.endpointAt?.(s.x, s.z) || [s.x, s.z]
        s.slideFrom = [s.x, s.z, end[0], end[1]]
      }
      const [x0, z0, x1, z1] = s.slideFrom
      s.x = x0 + (x1 - x0) * t
      s.z = z0 + (z1 - z0) * t
      s.moving = 0
      clicks.current.length = 0
      return
    }
    if (s.slideFrom) {
      // slide undone: back to where Gyroid stood
      ;[s.x, s.z] = s.slideFrom
      s.slideFrom = null
    }

    // --- movement (WASD / arrows)
    let mx = 0
    let mz = 0
    if (playEnabled && !onPier) {
      const k = keys.current
      mx = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0)
      mz = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0)
    }
    const ml = Math.hypot(mx, mz)
    if (ml > 0) {
      mx /= ml
      mz /= ml
      const step = SPEED * dt
      const nx = s.x + mx * step
      const nz = s.z + mz * step
      if (inside(nx, nz)) (s.x = nx), (s.z = nz)
      else if (inside(nx, s.z)) s.x = nx // slide along the shore
      else if (inside(s.x, nz)) s.z = nz
      if (s.whip === 0) s.face = Math.atan2(mx, mz)
    }
    s.moving = THREE.MathUtils.lerp(s.moving, ml > 0 ? 1 : 0, Math.min(1, dt * 12))

    // --- clicks: lash toward the click, or start / stop the spool thread
    const canSpool = spoolEnabled && tool === 'spool'
    for (const [cx, cz] of clicks.current) {
      if (!playEnabled || onPier) continue
      if (tool === 'spool') {
        if (!canSpool) continue
        if (!s.spooling) {
          if (onStrokeStart(s.x, s.z, cx, cz) === false) continue // nothing to take hold of here
          s.spooling = true
          onSpooling?.(true)
        } else {
          // (the level may pick something else up in onStrokeEnd and set spooling again)
          s.spooling = false
          onSpooling?.(false)
          onStrokeEnd(cx, cz)
        }
      } else if (tool === 'lash' && s.whip === 0) {
        s.face = Math.atan2(cx - s.x, cz - s.z)
        s.whip = 0.0001
        s.hitDone = false
        sfxWhoosh()
      }
    }
    clicks.current.length = 0
    if (s.spooling && s.spoolDropped) {
      // the level let go for us (e.g. the ribbon was clipped)
      s.spooling = false
      s.spoolDropped = false
      onSpooling?.(false)
    }
    if (s.spooling && !canSpool) {
      // switched weapons or the stage moved on: tie off the thread
      s.spooling = false
      onStrokeEnd()
      onSpooling?.(false)
    }
    if (s.spooling && ml > 0) onStrokeMove(s.x, s.z)

    // --- whip
    if (s.whip > 0) {
      s.whip += dt / WHIP_TIME
      if (!s.hitDone && s.whip >= WHIP_HIT_AT) {
        s.hitDone = true
        sfxCrack()
        for (const e of enemies.current) {
          if (!e.alive) continue
          const dx = e.x - s.x
          const dz = e.z - s.z
          const d = Math.hypot(dx, dz)
          let da = Math.atan2(dx, dz) - s.face
          da = Math.atan2(Math.sin(da), Math.cos(da))
          if (d < WHIP_RANGE + ENEMY[e.type].radius && Math.abs(da) < WHIP_ARC) {
            e.hp--
            e.flash = 0.15
            sfxHit()
            e.stun = 0.5
            const kb = 0.55 / (d || 1)
            const kx = e.x + dx * kb
            const kz = e.z + dz * kb
            if (enemyInside(kx, kz)) (e.x = kx), (e.z = kz)
            if (e.hp <= 0) {
              e.alive = false
              e.dying = e.type === 'torus' ? 0.6 : 0.5
              sfxPop()
              report()
            }
          }
        }
      }
      if (s.whip >= 1) s.whip = 0
    }

    // --- spawn: wander, chase when close, hurt on contact
    s.hurt = Math.max(0, s.hurt - dt)
    const drift = playEnabled && stage.drift ? stage.drift(clock.elapsedTime) : null
    for (const e of enemies.current) {
      e.flash = Math.max(0, e.flash - dt)
      e.snipping = Math.max(0, e.snipping - dt)
      if (e.dying > 0) {
        e.dying = Math.max(0, e.dying - dt)
        continue
      }
      if (!e.alive) continue
      if (e.stun > 0) {
        e.stun -= dt
        continue
      }
      const cfg = ENEMY[e.type]
      const dx = s.x - e.x
      const dz = s.z - e.z
      const d = Math.hypot(dx, dz)
      const leash = Math.hypot(s.x - e.hx, s.z - e.hz) < 6.5 // spawn guard their own patch of reef
      e.cooldown = Math.max(0, e.cooldown - dt)
      const ribbonGoal = e.type === 'snapper' && e.cooldown === 0 && playEnabled && !onPier ? ribbonApi?.current?.target(e) : null
      if (drift && e.type !== 'snapper') {
        // spawn drift with the tide
        const nx = e.x + drift[0] * dt
        const nz = e.z + drift[1] * dt
        if (enemyInside(nx, nz)) (e.x = nx), (e.z = nz)
      }
      if (ribbonGoal && d > 1.4) {
        // Snappers go for the ribbon; when they reach it, they clip it
        e.tx = ribbonGoal[0]
        e.tz = ribbonGoal[1]
        if (Math.hypot(e.tx - e.x, e.tz - e.z) < 0.28) {
          if (ribbonApi.current.snip(e.x, e.z)) e.snipping = 0.5
          e.cooldown = 6
          e.retarget = 0
        }
      } else if (d < 3.2 && leash && playEnabled && !onPier) {
        e.tx = s.x
        e.tz = s.z
      } else if ((e.retarget -= dt) <= 0 || Math.hypot(e.tx - e.x, e.tz - e.z) < 0.2) {
        for (let tries = 0; tries < 20; tries++) {
          const rx = e.hx + (Math.random() * 2 - 1) * 3
          const rz = e.hz + (Math.random() * 2 - 1) * 3
          if (enemyInside(rx, rz)) {
            e.tx = rx
            e.tz = rz
            break
          }
        }
        e.retarget = 2 + Math.random() * 2
      }
      const vx = e.tx - e.x
      const vz = e.tz - e.z
      const vl = Math.hypot(vx, vz)
      if (vl > 0.01 && playEnabled) {
        const nx = e.x + (vx / vl) * cfg.speed * dt
        const nz = e.z + (vz / vl) * cfg.speed * dt
        if (enemyInside(nx, nz)) (e.x = nx), (e.z = nz)
        else if (enemyInside(nx, e.z)) e.x = nx
        else if (enemyInside(e.x, nz)) e.z = nz
        else e.retarget = 0
        e.face = Math.atan2(vx, vz)
      }
      if (d < CONTACT + cfg.radius * 0.5 && s.hurt === 0 && playEnabled && !onPier) {
        s.hurt = 1.3
        s.hearts = Math.max(0, s.hearts - 1)
        sfxHurt()
        onHearts?.(s.hearts)
        const kx = s.x + (dx / (d || 1)) * 0.7
        const kz = s.z + (dz / (d || 1)) * 0.7
        if (inside(kx, kz)) (s.x = kx), (s.z = kz)
        e.stun = 0.8
      }
    }
  })

  const gyroidScript = () => {
    const s = state.current
    const blink = s.hurt > 0 && Math.floor(s.hurt * 12) % 2 === 0
    return {
      pos: [s.x / GYROID_SCALE, blink ? -40 : 0, s.z / GYROID_SCALE],
      rotY: onPier ? Math.atan2(-pier[0], -pier[1]) : s.face,
      run: s.moving,
      cast: tool === 'spool' && !onPier ? 0.3 : 0,
      whip: s.whip,
      loop: 0,
      loopDrop: 0,
    }
  }

  return (
    <>
      {onPier && (
        <mesh position={[pier[0], -0.25, pier[1]]}>
          <cylinderGeometry args={[0.5, 0.65, 0.5, 8]} />
          <meshStandardMaterial color="#1a1f29" roughness={0.9} flatShading />
        </mesh>
      )}
      <group scale={GYROID_SCALE}>
        <Gyroid script={gyroidScript} />
      </group>
      <Lash state={state} />
      {!onPier && <SpoolLoop state={state} tool={tool} />}
      {!onPier && <GlassProp state={state} tool={tool} />}
      <EnemyList enemies={enemies} />
      {playEnabled && <Reticle aim={aim} tool={tool} />}

      {/* mouse: aim under the cursor; click to lash toward it, or to start / stop the thread */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        onPointerMove={(e) => (aim.current = [e.point.x, e.point.z])}
        onPointerOut={() => (aim.current = null)}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.stopPropagation()
          aim.current = [e.point.x, e.point.z]
          clicks.current.push([e.point.x, e.point.z])
        }}
      >
        <planeGeometry args={[240, 240]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}
