/**
 * World 3 · Level 3-3 "Front Face, Back Face" — Lantern Rows.
 * Hatcher §3.2, pp. 206–212 — the cup product: for φ ∈ Cᵏ, ψ ∈ Cˡ,
 *   (φ ⌣ ψ)(σ) = φ(σ|[v₀ … vₖ]) · ψ(σ|[vₖ … vₖ₊ₗ]),
 * and δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ, so cocycles cup to cocycles and ⌣ is defined on cohomology.
 * The swap station shows a sign: for the torus' two 1-classes, β ⌣ α = −α ⌣ β (graded
 * commutativity is Theorem 3.11, p. 215 — flagged as a look ahead).
 *
 * Cup Caster (9): cast on an edge or a triangle; flip the lever choices; press "cast".
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['front_back', 'cocycle_products', 'swap', 'light_row']

export const OPENING = [
  E('The Lantern Rows. Readings can be multiplied. Two 1-readings make a 2-reading — the cup product.'),
  E('On a triangle $[v₀v₁v₂]$: $(φ ⌣ ψ)[v₀v₁v₂] = φ[v₀v₁] · ψ[v₁v₂]$. The first reading takes the front face, the second takes the back face.'),
  G('Front face, back face. And the Caster does the multiplying?'),
  E('The Cup Caster, on 9. First row is just ahead.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  front_back: {
    blueprint: 'Front and Back',
    arrive: [
      E('One triangle with two readings on its edges: $φ$ in gold, $ψ$ in blue.'),
      E('Cast on $φ$’s front face first, then on $ψ$’s back face. The lantern shows the product.'),
    ],
    early: [E('Not yet — finish the earlier row first. Follow NEXT on the map.')],
    goals: [
      act('Cast φ’s front face, then ψ’s back face', [G('$2 × 3 = 6$.'), E('$φ$ only looks at $[v₀v₁]$ and $ψ$ only at $[v₁v₂]$. The edge $[v₀v₂]$ isn’t used at all.')]),
      {
        type: 'ask',
        question: 'For a 1-cochain $φ$ and a 1-cochain $ψ$, $(φ ⌣ ψ)[v₀v₁v₂]$ equals…',
        options: ['$φ[v₀v₁] · ψ[v₁v₂]$', '$φ[v₀v₂] · ψ[v₀v₂]$', '$φ[v₁v₂] + ψ[v₀v₁]$'],
        answer: '$φ[v₀v₁] · ψ[v₁v₂]$',
        wrong: [E('Front face for the first reading, back face for the second — and multiply.')],
        right: [E('Right. Next row is south-east.')],
      },
    ],
  },
  cocycle_products: {
    blueprint: 'Cocycle Products',
    arrive: [
      E('The torus’ square of two triangles, from the Tile Yard. $α$ reads $1$ on each copy of $a$; $β$ reads $1$ on each copy of $b$; both read $1$ on the diagonal $c$, which makes them cocycles.'),
      E('Cast $α ⌣ β$ on both triangles. The top lantern adds them up over the whole torus — the lower triangle counts $+$, the upper one $−$, the way they’re oriented.'),
    ],
    early: [E('Not yet — finish the earlier row first. Follow NEXT on the map.')],
    goals: [
      act('Cast α ⌣ β on both triangles', [G('$1$ and $0$ — the top lantern reads $1$!'), E('$α ⌣ β$ is a 2-cocycle that reads $1$ on the whole torus: it generates $H²(T)$.')]),
      {
        type: 'ask',
        question: 'Why is the cup of two cocycles a cocycle?',
        options: ['$δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ$, and both $δ$s are $0$', 'Products are always zero', 'Because the torus is flat'],
        answer: '$δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ$, and both $δ$s are $0$',
        wrong: [E('Hatcher’s Lemma 3.6: a product rule for $δ$.')],
        right: [E('So ⌣ passes to cohomology. Next row is south-west.')],
      },
    ],
  },
  swap: {
    blueprint: 'The Swap',
    arrive: [
      E('Same torus — but cast $β ⌣ α$: $β$ on the front faces, $α$ on the back.'),
    ],
    early: [E('Not yet — finish the earlier row first. Follow NEXT on the map.')],
    goals: [
      act('Cast β ⌣ α on both triangles', [G('$0$ and $1$ — and the total is $−1$. The light flipped!'), E('$β ⌣ α = −α ⌣ β$. For two 1-classes, order changes the sign.')]),
      {
        type: 'ask',
        question: 'What’s $α ⌣ α$ on the torus, then?',
        options: ['$0$', '$1$', '$2$'],
        answer: '$0$',
        wrong: [E('Swapping $α$ with itself changes nothing — but it should flip the sign. So $α ⌣ α = −α ⌣ α$.')],
        right: [E('Right — in general $α ⌣ β = (−1)ᵏˡ β ⌣ α$ (Theorem 3.11, a page ahead). Last row is further on.')],
      },
    ],
  },
  light_row: {
    blueprint: 'Light the Row',
    arrive: [
      E('Choose the front reading and the back reading from $α$ and $β$ with the two levers, then press “cast”. Make the top lantern read $+1$.'),
    ],
    early: [E('Not yet — finish the earlier row first. Follow NEXT on the map.')],
    goals: [
      act('Choose readings so the torus lantern reads +1', [G('$α$ in front, $β$ behind.'), E('$α ⌣ β$ generates $H²(T; ℤ)$. The product structure is part of what cohomology knows.')]),
      {
        type: 'ask',
        question: 'Which of these is a generator of $H²(T)$?',
        options: ['$α ⌣ β$', '$α ⌣ α$', '$β ⌣ β$'],
        answer: '$α ⌣ β$',
        wrong: [E('Two of these read $0$ on the torus.')],
        right: [E('The gate’s open — on to the south.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your lanterns stay lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next row is ${name} — follow NEXT on the map.`),
}

export const DEFINITION = {
  text: 'The cup product multiplies cochains face by face: (φ ⌣ ψ)(σ) = φ(front face of σ) · ψ(back face of σ). Since δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ, it is defined on cohomology. On the torus α ⌣ β generates H², while α ⌣ α = 0 and β ⌣ α = −α ⌣ β.',
  cite: 'Hatcher, Algebraic Topology §3.2, pp. 206–212 (Lemma 3.6); graded commutativity, Theorem 3.11, p. 215.',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet moths first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every row is lit. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'front_back') return [E('Cup Caster (9). Click the edge $[v₀v₁]$ first — φ’s front face — then $[v₁v₂]$.')]
  if (current === 'light_row') return [E('Click a lever to switch it between $α$ and $β$, then click “cast”.')]
  return [E('Cup Caster (9), then click inside each of the two triangles.')]
}
