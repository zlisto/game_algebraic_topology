import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import Emmy from '../../characters/Emmy'
import { GYROID_SCALE } from './ReefGame'

/**
 * Emmy walks behind Gyroid along his own trail — the way Zelda follows Link out of Ganon's tower —
 * so she never cuts across water. She keeps a couple of steps back and off to one side, out of the
 * camera's line of sight; stops when he stops; turns to face him while they talk; and jogs to
 * catch up if she falls far behind. If she's ever caught between the camera and Gyroid anyway,
 * she fades so he stays visible.
 */
const S = GYROID_SCALE
const GAP = 1.4 // trail distance she keeps behind him
const SIDE = 1.1 // how far she steps off the trail, out of the camera's line
const CRUMB = 0.12 // trail spacing
const WALK = 3.6
const RUN = 6.5
const CAM = 5 // roughly how far behind Gyroid the chase camera sits

/** Is (x, z) inside the wedge between the camera and Gyroid (where she'd hide him)? */
function inSightline(x, z, s, yaw) {
  const cx = s.x + Math.sin(yaw) * CAM
  const cz = s.z + Math.cos(yaw) * CAM
  const vx = s.x - cx
  const vz = s.z - cz
  const L = Math.hypot(vx, vz)
  const u = ((x - cx) * vx + (z - cz) * vz) / (L * L) // 0 at the camera, 1 at Gyroid
  if (u < 0.05 || u > 1.15) return false
  const off = Math.abs((x - cx) * vz - (z - cz) * vx) / L // distance from the line
  return off < 0.35 + u * 0.55
}

export default function EmmyFollower({ stateRef, talkingRef, camYawRef, walkable, posRef }) {
  const me = useRef(null) // { x, z, rotY, walk, fade }
  const trail = useRef([]) // Gyroid's recent positions, newest last
  const last = useRef(null) // Gyroid's position last frame, to spot respawns
  const group = useRef()

  useFrame((_, rawDt) => {
    const s = stateRef.current
    if (!s) return
    const dt = Math.min(rawDt, 0.05)
    const yaw = camYawRef?.current ?? 0
    const okAt = (x, z) => !walkable || walkable.inside(x, z)
    if (!me.current) me.current = { x: s.x - 1, z: s.z + 1, rotY: 0, walk: 0, fade: 1 }
    const e = me.current
    if (posRef) posRef.current = e // where she is, for 'press E to talk'
    // a respawn or a slide moved Gyroid in one jump: step back in beside him
    const jumped = last.current && Math.hypot(s.x - last.current[0], s.z - last.current[1]) > 2.5
    last.current = [s.x, s.z]
    if (jumped || !trail.current.length || Math.hypot(s.x - e.x, s.z - e.z) > 14) {
      const px = s.x - Math.cos(yaw) * SIDE
      const pz = s.z + Math.sin(yaw) * SIDE
      ;[e.x, e.z] = okAt(px, pz) ? [px, pz] : [s.x, s.z]
      trail.current = [[s.x, s.z]]
    }
    const tr = trail.current
    const end = tr[tr.length - 1]
    if (Math.hypot(s.x - end[0], s.z - end[1]) > CRUMB) tr.push([s.x, s.z])

    // walk back along the trail from Gyroid until GAP is used up: that's her place in line
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
        if (i > 2) tr.splice(0, i - 2) // forget trail she has already walked
        break
      }
      left -= seg
      tx = bx
      tz = bz
    }
    // the trail runs back toward the camera, so step off it — camera-left, else camera-right,
    // else drop further back along the trail — whichever keeps her out of the sightline on solid reef
    if (camYawRef) {
      const rx = Math.cos(yaw)
      const rz = -Math.sin(yaw)
      const options = [
        [tx - rx * SIDE, tz - rz * SIDE],
        [tx + rx * SIDE, tz + rz * SIDE],
        [s.x + Math.sin(yaw) * (CAM + 1.5), s.z + Math.cos(yaw) * (CAM + 1.5)],
      ]
      const pick = options.find(([x, z]) => okAt(x, z) && !inSightline(x, z, s, yaw))
      if (pick) [tx, tz] = pick
    }
    // never inside Gyroid: keep at least a body's width away
    const gx = tx - s.x
    const gz = tz - s.z
    const gd = Math.hypot(gx, gz)
    if (gd < 0.85) {
      const k = gd > 0.01 ? 0.85 / gd : 0
      const nx = s.x + (gd > 0.01 ? gx * k : -Math.cos(yaw) * 0.85)
      const nz = s.z + (gd > 0.01 ? gz * k : Math.sin(yaw) * 0.85)
      if (okAt(nx, nz)) [tx, tz] = [nx, nz]
    }
    const dx = tx - e.x
    const dz = tz - e.z
    const d = Math.hypot(dx, dz)
    let speed = 0
    if (d > 0.15) {
      speed = Math.min(d / dt, d > 2.5 ? RUN : WALK) * Math.min(1, d) // ease in to her spot
      const nx = e.x + (dx / d) * speed * dt
      const nz = e.z + (dz / d) * speed * dt
      if (okAt(nx, nz)) [e.x, e.z] = [nx, nz]
      else if (okAt(nx, e.z)) e.x = nx
      else if (okAt(e.x, nz)) e.z = nz
      e.rotY = Math.atan2(dx, dz)
    } else {
      // standing: turn to face Gyroid
      const want = Math.atan2(s.x - e.x, s.z - e.z)
      e.rotY += Math.atan2(Math.sin(want - e.rotY), Math.cos(want - e.rotY)) * Math.min(1, dt * 5)
    }
    e.walk += ((speed > 0.3 ? Math.min(1, speed / WALK) : 0) - e.walk) * Math.min(1, dt * 10)

    // backstop: if she's caught in the sightline, fade so Gyroid stays visible
    const want = camYawRef && inSightline(e.x, e.z, s, yaw) ? 0.3 : 1
    e.fade += (want - e.fade) * Math.min(1, dt * 8)
    group.current?.traverse((o) => {
      if (!o.material) return
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity
        m.transparent = e.fade < 0.99 || m.userData.baseOpacity < 1
        m.opacity = m.userData.baseOpacity * e.fade
      }
    })
  })

  const script = () => {
    const e = me.current || { x: 0, z: 0, rotY: 0, walk: 0 }
    const talking = !!talkingRef?.current
    return { pos: [e.x / S, 0, e.z / S], rotY: e.rotY, walk: e.walk, gesture: talking ? 0.5 : 0.1, talk: talking ? 1 : 0, bow: 0 }
  }
  return (
    <group ref={group} scale={S}>
      <Emmy script={script} />
    </group>
  )
}
