import { useState } from 'react'
import LevelMovie from '../../screens/LevelMovie'
import { EmmyEndCard } from '../../screens/LevelChrome'
import { startDynamoMusic, startNullMusic } from '../../audio/chip'
import Castle2Intro from './Castle2Intro'
import Castle2Outro, { OUTRO_MUSIC, OUTRO_START } from './Castle2Outro'
import { DEFINITION_CASTLE } from './stagesCastle2'
import { INTRO_VIDEO, OUTRO_VIDEO } from './videos2'

const INTRO_MUSIC = [{ t: 13, start: startNullMusic }]

/** 'moviec2': the hyped arrival at the Retractor. */
export function MovieCastle2({ onNext }) {
  return <LevelMovie video={INTRO_VIDEO} Scene={Castle2Intro} kicker="World 2 · Castle" name={INTRO_VIDEO.title} startMusic={startDynamoMusic} musicCues={INTRO_MUSIC} onDone={onNext} onSkip={onNext} />
}

/** Emmy's World 2 end card (shown after the outro). */
export function Castle2EndCard({ onNext, onBackToTitle }) {
  return (
    <EmmyEndCard
      kicker="World 2 complete · Chain Delta restored"
      title="The Retractor"
      learned="We stopped counting paths and counted what they enclose. A chain is a sum of oriented simplices. ∂ drops one vertex at a time with alternating signs, so ∂∂ = 0, and $Hₙ$ counts the cycles that don’t bound. Cells gave us the groups fast: $S²$ has $H₂ = ℤ$, the Klein bottle has torsion, and mod 2 even ℝP² gets a top class. The Dial read degrees, χ kept count, and Mayer–Vietoris glued pieces together. That proved a ball can’t be squeezed onto its skin."
      ahead="But groups were all we had, and Null found twins: the torus and $S¹ ∨ S¹ ∨ S²$, with the same homology in every degree. In World 3 we read chains backwards. Cochains give every edge a value, and their classes multiply: the cup product. On the torus the two loop classes multiply to its top class. On the bouquet they don’t. That’s how we take the torus back."
      definition={DEFINITION_CASTLE}
      defLabel="World 2 in the book (after Hatcher)"
      stayLabel="Back to title"
      onStay={onBackToTitle}
      onNext={onNext || onBackToTitle}
      nextLabel={onNext ? 'Continue ▸ World 3' : 'Back to title'}
    />
  )
}

/** 'outroc2': the twins, the fold, the escape, then Emmy's end card and on to World 3. */
export function OutroCastle2({ onNext, onBackToTitle }) {
  const [done, setDone] = useState(false)
  if (done) return <div className="screen level"><Castle2EndCard onNext={onNext} onBackToTitle={onBackToTitle} /></div>
  return <LevelMovie video={OUTRO_VIDEO} Scene={Castle2Outro} kicker="World 2 complete" name="Chain Delta restored" startMusic={OUTRO_START} musicCues={OUTRO_MUSIC} onDone={() => setDone(true)} onSkip={() => setDone(true)} />
}
