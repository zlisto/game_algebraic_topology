import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/TwistTowerScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 11, "A Twist in the Tower" (videos.json level-4-11-intro):
 *   A 0–10   the tower rises floor by floor
 *   B 10–18  two towers, same floors, one twisted
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[5, 8.6, 11], [0, -0.2, 0]], [[-1, 9.2, 10.6], [0, -0.2, 0]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function set(t) {
  if (t < 10) return { id: 'rebuild', bag: { built: [2, 4.5, 7].filter((a) => t >= a).length } }
  return { id: 'untwist', bag: { k: { prod: '0', ...(t >= 13 ? { s2: '≠ 0' } : {}) } } }
}

export default function TwistTowerMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [3.0, 0, 3.9], rotY: -0.6, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1], [12.8, 17.6]])
    return { pos: [-2.6, 0, 4.2], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a12" water="#2a1e38" deep="#08060c" cloud="#dcc8f0" spark="#c8b6ff" seed={51} />
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
