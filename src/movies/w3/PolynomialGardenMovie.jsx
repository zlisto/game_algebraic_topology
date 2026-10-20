import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/PolynomialGardenScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 6, "Polynomial Garden" (videos.json level-3-6-intro):
 *   A 0–8    the ℝP⁴ fountain, α lit
 *   B 8–18   Gyroid casts α again and again: α², α³, α⁴ — then α⁵ fizzles
 *   C 18–24  ℝP⁴ and ℝP² side by side: α³ lights one and fizzles on the other
 *   D 24–28  title card
 */

const SHOTS = [
  [0, 24, [[6, 7.4, 11.4], [0, 1.0, 0.6]], [[-1, 7.8, 11], [0, 1.0, 0.6]]],
  [24, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const CLIMB = [9, 10.5, 12, 14]
const ANTI = [19, 20.5]
function set(t) {
  if (t < 18) {
    const n = CLIMB.filter((a) => t >= a).length
    return { id: 'climb_powers', bag: { pow: { climb_powers: 1 + n }, fizz: { climb_powers: n === 4 } } }
  }
  const n = ANTI.filter((a) => t >= a).length
  return { id: 'antipodes', bag: { pow: { antipodes: 1 + n }, fizz: { antipodes: n === 2 } } }
}

export default function PolynomialGardenMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...CLIMB, ...ANTI].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [18.4, 23.6]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a1012" water="#183a40" deep="#060c0e" cloud="#a8e0e0" spark="#ffd27a" seed={36} />
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
