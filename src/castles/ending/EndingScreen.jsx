import { startBastionMusic, startMusicBox, startNullMusic, startReefMusic } from '../../audio/chip'
import LevelMovie from '../../screens/LevelMovie'
import EndingMovie from './EndingMovie'
import VIDEO from './ending.video.json'
import { PLACES, SPIRE_LIGHT } from './WorldSet'

/**
 * Screen 'ending': the movie after the final boss. Music: Null's theme while the Crown stands,
 * the music box for his confession, the Bastion march as the world comes home, and the
 * Retract Reef theme (the game's home theme) for the delivery at dawn.
 */
const MUSIC = [
  { t: 6.2, start: startMusicBox },
  { t: 25.0, start: startBastionMusic },
  { t: 51.0, start: startReefMusic },
]

// a small card naming each place as it comes home, and what proved it
const LABELS = [
  ...PLACES.map((p) => ({ t: p.t0 + 0.6, end: p.id === 'haven' ? p.t0 + 4.6 : p.t0 + 3.2, name: p.name, math: p.math })),
  { t: SPIRE_LIGHT[0] + 0.2, end: SPIRE_LIGHT[1] + 0.8, name: 'The Postnikov Spire', math: 'πₙ, Hurewicz, the Hopf fibration: its k-invariants back in place' },
]

function PlaceLabel({ t }) {
  const l = LABELS.find((x) => t >= x.t && t < x.end)
  if (!l) return null
  const a = Math.min(1, (t - l.t) / 0.5, (l.end - t) / 0.5)
  return (
    <div
      key={l.name}
      style={{
        position: 'absolute',
        left: '4%',
        top: '15%',
        maxWidth: 'min(460px, 80vw)',
        opacity: a,
        transform: `translateY(${(1 - a) * 8}px)`,
        pointerEvents: 'none',
        borderLeft: '3px solid #ffd27a',
        padding: '6px 14px',
        background: 'linear-gradient(90deg, rgba(6,9,18,0.72), rgba(6,9,18,0))',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ffd27a' }}>Restored</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.6vw, 30px)', color: '#fff4dc', lineHeight: 1.15 }}>{l.name}</div>
      <div style={{ fontSize: 'clamp(12px, 1.3vw, 15px)', color: '#d8e4ee', marginTop: 4 }}>{l.math}</div>
    </div>
  )
}

export default function EndingScreen({ onNext }) {
  return (
    <LevelMovie
      video={VIDEO}
      Scene={EndingMovie}
      Overlay={PlaceLabel}
      kicker="Shape can change. Topology can’t."
      name="Winding World"
      startMusic={startNullMusic}
      musicCues={MUSIC}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
