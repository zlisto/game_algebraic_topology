import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Third-person chase camera, Super Mario 64 style but closer in: low behind Gyroid's shoulder,
 * swinging round behind him while he runs forward. Z / C (or right-drag) turn it; the wheel
 * pulls it in or out. `yawRef.current` is shared with the player controls, so W always means
 * "away from the camera".
 *
 * `overhead` = { center: [x, z], size } lifts it to a high three-quarter view of a puzzle —
 * spine drawing and slides need to be seen whole.
 */
const DIST = { min: 3.2, max: 9, start: 5 }
const TURN = 1.9 // rad/s for Z / C
const FOLLOW = 1.3 // how quickly the camera swings in behind a running Gyroid

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))

export default function ChaseCamera({ stateRef, yawRef, overhead: overheadProp, overheadRef, lockRef }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const dist = useRef(DIST.start)
  const drag = useRef(null)
  const look = useMemo(() => new THREE.Vector3(), [])
  const goal = useMemo(() => new THREE.Vector3(), [])
  const aim = useMemo(() => new THREE.Vector3(), [])
  const snapped = useRef(false)
  const shoulder = useRef(0) // slides over Gyroid's right shoulder while he lashes

  useEffect(() => {
    const el = gl.domElement
    const down = (e) => {
      if ((e.code === 'KeyZ' || e.code === 'KeyC') && !lockRef?.current) keys.current[e.code] = true
    }
    const up = (e) => (keys.current[e.code] = false)
    const blur = () => (keys.current = {})
    const pdown = (e) => {
      if (e.button === 2) drag.current = e.clientX
    }
    const pmove = (e) => {
      if (drag.current === null) return
      yawRef.current = wrap(yawRef.current - (e.clientX - drag.current) * 0.006)
      drag.current = e.clientX
    }
    const pup = (e) => e.button === 2 && (drag.current = null)
    const wheel = (e) => !lockRef?.current && (dist.current = THREE.MathUtils.clamp(dist.current + e.deltaY * 0.004, DIST.min, DIST.max))
    const menu = (e) => e.preventDefault() // right-drag turns the camera, so no context menu
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    el.addEventListener('pointerdown', pdown)
    window.addEventListener('pointermove', pmove)
    window.addEventListener('pointerup', pup)
    el.addEventListener('wheel', wheel, { passive: true })
    el.addEventListener('contextmenu', menu)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      el.removeEventListener('pointerdown', pdown)
      window.removeEventListener('pointermove', pmove)
      window.removeEventListener('pointerup', pup)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('contextmenu', menu)
    }
  }, [gl, yawRef, lockRef])

  useFrame(({ size }, rawDt) => {
    const s = stateRef.current
    if (!s) return
    const dt = Math.min(rawDt, 0.05)
    const overhead = overheadRef ? overheadRef.current : overheadProp
    const k = lockRef?.current ? {} : keys.current
    // manual turn
    yawRef.current = wrap(yawRef.current + ((k.KeyC ? 1 : 0) - (k.KeyZ ? 1 : 0)) * TURN * dt)
    // swing in behind Gyroid whenever he runs — gently for a curve, briskly when he turns right round
    if (s.moving > 0.5 && drag.current === null && !overhead) {
      const off = wrap(s.face + Math.PI - yawRef.current)
      const rate = Math.abs(off) > 2.2 ? 4.5 : FOLLOW
      yawRef.current = wrap(yawRef.current + off * Math.min(1, dt * rate))
    }

    if (overhead) {
      // square up to the nearest quarter turn: W / A / S / D then run straight along the reef
      const square = Math.round(yawRef.current / (Math.PI / 2)) * (Math.PI / 2)
      yawRef.current = wrap(yawRef.current + wrap(square - yawRef.current) * Math.min(1, dt * 6))
    }
    const yaw = yawRef.current
    if (overhead) {
      // tall, narrow windows show less across: pull back so the whole station still fits
      const aspect = size.width / Math.max(1, size.height)
      const zoom = ((overhead.size || 8) / 8) * Math.max(1, 1.1 / aspect)
      // lean toward Gyroid, so he never walks out of the frame
      const lean = overhead.follow ?? 0.35
      const cx = overhead.center[0] + (s.x - overhead.center[0]) * lean
      const cz = overhead.center[1] + (s.z - overhead.center[1]) * lean
      goal.set(cx + Math.sin(yaw) * 7 * zoom, 11 * zoom, cz + Math.cos(yaw) * 7 * zoom)
      aim.set(cx, 0, cz)
    } else {
      const d = dist.current
      // over the right shoulder while the whip flies, so the throw isn't hidden behind him
      shoulder.current += ((s.whip > 0 ? 0.55 : 0) - shoulder.current) * Math.min(1, dt * 6)
      const rx = Math.cos(yaw) * shoulder.current
      const rz = -Math.sin(yaw) * shoulder.current
      // above and behind, looking just past Gyroid — he sits mid-screen, clear of the HUD
      goal.set(s.x + Math.sin(yaw) * d + rx, 1.4 + d * 0.42, s.z + Math.cos(yaw) * d + rz)
      aim.set(s.x - Math.sin(yaw) * 1.1 + rx, 0.55, s.z - Math.cos(yaw) * 1.1 + rz)
    }
    const lerp = snapped.current ? Math.min(1, dt * (overhead ? 2.5 : 6)) : 1
    snapped.current = true
    camera.position.lerp(goal, lerp)
    look.lerp(aim, lerp)
    camera.lookAt(look)
  })
  return null
}
