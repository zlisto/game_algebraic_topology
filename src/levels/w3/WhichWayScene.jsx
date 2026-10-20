import { Html, Line } from '@react-three/drei'
import YardFrame from '../w2/YardFrame'

/**
 * Compass Cliffs (3-7): orientation. A band is a ring of N patches; each patch carries a compass —
 * a local orientation, + (counter-clockwise, gold) or − (clockwise, blue). Across an ordinary seam
 * neighbouring compasses agree when they match; across a half-twisted seam (pink) they agree when
 * they are opposite. A band is orientable when every compass can agree with its neighbours.
 *   set_compasses — the annulus: flip compasses until all agree
 *   the_flip      — the Möbius band: carry one compass all the way round, patch by patch
 *   two_sheets    — the orientation double cover of the Möbius band: two rings (+ and −); one trip
 *                   round the band moves you to the other ring
 *   survey        — three bands with 0, 1 and 2 half-twists
 */

export const N = 6
export const R = 2.6
export const BANDS = {
  set_compasses: { twists: [] },
  the_flip: { twists: [5] },
  two_sheets: { twists: [5] },
}
export const SURVEY = [
  { id: 'b0', twists: [], at: [-3.0, 0.8], label: 'no twist' },
  { id: 'b1', twists: [5], at: [0, -1.8], label: 'one half-twist' },
  { id: 'b2', twists: [1, 4], at: [3.0, 0.8], label: 'two half-twists' },
]
export const START = { set_compasses: [1, -1, 1, 1, -1, 1] }
export const patchPos = (i, r = R, c = [0, 0]) => {
  const th = -Math.PI / 2 + (2 * Math.PI * i) / N
  return [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]
}
/** Carry a compass across seam i → i+1. */
export const across = (twists, i, c) => (twists.includes(i) ? -c : c)
export function consistent(comp, twists) {
  return comp.every((c, i) => comp[(i + 1) % N] === across(twists, i, c))
}
/** Transport a compass from patch 0 once round: the value it comes back with. */
export function roundTrip(twists) {
  let c = 1
  for (let i = 0; i < N; i++) c = across(twists, i, c)
  return c
}

function Compass({ pos, c, dim, hl, s = 1 }) {
  const col = c === 0 ? '#5a5a64' : c > 0 ? '#ffb347' : '#7fd6ff'
  const pts = Array.from({ length: 25 }, (_, k) => {
    const a = (k / 24) * 1.6 * Math.PI * (c >= 0 ? 1 : -1)
    return [0.42 * s * Math.cos(-a), 0.2, 0.42 * s * Math.sin(-a)]
  })
  const end = pts[pts.length - 1]
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[0.62 * s, 6]} />
        <meshStandardMaterial color={hl ? '#4a4a3a' : '#2e3438'} transparent opacity={dim ? 0.5 : 1} />
      </mesh>
      {c !== 0 && <Line points={pts} color={col} lineWidth={4} />}
      {c !== 0 && (
        <mesh position={end}>
          <sphereGeometry args={[0.09 * s, 10, 8]} />
          <meshBasicMaterial color={col} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function Seams({ twists, c = [0, 0], r = R, s = 1 }) {
  return Array.from({ length: N }, (_, i) => {
    const th = -Math.PI / 2 + (2 * Math.PI * (i + 0.5)) / N
    const p = [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]
    const tw = twists.includes(i)
    return (
      <mesh key={i} position={[p[0], 0.08, p[1]]} rotation={[0, -th, 0]}>
        <boxGeometry args={[0.5 * s, 0.06, 0.1 * s]} />
        <meshBasicMaterial color={tw ? '#ff8ad8' : '#4a5258'} toneMapped={false} />
      </mesh>
    )
  })
}

function Band({ twists, comp, hl, c = [0, 0], r = R, s = 1, ringColor = '#3a4248' }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[c[0], 0.03, c[1]]}>
        <ringGeometry args={[r - 0.75 * s, r + 0.75 * s, 48]} />
        <meshStandardMaterial color={ringColor} side={2} />
      </mesh>
      <Seams twists={twists} c={c} r={r} s={s} />
      {Array.from({ length: N }, (_, i) => (
        <Compass key={i} pos={patchPos(i, r, c)} c={comp[i]} hl={hl === i} s={s} />
      ))}
    </group>
  )
}

/** The double cover: two rings, + outside and − inside, and a bead riding them. */
function DoubleCover({ step }) {
  const twists = BANDS.two_sheets.twists
  let sheet = 1
  for (let k = 0; k < step; k++) sheet = across(twists, k % N, sheet)
  const i = step % N
  const [x, z] = patchPos(i, sheet > 0 ? R + 0.7 : R - 0.9)
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[R + 0.35, R + 1.05, 48]} />
        <meshStandardMaterial color="#4a3a28" side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[R - 1.25, R - 0.55, 48]} />
        <meshStandardMaterial color="#28384a" side={2} />
      </mesh>
      {Array.from({ length: N }, (_, k) => (
        <group key={k}>
          <Compass pos={patchPos(k, R + 0.7)} c={1} s={0.6} />
          <Compass pos={patchPos(k, R - 0.9)} c={-1} s={0.6} />
        </group>
      ))}
      <mesh position={[x, 0.45, z]}>
        <sphereGeometry args={[0.26, 16, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff8ad8" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
        <div className="deck-tag" style={{ textAlign: 'center' }}>
          outside: + · inside: −<br />
          trips round M: {Math.floor(step / N)} · sheet {sheet > 0 ? '+' : '−'}
        </div>
      </Html>
    </group>
  )
}

export function Station(site, { bag }) {
  const id = site.id
  if (id === 'set_compasses') {
    const comp = bag.comp?.set_compasses || START.set_compasses
    return (
      <group>
        <Band twists={[]} comp={comp} />
        <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
          <div className="deck-tag">annulus</div>
        </Html>
      </group>
    )
  }
  if (id === 'the_flip') {
    const comp = bag.comp?.the_flip || [1, 0, 0, 0, 0, 0]
    const closed = bag.closed?.the_flip
    return (
      <group>
        <Band twists={BANDS.the_flip.twists} comp={comp} hl={bag.next?.the_flip ?? 1} />
        <Html position={[0, 0.3, 0]} center zIndexRange={[10, 0]}>
          <div className="deck-tag" style={{ textAlign: 'center' }}>
            Möbius band
            {closed ? <><br /><b style={{ color: '#ff8ad8' }}>came back flipped</b></> : null}
          </div>
        </Html>
      </group>
    )
  }
  if (id === 'two_sheets') return <DoubleCover step={bag.step?.two_sheets || 0} />
  if (id === 'survey') {
    const done = bag.surveyed || {}
    return (
      <group>
        {SURVEY.map((b) => {
          const back = roundTrip(b.twists)
          const comp = done[b.id] ? Array.from({ length: N }, (_, i) => {
            let c = 1
            for (let k = 0; k < i; k++) c = across(b.twists, k, c)
            return c
          }) : Array(N).fill(0)
          return (
            <group key={b.id}>
              <Band twists={b.twists} comp={comp} c={b.at} r={1.25} s={0.45} />
              <Html position={[b.at[0], 0.3, b.at[1] + 1.95]} center zIndexRange={[10, 0]}>
                <div className="deck-tag" style={{ fontSize: '0.62rem', textAlign: 'center' }}>
                  {b.label}
                  {done[b.id] ? <><br /><b style={{ color: back > 0 ? '#ffb347' : '#ff8ad8' }}>{back > 0 ? 'orientable' : 'non-orientable'}</b></> : null}
                </div>
              </Html>
            </group>
          )
        })}
      </group>
    )
  }
  return null
}

export default function WhichWayScene(props) {
  return <YardFrame {...props} sky={{ bg: '#0c0e14', water: '#1c2a40', deep: '#06080e', cloud: '#c0c8e0', spark: '#ffd27a', seed: 37 }} deckColor="#2c3038" station={Station} />
}
