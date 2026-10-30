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
  N('Here your roads get spelled out in letters, Gyroid. Spell carefully. My marshal reads everything.'),
  E('Two loops meet at each beacon here: a figure-eight. The orange petal is $a$, the blue petal is $b$, and running one backwards gives its inverse. First deck’s ahead.'),
  E('Each deck you finish leaves a Free Loop: a little wire figure-eight, its two petals arrowed $a$ and $b$ round one gold point. Collect all four and the Warp Portal at the north end opens.'),
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
      E('The orange petal is the loop $a$, the blue one is $b$. Leave the beacon, run a petal all the way round, and come back. Each lap prints a letter on the tape over your head.'),
      E('Run $a$ along its arrows, then run it again against them. That second lap is $a⁻¹$. Watch what happens to the pair.'),
    ],
    goals: [
      { type: 'lap', track: 0, dir: 1, done: [E('Orange lap: $a$ on the tape.')] },
      { type: 'lap', track: 0, dir: -1, done: [G('Gone. They cancelled each other out. Empty tape.'), E('That’s free reduction: a letter right beside its own inverse cancels. Nothing else ever does.')] },
      { type: 'lap', track: 1, dir: 1, done: [E('Blue lap: $b$. You’re spelling words with your feet. On to Cancel, north along the causeway.')] },
    ],
    early: [E('Laps Are Letters starts at the beacon deck, just ahead.')],
  },
  cancel_deck: {
    blueprint: 'Cancel',
    arrive: [
      E('Remember, a letter only cancels when it sits right next to its own inverse.'),
      E('First spell $a b a⁻¹ b⁻¹$, the Commutator’s march: $a$, then $b$, then $a$ backwards, then $b$ backwards.'),
    ],
    goals: [
      {
        type: 'tape',
        tokens: 'a b a- b-',
        done: [G('Four letters, and nothing cancels.'), E('No letter in $a b a⁻¹ b⁻¹$ sits next to its own inverse, so it’s already reduced. It’s a real loop on the figure-eight, not standing still in disguise.')],
      },
      {
        type: 'reduce',
        from: 'a b a-',
        to: '',
        start: [E('Now the tape reads $a b a⁻¹$. Cancel it all the way down to nothing. Each lap you add lands at the end of the tape, so which lap cancels that last letter?')],
        done: [
          G('$a$, then $b⁻¹$, then $a⁻¹$. Gone!'),
          E('To undo a word, run its letters in reverse order, each one backwards: $(a b a⁻¹)⁻¹ = a b⁻¹ a⁻¹$. East now, to Order Matters.'),
        ] },
    ],
    early: [E('The Cancel deck is north of the first beacon.')],
  },
  order_deck: {
    blueprint: 'Order matters',
    arrive: [
      E('Run $a$ then $b$. Then the tape clears, and you run $b$ then $a$.'),
      E('A Möbius prowler is loose on this deck. Two lashes (1), but the first cuts it down the middle into one band twice as long, and that runs twice as fast. Strike again quickly.'),
    ],
    goals: [
      { type: 'tape', tokens: 'a b', done: [E('Tape reads $a b$.')] },
      { type: 'tape', tokens: 'b a', afterClear: true, done: [E('Tape reads $b a$. A different reduced word, so a different loop.')] },
      {
        type: 'ask',
        question: 'Can a homotopy rel the beacon turn a then b into b then a?',
        options: ['Yes — slide one into the other', 'No — not on this bouquet'],
        answer: 'No — not on this bouquet',
        right: [E('Right. $a b$ and $b a$ are different reduced words, so they’re different loops: in the free group $F₂$, $ab ≠ ba$. Not like the torus at all. At Under Cover I’ll show you how to prove it with a covering space.')],
        wrong: [E('They’re different reduced words, so here they’re different loops. Try again.')],
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
        right: [E('Right, so you can’t talk it away. Take it apart from the end instead: lash its last letter first, $b⁻¹$, then $a⁻¹$, then $b$, then $a$. It’s like running its inverse. Here it comes!')],
        wrong: [E('Only neighbours that are inverses cancel. In $a b a⁻¹ b⁻¹$, $a$ and $a⁻¹$ have $b$ between them, so they can’t.')],
      },
      {
        type: 'patrol',
        word: 'a b a- b-',
        wave: true,
        done: [G('Last letter first, one lash per letter. Patrol’s unravelled.'), E('That’s the free group on two letters, $F₂$. Glue Works is next: gather every Free Loop, then walk into the Warp Portal past the north gate.')],
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
  knockout: E('Hearts back. Your tape and progress stay. Lash the spawn, then keep walking laps from the beacon.'),
  far: E('Get closer to the beacon hub. Laps start and end there.'),
  wrongLash: E('Wrong letter. Go in reverse order: wait until the patrol is on that lap, then lash.'),
  abandon: E('Go all the way round the loop and back to the beacon.'),
  
}

export function emmyAdvice16(state) {
  const { current, done, goal, tape, here, enemies, patrolStep, waveOn } = state
  if (!current) return [E('The gate north is open. Gather every Free Loop, then walk into the Warp Portal. I’m right behind you.')]
  if (here?.site !== current)
    return [E(`${state.siteName || 'The next deck'} is next. Follow the map’s NEXT ring. The commons on the way are thick with Null’s beasts. Möbius prowlers run twice as fast once cut, so strike twice. I’m right behind you.`)]
  if (!goal) return [E('Keep exploring. Something’s still ahead on this deck.')]
  if (enemies?.[current] > 0) {
    if (goal.type === 'patrol') return [E(`The patrol’s still up. Lash it in reverse word order (step ${patrolStep || 0} of 4).`)]
    return [E('Lash the spawn (1) before you work the loops.')]
  }
  if (goal.type === 'lap') return [E(`Run the ${goal.track ? 'blue petal ($b$)' : 'orange petal ($a$)'} all the way round ${goal.dir < 0 ? 'against' : 'along'} its arrows, from the beacon and back.`)]
  if (goal.type === 'tape') return [E(`Your tape should read ${goal.tokens.replace(/-/g, '⁻¹ ').replace(/\s+/g, ' ').trim()} when reduced.`)]
  if (goal.type === 'reduce') return [E('Each new lap lands at the end of the tape. To cancel the last letter, run that same petal the other way. Keep going until the tape is empty.')]
  if (goal.type === 'ask') return [E('Think about reduced words: only a letter next to its own inverse cancels.')]
  if (goal.type === 'patrol' && waveOn) return [E('Wait for the patrol to march in, then lash it in reverse order.')]
  return [E('Walk loops from the beacon; watch the tape above you.')]
}
