import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/ReverseEngineeringScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 1, "Reverse Engineering" (videos.json level-3-1-lesson), Hatcher §3.1 pp. 190–197:
 *   A 0–12   cochains read chains; δφ(σ) = φ(∂σ)
 *   B 12–24  change an edge until the triangle reads 0: a cocycle; δδ = 0
 *   C 24–36  the fan: spokes set so every triangle balances
 *   D 36–46  readings from points: δf[v w] = f(w) − f(v), a coboundary
 *   E 46–58  around the missing tile: a cocycle that isn't a coboundary — H¹
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const SPOKES = [['1-4', -1, 26], ['2-4', -1, 28], ['3-4', -2, 30]]
const F = [[1, 1, 37.5], [2, 2, 39], [3, 1, 40.5]]
const HOLE = [['0-2', 1, 48], ['2-3', 1, 49], ['0-1', 1, 50]]
const BEATS = [14, 15, ...SPOKES.map(([, , a]) => a), ...F.map(([, , a]) => a), ...HOLE.map(([, , a]) => a)]
function set(t) {
  if (t < 24) return { id: 'read_edge', bag: { phi: { read_edge: { '1-2': t < 14 ? 2 : t < 15 ? -2 : -1 } } } }
  if (t < 36) return { id: 'balanced', bag: { phi: { balanced: Object.fromEntries(SPOKES.filter(([, , a]) => t >= a).map(([k, v]) => [k, v])) } } }
  if (t < 46) return { id: 'from_points', bag: { f: Object.fromEntries(F.filter(([, , a]) => t >= a).map(([k, v]) => [k, v])) } }
  return { id: 'around_hole', bag: { phi: { around_hole: Object.fromEntries(HOLE.filter(([, , a]) => t >= a).map(([k, v]) => [k, v])) } } }
}

export function ReverseEngineeringLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'Cochains', ['$Cⁿ(X; G) = $ Hom$(Cₙ(X), G)$', '$δφ(σ) = φ(∂σ)$']],
        [12.4, 24, 'Cocycles', ['$δφ = 0$: balanced on every simplex', '$δδ = φ∂∂ = 0$']],
        [24.4, 36, 'Balancing the fan', ['each triangle pins the next spoke', 'shift all spokes: still balanced']],
        [36.4, 46, 'Coboundaries', ['$δf[v w] = f(w) − f(v)$', 'readings that come from points']],
        [46.4, 58, 'Cohomology', ['$Hⁿ$ = Ker δ / Im δ', 'a cocycle reading the hole']],
        [58.4, 64, 'In the Pools', ['Reading Wand (0)', 'click an edge or a point']],
      ]}
      summary={{ t: 64, title: 'Cochains', items: ['Readings of chains', 'δ is dual to ∂', 'Hⁿ = cocycles / coboundaries'], cite: 'Hatcher §3.1, pp. 190–197' }}
    />
  )
}

export default function ReverseEngineeringLesson({ tRef }) {
  const gyro = () => {
    const t = tRef.current
    const cut = BEATS.find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[19.8, 23.4], [52.8, 57.6]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[0.8, 19.4], [24.4, 35.6], [36.4, 52.4], [58.4, 69.4]])
    return { pos: [-4.0, 0, 3.4], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a0e16" water="#2a3a5a" deep="#06080e" cloud="#c8d4f0" spark="#e0e8ff" seed={31} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag, live: true })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={LESSON_SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
