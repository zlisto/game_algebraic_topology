import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/OneGroupScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 5, "One Group" (videos.json level-4-5-lesson), Hatcher §4.2 pp. 365–366:
 *   A 0–12   K(G, n): one non-zero homotopy group
 *   B 12–24  K(G, 1)s: the circle, the torus, ℝP∞
 *   C 24–36  not K(G, 1)s: S², ℝP²
 *   D 36–58  building K(ℤ, 2) from S² by killing π₃, π₄, …
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const MARKS = [[15, 'S1', 'yes'], [17, 'T', 'yes'], [19, 'RPinf', 'yes'], [27, 'S2', 'no'], [30, 'RP2', 'no']]
const KILLS = [40, 44, 48]
const BEATS = [...MARKS.map(([a]) => a), ...KILLS]
function set(t) {
  if (t < 36) return { id: 'recall', bag: { marks: Object.fromEntries(MARKS.filter(([a]) => t >= a).map(([, k, v]) => [k, v])) } }
  return { id: 'kill', bag: { killed: KILLS.filter((a) => t >= a).length } }
}

export function OneGroupLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'K(G, n)', ['$πₙ = G$', 'every other $πᵢ = 0$']],
        [12.4, 24, 'K(G, 1)s', ['$S¹ = K(ℤ, 1)$, $T² = K(ℤ², 1)$', '$ℝP∞ = K(ℤ₂, 1)$: contractible covers']],
        [24.4, 36, 'Not K(G, 1)s', ['$S²$: $π₂ = ℤ$', '$ℝP²$: $π₂ = π₂(S²) = ℤ$']],
        [36.4, 58, 'Kill above', ['attach $(k+1)$-cells to kill $πₖ$', 'bottom up: $S² ⇝ K(ℤ, 2) = ℂP∞$']],
        [58.4, 64, 'At One Group', ['Cell-Smith (2)', 'mark spaces, attach cells']],
      ]}
      summary={{ t: 64, title: 'Eilenberg–MacLane', items: ['One group, one dimension', 'Contractible covers give K(G,1)s', 'Kill higher groups with cells'], cite: 'Hatcher §4.2, pp. 365–366' }}
    />
  )
}

export default function OneGroupLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.4, 0, -2.0], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0e12" water="#1c3038" deep="#06080a" cloud="#b0d0d0" spark="#ffd27a" seed={45} />
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
