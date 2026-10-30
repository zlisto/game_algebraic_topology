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
  G('No stairs. Just a shaft. Of course.'),
  E('Your Suspension Sling from the Cone Zone. I’ve upgraded it. It used to lift a space; now it lifts a whole map.'),
  E('Suspending a sphere means coning it up to a north pole and down to a south pole. Do that to $Sⁿ$ and you get $Sⁿ⁺¹$, with the old sphere as its equator.'),
  E('And a map $f: Sⁱ → Sⁿ$ becomes $Σf: Sⁱ⁺¹ → Sⁿ⁺¹$: it does $f$ on every latitude and sends pole to pole.'),
  G('You built the first Sling for Ansel, didn’t you.'),
  E('…For his roads. Sling’s on 4, Degree Dial on 8. First station’s north-west; follow the NEXT ring. Three commons off it, east and north-east. One has beasts.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  upone: {
    blueprint: 'Up One',
    arrive: [E('A map $f: S¹ → S¹$. Its degree is how many times it wraps the circle round. Dial the degree to $3$, then sling it up to a map $S² → S²$.')],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Dial degree 3, then sling the map up', [G('$Σf$ still has degree $3$.'), E('Every latitude wraps three times, so the whole sphere does. Suspension keeps the degree.')]),
      {
        type: 'ask',
        question: 'What is $Σf$ for $f: S¹ → S¹$?',
        options: ['$S² → S²$, made by coning $f$ upward and downward', 'a loop in $S²$', '$S¹ → S²$'],
        answer: '$S² → S²$, made by coning $f$ upward and downward',
        wrong: [E('The Sling cones both sides: the circle you map from and the circle you map to.')],
        right: [E('Right. Next station’s east, on the NEXT ring.')],
      },
    ],
  },
  degree: {
    blueprint: 'Degree Is All',
    arrive: [E('Pick any degree, then sling the map all the way up: from $π₁(S¹)$ to $π₂(S²)$ to $π₃(S³)$.')],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Sling the map up to π₃(S³)', [G('Same degree all the way up.'), E('Freudenthal’s theorem says each of these lifts is onto at the bottom step and an isomorphism from there on. So nothing new appears and nothing is lost: every $πₙ(Sⁿ)$ is $ℤ$, and the degree tells you which element.')]),
      {
        type: 'ask',
        question: 'What is $πₙ(Sⁿ)$?',
        options: ['$ℤ$, detected by degree', '$0$', '$ℤ₂$'],
        answer: '$ℤ$, detected by degree',
        wrong: [E('Read what the Dial showed at each level.')],
        right: [E('Corollary 4.25. Next station’s west, on the NEXT ring.')],
      },
    ],
  },
  stable: {
    blueprint: 'The Stable Range',
    arrive: [
      E('Freudenthal in plain words: if the sphere you map from is less than about twice the dimension of the target, lifting the map one dimension loses nothing and adds nothing.'),
      E('Exactly: $πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹)$ is an isomorphism when $i < 2n − 1$. Mark every tile on this board where that holds.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Mark every guaranteed isomorphism', [G('Five of them.'), E('Now follow one stem: $πₙ₊ₖ(Sⁿ)$, with the gap $k$ fixed. Climb it high enough and suspension stops changing anything. That’s the stable range.')]),
      {
        type: 'ask',
        question: 'For the stem $πₙ₊ₖ(Sⁿ)$ with $k$ fixed, what happens as $n$ grows?',
        options: ['The groups stabilize once $n > k + 1$', 'They keep growing', 'They vanish'],
        answer: 'The groups stabilize once $n > k + 1$',
        wrong: [E('Put $i = n + k$ into $i < 2n − 1$. You get $n > k + 1$.')],
        right: [E('Those settled values are the stable homotopy groups. Last station’s north-east, on the NEXT ring.')],
      },
    ],
  },
  climb: {
    blueprint: 'Climb the Shaft',
    arrive: [E('The Hopf map $η$ is the generator of $π₃(S²) = ℤ$. It’s in stem $1$: the sphere you map from is one dimension up. Sling it up that stem: $π₄(S³)$, $π₅(S⁴)$, $π₆(S⁵)$.')],
    early: [E('Not yet. Check the NEXT ring on your map.')],
    goals: [
      act('Sling η up to π₆(S⁵)', [G('$ℤ$, then $ℤ₂$, $ℤ₂$, $ℤ₂$.'), E('The first lift is only onto, since $i = 2n − 1$ there, so $ℤ$ gets folded down to $ℤ₂$: $2Ση = 0$. After that it’s in the stable range and stays $ℤ₂$.')]),
      {
        type: 'ask',
        question: 'The stable value of $πₙ₊₁(Sⁿ)$ is…',
        options: ['$ℤ₂$', '$ℤ$', '$0$'],
        answer: '$ℤ₂$',
        wrong: [E('Look at the top of the shaft.')],
        right: [E('Stable ground, up there. The gate’s open, north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back, and your map stays slung. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Suspension takes a map f: Sⁱ → Sⁿ to Σf: Sⁱ⁺¹ → Sⁿ⁺¹. Freudenthal: πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹) is an isomorphism for i < 2n − 1 and onto for i = 2n − 1. So πₙ(Sⁿ) ≅ ℤ by degree, and each stem πₙ₊ₖ(Sⁿ) stabilizes — the first stem at ℤ₂.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 360–364 (Theorem 4.23, Corollary 4.25).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first. That’s 1.')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The shaft’s climbed. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it comes up.')]
  if (current === 'upone') return [E('Degree Dial (8) on the left lever until it reads 3. Then the Sling (4) on the right lever.')]
  if (current === 'stable') return [E('Degree Dial (8): click a tile if $i < 2n − 1$, where the tile is $πᵢ(Sⁿ) → πᵢ₊₁(Sⁿ⁺¹)$.')]
  return [E('Suspension Sling (4) on the right lever, once for each step up.')]
}
