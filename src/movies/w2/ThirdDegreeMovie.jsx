import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import CountNull from '../../characters/CountNull'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { MESSY, Station, tighten } from '../../levels/w2/DynamoGateScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 6, "The Third Degree" (videos.json level-2-6-intro):
 *   A 0–8    a band wound on and back round a post is pulled tight: two turns
 *   B 8–16   Count Null's image appears behind the gate, unimpressed
 *   C 16–26  two maps of the circle compose; one turns inside out (degree −1); the band winds −6 times
 *   D 26–30  a combed sphere: wherever the comb turns, two calm spots remain
 *   E 30–34  title card
 */

const SHOTS = [
  [0, 8, [[8, 8.6, 12.4], [0, -0.4, 2]], [[1, 9.6, 11.4], [0, -0.4, 2]]],
  [8, 16, [[0.6, 6.6, 10.4], [0, 1.4, -1.2]], [[-0.6, 6.8, 10.6], [0, 1.4, -1.2]]],
  [16, 26, [[1, 9.6, 11.4], [0, -0.4, 2]], [[-1, 9.6, 11.4], [0, -0.4, 2]]],
  [26, 30, [[0, 6.4, 9.4], [0, 1.2, 0.8]], [[1, 6.4, 9.4], [0, 1.2, 0.8]]],
  [30, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const PULLS = [4.6, 6.2]
const WRAPS = [[16.6, 1, 1], [17.8, 2, 1], [20.8, 2, -1], [22.6, 2, -3]]
const COMBS = [[27.4, [0.5, 0.8, 0.33]], [28.6, [-0.6, 0.7, -0.4]]]
function set(t) {
  if (t < 16) {
    let s = MESSY
    PULLS.filter((a) => t >= a).forEach(() => (s = tighten(s)))
    return { id: 'hollow', bag: { segs: s } }
  }
  if (t < 26) {
    const [, a, b] = WRAPS.filter(([at]) => t >= at).pop() || WRAPS[0]
    return { id: 'wrap', bag: { wrap: { a, b } } }
  }
  const c = COMBS.filter(([at]) => t >= at).pop()
  const ax = c ? c[1] : [0, 1, 0]
  const n = Math.hypot(...ax)
  return { id: 'hairy', bag: { axis: ax.map((v) => v / n) } }
}

export default function ThirdDegreeMovie({ tRef }) {
  const nullG = useRef()
  useFrame(() => {
    const t = tRef.current
    nullG.current.visible = t >= 8 && t < 16
  })
  const nullScript = () => {
    const t = tRef.current
    return { gesture: t > 8.4 && t < 12.6 ? 0.8 : 0, crown: 0.4 }
  }
  const gyro = () => {
    const t = tRef.current
    const cut = [...PULLS, ...WRAPS.map(([a]) => a), ...COMBS.map(([a]) => a)].find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[0.6, 4.8], [20.8, 25.6]])
    return { pos: [4.3, 0, 3.4], rotY: -0.8, run: 0, cast: talk ? 0.6 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[16.4, 20.6], [26.4, 29.8]])
    return { pos: [-4.3, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0c16" water="#221a40" deep="#08060e" cloud="#b8a8f0" spark="#ffd27a" seed={26} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={nullG} position={[0, 0.2, -3.4]} scale={0.9}>
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
