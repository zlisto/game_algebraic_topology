import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/SuspensionScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 4, "Suspension of Disbelief" (videos.json level-4-4-intro):
 *   A 0–8    the shaft: π₁(S¹), π₂(S²), π₃(S³)
 *   B 8–18   Emmy tunes the Sling; a degree-2 map rides up floor by floor
 *   C 18–24  the first stem: η climbs from ℤ to ℤ₂ and stays there
 *   D 24–28  title card
 */

const SHOTS = [
  [0, 24, [[6, 8.6, 12], [0, 0, 0]], [[-1, 9.2, 11.4], [0, 0, 0]]],
  [24, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const UP = [12, 14.5]
const CLIMB = [19.4, 20.6, 21.8]
function set(t) {
  if (t < 18) return { id: 'degree', bag: { deg: t < 9.5 ? 1 : 2, at: { degree: UP.filter((a) => t >= a).length } } }
  return { id: 'climb', bag: { at: { climb: CLIMB.filter((a) => t >= a).length } } }
}

export default function SuspensionMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [9.5, ...UP, ...CLIMB].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[0.6, 4.6], [12.8, 16.1], [18.4, 23.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[4.8, 8.1], [8.4, 12.6]])
    return { pos: [-1.8, 0, 4.6], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e14" water="#1a2c40" deep="#060a0e" cloud="#b8d0e8" spark="#ffd27a" seed={44} />
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
