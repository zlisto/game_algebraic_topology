import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/modMill.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_9'
import ModMillScene, { BINS, CELL_OF, FAN, LETTER_LEVERS, PRESS, SURFACES, cellD2mod2, fanBoundary2 } from '../../levels/w2/ModMillScene'
import { CELLS } from '../../levels/w2/CellBlockScene'
import { RIM } from '../../levels/w2/CancelMarshScene'
import { pickCell } from '../../levels/w2/ChainDeck'
import ModSquadLesson, { ModSquadLessonOverlay } from '../../movies/w2/ModSquadLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r = 1.1) => Math.hypot(x - px, z - pz) < r
const RIM2 = Object.fromEntries(Object.keys(RIM).map((k) => [k, 1]))
const sameMod2 = (c) => [...new Set([...Object.keys(c), ...Object.keys(RIM2)])].every((k) => (c[k] || 0) === (RIM2[k] || 0))
const NEXT_BIN = { undefined: 'yes', yes: 'no', no: undefined }

export default function Level2_9(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    if (tool !== 'blade') {
      sfxRefuse()
      return flash('Everything in the Mill runs on the Boundary Blade (7).')
    }

    if (current === 'even') {
      const hit = pickCell(FAN, x, z)
      if (!hit?.tri) return
      const tri = { ...(bag.tri?.even || {}) }
      tri[hit.tri] = tri[hit.tri] ? 0 : 1
      setBag((b) => ({ ...b, tri: { ...b.tri, even: tri } }))
      if (sameMod2(fanBoundary2(tri))) {
        sfxCorrect()
        flash('Only the rim is left — no signs needed.', 2600)
        solve(current, goal.done, 1800)
      }
      return
    }
    if (CELL_OF[current]) {
      const c = CELLS[CELL_OF[current]]
      const lever = c.letters.find((l) => near(x, z, LETTER_LEVERS[l]))
      const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[current] || {}) }
      if (lever) {
        coef[lever] = 1 - coef[lever]
        return setBag((b) => ({ ...b, coef: { ...b.coef, [current]: coef } }))
      }
      if (!near(x, z, PRESS)) return
      const want = cellD2mod2(current)
      if (!c.letters.every((l) => coef[l] === want[l])) {
        sfxWrong()
        return flash('That isn’t the rim mod 2. Count each letter round the rim, then reduce.', 3200)
      }
      setBag((b) => ({ ...b, solved: { ...b.solved, [current]: true } }))
      sfxCorrect()
      flash('$d₂ = 0$ mod 2: $H₂(·; ℤ₂) ≅ ℤ₂$', 3000)
      return solve(current, goal.done, 2800)
    }
    // sort
    const bins = { ...(bag.bins || {}) }
    let hit = null
    SURFACES.forEach((s, i) => {
      const at = bins[s.id] ? BINS[bins[s.id]] : s.pos
      const p = bins[s.id] ? [at[0] + (i % 2 ? 0.7 : -0.7), at[1] + (i < 2 ? -0.5 : 0.5)] : at
      if (near(x, z, p, 0.75)) hit = s
    })
    if (!hit) return
    bins[hit.id] = NEXT_BIN[bins[hit.id]]
    setBag((b) => ({ ...b, bins }))
    if (SURFACES.every((s) => bins[s.id] === (s.orientable ? 'yes' : 'no'))) {
      sfxCorrect()
      flash('All four sorted.', 2600)
      return solve(current, goal.done, 1800)
    }
    if (bins[hit.id]) {
      const right = (bins[hit.id] === 'yes') === hit.orientable
      if (!right) {
        sfxWrong()
        flash(hit.orientable ? `$H₂(${hit.name}; ℤ) = ℤ$ — that one is orientable.` : `$H₂(${hit.name}; ℤ) = 0$ — that one hides a Möbius band.`, 3200)
      }
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'even') line = `boundary mod 2: ${Object.entries(fanBoundary2(bag.tri?.even || {})).filter(([, v]) => v).length} edges lit`
    else if (CELL_OF[current]) {
      const c = CELLS[CELL_OF[current]]
      const coef = { ...Object.fromEntries(c.letters.map((l) => [l, 1])), ...(bag.coef?.[current] || {}) }
      line = `$d₂ ≡ ${c.letters.map((l) => `${coef[l]}${l}`).join(' + ')}$ (mod 2)`
    } else line = `sorted: ${Object.values(bag.bins || {}).filter(Boolean).length} / 4`
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
      Scene={ModMillScene}
      Lesson={ModSquadLesson}
      LessonOverlay={ModSquadLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 9 · MOD SQUAD"
      levelId="2-9"
      className="level-2-9"
      tools={['lash', 'blade']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-10"
    />
  )
}
