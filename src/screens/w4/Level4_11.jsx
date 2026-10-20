import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/w4-twist-tower.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w4/stages4_11'
import TwistTowerScene, { FIB_CANDS, FLOORS, K_CANDS, PI, TOWERS, colX, fibreOf, leverPos, rowZ } from '../../levels/w4/TwistTowerScene'
import TwistTowerLesson, { TwistTowerLessonOverlay } from '../../movies/w4/TwistTowerLesson'
import { startTwistMusic } from '../../audio/chip'
import MathText from '../MathText'

const near = (x, z, [px, pz], r) => Math.hypot(x - px, z - pz) < r
const SUB = '₀₁₂₃₄₅'
// groups each floor has to lose: floor n keeps π₁..πₙ
const KILLS = FLOORS.flatMap((n) => PI.map((g, i) => [n, i + 1, g]).filter(([, i, g]) => i > n && g !== '0').map(([n, i]) => `${n}.${i}`))
const cycle = (list, v) => list[(list.indexOf(v) + 1) % list.length]

export default function Level4_11(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.2) return
    const want = current === 'stack' || current === 'rebuild' ? 'smith' : 'caster'
    if (tool !== want) {
      sfxRefuse()
      return flash(want === 'smith' ? 'This floor takes the Cell-Smith (2).' : 'This floor takes the Cup Caster (9).')
    }

    if (current === 'stack') {
      const n = FLOORS.find((n) => Math.abs(z - rowZ(n)) < 0.7)
      const i = [0, 1, 2, 3].find((i) => Math.abs(x - colX(i)) < 0.75)
      if (n == null || i == null) return
      const key = `${n}.${i + 1}`
      if (bag.killed?.[key]) return
      if (i + 1 <= n) {
        sfxWrong()
        return flash(`$X${SUB[n]}$ keeps $π${SUB[i + 1]}$ — only groups above $${n}$ go.`)
      }
      if (PI[i] === '0') return flash(`$π${SUB[i + 1]}$ is already $0$.`)
      const killed = { ...(bag.killed || {}), [key]: true }
      setBag((b) => ({ ...b, killed }))
      sfxCorrect()
      if (KILLS.every((k) => killed[k])) solve(current, goal.done, 1800)
      return
    }

    if (current === 'twist') {
      const n = FLOORS.find((n) => Math.abs(z - rowZ(n)) < 0.7 && Math.abs(x) < 1.4)
      if (n == null) return
      const fib = { ...(bag.fib || {}), [n]: cycle(FIB_CANDS, bag.fib?.[n]) }
      setBag((b) => ({ ...b, fib }))
      if (FLOORS.every((m) => fib[m] === fibreOf(m))) {
        sfxCorrect()
        solve(current, goal.done, 1800)
      }
      return
    }

    if (current === 'untwist') {
      const id = Object.keys(TOWERS).find((id) => near(x, z, leverPos(id), 0.8))
      if (!id) return
      const v = cycle(K_CANDS, bag.k?.[id])
      const k = { ...(bag.k || {}), [id]: v }
      setBag((b) => ({ ...b, k }))
      if (id === 's2' && v === '0') {
        sfxWrong()
        flash('With $k₂ = 0$, $X₃ = K(ℤ, 2) × K(ℤ, 3)$ has $H₃ = ℤ$ — but $H₃(S²) = 0$.', 3200)
      }
      if (Object.keys(TOWERS).every((t) => k[t] === TOWERS[t].k)) {
        sfxCorrect()
        solve(current, goal.done, 2000)
      }
      return
    }

    // rebuild
    const n = FLOORS.find((n) => Math.abs(z - rowZ(n)) < 0.7 && Math.abs(x) < 1.5)
    if (n == null) return
    const built = bag.built || 0
    if (n - 2 < built) return
    if (n - 2 > built) {
      sfxWrong()
      return flash(`$X${SUB[n]}$ is the fibre of a map out of $X${SUB[n - 1]}$ — raise that first.`)
    }
    setBag((b) => ({ ...b, built: built + 1 }))
    sfxCorrect()
    if (built + 1 === FLOORS.length) solve(current, goal.done, 1800)
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'stack') line = `killed ${Object.keys(bag.killed || {}).length} / ${KILLS.length}`
    else if (current === 'twist') line = FLOORS.map((n) => bag.fib?.[n] || '?').join(' · ')
    else if (current === 'untwist') line = Object.entries(TOWERS).map(([id, T]) => `${T.name}: $k₂$ = ${bag.k?.[id] ?? '?'}`).join(' · ')
    else line = `floors up: ${bag.built || 0} / ${FLOORS.length}`
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
      Scene={TwistTowerScene}
      Lesson={TwistTowerLesson}
      LessonOverlay={TwistTowerLessonOverlay}
      startMusic={startTwistMusic}
      kicker="WORLD 4 · LEVEL 11 · THE TWIST"
      levelId="4-11"
      className="level-4-11"
      tools={['lash', 'smith', 'caster']}
      worldIndex={4}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 4-12"
    />
  )
}
