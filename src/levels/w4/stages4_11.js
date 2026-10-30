/**
 * World 4 · Level 4-11 "A Twist in the Tower".
 * Hatcher §4.3 pp. 410–412 — a Postnikov tower ··· → X₃ → X₂ → X₁ for X: X → Xₙ is an isomorphism on
 * πᵢ for i ≤ n and πᵢ(Xₙ) = 0 for i > n; each Xₙ → Xₙ₋₁ is a fibration with fibre K(πₙX, n). When the
 * fibrations are principal (Theorem 4.69: iff π₁ acts trivially), Xₙ₊₁ is the homotopy fibre of a
 * k-invariant kₙ ∈ Hⁿ⁺²(Xₙ; πₙ₊₁X); all kₙ = 0 means X is the product of the K(πₙX, n).
 * S² and S³ × ℂP∞ have the same homotopy groups but are not homotopy equivalent (p. 348, Example 4.51).
 *
 * Cell Hammer (2): kill groups, raise floors. Cup Caster (9): set fibres and k-invariants.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['stack', 'twist', 'untwist', 'rebuild']

export const OPENING = [
  N('My tower has every group, Emmy. Every one. I only left out the twists. Nobody will miss them.'),
  N('You used to say a thing that looks the same is the same, if you measure it carefully enough.'),
  E('I said you had to measure everything. You always stopped at the part you liked.'),
  G('He remembers what you used to say.'),
  E('He remembers all of it. That’s the trouble. Come on.'),
  E('The Twist. A Postnikov tower builds a space one homotopy group at a time. Floor $Xₙ$ keeps the space’s $π₁$ up to $πₙ$ and has nothing higher.'),
  E('Each floor sits on the one below, and the new group arrives as a $K(πₙ, n)$. But a floor can be set down with a twist. The twist is a cohomology class: the k-invariant.'),
  G('So the groups are the bricks, and the k-invariants say how they’re mortared.'),
  E('Cell Hammer on 2, Cup Caster on 9. First station’s north-west; follow the NEXT ring. Commons hang north-east and east of it; the east one has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  stack: {
    blueprint: 'Stack the Floors',
    arrive: [
      E('This is $S²$’s tower. $S²$ has $π₂ = ℤ$, $π₃ = ℤ$, $π₄ = ℤ₂$, and more above. Each floor $Xₙ$ starts out with all of them.'),
      E('Floor $Xₙ$ should keep only the groups up to $πₙ$. Attaching cells kills a group, as in One Group. Cell Hammer every group above $n$, floor by floor.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Kill the groups above n on each floor', [G('$X₂$: just $π₂$. $X₃$: $π₂$ and $π₃$.'), E('The map $S² → Xₙ$ is an isomorphism on $πᵢ$ for $i ≤ n$, and $Xₙ$ has nothing above. Stack them and that’s the tower.')]),
      {
        type: 'ask',
        question: 'What are the homotopy groups of $X₃$ in $S²$’s tower?',
        options: ['$π₂ = ℤ$, $π₃ = ℤ$, the rest $0$', 'The same as $S²$', 'All zero'],
        answer: '$π₂ = ℤ$, $π₃ = ℤ$, the rest $0$',
        wrong: [E('$X₃$ keeps groups up to $3$, and nothing above.')],
        right: [E('Right. Now, what sits between the floors? Next station’s north-west, on the NEXT ring.')],
      },
    ],
  },
  twist: {
    blueprint: 'The Twist',
    arrive: [
      E('Each step down, $Xₙ → Xₙ₋₁$, is a fibration. Going from $Xₙ₋₁$ up to $Xₙ$ adds exactly one group, $πₙ$, so the fibre over a point has just that one group, in dimension $n$.'),
      E('A space with one group, $πₙ = G$, is a $K(G, n)$. Cup Caster: name the fibre of each step.'),
    ],
    early: [E('Not yet. Finish the station before this one first.')],
    goals: [
      act('Name the fibre of each step', [G('$K(ℤ, 2)$, $K(ℤ, 3)$, $K(ℤ₂, 4)$.'), E('So $S²$’s tower is Eilenberg–MacLane spaces stacked one per group. The question is how they’re stacked.')]),
      {
        type: 'ask',
        question: 'The fibre of $Xₙ → Xₙ₋₁$ is…',
        options: ['$K(πₙX, n)$', '$K(πₙX, n + 1)$', '$Sⁿ$'],
        answer: '$K(πₙX, n)$',
        wrong: [E('Read the long exact sequence: the fibre has one group, in dimension $n$.')],
        right: [E('Right. Now the twist itself. Next station’s north, on the NEXT ring.')],
      },
    ],
  },
  untwist: {
    blueprint: 'Untwisted',
    arrive: [
      E('Two towers. $S²$, and $S³ × ℂP∞$. They have the same homotopy groups in every degree: Hatcher shows it in Example 4.51. Both towers start $K(ℤ, 2)$, then $K(ℤ, 3)$.'),
      E('The k-invariant $k₂$ is the twist that sets the $K(ℤ, 3)$ floor down on $X₂$. If $k₂ = 0$, $X₃$ is simply the product $K(ℤ, 2) × K(ℤ, 3)$. Set $k₂$ for each tower.'),
    ],
    early: [E('Not this one yet. Two stations come first; follow the NEXT ring.')],
    goals: [
      act('Set k₂ for each tower', [G('Same groups. Different spaces.'), E('$S³ × ℂP∞$ has $k₂ = 0$: its $X₃$ is the product, and a product $K(ℤ, 2) × K(ℤ, 3)$ has $H₃ = ℤ$.'), E('But $S² → X₃$ keeps homology through degree $3$, and $H₃(S²) = 0$. So $S²$’s $X₃$ can’t be the product. Its $k₂$ isn’t $0$.')]),
      {
        type: 'ask',
        question: 'If every k-invariant of $X$ is $0$, then $X$ is…',
        options: ['the product of the $K(πₙX, n)$', 'a sphere', 'contractible'],
        answer: 'the product of the $K(πₙX, n)$',
        wrong: [E('No twist at any step. Every floor just sits on the last one. What’s left?')],
        right: [E('Right. And Null wants a world with every twist set to zero.'), E('Last station’s north-east, on the NEXT ring. We build one.')],
      },
    ],
  },
  rebuild: {
    blueprint: 'Rebuild',
    arrive: [
      E('Build $S²$’s tower again, from the bottom. $X₂ = K(ℤ, 2)$. The twist $k₂$ is a map from $X₂$ into $K(ℤ, 4)$, and $X₃$ is built over $X₂$ as that map’s homotopy fibre.'),
      E('Every floor goes up the same way: take the floor below, and its k-invariant, and build the next one over it.'),
    ],
    early: [E('Not yet. Three stations come first; the NEXT ring shows where.')],
    goals: [
      act('Raise the floors from the bottom up', [G('One group per floor. One twist per step.'), E('$Xₙ₊₁$ is the homotopy fibre of $kₙ: Xₙ → K(πₙ₊₁X, n + 2)$.')]),
      {
        type: 'ask',
        question: 'Where does the k-invariant $kₙ$ live?',
        options: ['$Hⁿ⁺²(Xₙ; πₙ₊₁X)$', '$πₙ(Xₙ)$', '$Hⁿ(X; ℤ)$'],
        answer: '$Hⁿ⁺²(Xₙ; πₙ₊₁X)$',
        wrong: [E('It’s a map $Xₙ → K(πₙ₊₁X, n + 2)$. What did the Classing Room say a map into a $K(G, m)$ is?')],
        right: [E('Right. A map into $K(G, m)$ is a class in $Hᵐ$. So the twists are cohomology, and they can be read.'), G('Then he can’t call them ornament.'), E('The gate’s north. The Crown’s close now.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. The floors are still up. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'A Postnikov tower builds X from Eilenberg–MacLane spaces: Xₙ has πᵢ(X) for i ≤ n and nothing above, and Xₙ → Xₙ₋₁ is a fibration with fibre K(πₙX, n). The k-invariants kₙ ∈ Hⁿ⁺²(Xₙ; πₙ₊₁X) record the twisting; all zero means X is a product. S² and S³ × ℂP∞ share their groups but not their twists.',
  cite: 'Hatcher, Algebraic Topology §4.3, pp. 410–412; p. 348 and Example 4.51.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The tower’s standing, twists and all. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'stack') return [E('Cell Hammer (2) on the glowing meters: on floor $Xₙ$, every group above $πₙ$ goes.')]
  if (current === 'twist') return [E('Cup Caster (9) on each slab. The fibre of $Xₙ → Xₙ₋₁$ is $K(πₙ, n)$; the group is on the right.')]
  if (current === 'untwist') return [E('Cup Caster (9) on each pad. A product has $k₂ = 0$, and then $H₃$ is $ℤ$. Which tower can’t have that?')]
  return [E('Cell Hammer (2): raise $X₂$ first, then $X₃$, then $X₄$.')]
}
