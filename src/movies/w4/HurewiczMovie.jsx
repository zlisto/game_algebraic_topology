import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/HurewiczScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 6, "Hurewicz" (videos.json level-4-6-intro):
 *   A 0–10   S²'s homotopy and homology meters, read row by row
 *   B 10–20  the bridges: degree 1 and 2 hold, degree 3 fails
 *   C 20–24  title card
 */

const SHOTS = [
  [0, 20, [[6, 8.6, 12], [0, 0, 0.4]], [[-1, 9.2, 11.4], [0, 0, 0.4]]],
  [20, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const READ = [2, 4, 6]
const BR = [[11.5, 'iso'], [13.5, 'iso'], [15.5, 'none']]
function set(t) {
  if (t < 10) return { id: 'meters', bag: { read: { meters: Object.fromEntries(READ.filter((a) => t >= a).map((_, i) => [i + 1, true])) } } }
  return { id: 'beyond', bag: { bridges: { beyond: Object.fromEntries(BR.filter(([a]) => t >= a).map(([, s], i) => [i + 1, s])) } } }
}

export default function HurewiczMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...READ, ...BR.map(([a]) => a)].find((a) => t > a - 0.25 && t < a + 0.25)
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8], [10.4, 18]])
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
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
