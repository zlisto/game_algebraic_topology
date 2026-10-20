import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-2.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_2'
import TorsionShiftScene, { FLOORS, TERRACES, allRequired, floorPos, gName, plantPos, required } from '../../levels/w3/TorsionShiftScene'
import TorsionShiftLesson, { TorsionShiftLessonOverlay } from '../../movies/w3/TorsionShiftLesson'
import { startTerraceMusic } from '../../audio/chip'
import MathText from '../MathText'

const SUB = '₀₁₂'
const SUP = '⁰¹²'

export default function Level3_2(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'wand') {
      sfxRefuse()
      return flash('Transplant with the Reading Wand (0).')
    }
    const T = TERRACES[current]
    const placed = bag.placed?.[current] || []
    const plant = T.hom.find((p) => {
      const [px, pz] = plantPos(current, p)
      return Math.hypot(x - px, z - pz) < 0.55
    })
    if (plant) {
      setBag((b) => ({ ...b, sel: { ...b.sel, [current]: plant[0] } }))
      return flash(`$${gName(plant[2])}$ in $H${SUB[plant[1]]}$ picked — now click a floor on the right.`)
    }
    if (x < 1.2) return
    const n = Array.from({ length: FLOORS }, (_, k) => k).find((k) => Math.abs(z - floorPos(1, k)[1]) < 0.9)
    if (n === undefined) return
    const selId = bag.sel?.[current]
    const p = T.hom.find((q) => q[0] === selId)
    if (!p) return flash('Pick a plant on the left terrace first.')
    const left = required(current, p).filter((r) => !placed.some((q) => q.plant === p[0] && q.floor === r.floor && q.kind === r.kind))
    if (!left.length) return flash('That plant is already transplanted.')
    const r = left.find((q) => q.floor === n)
    if (!r) {
      sfxWrong()
      const [, pn, g] = p
      let why = `It doesn’t belong in $H${SUP[n]}$.`
      if (T.soil === 'Z' && g === 'Z') why = 'Free summands stay on their own floor: Hom$(ℤ, ℤ) = ℤ$.'
      else if (T.soil === 'Z' && g === 'Z2' && n === pn) why = 'Hom$(ℤ₂, ℤ) = 0$ — torsion can’t stay. Ext$(ℤ₂, ℤ) = ℤ₂$ puts it one floor up.'
      else if (T.soil === 'Z2') why = `In ℤ₂ soil it goes to $H${SUP[pn]}$${g === 'Z2' ? ` and $H${SUP[Math.min(pn + 1, 2)]}$` : ''}.`
      return flash(why, 3400)
    }
    const next = [...placed, { plant: p[0], floor: n, g: r.g, kind: r.kind }]
    setBag((b) => ({ ...b, placed: { ...b.placed, [current]: next }, sel: { ...b.sel, [current]: left.length > 1 ? p[0] : null } }))
    flash(`${r.kind}: $${gName(r.g)}$ in $H${SUP[n]}$`)
    if (allRequired(current).every((q) => next.some((m) => m.plant === q.plant && m.floor === q.floor && m.kind === q.kind))) {
      sfxCorrect()
      solve(current, goal.done, 1800)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const placed = bag.placed?.[current] || []
    const line = Array.from({ length: FLOORS }, (_, n) => {
      const gs = placed.filter((q) => q.floor === n).map((q) => gName(q.g))
      return `$H${SUP[n]}$ = ${gs.length ? gs.join(' ⊕ ') : '0'}`
    }).join(' · ')
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
      Scene={TorsionShiftScene}
      Lesson={TorsionShiftLesson}
      LessonOverlay={TorsionShiftLessonOverlay}
      startMusic={startTerraceMusic}
      kicker="WORLD 3 · LEVEL 2 · TORSION TERRACE"
      levelId="3-2"
      className="level-3-2"
      tools={['lash', 'wand']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-3"
    />
  )
}
