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
  N('My tower has every group, Emmy. I only left out the twists. They were ornament.'),
  E('The Twist. A Postnikov tower builds a space one homotopy group at a time: floor $Xₙ$ has the space’s $π₁, …, πₙ$ and nothing higher.'),
  E('Each floor sits over the last with fibre $K(πₙ, n)$ — but the floors can be glued with a twist. The twists are cohomology classes: the k-invariants.'),
  G('A tower of Eilenberg–MacLane spaces, held together by cohomology.'),
  E('Cell Hammer on 2, Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  stack: {
    blueprint: 'Stack the Floors',
    arrive: [E('The tower of $S²$: $π₂ = ℤ$, $π₃ = ℤ$, $π₄ = ℤ₂$. Each floor $Xₙ$ starts with all of them. With the Cell Hammer, kill every group above $n$ — attaching cells does that.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Kill the groups above n on each floor', [G('$X₂$: just $π₂$. $X₃$: $π₂$ and $π₃$.'), E('$S² → Xₙ$ is an isomorphism on $πᵢ$ for $i ≤ n$, and $πᵢ(Xₙ) = 0$ above. That’s the tower.')]),
      {
        type: 'ask',
        question: 'What are the homotopy groups of $X₃$ in $S²$’s tower?',
        options: ['$π₂ = ℤ$, $π₃ = ℤ$, the rest $0$', 'The same as $S²$', 'All zero'],
        answer: '$π₂ = ℤ$, $π₃ = ℤ$, the rest $0$',
        wrong: [E('$X₃$ keeps groups up to $3$, and nothing above.')],
        right: [E('Right. Now what sits between floors.')],
      },
    ],
  },
  twist: {
    blueprint: 'The Twist',
    arrive: [E('Each step $Xₙ → Xₙ₋₁$ is a fibration. Its fibre has a single homotopy group: $πₙ$, in dimension $n$. Cup Caster: name the fibre of each step.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Name the fibre of each step', [G('$K(ℤ, 2)$, $K(ℤ, 3)$, $K(ℤ₂, 4)$.'), E('So $S²$’s tower is a twisted product of Eilenberg–MacLane spaces, one per group.')]),
      {
        type: 'ask',
        question: 'The fibre of $Xₙ → Xₙ₋₁$ is…',
        options: ['$K(πₙX, n)$', '$K(πₙX, n + 1)$', '$Sⁿ$'],
        answer: '$K(πₙX, n)$',
        wrong: [E('Read the long exact sequence: the fibre has one group, in dimension $n$.')],
        right: [E('Right. Now the twist itself.')],
      },
    ],
  },
  untwist: {
    blueprint: 'Untwisted',
    arrive: [E('$S²$ and $S³ × ℂP∞$ have the same homotopy groups — Hatcher shows this in Example 4.51. Both towers start $K(ℤ, 2)$, then $K(ℤ, 3)$. The difference is the twist $k₂$. Set each one.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Set k₂ for each tower', [G('Same groups. Different spaces.'), E('If every $kₙ$ is $0$, $X$ is the product of its $K(πₙX, n)$ — that’s $S³ × ℂP∞$. $S²$ has $H₃ = 0$, so its $k₂$ can’t be $0$.')]),
      {
        type: 'ask',
        question: 'If every k-invariant of $X$ is $0$, then $X$ is…',
        options: ['the product of the $K(πₙX, n)$', 'a sphere', 'contractible'],
        answer: 'the product of the $K(πₙX, n)$',
        wrong: [E('No twist at all — what’s left?')],
        right: [E('Right. Last floor: build one.')],
      },
    ],
  },
  rebuild: {
    blueprint: 'Rebuild',
    arrive: [E('Build $S²$’s tower again from the bottom. $X₂ = K(ℤ, 2)$. Each next floor is the homotopy fibre of the k-invariant of the one below it.')],
    early: [E('Not yet — finish the floor above first. Follow NEXT on the map.')],
    goals: [
      act('Raise the floors from the bottom up', [G('One group per floor, one twist per step.'), E('$Xₙ₊₁$ is the homotopy fibre of $kₙ: Xₙ → K(πₙ₊₁X, n + 2)$.')]),
      {
        type: 'ask',
        question: 'Where does the k-invariant $kₙ$ live?',
        options: ['$Hⁿ⁺²(Xₙ; πₙ₊₁X)$', '$πₙ(Xₙ)$', '$Hⁿ(X; ℤ)$'],
        answer: '$Hⁿ⁺²(Xₙ; πₙ₊₁X)$',
        wrong: [E('It’s a map $Xₙ → K(πₙ₊₁X, n + 2)$. What does Theorem 4.57 make that?')],
        right: [E('A map to $K(G, m)$ is a class in $Hᵐ$. The tower stands — twists and all. The gate’s open; the Crown is close.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — the floors stay up. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The tower stands. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'stack') return [E('Cell Hammer (2) on the glowing meters: on floor $Xₙ$, every group above $πₙ$ goes.')]
  if (current === 'twist') return [E('Cup Caster (9) on each slab. The fibre of $Xₙ → Xₙ₋₁$ is $K(πₙ, n)$ — the group is on the right.')]
  if (current === 'untwist') return [E('Cup Caster (9) on each pad. A product has $k₂ = 0$, and then $H₃$ is $ℤ$. Which tower can’t have that?')]
  return [E('Cell Hammer (2): raise $X₂$ first, then $X₃$, then $X₄$.')]
}
