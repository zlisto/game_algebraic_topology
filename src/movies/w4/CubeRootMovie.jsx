import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { PatrolSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/CubeHallScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 1, "Cube Root" (videos.json level-4-1-intro):
 *   A 0–8    Cube Hall: a square whose whole edge is pinned to the beacon
 *   B 8–18   two subcubes shrink, slide round each other, and regrow in the other order
 *   C 18–26  a ribbon patrol stumbles in and dissolves
 *   D 26–30  title card
 */

const SHOTS = [
  [0, 26, [[6, 8.6, 12], [0, 0, 0]], [[-1, 9.2, 11.4], [0, 0, 0]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const PINS = [[1.4, 's'], [2.4, 'e'], [3.4, 'n'], [4.4, 'w']]
const STEPS = [9.4, 10.8, 12.2, 13.6, 15]
function set(t) {
  if (t < 8) return { id: 'pinned', bag: { pinned: Object.fromEntries(PINS.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  return { id: 'pass', bag: { stage: { pass: STEPS.filter((a) => t >= a).length } } }
}

export default function CubeRootMovie({ tRef }) {
  const patrol = useMemo(() => ({ x: 0, z: 0, seed: 0.3, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const pG = useRef()
  useFrame(() => {
    const t = tRef.current
    pG.current.visible = t >= 18 && t < 25
    patrol.x = -1 + 2 * smooth(seg(t, 18, 21))
    patrol.z = 5.4 - 2 * smooth(seg(t, 18, 21))
    patrol.alive = t < 23
    patrol.dying = t >= 23 ? Math.min(1, (t - 23) / 1.5) : 0
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...PINS.map(([a]) => a), ...STEPS].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : t > 22.4 && t < 23.2 ? seg(t, 22.4, 23.2) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1], [12.8, 17.6]])
    return { pos: [-4.4, 0, -1.4], rotY: 1.2, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0a14" water="#241a40" deep="#06060c" cloud="#c8b8f0" spark="#c9a0ff" seed={41} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={pG}>
        <PatrolSpawn e={patrol} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
