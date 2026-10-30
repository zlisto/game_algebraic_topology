import { useEffect, useState } from 'react'
import { ITEMS, LASH, SLOT_LABELS, equip, getHeld, getSlots, inLevel, levelTools } from './loadout'

/**
 * The buttons in the corner, like Ocarina of Time's: F (the Lash), J / K / L (the items set on them in the menu),
 * E (talk) and Tab (the menu). Shown only while a level is being played.
 */
export default function ButtonHud() {
  const [, bump] = useState(0)
  const [miss, setMiss] = useState(-1)
  useEffect(() => {
    const on = () => bump((n) => n + 1)
    let tm = 0
    const onMiss = (e) => {
      setMiss(e.detail.slot)
      clearTimeout(tm)
      tm = setTimeout(() => setMiss(-1), 600)
    }
    window.addEventListener('loadout-update', on)
    window.addEventListener('loadout-miss', onMiss)
    return () => {
      window.removeEventListener('loadout-update', on)
      window.removeEventListener('loadout-miss', onMiss)
      clearTimeout(tm)
    }
  }, [])
  if (!inLevel()) return null
  const slots = getSlots()
  const here = levelTools()
  const held = getHeld()
  return (
    <div className="button-hud" aria-label="Buttons">
      <button type="button" className={`bh-btn bh-lash ${held === 'lash' ? 'held' : ''}`} title={LASH.text} onClick={(e) => (equip('lash'), e.currentTarget.blur())}>
        <span className="bh-glyph">{LASH.glyph}</span>
        <kbd>F</kbd>
      </button>
      {SLOT_LABELS.map((k, i) => {
        const it = slots[i] && ITEMS[slots[i]]
        const off = !it || !here.includes(slots[i])
        return (
          <button type="button" key={k} disabled={off} onClick={(e) => (equip(slots[i]), e.currentTarget.blur())} className={`bh-btn bh-item ${off ? 'off' : ''} ${miss === i ? 'miss' : ''} ${it && held === slots[i] ? 'held' : ''}`} title={it ? `${it.name}${off ? ' (not used in this level)' : ''}` : 'Empty: set an item in the menu (Tab)'}>
            <span className="bh-glyph">{it ? it.glyph : ''}</span>
            <kbd>{k}</kbd>
            <span className="bh-name">{it ? it.short : 'empty'}</span>
          </button>
        )
      })}
      <div className="bh-small">
        <span><kbd>E</kbd> Talk</span>
        <span><kbd>Tab</kbd> Menu</span>
      </div>
    </div>
  )
}
