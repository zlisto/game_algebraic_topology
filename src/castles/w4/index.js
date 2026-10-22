/**
 * w4: the World 4 castle, the final boss. `screens` maps screen ids to components (App renders them
 * with onNext / onGo / onBackToTitle / concept); `next` maps a screen id to the one that follows it,
 * and overrides App's default chain. After the Crown breaks, the ending movie ('ending') takes over.
 */
import MovieCastle4 from './MovieCastle4'
import LevelCastle4 from './LevelCastle4'

export const screens = { moviec4: MovieCastle4, castle4: LevelCastle4 }
export const next = { 'level4-12': 'moviec4', moviec4: 'castle4', castle4: 'ending' }
