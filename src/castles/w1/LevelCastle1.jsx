import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dialogOpen, duckMusic, readMuted, setMuted as setAudioMuted, sfxCorrect, sfxWrong, startNullMusic, stopMusic, textBlip, unlockAudio } from '../../audio/chip'
import MathText from '../../screens/MathText'
import { EmmyEndCard, PauseMenu, usePause } from '../../screens/LevelChrome'
import Castle1Scene from './Castle1Scene'
import { BEACON_OFFSET, DEFINITION_CASTLE1, FINAL, GUARD, HINTS_CASTLE, NULL_AT, OPENING, PANELS, PUNISH, START, TRIALS, WAVES } from './stagesCastle1'

/**
 * World 1 · Castle "The Delta Sphere" — Count Null's three trials on the flattened pole of his
 * sphere (adapted from World 0's LevelCastle). Each round: three demonstrations, a judgment beacon
 * by each. Lash the forgeries; lashing an honest one brings Crown shards and restarts the round.
 * Spawn waves between trials (chase camera); the trials are read from above. After trial 3 the
 * final phase: the Crown's guard. Then Emmy's end card, and on to the outro (outroc1).
 */

const TYPE_CPS = 45
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const WALK = {
  inside: (x, z) => Math.hypot(x, z) < 8.3 && Math.hypot(x - NULL_AT[0], z - NULL_AT[1]) > 2.3,
  insideForSpawn: (x, z) => Math.hypot(x, z) < 8.0 && Math.hypot(x - NULL_AT[0], z - NULL_AT[1]) > 2.3,
  bounds: { minX: -9, maxX: 9, minZ: -9, maxZ: 9 },
}
const key = (ex) => (Array.isArray(ex) ? ex.join('+') : ex)
const isHonest = (t, ex) => TRIALS[t].honest.includes(key(ex))
const beaconSite = (t, r, i, epoch) => `b:${t}:${r}:${i}:${epoch}`
const homeYaw = () => Math.atan2(START[0] - NULL_AT[0], START[1] - NULL_AT[1])

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

export default function LevelCastle1({ onBackToTitle, onNext, onGo, startAt }) {
  const skipTo = Math.max(0, Math.min(3, Number(startAt) || 0)) // dev (?shrine=N): trial to start at (3 = the final phase)
  const [step, setStep] = useState('intro') // intro | trial | wave | final | done
  const [trial, setTrial] = useState(Math.min(2, skipTo))
  const [roundIdx, setRoundIdx] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [panelStates, setPanelStates] = useState(['live', 'live', 'live'])
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const camYawRef = useRef(homeYaw())
  const [knockouts, setKnockouts] = useState(0)
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('lash')
  const [rules, setRules] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [complete, setComplete] = useState(false)
  const stateRef = useRef(null)
  const frameRef = useRef({ center: [0, -1.4], size: 16.5 })
  const spawnRef = useRef(null)
  const afterTalk = useRef(null)
  const seenSites = useRef(new Set())
  const nullTalking = useRef(false)

  const round = TRIALS[trial].rounds[roundIdx]
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  useEffect(() => {
    unlockAudio()
    startNullMusic()
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      stopMusic()
    }
  }, [])

  // ---------- the flow
  const beaconsFor = (t, r, ep, states) =>
    PANELS.map((p, i) => (states[i] === 'live' ? { type: 'beacon', x: p[0] + BEACON_OFFSET[0], z: p[1] + BEACON_OFFSET[1], site: beaconSite(t, r, i, ep) } : null)).filter(Boolean)
  const waveDefs = (w) => WAVES[w].map(([type, x, z]) => ({ type, x, z, site: 'arena' }))
  const startRound = (t, r, ep) => {
    setStep('trial')
    setTrial(t)
    setRoundIdx(r)
    setEpoch(ep)
    const st = ['live', 'live', 'live']
    setPanelStates(st)
    spawnRef.current?.(beaconsFor(t, r, ep, st))
  }
  const startWave = (w) => {
    setStep(w === 2 ? 'final' : 'wave')
    spawnRef.current?.(waveDefs(w))
  }
  const startTrial = (t) => {
    afterTalk.current = () => startRound(t, 0, epoch + 1)
    say(TRIALS[t].intro, 'after')
  }
  const startFinal = () => {
    setTrial(2)
    afterTalk.current = () => startWave(2)
    say(GUARD, 'after')
  }
  useEffect(() => {
    if (skipTo === 3) return startFinal()
    afterTalk.current = () => startRound(skipTo, 0, 0)
    say(skipTo === 0 ? [...OPENING, ...TRIALS[0].intro] : TRIALS[skipTo].intro, 'after')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- verdicts: a beacon was lashed (its site's count fell to 0)
  useEffect(() => {
    for (const s of Object.keys(enemies)) if (enemies[s] > 0) seenSites.current.add(s)
    if (step !== 'trial' || phase !== 'play') return
    PANELS.forEach((_, i) => {
      const site = beaconSite(trial, roundIdx, i, epoch)
      if (panelStates[i] !== 'live' || !seenSites.current.has(site) || enemies[site]) return
      judge(i)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies])
  const judge = (i) => {
    const ex = round[i]
    const T = TRIALS[trial]
    if (isHonest(trial, ex)) {
      sfxWrong()
      setPanelStates((p) => p.map((s, j) => (j === i ? 'spared' : s)))
      spawnRef.current?.(PUNISH.map(([type, x, z]) => ({ type, x, z, site: 'arena' })))
      // the round starts over once the Crown's shards are beaten (not while they're still biting)
      afterTalk.current = () => {
        spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
        setStep('punish')
      }
      return say(HINTS_CASTLE.wrong(T.spared[key(ex)]), 'after')
    }
    sfxCorrect()
    const next = panelStates.map((s, j) => (j === i ? 'exposed' : s))
    setPanelStates(next)
    const left = round.some((e, j) => next[j] === 'live' && !isHonest(trial, e))
    const line = [{ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: `Forgery! ${T.why[key(ex)]}` }]
    if (left) return say(line)
    afterTalk.current = () => {
      spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
      if (roundIdx + 1 < T.rounds.length) return startRound(trial, roundIdx + 1, epoch + 1)
      if (trial === 2) {
        afterTalk.current = startFinal
        return say(T.done, 'after')
      }
      afterTalk.current = () => startWave(trial)
      say(T.done, 'after')
    }
    say(line, 'after')
  }

  // waves end when the arena is clear
  useEffect(() => {
    if ((step !== 'wave' && step !== 'final' && step !== 'punish') || phase !== 'play') return
    if (!seenSites.current.has('arena') || enemies.arena) return
    seenSites.current.delete('arena')
    if (step === 'punish') return startRound(trial, roundIdx, epoch + 1)
    if (step === 'wave') return startTrial(trial + 1)
    setStep('done')
    afterTalk.current = () => setComplete(true)
    say(FINAL, 'after')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, step, phase])

  // knocked out: the round (or wave) starts over
  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    if (step === 'trial') setPanelStates(['live', 'live', 'live'])
    say([HINTS_CASTLE.knockout])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hearts])

  useEffect(() => {
    const k = (e) => e.code === 'Digit1' && setTool('lash')
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  // ---------- dialogue (FF7 style)
  const advance = () => {
    const full = lines[lineIdx]?.text.length ?? 0
    if (shown < full) return setShown(full)
    if (lineIdx + 1 < lines.length) return setLineIdx(lineIdx + 1)
    const next = phase.split(':')[1]
    if (next === 'after') {
      setPhase('play')
      const f = afterTalk.current
      afterTalk.current = null
      f?.()
    } else setPhase(next)
  }
  const talking = phase.startsWith('talk:')
  const line = talking ? lines[lineIdx] : null
  nullTalking.current = !!line && line.speaker === 'Count Null'
  useEffect(() => {
    if (talking) dialogOpen()
    duckMusic(talking)
  }, [talking])
  useEffect(() => {
    setShown(0)
    if (!line) return
    let i = 0
    const id = setInterval(() => {
      i++
      setShown((n) => {
        if (n >= line.text.length) {
          clearInterval(id)
          return n
        }
        return Math.max(n, i)
      })
      if (shownNow.current >= line.text.length) return clearInterval(id)
      const ch = line.text[i - 1]
      if (ch && ch !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => clearInterval(id)
  }, [line])
  const advanceRef = useRef(null)
  advanceRef.current = line ? advance : null
  useEffect(() => {
    const onKey = (e) => {
      if (!advanceRef.current || (e.code !== 'Space' && e.code !== 'Enter')) return
      e.preventDefault()
      advanceRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---------- game layer
  const [paused, setPaused] = usePause(complete)
  const fighting = step === 'wave' || step === 'final' || step === 'punish'
  const stepRef = useRef(step)
  stepRef.current = step
  frameRef.current = fighting ? null : { center: [0, -1.4], size: 16.5 }
  const lastStep = useRef(step)
  if (lastStep.current !== step) {
    if (lastStep.current === 'wave' || lastStep.current === 'final' || lastStep.current === 'punish') camYawRef.current = homeYaw()
    lastStep.current = step
  }
  const playEnabled = phase === 'play' && !rules && !complete && !paused
  const gameKey = `castle1:${knockouts}`
  const game = useMemo(() => {
    const list = step === 'trial' ? beaconsFor(trial, roundIdx, epoch, ['live', 'live', 'live']) : step === 'wave' ? waveDefs(trial) : step === 'final' ? waveDefs(2) : step === 'punish' ? PUNISH.map(([type, x, z]) => ({ type, x, z, site: 'arena' })) : []
    // pressure: in a fight the beasts come for Gyroid from further off (the whole court in the final phase)
    const enemyAI = (e, dt, s) => {
      if (e.type === 'beacon') return
      const st = stepRef.current
      const reach = st === 'final' ? 99 : st === 'wave' || st === 'punish' ? 6.5 : 0
      if (reach && Math.hypot(s.x - e.x, s.z - e.z) < reach) {
        e.tx = s.x
        e.tz = s.z
      }
    }
    return { mode: 'overworld', bySite: true, start: START, enemies: list, enemyAI }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])
  const nullScript = () => ({ gesture: nullTalking.current ? 1 : 0.2, crown: step === 'final' || step === 'done' ? 1 : 0.6, crownY: 0 })

  if (import.meta.env.DEV) window.__castle1 = { step, trial, roundIdx, epoch, panelStates, phase, enemies, round, complete: () => setComplete(true), spawn: (defs) => spawnRef.current?.(defs), frameRef } // dev

  const T = TRIALS[trial]
  const objective =
    step === 'trial' ? `Trial ${trial + 1}/3 · ${T.name} · round ${roundIdx + 1}/${T.rounds.length}` : step === 'wave' ? 'Clear the spawn' : step === 'punish' ? 'Beat the Crown’s shards' : step === 'final' ? 'Break the Crown’s guard' : 'The Delta Sphere'

  return (
    <div className="screen level">
      <Canvas camera={{ position: [0, 14, 18], fov: 45, far: 400 }} dpr={[1, 1.5]} frameloop={complete ? 'never' : 'always'}>
        <Castle1Scene
          trial={trial}
          round={round}
          panelStates={panelStates}
          showPanels={step === 'trial'}
          nullScript={nullScript}
          walkable={WALK}
          game={game}
          gameKey={gameKey}
          stateRef={stateRef}
          frameRef={frameRef}
          spawnRef={spawnRef}
          playEnabled={playEnabled}
          tool={tool}
          onEnemies={(by) => setEnemies(by)}
          onHearts={setHearts}
          camYawRef={camYawRef}
        />
      </Canvas>

      <div className="ui-overlay">
        <div className="lvl-top">
          <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="btn ghost" onClick={onBackToTitle}>
              ◂ Title
            </button>
            <button
              type="button"
              className="btn ghost"
              aria-pressed={muted}
              onClick={(e) => {
                setMuted(!muted)
                setAudioMuted(!muted)
                e.currentTarget.blur()
              }}
            >
              {muted ? '♪ off' : '♪ on'}
            </button>
            <button type="button" className="btn ghost" onClick={(e) => (setRules(true), e.currentTarget.blur())}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Castle</span>
            <h2>The Delta Sphere</h2>
            <div className="hud">
              <span className="hearts" aria-label={`${hearts} hearts`}>
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

        {step === 'trial' && (
          <div className="rules-panel forge-panel works-panel">
            <h3>
              Trial {trial + 1} · {T.name}
            </h3>
            <p className="op-blurb">
              <MathText text={T.blurb} />
            </p>
            <p className="forgery-count">⚡ Lash the beacon of each forgery · spare the honest ones</p>
          </div>
        )}

        {line && (
          <div className="dialog" onClick={advance}>
            <Portrait id={line.portrait} name={line.speaker} />
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

        {playEnabled && !line && <div className="hint">WASD to move · click or F to crack the Lash toward a beacon or a spawn</div>}

        {rules && (
          <div className="win-banner" onClick={() => setRules(false)}>
            <div className="win-card wide">
              <span className="lvl-kicker">The Delta Sphere · how it works</span>
              <h2>Null’s trials</h2>
              <p className="def">Each round, Null runs three demonstrations on the floor, with a violet beacon by each. Walk up to the beacon of a forgery and crack the Lash at it. Lashing an honest one summons Crown shards and the round starts over.</p>
              <p className="def">Trial 1 tests homotopy of loops and the winding number (1-1 to 1-4). Trial 2 tests lifts to the helix (1-3, 1-8, 1-9). Trial 3 tests words in free groups and on the torus (1-5 to 1-7). Then the Crown’s guard.</p>
              <div className="btn-row">
                <button type="button" className="btn primary">
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {complete && (
        <EmmyEndCard
          kicker="World 1 · Castle cleared"
          title="The Delta Sphere"
          learned="Loops that deform into each other with the ends held still count as one, and they multiply by running one after the other: that’s π₁. Lifting to the helix turns a loop on a circle into a whole number, the winding number, and a lift never jumps or strays. On the figure-eight the only honest move is cancelling a letter against its inverse; glue in the torus’s square and a b a⁻¹ b⁻¹ dies. Null forged every one of those, and you caught him."
          ahead="But Null still has his sphere, and on a sphere every loop shrinks: π₁(S²) is trivial. Loops can’t see a hole you can’t wrap a string round. Whatever happens next, we’ll need a way of counting what a surface encloses, not just what a loop winds around."
          definition={DEFINITION_CASTLE1}
          defLabel="World 1 in the book (after Hatcher)"
          stayLabel="Back to title"
          onStay={onBackToTitle}
          onNext={onNext || onBackToTitle}
          nextLabel={onNext ? 'Continue ▸' : 'Back to title'}
        />
      )}
      {paused && (
        <PauseMenu
          title="The Delta Sphere"
          progress={step === 'final' || step === 'done' ? 'The Crown’s guard' : `Trial ${Math.min(3, trial + 1)} of 3`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('castle1', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
    </div>
  )
}
