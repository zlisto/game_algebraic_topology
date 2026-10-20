import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { LeakSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/ChaseChannelsScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 4, "Chase Scene" (videos.json level-2-4-intro):
 *   A 0–8    a row of locks, ℤ₄ → ℤ₄ → ℤ₂, joined by sluices
 *   B 8–16   the left sluice is reset until gold lands exactly on blue: exact
 *   C 16–24  the disk and its rim: the unknown lock H₂(D², S¹) tries groups until the row is exact
 *   D 24–26  leak spawn
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 8, [[8, 8, 13], [0, -0.6, 2.4]], [[1, 9.4, 11.6], [0, -0.6, 2.4]]],
  [8, 24, [[1, 9.4, 11.6], [0, -0.6, 2.4]], [[-1, 9.6, 11.6], [0, -0.6, 2.0]]],
  [24, 26, [[0, 4, 11], [0, -0.4, 3.4]], [[0, 4.2, 11.4], [0, -0.4, 3.4]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const SETS = [9.2, 11]
const PICKS = [[17.4, '0'], [19, 'Z2'], [20.6, 'Z']]
function set(t) {
  if (t < 16) return { id: 'exact', bag: { ks: { exact: [SETS.filter((a) => t >= a).length, 1] } } }
  const p = PICKS.filter(([a]) => t >= a).pop()
  return { id: 'pair', bag: { pick: { pair: p ? p[1] : undefined } } }
}

export default function ChaseSceneMovie({ tRef }) {
  const leaks = useMemo(() => [0, 1].map((i) => ({ x: 0, z: 0, seed: i * 1.3, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const lG = useRef()
  useFrame(() => {
    const t = tRef.current
    lG.current.visible = t >= 23.8
    leaks.forEach((e, i) => {
      const k = smooth(seg(t, 24 + i * 0.4, 25.4 + i * 0.4))
      e.x = -1.4 + i * 2.8
      e.z = 7 - 3.6 * k
    })
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...SETS, ...PICKS.map(([a]) => a)].find((a) => t > a - 0.3 && t < a + 0.3)
    return { pos: [4.1, 0, 3.4], rotY: -0.8, run: 0, cast: 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [8.4, 12.4], [20.8, 24]])
    return { pos: [-4.1, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e16" water="#102a48" deep="#060a14" cloud="#a0b8e0" spark="#9fc8ff" seed={24} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag, live: true })}</group>}
      </Timed>
      <group ref={lG}>
        {leaks.map((e, i) => (
          <LeakSpawn key={i} e={e} />
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
