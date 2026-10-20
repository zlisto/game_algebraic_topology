import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { GlitchSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w4/GridGalleryScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 4 · Level 2, "Snap to Grid" (videos.json level-4-2-intro):
 *   A 0–8    the Grid Gallery: a wiggly path snaps onto the grid lines, piece by piece
 *   B 8–18   a loop on S² = e⁰ ∪ e²: punctured, then pushed out to the single point e⁰
 *   C 18–22  a glitch sprite
 *   D 22–26  title card
 */

const SHOTS = [
  [0, 22, [[6, 8.6, 12], [0, -0.2, 0.6]], [[-1, 9.2, 11.4], [0, -0.2, 0.4]]],
  [22, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
const SNAPS = [1.6, 2.8, 4, 5.2]
function set(t) {
  if (t < 8) return { id: 'snap', bag: { snapped: { snap: Object.fromEntries(SNAPS.filter((a) => t >= a).map((_, i) => [i, true])) } } }
  return { id: 'slip', bag: { punct: t >= 10, pushed: t >= 12 } }
}

export default function SnapGridMovie({ tRef }) {
  const glitch = useMemo(() => ({ x: 0, z: 0, seed: 0.2, alive: true, dying: 0, face: 0, flash: 0 }), [])
  const gG = useRef()
  useFrame(() => {
    const t = tRef.current
    gG.current.visible = t >= 18
    glitch.x = 1.6 * Math.sin(t * 3)
    glitch.z = 5 - 2 * smooth(seg(t, 18, 20))
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...SNAPS, 10, 12].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 8.1]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0c10" water="#1a2430" deep="#06080a" cloud="#b8c8d8" spark="#e0e8ff" seed={42} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={gG}>
        <GlitchSpawn e={glitch} />
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
