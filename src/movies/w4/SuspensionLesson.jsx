import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/SuspensionScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 4, "Suspension of Disbelief" (videos.json level-4-4-lesson), Hatcher §4.2 pp. 360–364:
 *   A 0–12   suspension Σf: coning a map up a dimension
 *   B 12–24  degree survives suspension; πₙ(Sⁿ) ≅ ℤ
 *   C 24–36  Freudenthal: iso for i < 2n − 1, onto at i = 2n − 1
 *   D 36–46  the stable range
 *   E 46–58  stem 1: η, then ℤ₂ forever
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const MARKS = [[26, '0-2'], [27.2, '0-3'], [28.4, '0-4'], [30, '1-3'], [31.2, '1-4']]
const UP = [15, 18]
const CLIMB = [48.5, 50, 51.5]
const BEATS = [3, 6, ...UP, ...MARKS.map(([a]) => a), ...CLIMB]
function set(t) {
  if (t < 12) return { id: 'upone', bag: { deg: t < 3 ? 1 : t < 4.5 ? 2 : 3, at: { upone: t >= 6 ? 1 : 0 } } }
  if (t < 24) return { id: 'degree', bag: { deg: 2, at: { degree: UP.filter((a) => t >= a).length } } }
  if (t < 46) return { id: 'stable', bag: { marked: Object.fromEntries(MARKS.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  return { id: 'climb', bag: { at: { climb: CLIMB.filter((a) => t >= a).length } } }
}

export function SuspensionLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Suspension', ['$f: Sⁱ → Sⁿ$ ↦ $Σf: Sⁱ⁺¹ → Sⁿ⁺¹$', 'cone both ends']],
        [12.4, 24, 'Degree survives', ['$π₁(S¹) → π₂(S²) → π₃(S³)$', '$πₙ(Sⁿ) ≅ ℤ$ (Cor. 4.25)']],
        [24.4, 36, 'Freudenthal', ['iso for $i < 2n − 1$', 'onto for $i = 2n − 1$ (Thm 4.23)']],
        [36.4, 46, 'Stable range', ['stem $k$: $πₙ₊ₖ(Sⁿ)$', 'stable once $n > k + 1$']],
        [46.4, 58, 'Stem 1', ['$π₃(S²) = ℤ$ ∋ $η$', '$π₄(S³) = π₅(S⁴) = … = ℤ₂$']],
        [58.4, 64, 'At the Landing', ['Sling (4): lift Σ', 'Dial (8): degree, mark']],
      ]}
      summary={{ t: 64, title: 'Freudenthal', items: ['Suspension lifts maps', 'Iso in the stable range', 'Stems settle down'], cite: 'Hatcher §4.2, pp. 360–364' }}
    />
  )
}

export default function SuspensionLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.8, 0, 4.6], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e14" water="#1a2c40" deep="#060a0e" cloud="#b8d0e8" spark="#ffd27a" seed={44} />
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
