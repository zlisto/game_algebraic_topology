import { useState } from 'react'

/** Debug level select: every screen, plus 0-2's shrines. Local dev only (or ?debug on a build). */
const DEBUG_ENTRIES = [
  { group: 'Opening', items: [{ label: 'Intro movie', screen: 'intro' }] },
  { group: 'World 0 · Level 1 — Retract Reef', items: [{ label: 'Level 0-1', screen: 'level1' }] },
  {
    group: 'World 0 · Level 2 — Tidewarp Flats',
    items: [
      { label: 'Intro movie', screen: 'movie02' },
      { label: 'Lesson: How the Tide Works', screen: 'lesson02' },
      { label: 'Level 0-2 (from the start)', screen: 'level2' },
      { label: '↳ Shrine 1 · Tide Line', screen: 'level2', opts: { startAt: 'tide_line' } },
      { label: '↳ Shrine 2 · Hold the Posts', screen: 'level2', opts: { startAt: 'hold_posts' } },
      { label: '↳ Shrine 3 · The Pools', screen: 'level2', opts: { startAt: 'the_pools' } },
      { label: '↳ Shrine 4 · Null’s Snap', screen: 'level2', opts: { startAt: 'nulls_snap' } },
    ],
  },
  {
    group: 'World 0 · Level 3 — Mirror Shoals',
    items: [
      { label: 'Intro movie', screen: 'movie03' },
      { label: 'Lesson: Same Shape', screen: 'lesson03' },
      { label: 'Level 0-3 (from the start)', screen: 'level3' },
      { label: '↳ Solid Shoal', screen: 'level3', opts: { startAt: 'solid_shoal' } },
      { label: '↳ Ring Reef', screen: 'level3', opts: { startAt: 'ring_reef' } },
      { label: '↳ Twin Mirror', screen: 'level3', opts: { startAt: 'twin_mirror' } },
      { label: '↳ Dumbbell', screen: 'level3', opts: { startAt: 'dumbbell' } },
      { label: '↳ The Mirror Gate', screen: 'level3', opts: { startAt: 'mirror_gate' } },
    ],
  },
]
const SHOW_DEBUG = import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')

function LevelSelect({ onGo, onClose }) {
  return (
    <div className="level-select" role="dialog" aria-label="Level select">
      <div className="level-select-card">
        <div className="level-select-head">
          <h2>Level select</h2>
          <span className="lvl-kicker">debug</span>
          <button type="button" className="btn ghost small" onClick={onClose}>
            ✕
          </button>
        </div>
        {DEBUG_ENTRIES.map((g) => (
          <div key={g.group} className="level-select-group">
            <h3>{g.group}</h3>
            {g.items.map((it) => (
              <button key={it.label} type="button" className="level-select-item" onClick={() => onGo(it.screen, it.opts)}>
                {it.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TitleScreen({ concept, onNewGame, onGo }) {
  const story = concept?.story || {}
  const title = story.title || 'Winding World'
  const tagline = story.tagline || "Shape can change. Topology can't."
  const cover = `${import.meta.env.BASE_URL}assets/cover.png`
  const [picking, setPicking] = useState(false)

  return (
    <div className="title-screen">
      {/* square cover art: blurred copy fills the screen, the full image sits on top uncropped */}
      <div className="title-backdrop" style={{ backgroundImage: `url(${cover})` }} />
      <div className="title-art" style={{ backgroundImage: `url(${cover})` }} />
      <div className="title-card">
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={onNewGame}>
            New Game
          </button>
          <button type="button" className="btn" disabled title="Coming soon">
            Continue
          </button>
          {SHOW_DEBUG && (
            <button type="button" className="btn ghost" onClick={() => setPicking(true)} title="Debug: jump to any level, movie or lesson">
              Level select
            </button>
          )}
        </div>
      </div>
      {picking && <LevelSelect onGo={onGo} onClose={() => setPicking(false)} />}
    </div>
  )
}
