/** The World 2 intro screen: LevelMovie with the Chain Delta scene and script. */
import LevelMovie from '../../screens/LevelMovie'
import { startDeltaMusic, startNullMusic } from '../../audio/chip'
import ChainDeltaIntro from './ChainDeltaIntro'
import { WORLD2_INTRO } from './script'

const MUSIC = [
  { t: 30.8, start: startNullMusic },
  { t: 46.2, start: startDeltaMusic },
]

export default function World2Intro({ onNext }) {
  return (
    <LevelMovie
      video={WORLD2_INTRO}
      Scene={ChainDeltaIntro}
      kicker="World 2"
      name="Chain Delta"
      startMusic={startDeltaMusic}
      musicCues={MUSIC}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}



