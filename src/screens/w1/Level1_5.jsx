import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PushForwardScene from '../../levels/w1/PushForwardScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import { useExitTrigger } from '../exitTrigger'
import layout from '../../world/torus-terraces.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import { DEFINITION, HINTS, OPENING, STATIONS, STATION_ORDER, emmyAdvice15 } from '../../levels/w1/stages1_5'
import { eqPair, pushWinding, stillDistinct } from '../../levels/w1/inducedMaps'
import { makeCircleTracker } from '../../levels/w1/loopTrack'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  sfxZoot,
  sfxExit,
  startPushMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import PushForwardLesson, { PushForwardLessonOverlay } from '../../movies/w1/PushForwardLesson'
import MathText from '../MathText'
import useDialogKeys from '../useDialogKeys'

const TYPE_CPS = 45
const REACH = 3.4
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const TOOL_KEYS = { Digit1: 'lash', Digit2: 'spool', Digit3: 'smith', Digit4: 'cord', Digit5: 'sling', KeyQ: 'cycle' }
const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
const W = (site, p) => [p[0] + site.pos[0], p[1] + site.pos[1]]

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

export default function Level1_5({ concept, onBackToTitle, onNext, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-5')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [loops, setLoops] = useState({ source: 0, target: 0, pair: [0, 0], tube: 0, hole: 0, shadow: [0, 0], rim: 0, inner: 0 })
  const [hijacked, setHijacked] = useState({ projector_deck: false })
  const [swapDone, setSwapDone] = useState(false)
  const [gridReset, setGridReset] = useState(0)
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0] + 1, SITE[STATION_ORDER[skipTo]].pos[1] + 2.8] : layout.start))
  const [enemies, setEnemies] = useState({})
  const jammed = (enemies.projector_deck || 0) > 0 // spawn on the Projector terrace jam the projector
  const [tool, setTool] = useState('cord')
  const [waveOn, setWaveOn] = useState(false)
  const [waveSpawned, setWaveSpawned] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const stateRef = useRef(null)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const ribbonApi = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const waveSeen = useRef(false)
  const emmyAt = useRef({ x: layout.start[0] - 1.2, z: layout.start[1] - 0.8, rotY: Math.PI, walk: 0 })
  const emmyTalking = useRef(false)
  const [nearEmmy, setNearEmmy] = useState(false)
  const trackers = useRef({})
  // Two Roads: Gyroid's lift to the plane — which copy of the plaza (m, n) and where in it (u, v)
  const liftRef = useRef({ m: 0, n: 0, u: 0, v: 0 })
  const plazaPrev = useRef(null)
  const crossings = useRef([])
  const firstOrder = useRef(null)

  const current = STATION_ORDER.find((id) => !done[id]) || null
  const goals = current ? STATIONS[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null

  const flash = (text, ms = 2800) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }
  const say = useCallback((raw, next = 'play') => {
    const ls = Array.isArray(raw) ? raw : raw ? [raw] : [] // a single line object is fine too
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
    startPushMusic()
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

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = STATIONS[station].goals
      const next = (goalIdx[station] || 0) + 1
      if (list[next]?.wave) {
        // the guard goal *starts* with the wave: spawn it as we step into that goal
        waveSeen.current = false
        setWaveOn(true)
        setWaveSpawned(true)
        spawnRef.current?.(SITE[station].wave.map(([type, x, z]) => ({ type, x: x + SITE[station].pos[0], z: z + SITE[station].pos[1], site: station })))
      }
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setCheckpoint([SITE[station].pos[0] + 1, SITE[station].pos[1] + 2.8])
        const allDone = STATION_ORDER.every((id) => id === station || done[id])
        if (allDone) {
          afterTalk.current = () => {
            sfxZoot()
            setExitOpen(true)
          }
          return say([...(ls || []), { speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: 'All four terraces done — the north gate opens.' }], 'after')
        }
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      if (list[next].type === 'ask') afterTalk.current = () => setAskOpen(true)
      return say(ls)
    },
    [done, goalIdx, say],
  )

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)?.id || null
      const em = emmyAt.current
      setNearEmmy(Math.hypot(s.x - em.x, s.z - em.z) < 2.4)
      setHere((h) => (h.site === st && Math.abs(h.pos[0] - s.x) < 0.05 && Math.abs(h.pos[1] - s.z) < 0.05 ? h : { site: st, pos: [s.x, s.z] }))
    }, 150)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const target = current ? W(SITE[current], SITE[current].emmy) : layout.exit.a.map((v, i) => v + (i ? 1.2 : -1.6))
      const e = emmyAt.current
      const dx = target[0] - e.x
      const dz = target[1] - e.z
      const d = Math.hypot(dx, dz)
      if (d > 0.05) {
        const step = Math.min(d, 2.6 * 0.05)
        e.x += (dx / d) * step
        e.z += (dz / d) * step
        e.rotY = Math.atan2(dx, dz)
        e.walk = 1
      } else {
        e.walk = 0
        const look = current ? W(SITE[current], [0, 0]) : layout.exit.gate
        e.rotY = Math.atan2(look[0] - e.x, look[1] - e.z)
      }
    }, 50)
    return () => clearInterval(id)
  }, [current])

  useEffect(() => {
    const st = here.site
    if (!st || phase !== 'play' || done[st]) return
    if (st !== current) {
      if (!met['early:' + st]) {
        setMet((m) => ({ ...m, ['early:' + st]: true }))
        say(STATIONS[st].early)
      }
      return
    }
    if (met[st]) return
    setMet((m) => ({ ...m, [st]: true }))
    say(STATIONS[st].arrive)
  }, [here.site, phase, current, met, done, say])

  useEffect(() => {
    if (goal?.type === 'ask' && phase === 'play' && !askOpen && here.site === current && met[current]) setAskOpen(true)
  }, [goal, phase, askOpen, here.site, current, met])

  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    say([HINTS.knockout])
  }, [hearts, say])

  useEffect(() => {
    if (goal?.type !== 'guard' || !waveSpawned || phase !== 'play') return
    if ((enemies.shadows_deck || 0) > 0) waveSeen.current = true // the wave has actually appeared
    else if (waveSeen.current && waveOn) {
      setWaveOn(false)
      advanceGoal('shadows_deck', goal.done)
    }
  }, [enemies, goal, waveSpawned, waveOn, phase, advanceGoal])

  const resetTrackers = (st) => {
    const s = SITE[st]
    if (s.projector) {
      const p = s.projector
      trackers.current[`${st}:src`] = makeCircleTracker(p.source.cx + s.pos[0], p.source.cz + s.pos[1], p.source.r)
      trackers.current[`${st}:tgt`] = makeCircleTracker(p.target.cx + s.pos[0], p.target.cz + s.pos[1], p.target.r)
    }
    if (s.ring) trackers.current[`${st}:rim`] = makeCircleTracker(s.pos[0], s.pos[1], s.ring.r)
    if (s.inner) trackers.current[`${st}:inner`] = makeCircleTracker(s.pos[0], s.pos[1], s.inner.r)
    if (st === 'shadows_deck') {
      trackers.current[`${st}:tube`] = makeCircleTracker(s.pos[0] + s.tube.cx, s.pos[1] + s.tube.cz, s.tube.r)
      trackers.current[`${st}:hole`] = makeCircleTracker(s.pos[0] + s.hole.cx, s.pos[1] + s.hole.cz, s.hole.r)
    }
  }

  useEffect(() => {
    STATION_ORDER.forEach(resetTrackers)
  }, [])

  const onTrackMove = (x, z) => {
    if (!current || here.site !== current || tool !== 'cord' || phase !== 'play') return
    const st = current
    if (st === 'projector_deck') {
      const src = trackers.current['projector_deck:src']?.tick(x, z)
      const tgt = trackers.current['projector_deck:tgt']?.tick(x, z)
      if (src?.on) setLoops((m) => ({ ...m, source: src.laps }))
      if (tgt?.on) setLoops((m) => ({ ...m, target: tgt.laps }))
    }
    if (st === 'retract_deck') {
      const inner = trackers.current['retract_deck:inner']?.tick(x, z)
      if (inner?.on) setLoops((m) => (m.inner === inner.laps ? m : { ...m, inner: inner.laps }))
      const rim = trackers.current['retract_deck:rim']?.tick(x, z)
      if (rim?.on) setLoops((m) => (m.rim === rim.laps ? m : { ...m, rim: rim.laps }))
    }
    if (st === 'shadows_deck') {
      const tube = trackers.current['shadows_deck:tube']?.tick(x, z)
      const hole = trackers.current['shadows_deck:hole']?.tick(x, z)
      if (tube?.on) setLoops((m) => ({ ...m, shadow: [tube.laps, m.shadow[1]] }))
      if (hole?.on) setLoops((m) => ({ ...m, shadow: [m.shadow[0], hole.laps] }))
    }
    checkGoals()
  }

  const checkGoals = () => {
    if (!goal || here.site !== current || phase !== 'play') return
    if ((goal.type === 'grid' || goal.type === 'swap') && eqPair(loops.pair, goal.need)) {
      const order = crossings.current.slice(0, 2).join('')
      if (goal.type === 'grid') {
        firstOrder.current = crossings.current[0]
        sfxCorrect()
        advanceGoal(current, goal.done)
      } else if (crossings.current[0] && crossings.current[0] !== firstOrder.current) {
        sfxCorrect()
        advanceGoal(current, goal.done)
      } else if (!swapDone) {
        setSwapDone(true)
        sfxRefuse()
        flash(`Same order as last time (${order === 'ab' ? '$a$ then $b$' : '$b$ then $a$'}). Press “Back to the start” and go through the other gate first.`, 4600)
      }
    }
  }

  /** Two Roads: the plaza's opposite gates are glued. Leave by one and you come back in by its twin. */
  const resetPlaza = () => {
    const site = SITE.two_roads
    const s = stateRef.current
    liftRef.current = { m: 0, n: 0, u: 0, v: 0 }
    crossings.current = []
    plazaPrev.current = null
    setSwapDone(false)
    setLoops((m) => ({ ...m, pair: [0, 0] }))
    if (s) (s.x = site.pos[0]), (s.z = site.pos[1] + 0.6)
  }
  useEffect(() => {
    const id = setInterval(() => {
      if (current !== 'two_roads') return
      const s = stateRef.current
      if (!s) return
      const site = SITE.two_roads
      const { half: h, gate: g } = site.plaza
      let lx = s.x - site.pos[0]
      let lz = s.z - site.pos[1]
      const L = liftRef.current
      const was = plazaPrev.current
      let crossed = null
      if (was) {
        if (lx > h && Math.abs(lz) < g) (s.x -= 2 * h - 0.35), (L.m += 1), (crossed = ['a', 1])
        else if (lx < -h && Math.abs(lz) < g) (s.x += 2 * h - 0.35), (L.m -= 1), (crossed = ['a', -1])
        else if (lz < -h && Math.abs(lx) < g) (s.z += 2 * h - 0.35), (L.n += 1), (crossed = ['b', 1])
        else if (lz > h && Math.abs(lx) < g) (s.z -= 2 * h - 0.35), (L.n -= 1), (crossed = ['b', -1])
      }
      lx = s.x - site.pos[0]
      lz = s.z - site.pos[1]
      const inside = Math.abs(lx) <= h && Math.abs(lz) <= h
      plazaPrev.current = inside
      L.u = Math.max(-0.5, Math.min(0.5, lx / (2 * h)))
      L.v = Math.max(-0.5, Math.min(0.5, -lz / (2 * h)))
      if (crossed) {
        sfxZoot()
        crossings.current.push(crossed[0])
        setLoops((m) => ({ ...m, pair: [L.m, L.n] }))
        flash(`Through gate $${crossed[0]}$${crossed[1] < 0 ? ' backwards' : ''} — you came back in on the far side. The lift is at $(${L.m}, ${L.n})$.`)
      }
    }, 30)
    return () => clearInterval(id)
  }, [current])

  useEffect(() => {
    checkGoals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loops.pair, loops.shadow])

  const onAction = (gx, gz, cx, cz) => {
    if (phase !== 'play' || askOpen) return
    if (tool === 'sling' && current === 'projector_deck') {
      const lift = SITE.projector_deck.lift
      const at = W(SITE.projector_deck, lift.at)
      if (Math.hypot(cx - at[0], cz - at[1]) < 1.2 && Math.hypot(gx - at[0], gz - at[1]) < REACH) {
        const s = stateRef.current
        s.x = at[0]
        s.z = at[1] + 0.4
        flash('Sling up to the upper terrace')
        return
      }
    }
    if (current !== 'projector_deck' || goal?.type !== 'push') {
      if (tool === 'smith') return flash('Use the Cord (4) on the belt roads, or the Lash (1) on imps')
      return
    }
    const s = SITE.projector_deck
    const proj = W(s, s.projector.at)
    if (Math.hypot(cx - proj[0], cz - proj[1]) > 1.6) return flash('Click the brass projector')
    if (Math.hypot(gx - proj[0], gz - proj[1]) > REACH) return flash('Walk closer to the projector')
    if (jammed) return once('hijack', [HINTS.hijacked], HINTS.hijacked.text)
    if (loops.source < goal.needSource) return once('push-src', [HINTS.wrongPush], HINTS.wrongPush.text)
    const deg = goal.degree
    const pushed = pushWinding(loops.source, deg)
    setLoops((m) => ({ ...m, target: pushed }))
    trackers.current['projector_deck:tgt']?.reset()
    if (pushed === goal.needTarget) {
      sfxCorrect()
      advanceGoal('projector_deck', goal.done)
    } else {
      sfxWrong()
      flash(`Projector sent winding ${pushed}; need ${goal.needTarget}`)
    }
  }

  const answer = (i) => {
    setAskOpen(false)
    const g = goal
    if (i === g.answer) {
      sfxCorrect()
      advanceGoal(current, g.right)
    } else {
      sfxWrong()
      say(g.wrong)
    }
  }

  const rebuildShadows = () => {
    if (goal?.type !== 'shadows') return
    if (eqPair(loops.shadow, goal.need)) {
      sfxCorrect()
      advanceGoal(current, goal.done)
    } else {
      sfxRefuse()
      flash(`Shadows (${loops.shadow[0]}, ${loops.shadow[1]}) — need (${goal.need[0]}, ${goal.need[1]})`)
    }
  }

  useEffect(() => {
    if (goal?.type !== 'retract' || here.site !== 'retract_deck' || phase !== 'play') return
    if (Math.abs(loops.inner) >= goal.w2 && stillDistinct(goal.w1, loops.inner)) {
      sfxCorrect()
      advanceGoal('retract_deck', goal.done)
    }
  }, [loops.inner, goal, here.site, advanceGoal, phase])

  useEffect(() => {
    const onKey = (e) => {
      const t = TOOL_KEYS[e.code]
      if (t === 'cycle') {
        const order = ['lash', 'cord', 'sling']
        setTool((cur) => order[(order.indexOf(cur) + 1) % order.length])
        e.preventDefault()
        return
      }
      if (t) setTool(t)
      if (e.code === 'KeyE' && nearEmmy && phase === 'play') {
        say(emmyAdvice15({ current, here, goal, done, STATIONS, SITE, loops, hijacked: jammed, waveOn, waveSpawned, enemies, exitOpen }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nearEmmy, phase, say, current, here, goal, done, loops, jammed, waveOn, waveSpawned, enemies, exitOpen])

  ribbonApi.current = {
    target: () => null,
    snip: () => false,
  }

  const advance = () => {
    const full = lines[lineIdx]?.text.length ?? 0
    if (shown < full) return setShown(full)
    if (lineIdx + 1 < lines.length) return setLineIdx(lineIdx + 1)
    const next = phase.split(':')[1]
    if (next === 'after') {
      setPhase('play')
      afterTalk.current?.()
      afterTalk.current = null
    } else if (next === 'ask') {
      setPhase('play')
      setAskOpen(true)
    } else setPhase(next)
  }
  const talking = phase.startsWith('talk:')
  const line = talking ? lines[lineIdx] : null
  useDialogKeys(!!line, advance)
  emmyTalking.current = !!line && line.speaker === 'Emmy Boundary'
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

  const playEnabled = phase === 'play' && !lesson && !askOpen && !levelClear
  const gameKey = `push15:${knockouts}:${gridReset}`
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [exitOpen])
  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    if (waveOn) for (const [type, x, z] of SITE.shadows_deck.wave || []) list.push({ type, x: x + SITE.shadows_deck.pos[0], z: z + SITE.shadows_deck.pos[1], site: 'shadows_deck' })
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
  }, [gameKey, done, waveOn, checkpoint])

  const FRAME = { projector_deck: 11.4, retract_deck: 11.4, two_roads: 12.4, shadows_deck: 11.4 }
  frameRef.current = current && here.site === current && met[current] ? { center: [SITE[current].pos[0] + (current === 'two_roads' ? 2.6 : 1.2), SITE[current].pos[1] - 0.2], size: FRAME[current], follow: 0.1 } : null
  useExitTrigger(exitOpen, stateRef, (x, z) => Math.abs(x - layout.exit.gate[0]) < 1.6 && z < layout.exit.gate[1] - 0.8, () => {
    sfxExit()
    setLevelClear(true)
  })

  if (import.meta.env.DEV) {
    window.__lvl1_5 = { here, done, goalIdx, loops, goal, phase, lines, askOpen, setTool, advanceGoal, jammed, enemies, SITE, onAction: (x, z) => onAction(x, z, x, z), answer, rebuildShadows, resetPlaza, lift: liftRef.current }
  }

  const showGrid = current === 'two_roads' && met.two_roads
  const nDone = STATION_ORDER.filter((id) => done[id]).length
  const objective = exitOpen ? 'Walk north to leave the terraces' : current ? `Terraces ${nDone}/4 · ${STATIONS[current].blueprint}` : ''

  const stepText = (() => {
    if (!goal) return ''
    if (goal.type === 'push') return jammed ? 'Spawn are jamming the projector — Lash (1) them first' : loops.source < goal.needSource ? `Cord (4): one lap of the gold source circle (${loops.source}/${goal.needSource})` : 'Click the brass projector to push the loop forward'
    if (goal.type === 'retract') return `Cord (4): laps of the pink inner road, round the pool (${loops.inner}/${goal.w2})`
    if (goal.type === 'grid') return `Walk out through gate $a$ and gate $b$, once each — the lift is at $(${loops.pair[0]}, ${loops.pair[1]})$`
    if (goal.type === 'swap') return `Now the other order: the other gate first — the lift is at $(${loops.pair[0]}, ${loops.pair[1]})$`
    if (goal.type === 'shadows') return `Shadows $(${loops.shadow[0]}, ${loops.shadow[1]})$ — need $(${goal.need[0]}, ${goal.need[1]})$ · then Rebuild`
    if (goal.type === 'guard') return 'Lash projector imps (1)'
    return 'Cord (4) · Sling (5) · Lash (1)'
  })()

  return (
    <div className="screen level lvl15">
      <Canvas camera={{ position: [0, 11, 30], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        <PushForwardScene
          layout={layout}
          sites={SITES}
          current={current}
          loops={loops}
          hijacked={{ projector_deck: jammed }}
          liftRef={liftRef}
          gridShadow={loops.pair}
          showGrid={showGrid}
          exitOpen={exitOpen}
          walkable={walkable}
          game={game}
          gameKey={gameKey}
          stateRef={stateRef}
          frameRef={frameRef}
          spawnRef={spawnRef}
          ribbonApi={ribbonApi}
          playEnabled={playEnabled}
          tool={tool}
          onAction={onAction}
          onTrackMove={onTrackMove}
          onEnemies={setEnemies}
          onHearts={setHearts}
          emmyAt={emmyAt}
          emmyTalking={emmyTalking}
          emmyNear={nearEmmy && phase === 'play'}
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
            <span className="lvl-kicker">World 1 · Level 5 · Torus Terraces</span>
            <h2>{levelMeta?.title || 'Push It Forward'}</h2>
            <div className="hud">
              <span className="hearts">{[0, 1, 2].map((i) => (<span key={i} className={i < hearts ? 'heart' : 'heart lost'}>♥</span>))}</span>
              <span className="objective">{objective}</span>
            </div>
          </div>
        </div>

        {current && here.site === current && met[current] && (
          <div className="rules-panel forge-panel works-panel lvl15-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            <p className="carry-line">
              {goal?.type === 'push' && <MathText text={`source $${loops.source}$ lap${loops.source === 1 ? '' : 's'} → target $${loops.target}$ · the map is $z ↦ z²$`} />}
              {goal?.type === 'retract' && <MathText text={`inner road $${loops.inner}$ · pushed onto the rim: $${loops.inner}$`} />}
            </p>
            <p className="forgery-count">
              <MathText text={stepText} />
            </p>
            {goal?.type === 'shadows' && (
              <button type="button" className="btn" onClick={rebuildShadows}>
                Rebuild loop
              </button>
            )}
            {goal?.type === 'swap' && (
              <button type="button" className="btn ghost" onClick={(e) => (resetPlaza(), e.currentTarget.blur())}>
                Back to the start
              </button>
            )}
          </div>
        )}

        {!levelClear && !line && !askOpen && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Torus Terraces" />
        )}

        {toast && !line && (
          <div className="toast">
            <MathText text={toast} />
          </div>
        )}
        {nearEmmy && phase === 'play' && !askOpen && !levelClear && (
          <button type="button" className="btn talk-btn" onClick={() => say(emmyAdvice15({ current, here, goal, done, STATIONS, SITE, loops, hijacked: jammed, waveOn, waveSpawned, enemies, exitOpen }))}>
            💬 Talk to Emmy <kbd>E</kbd>
          </button>
        )}
        {playEnabled && (
          <div className="controls">
            <div className="weapons">
              {[
                ['lash', '⚡ Lash', '1'],
                ['cord', '◎ Cord', '4'],
              ].map(([id, label, key]) => (
                <button key={id} type="button" className={`weapon ${tool === id ? 'active' : ''}`} onClick={(e) => (setTool(id), e.currentTarget.blur())}>
                  {label} <kbd>{key}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
        {playEnabled && !toast && <div className="hint">{current && here.site === current ? stepText : 'WASD to move · 1 Lash · 4 Cord · E talk to Emmy'}</div>}

        {askOpen && !line && goal?.type === 'ask' && (
          <div className="dialog verdict" style={{ cursor: 'default' }}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p><MathText text={goal.question} /></p>
            </div>
            <div className="btn-row" style={{ flexDirection: 'column' }}>
              {goal.options.map((opt, i) => (
                <button key={i} type="button" className="btn small" onClick={() => answer(i)}>
                  <MathText text={opt} />
                </button>
              ))}
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
            videoId="level-1-5-lesson"
            Scene={PushForwardLesson}
            Overlay={PushForwardLessonOverlay}
            kicker="World 1 · Level 5 · Lesson"
            name="Push It Forward"
            startMusic={startPushMusic}
            embedded
            onDone={() => (setLesson(false), startPushMusic())}
            onSkip={() => (setLesson(false), startPushMusic())}
          />
        )}

        {levelClear && (
          <div className="win-banner exit">
            <div className="win-card wide">
              <span className="lvl-kicker">World 1 · Level 5 clear</span>
              <h2>{levelMeta?.title || 'Push It Forward'}</h2>
              <p className="def">{DEFINITION.text}</p>
              <p className="cite">
                {DEFINITION.cite}{' '}
                <a href={DEFINITION.link} target="_blank" rel="noreferrer">
                  Read the book
                </a>
              </p>
              <p className="next-up">Next: {DEFINITION.next}</p>
              <div className="btn-row">
                <button type="button" className="btn" onClick={() => setLevelClear(false)}>
                  Keep exploring
                </button>
                <button type="button" className="btn" onClick={onBackToTitle}>
                  Back to title
                </button>
                <button type="button" className="btn primary" onClick={onNext}>
                  Continue ▸ Free Word Play
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
