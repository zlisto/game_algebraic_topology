/**
 * World 2 · Level 2-9 "Mod Squad" — Mod Mill.
 * Hatcher §2.2 pp. 153–155 — homology with coefficients, Hₙ(X; G): chains with coefficients in G.
 * With G = ℤ₂ every sign disappears, so orientation stops mattering: Hₙ(ℝPⁿ; ℤ₂) ≅ ℤ₂ in each
 * dimension up to n. The orientability test in the last station — a closed connected n-manifold M
 * has Hₙ(M; ℤ) ≅ ℤ exactly when it is orientable, while Hₙ(M; ℤ₂) ≅ ℤ₂ always — is Hatcher's
 * Theorem 3.26 (§3.3, p. 236), flagged here as a look ahead.
 *
 * Boundary Blade (7): set a ℤ₂ coefficient (0 ↔ 1); attach a cell; move a surface between bins.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })
const N = (text) => ({ speaker: 'Count Null', portrait: 'count-null', text })

export const STATION_ORDER = ['even', 'rp2', 'frogs', 'sort']

export const OPENING = [
  N('Even and odd. Two numbers, Gyroid. When I’m finished there will only be one, and nobody will ever have to wait to see which.'),
  E('The Mod Mill. It grinds every number down to even or odd: $0$ or $1$, with $1 + 1 = 0$. Chains with numbers like that give homology with coefficients in $ℤ₂$.'),
  G('So no minus signs any more?'),
  E('$−1 = 1$ in $ℤ₂$. Which way round a triangle goes stops mattering. And that changes which holes you can see.'),
  E('Everything here runs on the Blade (7). First mill is north-west; follow the NEXT ring. Three commons hang off it, east and north-east; one has beasts.'),
]

export const STATIONS = {
  even: {
    blueprint: 'Even or Odd',
    arrive: [
      E('The fan from Cancel Marsh. Remember: one triangle ran round the other way, and it needed $−1$ before the inside edges would cancel.'),
      E('Now each click sets a triangle to $1$, or back to $0$. Leave only the rim.'),
    ],
    early: [E('Not this mill yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Make the boundary just the rim, with ℤ₂ coefficients', done: [G('All four at 1, and done!'), E('Each inside edge belongs to two triangles, so it gets $1 + 1 = 0$. In $ℤ₂$ you never have to check which way a triangle goes.')] },
      {
        type: 'ask',
        question: 'Why didn’t $[v₀v₃v₄]$ need a minus sign this time?',
        options: ['In $ℤ₂$, $−1 = 1$', 'It was oriented the same way as the others', 'The rim was different'],
        answer: 'In $ℤ₂$, $−1 = 1$',
        wrong: [E('It still runs round the other way. What is $−1$ mod 2?')],
        right: [E('Right. Next mill is east, on the NEXT ring.')],
      },
    ],
  },
  rp2: {
    blueprint: 'The Projective Plane',
    arrive: [
      E('$ℝP²$ again: one $1$-cell $a$, and a disk whose rim runs round $a$ twice. Over the integers, $d₂ = 2a$, and that made $H₂ = 0$.'),
      E('Set the coefficient mod 2 with the Blade, then attach the cell.'),
    ],
    early: [E('Not this mill yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Set d₂ mod 2 with the Blade (7), then click “attach e²”', done: [G('Two is zero!'), E('$d₂ = 0$ mod 2. So the disk has no boundary left, it’s a cycle: $H₂(ℝP²; ℤ₂) ≅ ℤ₂$. And $a$ is now a cycle nothing kills: $H₁(ℝP²; ℤ₂) ≅ ℤ₂$.')] },
      {
        type: 'ask',
        question: 'Over $ℤ$, $H₂(ℝP²) = 0$. Over $ℤ₂$ it is $ℤ₂$. Why the difference?',
        options: ['The disk’s boundary $2a$ is $0$ mod 2, so the disk becomes a cycle', 'ℤ₂ adds a new cell', 'ℝP² changes shape'],
        answer: 'The disk’s boundary $2a$ is $0$ mod 2, so the disk becomes a cycle',
        wrong: [E('Same cells, same rim. Only the arithmetic changed.')],
        right: [E('Exactly. Same place, same cells, different numbers, and a hole shows up. Next mill is west, on the NEXT ring.')],
      },
    ],
  },
  frogs: {
    blueprint: 'Flippers Lose',
    arrive: [
      E('The flippers’ trick is turning you round, like walking the Klein bottle and coming back mirrored. Over $ℤ$, that turn is what makes the rim $2b$ instead of $0$, and kills $H₂$.'),
      E('Read the Klein bottle’s $d₂$ mod 2, both letters, and attach the cell.'),
    ],
    early: [E('Not this mill yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Set both letters mod 2, then attach the cell', done: [G('Zero and zero. The flip doesn’t matter!'), E('$H₂(K; ℤ₂) ≅ ℤ₂$. Mod 2, nobody can tell which way round you are, so a flip can’t cancel anything.')] },
      {
        type: 'ask',
        question: 'What is $H₂(K; ℤ₂)$ for the Klein bottle?',
        options: ['$ℤ₂$', '$0$', '$ℤ$'],
        answer: '$ℤ₂$',
        wrong: [E('With $d₂ = 0$, the $2$-cell is a cycle, with coefficients in $ℤ₂$.')],
        right: [E('Right. Last mill is north-east, on the NEXT ring.')],
      },
    ],
  },
  sort: {
    blueprint: 'Sort the Surfaces',
    arrive: [
      E('Four closed surfaces. Orientable means you can’t walk round it and come back mirrored. Orientable to the left bin, non-orientable to the right. Click one with the Blade to move it.'),
      E('A test that’s a step past this chapter, Hatcher proves it in Chapter 3: a closed surface is orientable exactly when its $H₂$ with $ℤ$ numbers is $ℤ$. With $ℤ₂$, every one has $H₂ = ℤ₂$.'),
    ],
    early: [E('Not this mill yet. Finish the earlier one first; NEXT on the map shows which.')],
    goals: [
      { type: 'action', hint: 'Sort all four surfaces into the right bins', done: [G('Sphere and torus on the left. ℝP² and the Klein bottle on the right.'), E('$H₂(S²) = H₂(T) = ℤ$; $H₂(ℝP²) = H₂(K) = 0$.')] },
      {
        type: 'ask',
        question: 'Why can’t $ℤ₂$ coefficients tell these surfaces apart by $H₂$?',
        options: ['Mod 2, every closed surface has $H₂ = ℤ₂$', 'They all have the same number of cells', '$ℤ₂$ only sees $H₀$'],
        answer: 'Mod 2, every closed surface has $H₂ = ℤ₂$',
        wrong: [E('You found $H₂ = ℤ₂$ for $ℝP²$ and the Klein bottle mod 2. What about the sphere and the torus?')],
        right: [E('Mod 2 can’t see which way round you’re walking. That’s how it found $H₂$ in $ℝP²$, and it’s why it can’t sort these four. The gate’s north of this mill.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your settings are still there. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next mill is ${name}. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Homology with coefficients in G uses chains Σ gᵢσᵢ with gᵢ ∈ G. Over ℤ₂, −1 = 1, so orientation drops out: ℝP² and the Klein bottle get H₂ = ℤ₂. Over ℤ, H₂ of a closed surface is ℤ exactly when it is orientable (Theorem 3.26, Chapter 3).',
  cite: 'Hatcher, Algebraic Topology §2.2, pp. 153–155 (homology with coefficients); orientability via Theorem 3.26, §3.3 p. 236.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Let me finish this first.')]
  if (enemies?.[here.site]) return [E('Spawn first. Lash it (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every mill’s done. The gate is north of the last one.')]
  }
  if (goal?.type === 'ask') return [E('The question’s waiting for you. Answer it when it opens.')]
  if (current === 'even') return [E('Mod 2, every triangle you switch on adds $1$ to each of its edges. Each inside edge needs an even total.')]
  if (current === 'rp2') return [E('The rim runs round $a$ twice. Twice, mod 2, is…')]
  if (current === 'frogs') return [E('$a$ goes forward then back: $0$. $b$ goes the same way twice: $2$. Now reduce mod 2.')]
  return [E('A Möbius band hides inside $ℝP²$ and inside the Klein bottle. Those are the non-orientable ones.')]
}
