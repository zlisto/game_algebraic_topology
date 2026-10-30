import { Canvas, useFrame } from '@react-three/fiber'
import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import { SphereSpawn, TorusSpawn } from '../characters/Beasts'
import { BitorusSpawn, EarringSpawn, KleinSpawn, MobiusSpawn, ProjectiveSpawn } from '../characters/Bestiary'
import { ColossusSpawn, HarpySpawn, SpectreSpawn, SpiderSpawn } from '../characters/Cohomology'
import {
  BacktrackSpawn, ConerSpawn, CubeSentrySpawn, DeckGuardSpawn, FiberWraithSpawn, GlitchSpawn, LiftlingSpawn, LoopBiterSpawn,
  MirrorSpawn, PatrolSpawn, RetractorSpawn, ShardSpawn, SnapperSpawn, TwistThiefSpawn, UnglueSpawn, WinderSpawn,
  WhirlSpawn, ProjectorImpSpawn, FlipperSpawn, BogSpawn, CrumplerSpawn, LeakSpawn, QuarryGolemSpawn, GaleSpawn, EchoSpawn,
  VineChokerSpawn, MothSpawn, SeamWraithSpawn,
} from '../characters/Spawn'
import { Star } from '../levels/w0/StarPortal'
import MathText from '../screens/MathText'
import { BEASTS, CELLS, CELLS_REF, HATCHER, RELICS, cellsUnlocked } from './data'
import { readCodex } from './store'
import { ITEMS, LASH, SLOT_KEYS, SLOT_LABELS, getFound, getSlots, levelTools, inLevel, setSlot } from '../controls/loadout'

/**
 * The menu (Tab in play) and codex: everything the player has met, from the pause menu or the title screen.
 *   Items — what you carry, and which item sits on J, K and L · Bestiary — the spaces you've fought
 *   Relics — the reward objects · Cells — the building blocks · Concepts — each level's definition and Emmy's summary
 */

export const VIEW = {
  sphere: SphereSpawn, torus: TorusSpawn, snapper: SnapperSpawn, mobius: MobiusSpawn, projective: ProjectiveSpawn,
  klein: KleinSpawn, bitorus: BitorusSpawn, earring: EarringSpawn, harpy: HarpySpawn, spider: SpiderSpawn,
  spectre: SpectreSpawn, colossus: ColossusSpawn, shard: ShardSpawn, mirror: MirrorSpawn, coner: ConerSpawn,
  biter: LoopBiterSpawn, backtrack: BacktrackSpawn, winder: WinderSpawn, retractor: RetractorSpawn, patrol: PatrolSpawn,
  unglue: UnglueSpawn, liftling: LiftlingSpawn, deck_guard: DeckGuardSpawn, cube_sentry: CubeSentrySpawn, glitch: GlitchSpawn,
  fiber_wraith: FiberWraithSpawn, twist_thief: TwistThiefSpawn,
  whirl: WhirlSpawn, projector_imp: ProjectorImpSpawn, flipper: FlipperSpawn, bog: BogSpawn, crumpler: CrumplerSpawn, leak: LeakSpawn,
  quarry_golem: QuarryGolemSpawn, gale: GaleSpawn, echo: EchoSpawn, vine_choker: VineChokerSpawn, moth: MothSpawn, seam_wraith: SeamWraithSpawn,
}

/** A beast standing still for its portrait, turning slowly. */
function BeastModel({ type }) {
  const e = useMemo(() => ({ x: type === 'mirror' ? -0.4 : 0, z: 0, axis: 0, face: 0.5, alive: true, dying: 0, flash: 0, seed: 1, hp: 3, maxHp: 3, type }), [type])
  const g = useRef()
  useFrame((_, dt) => {
    e.face += dt * 0.5
  })
  const C = VIEW[type]
  return <group ref={g}>{C && createElement(C, { e })}</group>
}

/** A 0/1/2/3-cell. */
function CellModel({ id }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.5
  })
  const mat = <meshStandardMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={0.6} />
  return (
    <group ref={g} position={[0, 1, 0]}>
      {id === 'e0' && <mesh><sphereGeometry args={[0.12, 20, 14]} />{mat}</mesh>}
      {id === 'e1' && (
        <>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 1.4, 12]} />{mat}</mesh>
          {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, 0, 0]}><sphereGeometry args={[0.09, 14, 10]} /><meshStandardMaterial color="#7fd8ff" emissive="#7fd8ff" emissiveIntensity={0.8} /></mesh>)}
        </>
      )}
      {id === 'e2' && (
        <>
          <mesh rotation={[-Math.PI / 2.4, 0, 0]}><circleGeometry args={[0.7, 48]} /><meshStandardMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={0.35} transparent opacity={0.8} side={2} /></mesh>
          <mesh rotation={[-Math.PI / 2.4, 0, 0]}><torusGeometry args={[0.7, 0.03, 8, 64]} /><meshStandardMaterial color="#7fd8ff" emissive="#7fd8ff" emissiveIntensity={0.8} /></mesh>
        </>
      )}
      {id === 'e3' && (
        <>
          <mesh><sphereGeometry args={[0.65, 32, 24]} /><meshPhysicalMaterial color="#ffc861" emissive="#ff9a2a" emissiveIntensity={0.25} transparent opacity={0.45} roughness={0.2} /></mesh>
          <mesh><sphereGeometry args={[0.67, 32, 24]} /><meshBasicMaterial color="#7fd8ff" wireframe transparent opacity={0.35} /></mesh>
        </>
      )}
    </group>
  )
}

function Preview({ children, y = 1 }) {
  return (
    <div className="codex-preview">
      <Canvas camera={{ position: [0, y + 0.45, 2.3], fov: 40 }} dpr={[1, 1.5]} onCreated={({ camera }) => camera.lookAt(0, y, 0)}>
        <color attach="background" args={['#0d0f18']} />
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#b8a8ff', '#0a0612', 0.6]} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <pointLight position={[-2, 2, 2]} intensity={6} distance={8} color="#a259ff" />
        {children}
      </Canvas>
    </div>
  )
}

const BLURB = {
  items: 'Pick an item, then press J, K or L (or click a button below) to put it on that button. F is always the Lash.',
  bestiary: 'Every beast is a space. Its lash count is one of its invariants.',
  relics: 'Each level’s reward: a picture of the idea it proved.',
  cells: 'The building blocks every cell complex is glued from.',
  notes: 'Each idea as you learn it: the book’s definition, and Emmy’s summary where she gave one.',
}

function useCodex() {
  const [c, setC] = useState(readCodex)
  const [, bump] = useState(0)
  useEffect(() => {
    const on = () => setC(readCodex())
    const lo = () => bump((n) => n + 1)
    window.addEventListener('codex-update', on)
    window.addEventListener('loadout-update', lo)
    return () => {
      window.removeEventListener('codex-update', on)
      window.removeEventListener('loadout-update', lo)
    }
  }, [])
  return c
}

/** The item order in the menu: roughly the order you find them. */
const ITEM_ORDER = ['spool', 'glass', 'smith', 'cord', 'sling', 'clasp', 'compass', 'blade', 'dial', 'wand', 'caster']

function List({ items, sel, onSel, label, tab, locked = '?' }) {
  return (
    <ul className="codex-list">
      {items.map((it, i) => (
        <li key={it.key}>
          <button type="button" className={`${sel === i ? 'on' : ''} ${it.got ? '' : 'locked'}`} disabled={!it.got} onClick={() => onSel(i)}>
            <span className="codex-sym">{it.got ? it.sym : it.hint || locked}</span>
            <span>{it.got ? label(it) : tab === 'relics' || tab === 'items' ? 'not found yet' : 'not beaten yet'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function CodexMenu({ onClose, initialTab = 'items' }) {
  const c = useCodex()
  const [tab, setTab] = useState(initialTab)
  const [sel, setSel] = useState(0)
  const found = getFound()
  const items = [
    { ...LASH, key: 'lash', got: true, sym: LASH.glyph },
    ...ITEM_ORDER.map((id) => ({ ...ITEMS[id], key: id, got: found.includes(id), sym: ITEMS[id].glyph, hint: '?' })),
  ]
  const curItem = tab === 'items' && items[sel]?.got ? items[sel] : null
  const curRef = useRef(null)
  curRef.current = curItem
  useEffect(() => {
    const k = (e) => {
      if (e.code === 'Escape' || e.code === 'Tab') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      // the game's buttons never reach the game while the menu is open
      const slot = SLOT_KEYS.indexOf(e.code)
      if (slot >= 0 || e.code === 'KeyF' || e.code === 'KeyG' || e.code === 'KeyE') e.stopPropagation()
      // on the Items tab, J / K / L put the chosen item on that button
      if (slot >= 0 && curRef.current && curRef.current.key !== 'lash') setSlot(slot, curRef.current.key)
    }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [onClose])

  const beasts = BEASTS.map((b) => ({ ...b, key: b.type, got: !!c.beasts[b.type], sym: b.space, hint: b.where && `${b.where} ?` }))
  const relics = RELICS.map((r) => ({ ...r, key: r.kind, got: !!c.relics[r.kind], sym: r.level, hint: `${r.level} ?` }))
  const cellsOn = cellsUnlocked(c.notes)
  const cells = CELLS.map((x) => ({ ...x, key: x.id, got: cellsOn }))
  const notes = Object.entries(c.notes)
    .sort((a, b) => a[1].at - b[1].at)
    .map(([k, n]) => {
      const m = n.kicker.match(/World (\d+)(?: complete)?(?: · (Level [\w-]+|Castle|Bonus))?/i)
      return { ...n, key: k, got: true, sym: m ? `W${m[1]} · ${m[2] ? m[2].replace(/Level /i, '') : 'Castle'}` : '★' }
    })
  const lists = { items, bestiary: beasts, relics, cells, notes }
  const list = lists[tab]
  const counts = { items: items.filter((x) => x.got).length, bestiary: beasts.filter((x) => x.got).length, relics: relics.filter((x) => x.got).length, cells: cellsOn ? CELLS.length : 0, notes: notes.length }
  const totals = { items: items.length, bestiary: BEASTS.length, relics: RELICS.length, cells: CELLS.length, notes: null }
  // a new tab opens on its first entry you've found
  useEffect(() => setSel(Math.max(0, list.findIndex((x) => x.got))), [tab]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = list[sel]?.got ? list[sel] : null

  return (
    <div className="codex" role="dialog" aria-label="Codex">
      <div className="codex-card">
        <div className="codex-tabs" role="tablist">
          {[['items', 'Items'], ['bestiary', 'Bestiary'], ['notes', 'Concepts'], ['relics', 'Relics'], ['cells', 'Cells']].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
          <button type="button" className="btn ghost small codex-close" onClick={onClose}>
            Close ✕
          </button>
        </div>
        <div className="codex-body">
          <div className="codex-left">
            <p className="codex-blurb">{BLURB[tab]}</p>
            <p className="codex-count">{totals[tab] ? `${counts[tab]} of ${totals[tab]} found` : `${counts[tab]} lessons recorded`}</p>
            {tab === 'notes' && !notes.length ? (
              <p className="codex-empty">No concepts yet. Each level you clear records its idea, with the book’s definition, here.</p>
            ) : (
              <List items={list} sel={sel} onSel={setSel} tab={tab} label={(it) => it.name || it.title} />
            )}
          </div>
          <div className="codex-detail">
            {cur && tab === 'items' && <ItemDetail it={cur} />}
            {!cur && <p className="codex-empty">{tab === 'items' ? 'Find this item in a level to carry it.' : tab === 'cells' ? 'Clear the Skeleton Foundry (World 0 · Level 4) to log the cells.' : tab === 'relics' ? 'Collect a relic in its level to log it here.' : 'Defeat one to log it here.'}</p>}
            {cur && tab === 'bestiary' && (
              <>
                <Preview y={0.9}><BeastModel type={cur.type} /></Preview>
                <h3>{cur.name} <span className="codex-sym big">{cur.space}</span></h3>
                <dl>{cur.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><MathText text={v} /></dd></div>)}</dl>
                <p><MathText text={cur.text} /></p>
                <p className="cite">Hatcher, <em>Algebraic Topology</em> · {cur.ref} · <a href={HATCHER} target="_blank" rel="noreferrer">Read the book</a></p>
              </>
            )}
            {cur && tab === 'relics' && (
              <>
                <Preview y={1.4}><Star pos={[0, 0]} state="waiting" kind={cur.kind} /></Preview>
                <h3>{cur.name}</h3>
                <p className="codex-sub">Level {cur.level}</p>
                <p><MathText text={cur.text} /></p>
              </>
            )}
            {cur && tab === 'cells' && (
              <>
                <Preview y={1}><CellModel id={cur.id} /></Preview>
                <h3>{cur.name} <span className="codex-sym big">{cur.sym}</span></h3>
                <p><MathText text={cur.text} /></p>
                <p className="cite">Hatcher, <em>Algebraic Topology</em> · {CELLS_REF} · <a href={HATCHER} target="_blank" rel="noreferrer">Read the book</a></p>
              </>
            )}
            {cur && tab === 'notes' && (
              <>
                <p className="codex-sub">{cur.kicker}</p>
                <h3>{cur.title}</h3>
                {cur.text && <p className="def"><MathText text={cur.text} /></p>}
                {cur.learned && (
                  <>
                    <h4>Emmy: what we learned</h4>
                    <p><MathText text={cur.learned} /></p>
                  </>
                )}
                {cur.cite && (
                  <p className="cite">
                    {cur.cite} {cur.url && <a href={cur.url} target="_blank" rel="noreferrer">Read the book</a>}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** An item: what it does, and which button it's on. Pick a button to put it there. */
function ItemDetail({ it }) {
  const slots = getSlots()
  const here = levelTools()
  const lash = it.key === 'lash'
  return (
    <>
      <div className="codex-preview item-glyph"><span>{it.glyph}</span></div>
      <h3>{it.name}</h3>
      {inLevel() && <p className="codex-sub">{lash || here.includes(it.key) ? 'You carry it in this level.' : 'Not used in this level.'}</p>}
      <p>{it.text}</p>
      <div className="item-buttons">
        <span className={`item-btn ${lash ? 'on' : ''}`}><kbd>F</kbd> {LASH.name}</span>
        {SLOT_LABELS.map((k, i) => (
          <button type="button" key={k} className={`item-btn ${slots[i] === it.key ? 'on' : ''}`} disabled={lash} onClick={() => setSlot(i, it.key)}>
            <kbd>{k}</kbd> {slots[i] ? `${ITEMS[slots[i]].glyph} ${ITEMS[slots[i]].name}` : 'empty'}
          </button>
        ))}
      </div>
    </>
  )
}
