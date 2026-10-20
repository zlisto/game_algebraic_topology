import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { MothSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/FrontFaceScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 3, "Front Face, Back Face" (videos.json level-3-3-intro):
 *   A 0–8    a triangle with two readings on its edges
 *   B 8–16   the Cup Caster takes φ's front face and ψ's back face; the lantern lights 6
 *   C 16–24  the torus: α ⌣ β lights the top lantern +1; swapped, β ⌣ α flips it to −1
 *   D 24–26  moths
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 24, [[6, 8.6, 12], [0, 0.2, 1.4]], [[-1, 9.2, 11.4], [0, 0.2, 1.2]]],
  [24, 26, [[0, 5, 10.6], [0, 0.6, 3]], [[0.4, 5.2, 10.8], [0, 0.6, 3]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function set(t) {
  if (t < 16) return { id: 'front_back', bag: { picks: { front_back: [...(t >= 9.4 ? ['0-1'] : []), ...(t >= 11 ? ['1-2'] : [])] } } }
  if (t < 20) return { id: 'cocycle_products', bag: { cast: { cocycle_products: { ...(t >= 17 ? { L: true } : {}), ...(t >= 18 ? { U: true } : {}) } } } }
  return { id: 'swap', bag: { cast: { swap: { ...(t >= 21 ? { L: true } : {}), ...(t >= 22 ? { U: true } : {}) } } } }
}

export default function FrontFaceMovie({ tRef }) {
  const moths = useMemo(() => [0, 1, 2].map((i) => ({ x: 0, z: 0, seed: i * 1.4, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const mG = useRef()
  useFrame(() => {
    const t = tRef.current
    mG.current.visible = t >= 23.8
    moths.forEach((e, i) => {
      e.x = -2 + i * 2
      e.z = 6.5 - 3 * smooth(seg(t, 24 + i * 0.3, 25.4 + i * 0.3))
    })
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [9.4, 11, 17, 18, 21, 22].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[16.4, 20.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk || within(t, [[8.4, 12]]) ? 0.6 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6], [8.4, 12.4], [20.8, 24]])
    return { pos: [-4.0, 0, 3.0], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a14" water="#2a1e40" deep="#08060c" cloud="#d8c0f0" spark="#ffd27a" seed={33} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={mG}>
        {moths.map((e, i) => (
          <MothSpawn key={i} e={e} />
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
