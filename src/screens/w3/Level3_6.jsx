import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-6.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_6'
import PolynomialGardenScene, { FOUNTS, pw } from '../../levels/w3/PolynomialGardenScene'
import PolynomialGardenLesson, { PolynomialGardenLessonOverlay } from '../../movies/w3/PolynomialGardenLesson'
import { startPolyMusic } from '../../audio/chip'
import MathText from '../MathText'

const GOAL_POW = { square_it: 2, climb_powers: 4 }

export default function Level3_6(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'caster') {
      sfxRefuse()
      return flash('Cast with the Cup Caster (9).')
    }
    const fs = FOUNTS[current]
    const pow = bag.pow?.[current] ?? 1
    const next = pow + 1
    const top = Math.max(...fs.map((f) => f.n))
    if (current === 'antipodes') {
      if (next > top) return
      setBag((b) => ({ ...b, pow: { ...b.pow, antipodes: next }, fizz: { ...b.fizz, antipodes: next > 2 } }))
      if (next > 2) {
        sfxCorrect()
        flash(`$${pw(next)} ≠ 0$ on ℝP⁴ but $${pw(next)} = 0$ on ℝP² — contradiction.`, 3600)
        return solve(current, goal.done, 2600)
      }
      return flash(`$f*(${pw(next)}) = ${pw(next)}$ — both light.`)
    }
    const f = fs[0]
    if (next > f.n) {
      setBag((b) => ({ ...b, pow: { ...b.pow, [current]: next }, fizz: { ...b.fizz, [current]: true } }))
      if (current === 'stops_top') {
        sfxCorrect()
        flash(`$${pw(next)} = 0$ — nothing above degree ${f.n * f.deg}.`, 3200)
        return solve(current, goal.done, 2400)
      }
      sfxWrong()
      return flash(`$${pw(next)} = 0$ in $${f.name}$.`)
    }
    setBag((b) => ({ ...b, pow: { ...b.pow, [current]: next } }))
    flash(`$${pw(next)}$ lights degree ${next * f.deg}.`)
    if (GOAL_POW[current] === next) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const pow = bag.pow?.[current] ?? 1
    const line = FOUNTS[current].map((f) => `${f.name}: up to $${pw(Math.min(pow, f.n))}$${pow > f.n ? ` · $${pw(f.n + 1)} = 0$` : ''}`).join(' · ')
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
      Scene={PolynomialGardenScene}
      Lesson={PolynomialGardenLesson}
      LessonOverlay={PolynomialGardenLessonOverlay}
      startMusic={startPolyMusic}
      kicker="WORLD 3 · LEVEL 6 · POLYNOMIAL GARDEN"
      levelId="3-6"
      className="level-3-6"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-7"
    />
  )
}
