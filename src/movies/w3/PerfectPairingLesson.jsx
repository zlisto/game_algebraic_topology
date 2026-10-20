import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station } from '../../levels/w3/PerfectPairingScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg } from '../../levels/w2/movieKit'
import { MovieDeck } from '../w2/TileMovieKit'
import Timed from '../w2/Timed'
import { LESSON_SHOTS, LessonBeats, MovieFx, ShotCamera, within } from '../w2/shots'

/**
 * Lesson for World 3 · Level 9, "Perfect Pairing" (videos.json level-3-9-lesson), Hatcher §3.3 pp. 249–252:
 *   A 0–12   the cup product pairing (a ⌣ b)[M]
 *   B 12–24  the torus: α pairs with β
 *   C 24–36  S² × S²: γ × 1 pairs with 1 × γ
 *   D 36–46  ℂP²: α pairs with itself — α² generates H⁴
 *   E 46–58  S² ∨ S⁴: α ⌣ α = 0 — not a closed manifold, not ℂP²
 *   F 58–64  how to play
 *   G 64–72  summary; title card 69.5
 */

const BEATS = [14, 16, 26, 28, 39, 49]
function set(t) {
  if (t < 24) return { id: 'partners', bag: { found: { partners: { ...(t >= 14 ? { α: 1 } : {}), ...(t >= 16 ? { β: -1 } : {}) } }, last: { partners: t >= 16 ? -1 : t >= 14 ? 1 : undefined } } }
  if (t < 36) return { id: 'middle_lantern', bag: { found: { middle_lantern: { ...(t >= 26 ? { 'γ×1': 1 } : {}), ...(t >= 28 ? { '1×γ': 1 } : {}) } }, last: { middle_lantern: t >= 26 ? 1 : undefined } } }
  if (t < 46) return { id: 'cp2_square', bag: { found: { cp2_square: t >= 39 ? { α: 1 } : {} }, last: { cp2_square: t >= 39 ? 1 : undefined } } }
  return { id: 'wedge_dark', bag: { found: { wedge_dark: t >= 49 ? { α: 0 } : {} }, last: { wedge_dark: t >= 49 ? 0 : undefined } } }
}

export function PerfectPairingLessonOverlay({ t }) {
  return (
    <LessonBeats
      t={t}
      beats={[
        [1, 12, 'The cup pairing', ['$Hᵏ × Hⁿ⁻ᵏ → ℤ$', '$(a, b) ↦ (a ⌣ b)[M]$']],
        [12.4, 24, 'The torus', ['$α ⌣ α = 0$', '$α ⌣ β = ±1$: partners']],
        [24.4, 36, 'S² × S²', ['$γ×1$ partners $1×γ$', 'neither squares to the top']],
        [36.4, 46, 'ℂP²', ['only one middle class: $α$', '$α²$ generates $H⁴$']],
        [46.4, 58, 'S² ∨ S⁴', ['same groups as ℂP²', '$α² = 0$: no partner']],
        [58.4, 64, 'On the Pier', ['Cup Caster (9)', 'class on the left, partner on the right']],
      ]}
      summary={{ t: 64, title: 'Perfect pairing', items: ['Every class has a partner', 'Nonsingular mod torsion', 'ℂP² ≠ S² ∨ S⁴'], cite: 'Hatcher §3.3, pp. 249–252 (Proposition 3.38)' }}
    />
  )
}

export default function PerfectPairingLesson({ tRef }) {
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
      <YardSky bg="#0a0c14" water="#18284a" deep="#06080e" cloud="#c0c8f0" spark="#ffd27a" seed={39} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={LESSON_SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
