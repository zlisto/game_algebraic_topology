import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/ObstructionScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 12, "Obstruction Course" (videos.json level-4-12-lesson), Hatcher pp. 415–419:
 *   A 0–12   the extension problem; cell by cell (Lemma 4.7)
 *   B 12–24  a 3-cell's boundary in π₂(S²) = ℤ: the obstruction (Prop. 4.72)
 *   C 24–36  rerouting moves the cochain by a coboundary; the class stays
 *   D 36–58  Corollary 4.73: all obstruction groups zero ⇒ every map extends
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const EXT_T = [[4, 'a'], [6, 'b'], [8, 'c']]
const READ_T = [14, 16.5, 19]
const DOOR_T = [[42, 'd2'], [47, 'd1']]
const BEATS = [...EXT_T.map(([a]) => a), ...READ_T, 21, 28, 33, ...DOOR_T.map(([a]) => a)]
function set(t) {
  if (t < 12) return { id: 'cell', bag: { ext: Object.fromEntries(EXT_T.filter(([a]) => t >= a).map(([, id]) => [id, true])), tried: t >= 10 ? 'd' : null } }
  if (t < 24) return { id: 'blocked', bag: { read: Object.fromEntries(READ_T.filter((a) => t >= a).map((_, i) => [i, true])), ext: t >= 21 ? { 0: true } : {} } }
  if (t < 31) return { id: 'reroute', bag: { round: 0, k: t >= 28 ? -1 : 0 } }
  if (t < 36) return { id: 'reroute', bag: { round: 1, k: t >= 33 ? 1 : 0 } }
  return { id: 'summit', bag: { opened: Object.fromEntries(DOOR_T.filter(([a]) => t >= a).map(([, id]) => [id, true])) } }
}

export function ObstructionLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Cell by cell', ['extend $A → X$ over $W$', 'safe when $πₙ(X) = 0$']],
        [12.4, 24, 'The obstruction', ['boundary class in $πₙ(X)$', 'extend iff $ωₙ = 0$']],
        [24.4, 36, 'Reroute', ['twist lower cells:', 'cochain moves, class stays']],
        [36.4, 58, 'Guaranteed', ['$Hⁿ⁺¹(W, A; πₙX) = 0$', '⇒ every map extends']],
        [58.4, 64, 'Obstruction Course', ['Cell-Smith (2), Cup Caster (9)', 'extend, read, reroute']],
      ]}
      summary={{ t: 64, title: 'Obstruction theory', items: ['Extend cell by cell', 'Blocks are classes $ωₙ$', 'in $Hⁿ⁺¹(W, A; πₙX)$'], cite: 'Hatcher pp. 415–419' }}
    />
  )
}

export default function ObstructionLesson({ tRef }) {
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
      <YardSky bg="#120a0a" water="#381e1e" deep="#0c0606" cloud="#f0d0c8" spark="#ff9a7a" seed={52} />
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
