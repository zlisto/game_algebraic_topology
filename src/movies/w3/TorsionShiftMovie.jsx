import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { VineChokerSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/TorsionShiftScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 2, "Torsion Shift" (videos.json level-3-2-intro):
 *   A 0–8    the terrace: ℝP²'s homology on the left, an empty cohomology terrace on the right
 *   B 8–18   ℤ stays on its floor; the ℤ₂ vine climbs one floor up
 *   C 18–24  a vine-choker spawn creeps in
 *   D 24–28  title card
 */

const SHOTS = [
  [0, 18, [[6, 8.6, 12], [0, -0.2, 1.6]], [[-1, 9.2, 11.4], [0, -0.2, 1.6]]],
  [18, 24, [[0, 5, 10.6], [0, 0, 3]], [[0.4, 5.2, 10.8], [0, 0, 3]]],
  [24, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const MOVES = [[9.4, { plant: 'r0', floor: 0, g: 'Z', kind: 'Hom' }], [12.6, { plant: 'r1', floor: 2, g: 'Z2', kind: 'Ext' }]]
function set(t) {
  return { id: 'climbing_vine', bag: { placed: { climbing_vine: MOVES.filter(([a]) => t >= a).map(([, m]) => m) }, sel: { climbing_vine: t > 11.4 && t < 12.6 ? 'r1' : t > 8.6 && t < 9.4 ? 'r0' : null } } }
}

export default function TorsionShiftMovie({ tRef }) {
  const vine = useMemo(() => ({ x: 0, z: 0, seed: 0.5, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const vG = useRef()
  useFrame(() => {
    const t = tRef.current
    vG.current.visible = t >= 18
    vine.x = -1.2
    vine.z = 6 - 2.4 * smooth(seg(t, 18, 21))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [8.6, 9.4, 11.4, 12.6].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [12.8, 17.6]])
    return { pos: [-0.4, 0, 4.6], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c120a" water="#24381c" deep="#080c06" cloud="#c8e0a8" spark="#e8ffb0" seed={32} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={vG}>
        <VineChokerSpawn e={vine} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
