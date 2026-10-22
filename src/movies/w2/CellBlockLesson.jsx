import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w2/CellBlockScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 7, "Cell Block" (videos.json level-2-7-lesson), Hatcher §2.2 pp. 137–149:
 *   A 0–12   CW complexes: cells attached skeleton by skeleton (the torus from four crates)
 *   B 12–24  cellular chains; d₂ read off the rim word: the torus, d₂ = 0
 *   C 24–36  ℝP²: d₂ = 2a, so H₁ = ℤ₂
 *   D 36–48  the Klein bottle: d₂ = 2b, H₁ = ℤ ⊕ ℤ₂
 *   E 48–58  Euler characteristic: cells and ranks agree
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.8, 12.6], [2.2, -0.2, 2.2]], [[0.4, 10.4, 12.2], [2.2, -0.2, 2.2]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const BUILD = [[2, 'e0'], [4, 'a'], [5.2, 'b'], [8, 'e2']]
const BEATS = [...BUILD.map(([a]) => a), 15, 16, 17, 18, 19, 20, 21, 22, 26.4, 31, 38, 39, 40, 41, 42.4, 45]
function set(t) {
  if (t < 12) return { id: 'crates', bag: { built: Object.fromEntries(BUILD.filter(([a]) => t >= a).map(([, k]) => [k, true])) } }
  if (t < 24) {
    const step = (a0) => (t < a0 ? 1 : t < a0 + 1 ? 2 : t < a0 + 2 ? -2 : t < a0 + 3 ? -1 : 0)
    return { id: 'torus', bag: { coef: { torus: { a: step(15), b: step(19) } }, solved: { torus: t >= 22 } } }
  }
  if (t < 36) return { id: 'doubled', bag: { coef: { doubled: { a: t < 26.4 ? 1 : 2 } }, solved: { doubled: t >= 31 } } }
  if (t < 58) {
    const a = t < 38 ? 1 : t < 39 ? 2 : t < 40 ? -2 : t < 41 ? -1 : 0
    return { id: 'census', bag: { coef: { census: { a, b: t < 42.4 ? 1 : 2 } }, solved: { census: t >= 45 } } }
  }
  return { id: 'census', bag: { coef: { census: { a: 0, b: 2 } }, solved: { census: true } } }
}

export function CellBlockLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'CW complexes', ['attach $n$-cells to the $(n−1)$-skeleton', 'torus: $e⁰$, $e¹ₐ$, $e¹ᵦ$, $e²$']],
        [12.4, 24, 'Reading d₂', ['walk the rim: $+1$ with, $−1$ against', 'torus: $aba⁻¹b⁻¹ ⟹ d₂ = 0$']],
        [24.4, 36, 'ℝP²', ['rim $aa ⟹ d₂ = 2a$', '$H₁ = ℤ₂$, $H₂ = 0$']],
        [36.4, 48, 'Klein bottle', ['rim $aba⁻¹b ⟹ d₂ = 2b$', '$H₁ = ℤ ⊕ ℤ₂$, $H₂ = 0$']],
        [48.4, 58, 'Euler characteristic', ['$χ = Σ(−1)ⁿ cₙ = Σ(−1)ⁿ$ rank $Hₙ$', 'Klein: $1 − 2 + 1 = 1 − 1 + 0$']],
        [58.4, 64, 'In the Block', ['Cell Hammer (2): attach', 'Degree Dial (8): set $d₂$']],
      ]}
      summary={{ t: 64, title: 'Cellular homology', items: ['One generator per cell', 'd₂ from the rim word', '$χ$: cells = ranks'], cite: 'Hatcher §2.2, pp. 137–149' }}
    />
  )
}

export default function CellBlockLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.4, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0c0e12" water="#1a2a34" deep="#060a0c" cloud="#b0c4d0" spark="#ffe6a8" seed={27} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
