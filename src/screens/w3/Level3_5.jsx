import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-5.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_5'
import ProductPlacementScene, { DESIGN_CHOICES, DESIGN_TARGET, LEVERS, MAXDEG, SPACES, beds, binPos, ranks, spacesOf } from '../../levels/w3/ProductPlacementScene'
import ProductPlacementLesson, { ProductPlacementLessonOverlay } from '../../movies/w3/ProductPlacementLesson'
import { startParterreMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level3_5(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'caster') {
      sfxRefuse()
      return flash('Plant with the Cup Caster (9).')
    }
    if (current === 'design_parterre') {
      const side = Object.keys(LEVERS).find((k) => near(x, z, LEVERS[k], 1.0))
      if (!side) return
      const d = { X: 'S1', Y: 'S1', ...(bag.design || {}) }
      d[side] = DESIGN_CHOICES[(DESIGN_CHOICES.indexOf(d[side]) + 1) % DESIGN_CHOICES.length]
      setBag((b) => ({ ...b, design: d }))
      const r = ranks(beds(current, { design: d }))
      if (r.every((v, n) => v === (DESIGN_TARGET[n] ?? 0))) {
        sfxCorrect()
        flash(`$${SPACES[d.X].name} × ${SPACES[d.Y].name}$: ranks $1, 1, 1, 1$`, 2800)
        solve(current, goal.done, 2000)
      }
      return
    }
    const list = beds(current, bag)
    const bed = list.find((b) => near(x, z, b.pos, 0.55))
    if (current === 'torsion_soil') {
      if (bed) {
        const picked = { ...(bag.picked?.torsion_soil || {}) }
        if (bed.deg !== 2) {
          sfxWrong()
          return flash(`$${bed.a} × ${bed.b}$ has degree ${bed.deg}, not $2$.`)
        }
        picked[bed.key] = !picked[bed.key]
        setBag((b) => ({ ...b, picked: { ...b.picked, torsion_soil: picked } }))
        const want = list.filter((b) => b.deg === 2)
        if (want.every((b) => picked[b.key])) {
          sfxCorrect()
          flash('All three beds of degree $2$: $H²(ℝP² × ℝP²; ℤ₂) = ℤ₂³$', 3000)
          solve(current, goal.done, 2000)
        }
      }
      return
    }
    if (bed) {
      if (bag.placed?.[current]?.[bed.key]) return flash('Already binned.')
      return setBag((b) => ({ ...b, sel: { ...b.sel, [current]: bed.key } }))
    }
    const n = Array.from({ length: MAXDEG + 1 }, (_, k) => k).find((k) => near(x, z, binPos(k), 0.8))
    if (n === undefined) return
    const sel = list.find((b) => b.key === bag.sel?.[current])
    if (!sel) return flash('Click a bed first, then its bin.')
    if (sel.deg !== n) {
      sfxWrong()
      return flash(`$${sel.a} × ${sel.b}$ has degree ${sel.deg}: the degrees add.`, 2800)
    }
    const placed = { ...(bag.placed?.[current] || {}), [sel.key]: true }
    setBag((b) => ({ ...b, placed: { ...b.placed, [current]: placed }, sel: { ...b.sel, [current]: null } }))
    if (list.every((b) => placed[b.key])) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const [X, Y] = spacesOf(current, bag)
    const list = beds(current, bag)
    const r = current === 'design_parterre' ? ranks(list) : current === 'torsion_soil' ? ranks(list.filter((b) => bag.picked?.torsion_soil?.[b.key])) : ranks(list.filter((b) => bag.placed?.[current]?.[b.key]))
    return (
      <>
        <h3>{STATIONS[current].blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        <p className="cells-line">
          <MathText text={`$${SPACES[X].name} × ${SPACES[Y].name}$ · bins: ${r.join(', ')}`} />
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
      Scene={ProductPlacementScene}
      Lesson={ProductPlacementLesson}
      LessonOverlay={ProductPlacementLessonOverlay}
      startMusic={startParterreMusic}
      kicker="WORLD 3 · LEVEL 5 · PRODUCT PARTERRE"
      levelId="3-5"
      className="level-3-5"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-6"
    />
  )
}
