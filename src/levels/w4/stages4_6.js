/**
 * World 4 · Level 4-6 "Hurewicz" — Hurewicz Hall.
 * Hatcher §4.2, pp. 366–371 — the Hurewicz map h: πₙ(X) → Hₙ(X), and the Hurewicz theorem
 * (Theorem 4.32): if X is (n−1)-connected with n ≥ 2, then H̃ᵢ(X) = 0 for i < n and h is an
 * isomorphism on πₙ; for n = 1, h: π₁(X) → H₁(X) is onto with kernel the commutator subgroup
 * (Theorem 2A.1). Above the first non-zero degree there is no such guarantee: π₃(S²) = ℤ, H₃(S²) = 0.
 *
 * Degree Dial (8): read a pair of meters; test a bridge; name a space's first non-zero degree.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['meters', 'first', 'dim1', 'beyond']

export const OPENING = [
  E('Hurewicz Hall. Every map of a sphere $Sⁿ → X$ pushes forward the fundamental class of $Sⁿ$: that gives a homomorphism $h: πₙ(X) → Hₙ(X)$.'),
  G('A bridge from homotopy to homology.'),
  E('And Hurewicz tells you when the bridge holds. Degree Dial on 8.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  meters: {
    blueprint: 'Two Meters',
    arrive: [E('$S²$. Homotopy meters on the left, homology on the right. Read each pair with the Dial.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Read all three pairs of meters', [G('They agree at $π₂$ and $H₂$ — and disagree at degree 3.'), E('$π₃(S²) = ℤ$ but $H₃(S²) = 0$. Homotopy and homology really are different.')]),
      {
        type: 'ask',
        question: 'Where do the two columns of $S²$ first agree on a non-zero group?',
        options: ['Degree 2', 'Degree 1', 'Degree 3'],
        answer: 'Degree 2',
        wrong: [E('Find the lowest row with something non-zero.')],
        right: [E('Right. Next floor — that’s no coincidence.')],
      },
    ],
  },
  first: {
    blueprint: 'First Nonzero',
    arrive: [E('Three spaces: $S³$, $S² ∨ S²$, $ℂP²$. For each, click the row of its first non-zero homotopy group — the Dial will test the bridge there.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Find the first non-zero degree of all three spaces', [G('Every first bridge holds.'), E('That’s Hurewicz: for an $(n−1)$-connected space, $n ≥ 2$, $πₙ ≅ Hₙ$.')]),
      {
        type: 'ask',
        question: 'For an $(n−1)$-connected space with $n ≥ 2$, Hurewicz says…',
        options: ['$H̃ᵢ = 0$ for $i < n$ and $πₙ ≅ Hₙ$', '$πᵢ ≅ Hᵢ$ for every $i$', '$πₙ = 0$'],
        answer: '$H̃ᵢ = 0$ for $i < n$ and $πₙ ≅ Hₙ$',
        wrong: [E('Only the first bridge is guaranteed.')],
        right: [E('Theorem 4.32. Next floor — dimension one.')],
      },
    ],
  },
  dim1: {
    blueprint: 'Dimension One',
    arrive: [E('The figure-eight: $π₁$ is the free group on $a$ and $b$; $H₁ = ℤ²$. Test the bridge at degree 1.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Test the bridge at degree 1', [G('It’s onto, but $aba⁻¹b⁻¹$ goes to $0$.'), E('In degree 1 the bridge is abelianization — Forget the Order, back in World 2.')]),
      {
        type: 'ask',
        question: 'For $n = 1$, $h: π₁ → H₁$ is…',
        options: ['onto, with kernel the commutator subgroup', 'always an isomorphism', 'zero'],
        answer: 'onto, with kernel the commutator subgroup',
        wrong: [E('Commutators vanish in $H₁$.')],
        right: [E('Right. Last floor.')],
      },
    ],
  },
  beyond: {
    blueprint: 'Beyond the First',
    arrive: [E('$S²$ again. Test every bridge — degree 1, 2 and 3.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Test all three bridges', [G('The third one fails.'), E('Hurewicz only promises the first non-zero degree. Above it, homotopy can be much bigger than homology.')]),
      {
        type: 'ask',
        question: 'Does Hurewicz say anything about $π₃(S²) → H₃(S²)$?',
        options: ['No — degree 3 is above the first non-zero group', 'Yes, it’s an isomorphism', 'Yes, it’s zero'],
        answer: 'No — degree 3 is above the first non-zero group',
        wrong: [E('$S²$ is 1-connected, so $n = 2$.')],
        right: [E('The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your bridges stay tested. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'The Hurewicz map sends a map Sⁿ → X to the image of the fundamental class: h: πₙ(X) → Hₙ(X). If X is (n−1)-connected, n ≥ 2, then H̃ᵢ(X) = 0 for i < n and h is an isomorphism in degree n; in degree 1 it is abelianization. Above the first non-zero degree there is no such promise.',
  cite: 'Hatcher, Algebraic Topology §4.2, pp. 366–371 (Theorem 4.32).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The Hall is crossed. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'meters') return [E('Degree Dial (8): click each row’s meters.')]
  if (current === 'first') return [E('$S³$ has nothing until degree 3. $S² ∨ S²$ and $ℂP²$ start at degree 2. Click that row in each column pair.')]
  return [E('Degree Dial (8): click the post in the middle of a row to test its bridge.')]
}
