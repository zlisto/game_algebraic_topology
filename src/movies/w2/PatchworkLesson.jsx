import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { CANDIDATES, Station } from '../../levels/w2/PatchworkScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 8, "Patchwork" (videos.json level-2-8-lesson), Hatcher §2.2 pp. 149–153:
 *   A 0–12   the Mayer–Vietoris sequence; two caps on the sphere
 *   B 12–24  H₂(S²) ≅ H₁(A∩B) ≅ ℤ
 *   C 24–36  the circle from two arcs: the overlap's two pieces make H₁(S¹) = ℤ
 *   D 36–48  the Klein bottle from two Möbius bands: H₁ = ℤ ⊕ ℤ₂, H₂ = 0
 *   E 48–58  the torus from two annuli: H₁ = ℤ²
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 10.4, 12.2], [2.2, -0.4, 1.6]], [[0.4, 10, 11.8], [2.2, -0.4, 1.6]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const picks = (t, times) => {
  const n = times.filter((a) => t >= a).length
  return n ? CANDIDATES[n - 1] : undefined
}
const P = {
  hemi: { on: [3, 5], picks: [15, 17], until: 24 },
  annuli: { on: [25, 26], picks: [29, 31], until: 36 },
  twist: { on: [37, 38], picks: [41, 42, 43, 44, 45], until: 48 },
  own: { on: [49, 50], picks: [52, 53, 54, 55], until: 999 },
}
const BEATS = Object.values(P).flatMap((p) => [...p.on, ...p.picks])
function set(t) {
  const id = Object.keys(P).find((k) => t < P[k].until)
  const p = P[id]
  return { id, bag: { patches: { [id]: { A: t >= p.on[0], B: t >= p.on[1] } }, pick: { [id]: picks(t, p.picks) } } }
}

export function PatchworkLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Mayer–Vietoris', ['interiors of $A$, $B$ cover $X$', '$Hₙ(A∩B) → Hₙ(A) ⊕ Hₙ(B) → Hₙ(X) → Hₙ₋₁(A∩B)$']],
        [12.4, 24, 'The sphere', ['caps: disks · overlap: a circle', '$H₂(S²) ≅ H₁(S¹) ≅ ℤ$']],
        [24.4, 36, 'The circle', ['overlap: two pieces', '$H₁(S¹)$ = Ker$(ℤ² → ℤ²) ≅ ℤ$']],
        [36.4, 48, 'The Klein bottle', ['two Möbius bands', '$H₁ = ℤ²/⟨(2, −2)⟩ ≅ ℤ ⊕ ℤ₂$']],
        [48.4, 58, 'The torus', ['two annuli', '$H₁(T) ≅ ℤ²$']],
        [58.4, 64, 'In the Fields', ['Clasp (5): put a patch on', 'Blade (7): try a group']],
      ]}
      summary={{ t: 64, title: 'Mayer–Vietoris', items: ['Two patches and their overlap', 'An exact sequence links them', 'Holes from overlaps falling apart'], cite: 'Hatcher §2.2, pp. 149–153' }}
    />
  )
}

export default function PatchworkLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-1.6, 0, 4.6], rotY: 0.4, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0e1210" water="#1e3424" deep="#081008" cloud="#c8d8b0" spark="#ffe6a8" seed={28} />
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
