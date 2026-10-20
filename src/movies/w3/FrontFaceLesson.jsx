import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/FrontFaceScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 3, "Front Face, Back Face" (videos.json level-3-3-lesson), Hatcher §3.2 pp. 206–212:
 *   A 0–12   the cup product: front face times back face
 *   B 12–24  casting on one triangle: 2 · 3 = 6
 *   C 24–36  the torus: α ⌣ β reads 1 on the fundamental class
 *   D 36–46  swapped: β ⌣ α = −α ⌣ β; α ⌣ α = 0
 *   E 46–58  cocycles cup to cocycles: ⌣ on cohomology
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.4, 12.2], [2.2, -0.2, 1.4]], [[0.4, 10, 11.8], [2.2, -0.2, 1.4]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const BEATS = [14, 16, 27, 29, 38, 40, 49, 51]
function set(t) {
  if (t < 24) return { id: 'front_back', bag: { picks: { front_back: [...(t >= 14 ? ['0-1'] : []), ...(t >= 16 ? ['1-2'] : [])] } } }
  if (t < 36) return { id: 'cocycle_products', bag: { cast: { cocycle_products: { ...(t >= 27 ? { L: true } : {}), ...(t >= 29 ? { U: true } : {}) } } } }
  if (t < 46) return { id: 'swap', bag: { cast: { swap: { ...(t >= 38 ? { L: true } : {}), ...(t >= 40 ? { U: true } : {}) } } } }
  return { id: 'light_row', bag: { pair: { f: 'α', g: t < 49 ? 'α' : 'β' }, cast: { light_row: t >= 51 || (t >= 47 && t < 49) ? { L: true, U: true } : {} } } }
}

export function FrontFaceLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'The cup product', ['$(φ ⌣ ψ)(σ) = φ(σ|[v₀…vₖ]) · ψ(σ|[vₖ…vₖ₊ₗ])$', 'front face · back face']],
        [12.4, 24, 'One triangle', ['$(φ ⌣ ψ)[v₀v₁v₂] = φ[v₀v₁] · ψ[v₁v₂]$', '$= 2 · 3 = 6$']],
        [24.4, 36, 'The torus', ['$α ⌣ β$: $1$ and $0$', 'total on $T$: $+1$']],
        [36.4, 46, 'Order matters', ['$β ⌣ α = −α ⌣ β$', '$α ⌣ α = 0$']],
        [46.4, 58, 'On cohomology', ['$δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ$', 'cocycle ⌣ cocycle = cocycle']],
        [58.4, 64, 'In the Rows', ['Cup Caster (9)', 'edges, triangles, levers']],
      ]}
      summary={{ t: 64, title: 'Cup products', items: ['Front face × back face', 'Defined on cohomology', '$α ⌣ β$ generates $H²(T)$'], cite: 'Hatcher §3.2, pp. 206–212' }}
    />
  )
}

export default function FrontFaceLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.0, 0, 3.0], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e0a14" water="#2a1e40" deep="#08060c" cloud="#d8c0f0" spark="#ffd27a" seed={33} />
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
