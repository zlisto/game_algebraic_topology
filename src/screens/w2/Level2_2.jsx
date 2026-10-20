import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/cancelMarsh.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice, judgeCycle, rimDone } from '../../levels/w2/stages2_2'
import CancelMarshScene, { COMPLEXES, RIM } from '../../levels/w2/CancelMarshScene'
import { pickCell } from '../../levels/w2/ChainDeck'
import BoundaryBladeLesson, { BoundaryBladeLessonOverlay } from '../../movies/w2/BoundaryBladeLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const cycle = (n) => (n === 0 ? 1 : n === 1 ? -1 : 0)
const edgeName = (k) => `$[v${k[0]}v${k[2]}]$`

export default function Level2_2(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    const hit = pickCell(COMPLEXES[current], x, z)
    if (!hit) return
    if (tool !== 'blade') {
      sfxRefuse()
      return flash('Equip the Boundary Blade (7) to work the chains.')
    }
    const put = (field, value) => setBag((b) => ({ ...b, [field]: { ...b[field], [current]: value } }))

    if (current === 'first_cut') {
      if (!hit.tri) return flash('Cut the triangle itself — click inside it.')
      put('tri', { '0-1-2': 1 })
      sfxCorrect()
      flash('$∂[v₀v₁v₂]$: two edges $+1$, one edge $−1$', 3200)
      return solve(current, goal.done, 1600)
    }
    if (current === 'shared') {
      if (!hit.tri) return flash('Click inside a triangle to change its coefficient.')
      const tri = { ...(bag.tri?.shared || {}) }
      tri[hit.tri] = cycle(tri[hit.tri] || 0)
      put('tri', tri)
      if (rimDone(tri)) {
        sfxCorrect()
        flash('Only the rim is left: $[v₀v₁] + [v₁v₂] + [v₂v₃] − [v₀v₃]$', 3400)
        solve(current, goal.done, 1800)
      }
      return
    }
    if (current === 'nothing') {
      if (!hit.edge) return flash('Cut the rim edges themselves.')
      const spent = { ...(bag.spent?.nothing || {}) }
      if (spent[hit.edge]) return flash(`${edgeName(hit.edge)} is already cut.`)
      spent[hit.edge] = true
      put('spent', spent)
      const [a, b] = hit.edge.split('-')
      const n = RIM[hit.edge]
      flash(n > 0 ? `$∂[v${a}v${b}] = v${b} − v${a}$` : `$−∂[v${a}v${b}] = v${a} − v${b}$`)
      if (Object.keys(spent).length === 4) {
        sfxCorrect()
        solve(current, goal.done, 1800)
      }
      return
    }
    // missing
    if (!hit.edge) return flash('Edges only on this deck — click an edge.')
    const edge = { ...(bag.edge?.missing || {}) }
    edge[hit.edge] = cycle(edge[hit.edge] || 0)
    put('edge', edge)
    const j = judgeCycle(edge)
    if (j === 'boundary') {
      sfxWrong()
      flash('That loop is $∂[v₀v₁v₂]$ — it bounds the filled tile, so it’s no hole.', 3600)
    } else if (j === 'hole') {
      sfxCorrect()
      flash('Zero boundary at every vertex, and it bounds nothing: a hole.', 3600)
      solve(current, goal.done, 1800)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'shared') {
      const tri = bag.tri?.shared || {}
      line = `chain: ${Object.entries(tri).filter(([, n]) => n).map(([k, n]) => `${n > 0 ? '+' : '−'}[${k.replace(/-/g, ' ')}]`).join(' ') || '0'}`
    } else if (current === 'nothing') line = `edges cut: ${Object.keys(bag.spent?.nothing || {}).length} / 4`
    else if (current === 'missing') {
      const j = judgeCycle(bag.edge?.missing || {})
      line = { none: 'no edges chosen yet', open: 'not a cycle yet: a vertex has a leftover', boundary: 'a cycle — but it bounds the filled tile', hole: 'a cycle that bounds nothing' }[j]
    }
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
      Scene={CancelMarshScene}
      Lesson={BoundaryBladeLesson}
      LessonOverlay={BoundaryBladeLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 2 · BOUNDARY ISSUES"
      levelId="2-2"
      className="level-2-2"
      tools={['lash', 'blade']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-3"
    />
  )
}
