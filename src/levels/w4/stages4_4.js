/**
 * World 4 · Level 4-4 "Suspension of Disbelief" — Sling Landing.
 * Hatcher §4.2, pp. 360–364 — the suspension map πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹), [f] ↦ [Σf], and the Freudenthal
 * suspension theorem (Theorem 4.23): it is an isomorphism for i < 2n − 1 and surjective for
 * i = 2n − 1. Corollary 4.25: πₙ(Sⁿ) ≅ ℤ, detected by degree. Stem 1 settles at ℤ₂ from π₄(S³) on
 * (the value ℤ₂ is quoted from Hatcher's discussion of the stable stems).
 *
 * Suspension Sling (4): lift the map one dimension. Degree Dial (8): set a degree; mark a board tile.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['upone', 'degree', 'stable', 'climb']

export const OPENING = [
  G('No stairs. Just a shaft.'),
  E('Your Suspension Sling from the Cone Zone — I’ve upgraded it. It lifts a whole map up a dimension: $f: Sⁱ → Sⁿ$ becomes $Σf: Sⁱ⁺¹ → Sⁿ⁺¹$, coning both ends.'),
  E('Each floor of the shaft is a group $πᵢ(Sⁿ)$. Sling on 4, Degree Dial on 8.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  upone: {
    blueprint: 'Up One',
    arrive: [E('A map $f: S¹ → S¹$. Dial its degree to $3$, then sling it up to $S² → S²$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Dial degree 3, then sling the map up', [G('$Σf$ still has degree $3$.'), E('Suspension keeps the degree: it multiplies $Hₙ$ by the same number one dimension up.')]),
      {
        type: 'ask',
        question: 'What is $Σf$ for $f: S¹ → S¹$?',
        options: ['$S² → S²$, made by coning $f$ upward and downward', 'a loop in $S²$', '$S¹ → S²$'],
        answer: '$S² → S²$, made by coning $f$ upward and downward',
        wrong: [E('The Sling cones both the source and the target.')],
        right: [E('Right. Next floor.')],
      },
    ],
  },
  degree: {
    blueprint: 'Degree Is All',
    arrive: [E('Sling a degree-$k$ map all the way from $π₁(S¹)$ to $π₃(S³)$. Pick any degree you like first.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Sling the map up to π₃(S³)', [G('Same degree at every floor.'), E('Freudenthal makes these suspensions isomorphisms (onto at the bottom), so $πₙ(Sⁿ) ≅ ℤ$, and the degree tells you which element.')]),
      {
        type: 'ask',
        question: 'What is $πₙ(Sⁿ)$?',
        options: ['$ℤ$, detected by degree', '$0$', '$ℤ₂$'],
        answer: '$ℤ$, detected by degree',
        wrong: [E('Read the floors.')],
        right: [E('Corollary 4.25. Next floor.')],
      },
    ],
  },
  stable: {
    blueprint: 'The Stable Range',
    arrive: [E('A board of suspension maps. Mark every one Freudenthal guarantees to be an isomorphism: $i < 2n − 1$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Mark every guaranteed isomorphism', [G('Five of them.'), E('Further up each stem, suspension stops changing anything. That’s the stable range.')]),
      {
        type: 'ask',
        question: 'For the stem $πₙ₊ₖ(Sⁿ)$ with $k$ fixed, what happens as $n$ grows?',
        options: ['The groups stabilize once $n > k + 1$', 'They keep growing', 'They vanish'],
        answer: 'The groups stabilize once $n > k + 1$',
        wrong: [E('$i = n + k < 2n − 1$ means $n > k + 1$.')],
        right: [E('The stable homotopy groups. Last floor: climb stem 1.')],
      },
    ],
  },
  climb: {
    blueprint: 'Climb the Shaft',
    arrive: [E('The Hopf class $η$ lives in $π₃(S²) = ℤ$. Sling it up the first stem: $π₄(S³)$, $π₅(S⁴)$, $π₆(S⁵)$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Sling η up to π₆(S⁵)', [G('$ℤ$, then $ℤ₂$, $ℤ₂$, $ℤ₂$.'), E('The first step is only onto ($i = 2n − 1$); after that it’s stable. $2Ση = 0$.')]),
      {
        type: 'ask',
        question: 'The stable value of $πₙ₊₁(Sⁿ)$ is…',
        options: ['$ℤ₂$', '$ℤ$', '$0$'],
        answer: '$ℤ₂$',
        wrong: [E('Look at the top floors.')],
        right: [E('Stable ground. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your map stays slung. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'Suspension takes a map f: Sⁱ → Sⁿ to Σf: Sⁱ⁺¹ → Sⁿ⁺¹. Freudenthal: πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹) is an isomorphism for i < 2n − 1 and onto for i = 2n − 1. So πₙ(Sⁿ) ≅ ℤ by degree, and each stem πₙ₊ₖ(Sⁿ) stabilizes — the first stem at ℤ₂.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 360–364 (Theorem 4.23, Corollary 4.25).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The shaft is climbed. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'upone') return [E('Degree Dial (8) on the left lever until it reads 3; then the Sling (4) on the right lever.')]
  if (current === 'stable') return [E('Degree Dial (8): click a tile if $i < 2n − 1$, where the tile is $πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹)$.')]
  return [E('Suspension Sling (4) on the right lever, once per floor.')]
}
