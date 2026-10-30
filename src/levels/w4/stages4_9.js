/**
 * World 4 · Level 4-9 "Maps Classes" — Classing Room.
 * Hatcher §4.3, pp. 393–396 — for CW complexes X, the map [X, K(G, n)] → Hⁿ(X; G), [f] ↦ f*(ι), is a
 * bijection (Theorem 4.57), where ι ∈ Hⁿ(K(G, n); G) is the fundamental class. With K(ℤ, 1) = S¹:
 * maps S¹ → S¹ are classified by degree, and maps T² → S¹ by their windings round the two loops.
 *
 * Cup Caster (9): turn a lever to change a map.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['pull', 'read']

export const OPENING = [
  E('The Classing Room. Remember the lanterns in the Gardens? Each one was a reading: a rule that gives every loop a number, and gives a boundary $0$.'),
  E('That’s a cohomology class. And here’s the surprise of this floor: a reading is the same thing as a map into the right $K(G, n)$.'),
  G('A reading’s a map. How does a map read anything?'),
  E('$K(G, n)$ comes with one basic reading of its own, called $ι$. On the circle, $ι$ just says “how many times round”. Map $X$ in with $f$, and read $ι$ along $f$: that’s the class $f*(ι)$ on $X$.'),
  E('Slide $f$ to a homotopic $g$ and nothing changes: homotopic maps pull classes back the same way, as in the Gardens. So only $f$’s homotopy class matters.'),
  E('Cup Caster on 9. First station’s north-east; follow the NEXT ring on your map. The two commons, west and north-east of it, both have beasts. Skip them if you like.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  pull: {
    blueprint: 'Pull Back',
    arrive: [
      E('Here the target is $S¹$, which is a $K(ℤ, 1)$: its only homotopy group is $π₁ = ℤ$. Its basic reading $ι$ counts turns.'),
      E('Feed it a loop through a map of degree $d$, and every turn of the loop becomes $d$ turns of the target. So $ι$ pulls back to $dα$, where $α$ counts turns of the source. Turn the lever to make $3α$, then $−2α$.'),
    ],
    early: [E('Not this one yet. The NEXT ring on your map shows where to go.')],
    goals: [
      act('Make the maps that pull ι back to 3α, then −2α', [G('Degree $3$, then degree $−2$.'), E('Maps $S¹ → S¹$ up to homotopy are listed by degree: one for each integer. Classes in $H¹(S¹)$ are one for each integer too. Same list, read two ways.')]),
      {
        type: 'ask',
        question: 'Theorem 4.57 says $Hⁿ(X; G)$ corresponds to…',
        options: ['homotopy classes of maps $X → K(G, n)$', 'maps $K(G, n) → X$', 'loops in $X$'],
        answer: 'homotopy classes of maps $X → K(G, n)$',
        wrong: [E('Which way did the maps go? You turned a map out of the circle, into $S¹ = K(ℤ, 1)$.')],
        right: [E('Right. For a CW complex $X$, every class in $Hⁿ(X; G)$ comes from a map $X → K(G, n)$, and from only one, up to homotopy.'), E('Next station’s north-west, on the NEXT ring. A torus this time.')],
      },
    ],
  },
  read: {
    blueprint: 'Readings Are Maps',
    arrive: [
      E('A map from the torus to $S¹$. Go round the torus’ loop $a$ and the image winds round the circle some number of times; same for $b$. Those two numbers are the whole map, up to homotopy.'),
      E('Set the windings to read the class $2α − β$: $α$ reads turns round $a$, $β$ turns round $b$.'),
    ],
    early: [E('Not yet. Finish the station before this one; the NEXT ring shows which.')],
    goals: [
      act('Set the windings for the class 2α − β', [G('Twice round $a$, once backwards round $b$.'), E('So $[T², S¹] = H¹(T²) = ℤ²$. Each map to the circle is a reading of the torus, and each reading is a map.')]),
      {
        type: 'ask',
        question: 'Why does a map $T² → S¹$ give exactly two integers?',
        options: ['$H¹(T²) = ℤ²$, one for each loop', 'Because $S¹$ has two halves', 'It gives one integer'],
        answer: '$H¹(T²) = ℤ²$, one for each loop',
        wrong: [E('How many levers did you need? One per loop of the torus.')],
        right: [E('Right. The lanterns in the Gardens were maps all along.'), E('The gate’s north of here.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your maps are still set. Lash the spawn and keep going.'),
  wrongSection: (name) => E(`${name} is next. Follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Cohomology is represented by Eilenberg–MacLane spaces: [X, K(G, n)] ≅ Hⁿ(X; G) by f ↦ f*(ι). With K(ℤ, 1) = S¹, a map S¹ → S¹ of degree d is the class dα, and a map T² → S¹ is a pair of windings — a class in H¹(T²) = ℤ².',
  cite: 'Hatcher, Algebraic Topology §4.3, pp. 393–396 (Theorem 4.57).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Both readings are made. The gate’s north.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'pull') return [E('Cup Caster (9) on the lever: each click steps the degree. Stop at $3$, then keep going to $−2$.')]
  return [E('Left lever: windings round $a$. Right lever: windings round $b$. You want $2$ and $−1$.')]
}
