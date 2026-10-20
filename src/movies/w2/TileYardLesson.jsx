import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo } from 'react'
import * as THREE from 'three'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { YardSky } from '../../levels/w2/TileYardScene'
import { S, seg, smooth, mix3 } from '../../levels/w2/movieKit'
import MathText from '../../screens/MathText'
import { MovieDeck, MovieTiles } from './TileMovieKit'

/**
 * Lesson for World 2 · Level 1, "Ordered Triangles" (videos.json level-2-1-lesson), Hatcher §2.1 pp. 102–104:
 *   A 0–12   one triangle, corners 0 1 2; each arrow runs from the lower corner to the higher
 *   B 12–24  a second triangle; its copy of c points the wrong way, turns, and they glue into a square
 *   C 24–38  a to a, b to b: the torus (one vertex, three edges, two triangles)
 *   D 38–48  one blue arrow turned: the Klein bottle
 *   E 48–58  both pairs twisted: a triangle whose arrows run in a circle; turn a pair, fold ℝP²
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 12, [[-0.6, 8.6, 9.6], [2.2, -0.8, 2.0]], [[-0.2, 8.2, 9.0], [2.2, -0.8, 2.0]]],
  [12, 24, [[-1.4, 10.4, 11.2], [2.0, -0.8, 2.0]], [[-0.8, 10, 10.8], [2.0, -0.8, 2.0]]],
  [24, 38, [[0.6, 7.6, 12.4], [2.2, 0, 1.6]], [[-2.4, 7.4, 12.2], [1.8, 0, 1.6]]],
  [38, 48, [[-2.4, 7.4, 12.2], [1.8, 0, 1.6]], [[0.4, 7.6, 12.4], [2.2, 0, 1.6]]],
  [48, 58, [[-1.4, 10.4, 10.6], [2.0, -0.6, 2.0]], [[-1.0, 9.0, 11.6], [2.0, -0.2, 1.8]]],
  [58, 64, [[3, 6.6, 11], [1.6, 0.2, 1.4]], [[2, 6.8, 11.4], [1.6, 0.2, 1.4]]],
  [64, 80, [[0, 9, 13], [1.4, 0, 1]], [[0, 11, 16], [1.4, 0, 1]]],
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
  if (t < 12) return { arrows: SQUARE, sides: 'lower', hideUpper: true, split: 1, labels: 'lower' }
  if (t < 24) return { arrows: { ...SQUARE, diag: t < 17.8 ? -1 : 1, diagL: 1 }, sides: false, split: 1 - smooth(seg(t, 19, 21.5)) }
  if (t < 38) return { arrows: SQUARE, kind: t < 30.6 ? null : 'torus', k: smooth(seg(t, 30.8, 35.5)) }
  if (t < 48) return { arrows: { ...SQUARE, right: t < 38.8 ? 1 : -1 }, kind: t < 39.6 ? null : 'klein', k: smooth(seg(t, 39.8, 43.8)) }
  // both pairs twisted, in the arrangement where some triangle always runs in a circle …
  const bad = { bottom: 1, top: -1, left: -1, right: 1 }
  if (t < 52.4) return { arrows: { ...bad, diag: 1 }, bad: { upper: t > 49.6 } }
  if (t < 54.6) return { arrows: { ...bad, diag: -1 }, bad: { lower: true } }
  // … until a whole blue pair turns round
  const good = { bottom: 1, top: -1, left: 1, right: -1, diag: -1 }
  return { arrows: good, kind: t < 55.4 ? null : 'rp2', k: smooth(seg(t, 55.6, 58.6)) }
}

export function TileYardLessonOverlay({ t }) {
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
      {t >= 1 && t < 12 && card('A simplex', ['corners in order: $0 < 1 < 2$', 'each arrow: lower corner → higher'])}
      {t >= 12.4 && t < 24 && card('Glue in order', ['first corner onto first corner', 'arrows must agree'])}
      {t >= 31 && t < 38 && card('Torus', ['$a$ to $a$, $b$ to $b$, both the same way', '1 vertex · 3 edges · 2 triangles'])}
      {t >= 38.4 && t < 48 && card('Klein bottle', ['one pair twisted', '1 vertex · 3 edges · 2 triangles'])}
      {t >= 48.4 && t < 58 && card('ℝP²', ['both pairs twisted', 'no triangle may run in a circle', '2 vertices · 3 edges · 2 triangles'])}
      {t >= 58.4 && t < 64 && card('In the yard', ['Cell-Smith (2): turn an arrow', 'gold press: fold the square'])}
      {t >= 64 && (
        <div className="lesson-card lesson-steps">
          <h3 className="lesson-title">Δ-complexes</h3>
          <ul>
            <li>Corners in order</li>
            <li>Glue keeping the order</li>
            <li>Arrows decide: torus, Klein, ℝP²</li>
          </ul>
          <p className="lesson-note">Hatcher §2.1, pp. 102–104</p>
        </div>
      )}
    </div>
  )
}

export default function TileYardLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const talk = (t > 17.8 && t < 23.4) || (t > 43.4 && t < 47.6)
    return { pos: [3.6, 0, 3.2], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = [[0.8, 11.6], [12.4, 17.4], [24.4, 37.6], [38.4, 43], [48.4, 57.8], [58.4, 69.4]].some(([a, b]) => t > a && t < b)
    const point = (t > 17.4 && t < 18.2) || (t > 38.4 && t < 39.2) || (t > 54.2 && t < 55)
    return { pos: [-3.6, 0, 3.0], rotY: 0.8, walk: 0, bow: 0, gesture: point ? 1 : talk ? 0.5 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky />
      <MovieDeck />
      <MovieTiles tRef={tRef} script={tiles} />
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
