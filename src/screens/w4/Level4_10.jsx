import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-fibration.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_10'
import FibrationScene, { APTS, LOOP_CANDS, LOOP_Z, ROUNDS, SPHERE, colX, padPos } from '../../levels/w4/FibrationScene'
import FibrationLesson, { FibrationLessonOverlay } from '../../movies/w4/FibrationLesson'
import { startFibrationMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level4_10(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'compass') {
      sfxRefuse()
      return flash('Use the Sheet Compass (6) here.')
    }
    if (current === 'lift') {
      const k = [0, 1, 2, 3].find((k) => near(x, z, padPos(k), 0.75))
      if (k == null) return
      const round = bag.round || 0
      const { w, end } = ROUNDS[round]
      setBag((b) => ({ ...b, start: k }))
      const to = k + w
      if (to < 0 || to > 3) {
        sfxWrong()
        return flash(`From sheet ${k}, the lift runs off the helix.`)
      }
      if (to !== end) {
        sfxWrong()
        return flash(`From sheet ${k} the lift ends on sheet ${to}, not ${end}.`)
      }
      sfxCorrect()
      flash(`Start ${k} → end ${end} ✓`, 2200)
      if (round + 1 < ROUNDS.length) setTimeout(() => setBag((b) => ({ ...b, round: round + 1, start: null })), 1600)
      else solve(current, goal.done, 2000)
      return
    }
    if (current === 'fibre') {
      const id = Object.keys(APTS).find((id) => near(x, z, APTS[id], 0.8))
      if (!id || bag.teth?.[id]) return
      const teth = { ...(bag.teth || {}), [id]: true }
      setBag((b) => ({ ...b, teth }))
      sfxCorrect()
      if (Object.keys(teth).length === 2) solve(current, goal.done, 2000)
      else flash(`$${id}$ tethered: its fibre now runs the whole bar.`, 2200)
      return
    }
    const j = [0, 1, 2].find((j) => near(x, z, [colX(j), LOOP_Z], 0.9))
    if (j == null) return
    const cur = bag.picks?.[j]
    const v = LOOP_CANDS[(LOOP_CANDS.indexOf(cur) + 1) % LOOP_CANDS.length]
    const picks = { ...(bag.picks || {}), [j]: v }
    setBag((b) => ({ ...b, picks }))
    if (SPHERE.every((g, i) => picks[i] === g)) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'lift') {
      const r = ROUNDS[Math.min(bag.round || 0, ROUNDS.length - 1)]
      line = `round ${(bag.round || 0) + 1} / 2 · winding ${r.w} · end on ${r.end}`
    } else if (current === 'fibre') line = `tethered: ${Object.keys(bag.teth || {}).join(', ') || 'none'}`
    else line = `$ΩS²$: ${[0, 1, 2].map((j) => bag.picks?.[j] || '?').join(', ')}`
    return (
      <>
        <h3>{STATIONS[current].blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        <p className="cells-line">
          <MathText text={line} />
        </p>
      </>
    )
  }

  return (
    <LevelShell
      {...props}
      layout={layout}
      stationOrder={STATION_ORDER}
      stations={STATIONS}
      definition={DEFINITION}
      hints={HINTS}
      emmyAdvice={emmyAdvice}
      opening={OPENING}
      Scene={FibrationScene}
      Lesson={FibrationLesson}
      LessonOverlay={FibrationLessonOverlay}
      startMusic={startFibrationMusic}
      kicker="WORLD 4 · LEVEL 10 · FIBRATION STATION"
      levelId="4-10"
      className="level-4-10"
      tools={['lash', 'compass']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-11"
    />
  )
}
