import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/cellBlock.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_7'
import CellBlockScene, { CELLS, COEFS, CRATES, LETTER_LEVERS, PRESS, d2, homology } from '../../levels/w2/CellBlockScene'
import CellBlockLesson, { CellBlockLessonOverlay } from '../../movies/w2/CellBlockLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r = 1.1) => Math.hypot(x - px, z - pz) < r
const fmt = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')
const NEEDS = { e0: [], a: ['e0'], b: ['e0'], e2: ['e0', 'a', 'b'] }
const WHY = {
  a: 'A $1$-cell’s two ends glue onto $0$-cells — attach the point first.',
  b: 'A $1$-cell’s two ends glue onto $0$-cells — attach the point first.',
  e2: 'The $2$-cell’s rim runs along $a b a⁻¹ b⁻¹$ — both loops have to be there first.',
}

export default function Level2_7(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return

    if (current === 'crates') {
      const k = Object.keys(CRATES).find((c) => near(x, z, CRATES[c]))
      if (!k) return
      if (tool !== 'smith') {
        sfxRefuse()
        return flash('Attach cells with the Cell Hammer (2).')
      }
      const built = { ...(bag.built || {}) }
      if (built[k]) return flash('Already attached.')
      if (NEEDS[k].some((n) => !built[n])) {
        sfxWrong()
        return flash(WHY[k], 3200)
      }
      built[k] = true
      setBag((b) => ({ ...b, built }))
      if (k === 'e2') {
        sfxCorrect()
        flash('$χ = 1 − 2 + 1 = 0$', 3000)
        return solve(current, goal.done, 3000)
      }
      return flash(k === 'e0' ? 'The $0$-skeleton: a point.' : `The $1$-skeleton grows: loop $${k}$.`)
    }

    const c = CELLS[current]
    const lever = c.letters.find((l) => near(x, z, LETTER_LEVERS[l]))
    if (lever) {
      if (tool !== 'dial') {
        sfxRefuse()
        return flash('Set coefficients with the Degree Dial (8).')
      }
      const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[current] || {}) }
      coef[lever] = COEFS[(COEFS.indexOf(coef[lever]) + 1) % COEFS.length]
      setBag((b) => ({ ...b, coef: { ...b.coef, [current]: coef } }))
      return
    }
    if (near(x, z, PRESS)) {
      if (tool !== 'smith') {
        sfxRefuse()
        return flash('Attach the $2$-cell with the Cell Hammer (2).')
      }
      const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[current] || {}) }
      const want = d2(current)
      const ok = [1, -1].some((s) => c.letters.every((l) => coef[l] === s * want[l]))
      if (!ok) {
        sfxWrong()
        const off = c.letters.filter((l) => Math.abs(coef[l]) !== Math.abs(want[l]))
        return flash(off.length ? `That isn’t the rim. Walk it again and count $${off.join('$ and $')}$.` : 'Close — but walk the rim one way for both letters: the signs disagree.', 3400)
      }
      setBag((b) => ({ ...b, solved: { ...b.solved, [current]: true } }))
      sfxCorrect()
      const h = homology(current)
      flash(`$H₀ = ℤ$, $H₁ = ${h.H1}$, $H₂ = ${h.H2}$`, 3600)
      return solve(current, goal.done, 3000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'crates') line = `attached: ${Object.keys(bag.built || {}).length} / 4`
    else {
      const c = CELLS[current]
      const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[current] || {}) }
      line = `$d₂(e²) = ${c.letters.map((l) => `${fmt(coef[l])}${l}`).join(' ')}$`
      if (bag.solved?.[current]) {
        const h = homology(current)
        line += ` · $H₁ = ${h.H1}$, $H₂ = ${h.H2}$`
      }
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
      Scene={CellBlockScene}
      Lesson={CellBlockLesson}
      LessonOverlay={CellBlockLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 7 · CELL BLOCK"
      levelId="2-7"
      className="level-2-7"
      tools={['lash', 'smith', 'dial']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-8"
    />
  )
}
