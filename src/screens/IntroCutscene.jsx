import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import IntroWorld from '../intro/IntroWorld'
import { createIntroScore } from '../audio/introScore'
import { CAPTIONS, INTRO_START, INTRO_TOTAL, TITLE_CARD, seg, wallAt } from '../data/introScript'

const CHARS_PER_SEC = 30 // typing speed, in real seconds
const MUTE_KEY = 'winding-world:muted'

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

// Zoom each full-body character sheet in on the face: [zoom %, x %, y %]
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}

export default function IntroCutscene({ concept, onSkipIntro, onIntroDone }) {
  // dev: ?t=…&pause starts the overlay at that time too
  const [t, setT] = useState(() => {
    const q = new URLSearchParams(window.location.search)
    return q.has('t') ? Number(q.get('t')) : INTRO_START
  })
  const [wall, setWall] = useState(() => wallAt(t))
  const lastTick = useRef(-1)
  const done = useRef(false)
  const score = useRef(null)
  const scoreStarted = useRef(false)
  const [muted, setMuted] = useState(readMuted)

  // Music: created on mount (New Game click unlocks audio), started on the scene's first frame
  useEffect(() => {
    const s = createIntroScore()
    score.current = s
    scoreStarted.current = false
    if (!s) return
    s.setMuted(readMuted())
    s.resume()
    const unlock = () => s.resume() // e.g. dev links that open the intro without a click
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      s.stop()
    }
  }, [])

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    score.current?.setMuted(next)
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* storage unavailable: mute just won't persist */
    }
  }

  // The 3D scene drives the clock; the overlay only needs ~20 updates a second.
  const onTick = useCallback(
    (time, wallTime) => {
      if (!scoreStarted.current && score.current) {
        scoreStarted.current = true
        score.current.start(time)
      }
      const q = Math.floor(wallTime * 20)
      if (q !== lastTick.current) {
        lastTick.current = q
        setT(time)
        setWall(wallTime)
      }
      if (time >= INTRO_TOTAL && !done.current) {
        done.current = true
        onIntroDone?.()
      }
    },
    [onIntroDone],
  )
  const scene = useMemo(() => <IntroWorld onTick={onTick} />, [onTick])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') onSkipIntro?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSkipIntro])

  const cap = CAPTIONS.find((c) => t >= c.t && t < c.end)
  const shown = cap ? cap.text.slice(0, Math.floor((wall - wallAt(cap.t)) * CHARS_PER_SEC)) : ''
  const title = seg(t, TITLE_CARD.t, TITLE_CARD.t + 1.2) * (1 - seg(t, TITLE_CARD.end - 0.8, TITLE_CARD.end))
  const fade = Math.max(1 - seg(t, INTRO_START, INTRO_START + 1.2), seg(t, INTRO_TOTAL - 0.8, INTRO_TOTAL))
  const level1 = concept?.worlds?.[0]?.levels?.[0]
  const story = concept?.story || {}
  const base = import.meta.env.BASE_URL

  return (
    <div className="screen intro">
      <Canvas camera={{ position: [20, 12, 20], fov: 40, near: 0.1, far: 200 }} dpr={[1, 1.75]}>
        {scene}
      </Canvas>

      <div className="letterbox top" />
      <div className="letterbox bottom" />
      <div className="intro-fade" style={{ opacity: fade }} />

      <div className="ui-overlay">
        <div className="hud-top">
          <div />
          <div className="btn-row">
            <button type="button" className="btn ghost" onClick={toggleMute} aria-pressed={muted}>
              {muted ? '♪ Sound off' : '♪ Sound on'}
            </button>
            <button type="button" className="btn ghost" onClick={onSkipIntro}>
              Skip ▸
            </button>
          </div>
        </div>

        {cap && (
          <div key={cap.t} className={`intro-caption ${cap.portrait ? 'has-portrait' : 'narrator'}`}>
            {cap.portrait && (
              <div
                className="portrait"
                role="img"
                aria-label={cap.speaker}
                style={{
                  backgroundImage: `url(${base}assets/characters/${cap.portrait}.png)`,
                  backgroundSize: PORTRAIT_CROP[cap.portrait][0],
                  backgroundPosition: `${PORTRAIT_CROP[cap.portrait][1]} ${PORTRAIT_CROP[cap.portrait][2]}`,
                }}
              />
            )}
            <div>
              <span className="speaker">{cap.speaker}</span>
              <p>{shown}</p>
            </div>
          </div>
        )}

        {title > 0 && (
          <div className="intro-title" style={{ opacity: title }}>
            <h1>{story.title || 'Winding World'}</h1>
            <p className="tagline">{story.tagline || "Shape can change. Topology can't."}</p>
            {level1 && <p className="level-tag">World 0 · Level 1 — {level1.title}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
