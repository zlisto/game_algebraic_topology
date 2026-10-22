import LevelMovie from '../../screens/LevelMovie'
import { startNullMusic, startObstructionMusic } from '../../audio/chip'
import CastleIntro4 from './CastleIntro4'
import { CASTLE4_INTRO } from './introScript'

/** World 4 castle intro: the march on the Crown (Spire theme), then Null's theme when he speaks. */
export default function MovieCastle4({ onNext }) {
  return (
    <LevelMovie
      video={CASTLE4_INTRO}
      Scene={CastleIntro4}
      kicker="World 4 · Castle · Final"
      name="The Null Crown"
      startMusic={startObstructionMusic}
      musicCues={MUSIC_CUES}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
const MUSIC_CUES = [{ t: 14.2, start: startNullMusic }]
