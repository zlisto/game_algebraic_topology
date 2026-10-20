import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-hop-off.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_7'
import HopfRingScene, { CANDS, POINTS, rowX } from '../../levels/w4/HopfRingScene'
import HopOffLesson, { HopOffLessonOverlay } from '../../movies/w4/HopOffLesson'
import { startHopfRingMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const NEED = { circle: 4, linked: 2, nulls_answer: 2 }

export default function Level4_7(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (current === 'seq') {
      if (!near(x, z, [rowX(2), 0.6], 1.0)) return
      if (tool !== 'dial') {
        sfxRefuse()
        return flash('Try groups with the Degree Dial (8).')
      }
      const g = CANDS[(CANDS.indexOf(bag.pick) + 1) % CANDS.length]
      setBag((b) => ({ ...b, pick: g }))
      if (g === 'ℤ') {
        sfxCorrect()
        flash('$0 → ℤ → π₃(S²) → 0$: so $π₃(S²) ≅ ℤ$.', 3000)
        return solve(current, goal.done, 2000)
      }
      return flash(`$${g}$ doesn’t make the row exact.`)
    }
    const p = POINTS.find((q) => near(x, z, q.btn, 0.7))
    if (!p) return
    if (tool !== 'compass') {
      sfxRefuse()
      return flash('Light fibres with the Sheet Compass (6).')
    }
    const lit = { ...(bag.lit?.[current] || {}), [p.id]: true }
    setBag((b) => ({ ...b, lit: { ...b.lit, [current]: lit } }))
    const n = Object.keys(lit).length
    if (n >= NEED[current]) {
      sfxCorrect()
      if (current !== 'circle') flash('Two circles, linked exactly once.', 2800)
      solve(current, goal.done, 2400)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const line = current === 'seq' ? `unknown: ${bag.pick || '?'}` : `fibres lit: ${Object.keys(bag.lit?.[current] || {}).length} / ${NEED[current]}`
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
      Scene={HopfRingScene}
      Lesson={HopOffLesson}
      LessonOverlay={HopOffLessonOverlay}
      startMusic={startHopfRingMusic}
      kicker="WORLD 4 · LEVEL 7 · HOPF RING"
      levelId="4-7"
      className="level-4-7"
      tools={['lash', 'compass', 'dial']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-8"
    />
  )
}
