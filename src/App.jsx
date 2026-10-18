import { useCallback, useEffect, useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import IntroCutscene from './screens/IntroCutscene'
import Level01 from './screens/Level01'
import Level02 from './screens/Level02'
import Level03 from './screens/Level03'
import MirrorMovie from './movies/MirrorMovie'
import MirrorLesson, { MirrorLessonOverlay } from './movies/MirrorLesson'
import LevelMovie from './screens/LevelMovie'
import TidewarpMovie from './movies/TidewarpMovie'
import TidewarpLesson, { LessonOverlay } from './movies/TidewarpLesson'
import { startMirrorMusic, startNullMusic, startTideMusic } from './audio/chip'

/** World 0 · Level 2's intro movie, then the level. */
function Movie02({ concept, onNext }) {
  const lv = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-2')
  return (
    <LevelMovie
      videoId="level-0-2-intro"
      Scene={TidewarpMovie}
      kicker="World 0 · Level 2"
      name={lv?.title || 'Bend, Don’t Break'}
      startMusic={startTideMusic}
      musicCues={[
        { t: 14.2, start: startNullMusic }, // Count Null appears over his pool
        { t: 21, start: startTideMusic },
      ]}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

/** 0-2's lesson: the idea of a homotopy and the two new tools, slowed down. */
export function Lesson02({ onNext, embedded }) {
  return (
    <LevelMovie
      videoId="level-0-2-lesson"
      Scene={TidewarpLesson}
      Overlay={LessonOverlay}
      kicker="World 0 · Level 2 · Lesson"
      name="How the Tide Works"
      startMusic={startTideMusic}
      onDone={onNext}
      onSkip={onNext}
      embedded={embedded}
    />
  )
}

/** World 0 · Level 3's intro movie and lesson. */
function Movie03({ concept, onNext }) {
  const lv = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-3')
  return <LevelMovie videoId="level-0-3-intro" Scene={MirrorMovie} kicker="World 0 · Level 3" name={lv?.title || 'Same Shape, Different Look'} startMusic={startMirrorMusic} onDone={onNext} onSkip={onNext} />
}
function Lesson03({ onNext }) {
  return (
    <LevelMovie
      videoId="level-0-3-lesson"
      Scene={MirrorLesson}
      Overlay={MirrorLessonOverlay}
      kicker="World 0 · Level 3 · Lesson"
      name="Same Shape"
      startMusic={startMirrorMusic}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

const SCREENS = {
  title: TitleScreen,
  intro: IntroCutscene,
  level1: Level01,
  movie02: Movie02,
  lesson02: Lesson02,
  level2: Level02,
  movie03: Movie03,
  lesson03: Lesson03,
  level3: Level03,
}
const NEXT = { level1: 'movie02', movie02: 'lesson02', lesson02: 'level2', level2: 'movie03', movie03: 'lesson03', lesson03: 'level3' }

export default function App() {
  const [screen, setScreen] = useState(
    () => new URLSearchParams(window.location.search).get('screen') || 'title', // dev: ?screen=intro
  )
  const [concept, setConcept] = useState(null)
  const [opts, setOpts] = useState(() => {
    const q = new URLSearchParams(window.location.search)
    return q.get('shrine') ? { startAt: q.get('shrine') } : {} // dev: ?screen=level2&shrine=nulls_snap
  })

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

  const go = useCallback((next, o = {}) => {
    setOpts(o)
    setScreen(next)
  }, [])

  const Screen = SCREENS[screen] || TitleScreen

  return (
    <div className="screen">
      <Screen
        key={`${screen}:${opts.startAt || ''}`}
        {...opts}
        onGo={go}
        concept={concept}
        onNewGame={() => go('intro')}
        onSkipIntro={() => go('level1')}
        onIntroDone={() => go('level1')}
        onBackToTitle={() => go('title')}
        onReplayIntro={() => go('intro')}
        onNext={() => go(NEXT[screen] || 'title')}
      />
    </div>
  )
}
