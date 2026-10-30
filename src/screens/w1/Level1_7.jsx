import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GlueScene from '../../levels/w1/GlueScene'
import LevelMovie from '../LevelMovie'
import LevelMap from '../LevelMap'
import { HUB_RADIUS, LETTERS, identify, letterText, makeTrack, makeTracker, parseWord as parseCellWord, sameWord } from '../../levels/w0/cells'
import {
  attachDisk,
  emptyPresentation,
  isTrivial,
  parseWord,
  presentationLabel,
  sameClass,
  vanKampenMerge,
  wordText,
} from '../../levels/w1/glue.js'
import { DEFINITION17, HINTS17, OPENING, STATIONS, STATION_ORDER, emmyAdvice17 } from '../../levels/w1/stages1_7'
import layout from '../../world/glueWorks.json'
import { buildSites, makeSiteWalkable } from '../../world/sites'
import { WORLD_TOOLS } from '../../levels/w0/worldTools'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxAnvil,
  sfxCorrect,
  sfxFold,
  sfxForgeEdge,
  sfxHammer,
  sfxLetter,
  sfxPress,
  sfxRefuse,
  sfxRip,
  sfxWrong,
  sfxZoot,
  sfxExit,
  startGlueWorksMusic,
  stopMusic,
  textBlip,
  unlockAudio,
} from '../../audio/chip'
import GlueJobLesson, { GlueJobLessonOverlay } from '../../movies/w1/GlueJobLesson'
import MathText from '../MathText'
import useDialogKeys from '../useDialogKeys'
import { EmmyEndCard, PauseMenu, TalkPrompt, useEmmyTalk, usePause } from '../LevelChrome'
import { landNear, useWarpLevel } from '../warpLevel'

const TYPE_CPS = 45
const FOLD_SECONDS = 2.6
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
const trackHub = (site) => site.pos
const TRACKS = Object.fromEntries(SITES.filter((s) => s.tracks).map((s) => [s.id, s.tracks.map((t) => makeTrack(t, trackHub(s)))]))
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  commutator: ['500%', '53%', '19%'],
}
const emptyComplex = () => ({ point: false, edges: [], disks: [] })
const stationAt = (x, z) => SITES.find((s) => s.stage === 'station' && s.containsWorld(x, z)) || null
const TOOL_KEYS = { Digit1: 'lash', Digit2: 'smith', Digit5: 'clasp', KeyQ: 'cycle' }
/** where each press's reward waits once it's done: on its outer ring, as far as it can get from the causeway mouths, the tracks and Emmy's spot */
const MOUTHS = [...layout.causeways.flatMap((c) => [c.a, c.b]), layout.exit.a]
const REWARD_AT = Object.fromEntries(
  SITES.filter((s) => s.stage === 'station').map((s) => {
    const petals = (TRACKS[s.id] || []).flatMap((t) => [0.3, 0.5, 0.7].map((u) => t.at(u)))
    const avoid = [...MOUTHS, ...petals, s.emmy && [s.pos[0] + s.emmy[0], s.pos[1] + s.emmy[1]]].filter((p) => p && Math.hypot(p[0] - s.pos[0], p[1] - s.pos[1]) < 9)
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
const NOUN = { icon: '⊕', one: 'Glue Ring', many: 'Glue Rings', kind: 'gluerings' }
const END_CARD = {
  learned: 'Gluing a disk along a loop makes that loop’s word a relation: it slides across the disk to nothing. A disk on $a$ killed the loop outright; a disk on $a b a⁻¹ b⁻¹$ forced $a b = b a$ and built the torus, $ℤ × ℤ$; a disk on $a a$ built the projective plane, where $a$ survives but $a a$ doesn’t, so the group is $ℤ₂$. And when two pieces overlap, van Kampen says: take both groups, then make each overlap loop’s two names equal.',
  ahead: 'Next, Sheetwater Viaduct: covering spaces. Sheets stacked over a base, and every loop below lifts to a path up above that may end on a different sheet. Those lifts will finally show us why $a b ≠ b a$ on the figure eight.',
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

function presFromComplex(c) {
  let p = emptyPresentation(c.edges.length)
  for (const d of c.disks) p = attachDisk(p, d)
  return p
}

export default function Level1_7({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[1]?.levels?.find((l) => l.id === '1-7')
  const skipTo = Math.max(0, STATION_ORDER.indexOf(startAt))

  const [done, setDone] = useState(() => Object.fromEntries(STATION_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [goalIdx, setGoalIdx] = useState({})
  const [complexes, setComplexes] = useState(() => Object.fromEntries(STATION_ORDER.map((id) => [id, emptyComplex()])))
  const [vkMerged, setVkMerged] = useState(false)
  const [word, setWord] = useState([])
  const [walkDemo, setWalkDemo] = useState(null)
  const [holograms, setHolograms] = useState({})
  const holoKRef = useMemo(() => Object.fromEntries(STATION_ORDER.map((id) => [id, { current: 0 }])), [])
  const slamRefs = useMemo(() => Object.fromEntries(STATION_ORDER.map((id) => [id, { current: 0 }])), [])
  const progressRef = useRef(null)
  const trackers = useRef(Object.fromEntries(STATION_ORDER.map((id) => [id, makeTracker(TRACKS[id], trackHub(SITE[id]))])))
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
  const [tool, setTool] = useState('smith')
  const [waveOn, setWaveOn] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [lesson, setLesson] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [toast, setToast] = useState(null)
  const [here, setHere] = useState({ site: null, pos: checkpoint })
  const [seen, setSeen] = useState({})
  const stateRef = useRef(null)
  // chase camera: it starts behind Gyroid, looking up the level from the landing
  const camYawRef = useRef(Math.atan2(layout.start[0] - layout.exit.a[0], layout.start[1] - layout.exit.a[1]))
  const talkingRef = useRef(false)
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const ribbonApi = useRef(null)
  const toastTimer = useRef(null)
  const afterTalk = useRef(null)
  const emmyRef = useRef(null) // Emmy follows Gyroid; her live position, for 'press E to talk'

  const current = STATION_ORDER.find((id) => !done[id]) || null
  const goals = current ? STATIONS[current].goals : []
  const gi = current ? goalIdx[current] || 0 : 0
  const goal = goals[gi] || null
  const cx = current ? complexes[current] : emptyComplex()
  const presentation = useMemo(() => {
    if (current === 'two_pieces' && vkMerged) return vanKampenMerge(emptyPresentation(1), emptyPresentation(2), parseWord('a'), parseWord('b'))
    if (current) return presFromComplex(complexes[current])
    return null
  }, [current, complexes, vkMerged])

  const flash = (text, ms = 2600) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }
  const say = useCallback((raw, next = 'play') => {
    const ls = Array.isArray(raw) ? raw : raw ? [raw] : [] // a single line object is fine too
    setLines(ls)
    setLineIdx(0)
    if (ls.length) return setPhase('talk:' + next)
    setPhase('play') // nothing to say: straight back to play (and run whatever was waiting on the talk)
    const fn = afterTalk.current
    afterTalk.current = null
    fn?.()
  }, [])

  useEffect(() => {
    unlockAudio()
    startGlueWorksMusic()
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
    (station, lines = []) => {
      const list = STATIONS[station].goals
      const g = list[goalIdx[station] || 0]
      // a goal's own wave, or the deck's wave once (when its first goal is done) — not on every step
      if (g?.wave || (STATIONS[station].wave && !(goalIdx[station] || 0))) {
        const wave = SITE[station].wave
        if (wave) {
          setWaveOn(true)
          spawnRef.current?.(wave.map(([type, x, z]) => ({ type, x: x + SITE[station].pos[0], z: z + SITE[station].pos[1], site: station })))
        }
      }
      const next = (goalIdx[station] || 0) + 1
      if (next >= list.length) {
        setDone((d) => ({ ...d, [station]: true }))
        setCheckpoint([SITE[station].pos[0] + 1.2, SITE[station].pos[1] + 3.2])
        if (station === 'two_pieces') {
          afterTalk.current = () => {
            sfxZoot()
            setExitOpen(true)
          }
          return say(lines, 'after')
        }
        return say(lines)
      }
      const ng = list[next]
      setGoalIdx((m) => ({ ...m, [station]: next }))
      if (ng.type === 'ask') {
        afterTalk.current = () => setAskOpen(true)
        return say(lines, 'after')
      }
      if (ng.type === 'order') {
        afterTalk.current = () => setOrderOpen(true)
        return say(lines, 'after')
      }
      if (ng.type === 'trivial') setWalkDemo(null) // walk the word afresh for this check
      say(ng.start ? [...lines, ...ng.start] : lines)
    },
    [goalIdx, say],
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

  useEffect(() => {
    if (goal?.type === 'ask' && phase === 'play' && !askOpen && here.site === current && met[current]) setAskOpen(true)
    if (goal?.type === 'order' && phase === 'play' && !orderOpen && here.site === current && met[current]) setOrderOpen(true)
  }, [goal, phase, askOpen, orderOpen, here.site, current, met])

  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    say([HINTS17.knockout])
  }, [hearts, say])

  const working = !!current && here.site === current && met[current] && phase === 'play' && !askOpen && !orderOpen
  const stateForTick = useRef({})
  stateForTick.current = { working, tool, current, goal, cx }

  useEffect(() => {
    const id = setInterval(() => {
      const { working: w, tool: tl, current: cur, goal: g, cx: c } = stateForTick.current
      const s = stateRef.current
      if (!s || !cur) return
      const tr = trackers.current[cur]
      if (!w || tl !== 'smith') {
        tr.reset()
        progressRef.current = null
        return
      }
      const ev = tr.update(s.x, s.z)
      const curT = tr.current()
      progressRef.current = curT ? { track: curT.track, dir: curT.dir, best: tr.progress() } : null
      if (!ev) return
      if (ev.event === 'abandon') return flash('Go all the way round the track and back to the furnace')
      if (ev.event !== 'done') return
      const edge = c.edges.find((e) => e.track === ev.track)
      if (edge?.torn) {
        setComplexes((m) => ({ ...m, [cur]: { ...m[cur], edges: m[cur].edges.map((e) => (e.track === ev.track ? { ...e, torn: false, dir: ev.dir } : e)) } }))
        sfxForgeEdge()
        return flash(`Edge ${LETTERS[edge.letter]} re-forged`)
      }
      if (g?.type === 'edges') {
        if (edge) return flash(`Edge ${LETTERS[edge.letter]} already forged — walk the other track`)
        if (!c.point) return flash('Forge the point first')
        const letter = c.edges.length
        const edges = [...c.edges, { track: ev.track, dir: ev.dir, letter, torn: false }]
        setComplexes((m) => ({ ...m, [cur]: { ...m[cur], edges } }))
        sfxForgeEdge()
        if (edges.length >= g.n) advanceGoal(cur, g.done)
        return
      }
      if (g?.type === 'disk' && edge) {
        const l = { e: edge.letter, s: ev.dir * edge.dir }
        setWord((w0) => [...w0, l])
        sfxLetter(l.e, l.s)
      }
      if (g?.type === 'trivial' || g?.type === 'commute') {
        const l = edge ? { e: edge.letter, s: ev.dir * edge.dir } : null
        if (l) setWalkDemo((w0) => [...(w0 || []), l])
      }
    }, 40)
    return () => clearInterval(id)
  }, [advanceGoal])

  useEffect(() => {
    if (goal?.type !== 'trivial' || !walkDemo?.length) return
    const p = presFromComplex(complexes[current])
    if (isTrivial(p, walkDemo)) {
      setWalkDemo(null)
      sfxCorrect()
      advanceGoal(current, goal.done)
    }
  }, [walkDemo, goal, complexes, current, advanceGoal])

  useEffect(() => {
    if (goal?.type !== 'commute' || current !== 'torus_press') return
    const p = presFromComplex(complexes.torus_press)
    if (sameClass(p, parseWord('a b'), parseWord('b a'))) {
      sfxCorrect()
      advanceGoal(current, goal.done)
    }
  }, [goal, current, complexes, advanceGoal])

  const foldHologram = (station, kind, w) => {
    setHolograms((h) => ({ ...h, [station]: { kind, word: w } }))
    const k = holoKRef[station]
    k.current = 0
    slamRefs[station].current = 1
    const t0 = performance.now()
    const tick = () => {
      const u = (performance.now() - t0) / 1000
      slamRefs[station].current = Math.max(0, 1 - u * 2.2)
      k.current = Math.min(1, Math.max(0, (u - 0.35) / FOLD_SECONDS))
      if (u < FOLD_SECONDS + 0.4) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setTimeout(() => sfxFold(), 380)
  }

  const onAction = (x, z) => {
    if (!working || !goal) return
    const hub = trackHub(SITE[current])
    const onHub = Math.hypot(x - hub[0], z - hub[1]) < HUB_RADIUS + 0.25
    if (tool === 'clasp') {
      if (goal.type !== 'clasp' || current !== 'two_pieces') return flash('Use the Cell Hammer on the furnace; Clasp is for the overlap.')
      const clasp = SITE.two_pieces.overlap.map((v, i) => v + SITE.two_pieces.pos[i])
      if (Math.hypot(x - clasp[0], z - clasp[1]) > 1.2) return flash('Walk to the amber clasp in the middle')
      if (complexes.two_pieces.edges.length < 2) return flash('Forge both loops first')
      sfxHammer()
      setVkMerged(true)
      sfxCorrect()
      return advanceGoal(current, goal.done)
    }
    if (tool !== 'smith') return flash('Cell Hammer (2) for the press · Clasp (5) on the overlap')
    if (goal.type === 'point') {
      if (!onHub) return flash('Stand on the furnace, then click')
      setComplexes((m) => ({ ...m, [current]: { ...m[current], point: true } }))
      sfxAnvil()
      return advanceGoal(current, goal.done)
    }
    if (goal.type === 'edges') return flash(onHub ? 'Walk a track out and back' : 'Walk the track, back to the furnace')
    if (goal.type !== 'disk') return
    if (!onHub) return flash('Return to the furnace to press')
    if (enemies[current]) return say([HINTS17.spawn])
    const target = parseCellWord(goal.word)
    const trial = { ...cx, disks: [...cx.disks, word] }
    const kind = identify(trial)
    sfxPress()
    foldHologram(current, kind, word)
    const ok = (goal.word === '' ? word.length === 0 : sameWord(word, target)) && kind === goal.expect
    if (ok) {
      setComplexes((m) => ({ ...m, [current]: trial }))
      setWord([])
      sfxCorrect()
      setTimeout(() => advanceGoal(current, goal.done), 1400)
      return
    }
    sfxWrong()
    setWord([])
    say([{ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: `You walked ${wordText(word) || 'nothing'}, but the blueprint wants ${goal.word || 'rim → point'}. Walk it again.` }], 'play')
  }

  ribbonApi.current = {
    target: (e) => {
      const c = complexes[e.site]
      if (!c?.disks?.length && e.type !== 'unglue') return null
      if (e.type === 'patrol') {
        const pw = SITE[e.site]?.patrolWord
        const p = presFromComplex(c)
        if (pw && isTrivial(p, parseWord(pw))) return [SITE[e.site].pos[0], SITE[e.site].pos[1]]
      }
      const live = c.edges.filter((ed) => !ed.torn)
      if (!live.length) return null
      const ed = live[0]
      return TRACKS[e.site][ed.track].at(0.5)
    },
    snip: (x, z) => {
      for (const id of STATION_ORDER) {
        for (const ed of complexes[id].edges) {
          if (ed.torn) continue
          const m = TRACKS[id][ed.track].nearest(x, z)
          if (m.d < 0.8) {
            setComplexes((m) => ({ ...m, [id]: { ...m[id], edges: m[id].edges.map((q) => (q.track === ed.track ? { ...q, torn: true } : q)), disks: [] } }))
            setVkMerged(false)
            sfxRip()
            flash('Unglue tore the disk — re-walk the word and press again')
            return true
          }
        }
      }
      return false
    },
  }

  useEffect(() => {
    if (waveOn && !enemies.two_pieces) setWaveOn(false)
  }, [waveOn, enemies])

  // no overhead here (as in the Foundry, 0-4): the chase camera stays down behind Gyroid while he
  // forges, and the hologram of each pressed space floats just in front of him, seen up close
  frameRef.current = null

  const [paused, setPaused] = usePause(levelClear || lesson)
  talkingRef.current = phase.startsWith('talk:') || lines.length > 0
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
  const gameKey = `glue:${knockouts}`
  const playEnabled = (phase === 'play' || phase === 'clear') && !lesson && !askOpen && !orderOpen && !levelClear && !paused && !warp.warping
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, exitOpen ? [[layout.exit.a, layout.exit.b]] : []), [exitOpen])
  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id })
    }
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
  }, [gameKey, done, checkpoint])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!import.meta.env.DEV) return
    window.__lvl17 = {
      warp,
      clear: () => setLevelClear(true),
      proveAll: () => {
        setDone(Object.fromEntries(STATION_ORDER.map((id) => [id, true])))
        setExitOpen(true)
        for (const id of STATION_ORDER) window.__game?.killSite?.(id)
      },
      rewardAt: REWARD_AT,
      state: () => ({ done, goal, current, presentation: presentation && presentationLabel(presentation) }),
      click: (x, z) => onAction(x, z),
    }
  })

  const line = lines[lineIdx]
  const advance = () => {
    if (!line) return
    if (shown < line.text.length) {
      shownNow.current = line.text.length
      setShown(line.text.length)
      return
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx(lineIdx + 1)
      setShown(0)
      dialogOpen()
      return
    }
    setLines([])
    const next = phase.split(':')[1] || 'play'
    // 'after' / 'ask' / 'order' only say what opens next (the effects below open the panel): the player is back in play
    setPhase(['after', 'ask', 'order'].includes(next) ? 'play' : next)
    const fn = afterTalk.current
    afterTalk.current = null
    fn?.()
  }
  useDialogKeys(!!line, advance)
  // ---------- talking to Emmy: she follows Gyroid; press E for advice (out of reach, she hurries over)
  const nearEmmy = useEmmyTalk({
    stateRef,
    emmyRef,
    enabled: phase === 'play' && !line && !askOpen && !orderOpen && !paused && !levelClear && !lesson,
    advice: () => emmyAdvice17({ current, done, goal, here: here.site, site: SITE[current], pres: presentation, wordWalk: wordText(word), enemies: current ? enemies[current] : 0, waveOn, exitOpen }),
    say,
  })
  useEffect(() => {
    if (!line) return
    duckMusic(true)
    dialogOpen()
    setShown(0)
    shownNow.current = 0
    let i = 0
    const id = setInterval(() => {
      i++
      setShown((n) => Math.max(n, i))
      if (shownNow.current >= line.text.length) return clearInterval(id)
      if (line.text[i - 1] && line.text[i - 1] !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => {
      clearInterval(id)
      duckMusic(false)
    }
  }, [line])

  useEffect(() => {
    const onKey = (e) => {
      if (TOOL_KEYS[e.code] === 'cycle') {
        setTool((t) => (t === 'lash' ? 'smith' : t === 'smith' ? 'clasp' : 'lash'))
        return
      }
      if (TOOL_KEYS[e.code]) setTool(TOOL_KEYS[e.code])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scene = (
    <GlueScene
      layout={layout}
      sites={SITES}
      walkable={walkable}
      game={game}
      gameKey={gameKey}
      frameRef={frameRef}
      stateRef={stateRef}
      camYawRef={camYawRef}
      talkingRef={talkingRef}
      stars={warp.stars}
      portal={warp.portal}
      spawnRef={spawnRef}
      emmyRef={emmyRef}
      ribbonApi={ribbonApi}
      playEnabled={playEnabled}
      tool={tool}
      onAction={onAction}
      onEnemies={setEnemies}
      onHearts={setHearts}
      complexes={complexes}
      tracks={TRACKS}
      progressRef={progressRef}
      slamRefs={slamRefs}
      holoKRef={holoKRef}
      holograms={holograms}
      current={current}
      done={done}
      presentation={presentation}
      claspReady={goal?.type === 'clasp'}
      exitOpen={exitOpen}
    />
  )

  const nDone = STATION_ORDER.filter((id) => done[id]).length
  const stepText = (() => {
    if (!goal) return ''
    if (goal.type === 'point') return 'Cell Hammer (2): stand on the furnace and click to forge the point'
    if (goal.type === 'edges') return `Walk each track out and back to the furnace (${cx.edges.length}/${goal.n} edges)`
    if (goal.type === 'disk') return `Walked: ${word.length ? wordText(word) : '—'} · target ${goal.word ? wordText(parseCellWord(goal.word)) : 'the rim'} · click the furnace to press`
    if (goal.type === 'trivial') return `Walk $${goal.word === 'a' ? 'a' : 'a b a⁻¹ b⁻¹'}$ again — it slides to nothing`
    if (goal.type === 'commute') return 'Walk a b and b a — same class now'
    if (goal.type === 'order') return 'Answer Emmy'
    if (goal.type === 'clasp') return 'Clasp (5): click the amber clasp in the middle'
    if (goal.type === 'ask') return 'Answer Emmy'
    return ''
  })()
  const objective = warp.objective(current ? `Presses ${nDone}/4 · ${STATIONS[current].blueprint}` : '')

  return (
    <div className="screen level level-1-7">
      <Canvas camera={{ position: [0, 11, 26], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        {scene}
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
            <span className="lvl-kicker">World 1 · Level 7 · Glue Works</span>
            <h2>{levelMeta?.title || 'Glue Job'}</h2>
            <div className="hud">
              <span className="hearts">{[0, 1, 2].map((i) => (<span key={i} className={i < hearts ? 'heart' : 'heart lost'}>♥</span>))}</span>
              <span className="objective">{objective}</span>
            </div>
            {here.site && (
              <div className="here">
                <strong>{SITE[here.site]?.name || here.site}</strong>
                {enemies[here.site] ? ` · spawn: ${enemies[here.site]}` : ''}
              </div>
            )}
          </div>
        </div>

        {current && met[current] && !askOpen && !orderOpen && (
          <aside className="rules-panel forge-panel glue-panel">
            <h3>{STATIONS[current].blueprint}</h3>
            {presentation && <p className="rule-math">π₁: {presentationLabel(presentation)}</p>}
            <p className="forge-step"><MathText text={stepText} /></p>
          </aside>
        )}

        {!askOpen && !orderOpen && !line && !levelClear && (
          <LevelMap layout={layout} sites={SITES} done={done} next={current || (exitOpen ? 'exit' : null)} pos={here.pos} title="Glue Works" face={warp.face} marks={warp.marks} markIcon={NOUN.icon} portal={exitOpen ? { pos: layout.exit.b, open: warp.portalOpen } : null} />
        )}

        {toast && !line && <div className="toast"><MathText text={toast} /></div>}
        <TalkPrompt near={nearEmmy} show={phase === 'play' && !line && !askOpen && !orderOpen && !levelClear && !paused && !lesson} />
        {!line && !askOpen && !orderOpen && !levelClear && (
          <div className="controls">
            <div className="weapons">
              {['lash', 'smith', 'clasp'].map((t) => (
                <button key={t} type="button" className={`weapon ${tool === t ? 'active' : ''}`} onClick={(e) => (setTool(t), e.currentTarget.blur())}>
                  {WORLD_TOOLS[t].label} <kbd>{WORLD_TOOLS[t].key}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
        {playEnabled && !toast && !line && (
          <div className="hint">
            {current && here.site === current && met[current] ? (tool === 'smith' || tool === 'clasp' ? <MathText text={stepText} /> : 'Press 2 for the Cell Hammer') : 'WASD to move · click or F to crack the Lash (1) · 2 Cell Hammer · 5 Clasp · lost? Emmy has advice (E)'}
          </div>
        )}

        {line && (
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

        {askOpen && !line && goal?.type === 'ask' && (
          <div className="dialog verdict" style={{ cursor: 'default' }}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>
                <MathText text={goal.question} />
              </p>
            </div>
            <div className="btn-row" style={{ flexDirection: 'column' }}>
              {goal.choices.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  className="btn small"
                  onClick={() => {
                    setAskOpen(false)
                    if (i === goal.answer) {
                      sfxCorrect()
                      advanceGoal(current, goal.right)
                    } else {
                      sfxWrong()
                      say(goal.wrong, 'ask')
                    }
                  }}
                >
                  <MathText text={c} />
                </button>
              ))}
            </div>
          </div>
        )}

        {orderOpen && !line && goal?.type === 'order' && (
          <div className="dialog verdict" style={{ cursor: 'default' }}>
            <Portrait id="emmy-boundary" name="Emmy Boundary" />
            <div className="dialog-body">
              <span className="speaker">Emmy Boundary</span>
              <p>
                <MathText text={'Which word is trivial in $⟨ a | a² ⟩$?'} />
              </p>
            </div>
            <div className="btn-row" style={{ flexDirection: 'column' }}>
              {['a', 'aa'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className="btn small"
                  onClick={() => {
                    setOrderOpen(false)
                    if (c === goal.answer) {
                      sfxCorrect()
                      advanceGoal(current, goal.right)
                    } else {
                      sfxWrong()
                      say(goal.wrong, 'order')
                    }
                  }}
                >
                  <MathText text={`$${c}$`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-1-7-lesson"
          Scene={GlueJobLesson}
          Overlay={GlueJobLessonOverlay}
          kicker="World 1 · Level 7 · Lesson"
          name="Glue and Van Kampen"
          startMusic={startGlueWorksMusic}
          embedded
          onDone={() => (setLesson(false), warp.portalOpen ? null : startGlueWorksMusic())}
          onSkip={() => (setLesson(false), warp.portalOpen ? null : startGlueWorksMusic())}
        />
      )}

      {warp.warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'Glue Job'}
          progress={`${NOUN.icon} ${warp.count} of ${warp.total} ${NOUN.many}`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level1-7', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 1 · Level 7 clear"
          title={levelMeta?.title || 'Glue Job'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={{ ...DEFINITION17, url: DEFINITION17.link }}
          onStay={() => (setLevelClear(false), warp.stay(layout.exit.a))}
          onNext={onNext}
          nextLabel="Continue ▸"
        />
      )}
    </div>
  )
}
