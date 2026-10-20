import LevelShell from '../../levels/w2/LevelShell'
import layout from '../../world/excisionCut.json'
import { STATION_ORDER, STATIONS, OPENING, DEFINITION, HINTS, emmyAdvice } from '../../levels/w2/stages2_5'
import ExcisionCutScene, { CUT_R, LADDER_N, XR, ZONES, cutProblem, padPos, zoneAt } from '../../levels/w2/ExcisionCutScene'
import CutPasteLesson, { CutPasteLessonOverlay } from '../../movies/w2/CutPasteLesson'
import { startDeltaMusic } from '../../audio/chip'
import MathText from '../MathText'

const WHY = {
  outside: 'That cut leaves $X$ altogether.',
  notA: 'That’s not in $A$ — cutting there changes $X$ itself.',
  edge: 'Too close to $A$’s inner edge — the cut’s closure must lie in the interior of $A$.',
}
const SUP = ['⁰', '¹', '²', '³']
const SUB = ['₀', '₁', '₂', '₃']

export default function Level2_5(props) {
  const onAction = (_gx, _gz, cx, cz, ctx) => {
    const { current, goal, tool, bag, setBag, solve, flash, sfxCorrect, sfxWrong, sfxRefuse, SITE } = ctx
    if (!current || goal?.type !== 'action') return
    const site = SITE[current]
    const x = cx - site.pos[0]
    const z = cz - site.pos[1]
    if (Math.hypot(x, z) > 5.4) return

    if (current === 'collapse') {
      if (tool !== 'sling') {
        sfxRefuse()
        return flash('Crush the rim with the Suspension Sling (4).')
      }
      if (Math.abs(Math.hypot(x, z) - XR) > 0.9) return flash('Click the gold rim — that’s $A$ here.')
      setBag((b) => ({ ...b, collapsed: true }))
      sfxCorrect()
      return solve(current, goal.done, 3000)
    }
    if (tool !== 'blade') {
      sfxRefuse()
      return flash(current === 'ladder' ? 'Light the pads with the Boundary Blade (7).' : 'Cut with the Boundary Blade (7).')
    }
    if (current === 'cut_deep') {
      const why = cutProblem(x, z)
      if (why) {
        sfxWrong()
        return flash(WHY[why], 3200)
      }
      const cuts = [...(bag.cuts?.cut_deep || [])]
      if (cuts.some(([a, b]) => Math.hypot(a - x, b - z) < 2 * CUT_R)) return flash('Already cut there — try another spot in the collar.')
      cuts.push([x, z])
      setBag((b) => ({ ...b, cuts: { ...b.cuts, cut_deep: cuts } }))
      flash(`Cut ${cuts.length}: $H₂(X − Z, A − Z) ≅ H₂(X, A)$ — unchanged`)
      if (cuts.length === 3) {
        sfxCorrect()
        solve(current, goal.done, 1800)
      }
      return
    }
    if (current === 'ladder') {
      let hit = null
      for (let n = 0; n < LADDER_N; n++)
        for (let i = 0; i < LADDER_N; i++) {
          const [px, pz] = padPos(n, i)
          if (Math.hypot(x - px, z - pz) < 0.62) hit = [n, i]
        }
      if (!hit) return
      const [n, i] = hit
      const lit = { '0-0': true, ...(bag.lit || {}) }
      if (lit[`${n}-${i}`]) return flash(`$H̃${SUB[i]}(S${SUP[n]}) ≅ ℤ$ — already lit.`)
      if (n > 0 && i > 0 && lit[`${n - 1}-${i - 1}`]) {
        lit[`${n}-${i}`] = true
        setBag((b) => ({ ...b, lit }))
        flash(`$H̃${SUB[i]}(S${SUP[n]}) ≅ H̃${SUB[i - 1]}(S${SUP[n - 1]}) ≅ ℤ$`)
        if (n === LADDER_N - 1) {
          sfxCorrect()
          solve(current, goal.done, 1800)
        }
        return
      }
      sfxWrong()
      if (i === 0 && n > 0) return flash(`$S${SUP[n]}$ is connected, so $H̃₀(S${SUP[n]}) = 0$.`, 3000)
      if (n === 0) return flash('$S⁰$ is two points — it has no homology above dimension $0$.', 3000)
      return flash(`$H̃${SUB[i]}(S${SUP[n]}) ≅ H̃${SUB[i - 1]}(S${SUP[n - 1]})$ — and that pad isn’t lit, so this one is $0$.`, 3400)
    }
    // edge
    const zn = zoneAt(x, z)
    if (!zn) return
    const cut = { ...(bag.zones || {}) }
    if (cut[zn.id]) return
    if (!zn.ok) {
      sfxWrong()
      return flash(`Not $${zn.id}$: ${zn.why}`, 3600)
    }
    cut[zn.id] = true
    setBag((b) => ({ ...b, zones: cut }))
    flash(`$${zn.id}$ excised — homology unchanged.`)
    if (ZONES.filter((q) => q.ok).every((q) => cut[q.id])) {
      sfxCorrect()
      solve(current, goal.done, 1800)
    }
  }

  const renderRules = ({ current, goal, bag }) => {
    let line = ''
    if (current === 'cut_deep') line = `cuts: ${(bag.cuts?.cut_deep || []).length} / 3 · $H₂(X, A) ≅ ℤ$, unchanged`
    else if (current === 'collapse') line = bag.collapsed ? '$D²/S¹ ≅ S²$' : 'the rim is $A$'
    else if (current === 'ladder') line = `lit: ${Object.keys({ '0-0': true, ...(bag.lit || {}) }).length} pads`
    else line = `excised: ${Object.keys(bag.zones || {}).join(', ') || 'none yet'}`
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
      Scene={ExcisionCutScene}
      Lesson={CutPasteLesson}
      LessonOverlay={CutPasteLessonOverlay}
      startMusic={startDeltaMusic}
      kicker="WORLD 2 · LEVEL 5 · CUT AND PASTE"
      levelId="2-5"
      className="level-2-5"
      tools={['lash', 'blade', 'sling']}
      onAction={onAction}
      renderRules={renderRules}
      nextLabel="Level 2-6"
    />
  )
}
