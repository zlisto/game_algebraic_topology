import ButtonHud from './controls/ButtonHud'
import ModelView from './dev/ModelView'
import PrologueScreen from './movies/prologue'
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
import { CASTLE_NEXT, CASTLE_SCREENS } from './castles'
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
import { makeWorldIntro } from './movies/WorldIntro'
import TidewarpMovie from './movies/TidewarpMovie'
import TidewarpLesson, { LessonOverlay } from './movies/TidewarpLesson'
import Level1_1 from './screens/w1/Level1_1'
import Level1_2 from './screens/w1/Level1_2'
import Level1_3 from './screens/w1/Level1_3'
import Level1_4 from './screens/w1/Level1_4'
import Level1_5 from './screens/w1/Level1_5'
import Level1_6 from './screens/w1/Level1_6'
import Level1_7 from './screens/w1/Level1_7'
import Level1_8 from './screens/w1/Level1_8'
import Level1_9 from './screens/w1/Level1_9'
import Level1_10 from './screens/w1/Level1_10'
import EndpointsMovie from './movies/w1/EndpointsMovie'
import EndpointsLesson, { EndpointsLessonOverlay } from './movies/w1/EndpointsLesson'
import LoopMovie from './movies/w1/LoopMovie'
import LoopLesson, { LoopLessonOverlay } from './movies/w1/LoopLesson'
import WindingRoadMovie from './movies/w1/WindingRoadMovie'
import WindingRoadLesson, { WindingRoadLessonOverlay } from './movies/w1/WindingRoadLesson'
import NoWayOutMovie from './movies/w1/NoWayOutMovie'
import NoWayOutLesson, { NoWayOutLessonOverlay } from './movies/w1/NoWayOutLesson'
import PushForwardMovie from './movies/w1/PushForwardMovie'
import PushForwardLesson, { PushForwardLessonOverlay } from './movies/w1/PushForwardLesson'
import FreeWordMovie from './movies/w1/FreeWordMovie'
import FreeWordLesson, { FreeWordLessonOverlay } from './movies/w1/FreeWordLesson'
import GlueJobMovie from './movies/w1/GlueJobMovie'
import GlueJobLesson, { GlueJobLessonOverlay } from './movies/w1/GlueJobLesson'
import UnderCoverMovie from './movies/w1/UnderCoverMovie'
import UnderCoverLesson, { UnderCoverLessonOverlay } from './movies/w1/UnderCoverLesson'
import SheetMusicMovie from './movies/w1/SheetMusicMovie'
import SheetMusicLesson, { SheetMusicLessonOverlay } from './movies/w1/SheetMusicLesson'
import DeckHallsMovie from './movies/w1/DeckHallsMovie'
import DeckHallsLesson, { DeckHallsLessonOverlay } from './movies/w1/DeckHallsLesson'
import Level3_1 from './screens/w3/Level3_1'
import Level3_2 from './screens/w3/Level3_2'
import Level3_3 from './screens/w3/Level3_3'
import Level3_4 from './screens/w3/Level3_4'
import Level3_5 from './screens/w3/Level3_5'
import Level3_6 from './screens/w3/Level3_6'
import Level3_7 from './screens/w3/Level3_7'
import Level3_8 from './screens/w3/Level3_8'
import Level3_9 from './screens/w3/Level3_9'
import LevelCastle3 from './screens/w3/LevelCastle3'
import ReverseEngineeringMovie from './movies/w3/ReverseEngineeringMovie'
import ReverseEngineeringLesson, { ReverseEngineeringLessonOverlay } from './movies/w3/ReverseEngineeringLesson'
import TorsionShiftMovie from './movies/w3/TorsionShiftMovie'
import TorsionShiftLesson, { TorsionShiftLessonOverlay } from './movies/w3/TorsionShiftLesson'
import FrontFaceMovie from './movies/w3/FrontFaceMovie'
import FrontFaceLesson, { FrontFaceLessonOverlay } from './movies/w3/FrontFaceLesson'
import CupCounterexampleMovie from './movies/w3/CupCounterexampleMovie'
import CupCounterexampleLesson, { CupCounterexampleLessonOverlay } from './movies/w3/CupCounterexampleLesson'
import ProductPlacementMovie from './movies/w3/ProductPlacementMovie'
import ProductPlacementLesson, { ProductPlacementLessonOverlay } from './movies/w3/ProductPlacementLesson'
import PolynomialGardenMovie from './movies/w3/PolynomialGardenMovie'
import PolynomialGardenLesson, { PolynomialGardenLessonOverlay } from './movies/w3/PolynomialGardenLesson'
import WhichWayMovie from './movies/w3/WhichWayMovie'
import WhichWayLesson, { WhichWayLessonOverlay } from './movies/w3/WhichWayLesson'
import BothSidesMovie from './movies/w3/BothSidesMovie'
import BothSidesLesson, { BothSidesLessonOverlay } from './movies/w3/BothSidesLesson'
import PerfectPairingMovie from './movies/w3/PerfectPairingMovie'
import PerfectPairingLesson, { PerfectPairingLessonOverlay } from './movies/w3/PerfectPairingLesson'
import CounterfeitMovie from './movies/w3/CounterfeitMovie'
import SpireOutro from './movies/w3/SpireOutro'
import Level2_1 from './screens/w2/Level2_1'
import Level2_2 from './screens/w2/Level2_2'
import Level2_3 from './screens/w2/Level2_3'
import Level2_4 from './screens/w2/Level2_4'
import Level2_5 from './screens/w2/Level2_5'
import Level2_6 from './screens/w2/Level2_6'
import Level2_7 from './screens/w2/Level2_7'
import Level2_8 from './screens/w2/Level2_8'
import Level2_9 from './screens/w2/Level2_9'
import Level2_10 from './screens/w2/Level2_10'
import TileYardMovie from './movies/w2/TileYardMovie'
import TileYardLesson, { TileYardLessonOverlay } from './movies/w2/TileYardLesson'
import BoundaryBladeMovie from './movies/w2/BoundaryBladeMovie'
import BoundaryBladeLesson, { BoundaryBladeLessonOverlay } from './movies/w2/BoundaryBladeLesson'
import AnySimplexMovie from './movies/w2/AnySimplexMovie'
import AnySimplexLesson, { AnySimplexLessonOverlay } from './movies/w2/AnySimplexLesson'
import ChaseSceneMovie from './movies/w2/ChaseSceneMovie'
import ChaseSceneLesson, { ChaseSceneLessonOverlay } from './movies/w2/ChaseSceneLesson'
import CutPasteMovie from './movies/w2/CutPasteMovie'
import CutPasteLesson, { CutPasteLessonOverlay } from './movies/w2/CutPasteLesson'
import ThirdDegreeMovie from './movies/w2/ThirdDegreeMovie'
import ThirdDegreeLesson, { ThirdDegreeLessonOverlay } from './movies/w2/ThirdDegreeLesson'
import CellBlockMovie from './movies/w2/CellBlockMovie'
import CellBlockLesson, { CellBlockLessonOverlay } from './movies/w2/CellBlockLesson'
import PatchworkMovie from './movies/w2/PatchworkMovie'
import PatchworkLesson, { PatchworkLessonOverlay } from './movies/w2/PatchworkLesson'
import ModSquadMovie from './movies/w2/ModSquadMovie'
import ModSquadLesson, { ModSquadLessonOverlay } from './movies/w2/ModSquadLesson'
import ForgetOrderMovie from './movies/w2/ForgetOrderMovie'
import ForgetOrderLesson, { ForgetOrderLessonOverlay } from './movies/w2/ForgetOrderLesson'
import Level4_1 from './screens/w4/Level4_1'
import CubeRootMovie from './movies/w4/CubeRootMovie'
import CubeRootLesson, { CubeRootLessonOverlay } from './movies/w4/CubeRootLesson'
import Level4_2 from './screens/w4/Level4_2'
import SnapGridMovie from './movies/w4/SnapGridMovie'
import SnapGridLesson, { SnapGridLessonOverlay } from './movies/w4/SnapGridLesson'
import Level4_3 from './screens/w4/Level4_3'
import WeakSpotMovie from './movies/w4/WeakSpotMovie'
import WeakSpotLesson, { WeakSpotLessonOverlay } from './movies/w4/WeakSpotLesson'
import Level4_4 from './screens/w4/Level4_4'
import SuspensionMovie from './movies/w4/SuspensionMovie'
import SuspensionLesson, { SuspensionLessonOverlay } from './movies/w4/SuspensionLesson'
import Level4_5 from './screens/w4/Level4_5'
import OneGroupMovie from './movies/w4/OneGroupMovie'
import OneGroupLesson, { OneGroupLessonOverlay } from './movies/w4/OneGroupLesson'
import Level4_6 from './screens/w4/Level4_6'
import HurewiczMovie from './movies/w4/HurewiczMovie'
import HurewiczLesson, { HurewiczLessonOverlay } from './movies/w4/HurewiczLesson'
import Level4_7 from './screens/w4/Level4_7'
import HopOffMovie from './movies/w4/HopOffMovie'
import HopOffLesson, { HopOffLessonOverlay } from './movies/w4/HopOffLesson'
import Level4_8 from './screens/w4/Level4_8'
import StableGroundMovie from './movies/w4/StableGroundMovie'
import StableGroundLesson, { StableGroundLessonOverlay } from './movies/w4/StableGroundLesson'
import Level4_9 from './screens/w4/Level4_9'
import MapsClassesMovie from './movies/w4/MapsClassesMovie'
import MapsClassesLesson, { MapsClassesLessonOverlay } from './movies/w4/MapsClassesLesson'
import Level4_10 from './screens/w4/Level4_10'
import FibrationMovie from './movies/w4/FibrationMovie'
import FibrationLesson, { FibrationLessonOverlay } from './movies/w4/FibrationLesson'
import Level4_11 from './screens/w4/Level4_11'
import TwistTowerMovie from './movies/w4/TwistTowerMovie'
import TwistTowerLesson, { TwistTowerLessonOverlay } from './movies/w4/TwistTowerLesson'
import Level4_12 from './screens/w4/Level4_12'
import ObstructionMovie from './movies/w4/ObstructionMovie'
import ObstructionLesson, { ObstructionLessonOverlay } from './movies/w4/ObstructionLesson'
import {
  startReefMusic,
  startMusicBox,
  startTimberMusic,
  startConeMusic,
  startForgeMusic,
  startMirrorMusic,
  startNullMusic,
  startTideMusic,
  startBastionMusic,
  startHelixMusic,
  startBasinMusic,
  startPushMusic,
  startFreeWordMusic,
  startGlueWorksMusic,
  startSheetwaterMusic,
  startSheetCanonMusic,
  startDeckRoundMusic,
  startGardensMusic,
  startTerraceMusic,
  startLanternMusic,
  startParterreMusic,
  startPolyMusic,
  startReachMusic,
  startSeamMusic,
  startPierMusic,
  startDeltaMusic,
  startFogMusic,
  startCanalMusic,
  startQuarryMusic,
  startDynamoMusic,
  startReelMusic,
  startModMusic,
  startFordMusic,
  startCubeHallMusic,
  startGridGalleryMusic,
  startWeakSpotMusic,
  startSlingLandingMusic,
  startOneGroupMusic,
  startHurewiczMusic,
  startHopfRingMusic,
  startStableGroundMusic,
  startClassingMusic,
  startFibrationMusic,
  startTwistMusic,
  startObstructionMusic,
} from './audio/chip'

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

/** The movie between provinces (video `world-N-intro`): the story carried from one world to the next. */
const worldIntro = (n, name, startMusic) => {
  const Scene = makeWorldIntro(n)
  return function WorldIntroMovie({ onNext }) {
    return <LevelMovie videoId={`world-${n}-intro`} Scene={Scene} kicker={`World ${n}`} name={name} startMusic={startMusic} onDone={onNext} onSkip={onNext} />
  }
}
const World1 = worldIntro(1, 'Into Bouquet Bastion', startBastionMusic)
const World2 = worldIntro(2, 'Into Chain Delta', startDeltaMusic)
const World3 = worldIntro(3, 'Into the Cup Product Gardens', startGardensMusic)
const World4 = worldIntro(4, 'Up the Postnikov Spire', startReachMusic)

/** World 0 · Castle's intro movie. */
function MovieCastle0({ onNext }) {
  return <LevelMovie videoId="castle-0-intro" Scene={CastleIntro} kicker="World 0 · Castle" name="The Hollow Throne" startMusic={startNullMusic} onDone={onNext} onSkip={onNext} />
}

/** The castle's outro on its own (the castle plays it embedded; this is for the level select). */
function OutroCastle0({ onNext }) {
  return <LevelMovie videoId="castle-0-outro" Scene={CastleOutro} kicker="World 0 · Castle" name="A Ring Is a Ring" startMusic={startReefMusic} onDone={onNext} onSkip={onNext} />
}

// ---------------------------------------------------------------- World 1 · Bouquet Bastion

/** Intro movie for World 1 · Level K (video `level-1-K-intro`). */
const w1Movie = (k, Scene, fallbackName, startMusic) =>
  function MovieW1({ concept, onNext }) {
    const lv = concept?.worlds?.[1]?.levels?.find((l) => l.id === `1-${k}`)
    return <LevelMovie videoId={`level-1-${k}-intro`} Scene={Scene} kicker={`World 1 · Level ${k}`} name={lv?.title || fallbackName} startMusic={startMusic} onDone={onNext} onSkip={onNext} />
  }
/** Lesson for World 1 · Level K (video `level-1-K-lesson`). */
const w1Lesson = (k, Scene, Overlay, name, startMusic) =>
  function LessonW1({ onNext, embedded }) {
    return <LevelMovie videoId={`level-1-${k}-lesson`} Scene={Scene} Overlay={Overlay} kicker={`World 1 · Level ${k} · Lesson`} name={name} startMusic={startMusic} onDone={onNext} onSkip={onNext} embedded={embedded} />
  }
const Movie1_1 = w1Movie(1, EndpointsMovie, 'Fixed Endpoints', startBastionMusic)
const Lesson1_1 = w1Lesson(1, EndpointsLesson, EndpointsLessonOverlay, 'Fixed Endpoints', startBastionMusic)
const Movie1_2 = w1Movie(2, LoopMovie, 'Loop de Loop', startBastionMusic)
const Lesson1_2 = w1Lesson(2, LoopLesson, LoopLessonOverlay, 'Loops at a Point', startBastionMusic)
const Movie1_3 = w1Movie(3, WindingRoadMovie, 'Winding Road', startHelixMusic)
const Lesson1_3 = w1Lesson(3, WindingRoadLesson, WindingRoadLessonOverlay, 'The Winding Number', startHelixMusic)
const Movie1_4 = w1Movie(4, NoWayOutMovie, 'No Way Out', startBasinMusic)
const Lesson1_4 = w1Lesson(4, NoWayOutLesson, NoWayOutLessonOverlay, 'No Way Out', startBasinMusic)
const Movie1_5 = w1Movie(5, PushForwardMovie, 'Push It Forward', startPushMusic)
const Lesson1_5 = w1Lesson(5, PushForwardLesson, PushForwardLessonOverlay, 'Push It Forward', startPushMusic)
const Movie1_6 = w1Movie(6, FreeWordMovie, 'Free Word Play', startFreeWordMusic)
const Lesson1_6 = w1Lesson(6, FreeWordLesson, FreeWordLessonOverlay, 'Free Words', startFreeWordMusic)
const Movie1_7 = w1Movie(7, GlueJobMovie, 'Glue Job', startGlueWorksMusic)
const Lesson1_7 = w1Lesson(7, GlueJobLesson, GlueJobLessonOverlay, 'Glue and Van Kampen', startGlueWorksMusic)
const Movie1_8 = w1Movie(8, UnderCoverMovie, 'Under Cover', startSheetwaterMusic)
const Lesson1_8 = w1Lesson(8, UnderCoverLesson, UnderCoverLessonOverlay, 'Covers and Lifts', startSheetwaterMusic)
const Movie1_9 = w1Movie(9, SheetMusicMovie, 'Sheet Music', startSheetCanonMusic)
const Lesson1_9 = w1Lesson(9, SheetMusicLesson, SheetMusicLessonOverlay, 'Sheet Music', startSheetCanonMusic)
const Movie1_10 = w1Movie(10, DeckHallsMovie, 'Deck the Halls', startDeckRoundMusic)
const Lesson1_10 = w1Lesson(10, DeckHallsLesson, DeckHallsLessonOverlay, 'Deck Shifts', startDeckRoundMusic)

// ---------------------------------------------------------------- World 3 · Cup Product Gardens
const w3Movie = (k, Scene, fallbackName, startMusic) =>
  function MovieW3({ concept, onNext }) {
    const lv = concept?.worlds?.[3]?.levels?.find((l) => l.id === `3-${k}`)
    return <LevelMovie videoId={`level-3-${k}-intro`} Scene={Scene} kicker={`World 3 · Level ${k}`} name={lv?.title || fallbackName} startMusic={startMusic} onDone={onNext} onSkip={onNext} />
  }
const w3Lesson = (k, Scene, Overlay, name, startMusic) =>
  function LessonW3({ onNext, embedded }) {
    return <LevelMovie videoId={`level-3-${k}-lesson`} Scene={Scene} Overlay={Overlay} kicker={`World 3 · Level ${k} · Lesson`} name={name} startMusic={startMusic} onDone={onNext} onSkip={onNext} embedded={embedded} />
  }
const Movie3_1 = w3Movie(1, ReverseEngineeringMovie, 'Reverse Engineering', startGardensMusic)
const Lesson3_1 = w3Lesson(1, ReverseEngineeringLesson, ReverseEngineeringLessonOverlay, 'Readings and Coboundaries', startGardensMusic)
const Movie3_2 = w3Movie(2, TorsionShiftMovie, 'Torsion Shift', startTerraceMusic)
const Lesson3_2 = w3Lesson(2, TorsionShiftLesson, TorsionShiftLessonOverlay, 'Torsion Climbs', startTerraceMusic)
const Movie3_3 = w3Movie(3, FrontFaceMovie, 'Front Face, Back Face', startLanternMusic)
const Lesson3_3 = w3Lesson(3, FrontFaceLesson, FrontFaceLessonOverlay, 'The Cup Product', startLanternMusic)
const Movie3_4 = w3Movie(4, CupCounterexampleMovie, 'A Cup of Counterexample', startGardensMusic)
const Lesson3_4 = w3Lesson(4, CupCounterexampleLesson, CupCounterexampleLessonOverlay, 'Rings Tell Spaces Apart', startGardensMusic)
const Movie3_5 = w3Movie(5, ProductPlacementMovie, 'Product Placement', startParterreMusic)
const Lesson3_5 = w3Lesson(5, ProductPlacementLesson, ProductPlacementLessonOverlay, 'Products of Readings', startParterreMusic)
const Movie3_6 = w3Movie(6, PolynomialGardenMovie, 'Polynomial Garden', startPolyMusic)
const Lesson3_6 = w3Lesson(6, PolynomialGardenLesson, PolynomialGardenLessonOverlay, 'Truncated Polynomials', startPolyMusic)
const Movie3_7 = w3Movie(7, WhichWayMovie, 'Which Way Is Up', startReachMusic)
const Lesson3_7 = w3Lesson(7, WhichWayLesson, WhichWayLessonOverlay, 'Orientations', startReachMusic)
const Movie3_8 = w3Movie(8, BothSidesMovie, 'Both Sides of the Story', startSeamMusic)
const Lesson3_8 = w3Lesson(8, BothSidesLesson, BothSidesLessonOverlay, 'Poincaré Duality', startSeamMusic)
const Movie3_9 = w3Movie(9, PerfectPairingMovie, 'Perfect Pairing', startPierMusic)
const Lesson3_9 = w3Lesson(9, PerfectPairingLesson, PerfectPairingLessonOverlay, 'Perfect Pairings', startPierMusic)
function MovieCastle3({ onNext }) {
  return <LevelMovie videoId="castle-3-intro" Scene={CounterfeitMovie} kicker="World 3 · Castle" name="The Counterfeit Station" startMusic={startGardensMusic} onDone={onNext} onSkip={onNext} />
}
function OutroCastle3({ onNext }) {
  return <LevelMovie videoId="castle-3-outro" Scene={SpireOutro} kicker="World 3 · Castle" name="Up the Spire" startMusic={startReachMusic} onDone={onNext} onSkip={onNext} />
}

// ---------------------------------------------------------------- World 2 · Chain Delta

const w2Movie = (k, Scene, fallbackName, startMusic) =>
  function MovieW2({ concept, onNext }) {
    const lv = concept?.worlds?.[2]?.levels?.find((l) => l.id === `2-${k}`)
    return <LevelMovie videoId={`level-2-${k}-intro`} Scene={Scene} kicker={`World 2 · Level ${k}`} name={lv?.title || fallbackName} startMusic={startMusic} onDone={onNext} onSkip={onNext} />
  }
const w2Lesson = (k, Scene, Overlay, name, startMusic) =>
  function LessonW2({ onNext, embedded }) {
    return <LevelMovie videoId={`level-2-${k}-lesson`} Scene={Scene} Overlay={Overlay} kicker={`World 2 · Level ${k} · Lesson`} name={name} startMusic={startMusic} onDone={onNext} onSkip={onNext} embedded={embedded} />
  }
const Movie2_1 = w2Movie(1, TileYardMovie, 'Tile and Error', startDeltaMusic)
const Lesson2_1 = w2Lesson(1, TileYardLesson, TileYardLessonOverlay, 'Ordered Triangles', startDeltaMusic)
const Movie2_2 = w2Movie(2, BoundaryBladeMovie, 'Boundary Issues', startDeltaMusic)
const Lesson2_2 = w2Lesson(2, BoundaryBladeLesson, BoundaryBladeLessonOverlay, 'Cycles and Boundaries', startDeltaMusic)
const Movie2_3 = w2Movie(3, AnySimplexMovie, 'Any Simplex Will Do', startFogMusic)
const Lesson2_3 = w2Lesson(3, AnySimplexLesson, AnySimplexLessonOverlay, 'Singular Homology', startFogMusic)
const Movie2_4 = w2Movie(4, ChaseSceneMovie, 'Chase Scene', startCanalMusic)
const Lesson2_4 = w2Lesson(4, ChaseSceneLesson, ChaseSceneLessonOverlay, 'Exact Sequences', startCanalMusic)
const Movie2_5 = w2Movie(5, CutPasteMovie, 'Cut and Paste', startQuarryMusic)
const Lesson2_5 = w2Lesson(5, CutPasteLesson, CutPasteLessonOverlay, 'Excision and Spheres', startQuarryMusic)
const Movie2_6 = w2Movie(6, ThirdDegreeMovie, 'The Third Degree', startDynamoMusic)
const Lesson2_6 = w2Lesson(6, ThirdDegreeLesson, ThirdDegreeLessonOverlay, 'Degree', startDynamoMusic)
const Movie2_7 = w2Movie(7, CellBlockMovie, 'Cell Block', startDynamoMusic)
const Lesson2_7 = w2Lesson(7, CellBlockLesson, CellBlockLessonOverlay, 'Cellular Homology', startDynamoMusic)
const Movie2_8 = w2Movie(8, PatchworkMovie, 'Patchwork', startReelMusic)
const Lesson2_8 = w2Lesson(8, PatchworkLesson, PatchworkLessonOverlay, 'Mayer–Vietoris', startReelMusic)
const Movie2_9 = w2Movie(9, ModSquadMovie, 'Mod Squad', startModMusic)
const Lesson2_9 = w2Lesson(9, ModSquadLesson, ModSquadLessonOverlay, 'Coefficients', startModMusic)
const Movie2_10 = w2Movie(10, ForgetOrderMovie, 'Forget the Order', startFordMusic)
const Lesson2_10 = w2Lesson(10, ForgetOrderLesson, ForgetOrderLessonOverlay, 'Abelianization', startFordMusic)

// ---------------------------------------------------------------- World 4 · Postnikov Spire

const w4Movie = (k, Scene, fallbackName, startMusic) =>
  function MovieW4({ concept, onNext }) {
    const lv = concept?.worlds?.[4]?.levels?.find((l) => l.id === `4-${k}`)
    return <LevelMovie videoId={`level-4-${k}-intro`} Scene={Scene} kicker={`World 4 · Level ${k}`} name={lv?.title || fallbackName} startMusic={startMusic} onDone={onNext} onSkip={onNext} />
  }
const w4Lesson = (k, Scene, Overlay, name, startMusic) =>
  function LessonW4({ onNext, embedded }) {
    return <LevelMovie videoId={`level-4-${k}-lesson`} Scene={Scene} Overlay={Overlay} kicker={`World 4 · Level ${k} · Lesson`} name={name} startMusic={startMusic} onDone={onNext} onSkip={onNext} embedded={embedded} />
  }

const Movie4_1 = w4Movie(1, CubeRootMovie, "Cube Root", startCubeHallMusic)
const Lesson4_1 = w4Lesson(1, CubeRootLesson, CubeRootLessonOverlay, "Higher Homotopy Groups", startCubeHallMusic)
const Movie4_2 = w4Movie(2, SnapGridMovie, "Snap to Grid", startGridGalleryMusic)
const Lesson4_2 = w4Lesson(2, SnapGridLesson, SnapGridLessonOverlay, "Cellular Approximation", startGridGalleryMusic)
const Movie4_3 = w4Movie(3, WeakSpotMovie, "Weak Spot", startWeakSpotMusic)
const Lesson4_3 = w4Lesson(3, WeakSpotLesson, WeakSpotLessonOverlay, "Whitehead's Theorem", startWeakSpotMusic)
const Movie4_4 = w4Movie(4, SuspensionMovie, "Suspension of Disbelief", startSlingLandingMusic)
const Lesson4_4 = w4Lesson(4, SuspensionLesson, SuspensionLessonOverlay, "Freudenthal Suspension", startSlingLandingMusic)
const Movie4_5 = w4Movie(5, OneGroupMovie, "One Group Per Floor", startOneGroupMusic)
const Lesson4_5 = w4Lesson(5, OneGroupLesson, OneGroupLessonOverlay, "Eilenberg\u2013MacLane Spaces", startOneGroupMusic)
const Movie4_6 = w4Movie(6, HurewiczMovie, "Hurewicz Hurrah", startHurewiczMusic)
const Lesson4_6 = w4Lesson(6, HurewiczLesson, HurewiczLessonOverlay, "The Hurewicz Map", startHurewiczMusic)
const Movie4_7 = w4Movie(7, HopOffMovie, "Hop Off", startHopfRingMusic)
const Lesson4_7 = w4Lesson(7, HopOffLesson, HopOffLessonOverlay, "The Hopf Fibration", startHopfRingMusic)
const Movie4_8 = w4Movie(8, StableGroundMovie, "Stable Ground", startStableGroundMusic)
const Lesson4_8 = w4Lesson(8, StableGroundLesson, StableGroundLessonOverlay, "Stable Homotopy", startStableGroundMusic)
const Movie4_9 = w4Movie(9, MapsClassesMovie, "Maps Are Classes", startClassingMusic)
const Lesson4_9 = w4Lesson(9, MapsClassesLesson, MapsClassesLessonOverlay, "Cohomology as Maps", startClassingMusic)
const Movie4_10 = w4Movie(10, FibrationMovie, "Fibration Station", startFibrationMusic)
const Lesson4_10 = w4Lesson(10, FibrationLesson, FibrationLessonOverlay, "Fibrations and Lifts", startFibrationMusic)
const Movie4_11 = w4Movie(11, TwistTowerMovie, "A Twist in the Tower", startTwistMusic)
const Lesson4_11 = w4Lesson(11, TwistTowerLesson, TwistTowerLessonOverlay, "Postnikov Towers", startTwistMusic)
const Movie4_12 = w4Movie(12, ObstructionMovie, "Obstruction Course", startObstructionMusic)
const Lesson4_12 = w4Lesson(12, ObstructionLesson, ObstructionLessonOverlay, "Obstruction Theory", startObstructionMusic)

const SCREENS = {
  ...(import.meta.env.DEV ? { modelview: ModelView } : {}), // dev: ?screen=modelview&m=null
  title: TitleScreen,
  prologue: PrologueScreen,
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
  world1: World1, world2: World2, world3: World3, world4: World4,
  'movie1-1': Movie1_1,
  'lesson1-1': Lesson1_1,
  'level1-1': Level1_1,
  'movie1-2': Movie1_2,
  'lesson1-2': Lesson1_2,
  'level1-2': Level1_2,
  'movie1-3': Movie1_3,
  'lesson1-3': Lesson1_3,
  'level1-3': Level1_3,
  'movie1-4': Movie1_4,
  'lesson1-4': Lesson1_4,
  'level1-4': Level1_4,
  'movie1-5': Movie1_5,
  'lesson1-5': Lesson1_5,
  'level1-5': Level1_5,
  'movie1-6': Movie1_6,
  'lesson1-6': Lesson1_6,
  'level1-6': Level1_6,
  'movie1-7': Movie1_7,
  'lesson1-7': Lesson1_7,
  'level1-7': Level1_7,
  'movie1-8': Movie1_8,
  'lesson1-8': Lesson1_8,
  'level1-8': Level1_8,
  'movie1-9': Movie1_9,
  'lesson1-9': Lesson1_9,
  'level1-9': Level1_9,
  'movie1-10': Movie1_10,
  'lesson1-10': Lesson1_10,
  'level1-10': Level1_10,
  'movie3-1': Movie3_1, 'lesson3-1': Lesson3_1, 'level3-1': Level3_1,
  'movie3-2': Movie3_2, 'lesson3-2': Lesson3_2, 'level3-2': Level3_2,
  'movie3-3': Movie3_3, 'lesson3-3': Lesson3_3, 'level3-3': Level3_3,
  'movie3-4': Movie3_4, 'lesson3-4': Lesson3_4, 'level3-4': Level3_4,
  'movie3-5': Movie3_5, 'lesson3-5': Lesson3_5, 'level3-5': Level3_5,
  'movie3-6': Movie3_6, 'lesson3-6': Lesson3_6, 'level3-6': Level3_6,
  'movie3-7': Movie3_7, 'lesson3-7': Lesson3_7, 'level3-7': Level3_7,
  'movie3-8': Movie3_8, 'lesson3-8': Lesson3_8, 'level3-8': Level3_8,
  'movie3-9': Movie3_9, 'lesson3-9': Lesson3_9, 'level3-9': Level3_9,
  moviec3: MovieCastle3, castle3: LevelCastle3, outroc3: OutroCastle3,
  'movie2-1': Movie2_1,
  'lesson2-1': Lesson2_1,
  'level2-1': Level2_1,
  'movie2-2': Movie2_2,
  'lesson2-2': Lesson2_2,
  'level2-2': Level2_2,
  'movie2-3': Movie2_3,
  'lesson2-3': Lesson2_3,
  'level2-3': Level2_3,
  'movie2-4': Movie2_4,
  'lesson2-4': Lesson2_4,
  'level2-4': Level2_4,
  'movie2-5': Movie2_5,
  'lesson2-5': Lesson2_5,
  'level2-5': Level2_5,
  'movie2-6': Movie2_6,
  'lesson2-6': Lesson2_6,
  'level2-6': Level2_6,
  'movie2-7': Movie2_7,
  'lesson2-7': Lesson2_7,
  'level2-7': Level2_7,
  'movie2-8': Movie2_8,
  'lesson2-8': Lesson2_8,
  'level2-8': Level2_8,
  'movie2-9': Movie2_9,
  'lesson2-9': Lesson2_9,
  'level2-9': Level2_9,
  'movie2-10': Movie2_10,
  'lesson2-10': Lesson2_10,
  'level2-10': Level2_10,
  'movie4-1': Movie4_1,
  'lesson4-1': Lesson4_1,
  'level4-1': Level4_1,
  'movie4-2': Movie4_2,
  'lesson4-2': Lesson4_2,
  'level4-2': Level4_2,
  'movie4-3': Movie4_3,
  'lesson4-3': Lesson4_3,
  'level4-3': Level4_3,
  'movie4-4': Movie4_4,
  'lesson4-4': Lesson4_4,
  'level4-4': Level4_4,
  'movie4-5': Movie4_5,
  'lesson4-5': Lesson4_5,
  'level4-5': Level4_5,
  'movie4-6': Movie4_6,
  'lesson4-6': Lesson4_6,
  'level4-6': Level4_6,
  'movie4-7': Movie4_7,
  'lesson4-7': Lesson4_7,
  'level4-7': Level4_7,
  'movie4-8': Movie4_8,
  'lesson4-8': Lesson4_8,
  'level4-8': Level4_8,
  'movie4-9': Movie4_9,
  'lesson4-9': Lesson4_9,
  'level4-9': Level4_9,
  'movie4-10': Movie4_10,
  'lesson4-10': Lesson4_10,
  'level4-10': Level4_10,
  'movie4-11': Movie4_11,
  'lesson4-11': Lesson4_11,
  'level4-11': Level4_11,
  'movie4-12': Movie4_12,
  'lesson4-12': Lesson4_12,
  'level4-12': Level4_12,
}
// World 1: movie → lesson → level, level → next level's movie.
const W4_CHAIN = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => i + 1).flatMap((k) => [
    [`movie4-${k}`, `lesson4-${k}`],
    [`lesson4-${k}`, `level4-${k}`],
    ...(k < 12 ? [[`level4-${k}`, `movie4-${k + 1}`]] : []),
  ]),
)
const W1_CHAIN = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => i + 1).flatMap((k) => [
    [`movie1-${k}`, `lesson1-${k}`],
    [`lesson1-${k}`, `level1-${k}`],
    ...(k < 10 ? [[`level1-${k}`, `movie1-${k + 1}`]] : [[`level1-${k}`, 'world2']]),
  ]),
)
const W2_CHAIN = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => i + 1).flatMap((k) => [
    [`movie2-${k}`, `lesson2-${k}`],
    [`lesson2-${k}`, `level2-${k}`],
    ...(k < 10 ? [[`level2-${k}`, `movie2-${k + 1}`]] : [[`level2-${k}`, 'world3']]),
  ]),
)
const W3_CHAIN = Object.fromEntries(
  Array.from({ length: 9 }, (_, i) => i + 1).flatMap((k) => [
    [`movie3-${k}`, `lesson3-${k}`],
    [`lesson3-${k}`, `level3-${k}`],
    ...(k < 9 ? [[`level3-${k}`, `movie3-${k + 1}`]] : [[`level3-9`, 'moviec3']]),
  ]),
)
Object.assign(W3_CHAIN, { moviec3: 'castle3', castle3: 'outroc3', outroc3: 'world4' })
const NEXT = { prologue: 'intro', ...W1_CHAIN, ...W4_CHAIN, ...W2_CHAIN, ...W3_CHAIN, castle0: 'world1', outroc0: 'world1', world1: 'movie1-1', world2: 'movie2-1', world3: 'movie3-1', world4: 'movie4-1', level1: 'movie02', movie02: 'lesson02', lesson02: 'level2', level2: 'movie03', movie03: 'lesson03', lesson03: 'level3', level3: 'movie04', movie04: 'lesson04', lesson04: 'level4', level4: 'movie05', movie05: 'lesson05', lesson05: 'level5', level5: 'movie06', movie06: 'lesson06', lesson06: 'level6', movie0b: 'lesson0b', lesson0b: 'level0b', level6: 'moviec0', moviec0: 'castle0' }

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

  const Screen = CASTLE_SCREENS[screen] || SCREENS[screen] || TitleScreen // castles override older screens of the same id

  return (
    <div className="screen">
      <Screen
        key={`${screen}:${opts.startAt || ''}:${opts.restart || ''}`}
        {...opts}
        onGo={go}
        concept={concept}
        onNewGame={() => go('prologue')}
        onSkipIntro={() => go('level1')}
        onIntroDone={() => go('level1')}
        onBackToTitle={() => go('title')}
        onReplayIntro={() => go('intro')}
        onNext={() => go(CASTLE_NEXT[screen] || NEXT[screen] || 'title')}
      />
      <ButtonHud />
    </div>
  )
}
