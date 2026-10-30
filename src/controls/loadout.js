import { useEffect } from 'react'

/**
 * The controls, Ocarina of Time style: the Lash on its own button (F, like B), three item buttons (J, K, L, like
 * the C-buttons) that each hold an item you choose in the menu, the context button (E, like A: talk to Emmy), and
 * Tab for the menu (like Start). The number keys still work too.
 *
 * A level registers what it carries with `useLoadout(tools, setTool)`; ReefGame reads the slots and does the rest.
 * Slots and the items found so far are kept in this browser.
 */

export const SLOT_KEYS = ['KeyJ', 'KeyK', 'KeyL']
export const SLOT_LABELS = ['J', 'K', 'L']

/** Every item: its name, a glyph for the buttons, and what it does, in plain words. */
export const ITEMS = {
  spool: { name: 'Spool', short: 'Spool', glyph: '◎', text: 'Press to start a thread, walk, and press again to stop. Lay a spine for a reef to shrink onto, or grab a ribbon and pull it into a new path with its ends held still: a homotopy you can see.' },
  glass: { name: 'Tide Glass', short: 'Glass', glyph: '⧗', text: 'Hold it and scrub time back and forth (Z / X, or the mouse wheel) to watch a deformation play out: a path sliding onto another, a loop shrinking to a point. You see every moment in between, not just the start and the end.' },
  smith: { name: 'Cell Hammer', short: 'Hammer', glyph: '⚒', text: 'Press at the furnace to forge a point or press a disk, and walk a track with the Hammer in hand to forge an edge. Each cell is glued on along its boundary, building a cell complex piece by piece.' },
  cord: { name: 'Winding Cord', short: 'Cord', glyph: '➰', text: 'Hold it and walk a loop road: it counts your laps, plus for one way round and minus for the other. That count is how many times your path winds round the hole.' },
  sling: { name: 'Suspension Sling', short: 'Sling', glyph: '⋈', text: 'Lifts a map up one dimension by suspending it. At some sites it crushes a piece of the space down to a single point instead.' },
  clasp: { name: 'Van Kampen Clasp', short: 'Clasp', glyph: '⊕', text: 'Clasps two pieces together where they overlap, joining their loops into one group, the way van Kampen builds the fundamental group from pieces. On cover towers it re-glues the sheets at a port.' },
  compass: { name: 'Sheet Compass', short: 'Compass', glyph: '✦', text: 'Tells you which sheet of a cover you’re on and where a path’s lift lands. It can also turn every sheet at once, or flip which way is up.' },
  coil: { name: 'Covering Coil', short: 'Coil', glyph: '∞', text: 'Unrolls a space into a covering space.' },
  blade: { name: 'Boundary Blade', short: 'Blade', glyph: '∂', text: 'Cuts a chain to its boundary. Strike a chain to see its edges; a cycle is a chain the blade finds no boundary on.' },
  dial: { name: 'Degree Dial', short: 'Dial', glyph: '◷', text: 'Turn it to set a number: a map’s degree (how many times it wraps one sphere round another, with sign), a coefficient, or a group to try in a lock.' },
  caster: { name: 'Cup Caster', short: 'Caster', glyph: '⌣', text: 'Casts the cup product of two cohomology classes, multiplying them into a class one dimension up. In World 4 it also turns levers and sets fibres.' },
  wand: { name: 'Reading Wand', short: 'Wand', glyph: '⟡', text: 'Press on an edge or a point to set a cochain’s value there (from −2 to 2), then watch what each chain reads.' },
  extension: { name: 'Extension Cord', short: 'Ext. Cord', glyph: '⤳', text: 'Press to start, walk, press again to stop: it extends a map from part of a space over the whole of it, when it can.' },
}
export const LASH = { name: 'Lash', glyph: '⚡', text: 'The Fundamental Lash, always on F. Crack it at a beast: F locks onto one in reach ahead, a click cracks it toward the click.' }

const SLOTS_KEY = 'winding-world:slots'
const FOUND_KEY = 'winding-world:items'
const read = (k, d) => {
  try {
    const v = JSON.parse(localStorage.getItem(k))
    return v ?? d
  } catch {
    return d
  }
}
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* storage unavailable: the slots just won't persist */
  }
}

let slots = read(SLOTS_KEY, [null, null, null])
let found = read(FOUND_KEY, [])
let level = null // { tools, setTool } of the level being played
const changed = () => window.dispatchEvent(new CustomEvent('loadout-update'))

export const getSlots = () => slots
export const getFound = () => found
export const levelTools = () => level?.tools || []
export const inLevel = () => !!level
let held = 'lash' // the tool in hand, for the buttons' highlight
export const getHeld = () => held
export function setHeld(tool) {
  if (tool === held) return
  held = tool
  changed()
}

export function setSlot(i, item) {
  slots = slots.map((s, j) => (j === i ? item : s === item ? null : s)) // one item per button
  save(SLOTS_KEY, slots)
  changed()
}

/** Put the level's items on buttons: keep what's already set where it's usable here, fill the rest. */
function fillSlots(tools) {
  const items = tools.filter((t) => t !== 'lash' && ITEMS[t])
  const next = [...slots]
  for (const t of items) {
    if (next.includes(t)) continue
    let i = next.findIndex((s) => !s)
    if (i < 0) i = next.findIndex((s) => !items.includes(s))
    if (i >= 0) next[i] = t
  }
  if (next.some((s, i) => s !== slots[i])) {
    slots = next
    save(SLOTS_KEY, slots)
  }
}

/** A level says what it carries. */
export function useLoadout(tools, setTool) {
  const sig = tools.join(',')
  useEffect(() => {
    level = { tools, setTool }
    const fresh = tools.filter((t) => ITEMS[t] && !found.includes(t))
    if (fresh.length) {
      found = [...found, ...fresh]
      save(FOUND_KEY, found)
    }
    fillSlots(tools)
    changed()
    return () => {
      if (level?.setTool === setTool) level = null
      changed()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])
}

/** Take a tool in hand. Levels that never registered (the castles) only carry the Lash, on 1. */
export function equip(tool) {
  if (level?.tools.includes(tool)) {
    level.setTool(tool)
    return true
  }
  if (tool === 'lash') {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1', key: '1' }))
    return true
  }
  return false
}

/** The menu (Tab) asks the pause menu to open on a tab. */
let menuTab = null
export const peekMenuTab = () => menuTab // read without side effects (React may run initializers twice)
export const clearMenuTab = () => {
  menuTab = null
}
export const requestMenu = (tab) => {
  menuTab = tab
}
