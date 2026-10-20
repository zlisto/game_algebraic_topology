import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/TwistTowerScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 11, "A Twist in the Tower" (videos.json level-4-11-lesson), Hatcher pp. 410–412:
 *   A 0–12   S²'s tower: Xₙ keeps π₁ … πₙ
 *   B 12–24  each step's fibre is K(πₙ, n)
 *   C 24–36  k-invariants: Xₙ₊₁ is the homotopy fibre of kₙ; floors rise
 *   D 36–58  S² vs S³ × ℂP∞: same groups, different k₂
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const KILL_T = [[3, '2.3'], [5, '2.4'], [7, '3.4']]
const FIB_T = [[15, 2, 'K(ℤ, 2)'], [17.5, 3, 'K(ℤ, 3)'], [20, 4, 'K(ℤ₂, 4)']]
const BUILD_T = [26, 29, 32]
const K_T = [[44, 'prod', '0'], [48, 's2', '≠ 0']]
const BEATS = [...KILL_T.map(([a]) => a), ...FIB_T.map(([a]) => a), ...BUILD_T, ...K_T.map(([a]) => a)]
function set(t) {
  if (t < 12) return { id: 'stack', bag: { killed: Object.fromEntries(KILL_T.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  if (t < 24) return { id: 'twist', bag: { fib: Object.fromEntries(FIB_T.filter(([a]) => t >= a).map(([, n, v]) => [n, v])) } }
  if (t < 36) return { id: 'rebuild', bag: { built: BUILD_T.filter((a) => t >= a).length } }
  return { id: 'untwist', bag: { k: Object.fromEntries(K_T.filter(([a]) => t >= a).map(([, id, v]) => [id, v])) } }
}

export function TwistTowerLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Postnikov floors', ['$Xₙ$: $π₁, …, πₙ$ of $X$', 'nothing above']],
        [12.4, 24, 'Fibres', ['$Xₙ → Xₙ₋₁$', 'fibre $K(πₙX, n)$']],
        [24.4, 36, 'k-invariants', ['$kₙ ∈ Hⁿ⁺²(Xₙ; πₙ₊₁X)$', '$Xₙ₊₁$ = its homotopy fibre']],
        [36.4, 58, 'Same groups', ['$S²$ vs $S³ × ℂP∞$', 'different $k₂$']],
        [58.4, 64, 'The Twist', ['Cell-Smith (2), Cup Caster (9)', 'kill, name, twist, raise']],
      ]}
      summary={{ t: 64, title: 'Postnikov towers', items: ['One group per floor', 'k-invariants twist them', 'all zero: a product'], cite: 'Hatcher pp. 410–412' }}
    />
  )
}

export default function TwistTowerLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [3.0, 0, 3.9], rotY: -0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-2.6, 0, 4.2], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a12" water="#2a1e38" deep="#08060c" cloud="#dcc8f0" spark="#c8b6ff" seed={51} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={LESSON_SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
