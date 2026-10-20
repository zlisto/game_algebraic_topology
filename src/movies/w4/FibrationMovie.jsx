import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/FibrationScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 10, "Fibration Station" (videos.json level-4-10-intro):
 *   A 0–10   the helix over the circle; a loop lifts
 *   B 10–18  the loop space floor
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[5, 8.6, 11], [0, -0.2, 0]], [[-1, 9.2, 10.6], [0, -0.2, 0]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function set(t) {
  if (t < 10) return { id: 'lift', bag: { round: 0, start: t >= 3 ? 1 : null } }
  return { id: 'loops', bag: { picks: { 0: 'ℤ', 1: 'ℤ', 2: 'ℤ₂' } } }
}

export default function FibrationMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = within(t, [[10.4, 15.6]])
    return { pos: [3.0, 0, 3.9], rotY: -0.6, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1]])
    return { pos: [-2.6, 0, 4.2], rotY: 0.3, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e12" water="#1e2e3a" deep="#060a0e" cloud="#c8dcec" spark="#9fe6ff" seed={50} />
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
