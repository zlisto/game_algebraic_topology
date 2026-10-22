import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/tileYard.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_1'
import TileYardScene, { ARROWS, PRESS, SPLIT, START_ARROWS } from '../../levels/w2/TileYardScene'
import TileYardLesson, { TileYardLessonOverlay } from '../../movies/w2/TileYardLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'
import { squareSurface, surfaceName } from '../../levels/w2/delta'

const NAME = { torus: 'a torus', klein: 'a Klein bottle', rp2: 'the projective plane ℝP²' }

/** Which arrow (if any) a click at local deck coords (x, z) lands on. */
function arrowAt(station, x, z) {
  const split = station === 'two_tri'
  const cands = split
    ? [
        ['diagL', [SPLIT, SPLIT]],
        ['diag', [-SPLIT, -SPLIT]],
      ]
    : Object.entries(ARROWS).map(([id, a]) => [id, a.mid])
  let best = null
  let bd = 1.1
  for (const [id, [mx, mz]] of cands) {
    const d = Math.hypot(x - mx, z - mz)
    if (d < bd) [best, bd] = [id, d]
  }
  return best
}

export default function Level2_1(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.6) return
    if (tool !== 'smith') {
      sfxRefuse()
      return flash('Switch to the Cell Hammer (2) to work the tiles.')
    }
    const arrows = bag.arrows?.[current] || START_ARROWS[current]
    const onPress = Math.hypot(x - PRESS[0], z - PRESS[1]) < 1.1
    if (!onPress) {
      const id = arrowAt(current, x, z)
      if (!id) return
      const next = { ...arrows, [id]: -arrows[id] }
      setBag((b) => ({ ...b, arrows: { ...b.arrows, [current]: next }, fold: { ...b.fold, [current]: null } }))
      return
    }
    const n = (bag.fold?.[current]?.n || 0) + 1
    const setFold = (kind) => setBag((b) => ({ ...b, fold: { ...b.fold, [current]: { kind, n } }, tried: { ...b.tried, [current]: true } }))
    if (current === 'two_tri') {
      if (arrows.diag !== arrows.diagL) {
        sfxWrong()
        setBag((b) => ({ ...b, tried: { ...b.tried, [current]: true } }))
        return flash('The arrows on $c$ disagree — gluing would put a first corner on a last corner.')
      }
      sfxCorrect()
      setFold('square')
      return solve(current, goal.done, 1200)
    }
    const s = squareSurface(arrows)
    if (s.lowerCyclic || s.upperCyclic) {
      sfxWrong()
      setBag((b) => ({ ...b, fold: { ...b.fold, [current]: null }, tried: { ...b.tried, [current]: true } }))
      return flash(`The ${s.lowerCyclic ? 'lower' : 'upper'} triangle’s arrows run round in a circle — no corner comes first.`, 3600)
    }
    setFold(s.surface)
    if (s.surface !== STATIONS[current].target) {
      sfxWrong()
      return flash(`That folds into ${NAME[s.surface]}. You want ${NAME[STATIONS[current].target]}.`, 3600)
    }
    sfxCorrect()
    flash(`${surfaceName(s.surface)} — ${s.verts} ${s.verts > 1 ? 'vertices' : 'vertex'}, 3 edges, 2 triangles`, 3600)
    solve(current, goal.done, 2600)
  }

  const renderRules = ({ current, goal, bag }) => {
    const st = STATIONS[current]
    const arrows = bag.arrows?.[current] || START_ARROWS[current]
    const s = current === 'two_tri' ? null : squareSurface(arrows)
    return (
      <>
        <h3>{st.blueprint}</h3>
        <p className="cells-line">
          <MathText text={goal?.hint || ''} />
        </p>
        {current === 'two_tri' ? (
          <p className="cells-line">
            <MathText text={`$c$ arrows: ${arrows.diag === arrows.diagL ? 'agree' : 'disagree'}`} />
          </p>
        ) : (
          <p className="cells-line">
            <MathText text={`$a$ sides: ${s.aTwist ? 'opposite ways' : 'same way'} · $b$ sides: ${s.bTwist ? 'opposite ways' : 'same way'}`} />
          </p>
        )}
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
      Scene={TileYardScene}
      Lesson={TileYardLesson}
      LessonOverlay={TileYardLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 1 · TILE AND ERROR"
      levelId="2-1"
      className="level-2-1"
      tools={['lash', 'smith']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-2"
    />
  )
}
