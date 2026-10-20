import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { SeamWraithSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/BothSidesScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 8, "Both Sides of the Story" (videos.json level-3-8-intro):
 *   A 0–8    the Seam: the torus' cohomology towers on one side, homology on the other
 *   B 8–18   twins light in pairs across the seam: H⁰–H₂, H¹–H₁, H²–H₀
 *   C 18–24  ℝP²: over ℤ the pairs fail; switched to ℤ₂ they match; a wraith claws at the seam
 *   D 24–26  Gyroid steps onto the seam
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 26, [[6, 8.6, 12], [0, 0.2, 0.6]], [[-1, 9.2, 11.4], [0, 0.2, 0.4]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const PAIRS = [9, 11, 13]
function set(t) {
  if (t < 18) return { id: 'twin_towers', bag: { pairs: { twin_towers: Object.fromEntries(PAIRS.filter((a) => t >= a).map((_, k) => [k, true])) } } }
  const z2 = t >= 20.5
  return { id: 'broken_mirror', bag: { coef: z2 ? 'Z2' : 'Z', pairs: { broken_mirror: z2 ? { 0: true, 1: true, 2: true } : { 0: false, 1: false, 2: false } } } }
}

export default function BothSidesMovie({ tRef }) {
  const wraith = useMemo(() => ({ x: 0, z: 0, seed: 0.9, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const wG = useRef()
  useFrame(() => {
    const t = tRef.current
    wG.current.visible = t >= 21 && t < 24.5
    wraith.x = 0.6 * Math.sin(t * 2)
    wraith.z = 5 - 2.4 * smooth(seg(t, 21, 23))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...PAIRS, 20.5].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [18.4, 23.6]])
    return { pos: [-4.6, 0, -1.2], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100a10" water="#3a1a34" deep="#0a060a" cloud="#e8b8d8" spark="#ff8ad8" seed={38} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={wG}>
        <SeamWraithSpawn e={wraith} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
