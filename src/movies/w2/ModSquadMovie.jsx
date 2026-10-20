import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { FlipperSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ModMillScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 9, "Mod Squad" (videos.json level-2-9-intro):
 *   A 0–8    the fan with ℤ₂ coefficients: all four triangles at 1 leave just the rim
 *   B 8–18   the Klein bottle's 2-cell: mod 2 both letters read 0, and it lights up
 *   C 18–24  a flipper tries to turn an arrow round; mod 2, nothing changes
 *   D 24–28  title card
 */

const SHOTS = [
  [0, 18, [[6, 9, 12.4], [0, -0.2, 2]], [[-1, 9.6, 11.6], [0, 0, 2]]],
  [18, 24, [[0, 6, 10.4], [0, 0, 2.4]], [[0.6, 6.2, 10.6], [0, 0, 2.4]]],
  [24, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const FAN = [['0-1-4', 1.4], ['1-2-4', 2.2], ['2-3-4', 3], ['0-3-4', 3.8]]
function set(t) {
  if (t < 8) return { id: 'even', bag: { tri: { even: Object.fromEntries(FAN.filter(([, a]) => t >= a).map(([k]) => [k, 1])) } } }
  return { id: 'frogs', bag: { coef: { frogs: { a: t < 9.4 ? 1 : 0, b: t < 10.2 ? 1 : 0 } }, solved: { frogs: t >= 11 } } }
}

export default function ModSquadMovie({ tRef }) {
  const frog = useMemo(() => ({ x: 0, z: 0, seed: 0.7, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const fG = useRef()
  useFrame(() => {
    const t = tRef.current
    fG.current.visible = t >= 18
    frog.x = 2.0 + 0.4 * Math.sin(t * 3)
    frog.z = 5.6 - 3.2 * smooth(seg(t, 18, 20))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...FAN.map(([, a]) => a), 9.4, 10.2, 11].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6], [18.4, 23.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [12.8, 17.6]])
    return { pos: [-0.6, 0, 4.7], rotY: 0.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#120e0a" water="#3a2a18" deep="#0c0804" cloud="#e0c8a0" spark="#ffd27a" seed={29} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={fG}>
        <FlipperSpawn e={frog} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
