import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/ProductPlacementScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 5, "Product Placement" (videos.json level-3-5-intro):
 *   A 0–8    the grid garden: S¹ × S¹, rows and columns of beds
 *   B 8–16   each bed goes to its degree bin: 1, 2, 1 — the torus
 *   C 16–22  S² × S²: 1, 0, 2, 0, 1
 *   D 22–26  title card
 */

const SHOTS = [
  [0, 22, [[6, 8.6, 12], [0, -0.4, 0.6]], [[-1, 9.4, 11.4], [0, -0.4, 0.4]]],
  [22, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const T1 = [['0-0', 8.8], ['0-1', 9.8], ['1-0', 10.8], ['1-1', 11.8]]
const T2 = [['0-0', 16.6], ['0-1', 17.4], ['1-0', 18.2], ['1-1', 19]]
const BEATS = [...T1, ...T2].map(([, a]) => a)
function set(t) {
  if (t < 16) return { id: 'row_col', bag: { placed: { row_col: Object.fromEntries(T1.filter(([, a]) => t >= a).map(([k]) => [k, true])) } } }
  return { id: 'sphere_sphere', bag: { placed: { sphere_sphere: Object.fromEntries(T2.filter(([, a]) => t >= a).map(([k]) => [k, true])) } } }
}

export default function ProductPlacementMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6]])
    return { pos: [-3.2, 0, 3.8], rotY: 0.7, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100e08" water="#3a3018" deep="#0a0804" cloud="#e8d8a8" spark="#ffe6a8" seed={35} />
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
