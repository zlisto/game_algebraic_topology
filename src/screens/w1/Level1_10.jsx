import { useLoadout } from '../../controls/loadout'
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckHallsScene from '../../levels/w1/DeckHallsScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import useDialogKeys from '../useDialogKeys'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'
import {
  COVER_CYCLIC3,
  COVER_LOPSIDED,
  COVER_QUOTIENT,
  deckShiftLabel,
  isNormalCover,
  isValidDeckShift,
  loopLiftKind,
} from '../../levels/w1/deckShift'
import { DEFINITION, HINTS, OPENING, STATIONS, STATION_ORDER, emmyAdvice110 } from '../../levels/w1/stages1_10'
import { WORLD_TOOLS } from '../../levels/w0/worldTools'
import layout from '../../world/level-1-10.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  startDeckRoundMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import DeckHallsLesson, { DeckHallsLessonOverlay } from '../../movies/w1/DeckHallsLesson'
import MathText from '../MathText'

const TYPE_CPS = 45
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
const COVERS = { cyclic3: COVER_CYCLIC3, lopsided: COVER_LOPSIDED, quotient: COVER_QUOTIENT }
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
const TOOL_KEYS = { Digit1: 'lash', Digit6: 'compass', KeyZ: 'compass' }
// each hall's Deck Sphere waits on its east side (Emmy keeps the west), clear of the causeway mouths and the wheel
const REWARD_SPOT = { shift_deck: [3.8, 1.0], lopsided: [3.6, 1.0], quotient: [4.2, 1.5], antipodal: [4.5, -2.0] }
const REWARD_AT = Object.fromEntries(STATION_ORDER.map((id) => [id, landNear(SITE[id], [SITE[id].pos[0] + REWARD_SPOT[id][0], SITE[id].pos[1] + REWARD_SPOT[id][1]])]))
const NOUN = { icon: '◐', one: 'Deck Sphere', many: 'Deck Spheres', kind: 'decksphere' }
// the level leaves through the north gate
const PORTAL_AT = layout.exit.gate
const END_CARD = {
  learned: 'A deck transformation shuffles a cover’s sheets so the whole cover lands on itself, every edge on an edge with the same letter. On the carousel one turn carried any sheet to any other, so that cover was normal; on the lopsided cover only “do nothing” worked, because sheet 1 had a $b$-loop and sheet 2 had none. A group acting freely gives a cover whose deck group is that group: the half-turn on a circle, and the antipodal swap on the sphere, which double-covers $ℝP²$. Half the rim runs from a door to its opposite, a loop in $ℝP²$ that won’t shrink while twice round does: $π₁(ℝP²) ≅ ℤ₂$.',
  ahead: 'That closes World 1 and the fundamental group. Next is Chain Delta, where we stop counting loops and start counting cells. In Tile and Error we glue ordered triangles edge to edge, and two of them are enough to build a torus, a Klein bottle, or our old friend $ℝP²$.',
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

export default function Level1_10({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-10') || concept?.worlds?.[0]?.levels?.find((l) => l.id === '1-10')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [shift, setShift] = useState(0)
  const [guardsAligned, setGuardsAligned] = useState(false)
  const [walkLoop, setWalkLoop] = useState(null)
  const [walkProgress, setWalkProgress] = useState(0)
  const rimRun = useRef({ last: null, total: 0 })
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [gameKey, setGameKey] = useState(0)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0] + 1.2, SITE[STATION_ORDER[skipTo]].pos[1] + 3] : layout.start))
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('compass')
  useLoadout(['lash', 'compass'], setTool) // the buttons: F, J, K, L
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const stateRef = useRef(null)
  // chase camera: it starts behind Gyroid, looking up the halls from the landing
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const ribbonApi = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const guardsSeen = useRef(false)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'
  const [ready, setReady] = useState(false) // the halls have drawn their first frames
  const guardWave = useRef(null) // which shift_deck goal's guard wave is out
  const alignedRef = useRef(false)
  alignedRef.current = guardsAligned

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
    const list = Array.isArray(ls) ? ls : ls ? [ls] : []
    setLines(list)
    setLineIdx(0)
    if (list.length) setPhase('talk:' + next)
    else {
      setPhase(next === 'after' ? 'play' : next)
      afterTalk.current?.()
      afterTalk.current = null
    }
  }, [])

  useEffect(() => {
    unlockAudio()
    startDeckRoundMusic()
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
    if (ready && !skipTo) say(OPENING)
  }, [ready, say, skipTo])

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = STATIONS[station].goals
      const next = (goalIdx[station] || 0) + 1
      setGuardsAligned(false)
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setShift(0)
        setGuardsAligned(false)
        setWalkLoop(null)
        setCheckpoint([SITE[station].pos[0] + 1.2, SITE[station].pos[1] + 3])
        if (STATION_ORDER.every((id) => id === station || done[id])) {
          setExitOpen(true)
        }
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      return say(ls)
    },
    [done, goalIdx, say],
  )

  // each guard goal on the carousel sends its own wave, spawned in live (no reload, so the
  // commons' beasts stay where Gyroid left them); a knockout clears guardWave so it comes back
  useEffect(() => {
    if (current !== 'shift_deck' || !goal?.guards || here.site !== 'shift_deck' || guardWave.current === gi || !spawnRef.current) return
    guardWave.current = gi
    const wave = SITE.shift_deck[gi === 0 ? 'wave' : 'wave2'] || SITE.shift_deck.wave
    spawnRef.current(wave.map(([type, dx, dz]) => ({ type, x: SITE.shift_deck.pos[0] + dx, z: SITE.shift_deck.pos[1] + dz, site: 'shift_deck', linked: type === 'deck_guard' })))
  }, [current, goal, gi, here.site, knockouts])

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)?.id || null
      setHere((h) => (h.site === st && Math.abs(h.pos[0] - s.x) < 0.05 && Math.abs(h.pos[1] - s.z) < 0.05 ? h : { site: st, pos: [s.x, s.z] }))
    }, 150)
    return () => clearInterval(id)
  }, [])

  const tryShift = useCallback(() => {
    if (!current || phase !== 'play') return
    const coverKey = SITE[current].cover
    const cover = COVERS[coverKey]
    if (!cover) return
    const gx = stateRef.current?.x ?? 0
    const gz = stateRef.current?.z ?? 0
    const [wx, wz] = [SITE[current].pos[0], SITE[current].pos[1]]
    if (Math.hypot(gx - wx, gz - wz) > 2.8) {
      flash('Walk closer to the deck wheel.')
      return
    }
    const next = (shift + 1) % cover.sheets
    if (!isValidDeckShift(cover, next)) {
      sfxRefuse()
      if (!seen.badShift) {
        setSeen((s) => ({ ...s, badShift: true }))
        say(HINTS.refuse_shift)
      } else flash('That shift mismatches a port label.')
      return
    }
    setShift(next)
    sfxCorrect()
    if (goal?.type === 'shift' && goal.needShift === next) {
      // the turn lands: say why (a deck transformation stacks the copies) before the lash
      if (goal.guards) {
        setGuardsAligned(true)
        say(goal.stacked || [])
      } else advanceGoal(current, STATIONS[current].goals[gi].done)
    } else if (goal?.type === 'shift') flash(`Shift +${next}: a deck transformation, but not the one this wave needs — keep turning.`)
  }, [advanceGoal, current, gi, goal, phase, say, seen.badShift, shift])

  const onAction = useCallback(
    (_gx, _gz, cx, cz) => {
      if (tool !== 'compass') return
      const st = stationAt(cx, cz) || stationAt(_gx, _gz)
      if (st?.id === current) tryShift()
    },
    [current, tool, tryShift],
  )

  const onWheelClick = tryShift

  useEffect(() => {
    if (current && here.site === current && !met[current]) {
      setMet((m) => ({ ...m, [current]: true }))
      say(STATIONS[current].arrive)
    } else if (here.site && STATION_ORDER.indexOf(here.site) > STATION_ORDER.indexOf(current || 'antipodal') && current && !met['early-' + here.site]) {
      setMet((m) => ({ ...m, ['early-' + here.site]: true }))
      say(STATIONS[here.site].early)
    }
  }, [here.site, current, met, say])

  // no overhead: the chase camera stays down behind Gyroid, so the turning cover graphs, the
  // stacked guards and the antipodal sphere are seen up close
  frameRef.current = null

  const walkable = useMemo(() => {
    const extra = exitOpen && layout.exit ? [[layout.exit.a, layout.exit.b]] : []
    return makeSiteWalkable(layout, SITES, extra)
  }, [exitOpen])

  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    // (the carousel's guard waves are spawned in live, by goal: see guardWave)
    return {
      mode: 'overworld',
      bySite: true,
      start: checkpoint,
      enemies: list,
      // a Deck guard is copied on every sheet: it only falls once the copies are stacked, and then one lash takes them all
      canHit: (e) => e.type !== 'deck_guard' || alignedRef.current,
      onRefused: (e) => e.type === 'deck_guard' && flash('A guard is copied on every sheet — rotate the deck until the copies stack, then lash once.'),
      // when the deck has rotated to the right shift the copies slide together onto one spot
      enemyAI: (e, dt) => {
        if (e.type !== 'deck_guard' || !alignedRef.current) return
        const [cx, cz] = SITE[e.site].pos
        const dx = cx - e.x
        const dz = cz - e.z
        const d = Math.hypot(dx, dz)
        if (d > 0.02) {
          const k = Math.min(1, (2.4 * dt) / d)
          e.x += dx * k
          e.z += dz * k
        }
        e.tx = e.x
        e.tz = e.z
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, done, checkpoint])

  useEffect(() => {
    if (STATION_ORDER.every((id) => done[id])) setExitOpen(true)
  }, [done])


  const answer = (v) => {
    if (goal?.type !== 'ask') return
    setAskOpen(false)
    if (v === goal.answer) {
      sfxCorrect()
      advanceGoal(current, goal.right)
    } else {
      sfxWrong()
      say(goal.wrong)
    }
  }
  const [askOpen, setAskOpen] = useState(false)

  useEffect(() => {
    // only once you're on that hall and have heard about its cover
    if (goal?.type === 'ask' && phase === 'play' && !lines.length && here.site === current && met[current]) setAskOpen(true)
    else setAskOpen(false)
  }, [goal, phase, lines.length, here.site, current, met])

  useEffect(() => {
    if (current === 'antipodal' && goal?.type === 'walk' && here.site === 'antipodal') {
      setWalkLoop(goal.loopId)
      // count how far round the rim Gyroid has gone, unwrapped: half a turn (π) is door to opposite door
      const dx = here.pos[0] - SITE.antipodal.pos[0]
      const dz = here.pos[1] - SITE.antipodal.pos[1]
      const d = Math.hypot(dx, dz)
      const R = rimRun.current
      if (d > 3.9 && d < 5.4) {
        const a = Math.atan2(dz, dx)
        if (R.last == null) (R.last = a), (R.total = 0)
        else {
          let da = a - R.last
          while (da > Math.PI) da -= 2 * Math.PI
          while (da < -Math.PI) da += 2 * Math.PI
          R.total += da
          R.last = a
        }
        setWalkProgress(Math.min(1, Math.abs(R.total) / Math.PI))
      } else R.last = null
    }
  }, [here, current, goal])

  useEffect(() => {
    if (walkProgress >= 1 && goal?.type === 'walk') {
      sfxCorrect()
      setWalkProgress(0)
      advanceGoal(current, goal.done)
    }
  }, [walkProgress, goal, advanceGoal, current])

  useEffect(() => {
    // the report only lists sites that still have enemies, so "gone" means missing/0 after we saw some
    if (!guardsAligned || !goal?.guards) {
      guardsSeen.current = false
      return
    }
    if ((enemies[current] || 0) > 0) guardsSeen.current = true
    else if (guardsSeen.current) {
      guardsSeen.current = false
      advanceGoal(current, goal.done)
    }
  }, [guardsAligned, enemies, current, goal, advanceGoal])

  const talking = phase.startsWith('talk')
  const line = talking ? lines[lineIdx] : null
  const [paused, setPaused] = usePause(levelClear || lesson)
  talkingRef.current = talking
  const warp = useWarpLevel({
    ids: STATION_ORDER,
    done,
    posOf: (id) => REWARD_AT[id],
    stateRef,
    exitOpen,
    portalAt: PORTAL_AT,
    hearts,
    flash,
    stopMusic,
    onClear: () => setLevelClear(true),
    noun: NOUN,
  })
  const playEnabled = phase === 'play' && !lesson && !levelClear && !paused && !warp.warping
  // talking to Emmy: she follows Gyroid; press E beside her (or anywhere: she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: playEnabled && !line && !askOpen,
    advice: () => emmyAdvice110({ current, goal, done, shift, guardsAligned, here, enemies }),
    say,
  })

  useEffect(() => {
    if (!line) return
    dialogOpen()
    duckMusic(true)
    setShown(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      setShown((n) => Math.max(n, i))
      textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(iv)
    }, 1000 / TYPE_CPS)
    return () => clearInterval(iv)
  }, [line])

  const advance = () => {
    if (shown < (line?.text.length || 0)) {
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx(lineIdx + 1)
      return
    }
    setLines([])
    const next = phase.split(':')[1] || 'play'
    setPhase(next === 'after' || next === 'ask' ? 'play' : next)
    duckMusic(false)
    afterTalk.current?.()
    afterTalk.current = null
  }

  useDialogKeys(!!line, advance)

  useEffect(() => {
    const onKey = (e) => {
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
      if (e.code === 'KeyQ') setTool((t) => (t === 'lash' ? 'compass' : 'lash'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const objective = warp.objective(
    current ? `Halls ${STATION_ORDER.filter((id) => done[id]).length}/${STATION_ORDER.length} · ${STATIONS[current].blueprint}${goal?.type === 'shift' ? ` · shift +${goal.needShift}` : ''}` : '',
  )

  const stepText =
    goal?.type === 'walk'
      ? 'Walk the glowing half-rim with WASD — stay on the ring (about radius 4–5).'
      : goal?.type === 'ask'
        ? 'Pick an answer on the panel.'
        : tool === 'compass'
      ? 'Sheet Compass (6): click the deck wheel to rotate all sheets.'
      : guardsAligned
        ? 'Lash (1): one strike clears every stacked guard.'
        : 'Lash (1) for Null’s spawn.'

  const cover = current ? COVERS[SITE[current]?.cover] : null
  const atStation = current && here.site === current

  if (import.meta.env.DEV)
    window.__lvl1_10 = {
      warp,
      clear: () => setLevelClear(true),
      proveAll: () => {
        setDone(Object.fromEntries(STATION_ORDER.map((id) => [id, true])))
        setExitOpen(true)
        STATION_ORDER.forEach((id) => window.__game?.killSite?.(id))
      },
      rewardAt: REWARD_AT,
      here,
      done,
      goalIdx,
      shift,
      guardsAligned,
      phase,
      enemies,
      setTool,
      current,
      goal,
      tryShift,
      isNormal: cover ? isNormalCover(cover) : null,
      deckLabel: cover ? deckShiftLabel(cover, shift) : null,
      loopLift: loopLiftKind('half'),
      walkProgress,
    }

  return (
    <div className="screen level level-1-10">
      <Canvas className="world-canvas" shadows dpr={[1, 1.5]} camera={{ position: [0, 14, 18], fov: 42 }}>
        <DeckHallsScene
          layout={layout}
          sites={SITES}
          current={current}
          shift={shift}
          guardsAligned={guardsAligned}
          walkLoop={walkLoop}
          onWheelClick={onWheelClick}
          gameKey={gameKey}
          game={game}
          walkable={walkable}
          playEnabled={playEnabled}
          stateRef={stateRef}
          frameRef={frameRef}
          emmyRef={emmyRef}
          onFirstFrames={ready ? null : () => setReady(true)}
          tool={tool}
          onAction={onAction}
          spawnRef={spawnRef}
          ribbonApi={ribbonApi}
          exitOpen={exitOpen}
          camYawRef={camYawRef}
          talkingRef={talkingRef}
          stars={warp.stars}
          portal={warp.portal}
          onEnemies={setEnemies}
          onHearts={(h) => {
            if (h <= 0) {
              setHearts(3)
              guardWave.current = null // the reload clears the carousel's guards: send them again
              setGameKey((k) => k + 1)
              setKnockouts((n) => n + 1)
              say(HINTS.knockout)
            } else setHearts(h)
          }}
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
            <button type="button" className="btn ghost" onClick={() => setLesson(true)}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Level 10 · Deck Halls</span>
            <h2>{levelMeta?.title || 'Deck the Halls'}</h2>
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

        {atStation && cover && !askOpen && (
          <div className="rules-panel forge-panel works-panel level-1-10-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            <p className="cells-line">
              Sheets: <b>{cover.sheets}</b> · deck shift: <b>{deckShiftLabel(cover, shift)}</b>
              {cover.id !== 'lopsided' && <> · normal: <b>{isNormalCover(cover) ? 'yes' : 'no'}</b></>}
            </p>
            <p className="forgery-count">{stepText}</p>
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
              {goal.options.map((v) => (
                <button key={v} type="button" className="btn small" onClick={() => answer(v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {toast && !line && <div className="toast">{toast}</div>}
        <TalkPrompt near={nearEmmy} show={playEnabled && !line && !askOpen} />
        {!levelClear && !line && !askOpen && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit_path' : null)} pos={stateRef.current ? [stateRef.current.x, stateRef.current.z] : checkpoint} title="Deck Halls" face={warp.face} marks={warp.marks} markIcon={NOUN.icon} portal={exitOpen ? { pos: PORTAL_AT, open: warp.portalOpen } : null} />
        )}

        {!talking && !levelClear && !askOpen && (
          <div className="controls">
            <div className="weapons">
              <button type="button" className={`weapon ${tool === 'lash' ? 'active' : ''}`} onClick={() => setTool('lash')}>
                ⚡ Lash <kbd>1</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'compass' ? 'active' : ''}`} onClick={() => setTool('compass')}>
                ✧ {WORLD_TOOLS.compass.label} <kbd>6</kbd>
              </button>
            </div>
          </div>
        )}
        {playEnabled && !toast && !askOpen && !line && <div className="hint">{atStation ? <MathText text={stepText} /> : 'WASD · click to Lash (1) the beasts · 6 Sheet Compass · lost? Emmy’s right behind you (E)'}</div>}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-1-10-lesson"
          Scene={DeckHallsLesson}
          Overlay={DeckHallsLessonOverlay}
          kicker="World 1 · Level 10 · Lesson"
          name="Deck Shifts"
          embedded
          startMusic={startDeckRoundMusic}
          onDone={() => (setLesson(false), warp.portalOpen ? null : startDeckRoundMusic())}
          onSkip={() => (setLesson(false), warp.portalOpen ? null : startDeckRoundMusic())}
        />
      )}

      {warp.warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'Deck the Halls'}
          progress={`${NOUN.icon} ${warp.count} of ${warp.total} ${NOUN.many}`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level1-10', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 1 · Level 10 clear"
          title={levelMeta?.title || 'Deck the Halls'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={DEFINITION}
          onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
          onNext={onNext}
          nextLabel="On to World 2 ▸ Chain Delta"
        />
      )}
    </div>
  )
}
