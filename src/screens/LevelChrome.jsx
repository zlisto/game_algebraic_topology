import { useEffect, useRef, useState } from 'react'
import { duckMusic } from '../audio/chip'
import MathText from './MathText'
import CodexMenu from '../codex/CodexMenu'
import { noteSeen } from '../codex/store'

/**
 * Shared level chrome for the third-person overworld levels (0-1, 0-2, …): Esc pause and its menu,
 * Emmy's end-of-level card, and the minimap's view cone.
 */

const CROP = { 'emmy-boundary': ['400%', '54%', '5%'] }
export function EmmyPortrait() {
  const [size, x, y] = CROP['emmy-boundary']
  return (
    <div
      className="portrait"
      role="img"
      aria-label="Emmy Boundary"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/characters/emmy-boundary.png)`, backgroundSize: size, backgroundPosition: `${x} ${y}` }}
    />
  )
}

/** Esc toggles pause (not once the level is clear); the music dips while paused. */
export function usePause(disabled) {
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape' || disabled) return
      e.preventDefault()
      setPaused((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled])
  useEffect(() => {
    duckMusic(paused)
  }, [paused])
  return [paused, setPaused]
}

export function PauseMenu({ title, progress, onResume, onRestart, onTitle }) {
  const [codex, setCodex] = useState(false)
  if (codex) return <CodexMenu onClose={() => setCodex(false)} />
  return (
    <div className="win-banner pause">
      <div className="win-card">
        <span className="lvl-kicker">Paused</span>
        <h2>{title}</h2>
        {progress && <p className="next-up">{progress}</p>}
        <div className="btn-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <button type="button" className="btn primary" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="btn" onClick={() => setCodex(true)}>
            Codex · bestiary, relics, notes
          </button>
          {onRestart && (
            <button type="button" className="btn" onClick={onRestart}>
              Restart level
            </button>
          )}
          <button type="button" className="btn" onClick={onTitle}>
            Title screen
          </button>
        </div>
        <p className="cite">Esc to resume</p>
      </div>
    </div>
  )
}

/** Emmy sums up the level: what we learned, what lies ahead; the formal definition tucked beneath. */
export function EmmyEndCard({ kicker, title, learned, ahead, definition, onStay, onNext, nextLabel, extra, stayLabel = 'Keep exploring', defLabel = 'The definition (after Hatcher)' }) {
  // the codex keeps a note of every level cleared: its definition from the book and Emmy's summary
  useEffect(() => {
    noteSeen({ kicker, title, learned, definition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="win-banner exit">
      <div className="win-card wide">
        <span className="lvl-kicker">{kicker}</span>
        <h2>{title}</h2>
        <div className="endcard-emmy">
          <EmmyPortrait />
          <div>
            <span className="speaker">Emmy Boundary</span>
            <h4>What we learned</h4>
            <p>
              <MathText text={learned} />
            </p>
            <h4>What lies ahead</h4>
            <p>
              <MathText text={ahead} />
            </p>
          </div>
        </div>
        {definition && (
          <details className="endcard-def">
            <summary>{defLabel}</summary>
            <p className="def">{definition.text}</p>
            <p className="cite">
              {definition.cite}{' '}
              <a href={definition.url} target="_blank" rel="noreferrer">
                Read the book
              </a>
            </p>
          </details>
        )}
        <div className="btn-row">
          <button type="button" className="btn" onClick={onStay}>
            {stayLabel}
          </button>
          {extra}
          <button type="button" className="btn primary" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/** The Warp Portal on a minimap: a swirl that pulses once it's open, a dim ring while sealed. */
export function WarpIcon({ x, y, open }) {
  return (
    <g className={open ? 'warp-icon open' : 'warp-icon'} transform={`translate(${x} ${y})`}>
      {open && <circle r="4.2" className="warp-pulse" fill="none" stroke="#c8b6ff" strokeWidth="0.8" />}
      <circle r="2.6" fill={open ? '#6a4ad8' : '#2a2d3a'} stroke={open ? '#ffffff' : '#6a6e80'} strokeWidth="0.6" />
      {open && <path d="M 0 0 m -1.6 0 a 1.6 1.6 0 1 1 1.6 1.6 a 0.9 0.9 0 1 1 -0.9 -0.9" fill="none" stroke="#ffffff" strokeWidth="0.5" />}
    </g>
  )
}

/** An SVG wedge for a minimap: which way Gyroid is facing, from (x, y) in map units. */
export function ViewCone({ x, y, face, r = 9, id = 'viewcone' }) {
  return (
    <>
      <defs>
        <radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={`M ${x} ${y} L ${x + Math.sin(face - 0.5) * r} ${y + Math.cos(face - 0.5) * r} A ${r} ${r} 0 0 0 ${x + Math.sin(face + 0.5) * r} ${y + Math.cos(face + 0.5) * r} Z`} fill={`url(#${id})`} />
    </>
  )
}

/**
 * Press E to talk to Emmy. `emmyRef.current` = { x, z } (the follower's position), `advice()` returns
 * dialogue lines for right now (what to do next), `say(lines)` plays them. `enabled` gates it (not mid-
 * dialogue, not paused). `claim(e)` may return true to let a level keep E for something else in context.
 * Returns whether Emmy is close enough to talk to, for the on-screen prompt.
 */
export function useEmmyTalk({ stateRef, emmyRef, enabled, advice, say, claim, reach = 3.2 }) {
  const [near, setNear] = useState(false)
  const live = { enabled, advice, say, claim }
  const ref = useRef(live)
  ref.current = live
  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      const e = emmyRef.current
      const n = !!(s && e && Math.hypot(s.x - e.x, s.z - e.z) < reach)
      setNear((v) => (v === n ? v : n))
    }, 200)
    const onKey = (ev) => {
      if (ev.code !== 'KeyE' || ev.repeat) return
      const r = ref.current
      if (!r.enabled || r.claim?.(ev)) return
      const s = stateRef.current
      const e = emmyRef.current
      if (!s || !e) return
      // out of reach: she hurries over (steps in just behind him) before she answers
      if (Math.hypot(s.x - e.x, s.z - e.z) > reach) {
        e.x = s.x - Math.sin(s.face || 0) * 1.4
        e.z = s.z - Math.cos(s.face || 0) * 1.4
      }
      e.rotY = Math.atan2(s.x - e.x, s.z - e.z)
      r.say(r.advice())
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return near && enabled
}

/** The on-screen reminder: "E · Talk to Emmy" when she's close, "Lost? Find Emmy and press E" otherwise. */
export function TalkPrompt({ near, show = true }) {
  if (!show) return null
  return <div className={`talk-prompt ${near ? 'near' : ''}`}>{near ? <><kbd>E</kbd> Talk to Emmy</> : <>Lost? Press <kbd>E</kbd> to call Emmy</>}</div>
}
