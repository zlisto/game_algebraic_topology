import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ChaseChannelsScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 4, "Chase Scene" (videos.json level-2-4-lesson), Hatcher §2.1 pp. 113–118:
 *   A 0–12   exactness: image in = kernel out (ℤ₄ → ℤ₄ → ℤ₂)
 *   B 12–24  the left sluice tries 1 ↦ 0, 1 ↦ 1, 1 ↦ 2: only the last is exact
 *   C 24–36  0 → ℤ₂ → ℤ₄ → ℤ₂ → 0: a short exact sequence
 *   D 36–48  relative homology and the long exact sequence of a pair
 *   E 48–58  (D², S¹): H₂(D², S¹) between two zeros is ℤ
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 11.4, 12.6], [2.2, -0.8, 2.6]], [[0.4, 11, 12.2], [2.2, -0.8, 2.6]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2.4]], [[2, 8.2, 12.4], [1.6, -0.4, 2.4]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const KS = [[14.2, 0], [17, 1], [20, 2]]
const CH = [[27, 'f'], [30, 'g']]
const PICKS = [[49, '0'], [51, 'Z2'], [53, 'Z']]
const BEATS = [...KS.map(([a]) => a), ...CH.map(([a]) => a), ...PICKS.map(([a]) => a)]
function set(t) {
  if (t < 24) return { id: 'exact', bag: { ks: { exact: [t < 12 ? 0 : KS.filter(([a]) => t >= a).pop()?.[1] ?? 0, 1] } } }
  if (t < 36) return { id: 'chase', bag: { ks: { chase: [null, t >= 27 ? 2 : 0, t >= 30 ? 1 : 0, null] } } }
  const p = PICKS.filter(([a]) => t >= a).pop()
  return { id: 'pair', bag: { pick: { pair: p ? p[1] : undefined } } }
}

export function ChaseSceneLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Exact', ['at each group: image in = kernel out', 'gold = arrives · blue = drains to $0$']],
        [12.4, 24, 'Try the sluice', ['$1 ↦ 0$, $1 ↦ 1$: not exact', '$1 ↦ 2$: gold on blue']],
        [24.4, 36, 'Short exact', ['$0 → ℤ₂ → ℤ₄ → ℤ₂ → 0$', 'in: one-to-one · out: onto']],
        [36.4, 48, 'A pair (X, A)', ['$… → Hₙ(A) → Hₙ(X) → Hₙ(X, A) → Hₙ₋₁(A) → …$']],
        [48.4, 58, 'The disk and its rim', ['$0 → H₂(D², S¹) → H₁(S¹) → 0$', '$H₂(D², S¹) ≅ ℤ$']],
        [58.4, 64, 'In the Channels', ['Blade (7) on a sluice: change $1 ↦ k$', 'on an unknown lock: try a group']],
      ]}
      summary={{ t: 64, title: 'Exact sequences', items: ['Image in = kernel out', 'Zeros pin groups down', 'Pairs give long exact sequences'], cite: 'Hatcher §2.1, pp. 113–118' }}
    />
  )
}

export default function ChaseSceneLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[19.8, 23.4], [53.8, 57.6]])
    return { pos: [4.1, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 53.4], [58.4, 69.4]])
    return { pos: [-4.1, 0, 3.6], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e16" water="#102a48" deep="#060a14" cloud="#a0b8e0" spark="#9fc8ff" seed={24} />
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
