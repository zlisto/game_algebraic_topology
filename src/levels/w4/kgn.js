/**
 * 4-5 One Group Per Floor — Eilenberg–MacLane spaces K(G, n).
 * Start with a bouquet of n-spheres; attach (n+1)-cells for relations; kill higher π.
 * Hatcher pp. 365–366. K(ℤ,2) ≃ CP∞ (endless climb).
 */

export function bouquet(n, generators) {
  return { dim: n, cells: generators.map((g) => ({ type: 'sphere', dim: n, label: g })), higher: 'alive' }
}

export function attachRelations(space, rels) {
  return {
    ...space,
    cells: [...space.cells, ...rels.map((r) => ({ type: 'cell', dim: space.dim + 1, word: r }))],
  }
}

/** Kill πₖ for k > n by attaching (k+1)-cells — abstract step. */
export function killAbove(space, upTo) {
  const killed = []
  for (let k = space.dim + 1; k <= upTo; k++) {
    killed.push({ dim: k + 1, kills: `π${k}` })
  }
  return { ...space, higher: 'killed', attachments: killed, name: space.dim === 2 && space.cells.length === 1 ? 'CP∞ sketch' : `K(G,${space.dim})` }
}

export function isKGn(space, n) {
  return space.dim === n && space.higher === 'killed'
}
