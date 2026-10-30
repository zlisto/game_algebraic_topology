import { useFrame } from '@react-three/fiber'
import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import Lash from './Lash'
import { beastMet } from '../../codex/store'
import { SLOT_KEYS, equip, getSlots, setHeld } from '../../controls/loadout'
import { sfxCrack, sfxHammer, sfxHit, sfxHurt, sfxPop, sfxRefuse, sfxRoot, sfxWhoosh } from '../../audio/chip'
import {
  BacktrackSpawn,
  BeaconSpawn,
  WinderSpawn,
  ConerSpawn,
  DeckGuardSpawn,
  HedgeSpawn,
  LiftlingSpawn,
  LoopBiterSpawn,
  PatrolSpawn,
  ProjectorImpSpawn,
  RetractorSpawn,
  ShardSpawn,
  MirrorSpawn,
  SnapperSpawn,
  SphereSpawn,
  StackSentinelSpawn,
  TorusSpawn,
  UnglueSpawn,
  WhirlSpawn,
  EchoSpawn,
  VineChokerSpawn,
  MothSpawn,
  SeamWraithSpawn,
  FlipperSpawn,
  BogSpawn,
  CrumplerSpawn,
  LeakSpawn,
  QuarryGolemSpawn,
  GaleSpawn,
  CubeSentrySpawn,
  GlitchSpawn,
  FiberWraithSpawn,
  TwistThiefSpawn,
} from '../../characters/Spawn'
import { BitorusSpawn, EarringSpawn, KleinSpawn, MobiusSpawn, ProjectiveSpawn } from '../../characters/Bestiary'
import { ColossusSpawn, HarpySpawn, SpectreSpawn, SpiderSpawn } from '../../characters/Cohomology'
import KleinElixir from './KleinElixir'
import {
  ACTION_TOOLS,
  BladeProp,
  CasterProp,
  ClaspProp,
  CoilProp,
  CompassProp,
  CordProp,
  DialProp,
  ExtensionProp,
  SlingProp,
  STROKE_TOOLS,
  SWING_TOOLS,
  WandProp,
  WORLD_TOOLS,
} from './worldTools'

export { WORLD_TOOLS } from './worldTools'


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
const WHIP_TIME = 0.52 // long enough to see the rear-back and the wave roll out
const WHIP_HIT_AT = 0.45 // fraction of the swing when the lash lands
const WHIP_RANGE = 1.7
const WHIP_ARC = Math.PI * 0.42
const CONTACT = 0.36
const HEARTS = 3

const ENEMY = {
  sphere: { hp: 1, speed: 0.95, radius: 0.32 },
  torus: { hp: 2, speed: 0.72, radius: 0.44 },
  snapper: { hp: 1, speed: 1.25, radius: 0.42 },
  mirror: { hp: 1, speed: 0.9, radius: 0.36 },
  unglue: { hp: 1, speed: 1.3, radius: 0.34 },
  coner: { hp: 2, speed: 1.0, radius: 0.4 },
  biter: { hp: 2, speed: 1.15, radius: 0.36 },
  beacon: { hp: 1, speed: 0, radius: 0.6 }, // the castle's judgment beacons: they never move or bite
  shard: { hp: 1, speed: 2.1, radius: 0.3 },
  // --- World 1 (one row per type, shared by every level that uses it)
  hedge: { hp: 1, speed: 0.4, radius: 0.5, rootTime: 4.2 }, // 1-1: roots into a hedge unless lashed in time
  retractor: { hp: 2, speed: 1.3, radius: 0.42 }, // 1-4: chases like a Torus
  whirl: { hp: 1, speed: 1.9, radius: 0.38 }, // 1-4
  projector_imp: { hp: 1, speed: 0.95, radius: 0.38 }, // 1-5
  patrol: { hp: 2, speed: 0.85, radius: 0.42 }, // 1-6, 1-7, 1-8 (1-6 patrols get one hp per letter of their word)
  liftling: { hp: 2, speed: 1.05, radius: 0.34 }, // 1-8, 1-9 (1-8: only hittable on its own sheet, via stage.canHit)
  stack_sentinel: { hp: 2, speed: 0, radius: 0.55, harmless: true }, // 1-9: stands at the tower; lashing it swaps the start vertex (stage.onEnemyHit keeps it standing)
  deck_guard: { hp: 1, speed: 0.85, radius: 0.38 }, // 1-10: one lash clears every linked copy, once stacked (stage.canHit)
  backtrack: { hp: 1, speed: 0, radius: 0.36 }, // 1-2: runs a loop track backwards (the level steers it via stage.enemyAI)
  winder: { hp: 1, speed: 0.55, radius: 0.42 }, // 1-3: immune (stage.canHit) until laps cancel the turns it holds
  // --- World 3 · Cup Product Gardens
  echo: { hp: 1, speed: 1.1, radius: 0.36 },
  vine_choker: { hp: 2, speed: 0.7, radius: 0.42 },
  moth: { hp: 1, speed: 1.4, radius: 0.3 },
  seam_wraith: { hp: 3, speed: 0.85, radius: 0.44 },
  flipper: { hp: 1, speed: 1.15, radius: 0.36 },
  // --- World 2 · Chain Delta
  bog: { hp: 2, speed: 0.55, radius: 0.48 },
  crumpler: { hp: 1, speed: 1.2, radius: 0.34 },
  leak: { hp: 1, speed: 1.35, radius: 0.32 },
  quarry_golem: { hp: 3, speed: 0.45, radius: 0.55 },
  gale: { hp: 1, speed: 1.5, radius: 0.3 },
  // --- World 4 · Postnikov Spire
  cube_sentry: { hp: 2, speed: 0.55, radius: 0.48 },
  glitch: { hp: 1, speed: 1.35, radius: 0.34 },
  fiber_wraith: { hp: 2, speed: 1.05, radius: 0.4 },
  twist_thief: { hp: 2, speed: 0.9, radius: 0.38 },
  // the topological bestiary (design/BESTIARY.md): hits = invariants
  mobius: { hp: 2, speed: 1.0, radius: 0.42 }, // π₁ = ℤ; the first cut doubles its length — and its speed
  projective: { hp: 2, speed: 0.8, radius: 0.4, torsionAt: 2 }, // π₁ = ℤ₂: two lashes in quick succession
  klein: { hp: 3, speed: 0.6, radius: 0.46, torsionAt: 2 }, // H₁ = ℤ ⊕ ℤ₂: the free loop, then a torsion pair
  bitorus: { hp: 4, speed: 0.7, radius: 0.55 }, // H₁ = ℤ⁴
  earring: { hp: 5, speed: 0.6, radius: 0.6 }, // not a CW complex; shrinks and speeds up as rings shatter
  // the cohomology wing: they answer to the lash's stance (G: chain / cochain)
  harpy: { hp: 3, speed: 0.95, radius: 0.45, rule: 'harpy' }, // ⟨δα, c⟩ = ⟨α, ∂c⟩: chain lashes feed it; cochain lashes drive δα to 0
  spider: { hp: 4, speed: 1.2, radius: 0.42, rule: 'spider' }, // α ⌣ β = (−1)^pq β ⌣ α: alternate stances, or the web recoils
  spectre: { hp: 3, speed: 0.35, radius: 0.5, rule: 'spectre' }, // dω = 0, ω ≠ df: circle it (∮ω ≠ 0) to force it exact, then lash
  colossus: { hp: 6, speed: 0.4, radius: 0.7, rule: 'colossus' }, // Hᵏ ≅ Hₙ₋ₖ: alternate stone (chain) and light (cochain)
}
/** Seconds a torsion pair stays open: miss the follow-up and it settles back. */
const TORSION_WINDOW = 2.2

/** Starting hit points: a definition may set `hp`; a 1-6 patrol gets one per letter of its word. */
function enemyHp(type, def) {
  if (def?.hp) return def.hp
  if (type === 'patrol' && def?.word) return Math.max(1, def.word.trim().split(/\s+/).filter(Boolean).length)
  const row = ENEMY[type] || ENEMY.sphere
  return row.hp
}

/** Models for the World 1 spawn (Worlds 2–4 append here too). */
export const SPAWN_VIEW = {
  hedge: HedgeSpawn,
  backtrack: BacktrackSpawn,
  winder: WinderSpawn,
  retractor: RetractorSpawn,
  whirl: WhirlSpawn,
  projector_imp: ProjectorImpSpawn,
  patrol: PatrolSpawn,
  liftling: LiftlingSpawn,
  stack_sentinel: StackSentinelSpawn,
  deck_guard: DeckGuardSpawn,
  echo: EchoSpawn,
  vine_choker: VineChokerSpawn,
  moth: MothSpawn,
  seam_wraith: SeamWraithSpawn,
  flipper: FlipperSpawn,
  bog: BogSpawn,
  crumpler: CrumplerSpawn,
  leak: LeakSpawn,
  quarry_golem: QuarryGolemSpawn,
  gale: GaleSpawn,
  cube_sentry: CubeSentrySpawn,
  glitch: GlitchSpawn,
  fiber_wraith: FiberWraithSpawn,
  twist_thief: TwistThiefSpawn,
  mobius: MobiusSpawn,
  projective: ProjectiveSpawn,
  klein: KleinSpawn,
  bitorus: BitorusSpawn,
  earring: EarringSpawn,
  harpy: HarpySpawn,
  spider: SpiderSpawn,
  spectre: SpectreSpawn,
  colossus: ColossusSpawn,
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
      e.type === 'torus' ? <TorusSpawn key={i} e={e} maxHp={ENEMY.torus.hp} /> : e.type === 'snapper' ? <SnapperSpawn key={i} e={e} /> : e.type === 'mirror' ? <MirrorSpawn key={i} e={e} /> : e.type === 'unglue' ? <UnglueSpawn key={i} e={e} /> : e.type === 'coner' ? <ConerSpawn key={i} e={e} /> : e.type === 'biter' ? <LoopBiterSpawn key={i} e={e} /> : e.type === 'beacon' ? <BeaconSpawn key={i} e={e} /> : e.type === 'shard' ? <ShardSpawn key={i} e={e} /> : SPAWN_VIEW[e.type] ? createElement(SPAWN_VIEW[e.type], { key: i, e }) : <SphereSpawn key={i} e={e} />,
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
    g.current.rotation.z = clock.elapsedTime * (STROKE_TOOLS.has(tool) ? 1.5 : 3)
  })
  return (
    <group ref={g} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={STROKE_TOOLS.has(tool) ? [0.14, 0.2, 24] : [0.1, 0.14, 4]} />
        <meshBasicMaterial color={STROKE_TOOLS.has(tool) ? '#ffd27a' : '#fff2c4'} transparent opacity={0.8} toneMapped={false} />
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

/** The Cell Hammer (0-4): a brass-and-indigo gauntlet whose palm shows a point, a loop and a disk. */
/**
 * The Cell Hammer: a forge hammer — a dark wooden haft, a brass-bound steel head with a
 * glowing gold rune band. Gyroid carries it at his side; a click winds it up and brings it
 * down (state.swing 0 → 1), with a flash of sparks at the strike.
 */
function SmithProp({ state, tool }) {
  const g = useRef()
  const pivot = useRef()
  const sparks = useRef()
  const band = useRef()
  useFrame(({ clock }) => {
    const s = state.current
    g.current.visible = tool === 'smith'
    const fx = Math.sin(s.face)
    const fz = Math.cos(s.face)
    // in his right hand, a little ahead
    g.current.position.set(s.x + fx * 0.1 - fz * 0.26, 0.5, s.z + fz * 0.1 + fx * 0.26)
    g.current.rotation.y = s.face
    const u = s.swing
    // rest: head up and back over the shoulder; wind-up lifts it; strike slams it forward and down
    let pitch = -0.5 + Math.sin(clock.elapsedTime * 2) * 0.03
    if (u > 0) {
      if (u < 0.4) pitch = -0.5 - 1.1 * Math.sin((u / 0.4) * (Math.PI / 2))
      else if (u < 0.55) pitch = -1.6 + 3.3 * ((u - 0.4) / 0.15)
      else pitch = 1.7 - 2.2 * ((u - 0.55) / 0.45)
    }
    pivot.current.rotation.x = pitch
    const hit = u > 0.55 && u < 0.8
    sparks.current.visible = hit
    if (hit) {
      const k = (u - 0.55) / 0.25
      sparks.current.children.forEach((c, i) => {
        const a = (i / sparks.current.children.length) * Math.PI * 2
        c.position.set(Math.cos(a) * 0.25 * k, 0.05 + Math.sin(k * Math.PI) * 0.18, 0.55 + Math.sin(a) * 0.25 * k)
        c.scale.setScalar(0.03 * (1 - k) + 0.005)
      })
    }
    band.current.material.color.set(hit ? '#ffffff' : '#ffd27a')
  })
  return (
    <group ref={g} scale={1.8}>
      <group ref={pivot}>
        {/* the haft, running forward from the hand */}
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.026, 0.46, 8]} />
          <meshStandardMaterial color="#4a2e1c" roughness={0.7} />
        </mesh>
        {/* the head, across the end of the haft */}
        <group position={[0, 0, 0.43]}>
          <mesh>
            <boxGeometry args={[0.22, 0.11, 0.11]} />
            <meshStandardMaterial color="#6a7078" metalness={0.9} roughness={0.3} />
          </mesh>
          {[-0.115, 0.115].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.02, 0.125, 0.125]} />
              <meshStandardMaterial color="#b88a3a" metalness={0.85} roughness={0.3} emissive="#3a2408" emissiveIntensity={0.3} />
            </mesh>
          ))}
          <mesh ref={band}>
            <boxGeometry args={[0.06, 0.115, 0.115]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* sparks at the strike */}
      <group ref={sparks} visible={false}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color={i % 2 ? '#ffd27a' : '#fff2c4'} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function ReefGame({
  elixirs = true, // some kills drop a Klein Elixir that restores every heart
  purge = false, // the Warp Portal is open: every spawn bursts and is gone
  camYawRef, // chase camera (0-1): movement turns with the camera, and F lashes straight ahead
  stage,
  shape,
  playEnabled,
  spoolEnabled,
  tool,
  sim,
  tRef,
  stateRef,
  spawnRef,
  ribbonApi,
  onAction,
  actionTools = ACTION_TOOLS, // tools whose clicks go to onAction (a level may add its own)
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  onTrackMove,
  onEnemies,
  onHearts,
  onSpooling,
}) {
  const b = shape.bounds
  const start = stage.start || [b.minX + 0.4, b.maxZ - 0.4]
  const pier = useMemo(() => [b.minX - 0.9, b.maxZ * 0.5], [b])
  const onPier = stage.mode === 'forgery'

  const state = useRef(null)
  if (!state.current) {
    state.current = {
      x: onPier ? pier[0] : start[0],
      z: onPier ? pier[1] : start[1],
      face: camYawRef ? camYawRef.current + Math.PI : Math.PI / 2, // chase camera: start facing away from it
      moving: 0,
      whip: 0,
      swing: 0, // the Cell Hammer's hammer swing, 0 → 1
      hitDone: false,
      hearts: HEARTS,
      hurt: 2.0, // a moment's grace on arrival (and after every knockout) before anything can bite
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
      commons: String(site || '').includes('commons'), // a battle-plaza pack: shorter leash
      hx: x, // home: spawn stay near where they were placed
      hz: z,
      hp: enemyHp(type, Array.isArray(def) ? undefined : def),
      maxHp: enemyHp(type, Array.isArray(def) ? undefined : def),
      word: Array.isArray(def) ? undefined : def.word, // 1-6 patrols: the word they walk, and how many letters are lashed so far
      lashStep: Array.isArray(def) ? 0 : def.lashStep || 0,
      sheet: Array.isArray(def) ? undefined : def.sheet, // 1-8 liftlings: the sheet they live on
      linked: Array.isArray(def) ? false : !!def.linked, // 1-10 deck guards: one lash clears every linked copy at the site
      rooting: 0,
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
      cooldown: type === 'snapper' || type === 'unglue' || type === 'coner' || type === 'biter' ? 3.5 : 0, // they size things up before the first snip
      beam: 0, // Coners: seconds of beaming left
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
    // …and take them away again (e.g. the castle's beacons between rounds)
    spawnRef.current.remove = (test) => {
      for (const e of enemies.current) if (e.alive && test(e)) (e.alive = false), (e.dying = 0.3)
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
  const drops = useRef([]) // Klein Elixirs on the ground: { id, x, z, taken }
  const dropId = useRef(0)
  const [, setDropCount] = useState(0) // re-render when one drops or is taken
  const pickSphere = useMemo(() => new THREE.Sphere(), [])
  const pickHit = useMemo(() => new THREE.Vector3(), [])
  const toolRef = useRef(tool) // the tool in hand, for key handlers set up once
  toolRef.current = tool
  const playRef = useRef(playEnabled) // the buttons only act while you're playing (not in dialogue, pause or a lesson)
  playRef.current = playEnabled && !onPier
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
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      if (MOVE.includes(e.code)) {
        keys.current[e.code] = true
        e.preventDefault() // movement keys never nudge a focused slider or scroll the page
      }
      // the buttons (src/controls/loadout.js): F is the Lash; J, K and L use the item set on them
      if (!playRef.current) return
      if (e.code === 'KeyF' && !e.repeat) {
        equip('lash')
        keys.current.useAhead = { tool: 'lash', at: performance.now() }
      }
      const slot = SLOT_KEYS.indexOf(e.code)
      if (slot >= 0 && !e.repeat) {
        const item = getSlots()[slot]
        if (item && equip(item)) {
          // items that take clicks here fire at once; ones you just hold (the Tide Glass in most levels) go in hand
          if (actionTools.has(item) || STROKE_TOOLS.has(item)) keys.current.useAhead = { tool: item, at: performance.now() }
        } else {
          sfxRefuse()
          window.dispatchEvent(new CustomEvent('loadout-miss', { detail: { slot, item } }))
        }
      }
      if (e.code === 'KeyG' && !e.repeat) {
        // the lash's stance: chain (strike chains) or cochain (evaluate on the dual)
        const st = state.current
        st.stance = st.stance === 'cochain' ? 'chain' : 'cochain'
        window.dispatchEvent(new CustomEvent('lash-stance', { detail: st.stance }))
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

  useEffect(() => setHeld(tool), [tool]) // the corner buttons light the one in hand

  useEffect(() => {
    if (!purge) return
    for (const e of enemies.current) if (e.alive) (e.alive = false), (e.dying = 0.5)
    report()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purge])

  const inside = (x, z) => shape.inside(x, z)
  const enemyInside = (x, z) => (shape.insideForSpawn || shape.inside)(x, z)

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = state.current
    const t = tRef?.current ?? 0

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
    if (keys.current.useAhead && performance.now() - keys.current.useAhead.at > 400) keys.current.useAhead = null // a press that never landed
    if (playEnabled && !onPier) {
      const k = keys.current
      mx = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0)
      mz = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0)
      s.fwd = -mz
      if (camYawRef) {
        // camera-relative: forward is away from the camera, right is the camera's right. The frame
        // is latched when the keys change, so holding S turns Gyroid round and he keeps running that
        // way while the camera swings in behind him (rather than chasing its own tail).
        const f = -mz
        const r = mx
        const sig = f * 3 + r
        if (sig !== s.inSig) {
          s.inSig = sig
          s.inYaw = camYawRef.current
        }
        const yaw = s.inYaw
        mx = -Math.sin(yaw) * f + Math.cos(yaw) * r
        mz = -Math.cos(yaw) * f - Math.sin(yaw) * r
      }
      const ua = k.useAhead
      if (ua && tool !== 'lash' && tool === ua.tool) {
        // J / K / L: use the item toward the mouse if it's over the ground, else just ahead
        k.useAhead = null
        clicks.current.push(aim.current ? [...aim.current] : [s.x + Math.sin(s.face) * 1.2, s.z + Math.cos(s.face) * 1.2])
      } else if (ua && performance.now() - ua.at > 400) k.useAhead = null // the switch never landed
      if (ua && ua.tool === 'lash' && tool === 'lash') {
        // F: the lash, toward a beast if one is in reach; waits a moment for the switch to the Lash to land
        k.useAhead = null
        {
          // aim assist: a live beast close by and roughly ahead takes the lash, wherever the mouse is
          // (only beasts the lash can actually reach; ahead first, then the nearest from any side)
          let best = null
          let bd = Infinity
          let side = null
          let sd = Infinity
          for (const e of enemies.current) {
            // never auto-aim at a judgment beacon (lashing one is a verdict, not a fight)
            if (!e.alive || e.dying || e.type === 'beacon' || ENEMY[e.type]?.speed === 0) continue
            const d = Math.hypot(e.x - s.x, e.z - s.z)
            if (d > WHIP_RANGE + (ENEMY[e.type]?.radius || 0.4)) continue
            let da = Math.atan2(e.x - s.x, e.z - s.z) - s.face
            da = Math.atan2(Math.sin(da), Math.cos(da))
            if (Math.abs(da) < Math.PI / 4 && d < bd) (best = e), (bd = d)
            if (d < sd) (side = e), (sd = d)
          }
          best = best || side
          clicks.current.push(best ? [best.x, best.z] : aim.current ? [...aim.current] : [s.x + Math.sin(s.face) * 1.5, s.z + Math.cos(s.face) * 1.5])
        }
      }
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

    // --- clicks: lash toward the click, stroke tools, or action tools (see worldTools.jsx)
    const canStroke = spoolEnabled && STROKE_TOOLS.has(tool)
    for (const [cx, cz] of clicks.current) {
      if (!playEnabled || onPier) continue
      if (STROKE_TOOLS.has(tool)) {
        if (!canStroke) continue
        if (!s.spooling) {
          if (onStrokeStart?.(s.x, s.z, cx, cz) === false) continue // nothing to take hold of here
          s.spooling = true
          onSpooling?.(true)
        } else {
          // (the level may pick something else up in onStrokeEnd and set spooling again)
          s.spooling = false
          onSpooling?.(false)
          onStrokeEnd?.(cx, cz)
        }
      } else if (actionTools.has(tool)) {
        s.face = Math.atan2(cx - s.x, cz - s.z)
        if (SWING_TOOLS.has(tool)) {
          s.swing = 0.0001
          s.clanged = false
        }
        onAction?.(s.x, s.z, cx, cz) // the level decides what the tool does
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
    if (s.spooling && !canStroke) {
      // switched weapons or the stage moved on: tie off the thread
      s.spooling = false
      onStrokeEnd?.()
      onSpooling?.(false)
    }
    if (s.spooling && ml > 0) onStrokeMove?.(s.x, s.z)
    if (tool === 'cord' && ml > 0 && playEnabled && !onPier) onTrackMove?.(s.x, s.z)

    // --- whip
    if (s.swing > 0) {
      s.swing += dt / 0.42
      if (!s.clanged && s.swing >= 0.55) {
        s.clanged = true
        sfxHammer()
      }
      if (s.swing >= 1) s.swing = 0
    }
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
            // levels can refuse a hit (1-8 liftlings on another sheet, 1-10 guards that haven't stacked)
            if (stage.canHit && stage.canHit(e) === false) {
              e.refused = 0.8
              e.stun = 0.25
              sfxRefuse()
              stage.onRefused?.(e)
              continue
            }
            // 1-6: a patrol only takes a hit if it is on the loop its word says to strike next
            if (e.type === 'patrol' && ribbonApi?.current?.patrolLash && !ribbonApi.current.patrolLash(e)) continue
            // the cohomology wing answers to the stance
            const rule = ENEMY[e.type]?.rule
            if (rule) {
              const st = s.stance || 'chain'
              if (rule === 'harpy' && st === 'chain') {
                // it evaluates the chain you hit it with — and grows on it
                e.hp = Math.min(e.maxHp, e.hp + 1)
                e.fed = 0.6
                e.refused = 0.8
                sfxRefuse()
                continue
              }
              if (rule === 'spectre' && !(e.exact > 0)) {
                e.refused = 0.8 // a closed form that isn't exact: the lash passes through
                sfxRefuse()
                continue
              }
              if (rule === 'colossus') {
                const want = e.nextStance || 'chain'
                if (st !== want) {
                  e.refused = 0.8
                  sfxRefuse()
                  continue
                }
                e.nextStance = want === 'chain' ? 'cochain' : 'chain'
              }
              if (rule === 'spider') {
                if (e.lastStance === st) {
                  // the graded sign: strike the same way twice and the web snaps back at you
                  e.refused = 0.8
                  if (s.hurt === 0) {
                    s.hurt = 1.3
                    s.hearts = Math.max(0, s.hearts - 1)
                    sfxHurt()
                    onHearts?.(s.hearts)
                  }
                  continue
                }
                e.lastStance = st
              }
            }
            e.hp--
            e.flash = 0.15
            sfxHit()
            const row = ENEMY[e.type] || {}
            if (row.torsionAt && e.hp === row.torsionAt - 1) {
              // 2-torsion: one lash only flips it; the next must come before it settles back
              e.flipped = true
              e.torsionClock = TORSION_WINDOW
            } else if (row.torsionAt && e.hp < row.torsionAt - 1) e.flipped = false
            if (e.type === 'mobius' && e.hp === 1) e.speedMul = 2 // cut down the middle: one band, twice as long, twice as fast
            if (e.type === 'earring') e.speedMul = 1 + (e.maxHp - e.hp) * 0.3
            // a level can react to a hit, and can keep the target standing (1-9's Stack sentinel swaps the start vertex, again and again)
            if (stage.onEnemyHit?.(e) === 'keep') e.hp++
            e.stun = 0.5
            // a flipped (torsion) enemy stays put, so the second lash of the pair can land
            const kb = e.type === 'beacon' || ENEMY[e.type].speed === 0 || e.flipped ? 0 : 0.55 / (d || 1)
            const kx = e.x + dx * kb
            const kz = e.z + dz * kb
            if (enemyInside(kx, kz)) (e.x = kx), (e.z = kz)
            if (e.hp <= 0) {
              beastMet(e.type) // the codex's bestiary
              e.alive = false
              e.dying = e.type === 'torus' ? 0.6 : 0.5
              if (e.linked) {
                // 1-10: the copies of a guard on every sheet fall together
                for (const o of enemies.current) if (o.alive && o !== e && o.linked && o.type === e.type && o.site === e.site) (o.alive = false), (o.dying = 0.5)
              }
              sfxPop()
              report()
              const tough = (ENEMY[e.type]?.hp || 1) >= 2
              if (elixirs && Math.random() < (tough ? 0.45 : 0.15)) {
                window.dispatchEvent(new CustomEvent('elixir-drop'))
                drops.current.push({ id: dropId.current++, x: e.x, z: e.z })
                setDropCount((n) => n + 1)
              }
            }
          }
        }
      }
      if (s.whip >= 1) s.whip = 0
    }

    // --- Klein Elixirs: walk over one for every heart back
    for (const dr of drops.current) {
      if (!dr.taken && s.hearts < HEARTS && Math.hypot(dr.x - s.x, dr.z - s.z) < 0.75) {
        dr.taken = true
        s.hearts = HEARTS
        onHearts?.(s.hearts)
        sfxPop()
        setDropCount((n) => n + 1)
      }
    }

    // --- spawn: wander, chase when close, hurt on contact
    if (playEnabled) s.hurt = Math.max(0, s.hurt - dt) // the grace clock waits while a dialogue holds the world
    const drift = playEnabled && stage.drift ? stage.drift(clock.elapsedTime) : null
    for (const e of enemies.current) {
      e.flash = Math.max(0, e.flash - dt)
      e.snipping = Math.max(0, e.snipping - dt)
      e.px = s.x // so a beast can turn its eye on Gyroid
      e.pz = s.z
      if (e.fed > 0) e.fed -= dt
      if (e.type === 'spectre' && e.alive) {
        // run a closed loop round it and the line integral of its form is nonzero: it's forced exact
        e.exact = Math.max(0, (e.exact || 0) - dt)
        const ang = Math.atan2(s.x - e.x, s.z - e.z)
        const dd = Math.hypot(s.x - e.x, s.z - e.z)
        if (dd < 3.6 && e.lastAng !== undefined) {
          e.wind = (e.wind || 0) + Math.atan2(Math.sin(ang - e.lastAng), Math.cos(ang - e.lastAng))
          if (Math.abs(e.wind) >= Math.PI * 2) {
            e.exact = 4.5
            e.wind = 0
            sfxPop()
          }
        } else if (dd >= 3.6) e.wind = 0
        e.lastAng = ang
        e.windFrac = Math.abs(e.wind || 0) / (Math.PI * 2)
      }
      if (e.flipped && e.alive && (e.torsionClock -= dt) <= 0) {
        // the torsion pair wasn't finished: it untwists back
        e.flipped = false
        e.hp = ENEMY[e.type].torsionAt
        e.refused = 0.8
      }
      e.refused = Math.max(0, (e.refused || 0) - dt)
      if (e.dying > 0) {
        e.dying = Math.max(0, e.dying - dt)
        continue
      }
      if (!e.alive) continue
      if (e.type === 'beacon') continue // beacons just stand and wait to be judged
      if (e.type === 'hedge' && playEnabled && !onPier) {
        // 1-1: a hedge-sprout swells and takes root unless it is lashed first
        e.rooting = Math.min(1, (e.rooting || 0) + dt / ENEMY.hedge.rootTime)
        if (e.rooting >= 1) {
          sfxRoot()
          if (ribbonApi?.current?.sproutHedge?.(e.x, e.z)) {
            e.alive = false
            e.dying = 0.4
            report()
            continue
          }
          e.rooting = 0 // nowhere to take root here: it uproots and tries again
        }
      }
      if (e.stun > 0) {
        e.stun -= dt
        e.beam = 0 // a lashed Coner loses its beam
        continue
      }
      const cfg = ENEMY[e.type]
      const dx = s.x - e.x
      const dz = s.z - e.z
      const d = Math.hypot(dx, dz)
      const leash = Math.hypot(s.x - e.hx, s.z - e.hz) < (e.commons ? 4.5 : 6.5) // spawn guard their own patch of reef (plaza packs a tighter one)
      e.cooldown = Math.max(0, e.cooldown - dt)
      const ribbonGoal = (e.type === 'snapper' || e.type === 'unglue' || e.type === 'coner' || e.type === 'biter') && e.cooldown === 0 && playEnabled && !onPier ? ribbonApi?.current?.target(e) : null
      if (drift && e.type !== 'snapper' && e.type !== 'unglue' && e.type !== 'coner' && e.type !== 'biter') {
        // spawn drift with the tide
        const nx = e.x + drift[0] * dt
        const nz = e.z + drift[1] * dt
        if (enemyInside(nx, nz)) (e.x = nx), (e.z = nz)
      }
      if (ribbonGoal && d > 1.4) {
        // Snappers go for the ribbon; when they reach it, they clip it
        e.tx = ribbonGoal[0]
        e.tz = ribbonGoal[1]
        const beams = e.type === 'coner' || e.type === 'biter'
        if (beams && Math.hypot(e.tx - e.x, e.tz - e.z) < 0.45) {
          // Coners hover and beam, Loop-biters chew; it lands only if they run their course
          if (!e.beam) e.beam = e.type === 'biter' ? 2.2 : 2.6
          e.beam -= dt
          e.tx = e.x
          e.tz = e.z
          if (e.beam <= 0) {
            e.beam = 0
            ribbonApi.current.snip(e.x, e.z)
            e.cooldown = 8
            e.retarget = 0
          }
        } else if (!beams && Math.hypot(e.tx - e.x, e.tz - e.z) < 0.28) {
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
      // levels can steer a spawn themselves (1-6 patrols walk their word, 1-10 guards stack): the hook sets e.x/e.z (and e.tx/e.tz)
      stage.enemyAI?.(e, dt, s)
      const vx = e.tx - e.x
      const vz = e.tz - e.z
      const vl = Math.hypot(vx, vz)
      if (vl > 0.01 && playEnabled) {
        const nx = e.x + (vx / vl) * cfg.speed * (e.speedMul || 1) * dt
        const nz = e.z + (vz / vl) * cfg.speed * (e.speedMul || 1) * dt
        if (enemyInside(nx, nz)) (e.x = nx), (e.z = nz)
        else if (enemyInside(nx, e.z)) e.x = nx
        else if (enemyInside(e.x, nz)) e.z = nz
        else e.retarget = 0
        e.face = Math.atan2(vx, vz)
      }
      const touch = CONTACT + cfg.radius * 0.5 // biting distance (the bite check below allows +0.08)
      if (d < touch && d > 0.001 && cfg.speed > 0) {
        // never stand inside Gyroid: ease back out to biting distance (not past it, or a still player is never bitten)
        const push = (touch - d) / d
        const px = e.x - dx * push
        const pz = e.z - dz * push
        if (enemyInside(px, pz)) (e.x = px), (e.z = pz)
      }
      if (d < CONTACT + cfg.radius * 0.5 + 0.08 && s.hurt === 0 && playEnabled && !onPier && !cfg.harmless) {
        s.hurt = 1.3
        s.hearts = Math.max(0, s.hearts - 1)
        sfxHurt()
        onHearts?.(s.hearts)
        const kx = s.x + (dx / (d || 1)) * 0.7
        const kz = s.z + (dz / (d || 1)) * 0.7
        if (inside(kx, kz)) (s.x = kx), (s.z = kz)
        e.stun = 0.8
        if (e.type === 'spider' && !e.graded) {
          e.graded = true // cupped itself up to degree 2: slower, armored, one more lash
          e.speedMul = 0.6
          e.hp += 1
          e.maxHp += 1
        }
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
      cast: STROKE_TOOLS.has(tool) && !onPier ? 0.3 : 0,
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
      <Lash state={state} range={WHIP_RANGE} hitAt={WHIP_HIT_AT} equipped={tool === 'lash' && !onPier} />
      {!onPier && <SpoolLoop state={state} tool={tool} />}
      {!onPier && <GlassProp state={state} tool={tool} />}
      {!onPier && <SmithProp state={state} tool={tool} />}
      {!onPier && <SlingProp state={state} tool={tool} />}
      {!onPier && <CordProp state={state} tool={tool} />}
      {!onPier && <ClaspProp state={state} tool={tool} />}
      {!onPier && <CompassProp state={state} tool={tool} />}
      {!onPier && <CoilProp state={state} tool={tool} />}
      {!onPier && <BladeProp state={state} tool={tool} />}
      {!onPier && <DialProp state={state} tool={tool} />}
      {!onPier && <CasterProp state={state} tool={tool} />}
      {!onPier && <WandProp state={state} tool={tool} />}
      {!onPier && <ExtensionProp state={state} tool={tool} />}
      <EnemyList enemies={enemies} />
      {drops.current.filter((dr) => !dr.taken).map((dr) => <KleinElixir key={dr.id} x={dr.x} z={dr.z} />)}
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
          // a floating spawn under the cursor takes the click before the ground behind it
          let best = null
          let bestD = Infinity
          for (const en of enemies.current) {
            if (!en.alive) continue
            pickSphere.center.set(en.x, 0.75, en.z)
            pickSphere.radius = (ENEMY[en.type]?.radius || 0.4) + 0.25
            if (e.ray.intersectSphere(pickSphere, pickHit)) {
              const dd = pickHit.distanceTo(e.ray.origin)
              if (dd < bestD) (bestD = dd), (best = en)
            }
          }
          clicks.current.push(best ? [best.x, best.z] : [e.point.x, e.point.z])
        }}
      >
        <planeGeometry args={[240, 240]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}
