import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station, WORDS, parse } from '../../levels/w2/AbelianFordScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { LessonBeats, MovieFx, ShotCamera, within } from './shots'

/**
 * Lesson for World 2 · Level 10, "Forget the Order" (videos.json level-2-10-lesson), Hatcher §2.A pp. 166–168:
 *   A 0–12   loops as words; π₁ only cancels neighbours that are inverses
 *   B 12–24  in H₁, neighbours may swap: a b a⁻¹ a b becomes a b²
 *   C 24–36  the commutator a b a⁻¹ b⁻¹ dissolves
 *   D 36–48  b a a b⁻¹ keeps a²: totals survive
 *   E 48–58  Theorem 2A.1: H₁ ≅ π₁ / [π₁, π₁]
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SHOTS = [
  [0, 58, [[-0.4, 9.6, 11.6], [2.2, -0.6, 1.6]], [[0.4, 9.2, 11.2], [2.2, -0.6, 1.6]]],
  [58, 64, [[3, 8, 12], [1.6, -0.4, 2]], [[2, 8.2, 12.4], [1.6, -0.4, 2]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
const swap = (w, i) => {
  const t = [...w]
  ;[t[i], t[i + 1]] = [t[i + 1], t[i]]
  return t
}
const drop = (w, i) => w.filter((_, k) => k !== i && k !== i + 1)
function steps(start, ops, t0, dt) {
  const out = [[0, start]]
  let w = start
  ops.forEach(([op, i], k) => {
    w = op === 's' ? swap(w, i) : drop(w, i)
    out.push([t0 + k * dt, w])
  })
  return out
}
const at = (list, t) => list.filter(([a]) => t >= a).pop()[1]
const T = steps(parse(WORDS.totals), [['s', 1], ['c', 0], ['s', 0]], 14.4, 2)
const D = steps(parse(WORDS.dissolve), [['s', 1], ['c', 0], ['c', 0]], 27, 2)
const V = steps(parse(WORDS.survive), [['s', 2], ['s', 1], ['c', 0]], 39, 2)
const H = steps(parse(WORDS.hold), [['s', 2], ['c', 1], ['c', 1], ['c', 0]], 50, 1.6)
const BEATS = [T, D, V, H].flatMap((l) => l.slice(1).map(([a]) => a))
function set(t) {
  if (t < 12) return { id: 'totals', bag: {} }
  if (t < 24) return { id: 'totals', bag: { tiles: { totals: at(T, t) } } }
  if (t < 36) return { id: 'dissolve', bag: { tiles: { dissolve: at(D, t) } } }
  if (t < 48) return { id: 'survive', bag: { tiles: { survive: at(V, t) } } }
  return { id: 'hold', bag: { tiles: { hold: at(H, t) } } }
}

export function ForgetOrderLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Loops as words', ['figure-eight: letters $a$, $b$, $a⁻¹$, $b⁻¹$', '$π₁$: cancel only inverse neighbours']],
        [12.4, 24, 'Forget the order', ['$H₁$: neighbours may swap', '$a b a⁻¹ a b → a b²$']],
        [24.4, 36, 'Commutators die', ['$aba⁻¹b⁻¹ → 0$ in $H₁$', 'though $≠ 1$ in $π₁$']],
        [36.4, 48, 'Totals survive', ['$b a a b⁻¹ → a²$', 'totals never change']],
        [48.4, 58, 'Theorem 2A.1', ['$h: π₁(X) → H₁(X)$ is onto', 'kernel $[π₁, π₁]$, so $H₁ ≅$ π₁ abelianized']],
        [58.4, 64, 'At the Ford', ['Clasp (5): swap neighbours', 'Blade (7): cancel inverses']],
      ]}
      summary={{ t: 64, title: 'H₁ and π₁', items: ['Loops are 1-cycles', 'Order forgotten, totals kept', '$H₁ ≅ π₁$ abelianized'], cite: 'Hatcher §2.A, pp. 166–168' }}
    />
  )
}

export default function ForgetOrderLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.2, 0, 3.2], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a1014" water="#123a4a" deep="#060c10" cloud="#a8d0e0" spark="#9fe6ff" seed={30} />
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
