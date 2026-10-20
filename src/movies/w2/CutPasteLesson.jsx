import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ExcisionCutScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 5, "Cut and Paste" (videos.json level-2-5-lesson), Hatcher §2.1 pp. 114–128:
 *   A 0–12   the pair (X, A); relative homology ignores A
 *   B 12–24  excision: holes deep inside A change nothing (Theorem 2.20)
 *   C 24–36  which regions may go: a, b yes; c, d no
 *   D 36–46  good pairs: Hₙ(X, A) ≅ H̃ₙ(X/A); D²/S¹ is a sphere
 *   E 46–58  the ladder: H̃ᵢ(Sⁿ) ≅ H̃ᵢ₋₁(Sⁿ⁻¹), lighting the diagonal
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 11.8, 12.4], [2.2, -0.8, 2.2]], [[0.4, 11.4, 12], [2.2, -0.8, 2.2]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const CUTS = [[13.4, [3.4, 0.8]], [14.6, [-1.6, 3.0]], [15.8, [-2.2, -2.6]]]
const LADDER = [[49, '1-1'], [51, '2-2'], [53, '3-3']]
const BEATS = [...CUTS.map(([a]) => a), 30.2, 31, 37, ...LADDER.map(([a]) => a)]
function set(t) {
  if (t < 24) return { id: 'cut_deep', bag: { cuts: { cut_deep: CUTS.filter(([a]) => t >= a).map(([, c]) => c) } } }
  if (t < 36) return { id: 'edge', bag: { zones: { ...(t >= 30.2 ? { a: true } : {}), ...(t >= 31 ? { b: true } : {}) } } }
  if (t < 46) return { id: 'collapse', bag: { collapsed: t >= 37 } }
  return { id: 'ladder', bag: { lit: { '0-0': true, ...Object.fromEntries(LADDER.filter(([a]) => t >= a).map(([, k]) => [k, true])) } } }
}

export function CutPasteLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'A pair', ['$X$: the disk · $A$: the collar', '$Hₙ(X, A)$ counts $A$ as zero']],
        [12.4, 24, 'Excision', ['closure of $Z$ ⊂ interior of $A$', '$H(X − Z, A − Z) ≅ H(X, A)$']],
        [24.4, 36, 'Too close to the edge', ['$a$, $b$: inside — allowed', '$c$, $d$: touch the edge — no']],
        [36.4, 46, 'Good pairs', ['$Hₙ(X, A) ≅ H̃ₙ(X/A)$', '$D²/S¹ ≅ S²$']],
        [46.4, 58, 'The ladder', ['$H̃ᵢ(Sⁿ) ≅ H̃ᵢ₋₁(Sⁿ⁻¹)$', '$ℤ$ when $i = n$, else $0$']],
        [58.4, 64, 'In the Cut', ['Blade (7): cut, light pads', 'Sling (4): crush $A$ to a point']],
      ]}
      summary={{ t: 64, title: 'Excision', items: ['Cut deep inside $A$: no change', 'Good pairs: $H(X, A) ≅ H̃(X/A)$', 'Spheres: one hole each'], cite: 'Hatcher §2.1, pp. 114–128' }}
    />
  )
}

export default function CutPasteLesson({ tRef }) {
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
      <YardSky bg="#100c14" water="#2a1a3a" deep="#0a0610" cloud="#c8a8e0" spark="#ffb0e8" seed={25} />
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
