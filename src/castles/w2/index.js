/**
 * w2: World 2's castle, "The Retractor". `screens` maps screen ids to components (App renders them
 * with onNext / onGo / onBackToTitle / concept); `next` overrides App's default chain:
 * 2-10 → intro movie → boss level → outro movie (+ Emmy's end card) → World 3.
 */
import LevelCastle2 from './LevelCastle2'
import { MovieCastle2, OutroCastle2 } from './Screens2'

export const screens = { moviec2: MovieCastle2, castle2: LevelCastle2, outroc2: OutroCastle2 }
export const next = { 'level2-10': 'moviec2', moviec2: 'castle2', castle2: 'outroc2', outroc2: 'world3' }
