import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { BANDS, N, START, Station, across } from '../../levels/w3/WhichWayScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 7, "Which Way Is Up" (videos.json level-3-7-lesson), Hatcher §3.3 pp. 233–239:
 *   A 0–12   local orientations: generators of Hₙ(M, M − x)
 *   B 12–24  the annulus: compasses made to agree — orientable
 *   C 24–36  the Möbius band: carried round, the compass returns flipped
 *   D 36–46  the orientable double cover: one trip round M switches sheets
 *   E 46–58  surveying bands; Hₙ(M; ℤ) = ℤ exactly when orientable
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const FLIPS = [[14, 1], [15.5, 4]]
const CARRY = [26, 27.2, 28.4, 29.6, 30.8, 32]
const RIDE = [38, 39.2, 40.4, 41.6, 42.8, 44]
const SURV = [[49, 'b0'], [51, 'b1'], [53, 'b2']]
const BEATS = [...FLIPS.map(([a]) => a), ...CARRY, ...RIDE, ...SURV.map(([a]) => a)]
function carried(k) {
  const comp = [1, 0, 0, 0, 0, 0]
  for (let i = 1; i <= Math.min(k, N - 1); i++) comp[i] = across(BANDS.the_flip.twists, i - 1, comp[i - 1])
  return comp
}
function set(t) {
  if (t < 24) {
    const comp = [...START.set_compasses]
    FLIPS.filter(([a]) => t >= a).forEach(([, i]) => (comp[i] = -comp[i]))
    return { id: 'set_compasses', bag: { comp: { set_compasses: comp } } }
  }
  if (t < 36) {
    const k = CARRY.filter((a) => t >= a).length
    return { id: 'the_flip', bag: { comp: { the_flip: carried(k) }, next: { the_flip: Math.min(k + 1, N + 1) }, closed: { the_flip: k >= N } } }
  }
  if (t < 46) return { id: 'two_sheets', bag: { step: { two_sheets: RIDE.filter((a) => t >= a).length * 2 } } }
  return { id: 'survey', bag: { surveyed: Object.fromEntries(SURV.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
}

export function WhichWayLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Local orientation', ['a generator of $Hₙ(M, M − x) ≅ ℤ$', 'a way round, near $x$']],
        [12.4, 24, 'Orientable', ['a consistent choice everywhere', 'annulus: yes — two ways']],
        [24.4, 36, 'The Möbius band', ['carried round a loop…', '…it comes back flipped']],
        [36.4, 46, 'Double cover M̃', ['two points over each $x$', 'connected $M$ orientable ⟺ $M̃$ has two pieces']],
        [46.4, 58, 'Theorem 3.26', ['closed connected $M$:', '$Hₙ(M; ℤ) ≅ ℤ$ ⟺ orientable']],
        [58.4, 64, 'On the Cliffs', ['Sheet Compass (6)', 'flip, carry, ride, survey']],
      ]}
      summary={{ t: 64, title: 'Orientation', items: ['Local choices that fit together', 'Odd twists spoil them', 'Seen by $M̃$ and by $Hₙ(M; ℤ)$'], cite: 'Hatcher §3.3, pp. 233–239' }}
    />
  )
}

export default function WhichWayLesson({ tRef }) {
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
      <YardSky bg="#0c0e14" water="#1c2a40" deep="#06080e" cloud="#c0c8e0" spark="#ffd27a" seed={37} />
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
