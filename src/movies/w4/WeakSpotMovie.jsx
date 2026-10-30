import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/WeakSpotScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 3, "Weak Spot" (videos.json level-4-3-intro):
 *   A 0–8    two rooms of homotopy meters face each other
 *   B 8–18   runners go along a map: every one arrives green
 *   C 18–22  another pair: the same numbers, but no route between them
 *   D 22–26  title card
 */

const SHOTS = [
  [0, 22, [[6, 8.6, 12], [0, -0.2, 0.6]], [[-1, 9.2, 11.4], [0, -0.2, 0.4]]],
  [22, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const RUN = [9.4, 11, 12.6]
const NOMAP = [18.6, 19.4, 20.2]
function set(t) {
  if (t < 18) return { id: 'match', bag: { sent: { match: Object.fromEntries(RUN.filter((a) => t >= a).map((_, i) => [i + 1, true])) } } }
  return { id: 'nomap', bag: { sent: { nomap: Object.fromEntries(NOMAP.filter((a) => t >= a).map((_, i) => [i + 1, true])) } } }
}

export default function WeakSpotMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...RUN, ...NOMAP].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1], [12.8, 17.6]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a10" water="#2a1a30" deep="#08060a" cloud="#d8b8d0" spark="#ff8ad8" seed={43} />
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
