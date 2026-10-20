import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-cube-root.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_1'
import CubeHallScene, { EDGES, H, PASS, SLOTS, TRAYS } from '../../levels/w4/CubeHallScene'
import CubeRootLesson, { CubeRootLessonOverlay } from '../../movies/w4/CubeRootLesson'
import { startCubeHallMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const PASS_STEPS = ['shrink both', 'slide f up, g down', 'slide past', 'line up', 'regrow: g + f']

export default function Level4_1(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'glass') {
      sfxRefuse()
      return flash('Use the Tide Glass (3).')
    }
    if (current === 'pinned') {
      const k = Object.keys(EDGES).find((e) => {
        const [p, q] = EDGES[e]
        const dx = q[0] - p[0]
        const dz = q[1] - p[1]
        const s = Math.max(0, Math.min(1, ((x - p[0]) * dx + (z - p[1]) * dz) / (dx * dx + dz * dz)))
        return Math.hypot(x - p[0] - s * dx, z - p[1] - s * dz) < 0.6
      })
      if (!k) return
      const pinned = { ...(bag.pinned || {}), [k]: true }
      setBag((b) => ({ ...b, pinned }))
      if (Object.keys(EDGES).every((e) => pinned[e])) {
        sfxCorrect()
        flash('All of $∂I²$ goes to $x₀$: a map $S² → X$.', 2800)
        solve(current, goal.done, 2000)
      }
      return
    }
    if (current === 'stack') {
      const crate = Object.keys(TRAYS).find((k) => near(x, z, TRAYS[k], 0.9))
      if (crate) return setBag((b) => ({ ...b, sel: { ...b.sel, stack: crate } }))
      if (Math.abs(x) > H || Math.abs(z) > H) return
      const sel = bag.sel?.stack
      if (!sel) return flash('Pick a cube from a crate first.')
      const slot = x < 0 ? 'L' : 'R'
      const want = sel === 'f' ? 'L' : 'R'
      if (slot !== want) {
        sfxWrong()
        return flash(`For $f + g$, $${sel}$ goes in the ${want === 'L' ? 'left' : 'right'} half.`)
      }
      const placed = { ...(bag.placed || {}), [sel]: slot }
      setBag((b) => ({ ...b, placed, sel: { ...b.sel, stack: null } }))
      if (placed.f && placed.g) {
        sfxCorrect()
        flash('$f + g$', 2400)
        solve(current, goal.done, 1800)
      }
      return
    }
    if (current === 'pass') {
      if (Math.abs(x) > H + 0.4 || Math.abs(z) > H + 0.4) return
      const st = Math.min((bag.stage?.pass || 0) + 1, PASS.length - 1)
      setBag((b) => ({ ...b, stage: { ...b.stage, pass: st } }))
      flash(`Step ${st}: ${PASS_STEPS[st - 1]}`)
      if (st === PASS.length - 1) {
        sfxCorrect()
        solve(current, goal.done, 2200)
      }
      return
    }
    // dim1
    if (Math.abs(x) > H + 0.4 || Math.abs(z) > 1.2) return
    const st = bag.stage?.dim1 || 0
    if (st === 0) {
      setBag((b) => ({ ...b, stage: { ...b.stage, dim1: 1 } }))
      return flash('Step 1: shrink both.')
    }
    setBag((b) => ({ ...b, blocked: true }))
    sfxWrong()
    flash('Step 2: slide past — but on a line there’s nowhere to go. They’d collide.', 3400)
    solve(current, goal.done, 2600)
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'pinned') line = `edges pinned: ${Object.keys(bag.pinned || {}).length} / 4`
    else if (current === 'stack') line = `placed: ${Object.keys(bag.placed || {}).join(', ') || 'none'}`
    else if (current === 'pass') line = `step ${bag.stage?.pass || 0} / ${PASS.length - 1}`
    else line = bag.blocked ? 'blocked' : `step ${bag.stage?.dim1 || 0}`
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
      Scene={CubeHallScene}
      Lesson={CubeRootLesson}
      LessonOverlay={CubeRootLessonOverlay}
      startMusic={startCubeHallMusic}
      kicker="WORLD 4 · LEVEL 1 · CUBE HALL"
      levelId="4-1"
      className="level-4-1"
      tools={['lash', 'glass']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-2"
    />
  )
}
