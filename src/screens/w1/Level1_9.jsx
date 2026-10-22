import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SheetMusicScene from '../../levels/w1/SheetMusicScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'
import { ORDER_TWO_SHEET_AA, coverThreeSheetConj, liftWord, makeCover, nearestPort, orderMatches, parseWord, torusLift, treeStep } from '../../levels/w1/covers.js'
import { DEFINITION19, HINTS19, OPENING, STATIONS, STATION_ORDER, emmyAdvice19 } from '../../levels/w1/stages1_9.js'
import layout from '../../world/sheetstacks.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  sfxStackSwap,
  sfxZoot,
  startSheetCanonMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import SheetMusicLesson, { SheetMusicLessonOverlay } from '../../movies/w1/SheetMusicLesson'
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
const TOOL_KEYS = { Digit1: 'lash', Digit5: 'clasp', Digit6: 'compass' }
const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
// each tower's Tree Seed waits on its outer side, clear of the causeway mouths, ports, branch tips and pedestal
const REWARD_SPOT = { to_order: [0, -4.2], moving_start: [-3.6, -2.2], endless_tree: [6.6, 0], plane_torus: [-4.2, -2.4] }
const REWARD_AT = Object.fromEntries(STATION_ORDER.map((id) => [id, landNear(SITE[id], [SITE[id].pos[0] + REWARD_SPOT[id][0], SITE[id].pos[1] + REWARD_SPOT[id][1]])]))
const NOUN = { icon: '✳', one: 'Tree Seed', many: 'Tree Seeds', kind: 'utree' }
const E19 = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
/** The two-sheet tower at To Order: each letter's port either keeps the sheets (stays) or swaps them. */
const glueCover = (g) =>
  makeCover(2, [
    { a: g.a ? 1 : 0, A: g.a ? 1 : 0, b: g.b ? 1 : 0, B: g.b ? 1 : 0 },
    { a: g.a ? 0 : 1, A: g.a ? 0 : 1, b: g.b ? 0 : 1, B: g.b ? 0 : 1 },
  ])
/** Before the Clasp locks the tower: predict a lift on it. */
const PREDICT = {
  word: 'abA',
  question: 'The tower holds. Before the Clasp locks it, read it: start on sheet 1 and walk $a b a⁻¹$. Where does the lift end?',
  options: [
    ['closed', 'Back on sheet 1: it closes'],
    ['open', 'On sheet 2: it doesn’t close'],
  ],
}
const END_CARD = {
  learned: 'Every connected cover is a choice of which loops close: the loops whose lifts close at the start form a subgroup of $π₁$. We built a two-sheet cover to order, where $a²$ and $b$ close but $a$ does not. Moving the start to another sheet gave a different subgroup, but only a conjugate one, $g H g⁻¹$. And when nothing but the trivial loop closes, we reach the universal cover: an endless tree over the figure-eight, and the flat plane over the torus, where a loop is just a lattice point $(m, n)$.',
  ahead: 'The Deck Halls come next. A cover has symmetries of its own, the deck transformations, which shuffle the sheets while keeping each one above the same spot below. We’ll stack the decks, swap the sheets, and watch the sphere fold twice onto the projective plane.',
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

export default function Level1_9({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-9')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  // the To Order tower starts glued wrong way round: a keeps the sheets, b swaps them
  const [glue, setGlue] = useState({ a: false, b: true })
  const [predictOpen, setPredictOpen] = useState(false)
  const [base, setBase] = useState(0)
  const [treeWord, setTreeWord] = useState([])
  const [treeHits, setTreeHits] = useState({})
  const [torusHits, setTorusHits] = useState({})
  const [torusAsk, setTorusAsk] = useState(null)
  const [orderLabel, setOrderLabel] = useState(ORDER_TWO_SHEET_AA.label)
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0] + 1.2, SITE[STATION_ORDER[skipTo]].pos[1] + 3.2] : layout.start))
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('clasp')
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const stateRef = useRef(null)
  // chase camera: it starts behind Gyroid, looking up the Stacks from the gate
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'
  const current = STATION_ORDER.find((id) => !done[id]) || null

  const cover = useMemo(() => (current === 'moving_start' ? coverThreeSheetConj() : glueCover(glue)), [glue, current])
  const goals = current ? STATIONS[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null
  const coverOk = goal?.type === 'cover' && orderMatches(cover, base, goal.order)

  const flash = (text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }
  const say = useCallback((raw, next = 'play') => {
    const ls = Array.isArray(raw) ? raw : raw ? [raw] : [] // HINTS19.* may be single lines
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])
  const once = (key, ls, fallback) => {
    if (!seen[key]) {
      setSeen((m) => ({ ...m, [key]: true }))
      say(ls)
    } else flash(fallback, 3400)
  }

  useEffect(() => {
    unlockAudio()
    startSheetCanonMusic()
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      stopMusic()
    }
  }, [])
  // the opening waits for the Stacks to draw, so it never plays over a black canvas
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (ready && !skipTo) say(OPENING)
  }, [ready, say, skipTo])

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = STATIONS[station].goals
      const next = (goalIdx[station] || 0) + 1
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setCheckpoint([SITE[station].pos[0] + 1.2, SITE[station].pos[1] + 3.2])
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      return say(ls)
    },
    [done, goalIdx, say],
  )

  useEffect(() => {
    if (phase !== 'play' || !current || here.site !== current) return
    if (!met[current] && stationAt(here.pos[0], here.pos[1])?.id === current) {
      setMet((m) => ({ ...m, [current]: true }))
      say(STATIONS[current].arrive)
    }
  }, [here, current, met, phase, say])

  useEffect(() => {
    if (!goal || phase !== 'play' || here.site !== current) return
    // the tower matches the order: the Clasp holds it, and asks for a reading before it locks
    if (goal.type === 'cover' && coverOk && !predictOpen) {
      sfxCorrect()
      setPredictOpen(true)
    }
    if (goal.type === 'start' && base === goal.targetBase) {
      sfxCorrect()
      advanceGoal(current, goal.done)
    }
    if (goal.type === 'tree') {
      const all = (goal.targets || []).every((w) => treeHits[w])
      if (all) advanceGoal(current, goal.done)
    }
    if (goal.type === 'torus') {
      const all = (goal.loops || []).every((l) => torusHits[l.word])
      if (all) advanceGoal(current, goal.done)
    }
  }, [goal, coverOk, base, treeHits, torusHits, phase, here, current, advanceGoal, predictOpen])

  const answerPredict = (v) => {
    const closed = liftWord(cover, 0, parseWord(PREDICT.word)).closed
    setPredictOpen(false)
    if ((v === 'closed') === closed) {
      sfxCorrect()
      return advanceGoal(current, [
        E19('Right: $a$ climbs from sheet 1 to sheet 2, $b$ loops round on sheet 2, and $a⁻¹$ climbs back down. The lift closes.'),
        ...goal.done,
      ])
    }
    sfxWrong()
    say(
      [
        E19('Follow the tower with your eye. From sheet 1, the orange $a$ edge climbs to sheet 2. On sheet 2 the purple $b$ edge stays on its sheet. Then $a⁻¹$ runs the orange edge backwards, down to sheet 1.'),
        E19('So where did it end? Try the reading again.'),
      ],
      // back to play: the tower still matches, so the reading comes straight back
    )
  }

  useEffect(() => {
    if (STATION_ORDER.every((id) => done[id]) && !exitOpen) {
      sfxZoot()
      setExitOpen(true)
    }
  }, [done, exitOpen])

  const onAction = useCallback(
    (gx, gz, cx, cz) => {
      if (phase !== 'play' || !current) return
      const site = stationAt(gx, gz)
      if (!site || site.id !== current) {
        flash('Walk onto the current deck first.')
        return
      }
      const lx = cx - site.pos[0]
      const lz = cz - site.pos[1]

      if (tool === 'clasp' && current === 'to_order') {
        const port = nearestPort(SITE.to_order.cover.ports, lx, lz, 1.5)
        if (!port) {
          once('clasp_far', HINTS19.wrongCover, 'Clasp (5) a glowing port on the glass.')
          sfxRefuse()
          return
        }
        // each port re-glues one letter: its edges either keep each sheet, or swap the two
        const L = port[2]
        const next = { ...glue, [L]: !glue[L] }
        setGlue(next)
        flash(`$${L}$ now ${next[L] ? 'swaps the two sheets: its edges climb between them' : 'keeps each sheet: its edges loop on their own sheet'}.`)
        if (!orderMatches(glueCover(next), base, ORDER_TWO_SHEET_AA)) sfxStackSwap()
        return
      }

      if (tool === 'compass' && current === 'endless_tree') {
        const branches = [
          { letter: 'a', x: 3.5, z: -1.2 },
          { letter: 'A', x: -3.5, z: -1.2 },
          { letter: 'b', x: 0.8, z: 3.8 },
          { letter: 'B', x: -0.8, z: 3.8 },
        ]
        const hit = branches.find((b) => Math.hypot(lx - b.x, lz - b.z) < 1.3)
        if (!hit) {
          sfxRefuse()
          flash('Compass (6) a gold branch tip.')
          return
        }
        const nw = treeStep(treeWord, hit.letter)
        setTreeWord(nw)
        const wStr = nw.map((L) => (L === 'A' ? 'A' : L === 'B' ? 'B' : L)).join('')
        if ((goal?.targets || []).includes(wStr)) {
          setTreeHits((h) => ({ ...h, [wStr]: true }))
          sfxCorrect()
        }
        return
      }

      if (tool === 'compass' && current === 'plane_torus') {
        const loops = goal?.loops || []
        if (Math.hypot(lx, lz + 2) >= 2) {
          sfxRefuse()
          flash('Compass (6) a loop pedestal on the torus deck.')
          return
        }
        // one pedestal reads the loops in turn: the next one not yet answered
        const hit = loops.find((l) => !torusHits[l.word])
        if (!hit) return flash('Both lattice readings are done.')
        setTorusAsk(hit)
        return
      }
    },
    [phase, current, tool, glue, base, treeWord, goal, once, flash, torusHits],
  )

  const pickTorus = (m, n) => {
    if (!torusAsk) return
    const ans = torusAsk.answer
    const ok = ans[0] === m && ans[1] === n
    if (ok) {
      setTorusHits((h) => ({ ...h, [torusAsk.word]: true }))
      sfxCorrect()
    } else {
      once('torus_wrong', HINTS19.torus, 'Count grid steps from the origin.')
      sfxWrong()
    }
    setTorusAsk(null)
  }

  useEffect(() => {
    const tick = () => {
      const s = stateRef.current
      if (!s) return
      const x = s.x
      const z = s.z
      const site = stationAt(x, z)
      setHere((h) => (h.site === (site?.id || null) && Math.abs(h.pos[0] - x) < 0.05 && Math.abs(h.pos[1] - z) < 0.05 ? h : { site: site?.id || null, pos: [x, z] }))
    }
    const id = setInterval(tick, 120)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const k = (e) => {
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const advance = () => {
    const full = lines[lineIdx]?.text.length ?? 0
    if (shown < full) return setShown(full)
    if (lineIdx + 1 < lines.length) return setLineIdx(lineIdx + 1)
    const next = phase.split(':')[1]
    if (next === 'after') {
      setPhase('play')
      afterTalk.current?.()
      afterTalk.current = null
    } else setPhase(next)
  }
  const talking = phase.startsWith('talk:')
  const line = talking ? lines[lineIdx] : null
  useDialogKeys(!!line, advance)
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
      setShown((n) => (n >= line.text.length ? (clearInterval(id), n) : Math.max(n, i)))
      if (shownNow.current >= line.text.length) clearInterval(id)
      const ch = line.text[i - 1]
      if (ch && ch !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => clearInterval(id)
  }, [line])

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
  const playEnabled = phase === 'play' && !lesson && !levelClear && !torusAsk && !predictOpen && !paused && !warp.warping
  // talking to Emmy: she follows Gyroid; press E beside her (or anywhere: she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: phase === 'play' && !paused && !levelClear && !lesson && !torusAsk && !predictOpen,
    advice: () => emmyAdvice19({ here, current, goal, done, cover, base, treeWord, torusHits, coverOk, glue }),
    say,
  })
  const gameKey = `sheet19:${knockouts}`
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [exitOpen])
  // Lashing the Stack sentinel (moving_start) swaps which vertex is the start; the sentinel stays standing so it can be swapped back
  const baseRef = useRef(0)
  baseRef.current = base
  const swapStart = () => {
    if (current !== 'moving_start') {
      sfxRefuse()
      return flash('The sentinel only swaps the start on its own deck — Moving the Start.')
    }
    // walk the start along the cover: sheet 1 → 2 → 3 → 1
    const next = (baseRef.current + 1) % 3
    setBase(next)
    sfxStackSwap()
    flash(`The start is now sheet ${next + 1}.`)
  }
  const swapRef = useRef(swapStart)
  swapRef.current = swapStart

  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    return {
      mode: 'overworld',
      bySite: true,
      start: checkpoint,
      enemies: list,
      onEnemyHit: (e) => {
        if (e.type !== 'stack_sentinel') return undefined
        swapRef.current()
        return 'keep'
      },
      enemyAI: (e) => {
        if (e.type !== 'stack_sentinel') return
        e.x = e.hx
        e.z = e.hz
        e.tx = e.hx
        e.tz = e.hz
      },
    }
  }, [gameKey, done, checkpoint])

  // no overhead: from straight above the sheet towers read as one blue disc. The chase camera
  // stays down behind Gyroid, so each tower's sheets show stacked up close
  // at the stacked-sheet decks a raised three-quarter view sees every sheet (the chase camera ends up inside them)
  frameRef.current = current && here.site === current && met[current] ? { center: SITE[current].pos, size: 10.5, follow: 0.35 } : null

  if (import.meta.env.DEV)
    window.__lvl19 = {
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
      glue,
      predictOpen,
      answerPredict,
      base,
      treeWord,
      treeHits,
      torusHits,
      setTool,
      setGlue,
      setBase,
      phase,
      current,
      goal,
      coverOk,
      advanceGoal: () => advanceGoal(current, []),
    }

  const nDone = STATION_ORDER.filter((id) => done[id]).length
  const objective = warp.objective(current ? `Stacks ${nDone}/4 · ${SITE[current].name}` : '')

  const stepText = (() => {
    if (!goal) return ''
    if (goal.type === 'cover') return `Clasp (5) the $a$ or $b$ port to re-glue that letter · order: ${orderLabel}`
    if (goal.type === 'start') return 'Lash (1) the Stack sentinel to swap the start vertex'
    if (goal.type === 'tree') return `Compass (6) branches · reached ${Object.keys(treeHits).length}/${(goal.targets || []).length}`
    if (goal.type === 'torus') return 'Compass (6) a loop pedestal, then pick its (m, n)'
    return 'Lash (1) · Clasp (5) · Compass (6)'
  })()

  return (
    <div className="screen level level-1-9">
      <Canvas camera={{ position: [0, 11, 30], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        <SheetMusicScene
          layout={layout}
          sites={SITES}
          current={current}
          done={done}
          cover={cover}
          base={base}
          treeWord={treeWord}
          treeTargets={goal?.type === 'tree' ? goal.targets : []}
          treeHits={treeHits}
          torusHighlight={torusAsk ? torusLift([0, 0], parseWord(torusAsk.word)) : null}
          exitOpen={exitOpen}
          walkable={walkable}
          game={game}
          gameKey={gameKey}
          stateRef={stateRef}
          frameRef={frameRef}
          spawnRef={spawnRef}
          playEnabled={playEnabled}
          tool={tool}
          onAction={onAction}
          onEnemies={setEnemies}
          onHearts={(h) => {
            // all three hearts gone: wake at the last finished tower
            if (h <= 0) {
              setHearts(3)
              setKnockouts((n) => n + 1)
              say(HINTS19.knockout)
            } else setHearts(h)
          }}
          emmyRef={emmyRef}
          onDeck={here.site}
          onFirstFrames={ready ? null : () => setReady(true)}
          camYawRef={camYawRef}
          talkingRef={talkingRef}
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
            <button type="button" className="btn ghost" aria-pressed={muted} onClick={() => (setMuted(!muted), setAudioMuted(!muted))}>
              {muted ? '♪ off' : '♪ on'}
            </button>
            <button type="button" className="btn ghost" onClick={() => setLesson(true)}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Level 9 · Sheet Stacks</span>
            <h2>{levelMeta?.title || 'Sheet Music'}</h2>
            <div className="hud">
              <span className="hearts">{[0, 1, 2].map((i) => (<span key={i} className={i < hearts ? 'heart' : 'heart lost'}>♥</span>))}</span>
              <span className="objective">{objective}</span>
            </div>
          </div>
        </div>

        {current && here.site === current && met[current] && !predictOpen && (
          <div className="rules-panel forge-panel works-panel level-1-9-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            {(current === 'moving_start' || current === 'to_order') && (
              <p className="carry-line">
                <MathText
                  text={`From sheet ${base + 1}: $a$ ${liftWord(cover, base, ['a']).closed ? 'closes' : 'opens'} · ${current === 'to_order' ? `$a²$ ${liftWord(cover, base, ['a', 'a']).closed ? 'closes' : 'opens'} · ` : ''}$b$ ${liftWord(cover, base, ['b']).closed ? 'closes' : 'opens'}`}
                />
              </p>
            )}
            <p className="forgery-count">
              <MathText text={stepText} />
            </p>
          </div>
        )}

        {!talking && !levelClear && !torusAsk && !predictOpen && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Sheet Stacks" face={warp.face} marks={warp.marks} markIcon={NOUN.icon} portal={exitOpen ? { pos: layout.exit.b, open: warp.portalOpen } : null} />
        )}

        {/* low on the screen, clear of the level title */}
        {toast && !line && (
          <div className="toast low">
            <MathText text={toast} />
          </div>
        )}
        <TalkPrompt near={nearEmmy} show={phase === 'play' && !line && !torusAsk && !predictOpen && !levelClear && !paused && !lesson} />
        {predictOpen && !talking && (
          <div className="dialog verdict" style={{ cursor: 'default' }}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">The Clasp</span>
              <p>
                <MathText text={PREDICT.question} />
              </p>
            </div>
            <div className="btn-row" style={{ flexWrap: 'wrap', maxWidth: '16rem', justifyContent: 'flex-end' }}>
              {PREDICT.options.map(([v, label]) => (
                <button key={v} type="button" className="btn small" onClick={() => answerPredict(v)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {!talking && !torusAsk && !predictOpen && !levelClear && (
          <div className="controls">
            <div className="weapons">
              {[
                ['lash', '⚡ Lash', '1'],
                ['clasp', '⧉ Clasp', '5'],
                ['compass', '🧭 Compass', '6'],
              ].map(([t, label, key]) => (
                <button key={t} type="button" className={`weapon ${tool === t ? 'active' : ''}`} onClick={(e) => (setTool(t), e.currentTarget.blur())}>
                  {label} <kbd>{key}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
        {playEnabled && !toast && !talking && <div className="hint">{current && here.site === current && met[current] ? <MathText text={stepText} /> : 'WASD · click to Lash (1) the beasts · 5 Clasp · 6 Compass · lost? Emmy’s right behind you (E)'}</div>}

        {torusAsk && !talking && (
          <div className="dialog verdict" style={{ cursor: 'default' }}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>
                <MathText text={`Lift ends at $(m,n)$ for ${torusAsk.label}?`} />
              </p>
            </div>
            <div className="btn-row" style={{ flexWrap: 'wrap', maxWidth: '12rem', justifyContent: 'flex-end' }}>
              {[
                [1, 1],
                [1, 0],
                [0, 1],
                [0, 0],
                [2, -1],
              ].map(([m, n]) => (
                <button key={`${m},${n}`} type="button" className="btn small" onClick={() => pickTorus(m, n)}>
                  ({m}, {n})
                </button>
              ))}
              <button type="button" className="btn small ghost" onClick={() => setTorusAsk(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {talking && line && (
          <div className="dialog" onClick={advance}>
            <Portrait id={line.portrait || 'gyroid'} name={line.speaker} />
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

        {lesson && (
          <LevelMovie
            videoId="level-1-9-lesson"
            Scene={SheetMusicLesson}
            Overlay={SheetMusicLessonOverlay}
            kicker="World 1 · Level 9 · Lesson"
            name="Sheet Music"
            embedded
            onDone={() => (setLesson(false), warp.portalOpen ? null : startSheetCanonMusic())}
            onSkip={() => (setLesson(false), warp.portalOpen ? null : startSheetCanonMusic())}
          />
        )}

        {warp.warping && !levelClear && <div className="warp-flash" />}
        {paused && (
          <PauseMenu
            title={levelMeta?.title || 'Sheet Music'}
            progress={`${NOUN.icon} ${warp.count} of ${warp.total} ${NOUN.many}`}
            onResume={() => setPaused(false)}
            onRestart={() => onGo?.('level1-9', { restart: Date.now() })}
            onTitle={onBackToTitle}
          />
        )}
        {levelClear && (
          <EmmyEndCard
            kicker="World 1 · Level 9 clear"
            title={levelMeta?.title || 'Sheet Music'}
            learned={END_CARD.learned}
            ahead={END_CARD.ahead}
            definition={{ text: DEFINITION19.body, cite: DEFINITION19.cite, url: DEFINITION19.href }}
            onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
            onNext={() => onNext?.()}
            nextLabel={`Continue ▸ ${DEFINITION19.next}`}
          />
        )}
      </div>
    </div>
  )
}
