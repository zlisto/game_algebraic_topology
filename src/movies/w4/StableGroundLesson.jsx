import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/StableGroundScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 8, "Stable Ground" (videos.json level-4-8-lesson), Hatcher table p. 339, §4.2:
 *   A 0–12   the table of πₙ₊ₖ(Sⁿ), stems in rows
 *   B 12–24  each stem settles at n = k + 2
 *   C 24–36  stem 3: ℤ₂, ℤ₁₂, ℤ × ℤ₁₂, then ℤ₂₄
 *   D 36–58  the stable values ℤ, ℤ₂, ℤ₂, ℤ₂₄
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const MARKS = [14, 16, 18, 20]
const VALS = [[40, 0, 'ℤ'], [43, 1, 'ℤ₂'], [46, 2, 'ℤ₂'], [49, 3, 'ℤ₂₄']]
const BEATS = [...MARKS, ...VALS.map(([a]) => a)]
function set(t) {
  if (t < 36) return { id: 'settle', bag: { marked: Object.fromEntries(MARKS.filter((a) => t >= a).map((_, k) => [k, k + 2])) } }
  return { id: 'table', bag: { vals: Object.fromEntries(VALS.filter(([a]) => t >= a).map(([, k, v]) => [k, v])) } }
}

export function StableGroundLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'The table', ['stem $k$: $πₙ₊ₖ(Sⁿ)$', 'Hatcher, p. 339']],
        [12.4, 24, 'Settling', ['stable from $n = k + 2$', 'Freudenthal’s range']],
        [24.4, 36, 'Stem 3', ['$ℤ₂$, $ℤ₁₂$, $ℤ × ℤ₁₂$, …', 'then $ℤ₂₄$ for good']],
        [36.4, 58, 'Stable groups', ['$π₀ˢ = ℤ$, $π₁ˢ = ℤ₂$', '$π₂ˢ = ℤ₂$, $π₃ˢ = ℤ₂₄$']],
        [58.4, 64, 'On Stable Ground', ['Suspension Sling (4)', 'mark, set values']],
      ]}
      summary={{ t: 64, title: 'Stable homotopy', items: ['Stems settle', 'from $n = k + 2$', 'ℤ, ℤ₂, ℤ₂, ℤ₂₄, …'], cite: 'Hatcher p. 339; §4.2' }}
    />
  )
}

export default function StableGroundLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [3.0, 0, 4.0], rotY: -0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.0, 0, 4.5], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e1012" water="#2a3438" deep="#080a0c" cloud="#e0e8f0" spark="#ffe6a8" seed={48} />
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
