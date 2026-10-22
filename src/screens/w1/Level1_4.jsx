import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BasinScene from '../../levels/w1/BasinScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import {
  DEFINITION,
  HINTS,
  OPENING,
  STATIONS,
  STATION_ORDER,
  emmyAdvice14,
} from '../../levels/w1/stages1_4'
import { antipode, fieldAngle, hasAntipodalMatch, makeRimTracker, readingsMatch, unitRoots } from '../../levels/w1/brouwer'
import layout from '../../world/basin.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxRefuse,
  sfxWrong,
  sfxZoot,
  startBasinMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import NoWayOutLesson, { NoWayOutLessonOverlay } from '../../movies/w1/NoWayOutLesson'
import MathText from '../MathText'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'

const TYPE_CPS = 45
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
/** a station's mouth: where the causeway Gyroid came in by meets the deck (a knockout brings him back here, not to the gate) */
const mouthOf = (site, x, z) => {
  const ends = layout.causeways.flatMap((c) => [c.a, c.b]).filter((p) => site.containsWorld(p[0], p[1]))
  if (!ends.length) return [site.pos[0], site.pos[1] + 2.2]
  const p = ends.reduce((best, q) => (Math.hypot(q[0] - x, q[1] - z) < Math.hypot(best[0] - x, best[1] - z) ? q : best))
  const d = Math.hypot(site.pos[0] - p[0], site.pos[1] - p[1]) || 1
  return [p[0] + ((site.pos[0] - p[0]) / d) * 0.8, p[1] + ((site.pos[1] - p[1]) / d) * 0.8]
}
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
}
const TOOL_KEYS = { Digit1: 'lash', Digit3: 'glass', Digit4: 'cord' }
const RIM_BAND = 0.75
const fmt = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1)
const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
/** where each station's reward waits once it's done: on its outer ring, as far as it can get from the causeway mouths and Emmy's spot */
const MOUTHS = [...layout.causeways.flatMap((c) => [c.a, c.b]), layout.exit.a]
const REWARD_AT = Object.fromEntries(
  SITES.filter((s) => s.stage === 'station').map((s) => {
    const avoid = [...MOUTHS, s.emmy && [s.pos[0] + s.emmy[0], s.pos[1] + s.emmy[1]]].filter((p) => p && Math.hypot(p[0] - s.pos[0], p[1] - s.pos[1]) < 9)
    let best = null
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      const p = [s.pos[0] + Math.cos(a) * 4.6, s.pos[1] + Math.sin(a) * 4.6]
      const score = Math.min(99, ...avoid.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])))
      if (!best || score > best.score) best = { p, score }
    }
    return [s.id, landNear(s, best.p)]
  }),
)
const NOUN = { icon: '◉', one: 'Still Point', many: 'Still Points', kind: 'stillpoint' }
const END_CARD = {
  learned: 'Every proof in the basin was the same move: walk a rim once and count how many times the arrow turns. Shrink that loop through the disk and the count can’t jump from 1 to 0, so the Retractor had to tear: there’s no retraction of D² onto S¹. That one count gave us Brouwer’s still tile, the three roots of z³ − a³, and two opposite weather stations reading exactly the same.',
  ahead: 'Next, the Torus Terraces. A map between spaces carries loops along with it, so it carries π₁ along too: the induced map f*. We’ll push loops through projectors and watch what survives on the other side.',
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

export default function Level1_4({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-4')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [met, setMet] = useState({})
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0)
  shownNow.current = shown
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() =>
    skipTo ? [SITE[STATION_ORDER[skipTo]].pos[0] + 1.2, SITE[STATION_ORDER[skipTo]].pos[1] + 3.2] : layout.start,
  )
  const [enemies, setEnemies] = useState({})
  const [tool, setTool] = useState('cord')
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const [basinState, setBasinState] = useState({
    retractorSeized: skipTo > 0,
    stillFound: {},
    foundRoots: {},
    pairPick: { a: null, b: null },
    rimWinding: {},
  })
  const [waveOn, setWaveOn] = useState(false)
  const [shrinkT, setShrinkT] = useState(0)
  // the arrow under Gyroid while he walks a rim: how far it has turned, and how far he has gone round
  const fieldRun = useRef({ prev: null, acc: 0 })
  const [rimLive, setRimLive] = useState({ pos: 0, field: 0 })
  const [waveSeen, setWaveSeen] = useState(0)

  const stateRef = useRef(null)
  // chase camera: it starts behind Gyroid, looking up the level from the landing
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const camLockRef = useRef(false)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'
  const rimTrackers = useRef(
    Object.fromEntries(
      STATION_ORDER.filter((id) => SITE[id]?.rimRadius).map((id) => {
        const s = SITE[id]
        return [id, makeRimTracker([s.pos[0], s.pos[1]], s.rimRadius)]
      }),
    ),
  )

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

  const advanceGoal = useCallback(
    (station, ls = []) => {
      const list = STATIONS[station].goals
      const curG = list[goalIdx[station] || 0]
      // the goal marked `wave` releases the drones when it finishes; the following `guard` goal waits for them to be cleared
      if (curG?.wave && SITE[station].wave) {
        setWaveOn(true)
        spawnRef.current?.(
          SITE[station].wave.map(([type, x, z]) => ({
            type,
            x: x + SITE[station].pos[0],
            z: z + SITE[station].pos[1],
            site: station,
          })),
        )
      }
      const next = (goalIdx[station] || 0) + 1
      // an `exit` goal is just "walk out the gate": the deck is finished when it comes up, and the gate opens
      if (next >= list.length || list[next]?.type === 'exit') {
        setDone((d) => ({ ...d, [station]: true }))
        setCheckpoint([SITE[station].pos[0] + 1.2, SITE[station].pos[1] + 3.2])
        if (station === 'antipodes') {
          afterTalk.current = () => {
            sfxZoot()
            setExitOpen(true)
          }
          return say(ls, 'after')
        }
        return say(ls)
      }
      setGoalIdx((m) => ({ ...m, [station]: next }))
      return say(ls)
    },
    [goalIdx, say],
  )

  useEffect(() => {
    unlockAudio()
    startBasinMusic()
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

  const once = useCallback(
    (key, ls, fallback) => {
      if (!seen[key]) {
        setSeen((m) => ({ ...m, [key]: true }))
        say(ls)
      } else flash(fallback, 3400)
    },
    [say, seen],
  )

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const st = stationAt(s.x, s.z)?.id || null
      setHere((h) => (h.site === st && Math.abs(h.pos[0] - s.x) < 0.05 && Math.abs(h.pos[1] - s.z) < 0.05 ? h : { site: st, pos: [s.x, s.z] }))
    }, 150)
    return () => clearInterval(id)
  }, [])

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
    setCheckpoint(mouthOf(SITE[st], here.pos[0], here.pos[1]))
    say(STATIONS[st].arrive)
  }, [here.site, phase, current, met, done, say])

  // guard goal
  useEffect(() => {
    if (!current || goal?.type !== 'guard') return
    if (waveOn && enemies[current] > 0) setWaveSeen((n) => Math.max(n, enemies[current]))
    if (waveOn && waveSeen > 0 && (enemies[current] || 0) === 0) {
      setWaveOn(false)
      advanceGoal(current, goal.done)
    }
  }, [advanceGoal, current, enemies, goal, waveOn, waveSeen])

  const onTrackMove = useCallback(
    (x, z) => {
      if (!current || !goal || goal.type !== 'rim') return
      const site = SITE[current]
      if (!site?.rimRadius) return
      if (!site.containsWorld(x, z)) return
      const tr = rimTrackers.current[current]
      const lx = x - site.pos[0]
      const lz = z - site.pos[1]
      const fr = fieldRun.current
      if (Math.abs(Math.hypot(lx, lz) - site.rimRadius) > RIM_BAND) fr.prev = null
      else {
        const f = site.field || { kind: 'radial' }
        const a = fieldAngle(f.kind, lx, lz, f)
        if (fr.prev != null) {
          let da = a - fr.prev
          while (da > Math.PI) da -= 2 * Math.PI
          while (da < -Math.PI) da += 2 * Math.PI
          fr.acc += da / (2 * Math.PI)
        }
        fr.prev = a
      }
      const ev = tr.update(x, z, 1)
      setRimLive((r) => (Math.abs(r.pos - tr.turns()) > 0.04 || Math.abs(r.field - fr.acc) > 0.04 ? { pos: tr.turns(), field: fr.acc } : r))
      if (ev?.event === 'done') {
        // count the arrow's turns the way Gyroid walked, so either direction reads the same
        const turns = Math.round(fr.acc * Math.sign(ev.winding || 1))
        fieldRun.current = { prev: null, acc: 0 }
        setRimLive({ pos: 0, field: 0 })
        if (turns === goal.winding) {
          sfxCorrect()
          setBasinState((b) => ({ ...b, rimWinding: { ...b.rimWinding, [current]: turns } }))
          advanceGoal(current, goal.done)
        } else {
          sfxWrong()
          flash(`One lap — but the arrow turned ${turns} time${Math.abs(turns) === 1 ? '' : 's'}. Walk the whole rim road, staying on it.`, 3600)
          tr.reset()
        }
      }
    },
    [advanceGoal, current, goal, once],
  )

  const onAction = useCallback(
    (gx, gz, cx, cz) => {
      if (phase !== 'play' || !current || !goal) return
      const site = SITE[current]
      if (!site.containsWorld(cx, cz)) return
      const lx = cx - site.pos[0]
      const lz = cz - site.pos[1]

      if (goal.type === 'shrink' && current === 'retractor') {
        flash('Hold the Tide Glass (3) and press X to shrink the rim loop into the disk.')
        sfxRefuse()
        return
      }

      if (goal.type === 'still' && site.field) {
        const f = site.field
        const near = Math.hypot(lx - f.still[0], lz - f.still[1]) < 0.75
        if (near) {
          sfxCorrect()
          setBasinState((b) => ({ ...b, stillFound: { ...b.stillFound, [current]: true } }))
          advanceGoal(current, goal.done)
        } else {
          sfxWrong()
          once('not-still', HINTS.notStill, 'Not the still tile.')
        }
        return
      }

      if (goal.type === 'roots' && site.field?.kind === 'poly') {
        const roots = unitRoots(site.field.degree, 2.15)
        const hit = roots.findIndex((r) => Math.hypot(lx - r.x, lz - r.z) < 0.65)
        if (hit < 0) {
          sfxWrong()
          once('bad-root', HINTS.wrongRoot, 'Not a root.')
          return
        }
        setBasinState((b) => {
          const prev = b.foundRoots[current] || []
          if (prev.includes(hit)) return b
          const next = [...prev, hit]
          sfxCorrect()
          if (next.length >= goal.count) setTimeout(() => advanceGoal(current, goal.done), 0)
          return { ...b, foundRoots: { ...b.foundRoots, [current]: next } }
        })
        return
      }

      if (goal.type === 'pair' && site.stations) {
        const hit = site.stations.find((st) => Math.hypot(lx - st.x, lz - st.z) < 0.75)
        if (!hit) {
          flash(HINTS.tooFar('a station'))
          return
        }
        setBasinState((b) => {
          const { a, b: pb } = b.pairPick
          if (!a) return { ...b, pairPick: { a: hit.id, b: null } }
          if (a === hit.id) return b
          const sa = site.stations.find((s) => s.id === a)
          const [ax, az] = antipode(sa.x, sa.z, site.sphereRadius)
          const antipodal = Math.hypot(hit.x - ax, hit.z - az) < 0.85
          if (antipodal && readingsMatch(sa.readings, hit.readings)) {
            sfxCorrect()
            setTimeout(() => advanceGoal(current, goal.done), 0)
            return { ...b, pairPick: { a, b: hit.id } }
          }
          sfxWrong()
          once('bad-pair', HINTS.wrongPair, 'Not a matching antipodal pair.')
          return { ...b, pairPick: { a: null, b: null } }
        })
      }
    },
    [advanceGoal, current, goal, once, phase],
  )

  const knockout = useCallback(() => {
    setHearts(3)
    setKnockouts((k) => k + 1)
    say(HINTS.knockout)
  }, [say])

  useEffect(() => {
    if (hearts === 0) knockout()
  }, [hearts, knockout])

  const line = lines[lineIdx]
  const talking = phase.startsWith('talk:')
  const advanceRef = useRef(null)
  const advance = useCallback(() => {
    if (shown < (line?.text?.length || 0)) {
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1)
      setShown(0)
      return
    }
    const next = phase.split(':')[1] || 'play'
    setLines([])
    setPhase(next === 'after' ? 'play' : next) // 'after' only means "run afterTalk"; play must resume either way
    if (next === 'after' && afterTalk.current) {
      const fn = afterTalk.current
      afterTalk.current = null
      fn()
    }
  }, [line, lineIdx, lines.length, phase, shown])

  advanceRef.current = advance
  useEffect(() => {
    if (!line) return
    dialogOpen()
    duckMusic(true)
    let i = 0
    setShown(0) // every line types out from the start (a new say() used to inherit the last line's full length)
    const id = setInterval(() => {
      i += 1
      setShown((n) => Math.max(n, i))
      if (i >= line.text.length) clearInterval(id)
      else textBlip()
    }, 1000 / TYPE_CPS)
    return () => {
      clearInterval(id)
      duckMusic(false)
    }
  }, [line, lineIdx])

  // the Tide Glass shrinks the rim loop through the disk; at the centre the Retractor tears
  useEffect(() => {
    if (goal?.type !== 'shrink' || current !== 'retractor' || shrinkT < 1 || phase !== 'play') return
    sfxCorrect()
    setBasinState((b) => ({ ...b, retractorSeized: true }))
    advanceGoal(current, goal.done)
  }, [shrinkT, goal, current, phase, advanceGoal])

  useEffect(() => {
    const onKey = (e) => {
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
      if (tool === 'glass' && goal?.type === 'shrink' && phase === 'play' && here.site === current) {
        if (e.code === 'KeyX') setShrinkT((t) => Math.min(1, +(t + 0.1).toFixed(2)))
        if (e.code === 'KeyZ') setShrinkT((t) => Math.max(0, +(t - 0.1).toFixed(2)))
      }
      if ((e.code === 'Space' || e.code === 'Enter') && talking) {
        e.preventDefault()
        advanceRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goal, here.site, phase, talking, tool])

  const [paused, setPaused] = usePause(levelClear || lesson)
  talkingRef.current = talking
  // ---------- talking to Emmy: she follows Gyroid; press E for advice (out of reach, she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: phase === 'play' && !paused && !levelClear && !lesson,
    advice: () =>
      emmyAdvice14({
        current,
        goal,
        stationId: here.site,
        siteName: (id) => SITE[id]?.name || id,
        enemies: here.site ? enemies[here.site] : 0,
        exitOpen,
        progress: {
          rim: basinState.rimWinding[current],
          roots: (basinState.foundRoots[current] || []).length,
        },
      }),
    say,
  })
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
  // Z / X work the Tide Glass while it shrinks the Retractor's loop, so the camera's Z-turn (and wheel) step aside
  camLockRef.current = tool === 'glass' && goal?.type === 'shrink' && here.site === current
  const gameKey = `basin:${knockouts}`
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [exitOpen])
  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    // a knockout mid-wave brings the wave back too
    if (waveOn && current && SITE[current].wave) for (const [type, x, z] of SITE[current].wave) list.push({ type, x: x + SITE[current].pos[0], z: z + SITE[current].pos[1], site: current })
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkpoint, done, gameKey])

  // overhead only while the puzzle needs the whole deck in view: the shrinking loop, and the arrow
  // fields (finding the still tile and the roots). Walking a rim (the arrow rides over Gyroid's head),
  // the globe at the Antipodes and the drone waves all play in the chase camera, up close.
  const FRAME = { retractor: 12, still_point: 11.6, roots: 11.6 }
  const overhead = ['shrink', 'still', 'roots'].includes(goal?.type)
  frameRef.current =
    overhead && current && here.site === current && met[current] && FRAME[current]
      ? { center: [SITE[current].pos[0] + 1.2, SITE[current].pos[1] - 0.2], size: FRAME[current], follow: 0.1 }
      : null

  if (import.meta.env.DEV) {
    window.__lvl1_4 = {
      warp,
      clear: () => setLevelClear(true),
      proveAll: () => {
        setDone(Object.fromEntries(STATION_ORDER.map((id) => [id, true])))
        setExitOpen(true)
        for (const id of STATION_ORDER) window.__game?.killSite?.(id)
      },
      rewardAt: REWARD_AT,
      done,
      goalIdx,
      current,
      goal,
      basinState,
      phase,
      lines,
      tool,
      shrinkT,
      rimLive,
      setTool,
      setShrinkT,
      onAction: (x, z) => onAction(x, z, x, z),
      advanceGoal,
      SITE,
      hasMatch: () => hasAntipodalMatch(SITE.antipodes.stations, SITE.antipodes.sphereRadius),
    }
  }

  const nDone = STATION_ORDER.filter((id) => done[id]).length
  const objective = warp.objective(current ? `Decks ${nDone}/4 · next: ${SITE[current].name}` : '')
  const atStation = current && here.site === current && met[current]
  const stepText = (() => {
    if (!goal) return ''
    if (goal.type === 'rim') return `Winding Cord (4): walk the rim road once round and watch the pink arrow over you`
    if (goal.type === 'shrink') return 'Tide Glass (3): press X to shrink the rim loop into the disk'
    if (goal.type === 'still') return 'Click the still tile — the one whose arrow shrinks to nothing'
    if (goal.type === 'roots') return `Click each root whirlpool (${(basinState.foundRoots[current] || []).length}/${goal.count})`
    if (goal.type === 'pair') return 'Click a station, then its opposite with matching numbers'
    if (goal.type === 'guard') return 'Lash retractor drones (1) until the wave is clear'
    if (goal.type === 'exit') return 'Walk north through the gate'
    return 'Lash (1) · Winding Cord (4)'
  })()

  return (
    <div className="screen level w1-14-level">
      <Canvas camera={{ position: [0, 11, 30], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        <BasinScene
          layout={layout}
          sites={SITES}
          current={current}
          basinState={basinState}
          emmyRef={emmyRef}
          exitOpen={exitOpen}
          walkable={walkable}
          game={game}
          gameKey={gameKey}
          stateRef={stateRef}
          camYawRef={camYawRef}
          talkingRef={talkingRef}
          lockRef={camLockRef}
          stars={warp.stars}
          portal={warp.portal}
          frameRef={frameRef}
          spawnRef={spawnRef}
          playEnabled={playEnabled}
          tool={tool}
          onAction={onAction}
          onTrackMove={onTrackMove}
          onEnemies={setEnemies}
          onHearts={setHearts}
          shrinkT={goal?.type === 'shrink' ? shrinkT : null}
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
            <button type="button" className="btn ghost" onClick={(e) => (setLesson(true), e.currentTarget.blur())}>
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 1 · Level 4 · Brouwer&apos;s Basin</span>
            <h2>{levelMeta?.title || 'No Way Out'}</h2>
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
            {here.site && SITE[here.site] && (
              <div className="here">
                <strong>{SITE[here.site].name}</strong>
                {done[here.site] ? ' · finished' : enemies[here.site] ? ` · spawn: ${enemies[here.site]}` : ' · clear'}
              </div>
            )}
          </div>
        </div>

        {atStation && (
          <div className="rules-panel forge-panel works-panel w1-14-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            {goal?.type === 'rim' && (
              <p className="cells-line">
                You: <MathText text={`$${fmt(rimLive.pos)}$`} /> laps · the arrow above you: <MathText text={`$${fmt(rimLive.field)}$`} /> turns
              </p>
            )}
            {goal?.type === 'shrink' && (
              <p className="cells-line">
                Shrink: <MathText text={`$t = ${shrinkT.toFixed(1)}$`} /> · the Retractor’s image still winds <MathText text={shrinkT < 1 ? '$+1$' : '$?$'} />
              </p>
            )}
            <p className="forgery-count">
              <MathText text={stepText} />
            </p>
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

        {toast && !line && (
          <div className="toast">
            <MathText text={toast} />
          </div>
        )}

        <TalkPrompt near={nearEmmy} show={phase === 'play' && !line && !levelClear && !paused && !lesson} />

        {!levelClear && !line && <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Brouwer's Basin" face={warp.face} marks={warp.marks} markIcon={NOUN.icon} portal={exitOpen ? { pos: layout.exit.b, open: warp.portalOpen } : null} />}

        {!talking && !levelClear && (
          <div className="controls">
            <div className="weapons" role="group" aria-label="Tool">
              <button type="button" className={`weapon ${tool === 'lash' ? 'active' : ''}`} onClick={() => setTool('lash')}>
                ⚡ Lash <kbd>1</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'glass' ? 'active' : ''}`} onClick={(e) => (setTool('glass'), e.currentTarget.blur())}>
                ◑ Tide Glass <kbd>3</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'cord' ? 'active' : ''}`} onClick={(e) => (setTool('cord'), e.currentTarget.blur())}>
                ◎ Winding Cord <kbd>4</kbd>
              </button>
            </div>
          </div>
        )}
        {playEnabled && !toast && <div className="hint">{atStation ? <MathText text={stepText} /> : 'WASD to move · click or F to crack the Lash (1) · 4 Winding Cord · lost? Emmy has advice (E)'}</div>}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-1-4-lesson"
          Scene={NoWayOutLesson}
          Overlay={NoWayOutLessonOverlay}
          kicker="World 1 · Level 4 · Lesson"
          name="No Way Out"
          embedded
          startMusic={startBasinMusic}
          onDone={() => (setLesson(false), warp.portalOpen ? null : startBasinMusic())}
          onSkip={() => (setLesson(false), warp.portalOpen ? null : startBasinMusic())}
        />
      )}

      {warp.warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'No Way Out'}
          progress={`${NOUN.icon} ${warp.count} of ${warp.total} ${NOUN.many}`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level1-4', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 1 · Level 4 clear"
          title={levelMeta?.title || 'No Way Out'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={DEFINITION}
          onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
          onNext={onNext}
          nextLabel="Continue ▸ Push It Forward"
        />
      )}
    </div>
  )
}
