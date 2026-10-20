import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/PolynomialGardenScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 6, "Polynomial Garden" (videos.json level-3-6-lesson), Hatcher §3.2 pp. 220–229:
 *   A 0–12   one class can generate a whole ring
 *   B 12–24  ℝP³ over ℤ₂: α² ≠ 0
 *   C 24–36  ℝP⁴: ℤ₂[α]/(α⁵)
 *   D 36–46  ℂP³: α in degree 2, ℤ[α]/(α⁴)
 *   E 46–58  no map ℝP⁴ → ℝP² with f*(α) = α
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.6, 8.4, 11.6], [2.2, 0.6, 0.8]], [[0.4, 8.2, 11.2], [2.2, 0.6, 0.8]]],
  [58, 64, [[3, 8, 12], [1.6, 0.4, 1.6]], [[2, 8.2, 12.4], [1.6, 0.4, 1.6]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const P = {
  square_it: { until: 24, at: [15] },
  climb_powers: { until: 36, at: [26, 28, 30] },
  stops_top: { until: 46, at: [38, 39.5, 42], fizzAt: 42 },
  antipodes: { until: 999, at: [49, 51], fizzAt: 51 },
}
const BEATS = Object.values(P).flatMap((p) => p.at)
function set(t) {
  const id = t < 12 ? 'square_it' : Object.keys(P).find((k) => t < P[k].until)
  const p = P[id]
  const n = t < 12 ? 0 : p.at.filter((a) => t >= a).length
  return { id, bag: { pow: { [id]: 1 + n }, fizz: { [id]: p.fizzAt !== undefined && t >= p.fizzAt } } }
}

export function PolynomialGardenLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Powers of one class', ['cast $α$ again and again', '$α$, $α²$, $α³$, …']],
        [12.4, 24, 'ℝP³ over ℤ₂', ['$α² ≠ 0$', 'mod 2, $−1 = 1$']],
        [24.4, 36, 'ℝPⁿ', ['$H*(ℝPⁿ; ℤ₂) = ℤ₂[α]/(αⁿ⁺¹)$', '$|α| = 1$']],
        [36.4, 46, 'ℂPⁿ', ['$H*(ℂPⁿ; ℤ) = ℤ[α]/(αⁿ⁺¹)$', '$|α| = 2$ · Theorem 3.12']],
        [46.4, 58, 'No such map', ['$f: ℝP⁴ → ℝP²$, $f*(α) = α$?', '$α³$: $≠ 0$ upstairs, $= 0$ down']],
        [58.4, 64, 'In the Garden', ['Cup Caster (9)', 'click a fountain to cast $α$']],
      ]}
      summary={{ t: 64, title: 'Polynomial rings', items: ['One generator, all its powers', 'Truncated at the dimension', 'Rings rule out maps'], cite: 'Hatcher §3.2, pp. 220–229' }}
    />
  )
}

export default function PolynomialGardenLesson({ tRef }) {
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
      <YardSky bg="#0a1012" water="#183a40" deep="#060c0e" cloud="#a8e0e0" spark="#ffd27a" seed={36} />
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
