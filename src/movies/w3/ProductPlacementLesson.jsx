import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/ProductPlacementScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 5, "Product Placement" (videos.json level-3-5-lesson), Hatcher §3.2 pp. 214–220:
 *   A 0–12   cross products: a × b has degree p + q
 *   B 12–24  S¹ × S¹: the torus, 1, 2, 1
 *   C 24–36  S² × S²: 1, 0, 2, 0, 1, and (γ × 1)(1 × γ) = γ × γ
 *   D 36–46  ℝP² × ℝP² over ℤ₂: the degree-2 beds
 *   E 46–58  ranks multiply like polynomials: S¹ × S²
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.4, 11.8], [2.2, -0.6, 0.6]], [[0.4, 10, 11.4], [2.2, -0.6, 0.6]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const T1 = [['0-0', 14], ['0-1', 15.5], ['1-0', 17], ['1-1', 18.5]]
const T2 = [['0-0', 26], ['0-1', 27.5], ['1-0', 29], ['1-1', 30.5]]
const T3 = [['0-2', 38], ['1-1', 39.5], ['2-0', 41]]
const BEATS = [...T1, ...T2, ...T3].map(([, a]) => a).concat([49, 51])
const on = (list, t) => Object.fromEntries(list.filter(([, a]) => t >= a).map(([k]) => [k, true]))
function set(t) {
  if (t < 24) return { id: 'row_col', bag: { placed: { row_col: on(T1, t) } } }
  if (t < 36) return { id: 'sphere_sphere', bag: { placed: { sphere_sphere: on(T2, t) } } }
  if (t < 46) return { id: 'torsion_soil', bag: { picked: { torsion_soil: on(T3, t) } } }
  return { id: 'design_parterre', bag: { design: { X: 'S1', Y: t < 49 ? 'S1' : t < 51 ? 'S2' : 'S2' } } }
}

export function ProductPlacementLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Cross products', ['$a$: degree $p$ on $X$ · $b$: degree $q$ on $Y$', '$a × b$ lives in degree $p + q$']],
        [12.4, 24, 'S¹ × S¹', ['$1$, $α×1$, $1×α$, $α×α$', 'ranks $1, 2, 1$: the torus']],
        [24.4, 36, 'S² × S²', ['ranks $1, 0, 2, 0, 1$', '$(γ×1) ⌣ (1×γ) = γ×γ$']],
        [36.4, 46, 'Over a field', ['ℝP² × ℝP², $ℤ₂$', 'degree 2: $a²×1$, $a×a$, $1×a²$']],
        [46.4, 58, 'Künneth', ['$H*(X × Y) ≅ H*(X) ⊗ H*(Y)$', '$(1+t)(1+t²) = 1+t+t²+t³$']],
        [58.4, 64, 'In the Parterre', ['Cup Caster (9)', 'bed → bin; levers choose $X$, $Y$']],
      ]}
      summary={{ t: 64, title: 'Künneth', items: ['Every pair of classes, one bed', 'Degrees add', 'Ranks multiply'], cite: 'Hatcher §3.2, pp. 214–220 (Theorem 3.15)' }}
    />
  )
}

export default function ProductPlacementLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-3.2, 0, 3.8], rotY: 0.7, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100e08" water="#3a3018" deep="#0a0804" cloud="#e8d8a8" spark="#ffe6a8" seed={35} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag, live: true })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
