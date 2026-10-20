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
  E('The Product Parterre. Here we plant the cohomology of a product $X × Y$.'),
  E('Take a class $a$ of degree $p$ on $X$ and a class $b$ of degree $q$ on $Y$. Their cross product $a × b$ is a class on $X × Y$ of degree $p + q$.'),
  G('So every pair of classes makes a bed in the garden.'),
  E('And the Künneth formula says — when the coefficients behave — that’s all of it. Cup Caster on 9.'),
]

const act = (hint, done) => ({ type: 'action', hint, done })

export const STATIONS = {
  row_col: {
    blueprint: 'Rows and Columns',
    arrive: [
      E('$S¹ × S¹$, the torus. Rows: $1$ and $α$ from the first circle. Columns: $1$ and $α$ from the second.'),
      E('Click a bed, then the bin for its degree, $p + q$.'),
    ],
    early: [E('Not yet — finish the earlier bed first. Follow NEXT on the map.')],
    goals: [
      act('Put every bed in its degree bin', [G('$1$, $2$, $1$. That’s the torus!'), E('$H⁰ = ℤ$, $H¹ = ℤ²$, $H² = ℤ$ — and the top class is $α × α$, the cup of the two loop classes.')]),
      {
        type: 'ask',
        question: 'What is the degree of $a × b$, for $a$ of degree $p$ on $X$ and $b$ of degree $q$ on $Y$?',
        options: ['$p + q$', '$p · q$', 'max$(p, q)$'],
        answer: '$p + q$',
        wrong: [E('Which bin did $α × α$ go into?')],
        right: [E('Next bed is south-east.')],
      },
    ],
  },
  sphere_sphere: {
    blueprint: 'Sphere Times Sphere',
    arrive: [E('$S² × S²$. Each sphere has $1$ in degree $0$ and $γ$ in degree $2$. Bin all four beds.')],
    early: [E('Not yet — finish the earlier bed first. Follow NEXT on the map.')],
    goals: [
      act('Put every bed in its degree bin', [G('$ℤ$, then two in degree $2$, then one in degree $4$.'), E('And $(γ × 1) ⌣ (1 × γ) = γ × γ$: the two degree-2 classes multiply to the top class.')]),
      {
        type: 'ask',
        question: 'Is $S² × S²$ the same as $S² ∨ S² ∨ S⁴$, which has the same groups?',
        options: ['No — in $S² ∨ S² ∨ S⁴$ the degree-2 classes multiply to $0$', 'Yes', 'Only with ℤ₂ coefficients'],
        answer: 'No — in $S² ∨ S² ∨ S⁴$ the degree-2 classes multiply to $0$',
        wrong: [E('It’s the Twin Islands again, one dimension up.')],
        right: [E('Same trick as the Twin Islands. Next bed is south-west.')],
      },
    ],
  },
  torsion_soil: {
    blueprint: 'Torsion in the Soil',
    arrive: [
      E('$ℝP² × ℝP²$. Over $ℤ$, torsion makes Künneth messier — so use $ℤ₂$ coefficients, a field, where it holds cleanly. Each $ℝP²$ has $1$, $a$, $a²$.'),
      E('Pick every bed that lands in degree $2$, then nothing else.'),
    ],
    early: [E('Not yet — finish the earlier bed first. Follow NEXT on the map.')],
    goals: [
      act('Pick exactly the beds of degree 2', [G('$a² × 1$, $a × a$, $1 × a²$.'), E('$H²(ℝP² × ℝP²; ℤ₂) = ℤ₂³$. In all: $1, 2, 3, 2, 1$.')]),
      {
        type: 'ask',
        question: 'Why switch to $ℤ₂$ coefficients here?',
        options: ['Over a field the Künneth isomorphism holds with no correction terms', 'ℤ₂ is smaller', 'ℝP² has no ℤ cohomology'],
        answer: 'Over a field the Künneth isomorphism holds with no correction terms',
        wrong: [E('ℤ₂ is a field. What does Theorem 3.15 ask of the coefficients?')],
        right: [E('Right. Last bed is further on.')],
      },
    ],
  },
  design_parterre: {
    blueprint: 'Design a Parterre',
    arrive: [E('Choose $X$ and $Y$ with the levers so the bins read $1, 1, 1, 1$ in degrees $0$ to $3$.')],
    early: [E('Not yet — finish the earlier bed first. Follow NEXT on the map.')],
    goals: [
      act('Choose X and Y so the bins read 1, 1, 1, 1', [G('$S¹ × S²$!'), E('$(1 + t)(1 + t²) = 1 + t + t² + t³$: ranks multiply like polynomials.')]),
      {
        type: 'ask',
        question: 'If $X$ has ranks $1, 1$ and $Y$ has ranks $1, 0, 1$, what are the ranks of $X × Y$?',
        options: ['$1, 1, 1, 1$', '$1, 1, 1$', '$2, 0, 2$'],
        answer: '$1, 1, 1, 1$',
        wrong: [E('Multiply $(1 + t)(1 + t²)$.')],
        right: [E('Exactly what you built. The gate’s open.')],
      },
    ],
  },
}

export const HINTS = {
  knockout: E('Hearts back — your beds stay planted. Lash the spawn and carry on.'),
  wrongSection: (name) => E(`The next bed is ${name} — follow NEXT on the map.`),
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
    return next ? [HINTS.wrongSection(STATIONS[next].blueprint)] : [E('The parterre is planted. Walk to the gate.')]
  }
  if (goal?.type === 'ask') return [E('Answer the question when it opens.')]
  if (current === 'torsion_soil') return [E('$a$ has degree $1$ and $a²$ degree $2$. Which pairs add to $2$?')]
  if (current === 'design_parterre') return [E('One factor should give ranks $1, 1$ and the other $1, 0, 1$.')]
  return [E('Click a bed, then a bin. The bed $a × b$ goes in degree (degree of $a$) + (degree of $b$).')]
}
