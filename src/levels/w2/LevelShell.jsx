import { useLoadout } from '../../controls/loadout'
/**
 * Shared World 2 level shell: dialogue, hearts, Emmy, map, exit, clear card.
 * Each Level2_K passes stations config + Scene + goal handlers via props/hooks.
 */
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LevelMovie from '../../screens/LevelMovie'
import LevelMap from '../../screens/LevelMap'
import MathText from '../../screens/MathText'
import { PauseMenu, usePause } from '../../screens/LevelChrome'
import { noteSeen } from '../../codex/store'
import useDialogKeys from '../../screens/useDialogKeys'
import { useExitTrigger } from '../../screens/exitTrigger'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import { WORLD_TOOLS } from '../w0/worldTools'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  sfxZoot,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'

// Stable shuffle of a question's options, seeded by its text, so the answer isn't always first.
function mixed(question, options = []) {
  let h = 2166136261
  for (const ch of question || '') h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const out = [...options]
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    const j = h % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const TYPE_CPS = 45
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  'count-null': ['600%', '50%', '26%'],
  commutator: ['500%', '53%', '19%'],
}

export function Portrait({ id, name }) {
  const [size, x, y] = PORTRAIT_CROP[id] || PORTRAIT_CROP.gyroid
  return (
    <div
      className="portrait"
      role="img"
      aria-label={name}
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/characters/${id}.png)`, backgroundSize: size, backgroundPosition: `${x} ${y}` }}
    />
  )
}

export const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
export const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
export const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

/**
 * @param {object} props
 * @param {object} props.layout
 * @param {string[]} props.stationOrder
 * @param {object} props.stations
 * @param {object} props.definition
 * @param {object} props.hints
 * @param {function} props.emmyAdvice
 * @param {object[]} props.opening
 * @param {React.ComponentType} props.Scene
 * @param {React.ComponentType} props.Lesson
 * @param {React.ComponentType} [props.LessonOverlay]
 * @param {React.ComponentType} [props.IntroMovie]
 * @param {function} props.startMusic
 * @param {string} props.kicker
 * @param {string} props.levelId  e.g. '2-1'
 * @param {string} [props.title]  overrides the title looked up from the concept (castles)
 * @param {string} props.className
 * @param {string[]} [props.tools] tool ids for HUD
 * @param {function} [props.renderRules] ({current,goal,done,extra}) => ReactNode
 * @param {function} [props.onAction] (gx,gz,cx,cz, ctx) => void
 * @param {function} [props.tick] (ctx) => void  — called ~25Hz while playing
 * @param {function} [props.extraState] () => object merged into advice/dev hooks
 * @param {function} [props.onStationDone] (id) => void
 * @param {string} [props.nextLabel]
 * @param {object} [props.toolKeys] code → tool id
 */
export default function LevelShell({
  concept,
  onBackToTitle,
  onNext,
  startAt,
  layout,
  stationOrder,
  stations,
  definition,
  hints,
  emmyAdvice,
  opening,
  Scene,
  Lesson,
  LessonOverlay,
  IntroMovie,
  startMusic,
  kicker,
  levelId,
  title,
  className,
  tools = ['lash'],
  renderRules,
  onAction,
  tick,
  extraState,
  nextLabel = 'Next level',
  toolKeys,
  worldIndex = 2,
}) {
  const SITES = useMemo(() => buildSites(layout), [layout])
  const SITE = useMemo(() => Object.fromEntries(SITES.map((s) => [s.id, s])), [SITES])
  const skipTo = Math.max(0, stationOrder.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(stationOrder.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() =>
    skipTo ? [SITE[stationOrder[skipTo]].pos[0], SITE[stationOrder[skipTo]].pos[1] + 2.2] : layout.start,
  )
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState(tools[0] || 'lash')
  useLoadout(tools, setTool) // the buttons: F, J, K, L
  const [stance, setStance] = useState('chain') // the lash's stance (G): chain or cochain
  useEffect(() => {
    const on = (ev) => setStance(ev.detail)
    window.addEventListener('lash-stance', on)
    return () => window.removeEventListener('lash-stance', on)
  }, [])
  const [askOpen, setAskOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [bag, setBag] = useState({})
  const stateRef = useRef(null)
  const frameRef = useRef(null)
  // the chase camera starts behind Gyroid, looking from the landing toward the first station
  const camYawRef = useRef(
    (() => {
      const first = SITE[stationOrder[0]]
      return first ? Math.atan2(layout.start[0] - first.pos[0], layout.start[1] - first.pos[1]) : 0
    })(),
  )
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyAt = useRef({ x: layout.start[0] - 1.2, z: layout.start[1] - 0.8, rotY: Math.PI })
  const emmyTalking = useRef(false)
  const [nearEmmy, setNearEmmy] = useState(false)
  const pendingArrive = useRef(null)

  const current = stationOrder.find((id) => !done[id]) || null
  const goals = current ? stations[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null

  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [layout, SITES, exitOpen])

  const flash = useCallback((text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }, [])

  const say = useCallback((ls, next = 'play') => {
    const list = ls || []
    setLines(list)
    setLineIdx(0)
    setPhase(list.length ? `talk:${next}` : next)
  }, [])

  const levelMeta = title ? { title } : concept?.worlds?.[worldIndex]?.levels?.find((l) => l.id === levelId) || { title: levelId }

  useEffect(() => {
    unlockAudio()
    startMusic?.()
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      stopMusic()
    }
  }, [startMusic])

  useEffect(() => {
    if (!skipTo) say(opening)
  }, [say, skipTo, opening])

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = stations[station].goals
      const next = (goalIdx[station] || 0) + 1
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setCheckpoint([SITE[station].pos[0], SITE[station].pos[1] + 2.2])
        if (stationOrder.every((id) => (id === station ? true : done[id]))) {
          sfxZoot()
          setExitOpen(true)
        }
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      const ng = list[next]
      if (ng?.type === 'ask') {
        afterTalk.current = () => setAskOpen(true)
        return say(ls, 'after')
      }
      return say(ls)
    },
    [SITE, done, goalIdx, say, stationOrder, stations],
  )

  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    setGameKey((k) => k + 1)
    say([hints.knockout || E('Hearts back. Your progress stays. Lash the spawn and keep going.')])
  }, [hearts, hints, say])

  useEffect(() => {
    if (goal?.type === 'ask' && phase === 'play' && !askOpen && !exitOpen && here.site === current && met[current]) setAskOpen(true)
  }, [goal, phase, askOpen, exitOpen, here.site, current, met])

  // Arrival: mark pending until player presses E (World 1 style) OR auto-play arrive once
  useEffect(() => {
    const st = here.site
    if (!st || phase !== 'play') return
    if (st !== current && !done[st] && stations[st]?.early && !met[`early:${st}`]) {
      setMet((m) => ({ ...m, [`early:${st}`]: true }))
      say(stations[st].early)
      return
    }
    if (st !== current || done[st] || met[st]) return
    setMet((m) => ({ ...m, [st]: true }))
    pendingArrive.current = st
    say(stations[st].arrive)
  }, [here.site, phase, current, met, done, say, stations])

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = SITES.find((site) => site.stage === 'station' && site.containsWorld(s.x, s.z)) || null
      setHere({ site: st?.id || null, pos: [s.x, s.z] })
      if (current && SITE[current]?.emmy) {
        const [ex, ez] = SITE[current].emmy
        const wx = SITE[current].pos[0] + ex
        const wz = SITE[current].pos[1] + ez
        emmyAt.current.x += (wx - emmyAt.current.x) * 0.04
        emmyAt.current.z += (wz - emmyAt.current.z) * 0.04
        emmyAt.current.rotY = Math.atan2(s.x - emmyAt.current.x, s.z - emmyAt.current.z)
        setNearEmmy(Math.hypot(s.x - emmyAt.current.x, s.z - emmyAt.current.z) < 2.4)
      }
      if (tick && phase === 'play') {
        tick({
          state: s,
          current,
          goal,
          done,
          met,
          tool,
          here: { site: st?.id || null, pos: [s.x, s.z] },
          bag,
          setBag,
          advanceGoal,
          say,
          flash,
          sfxCorrect,
          sfxWrong,
          sfxRefuse,
          setEnemies,
          spawnRef,
        })
      }
    }, 40)
    return () => clearInterval(id)
  }, [SITE, SITES, advanceGoal, bag, current, done, flash, goal, met, phase, say, tick, tool])

  const line = lines[lineIdx]
  const talking = phase.startsWith('talk')
  emmyTalking.current = talking
  useDialogKeys(!!line, () => advance())
  useEffect(() => {
    if (!line) {
      // clear stale caption when dialogue empties
      setShown(0)
      return
    }
    dialogOpen()
    duckMusic(true)
    // A new line starts from nothing. Reset the ref now too: it still holds the last line's
    // count until the next render, and a stale "already typed" would stop this line at 0 letters.
    shownNow.current = 0
    setShown(0)
    let i = 0
    const id = setInterval(() => {
      if (i >= line.text.length || shownNow.current >= line.text.length) return clearInterval(id)
      i++
      setShown((n) => Math.max(n, i))
      if (i % 2 === 0) textBlip(line.speaker)
    }, 1000 / TYPE_CPS)
    return () => {
      clearInterval(id)
      duckMusic(false)
    }
  }, [line, lineIdx])

  const advance = () => {
    if (!line) return
    if (shown < line.text.length) {
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1)
      return
    }
    const next = phase.split(':')[1] || 'play'
    setLines([])
    setPhase(next)
    if (next === 'after' && afterTalk.current) {
      const fn = afterTalk.current
      afterTalk.current = null
      fn()
    }
  }

  const ctxAdvice = () => ({
    current,
    done,
    goal,
    here,
    enemies,
    phase,
    bag,
    tool,
    ...(extraState?.() || {}),
  })

  const talkToEmmy = () => say(emmyAdvice(ctxAdvice()))
  const keys = toolKeys || Object.fromEntries(tools.map((t, i) => [`Digit${WORLD_TOOLS[t]?.key || i + 1}`, t]))

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyE' && nearEmmy && phase === 'play') talkToEmmy()
      if (keys[e.code]) setTool(keys[e.code])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const answerAsk = (v) => {
    if (v !== goal.answer) {
      sfxWrong()
      return say(goal.wrong, 'ask')
    }
    sfxCorrect()
    setAskOpen(false)
    advanceGoal(current, goal.right)
  }

  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, checkpoint, done, SITES])

  // top view only for the puzzle itself: not during the arrival dialogue, and not while the station's guards are still up (fights use the chase camera)
  if (current && here.site === current && met[current] && SITE[current] && !talking && !(enemies[current] > 0)) {
    const r = SITE[current].def?.add?.[0]?.r || 5.4
    // a fixed heading (looking north) so every station reads the same way up, whichever way Gyroid walked in
    frameRef.current = { center: [SITE[current].pos[0] + 1, SITE[current].pos[1] + 0.3], size: r > 5.4 ? 9.7 : 9.0, follow: 0.3, yaw: SITE[current].def?.camYaw ?? 0 }
  } else frameRef.current = null

  useExitTrigger(exitOpen, stateRef, (x, z) => Math.abs(x - layout.exit.gate[0]) < 1.5 && Math.abs(z - layout.exit.gate[1]) < 2.2, () => setLevelClear(true))

  const [paused, setPaused] = usePause(levelClear || lesson)
  const playEnabled = !talking && !askOpen && !levelClear && !paused
  useEffect(() => {
    if (levelClear) noteSeen({ kicker: `${kicker} · clear`, title: levelMeta.title, definition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelClear])
  const nDone = stationOrder.filter((id) => done[id]).length
  const objective = exitOpen
    ? 'Walk through the exit gate'
    : current
      ? `Works ${nDone}/${stationOrder.length} · next: ${stations[current].blueprint}`
      : ''

  // A station solved by a click advances after a short beat; clicks in between are ignored so the
  // finished puzzle can't be knocked out of its solved state.
  const solving = useRef(false)
  const advRef = useRef(advanceGoal)
  advRef.current = advanceGoal
  const solve = (station, ls, ms = 1800) => {
    solving.current = true
    setTimeout(() => {
      solving.current = false
      advRef.current(station, ls)
    }, ms)
  }

  const handleAction = (gx, gz, cx, cz) => {
    if (!playEnabled || !onAction || solving.current) return
    onAction(gx, gz, cx, cz, {
      solve,
      current,
      goal,
      done,
      met,
      tool,
      bag,
      setBag,
      advanceGoal,
      say,
      flash,
      sfxCorrect,
      sfxWrong,
      sfxRefuse,
      SITE,
      here,
    })
  }

  if (import.meta.env.DEV) {
    window[`__lvl${levelId.replace('-', '_')}`] = {
      here,
      done,
      goal,
      bag,
      tool,
      advanceGoal: (id) => advanceGoal(id || current, []),
      click: (x, z) => window.__game?.click?.(x, z),
      flash,
      setBag,
    }
  }

  const canTalk = nearEmmy && playEnabled && !line
  const keyOf = (t) => Object.keys(keys).find((k) => keys[k] === t)?.replace('Digit', '') || ''
  const stepText = goal?.hint || ''

  return (
    <div className={`screen level level-screen ${className || `level-${levelId}`}`}>
      <Canvas className="world-canvas" camera={{ position: [0, 11, 26], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        <Scene
          layout={layout}
          sites={SITES}
          walkable={walkable}
          game={game}
          gameKey={gameKey}
          stateRef={stateRef}
          frameRef={frameRef}
          camYawRef={camYawRef}
          spawnRef={spawnRef}
          playEnabled={playEnabled}
          tool={tool}
          onAction={handleAction}
          emmyAt={emmyAt}
          emmyTalking={emmyTalking}
          nearEmmy={nearEmmy}
          showEmmyBubble={nearEmmy && phase === 'play'}
          exitOpen={exitOpen}
          current={current}
          done={done}
          bag={bag}
          setEnemies={setEnemies}
          hearts={hearts}
          setHearts={setHearts}
          onKnockout={() => setHearts(0)}
        />
      </Canvas>

      <div className="ui-overlay">
        <div className="lvl-top">
          <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="btn ghost" onClick={onBackToTitle}>
              ◂ Title
            </button>
            <button type="button" className="btn ghost" aria-pressed={muted} onClick={() => (setMuted(!muted), setAudioMuted(!muted))}>
              {muted ? '♪ off' : '♪ on'}
            </button>
            {Lesson && (
              <button type="button" className="btn ghost" onClick={() => setLesson(true)}>
                ? How it works
              </button>
            )}
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">{kicker}</span>
            <h2>{levelMeta.title}</h2>
            <div className="hud">
              <span className="hearts">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
                    ♥
                  </span>
                ))}
              </span>
              <span className="objective">{objective}</span>
            </div>
          </div>
        </div>

        {current && here.site === current && met[current] && !talking && !askOpen && (
          <div className="rules-panel forge-panel works-panel">
            {renderRules?.({ current, goal, done, bag, tool }) || (
              <>
                <h3>{stations[current].blueprint}</h3>
                <p className="forgery-count">
                  <MathText text={stepText} />
                </p>
              </>
            )}
          </div>
        )}

        {line && (
          <div className="dialog" onClick={advance}>
            <Portrait id={line.portrait || 'emmy-boundary'} name={line.speaker} />
            <div className="dialog-body">
              <span className="speaker">{line.speaker}</span>
              <p>
                <MathText text={line.text} shown={shown} />
              </p>
            </div>
            <button type="button" className="btn primary small" onClick={(e) => (e.stopPropagation(), advance())}>
              {shown < line.text.length ? '▶▶' : lineIdx + 1 < lines.length ? 'Next ▾' : 'OK'}
            </button>
          </div>
        )}

        {askOpen && !line && goal?.type === 'ask' && (
          <div className="dialog verdict">
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>
                <MathText text={goal.question} />
              </p>
            </div>
            <div className="btn-row">
              {mixed(goal.question, goal.options).map((o) => (
                <button key={o} type="button" className="btn small" onClick={() => answerAsk(o)}>
                  <MathText text={o} />
                </button>
              ))}
            </div>
          </div>
        )}

        {toast && !line && (
          <div className="toast">
            <MathText text={toast} />
          </div>
        )}
        {canTalk && (
          <button type="button" className="btn talk-btn" onClick={talkToEmmy}>
            💬 Talk to Emmy <kbd>E</kbd>
          </button>
        )}
        {!levelClear && !line && !askOpen && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title={levelMeta.title} />
        )}

        {!talking && !levelClear && !askOpen && (
          <div className="controls">
            {worldIndex >= 3 && (
              <span className={`stance-badge ${stance}`} title="G switches the lash between chain and cochain stance">
                {stance === 'cochain' ? 'Cochain stance' : 'Chain stance'} <kbd>G</kbd>
              </span>
            )}
            <div className="weapons">
              {tools.map((t) => (
                <button key={t} type="button" className={`weapon ${tool === t ? 'active' : ''}`} onClick={() => setTool(t)}>
                  {t === 'lash' ? '⚡' : '✧'} {WORLD_TOOLS[t]?.label || t} <kbd>{keyOf(t)}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
        {playEnabled && !toast && (
          <div className="hint">
            <MathText text={current && here.site === current ? stepText : 'WASD to move · F Lash · J K L your items · E talk to Emmy · Tab menu'} />
          </div>
        )}
      </div>

      {lesson && Lesson && (
        <LevelMovie
          videoId={`level-${levelId}-lesson`}
          Scene={Lesson}
          Overlay={LessonOverlay}
          kicker={`${kicker} · Lesson`}
          name={levelMeta.title}
          startMusic={startMusic}
          embedded
          onDone={() => (setLesson(false), startMusic?.())}
          onSkip={() => (setLesson(false), startMusic?.())}
        />
      )}

      {paused && <PauseMenu title={levelMeta.title} onResume={() => setPaused(false)} onTitle={onBackToTitle} />}
      {levelClear && (
        <div className="win-banner exit">
          <div className="win-card wide">
            <span className="lvl-kicker">{kicker} · clear</span>
            <h2>{levelMeta.title}</h2>
            <p className="def">{definition.text}</p>
            <p className="cite">
              {definition.cite}{' '}
              {definition.url && (
                <a href={definition.url} target="_blank" rel="noreferrer">
                  Read the book
                </a>
              )}
            </p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={() => setLevelClear(false)}>
                Keep exploring
              </button>
              <button type="button" className="btn" onClick={onBackToTitle}>
                Back to title
              </button>
              <button type="button" className="btn primary" onClick={onNext}>
                Continue ▸ {nextLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
