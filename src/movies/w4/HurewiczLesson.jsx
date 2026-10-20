import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/HurewiczScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 6, "Hurewicz" (videos.json level-4-6-lesson), Hatcher §4.2 pp. 366–371:
 *   A 0–12   the Hurewicz map h: πₙ → Hₙ
 *   B 12–24  S²: homotopy and homology side by side
 *   C 24–36  first non-zero degree: S³, S² ∨ S², ℂP²
 *   D 36–46  degree 1: abelianization
 *   E 46–58  above the first: no promise
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const READ = [14, 16, 18]
const FOUND = [[27, 'S3', 3], [29.5, 'S2vS2', 2], [32, 'CP2', 2]]
const BR = [[48, 'iso'], [50, 'iso'], [52, 'none']]
const BEATS = [...READ, ...FOUND.map(([a]) => a), 39, ...BR.map(([a]) => a)]
function set(t) {
  if (t < 24) return { id: 'meters', bag: { read: { meters: Object.fromEntries(READ.filter((a) => t >= a).map((_, i) => [i + 1, true])) } } }
  if (t < 36) return { id: 'first', bag: { found: Object.fromEntries(FOUND.filter(([a]) => t >= a).map(([, k, n]) => [k, n])) } }
  if (t < 46) return { id: 'dim1', bag: { bridges: { dim1: t >= 39 ? { 1: 'onto' } : {} } } }
  return { id: 'beyond', bag: { bridges: { beyond: Object.fromEntries(BR.filter(([a]) => t >= a).map(([, s], i) => [i + 1, s])) } } }
}

export function HurewiczLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'The Hurewicz map', ['$h: πₙ(X) → Hₙ(X)$', '$[f] ↦ f_*$(fundamental class)']],
        [12.4, 24, 'Two meters', ['$S²$: $π₂ = H₂ = ℤ$', '$π₃ = ℤ$, $H₃ = 0$']],
        [24.4, 36, 'Hurewicz', ['$(n−1)$-connected, $n ≥ 2$:', '$πₙ ≅ Hₙ$ (Thm 4.32)']],
        [36.4, 46, 'Degree one', ['$π₁ → H₁$ is abelianization', '$F(a, b) → ℤ²$']],
        [46.4, 58, 'Beyond the first', ['no promise above', '$π₃(S²) = ℤ$, $H₃(S²) = 0$']],
        [58.4, 64, 'In the Hall', ['Degree Dial (8)', 'read, find, test']],
      ]}
      summary={{ t: 64, title: 'Hurewicz', items: ['A bridge from $πₙ$ to $Hₙ$', 'Iso at the first non-zero degree', 'Abelianization in degree 1'], cite: 'Hatcher §4.2, pp. 366–371' }}
    />
  )
}

export default function HurewiczLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.6, 0, 4.7], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0c12" water="#1a2a40" deep="#06080c" cloud="#c0d0f0" spark="#7fd6ff" seed={46} />
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
