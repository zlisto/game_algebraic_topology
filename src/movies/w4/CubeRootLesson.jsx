import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/CubeHallScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 4 · Level 1, "Cube Root" (videos.json level-4-1-lesson), Hatcher §4.1 pp. 339–346:
 *   A 0–12   πₙ: maps (Iⁿ, ∂Iⁿ) → (X, x₀), i.e. maps of Sⁿ
 *   B 12–24  f + g: side by side
 *   C 24–36  for n ≥ 2: shrink, slide past, regrow — abelian
 *   D 36–46  for n = 1: no room
 *   E 46–58  recap: π₁ may be non-abelian, πₙ (n ≥ 2) never is
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.4, 11.4], [2.2, -0.6, 0.4]], [[0.4, 10, 11], [2.2, -0.6, 0.4]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 1.6]], [[2, 8.2, 12.4], [1.6, -0.4, 1.6]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const PINS = [[3, 's'], [4.4, 'e'], [5.8, 'n'], [7.2, 'w']]
const STEPS = [26, 28, 30, 32, 34]
const BEATS = [...PINS.map(([a]) => a), 15, 17, ...STEPS, 38, 40]
function set(t) {
  if (t < 12) return { id: 'pinned', bag: { pinned: Object.fromEntries(PINS.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  if (t < 24) return { id: 'stack', bag: { placed: { ...(t >= 15 ? { f: 'L' } : {}), ...(t >= 17 ? { g: 'R' } : {}) } } }
  if (t < 36) return { id: 'pass', bag: { stage: { pass: STEPS.filter((a) => t >= a).length } } }
  if (t < 46) return { id: 'dim1', bag: { stage: { dim1: t >= 38 ? 1 : 0 }, blocked: t >= 40 } }
  return { id: 'pass', bag: { stage: { pass: 5 } } }
}

export function CubeRootLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'πₙ(X, x₀)', ['maps $(Iⁿ, ∂Iⁿ) → (X, x₀)$', '= maps of $Sⁿ$']],
        [12.4, 24, 'Adding', ['$f + g$: side by side', '$−f$: reflect']],
        [24.4, 36, 'Room to pass', ['shrink · slide · regrow', '$f + g ≃ g + f$ for $n ≥ 2$']],
        [36.4, 46, 'One dimension', ['on an interval: no room', '$π₁$ can be non-abelian']],
        [46.4, 58, 'Higher groups', ['$πₙ$ abelian for $n ≥ 2$', 'the Commutator has no power here']],
        [58.4, 64, 'In the Hall', ['Tide Glass (3)', 'pin, place, step']],
      ]}
      summary={{ t: 64, title: 'Higher homotopy', items: ['Maps of spheres', 'Added side by side', 'Abelian from $n = 2$'], cite: 'Hatcher §4.1, pp. 339–346' }}
    />
  )
}

export default function CubeRootLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.4, 0, -1.4], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0a14" water="#241a40" deep="#06060c" cloud="#c8b8f0" spark="#c9a0ff" seed={41} />
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
