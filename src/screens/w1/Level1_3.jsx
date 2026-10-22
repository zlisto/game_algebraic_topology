import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WindingRoadScene from '../../levels/w1/WindingRoadScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'
import { WORLD_TOOLS } from '../../levels/w0/worldTools'
import { addWindings, angleDelta, makeRingTracker } from '../../levels/w1/winding'
import { DEFINITION13, HINTS13, OPENING, SLIDE_ASK, STATIONS, STATION_ORDER, emmyAdvice13 } from '../../levels/w1/stages1_3'
import layout from '../../world/windingRoad.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxWrong,
  sfxZoot,
  sfxFloor,
  sfxGate,
  sfxLoopClose,
  startHelixMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import WindingRoadLesson, { WindingRoadLessonOverlay } from '../../movies/w1/WindingRoadLesson'
import MathText from '../MathText'
import useDialogKeys from '../useDialogKeys'

const TYPE_CPS = 45
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const TOOL_KEYS = { Digit1: 'lash', Digit3: 'glass', Digit4: 'cord' }
const BEACON_R = 0.85
const TAU = Math.PI * 2
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

/** Where each deck's Helix Coil waits: inside the ring road, clear of the beacon, Emmy, the Winders and the gates. */
const REWARD_AT = Object.fromEntries(STATION_ORDER.map((id) => [id, landNear(SITE[id], SITE[id].toWorld(-1.9, -1.3))]))
const NOUN = { icon: '↻', one: 'Helix Coil', many: 'Helix Coils', kind: 'helix' }

const END_CARD = {
  learned: 'Every loop on the circle has a lift to the helix, and the floor where that lift ends is its winding number. Sliding a loop can’t move that end between floors, so the number never changes. Running loops one after another adds their numbers and running one backwards negates it, which is how we unwound the Winders. Every integer opened a gate and nothing else did: $π₁(S¹) ≅ ℤ$.',
  ahead: 'No Way Out, in Brouwer’s Basin, where we put that number to work. Walk the rim of a disk and count how many times the arrow under you turns. If the count isn’t zero, something inside must be still: no retraction of the disk onto its rim, and Brouwer’s fixed point theorem.',
}

const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
const ringCenter = (site) => [site.pos[0] + site.ring.cx, site.pos[1] + site.ring.cz]
const screenAngle = (x, z, c) => Math.atan2(-(z - c[1]), x - c[0])

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

function freshWinders() {
  const out = []
  for (const site of SITES) {
    ;(site.winders || []).forEach(([w, dx, dz], i) => {
      out.push({ id: `${site.id}-${i}`, site: site.id, winding: w, x: site.pos[0] + dx, z: site.pos[1] + dz, net: 0, killed: false })
    })
  }
  return out
}
const held = (w) => w.winding + w.net

export default function Level1_3({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-3')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [met, setMet] = useState({})
  const [bank, setBank] = useState(0)
  const [pendingLap, setPendingLap] = useState(null)
  const [lastLap, setLastLap] = useState(null)
  const [homotopyT, setHomotopyT] = useState(0)
  const [slideMax, setSlideMax] = useState(0)
  const [askOpen, setAskOpen] = useState(false)
  const [winders, setWinders] = useState(freshWinders)
  const [gatesOpen, setGatesOpen] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0], SITE[STATION_ORDER[skipTo]].pos[1] + 3] : layout.start))
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('lash') // the commons come first: Lash in hand; the decks say when to take the Cord
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const stateRef = useRef(null)
  const frameRef = useRef(null)
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const camLockRef = useRef(false) // the Tide Glass borrows Z / X
  const spawnRef = useRef(null)
  const tRef = useRef(0)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'
  const liftRef = useRef({ U: null, U0: null })
  const windersRef = useRef(winders)
  windersRef.current = winders

  const trackers = useRef(Object.fromEntries(STATION_ORDER.map((id) => [id, makeRingTracker(ringCenter(SITE[id]), SITE[id].ring.inner, SITE[id].ring.outer, { screen: true })])))

  const current = STATION_ORDER.find((id) => !done[id]) || null
  const goals = current ? STATIONS[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null

  const flash = (text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])
  /** Start the lifted shadow afresh (a new deck, or the cord read back to zero). */
  const resetLift = () => (liftRef.current = { U: null, U0: null })

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = STATIONS[station].goals
      const next = (goalIdx[station] || 0) + 1
      resetLift()
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setBank(0) // each deck starts the cord at zero, so the Number Line gates read exactly what you bank there
        setPendingLap(null)
        setCheckpoint([SITE[station].pos[0], SITE[station].pos[1] + 3])
        if (STATION_ORDER.every((id) => id === station || done[id])) {
          afterTalk.current = () => {
            sfxZoot()
            setExitOpen(true)
          }
        }
        return say(ls, ls.length ? 'after' : 'play')
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      const ng = list[next]
      if (ng.type === 'slide') {
        setHomotopyT(0)
        setSlideMax(0)
      }
      return say(ls)
    },
    [done, goalIdx, say],
  )

  useEffect(() => {
    unlockAudio()
    startHelixMusic()
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      stopMusic()
    }
  }, [])
  useEffect(() => {
    if (!skipTo) say(OPENING)
  }, [say, skipTo])

  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    say([HINTS13.knockout])
  }, [hearts, say])

  const advance = () => {
    const line = lines[lineIdx]
    if (shown < line.text.length) {
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1)
      setShown(0)
      return
    }
    setLines([])
    setLineIdx(0)
    setShown(0)
    const next = phase.replace('talk:', '') || 'play'
    setPhase(next === 'after' ? 'play' : next)
    if (next === 'after' && afterTalk.current) {
      const fn = afterTalk.current
      afterTalk.current = null
      fn()
    }
  }

  useEffect(() => {
    const line = lines[lineIdx]
    if (!line || phase.indexOf('talk:') !== 0) return
    dialogOpen()
    duckMusic(true)
    setShown(0)
    let i = 0
    const iv = setInterval(() => {
      if (shownNow.current >= line.text.length) return clearInterval(iv)
      i++
      setShown((n) => Math.max(n, i))
      if (i <= line.text.length) textBlip(line.speaker)
    }, 1000 / TYPE_CPS)
    return () => (clearInterval(iv), duckMusic(false))
  }, [lines, lineIdx, phase])

  useEffect(() => {
    const st = here.site
    if (!st || phase !== 'play') return
    if (st !== current && !done[st] && !met['early:' + st]) {
      setMet((m) => ({ ...m, ['early:' + st]: true }))
      say(STATIONS[st].early)
      return
    }
    if (st !== current || met[st]) return
    setMet((m) => ({ ...m, [st]: true }))
    resetLift()
    say(STATIONS[st].arrive)
  }, [here.site, phase, current, met, done, say])

  const talking = phase.startsWith('talk:')
  const [paused, setPaused] = usePause(levelClear || lesson)
  talkingRef.current = talking
  const warp = useWarpLevel({
    ids: STATION_ORDER,
    done,
    posOf: (id) => REWARD_AT[id],
    stateRef,
    exitOpen,
    portalAt: layout.exit.b,
    hearts,
    flash,
    stopMusic,
    onClear: () => setLevelClear(true),
    noun: NOUN,
  })
  const playEnabled = phase === 'play' && !lines.length && !askOpen && !levelClear && !paused && !warp.warping
  const line = talking ? lines[lineIdx] : null
  useDialogKeys(!!line, advance)

  const working = !!current && here.site === current && met[current] && playEnabled

  const bankLap = useCallback(
    (w) => {
      setPendingLap(null)
      setLastLap(w)
      setBank((b) => addWindings(b, w))
      sfxLoopClose()
      if (goal?.type === 'lap' && goal.n === w) {
        sfxFloor()
        advanceGoal(current, goal.done)
      } else if (goal?.type === 'lap') {
        sfxWrong()
        flash(HINTS13.wrongWinding.text, 4200)
      } else flash(`Banked ${signed(w)}. The cord reads ${signed(bank + w)}.`)
    },
    [advanceGoal, current, goal, bank],
  )

  // laps on the ring (the Winding Cord), the lifted shadow, banking at the beacon
  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s || !current) return
      const site = SITE[current]
      const c = ringCenter(site)
      const tr = trackers.current[current]
      // the lift: Gyroid's angle round the ring, unwrapped, while he is on the road
      if (here.site === current && tr.onRing(s.x, s.z)) {
        const th = screenAngle(s.x, s.z, c)
        const L = liftRef.current
        if (L.U == null) liftRef.current = { U: th, U0: th, th }
        else {
          L.U += angleDelta(L.th, th)
          L.th = th
        }
      }
      if (!working || tool !== 'cord') return
      const ev = tr.update(s.x, s.z)
      if (ev?.event === 'lap') {
        if (goal?.type === 'unwind') {
          const target = windersRef.current.find((w) => w.site === current && !w.killed && w.winding === goal.winder)
          if (target) {
            const left = held(target) + ev.winding
            setWinders((ws) => ws.map((w) => (w.id === target.id ? { ...w, net: w.net + ev.winding } : w)))
            sfxLoopClose()
            if (left === 0) flash(`Lap ${signed(ev.winding)}: ${signed(target.winding)} + (${signed(-target.winding)}) = 0. The coils are off — lash it (1)!`, 4200)
            else if (Math.abs(left) > Math.abs(held(target))) (sfxWrong(), flash(`Lap ${signed(ev.winding)} wound it tighter: it holds ${signed(left)} now. Run the other way.`, 4200))
            else flash(`Lap ${signed(ev.winding)}: the Winder holds ${signed(left)} now.`)
          }
          return
        }
        setPendingLap((p) => (p ?? 0) + ev.winding)
        flash(`Lap closed: ${signed(ev.winding)}. Step onto the beacon in the middle to bank it.`)
      }
      if (pendingLap != null && Math.hypot(s.x - c[0], s.z - c[1]) < BEACON_R) bankLap(pendingLap)
    }, 40)
    return () => clearInterval(id)
  }, [working, tool, current, goal, pendingLap, bankLap, here.site])

  // the Tide Glass: scrub the deformation of the banked lap
  useEffect(() => {
    if (goal?.type === 'slide') setSlideMax((m) => Math.max(m, homotopyT))
  }, [homotopyT, goal])
  const confirmSlide = () => {
    if (goal?.type !== 'slide' || !working) return
    if (slideMax < 0.9) return flash('Hold the Tide Glass (3) and press X until the loop is fully wiggled — watch where its lift ends.')
    setAskOpen(true)
  }
  const answerSlide = (v) => {
    if (v !== SLIDE_ASK.answer) {
      sfxWrong()
      setAskOpen(false)
      afterTalk.current = () => setAskOpen(true)
      return say(SLIDE_ASK.wrong, 'after')
    }
    sfxCorrect()
    setAskOpen(false)
    setHomotopyT(0)
    advanceGoal(current, goal.done)
  }

  // the Winders: immune while they hold turns; one lash once the laps cancel them
  const winderDown = useRef(null)
  winderDown.current = (id) => {
    const w = windersRef.current.find((x) => x.id === id)
    if (!w || w.killed) return
    setWinders((ws) => ws.map((x) => (x.id === id ? { ...x, killed: true } : x)))
    if (goal?.type === 'unwind' && goal.winder === w.winding) advanceGoal(current, goal.done)
  }

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)?.id || null
      setHere((h) => (h.site === st && Math.abs(h.pos[0] - s.x) < 0.05 && Math.abs(h.pos[1] - s.z) < 0.05 ? h : { site: st, pos: [s.x, s.z] }))
    }, 120)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (goal?.type !== 'gate' || !working) return
    if (bank === goal.n && !gatesOpen[goal.n]) {
      sfxGate()
      setGatesOpen((g) => ({ ...g, [goal.n]: true }))
      setBank(0)
      advanceGoal(current, goal.done)
    }
  }, [bank, goal, working, gatesOpen, advanceGoal, current])

  // overhead only while the Tide Glass deforms a loop (the wiggled road and its lift on the helix, in
  // one view); running laps, banking and unwinding stay on the chase camera, the helix up close
  if (current && here.site === current && met[current] && goal?.type === 'slide') frameRef.current = { center: [SITE[current].pos[0] + 1.4, SITE[current].pos[1] - 0.6], size: 12.5, follow: 0.25 }
  else frameRef.current = null
  camLockRef.current = tool === 'glass' && playEnabled && goal?.type === 'slide' // Z / X deform the loop, not turn the camera

  // ---------- talking to Emmy: she follows right behind Gyroid; E asks her (from afar, she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: playEnabled,
    advice: () => emmyAdvice13({ current, done, goal, here: here.site, bank, pendingLap, winders, gateOpen: gatesOpen, enemies, met, slideMax }),
    say,
  })
  useEffect(() => {
    const down = (e) => {
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
      if (tool === 'glass' && playEnabled && goal?.type === 'slide') {
        if (e.code === 'KeyZ') setHomotopyT((t) => Math.max(0, +(t - 0.1).toFixed(2)))
        if (e.code === 'KeyX') setHomotopyT((t) => Math.min(1, +(t + 0.1).toFixed(2)))
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  })

  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [exitOpen])
  const flashRef = useRef(flash)
  flashRef.current = flash
  const stage = useMemo(
    () => ({
      start: checkpoint,
      enemies: [
        ...SITES.flatMap((s) => (done[s.id] ? [] : (s.enemies || []).map(([type, dx, dz]) => [type, s.pos[0] + dx, s.pos[1] + dz, s.id]))),
        ...windersRef.current.filter((w) => !w.killed).map((w) => ({ type: 'winder', x: w.x, z: w.z, site: w.site, word: w.id })),
      ],
      bySite: true,
      canHit: (e) => {
        if (e.type !== 'winder') return true
        const w = windersRef.current.find((x) => x.id === e.word)
        return !w || held(w) === 0
      },
      onRefused: (e) => {
        const w = windersRef.current.find((x) => x.id === e.word)
        if (w) flashRef.current(`The Lash slides off: this Winder holds ${signed(held(w))}. Run ${Math.abs(held(w))} lap${Math.abs(held(w)) > 1 ? 's' : ''} ${held(w) > 0 ? 'clockwise (−1 each)' : 'counter-clockwise (+1 each)'} with the Cord (4).`, 4200)
      },
      onEnemyHit: (e) => {
        if (e.type === 'winder' && e.hp <= 0) winderDown.current?.(e.word)
      },
      enemyAI: (e) => {
        if (e.type !== 'winder') return
        const w = windersRef.current.find((x) => x.id === e.word)
        e.turns = w ? held(w) : 0
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkpoint, knockouts],
  )

  if (import.meta.env.DEV) {
    window.__lvl1_3 = {
      warp,
      clear: () => setLevelClear(true),
      proveAll: () => {
        STATION_ORDER.forEach((id) => window.__game?.killSite?.(id))
        setDone(Object.fromEntries(STATION_ORDER.map((id) => [id, true])))
        setExitOpen(true)
      },
      rewardAt: REWARD_AT,
      emmyRef,
      here, done, goalIdx, goal, bank, pendingLap, winders, phase, tool, lines, askOpen, homotopyT, slideMax, lift: liftRef.current, trackers: trackers.current, setTool, setHomotopyT, confirmSlide, answerSlide, advanceGoal }
  }

  const stepText =
    goal?.type === 'lap'
      ? `Run one lap ${goal.n > 0 ? 'counter-clockwise (+1)' : 'clockwise (−1)'} on the ring, then step onto the beacon`
      : goal?.type === 'slide'
        ? `Tide Glass (3), X / Z: deform the loop — t = ${homotopyT.toFixed(1)}`
        : goal?.type === 'unwind'
          ? (() => {
              const w = winders.find((x) => x.site === current && !x.killed && x.winding === goal.winder)
              return w ? (held(w) ? `The Winder holds $${signed(held(w))}$ — run laps to cancel it` : 'Unwound: lash it (1)!') : ''
            })()
          : goal?.type === 'gate'
            ? `Gate $${signed(goal.n)}$: bank laps until the cord reads $${signed(goal.n)}$`
            : 'Explore the Winding Road'

  return (
    <div className="screen level w13-level">
      <Canvas shadows camera={{ position: [0, 14, 18], fov: 42 }} style={{ touchAction: 'none' }} frameloop={lesson ? 'never' : 'always'}>
        <WindingRoadScene
          layout={layout}
          sites={SITES}
          walkable={walkable}
          current={current}
          exitOpen={exitOpen}
          homotopyT={goal?.type === 'slide' ? homotopyT : null}
          winders={winders}
          gatesOpen={gatesOpen}
          gateGoal={goal?.type === 'gate' ? goal.n : null}
          frameRef={frameRef}
          gameKey={knockouts}
          stage={stage}
          tool={tool}
          tRef={tRef}
          sim={null}
          stateRef={stateRef}
          spawnRef={spawnRef}
          onTrackMove={() => {}}
          onEnemies={setEnemies}
          onHearts={setHearts}
          emmyRef={emmyRef}
          liftRef={liftRef}
          playEnabled={playEnabled}
          camYawRef={camYawRef}
          talkingRef={talkingRef}
          camLockRef={camLockRef}
          stars={warp.stars}
          portal={warp.portal}
        />
      </Canvas>

      <div className="ui-overlay">
        <div className="lvl-top">
          <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="btn ghost" onClick={onBackToTitle}>
              ◂ Title
            </button>
            <button type="button" className="btn ghost" aria-pressed={muted} onClick={(e) => (setMuted(!muted), setAudioMuted(!muted), e.currentTarget.blur())}>
              {muted ? '♪ off' : '♪ on'}
            </button>
            <button type="button" className="btn ghost" onClick={(e) => (setLesson(true), e.currentTarget.blur())}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Level 3 · Winding Road</span>
            <h2>{levelMeta?.title || 'The Winding Road'}</h2>
            <div className="hud">
              <span className="hearts">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < hearts ? 'heart' : 'heart lost'}>
                    ♥
                  </span>
                ))}
              </span>
              <span className="objective">{warp.objective(current ? `next: ${SITE[current].name}` : '')}</span>
            </div>
            {here.site && (
              <div className="here">
                <strong>{SITE[here.site]?.name}</strong>
                {done[here.site] ? ' · finished' : enemies[here.site] ? ` · spawn: ${enemies[here.site]}` : ' · clear'}
              </div>
            )}
          </div>
        </div>

        {working && (
          <div className="rules-panel forge-panel works-panel w13-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            <p className="forgery-count">
              Winding cord: <MathText text={`$${signed(bank)}$`} />
              {pendingLap != null && <span> · lap <MathText text={`$${signed(pendingLap)}$`} /> waiting at the beacon</span>}
            </p>
            <p className="forgery-count">
              <MathText text={stepText} />
            </p>
            {goal?.type === 'slide' && (
              <button type="button" className="btn small primary" onClick={confirmSlide}>
                Where did the lift end? ▸
              </button>
            )}
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

        {askOpen && !line && (
          <div className="dialog verdict">
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>
                <MathText text={SLIDE_ASK.question} />
              </p>
            </div>
            <div className="btn-row">
              {SLIDE_ASK.options.map((v) => (
                <button key={v} type="button" className="btn small" onClick={() => answerSlide(v)}>
                  <MathText text={v} />
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
        {!levelClear && !line && !askOpen && <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Winding Road" face={warp.face} marks={warp.marks} markIcon="↻" portal={exitOpen ? { pos: layout.exit.b, open: warp.portalOpen } : null} />}
        <TalkPrompt near={nearEmmy} show={playEnabled && !line && !levelClear && !lesson} />

        {!talking && !levelClear && !askOpen && (
          <div className="controls">
            <div className="weapons">
              {['lash', 'glass', 'cord'].map((id) => (
                <button key={id} type="button" className={`weapon ${tool === id ? 'active' : ''}`} onClick={(e) => (setTool(id), e.currentTarget.blur())}>
                  {WORLD_TOOLS[id].label} <kbd>{WORLD_TOOLS[id].key}</kbd>
                </button>
              ))}
            </div>
            <div className="hint">
              WASD · {tool === 'cord' ? 'Cord: run laps on the ring road, bank them at the beacon' : tool === 'glass' ? 'Tide Glass: X / Z deform the loop' : 'Lash: click to strike'} · Emmy’s right behind you (E)
            </div>
          </div>
        )}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-1-3-lesson"
          Scene={WindingRoadLesson}
          Overlay={WindingRoadLessonOverlay}
          kicker="World 1 · Level 3 · Lesson"
          name="The Winding Number"
          embedded
          startMusic={startHelixMusic}
          onDone={() => (setLesson(false), warp.portalOpen ? null : startHelixMusic())}
          onSkip={() => (setLesson(false), warp.portalOpen ? null : startHelixMusic())}
        />
      )}

      {warp.warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'The Winding Road'}
          progress={`↻ ${warp.count} of ${warp.total} Helix Coils`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level1-3', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 1 · Level 3 clear"
          title={levelMeta?.title || 'The Winding Road'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={DEFINITION13}
          onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
          onNext={onNext}
          nextLabel="Continue ▸ 1-4"
        />
      )}
    </div>
  )
}
