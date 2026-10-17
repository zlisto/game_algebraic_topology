import { useCallback, useEffect, useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import IntroCutscene from './screens/IntroCutscene'
import Level1 from './screens/Level1'

const SCREENS = {
  title: TitleScreen,
  intro: IntroCutscene,
  level1: Level1,
}

export default function App() {
  const [screen, setScreen] = useState(
    () => new URLSearchParams(window.location.search).get('screen') || 'title', // dev: ?screen=intro
  )
  const [concept, setConcept] = useState(null)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/game_concept.json`
    fetch(url)
      .then((r) => r.json())
      .then(setConcept)
      .catch((err) => {
        console.error(err)
        setConcept({
          story: {
            title: 'Winding World',
            tagline: "Shape can change. Topology can't.",
          },
        })
      })
  }, [])

  const go = useCallback((next) => setScreen(next), [])

  const Screen = SCREENS[screen] || TitleScreen

  return (
    <div className="screen">
      <Screen
        concept={concept}
        onNewGame={() => go('intro')}
        onSkipIntro={() => go('level1')}
        onIntroDone={() => go('level1')}
        onBackToTitle={() => go('title')}
        onReplayIntro={() => go('intro')}
      />
    </div>
  )
}
