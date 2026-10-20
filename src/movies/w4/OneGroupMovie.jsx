import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/OneGroupScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 5, "One Group" (videos.json level-4-5-intro):
 *   A 0–10   five spaces on pedestals; the K(G, 1)s light up
 *   B 10–18  S² with cells attached, killing π₃, π₄, π₅ in turn
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[6, 8.6, 12], [0, 0, 0.4]], [[-1, 9.2, 11.4], [0, 0, 0.4]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const MARKS = [[2, 'S1', 'yes'], [3, 'T', 'yes'], [4, 'RPinf', 'yes'], [5.4, 'S2', 'no'], [6.4, 'RP2', 'no']]
const KILLS = [11.6, 13.4, 15.2]
function set(t) {
  if (t < 10) return { id: 'recall', bag: { marks: Object.fromEntries(MARKS.filter(([a]) => t >= a).map(([, k, v]) => [k, v])) } }
  return { id: 'kill', bag: { killed: KILLS.filter((a) => t >= a).length } }
}

export default function OneGroupMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...MARKS.map(([a]) => a), ...KILLS].find((a) => t > a - 0.25 && t < a + 0.25)
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1]])
    return { pos: [-4.4, 0, -2.0], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0e12" water="#1c3038" deep="#06080a" cloud="#b0d0d0" spark="#ffd27a" seed={45} />
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
