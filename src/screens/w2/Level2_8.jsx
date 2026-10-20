import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/patchworkFields.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_8'
import PatchworkScene, { CANDIDATES, PADS, ROWS, ROW_Z, rowX } from '../../levels/w2/PatchworkScene'
import PatchworkLesson, { PatchworkLessonOverlay } from '../../movies/w2/PatchworkLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r = 1.1) => Math.hypot(x - px, z - pz) < r

export default function Level2_8(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    const p = { ...(bag.patches?.[current] || {}) }
    const pad = Object.keys(PADS).find((k) => near(x, z, PADS[k]))
    if (pad) {
      if (tool !== 'clasp') {
        sfxRefuse()
        return flash('Clasp patches on with the Van Kampen Clasp (5).')
      }
      if (p[pad]) return flash(`Patch ${pad} is already on.`)
      p[pad] = true
      setBag((b) => ({ ...b, patches: { ...b.patches, [current]: p } }))
      return flash(p.A && p.B ? 'Both patches on — the Mayer–Vietoris row appears to the north.' : `Patch ${pad} on.`)
    }
    if (!(p.A && p.B)) return
    const row = ROWS[current]
    const j = row.row.findIndex(([, g]) => g === '?')
    if (!near(x, z, [rowX(row.row.length, j), ROW_Z], 1.0)) return
    if (tool !== 'blade') {
      sfxRefuse()
      return flash('Try a group with the Boundary Blade (7).')
    }
    const g = CANDIDATES[(CANDIDATES.indexOf(bag.pick?.[current]) + 1) % CANDIDATES.length]
    setBag((b) => ({ ...b, pick: { ...b.pick, [current]: g } }))
    if (g === row.answer) {
      sfxCorrect()
      flash(`$${g}$ — the row is exact.`, 2800)
      return solve(current, goal.done, 1800)
    }
    flash(`$${g}$ doesn’t make the row exact.`)
  }

  const renderRules = ({ current, goal, bag }) => {
    const p = bag.patches?.[current] || {}
    const line = !(p.A && p.B) ? `patches: ${['A', 'B'].filter((k) => p[k]).join(', ') || 'none'}` : `${ROWS[current].title} · unknown: ${bag.pick?.[current] || '?'}`
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
      Scene={PatchworkScene}
      Lesson={PatchworkLesson}
      LessonOverlay={PatchworkLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 8 · PATCHWORK"
      levelId="2-8"
      className="level-2-8"
      tools={['lash', 'blade', 'clasp']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-9"
    />
  )
}
