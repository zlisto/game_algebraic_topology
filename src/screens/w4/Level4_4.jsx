import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-suspension.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_4'
import SuspensionScene, { BOARD, DIAL, SHAFTS, SLING, boardPos } from '../../levels/w4/SuspensionScene'
import SuspensionLesson, { SuspensionLessonOverlay } from '../../movies/w4/SuspensionLesson'
import { startSlingLandingMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const DEGS = [1, 2, 3, -1, -2]

export default function Level4_4(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (current === 'stable') {
      if (tool !== 'dial') {
        sfxRefuse()
        return flash('Mark tiles with the Degree Dial (8).')
      }
      const b = BOARD.find((q) => near(x, z, boardPos(q.k, q.n), 0.95))
      if (!b) return
      if (!b.iso) {
        sfxWrong()
        return flash(b.i === 2 * b.n - 1 ? `$i = 2n − 1$: Freudenthal only promises onto here.` : `$i > 2n − 1$: outside the range.`, 2800)
      }
      const marked = { ...(bag.marked || {}), [`${b.k}-${b.n}`]: true }
      setBag((s) => ({ ...s, marked }))
      if (BOARD.filter((q) => q.iso).every((q) => marked[`${q.k}-${q.n}`])) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    const floors = SHAFTS[current]
    if (near(x, z, DIAL, 1.0) && current !== 'climb') {
      if (tool !== 'dial') {
        sfxRefuse()
        return flash('Set the degree with the Degree Dial (8).')
      }
      if ((bag.at?.[current] || 0) > 0) return flash('Already slung — the degree rides along.')
      const deg = DEGS[(DEGS.indexOf(bag.deg ?? 1) + 1) % DEGS.length]
      return setBag((s) => ({ ...s, deg }))
    }
    if (!near(x, z, SLING, 1.0)) return
    if (tool !== 'sling') {
      sfxRefuse()
      return flash('Lift with the Suspension Sling (4).')
    }
    if (current === 'upone' && (bag.deg ?? 1) !== 3) {
      sfxWrong()
      return flash('Dial the degree to $3$ first.')
    }
    const at = Math.min((bag.at?.[current] || 0) + 1, floors.length - 1)
    setBag((s) => ({ ...s, at: { ...s.at, [current]: at } }))
    const f = floors[at]
    flash(current === 'climb' ? `$${f.cls} ∈ ${f.g} = ${f.v}$` : `$Σ$: degree ${bag.deg ?? 1} in $${f.g}$`)
    if (at === floors.length - 1) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'stable') line = `marked: ${Object.keys(bag.marked || {}).length} / ${BOARD.filter((q) => q.iso).length}`
    else {
      const f = SHAFTS[current][bag.at?.[current] || 0]
      line = `now in $${f.g}$${current === 'climb' ? '' : ` · degree ${bag.deg ?? 1}`}`
    }
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
      Scene={SuspensionScene}
      Lesson={SuspensionLesson}
      LessonOverlay={SuspensionLessonOverlay}
      startMusic={startSlingLandingMusic}
      kicker="WORLD 4 · LEVEL 4 · SLING LANDING"
      levelId="4-4"
      className="level-4-4"
      tools={['lash', 'sling', 'dial']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-5"
    />
  )
}
