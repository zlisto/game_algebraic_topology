import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { FlipperSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { YardSky } from '../../levels/w2/TileYardScene'
import { S, seg, smooth, mix3 } from '../../levels/w2/movieKit'
import { MovieDeck, MovieTiles } from './TileMovieKit'

/**
 * Intro movie for World 2 · Level 1, "Tile and Error" (videos.json level-2-1-intro):
 *   A 0–7    the Tile Yard: two triangles lie apart on a deck, arrows on their edges
 *   B 7–15   their c-arrows agree; they slide together into a square
 *   C 15–24  the square folds into a torus; Emmy turns one blue arrow; it folds into a Klein bottle
 *   D 24–26  flipper spawn hop onto the deck
 *   E 26–30  title card
 */

const SHOTS = [
  [0, 7, [[10, 9, 13], [0, 0.4, 0]], [[3, 8.5, 9.5], [0, 0.4, 0]]],
  [7, 15, [[3, 8.5, 9.5], [0, -0.6, 0.6]], [[1, 8, 8.6], [0, -0.6, 0.8]]],
  [15, 24, [[2.6, 4.6, 9.8], [0, 0.4, 0]], [[-2.6, 4.8, 9.8], [0, 0.4, 0]]],
  [24, 26, [[0, 3.8, 10.4], [0, -0.4, 3]], [[0, 4.0, 10.8], [0, -0.4, 3]]],
  [26, 40, [[0, 10, 13], [0, 0.4, 0]], [[0, 12, 16], [0, 0.4, 0]]],
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

const SQUARE = { bottom: 1, top: 1, left: 1, right: 1, diag: 1 }
function tiles(t) {
  if (t < 15) {
    // the left copy of c starts reversed; Emmy's line at 7.4 — it turns at 9, they glue 10–12
    return { arrows: { ...SQUARE, diagL: t < 9 ? -1 : 1 }, sides: false, split: 1 - smooth(seg(t, 10, 12)) }
  }
  if (t < 19.8) return { arrows: SQUARE, kind: 'torus', k: smooth(seg(t, 15.6, 19)) }
  const flipped = { ...SQUARE, right: -1 }
  return { arrows: flipped, kind: t < 20.4 ? null : 'klein', k: smooth(seg(t, 20.6, 23.6)) }
}

export default function TileYardMovie({ tRef }) {
  const frogs = useMemo(() => [0, 1, 2].map((i) => ({ x: 0, z: 0, seed: i * 1.7, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const fG = useRef()
  useFrame(() => {
    const t = tRef.current
    fG.current.visible = t >= 23.8
    frogs.forEach((e, i) => {
      const k = smooth(seg(t, 24 + i * 0.3, 25 + i * 0.3))
      e.x = -2 + i * 2
      e.z = 7 - 4.4 * k
      e.alive = t >= 23.8
    })
  })
  const gyro = () => {
    const t = tRef.current
    return { pos: [3.4, 0, 3.0], rotY: -0.8, run: 0, cast: t > 15 && t < 19 ? 0.6 : 0.1, whip: t > 25 && t < 25.8 ? seg(t, 25, 25.8) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = (t > 0.6 && t < 4.6) || (t > 7.4 && t < 11.4) || (t > 19.8 && t < 23.8)
    return { pos: [-3.4, 0, 2.8], rotY: 0.8, walk: 0, bow: 0, gesture: (t > 8.6 && t < 9.6) || (t > 19.8 && t < 20.6) ? 1 : talk ? 0.5 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky />
      <MovieDeck />
      <MovieTiles tRef={tRef} script={tiles} />
      <group ref={fG}>
        {frogs.map((e, i) => (
          <FlipperSpawn key={i} e={e} />
        ))}
      </group>
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
