/**
 * w1: World 1's castle, "The Delta Sphere". `screens` maps screen ids to components (App renders
 * them with onNext / onGo / onBackToTitle / concept); `next` maps a screen id to the one that
 * follows it and overrides App's default chain: 1-10 → intro movie → boss level → outro → World 2.
 */
import { createElement } from 'react'
import { startBastionMusic, startNullMusic } from '../../audio/chip'
import LevelMovie from '../../screens/LevelMovie'
import LevelCastle1 from './LevelCastle1'
import SphereIntro from './SphereIntro'
import SphereOutro, { WindingGauge } from './SphereOutro'
import VIDEOS from './castle1_videos.json'

const INTRO_CUES = [{ t: 19, start: startNullMusic }]

function MovieCastle1({ onNext }) {
  return createElement(LevelMovie, {
    video: VIDEOS.intro,
    Scene: SphereIntro,
    kicker: 'World 1 · Castle',
    name: 'The Delta Sphere',
    startMusic: startBastionMusic,
    musicCues: INTRO_CUES,
    onDone: onNext,
    onSkip: onNext,
  })
}

function OutroCastle1({ onNext }) {
  return createElement(LevelMovie, {
    video: VIDEOS.outro,
    Scene: SphereOutro,
    Overlay: WindingGauge,
    kicker: 'World 1 complete · Bouquet Bastion on the Chart',
    name: 'Your Number Reads Zero',
    startMusic: startNullMusic,
    onDone: onNext,
    onSkip: onNext,
  })
}

export const screens = { moviec1: MovieCastle1, castle1: LevelCastle1, outroc1: OutroCastle1 }
export const next = { 'level1-10': 'moviec1', moviec1: 'castle1', castle1: 'outroc1', outroc1: 'world2' }
