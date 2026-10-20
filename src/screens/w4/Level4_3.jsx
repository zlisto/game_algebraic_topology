import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-weak-spot.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_3'
import WeakSpotScene, { PAIRS, ROOMS, meterPos } from '../../levels/w4/WeakSpotScene'
import WeakSpotLesson, { WeakSpotLessonOverlay } from '../../movies/w4/WeakSpotLesson'
import { startWeakSpotMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const NEXT_BIN = { undefined: 'yes', yes: 'no', no: undefined }

export default function Level4_3(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'wand') {
      sfxRefuse()
      return flash('Use the Reading Wand (0).')
    }
    if (current === 'sort') {
      const p = PAIRS.find((q) => Math.abs(x - q.at[0]) < 1.4 && Math.abs(z - q.at[1]) < 0.8)
      if (!p) return
      const bins = { ...(bag.bins || {}) }
      bins[p.id] = NEXT_BIN[bins[p.id]]
      setBag((b) => ({ ...b, bins }))
      if (PAIRS.every((q) => bins[q.id] === (q.ok ? 'yes' : 'no'))) {
        sfxCorrect()
        solve(current, goal.done, 1800)
      }
      return
    }
    const R = ROOMS[current]
    const n = [1, 2, 3].find((k) => near(x, z, meterPos(-1, k), 0.9))
    if (!n) return
    const sent = { ...(bag.sent?.[current] || {}), [n]: true }
    setBag((b) => ({ ...b, sent: { ...b.sent, [current]: sent } }))
    const g = `π${'₁₂₃'[n - 1]}`
    if (!R.map) flash(`$${g}$: ${R.gx[n - 1]} and ${R.gy[n - 1]} — equal, but there’s no map to carry it.`, 3000)
    else if (R.iso[n - 1]) flash(`$f_*$ on $${g}$: an isomorphism.`)
    else {
      sfxWrong()
      flash(`$f_*$ on $${g}$: ${R.gx[n - 1]} → ${R.gy[n - 1]} — not an isomorphism.`, 2800)
    }
    if ([1, 2, 3].every((k) => sent[k])) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const line = current === 'sort' ? `marked: ${Object.values(bag.bins || {}).filter(Boolean).length} / 4` : `couriers sent: ${Object.keys(bag.sent?.[current] || {}).length} / 3`
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
      Scene={WeakSpotScene}
      Lesson={WeakSpotLesson}
      LessonOverlay={WeakSpotLessonOverlay}
      startMusic={startWeakSpotMusic}
      kicker="WORLD 4 · LEVEL 3 · WEAK SPOT"
      levelId="4-3"
      className="level-4-3"
      tools={['lash', 'wand']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-4"
    />
  )
}
