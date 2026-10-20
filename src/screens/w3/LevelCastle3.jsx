/**
 * Castle 3 — The Counterfeit Station. The Commutator's three disguises, each unmasked by a cup product:
 * the façade (3-4), false powers (3-6), no twin (3-9).
 */
import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-castle.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stagesCastle3'
import CounterfeitScene, { POWER_FOUNTS } from '../../levels/w3/CounterfeitScene'
import { ISLES } from '../../levels/w3/CupCounterexampleScene'
import { lanternPos } from '../../levels/w3/PerfectPairingScene'
import { startGardensMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r

export default function LevelCastle3(props) {
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

    if (current === 'facade') {
      const k = near(x, z, [ISLES.T[0], -2.4], 1.1) ? 'T' : near(x, z, [ISLES.X[0], -2.4], 1.1) ? 'X' : null
      if (!k) return
      const c = { ...(bag.cast?.nulls_answer || {}), [k]: true }
      setBag((b) => ({ ...b, cast: { ...b.cast, nulls_answer: c } }))
      flash(k === 'T' ? '$α ⌣ β$ on the torus: $1$.' : '$α ⌣ β$ on his “torus”: $0$.')
      if (c.T && c.X) {
        sfxCorrect()
        solve(current, goal.done, 2200)
      }
      return
    }

    if (current === 'false_powers') {
      const { real, fake } = POWER_FOUNTS
      if (near(x, z, real.at, 1.7)) {
        const p = bag.cp ?? 1
        if (p >= 2) return flash('$α³ = 0$ on $ℂP²$ — the top is $α²$.')
        setBag((b) => ({ ...b, cp: 2 }))
        sfxCorrect()
        flash('$α²$ lights $H⁴(ℂP²)$.')
        if (bag.fake) solve(current, goal.done, 2200)
        return
      }
      if (near(x, z, fake.at, 1.7)) {
        if (bag.fake) return
        setBag((b) => ({ ...b, fake: true }))
        sfxWrong()
        flash('On $S² ∨ S⁴$, $α ⌣ α = 0$ — the $H⁴$ class isn’t $α²$.', 3000)
        if ((bag.cp ?? 1) >= 2) solve(current, goal.done, 2400)
      }
      return
    }

    // no_twin: the wedge_dark pier of 3-9
    if (near(x, z, lanternPos(-1, 0, 1), 0.9)) return setBag((b) => ({ ...b, sel: { ...b.sel, wedge_dark: 'α' } }))
    if (!near(x, z, lanternPos(1, 0, 1), 0.9)) return
    if (!bag.sel?.wedge_dark) return flash('Pick $α$ on the left first.')
    setBag((b) => ({ ...b, last: { ...b.last, wedge_dark: 0 }, found: { ...b.found, wedge_dark: { α: 0 } } }))
    sfxCorrect()
    flash('$α ⌣ α = 0$ on $S² ∨ S⁴$: no partner.', 3000)
    solve(current, goal.done, 2200)
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'facade') line = `lanterns: ${Object.keys(bag.cast?.nulls_answer || {}).length} / 2`
    else if (current === 'false_powers') line = `$ℂP²$: up to ${(bag.cp ?? 1) >= 2 ? '$α²$' : '$α$'} · his: ${bag.fake ? '$α² = 0$' : 'untested'}`
    else line = bag.sel?.wedge_dark ? 'picked $α$ — now cast on the right' : 'pick $α$ on the left'
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
      Scene={CounterfeitScene}
      startMusic={startGardensMusic}
      kicker="WORLD 3 · CASTLE · THE COUNTERFEIT STATION"
      levelId="c-3"
      title="The Counterfeit Station"
      className="level-castle-3"
      tools={['lash', 'caster']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Up the Spire"
    />
  )
}
