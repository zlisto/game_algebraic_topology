import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-one-group.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_5'
import OneGroupScene, { KILLS, SPACES, meterPos } from '../../levels/w4/OneGroupScene'
import OneGroupLesson, { OneGroupLessonOverlay } from '../../movies/w4/OneGroupLesson'
import { startOneGroupMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const NEXT = { undefined: 'yes', yes: 'no', no: undefined }

export default function Level4_5(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'smith') {
      sfxRefuse()
      return flash('Use the Cell-Smith (2).')
    }
    if (current === 'recall') {
      const s = SPACES.find((q) => near(x, z, q.at, 0.9))
      if (!s) return
      const marks = { ...(bag.marks || {}) }
      marks[s.id] = NEXT[marks[s.id]]
      setBag((b) => ({ ...b, marks }))
      if (marks[s.id] && (marks[s.id] === 'yes') !== s.k) {
        sfxWrong()
        flash(`${s.name}: ${s.why}.`, 3000)
      } else if (marks[s.id]) flash(`${s.name}: ${s.why}.`, 2600)
      if (SPACES.every((q) => marks[q.id] === (q.k ? 'yes' : 'no'))) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }
    const i = KILLS.findIndex((_, k) => near(x, z, meterPos(k), 0.9))
    if (i < 0) return
    const killed = bag.killed || 0
    if (i < killed) return flash('Already killed.')
    if (i > killed) {
      sfxWrong()
      return flash(`Bottom up: kill $π${'₀₁₂₃₄₅'[KILLS[killed].n]}$ first — new cells can change the groups above them.`, 3200)
    }
    setBag((b) => ({ ...b, killed: killed + 1 }))
    flash(`Attached ${KILLS[i].cell} cells: $π${'₀₁₂₃₄₅'[KILLS[i].n]} = 0$, lower groups untouched.`)
    if (killed + 1 === KILLS.length) {
      sfxCorrect()
      solve(current, goal.done, 2200)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    const line = current === 'recall' ? `marked: ${Object.values(bag.marks || {}).filter(Boolean).length} / ${SPACES.length}` : `killed: ${bag.killed || 0} / ${KILLS.length}`
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
      Scene={OneGroupScene}
      Lesson={OneGroupLesson}
      LessonOverlay={OneGroupLessonOverlay}
      startMusic={startOneGroupMusic}
      kicker="WORLD 4 · LEVEL 5 · ONE GROUP"
      levelId="4-5"
      className="level-4-5"
      tools={['lash', 'smith']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-6"
    />
  )
}
