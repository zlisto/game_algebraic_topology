import { useRef } from 'react'
import * as THREE from 'three'
import CommutatorRig from '../../characters/CommutatorRig'

/**
 * The Commutator in World 4 (the Crown): the shared sculpted rig (characters/CommutatorRig.jsx).
 * `script(t)` → { pos:[x,y,z], rotY, lunge (0..1), glow (0..1), walk (0..1), visible }
 */
export default function Commutator({ script, scale = 1 }) {
  const cur = useRef({ lunge: 0 })
  const pose = (t, dt) => {
    const s = script(t)
    if (!s) return { visible: false }
    const c = cur.current
    c.lunge = THREE.MathUtils.lerp(c.lunge, s.lunge || 0, Math.min(1, dt * 14))
    const w = s.walk || 0
    return {
      pos: s.pos,
      rotY: s.rotY,
      visible: s.visible,
      armRx: -0.5 - c.lunge * 1.1,
      armRz: -0.25 + c.lunge * 0.2,
      legL: Math.sin(t * 9) * 0.6 * w + c.lunge * -0.5,
      legR: -Math.sin(t * 9) * 0.6 * w + c.lunge * 0.5,
      bob: Math.abs(Math.sin(t * 9)) * 0.05 * w,
      glow: s.glow,
    }
  }
  return <CommutatorRig pose={pose} scale={scale} />
}
