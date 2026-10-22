/**
 * w3: the World 3 castle, "The Counterfeit Station" (Hatcher Ch. 3, cohomology).
 *   moviec3v2  intro movie   (IntroMovie, scripts.json castle-3-intro-v2)
 *   castle3v2  boss level    (LevelCastle3: three trials, three waves, the final phase, the
 *                            embedded outro castle-3-outro-v2, then Emmy's end card)
 *   outroc3v2  the outro on its own (for replays and review)
 * App's own SCREENS win over these ids, so the new screens take new ids and `next` re-routes the
 * chain round the old moviec3 / castle3 / outroc3 (castle3 itself now re-exports the new level).
 */
import LevelCastle3 from './LevelCastle3'
import { MovieCastle3, OutroCastle3 } from './Movies'

// castle screens now win over App's, so the old ids load the new castle too
export const screens = { moviec3v2: MovieCastle3, castle3v2: LevelCastle3, outroc3v2: OutroCastle3, moviec3: MovieCastle3, castle3: LevelCastle3, outroc3: OutroCastle3 }
export const next = {
  'level3-9': 'moviec3v2',
  moviec3v2: 'castle3v2',
  castle3v2: 'world4', // the outro plays inside the level, before Emmy's end card
  outroc3v2: 'world4',
  // the old ids, in case anything still links to them
  moviec3: 'castle3v2', // (the new intro, under its old id)
  castle3: 'world4',
  outroc3: 'world4',
}
