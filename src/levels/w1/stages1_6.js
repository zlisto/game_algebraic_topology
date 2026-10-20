/**
 * World 1 · Level 6 "Free Word Play" — Free-Word Forge.
 * Hatcher §1.2: π₁ of a wedge of two circles is the free group F₂ on a, b (Example 1.21);
 * reduced words; ab ≠ ba (seen with covering spaces in 1-8).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['laps_letters', 'cancel_deck', 'order_deck', 'patrol_yard']

export const OPENING = [
  N('Every lap you run here leaves a letter. Spell them wrong and the patrol will know.'),
  E('Two loops meet at each beacon here — a figure-eight. The orange petal is $a$, the blue petal is $b$; run one backwards and you get its inverse. First deck ahead.'),
]

/**
 * Goal types:
 *   lap track dir     — complete one lap on that track (+1 forward, −1 backward)
 *   tape tokens       — reduced tape must match parseTokens(tokens)
 *   reduce from to    — player tape must reduce to match `to` after walking cancel pairs
 *   ask               — multiple choice
 *   patrol            — lash the ribbon patrol in reverse word order
 *   clasp             — click the beacon with the Van Kampen Clasp to join tapes (demo)
 */
export const STATIONS = {
  laps_letters: {
    blueprint: 'Laps are letters',
    arrive: [
      E('The orange petal is the loop $a$, the blue one is $b$. Leave the beacon, run a petal all the way round, and come back — each lap prints a letter on the tape over your head.'),
      E('Run $a$ along its arrows, then run it again against them — that’s $a⁻¹$. Watch the pair cancel.'),
    ],
    goals: [
      { type: 'lap', track: 0, dir: 1, done: [E('Orange lap: $a$ on the tape.')] },
      { type: 'lap', track: 0, dir: -1, done: [G('Snap — opposites side by side cancel. Empty tape.'), E('That’s free reduction. Nothing else cancels unless it’s an adjacent inverse.')] },
      { type: 'lap', track: 1, dir: 1, done: [E('Blue lap: $b$. You’re spelling words with your feet. On to Cancel — north along the causeway.')] },
    ],
    early: [E('Laps Are Letters starts at the beacon deck — just ahead.')],
  },
  cancel_deck: {
    blueprint: 'Cancel',
    arrive: [
      E('Here, letters only cancel when a letter sits right next to its own inverse.'),
      E('First spell $a b a⁻¹ b⁻¹$ — the Commutator’s march: $a$, then $b$, then $a$ backwards, then $b$ backwards.'),
    ],
    goals: [
      {
        type: 'tape',
        tokens: 'a b a- b-',
        done: [G('Four letters — and nothing cancels.'), E('No letter in $a b a⁻¹ b⁻¹$ sits next to its own inverse, so it’s already reduced. It’s a real loop on the figure-eight, not standing still.')],
      },
      {
        type: 'reduce',
        from: 'a b a-',
        to: '',
        start: [E('Now the tape reads $a b a⁻¹$. Cancel it all the way down to nothing. Each lap you add sits at the end — so which lap cancels the last letter first?')],
        done: [
          G('$a$, then $b⁻¹$, then $a⁻¹$ — gone!'),
          E('To undo a word, run its letters in reverse order, each one backwards: $(a b a⁻¹)⁻¹ = a b⁻¹ a⁻¹$. East: Order Matters.'),
        ] },
    ],
    early: [E('The Cancel deck is north of the first beacon.')],
  },
  order_deck: {
    blueprint: 'Order matters',
    arrive: [
      E('Run $a$ then $b$. Then the tape clears, and you run $b$ then $a$.'),
    ],
    goals: [
      { type: 'tape', tokens: 'a b', done: [E('Tape reads $a b$.')] },
      { type: 'tape', tokens: 'b a', afterClear: true, done: [E('Tape reads $b a$. Different reduced word — different loop class.')] },
      {
        type: 'ask',
        question: 'Can a homotopy rel the beacon turn a then b into b then a?',
        options: ['Yes — slide one into the other', 'No — not on this bouquet'],
        answer: 'No — not on this bouquet',
        right: [E('Right: $a b$ and $b a$ are different reduced words, so they’re different loops — in the free group $F₂$, $ab ≠ ba$. Unlike the torus! At Under Cover I’ll show you why with covering spaces.')],
        wrong: [E('They’re different reduced words, so they’re different loops here. Try again.')],
      },
    ],
    early: [E('Order Matters is east of Cancel.')],
  },
  patrol_yard: {
    blueprint: 'The patrol',
    arrive: [
      E('The Commutator’s ribbon patrol. It carries the word $a b a⁻¹ b⁻¹$ and marches it round the petals.'),
    ],
    goals: [
      {
        type: 'ask',
        question: 'Does the patrol’s word $a b a⁻¹ b⁻¹$ cancel down to nothing?',
        options: ['Yes — the a’s and b’s cancel out', 'No — no letter sits next to its own inverse'],
        answer: 'No — no letter sits next to its own inverse',
        right: [E('Right — so it can’t be talked away. Unravel it from the end instead: lash it on its last letter first — $b⁻¹$, then $a⁻¹$, then $b$, then $a$. Like running its inverse. Here it comes!')],
        wrong: [E('Only neighbours that are inverses cancel. $a$ and $a⁻¹$ are two apart in $a b a⁻¹ b⁻¹$ — with $b$ between them, they can’t cancel.')],
      },
      {
        type: 'patrol',
        word: 'a b a- b-',
        wave: true,
        done: [G('Last letter first — one lash per letter. Patrol unravelled.'), E('That’s the free group on two letters. Glue Works is next — walk out through the north gate when you’re ready.')],
      },
    ],
    early: [E('The patrol yard is the last deck — north of the Cancel deck.')],
  },
}

export const DEFINITION16 = {
  text: 'The fundamental group of a wedge of two circles is the free group F₂ on two letters a and b: every loop is a reduced word in a, b, a⁻¹, b⁻¹, where only a letter next to its own inverse cancels. Different reduced words are different loops, so ab ≠ ba.',
  cite: 'Hatcher, Algebraic Topology, §1.2: free products and free groups (pp. 41–43), Example 1.21 (p. 43).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
}

export const HINTS16 = {
  knockout: E('Hearts back — your tape and progress stay. Lash the spawn, then keep walking laps from the beacon.'),
  far: E('Walk closer to the beacon hub — laps start and end there.'),
  wrongLash: E('Wrong letter in the reverse order — wait until the patrol is on that lap, then lash.'),
  abandon: E('Go all the way round the loop and back to the beacon.'),
  
}

export function emmyAdvice16(state) {
  const { current, done, goal, tape, here, enemies, patrolStep, waveOn } = state
  if (!current) return [E('The gate north is open — walk out to finish.')]
  if (here?.site !== current) return [E(`Head to ${state.siteName || 'the next deck'} — follow the map’s NEXT ring.`)]
  if (!goal) return [E('Keep exploring — something’s still ahead on this deck.')]
  if (enemies?.[current] > 0) {
    if (goal.type === 'patrol') return [E(`Patrol still up — lash in reverse word order (step ${patrolStep || 0} of 4).`)]
    return [E('Lash the spawn (1) before you work the loops.')]
  }
  if (goal.type === 'lap') return [E(`Run the ${goal.track ? 'blue petal ($b$)' : 'orange petal ($a$)'} all the way round ${goal.dir < 0 ? 'against' : 'along'} its arrows, from the beacon and back.`)]
  if (goal.type === 'tape') return [E(`Your tape should read ${goal.tokens.replace(/-/g, '⁻¹ ').replace(/\s+/g, ' ').trim()} when reduced.`)]
  if (goal.type === 'reduce') return [E('Each new lap lands at the end of the tape. To cancel the last letter, run that same petal the other way. Keep going until the tape is empty.')]
  if (goal.type === 'ask') return [E('Think about reduced words: only a letter next to its own inverse cancels.')]
  if (goal.type === 'patrol' && waveOn) return [E('Wait for the patrol to march in — then reverse-order lashes.')]
  return [E('Walk loops from the beacon; watch the tape above you.')]
}
