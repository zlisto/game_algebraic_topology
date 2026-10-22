/**
 * World 1 · Level 5 "Push It Forward" — Torus Terraces.
 * Hatcher, Algebraic Topology, §1.1: induced homomorphisms (the "basic properties" after
 * Prop. 1.16), retractions (Prop. 1.17: a retraction X → A makes i∗ : π₁(A) → π₁(X) injective),
 * and products (Prop. 1.12: π₁(X × Y) ≅ π₁(X) × π₁(Y); the torus has π₁(T²) ≅ ℤ × ℤ).
 *
 * The torus is the square plaza with opposite gates glued: out through the east gate and back in
 * at the west (that's the loop a), out the north and in at the south (b).
 */

const E = (text) => ({ speaker: 'Emmy Boundary', portrait: 'emmy-boundary', text })
const G = (text) => ({ speaker: 'Gyroid', portrait: 'gyroid', text })

export const STATION_ORDER = ['projector_deck', 'retract_deck', 'two_roads', 'shadows_deck']

export const OPENING = [
  E('The Torus Terraces. Here maps carry loops from one space to another — and every map sends loops to loops.'),
  G('Push it forward!'),
  E('Every terrace you finish leaves a Torus Pair: a glassy torus with its two loops, $a$ round the long way and $b$ through the hole, the two loops every torus loop is built from. Collect all four and the Warp Portal at the north end opens.'),
  E('The Projector terrace is just ahead.'),
]

/**
 * Goal types:
 *   push      — walk laps on the source circle, project with z ↦ z², read the target
 *   retract   — laps of the inner road, pushed out to the rim by the retraction
 *   ask       — a question
 *   grid      — reach (1, 1) on the plaza's lift; swap — reach it again in the other order
 *   shadows   — split (m, n) into factor windings and rebuild
 *   guard     — clear a wave
 */
export const STATIONS = {
  projector_deck: {
    blueprint: 'The Projector',
    arrive: [
      E('A map $f$ from one circle to another carries every loop with it: a loop $γ$ becomes $f ∘ γ$. On $π₁$ that’s the induced map, written $f∗$.'),
      E('This projector is the map $z ↦ z²$: it wraps the source circle twice round the target. Cord (4): run one lap of the gold source circle counter-clockwise, seen from above, the same $+1$ as on the Winding Road. Then click the projector.'),
      E('Mind the Möbius prowler. It takes two lashes (1), and the first one cuts it down the middle into one band twice as long, which then runs twice as fast. Strike, then be ready to strike again.'),
    ],
    goals: [
      {
        type: 'push',
        degree: 2,
        needSource: 1,
        needTarget: 2,
        done: [
          G('One lap on the source became two laps on the target!'),
          E('$z ↦ z²$ sends winding $1$ to $2$, and winding $k$ to $2k$: on $π₁(S¹) ≅ ℤ$ the induced map is “times 2”. Maps of spaces become maps of groups.'),
          E('Retract Check is west.'),
        ],
      },
    ],
    early: [E('The Projector terrace is just ahead on the causeway.')],
  },
  retract_deck: {
    blueprint: 'Retract Check',
    arrive: [
      E('This terrace is a ring of stone round a sunken pool — an annulus. Unlike the basin in No Way Out, it has a hole, so it can be pushed straight out from the pool onto its rim. That’s a retraction.'),
      E('Cord (4): run the pink inner road round the pool twice. The retraction carries your loop out onto the rim.'),
    ],
    goals: [
      {
        type: 'retract',
        w1: 1,
        w2: 2,
        done: [
          G('Two laps inside — two laps on the rim.'),
          E('Pushing out to the rim never changes how a rim loop winds: the retraction $r$ undoes the inclusion, $r ∘ i = $ identity.'),
        ],
      },
      {
        type: 'ask',
        question: 'A rim loop of 1 lap and one of 2 laps: could they slide into each other inside the ring?',
        options: ['Yes — inside the ring they could merge', 'No — the retraction would push them back apart'],
        answer: 1,
        right: [
          E('Right. If they could slide together inside, pushing that slide out to the rim would slide them together on the rim — and $1 ≠ 2$ there. So $i∗ : π₁(A) → π₁(X)$ is one-to-one.'),
          E('Two Roads next — east, past the Projector.'),
        ],
        wrong: [E('Suppose they could. Push the whole slide out with the retraction: now they slide together on the rim itself — but there they wind $1$ and $2$ times. Impossible.')],
      },
    ],
    early: [E('Finish the Projector first, then come to the ring with the pool.')],
  },
  two_roads: {
    blueprint: 'Two Roads',
    arrive: [
      E('A torus, laid flat: this square plaza with its opposite gates glued. Walk out through the east gate and you come straight back in at the west — that trip is the loop $a$. Out the north, in at the south: the loop $b$.'),
      E('The grid to the east is the plane that covers the torus. Each trip through a gate moves your lift one square. Go through gate $a$ once and gate $b$ once.'),
    ],
    goals: [
      {
        type: 'grid',
        need: [1, 1],
        done: [G('The lift is at $(1, 1)$.'), E('Now the other order. Press “Back to the start”, then go through the other gate first.')],
      },
      {
        type: 'swap',
        need: [1, 1],
        done: [
          G('Same square, $(1, 1)$, either way round!'),
          E('So $a b = b a$: on the torus the two loops commute, and a loop is just a pair of whole numbers. $π₁(T²) ≅ ℤ × ℤ$.'),
          E('Last terrace: Shadows, to the north-west.'),
        ],
      },
    ],
    early: [E('The torus plaza opens after Retract Check.')],
  },
  shadows_deck: {
    blueprint: 'Shadows',
    arrive: [
      E('The torus is a product, $S¹ × S¹$. A loop on it casts a shadow on each factor circle, and the two shadows determine the loop.'),
      E('The board wants the loop $(2, 3)$. Cord (4): run the gold first-factor circle twice and the cyan second-factor circle three times, counter-clockwise seen from above ($+1$ a lap). A clockwise lap counts $−1$, so it takes a lap off. Then press Rebuild.'),
    ],
    goals: [
      {
        type: 'shadows',
        given: [2, 3],
        need: [2, 3],
        done: [
          E('$π₁(S¹ × S¹) ≅ π₁(S¹) × π₁(S¹) ≅ ℤ × ℤ$. The pair $(2, 3)$ is the loop; each number is a shadow.'),
          G('Shadows match — loop rebuilt!'),
          E('Imps! Lash them (1).'),
        ],
      },
      {
        type: 'guard',
        wave: true,
        done: [E('That’s the last of them. The causeway north is open: gather every Torus Pair and the Warp Portal at its end will take us on.')],
      },
    ],
    early: [E('Shadows waits until both roads make sense.')],
  },
}

export const HINTS = {
  knockout: E('Hearts back. Your terraces stay done; the spawn here are back.'),
  hijacked: E('Spawn on this terrace are jamming the projector. Lash them (1), then project.'),
  wrongPush: E('Run one lap of the gold source circle with the Cord (4) first, counter-clockwise seen from above ($+1$; a clockwise lap is $−1$). Then click the brass projector.'),
  swap: E('Press “Back to the start” in the panel. Then go through the other gate first, then the first one.'),
  shadows: E('Run the gold circle twice and the cyan circle three times, counter-clockwise ($+1$ a lap; clockwise takes one off), then press Rebuild.'),
}

export const DEFINITION = {
  title: 'Induced maps and products',
  text: 'A map f : X → Y carries loops to loops, giving a homomorphism f∗ : π₁(X) → π₁(Y); for z ↦ zᵏ on the circle, f∗ multiplies winding numbers by k. If X retracts onto A, then i∗ : π₁(A) → π₁(X) is one-to-one. For a product, π₁(X × Y) ≅ π₁(X) × π₁(Y); so the torus has π₁(T²) ≅ ℤ × ℤ, and its two loops commute.',
  cite: 'Hatcher, Algebraic Topology, §1.1, Proposition 1.12 (p. 35) and Proposition 1.17 (p. 36).',
  link: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
  next: 'World 1 · Level 6 — Free Word Play',
}

export function emmyAdvice15(state) {
  const { current, here, goal, SITE, loops, hijacked, waveOn, waveSpawned, enemies, exitOpen } = state
  if (exitOpen) return [E('The north gate is open. Gather every Torus Pair, then walk into the Warp Portal. I’m right behind you.')]
  if (!current) return [G('All terraces done!')]
  if (here.site !== current)
    return [E(`${SITE[current].name} is next: follow the map’s NEXT ring. Null’s beasts roam the commons between the terraces, and a Projective specter needs its second lash quickly, so keep the Lash (1) ready. I’m right behind you.`)]
  const g = goal
  if (!g) return [E('Walk on.')]
  if (g.type === 'push') {
    if (hijacked) return [HINTS.hijacked]
    if ((loops?.source ?? 0) < g.needSource) return [E('Cord (4): run all the way round the gold source circle, staying on it, counter-clockwise seen from above. That’s $+1$; clockwise would be $−1$.')]
    return [E('Now click the brass projector.')]
  }
  if (g.type === 'retract') return [E(`Cord (4): run the pink inner road round the pool — ${g.w2} laps.`)]
  if (g.type === 'ask') return [E('Think about pushing a slide out to the rim.')]
  if (g.type === 'grid') return [E('Walk out through the east gate (that’s $a$) and through the north gate (that’s $b$), once each, in either order.')]
  if (g.type === 'swap') return [HINTS.swap]
  if (g.type === 'shadows') return [HINTS.shadows]
  if (g.type === 'guard') {
    if (waveOn && waveSpawned && (enemies?.shadows_deck || 0) > 0) return [E('Lash the projector imps (1).')]
    return [E('Terrace clear.')]
  }
  return [E('Talk to me any time.')]
}
