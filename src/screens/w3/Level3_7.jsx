import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-7.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_7'
import WhichWayScene, { BANDS, N, START, SURVEY, across, consistent, patchPos, roundTrip } from '../../levels/w3/WhichWayScene'
import WhichWayLesson, { WhichWayLessonOverlay } from '../../movies/w3/WhichWayLesson'
import { startReachMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level3_7(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'compass') {
      sfxRefuse()
      return flash('Use the Sheet Compass (6).')
    }
    const patch = Array.from({ length: N }, (_, i) => i).find((i) => near(x, z, patchPos(i), 0.75))
    if (current === 'set_compasses') {
      if (patch === undefined) return
      const comp = [...(bag.comp?.set_compasses || START.set_compasses)]
      comp[patch] = -comp[patch]
      setBag((b) => ({ ...b, comp: { ...b.comp, set_compasses: comp } }))
      if (consistent(comp, [])) {
        sfxCorrect()
        flash('Every compass agrees with its neighbours.', 2600)
        solve(current, goal.done, 1800)
      }
      return
    }
    if (current === 'the_flip') {
      if (patch === undefined) return
      const next = bag.next?.the_flip ?? 1
      if (patch !== next % N) {
        sfxWrong()
        return flash(`Carry it to the next patch — patch ${next % N}.`)
      }
      const comp = [...(bag.comp?.the_flip || [1, 0, 0, 0, 0, 0])]
      const carried = across(BANDS.the_flip.twists, (next - 1 + N) % N, comp[(next - 1 + N) % N])
      if (next === N) {
        setBag((b) => ({ ...b, closed: { ...b.closed, the_flip: true }, next: { ...b.next, the_flip: N + 1 } }))
        sfxCorrect()
        flash(`Back at patch 0 it arrives ${carried > 0 ? 'gold' : 'blue'} — but patch 0 is ${comp[0] > 0 ? 'gold' : 'blue'}.`, 3600)
        return solve(current, goal.done, 2400)
      }
      comp[next] = carried
      setBag((b) => ({ ...b, comp: { ...b.comp, the_flip: comp }, next: { ...b.next, the_flip: next + 1 } }))
      return flash(BANDS.the_flip.twists.includes(next - 1) ? 'Across the half-twist it flips.' : 'Carried across.')
    }
    if (current === 'two_sheets') {
      if (Math.hypot(x, z) < 1 || Math.hypot(x, z) > 4.2) return
      const step = (bag.step?.two_sheets || 0) + 2
      setBag((b) => ({ ...b, step: { ...b.step, two_sheets: step } }))
      if (step >= 2 * N) {
        sfxCorrect()
        flash('Twice round $M$: back on the $+$ ring.', 2800)
        solve(current, goal.done, 2000)
      } else if (step === N) flash('Once round $M$ — and you’re on the $−$ ring.', 2800)
      return
    }
    const band = SURVEY.find((b) => near(x, z, b.at, 1.9))
    if (!band) return
    const s = { ...(bag.surveyed || {}), [band.id]: true }
    setBag((b) => ({ ...b, surveyed: s }))
    flash(`${band.label}: ${roundTrip(band.twists) > 0 ? 'comes back the same way — orientable' : 'comes back flipped — non-orientable'}`, 3000)
    if (SURVEY.every((b) => s[b.id])) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'set_compasses') {
      const comp = bag.comp?.set_compasses || START.set_compasses
      line = `${comp.filter((c) => c > 0).length} gold · ${comp.filter((c) => c < 0).length} blue`
    } else if (current === 'the_flip') line = `carried to patch ${Math.min((bag.next?.the_flip ?? 1) - 1, N)} of ${N}`
    else if (current === 'two_sheets') line = `patches travelled: ${bag.step?.two_sheets || 0} / ${2 * N}`
    else line = `surveyed: ${Object.keys(bag.surveyed || {}).length} / 3`
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
      Scene={WhichWayScene}
      Lesson={WhichWayLesson}
      LessonOverlay={WhichWayLessonOverlay}
      startMusic={startReachMusic}
      kicker="WORLD 3 · LEVEL 7 · COMPASS CLIFFS"
      levelId="3-7"
      className="level-3-7"
      tools={['lash', 'compass']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-8"
    />
  )
}
