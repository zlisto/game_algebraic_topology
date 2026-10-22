/**
 * The finale: the ending movie ('ending', after castle4's final boss) and the end credits
 * ('credits'), which lead back to the title. `screens` maps screen ids to components (App renders
 * them with onNext / onGo / onBackToTitle / concept); `next` overrides App's default chain.
 */
import Credits from './Credits'
import EndingScreen from './EndingScreen'

export const screens = { ending: EndingScreen, credits: Credits }
export const next = { ending: 'credits', credits: 'title' }
