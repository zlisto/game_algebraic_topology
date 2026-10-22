/** Every world's castle (intro movie → boss level → outro movie) and the finale, merged for App. */
import * as w1 from './w1'
import * as w2 from './w2'
import * as w3 from './w3'
import * as w4 from './w4'
import * as ending from './ending'

const all = [w1, w2, w3, w4, ending]
export const CASTLE_SCREENS = Object.assign({}, ...all.map((m) => m.screens))
export const CASTLE_NEXT = Object.assign({}, ...all.map((m) => m.next))
