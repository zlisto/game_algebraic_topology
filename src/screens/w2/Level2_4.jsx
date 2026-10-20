import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/chaseChannels.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice, groupName, nextCandidate, rowExact } from '../../levels/w2/stages2_4'
import ChaseChannelsScene, { ROW_Z, ROWS, exactness, lockX, rowKs } from '../../levels/w2/ChaseChannelsScene'
import ChaseSceneLesson, { ChaseSceneLessonOverlay } from '../../movies/w2/ChaseSceneLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

export default function Level2_4(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4 || Math.abs(z - ROW_Z) > 1.7) return
    const row = ROWS[current]
    if (tool !== 'blade') {
      sfxRefuse()
      return flash('Sluices and locks are worked with the Boundary Blade (7).')
    }
    // nearest lock or sluice along the row
    let best = null
    let bd = 9
    row.locks.forEach((_, j) => {
      const d = Math.abs(x - lockX(row, j))
      if (d < bd) [best, bd] = [{ lock: j }, d]
    })
    row.maps.forEach((_, i) => {
      const d = Math.abs(x - (lockX(row, i) + lockX(row, i + 1)) / 2)
      if (d < bd) [best, bd] = [{ map: i }, d]
    })
    if (!best) return
    if (best.lock !== undefined) {
      if (row.locks[best.lock] !== '?') return flash('That lock’s group is fixed. Work the sluices — or the unknown lock.')
      const g = nextCandidate(bag.pick?.[current] || '?')
      setBag((b) => ({ ...b, pick: { ...b.pick, [current]: g } }))
      if (g === row.answer) {
        sfxCorrect()
        flash(`$${groupName(g)}$ — the row is exact.`, 2800)
        solve(current, goal.done, 1800)
      } else flash(`$${groupName(g)}$ doesn’t make the row exact.`)
      return
    }
    const m = row.maps[best.map]
    if (!m.set) return flash(m.zero ? 'A sluice to or from $0$ only carries $0$.' : 'That sluice is fixed.')
    const ks = rowKs(current, bag)
    const k = m.set[(m.set.indexOf(ks[best.map]) + 1) % m.set.length]
    const nextKs = ks.map((v, i) => (i === best.map ? k : v))
    setBag((b) => ({ ...b, ks: { ...b.ks, [current]: nextKs } }))
    const nb = { ...bag, ks: { ...bag.ks, [current]: nextKs } }
    if (rowExact(current, nb)) {
      sfxCorrect()
      flash('Every inner lock is exact.', 2600)
      solve(current, goal.done, 1800)
    } else if (current === 'exact') sfxWrong()
  }

  const renderRules = ({ current, goal, bag }) => {
    const row = ROWS[current]
    let line = ''
    if (!row.answer) {
      const info = exactness(row.locks, rowKs(current, bag))
      line = `exact locks: ${info.filter((x) => x?.exact).length} / ${info.filter(Boolean).length}`
    } else line = `unknown lock: ${bag.pick?.[current] ? groupName(bag.pick[current]) : '?'}`
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
      Scene={ChaseChannelsScene}
      Lesson={ChaseSceneLesson}
      LessonOverlay={ChaseSceneLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 4 · CHASE SCENE"
      levelId="2-4"
      className="level-2-4"
      tools={['lash', 'blade']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-5"
    />
  )
}
