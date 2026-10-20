import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { MESSY, Station, tighten } from '../../levels/w2/DynamoGateScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 6, "The Third Degree" (videos.json level-2-6-lesson), Hatcher §2.2 pp. 134–138:
 *   A 0–12   degree: f_* multiplies Hₙ(Sⁿ) ≅ ℤ by deg f; for a circle, net turns
 *   B 12–24  pulling the band tight is a homotopy; the degree stays 2
 *   C 24–36  z ↦ zᵏ has degree k; degrees multiply; a reflection is −1
 *   D 36–48  three mirrors make the antipodal map on S²: degree −1
 *   E 48–58  the hairy ball: a combing would make the antipodal map homotopic to the identity
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 36, [[-0.4, 11.6, 12.4], [2.2, -0.8, 2.2]], [[0.4, 11.2, 12], [2.2, -0.8, 2.2]]],
  [36, 58, [[-0.8, 7.2, 12.4], [2.0, 1.2, 1.6]], [[0.4, 7.0, 12.2], [2.0, 1.2, 1.6]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const PULLS = [14.4, 17.4]
const WRAPS = [[24.8, 2, 1], [28.4, 2, -1], [31.4, 2, -3]]
const MIRRORS = [[38.6, 'x'], [40.6, 'y'], [42.6, 'z']]
const COMBS = [[50, [0.5, 0.8, 0.33]], [52.6, [-0.6, 0.7, -0.4]], [55, [0.1, 0.6, 0.8]]]
const BEATS = [...PULLS, ...WRAPS.map(([a]) => a), ...MIRRORS.map(([a]) => a), ...COMBS.map(([a]) => a)]
function set(t) {
  if (t < 24) {
    let s = MESSY
    PULLS.filter((a) => t >= a).forEach(() => (s = tighten(s)))
    return { id: 'hollow', bag: { segs: s } }
  }
  if (t < 36) {
    const w = WRAPS.filter(([at]) => t >= at).pop()
    return { id: 'wrap', bag: { wrap: w ? { a: w[1], b: w[2] } : { a: 1, b: 1 } } }
  }
  if (t < 48) return { id: 'antipode', bag: { mirrors: Object.fromEntries(MIRRORS.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  const c = COMBS.filter(([at]) => t >= at).pop()
  const ax = c ? c[1] : [0, 1, 0]
  const n = Math.hypot(...ax)
  return { id: 'hairy', bag: { axis: ax.map((v) => v / n) } }
}

export function ThirdDegreeLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Degree', ['$f_*: Hₙ(Sⁿ) → Hₙ(Sⁿ)$ is ×deg f', 'circle: net turns']],
        [12.4, 24, 'Homotopy invariance', ['pulling tight is a homotopy', 'degree stays $2$']],
        [24.4, 36, 'Composing', ['$z ↦ zᵏ$ has degree $k$', 'deg(f ∘ g) = deg f · deg g', 'reflection: $−1$']],
        [36.4, 48, 'The antipodal map', ['$x ↦ −x$: $n + 1$ reflections', 'degree $(−1)ⁿ⁺¹$']],
        [48.4, 58, 'The hairy ball', ['a combing ⟹ antipodal ≃ identity', 'but $−1 ≠ 1$ on $S²$']],
        [58.4, 64, 'At the Gate', ['Degree Dial (8)', 'tighten · set powers · mirrors · comb']],
      ]}
      summary={{ t: 64, title: 'Degree', items: ['An integer for every sphere map', 'Homotopy invariant; multiplies', 'Antipodal: $(−1)ⁿ⁺¹$'], cite: 'Hatcher §2.2, pp. 134–138' }}
    />
  )
}

export default function ThirdDegreeLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.3, 0, 3.6], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0c16" water="#221a40" deep="#08060e" cloud="#b8a8f0" spark="#ffd27a" seed={26} />
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
