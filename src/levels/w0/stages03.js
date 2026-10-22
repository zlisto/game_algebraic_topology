/**
 * World 0 · Level 3 "Same Shape, Different Look" — Mirror Shoals. Words for the five
 * sites and the definition card. Hatcher, Algebraic Topology, Chapter 0: homotopy
 * equivalence and contractible spaces (pp. 3–4); two spaces are homotopy equivalent
 * exactly when a third space contains both as deformation retracts (Corollary 0.21).
 *
 * The level's proofs are deformation retractions (the 0-1 slide): a reef that slides
 * onto spine A and also onto spine B shows A and B are the same shape.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const SITE_ORDER = ['solid_shoal', 'ring_reef', 'twin_mirror', 'dumbbell', 'mirror_gate']

export const OPENING = [
  E('Mirror Shoals. Null’s Crown can only fold what nobody has proved has a hole. So today we prove which reefs are the same shape, and which might not be.'),
  E('Every reef you prove leaves a Mirror Lens behind. Collect all five: past the Mirror Gate there’s a Warp Portal, and it won’t open without them.'),
  E('Watch for the mirror spawn: one is real, one is a reflection. Projective spawn need two lashes in quick succession; Klein spawn, one lash and then a quick pair.'),
  E('Start at Solid Shoal, up the causeway to the west.'),
]

export const SITES03 = {
  solid_shoal: {
    arrive: [
      E('Solid Shoal — not a single hole in it. See that loop pinned to the stakes?'),
      E('Unhook it with the Spool (2): grab the ribbon right where it’s pinned, step off the stake, click to let go. Do both stakes.'),
    ],
    loopDone: [
      E('It shrank right onto its post. On a reef with no holes, every loop does.'),
      E('Now the whole reef. Lay a spine that’s just one point: click the Spool once on the beacon, click again to stop — then Slide.'),
    ],
    done: [
      E('The whole shoal slid onto a single point. A place that deforms onto a point is contractible — it’s the same shape as a point.'),
      E('There’s your first Mirror Lens, over by the post. Walk through it.'),
      G('And the ring next door?'),
      E('Try its loop. West, across the little causeway.'),
    ],
    early: [E('Solid Shoal first — up the causeway to the west.')],
  },
  ring_reef: {
    arrive: [E('Ring Reef. Same trick: unhook every stake and see if its loop shrinks.')],
    done: [
      E('It catches on the hole. I can’t find any slide that shrinks it… but “I couldn’t find one” isn’t a proof. Proving none exists means counting how the loop winds — that’s World 1.'),
      G('So a ring isn’t the same shape as a point. Probably.'),
      E('Probably. Hold onto that. It still left a Mirror Lens by the post — grab it, then across the channel to Twin Mirror.'),
    ],
    early: [E('Finish Solid Shoal first.')],
  },
  twin_mirror: {
    arrive: [
      E('Twin Mirror: two lagoons, like the reef we saved on Retract Reef.'),
      E('First give it a figure-eight spine — around both holes, crossing in the middle, through the three beacons. Then Slide.'),
    ],
    spines: [
      [E('A good deformation onto a figure-eight. Let it grow back…'), E('Now give the same reef a theta spine: one loop around everything, with a bar across the middle, through the new beacons.')],
      [
        E('Two different spines — and one reef slides onto both. So the figure-eight and the theta are the same shape.'),
        E('Here’s why. Squash the eight into the reef and slide onto the theta: that’s a map one way. Slide the theta onto the eight: that’s the way back.'),
        E('Go there and back again and every point just slides through the reef to where it started. Maps both ways, round trips deformable to the identity: a homotopy equivalence.'),
        E('North-west, across the channel: the Dumbbell.'),
      ],
    ],
    early: [E('Not yet — Ring Reef first.')],
  },
  dumbbell: {
    arrive: [
      N('Same shape, same shape — what does it matter, courier? Any loop will do. Give my dumbbell a ring for a spine.'),
      E('Beacons around the left lagoon. Fine — let’s see what happens.'),
    ],
    doomed: [
      E('It leaks: the right lagoon has no loop around it, so its water floods the slide. Every hole needs a loop of spine around it.'),
      N('Details. People drown in details. And a hole with no loop around it? My Crown folds it flat.'),
      E('Add what’s missing: a loop around the right lagoon and a bar joining the two — through the new beacons.'),
    ],
    spines: [
      [],
      [
        E('A barbell. Figure-eight, theta, barbell — all spines of two-hole reefs. All the same shape.'),
        E('And a ring around only one hole won’t do, so “any loop” is wrong. The Mirror Gate is just across the channel.'),
      ],
    ],
    early: [E('Not yet — Twin Mirror first.')],
  },
  mirror_gate: {
    arrive: [
      E('The Mirror Gate. Its reef has two holes in odd places, and there are no beacons this time.'),
      E('Clear its guards, then give it any spine that works. The gate will judge.'),
    ],
    done: [
      E('Look at the gate: it’s weighing four shapes against what you built. Figure-eight… theta… barbell… all lit.'),
      G('The ring stays dark.'),
      E('Because we haven’t proved it different — not yet. But the gate is satisfied.'),
      E('…There’s the Foundry. I know that light.'),
      G('You’ve been here before.'),
      E('A long time ago. With him. The Warp Portal’s at the end of that causeway. Bring every Mirror Lens and it’ll take us there.'),
    ],
    early: [E('The gate can wait — finish the Dumbbell first.')],
  },
}

export const HINTS03 = {
  knockout: E('Shake it off — back to the last reef you proved.'),
  spawn: E('Clear Null’s spawn off this reef first — the real ones, not their reflections.'),
  mirror: E('Mirror spawn come in pairs: one real, one reflection. The reflection flickers and its eye is hollow — lash the solid one.'),
}

export const DEFINITION03 = {
  text: 'A map f : X → Y is a homotopy equivalence if there is a map g : Y → X with g∘f ≃ 1 and f∘g ≃ 1; then X and Y have the same homotopy type. A space with the homotopy type of a point is contractible. Two spaces are homotopy equivalent exactly when some third space contains both of them as deformation retracts.',
  cite: 'Paraphrasing Allen Hatcher, Algebraic Topology, Chapter 0, pp. 3–4 and Corollary 0.21 (p. 16).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}
