import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/FibrationScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 10, "Fibration Station" (videos.json level-4-10-lesson), Hatcher pp. 375, 407–408:
 *   A 0–12   the homotopy lifting property; the helix over the circle
 *   B 12–24  the start decides the lift
 *   C 24–36  f: {p, q} → [0, 1] is no fibration; E_f fixes it
 *   D 36–58  the path fibration ΩB → PB → B: πₙ(ΩB) ≅ πₙ₊₁(B)
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const BEATS = [4, 16, 30, 33, 42, 45, 48]
function set(t) {
  if (t < 12) return { id: 'lift', bag: { round: 0, start: t >= 4 ? 1 : null } }
  if (t < 24) return { id: 'lift', bag: { round: 1, start: t >= 16 ? 2 : null } }
  if (t < 36) return { id: 'fibre', bag: { teth: { ...(t >= 30 ? { p: true } : {}), ...(t >= 33 ? { q: true } : {}) } } }
  return { id: 'loops', bag: { picks: Object.fromEntries([42, 45, 48].map((a, j) => [j, t >= a ? ['ℤ', 'ℤ', 'ℤ₂'][j] : null]).filter(([, v]) => v)) } }
}

export function FibrationLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Lifting', ['homotopies downstairs', 'lift upstairs']],
        [12.4, 24, 'The start decides', ['loop of winding $w$', 'climbs $w$ sheets']],
        [24.4, 36, 'Make it a fibration', ['$E_f = {(a, γ) : γ(0) = f(a)}$', '$E_f ≃ A$ (Prop. 4.64)']],
        [36.4, 58, 'The loop space', ['$ΩB → PB → B$', '$πₙ(ΩB) ≅ πₙ₊₁(B)$']],
        [58.4, 64, 'Fibration Station', ['Sheet Compass (6)', 'lift, tether, shift']],
      ]}
      summary={{ t: 64, title: 'Fibrations', items: ['Homotopies lift', 'Any map is one, up to ≃', 'πₙ(ΩB) ≅ πₙ₊₁(B)'], cite: 'Hatcher pp. 375, 407–408' }}
    />
  )
}

export default function FibrationLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [3.0, 0, 3.9], rotY: -0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-2.6, 0, 4.2], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e12" water="#1e2e3a" deep="#060a0e" cloud="#c8dcec" spark="#9fe6ff" seed={50} />
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
