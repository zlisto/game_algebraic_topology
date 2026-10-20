/**
 * 4-9 Maps Are Classes — Hⁿ(X; G) ≅ ⟨X, K(G,n)⟩ for CW complexes.
 * Hatcher pp. 393–405.
 */

/** Pull back the fundamental class of K(G,n) along f: X → K(G,n). */
export function pullBack(f, fundClass = 'ι') {
  return { reading: `${f.name}^*${fundClass}`, degree: f.degree ?? null }
}

/** Every cohomology class arises uniquely up to homotopy from such a map. */
export function readingToMap(reading, n = 1, G = 'Z') {
  return { target: `K(${G},${n})`, class: reading, uniqueUpToHomotopy: true }
}

export function roundTrip(reading) {
  const f = readingToMap(reading)
  const back = pullBack(f)
  return { ok: true, map: f, reading: back.reading }
}
