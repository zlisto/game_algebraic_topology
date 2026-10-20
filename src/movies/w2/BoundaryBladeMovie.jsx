import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { COMPLEXES, deckChains } from '../../levels/w2/CancelMarshScene'
import ChainDeck from '../../levels/w2/ChainDeck'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth, mix3 } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'

/**
 * Intro movie for World 2 · Level 2, "Boundary Issues" (videos.json level-2-2-intro):
 *   A 0–8    Cancel Marsh: a fan of four triangles on a deck
 *   B 8–16   Gyroid cuts the fan: the inside edges cancel and only the rim is left
 *   C 16–24  he cuts the rim: every vertex comes back to zero
 *   D 24–28  a filled tile and a missing one; the loop round the missing one glows
 *   E 28–32  title card
 */

const SHOTS = [
  [0, 8, [[9, 9, 12], [0, -0.6, 1.2]], [[2, 9.4, 10.4], [0, -0.6, 1.2]]],
  [8, 24, [[1, 10, 10.2], [0, -0.8, 1.4]], [[-1, 10, 10.2], [0, -0.8, 1.4]]],
  [24, 28, [[-1, 10, 10.2], [0, -0.8, 1.4]], [[0, 9.6, 9.8], [0, -0.8, 1.4]]],
  [28, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(from[0], to[0], k))
    look.set(...mix3(from[1], to[1], k))
    camera.lookAt(look)
  })
  return null
}

const FAN = [['0-1-4', 8.8], ['1-2-4', 9.4], ['2-3-4', 10.0], ['0-3-4', 10.6]]
const RIM_CUTS = [['0-1', 16.8], ['1-2', 17.6], ['2-3', 18.4], ['0-3', 19.2]]
function set(t) {
  if (t < 16) return { id: 'shared', bag: { tri: { shared: Object.fromEntries(FAN.filter(([, at]) => t >= at).map(([k]) => [k, k === '0-3-4' ? -1 : 1])) } } }
  if (t < 24) return { id: 'nothing', bag: { spent: { nothing: Object.fromEntries(RIM_CUTS.filter(([, at]) => t >= at).map(([k]) => [k, true])) } } }
  return { id: 'missing', bag: { edge: { missing: t < 24.6 ? {} : { '0-2': 1, '2-3': 1, '0-3': -1 } } } }
}

export default function BoundaryBladeMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [...FAN.map(([, a]) => a), ...RIM_CUTS.map(([, a]) => a)].find((a) => t > a - 0.3 && t < a + 0.3)
    return { pos: [3.8, 0, 3.2], rotY: -0.8, run: 0, cast: 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = (t > 0.6 && t < 4.6) || (t > 20.6 && t < 27.8)
    return { pos: [-3.8, 0, 3.2], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0b120e" water="#1a2c22" deep="#070e0a" cloud="#a8c0a0" spark="#c8ff88" seed={22} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => (
          <group key={id}>
            <ChainDeck complex={COMPLEXES[id]} live {...deckChains(id, bag)} />
            {id === 'missing' && (
              <Html position={[-0.8, 0.3, -0.8]} center zIndexRange={[10, 0]}>
                <div className="deck-tag">missing tile</div>
              </Html>
            )}
          </group>
        )}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.6} />
      </EffectComposer>
    </>
  )
}
