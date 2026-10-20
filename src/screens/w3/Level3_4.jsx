import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-4.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_4'
import CupCounterexampleScene, { BOUQ, ISLES } from '../../levels/w3/CupCounterexampleScene'
import { torusCup } from '../../levels/w3/FrontFaceScene'
import CupCounterexampleLesson, { CupCounterexampleLessonOverlay } from '../../movies/w3/CupCounterexampleLesson'
import { startGardensMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r = 1.0) => Math.hypot(x - px, z - pz) < r

export default function Level3_4(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'caster') {
      sfxRefuse()
      return flash('Use the Cup Caster (9).')
    }
    if (current === 'same_holes') {
      const k = Object.keys(ISLES).find((i) => near(x, z, [ISLES[i][0], ISLES[i][1] + 2.4], 1.2))
      if (!k) return
      const read = { ...(bag.read || {}), [k]: true }
      setBag((b) => ({ ...b, read }))
      flash(`${k === 'T' ? 'Torus' : 'Bouquet'}: $H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$`)
      if (read.T && read.X) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    if (current === 'cast_torus') {
      if (Math.abs(x) > 2.3 || Math.abs(z) > 2.3) return
      const tri = x + z > 0 ? 'L' : 'U'
      const cast = { ...(bag.cast?.cast_torus || {}), [tri]: true }
      setBag((b) => ({ ...b, cast: { ...b.cast, cast_torus: cast } }))
      flash(`$α ⌣ β$ on this triangle: $${torusCup('α', 'β')[tri]}$`)
      if (cast.L && cast.U) {
        sfxCorrect()
        solve(current, goal.done, 2200)
      }
      return
    }
    if (current === 'cast_bouquet') {
      const c = { ...(bag.cast?.cast_bouquet || {}) }
      const onRing = (cxr) => Math.abs(Math.hypot(x - cxr, z - BOUQ.a[1]) - 1.25) < 0.5
      const target = onRing(-1.25) ? 'a' : onRing(1.25) ? 'b' : near(x, z, [0, -1.3], 1.2) || near(x, z, [2.8, -2.2], 1.0) ? 'sphere' : null
      if (!target) return
      const want = !c.a ? 'a' : !c.b ? 'b' : 'sphere'
      if (target !== want) {
        sfxWrong()
        return flash(want === 'a' ? 'Start with $α$ on ring $a$ — the left ring.' : want === 'b' ? 'Now $β$ on ring $b$ — the right ring.' : 'Now cast the product on the ball.')
      }
      c[target] = true
      setBag((b) => ({ ...b, cast: { ...b.cast, cast_bouquet: c } }))
      if (target === 'sphere') {
        sfxCorrect()
        flash('$α ⌣ β = 0$ on the bouquet.', 2800)
        return solve(current, goal.done, 2000)
      }
      return flash(target === 'a' ? '$α$ lights ring $a$.' : '$β$ lights ring $b$.')
    }
    const k = near(x, z, [ISLES.T[0], -2.4], 1.1) ? 'T' : near(x, z, [ISLES.X[0], -2.4], 1.1) ? 'X' : null
    if (!k) return
    const c = { ...(bag.cast?.nulls_answer || {}), [k]: true }
    setBag((b) => ({ ...b, cast: { ...b.cast, nulls_answer: c } }))
    if (c.T && c.X) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'same_holes') line = `meters read: ${Object.keys(bag.read || {}).length} / 2`
    else if (current === 'cast_torus') line = `cast on: ${Object.keys(bag.cast?.cast_torus || {}).length} / 2 triangles`
    else if (current === 'cast_bouquet') line = `cast: ${['a', 'b', 'sphere'].filter((k) => bag.cast?.cast_bouquet?.[k]).join(', ') || 'none'}`
    else line = `lanterns: ${Object.keys(bag.cast?.nulls_answer || {}).length} / 2`
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
      Scene={CupCounterexampleScene}
      Lesson={CupCounterexampleLesson}
      LessonOverlay={CupCounterexampleLessonOverlay}
      startMusic={startGardensMusic}
      kicker="WORLD 3 · LEVEL 4 · TWIN ISLANDS"
      levelId="3-4"
      className="level-3-4"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-5"
    />
  )
}
