import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { SPH_R } from './DeltaSet'

/** Shared bits for the World 1 castle movies: easing, a camera rig, a soft glow sprite, shrinking loops. */

export const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
export const smooth = (x) => x * x * (3 - 2 * x)
export const mix = (a, b, k) => a + (b - a) * k
export const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

export const GLOW = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(240,225,255,0.85)')
  r.addColorStop(0.5, 'rgba(180,140,255,0.25)')
  r.addColorStop(1, 'rgba(120,80,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

/**
 * Camera shots: [t0, t1, [from, lookFrom], [to, lookTo]] eased between; or [t0, t1, fn] where
 * fn(t) → [pos, look] for tracking shots. `shake(t)` adds a jolt.
 */
export function ShotCamera({ tRef, shots, shake }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = shots.find((s) => t >= s[0] && t < s[1]) || shots[shots.length - 1]
    let pos
    let at
    if (typeof sh[2] === 'function') [pos, at] = sh[2](t)
    else {
      const k = smooth(seg(t, sh[0], sh[1]))
      pos = mix3(sh[2][0], sh[3][0], k)
      at = mix3(sh[2][1], sh[3][1], k)
    }
    camera.position.set(...pos)
    const j = shake ? shake(t) : 0
    if (j) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * j, (Math.random() - 0.5) * j, (Math.random() - 0.5) * j))
    look.set(...at)
    camera.lookAt(look)
  })
  return null
}

/** A soft additive flash at `position`; `flash(t)` → 0..1 progress (0 or 1 = hidden). */
export function Flash({ tRef, position, flash, size = 20, color = '#f4e8ff' }) {
  const ref = useRef()
  useFrame(() => {
    const f = flash(tRef.current)
    ref.current.visible = f > 0 && f < 1
    ref.current.scale.setScalar(1 + (1 - (1 - f) ** 3) * size)
    ref.current.material.opacity = (1 - f) ** 2
  })
  return (
    <sprite ref={ref} position={position}>
      <spriteMaterial map={GLOW} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

/**
 * A loop drawn on the sphere: the circle at angular radius beta round the direction `dir`
 * (a unit vector from the sphere's centre). As beta → 0 it shrinks to a point: on a sphere every
 * loop does (π₁(S²) = 0). `get(t)` → { beta, center } or null; points come back in LiveLine's [x, z, y].
 */
export function SphereLoop({ tRef, get, color = '#ffd27a', width = 6, lift = 0.25 }) {
  const tmp = useMemo(() => ({ e1: new THREE.Vector3(), e2: new THREE.Vector3(), d: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), [])
  const pts = () => {
    const g = get(tRef.current)
    if (!g || g.beta <= 0.002) return null
    const { e1, e2, d, up } = tmp
    d.set(...g.dir).normalize()
    e1.copy(Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up).cross(d).normalize()
    e2.copy(d).cross(e1).normalize()
    const R = SPH_R + lift
    const [cx, cy, cz] = g.center
    return Array.from({ length: 73 }, (_, i) => {
      const p = (i / 72) * Math.PI * 2
      const cb = Math.cos(g.beta)
      const sb = Math.sin(g.beta)
      const x = R * (cb * d.x + sb * (Math.cos(p) * e1.x + Math.sin(p) * e2.x))
      const y = R * (cb * d.y + sb * (Math.cos(p) * e1.y + Math.sin(p) * e2.y))
      const z = R * (cb * d.z + sb * (Math.cos(p) * e1.z + Math.sin(p) * e2.z))
      return [cx + x, cz + z, cy + y]
    })
  }
  return <LiveLine getPts={pts} color={color} width={width} />
}
