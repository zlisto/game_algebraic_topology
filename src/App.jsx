import { useCallback, useEffect, useState } from 'react'
import TitleScreen from './screens/TitleScreen'
import IntroCutscene from './screens/IntroCutscene'
import Level01 from './screens/Level01'
import Level02 from './screens/Level02'
import Level03 from './screens/Level03'
import Level04 from './screens/Level04'
import Level05 from './screens/Level05'
import Level06 from './screens/Level06'
import Level0B from './screens/Level0B'
import LevelCastle from './screens/LevelCastle'
import CastleIntro from './movies/CastleIntro'
import CastleOutro from './movies/CastleOutro'
import CylinderMovie from './movies/CylinderMovie'
import HepLesson, { HepLessonOverlay } from './movies/HepLesson'
import TimberMovie from './movies/TimberMovie'
import TimberLesson, { TimberLessonOverlay } from './movies/TimberLesson'
import ConeMovie from './movies/ConeMovie'
import ConeLesson, { ConeLessonOverlay } from './movies/ConeLesson'
import FoundryMovie from './movies/FoundryMovie'
import CellsLesson, { CellsLessonOverlay } from './movies/CellsLesson'
import MirrorMovie from './movies/MirrorMovie'
import MirrorLesson, { MirrorLessonOverlay } from './movies/MirrorLesson'
import LevelMovie from './screens/LevelMovie'
import TidewarpMovie from './movies/TidewarpMovie'
import TidewarpLesson, { LessonOverlay } from './movies/TidewarpLesson'
import { startReefMusic, startMusicBox, startTimberMusic, startConeMusic, startForgeMusic, startMirrorMusic, startNullMusic, startTideMusic } from './audio/chip'

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

/** World 0 · Level 4's intro movie and lesson. */
function Movie04({ concept, onNext }) {
  const lv = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-4')
  return <LevelMovie videoId="level-0-4-intro" Scene={FoundryMovie} kicker="World 0 · Level 4" name={lv?.title || 'Some Assembly Required'} startMusic={startForgeMusic} onDone={onNext} onSkip={onNext} />
}
function Lesson04({ onNext }) {
  return (
    <LevelMovie
      videoId="level-0-4-lesson"
      Scene={CellsLesson}
      Overlay={CellsLessonOverlay}
      kicker="World 0 · Level 4 · Lesson"
      name="Built from Cells"
      startMusic={startForgeMusic}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

/** World 0 · Level 5's intro movie and lesson. */
function Movie05({ concept, onNext }) {
  const lv = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-5')
  return (
    <LevelMovie
      videoId="level-0-5-intro"
      Scene={ConeMovie}
      kicker="World 0 · Level 5"
      name={lv?.title || 'Cone Zone'}
      startMusic={startConeMusic}
      musicCues={[
        { t: 10.2, start: startNullMusic }, // Count Null admires his plug
        { t: 14.2, start: startConeMusic },
      ]}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}
function Lesson05({ onNext }) {
  return (
    <LevelMovie
      videoId="level-0-5-lesson"
      Scene={ConeLesson}
      Overlay={ConeLessonOverlay}
      kicker="World 0 · Level 5 · Lesson"
      name="New Spaces from Old"
      startMusic={startConeMusic}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

/** World 0 · Level 6's intro movie and lesson. */
function Movie06({ concept, onNext }) {
  const lv = concept?.worlds?.[0]?.levels?.find((l) => l.id === '0-6')
  return <LevelMovie videoId="level-0-6-intro" Scene={TimberMovie} kicker="World 0 · Level 6" name={lv?.title || 'Timber!'} startMusic={startTimberMusic} onDone={onNext} onSkip={onNext} />
}
function Lesson06({ onNext }) {
  return (
    <LevelMovie
      videoId="level-0-6-lesson"
      Scene={TimberLesson}
      Overlay={TimberLessonOverlay}
      kicker="World 0 · Level 6 · Lesson"
      name="Felling Trees"
      startMusic={startTimberMusic}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

/** World 0 · Bonus's intro movie and lesson. */
function Movie0B({ onNext }) {
  return <LevelMovie videoId="level-0-b-intro" Scene={CylinderMovie} kicker="World 0 · Bonus" name="Extension Cord" startMusic={startMusicBox} onDone={onNext} onSkip={onNext} />
}
function Lesson0B({ onNext }) {
  return (
    <LevelMovie
      videoId="level-0-b-lesson"
      Scene={HepLesson}
      Overlay={HepLessonOverlay}
      kicker="World 0 · Bonus · Lesson"
      name="One Cell at a Time"
      startMusic={startMusicBox}
      onDone={onNext}
      onSkip={onNext}
    />
  )
}

/** World 0 · Castle's intro movie. */
function MovieCastle0({ onNext }) {
  return <LevelMovie videoId="castle-0-intro" Scene={CastleIntro} kicker="World 0 · Castle" name="The Hollow Throne" startMusic={startNullMusic} onDone={onNext} onSkip={onNext} />
}

/** The castle's outro on its own (the castle plays it embedded; this is for the level select). */
function OutroCastle0({ onBackToTitle }) {
  return <LevelMovie videoId="castle-0-outro" Scene={CastleOutro} kicker="World 0 · Castle" name="A Ring Is a Ring" startMusic={startReefMusic} onDone={onBackToTitle} onSkip={onBackToTitle} />
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
  movie04: Movie04,
  lesson04: Lesson04,
  level4: Level04,
  movie05: Movie05,
  lesson05: Lesson05,
  level5: Level05,
  movie06: Movie06,
  lesson06: Lesson06,
  level6: Level06,
  movie0b: Movie0B,
  lesson0b: Lesson0B,
  level0b: Level0B,
  moviec0: MovieCastle0,
  castle0: LevelCastle,
  outroc0: OutroCastle0,
}
const NEXT = { level1: 'movie02', movie02: 'lesson02', lesson02: 'level2', level2: 'movie03', movie03: 'lesson03', lesson03: 'level3', level3: 'movie04', movie04: 'lesson04', lesson04: 'level4', level4: 'movie05', movie05: 'lesson05', lesson05: 'level5', level5: 'movie06', movie06: 'lesson06', lesson06: 'level6', movie0b: 'lesson0b', lesson0b: 'level0b', level6: 'moviec0', moviec0: 'castle0' }

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
