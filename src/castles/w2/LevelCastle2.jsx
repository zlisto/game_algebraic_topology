import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LevelMovie from '../../screens/LevelMovie'
import MathText from '../../screens/MathText'
import { PauseMenu, usePause } from '../../screens/LevelChrome'
import { dialogOpen, duckMusic, readMuted, setMuted as setAudioMuted, sfxCorrect, sfxWrong, startNullMusic, stopMusic, textBlip, unlockAudio } from '../../audio/chip'
import Castle2Scene from './Castle2Scene'
import Castle2Outro, { OUTRO_MUSIC, OUTRO_START } from './Castle2Outro'
import { OUTRO_VIDEO } from './videos2'
import { Castle2EndCard } from './Screens2'
import { ANCHOR_HP, ANCHORS, BEACON_OFFSET, FINAL_GUARD, FINAL_INTRO, HINTS_CASTLE, NULL_AT, OPENING, PANELS, PROOF, PUNISH, SEIZE, TRIALS, WAVES } from './stagesCastle2'

/**
 * World 2 · Castle "The Retractor": Count Null's three trials in his engine-hall at the mouth of
 * Chain Delta, a review of homology (Hatcher Ch. 2). Each round: three claims on the floor, a
 * judgment beacon by each. Lash the forgeries' beacons; lashing an honest one brings Crown
 * shards and restarts the round. Delta beasts between trials (chase camera); then the
 * Retractor: break its three chain anchors through its guard, one proof line each, and it
 * seizes. Then the outro movie.
 */

const TYPE_CPS = 45
const START = [0, 7.2]
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
const TOP_VIEW = { center: [0, -0.2], size: 15.5 }
const ENGINE_VIEW = { center: [0, -13.5], size: 14, follow: 0 } // the Retractor seizing
const isHonest = (t, ex) => TRIALS[t].honest.includes(ex)
const beaconSite = (t, r, i, epoch) => `b:${t}:${r}:${i}:${epoch}`
const anchorSite = (i) => `anchor:${i}`
const finalDefs = (live) => [
  ...ANCHORS.map((a, i) => (live[i] ? { type: 'beacon', x: a[0], z: a[1], site: anchorSite(i), hp: ANCHOR_HP } : null)).filter(Boolean),
  ...FINAL_GUARD.map(([type, x, z]) => ({ type, x, z, site: 'arena' })),
]

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

export default function LevelCastle2({ onBackToTitle, onNext, onGo, startAt }) {
  const skipTo = Math.max(0, Math.min(3, Number(startAt) || 0)) // dev: trial to start at (3 = the Retractor)
  const [step, setStep] = useState('intro') // intro | trial | wave | final | outro
  const [trial, setTrial] = useState(Math.min(2, skipTo))
  const [roundIdx, setRoundIdx] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [panelStates, setPanelStates] = useState(['live', 'live', 'live'])
  const [anchorsLive, setAnchorsLive] = useState(null)
  const [seized, setSeized] = useState(false)
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const camYawRef = useRef(Math.atan2(START[0] - NULL_AT[0], START[1] - NULL_AT[1]))
  const [knockouts, setKnockouts] = useState(0)
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('lash')
  const [rules, setRules] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [complete, setComplete] = useState(false)
  const stateRef = useRef(null)
  const frameRef = useRef(TOP_VIEW)
  const spawnRef = useRef(null)
  const afterTalk = useRef(null)
  const seenSites = useRef(new Set())
  const nullTalking = useRef(false)
  const engineRef = useRef({ squeeze: 0.35, seized: false })
  engineRef.current.squeeze = step === 'final' ? 0.95 : 0.35
  engineRef.current.seized = seized

  const round = TRIALS[trial].rounds[roundIdx]
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  // music
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
  const startRound = (t, r, ep) => {
    setStep('trial')
    setTrial(t)
    setRoundIdx(r)
    setEpoch(ep)
    const st = ['live', 'live', 'live']
    setPanelStates(st)
    spawnRef.current?.(beaconsFor(t, r, ep, st))
  }
  /** Set Gyroid back at the start, facing Null, with a moment's grace (fights begin across the floor from him). */
  const toStart = (grace = 1.2) => {
    const s = stateRef.current
    if (!s) return
    s.x = START[0]
    s.z = START[1]
    s.face = Math.PI
    s.hurt = Math.max(s.hurt || 0, grace)
  }
  const startWave = (t) => {
    seenSites.current.delete('arena') // punishment shards killed during a trial mustn't end the wave at once
    toStart()
    setStep('wave')
    spawnRef.current?.(WAVES[t].map(([type, x, z]) => ({ type, x, z, site: 'arena' })))
  }
  const startTrial = (t) => {
    afterTalk.current = () => startRound(t, 0, epoch + 1)
    say(TRIALS[t].intro, 'after')
  }
  const startFinal = () => {
    seenSites.current.delete('arena')
    setStep('final')
    afterTalk.current = () => {
      toStart()
      const live = [true, true, true]
      setAnchorsLive(live)
      spawnRef.current?.(finalDefs(live))
    }
    say(FINAL_INTRO, 'after')
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
    if (phase !== 'play') return
    if (step === 'trial')
      PANELS.forEach((_, i) => {
        const site = beaconSite(trial, roundIdx, i, epoch)
        if (panelStates[i] !== 'live' || !seenSites.current.has(site) || enemies[site]) return
        judge(i)
      })
    if (step === 'final' && anchorsLive) {
      const i = anchorsLive.findIndex((live, k) => live && seenSites.current.has(anchorSite(k)) && !enemies[anchorSite(k)])
      if (i < 0) return
      seenSites.current.delete(anchorSite(i))
      sfxCorrect()
      const next = anchorsLive.map((l, k) => (k === i ? false : l))
      setAnchorsLive(next)
      const broken = next.filter((l) => !l).length
      if (broken < 3) return say(PROOF[broken - 1])
      // the last anchor: the Retractor seizes, its guard falls with it
      afterTalk.current = () => {
        // the beat: the guard falls, the camera turns to the engine, the clamps drop and the ball goes dark
        spawnRef.current?.remove(() => true)
        setSeized(true)
        setPhase('seize')
        setTimeout(() => {
          afterTalk.current = () => setStep('outro')
          say(SEIZE, 'after')
        }, 2600)
      }
      say(PROOF[2], 'after')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies])
  const judge = (i) => {
    const ex = round[i]
    const T = TRIALS[trial]
    if (isHonest(trial, ex)) {
      sfxWrong()
      setPanelStates((p) => p.map((s, j) => (j === i ? 'spared' : s)))
      spawnRef.current?.(PUNISH.map(([type, x, z]) => ({ type, x, z, site: 'arena' })))
      afterTalk.current = () => {
        spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
        startRound(trial, roundIdx, epoch + 1)
      }
      return say(HINTS_CASTLE.wrong(T.spared[ex]), 'after')
    }
    sfxCorrect()
    const next = panelStates.map((s, j) => (j === i ? 'exposed' : s))
    setPanelStates(next)
    const left = round.some((e, j) => next[j] === 'live' && !isHonest(trial, e))
    const line = [{ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: `Forgery! ${T.why[ex]}` }]
    if (left) return say(line)
    afterTalk.current = () => {
      spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
      if (roundIdx + 1 < T.rounds.length) return startRound(trial, roundIdx + 1, epoch + 1)
      afterTalk.current = () => (trial < 2 ? startWave(trial) : startFinal())
      say(T.done, 'after')
    }
    say(line, 'after')
  }

  // waves end when the arena is clear
  useEffect(() => {
    if (step !== 'wave' || phase !== 'play') return
    if (!seenSites.current.has('arena') || enemies.arena) return
    seenSites.current.delete('arena')
    startTrial(trial + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, step, phase])

  // won: on to the outro screen ('outroc2' plays the movie, then Emmy's end card); without a chain, play it here
  useEffect(() => {
    if (step === 'outro' && onNext) onNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // knocked out: the round (or wave, or the Retractor's guard) starts over
  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    if (step === 'wave' || step === 'final') {
      // a fight keeps its kills: Gyroid is back on his feet at the start, with a moment's grace
      if (stateRef.current) stateRef.current.hearts = 3
      toStart(2.5)
    } else {
      setKnockouts((k) => k + 1)
      if (step === 'trial') setPanelStates(['live', 'live', 'live'])
    }
    say([step === 'wave' || step === 'final' ? HINTS_CASTLE.knockoutFight : HINTS_CASTLE.knockout])
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

  // ---------- game layer (rebuilt after a knockout with what should be on the floor)
  const [paused, setPaused] = usePause(step === 'outro' || complete)
  const fighting = step === 'wave' || (step === 'final' && !!anchorsLive && !seized)
  frameRef.current = seized ? ENGINE_VIEW : fighting ? null : TOP_VIEW
  const lastStep = useRef(fighting)
  if (lastStep.current !== fighting) {
    if (lastStep.current) camYawRef.current = Math.atan2(START[0] - NULL_AT[0], START[1] - NULL_AT[1])
    lastStep.current = fighting
  }
  const playEnabled = phase === 'play' && !rules && step !== 'outro' && !complete && !paused
  const gameKey = `castle2:${knockouts}`
  const game = useMemo(() => {
    const list =
      step === 'trial'
        ? beaconsFor(trial, roundIdx, epoch, ['live', 'live', 'live'])
        : step === 'wave'
          ? WAVES[trial].map(([type, x, z]) => ({ type, x, z, site: 'arena' }))
          : step === 'final' && anchorsLive && !seized
            ? finalDefs(anchorsLive)
            : []
    return { mode: 'overworld', bySite: true, start: START, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])
  const nullScript = () => ({ gesture: nullTalking.current ? 1 : 0.2, crown: step === 'final' ? 1 : 0.6, crownY: 0 })

  if (import.meta.env.DEV) window.__castle2 = { step, trial, roundIdx, epoch, panelStates, anchorsLive, phase, enemies, round, get player() { return stateRef.current }, complete: () => setComplete(true), spawn: (defs) => spawnRef.current?.(defs), remove: (f) => spawnRef.current?.remove(f) } // dev

  const T = TRIALS[trial]
  const broken = anchorsLive ? anchorsLive.filter((l) => !l).length : 0
  const objective =
    step === 'trial'
      ? `Trial ${trial + 1}/3 · ${T.name} · round ${roundIdx + 1}/${T.rounds.length}`
      : step === 'wave'
        ? 'Clear the Delta’s beasts'
        : step === 'final'
          ? seized
            ? 'The Retractor seizes'
            : `Break the chain anchors · ${broken}/3`
          : 'The Retractor'

  return (
    <div className="screen level">
      <Canvas camera={{ position: [0, 14, 18], fov: 45 }} dpr={[1, 1.5]} frameloop={step === 'outro' ? 'never' : 'always'}>
        <Castle2Scene
          trial={trial}
          round={round}
          panelStates={panelStates}
          showPanels={step === 'trial'}
          anchorsLive={step === 'final' && !seized ? anchorsLive : null}
          engineRef={engineRef}
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
            <span className="lvl-kicker">World 2 · Castle</span>
            <h2>The Retractor</h2>
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
        {step === 'final' && anchorsLive && !seized && (
          <div className="rules-panel forge-panel works-panel">
            <h3>The Retractor</h3>
            <p className="op-blurb">
              <MathText text="Null wants a retraction $r: B³ → S²$. Break the three violet anchors chaining the floor to the engine. Each one is a line of the proof that $r$ can’t exist." />
            </p>
            <p className="forgery-count">⚡ Anchors broken: {broken}/3</p>
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

        {playEnabled && !line && (
          <div className="hint">
            {step === 'trial' ? 'WASD to move · click or F to crack the Lash at a forgery’s beacon' : 'WASD to move · click or F to crack the Lash · Klein and ℝP² beasts need a quick second lash'}
          </div>
        )}

        {rules && (
          <div className="win-banner" onClick={() => setRules(false)}>
            <div className="win-card wide">
              <span className="lvl-kicker">The Retractor · how it works</span>
              <h2>Null’s trials</h2>
              <p className="def">Each round, Null puts three claims on the floor, each with a picture and a violet beacon. Walk up to the beacon of a forgery and crack the Lash at it. Lashing an honest one summons Crown shards, and the round starts over.</p>
              <p className="def">Trial 1 tests boundaries and cycles (2-1 to 2-3). Trial 2 tests homology groups of named spaces, with torsion and ℤ₂ coefficients (2-4, 2-7, 2-9). Trial 3 tests degree, χ and Mayer–Vietoris (2-6, 2-5, 2-8). Then break the Retractor.</p>
              <div className="btn-row">
                <button type="button" className="btn primary">
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === 'outro' && !complete && !onNext && (
        <LevelMovie video={OUTRO_VIDEO} Scene={Castle2Outro} kicker="World 2 complete" name="Chain Delta restored" startMusic={OUTRO_START} musicCues={OUTRO_MUSIC} embedded onDone={() => setComplete(true)} onSkip={() => setComplete(true)} />
      )}

      {complete && <Castle2EndCard onNext={onNext} onBackToTitle={onBackToTitle} />}
      {paused && (
        <PauseMenu
          title="The Retractor"
          progress={step === 'final' ? 'The Retractor' : `Trial ${Math.min(3, trial + 1)} of 3`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('castle2', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
    </div>
  )
}
