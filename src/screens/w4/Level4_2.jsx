import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-snap-to-grid.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_2'
import GridGalleryScene, { APPROX_ENDS, BOARD, PATHS, boardPos, segMid } from '../../levels/w4/GridGalleryScene'
import SnapGridLesson, { SnapGridLessonOverlay } from '../../movies/w4/SnapGridLesson'
import { startGridGalleryMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level4_2(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'smith') {
      sfxRefuse()
      return flash('Use the Cell-Smith (2).')
    }
    if (current === 'snap' || current === 'approx') {
      const ends = { ...(bag.ends || {}) }
      if (current === 'approx') {
        const e = Object.keys(APPROX_ENDS).find((k) => !ends[k] && near(x, z, APPROX_ENDS[k].off, 0.6))
        if (e) {
          ends[e] = true
          setBag((b) => ({ ...b, ends }))
          return flash('Endpoint snapped to a 0-cell.')
        }
      }
      const i = PATHS[current].findIndex((s) => near(x, z, segMid(s), 1.0))
      if (i < 0) return
      if (current === 'approx' && !(ends.A && ends.B)) {
        sfxWrong()
        return flash('Skeleton by skeleton: snap the 0-cells (the pink endpoints) first.', 3000)
      }
      const snapped = { ...(bag.snapped?.[current] || {}), [i]: true }
      setBag((b) => ({ ...b, snapped: { ...b.snapped, [current]: snapped } }))
      if (PATHS[current].every((_, k) => snapped[k])) {
        sfxCorrect()
        flash('The whole path lies in the 1-skeleton.', 2600)
        solve(current, goal.done, 2000)
      }
      return
    }
    if (current === 'slip') {
      const r = Math.hypot(x, z)
      if (!bag.punct) {
        if (r < 1.0) {
          setBag((b) => ({ ...b, punct: true }))
          return flash('Punctured: the loop misses this point.')
        }
        return flash('Puncture a point the loop misses — inside it, near the middle.')
      }
      if (Math.abs(r - 3.4) > 0.9) return flash('Now click the gold rim to push the loop out to $e⁰$.')
      setBag((b) => ({ ...b, pushed: true }))
      sfxCorrect()
      flash('Pushed radially from the puncture to the rim — the single point $e⁰$.', 3000)
      return solve(current, goal.done, 2600)
    }
    // small
    let hit = null
    for (const n of BOARD) for (const k of BOARD) if (near(x, z, boardPos(k, n), 0.75)) hit = [k, n]
    if (!hit) return
    const [k, n] = hit
    if (k >= n) {
      sfxWrong()
      return flash(k === n ? `$π${'₁₂₃'[k - 1]}(S${'¹²³'[n - 1]}) = ℤ$ — the degree.` : 'Cellular approximation says nothing when $k > n$.', 2800)
    }
    const marked = { ...(bag.marked || {}), [`${k}-${n}`]: true }
    setBag((b) => ({ ...b, marked }))
    if (Object.keys(marked).length === 3) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'snap') line = `snapped: ${Object.keys(bag.snapped?.snap || {}).length} / ${PATHS.snap.length}`
    else if (current === 'approx') line = `endpoints: ${Object.keys(bag.ends || {}).length} / 2 · pieces: ${Object.keys(bag.snapped?.approx || {}).length} / 2`
    else if (current === 'slip') line = bag.pushed ? 'pushed to $e⁰$' : bag.punct ? 'punctured — now push' : 'not punctured yet'
    else line = `marked: ${Object.keys(bag.marked || {}).length} / 3`
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
      Scene={GridGalleryScene}
      Lesson={SnapGridLesson}
      LessonOverlay={SnapGridLessonOverlay}
      startMusic={startGridGalleryMusic}
      kicker="WORLD 4 · LEVEL 2 · GRID GALLERY"
      levelId="4-2"
      className="level-4-2"
      tools={['lash', 'smith']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-3"
    />
  )
}
