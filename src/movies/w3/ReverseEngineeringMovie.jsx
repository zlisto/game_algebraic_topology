import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { EchoSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/ReverseEngineeringScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 1, "Reverse Engineering" (videos.json level-3-1-intro):
 *   A 0–8    the Mirror Pools: one triangle with readings on its edges
 *   B 8–16   Gyroid sets the fan's spokes and every triangle balances
 *   C 16–24  a reading balanced on the filled tile glows round the missing one
 *   D 24–26  an echo spawn stirs in the pool
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 24, [[6, 9, 12.4], [0, -0.4, 2]], [[-1, 9.6, 11.6], [0, -0.4, 2]]],
  [24, 26, [[0, 5, 10.6], [0, 0, 3]], [[0.4, 5.2, 10.8], [0, 0, 3]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const SPOKES = [['1-4', -1, 9], ['2-4', -1, 10], ['3-4', -2, 11]]
const HOLE = [['0-2', 1, 16.8], ['2-3', 1, 17.6], ['0-1', 1, 18.4]]
function set(t) {
  if (t < 8) return { id: 'read_edge', bag: {} }
  if (t < 16) return { id: 'balanced', bag: { phi: { balanced: Object.fromEntries(SPOKES.filter(([, , a]) => t >= a).map(([k, v]) => [k, v])) } } }
  return { id: 'around_hole', bag: { phi: { around_hole: Object.fromEntries(HOLE.filter(([, , a]) => t >= a).map(([k, v]) => [k, v])) } } }
}

export default function ReverseEngineeringMovie({ tRef }) {
  const echo = useMemo(() => ({ x: 1.6, z: 3.6, seed: 0.3, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const eG = useRef()
  useFrame(() => {
    const t = tRef.current
    eG.current.visible = t >= 23.8
    echo.x = 1.6 + Math.sin(t * 2) * 0.6 * smooth(seg(t, 24, 25))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...SPOKES.map(([, , a]) => a), ...HOLE.map(([, , a]) => a)].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6], [24.2, 25.8]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [16.4, 20.6]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e16" water="#2a3a5a" deep="#06080e" cloud="#c8d4f0" spark="#e0e8ff" seed={31} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag, live: true })}</group>}
      </Timed>
      <group ref={eG}>
        <EchoSpawn e={echo} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
