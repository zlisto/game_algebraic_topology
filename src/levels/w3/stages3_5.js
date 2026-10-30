/**
 * World 3 · Level 3-5 "Product Placement" — Product Parterre.
 * Hatcher §3.2, pp. 214–220 — the cross product a × b = p₁*(a) ⌣ p₂*(b) and the Künneth formula
 * (Theorem 3.15): H*(X; R) ⊗ H*(Y; R) → H*(X × Y; R) is an isomorphism of rings when H*(Y; R) is
 * free and finitely generated over R in each degree — e.g. for spheres and tori over ℤ, and for any
 * finite CW complexes over a field such as ℤ₂.
 *
 * Cup Caster (9): pick a bed, then a degree bin; pick beds; switch the X and Y levers.
 */
const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['row_col', 'sphere_sphere', 'torsion_soil', 'design_parterre']

export const OPENING = [
  E('The Product Parterre. A point of $X × Y$ is a pair: somewhere on $X$ and somewhere on $Y$. So how do you read a place like that?'),
  E('Read a class $a$ on the $X$ part, read a class $b$ on the $Y$ part, and cup the two. That’s the cross product $a × b$. If $a$ has degree $p$ and $b$ has degree $q$, $a × b$ has degree $p + q$.'),
  G('So the rows are $X$’s classes, the columns are $Y$’s, and every bed is one pair.'),
  E('And the Künneth formula says that, when the coefficients behave, the beds are all there is: every class on $X × Y$ is built from them.'),
  E('Built how? $H*(X) ⊗ H*(Y)$ is just bookkeeping: pick a basis on each side, and every pair of basis classes is one bed. Künneth says those beds are a basis for $X × Y$.'),
  E('“Behave” means Hatcher’s condition: $Y$’s cohomology is free, plain copies of $ℤ$ with no $ℤ₂$s (circles, spheres, tori), or you work over a field like $ℤ₂$.'),
  E('Cup Caster on 9. First bed: follow the NEXT ring, north-east.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  row_col: {
    blueprint: 'Rows and Columns',
    arrive: [
      E('$S¹ × S¹$, the torus. Rows: $1$ and $α$ from the first circle. Columns: $1$ and $α$ from the second. Here $1$ is the degree-0 class, the reading that’s $1$ on every point.'),
      E('Click a bed, then the bin for its degree, $p + q$.'),
    ],
    early: [E('Not this bed yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Put every bed in its degree bin', [G('$1$, $2$, $1$. That’s the torus!'), E('$H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$. The top bed is $α × α$: the first circle’s loop class times the second’s. It’s the $α ⌣ β$ you lit at the twins.')]),
      {
        type: 'ask',
        question: 'What is the degree of $a × b$, for $a$ of degree $p$ on $X$ and $b$ of degree $q$ on $Y$?',
        options: ['$p + q$', '$p · q$', 'max$(p, q)$'],
        answer: '$p + q$',
        wrong: [E('Which bin did $α × α$ go into?')],
        right: [E('Right. Next bed: follow the NEXT ring, north-west.')],
      },
    ],
  },
  sphere_sphere: {
    blueprint: 'Sphere Times Sphere',
    arrive: [E('$S² × S²$. Each sphere has $1$ in degree $0$ and $γ$ in degree $2$. Bin all four beds.')],
    early: [E('Not this bed yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Put every bed in its degree bin', [G('$ℤ$, then two in degree $2$, then one in degree $4$.'), E('And the cross product remembers how to multiply: $(γ × 1) ⌣ (1 × γ) = γ × γ$. The two degree-2 classes multiply to the top class.')]),
      {
        type: 'ask',
        question: 'Is $S² × S²$ the same as $S² ∨ S² ∨ S⁴$, which has the same groups?',
        options: ['No — in $S² ∨ S² ∨ S⁴$ the degree-2 classes multiply to $0$', 'Yes', 'Only with ℤ₂ coefficients'],
        answer: 'No — in $S² ∨ S² ∨ S⁴$ the degree-2 classes multiply to $0$',
        wrong: [E('It’s the Twin Islands again, one dimension up.')],
        right: [E('Same trick as the Twin Islands. Next bed: follow the NEXT ring, north-east.')],
      },
    ],
  },
  torsion_soil: {
    blueprint: 'Torsion in the Soil',
    arrive: [
      E('$ℝP² × ℝP²$. Theorem 3.15 needs free cohomology, and over $ℤ$, $ℝP²$ has a $ℤ₂$. So read mod 2: $ℤ₂$ is a field, and over a field the formula holds as it stands.'),
      E('Mod 2, each $ℝP²$ has $1$, $a$ and $a²$, in degrees $0$, $1$, $2$. Pick every bed that lands in degree $2$, and nothing else.'),
    ],
    early: [E('Not this bed yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Pick exactly the beds of degree 2', [G('$a² × 1$, $a × a$, $1 × a²$.'), E('So $H²(ℝP² × ℝP²; ℤ₂) = ℤ₂³$. All the bins, degree $0$ to $4$: $1, 2, 3, 2, 1$.')]),
      {
        type: 'ask',
        question: 'Why switch to $ℤ₂$ coefficients here?',
        options: ['Over a field the Künneth isomorphism holds with no correction terms', 'ℤ₂ is smaller', 'ℝP² has no ℤ cohomology'],
        answer: 'Over a field the Künneth isomorphism holds with no correction terms',
        wrong: [E('ℤ₂ is a field. What does Theorem 3.15 ask of the coefficients?')],
        right: [E('Right. Last bed: follow the NEXT ring, north-west.')],
      },
    ],
  },
  design_parterre: {
    blueprint: 'Design a Parterre',
    arrive: [E('Your turn to design. Choose $X$ and $Y$ with the levers so the bins read $1, 1, 1, 1$ in degrees $0$ to $3$.')],
    early: [E('Not this bed yet. Finish the one before it: follow the NEXT ring on your map.')],
    goals: [
      act('Choose X and Y so the bins read 1, 1, 1, 1', [G('$S¹ × S²$!'), E('Write each space’s ranks as a polynomial: $1 + t$ for the circle, $1 + t²$ for the sphere. Multiply: $(1 + t)(1 + t²) = 1 + t + t² + t³$.'), E('Why multiply? A bed of degree $p + q$ is a $tᵖ$ from $X$ times a $t$ to the power $q$ from $Y$, so counting beds by degree is exactly multiplying the polynomials.')]),
      {
        type: 'ask',
        question: 'If $X$ has ranks $1, 1$ and $Y$ has ranks $1, 0, 1$, what are the ranks of $X × Y$?',
        options: ['$1, 1, 1, 1$', '$1, 1, 1$', '$2, 0, 2$'],
        answer: '$1, 1, 1, 1$',
        wrong: [E('Multiply $(1 + t)(1 + t²)$.')],
        right: [E('Exactly what you built. The gate’s open, north.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your beds are still planted. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`Not this one. The next bed is ${name}: follow the NEXT ring on your map.`),
}

export const DEFINITION = {
  text: 'Cross products a × b of classes on X and Y give classes of degree p + q on X × Y, and the Künneth formula says that (for free, finitely generated cohomology, or over a field) these make up all of H*(X × Y) as the tensor product H*(X) ⊗ H*(Y).',
  cite: 'Hatcher, Algebraic Topology §3.2, pp. 214–220 (Theorem 3.15).',
  url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
}

export function emmyAdvice(state) {
  const { current, done, goal, here, enemies, phase } = state
  if (phase !== 'play') return [E('Finish this line first.')]
  if (enemies?.[here.site]) return [E('Lash the violet spawn first (1).')]
  if (!current || here.site !== current) {
    const next = STATION_ORDER.find((id) => !done[id])
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The parterre is planted. Head north to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'torsion_soil') return [E('$a$ has degree $1$ and $a²$ degree $2$. Which pairs add up to $2$?')]
  if (current === 'design_parterre') return [E('One factor should give ranks $1, 1$ and the other $1, 0, 1$.')]
  return [E('Click a bed, then a bin. The bed $a × b$ goes in degree (degree of $a$) + (degree of $b$).')]
}
