/**
 * World 2 intro, "Chain Delta" (replaces the shared videos.json world-2-intro for screen 'world2').
 * Picks up from the World 1 castle outro: the Delta Sphere is folded, Null fled into the Delta, and
 * Emmy named the tool — homology. Dawn on the Bastion's north gate; the Delta laid out below.
 */

const C = (t, end, speaker, text, extra = {}) => {
  const portrait = { 'Count Null': 'count-null', Gyroid: 'gyroid', 'Emmy Boundary': 'emmy-boundary' }[speaker]
  return { t, end, speaker, ...(portrait ? { portrait } : {}), text, ...extra }
}
const NARR = (t, end, text) => ({ t, end, speaker: 'Narrator', hold: false, text })

export const WORLD2_INTRO = {
  id: 'world-2-intro-v2',
  title: 'Chain Delta',
  plays: 'After castle-1-outro (Your Number Reads Zero), before World 2 · Level 1 (Tile and Error)',
  world: 2,
  status: 'scripted',
  story_start: 0,
  story_end: 58,
  pace: [[0, null, 0.8]],
  synopsis:
    'Dawn on the Bastion’s north gate. Where the Delta Sphere stood, a violet whirl still turns. Gyroid and Emmy look out over Chain Delta: the Tile Yard, the Dynamo Gate, Cell Block, the Mod Mill, the Abelian Ford, and far off the Retractor in its chains. Count Null rises over it, huge, and lets the grey creep out across the water: every island is only triangles, glued, and every triangle Gyroid misses, he folds. Emmy sends them west to the Tile Yard.',
  scenes: [
    { id: 'A', start: 0, end: 5.4, title: 'The whirl', description: 'Low over the violet whirl where the sphere stood; the camera rises to the north gate, Gyroid and Emmy at its parapet.' },
    { id: 'B', start: 5.4, end: 14.5, title: 'The vantage', description: 'Front two-shot, then over their shoulders: Chain Delta at dawn, triangle-tiled wetlands and islands strung on causeways.' },
    { id: 'C', start: 14.5, end: 30.6, title: 'The Delta', description: 'Flyover: the Tile Yard folding its square into a torus, the Dynamo Gate with its wound band, Cell Block, the Mod Mill, the Abelian Ford — then up to the Retractor straining in its chains.' },
    { id: 'D', start: 30.6, end: 46.2, title: 'Null', description: 'Count Null rises over the Retractor, huge. The Crown’s beam touches the whirl and the grey creeps out across the water; then he is gone.' },
    { id: 'E', start: 46.2, end: 52, title: 'Ready', description: 'Emmy points west. Gyroid steps to the edge.' },
    { id: 'F', start: 52, end: 58, title: 'Title', description: 'Wide over the Delta: World 2 · Chain Delta.' },
  ],
  captions: [
    NARR(0.8, 5.0, 'Dawn came up grey over Chain Delta. Where the sphere had stood, a violet whirl still turned on the water.'),
    C(5.6, 8.6, 'Gyroid', 'Ten thousand lights. He folded them while I watched.'),
    C(8.9, 12.6, 'Emmy Boundary', 'Then we bring them back. Look out there, Gyroid. Every island in the Delta is built from triangles.'),
    C(12.8, 14.4, 'Gyroid', 'Triangles I can count.'),
    C(14.6, 18.4, 'Emmy Boundary', 'The Tile Yard. Glue triangles edge to edge, arrows matching, and they fold up into whole worlds.'),
    C(18.8, 21.2, 'Gyroid', 'And the gate with the rope wound round it?'),
    C(21.4, 25.0, 'Emmy Boundary', 'The Dynamo Gate. It counts how many times a map wraps a sphere round itself. That’s where we prove the sphere had a hole.'),
    NARR(25.4, 29.4, 'Cell Block. The Mod Mill. The Abelian Ford. Every place in the Delta was a sum of pieces, and every piece could be counted.'),
    C(29.6, 31.0, 'Gyroid', 'And that thing in chains?'),
    C(31.8, 35.0, 'Count Null', 'Good morning, Gyroid. Did you sleep? I didn’t. I was tidying the Delta.'),
    C(35.4, 39.4, 'Count Null', 'All these little islands. Only triangles, glued at the edges. Unglue them gently, and there is nothing left to grieve.'),
    C(39.6, 41.4, 'Gyroid', 'Touch one more island and I’ll—'),
    C(41.6, 45.4, 'Count Null', 'Count? Then count, courier. Every triangle you miss, I fold. And everyone standing on it.'),
    C(46.4, 49.6, 'Emmy Boundary', 'Then we don’t miss one. The Tile Yard first, to the west.'),
    C(49.8, 51.6, 'Gyroid', 'Then let’s roll.'),
  ],
  title_card: { t: 52, end: 58 },
}
