import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-hurewicz.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_6'
import HurewiczScene, { COLS, FIRSTS, rowZ } from '../../levels/w4/HurewiczScene'
import HurewiczLesson, { HurewiczLessonOverlay } from '../../movies/w4/HurewiczLesson'
import { startHurewiczMusic } from '../../audio/chip'
import MathText from '../MathText'

const SUB = '₀₁₂₃₄'
const rowAt = (z) => [1, 2, 3].find((n) => Math.abs(z - rowZ(n)) < 0.8)
/** The bridge at degree n of a column: iso, onto (abelianization), or none. */
export function bridgeState(id, n) {
  const C = COLS[id]
  if (id === 'dim1' && n === 1) return 'onto'
  return C.pi[n - 1] === C.H[n - 1] ? 'iso' : 'none'
}

export default function Level4_6(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'dial') {
      sfxRefuse()
      return flash('Use the Degree Dial (8).')
    }
    const n = rowAt(z)
    if (!n) return
    if (current === 'first') {
      const s = FIRSTS.find((q) => Math.abs(x - q.x) < 1.6)
      if (!s) return
      const found = { ...(bag.found || {}) }
      if (found[s.id] === s.first) return
      if (n !== s.first) {
        sfxWrong()
        return flash(n < s.first ? `$π${SUB[n]}(${s.name}) = 0$ — keep going up.` : `Something non-zero comes before degree ${n}.`)
      }
      found[s.id] = s.first
      setBag((b) => ({ ...b, found }))
      flash(`${s.name}: $π${SUB[n]} = ${s.pi[n - 1]} ≅ H${SUB[n]}$`)
      if (FIRSTS.every((q) => found[q.id] === q.first)) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    const C = COLS[current]
    if (current === 'meters') {
      const read = { ...(bag.read?.meters || {}), [n]: true }
      setBag((b) => ({ ...b, read: { ...b.read, meters: read } }))
      flash(`$π${SUB[n]}(S²) = ${C.pi[n - 1]}$ · $H${SUB[n]}(S²) = ${C.H[n - 1]}$`)
      if ([1, 2, 3].every((k) => read[k])) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    if (Math.abs(x) > 1.2) return flash('Test the bridge at the post in the middle.')
    const st = bridgeState(current, n)
    const bridges = { ...(bag.bridges?.[current] || {}), [n]: st }
    setBag((b) => ({ ...b, bridges: { ...b.bridges, [current]: bridges } }))
    if (current === 'dim1') {
      if (n !== 1) return flash('Nothing here — the figure-eight has no higher homology or homotopy.')
      sfxCorrect()
      flash('$F(a, b) → ℤ²$: onto; commutators like $aba⁻¹b⁻¹$ go to $0$.', 3000)
      return solve(current, goal.done, 2400)
    }
    if (st === 'none') {
      sfxWrong()
      flash(`$π${SUB[n]} = ${C.pi[n - 1]}$ but $H${SUB[n]} = ${C.H[n - 1]}$ — no isomorphism here.`, 2800)
    } else flash(`Degree ${n}: an isomorphism.`)
    if ([1, 2, 3].every((k) => bridges[k])) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'meters') line = `pairs read: ${Object.keys(bag.read?.meters || {}).length} / 3`
    else if (current === 'first') line = `found: ${Object.keys(bag.found || {}).length} / 3`
    else line = `bridges tested: ${Object.keys(bag.bridges?.[current] || {}).length}${current === 'dim1' ? ' (degree 1)' : ' / 3'}`
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
      Scene={HurewiczScene}
      Lesson={HurewiczLesson}
      LessonOverlay={HurewiczLessonOverlay}
      startMusic={startHurewiczMusic}
      kicker="WORLD 4 · LEVEL 6 · HUREWICZ HALL"
      levelId="4-6"
      className="level-4-6"
      tools={['lash', 'dial']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-7"
    />
  )
}
