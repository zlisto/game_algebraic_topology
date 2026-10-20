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
import MathText from '../../screens/MathText'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'

/**
 * Lesson for World 2 · Level 2, "The Boundary Blade" (videos.json level-2-2-lesson), Hatcher §2.1 pp. 104–106:
 *   A 0–12   chains: sums of simplices with integer coefficients
 *   B 12–24  ∂ of a triangle, signs alternating
 *   C 24–36  a sum of triangles: shared inside edges cancel, given the right signs
 *   D 36–46  ∂ of the rim: every vertex cancels — ∂∂ = 0
 *   E 46–58  cycles and boundaries; the loop round the missing tile is a hole
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 46, [[-0.4, 10.4, 10.6], [2.2, -0.8, 2.0]], [[0.4, 10, 10.2], [2.2, -0.8, 2.0]]],
  [46, 58, [[0.4, 10, 10.2], [2.2, -0.8, 2.0]], [[-0.6, 10.2, 10.6], [2.2, -0.8, 2.0]]],
  [58, 64, [[3, 8, 11], [1.6, -0.4, 1.6]], [[2, 8.2, 11.4], [1.6, -0.4, 1.6]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
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

const FAN = [['0-1-4', 25.4], ['1-2-4', 26.0], ['2-3-4', 26.6], ['0-3-4', 30.4]]
const RIM_CUTS = [['0-1', 38.6], ['1-2', 39.4], ['2-3', 40.2], ['0-3', 41.0]]
function set(t) {
  if (t < 12) return { id: 'missing', bag: { edge: { missing: t < 3 ? {} : { '0-1': 2, '1-2': -1 } } }, filledOff: true }
  if (t < 24) return { id: 'first_cut', bag: { tri: { first_cut: t < 15 ? {} : { '0-1-2': 1 } } } }
  if (t < 36) {
    // first all four with +1 (the spokes don't cancel at [v3v4] and [v0v4]); then [v0v3v4] turns to −1
    const tri = Object.fromEntries(FAN.slice(0, 3).filter(([, at]) => t >= at).map(([k]) => [k, 1]))
    if (t >= 27.2) tri['0-3-4'] = t < 30.4 ? 1 : -1
    return { id: 'shared', bag: { tri: { shared: tri } } }
  }
  if (t < 46) return { id: 'nothing', bag: { spent: { nothing: Object.fromEntries(RIM_CUTS.filter(([, at]) => t >= at).map(([k]) => [k, true])) } } }
  const loop = t < 52 ? { '0-1': 1, '1-2': 1, '0-2': -1 } : { '0-2': 1, '2-3': 1, '0-3': -1 }
  return { id: 'missing', bag: { edge: { missing: t < 47 ? {} : loop } } }
}

export function BoundaryBladeLessonOverlay({ t }) {
  const card = (title, lines) => (
    <div className="lesson-card">
      <h3 className="lesson-title">{title}</h3>
      {lines.map((l) => (
        <p key={l}>
          <MathText text={l} />
        </p>
      ))}
    </div>
  )
  return (
    <div className="lesson-overlay">
      {t >= 1 && t < 12 && card('Chains', ['a sum of simplices with whole-number coefficients', '$2[v₀v₁] − [v₁v₂]$'])}
      {t >= 12.4 && t < 24 && card('Boundary', ['drop each vertex in turn, signs alternating', '$∂[v₀v₁v₂] = [v₁v₂] − [v₀v₂] + [v₀v₁]$'])}
      {t >= 24.4 && t < 36 && card('Shared edges cancel', ['$∂([v₀v₁v₄] + [v₁v₂v₄] + [v₂v₃v₄] − [v₀v₃v₄])$', '= the rim'])}
      {t >= 36.4 && t < 46 && card('∂∂ = 0', ['$∂[ab] = b − a$', 'every vertex: once in, once out'])}
      {t >= 46.4 && t < 58 && card('Cycles and boundaries', ['cycle: $∂ = 0$ · boundary: $∂$ of a chain', 'here $H₁$ = Ker ∂ / Im ∂ $≅ ℤ$'])}
      {t >= 58.4 && t < 64 && card('In the marsh', ['Boundary Blade (7)', 'click a triangle or an edge: $+1$, $−1$, $0$'])}
      {t >= 64 && (
        <div className="lesson-card lesson-steps">
          <h3 className="lesson-title">Simplicial homology</h3>
          <ul>
            <li>Chains: sums of simplices</li>
            <li>∂ with alternating signs; ∂∂ = 0</li>
            <li>Holes: cycles that aren’t boundaries</li>
          </ul>
          <p className="lesson-note">Hatcher §2.1, pp. 104–106</p>
        </div>
      )}
    </div>
  )
}

export default function BoundaryBladeLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = [15, ...FAN.map(([, a]) => a), 27.2, ...RIM_CUTS.map(([, a]) => a)].find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = t > 17.8 && t < 23.4
    return { pos: [3.8, 0, 3.2], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = [[0.8, 11.6], [12.4, 17.4], [24.4, 35.6], [36.4, 45.8], [46.4, 57.6], [58.4, 69.4]].some(([a, b]) => t > a && t < b)
    return { pos: [-3.8, 0, 3.2], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0b120e" water="#1a2c22" deep="#070e0a" cloud="#a8c0a0" spark="#c8ff88" seed={22} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag, filledOff }) => (
          <group key={id + (filledOff ? 'x' : '')}>
            <ChainDeck complex={filledOff ? { ...COMPLEXES[id], T: [] } : COMPLEXES[id]} live {...deckChains(id, bag)} {...(filledOff ? { vertCoef: {} } : {})} />
            {id === 'missing' && !filledOff && (
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
