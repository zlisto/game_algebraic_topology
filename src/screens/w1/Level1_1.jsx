import { useLoadout } from '../../controls/loadout'
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EndpointGardensScene, { BIN_COLORS, ROUTE_LABEL, smoothRoute } from '../../levels/w1/EndpointGardensScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import {
  DEFINITION,
  HINTS,
  OPENING,
  STATIONS,
  STATION_ORDER,
  WRONG,
  emmyAdvice11,
} from '../../levels/w1/stages1_1'
import {
  classOfChainRoutes,
  concat,
  homotopicRelEndpoints,
  linearHomotopy,
  resample,
  routeClass,
  validateLedger,
} from '../../levels/w1/routes'
import layout from '../../world/endpointGardens.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setGlassTick,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  sfxZoot,
  sfxExit,
  sfxLedger,
  startBastionMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import EndpointsLesson, { EndpointsLessonOverlay } from '../../movies/w1/EndpointsLesson'
import MathText from '../MathText'
import useDialogKeys from '../useDialogKeys'
import { WORLD_TOOLS } from '../../levels/w0/worldTools'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'

const startLevelMusic = startBastionMusic

const TYPE_CPS = 45
const SCRUB_PER_SEC = 0.4
const SLIDE_MATCH = 0.12
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const TOOLS = ['lash', 'spool', 'glass']
const TOOL_KEYS = { Digit1: 'lash', Digit2: 'spool', Digit3: 'glass' }

/** Where each garden's Path Seal waits: on the deck's outer side, clear of gatehouses, routes and causeway mouths. */
const REWARD_SPOT = { open_lawn: [2.8, 2.8], hedges: [3.2, 2.6], faster: [-2.6, -3.0], chained: [3.8, -3.0] }
const REWARD_AT = Object.fromEntries(STATION_ORDER.map((id) => [id, landNear(SITE[id], SITE[id].toWorld(...REWARD_SPOT[id]))]))
const NOUN = { icon: '⌒', one: 'Path Seal', many: 'Path Seals', kind: 'path' }

const END_CARD = {
  learned: 'A route is a path: a map from $[0, 1]$ with its two ends pinned at the gates. Two routes are the same delivery when one slides into the other with those ends held still, a homotopy rel the endpoints. On the open lawn every route slid onto the straight one, and running a route faster or slower never changed its class. A hedge bed is a hole: routes on opposite sides can’t slide together, and chaining routes end to end respects the classes.',
  ahead: 'Loop de Loop, at the Beacon: paths that start and end at the same point. We’ll walk loops around a basepoint, run them backwards, and chain them, and see that loops up to homotopy form a group: the fundamental group.',
}

const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null

/** Routes the ledger sorts. At the Triple Gate it sorts whole A→C journeys: two direct routes and the two chains. */
function ledgerRoutesFor(site) {
  if (site?.id !== 'chained') return site?.routes || {}
  const r = site.routes
  const g = { a: site.gates.a, b: site.gates.b }
  return {
    AC_left: r.AC_left,
    AC_right: r.AC_right,
    'AB_left·BC_left': concat(r.AB_left, r.BC_left, g),
    'AB_right·BC_right': concat(r.AB_right, r.BC_right, g),
  }
}

function envFor(site) {
  const g = site.gates
  const routes = ledgerRoutesFor(site)
  const canonical = routes.L1 || routes.straight || routes.slow || routes.AC_left || Object.values(routes)[0]
  return { gates: { a: g.a, b: g.c || g.b }, hedges: site.hedges || [], canonical, routes }
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

export default function Level1_1({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-1') || concept?.worlds?.[0]?.levels?.find((l) => l.id === '1-1')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [ledger, setLedger] = useState(() => Object.fromEntries(STATION_ORDER.map((id) => [id, {}])))
  const [paceConfirmed, setPaceConfirmed] = useState(false)
  const [chainSwap, setChainSwap] = useState(false)
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0] + 1, SITE[STATION_ORDER[skipTo]].pos[1] + 3] : layout.start))
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('lash') // the Landing Commons come first: Lash in hand
  useLoadout(['lash', 'spool', 'glass'], setTool) // the buttons: F, J, K, L
  const [glassT, setGlassTState] = useState(0)
  const glassTRef = useRef(0)
  const setGlassT = useCallback((v) => {
    const c = Math.min(1, Math.max(0, typeof v === 'function' ? v(glassTRef.current) : v))
    glassTRef.current = c
    setGlassTState(c)
  }, [])
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const [selectedRoute, setSelectedRoute] = useState(null)
  const stateRef = useRef(null)
  const frameRef = useRef(null)
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const camLockRef = useRef(false) // the Tide Glass borrows Z / X and the wheel
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'
  const waveSpawned = useRef(false)

  const current = STATION_ORDER.find((id) => !done[id]) || null
  const goals = current ? STATIONS[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null
  const site = current ? SITE[current] : null

  const extraSegs = exitOpen ? [[layout.exit.a, layout.exit.b]] : []
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, extraSegs), [exitOpen])

  const flash = (text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }

  const ribbonApi = useRef(null)
  ribbonApi.current = {
    target: () => null,
    snip: () => false,
    // a hedge-sprout that finishes rooting: the bed is only a threat, so it uproots again; say so
    sproutHedge: () => {
      flash('A hedge-sprout is taking root — lash it before it blocks the route!')
      return false
    },
  }

  const say = useCallback((raw, next = 'play') => {
    const ls = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter((l) => l?.text)
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  const advanceGoal = useCallback(
    (station, lines = []) => {
      setGlassT(0) // the next slide goal starts from the beginning, not from where the last one ended
      const list = STATIONS[station].goals
      const curG = list[goalIdx[station] || 0]
      if (curG?.wave && !waveSpawned.current) {
        waveSpawned.current = true
        spawnRef.current?.(
          (SITE[station].wave || []).map(([type, x, z]) => ({
            type,
            x: x + SITE[station].pos[0],
            z: z + SITE[station].pos[1],
            site: station,
          })),
        )
      }
      const next = (goalIdx[station] || 0) + 1
      if (next >= list.length) {
        setDone((d) => {
          const nd = { ...d, [station]: true }
          if (STATION_ORDER.every((id) => nd[id])) {
            sfxZoot()
            setExitOpen(true)
          }
          return nd
        })
        setCheckpoint([SITE[station].pos[0] + 1, SITE[station].pos[1] + 3])
        return say(lines)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      say(lines)
    },
    [done, goalIdx, say, setGlassT],
  )

  useEffect(() => {
    unlockAudio()
    startLevelMusic()
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

  useEffect(() => setGlassTick(tool === 'glass'), [tool])

  // camera frame: overhead only while a route puzzle is worked (the routes, hedges and the Tide Glass
  // ghost need the whole deck in view); the guard wave, the commons and the walk between are chase-cam
  const needsOverhead = goal && ['slide', 'ledger', 'pace', 'chain'].includes(goal.type)
  useEffect(() => {
    if (phase.startsWith('talk')) return
    if (!site || here.site !== current || !needsOverhead) {
      frameRef.current = null
      return
    }
    const r = site.def.add[0].r || 5
    const w = site.def.add[0].type === 'rect' ? site.def.add[0].x1 - site.def.add[0].x0 : r * 2
    frameRef.current = { center: [site.pos[0] + 1, site.pos[1] + 0.3], size: w > 10 ? 13 : 10.5, follow: 0.25 }
  }, [site, phase, here.site, current, needsOverhead])

  // arrival: mark the station and queue Emmy's briefing — play keeps running until E
  useEffect(() => {
    if (!current || phase !== 'play') return
    const st = here.site
    if (st === current && !met[current]) {
      setMet((m) => ({ ...m, [current]: true }))
      say(STATIONS[current].arrive)
    } else if (st && st !== current && !done[st] && STATIONS[st]?.early && !seen[`early-${st}`]) {
      setSeen((s) => ({ ...s, [`early-${st}`]: true }))
      // short redirect tip — toast, not a freeze
      const tip = STATIONS[st].early?.[0]?.text
      if (tip) flash(tip, 3800)
    }
  }, [here.site, current, met, done, phase, seen])

  // slide goal check (once per goal — glassT updates must not re-fire advanceGoal)
  const slideDoneRef = useRef(null)
  useEffect(() => {
    if (!goal || goal.type !== 'slide' || !site || tool !== 'glass' || phase !== 'play') return
    const key = `${current}:${gi}`
    if (slideDoneRef.current === key) return
    const [a, b] = goal.pair
    const ra = site.routes[a]
    const rb = site.routes[b]
    if (!ra || !rb) return
    const ghost = linearHomotopy(ra, rb, glassT)
    // compare against the target route resampled to the ghost's point count (raw routes have different lengths)
    const ref = resample(rb, ghost.length)
    let maxD = 0
    const n = Math.min(ghost.length, ref.length)
    for (let i = 0; i < n; i++) maxD = Math.max(maxD, Math.hypot(ghost[i][0] - ref[i][0], ghost[i][1] - ref[i][1]))
    if (maxD < SLIDE_MATCH && glassT > 0.85) {
      slideDoneRef.current = key
      sfxCorrect()
      advanceGoal(current, STATIONS[current].goals[gi].done)
    }
  }, [glassT, goal, site, tool, phase, advanceGoal, current, gi])

  const assignBin = (cls) => {
    if (!selectedRoute || !current) return
    setLedger((L) => ({
      ...L,
      [current]: { ...L[current], [selectedRoute]: cls },
    }))
    setSelectedRoute(null)
    sfxLedger()
  }

  const checkLedger = () => {
    if (!site || !goal || goal.type !== 'ledger') return
    const routes = ledgerRoutesFor(site)
    const assign = ledger[current]
    const env = envFor(site)
    const v = validateLedger(assign, routes, env)
    if (!v.ok) {
      sfxWrong()
      once('ledger-wrong', WRONG.ledgerMix, 'Those routes don’t share a slide — check the hedge.')
      return
    }
    if (goal.expectClasses && v.classes !== goal.expectClasses) {
      sfxRefuse()
      flash(`Need ${goal.expectClasses} class${goal.expectClasses > 1 ? 'es' : ''} on the ledger.`)
      return
    }
    advanceGoal(current, goal.done)
  }

  /** The Spool: click a route on the deck to pick it up (for the ledger). */
  const onSpoolClick = (cx, cz) => {
    if (!site || here.site !== current || phase !== 'play') return
    if (goal?.type !== 'ledger') return flash(goal?.type === 'slide' ? 'Hold the Tide Glass (3) and scrub t with Z / X' : 'Nothing to pick up here right now')
    const routes = ledgerRoutesFor(site)
    const lx = cx - site.pos[0]
    const lz = cz - site.pos[1]
    let best = null
    for (const [id, pts] of Object.entries(routes)) {
      const sm = smoothRoute(pts)
      for (let i = 0; i < sm.length - 1; i++) {
        const [ax, az] = sm[i]
        const [bx, bz] = sm[i + 1]
        const dx = bx - ax
        const dz = bz - az
        const l2 = dx * dx + dz * dz || 1
        const u = Math.max(0, Math.min(1, ((lx - ax) * dx + (lz - az) * dz) / l2))
        const d = Math.hypot(lx - ax - u * dx, lz - az - u * dz)
        if (d < 0.7 && (!best || d < best.d)) best = { id, d }
      }
    }
    if (!best) return flash('Click right on a route to pick it up')
    setSelectedRoute(best.id)
    sfxLedger()
    flash(`Picked “${ROUTE_LABEL[best.id] || best.id}” — now choose Bin I or Bin II in the ledger`, 3000)
  }

  const once = (key, ls, fallback) => {
    if (!seen[key]) {
      setSeen((m) => ({ ...m, [key]: true }))
      say(ls)
    } else flash(fallback, 3400)
  }

  const confirmPace = (same = true) => {
    if (!site || goal?.type !== 'pace') return
    const env = envFor(site)
    if (!same) {
      sfxWrong()
      return once('pace-wrong', [
        { speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: 'Look again: the dashed route walks the very same curve — just in more, shorter steps. A path is a map from $[0, 1]$; changing its pace is a homotopy rel the gates.' },
      ], 'Same curve, different pace — that’s the same class.')
    }
    if (homotopicRelEndpoints(site.routes.slow, site.routes.fast, env)) {
      setPaceConfirmed(true)
      sfxCorrect()
      advanceGoal(current, goal.done)
    } else {
      sfxWrong()
      flash('Same image, different steps — still one class.')
    }
  }

  const confirmChain = () => {
    if (!site || goal?.type !== 'chain') return
    const g = site.gates
    const r = site.routes
    if (!chainSwap) {
      sfxRefuse()
      flash('Swap the middle leg first — toggle it, then confirm.', 3400)
      return
    }
    const chainEnv = { gates: { a: g.a, b: g.b, c: g.c }, hedges: site.hedges, canonical: r.AC_left }
    // A→B stays as it is; B→C is swapped from BC_left to BC_alt (same side of the hedge)
    const c1 = classOfChainRoutes(r.AB_left, r.BC_left, chainEnv)
    const c2 = classOfChainRoutes(r.AB_left, r.BC_alt, chainEnv)
    if (c1 === c2) {
      sfxCorrect()
      advanceGoal(current, goal.done)
    } else {
      sfxWrong()
      once('chain', HINTS.refuse.chain, 'Swap only the middle leg for a route in the same class.')
    }
  }

  const waveSeen = useRef(false)
  const guardClear = useCallback(() => {
    if (goal?.type !== 'guard' || !current || phase !== 'play') return
    if (!waveSeen.current) {
      if ((enemies[current] || 0) > 0) waveSeen.current = true
      return
    }
    if (!enemies[current]) advanceGoal(current, goal.done)
  }, [goal, current, enemies, advanceGoal, phase])

  useEffect(() => {
    guardClear()
  }, [guardClear, enemies])

  const advance = () => {
    const full = lines[lineIdx]?.text?.length ?? 0
    if (shown < full) {
      setShown(full)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx(lineIdx + 1)
      return
    }
    const next = phase.split(':')[1] || 'play'
    setLines([])
    setPhase(next)
    if (next === 'after' && afterTalk.current) {
      afterTalk.current()
      afterTalk.current = null
    }
  }

  // Type like Level 01: reset shown on each line, clearInterval on cleanup.
  // (Old setTimeout typer compared against the PREVIOUS line's shown count and
  // skipped typing entirely — empty Gyroid boxes with ▶▶ still active.)
  useEffect(() => {
    const talkingNow = phase.startsWith('talk')
    duckMusic(talkingNow)
    if (talkingNow) dialogOpen()
  }, [phase])

  useEffect(() => {
    setShown(0)
    if (!lines.length) return undefined
    const line = lines[lineIdx]
    if (!line?.text) return undefined
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
      if (shownNow.current >= line.text.length) {
        clearInterval(id)
        return
      }
      const ch = line.text[i - 1]
      if (ch && ch !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => clearInterval(id)
  }, [lines, lineIdx])

  const gameKey = knockouts
  // after a knockout the deck's spawn come back — and an unfinished wave with them
  const gameEnemies = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (done[s.id]) continue
      for (const [type, dx, dz] of s.enemies || []) list.push({ type, x: s.pos[0] + dx, z: s.pos[1] + dz, site: s.id })
      if (waveSpawned.current && s.id === current && goal?.type === 'guard') for (const [type, dx, dz] of s.wave || []) list.push({ type, x: s.pos[0] + dx, z: s.pos[1] + dz, site: s.id })
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])

  const talking = phase.startsWith('talk')
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
  const playEnabled = phase === 'play' && !lesson && !levelClear && !paused && !warp.warping
  const line = talking ? lines[lineIdx] : null
  useDialogKeys(!!line, advance)
  // ---------- talking to Emmy: she follows right behind Gyroid; E asks her (from afar, she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: phase === 'play' && !paused && !levelClear && !lesson && !warp.warping,
    advice: () =>
      emmyAdvice11({
        station: current,
        stationName: SITE[current]?.name,
        name: SITE[current]?.name,
        here: here.site,
        goal,
        exitOpen,
        enemies: enemies[current],
      }),
    say,
  })

  // Tide Glass scrub: hold Z/X like Level 02 (raf applies dt). Discrete keydown bumps never felt like scrubbing.
  const scrubKeys = useRef({})
  useEffect(() => {
    const onKey = (e) => {
      if (talking) return
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
      if (e.code === 'KeyQ') setTool((w) => TOOLS[(TOOLS.indexOf(w) + 1) % TOOLS.length])
      if (e.code === 'KeyZ' || e.code === 'KeyX') scrubKeys.current[e.code] = true
    }
    const onUp = (e) => {
      if (e.code === 'KeyZ' || e.code === 'KeyX') scrubKeys.current[e.code] = false
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onUp)
    }
  })

  const glassActive = tool === 'glass' && playEnabled && goal?.type === 'slide'
  camLockRef.current = glassActive // while scrubbing, Z / X and the wheel move t, not the camera
  useEffect(() => {
    if (!glassActive) return
    let raf
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = scrubKeys.current
      const dir = (k.KeyX ? 1 : 0) - (k.KeyZ ? 1 : 0)
      if (dir) setGlassT(glassTRef.current + dir * SCRUB_PER_SEC * dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const wheel = (e) => setGlassT(glassTRef.current + Math.sign(e.deltaY) * 0.012)
    window.addEventListener('wheel', wheel, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', wheel)
    }
  }, [glassActive, setGlassT])

  useEffect(() => {
    const tick = () => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)
      setHere({ site: st?.id || null, pos: [s.x, s.z] })
    }
    const id = setInterval(tick, 120)
    return () => clearInterval(id)
  }, [])

  if (import.meta.env.DEV)
    window.__lvl1_1 = {
      warp,
      clear: () => setLevelClear(true),
      proveAll: () => {
        STATION_ORDER.forEach((id) => window.__game?.killSite?.(id))
        setDone(Object.fromEntries(STATION_ORDER.map((id) => [id, true])))
        setExitOpen(true)
      },
      rewardAt: REWARD_AT,
      emmyRef,
      onSpoolClick,
      setSelectedRoute,
      confirmPace,
      SITE,
      here,
      done,
      goalIdx,
      ledger,
      phase,
      glassT,
      setGlassT,
      setTool,
      current,
      goal,
      assignBin,
      checkLedger,
      confirmChain,
      chainSwap,
      setChainSwap,
      enemies,
    }

  const slidePair = goal?.type === 'slide' ? goal.pair : null
  const nDone = STATION_ORDER.filter((id) => done[id]).length
  const objective = warp.objective(current ? `next: ${SITE[current].name}` : '')
  const atStation = !!current && here.site === current && met[current]

  const stepText = (() => {
    if (!goal) return ''
    if (goal.type === 'slide') return 'Tide Glass (3): scrub t with Z / X until routes match'
    if (goal.type === 'ledger') return selectedRoute ? `Picked ${ROUTE_LABEL[selectedRoute] || selectedRoute} — choose Bin I or Bin II` : 'Spool (2): click a route on the deck (or its name) · then its bin · Stamp when all are sorted'
    if (goal.type === 'pace') return 'Is the dashed fast route the same class as the slow one?'
    if (goal.type === 'chain') return chainSwap ? 'Confirm swap keeps the chain class' : 'Chain routes · toggle swap · confirm'
    if (goal.type === 'guard') return 'Lash hedge spawn (1) before they root'
    return `${WORLD_TOOLS.spool.label} (2) · ${WORLD_TOOLS.glass.label} (3)`
  })()

  const routeIds = site?.routes ? Object.keys(ledgerRoutesFor(site)) : []
  // at the Triple Gate the master ledger sorts whole journeys, so draw those instead of the loose legs
  const routeOverrides = site?.id === 'chained' && goal?.type === 'ledger' ? { chained: ledgerRoutesFor(site) } : undefined

  return (
    <div className="screen level w1-1-level">
      <Canvas camera={{ position: [0, 11, 28], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        <EndpointGardensScene
          layout={layout}
          sites={SITES}
          walkable={walkable}
          current={current}
          frameRef={frameRef}
          checkpoint={checkpoint}
          gameKey={gameKey}
          enemies={gameEnemies}
          spawnRef={spawnRef}
          stateRef={stateRef}
          emmyRef={emmyRef}
          playEnabled={playEnabled}
          tool={tool}
          ribbonApi={ribbonApi}
          onEnemies={setEnemies}
          onHearts={(h) => {
            if (h <= 0) {
              setKnockouts((k) => k + 1)
              setHearts(3)
              say(HINTS.knockout)
            } else setHearts(h)
          }}
          ledger={ledger}
          glassT={glassT}
          slidePair={slidePair}
          routeOverrides={routeOverrides}
          selectedRoute={selectedRoute}
          showLabels={goal?.type === 'ledger' || goal?.type === 'pace' || goal?.type === 'chain'}
          onSpoolClick={onSpoolClick}
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
            <button type="button" className="btn ghost" aria-pressed={muted} onClick={() => (setMuted(!muted), setAudioMuted(!muted))}>
              {muted ? '♪ off' : '♪ on'}
            </button>
            <button type="button" className="btn ghost" onClick={() => setLesson(true)}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Level 1 · Endpoint Gardens</span>
            <h2>{levelMeta?.title || 'Fixed Endpoints'}</h2>
            <div className="hud">
              <span className="hearts">{[0, 1, 2].map((i) => (<span key={i} className={i < hearts ? 'heart' : 'heart lost'}>♥</span>))}</span>
              <span className="objective">{objective}</span>
            </div>
            {here.site && (
              <div className="here">
                <strong>{SITE[here.site]?.name}</strong>
                {done[here.site] ? ' · finished' : enemies[here.site] ? ` · spawn: ${enemies[here.site]}` : ' · clear'}
              </div>
            )}
          </div>
        </div>

        {current && here.site === current && goal && (
          <div className="rules-panel forge-panel works-panel w1-1-ledger-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            {goal.type === 'ledger' && (
              <div className="w1-1-route-picks">
                {routeIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn small ${selectedRoute === id ? 'primary' : ''}`}
                    style={ledger[current][id] != null && selectedRoute !== id ? { borderColor: BIN_COLORS[ledger[current][id]], color: BIN_COLORS[ledger[current][id]] } : undefined}
                    onClick={() => setSelectedRoute(id)}
                  >
                    {ROUTE_LABEL[id] || id}
                    {ledger[current][id] != null ? ` · ${ledger[current][id] === 0 ? 'I' : 'II'}` : ''}
                  </button>
                ))}
                <div className="btn-row">
                  <button type="button" className="btn small" style={{ borderColor: BIN_COLORS[0], color: BIN_COLORS[0] }} onClick={() => assignBin(0)}>
                    Bin I
                  </button>
                  <button type="button" className="btn small" style={{ borderColor: BIN_COLORS[1], color: BIN_COLORS[1] }} onClick={() => assignBin(1)}>
                    Bin II
                  </button>
                  <button type="button" className="btn primary small" onClick={checkLedger}>
                    Stamp ledger
                  </button>
                </div>
              </div>
            )}
            {goal.type === 'pace' && (
              <div className="btn-row">
                <button type="button" className="btn primary small" onClick={() => confirmPace(true)}>
                  Same class
                </button>
                <button type="button" className="btn small" onClick={() => confirmPace(false)}>
                  Different class
                </button>
              </div>
            )}
            {goal.type === 'chain' && (
              <div className="btn-row">
                <button type="button" className="btn small" onClick={() => setChainSwap((s) => !s)}>
                  {chainSwap ? 'Middle leg: swapped (B→C alt)' : 'Middle leg: B→C (original)'}
                </button>
                <button type="button" className="btn primary small" onClick={confirmChain}>
                  Confirm chain class
                </button>
              </div>
            )}
            <p className="forgery-count">{stepText}</p>
          </div>
        )}

        {line && (
          <div className="dialog" onClick={advance}>
            <Portrait id={line.portrait || 'gyroid'} name={line.speaker} />
            <div className="dialog-body">
              <span className="speaker">{line.speaker}</span>
              <p>
                <MathText text={line.text || '…'} shown={shown} />
              </p>
            </div>
            <button type="button" className="btn primary small" onClick={(e) => (e.stopPropagation(), advance())}>
              {shown < (line.text?.length ?? 0) ? '▶▶' : lineIdx + 1 < lines.length ? 'Next ▾' : 'OK'}
            </button>
          </div>
        )}

        {toast && !line && <div className="toast">{toast}</div>}
        <TalkPrompt near={nearEmmy} show={phase === 'play' && !line && !levelClear && !paused && !lesson} />
        {!levelClear && !line && <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Endpoint Gardens" face={warp.face} marks={warp.marks} markIcon="⌒" portal={exitOpen ? { pos: layout.exit.b, open: warp.portalOpen } : null} />}
        {playEnabled && !levelClear && (
          <div className="controls">
            <div className="weapons">
              <button type="button" className={`weapon ${tool === 'lash' ? 'active' : ''}`} onClick={() => setTool('lash')}>
                ⚡ Lash <kbd>1</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'spool' ? 'active' : ''}`} onClick={() => setTool('spool')}>
                ◎ Spool <kbd>2</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'glass' ? 'active' : ''}`} onClick={() => setTool('glass')}>
                ◑ Tide Glass <kbd>3</kbd>
              </button>
            </div>
            <div className="hint">{atStation && stepText ? <MathText text={stepText} /> : 'WASD to move · click or F to crack the Lash (1) · Emmy’s right behind you (E)'}</div>
          </div>
        )}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-1-1-lesson"
          Scene={EndpointsLesson}
          Overlay={EndpointsLessonOverlay}
          kicker="World 1 · Level 1 · Lesson"
          name="Fixed Endpoints"
          embedded
          onDone={() => (setLesson(false), warp.portalOpen ? null : startLevelMusic())}
          onSkip={() => (setLesson(false), warp.portalOpen ? null : startLevelMusic())}
        />
      )}

      {warp.warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'Fixed Endpoints'}
          progress={`⌒ ${warp.count} of ${warp.total} Path Seals`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level1-1', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 1 · Level 1 clear"
          title={levelMeta?.title || 'Fixed Endpoints'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={DEFINITION}
          onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
          onNext={onNext}
          nextLabel="Continue ▸ Loop de Loop"
        />
      )}
    </div>
  )
}
