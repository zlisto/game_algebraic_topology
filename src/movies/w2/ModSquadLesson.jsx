import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ModMillScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 9, "Mod Squad" (videos.json level-2-9-lesson), Hatcher §2.2 pp. 153–155:
 *   A 0–12   coefficients in ℤ₂: 0 and 1, with 1 + 1 = 0
 *   B 12–24  the fan: no signs needed for the inside edges to cancel
 *   C 24–36  ℝP² mod 2: d₂ = 2a ≡ 0, so H₂(ℝP²; ℤ₂) = ℤ₂
 *   D 36–48  the Klein bottle mod 2: H₂(K; ℤ₂) = ℤ₂
 *   E 48–58  orientable or not: H₂ over ℤ tells (Theorem 3.26); over ℤ₂ it can't
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.6, 12.4], [2.2, -0.2, 2.0]], [[0.4, 10.2, 12], [2.2, -0.2, 2.0]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const FAN = [['0-1-4', 14], ['1-2-4', 15], ['2-3-4', 16], ['0-3-4', 17]]
const SORT = [[50, 'sphere', 'yes'], [51, 'torus', 'yes'], [52.4, 'rp2', 'no'], [53.4, 'klein', 'no']]
const BEATS = [...FAN.map(([, a]) => a), 27, 30, 39, 40, 42.4, ...SORT.map(([a]) => a)]
function set(t) {
  if (t < 24) return { id: 'even', bag: { tri: { even: Object.fromEntries(FAN.filter(([, a]) => t >= a).map(([k]) => [k, 1])) } } }
  if (t < 36) return { id: 'rp2', bag: { coef: { rp2: { a: t < 27 ? 1 : 0 } }, solved: { rp2: t >= 30 } } }
  if (t < 48) return { id: 'frogs', bag: { coef: { frogs: { a: t < 39 ? 1 : 0, b: t < 40 ? 1 : 0 } }, solved: { frogs: t >= 42.4 } } }
  return { id: 'sort', bag: { bins: Object.fromEntries(SORT.filter(([a]) => t >= a).map(([, k, b]) => [k, b])) } }
}

export function ModSquadLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Coefficients', ['$Hₙ(X; G)$: chains $Σ gᵢσᵢ$, $gᵢ ∈ G$', '$G = ℤ₂$: $1 + 1 = 0$, $−1 = 1$']],
        [12.4, 24, 'No signs', ['every inside edge: $1 + 1 = 0$', 'orientation drops out']],
        [24.4, 36, 'ℝP² mod 2', ['$d₂ = 2a ≡ 0$', '$H₁ = H₂ = ℤ₂$']],
        [36.4, 48, 'Klein bottle mod 2', ['$d₂ = 2b ≡ 0$', '$H₂(K; ℤ₂) = ℤ₂$']],
        [48.4, 58, 'Orientable?', ['over $ℤ$: $H₂ = ℤ$ ⟺ orientable', 'over $ℤ₂$: always $ℤ₂$ (Thm 3.26)']],
        [58.4, 64, 'In the Mill', ['Blade (7): $0 ↔ 1$', 'attach, sort']],
      ]}
      summary={{ t: 64, title: 'Coefficients', items: ['Chains with coefficients in $G$', 'Mod 2, signs vanish', 'ℤ sees orientation; ℤ₂ doesn’t'], cite: 'Hatcher §2.2, pp. 153–155; Theorem 3.26' }}
    />
  )
}

export default function ModSquadLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-0.6, 0, 4.7], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#120e0a" water="#3a2a18" deep="#0c0804" cloud="#e0c8a0" spark="#ffd27a" seed={29} />
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
