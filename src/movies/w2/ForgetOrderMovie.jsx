import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import Gyroid from '../../characters/Gyroid'
import Emmy from '../../characters/Emmy'
import { PatrolSpawn } from '../../characters/Spawn'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Station, WORDS, parse } from '../../levels/w2/AbelianFordScene'
import { YardSky } from '../../levels/w2/YardFrame'
import { S, seg, smooth } from '../../levels/w2/movieKit'
import { MovieDeck } from './TileMovieKit'
import Timed from './Timed'
import { MovieFx, ShotCamera, within } from './shots'

/**
 * Intro movie for World 2 · Level 10, "Forget the Order" (videos.json level-2-10-intro):
 *   A 0–8    the ford: patrols arrive; a patrol's word a b a⁻¹ b⁻¹ lies across the water
 *   B 8–18   swap, cancel, cancel — the word dissolves
 *   C 18–26  the Commutator's own word, a b a b⁻¹ a⁻¹ a⁻¹, dissolves too
 *   D 26–30  title card
 */

const SHOTS = [
  [0, 26, [[6, 8.4, 11.4], [0, -0.4, 1.6]], [[-1, 8.8, 10.8], [0, -0.4, 1.6]]],
  [26, 40, [[0, 11, 13], [0, 0, 0]], [[0, 13, 16], [0, 0, 0]]],
]
/** Scripted reductions: [time, tiles after the step]. */
const swap = (w, i) => {
  const t = [...w]
  ;[t[i], t[i + 1]] = [t[i + 1], t[i]]
  return t
}
const drop = (w, i) => w.filter((_, k) => k !== i && k !== i + 1)
function steps(start, ops, t0, dt) {
  const out = [[0, start]]
  let w = start
  ops.forEach(([op, i], k) => {
    w = op === 's' ? swap(w, i) : drop(w, i)
    out.push([t0 + k * dt, w])
  })
  return out
}
const D = steps(parse(WORDS.dissolve), [['s', 1], ['c', 0], ['c', 0]], 10, 1.6)
const H = steps(parse(WORDS.hold), [['s', 2], ['c', 1], ['c', 1], ['c', 0]], 20, 1.2)
const at = (list, t) => list.filter(([a]) => t >= a).pop()[1]
function set(t) {
  if (t < 18) return { id: 'dissolve', bag: { tiles: { dissolve: at(D, t) } } }
  return { id: 'hold', bag: { tiles: { hold: at(H, t) } } }
}

export default function ForgetOrderMovie({ tRef }) {
  const pats = useMemo(() => [0, 1].map((i) => ({ x: 0, z: 0, seed: i * 1.9, alive: true, dying: 0, face: 0, flash: 0 })), [])
  const pG = useRef()
  useFrame(() => {
    const t = tRef.current
    pG.current.visible = t < 18
    pats.forEach((e, i) => {
      e.x = -4 + i * 8 - (i ? 1 : -1) * 1.6 * smooth(seg(t, 0.4, 5))
      e.z = 3.4
      e.alive = t < 16.8
      e.dying = t >= 16.8 ? 0.3 : 0
    })
  })
  const gyro = () => {
    const t = tRef.current
    const cut = [...D.slice(1), ...H.slice(1)].map(([a]) => a).find((a) => t > a - 0.25 && t < a + 0.25)
    const talk = within(t, [[0.6, 4.6], [22.8, 25.8]])
    return { pos: [4.3, 0, 3.6], rotY: -0.8, run: 0, cast: talk ? 0.5 : 0.1, whip: cut ? seg(t, cut - 0.25, cut + 0.25) : 0, loop: 0, loopDrop: 0 }
  }
  const emmy = () => {
    const t = tRef.current
    const talk = within(t, [[8.4, 12.6]])
    return { pos: [-4.2, 0, 3.2], rotY: 0.8, walk: 0, bow: 0, gesture: talk ? 0.6 : 0, talk: talk ? 1 : 0 }
  }
  return (
    <>
      <YardSky bg="#0a1014" water="#123a4a" deep="#060c10" cloud="#a8d0e0" spark="#9fe6ff" seed={30} />
      <MovieDeck />
      <Timed tRef={tRef} fn={set}>
        {({ id, bag }) => <group key={id}>{Station({ id }, { bag })}</group>}
      </Timed>
      <group ref={pG}>
        {pats.map((e, i) => (
          <PatrolSpawn key={i} e={e} />
        ))}
      </group>
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} />
      <DevAdvance />
      <MovieFx />
    </>
  )
}
