import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import videos from '../../videos.json'
import CountNull from '../characters/CountNull'
import Emmy from '../characters/Emmy'
import Gyroid from '../characters/Gyroid'
import { DevAdvance } from '../levels/w0/OverworldScene'
import { YardSky } from '../levels/w2/YardFrame'
import { S } from '../levels/w2/movieKit'
import { MovieDeck } from './w2/TileMovieKit'
import { MovieFx, ShotCamera, within } from './w2/shots'

/**
 * The movie between two provinces (videos.json world-N-intro): Emmy and Gyroid on the causeway's
 * last deck, the next province ahead, and Null far off in the sky over the grey his Crown has left.
 * Who talks when comes straight from the video's captions, so the script can change freely.
 */

const SKIES = {
  1: { bg: '#0c0a14', water: '#241a3a', deep: '#06040c', cloud: '#c8b8f0', spark: '#ff8ad8', seed: 11 },
  2: { bg: '#0a1210', water: '#0e2a2a', deep: '#06100e', cloud: '#9cc8b8', spark: '#88ffcc', seed: 21 },
  3: { bg: '#0c1008', water: '#1e2a14', deep: '#060a04', cloud: '#d8e8b0', spark: '#ffd27a', seed: 31 },
  4: { bg: '#100c14', water: '#2a2038', deep: '#08060c', cloud: '#e0c8f0', spark: '#c8b6ff', seed: 41 },
}
const SHOTS = [
  [0, 16, [[7, 4.2, 10], [0, 1.2, 0]], [[3, 3.6, 8.4], [0, 1.4, -2]]],
  [16, 30, [[-4, 2.6, 6.5], [0, 2.4, -12]], [[-2, 3.2, 7.5], [0, 3.6, -18]]],
  [30, 60, [[0, 6, 12], [0, 2, -6]], [[0, 8, 15], [0, 3, -10]]],
]

/** The grey band on the sea where the Crown has already folded things. */
function Grey({ tRef }) {
  const m = useRef()
  useFrame(() => {
    if (m.current) m.current.material.opacity = 0.35 + 0.1 * Math.sin(tRef.current * 0.6)
  })
  return (
    <mesh ref={m} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -30]}>
      <ringGeometry args={[14, 40, 64, 1, Math.PI * 1.1, Math.PI * 0.8]} />
      <meshBasicMaterial color="#5a5a62" transparent opacity={0.4} />
    </mesh>
  )
}

export function makeWorldIntro(world) {
  const id = `world-${world}-intro`
  const caps = videos.videos.find((v) => v.id === id)?.captions || []
  const spans = (who) => caps.filter((c) => c.speaker === who).map((c) => [c.t, c.end])
  const E_TALK = spans('Emmy Boundary')
  const G_TALK = spans('Gyroid')
  const N_TALK = spans('Count Null')
  return function WorldIntroScene({ tRef }) {
    const sky = SKIES[world]
    const nullScript = useMemo(() => () => {
      const t = tRef.current
      return { gesture: within(t, N_TALK) ? 0.8 : 0.1, crown: 1, crownY: 0.4 }
    }, [tRef])
    const emmy = () => {
      const t = tRef.current
      const talk = within(t, E_TALK)
      return { pos: [-1.2, 0, 2.4], rotY: -2.6, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
    }
    const gyro = () => {
      const t = tRef.current
      const talk = within(t, G_TALK)
      return { pos: [1.2, 0, 2.2], rotY: 2.8, run: 0, cast: talk ? 0.4 : 0.05, whip: 0, loop: 0, loopDrop: 0 }
    }
    return (
      <>
        <YardSky {...sky} />
        <MovieDeck />
        <Grey tRef={tRef} />
        <group position={[0, 9, -34]} scale={3}>
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
}
