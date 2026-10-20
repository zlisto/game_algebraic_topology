import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { BANDS, N, Station, across } from '../../levels/w3/WhichWayScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 7, "Which Way Is Up" (videos.json level-3-7-intro):
 *   A 0–8    Compass Cliffs: a band of six patches with a half-twisted seam
 *   B 8–18   Gyroid carries a compass round; it comes back flipped
 *   C 18–26  the two sheets over the band, joined into one loop
 *   D 26–30  title card
 */

const SHOTS = [
  [0, 26, [[6, 8.6, 12], [0, -0.4, 1.2]], [[-1, 9.4, 11.4], [0, -0.4, 1.0]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const CARRY = [9, 10, 11, 12, 13, 14]
const RIDE = [19, 20, 21, 22, 23, 24]
function carried(k) {
  const comp = [1, 0, 0, 0, 0, 0]
  for (let i = 1; i <= Math.min(k, N - 1); i++) comp[i] = across(BANDS.the_flip.twists, i - 1, comp[i - 1])
  return comp
}
function set(t) {
  if (t < 18) {
    const k = CARRY.filter((a) => t >= a).length
    return { id: 'the_flip', bag: { comp: { the_flip: carried(k) }, next: { the_flip: Math.min(k + 1, N + 1) }, closed: { the_flip: k >= N } } }
  }
  return { id: 'two_sheets', bag: { step: { two_sheets: RIDE.filter((a) => t >= a).length * 2 } } }
}

export default function WhichWayMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...CARRY, ...RIDE].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [12.8, 17.6], [18.4, 23.6]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0e14" water="#1c2a40" deep="#06080e" cloud="#c0c8e0" spark="#ffd27a" seed={37} />
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
