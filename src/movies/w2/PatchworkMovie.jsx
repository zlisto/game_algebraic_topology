import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { CANDIDATES, Station } from '../../levels/w2/PatchworkScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 8, "Patchwork" (videos.json level-2-8-intro):
 *   A 0–8    the fields: a sphere waiting for its patches
 *   B 8–18   two caps clasped on; their overlap band glows; the row finds H₂(S²) = ℤ
 *   C 18–24  the Klein bottle from two Möbius bands; the row finds ℤ ⊕ ℤ₂
 *   D 24–28  title card
 */

const SHOTS = [
  [0, 8, [[7, 8.4, 12.4], [0, 0.2, 1.4]], [[1, 9.2, 11.4], [0, 0.2, 0.8]]],
  [8, 24, [[1, 9.2, 11.4], [0, 0.2, 0.8]], [[-1, 9.4, 11.4], [0, 0.2, 0.6]]],
  [24, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const picks = (t, times) => {
  const n = times.filter((a) => t >= a).length
  return n ? CANDIDATES[n - 1] : undefined
}
const HEMI = [12.6, 14]
const TWIST = [20.4, 20.9, 21.4, 21.9, 22.4]
function set(t) {
  if (t < 18) return { id: 'hemi', bag: { patches: { hemi: { A: t >= 9, B: t >= 10.4 } }, pick: { hemi: picks(t, HEMI) } } }
  return { id: 'twist', bag: { patches: { twist: { A: t >= 18.6, B: t >= 19.4 } }, pick: { twist: picks(t, TWIST) } } }
}

export default function PatchworkMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [9, 10.4, ...HEMI, 18.6, 19.4, ...TWIST].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [18.4, 23.6]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.4, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e1210" water="#1e3424" deep="#081008" cloud="#c8d8b0" spark="#ffe6a8" seed={28} />
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
