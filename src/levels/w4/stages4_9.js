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
  E('The Classing Room. A cohomology class is a reading. Here’s the surprise: a reading is the same thing as a map.'),
  E('$K(G, n)$ carries one special class, $ι$. Any map $f: X → K(G, n)$ pulls it back to a class $f*(ι)$ on $X$ — and every class arises exactly once, up to homotopy.'),
  G('So to read a space, you map it somewhere.'),
  E('Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  pull: {
    blueprint: 'Pull Back',
    arrive: [E('$S¹$ is a $K(ℤ, 1)$, and $ι$ is its generator. A map $S¹ → S¹$ of degree $d$ pulls $ι$ back to $dα$. Turn the lever to make $3α$, then $−2α$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Make the maps that pull ι back to 3α, then −2α', [G('Degree $3$, then degree $−2$.'), E('$[S¹, S¹] = ℤ$ by degree, and $H¹(S¹) = ℤ$. The same list, read two ways.')]),
      {
        type: 'ask',
        question: 'Theorem 4.57 says $Hⁿ(X; G)$ corresponds to…',
        options: ['homotopy classes of maps $X → K(G, n)$', 'maps $K(G, n) → X$', 'loops in $X$'],
        answer: 'homotopy classes of maps $X → K(G, n)$',
        wrong: [E('Which way did the maps go?')],
        right: [E('Right. Next floor — a torus.')],
      },
    ],
  },
  read: {
    blueprint: 'Readings Are Maps',
    arrive: [E('A map from the torus to $S¹$ winds some number of times round each of the torus’ loops. Set the windings to read the class $2α − β$.')],
    early: [E('Not yet — finish the floor below first. Follow NEXT on the map.')],
    goals: [
      act('Set the windings for the class 2α − β', [G('Twice round $a$, once backwards round $b$.'), E('$[T², S¹] = H¹(T²) = ℤ²$: a map to the circle is a cohomology class.')]),
      {
        type: 'ask',
        question: 'Why does a map $T² → S¹$ give exactly two integers?',
        options: ['$H¹(T²) = ℤ²$, one for each loop', 'Because $S¹$ has two halves', 'It gives one integer'],
        answer: '$H¹(T²) = ℤ²$, one for each loop',
        wrong: [E('How many levers did you need?')],
        right: [E('Readings are maps. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your maps stay set. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next floor is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The classes are read. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'pull') return [E('Cup Caster (9) on the lever: it steps the degree. Stop at $3$, then go on to $−2$.')]
  return [E('Left lever: windings round $a$. Right lever: windings round $b$. You want $2$ and $−1$.')]
}
