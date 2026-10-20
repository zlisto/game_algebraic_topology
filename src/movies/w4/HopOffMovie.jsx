import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import CountNull from '../../characters/CountNull'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/HopfRingScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 7, "Hop Off" (videos.json level-4-7-intro):
 *   A 0–8    the Hopf Ring: a little S² and the space around it
 *   B 8–16   Gyroid touches points of S²; a circle lights above each
 *   C 16–26  the circles link, each through each, exactly once
 *   D 26–30  Count Null's image flickers
 *   E 30–34  title card
 */

const SHOTS = [
  [0, 16, [[6, 7.6, 11], [0, 1.4, 0]], [[0, 7.4, 10.4], [0, 1.4, 0]]],
  [16, 26, [[0, 7.4, 10.4], [1, 2.0, 0]], [[-3, 7, 9.6], [1, 2.0, 0]]],
  [26, 30, [[0.6, 6.6, 10.2], [0, 1.6, -1.6]], [[-0.6, 6.8, 10.4], [0, 1.6, -1.6]]],
  [30, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const LIGHT = [[9, 'a'], [11, 'b'], [13, 'c'], [15, 'd']]
function set(t) {
  return { id: 'circle', bag: { lit: { circle: Object.fromEntries(LIGHT.filter(([a]) => t >= a).map(([, k]) => [k, true])) } } }
}

export default function HopOffMovie({ tRef }) {
  const nullG = useRef()
  useFrame(() => {
    nullG.current.visible = tRef.current >= 26 && tRef.current < 30
  })
  const gyro = () => {
    const t = tRef.current
    const cut = LIGHT.map(([a]) => a).find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[12.8, 20.6]])
    return { pos: [-2.8, 0, 4.2], rotY: 0.6, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 12.6], [20.8, 25.6]])
    return { pos: [2.6, 0, 4.2], rotY: -0.5, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  const nullScript = () => ({ gesture: within(tRef.current, [[26.4, 29.8]]) ? 0.8 : 0, crown: 0.4 })
  return (
    <>
      <YardSky bg="#0c0a10" water="#2a1e34" deep="#08060a" cloud="#d8c8e8" spark="#ffd27a" seed={47} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={nullG} position={[0, 0.2, -3.8]} scale={0.9}>
        <CountNull script={nullScript} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
