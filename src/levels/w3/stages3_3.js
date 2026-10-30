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
  E('The Lantern Rows. This is what the twins can’t hide from. Two edge readings can be multiplied, and the answer is a reading on triangles: the cup product.'),
  E('Take a triangle $[v₀v₁v₂]$. Its front edge is $[v₀v₁]$, its back edge is $[v₁v₂]$. Then $(φ ⌣ ψ)[v₀v₁v₂] = φ[v₀v₁] · ψ[v₁v₂]$: first reading on the front, second on the back, multiply.'),
  G('Front edge, back edge, multiply. And the third edge?'),
  E('Doesn’t get a say. The Cup Caster, on 9, does the multiplying for you. First row: follow the NEXT ring, west.'),
  E('Watch for the Cup Spider in the rows. It’s quick while it’s degree 1, and if two legs land on you it cups itself up to degree 2.'),
  E('Switch stance with G between every strike. The sign matters here: the same stance twice and the web snaps back at you.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  front_back: {
    blueprint: 'Front and Back',
    arrive: [
      E('One triangle, two readings on its edges: $φ$ in gold, $ψ$ in blue.'),
      E('Cast on $φ$’s front edge first, then on $ψ$’s back edge. The lantern shows the product.'),
    ],
    early: [E('Not this row yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast φ’s front face, then ψ’s back face', [G('$2 × 3 = 6$.'), E('$φ$ only looked at $[v₀v₁]$ and $ψ$ only at $[v₁v₂]$. The long edge $[v₀v₂]$ never came into it.')]),
      {
        type: 'ask',
        question: 'For a 1-cochain $φ$ and a 1-cochain $ψ$, $(φ ⌣ ψ)[v₀v₁v₂]$ equals…',
        options: ['$φ[v₀v₁] · ψ[v₁v₂]$', '$φ[v₀v₂] · ψ[v₀v₂]$', '$φ[v₁v₂] + ψ[v₀v₁]$'],
        answer: '$φ[v₀v₁] · ψ[v₁v₂]$',
        wrong: [E('Front edge for the first reading, back edge for the second, and multiply.')],
        right: [E('Right. Next row: follow the NEXT ring, north.')],
      },
    ],
  },
  cocycle_products: {
    blueprint: 'Cocycle Products',
    arrive: [
      E('The torus as a square cut into two triangles, like the Tile Yard. $α$ reads $1$ on both copies of $a$, $β$ reads $1$ on both copies of $b$, and both read $1$ on the diagonal $c$.'),
      E('Why the diagonal? Round each triangle the edges go $a + b − c$, so $α$ gives $1 + 0 − 1 = 0$. Both readings balance everywhere: they’re cocycles, the torus’ two loop classes.'),
      E('Cast $α ⌣ β$ on both triangles. The top lantern adds them up over the whole torus: the lower triangle counts $+$, the upper one $−$, because they’re oriented opposite ways.'),
    ],
    early: [E('Not this row yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast α ⌣ β on both triangles', [G('$1$ and $0$, and the top lantern reads $1$!'), E('Lower triangle: front edge is $a$, back edge is $b$, so $1 · 1$. Upper: front is $b$, back is $a$, so $0 · 0$. On the whole torus, $α ⌣ β$ reads $1$. It generates $H²(T)$.')]),
      {
        type: 'ask',
        question: 'Why is the cup of two cocycles a cocycle?',
        options: ['$δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ$, and both $δ$s are $0$', 'Products are always zero', 'Because the torus is flat'],
        answer: '$δ(φ ⌣ ψ) = δφ ⌣ ψ ± φ ⌣ δψ$, and both $δ$s are $0$',
        wrong: [E('Think of it like the product rule from calculus. Hatcher’s Lemma 3.6 gives one for $δ$.')],
        right: [E('Right, and that’s why ⌣ makes sense on cohomology classes, not just on cochains. Next row: follow NEXT, north-east.')],
      },
    ],
  },
  swap: {
    blueprint: 'The Swap',
    arrive: [
      E('Same torus. This time cast $β ⌣ α$: $β$ on the front edges, $α$ on the back.'),
    ],
    early: [E('Not this row yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Cast β ⌣ α on both triangles', [G('$0$ and $1$, and the total is $−1$. The light flipped!'), E('This time it’s the upper triangle that lights, and that one counts with a minus. So $β ⌣ α = −α ⌣ β$.')]),
      {
        type: 'ask',
        question: 'What’s $α ⌣ α$ on the torus, then?',
        options: ['$0$', '$1$', '$2$'],
        answer: '$0$',
        wrong: [E('Swapping $α$ with itself changes nothing, but the swap rule says it flips the sign. So $α ⌣ α = −α ⌣ α$.')],
        right: [E('Right: $2(α ⌣ α) = 0$ in $ℤ$. In general $α ⌣ β = (−1)ᵏˡ β ⌣ α$ (Theorem 3.11, a page ahead).'), E('Reverse a triangle’s corners and front and back trade places; that flip costs the sign. Last row: follow the NEXT ring, east.')],
      },
    ],
  },
  light_row: {
    blueprint: 'Light the Row',
    arrive: [
      E('Last one. Choose the front reading and the back reading from $α$ and $β$ with the two levers, then press “cast”. Make the top lantern read $+1$.'),
    ],
    early: [E('Not this row yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Choose readings so the torus lantern reads +1', [G('$α$ in front, $β$ behind.'), E('$α ⌣ β$ generates $H²(T; ℤ)$. Groups can’t see that. The product can, and the twins are going to have to answer to it.')]),
      {
        type: 'ask',
        question: 'Which of these is a generator of $H²(T)$?',
        options: ['$α ⌣ β$', '$α ⌣ α$', '$β ⌣ β$'],
        answer: '$α ⌣ β$',
        wrong: [E('Two of these read $0$ on the torus.')],
        right: [E('That’s it. The gate’s open, north of here. Next stop, the twins.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. The lanterns stayed lit. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next row is ${name}: follow the NEXT ring on your map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('Every row is lit. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'front_back') return [E('Cup Caster (9). Click the edge $[v₀v₁]$ first, that’s φ’s front edge, then $[v₁v₂]$.')]
  if (current === 'light_row') return [E('Click a lever to switch it between $α$ and $β$, then click “cast”.')]
  return [E('Cup Caster (9), then click inside each of the two triangles.')]
}
