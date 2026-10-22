import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StationScene from './StationScene'
import OutroMovie from './OutroMovie'
import LevelMovie from '../../screens/LevelMovie'
import MathText from '../../screens/MathText'
import { EmmyEndCard, PauseMenu, usePause } from '../../screens/LevelChrome'
import { BEACON_OFFSET, BOSS_AT, COMMUTES, DEFINITION_CASTLE, FINALE, HINTS_CASTLE, OPENING, PANELS, PUNISH, START, TRIALS, WAVES } from './stages'
import { dialogOpen, duckMusic, readMuted, setMuted as setAudioMuted, sfxCorrect, sfxWrong, startNullMusic, startReachMusic, stopMusic, textBlip, unlockAudio } from '../../audio/chip'
import scripts from './scripts.json'

/**
 * World 3 · Castle "The Counterfeit Station": the Commutator's three trials on his concourse,
 * Null watching through the Crown. Each round: three demonstrations, a judgment beacon by each.
 * Lash the beacons of the forgeries; lashing an honest one brings Crown shards and restarts the
 * round. Waves of the cohomology wing come between trials (chase camera; the trials are read from
 * overhead). The final phase is the Commutator's guard: a Poincaré Colossus and a de Rham Spectre.
 * Then the outro movie and Emmy's end card.
 */

const OUTRO = scripts.videos.find((v) => v.id === 'castle-3-outro-v2')
const TYPE_CPS = 45
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  commutator: ['500%', '53%', '19%'],
}
const WALK = {
  inside: (x, z) => Math.hypot(x, z) < 8.3 && Math.hypot(x - BOSS_AT[0], z - BOSS_AT[1]) > 2.3,
  insideForSpawn: (x, z) => Math.hypot(x, z) < 8.0 && Math.hypot(x - BOSS_AT[0], z - BOSS_AT[1]) > 2.3,
  bounds: { minX: -9, maxX: 9, minZ: -9, maxZ: 9 },
}
const isHonest = (t, ex) => TRIALS[t].honest.includes(ex)
const beaconSite = (t, r, i, epoch) => `b:${t}:${r}:${i}:${epoch}`
const waveDefs = (w) => WAVES[w].map(([type, x, z]) => ({ type, x, z, site: 'arena' }))

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

export default function LevelCastle3({ onBackToTitle, onNext, onGo, startAt }) {
  const skipTo = Math.max(0, Math.min(3, Number(startAt ?? new URLSearchParams(window.location.search).get('startAt')) || 0)) // dev: trial to start at (3 = the final phase)
  const [step, setStep] = useState('intro') // intro | trial | wave | final | finale | outro
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
  const camYawRef = useRef(Math.atan2(START[0] - BOSS_AT[0], START[1] - BOSS_AT[1]))
  const [knockouts, setKnockouts] = useState(0)
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('lash')
  const [stance, setStance] = useState('chain')
  const [rules, setRules] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [complete, setComplete] = useState(false)
  const stateRef = useRef(null)
  const frameRef = useRef({ center: [0, 0.2], size: 13.5 })
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const seenSites = useRef(new Set())
  const talker = useRef(null)
  const crownGlow = useRef(0.4)

  const round = TRIALS[trial].rounds[roundIdx]
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

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

  // the lash's stance (G), for the badge
  useEffect(() => {
    const on = (e) => setStance(e.detail)
    window.addEventListener('lash-stance', on)
    return () => window.removeEventListener('lash-stance', on)
  }, [])

  // ---------- the flow
  // spawn into the game layer; if it hasn't mounted yet (a slow first load and a quick reader),
  // hold the spawn until it has, so the beacons are never lost
  const pendingSpawn = useRef([])
  const spawn = (defs) => {
    if (spawnRef.current) spawnRef.current(defs)
    else pendingSpawn.current.push(defs)
  }
  useEffect(() => {
    const id = setInterval(() => {
      if (!spawnRef.current || !pendingSpawn.current.length) return
      const list = pendingSpawn.current
      pendingSpawn.current = []
      list.forEach((d) => spawnRef.current(d))
    }, 200)
    return () => clearInterval(id)
  }, [])
  const beaconsFor = (t, r, ep, states) =>
    PANELS.map((p, i) => (states[i] === 'live' ? { type: 'beacon', x: p[0] + BEACON_OFFSET[0], z: p[1] + BEACON_OFFSET[1], site: beaconSite(t, r, i, ep) } : null)).filter(Boolean)
  const startRound = (t, r, ep) => {
    setStep('trial')
    setTrial(t)
    setRoundIdx(r)
    setEpoch(ep)
    const st = ['live', 'live', 'live']
    setPanelStates(st)
    spawn(beaconsFor(t, r, ep, st))
  }
  const startWave = (t) => {
    seenSites.current.delete('arena') // leftover punishment shards can't end the wave early
    setStep(t === 2 ? 'final' : 'wave')
    spawn(waveDefs(t))
  }
  const startTrial = (t) => {
    afterTalk.current = () => startRound(t, 0, epoch + 1)
    say(TRIALS[t].intro, 'after')
  }
  const startFinale = () => {
    setStep('finale')
    afterTalk.current = () => setStep('outro')
    say(FINALE, 'after')
  }
  useEffect(() => {
    if (skipTo === 3) {
      setTrial(2)
      afterTalk.current = () => startWave(2)
      return say(TRIALS[2].done, 'after')
    }
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
      spawn(PUNISH.map(([type, x, z]) => ({ type, x, z, site: 'arena' })))
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
      afterTalk.current = () => startWave(trial)
      say(T.done, 'after')
    }
    say(line, 'after')
  }

  // waves end when the arena is clear
  useEffect(() => {
    if ((step !== 'wave' && step !== 'final') || phase !== 'play') return
    if (!seenSites.current.has('arena') || enemies.arena) return
    seenSites.current.delete('arena')
    if (step === 'final') return startFinale()
    startTrial(trial + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, step, phase])

  // knocked out: the round (or wave) starts over
  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    setStance('chain')
    if (step === 'trial') setPanelStates(['live', 'live', 'live'])
    say([HINTS_CASTLE.knockout(step === 'wave' || step === 'final')])
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
  talker.current = line?.speaker || null
  crownGlow.current = talker.current === 'Count Null' ? 1.6 : 0.4
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
  const [paused, setPaused] = usePause(step === 'outro' || complete)
  const fighting = step === 'wave' || step === 'final'
  // the trials are read from above; the waves are fought with the chase camera
  const finaleOn = step === 'finale' || step === 'outro'
  frameRef.current = fighting ? null : finaleOn ? { center: [0, -4.6], size: 10, follow: 0 } : { center: [0, 0.2], size: 13.5 }
  const lastStep = useRef(step)
  if (lastStep.current !== step) {
    if (lastStep.current === 'wave' || lastStep.current === 'final') camYawRef.current = Math.atan2(START[0] - BOSS_AT[0], START[1] - BOSS_AT[1])
    lastStep.current = step
  }
  const playEnabled = phase === 'play' && !rules && step !== 'outro' && step !== 'finale' && !complete && !paused
  const gameKey = `castle3:${knockouts}`
  const game = useMemo(() => {
    const list = step === 'trial' ? beaconsFor(trial, roundIdx, epoch, ['live', 'live', 'live']) : step === 'wave' ? waveDefs(trial) : step === 'final' ? waveDefs(2) : []
    return { mode: 'overworld', bySite: true, start: START, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])
  // the final phase is the Commutator's turn: every few seconds he raises his baton and his loops
  // a, b, a⁻¹, b⁻¹ fling a pair of Crown shards from the dais (at most COMMUTES times)
  const castAt = useRef(-10)
  const casts = useRef(0)
  useEffect(() => {
    if (step !== 'final' || phase !== 'play' || paused) return
    const id = setInterval(() => {
      if (casts.current >= COMMUTES.length) return
      const line = COMMUTES[casts.current++]
      castAt.current = performance.now() / 1000
      spawn([['shard', BOSS_AT[0] - 2.4, BOSS_AT[1] + 2.6], ['shard', BOSS_AT[0] + 2.4, BOSS_AT[1] + 2.6]].map(([type, x, z]) => ({ type, x, z, site: 'arena' })))
      setToast(line)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 2600)
    }, 8000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase, paused])
  const bossScript = () => ({
    gesture: talker.current === 'The Commutator' || performance.now() / 1000 - castAt.current < 1.4 ? 1 : step === 'final' ? 0.5 : 0.15,
    talk: talker.current === 'The Commutator' ? 1 : 0,
    cloak: 0,
    crack: finaleOn ? 1 : 0,
    kneel: finaleOn ? 1 : 0,
    loops: step === 'final' && performance.now() / 1000 - castAt.current < 1.4 ? 1.5 : 1,
  })

  if (import.meta.env.DEV) window.__castle3 = { step, trial, roundIdx, epoch, panelStates, phase, enemies, round, complete: () => setComplete(true), spawn: (defs) => spawnRef.current?.(defs), clearArena: () => spawnRef.current?.remove((e) => e.site === 'arena'), lash: (i) => spawnRef.current?.remove((e) => e.site === beaconSite(trial, roundIdx, i, epoch)), frameRef } // dev

  const T = TRIALS[trial]
  const objective =
    step === 'trial'
      ? `Trial ${trial + 1}/3 · ${T.name} · round ${roundIdx + 1}/${T.rounds.length}`
      : step === 'wave'
        ? 'Clear the guard'
        : step === 'final'
          ? 'Final: the Commutator’s last stand'
          : 'The Counterfeit Station'

  return (
    <div className="screen level">
      <Canvas camera={{ position: [0, 14, 18], fov: 45 }} dpr={[1, 1.5]} frameloop={step === 'outro' ? 'never' : 'always'}>
        <StationScene
          trial={trial}
          round={round}
          panelStates={panelStates}
          showPanels={step === 'trial'}
          bossScript={bossScript}
          crownGlow={crownGlow}
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
            <span className="lvl-kicker">World 3 · Castle</span>
            <h2>The Counterfeit Station</h2>
            <div className="hud">
              <span className="hearts" aria-label={`${hearts} hearts`}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
                    ♥
                  </span>
                ))}
              </span>
              <span className="objective">{objective}</span>
              <span className={`stance-badge ${stance}`} title="G switches the lash between chain and cochain stance">
                {stance === 'cochain' ? 'Cochain stance' : 'Chain stance'} <kbd>G</kbd>
              </span>
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

        {toast && !line && <div className="toast">{toast}</div>}
        {playEnabled && !toast && !line && (
          <div className="hint">
            {fighting ? 'WASD to move · click or F to lash · G switches chain / cochain stance' : 'WASD to move · watch each demonstration · click or F to lash the beacon of a forgery'}
          </div>
        )}

        {rules && (
          <div className="win-banner" onClick={() => setRules(false)}>
            <div className="win-card wide">
              <span className="lvl-kicker">The Counterfeit Station · how it works</span>
              <h2>The Commutator’s trials</h2>
              <p className="def">Each round, three demonstrations play on the concourse, each with the Commutator’s claim on a brass plate and a violet beacon behind it. Walk up to the beacon of a false claim and crack the Lash at it. Lashing an honest one summons Crown shards and the round starts over.</p>
              <p className="def">Trial 1 checks coboundaries and the universal coefficient theorem (3-1, 3-2). Trial 2 checks cup products and rings (3-3 to 3-6). Trial 3 checks orientation and Poincaré duality (3-7 to 3-9).</p>
              <p className="def">Between trials his guard attacks. G switches the Lash between chain and cochain stance: Harpies only take cochain strikes, Spiders and the Colossus need alternating stances, and a Spectre must be circled once before it can be hit.</p>
              <div className="btn-row">
                <button type="button" className="btn primary">
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === 'outro' && !complete && (
        <LevelMovie video={OUTRO} Scene={OutroMovie} kicker="World 3 · Castle" name={OUTRO.title} startMusic={startReachMusic} embedded onDone={() => setComplete(true)} onSkip={() => setComplete(true)} />
      )}

      {complete && (
        <EmmyEndCard
          kicker="World 3 complete · Cup Product Gardens restored"
          title="The Counterfeit Station"
          learned="Cohomology turns the problem around: a cochain puts a number on every chain, and δ is ∂ read backwards, so δ² = 0. The universal coefficient theorem says it's mostly homology again, except torsion moves up a degree. Then the cup product makes it a ring, and the ring caught every disguise whose groups matched: the wedge that wore the torus's groups, S² ∨ S⁴ dressed as ℂP². On a closed orientable manifold, Poincaré duality folds the ring in half: Hᵏ ≅ Hₙ₋ₖ, and every class of infinite order has a cup partner (over a field, every class does)."
          ahead="But Null found the blind spot. Any map S³ → S² pulls H²(S²) back into H²(S³) = 0, so f* sends every class to zero, and he calls that proof the map is trivial. World 4 climbs past rings to the homotopy groups themselves: maps of spheres, up to deformation. There, at the Hopf fibration, we prove a map can be invisible to f* and still not shrink to a point."
          definition={DEFINITION_CASTLE}
          defLabel="World 3 in the book (after Hatcher)"
          stayLabel="Back to title"
          onStay={onBackToTitle}
          onNext={onNext || onBackToTitle}
          nextLabel={onNext ? 'Continue ▸ World 4' : 'Back to title'}
        />
      )}
      {paused && (
        <PauseMenu
          title="The Counterfeit Station"
          progress={step === 'final' || finaleOn ? 'The final phase' : `Trial ${Math.min(3, trial + 1)} of 3`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('castle3v2', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
    </div>
  )
}
