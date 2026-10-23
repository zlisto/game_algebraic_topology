import { startGardensMusic, startNullMusic } from '../../audio/chip'
import LevelMovie from '../../screens/LevelMovie'
import GardensIntroScene, { GardensIntroOverlay } from './GardensIntroScene'
import { VIDEO } from './script'

// the Gardens' theme, Null's when he rises over the twins, the Gardens' again as they set off
const CUES = [
  { t: 39.2, start: startNullMusic },
  { t: 59.4, start: startGardensMusic },
]

/** World 3's intro movie: the Cup Product Gardens, after the World 2 castle's outro. */
export default function World3Intro({ onNext }) {
  return (
    <LevelMovie
      video={VIDEO}
      Scene={GardensIntroScene}
      Overlay={GardensIntroOverlay}
      kicker="World 3"
      name="The Cup Product Gardens"
      startMusic={startGardensMusic}
      musicCues={CUES}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
