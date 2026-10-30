import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { noteSeen } from '../../codex/store'
import LevelMovie from '../../screens/LevelMovie'
import LevelMap from '../../screens/LevelMap'
import MathText from '../../screens/MathText'
import useDialogKeys from '../../screens/useDialogKeys'
import { useExitTrigger } from '../../screens/exitTrigger'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import SpireScene from './SpireScene'
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

const TYPE_CPS = 45
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  'count-null': ['600%', '50%', '26%'],
  commutator: ['500%', '53%', '19%'],
}

function Portrait({ id, name }) {
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

/**
 * Shared World 4 level shell — movie/lesson/stations/ask/act/exit.
 * Per-level screens pass config (layout, stages, music, Lesson/Movie, onAct).
 */
export default function SpireLevel({
  concept,
  onBackToTitle,
  onNext,
  startAt,
  world = 4,
  levelNum,
  levelId,
  title,
  place,
  layout,
  stationOrder,
  stations,
  opening,
  hints,
  definition,
  emmyAdvice,
  tools,
  toolKeys,
  defaultTool,
  startMusic,
  Movie,
  Lesson,
  LessonOverlay,
  lessonVideoId,
  lessonName,
  nextLabel,
  onAct,
  accent = '#c9a0ff',
  weaponButtons,
}) {
  const levelMeta = concept?.worlds?.[world]?.levels?.find((l) => l.id === levelId) || { title }
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
  const [tool, setTool] = useState(defaultTool || tools[0])
  const [askOpen, setAskOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  // the codex keeps a note of this level once it's cleared
  useEffect(() => {
    if (levelClear) noteSeen({ kicker: `World ${world} · Level ${levelNum} clear`, title: levelMeta.title || title, definition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelClear])
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const stateRef = useRef(null)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyAt = useRef({ x: layout.start[0] - 1.2, z: layout.start[1] - 0.8, rotY: Math.PI, walk: 0 })
  const emmyTalking = useRef(false)
  const [nearEmmy, setNearEmmy] = useState(false)

  const current = stationOrder.find((id) => !done[id]) || null
  const goals = current ? stations[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null

  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [layout, SITES, exitOpen])
  const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null

  const flash = (text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? `talk:${next}` : next)
  }, [])

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
        setDone((d) => {
          const nd = { ...d, [station]: true }
          if (stationOrder.every((id) => (id === station ? true : nd[id]))) {
            sfxZoot()
            setExitOpen(true)
          }
          return nd
        })
        setCheckpoint([SITE[station].pos[0], SITE[station].pos[1] + 2.2])
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      const ng = list[next]
      if (ng.type === 'ask') {
        afterTalk.current = () => setAskOpen(true)
        return say(ls, 'after')
      }
      return say(ls)
    },
    [SITE, goalIdx, say, stationOrder, stations],
  )

  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    setGameKey((k) => k + 1)
    say([hints.knockout])
  }, [hearts, hints, say])

  useEffect(() => {
    if (goal?.type === 'ask' && phase === 'play' && !askOpen && !exitOpen && here.site === current && met[current]) setAskOpen(true)
  }, [goal, phase, askOpen, exitOpen, here.site, current, met])

  useEffect(() => {
    const st = here.site
    if (!st || phase !== 'play') return
    if (st !== current && !done[st] && stations[st]?.early && !met[`early:${st}`]) {
      setMet((m) => ({ ...m, [`early:${st}`]: true }))
      say(stations[st].early)
      return
    }
    if (st !== current || done[st]) return
    if (met[st]) return
    setMet((m) => ({ ...m, [st]: true }))
    const arrive = stations[st].arrive
    const first = stations[st].goals[0]
    if (first?.type === 'ask') afterTalk.current = () => setAskOpen(true)
    say(arrive, first?.type === 'ask' ? 'after' : 'play')
  }, [here.site, phase, current, met, done, say, stations])

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)
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
    }, 80)
    return () => clearInterval(id)
  }, [SITE, current])

  const line = lines[lineIdx]
  const talking = phase.startsWith('talk')
  emmyTalking.current = talking

  const advance = () => {
    if (!line) return
    if (shown < line.text.length) {
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1)
      setShown(0)
      return
    }
    const next = phase.split(':')[1] || 'play'
    setPhase(next === 'after' ? 'play' : next)
    setLines([])
    if (afterTalk.current) {
      const fn = afterTalk.current
      afterTalk.current = null
      fn()
    }
  }
  useDialogKeys(!!line, advance)

  useEffect(() => {
    if (!line) return
    dialogOpen()
    duckMusic(true)
    setShown(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown((n) => Math.max(n, i))
      if (shownNow.current >= line.text.length) {
        clearInterval(id)
        return
      }
      const ch = line.text[i - 1]
      if (ch && ch !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => {
      clearInterval(id)
      duckMusic(false)
    }
  }, [line, lineIdx])

  const playEnabled = phase === 'play' && !lesson
  const canTalk = nearEmmy && playEnabled && !line

  const talkToEmmy = () => {
    say(
      emmyAdvice({
        station: current,
        stationName: SITE[current]?.name,
        goal,
        exitOpen,
      }),
    )
  }

  const tryAct = useCallback(() => {
    if (!playEnabled || !goal || goal.type !== 'act' || here.site !== current || !met[current]) return
    const res = onAct?.(goal.action, { tool, station: current, mech: null }) || { ok: tools.includes(tool) }
    if (!res.ok) {
      sfxRefuse()
      return flash(hints.wrong_tool?.text || 'Wrong tool — check the marked key.')
    }
    sfxCorrect()
    advanceGoal(current, goal.done || [])
  }, [advanceGoal, current, goal, here.site, hints, met, onAct, playEnabled, tool, tools])

  useEffect(() => {
    const onKey = (e) => {
      if (talking) return
      if (e.code === 'KeyE' && canTalk) talkToEmmy()
      if (toolKeys[e.code]) setTool(toolKeys[e.code])
      if (e.code === 'KeyQ') setTool((w) => tools[(tools.indexOf(w) + 1) % tools.length])
      if (e.code === 'Space') {
        e.preventDefault()
        tryAct()
      }
      if (e.code === 'KeyM') {
        setMuted((m) => {
          setAudioMuted(!m)
          return !m
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const answerAsk = (v) => {
    if (!goal || goal.type !== 'ask') return
    setAskOpen(false)
    if (v !== goal.answer) {
      sfxWrong()
      return say(goal.wrong || [hints.knockout])
    }
    sfxCorrect()
    advanceGoal(current, goal.right || goal.done || [])
  }

  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, dx, dz] of s.enemies) {
        list.push({ type, x: s.pos[0] + dx, z: s.pos[1] + dz, site: s.id })
      }
    }
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
  }, [SITES, done, checkpoint])

  useEffect(() => {
    if (import.meta.env.DEV) {
      window[`__lvl4_${levelNum}`] = {
        done,
        current,
        goal,
        tool,
        tryAct,
        advanceGoal: () => current && advanceGoal(current, []),
      }
    }
  })

  useExitTrigger(
    exitOpen && !levelClear,
    stateRef,
    (x, z) => Math.abs(x - layout.exit.gate[0]) < 1.6 && z < layout.exit.gate[1] - 0.8,
    () => setLevelClear(true),
  )

  const display = line ? line.text.slice(0, shown) : ''

  return (
    <div className={`level-screen w4-level w4-${levelNum}`}>
      <Canvas camera={{ position: [0, 12, 16], fov: 42 }} dpr={[1, 1.5]}>
        <SpireScene
          layout={layout}
          sites={SITES}
          walkable={walkable}
          stateRef={stateRef}
          frameRef={frameRef}
          spawnRef={spawnRef}
          game={game}
          playEnabled={playEnabled}
          tool={tool}
          onAction={() => tryAct()}
          onEnemies={(by) => setEnemies(by)}
          onHearts={setHearts}
          exitOpen={exitOpen}
          current={current}
          emmyAt={emmyAt}
          emmyTalking={emmyTalking}
          emmyNear={nearEmmy}
          accent={accent}
          gameKey={gameKey + knockouts}
        />
      </Canvas>

      <div className="hud">
        <div className="top-bar">
          <button type="button" className="btn small" onClick={onBackToTitle}>
            Title
          </button>
          <span className="lvl-kicker">
            World {world} · Level {levelNum} — {place}
          </span>
          <button type="button" className="btn small" onClick={() => setLesson(true)}>
            ? How it works
          </button>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              setMuted((m) => {
                setAudioMuted(!m)
                return !m
              })
            }}
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <span className="hearts">{'♥'.repeat(hearts)}{'♡'.repeat(Math.max(0, 3 - hearts))}</span>
        </div>

        {line && (
          <div className="dialog">
            <Portrait id={line.portrait} name={line.speaker} />
            <div className="dialog-body">
              <span className="speaker">{line.speaker}</span>
              <p>
                <MathText text={display} />
              </p>
            </div>
            <button type="button" className="btn small" onClick={advance}>
              ▸
            </button>
          </div>
        )}

        {askOpen && !line && goal?.type === 'ask' && (
          <div className="dialog verdict">
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>{goal.question}</p>
            </div>
            <div className="btn-row">
              {goal.options.map((v) => (
                <button key={v} type="button" className="btn small" onClick={() => answerAsk(v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {toast && !line && <div className="toast">{toast}</div>}
        {nearEmmy && phase === 'play' && !levelClear && (
          <button type="button" className="btn talk-btn" onClick={() => talkToEmmy()}>
            Talk to Emmy <kbd>E</kbd>
          </button>
        )}
        {!levelClear && !line && !askOpen && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title={title} />
        )}
        {playEnabled && !toast && (
          <div className="controls">
            <div className="weapons">{weaponButtons ? weaponButtons(tool, setTool) : null}</div>
            <div className="hint">WASD · Space = enact · Talk to Emmy (E) · ? How it works</div>
          </div>
        )}
      </div>

      {lesson && (
        <LevelMovie
          videoId={lessonVideoId}
          Scene={Lesson}
          Overlay={LessonOverlay}
          kicker={`World ${world} · Level ${levelNum} · Lesson`}
          name={lessonName}
          embedded
          startMusic={startMusic}
          onDone={() => (setLesson(false), startMusic?.())}
          onSkip={() => (setLesson(false), startMusic?.())}
        />
      )}

      {levelClear && (
        <div className="win-banner exit">
          <div className="win-card wide">
            <span className="lvl-kicker">
              World {world} · Level {levelNum} clear
            </span>
            <h2>{levelMeta.title || title}</h2>
            <p className="def">{definition.text}</p>
            <p className="cite">
              {definition.cite}{' '}
              <a href={definition.url} target="_blank" rel="noreferrer">
                Read the book
              </a>
            </p>
            <p className="next-up">Next: {nextLabel}</p>
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
