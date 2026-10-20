import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { BUOYS, Station, bendLoop, loopStart } from '../../levels/w2/SingularShallowsScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 3, "Any Simplex Will Do" (videos.json level-2-3-lesson), Hatcher §2.1 pp. 108–113:
 *   A 0–12   a singular simplex is any map: three bent paths and a constant one
 *   B 12–24  the boundary is end minus start, however it bends; a constant path has ∂ = 0
 *   C 24–36  a cycle of bent pieces round the pond; γ − ε closes up but bounds
 *   D 36–48  bending a loop leaves its class alone (Theorem 2.10)
 *   E 48–58  squeezing the ring onto its circle: homotopy equivalent, same homology (Corollary 2.11)
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const CUTS = [['s1', 13.4], ['s2', 14.2], ['s3', 15], ['s0', 19.4]]
const BENDS = [38.4, 41, 43.6]
const LOOPS = (() => {
  let l = loopStart()
  return [l, ...BUOYS.map(([th, r]) => (l = bendLoop(l, r * Math.cos(th), r * Math.sin(th))))]
})()
function set(t) {
  if (t < 12) return { id: 'any_tri', bag: {}, hide: t < 1 }
  if (t < 24) return { id: 'any_tri', bag: { spent: { any_tri: Object.fromEntries(CUTS.filter(([, a]) => t >= a).map(([k]) => [k, true])) } } }
  if (t < 36) {
    const coef = t < 30.4 ? Object.fromEntries(['α', 'β', 'γ', 'δ'].filter((_, i) => t >= 25 + i * 0.8).map((k) => [k, 1])) : { γ: 1, ε: -1 }
    return { id: 'pieces', bag: { coef: { pieces: coef } } }
  }
  if (t < 48) return { id: 'bend', bag: { loop: LOOPS[BENDS.filter((a) => t >= a).length] } }
  return { id: 'same', bag: { squeeze: t < 50 ? 0 : t < 51.6 ? 1 : t < 53.2 ? 2 : 3 } }
}

export function AnySimplexLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'A singular simplex', ['any continuous map $σ: Δⁿ → X$', 'bent, looped, or constant']],
        [12.4, 24, 'Its boundary', ['$∂σ = σ(1) − σ(0)$', 'constant path: $∂ = 0$']],
        [24.4, 36, 'Cycles from pieces', ['$α + β + γ + δ$: round the pond', '$γ − ε$: bounds the strip']],
        [36.4, 48, 'Homotopy invariance', ['$f ≃ g ⟹ f_* = g_*$', 'Theorem 2.10']],
        [48.4, 58, 'Homotopy equivalence', ['ring ≃ circle', '$H₁ ≅ ℤ$ for both — Corollary 2.11']],
        [58.4, 64, 'In the Shallows', ['Blade (7): cut a path, set a coefficient', 'Tide Glass (3): bend, squeeze']],
      ]}
      summary={{ t: 64, title: 'Singular homology', items: ['Any map is a simplex', 'Same ∂, same $Hₙ$', 'Homotopy doesn’t change it'], cite: 'Hatcher §2.1, pp. 108–113' }}
    />
  )
}

export default function AnySimplexLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = CUTS.map(([, a]) => a).find((a) => t > a - 0.3 && t < a + 0.3)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [3.9, 0, 3.4], rotY: -0.8, run: 0, cast: talk || within(t, [[38, 45], [49.6, 54]]) ? 0.6 : 0.1, whip: cut ? seg(t, cut - 0.3, cut + 0.3) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 11.6], [12.4, 19.4], [24.4, 35.6], [36.4, 47.6], [48.4, 52.4], [58.4, 69.4]])
    return { pos: [-3.9, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#081216" water="#0f3040" deep="#050c10" cloud="#a0c8d8" spark="#9fe6ff" seed={23} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag, hide }) => (hide ? null : <group key={id}>{Station({ id }, { bag, live: true })}</group>)}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={LESSON_SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
