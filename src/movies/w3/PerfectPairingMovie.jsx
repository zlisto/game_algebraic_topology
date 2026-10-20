import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/PerfectPairingScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Intro movie for World 3 · Level 9, "Perfect Pairing" (videos.json level-3-9-intro):
 *   A 0–8    the pier: the torus' lanterns, α and β, paired across the water
 *   B 8–18   ℂP²'s middle lantern squares to the top; S² ∨ S⁴'s stays dark
 *   C 18–22  the Counterfeit Station's lights far off
 *   D 22–26  title card
 */

const SHOTS = [
  [0, 18, [[6, 8.6, 12], [0, -0.2, 0.6]], [[-1, 9.2, 11.4], [0, -0.2, 0.4]]],
  [18, 22, [[0, 6, 9], [0, 2, -10]], [[0, 6.4, 9.4], [0, 2, -10]]],
  [22, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
function set(t) {
  if (t < 8) return { id: 'partners', bag: { found: { partners: { ...(t >= 2.4 ? { α: 1 } : {}), ...(t >= 4.2 ? { β: -1 } : {}) } }, last: { partners: t >= 4.2 ? -1 : t >= 2.4 ? 1 : undefined } } }
  if (t < 13) return { id: 'cp2_square', bag: { found: { cp2_square: t >= 9.6 ? { α: 1 } : {} }, last: { cp2_square: t >= 9.6 ? 1 : undefined } } }
  return { id: 'wedge_dark', bag: { found: { wedge_dark: t >= 14 ? { α: 0 } : {} }, last: { wedge_dark: t >= 14 ? 0 : undefined } } }
}

export default function PerfectPairingMovie({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [2.4, 4.2, 9.6, 14].find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[8.4, 12.6], [18.4, 21.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.6, 4.6]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0c14" water="#18284a" deep="#06080e" cloud="#c0c8f0" spark="#ffd27a" seed={39} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      {/* the Counterfeit Station, far off */}
      <group position={[0, 0, -18]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[4, 6, 3]} />
          <meshStandardMaterial color="#1a1a2a" emissive="#ff8ad8" emissiveIntensity={0.15} />
        </mesh>
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[i * 1.2, 4.2, 1.6]}>
            <sphereGeometry args={[0.25, 12, 10]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
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
