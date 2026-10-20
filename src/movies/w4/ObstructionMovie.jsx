import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/ObstructionScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 12, "Obstruction Course" (videos.json level-4-12-intro):
 *   A 0–10   cells fill one by one; one won't
 *   B 10–18  the summit doors
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[5, 8.6, 11], [0, -0.2, 0]], [[-1, 9.2, 10.6], [0, -0.2, 0]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const FILL = [[2, 'a'], [3.5, 'b'], [5, 'c']]
function set(t) {
  if (t < 10) return { id: 'cell', bag: { ext: Object.fromEntries(FILL.filter(([a]) => t >= a).map(([, id]) => [id, true])), tried: t >= 7 ? 'd' : null } }
  return { id: 'summit', bag: { opened: t >= 13 ? { d2: true, d1: true } : {} } }
}

export default function ObstructionMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [12.8, 16.1], [18.4, 23.6]])
    return { pos: [3.0, 0, 3.9], rotY: -0.6, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[4.8, 12.6]])
    return { pos: [-2.6, 0, 4.2], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#120a0a" water="#381e1e" deep="#0c0606" cloud="#f0d0c8" spark="#ff9a7a" seed={52} />
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
