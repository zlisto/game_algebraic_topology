import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/MapsClassesScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 9, "Maps Classes" (videos.json level-4-9-lesson), Hatcher §4.3 pp. 393–396:
 *   A 0–12   K(G, n) and its fundamental class ι
 *   B 12–24  a map f: X → K(G, n) pulls ι back to f*(ι)
 *   C 24–36  S¹ → S¹: degree d gives dα
 *   D 36–58  T² → S¹: two windings give aα + bβ in H¹(T²) = ℤ²
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const DEG = [[2, 1], [14, 2], [26, 3], [30, -1], [33, -2]]
const WIND = [[40, 1, 0], [44, 2, 0], [48, 2, -1]]
const BEATS = [...DEG.map(([a]) => a), ...WIND.map(([a]) => a)]
function set(t) {
  if (t < 36) {
    const d = [...DEG].reverse().find(([a]) => t >= a)?.[1] ?? 1
    return { id: 'pull', bag: { d, step: t >= 33 ? 2 : t >= 26 ? 1 : 0 } }
  }
  const w = [...WIND].reverse().find(([a]) => t >= a)
  return { id: 'read', bag: { wa: w?.[1] ?? 0, wb: w?.[2] ?? 0 } }
}

export function MapsClassesLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Eilenberg–MacLane', ['$K(G, n)$: one group, $πₙ = G$', 'carries a class $ι$']],
        [12.4, 24, 'Pull back', ['$f: X → K(G, n)$', 'gives $f*(ι) ∈ Hⁿ(X; G)$']],
        [24.4, 36, 'The circle', ['$K(ℤ, 1) = S¹$', 'degree $d$ ↦ $dα$']],
        [36.4, 58, 'The torus', ['$T² → S¹$: two windings', '$[T², S¹] = H¹(T²) = ℤ²$']],
        [58.4, 64, 'Maps Classes', ['Cup Caster (9)', 'turn the levers']],
      ]}
      summary={{ t: 64, title: 'Classes are maps', items: ['$Hⁿ(X; G) ≅ [X, K(G, n)]$', 'by $f ↦ f*(ι)$', 'every class, exactly once'], cite: 'Hatcher §4.3, Thm 4.57' }}
    />
  )
}

export default function MapsClassesLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [3.0, 0, 4.0], rotY: -0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100c0a" water="#3a2818" deep="#0a0806" cloud="#e8d0b0" spark="#ffd27a" seed={49} />
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
