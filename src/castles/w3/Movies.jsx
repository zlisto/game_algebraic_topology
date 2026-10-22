/** The World 3 castle's two movie screens (scripts in scripts.json, passed to LevelMovie as `video`). */
import LevelMovie from '../../screens/LevelMovie'
import { startNullMusic, startReachMusic } from '../../audio/chip'
import IntroMovie from './IntroMovie'
import OutroMovie from './OutroMovie'
import scripts from './scripts.json'

const INTRO = scripts.videos.find((v) => v.id === 'castle-3-intro-v2')
const OUTRO = scripts.videos.find((v) => v.id === 'castle-3-outro-v2')

export function MovieCastle3({ onNext }) {
  return <LevelMovie video={INTRO} Scene={IntroMovie} kicker="World 3 · Castle" name="The Counterfeit Station" startMusic={startNullMusic} onDone={onNext} onSkip={onNext} />
}
export function OutroCastle3({ onNext }) {
  return <LevelMovie video={OUTRO} Scene={OutroMovie} kicker="World 3 · Castle" name={OUTRO.title} startMusic={startReachMusic} onDone={onNext} onSkip={onNext} />
}

