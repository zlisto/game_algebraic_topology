/**
 * The codex's memory: what the player has met, kept in this browser (localStorage).
 *   notes  — each level's "what we learned" + its definition from the book, saved when its end card shows
 *   beasts — each enemy type, saved the first time one is defeated
 *   relics — each reward object, saved when it's picked up
 * Writes fire a 'codex-update' event so an open codex refreshes.
 */
const KEY = 'winding-world:codex'
const empty = () => ({ notes: {}, beasts: {}, relics: {} })

export function readCodex() {
  try {
    const raw = localStorage.getItem(KEY)
    const v = raw ? JSON.parse(raw) : null
    return v && typeof v === 'object' ? { ...empty(), ...v } : empty()
  } catch {
    return empty()
  }
}

function write(mut) {
  const c = readCodex()
  if (!mut(c)) return // nothing new
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* storage unavailable: the codex just won't remember */
  }
  window.dispatchEvent(new CustomEvent('codex-update'))
}

/** A level's end card: title, kicker ("World 0 · Level 3 clear"), Emmy's summary and the book definition. */
export function noteSeen({ kicker = '', title = '', learned = '', definition }) {
  if (!title) return
  const id = `${kicker.replace(/\s*·?\s*clear\s*$/i, '').trim()} — ${title}`
  write((c) => {
    if (c.notes[id]) return false
    c.notes[id] = { kicker, title, learned, text: definition?.text || '', cite: definition?.cite || '', url: definition?.url || '', at: Date.now() }
    return true
  })
}

export function beastMet(type) {
  if (!type) return
  write((c) => {
    if (c.beasts[type]) return false
    c.beasts[type] = Date.now()
    return true
  })
}

export function relicGot(kind) {
  if (!kind) return
  write((c) => {
    if (c.relics[kind]) return false
    c.relics[kind] = Date.now()
    return true
  })
}
