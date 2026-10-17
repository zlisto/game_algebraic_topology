import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReefBoard from '../levels/w0/ReefBoard'
import { cleanStroke, makeShape, sampleShape, simulateSlide, snapPoint } from '../levels/w0/retraction'
import { DEFINITION, HINTS, RULES, STAGES } from '../levels/w0/stages01'

const SLIDE_SECONDS = 2.6
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}

function Portrait({ id, name }) {
  const [size, x, y] = PORTRAIT_CROP[id]
  return (
    <div
      className="portrait"
      role="img"
      aria-label={name}
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}assets/characters/${id}.png)`,
        backgroundSize: size,
        backgroundPosition: `${x} ${y}`,
      }}
    />
  )
}

function firstHint(stage, strokes, sim) {
  const key = !strokes.length ? 'empty' : sim.problem || (!sim.beaconHit.every(Boolean) ? 'beacons' : null)
  return (stage.hints && stage.hints[key]) || HINTS[key]
}

export default function Level01({ concept, onBackToTitle }) {
  const startStage = Math.min(STAGES.length - 1, Math.max(0, Number(new URLSearchParams(window.location.search).get('stage') || 1) - 1)) // dev: ?stage=3
  const [stageIdx, setStageIdx] = useState(startStage)
  const stage = STAGES[stageIdx]
  const shape = useMemo(() => makeShape(stage.shape), [stage])
  const samples = useMemo(() => sampleShape(shape), [shape])

  const [strokes, setStrokes] = useState([])
  const [liveStroke, setLiveStroke] = useState(null)
  const [sim, setSim] = useState(null)
  const [t, setT] = useState(0)
  const tRef = useRef(0)
  const [running, setRunning] = useState(false)
  const [enemiesLeft, setEnemiesLeft] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [tool, setTool] = useState('lash') // 'lash' | 'spool'
  const [spooling, setSpooling] = useState(false)
  const hadEnemies = useRef(false)
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | play | result | clear
  const [solved, setSolved] = useState(false)
  const [forgeryIdx, setForgeryIdx] = useState(0)
  const [answer, setAnswer] = useState(null) // { rule, correct }
  const [levelClear, setLevelClear] = useState(false)
  const drawing = useRef(null)
  const judged = useRef(null) // the sim we've already given a verdict on
  const [runId, setRunId] = useState(0)

  const levelMeta = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-1')
  const forgery = stage.mode === 'forgery' ? stage.forgeries[forgeryIdx] : null

  const setTime = useCallback((v) => {
    tRef.current = v
    setT(v)
  }, [])

  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  // ---------- stage setup
  useEffect(() => {
    const given = stage.givenSpine ? stage.givenSpine.map((s) => cleanStroke(s)) : []
    setStrokes(given)
    setLiveStroke(null)
    setSolved(false)
    setForgeryIdx(0)
    setAnswer(null)
    setRunning(false)
    setTime(0)
    setSim(stage.mode === 'demo' ? simulateSlide(shape, samples, given, stage.beacons) : null)
    setEnemiesLeft(stage.enemies?.length || 0)
    hadEnemies.current = false
    setHearts(3)
    setTool('lash')
    setSpooling(false)
    say(stage.intro)
  }, [stage, shape, samples, say, setTime, runId])

  // ---------- weapon switch: 1 = Lash, 2 = Spool, Q or the mouse wheel toggles
  const hasSpool = stage.mode === 'draw'
  useEffect(() => {
    if (!hasSpool) return
    const key = (e) => {
      if (e.code === 'Digit1') setTool('lash')
      else if (e.code === 'Digit2') setTool('spool')
      else if (e.code === 'KeyQ') setTool((w) => (w === 'lash' ? 'spool' : 'lash'))
    }
    const wheel = (e) => {
      if (Math.abs(e.deltaY) > 4) setTool((w) => (w === 'lash' ? 'spool' : 'lash'))
    }
    window.addEventListener('keydown', key)
    window.addEventListener('wheel', wheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('wheel', wheel)
    }
  }, [hasSpool])

  // ---------- Null's spawn: cleared → Emmy moves on; knocked out → try the reef again
  useEffect(() => {
    if (enemiesLeft > 0) hadEnemies.current = true // only a count we've actually seen go to zero counts as cleared
    else if (hadEnemies.current) {
      hadEnemies.current = false
      say(stage.cleared || [HINTS.cleared], 'play')
    }
  }, [enemiesLeft, stage, say])
  useEffect(() => {
    if (hearts > 0) return
    setStrokes(stage.givenSpine ? stage.givenSpine.map((s) => cleanStroke(s)) : [])
    setSim(stage.mode === 'demo' ? simulateSlide(shape, samples, stage.givenSpine.map((s) => cleanStroke(s)), stage.beacons) : null)
    setTime(0)
    setHearts(3)
    setEnemiesLeft(stage.enemies?.length || 0)
    hadEnemies.current = false
    setKnockouts((k) => k + 1)
    say([HINTS.knockout], 'play')
  }, [hearts, stage, shape, samples, say, setTime])

  // ---------- slide animation (and the looping forgery movies)
  useEffect(() => {
    const looping = stage.mode === 'forgery' && phase === 'play' && !answer
    if (!running && !looping) return
    let raf
    const t0 = performance.now() - tRef.current * SLIDE_SECONDS * 1000
    const tick = () => {
      const el = (performance.now() - t0) / 1000
      if (looping) {
        const cycle = SLIDE_SECONDS + 1.2
        setTime(Math.min(1, (el % cycle) / SLIDE_SECONDS))
      } else {
        const v = Math.min(1, el / SLIDE_SECONDS)
        setTime(v)
        if (v >= 1) {
          setRunning(false)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, stage, phase, answer, forgeryIdx, setTime])

  // ---------- verdict when a slide reaches t = 1
  useEffect(() => {
    if (t < 1 || !sim || phase !== 'play' || solved || stage.mode === 'forgery' || judged.current === sim) return
    judged.current = sim
    if (sim.valid) {
      setSolved(true)
      say(stage.success, 'result')
    } else if (stage.mode === 'draw') {
      say([firstHint(stage, strokes, sim)], 'play')
    }
  }, [t, sim, phase, solved, stage, strokes, say])

  // ---------- drawing
  const inside = (x, z) => shape.inside(x, z)
  const invalidate = () => {
    setSim(null)
    setTime(0)
  }
  const onStrokeStart = (x, z) => {
    if (!inside(x, z)) return
    drawing.current = [snapPoint(strokes, x, z)]
    setLiveStroke(drawing.current)
    invalidate()
  }
  const commit = () => {
    const s = drawing.current
    drawing.current = null
    setLiveStroke(null)
    if (!s || !s.length) return
    const end = snapPoint(strokes, s[s.length - 1][0], s[s.length - 1][1])
    const closes = s.length > 8 && Math.hypot(end[0] - s[0][0], end[1] - s[0][1]) < 0.4
    const pts = [...s.slice(0, -1), closes ? s[0] : end]
    setStrokes((prev) => [...prev, pts.length > 1 ? cleanStroke(pts) : pts])
  }
  const onStrokeMove = (x, z) => {
    if (!drawing.current) {
      if (inside(x, z)) onStrokeStart(x, z)
      return
    }
    if (!inside(x, z)) return commit() // lifting off the reef ends the stroke
    const last = drawing.current[drawing.current.length - 1]
    if (Math.hypot(x - last[0], z - last[1]) < 0.06) return
    drawing.current = [...drawing.current, [x, z]]
    setLiveStroke(drawing.current)
  }
  const slide = () => {
    if (stage.mode === 'draw') {
      const result = simulateSlide(shape, samples, strokes, stage.beacons)
      setSim(result)
    }
    setTime(0)
    setRunning(true)
  }
  const undo = () => {
    setStrokes((s) => s.slice(0, -1))
    invalidate()
  }
  const clear = () => {
    setStrokes([])
    invalidate()
  }

  // ---------- forgery quiz
  const pick = (ruleId) => {
    const correct = ruleId === forgery.broken
    setAnswer({ rule: ruleId, correct })
    if (correct) setTime(1)
  }
  const nextForgery = () => {
    setAnswer(null)
    setTime(0)
    if (forgeryIdx + 1 < stage.forgeries.length) setForgeryIdx(forgeryIdx + 1)
    else {
      setSolved(true)
      say(stage.success, 'clear')
    }
  }

  // ---------- dialogue advance
  const advance = () => {
    if (lineIdx + 1 < lines.length) return setLineIdx(lineIdx + 1)
    const next = phase.split(':')[1]
    if (next === 'clear') {
      setLevelClear(true)
      setPhase('clear')
    } else setPhase(next)
  }
  const nextStage = () => {
    if (stageIdx + 1 < STAGES.length) setStageIdx(stageIdx + 1)
    else setLevelClear(true)
  }

  if (import.meta.env.DEV) window.__lvl = { stage, strokes, sim, samples } // dev inspection

  const talking = phase.startsWith('talk:')
  const line = talking ? lines[lineIdx] : null
  const playEnabled = phase === 'play' && !running && t === 0 && !solved && stage.mode !== 'forgery' && !levelClear
  const spoolEnabled = stage.mode === 'draw' && playEnabled
  const gameKey = `${stage.id}:${runId}:${knockouts}`
  const board = useMemo(
    () => (
      <ReefBoard
        stage={stage}
        samples={samples}
        shape={shape}
        strokes={strokes}
        liveStroke={liveStroke}
        sim={sim}
        tRef={tRef}
        forgery={forgery?.id}
        gameKey={gameKey}
        playEnabled={playEnabled}
        spoolEnabled={spoolEnabled}
        tool={hasSpool ? tool : 'lash'}
        onStrokeStart={onStrokeStart}
        onStrokeMove={onStrokeMove}
        onStrokeEnd={commit}
        onEnemies={setEnemiesLeft}
        onHearts={setHearts}
        onSpooling={setSpooling}
      />
    ),
    // handlers close over strokes/stage, which are listed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, samples, shape, strokes, liveStroke, sim, forgery, playEnabled, spoolEnabled, gameKey, tool, hasSpool],
  )

  const ruleState = (id) => {
    if (stage.mode === 'forgery') return 'idle'
    if (!sim || t < 1) return 'idle'
    return sim.rules[id] ? 'ok' : 'bad'
  }
  const beaconsOk = sim && t >= 1 ? sim.beaconHit.every(Boolean) : null

  return (
    <div className="screen level">
      <Canvas camera={{ position: stage.camera.pos, fov: 42 }} dpr={[1, 1.75]}>
        {board}
      </Canvas>

      <div className="ui-overlay">
        <div className="lvl-top">
          <button type="button" className="btn ghost" onClick={onBackToTitle}>
            ◂ Title
          </button>
          <div className="lvl-title">
            <span className="lvl-kicker">World 0 · Level 1</span>
            <h2>{levelMeta?.title || 'A Good Deformation'}</h2>
            <div className="pips">
              {STAGES.map((s, i) => (
                <span key={s.id} className={`pip ${i < stageIdx || (i === stageIdx && solved) ? 'done' : ''} ${i === stageIdx ? 'here' : ''}`} title={s.title} />
              ))}
              <span className="stage-name">{stage.title}</span>
            </div>
            {stage.mode !== 'forgery' && (
              <div className="hud">
                <span className="hearts" aria-label={`${hearts} hearts`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
                      ♥
                    </span>
                  ))}
                </span>
                {(stage.enemies?.length || 0) > 0 && (
                  <span className={`spawn-count ${enemiesLeft === 0 ? 'clear' : ''}`}>{enemiesLeft === 0 ? 'Reef clear' : `Null’s spawn: ${enemiesLeft}`}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rules-panel">
          <h3>{stage.mode === 'forgery' ? 'Which rule breaks?' : 'Deformation retraction rules'}</h3>
          <ul>
            {RULES.map((r) => {
              const st = ruleState(r.id)
              const chosen = answer?.rule === r.id
              return (
                <li key={r.id} className={`rule ${st} ${chosen ? (answer.correct ? 'ok' : 'bad') : ''}`}>
                  {stage.mode === 'forgery' ? (
                    <button type="button" className="rule-btn" disabled={phase !== 'play' || answer?.correct} onClick={() => pick(r.id)}>
                      <span className="rule-label">{r.label}</span>
                      <span className="rule-math">{r.math}</span>
                    </button>
                  ) : (
                    <>
                      <span className="rule-mark">{st === 'ok' ? '✓' : st === 'bad' ? '✗' : '·'}</span>
                      <span className="rule-label">{r.label}</span>
                      <span className="rule-math">{r.math}</span>
                    </>
                  )}
                </li>
              )
            })}
            {stage.beacons.length > 0 && stage.mode !== 'forgery' && (
              <li className={`rule goal ${beaconsOk === null ? 'idle' : beaconsOk ? 'ok' : 'bad'}`}>
                <span className="rule-mark">{beaconsOk === null ? '·' : beaconsOk ? '✓' : '✗'}</span>
                <span className="rule-label">Spine through every beacon</span>
              </li>
            )}
          </ul>
          {stage.mode === 'forgery' && (
            <p className="forgery-count">
              Forgery {forgeryIdx + 1} of {stage.forgeries.length} · t = {t.toFixed(2)}
              <br />
              The dim grid underneath is where the reef started.
            </p>
          )}
        </div>

        {line && (
          <div className="dialog" onClick={advance}>
            <Portrait id={line.portrait} name={line.speaker} />
            <div className="dialog-body">
              <span className="speaker">{line.speaker}</span>
              <p>{line.text}</p>
            </div>
            <button type="button" className="btn primary small" onClick={(e) => (e.stopPropagation(), advance())}>
              {lineIdx + 1 < lines.length ? 'Next' : 'OK'}
            </button>
          </div>
        )}

        {answer && phase === 'play' && (
          <div className={`dialog verdict ${answer.correct ? 'ok' : 'bad'}`}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>{answer.correct ? forgery.explain : 'Not that one — that rule holds here. Watch it again closely.'}</p>
            </div>
            <button type="button" className="btn primary small" onClick={answer.correct ? nextForgery : () => setAnswer(null)}>
              {answer.correct ? 'Next' : 'Watch again'}
            </button>
          </div>
        )}

        {!talking && !levelClear && stage.mode !== 'forgery' && (
          <div className="controls">
            {!solved && (
              <div className="weapons" role="group" aria-label="Weapon">
                <button
                  type="button"
                  className={`weapon ${(hasSpool ? tool : 'lash') === 'lash' ? 'active' : ''}`}
                  onClick={(e) => (setTool('lash'), e.currentTarget.blur())}
                  title="Fundamental Lash — click the reef to crack it (1)"
                >
                  ⚡ Lash <kbd>1</kbd>
                </button>
                {hasSpool && (
                  <button
                    type="button"
                    className={`weapon ${tool === 'spool' ? 'active' : ''} ${spooling ? 'threading' : ''}`}
                    onClick={(e) => (setTool('spool'), e.currentTarget.blur())}
                    title="Spool — click to start the thread, walk, click to stop (2)"
                  >
                    ◯ Spool <kbd>2</kbd>
                  </button>
                )}
              </div>
            )}
            {stage.mode === 'draw' && !solved && (
              <>
                <button type="button" className="btn ghost" onClick={undo} disabled={!strokes.length || running}>
                  Undo
                </button>
                <button type="button" className="btn ghost" onClick={clear} disabled={!strokes.length || running}>
                  Clear
                </button>
              </>
            )}
            {!solved && (
              <button
                type="button"
                className="btn primary"
                onClick={slide}
                disabled={running || enemiesLeft > 0 || (stage.mode === 'draw' && !strokes.length) || (sim && t > 0)}
                title={enemiesLeft > 0 ? 'Clear Null’s spawn first' : ''}
              >
                Slide ▶
              </button>
            )}
            <label className="dial">
              <span>t = {t.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={t}
                disabled={!sim || running || enemiesLeft > 0}
                onChange={(e) => setTime(Number(e.target.value))}
                onPointerUp={(e) => e.currentTarget.blur()}
              />
            </label>
            {sim && !sim.valid && t >= 1 && !running && (
              <button type="button" className="btn primary" onClick={invalidate}>
                ↺ Back to the reef
              </button>
            )}
            {solved && phase === 'result' && (
              <button type="button" className="btn primary" onClick={nextStage}>
                {stageIdx + 1 < STAGES.length ? 'Next ▸' : 'Finish ▸'}
              </button>
            )}
            {solved && stage.alternatives && phase === 'result' && (
              <button type="button" className="btn ghost" onClick={() => (setSolved(false), clear(), setPhase('play'))}>
                Try another spine
              </button>
            )}
          </div>
        )}
        {playEnabled && (
          <div className="hint">
            {spooling
              ? 'Threading… walk to lay spine · click to stop'
              : tool === 'spool' && hasSpool
                ? 'WASD to move · click to start the thread · 1 / Q for the Lash'
                : `WASD to move · click to crack the Lash${hasSpool ? ' · 2 / Q for the Spool' : ''}`}
          </div>
        )}
      </div>

      {levelClear && (
        <div className="win-banner">
          <div className="win-card wide">
            <span className="lvl-kicker">World 0 · Level 1 clear</span>
            <h2>{levelMeta?.title || 'A Good Deformation'}</h2>
            <p className="def">{DEFINITION.text}</p>
            <p className="cite">
              {DEFINITION.cite}{' '}
              <a href={DEFINITION.url} target="_blank" rel="noreferrer">
                Read the book
              </a>
            </p>
            <p className="next-up">Next: 0-2 · Bend, Don’t Break — coming soon</p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={() => (setLevelClear(false), setStageIdx(0), setRunId((n) => n + 1))}>
                Replay level
              </button>
              <button type="button" className="btn primary" onClick={onBackToTitle}>
                Back to title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
