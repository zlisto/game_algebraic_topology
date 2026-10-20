import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/MapsClassesScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 9, "Maps Classes" (videos.json level-4-9-intro):
 *   A 0–10   a lever steps the degree of a circle map; the reading follows
 *   B 10–18  the torus: two windings, one class
 *   C 18–24  title card
 */

const SHOTS = [
  [0, 18, [[5, 8.6, 11], [0, -0.2, 0]], [[-1, 9.2, 10.6], [0, -0.2, 0]]],
  [18, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function set(t) {
  if (t < 10) return { id: 'pull', bag: { d: t < 2.5 ? 1 : t < 5 ? 2 : t < 7.5 ? 3 : -2, step: 0 } }
  return { id: 'read', bag: { wa: t < 12.5 ? 1 : 2, wb: t < 15 ? 0 : -1 } }
}

export default function MapsClassesMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = within(t, [[10.4, 15.6]])
    return { pos: [3.0, 0, 4.0], rotY: -0.6, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100c0a" water="#3a2818" deep="#0a0806" cloud="#e8d0b0" spark="#ffd27a" seed={49} />
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
