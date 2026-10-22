import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-obstruction.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_12'
import ObstructionScene, { BLOCKS, CELLS, CELL_Z, DOORS, REROUTE, SEAL, SHARE, cellX } from '../../levels/w4/ObstructionScene'
import ObstructionLesson, { ObstructionLessonOverlay } from '../../movies/w4/ObstructionLesson'
import { startObstructionMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const KS = [-2, -1, 0, 1, 2]

export default function Level4_12(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'smith' && tool !== 'caster') {
      sfxRefuse()
      return flash('Cell Hammer (2) or Cup Caster (9) here.')
    }

    if (current === 'cell') {
      if (tool !== 'smith') return flash('Extend with the Cell Hammer (2).')
      const i = CELLS.findIndex((_, i) => near(x, z, [cellX(i), CELL_Z], 0.85))
      if (i < 0) return
      const c = CELLS[i]
      if (bag.ext?.[c.id]) return
      if (!c.ok) {
        sfxWrong()
        setBag((b) => ({ ...b, tried: c.id }))
        return flash('Its boundary is a map $S² → S²$ — an element of $π₂(S²) = ℤ$. Nothing guarantees it’s $0$.', 3200)
      }
      const ext = { ...(bag.ext || {}), [c.id]: true }
      setBag((b) => ({ ...b, ext }))
      sfxCorrect()
      if (CELLS.every((c) => !c.ok || ext[c.id])) solve(current, goal.done, 1800)
      return
    }

    if (current === 'blocked') {
      const i = BLOCKS.findIndex((_, i) => near(x, z, [cellX(i, 3), CELL_Z], 0.95))
      if (i < 0) return
      const read = { ...(bag.read || {}) }
      const ext = { ...(bag.ext || {}) }
      if (tool === 'caster') read[i] = true
      else if (BLOCKS[i] === 0) {
        ext[i] = true
        read[i] = true
        sfxCorrect()
      } else {
        read[i] = true
        sfxWrong()
        flash(`Boundary of degree ${BLOCKS[i]}: $ω ≠ 0$. Blocked.`, 2400)
      }
      setBag((b) => ({ ...b, read, ext }))
      if (BLOCKS.every((d, j) => read[j] && (d !== 0 || ext[j]))) solve(current, goal.done, 1800)
      return
    }

    if (current === 'reroute') {
      const round = bag.round || 0
      const [a0, b0] = REROUTE[round]
      const k = bag.k || 0
      if (near(x, z, SHARE, 0.8)) {
        if (tool !== 'caster') return flash('Twist the shared cell with the Cup Caster (9).')
        const nk = KS[(KS.indexOf(k) + 1) % KS.length]
        setBag((b) => ({ ...b, k: nk }))
        if (a0 + nk === 0 && b0 - nk === 0) {
          sfxCorrect()
          flash('Both obstructions cleared — the class was $0$.', 2400)
          setTimeout(() => setBag((b) => ({ ...b, round: round + 1, k: 0 })), 1800)
        }
        return
      }
      if (near(x, z, SEAL, 0.8)) {
        if (a0 + b0 === 0) {
          sfxWrong()
          return flash(`$A + B = ${a0 + b0}$: the class is $0$. A twist will clear it.`, 2600)
        }
        sfxCorrect()
        flash(`$A + B = ${a0 + b0}$ whatever you twist: the class is nonzero.`, 2600)
        solve(current, goal.done, 2200)
      }
      return
    }

    // summit
    if (tool !== 'smith') return flash('Open doors with the Cell Hammer (2).')
    const i = DOORS.findIndex((_, i) => near(x, z, [cellX(i), 0.6], 0.9))
    if (i < 0) return
    const d = DOORS[i]
    if (bag.opened?.[d.id]) return
    if (!d.open) {
      sfxWrong()
      setBag((b) => ({ ...b, tried: d.id }))
      return flash(`${d.groups} — not zero, so nothing guarantees it.`, 2800)
    }
    const opened = { ...(bag.opened || {}), [d.id]: true }
    setBag((b) => ({ ...b, opened }))
    sfxCorrect()
    if (DOORS.every((d) => !d.open || opened[d.id])) solve(current, goal.done, 1800)
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'cell') line = `extended ${Object.keys(bag.ext || {}).length} / ${CELLS.filter((c) => c.ok).length}`
    else if (current === 'blocked') line = `read ${Object.keys(bag.read || {}).length} / ${BLOCKS.length}`
    else if (current === 'reroute') {
      const [a0, b0] = REROUTE[Math.min(bag.round || 0, 1)]
      const k = bag.k || 0
      line = `round ${(bag.round || 0) + 1} / 2 · A = ${a0 + k}, B = ${b0 - k}`
    } else line = `doors open ${Object.keys(bag.opened || {}).length} / ${DOORS.filter((d) => d.open).length}`
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
      Scene={ObstructionScene}
      Lesson={ObstructionLesson}
      LessonOverlay={ObstructionLessonOverlay}
      startMusic={startObstructionMusic}
      kicker="WORLD 4 · LEVEL 12 · OBSTRUCTION COURSE"
      levelId="4-12"
      className="level-4-12"
      tools={['lash', 'smith', 'caster']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Title"
    />
  )
}
