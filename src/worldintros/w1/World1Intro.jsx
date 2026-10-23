import { startBastionMusic, startNullMusic } from '../../audio/chip'
import LevelMovie from '../../screens/LevelMovie'
import BastionIntroScene from './BastionIntroScene'
import video from './video.json'

/** Null takes the score when he comes down; the Bastion's theme returns once he folds away. */
const CUES = [
  { t: 25.6, start: startNullMusic },
  { t: 41.4, start: startBastionMusic },
]

/** World 1's intro movie (screen 'world1'): Haven's loss → Bouquet Bastion → level 1-1. */
export default function World1Intro({ onNext }) {
  return (
    <LevelMovie
      video={video}
      Scene={BastionIntroScene}
      kicker="World 1"
      name="Bouquet Bastion"
      startMusic={startBastionMusic}
      musicCues={CUES}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
