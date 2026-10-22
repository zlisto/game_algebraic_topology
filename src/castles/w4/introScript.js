/** The castle-4 intro's script (same shape as a videos.json entry), kept beside the castle. */
export const CASTLE4_INTRO = {
  id: 'castle-4-intro-final',
  title: 'The Null Crown',
  plays: 'Before castle4, after 4-12 (the Obstruction Course): the march on the Crown',
  world: 4,
  status: 'scripted',
  story_start: 0,
  story_end: 45,
  pace: [[0, null, 0.9]],
  synopsis:
    'The summit of the Postnikov Spire. The Null Crown is pulling the whole Winding Way up toward one point. Gyroid and Emmy march up a stair of Chart slabs to face Null at full power. When his shards dive at them, the Commutator, discarded at the Counterfeit Station, cuts them down and stands with the courier.',
  scenes: [
    { id: 'A', start: 0, end: 6.5, title: 'The Crown', description: 'Wide from below: the Spire’s floors stepping up, twisting seams between them; the Crown blazing at the top, its beam drawing violet threads up from the islands of the Way.' },
    { id: 'B', start: 6.5, end: 14, title: 'The march', description: 'Gyroid and Emmy run up a stair of gold Chart slabs that light under their feet, the sea falling away.' },
    { id: 'C', start: 14, end: 23, title: 'Null at full power', description: 'They step onto the summit. Null on his dais, the huge Crown turning overhead with its five facets.' },
    { id: 'D', start: 23, end: 28.4, title: 'The shards', description: 'Null rises; the Crown flares; shards orbit him, then dive at the pair.' },
    { id: 'E', start: 28.4, end: 38.6, title: 'The Commutator', description: 'A violet ribbon streaks down; the Commutator lands between them and the shards and cuts them apart, then lowers his blade toward Null.' },
    { id: 'F', start: 38.6, end: 45, title: 'Title', description: 'The three of them facing Null and the Crown. Title card: World 4 · Castle — The Null Crown.' },
  ],
  captions: [
    { t: 0.6, end: 6.0, speaker: 'Narrator', hold: false, text: 'The top of the Postnikov Spire. Every floor a group, every seam a twist. And over them all, pulling the whole Winding Way toward one point: the Null Crown.' },
    { t: 7.0, end: 10.2, speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: 'Every place we proved is on the Chart, Gyroid. Whatever he folds, the Chart holds it.' },
    { t: 10.4, end: 13.6, speaker: 'Gyroid', portrait: 'gyroid', text: 'Then let’s go and take that Crown off him.' },
    { t: 14.6, end: 18.4, speaker: 'Count Null', portrait: 'count-null', text: 'Emmy. You came all the way up. Like the Foundry: you, me, and a problem to make simple.' },
    { t: 18.6, end: 22.6, speaker: 'Count Null', portrait: 'count-null', text: 'Groups are enough. Give me the numbers and I’ll rebuild every place you love. Smooth. Quiet. Not one twist left to fall through.' },
    { t: 23.2, end: 25.4, speaker: 'Gyroid', portrait: 'gyroid', text: 'Your tower fell at the twists, Null. We were there.' },
    { t: 25.6, end: 27.6, speaker: 'Count Null', portrait: 'count-null', text: 'Then I’ll fold the Way myself, and there will be no one left to check.' },
    { t: 29.2, end: 32.6, speaker: 'The Commutator', portrait: 'commutator', text: 'Master. You threw me away for one failed station. I’ve kept order since. My own.' },
    { t: 32.8, end: 35.8, speaker: 'Count Null', portrait: 'count-null', text: 'Marshal. Courier. Emmy. All of you, then. It’s kinder, together.' },
    { t: 36.0, end: 38.6, speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text: 'We started this together, Null. I’m going to finish it.' },
  ],
  title_card: { t: 39.5, end: 44.5 },
}
