import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-3.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_3'
import FrontFaceScene, { LEVERS, TRIS, V, torusCup } from '../../levels/w3/FrontFaceScene'
import FrontFaceLesson, { FrontFaceLessonOverlay } from '../../movies/w3/FrontFaceLesson'
import { startLanternMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r = 1.0) => Math.hypot(x - px, z - pz) < r
/** The edge [a b] nearest a click (within 0.5). */
function edgeAt(x, z, keys) {
  let best = null
  let bd = 0.5
  for (const k of keys) {
    const [a, b] = k.split('-').map(Number)
    const [p, q] = [V[a], V[b]]
    const dx = q[0] - p[0]
    const dz = q[1] - p[1]
    const s = Math.max(0, Math.min(1, ((x - p[0]) * dx + (z - p[1]) * dz) / (dx * dx + dz * dz)))
    const d = Math.hypot(x - p[0] - s * dx, z - p[1] - s * dz)
    if (d < bd) [best, bd] = [k, d]
  }
  return best
}
/** Which torus triangle a click is inside: below the diagonal (x > z… in deck coords) is L. */
const triAt = (x, z) => (Math.abs(x) > 2.3 || Math.abs(z) > 2.3 ? null : x + z > 0 ? 'L' : 'U')

export default function Level3_3(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'caster') {
      sfxRefuse()
      return flash('Cast with the Cup Caster (9).')
    }
    if (current === 'front_back') {
      const k = edgeAt(x, z, ['0-1', '1-2', '0-2'])
      if (!k) return
      const picks = bag.picks?.front_back || []
      const want = picks.length === 0 ? '0-1' : '1-2'
      if (k !== want) {
        sfxWrong()
        return flash(picks.length === 0 ? 'φ reads the front face: the edge from $v₀$ to $v₁$.' : 'ψ reads the back face: the edge from $v₁$ to $v₂$.', 3000)
      }
      const next = [...picks, k]
      setBag((b) => ({ ...b, picks: { ...b.picks, front_back: next } }))
      if (next.length === 2) {
        sfxCorrect()
        flash('$(φ ⌣ ψ)[v₀v₁v₂] = φ[v₀v₁] · ψ[v₁v₂] = 2 · 3 = 6$', 3200)
        return solve(current, goal.done, 2000)
      }
      return flash('$φ[v₀v₁] = 2$ — now ψ’s back face.')
    }
    if (current === 'light_row') {
      const pair = { f: 'α', g: 'α', ...(bag.pair || {}) }
      for (const side of ['f', 'g']) {
        if (near(x, z, LEVERS[side])) {
          pair[side] = pair[side] === 'α' ? 'β' : 'α'
          setBag((b) => ({ ...b, pair, cast: { ...b.cast, light_row: {} } }))
          return
        }
      }
      if (!near(x, z, LEVERS.cast)) return
      const c = torusCup(pair.f, pair.g)
      setBag((b) => ({ ...b, cast: { ...b.cast, light_row: { L: true, U: true } } }))
      if (c.total === 1) {
        sfxCorrect()
        return solve(current, goal.done, 2000)
      }
      sfxWrong()
      return flash(`$${pair.f} ⌣ ${pair.g}$ reads ${c.total === 0 ? '$0$' : '$−1$'} on the torus.`, 2800)
    }
    const tri = triAt(x, z)
    if (!tri) return
    const cast = { ...(bag.cast?.[current] || {}), [tri]: true }
    setBag((b) => ({ ...b, cast: { ...b.cast, [current]: cast } }))
    const pair = current === 'swap' ? ['β', 'α'] : ['α', 'β']
    const c = torusCup(...pair)
    const [a, bb, cc] = TRIS[tri].v
    flash(`$(${pair[0]} ⌣ ${pair[1]})[v${a}v${bb}v${cc}] = ${pair[0]}[v${a}v${bb}] · ${pair[1]}[v${bb}v${cc}] = ${c[tri]}$`, 3000)
    if (cast.L && cast.U) {
      sfxCorrect()
      solve(current, goal.done, 2400)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'front_back') line = `picked: ${(bag.picks?.front_back || []).map((k) => `[v${k[0]}v${k[2]}]`).join(', ') || 'none'}`
    else if (current === 'light_row') {
      const p = { f: 'α', g: 'α', ...(bag.pair || {}) }
      line = `front $${p.f}$ · back $${p.g}$`
    } else line = `cast on: ${Object.keys(bag.cast?.[current] || {}).length} / 2 triangles`
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
      Scene={FrontFaceScene}
      Lesson={FrontFaceLesson}
      LessonOverlay={FrontFaceLessonOverlay}
      startMusic={startLanternMusic}
      kicker="WORLD 3 · LEVEL 3 · LANTERN ROWS"
      levelId="3-3"
      className="level-3-3"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-4"
    />
  )
}
