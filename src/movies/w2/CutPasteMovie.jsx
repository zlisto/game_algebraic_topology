import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { QuarryGolemSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ExcisionCutScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 5, "Cut and Paste" (videos.json level-2-5-intro):
 *   A 0–8    the pair (X, A): a disk and the blue collar round its rim
 *   B 8–16   three holes cut deep inside the collar; nothing changes
 *   C 16–26  the rim crushed to a point — a sphere; then the ladder of spheres lights its diagonal
 *   D 26–28  a quarry golem lumbers in
 *   E 28–32  title card
 */

const SHOTS = [
  [0, 8, [[8, 8.6, 13], [0, -0.6, 2]], [[1, 10, 11.6], [0, -0.6, 2]]],
  [8, 26, [[1, 10, 11.6], [0, -0.6, 2]], [[-1, 10.2, 11.6], [0, -0.4, 1.8]]],
  [26, 28, [[0, 4.4, 11.4], [0, 0, 3.4]], [[0, 4.6, 11.8], [0, 0, 3.4]]],
  [28, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const CUTS = [[9, [3.4, 0.8]], [10.2, [-1.6, 3.0]], [11.4, [-2.2, -2.6]]]
const LADDER = [[21.4, '1-1'], [22.6, '2-2'], [23.8, '3-3']]
function set(t) {
  if (t < 16) return { id: 'cut_deep', bag: { cuts: { cut_deep: CUTS.filter(([a]) => t >= a).map(([, c]) => c) } } }
  if (t < 20.6) return { id: 'collapse', bag: { collapsed: t >= 16.4 } }
  return { id: 'ladder', bag: { lit: { '0-0': true, ...Object.fromEntries(LADDER.filter(([a]) => t >= a).map(([, k]) => [k, true])) } } }
}

export default function CutPasteMovie({ tRef }) {
  const golem = useMemo(() => ({ x: 0, z: 0, seed: 0.4, alive: true, dying: 0, face: 0, flash: 0, hp: 3 }), [])
  const gG = useRef()
  useFrame(() => {
    const t = tRef.current
    gG.current.visible = t >= 25.8
    golem.x = 0.4
    golem.z = 7.6 - 3.4 * smooth(seg(t, 26, 27.8))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...CUTS.map(([a]) => a), 16.4, ...LADDER.map(([a]) => a)].find((a) => t > a - 0.3 && t < a + 0.3)
    return { pos: [4.3, 0, 3.4], rotY: -0.8, run: 0, cast: 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [16.4, 21]])
    return { pos: [-4.3, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#100c14" water="#2a1a3a" deep="#0a0610" cloud="#c8a8e0" spark="#ffb0e8" seed={25} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={gG}>
        <QuarryGolemSpawn e={golem} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
