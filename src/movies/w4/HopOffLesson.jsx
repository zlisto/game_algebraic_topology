import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/HopfRingScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 7, "Hop Off" (videos.json level-4-7-lesson), Hatcher §4.2 pp. 375–380:
 *   A 0–12   the Hopf map: a circle over each point of S²
 *   B 12–24  four fibres light up
 *   C 24–36  any two fibres link once
 *   D 36–46  the long exact sequence of a fibration
 *   E 46–58  π₃(S²) ≅ ℤ: the Hopf map is not null-homotopic
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 36, [[2, 7.4, 10.6], [1.6, 1.4, 0]], [[-1, 7.6, 10.8], [1.6, 1.4, 0]]],
  [36, 58, [[-0.4, 10.4, 11.6], [2.2, -0.6, 1.0]], [[0.4, 10, 11.2], [2.2, -0.6, 1.0]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const LIGHT = [[14, 'a'], [16, 'b'], [18, 'c'], [20, 'd']]
const LINK = [[26, 'b'], [28, 'c']]
const PICKS = [[48, '0'], [50, 'ℤ']]
const BEATS = [...LIGHT.map(([a]) => a), ...LINK.map(([a]) => a), ...PICKS.map(([a]) => a)]
function set(t) {
  if (t < 12) return { id: 'circle', bag: {} }
  if (t < 24) return { id: 'circle', bag: { lit: { circle: Object.fromEntries(LIGHT.filter(([a]) => t >= a).map(([, k]) => [k, true])) } } }
  if (t < 36) return { id: 'linked', bag: { lit: { linked: Object.fromEntries(LINK.filter(([a]) => t >= a).map(([, k]) => [k, true])) } } }
  const p = PICKS.filter(([a]) => t >= a).pop()
  return { id: 'seq', bag: { pick: p ? p[1] : undefined } }
}

export function HopOffLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'The Hopf map', ['$S³ → S²$', 'a circle over every point']],
        [12.4, 24, 'Fibres', ['$S¹ → S³ → S²$', 'a fibre bundle']],
        [24.4, 36, 'Linked', ['any two fibres', 'link exactly once']],
        [36.4, 46, 'Exact sequence', ['$… → πₙ(F) → πₙ(E) → πₙ(B) → πₙ₋₁(F) → …$', 'Theorem 4.41']],
        [46.4, 58, 'π₃(S²)', ['$0 → π₃(S³) → π₃(S²) → 0$', '$π₃(S²) ≅ ℤ$, by the Hopf map']],
        [58.4, 64, 'At the Ring', ['Compass (6): light fibres', 'Dial (8): the unknown lock']],
      ]}
      summary={{ t: 64, title: 'The Hopf fibration', items: ['Circles over a sphere', 'Linked once', 'π₃(S²) ≅ ℤ'], cite: 'Hatcher §4.2, pp. 375–380 (Example 4.45)' }}
    />
  )
}

export default function HopOffLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [-2.8, 0, 4.2], rotY: 0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [2.6, 0, 4.2], rotY: -0.5, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0a10" water="#2a1e34" deep="#08060a" cloud="#d8c8e8" spark="#ffd27a" seed={47} />
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
