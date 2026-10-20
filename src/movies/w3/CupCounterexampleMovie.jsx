import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/CupCounterexampleScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 4, "A Cup of Counterexample" (videos.json level-3-4-intro):
 *   A 0–8    the twin islands: torus and bouquet, both meters reading ℤ, ℤ², ℤ
 *   B 8–16   α ⌣ β on the torus: the top lantern blazes
 *   C 16–24  on the bouquet the beams never meet; the ball stays dark
 *   D 24–28  side by side: one lit, one dark
 *   E 28–32  title card
 */

const SHOTS = [
  [0, 28, [[6, 8.6, 12], [0, 0.2, 1.4]], [[-1, 9.2, 11.4], [0, 0.2, 1.2]]],
  [28, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const BEATS = [2.4, 4.2, 9.6, 11, 17.2, 18.4, 19.6, 24.6, 25.6]
function set(t) {
  if (t < 8) return { id: 'same_holes', bag: { read: { T: t >= 2.4, X: t >= 4.2 } } }
  if (t < 16) return { id: 'cast_torus', bag: { cast: { cast_torus: { ...(t >= 9.6 ? { L: true } : {}), ...(t >= 11 ? { U: true } : {}) } } } }
  if (t < 24) return { id: 'cast_bouquet', bag: { cast: { cast_bouquet: { a: t >= 17.2, b: t >= 18.4, sphere: t >= 19.6 } } } }
  return { id: 'nulls_answer', bag: { cast: { nulls_answer: { T: t >= 24.6, X: t >= 25.6 } } } }
}

export default function CupCounterexampleMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[0.6, 4.6], [16.4, 20.6], [24.4, 27.8]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[8.4, 12.6], [20.8, 24]])
    return { pos: [-4.4, 0, -1.6], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e12" water="#14324a" deep="#060a0e" cloud="#b8d0e8" spark="#ffd27a" seed={34} />
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
