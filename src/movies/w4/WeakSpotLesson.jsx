import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/WeakSpotScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 3, "Weak Spot" (videos.json level-4-3-lesson), Hatcher §4.1 pp. 346–348:
 *   A 0–12   weak homotopy equivalence: f_* iso on every πₙ
 *   B 12–24  S¹ ↪ ℝ² − 0: every runner green — Whitehead: a homotopy equivalence
 *   C 24–36  S² → point: the π₂ runner fails
 *   D 36–46  ℝP² and S² × ℝP∞: same groups, no map
 *   E 46–58  sorting pairs
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const step = (list, t) => Object.fromEntries(list.filter((a) => t >= a).map((_, i) => [i + 1, true]))
const M = [14, 15.5, 17]
const W = [26, 27.5, 29]
const N = [38, 39.5, 41]
const SORTS = [[48, 'p1', 'yes'], [49.5, 'p2', 'yes'], [51, 'p3', 'no'], [52.5, 'p4', 'no']]
const BEATS = [...M, ...W, ...N, ...SORTS.map(([a]) => a)]
function set(t) {
  if (t < 24) return { id: 'match', bag: { sent: { match: step(M, t) } } }
  if (t < 36) return { id: 'weak', bag: { sent: { weak: step(W, t) } } }
  if (t < 46) return { id: 'nomap', bag: { sent: { nomap: step(N, t) } } }
  return { id: 'sort', bag: { bins: Object.fromEntries(SORTS.filter(([a]) => t >= a).map(([, k, b]) => [k, b])) } }
}

export function WeakSpotLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Weak equivalence', ['$f_*: πₙ(X) → πₙ(Y)$ iso', 'for every $n$']],
        [12.4, 24, 'Whitehead', ['between connected CW complexes:', 'weak equivalence ⟹ homotopy equivalence']],
        [24.4, 36, 'A weak spot', ['$S² →$ point', '$π₂$: $ℤ → 0$ fails']],
        [36.4, 46, 'No map', ['ℝP², $S² × ℝP∞$: same $πₙ$', 'different $H₂$ — not equivalent']],
        [46.4, 58, 'The certificate', ['a map', 'and every runner green']],
        [58.4, 64, 'At the Weak Spot', ['Reading Wand (0)', 'send runners, sort pairs']],
      ]}
      summary={{ t: 64, title: 'Whitehead’s theorem', items: ['Iso on every $πₙ$, via a map', '⟹ homotopy equivalence (CW)', 'Numbers alone prove nothing'], cite: 'Hatcher §4.1, pp. 346–348 (Theorem 4.5)' }}
    />
  )
}

export default function WeakSpotLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a10" water="#2a1a30" deep="#08060a" cloud="#d8b8d0" spark="#ff8ad8" seed={43} />
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
