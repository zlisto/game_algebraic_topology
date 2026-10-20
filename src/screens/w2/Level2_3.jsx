import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/singularShallows.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_3'
import SingularShallowsScene, { PATHS, POND, bendLoop, buoysMet, loopStart, turns } from '../../levels/w2/SingularShallowsScene'
import AnySimplexLesson, { AnySimplexLessonOverlay } from '../../movies/w2/AnySimplexLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const cycle = (n) => (n === 0 ? 1 : n === 1 ? -1 : 0)

/** The path nearest a click (within 0.5), on a deck with paths. */
function pickPath(list, x, z) {
  let best = null
  let bd = 0.5
  for (const p of list) {
    for (const [px, pz] of p.pts) {
      const d = Math.hypot(x - px, z - pz) - (p.pts.length === 1 ? 0.15 : 0)
      if (d < bd) [best, bd] = [p, d]
    }
  }
  return best
}

/** The chain on the Pieces deck: {totals at each point, whole turns round the pond}. */
export function piecesChain(coef) {
  const totals = { 0: 0, 1: 0, 2: 0, 3: 0 }
  let w = 0
  for (const p of PATHS.pieces) {
    const n = coef[p.id] || 0
    totals[p.to] += n
    totals[p.from] -= n
    w += n * turns(p)
  }
  return { totals, isCycle: Object.values(totals).every((v) => v === 0), any: Object.values(coef).some(Boolean), w: Math.round(w) }
}

export default function Level2_3(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    const put = (field, value) => setBag((b) => ({ ...b, [field]: { ...b[field], [current]: value } }))

    if (current === 'any_tri' || current === 'pieces') {
      const p = pickPath(PATHS[current], x, z)
      if (!p) return
      if (tool !== 'blade') {
        sfxRefuse()
        return flash('Paths are cut with the Boundary Blade (7).')
      }
      if (current === 'any_tri') {
        const spent = { ...(bag.spent?.any_tri || {}) }
        if (spent[p.id]) return flash('Already cut.')
        spent[p.id] = true
        put('spent', spent)
        flash(p.from === p.to ? '$∂$(constant path) $= p₃ − p₃ = 0$' : '$∂σ = p₁ − p₀$', 2600)
        if (Object.keys(spent).length === 4) {
          sfxCorrect()
          solve(current, goal.done, 1600)
        }
        return
      }
      const coef = { ...(bag.coef?.pieces || {}) }
      coef[p.id] = cycle(coef[p.id] || 0)
      put('coef', coef)
      const c = piecesChain(coef)
      if (c.any && c.isCycle && c.w !== 0) {
        sfxCorrect()
        flash(`A cycle round the pond (${Math.abs(c.w)} time${Math.abs(c.w) > 1 ? 's' : ''})`, 3000)
        solve(current, goal.done, 1700)
      } else if (c.any && c.isCycle) {
        sfxWrong()
        flash('A cycle — but it doesn’t go round the pond. The stone between its paths fills it in.', 3600)
      }
      return
    }
    if (tool !== 'glass') {
      sfxRefuse()
      return flash('Use the Tide Glass (3) here.')
    }
    if (Math.hypot(x, z) < POND + 0.15) {
      sfxRefuse()
      return flash('The pond isn’t part of the space — nothing can go through it.')
    }
    if (current === 'bend') {
      const loop = bendLoop(bag.loop || loopStart(), x, z)
      setBag((b) => ({ ...b, loop }))
      if (buoysMet(loop).every(Boolean)) {
        sfxCorrect()
        flash('All three buoys — and it still goes round the pond once.', 3000)
        solve(current, goal.done, 1700)
      }
      return
    }
    // same
    const k = Math.min(3, (bag.squeeze || 0) + 1)
    setBag((b) => ({ ...b, squeeze: k }))
    if (k === 3) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'any_tri') line = `cut: ${Object.keys(bag.spent?.any_tri || {}).length} / 4`
    else if (current === 'pieces') {
      const c = piecesChain(bag.coef?.pieces || {})
      line = !c.any ? 'no paths chosen yet' : !c.isCycle ? 'not a cycle yet: a point has a leftover' : c.w ? `a cycle, round the pond ${Math.abs(c.w)}×` : 'a cycle, but not round the pond'
    } else if (current === 'bend') line = `buoys: ${buoysMet(bag.loop || loopStart()).filter(Boolean).length} / 3 · round the pond: 1×`
    else if (current === 'same') line = `squeezed: ${bag.squeeze || 0} / 3`
    return (
      <>
        <h3>{STATIONS[current].blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        {line && <p className="cells-line">{line}</p>}
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
      Scene={SingularShallowsScene}
      Lesson={AnySimplexLesson}
      LessonOverlay={AnySimplexLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 3 · ANY SIMPLEX WILL DO"
      levelId="2-3"
      className="level-2-3"
      tools={['lash', 'blade', 'glass']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-4"
    />
  )
}
