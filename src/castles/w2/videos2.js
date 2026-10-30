/**
 * World 2 castle movie scripts (same shape as a videos.json entry; LevelMovie takes them via `video`).
 * They replace the older outline entries castle-2-intro / castle-2-outro in videos.json.
 */

const C = (t, end, speaker, text, extra = {}) => {
  const portrait = { 'Count Null': 'count-null', Gyroid: 'gyroid', 'Emmy Boundary': 'emmy-boundary' }[speaker]
  return { t, end, speaker, ...(portrait ? { portrait } : {}), text, ...extra }
}
const NARR = (t, end, text) => ({ t, end, speaker: 'Narrator', hold: false, text })

export const INTRO_VIDEO = {
  id: 'castle-2-intro',
  title: 'The Retractor',
  plays: 'Before castle-2, after 2-10 (Forget the Order)',
  world: 2,
  status: 'scripted',
  story_start: 0,
  story_end: 33,
  pace: [[0, null, 0.85]],
  synopsis:
    'At the mouth of Chain Delta, Count Null has built the Retractor: a hollow ball of triangles in an engine-hall of oriented press-plates, chained to the ground. Gyroid runs the triangle causeway while Emmy admits the plates are her own design. Null promises to squeeze the ball onto its skin and fold the Delta flat. First, three trials.',
  scenes: [
    { id: 'A', start: 0, end: 6, title: 'The engine', description: 'Aerial over the Delta at night: lantern channels, triangle islets, and the Retractor straining at its chains.' },
    { id: 'B', start: 6, end: 13, title: 'The causeway', description: 'Gyroid runs a causeway of triangle tiles; each lights gold as he passes. Emmy at its foot.' },
    { id: 'C', start: 13, end: 21, title: 'The hall', description: 'Inside the palisade: the ball pulses, the gears turn, and Null waits under the Crown.' },
    { id: 'D', start: 21, end: 29, title: 'Three trials', description: 'Three triangle sigils light on the floor; Crown shards begin to orbit; Gyroid readies the Lash.' },
    { id: 'E', start: 29, end: 33, title: 'Title', description: 'World 2 · Castle — The Retractor.' },
  ],
  captions: [
    NARR(0.6, 5.6, 'Where Chain Delta’s last channel meets the sea, Count Null built his engine: the Retractor.'),
    C(6.4, 9.9, 'Emmy Boundary', 'Every plate in that hall is one of my triangles, Gyroid. Oriented, glued, counted. He took the plans when he left.'),
    C(10.1, 12.8, 'Gyroid', 'Good. Then I already know how to read them.'),
    C(14.2, 17.4, 'Count Null', 'Gyroid. You came all this way to count my triangles?'),
    C(17.6, 21, 'Count Null', 'A ball is only its skin, stuffed. Tonight I squeeze out the stuffing, and the Delta folds flat with it.'),
    C(21.6, 25, 'Count Null', 'Three trials first. Fail one, and the Delta becomes a point.'),
    C(25.2, 28.6, 'Gyroid', 'Draw your boundaries. I’ll check every sign.'),
  ],
  title_card: { t: 29, end: 33 },
}

export const OUTRO_VIDEO = {
  id: 'castle-2-outro',
  title: 'Twins',
  plays: 'After castle-2’s Retractor phase — the end of World 2',
  world: 2,
  status: 'scripted',
  story_start: 0,
  story_end: 70,
  pace: [[0, null, 0.85]],
  synopsis:
    'The Retractor seizes: a ball cannot retract onto its skin. Null raises twin islands out of the Delta, a torus with a town on it and S¹ ∨ S¹ ∨ S². Gyroid and Emmy read the same homology on both. Null chooses the torus and the Crown begins to fold it on screen; its windows go dark and its hole draws shut to a thread before he halts it. Then he carries both twins north to the Cup Product Gardens to finish it there. At dawn Emmy names the sharper tool: classes that multiply.',
  scenes: [
    { id: 'A', start: 0, end: 7, title: 'Seized', description: 'The gears stop, the chains go dark, the ball stays whole.' },
    { id: 'B', start: 7, end: 15, title: 'Twins', description: 'Two islands rise out of the Delta: a torus with a town on it, and two rings and a ball tied at one point.' },
    { id: 'C', start: 15, end: 23, title: 'The census', description: 'Meters over both islands light row by row: H₀ = ℤ, H₁ = ℤ², H₂ = ℤ on both.' },
    { id: 'D', start: 23, end: 31.4, title: 'The choice', description: 'Null: “I’ll fold the one you love less.” He chooses the torus.' },
    { id: 'H1', start: 31.4, end: 34, title: 'The beam', description: 'The Crown’s beam lances out across the water to the torus island.' },
    { id: 'H2', start: 34, end: 42, title: 'The fold', description: 'Windows go dark one by one, houses sink, the hole draws shut to a thread. Then Null closes his hand and the fold stops, the torus hanging grey with one light left.' },
    { id: 'H3', start: 42, end: 49.4, title: 'Horror', description: 'Gyroid runs to the rim. Emmy pleads with Null.' },
    { id: 'C2', start: 49.4, end: 56, title: 'North', description: 'Null rises on a violet ribbon and carries both twins north toward the glow of the Gardens.' },
    { id: 'D2', start: 56, end: 64, title: 'Resolve', description: 'Dawn over the Delta. Counting isn’t enough; the classes must multiply.' },
    { id: 'E', start: 64, end: 70, title: 'World 2 complete', description: 'Card: “World 2 complete — Chain Delta restored.”' },
  ],
  captions: [
    C(0.6, 3.6, 'Gyroid', 'It’s seized! A ball can’t be squeezed onto its skin!'),
    C(3.8, 6.8, 'Emmy Boundary', 'ℤ → 0 → ℤ can’t be the identity. The Delta stays, Null. It’s going on the Chart.'),
    C(7.6, 11.2, 'Count Null', 'Then we’ll count together, Gyroid. I brought twins.'),
    C(11.4, 14.8, 'Count Null', 'A torus. And two rings and a ball, tied at one point. Count them.'),
    C(15.4, 19, 'Gyroid', 'H₀ is ℤ. H₁ is ℤ². H₂ is ℤ… on both of them.'),
    C(19.2, 22.8, 'Emmy Boundary', 'Same groups in every degree. Our counts can’t tell them apart.'),
    C(23.2, 26.4, 'Count Null', 'Then they are the same place, and one of them is spare. I’ll fold the one you love less.'),
    C(26.6, 28.8, 'Gyroid', 'Don’t! The torus has a whole town on it!'),
    C(29, 31.3, 'Count Null', 'Your counts can’t see a town, Gyroid. The torus, then.'),
    NARR(34.4, 38, 'The torus went dark, window by window. Its hole drew shut to a thread…'),
    NARR(38.2, 41.8, '…and stopped. Null had closed his hand.'),
    C(42.6, 45.6, 'Gyroid', 'STOP! Let them go!'),
    C(45.8, 49.2, 'Emmy Boundary', 'Null, please. Whatever you lost on that road, these people didn’t take it from you.'),
    C(49.6, 53.2, 'Count Null', 'This is mercy, Emmy. In the Gardens I’ll finish it, gently. Unless you find a difference I can’t count away.'),
    NARR(53.4, 56, 'And Null went north with both twins, toward the Cup Product Gardens.'),
    C(56.4, 60.4, 'Emmy Boundary', 'Counting holes isn’t enough. Read the chains backwards and the readings multiply. His twins can’t fake that.'),
    C(60.6, 64, 'Gyroid', 'Then we read them. And that torus comes home lit, every window.'),
  ],
  title_card: { t: 64, end: 70 },
}
