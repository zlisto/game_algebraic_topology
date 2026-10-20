import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/TorsionShiftScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 2, "Torsion Shift" (videos.json level-3-2-lesson), Hatcher §3.1 pp. 190–206:
 *   A 0–12   the universal coefficient theorem
 *   B 12–24  the torus: all free, cohomology = homology
 *   C 24–36  ℝP²: Hom(ℤ₂, ℤ) = 0, Ext(ℤ₂, ℤ) = ℤ₂ — the torsion climbs
 *   D 36–46  ℤ₂ coefficients: the ℤ₂ appears twice
 *   E 46–58  the Klein bottle: Corollary 3.3
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const P = {
  free_floors: { until: 24, moves: [[14, 't0', 0, 'Z', 'Hom'], [15.5, 't1a', 1, 'Z', 'Hom'], [17, 't1b', 1, 'Z', 'Hom'], [18.5, 't2', 2, 'Z', 'Hom']] },
  climbing_vine: { until: 36, moves: [[26, 'r0', 0, 'Z', 'Hom'], [29, 'r1', 2, 'Z2', 'Ext']] },
  change_soil: { until: 46, moves: [[37.5, 'r0', 0, 'Z2', 'Hom'], [39.5, 'r1', 1, 'Z2', 'Hom'], [41, 'r1', 2, 'Z2', 'Ext']] },
  plan_terrace: { until: 999, moves: [[48, 'k0', 0, 'Z', 'Hom'], [49.5, 'k1', 1, 'Z', 'Hom'], [51, 'k1t', 2, 'Z2', 'Ext']] },
}
const BEATS = Object.values(P).flatMap((p) => p.moves.map(([a]) => a))
function set(t) {
  const id = t < 12 ? 'free_floors' : Object.keys(P).find((k) => t < P[k].until)
  const moves = t < 12 ? [] : P[id].moves
  return { id, bag: { placed: { [id]: moves.filter(([a]) => t >= a).map(([, plant, floor, g, kind]) => ({ plant, floor, g, kind })) } } }
}

export function TorsionShiftLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Universal coefficients', ['$Hⁿ(X; G) ≅$ Hom$(Hₙ, G) ⊕$ Ext$(Hₙ₋₁, G)$', 'Theorem 3.2']],
        [12.4, 24, 'All free', ['Hom$(ℤ, ℤ) = ℤ$', 'torus: $Hⁿ ≅ Hₙ$']],
        [24.4, 36, 'Torsion climbs', ['Hom$(ℤ₂, ℤ) = 0$, Ext$(ℤ₂, ℤ) = ℤ₂$', '$H²(ℝP²; ℤ) = ℤ₂$']],
        [36.4, 46, 'Change the soil', ['Hom$(ℤ₂, ℤ₂) = $ Ext$(ℤ₂, ℤ₂) = ℤ₂$', '$Hⁿ(ℝP²; ℤ₂) = ℤ₂$, $n ≤ 2$']],
        [46.4, 58, 'Corollary 3.3', ['$Hⁿ$ = free part of $Hₙ$ ⊕ torsion of $Hₙ₋₁$', 'Klein: $ℤ$, $ℤ$, $ℤ₂$']],
        [58.4, 64, 'On the Terrace', ['Wand (0): pick a plant', 'then its floor on the right']],
      ]}
      summary={{ t: 64, title: 'Torsion shift', items: ['Free parts stay', 'Torsion climbs one degree', 'Coefficients change the rules'], cite: 'Hatcher §3.1, pp. 190–206' }}
    />
  )
}

export default function TorsionShiftLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-0.4, 0, 4.6], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c120a" water="#24381c" deep="#080c06" cloud="#c8e0a8" spark="#e8ffb0" seed={32} />
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
