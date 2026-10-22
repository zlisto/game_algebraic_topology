/**
 * World 0 · Level 2 "Bend, Don't Break" — Tidewarp Flats. Words for the four shrines
 * (Tide Line, Hold the Posts, The Pools, Null's Snap), the homotopy rules panel and
 * the definition card. Hatcher, Algebraic Topology, Chapter 0, p. 3.
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const ZONE_ORDER = ['tide_line', 'hold_posts', 'the_pools', 'nulls_snap']

/** The homotopy rules, checked live on the ribbon in front of a shrine. */
export const RULES02 = [
  { id: 'whole', label: 'Ribbon unbroken', math: 'each fₜ : I → X continuous' },
  { id: 'posts', label: 'Posts never move', math: 'F(a, t) = F(a, 0) for a ∈ A' },
  { id: 'land', label: 'Never crosses water', math: 'F(s, t) ∈ X for all s, t' },
  { id: 'target', label: 'Ends as the shrine’s path', math: 'f₁ = g' },
]

export const OPENING = [
  E('Tidewarp Flats. Out here the tide reshapes every path, every hour — slowly, one moment flowing into the next. That’s how this land changes without dying.'),
  G('And Null? He was here. I can see grey on the far pools.'),
  E('He’s waiting at the big pool to the north-east. First, four shrines — each one leaves a Tide Hourglass when it’s solved, and the Warp Portal at the bridgehead needs all four.'),
  E('Head for the first shrine, just east of the causeway. Watch your step: the pools are deep, and there’s something long and twisted in the water by the crossing.'),
]

export const ZONES = {
  tide_line: {
    arrive: [
      E('Watch the ribbon between those two posts. The tide is bending it — moment by moment.'),
      E('Each moment is one shape: a map from the ribbon into the flats. The whole movie of them, one frame flowing into the next, is a homotopy.'),
      E('Here — the Tide Glass. Press 3 to hold it, then scrub time with Z and C (or the mouse wheel). While you hold it, the camera stays put.'),
      E('Find the moments when the ribbon touches each marker stone. Each moment is one frame, fₜ.'),
      E('If any of this gets slippery, the “? How it works” button up top replays the lesson.'),
    ],
    early: [E('The Tide Line shrine is back by the causeway — start there.')],
    done: [
      E('Three moments, one movie. Every frame sits right next to the one before — no jumps. That’s what makes it a homotopy and not just a pile of pictures.'),
      G('And those two posts never moved.'),
      E('Right. A homotopy rel the posts. And look — the shrine’s left you something: a Tide Hourglass, the whole movie turning over inside it. Take it.'),
      E('Next shrine: north-east, past the stakes.'),
    ],
  },
  hold_posts: {
    arrive: [
      E('This shrine wants the ribbon reshaped — but its two end posts stay put the whole time.'),
      E('Walk up to the ribbon, switch to the Spool (2) and click to grab it. Walk to pull. Click again to let go.'),
      E('Let go beside a stake and the ribbon hooks on. A stake is a post too: it pins that point. Match the faint gold path.'),
    ],
    early: [E('Finish the Tide Line first — it’s just by the causeway.')],
    spawn: [E('The shrine won’t listen while Null’s spawn are crawling over it. Lash them first (1).')],
    targets: [
      {
        intro: [],
        done: [E('There’s your homotopy, replayed by the Tide Glass. The ends never moved: a homotopy rel endpoints.')],
      },
      {
        intro: [
          E('Now a zigzag: the first stake by the shrine, then the far one — in that order. To unhook the ribbon, grab it right where it’s pinned.'),
          G('Something’s moving in the water…'),
          E('Snappers! They clip ribbons, and a clipped ribbon isn’t a continuous map any more. Lash them, then re-tie the cut with the Spool.'),
        ],
        done: [E('Posts held, ribbon whole, every frame flowing into the next. That’s a homotopy $rel A$ — $A$ being the points of the ribbon pinned to posts and stakes.')],
      },
    ],
    done: [E('On to the pool shrine, east across the flats.')],
  },
  the_pools: {
    arrive: [
      E('A tide pool. The ribbon can’t cross water: every frame of the movie has to stay on the flats.'),
      G('That thing in the water — it’s a ribbon too. One twist in it.'),
      E('A Möbius Prowler. Cut it down the middle and it doesn’t fall in two — it gets twice as long, and twice as fast. Two lashes, and keep moving.'),
      E('Two pedestals, two paths — one around the near side of the pool, one around the far side. Try the near side first.'),
    ],
    early: [E('Not yet — the stakes shrine comes first.')],
    spawn: [E('Clear the spawn around the pool first.')],
    targets: [
      {
        intro: [],
        done: [E('That one slid right around. Now the far-side pedestal — see if you can get the ribbon over there.')],
      },
    ],
    ask: {
      question: 'Can the ribbon reach the far-side path?',
      keep: 'Keep trying',
      no: 'No slide can get there',
      wrong: [E('Go on, then — the pedestal’s still waiting.')],
      right: [
        E('I think you’re right. Around the end post, over and back… it always comes out wrapped the wrong way round the pool.'),
        E('But “I couldn’t find one” isn’t a proof. To prove no slide exists, we have to count how a path winds around the pool — and that tool is in the next world.'),
        G('Then I’ll remember this pool.'),
      ],
    },
    done: [E('Null’s close. Look — violet light over the big pool to the north-east.')],
  },
  nulls_snap: {
    arrive: [
      N('Such patience, courier. Bending, pinning, re-tying — just like her. And for what? Every hour the tide takes something, and every hour you bend it back.'),
      N('Let me end it. Watch: I deform the whole flats onto my post in a single snap. Every space retracts to a point.'),
      E('Sending everything to one point in one go — that’s a retraction, sure. A deformation has to be the whole movie, and every frame has to stay on the flats.'),
      E('His movie breaks somewhere. Scrub it with the Tide Glass (3, then Z / C) and mark the frame where it tears: press E or the button.'),
    ],
    early: [E('That’s Null’s pool. We’re not ready for him yet.')],
    movies: [
      {
        name: 'The jump',
        mark: 'Mark the jump',
        hint: 'Scrub slowly. Watch the faint ghost frames either side of the ribbon: find the moment they’re suddenly far apart.',
        right: [E('There! Look at the ghosts either side of that frame — one moment the ribbon’s here, the next it’s over there. That’s a cut in time, not a homotopy.')],
        then: [
          N('A trick of timing. Very well — no jumps this time. If the whole flats deform onto my post, every path on them goes along for the ride.'),
          N('Take this loop: it starts at my post and runs once around my pool. Watch it shrink, smoothly, onto the post.'),
          E('Here’s the catch. If the flats really deformed onto his post, this loop would be carried along and shrink onto the post — and it would have to stay on the flats the whole time.'),
          E('Scrub his movie and mark the first frame where the loop leaves the flats — where it touches the water.'),
        ],
      },
      {
        name: 'The shrinking loop',
        mark: 'Mark where it leaves the flats',
        hint: 'Scrub until the loop first touches the pool — the wet stretch glows violet.',
        right: [
          E('There. His loop could only shrink by crossing the water — off the flats. His movie can’t do it, and I’d bet no movie can: the pool is a hole. But proving that no movie exists needs a number we don’t have yet. That’s the next world’s job.'),
          N('Clever. Cleverness doesn’t save anyone. Spawn — tear.'),
        ],
      },
    ],
    wrong: [E('That frame flows smoothly into the next — look at the faint ghosts on either side. Keep scrubbing.')],
    wave: [E('Snappers, spawn — and that pale thing is a Projective Specter. One lash only flips it into its mirror image — it has no inside to turn out. Hit it again, fast, before it rights itself!')],
    done: [
      N('Bend your little ribbons, then. But that loop round my pool — you will never shrink it. And you will never prove why.'),
      E('About the shrinking, he’s right: a place’s holes are exactly what stop a loop. About the proving, he’s wrong. Give me one more world.'),
      E('The tide’s going out. Gather your hourglasses — the Warp Portal at the bridgehead will take us on to Mirror Shoals.'),
    ],
  },
}

export const HINTS02 = {
  knockout: E('Hearts back — back to the last shrine you cleared. Watch for Elixirs when the bigger ones burst.'),
  cut: E('The ribbon’s clipped — a map with a break in it isn’t continuous. Lash the Snapper, then click the cut with the Spool to re-tie it.'),
  stretch: E('That’s as far as the ribbon stretches.'),
  side: E('Close — but it goes around the pool the other way from the shrine’s path.'),
  stakes: E('The shrine’s path hooks onto its stakes in order — check which stakes the ribbon is on.'),
}

export const DEFINITION02 = {
  text: 'A homotopy is a family of maps fₜ : X → Y, one for each t in I = [0, 1], such that F(x, t) = fₜ(x) is continuous on X × I. It is a homotopy relative to A ⊂ X when fₜ does not change on A as t varies. A deformation retraction of X onto A is a homotopy rel A from the identity of X to a retraction onto A — the whole movie, not just the single map at the end.',
  cite: 'Paraphrasing Allen Hatcher, Algebraic Topology, Chapter 0, pp. 2–3.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}
