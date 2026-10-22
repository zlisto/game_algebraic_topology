import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MirrorScene from '../levels/w0/MirrorScene'
import LevelMovie from './LevelMovie'
import { useExitTrigger } from './exitTrigger'
import { MapNext } from './LevelMap'
import { cleanStroke, sampleShape, simulateSlide, snapPoint } from '../levels/w0/retraction'
import { grab, hookedStakes, loopShrunk, makeLoopRibbon, makeSiteEnv, release } from '../levels/w0/ribbon'
import { HINTS, RULES } from '../levels/w0/stages01'
import { DEFINITION03, HINTS03, OPENING, SITES03, SITE_ORDER } from '../levels/w0/stages03'
import layout from '../world/mirrorShoals.json'
import { buildSites, makeSiteWalkable, siteAtIn } from '../world/sites'
import {
  dialogOpen,
  duckMusic,
  readMuted,
  setMuted as setAudioMuted,
  sfxCorrect,
  sfxGrab,
  sfxHook,
  sfxRelease,
  sfxWrong,
  setWarpHum,
  sfxWarpOpen,
  startMirrorMusic,
  startNullMusic,
  stopMusic,
  stopWarpHum,
  switchMusic,
  textBlip,
  unlockAudio,
} from '../audio/chip'
import { stepBack } from './warpLevel'
import { EmmyEndCard, PauseMenu, ViewCone, WarpIcon, usePause } from './LevelChrome'
import MirrorLesson, { MirrorLessonOverlay } from '../movies/MirrorLesson'
import MathText from './MathText'

/**
 * World 0 · Level 3 "Same Shape, Different Look" — Mirror Shoals.
 *
 *   Solid Shoal  — a loop on a reef with no holes shrinks to its post; a one-point
 *                  spine slides the whole reef onto a point: contractible
 *   Ring Reef    — its loop catches on the hole (proving it can't shrink waits for World 1)
 *   Twin Mirror  — one two-hole reef slides onto a figure-eight AND onto a theta: the
 *                  two are homotopy equivalent (both deformation retracts of one space)
 *   Dumbbell     — Null's ring spine leaks (a hole without a loop); a barbell works
 *   Mirror Gate  — any valid spine on an odd two-hole reef; the gate lights figure-eight,
 *                  theta, barbell — the ring stays dark — and opens onto the Foundry
 *
 * Mirror spawn come with intangible reflections across their reef's mirror line.
 */

const SLIDE_SECONDS = 2.6
const REGROW_SECONDS = 1.6
const TYPE_CPS = 45
const SITES = buildSites(layout)
const SITE = Object.fromEntries(SITES.map((s) => [s.id, s]))
const siteAt = siteAtIn(SITES)
/** Where Gyroid stands on a reef (its center may be a hole: then by the loop's post). */
const spawnOf = (s) => (s.loop ? s.toWorld(...s.loop.post) : s.pos)
const REACH = 2.6 // how far from Gyroid a clicked stake can be grabbed
const PORTRAIT_CROP = {
  gyroid: ['400%', '63%', '9%'],
  'count-null': ['600%', '50%', '26%'],
  'emmy-boundary': ['400%', '54%', '5%'],
  commutator: ['500%', '53%', '19%'],
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

/** Minimap: reefs (gold once proven), causeways, the channel, Gyroid. */
function ShoalsMap({ pos, face = 0, done, current, next, gateOpen, rewards = {}, portalOpen }) {
  const P = ([x, z]) => [50 + x * 2.25, 30 + z * 1.8]
  const [gx, gz] = P(pos)
  const [c0] = P([layout.channel.x0, 0])
  const [c1] = P([layout.channel.x1, 0])
  return (
    <svg className="minimap big" viewBox="0 0 100 60" aria-label="Mirror Shoals map">
      <rect width="100" height="60" rx="3" fill="#0b1626" />
      <rect x={c0} y="0" width={c1 - c0} height="60" fill="#9fd8ff" opacity="0.08" />
      {layout.causeways.map((c, i) => {
        const [x1, y1] = P(c.a)
        const [x2, y2] = P(c.b)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5c6680" strokeWidth="1.1" />
      })}
      {SITES.map((s) => {
        const [x, y] = P(s.pos)
        return <circle key={s.id} cx={x} cy={y} r={s.id === current ? 3.6 : 3} fill={done[s.id] ? '#ffb347' : s.kind === 'start' ? '#3ecfbf' : 'transparent'} stroke={s.id === current ? '#fff' : '#ffb347'} strokeWidth="0.7" />
      })}
      {(() => {
        const [x, y] = P(layout.gate.pos)
        return <rect x={x - 2.5} y={y - 1.5} width="5" height="3" fill="#ff8a3a" opacity="0.7" />
      })()}
      {SITE_ORDER.filter((id) => done[id] && !rewards[id]).map((id) => {
        const [x, y] = P(rewardPos(id))
        return (
          <g key={id}>
            <circle cx={x} cy={y} r="2.6" fill="none" stroke="#cfe8ff" strokeWidth="0.7" className="map-pulse" />
            <text x={x} y={y + 1.8} fontSize="5" textAnchor="middle" fill="#cfe8ff">
              ◐
            </text>
          </g>
        )
      })}
      {(() => {
        const [x, y] = P(layout.gate.exit.b)
        return gateOpen ? <WarpIcon x={x} y={y} open={portalOpen} /> : null
      })()}
      <ViewCone x={gx} y={gz} face={face} id="shoalscone" />
      {(() => {
        const waiting = SITE_ORDER.filter((id) => done[id] && !rewards[id]).map((id) => rewardPos(id))
        const nearest = waiting.sort((a, b) => Math.hypot(a[0] - pos[0], a[1] - pos[1]) - Math.hypot(b[0] - pos[0], b[1] - pos[1]))[0]
        const to = next ? P(SITE[next].pos) : gateOpen ? (portalOpen || !nearest ? P(layout.gate.exit.b) : P(nearest)) : null
        return <MapNext from={[gx, gz]} to={to} label={next ? 'NEXT' : portalOpen ? 'EXIT' : 'LENS'} />
      })()}
      <circle cx={gx} cy={gz} r="1.6" fill="#3ecfbf" stroke="#fff" strokeWidth="0.5" />
    </svg>
  )
}

/** Each reef proven leaves a Mirror Lens on solid ground; all five open the Warp Portal past the Mirror Gate. */
function landNear(s, [x, z]) {
  if (s.containsWorld(x, z)) return [x, z]
  for (let r = 0.4; r < 6; r += 0.4)
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2
      const p = [x + Math.cos(a) * r, z + Math.sin(a) * r]
      // well inside the land, not on its rim
      if ([0, 1, 2, 3].every((j) => s.containsWorld(p[0] + Math.cos(j * 1.57) * 0.6, p[1] + Math.sin(j * 1.57) * 0.6))) return p
    }
  return s.pos
}
const REWARD_AT = Object.fromEntries(SITE_ORDER.map((id) => [id, landNear(SITE[id], SITE[id].loop ? SITE[id].toWorld(SITE[id].loop.post[0] + 1.2, SITE[id].loop.post[1]) : [SITE[id].pos[0] + 1.6, SITE[id].pos[1] + 1.2])]))
const rewardPos = (id) => REWARD_AT[id]
const END_CARD = {
  learned:
    'Two reefs can look nothing alike and still be the same shape. Twin Mirror slid onto a figure-eight and onto a theta, so there are maps both ways between them, and each round trip deforms back to standing still. That’s a homotopy equivalence. Solid Shoal went all the way down to a point: contractible. Ring Reef wouldn’t, though I still can’t prove it never will.',
  ahead:
    'The Skeleton Foundry, my old workshop. Instead of shrinking spaces down to spines, we’ll build them up: points first, then edges, then disks glued along their rims. Cell by cell. And Null knows that forge as well as I do.',
}

export default function Level03({ concept, onBackToTitle, onNext, onGo, startAt }) {
  const levelMeta = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-3')
  const samplesBySite = useMemo(() => Object.fromEntries(SITES.map((s) => [s.id, sampleShape(s.shape)])), [])
  const skipTo = Math.max(0, SITE_ORDER.indexOf(startAt))

  // loop ribbons (site-local), stepped by the scene
  const loopsRef = useRef(null)
  const freshLoops = () => ({ ribbons: Object.fromEntries(SITES.filter((s) => s.loop).map((s) => [s.id, { r: makeLoopRibbon(s.loop), env: makeSiteEnv(s.def), site: s }])) })
  if (!loopsRef.current) {
    loopsRef.current = freshLoops()
    for (const id of SITE_ORDER.slice(0, Math.max(0, SITE_ORDER.indexOf(startAt)))) {
      const e = loopsRef.current.ribbons[id]
      if (!e) continue
      while (e.r.pins.length > 2) e.r.pins.splice(1, 1) && e.r.spans.splice(0, 2, [...e.r.spans[0], ...e.r.spans[1].slice(1)])
    }
  }

  const [done, setDone] = useState(() => Object.fromEntries(SITE_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [loopDone, setLoopDone] = useState(() => Object.fromEntries(SITE_ORDER.slice(0, skipTo).map((id) => [id, true])))
  const [spineIdx, setSpineIdx] = useState({})
  const [strokesBySite, setStrokesBySite] = useState({})
  const [liveStroke, setLiveStroke] = useState(null)
  const drawing = useRef(null)
  const [sim, setSim] = useState(null)
  const [simSite, setSimSite] = useState(null)
  const [t, setT] = useState(0)
  const tRef = useRef(0)
  const [running, setRunning] = useState(0)
  const [enemies, setEnemies] = useState({})
  const [hearts, setHearts] = useState(3)
  const [knockouts, setKnockouts] = useState(0)
  const [checkpoint, setCheckpoint] = useState(() => (skipTo ? spawnOf(SITE[SITE_ORDER[skipTo]]) : layout.start))
  const [tool, setTool] = useState('lash')
  const [spooling, setSpooling] = useState(false)
  const [lines, setLines] = useState([])
  const [lineIdx, setLineIdx] = useState(0)
  const [phase, setPhase] = useState('play')
  const [shown, setShown] = useState(0)
  const shownNow = useRef(0) // the typed count right now (a skip jumps it to the end)
  shownNow.current = shown
  const [met, setMet] = useState({})
  const [hooked, setHooked] = useState({})
  const [gateLit, setGateLit] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [levelClear, setLevelClear] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const [lesson, setLesson] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const flash = useCallback((text, ms = 2400) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }, [])
  const [here, setHere] = useState({ site: null, pos: checkpoint, face: 0 })
  const stateRef = useRef(null)
  // chase camera: it starts behind Gyroid, looking up the causeway toward Solid Shoal
  const camYawRef = useRef(Math.atan2(layout.start[0] - SITE.solid_shoal.pos[0], layout.start[1] - SITE.solid_shoal.pos[1]))
  const talkingRef = useRef(false)
  const [rewards, setRewards] = useState({}) // site id → Mirror Lens collected
  const rewardsRef = useRef(rewards)
  rewardsRef.current = rewards
  const doneRef = useRef(done)
  doneRef.current = done
  const [warping, setWarping] = useState(false)
  const [nullScene, setNullScene] = useState(false) // Null's theme from his arrival at the Dumbbell until it's proven
  const frameRef = useRef(null)
  const spawnRef = useRef(null)
  const grabbing = useRef(null)
  const judged = useRef(null)
  const reported = useRef(false)
  const afterRegrow = useRef(null)

  const current = SITE_ORDER.find((id) => !done[id]) || null
  const setTime = useCallback((v) => {
    tRef.current = v
    setT(v)
  }, [])
  const say = useCallback((ls, next = 'play') => {
    setLines(ls)
    setLineIdx(0)
    setPhase(ls.length ? 'talk:' + next : next)
  }, [])

  useEffect(() => {
    unlockAudio()
    startMirrorMusic()
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
  const wasBoss = useRef(false)
  useEffect(() => {
    if (nullScene === wasBoss.current) return
    wasBoss.current = nullScene
    switchMusic(nullScene ? startNullMusic : startMirrorMusic)
  }, [nullScene])

  // first bite, first Elixir: taught as they happen, in a toast that doesn't stop play
  const taught = useRef({})
  useEffect(() => {
    if (hearts < 3 && !taught.current.hearts) {
      taught.current.hearts = true
      flash('♥ Mirror spawn bite like the rest. Lose all three hearts and you wake at the last reef you proved.', 4200)
    }
  }, [hearts, flash])
  useEffect(() => {
    const on = () => {
      if (taught.current.elixir) return
      taught.current.elixir = true
      flash('A Klein Elixir dropped. Walk through it when you’re hurt: every heart back.', 4200)
    }
    window.addEventListener('elixir-drop', on)
    return () => window.removeEventListener('elixir-drop', on)
  }, [flash])

  // where is Gyroid; which stakes still hold the loops
  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const at = siteAt(s.x, s.z)?.id || null
      setHere((h) => (h.site === at && Math.abs(h.pos[0] - s.x) < 0.05 && Math.abs(h.pos[1] - s.z) < 0.05 && Math.abs(h.face - s.face) < 0.05 ? h : { site: at, pos: [s.x, s.z], face: s.face || 0 }))
      // walk into a Mirror Lens, or lash it, to collect it
      for (const id of SITE_ORDER) {
        if (!doneRef.current[id] || rewardsRef.current[id]) continue
        const [px, pz] = rewardPos(id)
        const d = Math.hypot(s.x - px, s.z - pz)
        let off = Math.atan2(px - s.x, pz - s.z) - (s.face || 0)
        off = Math.atan2(Math.sin(off), Math.cos(off))
        if (d < 1.3 || (s.whip > 0.4 && d < 2.1 && Math.abs(off) < 0.7)) {
          const got = Object.keys(rewardsRef.current).length + 1
          rewardsRef.current = { ...rewardsRef.current, [id]: true }
          setRewards(rewardsRef.current)
          sfxCorrect()
          flash(got < SITE_ORDER.length ? `◐ Mirror Lens: ${got} of ${SITE_ORDER.length}` : `◐ All ${SITE_ORDER.length} Mirror Lenses! The Warp Portal is open.`)
        }
      }
      const L = loopsRef.current.ribbons
      const hk = Object.fromEntries(Object.keys(L).map((k) => [k, hookedStakes(L[k].r)]))
      setHooked((old) => (JSON.stringify(old) === JSON.stringify(hk) ? old : hk))
    }, 150)
    return () => clearInterval(id)
  }, [])
  const site = here.site ? SITE[here.site] : null
  const working = site && site.id === current && met[site.id]

  // arriving at a reef
  useEffect(() => {
    if (!site || phase !== 'play' || done[site.id]) return
    if (site.id !== current) {
      if (!met['early:' + site.id]) {
        setMet((m) => ({ ...m, ['early:' + site.id]: true }))
        say(SITES03[site.id].early)
      }
      return
    }
    if (met[site.id]) return
    setMet((m) => ({ ...m, [site.id]: true }))
    const extra = site.enemies?.some(([type]) => type === 'mirror') && !met.mirrorHint ? [HINTS03.mirror] : []
    if (extra.length) setMet((m) => ({ ...m, mirrorHint: true }))
    if (site.id === 'dumbbell') setNullScene(true)
    say([...SITES03[site.id].arrive, ...extra])
  }, [site, phase, current, met, done, say])

  // knocked out → back to the last proven reef
  useEffect(() => {
    if (hearts > 0) return
    setHearts(3)
    setKnockouts((k) => k + 1)
    if (grabbing.current) release(loopsRef.current.ribbons[grabbing.current].r, [])
    grabbing.current = null
    say([HINTS03.knockout])
  }, [hearts, say])

  // a loop let go of all its stakes: shrinks (solid ground) or catches (a hole)
  useEffect(() => {
    const id = setInterval(() => {
      if (phase !== 'play') return
      for (const sid of ['solid_shoal', 'ring_reef']) {
        if (loopDone[sid] || sid !== current) continue
        const { r } = loopsRef.current.ribbons[sid]
        const free = !r.pins.some((p) => p.kind === 'stake' || p.kind === 'grab')
        if (!free) continue
        if (sid === 'solid_shoal' && loopShrunk(r)) {
          setLoopDone((d) => ({ ...d, [sid]: true }))
          sfxCorrect()
          say(SITES03.solid_shoal.loopDone)
        }
        if (sid === 'ring_reef') {
          setLoopDone((d) => ({ ...d, [sid]: true }))
          setDone((d) => ({ ...d, ring_reef: true }))
          setCheckpoint(spawnOf(SITE.ring_reef))
          sfxWrong()
          say(SITES03.ring_reef.done)
        }
      }
    }, 400)
    return () => clearInterval(id)
  }, [phase, loopDone, current, say])

  // slide / regrow animation
  useEffect(() => {
    if (!running) return
    let raf
    const t0 = performance.now()
    const from = tRef.current
    const tick = () => {
      const el = (performance.now() - t0) / 1000
      if (running > 0) {
        const v = Math.min(1, from + el / SLIDE_SECONDS)
        setTime(v)
        if (v >= 1) return setRunning(0)
      } else {
        const v = Math.max(0, from - el / REGROW_SECONDS)
        setTime(v)
        if (v <= 0) {
          setRunning(0)
          setSim(null)
          setSimSite(null)
          afterRegrow.current?.()
          afterRegrow.current = null
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, setTime])

  const spinesOf = (id) => SITE[id].spines || []
  const spineOf = (id) => spinesOf(id)[spineIdx[id] || 0]

  // verdict at the end of a slide
  useEffect(() => {
    if (t < 1 || !sim || running || phase !== 'play' || judged.current === sim) return
    judged.current = sim
    const id = simSite
    const k = spineIdx[id] || 0
    const spec = spinesOf(id)[k]
    const words = SITES03[id]
    const nextSpine = () => {
      setSpineIdx((m) => ({ ...m, [id]: k + 1 }))
      setStrokesBySite((m) => ({ ...m, [id]: [] }))
    }
    if (spec?.doomed) {
      // Null's ring spine on the dumbbell: it can only leak. Keep the ring: the fix adds to it
      sfxWrong()
      afterRegrow.current = () => setSpineIdx((m) => ({ ...m, [id]: k + 1 }))
      return say(words.doomed, 'regrow')
    }
    if (!sim.valid) {
      sfxWrong()
      const key = !(strokesBySite[id] || []).length ? 'empty' : sim.problem || (!sim.beaconHit.every(Boolean) ? 'beacons' : null)
      return say([HINTS[key] || HINTS.leak], 'back')
    }
    sfxCorrect()
    if (k + 1 < spinesOf(id).length) {
      afterRegrow.current = nextSpine
      return say(words.spines?.[k] || [], 'regrow')
    }
    // the reef's last spine: proven
    setDone((d) => ({ ...d, [id]: true }))
    if (id === 'dumbbell') setNullScene(false)
    setCheckpoint(spawnOf(SITE[id]))
    if (id === 'mirror_gate') {
      setGateLit(true)
      afterRegrow.current = () => {
        setGateOpen(true) // the mirror lifts; the Warp Portal waits at the end of the causeway beyond
        setPhase('clear')
      }
      return say(words.done, 'regrow')
    }
    // the reef grows back from its spine, proven (gold-tinted)
    say(id === 'solid_shoal' ? words.done : words.spines?.[k] || words.done || [], 'regrow')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, sim, running, phase, simSite])

  // ---------- Spool: loops (grab / let go) or spine thread
  const invalidate = () => {
    setSim(null)
    setSimSite(null)
    setTime(0)
  }
  const loopMode = (s) => s && s.loop && !loopDone[s.id] && s.id === current
  const onStrokeStart = (x, z, cx = x, cz = z) => {
    const s = siteAt(x, z)
    if (!s || s.id !== current || done[s.id] || phase !== 'play') return false
    if (loopMode(s)) {
      const { r } = loopsRef.current.ribbons[s.id]
      if (!grabbing.current) release(r, []) // never leave a loop held with nobody holding it
      // grab where Gyroid stands — or the stake / ribbon the player clicked, if it's within reach
      const [lx, lz] = s.toLocal(x, z)
      const [mx, mz] = s.toLocal(cx, cz)
      const nearClick = Math.hypot(mx - lx, mz - lz) <= REACH
      // on a loop island the job is unhooking stakes: the one under Gyroid, else the one clicked
      const g = grab(r, lx, lz, 0.95, { stakesOnly: true }) || (nearClick && grab(r, mx, mz, 1.1, { stakesOnly: true }))
      if (!g) {
        flash('Get Gyroid closer to a × stake, then click it with the Spool')
        return false
      }
      grabbing.current = s.id
      sfxGrab()
      return true
    }
    if (!s.spines) return false
    const [lx, lz] = s.toLocal(x, z)
    drawing.current = { site: s.id, pts: [snapPoint(strokesBySite[s.id] || [], lx, lz)] }
    setLiveStroke(drawing.current.pts)
    if (simSite === s.id) invalidate()
    return true
  }
  const commit = (cx, cz) => {
    if (grabbing.current) {
      const id = grabbing.current
      grabbing.current = null
      const { r, site: ls } = loopsRef.current.ribbons[id]
      const res = release(r, [])
      if (res === 'hook') sfxHook()
      else sfxRelease()
      // letting go while standing on another pinned stake unhooks that one too, in the same click
      const s = stateRef.current
      if (s && r.pins.some((p) => p.kind === 'stake')) {
        const [lx, lz] = ls.toLocal(s.x, s.z)
        const [mx, mz] = cx === undefined ? [lx, lz] : ls.toLocal(cx, cz)
        const reach = Math.hypot(mx - lx, mz - lz) <= REACH
        if (grab(r, lx, lz, 0.95, { stakesOnly: true }) === 'unhook' || (reach && grab(r, mx, mz, 1.1, { stakesOnly: true }) === 'unhook')) {
          grabbing.current = id
          s.spooling = true
          setSpooling(true)
          sfxGrab()
        }
      }
      return
    }
    const d = drawing.current
    drawing.current = null
    setLiveStroke(null)
    if (!d || !d.pts.length) return
    const prev = strokesBySite[d.site] || []
    const s = d.pts
    const end = snapPoint(prev, s[s.length - 1][0], s[s.length - 1][1])
    const closes = s.length > 8 && Math.hypot(end[0] - s[0][0], end[1] - s[0][1]) < 0.4
    const pts = [...s.slice(0, -1), closes ? s[0] : end]
    setStrokesBySite((m) => ({ ...m, [d.site]: [...prev, pts.length > 1 ? cleanStroke(pts) : pts] }))
  }
  const onStrokeMove = (x, z) => {
    const d = drawing.current
    if (!d) return
    const s = SITE[d.site]
    if (!s.containsWorld(x, z)) return commit()
    const [lx, lz] = s.toLocal(x, z)
    const last = d.pts[d.pts.length - 1]
    if (Math.hypot(lx - last[0], lz - last[1]) < 0.06) return
    d.pts = [...d.pts, [lx, lz]]
    setLiveStroke(d.pts)
  }

  const siteClear = (id) => !enemies[id]
  const drawSite = !!site && site.id === current && !!site.spines && !loopMode(site) && !done[site.id]
  const canSlideHere = drawSite && siteClear(site.id) && (strokesBySite[site.id] || []).length > 0
  const slide = () => {
    if (!canSlideHere) return
    const sp = spineOf(site.id)
    const result = simulateSlide(site.shape, samplesBySite[site.id], strokesBySite[site.id], sp?.beacons || [])
    setSim(result)
    setSimSite(site.id)
    setTime(0)
    setRunning(1)
  }
  const undo = () => site && (setStrokesBySite((m) => ({ ...m, [site.id]: (m[site.id] || []).slice(0, -1) })), simSite === site.id && invalidate())
  const clearSite = () => site && (setStrokesBySite((m) => ({ ...m, [site.id]: [] })), simSite === site.id && invalidate())
  const resetLoop = () => {
    if (!site?.loop) return
    loopsRef.current.ribbons[site.id] = { r: makeLoopRibbon(site.loop), env: makeSiteEnv(site.def), site }
    grabbing.current = null
    if (stateRef.current) stateRef.current.spoolDropped = true
  }

  // weapons
  useEffect(() => {
    const key = (e) => {
      if (e.code === 'Digit1') setTool('lash')
      else if (e.code === 'Digit2') setTool('spool')
      else if (e.code === 'KeyQ') setTool((w) => (w === 'lash' ? 'spool' : 'lash'))
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  // ---------- dialogue
  const advance = () => {
    const full = lines[lineIdx]?.text.length ?? 0
    if (shown < full) return setShown(full)
    if (lineIdx + 1 < lines.length) return setLineIdx(lineIdx + 1)
    const next = phase.split(':')[1]
    if (next === 'regrow') {
      setPhase('play')
      setRunning(-1)
    } else if (next === 'back') {
      setPhase('play')
      invalidate()
    } else if (next === 'keep') {
      setPhase('play')
    } else if (next === 'clear') {
      setGateOpen(true)
      setPhase('clear')
    } else setPhase(next)
  }
  const talking = phase.startsWith('talk:')
  const line = talking ? lines[lineIdx] : null
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
      // never type backwards over a line the player already finished with a click
      setShown((n) => {
        if (n >= line.text.length) {
          clearInterval(id)
          return n
        }
        return Math.max(n, i)
      })
      // skipped ahead (Enter, Space, ▶▶)? the line is done: stop typing, and stop the blips
      if (shownNow.current >= line.text.length) return clearInterval(id)
      const ch = line.text[i - 1]
      if (ch && ch !== ' ' && i % 2 === 0) textBlip(line.speaker)
      if (i >= line.text.length) clearInterval(id)
    }, 1000 / TYPE_CPS)
    return () => clearInterval(id)
  }, [line])

  // Final Fantasy VII-style: Space / Enter finish the line, then move to the next box
  const advanceRef = useRef(null)
  advanceRef.current = line ? advance : null
  useEffect(() => {
    const onKey = (e) => {
      if (!advanceRef.current || (e.code !== 'Space' && e.code !== 'Enter')) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return
      e.preventDefault()
      advanceRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---------- game layer
  const [paused, setPaused] = usePause(levelClear || lesson)
  talkingRef.current = talking
  const rewardCount = Object.keys(rewards).length
  const portalOpen = gateOpen && rewardCount === SITE_ORDER.length
  const playEnabled = (phase === 'play' || phase === 'clear') && !running && !lesson && t === 0 && !paused && !warping
  const spoolEnabled = playEnabled && phase === 'play' && !!site && site.id === current && (loopMode(site) || drawSite)
  const gameKey = `shoals:${knockouts}`
  const walkable = useMemo(() => makeSiteWalkable(layout, SITES, gateOpen ? [[layout.gate.exit.a, layout.gate.exit.b]] : []), [gateOpen])
  const game = useMemo(() => {
    const list = []
    for (const s of SITES) {
      if (!s.enemies || done[s.id]) continue
      for (const [type, x, z] of s.enemies) list.push({ type, x: x + s.pos[0], z: z + s.pos[1], site: s.id, axis: s.pos[0] })
    }
    return { mode: 'overworld', bySite: true, start: checkpoint, enemies: list }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey])
  const simWorld = useMemo(() => {
    if (!sim || !simSite) return null
    const s = SITE[simSite]
    return { endpointAt: (x, z) => (s.containsWorld(x, z) ? s.toWorld(...(sim.endpointAt(...s.toLocal(x, z)) || s.toLocal(x, z))) : [x, z]) }
  }, [sim, simSite])
  frameRef.current = working && !done[site.id] ? { center: site.pos, size: 9.5 } : null

  if (import.meta.env.DEV) window.__lvl3 = { here, done, loopDone, spineIdx, phase, strokesBySite, sim, enemies, setTool, loops: loopsRef.current, setStrokes: setStrokesBySite, grabbing, rewards, rewardAt: REWARD_AT, clear: () => setLevelClear(true), proveAll: () => (setDone(Object.fromEntries(SITE_ORDER.map((id) => [id, true]))), setGateLit(true), setGateOpen(true), setPhase('clear')) } // dev

  const scene = (
    <MirrorScene
      layout={layout}
      sites={SITES}
      samplesBySite={samplesBySite}
      strokesBySite={strokesBySite}
      liveStroke={liveStroke}
      drawingSite={drawing.current?.site}
      activeSite={simSite}
      sim={sim}
      simWorld={simWorld}
      tRef={tRef}
      saved={done}
      spineIdx={spineIdx}
      loopsRef={loopsRef}
      hooked={hooked}
      gateLit={gateLit}
      gateOpen={gateOpen}
      walkable={walkable}
      game={game}
      gameKey={gameKey}
      stateRef={stateRef}
      frameRef={frameRef}
      spawnRef={spawnRef}
      playEnabled={playEnabled}
      spoolEnabled={spoolEnabled}
      tool={tool}
      onStrokeStart={onStrokeStart}
      onStrokeMove={onStrokeMove}
      onStrokeEnd={commit}
      onEnemies={(by) => ((reported.current = true), setEnemies(by))}
      onHearts={setHearts}
      onSpooling={setSpooling}
      camYawRef={camYawRef}
      talkingRef={talkingRef}
      nullAt={nullScene ? SITE.dumbbell.toWorld(3.4, -1.6) : null}
      rewards={SITE_ORDER.filter((id) => done[id]).map((id) => ({ id, kind: 'lens', pos: rewardPos(id), state: rewards[id] ? 'taken' : 'waiting' }))}
      portal={gateOpen ? { pos: layout.gate.exit.b, facing: Math.atan2(layout.gate.exit.b[0] - layout.gate.exit.a[0], layout.gate.exit.b[1] - layout.gate.exit.a[1]), open: portalOpen, need: SITE_ORDER.length - rewardCount, warping } : null}
    />
  )

  const proven = SITE_ORDER.filter((id) => done[id]).length
  const objective = portalOpen
    ? `◐ ${rewardCount}/5 · Warp Portal open: through the Mirror Gate and into it`
    : done.mirror_gate
      ? gateOpen
        ? `◐ ${rewardCount}/5 · Collect every Mirror Lens to open the Warp Portal`
        : 'The gate is judging…'
      : `◐ ${rewardCount}/5 · reefs proven ${proven}/5 · next: ${SITE[current]?.name}`
  // the Warp Portal at the end of the causeway past the gate
  const nearPortal = (x, z) => Math.hypot(x - layout.gate.exit.b[0], z - layout.gate.exit.b[1]) < 1.5
  useExitTrigger(portalOpen && !warping, stateRef, nearPortal, () => {
    setWarping(true)
    setTimeout(() => setLevelClear(true), 1100)
  })
  // the portal opens: a fanfare, the music falls silent, and the portal's hum takes over
  const opened = useRef(false)
  useEffect(() => {
    if (!portalOpen || opened.current) return
    opened.current = true
    sfxWarpOpen()
    stopMusic()
  }, [portalOpen])
  useEffect(() => {
    if (!portalOpen) return
    const d = Math.hypot(here.pos[0] - layout.gate.exit.b[0], here.pos[1] - layout.gate.exit.b[1])
    setWarpHum(Math.max(0.08, 1 - d / 16))
  }, [portalOpen, here.pos])
  useEffect(() => () => stopWarpHum(), [])
  const lockedHint = useRef(false)
  useEffect(() => {
    if (!gateOpen || portalOpen) return
    const near = nearPortal(...here.pos)
    if (near && !lockedHint.current) flash(`The portal is sealed: it needs all 5 Mirror Lenses (${rewardCount} so far).`)
    lockedHint.current = near
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here.pos, gateOpen, portalOpen])
  const spawnHere = site ? enemies[site.id] || 0 : 0
  const sp = site && site.spines ? spineOf(site.id) : null
  const ruleState = (id) => (!sim || simSite !== here.site || t < 1 ? 'idle' : sim.rules[id] ? 'ok' : 'bad')
  const beaconsOk = sim && simSite === here.site && t >= 1 ? sim.beaconHit.every(Boolean) : null
  const showRules = drawSite && !line

  return (
    <div className="screen level">
      <Canvas camera={{ position: [0, 11, 22], fov: 45 }} dpr={[1, 1.5]} frameloop={lesson ? 'never' : 'always'}>
        {scene}
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
            <button type="button" className="btn ghost" onClick={(e) => (setLesson(true), e.currentTarget.blur())} title="Watch the lesson: homotopy equivalence">
              ? How it works
            </button>
          </div>
          <div className="lvl-title">
            <span className="lvl-kicker">World 0 · Level 3 · Mirror Shoals</span>
            <h2>{levelMeta?.title || 'Same Shape, Different Look'}</h2>
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
            {site && (
              <div className="here">
                <strong>{site.name}</strong>
                {done[site.id] ? ' · proven' : spawnHere ? ` · Null’s spawn: ${spawnHere}` : ' · clear'}
              </div>
            )}
          </div>
        </div>

        {!line && !showRules && <ShoalsMap pos={here.pos} face={here.face} done={done} current={here.site} next={current} gateOpen={gateOpen} rewards={rewards} portalOpen={portalOpen} />}

        {showRules && (
          <div className="rules-panel">
            <h3>
              {sp?.name && sp.name !== 'any' ? `Spine: ${sp.name}` : site.id === 'solid_shoal' ? 'Spine: a single point' : 'Spine: anything that works'} · deformation retraction
            </h3>
            <ul>
              {RULES.map((r) => {
                const st = ruleState(r.id)
                return (
                  <li key={r.id} className={`rule ${st}`}>
                    <span className="rule-mark">{st === 'ok' ? '✓' : st === 'bad' ? '✗' : '·'}</span>
                    <span className="rule-label">{r.label}</span>
                    <span className="rule-math">{r.math}</span>
                  </li>
                )
              })}
              {sp?.beacons?.length > 0 && (
                <li className={`rule goal ${beaconsOk === null ? 'idle' : beaconsOk ? 'ok' : 'bad'}`}>
                  <span className="rule-mark">{beaconsOk === null ? '·' : beaconsOk ? '✓' : '✗'}</span>
                  <span className="rule-label">Spine through every beacon</span>
                </li>
              )}
            </ul>
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

        {!talking && !levelClear && (
          <div className="controls">
            <div className="weapons" role="group" aria-label="Weapon">
              <button type="button" className={`weapon ${tool === 'lash' ? 'active' : ''}`} onClick={(e) => (setTool('lash'), e.currentTarget.blur())}>
                ⚡ Lash <kbd>1</kbd>
              </button>
              <button type="button" className={`weapon ${tool === 'spool' ? 'active' : ''} ${spooling ? 'threading' : ''}`} onClick={(e) => (setTool('spool'), e.currentTarget.blur())}>
                ◯ Spool <kbd>2</kbd>
              </button>
            </div>
            {drawSite && (
              <>
                <button type="button" className="btn ghost" onClick={undo} disabled={!(strokesBySite[site.id] || []).length || !!running}>
                  Undo
                </button>
                <button type="button" className="btn ghost" onClick={clearSite} disabled={!(strokesBySite[site.id] || []).length || !!running}>
                  Clear
                </button>
                <button type="button" className="btn primary" onClick={slide} disabled={!canSlideHere || !!running || (!!sim && t > 0)} title={!siteClear(site.id) ? 'Clear Null’s spawn first' : ''}>
                  Slide ▶
                </button>
              </>
            )}
            {site && loopMode(site) && (
              <button type="button" className="btn ghost" onClick={(e) => (resetLoop(), e.currentTarget.blur())}>
                ↺ Reset loop
              </button>
            )}
          </div>
        )}
        {playEnabled && phase === 'play' && (
          <div className="hint">
            {spooling
              ? grabbing.current
                ? 'Holding the loop · click to let go — or click on the next × stake to unhook it too'
                : 'Threading… walk to lay spine · click to stop'
              : tool === 'spool'
                ? site && site.id === current && !done[site.id] && !siteClear(site.id) && !loopMode(site)
                  ? 'Clear the spawn first: press 1 for the Lash'
                  : site && loopMode(site)
                  ? 'Walk onto a pinned stake (×) and click to grab the loop there'
                  : drawSite
                    ? site.id === 'solid_shoal'
                      ? 'Stand on the beacon · click, then click again: a one-point spine'
                      : 'Click to start the thread · walk it through the beacons · click to stop'
                    : site && site.id === current && !siteClear(site.id)
                      ? 'Clear the spawn first: press 1 for the Lash'
                      : 'The Spool works on the reef you’re proving'
                : drawSite && !siteClear(site.id)
                  ? 'Clear the spawn first — lash the solid ones, not the reflections'
                  : 'WASD to move · Z / C or right-drag to turn the camera · click to crack the Lash · 2 for the Spool · Esc to pause'}
          </div>
        )}
      </div>

      {lesson && (
        <LevelMovie
          videoId="level-0-3-lesson"
          Scene={MirrorLesson}
          Overlay={MirrorLessonOverlay}
          kicker="World 0 · Level 3 · Lesson"
          name="Same Shape"
          embedded
          onDone={() => (setLesson(false), portalOpen ? null : switchMusic(nullScene ? startNullMusic : startMirrorMusic))}
          onSkip={() => (setLesson(false), portalOpen ? null : switchMusic(nullScene ? startNullMusic : startMirrorMusic))}
        />
      )}

      {warping && !levelClear && <div className="warp-flash" />}
      {paused && (
        <PauseMenu
          title={levelMeta?.title || 'Same Shape, Different Look'}
          progress={`◐ ${rewardCount} of 5 Mirror Lenses · ${proven} of 5 reefs proven`}
          onResume={() => setPaused(false)}
          onRestart={() => onGo?.('level3', { restart: Date.now() })}
          onTitle={onBackToTitle}
        />
      )}
      {levelClear && (
        <EmmyEndCard
          kicker="World 0 · Level 3 clear"
          title={levelMeta?.title || 'Same Shape, Different Look'}
          learned={END_CARD.learned}
          ahead={END_CARD.ahead}
          definition={DEFINITION03}
          onStay={() => (setLevelClear(false), setWarping(false), stepBack(stateRef, layout.gate.exit.b, layout.gate.exit.a))}
          onNext={onNext}
          nextLabel="On to the Skeleton Foundry ▸"
        />
      )}
    </div>
  )
}
