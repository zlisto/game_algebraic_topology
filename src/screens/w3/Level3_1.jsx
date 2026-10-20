import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/level-3-1.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w3/stages3_1'
import ReverseEngineeringScene, { DECKS, LOCKED, TARGET, delta0, delta1, phiOf } from '../../levels/w3/ReverseEngineeringScene'
import { ekey, pickCell } from '../../levels/w2/ChainDeck'
import { cycleValue, isCoboundary } from '../../levels/w3/cochains'
import ReverseEngineeringLesson, { ReverseEngineeringLessonOverlay } from '../../movies/w3/ReverseEngineeringLesson'
import { startGardensMusic } from '../../audio/chip'
import MathText from '../MathText'

const allZero = (o) => Object.values(o).every((v) => !v)
/** Is φ (on the around_hole deck) δ of some point values? */
export function holeIsCoboundary(phi) {
  const cx = DECKS.around_hole
  const edges = cx.E.map(([a, b]) => ({ id: ekey(a, b), from: a, to: b }))
  return isCoboundary(phi, edges, Object.keys(cx.V).map(Number))
}

export default function Level3_1(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    if (tool !== 'wand') {
      sfxRefuse()
      return flash('Set readings with the Reading Wand (0).')
    }
    const deck = DECKS[current]
    if (current === 'from_points') {
      const v = Object.keys(deck.V).find((k) => Math.hypot(x - deck.V[k][0], z - deck.V[k][1]) < 0.7)
      if (v === undefined) return flash('Click a point — the readings live on the points here.')
      const f = { 0: 0, 1: 0, 2: 0, 3: 0, ...(bag.f || {}) }
      f[v] = cycleValue(f[v], 1, -2, 3)
      setBag((b) => ({ ...b, f }))
      const df = delta0(deck, f)
      if (Object.keys(TARGET).every((k) => df[k] === TARGET[k])) {
        sfxCorrect()
        flash('$δf$ matches every edge.', 2600)
        solve(current, goal.done, 1800)
      }
      return
    }
    const hit = pickCell(deck, x, z)
    if (!hit?.edge) return flash('Click an edge — a 1-cochain lives on the edges.')
    if (LOCKED[current]?.includes(hit.edge)) return flash('The rim’s readings are fixed. Set the spokes.')
    const phi = phiOf(current, bag)
    phi[hit.edge] = cycleValue(phi[hit.edge], 1, -2, 2)
    setBag((b) => ({ ...b, phi: { ...b.phi, [current]: phi } }))
    const dphi = delta1(deck, phi)
    if (current === 'around_hole') {
      if (!allZero(dphi)) return
      if (allZero(phi)) return
      if (holeIsCoboundary(phi)) {
        sfxWrong()
        return flash('A cocycle — but it’s $δf$ for some point values: it reads $0$ round the hole.', 3600)
      }
      sfxCorrect()
      flash('Balanced on the tile, non-zero round the hole: not a coboundary.', 3200)
      return solve(current, goal.done, 1800)
    }
    if (allZero(dphi)) {
      sfxCorrect()
      flash(current === 'read_edge' ? '$δφ(σ) = 0$: a cocycle.' : 'Every triangle balances.', 2600)
      solve(current, goal.done, 1800)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    const deck = DECKS[current]
    if (current === 'from_points') {
      const df = delta0(deck, { 0: 0, 1: 0, 2: 0, 3: 0, ...(bag.f || {}) })
      line = `edges matching: ${Object.keys(TARGET).filter((k) => df[k] === TARGET[k]).length} / 5`
    } else {
      const phi = phiOf(current, bag)
      const dphi = delta1(deck, phi)
      const off = Object.values(dphi).filter(Boolean).length
      line = off ? `${off} triangle${off > 1 ? 's' : ''} out of balance` : 'every filled triangle balances'
      if (current === 'around_hole' && !off && !allZero(phi)) line += holeIsCoboundary(phi) ? ' · but it is $δf$' : ' · not a coboundary'
    }
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
      Scene={ReverseEngineeringScene}
      Lesson={ReverseEngineeringLesson}
      LessonOverlay={ReverseEngineeringLessonOverlay}
      startMusic={startGardensMusic}
      kicker="WORLD 3 · LEVEL 1 · MIRROR POOLS"
      levelId="3-1"
      className="level-3-1"
      tools={['lash', 'wand']}
      worldIndex={3}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 3-2"
    />
  )
}
