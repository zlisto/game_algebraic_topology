import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/BothSidesScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 8, "Both Sides of the Story" (videos.json level-3-8-lesson), Hatcher §3.3 pp. 239–249:
 *   A 0–12   Poincaré duality: Hᵏ ≅ Hₙ₋ₖ on a closed oriented manifold
 *   B 12–24  the torus' twin towers
 *   C 24–36  dual cells
 *   D 36–46  ℝP²: broken over ℤ, mended over ℤ₂
 *   E 46–58  the 3-torus: H₂ ≅ H¹, H₃ ≅ H⁰
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const PAIRS = [14, 16, 18]
const DUAL = [[26, 'v'], [28, 'a'], [29.5, 'b'], [31, 'f']]
const BEATS = [...PAIRS, ...DUAL.map(([a]) => a), 38, 41, 49, 51]
function set(t) {
  if (t < 24) return { id: 'twin_towers', bag: { pairs: { twin_towers: Object.fromEntries(PAIRS.filter((a) => t >= a).map((_, k) => [k, true])) } } }
  if (t < 36) return { id: 'dual_cells', bag: { dual: Object.fromEntries(DUAL.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  if (t < 46) {
    const z2 = t >= 41
    return { id: 'broken_mirror', bag: { coef: z2 ? 'Z2' : 'Z', pairs: { broken_mirror: t < 38 ? {} : z2 ? { 0: true, 1: true, 2: true } : { 0: false, 1: false, 2: false } } } }
  }
  return { id: 'across_seam', bag: { hom: { 2: t >= 49 ? 'ℤ³' : '0', 3: t >= 51 ? 'ℤ' : '0' } } }
}

export function BothSidesLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Poincaré duality', ['closed, $R$-orientable $Mⁿ$', '$Hᵏ(M; R) ≅ Hₙ₋ₖ(M; R)$']],
        [12.4, 24, 'Twin towers', ['torus: $H⁰ ≅ H₂$, $H¹ ≅ H₁$, $H² ≅ H₀$']],
        [24.4, 36, 'Dual cells', ['$k$-cell ↔ dual $(n−k)$-cell', 'chains read backwards']],
        [36.4, 46, 'Broken mirror', ['ℝP² over $ℤ$: no fundamental class', 'over $ℤ₂$: duality holds']],
        [46.4, 58, 'Across the seam', ['T³: $H₂ ≅ H¹ = ℤ³$', '$H₃ ≅ H⁰ = ℤ$']],
        [58.4, 64, 'At the Seam', ['Sheet Compass (6)', 'pair, light, switch, raise']],
      ]}
      summary={{ t: 64, title: 'Duality', items: ['$Hᵏ ≅ Hₙ₋ₖ$', 'cap with $[M]$', 'ℤ₂ always works'], cite: 'Hatcher §3.3, pp. 239–249 (Theorem 3.30)' }}
    />
  )
}

export default function BothSidesLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.6, 0, -1.2], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100a10" water="#3a1a34" deep="#0a060a" cloud="#e8b8d8" spark="#ff8ad8" seed={38} />
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
