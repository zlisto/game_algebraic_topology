import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/CellBlockScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 7, "Cell Block" (videos.json level-2-7-intro):
 *   A 0–8    crates attached one dimension at a time: a point, two loops, then the disk folds a torus
 *   B 8–16   the torus' 2-cell: the Dial reads both letters as 0
 *   C 16–24  ℝP²: a disk whose rim runs round a twice; the Dial reads 2
 *   D 24–26  the census: the Klein bottle attached
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 24, [[6, 9, 12.4], [0, -0.2, 2]], [[-1, 9.6, 11.6], [0, 0, 2]]],
  [24, 26, [[0, 7, 10.6], [0, 1, 1]], [[0.6, 7, 10.6], [0, 1, 1]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const BUILD = [[1.2, 'e0'], [2.4, 'a'], [3.6, 'b'], [5, 'e2']]
const BEATS = [...BUILD.map(([a]) => a), 9.4, 10.4, 11.4, 12.4, 13.4, 17.4, 21, 24.4]
function set(t) {
  if (t < 8) return { id: 'crates', bag: { built: Object.fromEntries(BUILD.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  if (t < 16) {
    const a = t < 9.4 ? 1 : t < 10.4 ? 2 : t < 11.4 ? -2 : t < 12.4 ? -1 : 0
    const b = t < 12.4 ? 1 : 0
    return { id: 'torus', bag: { coef: { torus: { a, b: t < 13.4 ? b : 0 } }, solved: { torus: t >= 13.4 } } }
  }
  if (t < 24) return { id: 'doubled', bag: { coef: { doubled: { a: t < 17.4 ? 1 : 2 } }, solved: { doubled: t >= 21 } } }
  return { id: 'census', bag: { coef: { census: { a: 0, b: 2 } }, solved: { census: t >= 24.4 } } }
}

export default function CellBlockMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[8.4, 12.4], [20.8, 24]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [16.4, 20.6]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.4, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0e12" water="#1a2a34" deep="#060a0c" cloud="#b0c4d0" spark="#ffe6a8" seed={27} />
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
