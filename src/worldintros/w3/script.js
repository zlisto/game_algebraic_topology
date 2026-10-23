/**
 * World 3 intro movie script (same shape as a videos.json entry; LevelMovie takes it via `video`).
 * Replaces the old shared videos.json 'world-3-intro' for the 'world3' screen.
 * Picks up from the World 2 castle outro (castles/w2/videos2.js OUTRO_VIDEO): the torus halted
 * half-folded with one window lit, Null carrying both twins north to the Cup Product Gardens.
 * Sets up 3-1 (Mirror Pools, cochains) and the payoff at 3-4 (the cup product tells the twins apart,
 * Hatcher Example 3.8).
 */

const C = (t, end, speaker, text, extra = {}) => {
  const portrait = { 'Count Null': 'count-null', Gyroid: 'gyroid', 'Emmy Boundary': 'emmy-boundary' }[speaker]
  return { t, end, speaker, ...(portrait ? { portrait } : {}), text, ...extra }
}
const NARR = (t, end, text) => ({ t, end, speaker: 'Narrator', hold: false, text })

export const VIDEO = {
  id: 'world-3-intro-v2',
  title: 'Into the Cup Product Gardens',
  plays: 'After castle-2’s outro (Twins), before World 3 · Level 1',
  world: 3,
  status: 'scripted',
  story_start: 0,
  story_end: 76,
  pace: [[0, null, 0.85]],
  synopsis:
    'Three nights after Null carried the twins north, Gyroid and Emmy reach a garden gate on a cliff over the Cup Product Gardens. The camera flies the landmarks they are about to play: the Mirror Pools, the Lantern Rows, the Polynomial Garden’s fountain, the Compass Cliffs, and a strange station on the horizon. Far north, the Twin Islands: the torus hangs half-folded, one window lit. Null rises over them and promises to finish the fold when that light goes out. Emmy answers that classes here multiply, and the products will tell the twins apart. They run down the stair toward the Mirror Pools.',
  scenes: [
    { id: 'A', start: 0, end: 9.5, title: 'The gate', description: 'Aerial over the night gardens; Gyroid and Emmy walk through a garden gate onto a cliff-top terrace.' },
    { id: 'B', start: 9.5, end: 16, title: 'The view', description: 'Behind them: the Gardens spread across the sea below, lanterns and pools to the horizon.' },
    { id: 'C', start: 16, end: 34.6, title: 'Fly-over', description: 'Mirror Pools, Lantern Rows, the Polynomial Garden fountain, the Compass Cliffs, then a station with a torus façade on the horizon.' },
    { id: 'D', start: 34.6, end: 39, title: 'The twins', description: 'The Twin Islands: the grey, half-folded torus with one window lit; the bouquet beside it.' },
    { id: 'E', start: 39, end: 59.4, title: 'Null', description: 'Null rises out of the sea mist behind the islands, huge, the Crown’s thread still on the torus. The last window flickers.' },
    { id: 'F', start: 59.4, end: 76, title: 'Let’s roll', description: 'They run down the stair toward the Mirror Pools; the camera climbs over the Gardens. Title.' },
  ],
  captions: [
    NARR(0.6, 5.8, 'Three nights after Null carried the twins north, the Delta road ended at a garden gate, high on a cliff.'),
    C(9.8, 12.6, 'Gyroid', 'Whoa. Emmy, the whole sea down there is a garden!'),
    C(12.8, 15.8, 'Emmy Boundary', 'The Cup Product Gardens. Every pool and lantern down there reads something.'),
    C(16.4, 20.4, 'Emmy Boundary', 'Mirror Pools. They read paths backwards: a number on every edge, checked round every triangle.'),
    C(21.2, 24.6, 'Emmy Boundary', 'Lantern Rows. Two readings meet there and multiply into a third.'),
    C(25.4, 29, 'Gyroid', 'A fountain that climbs in powers, cliffs covered in compasses… I want to run every inch of it.'),
    C(29.8, 31.8, 'Gyroid', 'And that station? There’s a torus carved on its front.'),
    C(32, 34.4, 'Emmy Boundary', 'It isn’t on any map I drew. Stay clear of it.'),
    C(35, 38.6, 'Gyroid', 'There. The torus. One window’s still lit… someone’s still in there.'),
    C(41, 43.8, 'Count Null', 'Welcome to my gardens, Gyroid. I kept a light on for you.'),
    C(44.2, 48.2, 'Count Null', 'Same holes. Same counts. Your numbers say they are one place, and one place is all anyone needs.'),
    C(48.6, 52.4, 'Count Null', 'When that last light goes out, I finish the fold. Gently. No one on it will ever be lost again.'),
    C(52.8, 56.2, 'Emmy Boundary', 'They are not the same, Null. Classes here multiply, and the products will tell your twins apart.'),
    C(56.6, 59.2, 'Count Null', 'Then read quickly, Emmy. The light won’t wait for you.'),
    C(59.8, 62.8, 'Gyroid', 'Hang on in there. We’re coming for you.'),
    C(63.2, 65.2, 'Emmy Boundary', 'Mirror Pools first. We learn to read.'),
    C(65.4, 66.8, 'Gyroid', 'Then let’s roll!'),
  ],
  title_card: { t: 69.5, end: 76 },
}
