import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-8.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_8'
import BothSidesScene, { RANKS, TOWERS, towerPos } from '../../levels/w3/BothSidesScene'
import BothSidesLesson, { BothSidesLessonOverlay } from '../../movies/w3/BothSidesLesson'
import { startSeamMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const SUB = ['₀', '₁', '₂', '₃']
const SUP = ['⁰', '¹', '²', '³']

export default function Level3_8(props) {
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
    if (current === 'dual_cells') {
      const H = 2.0
      const hit = near(x, z, [-H, H], 0.6) ? 'v' : near(x, z, [0, H + 0.4], 0.7) ? 'a' : near(x, z, [H + 0.4, 0], 0.7) ? 'b' : near(x, z, [0, 0], 1.0) ? 'f' : null
      if (!hit) return
      const dual = { ...(bag.dual || {}), [hit]: true }
      setBag((b) => ({ ...b, dual }))
      flash({ v: 'The vertex (0-cell) ↔ a dual 2-cell: the whole square.', a: 'Edge $a$ ↔ the dual edge crossing it.', b: 'Edge $b$ ↔ the dual edge crossing it.', f: 'The face (2-cell) ↔ a dual 0-cell: the centre point.' }[hit], 3000)
      if (['v', 'a', 'b', 'f'].every((k) => dual[k])) {
        sfxCorrect()
        solve(current, goal.done, 2400)
      }
      return
    }
    const T = TOWERS[current]
    if (current === 'broken_mirror' && near(x, z, [0, 3.9], 1.0)) {
      const coef = (bag.coef || 'Z') === 'Z' ? 'Z2' : 'Z'
      setBag((b) => ({ ...b, coef, pairs: { ...b.pairs, broken_mirror: {} }, sel: { ...b.sel, broken_mirror: null } }))
      return flash(`Coefficients: ${coef === 'Z2' ? 'ℤ₂' : 'ℤ'}`)
    }
    const k = Array.from({ length: T.n + 1 }, (_, i) => i).find((i) => near(x, z, towerPos(-1, i, T.n), 0.8))
    const row = Array.from({ length: T.n + 1 }, (_, i) => i).find((i) => near(x, z, towerPos(1, i, T.n), 0.8))
    if (current === 'across_seam') {
      if (row === undefined) return
      const j = T.n - row
      if (j < 2) return flash(`$H${SUB[j]}$ is already known.`)
      const hom = { ...(bag.hom || {}) }
      hom[j] = RANKS[(RANKS.indexOf(hom[j] ?? '0') + 1) % RANKS.length]
      setBag((b) => ({ ...b, hom }))
      const ok = [2, 3].every((m) => (hom[m] ?? '0') === T.coh[T.n - m])
      if (ok) {
        sfxCorrect()
        flash('$H₂ ≅ H¹ = ℤ³$ and $H₃ ≅ H⁰ = ℤ$.', 2800)
        solve(current, goal.done, 2000)
      }
      return
    }
    if (k !== undefined) return setBag((b) => ({ ...b, sel: { ...b.sel, [current]: k } }))
    if (row === undefined) return
    const sel = bag.sel?.[current]
    if (sel === undefined || sel === null) return flash('Pick a cohomology tower on the left first.')
    const j = T.n - row
    if (j !== T.n - sel) {
      sfxWrong()
      return flash(`$H${SUP[sel]}$ is twinned with $H${SUB[T.n - sel]}$ — degree $n − k$.`, 2800)
    }
    const set = current === 'broken_mirror' ? T[bag.coef || 'Z'] : T
    const match = set.coh[sel] === set.hom[j]
    const pairs = { ...(bag.pairs?.[current] || {}), [sel]: match }
    setBag((b) => ({ ...b, pairs: { ...b.pairs, [current]: pairs }, sel: { ...b.sel, [current]: null } }))
    if (!match) {
      sfxWrong()
      return flash(`$H${SUP[sel]} = ${set.coh[sel]}$ but $H${SUB[j]} = ${set.hom[j]}$ — the mirror is broken.`, 3200)
    }
    flash(`$H${SUP[sel]} ≅ H${SUB[j]}$`)
    if (Array.from({ length: T.n + 1 }, (_, i) => i).every((i) => pairs[i] === true)) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'dual_cells') line = `duals lit: ${Object.keys(bag.dual || {}).length} / 4`
    else if (current === 'across_seam') line = `$H₂$ = ${bag.hom?.[2] ?? '0'} · $H₃$ = ${bag.hom?.[3] ?? '0'}`
    else {
      const p = bag.pairs?.[current] || {}
      line = `pairs matched: ${Object.values(p).filter(Boolean).length} / 3${current === 'broken_mirror' ? ` · coefficients ${(bag.coef || 'Z') === 'Z' ? 'ℤ' : 'ℤ₂'}` : ''}`
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
      Scene={BothSidesScene}
      Lesson={BothSidesLesson}
      LessonOverlay={BothSidesLessonOverlay}
      startMusic={startSeamMusic}
      kicker="WORLD 3 · LEVEL 8 · THE SEAM"
      levelId="3-8"
      className="level-3-8"
      tools={['lash', 'compass']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-9"
    />
  )
}
