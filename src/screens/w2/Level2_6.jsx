import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/dynamoGate.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_6'
import DynamoGateScene, { MESSY, MIRROR_LEVERS, SR, WRAP_LEVERS, axisFromClick, minus, net, tighten } from '../../levels/w2/DynamoGateScene'
import ThirdDegreeLesson, { ThirdDegreeLessonOverlay } from '../../movies/w2/ThirdDegreeLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const POWERS = [-3, -2, -1, 0, 1, 2, 3]
const near = (x, z, [px, pz], r = 1) => Math.hypot(x - px, z - pz) < r

export default function Level2_6(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return
    if (tool !== 'dial') {
      sfxRefuse()
      return flash('Use the Degree Dial (8).')
    }
    if (current === 'hollow') {
      if (Math.hypot(x, z) > 4.2) return
      const segs = tighten(bag.segs || MESSY)
      setBag((b) => ({ ...b, segs }))
      if (segs.length === 1) {
        sfxCorrect()
        flash(`Tight: ${net(segs)} turns round the post.`, 2600)
        return solve(current, goal.done, 1800)
      }
      return flash(`One back-and-forth gone — still ${net(segs)} turns net.`)
    }
    if (current === 'wrap') {
      const w = { a: 1, b: 1, ...(bag.wrap || {}) }
      const which = near(x, z, WRAP_LEVERS.a, 1.2) ? 'a' : near(x, z, WRAP_LEVERS.b, 1.2) ? 'b' : null
      if (!which) return flash('Click one of the two levers.')
      w[which] = POWERS[(POWERS.indexOf(w[which]) + 1) % POWERS.length]
      setBag((b) => ({ ...b, wrap: w }))
      if (w.a * w.b === -6) {
        sfxCorrect()
        flash(`$deg(f ∘ g) = ${minus(w.a)} · ${minus(w.b)} = −6$`, 2600)
        solve(current, goal.done, 1800)
      }
      return
    }
    if (current === 'antipode') {
      const which = Object.keys(MIRROR_LEVERS).find((k) => near(x, z, MIRROR_LEVERS[k], 1.1))
      if (!which) return flash('Click one of the three mirror levers.')
      const m = { ...(bag.mirrors || {}) }
      m[which] = !m[which]
      setBag((b) => ({ ...b, mirrors: m }))
      const k = Object.values(m).filter(Boolean).length
      flash(`${k} reflection${k === 1 ? '' : 's'}: degree $${k % 2 ? '−1' : '+1'}$`)
      if (m.x && m.y && m.z) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    // hairy
    if (Math.hypot(x, z) > SR + 0.6) return flash('Click on the sphere.')
    const n = (bag.combs || 0) + 1
    setBag((b) => ({ ...b, axis: axisFromClick(x, z), combs: n }))
    flash(`Combed round a new axis — calm spots: still 2.`)
    if (n >= 3) {
      sfxCorrect()
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'hollow') line = `net turns: ${net(bag.segs || MESSY)}`
    else if (current === 'wrap') {
      const { a = 1, b = 1 } = bag.wrap || {}
      line = `$deg(f ∘ g) = ${minus(a)} · ${minus(b)} = ${minus(a * b)}$ · target $−6$`
    } else if (current === 'antipode') {
      const k = Object.values(bag.mirrors || {}).filter(Boolean).length
      line = `mirrors on: ${k} · degree $${k % 2 ? '−1' : '+1'}$`
    } else line = `combings: ${bag.combs || 0} / 3 · calm spots: 2`
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
      Scene={DynamoGateScene}
      Lesson={ThirdDegreeLesson}
      LessonOverlay={ThirdDegreeLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 6 · THE THIRD DEGREE"
      levelId="2-6"
      className="level-2-6"
      tools={['lash', 'dial']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-7"
    />
  )
}
