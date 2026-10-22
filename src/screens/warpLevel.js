import { useEffect, useRef, useState } from 'react'
import { setWarpHum, sfxCorrect, sfxWarpOpen, stopWarpHum } from '../audio/chip'
import { useExitTrigger } from './exitTrigger'

/**
 * The open-overworld rules every World 0 level shares, in one hook:
 *  - each solved puzzle leaves a reward (walk into it, or lash it, to collect it);
 *  - the Warp Portal at the level's exit stays sealed until every reward is in hand;
 *    when it opens: a fanfare, the level music stops, and its hum grows as Gyroid nears;
 *  - stepping into the open portal warps out (a white flash), then `onClear`;
 *  - the first bite and the first Klein Elixir are each taught once, in a toast.
 *
 * ids: the puzzles, in order · done: { id: true } · posOf(id) → [x, z] of its reward
 * exitOpen: the level's way out is open (all puzzles done) · portalAt: [x, z]
 * noun: { icon, one, many } e.g. { icon: '▣', one: 'Blueprint Tile', many: 'Blueprint Tiles' }
 */
export function useWarpLevel({ ids, done, posOf, stateRef, exitOpen, portalAt, hearts, flash, stopMusic, onClear, noun }) {
  const [rewards, setRewards] = useState({})
  const rewardsRef = useRef(rewards)
  rewardsRef.current = rewards
  const doneRef = useRef(done)
  doneRef.current = done
  const [face, setFace] = useState(0)
  const [warping, setWarping] = useState(false)
  const count = Object.keys(rewards).length
  const total = ids.length
  const portalOpen = !!exitOpen && count === total
  const openRef = useRef(portalOpen)
  openRef.current = portalOpen
  const flashRef = useRef(flash)
  flashRef.current = flash

  // pick-ups, facing (for the minimap cone), the portal's hum
  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      setFace((f) => (Math.abs(f - (s.face || 0)) < 0.05 ? f : s.face || 0))
      for (const rid of ids) {
        if (!doneRef.current[rid] || rewardsRef.current[rid]) continue
        const [px, pz] = posOf(rid)
        const d = Math.hypot(s.x - px, s.z - pz)
        let off = Math.atan2(px - s.x, pz - s.z) - (s.face || 0)
        off = Math.atan2(Math.sin(off), Math.cos(off))
        if (d < 1.3 || (s.whip > 0.4 && d < 2.1 && Math.abs(off) < 0.7)) {
          const got = Object.keys(rewardsRef.current).length + 1
          rewardsRef.current = { ...rewardsRef.current, [rid]: true }
          setRewards(rewardsRef.current)
          sfxCorrect()
          flashRef.current(got < total ? `${noun.icon} ${noun.one}: ${got} of ${total}` : `${noun.icon} All ${total} ${noun.many}! The Warp Portal is open.`)
        }
      }
      if (openRef.current) setWarpHum(Math.max(0.08, 1 - Math.hypot(s.x - portalAt[0], s.z - portalAt[1]) / 16))
    }, 150)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => stopWarpHum(), [])

  // the portal opens
  const opened = useRef(false)
  useEffect(() => {
    if (!portalOpen || opened.current) return
    opened.current = true
    sfxWarpOpen()
    stopMusic?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalOpen])

  // into the open portal: warp out; walking up to it sealed explains why
  const near = (x, z) => Math.hypot(x - portalAt[0], z - portalAt[1]) < 1.5
  useExitTrigger(portalOpen && !warping, stateRef, near, () => {
    setWarping(true)
    setTimeout(() => onClear(), 1100)
  })
  const sealedHint = !!exitOpen && !portalOpen
  useEffect(() => {
    if (!sealedHint) return
    let was = false
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const now = near(s.x, s.z)
      if (now && !was) flashRef.current(`The portal is sealed: it needs all ${total} ${noun.many} (${Object.keys(rewardsRef.current).length} so far).`, 3200)
      was = now
    }, 150)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sealedHint])

  // the first bite, the first Elixir
  const taught = useRef({})
  useEffect(() => {
    if (hearts < 3 && !taught.current.hearts) {
      taught.current.hearts = true
      flashRef.current('♥ Every bite costs a heart. Lose all three and you wake at the last station you finished.', 4200)
    }
  }, [hearts])
  useEffect(() => {
    const on = () => {
      if (taught.current.elixir) return
      taught.current.elixir = true
      flashRef.current('A Klein Elixir dropped. Walk through it when you’re hurt: every heart back.', 4200)
    }
    window.addEventListener('elixir-drop', on)
    return () => window.removeEventListener('elixir-drop', on)
  }, [])

  /** Keep exploring: the warp is undone and Gyroid stands a few steps back from the portal */
  const stay = (from) => {
    setWarping(false)
    stepBack(stateRef, portalAt, from)
  }
  const objective = (rest) => `${noun.icon} ${count}/${total} · ${portalOpen ? 'Warp Portal open: walk into it' : exitOpen ? `collect every ${noun.one} to open the Warp Portal` : rest}`
  return {
    stay,
    rewards,
    count,
    total,
    portalOpen,
    warping,
    face,
    objective,
    /** props for <OverworldKit>: the rewards waiting in the world, and the portal */
    stars: ids.filter((rid) => done[rid]).map((rid) => ({ id: rid, kind: noun.kind, pos: posOf(rid), state: rewards[rid] ? 'taken' : 'waiting' })),
    portal: exitOpen ? { pos: portalAt, open: portalOpen, need: total - count, warping } : null,
    /** for the minimap */
    marks: ids.filter((rid) => done[rid] && !rewards[rid]).map((rid) => posOf(rid)),
  }
}

/** A clear spot on a site near `from` (the site's own land, away from its rim) for a reward to wait. */
export function landNear(site, from) {
  const ok = (x, z) => [0, 1, 2, 3].every((j) => site.containsWorld(x + Math.cos(j * 1.571) * 0.6, z + Math.sin(j * 1.571) * 0.6))
  if (ok(...from)) return from
  for (let r = 0.4; r < 6; r += 0.4)
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2
      const p = [from[0] + Math.cos(a) * r, from[1] + Math.sin(a) * r]
      if (ok(...p)) return p
    }
  return site.pos
}

/** "Keep exploring" after a warp: Gyroid steps back out of the portal, toward `from`, so he can walk again. */
export function stepBack(stateRef, portalAt, from, d = 3) {
  const s = stateRef.current
  if (!s) return
  const dx = from[0] - portalAt[0]
  const dz = from[1] - portalAt[1]
  const l = Math.hypot(dx, dz) || 1
  s.x = portalAt[0] + (dx / l) * d
  s.z = portalAt[1] + (dz / l) * d
}
