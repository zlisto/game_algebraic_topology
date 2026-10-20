import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-stable-ground.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_8'
import StableGroundScene, { CANDS, NS, STABLE, STEMS, stablePos, tilePos } from '../../levels/w4/StableGroundScene'
import StableGroundLesson, { StableGroundLessonOverlay } from '../../movies/w4/StableGroundLesson'
import { startStableGroundMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level4_8(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    if (tool !== 'sling') {
      sfxRefuse()
      return flash('Use the Suspension Sling (4).')
    }
    if (current === 'settle') {
      let hit = null
      STEMS.forEach((row, k) => row.forEach((_, j) => near(x, z, tilePos(k, j), 0.7) && (hit = [k, j])))
      if (!hit) return
      const [k, j] = hit
      const n = NS[j]
      if (n !== k + 2) {
        sfxWrong()
        return flash(n < k + 2 ? `$n = ${n}$ is too early for stem ${k}: $n + k ≥ 2n − 1$ here.` : `Stable already — but it settled earlier, at $n = ${k + 2}$.`, 2800)
      }
      const marked = { ...(bag.marked || {}), [k]: n }
      setBag((b) => ({ ...b, marked }))
      flash(`Stem ${k} settles at $n = ${n}$: value ${STEMS[k][j]}.`)
      if (STEMS.every((_, q) => marked[q] !== undefined)) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    const k = STEMS.findIndex((_, q) => near(x, z, stablePos(q), 0.8))
    if (k < 0) return
    const vals = { ...(bag.vals || {}) }
    vals[k] = CANDS[(CANDS.indexOf(vals[k]) + 1) % CANDS.length]
    setBag((b) => ({ ...b, vals }))
    if (STABLE.every((v, q) => vals[q] === v)) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const line = current === 'settle' ? `stems marked: ${Object.keys(bag.marked || {}).length} / 4` : `stable values: ${STEMS.map((_, k) => (bag.vals || {})[k] || '?').join(', ')}`
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
      Scene={StableGroundScene}
      Lesson={StableGroundLesson}
      LessonOverlay={StableGroundLessonOverlay}
      startMusic={startStableGroundMusic}
      kicker="WORLD 4 · LEVEL 8 · STABLE GROUND"
      levelId="4-8"
      className="level-4-8"
      tools={['lash', 'sling']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-9"
    />
  )
}
