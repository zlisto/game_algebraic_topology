import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-9.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_9'
import PerfectPairingScene, { PIERS, lanternPos } from '../../levels/w3/PerfectPairingScene'
import PerfectPairingLesson, { PerfectPairingLessonOverlay } from '../../movies/w3/PerfectPairingLesson'
import { startPierMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function Level3_9(props) {
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
    const P = PIERS[current]
    const left = P.classes.find((c, i) => near(x, z, lanternPos(-1, i, P.classes.length), 0.9))
    if (left) return setBag((b) => ({ ...b, sel: { ...b.sel, [current]: left } }))
    const right = P.classes.find((c, i) => near(x, z, lanternPos(1, i, P.classes.length), 0.9))
    if (!right) return
    const a = bag.sel?.[current]
    if (!a) return flash('Pick a class on the left first.')
    const v = P.table[a][right]
    setBag((b) => ({ ...b, last: { ...b.last, [current]: v } }))
    if (current === 'wedge_dark') {
      setBag((b) => ({ ...b, found: { ...b.found, wedge_dark: { α: 0 } } }))
      sfxCorrect()
      flash('$α ⌣ α = 0$ on $S² ∨ S⁴$: no partner.', 3000)
      return solve(current, goal.done, 2200)
    }
    if (Math.abs(v) !== 1) {
      sfxWrong()
      return flash(`$${a} ⌣ ${right}$ reads $0$ on the top class — not a partner.`)
    }
    const found = { ...(bag.found?.[current] || {}), [a]: v }
    setBag((b) => ({ ...b, found: { ...b.found, [current]: found }, sel: { ...b.sel, [current]: null } }))
    flash(`$(${a} ⌣ ${right})[M] = ${v > 0 ? '+1' : '−1'}$ — partners.`)
    if (P.classes.every((c) => found[c] !== undefined)) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const P = PIERS[current]
    const found = bag.found?.[current] || {}
    return (
      <>
        <h3>{STATIONS[current].blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        <p className="cells-line">
          <MathText text={`${P.space} · partnered: ${Object.keys(found).length} / ${P.classes.length}${bag.sel?.[current] ? ` · picked $${bag.sel[current]}$` : ''}`} />
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
      Scene={PerfectPairingScene}
      Lesson={PerfectPairingLesson}
      LessonOverlay={PerfectPairingLessonOverlay}
      startMusic={startPierMusic}
      kicker="WORLD 3 · LEVEL 9 · PAIRING PIER"
      levelId="3-9"
      className="level-3-9"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="The Counterfeit Station"
    />
  )
}
