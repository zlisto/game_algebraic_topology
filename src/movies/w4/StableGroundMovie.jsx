import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/StableGroundScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 8, "Stable Ground" (videos.json level-4-8-intro):
 *   A 0–10   the chart wall: each stem settles, one row after another
 *   B 10–18  a calm moment; the stable values glow
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[5, 8.6, 11], [0, -0.2, 0]], [[-1, 9.2, 10.6], [0, -0.2, 0]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const MARKS = [2, 3.6, 5.2, 6.8]
function set(t) {
  if (t < 10) return { id: 'settle', bag: { marked: Object.fromEntries(MARKS.filter((a) => t >= a).map((_, k) => [k, k + 2])) } }
  return { id: 'table', bag: { vals: { 0: 'ℤ', 1: 'ℤ₂', 2: 'ℤ₂', 3: 'ℤ₂₄' } } }
}

export default function StableGroundMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = within(t, [[10.4, 15.6]])
    return { pos: [3.0, 0, 4.0], rotY: -0.6, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1]])
    return { pos: [-1.0, 0, 4.5], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e1012" water="#2a3438" deep="#080a0c" cloud="#e0e8f0" spark="#ffe6a8" seed={48} />
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
