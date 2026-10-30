import LevelMovie from '../../screens/LevelMovie'
import { startFogMusic, startForgeMusic, startMusicBox, startNullMusic } from '../../audio/chip'
import PrologueMovie from './PrologueMovie'
import PROLOGUE from './prologue.json'

const CUES = [
  { t: 0, start: startForgeMusic },
  { t: 13.5, start: startMusicBox }, // Wren
  { t: 27, start: startFogMusic }, // the storm
  { t: 50, start: startNullMusic }, // the Crown
]

/** New Game opens here: why Count Null wants the world flat. Then the intro. */
export default function PrologueScreen({ onNext }) {
  return <LevelMovie video={PROLOGUE} Scene={PrologueMovie} kicker="Prologue" name={PROLOGUE.title} musicCues={CUES} onDone={onNext} onSkip={onNext} />
}
