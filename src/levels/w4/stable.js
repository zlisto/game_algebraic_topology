/**
 * 4-8 Stable Ground — stable homotopy groups πₖˢ.
 * Values from Hatcher's table (pp. 384–392). Flag: shown, not computed in-game.
 */
import { STABLE_STEMS, freudenthalRange } from './spireMath.js'

export function stemTable() {
  return STABLE_STEMS.map((s) => ({ ...s }))
}

/** Watch suspension stabilize: when freudenthal says iso, stem is stable. */
export function settled(i, n) {
  return freudenthalRange(i, n) === 'iso'
}

export function fillChart(answers) {
  // answers: [{k, group}]
  const truth = Object.fromEntries(STABLE_STEMS.map((s) => [s.k, s.group]))
  return answers.map((a) => ({ ...a, ok: truth[a.k] === a.group }))
}
