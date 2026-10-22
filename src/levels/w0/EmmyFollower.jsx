import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import Emmy from '../../characters/Emmy'
import { GYROID_SCALE } from './ReefGame'

/**
 * Emmy walks behind Gyroid along his own trail — the way Zelda follows Link out of Ganon's tower —
 * so she never cuts across water. She keeps a couple of steps back, stops when he stops, turns to
 * face him while they talk, and catches up at a jog if she falls far behind.
 */
const S = GYROID_SCALE
const GAP = 1.5 // trail distance she keeps behind him
const CRUMB = 0.12 // trail spacing
const WALK = 3.6
const RUN = 6.5

export default function EmmyFollower({ stateRef, talkingRef }) {
  const me = useRef(null) // { x, z, rotY, walk }
  const trail = useRef([]) // Gyroid's recent positions, newest last

  useFrame((_, rawDt) => {
    const s = stateRef.current
    if (!s) return
    const dt = Math.min(rawDt, 0.05)
    if (!me.current) {
      me.current = { x: s.x - 1, z: s.z + 1, rotY: 0, walk: 0 }
      trail.current = [[s.x, s.z]]
    }
    const e = me.current
    const tr = trail.current
    const last = tr[tr.length - 1]
    if (Math.hypot(s.x - last[0], s.z - last[1]) > CRUMB) tr.push([s.x, s.z])
    if (Math.hypot(s.x - e.x, s.z - e.z) > 14) {
      // left far behind (a respawn, a slide): step back in beside him
      e.x = s.x + 1
      e.z = s.z + 1
      trail.current = [[s.x, s.z]]
    }
    // walk back along the trail from Gyroid until GAP is used up: that's where she wants to be
    let left = GAP
    let tx = s.x
    let tz = s.z
    for (let i = tr.length - 1; i > 0; i--) {
      const [ax, az] = tr[i]
      const [bx, bz] = tr[i - 1]
      const seg = Math.hypot(ax - bx, az - bz)
      if (seg >= left) {
        tx = ax + ((bx - ax) * left) / seg
        tz = az + ((bz - az) * left) / seg
        left = 0
        // forget trail she has already walked
        if (i > 2) tr.splice(0, i - 2)
        break
      }
      left -= seg
      tx = bx
      tz = bz
    }
    const dx = tx - e.x
    const dz = tz - e.z
    const d = Math.hypot(dx, dz)
    const toHim = Math.hypot(s.x - e.x, s.z - e.z)
    let speed = 0
    if (left === 0 && d > 0.05 && toHim > GAP * 0.8) {
      speed = Math.min(d / dt, d > 2.5 ? RUN : WALK)
      e.x += (dx / d) * speed * dt
      e.z += (dz / d) * speed * dt
      e.rotY = Math.atan2(dx, dz)
    } else {
      // standing: turn to face Gyroid
      const want = Math.atan2(s.x - e.x, s.z - e.z)
      e.rotY += Math.atan2(Math.sin(want - e.rotY), Math.cos(want - e.rotY)) * Math.min(1, dt * 5)
    }
    e.walk += ((speed > 0.2 ? Math.min(1, speed / WALK) : 0) - e.walk) * Math.min(1, dt * 10)
  })

  const script = () => {
    const e = me.current || { x: 0, z: 0, rotY: 0, walk: 0 }
    const talking = !!talkingRef?.current
    return { pos: [e.x / S, 0, e.z / S], rotY: e.rotY, walk: e.walk, gesture: talking ? 0.5 : 0.1, talk: talking ? 1 : 0, bow: 0 }
  }
  return (
    <group scale={S}>
      <Emmy script={script} />
    </group>
  )
}
