import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CrownScene from './CrownScene'
import {
  BEACON_OFFSET, COMMUTATOR_ARRIVES, CROWN_INTRO, DEFINITION_CASTLE, EXHIBITS, FACETS, FACET_INTRO, FINALE, FURY, HINTS_CASTLE, NULL_AT, OPENING, PANELS, PROOFS, PUNISH, SEALS, SHOUT, TRIALS, WAVES,
} from './stages'
import { dialogOpen, duckMusic, readMuted, setMuted as setAudioMuted, sfxCorrect, sfxCrack, sfxWrong, startNullMusic, stopMusic, textBlip, unlockAudio } from '../../audio/chip'
import MathText from '../../screens/MathText'
import { EmmyEndCard, PauseMenu, usePause } from '../../screens/LevelChrome'
import './castle4.css'

/**
 * World 4 · Castle "The Null Crown", the final boss.
 *   intro → Trial 1 (3 rounds) → wave → Trial 2 (2) → wave → Trial 3 (3) → wave
 *   → the Crown: the Commutator turns; five facets, each broken only by the proof that refutes its law
 *     (Crown fury waves after facets 2 and 4) → Null's one shout → the six seals (Null at full power)
 *   → the Crown shatters → Emmy's end card → 'ending'.
 * Trials and facets are read from overhead; every fight uses the chase camera.
 */

const TYPE_CPS = 45
const START = [0, 7.2]
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  commutator: ['500%', '53%', '19%'],
}
const WALK = {
  inside: (x, z) => Math.hypot(x, z) < 8.3 && Math.hypot(x - NULL_AT[0], z - NULL_AT[1]) > 2.3,
  insideForSpawn: (x, z) => Math.hypot(x, z) < 8.0 && Math.hypot(x - NULL_AT[0], z - NULL_AT[1]) > 2.3,
  bounds: { minX: -9, maxX: 9, minZ: -9, maxZ: 9 },
}
const site = (tag, i, epoch) => `b:${tag}:${i}:${epoch}`
const arena = (list) => list.map(([type, x, z]) => ({ type, x, z, site: 'arena' }))
const TRIAL_ROUNDS = TRIALS.reduce((n, T) => n + T.rounds.length, 0)
// the Crown's health: every round won and wave cleared chips it; facets crack it; the seals finish it
const DMG = { round: 3, wave: 3, facet: 7 }
const BEFORE_SEALS = TRIAL_ROUNDS * DMG.round + WAVES.length * DMG.wave + FACETS.length * DMG.facet

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

function BossBar({ hp, facetsBroken, fury }) {
  return (
    <div className={`c4-boss${fury ? ' fury' : ''}`} aria-label={`The Null Crown, ${Math.round(hp)} percent`}>
      <div className="c4-boss-name">
        <span>THE NULL CROWN</span>
        <span className="c4-facets">
          {FACETS.map((f, i) => (
            <span key={f.name} className={i < facetsBroken ? 'gone' : ''} title={f.name}>
              ◆
            </span>
          ))}
        </span>
      </div>
      <div className="c4-boss-track">
        <div className="c4-boss-fill" style={{ width: `${Math.max(0, hp)}%` }} />
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className="c4-boss-tick" style={{ left: `${k * 20}%` }} />
        ))}
      </div>
    </div>
  )
}

export default function LevelCastle4({ onBackToTitle, onNext, onGo, startAt }) {
  // dev: ?screen=castle4&shrine=N — 0..2 a trial, 3 the Crown (facets), 4 the seals
  const skipTo = Math.max(0, Math.min(4, Number(startAt) || 0))
  const [step, setStep] = useState('intro') // intro | trial | wave | crown | fwave | core | won
  const [trial, setTrial] = useState(Math.min(2, skipTo))
  const [roundIdx, setRoundIdx] = useState(0)
  const [facet, setFacet] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [panelStates, setPanelStates] = useState(['live', 'live', 'live'])
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
  const enemiesRef = useRef(enemies)
  enemiesRef.current = enemies
  const [tool, setTool] = useState('lash')
  const [rules, setRules] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [complete, setComplete] = useState(false)
  const [dmg, setDmg] = useState(() => (skipTo >= 3 ? TRIAL_ROUNDS * DMG.round + WAVES.length * DMG.wave : 0) + (skipTo >= 4 ? FACETS.length * DMG.facet : 0))
  const [commutator, setCommutator] = useState(skipTo >= 3)
  const [panelsOn, setPanelsOn] = useState(false)
  const stateRef = useRef(null)
  const frameRef = useRef({ center: [0, -1.8], size: 17 })
  const spawnRef = useRef(null)
  const afterTalk = useRef(null)
  const seenSites = useRef(new Set())
  const nullTalking = useRef(false)
  const crownRef = useRef({ broken: skipTo >= 4 ? 5 : 0, low: skipTo >= 4 ? 1 : 0, shatter: 0, fury: 0.4, beam: 0 })
  const furyRef = useRef(0.4)
  const flashRef = useRef(0)

  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  // music: Null's theme, the whole way up
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

  // spawn into the game layer; if it hasn't mounted yet (a quick reader on a slow first load),
  // hold the spawn until it has, so beacons and seals are never lost
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

  // ---------- what is on the floor for each step
  const trialBeacons = (t, r, ep) => PANELS.map((p, i) => ({ type: 'beacon', x: p[0] + BEACON_OFFSET[0], z: p[1] + BEACON_OFFSET[1], site: site(`t${t}r${r}`, i, ep) }))
  const facetBeacons = (f, ep) => PANELS.map((p, i) => ({ type: 'beacon', x: p[0] + BEACON_OFFSET[0], z: p[1] + BEACON_OFFSET[1], site: site(`f${f}`, i, ep) }))
  const seals = () => SEALS.map(([x, z]) => ({ type: 'beacon', x, z, site: 'core' }))

  const startRound = (t, r, ep) => {
    setStep('trial')
    setTrial(t)
    setRoundIdx(r)
    setEpoch(ep)
    setPanelStates(['live', 'live', 'live'])
    setPanelsOn(true)
    spawn(trialBeacons(t, r, ep))
  }
  const startWave = (t) => {
    setStep('wave')
    setPanelsOn(false)
    spawnRef.current?.remove((e) => e.site === 'arena') // the Crown's punishment doesn't carry into the wave
    spawn(arena(WAVES[t]))
  }
  const startTrial = (t) => {
    afterTalk.current = () => startRound(t, 0, epoch + 1)
    say(TRIALS[t].intro, 'after')
  }
  const startFacetRound = (f, ep) => {
    setStep('crown')
    setFacet(f)
    setEpoch(ep)
    setPanelStates(['live', 'live', 'live'])
    setPanelsOn(true)
    spawn(facetBeacons(f, ep))
  }
  const startFacet = (f, ep) => {
    setPanelsOn(false)
    afterTalk.current = () => startFacetRound(f, ep)
    say(FACET_INTRO(f), 'after')
  }
  const startCrown = () => {
    setStep('crown')
    setPanelsOn(false)
    crownRef.current.fury = 0.75
    furyRef.current = 0.75
    afterTalk.current = () => {
      setCommutator(true)
      flashRef.current = 0.9
      sfxCrack()
      spawn(arena([['shard', -3, -3], ['shard', 3, -3]]))
      afterTalk.current = () => startFacet(0, epoch + 1)
      say(COMMUTATOR_ARRIVES, 'after')
    }
    say(CROWN_INTRO, 'after')
  }
  const startCore = () => {
    setStep('core')
    setPanelsOn(false)
    crownRef.current.low = 1
    crownRef.current.fury = 1
    crownRef.current.beam = 0
    furyRef.current = 1
    spawn([...seals(), ...arena([['shard', -4, -2], ['shard', 4, -2]])])
  }
  const win = () => {
    setStep('won')
    spawnRef.current?.remove(() => true)
    // the Crown shatters: a swell, then the flash
    const t0 = performance.now()
    const id = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / 1800)
      crownRef.current.shatter = k
      flashRef.current = k < 0.6 ? k * 0.6 : 1.4 * (1 - (k - 0.6) / 0.4) + 0.2
      if (k >= 1) {
        clearInterval(id)
        flashRef.current = 0
        furyRef.current = 0
        afterTalk.current = () => setComplete(true)
        say(FINALE, 'after')
      }
    }, 30)
  }

  useEffect(() => {
    if (skipTo === 3) return startCrown()
    if (skipTo === 4) {
      afterTalk.current = () => startCore()
      return say(SHOUT.slice(-1), 'after')
    }
    afterTalk.current = () => startRound(skipTo, 0, 0)
    say(skipTo === 0 ? [...OPENING, ...TRIALS[0].intro] : TRIALS[skipTo].intro, 'after')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- verdicts: a beacon was lashed (its site's count fell to 0)
  const tag = step === 'crown' ? `f${facet}` : `t${trial}r${roundIdx}`
  useEffect(() => {
    for (const s of Object.keys(enemies)) if (enemies[s] > 0) seenSites.current.add(s)
    if ((step !== 'trial' && step !== 'crown') || phase !== 'play') return
    PANELS.forEach((_, i) => {
      const s = site(tag, i, epoch)
      if (panelStates[i] !== 'live' || !seenSites.current.has(s) || enemies[s]) return
      if (step === 'trial') judgeTrial(i)
      else judgeFacet(i)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies])

  const restartAfter = (again) => () => {
    spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
    again()
  }
  const judgeTrial = (i) => {
    const T = TRIALS[trial]
    const round = T.rounds[roundIdx]
    const ex = EXHIBITS[round[i]]
    if (ex.honest) {
      sfxWrong()
      setPanelStates((p) => p.map((s, j) => (j === i ? 'spared' : s)))
      spawn(arena(PUNISH))
      afterTalk.current = restartAfter(() => startRound(trial, roundIdx, epoch + 1))
      return say(HINTS_CASTLE.wrong(ex.reason), 'after')
    }
    sfxCorrect()
    const next = panelStates.map((s, j) => (j === i ? 'exposed' : s))
    setPanelStates(next)
    const left = round.some((id, j) => next[j] === 'live' && !EXHIBITS[id].honest)
    const line = [{ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: `Forgery! ${ex.reason}` }]
    if (left) return say(line)
    setDmg((d) => d + DMG.round)
    afterTalk.current = () => {
      spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
      if (roundIdx + 1 < T.rounds.length) return startRound(trial, roundIdx + 1, epoch + 1)
      afterTalk.current = () => startWave(trial)
      say(T.done, 'after')
    }
    say(line, 'after')
  }
  const judgeFacet = (i) => {
    const F = FACETS[facet]
    const id = F.proofs[i]
    if (id !== F.answer) {
      sfxWrong()
      setPanelStates((p) => p.map((s, j) => (j === i ? 'spared' : s)))
      spawn(arena(PUNISH))
      afterTalk.current = restartAfter(() => startFacetRound(facet, epoch + 1))
      return say(HINTS_CASTLE.wrongProof(PROOFS[id].why), 'after')
    }
    sfxCorrect()
    sfxCrack()
    setPanelStates((p) => p.map((s, j) => (j === i ? 'exposed' : s)))
    crownRef.current.broken = facet + 1
    flashRef.current = 0.7
    setDmg((d) => d + DMG.facet)
    const f = facet
    afterTalk.current = () => {
      spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
      if (FURY[f]) {
        setStep('fwave')
        setPanelsOn(false)
        crownRef.current.beam = 0.6
        return spawn(arena(FURY[f]))
      }
      startFacet(f + 1, epoch + 1)
    }
    if (f === FACETS.length - 1) {
      // the last law falls: straight into Null's one shout, then the seals
      crownRef.current.fury = 1
      furyRef.current = 1
      afterTalk.current = () => {
        spawnRef.current?.remove((e) => e.site?.startsWith('b:'))
        startCore()
      }
      return say(SHOUT, 'after')
    }
    say(F.broke, 'after')
  }

  // waves end when the arena is clear
  useEffect(() => {
    if ((step !== 'wave' && step !== 'fwave') || phase !== 'play') return
    if (!seenSites.current.has('arena') || enemies.arena) return
    seenSites.current.delete('arena')
    if (step === 'fwave') {
      crownRef.current.beam = 0
      return startFacet(facet + 1, epoch + 1)
    }
    setDmg((d) => d + DMG.wave)
    if (trial < 2) return startTrial(trial + 1)
    startCrown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, step, phase])

  // the seals: when the last one breaks, so does the Crown
  useEffect(() => {
    if (step !== 'core') return
    if (!seenSites.current.has('core') || enemies.core) return
    seenSites.current.delete('core')
    win()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies, step])

  // Null at full power: shards keep coming during the Crown phase (the Commutator answers them)
  useEffect(() => {
    if (!(step === 'core' || step === 'crown') || phase !== 'play') return
    const every = step === 'core' ? 6500 : 11000
    const cap = step === 'core' ? 5 : 2
    const id = setInterval(() => {
      if ((enemiesRef.current.arena || 0) >= cap) return
      const a = Math.random() * Math.PI
      spawn(arena([['shard', NULL_AT[0] + Math.cos(a) * 3.2, NULL_AT[1] + 3 + Math.sin(a) * 0.8]]))
      if (step === 'core') spawn(arena([['shard', -NULL_AT[0] - Math.cos(a) * 3.2, NULL_AT[1] + 3.4]]))
    }, every)
    return () => clearInterval(id)
  }, [step, phase])
  // knocked out: the round (or wave) starts over
  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    if ((step === 'trial' || step === 'crown') && panelsOn) {
      // the round (or facet) starts over properly: fresh beacons under a new epoch
      setEpoch((e) => e + 1)
      setPanelStates(['live', 'live', 'live'])
    }
    say([step === 'trial' || step === 'crown' ? HINTS_CASTLE.knockout : HINTS_CASTLE.knockoutFight])
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
  const shouting = !!line && line.speaker === 'Count Null' && /^ENOUGH/.test(line.text)
  useEffect(() => {
    if (talking) dialogOpen()
    duckMusic(talking)
  }, [talking])
  useEffect(() => {
    if (shouting) {
      flashRef.current = 1
      sfxCrack()
      setTimeout(() => (flashRef.current = 0.3), 400)
    }
  }, [shouting])
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
  const fighting = step === 'wave' || step === 'fwave' || step === 'core'
  frameRef.current = fighting ? null : { center: [0, -1.8], size: 17 }
  const lastStep = useRef(step)
  if (lastStep.current !== step) {
    if (lastStep.current === 'wave' || lastStep.current === 'fwave') camYawRef.current = Math.atan2(START[0] - NULL_AT[0], START[1] - NULL_AT[1])
    lastStep.current = step
  }
  const playEnabled = phase === 'play' && !rules && !complete && !paused && step !== 'won'
  const gameKey = `castle4:${knockouts}`
  const game = useMemo(() => {
    let list = []
    if (step === 'trial') list = trialBeacons(trial, roundIdx, epoch)
    else if (step === 'crown') list = panelsOn ? facetBeacons(facet, epoch) : []
    else if (step === 'wave') list = arena(WAVES[trial])
    else if (step === 'fwave') list = arena(FURY[facet] || [])
    else if (step === 'core') list = seals()
    return { mode: 'overworld', bySite: true, start: START, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])
  const nullScript = () => ({ gesture: nullTalking.current ? 1 : 0.25, crown: step === 'core' || step === 'crown' || step === 'fwave' ? 1 : 0.6, crownY: 0 })

  const sealsLeft = step === 'core' ? (seenSites.current.has('core') ? enemies.core || 0 : SEALS.length) : step === 'won' ? 0 : SEALS.length
  const hp = step === 'won' ? 0 : 100 - Math.min(BEFORE_SEALS, dmg) - (step === 'core' ? ((SEALS.length - sealsLeft) / SEALS.length) * (100 - BEFORE_SEALS) : 0)
  const facetsBroken = step === 'won' || step === 'core' ? FACETS.length : crownRef.current.broken

  if (import.meta.env.DEV)
    window.__castle4 = { step, trial, roundIdx, facet, epoch, panelStates, phase, enemies, hp, complete: () => setComplete(true), spawn: (defs) => spawn(defs), remove: (f) => spawnRef.current?.remove(f), advance: () => advanceRef.current?.(), frameRef, stateRef, playEnabled } // dev

  const T = TRIALS[trial]
  const panels = !panelsOn ? null : step === 'trial' ? T.rounds[roundIdx].map((id) => EXHIBITS[id]) : step === 'crown' ? FACETS[facet].proofs.map((id) => PROOFS[id]) : null
  const objective =
    step === 'trial'
      ? `Trial ${trial + 1}/3 · ${T.name} · round ${roundIdx + 1}/${T.rounds.length}`
      : step === 'wave' || step === 'fwave'
        ? 'Clear the spawn'
        : step === 'crown'
          ? `The Crown · facet ${facet + 1}/5`
          : step === 'core'
            ? `Break the seals · ${sealsLeft} left`
            : step === 'won'
              ? 'The Crown is broken'
              : 'The Null Crown'

  return (
    <div className={`screen level c4-level${shouting ? ' c4-shake' : ''}`}>
      <Canvas camera={{ position: [0, 14, 18], fov: 45 }} dpr={[1, 1.5]} frameloop={complete ? 'never' : 'always'}>
        <CrownScene
          panels={panels}
          panelKind={step === 'crown' ? 'facet' : 'trial'}
          panelStates={panelStates}
          panelKey={`${tag}:${epoch}`}
          crownRef={crownRef}
          furyRef={furyRef}
          flashRef={flashRef}
          flashHold={step === 'won'}
          commutator={commutator}
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
            <span className="lvl-kicker">World 4 · Castle · Final</span>
            <h2>The Null Crown</h2>
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

        {!complete && <BossBar hp={hp} facetsBroken={facetsBroken} fury={step === 'core' || shouting} />}

        {step === 'trial' && panelsOn && (
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
        {step === 'crown' && panelsOn && (
          <div className="rules-panel forge-panel works-panel">
            <h3>Facet {facet + 1} · {FACETS[facet].name}</h3>
            <p className="op-blurb">
              Null’s law: <MathText text={FACETS[facet].law} />
            </p>
            <p className="forgery-count">⚡ Strike the beacon of the proof that breaks this law · a true card that doesn’t refute it is no proof</p>
          </div>
        )}

        {line && (
          <div className={`dialog${shouting ? ' c4-shout' : ''}`} onClick={advance}>
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
            {step === 'core' ? 'Lash all six seals round the fallen Crown · the Commutator holds off the shards' : 'WASD to move · click or F to crack the Lash toward a beacon or a spawn'}
          </div>
        )}

        {rules && (
          <div className="win-banner" onClick={() => setRules(false)}>
            <div className="win-card wide">
              <span className="lvl-kicker">The Null Crown · how it works</span>
              <h2>The final trials</h2>
              <p className="def">Each round, Null lays out three claims, each with an emblem and a violet beacon. Walk up to the beacon of a forgery and crack the Lash at it. Lashing an honest claim brings the Crown’s shards, and the round starts over.</p>
              <p className="def">Trial 1: higher homotopy groups (4-1, 4-2, 4-4, 4-7, 4-8). Trial 2: fibrations, loop spaces and Hurewicz (4-6, 4-7, 4-10). Trial 3: same groups, same space? Whitehead, k-invariants, obstructions (4-3, 4-11, 4-12).</p>
              <p className="def">Then the Crown. Each facet is a law Null tried to impose on the world. Strike the one card that proves the law false. A card that is merely true does nothing. Last, lash the six seals round the fallen Crown.</p>
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
          kicker="World 4 complete · The Null Crown is broken"
          title="The Null Crown"
          learned="Higher homotopy groups are maps of spheres, abelian from π₂ on. Cellular approximation clears them below the dimension, and above it the Hopf map makes π₃(S²) ≅ ℤ. A fibration hands you a long exact sequence; Hurewicz matches πₙ with Hₙ only in the first degree. And Null’s last law fell: S² and S³ × ℂP∞ have the same groups, but Whitehead needs a map, and their k-invariants, the twists, are different, so they are different spaces."
          ahead="Every place we proved is on the Chart: Haven’s winding, the sphere’s H₂, the torus’s cup product, the Hopf map, the twist in the tower. The Crown can’t fold any of them. There’s one delivery left, Gyroid. It’s addressed to me."
          definition={DEFINITION_CASTLE}
          defLabel="World 4 in the book (after Hatcher)"
          stayLabel="Back to title"
          onStay={onBackToTitle}
          onNext={onNext || onBackToTitle}
          nextLabel={onNext ? 'Continue ▸ The Ending' : 'Back to title'}
        />
      )}
      {paused && (
        <PauseMenu
          title="The Null Crown"
          progress={step === 'trial' ? `Trial ${trial + 1} of 3` : step === 'crown' ? `Facet ${facet + 1} of 5` : step === 'core' ? 'The seals' : 'The Null Crown'}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('castle4', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
    </div>
  )
}
