import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { CrumplerSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/SingularShallowsScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 3, "Any Simplex Will Do" (videos.json level-2-3-intro):
 *   A 0–8    the Shallows: a ring of stone round a pond, no tiles anywhere
 *   B 8–16   three bent paths and a constant one appear; the Blade cuts each — same ends
 *   C 16–24  the thick ring is squeezed onto its middle circle
 *   D 24–26  crumpler spawn tumble in
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 8, [[9, 8, 12], [0, -0.6, 1.4]], [[2, 9.4, 10.4], [0, -0.6, 1.4]]],
  [8, 24, [[1, 10, 10.2], [0, -0.8, 1.4]], [[-1, 10, 10.2], [0, -0.8, 1.4]]],
  [24, 26, [[0, 4, 10.6], [0, -0.4, 3]], [[0, 4.2, 11], [0, -0.4, 3]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const CUTS = [['s1', 10.4], ['s2', 11.2], ['s3', 12], ['s0', 12.8]]
function set(t) {
  if (t < 8.6) return { id: 'same', bag: { squeeze: 0 } }
  if (t < 16) return { id: 'any_tri', bag: { spent: { any_tri: Object.fromEntries(CUTS.filter(([, a]) => t >= a).map(([k]) => [k, true])) } } }
  return { id: 'same', bag: { squeeze: t < 17 ? 0 : t < 18.6 ? 1 : t < 20.2 ? 2 : 3 } }
}

export default function AnySimplexMovie({ tRef }) {
  const wads = useMemo(() => [0, 1, 2].map((i) => ({ x: 0, z: 0, seed: i * 2.1, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const wG = useRef()
  useFrame(() => {
    const t = tRef.current
    wG.current.visible = t >= 23.8
    wads.forEach((e, i) => {
      const k = smooth(seg(t, 24 + i * 0.3, 25.2 + i * 0.3))
      e.x = -2.4 + i * 2.4
      e.z = 7.5 - 4.6 * k
    })
  })
  const gyro = () => {
    const t = tRef.current
    const cut = CUTS.map(([, a]) => a).find((a) => t > a - 0.3 && t < a + 0.3)
    return { pos: [3.9, 0, 3.4], rotY: -0.8, run: 0, cast: within(t, [[17, 20.4]]) ? 0.7 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[8.4, 12.6], [20.8, 24]])
    return { pos: [-3.9, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#081216" water="#0f3040" deep="#050c10" cloud="#a0c8d8" spark="#9fe6ff" seed={23} />
      <fog attach="fog" args={['#0a1820', 10, 34]} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag, live: true })}</group>}
      </Timed>
      <group ref={wG}>
        {wads.map((e, i) => (
          <CrumplerSpawn key={i} e={e} />
        ))}
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
