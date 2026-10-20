import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/abelianFord.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_10'
import AbelianFordScene, { ROW_Z, WORDS, isNormal, parse, show, tileX, totals } from '../../levels/w2/AbelianFordScene'
import ForgetOrderLesson, { ForgetOrderLessonOverlay } from '../../movies/w2/ForgetOrderLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

export default function Level2_10(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.abs(z - ROW_Z) > 1.2 || Math.abs(x) > 5) return
    const tiles = [...(bag.tiles?.[current] || parse(WORDS[current]))]
    const n = tiles.length
    if (!n) return
    const put = (next) => {
      setBag((b) => ({ ...b, tiles: { ...b.tiles, [current]: next } }))
      if (isNormal(next)) {
        sfxCorrect()
        const t = totals(next)
        flash(next.length ? `Normal form reached — totals $a$: ${t.a}, $b$: ${t.b}` : 'The word dissolved completely.', 3000)
        solve(current, goal.done, 1800)
      }
    }
    if (tool === 'clasp') {
      // the gap nearest the click
      let gi = -1
      let bd = 0.5
      for (let i = 0; i < n - 1; i++) {
        const d = Math.abs(x - (tileX(n, i) + tileX(n, i + 1)) / 2)
        if (d < bd) [gi, bd] = [i, d]
      }
      if (gi < 0) return flash('Clasp in the gap between two tiles to swap them.')
      ;[tiles[gi], tiles[gi + 1]] = [tiles[gi + 1], tiles[gi]]
      flash(`Swapped ${show(tiles[gi + 1])} and ${show(tiles[gi])} — fine in $H₁$, not in $π₁$.`)
      return put(tiles)
    }
    if (tool === 'blade') {
      const i = tiles.findIndex((_, k) => Math.abs(x - tileX(n, k)) < 0.55)
      if (i < 0) return
      const j = [i - 1, i + 1].find((k) => k >= 0 && k < n && tiles[k].l === tiles[i].l && tiles[k].e === -tiles[i].e)
      if (j === undefined) {
        sfxWrong()
        return flash(`${show(tiles[i])} has no inverse beside it. Swap one over first.`)
      }
      const next = tiles.filter((_, k) => k !== i && k !== j)
      flash(`${show(tiles[i])} and ${show(tiles[j])} cancel.`)
      return put(next)
    }
    sfxRefuse()
    flash('Clasp (5) swaps neighbours; Blade (7) cancels inverse pairs.')
  }

  const renderRules = ({ current, goal, bag }) => {
    const tiles = bag.tiles?.[current] || parse(WORDS[current])
    const t = totals(tiles)
    return (
      <>
        <h3>{STATIONS[current].blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        <p className="cells-line">
          <MathText text={`word: ${tiles.map(show).join(' ') || '(empty)'} · totals $a$: ${t.a}, $b$: ${t.b}`} />
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
      Scene={AbelianFordScene}
      Lesson={ForgetOrderLesson}
      LessonOverlay={ForgetOrderLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 10 · FORGET THE ORDER"
      levelId="2-10"
      className="level-2-10"
      tools={['lash', 'blade', 'clasp']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-1"
    />
  )
}
