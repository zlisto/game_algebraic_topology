import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/GridGalleryScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 2, "Snap to Grid" (videos.json level-4-2-lesson), Hatcher §4.1 pp. 348–351:
 *   A 0–12   CW skeleta; a map that wanders
 *   B 12–24  snapping a path into the 1-skeleton: a cellular map
 *   C 24–36  S² = e⁰ ∪ e²: puncture and push — π₁(S²) = 0
 *   D 36–46  πₖ(Sⁿ) = 0 for k < n
 *   E 46–58  skeleton by skeleton: 0-cells first
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SNAPS = [14, 15.5, 17, 18.5]
const MARKS = [[39, '1-2'], [40.5, '1-3'], [42, '2-3']]
const BEATS = [...SNAPS, 27, 30, ...MARKS.map(([a]) => a), 48, 49.5, 51, 52.5]
function set(t) {
  if (t < 12) return { id: 'snap', bag: {} }
  if (t < 24) return { id: 'snap', bag: { snapped: { snap: Object.fromEntries(SNAPS.filter((a) => t >= a).map((_, i) => [i, true])) } } }
  if (t < 36) return { id: 'slip', bag: { punct: t >= 27, pushed: t >= 30 } }
  if (t < 46) return { id: 'small', bag: { marked: Object.fromEntries(MARKS.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  return { id: 'approx', bag: { ends: { A: t >= 48, B: t >= 49.5 }, snapped: { approx: { ...(t >= 51 ? { 0: true } : {}), ...(t >= 52.5 ? { 1: true } : {}) } } } }
}

export function SnapGridLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Skeleta', ['0-cells, 1-cells, 2-cells', 'a map can wander anywhere']],
        [12.4, 24, 'Cellular maps', ['$k$-skeleton → $k$-skeleton', 'Theorem 4.8: every map ≃ one']],
        [24.4, 36, 'Slip off', ['$S² = e⁰ ∪ e²$', 'miss a point, push to $e⁰$: $π₁(S²) = 0$']],
        [36.4, 46, 'Too small', ['$πₖ(Sⁿ) = 0$ for $k < n$', '$k ≥ n$: no help']],
        [46.4, 58, 'The proof', ['skeleton by skeleton', 'rel what’s already cellular']],
        [58.4, 64, 'In the Gallery', ['Cell Hammer (2)', 'snap, puncture, push, mark']],
      ]}
      summary={{ t: 64, title: 'Cellular approximation', items: ['Every map snaps to the grid', 'Dimension by dimension', 'Small spheres can’t wrap big ones'], cite: 'Hatcher §4.1, pp. 348–351 (Theorem 4.8)' }}
    />
  )
}

export default function SnapGridLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0c10" water="#1a2430" deep="#06080a" cloud="#b8c8d8" spark="#e0e8ff" seed={42} />
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
