import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-maps-classes.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_9'
import MapsClassesScene, { LEVERS, READ_TARGET, TARGETS, cls } from '../../levels/w4/MapsClassesScene'
import MapsClassesLesson, { MapsClassesLessonOverlay } from '../../movies/w4/MapsClassesLesson'
import { startClassingMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const DEGS = [-3, -2, -1, 0, 1, 2, 3]
const nextDeg = (d) => DEGS[(DEGS.indexOf(d) + 1) % DEGS.length]

export default function Level4_9(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'caster') {
      sfxRefuse()
      return flash('Turn levers with the Cup Caster (9).')
    }
    if (current === 'pull') {
      if (!near(x, z, LEVERS.d, 1.0)) return
      const d = nextDeg(bag.d ?? 1)
      const step = bag.step || 0
      setBag((b) => ({ ...b, d }))
      if (d === TARGETS[step]) {
        sfxCorrect()
        flash(`degree ${d}: $f*ι = ${cls(d)}$ ✓`, 2400)
        setBag((b) => ({ ...b, step: step + 1 }))
        if (step + 1 === TARGETS.length) solve(current, goal.done, 2000)
      }
      return
    }
    const side = near(x, z, LEVERS.a, 1.0) ? 'wa' : near(x, z, LEVERS.b, 1.0) ? 'wb' : null
    if (!side) return
    const v = nextDeg(bag[side] ?? 0)
    const nb = { ...bag, [side]: v }
    setBag((b) => ({ ...b, [side]: v }))
    if ((nb.wa ?? 0) === READ_TARGET.a && (nb.wb ?? 0) === READ_TARGET.b) {
      sfxCorrect()
      flash(`The class $${cls(READ_TARGET.a, READ_TARGET.b)}$.`, 2600)
      solve(current, goal.done, 2000)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const line = current === 'pull' ? `degree ${bag.d ?? 1} · class $${cls(bag.d ?? 1)}$ · found ${bag.step || 0} / 2` : `class $${cls(bag.wa ?? 0, bag.wb ?? 0)}$`
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
      Scene={MapsClassesScene}
      Lesson={MapsClassesLesson}
      LessonOverlay={MapsClassesLessonOverlay}
      startMusic={startClassingMusic}
      kicker="WORLD 4 · LEVEL 9 · CLASSING ROOM"
      levelId="4-9"
      className="level-4-9"
      tools={['lash', 'caster']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-10"
    />
  )
}
