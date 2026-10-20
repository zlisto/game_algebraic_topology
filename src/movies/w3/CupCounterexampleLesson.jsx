import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/CupCounterexampleScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 4, "A Cup of Counterexample" (videos.json level-3-4-lesson), Hatcher §3.2 pp. 212–214:
 *   A 0–12   two spaces with the same cohomology groups
 *   B 12–24  on the torus, α ⌣ β generates H²
 *   C 24–36  on the bouquet, α ⌣ β = 0
 *   D 36–46  why: the bouquet retracts onto S¹ ∨ S¹, and ⌣ is natural
 *   E 46–58  so they are not homotopy equivalent
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.4, 12.2], [2.2, -0.2, 1.4]], [[0.4, 10, 11.8], [2.2, -0.2, 1.4]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const BEATS = [3, 6, 15, 17, 26, 28, 30, 48, 50]
function set(t) {
  if (t < 12) return { id: 'same_holes', bag: { read: { T: t >= 3, X: t >= 6 } } }
  if (t < 24) return { id: 'cast_torus', bag: { cast: { cast_torus: { ...(t >= 15 ? { L: true } : {}), ...(t >= 17 ? { U: true } : {}) } } } }
  if (t < 46) return { id: 'cast_bouquet', bag: { cast: { cast_bouquet: { a: t >= 26, b: t >= 28, sphere: t >= 30 } } } }
  return { id: 'nulls_answer', bag: { cast: { nulls_answer: { T: t >= 48, X: t >= 50 } } } }
}

export function CupCounterexampleLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Same groups', ['$T$ and $S¹ ∨ S¹ ∨ S²$', '$H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$ for both']],
        [12.4, 24, 'The torus', ['$α ⌣ β$ generates $H²(T)$']],
        [24.4, 36, 'The bouquet', ['$α$, $β$ live on the rings', '$α ⌣ β = 0$']],
        [36.4, 46, 'Why', ['retract onto $S¹ ∨ S¹$', '$H²(S¹ ∨ S¹) = 0$; ⌣ is natural']],
        [46.4, 58, 'Different rings', ['homotopy equivalences keep ⌣', 'so $T ≄ S¹ ∨ S¹ ∨ S²$']],
        [58.4, 64, 'On the Islands', ['Cup Caster (9)', 'meters, triangles, rings, lanterns']],
      ]}
      summary={{ t: 64, title: 'A cup of counterexample', items: ['Same groups', 'Different cup products', 'Not the same space'], cite: 'Hatcher §3.2, pp. 212–214 (Example 3.8)' }}
    />
  )
}

export default function CupCounterexampleLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.4, 0, -1.6], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e12" water="#14324a" deep="#060a0e" cloud="#b8d0e8" spark="#ffd27a" seed={34} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
