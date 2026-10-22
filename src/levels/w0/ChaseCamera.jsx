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

export default function ChaseCamera({ stateRef, yawRef, overhead }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const dist = useRef(DIST.start)
  const drag = useRef(null)
  const look = useMemo(() => new THREE.Vector3(), [])
  const goal = useMemo(() => new THREE.Vector3(), [])
  const aim = useMemo(() => new THREE.Vector3(), [])
  const snapped = useRef(false)

  useEffect(() => {
    const el = gl.domElement
    const down = (e) => {
      if (e.code === 'KeyZ' || e.code === 'KeyC') keys.current[e.code] = true
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
    const wheel = (e) => (dist.current = THREE.MathUtils.clamp(dist.current + e.deltaY * 0.004, DIST.min, DIST.max))
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
  }, [gl, yawRef])

  useFrame((_, rawDt) => {
    const s = stateRef.current
    if (!s) return
    const dt = Math.min(rawDt, 0.05)
    const k = keys.current
    // manual turn
    yawRef.current = wrap(yawRef.current + ((k.KeyC ? 1 : 0) - (k.KeyZ ? 1 : 0)) * TURN * dt)
    // swing in behind Gyroid while he runs forward (not while he backs up or strafes on the spot)
    if ((s.fwd || 0) > 0 && s.moving > 0.5 && drag.current === null && !overhead) {
      const behind = s.face + Math.PI
      yawRef.current = wrap(yawRef.current + wrap(behind - yawRef.current) * Math.min(1, dt * FOLLOW))
    }

    const yaw = yawRef.current
    if (overhead) {
      const zoom = (overhead.size || 8) / 8
      const [cx, cz] = overhead.center
      goal.set(cx + Math.sin(yaw) * 7 * zoom, 11 * zoom, cz + Math.cos(yaw) * 7 * zoom)
      aim.set(cx, 0, cz)
    } else {
      const d = dist.current
      // a little above the shoulder, looking past Gyroid to the ground ahead
      goal.set(s.x + Math.sin(yaw) * d, 1.2 + d * 0.38, s.z + Math.cos(yaw) * d)
      aim.set(s.x - Math.sin(yaw) * 2.2, 0.9, s.z - Math.cos(yaw) * 2.2)
    }
    const lerp = snapped.current ? Math.min(1, dt * (overhead ? 2.5 : 6)) : 1
    snapped.current = true
    camera.position.lerp(goal, lerp)
    look.lerp(aim, lerp)
    camera.lookAt(look)
  })
  return null
}
