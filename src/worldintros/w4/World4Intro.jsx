import { startCubeHallMusic, startHopfRingMusic, startNullMusic } from '../../audio/chip'
import LevelMovie from '../../screens/LevelMovie'
import VIDEO from './script.json'
import SpireIntroScene from './SpireIntroScene'

// the Spire's theme, then Null's when he rises, then the Cube Hall's as they set off
const CUES = [
  { t: 27.6, start: startNullMusic },
  { t: 41, start: startCubeHallMusic },
]

/** World 4's intro movie: the Postnikov Spire, after the World 3 castle's outro. */
export default function World4Intro({ onNext }) {
  return (
    <LevelMovie
      video={VIDEO}
      Scene={SpireIntroScene}
      kicker="World 4"
      name="The Postnikov Spire"
      startMusic={startHopfRingMusic}
      musicCues={CUES}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
