import { useRef } from 'react'
import * as THREE from 'three'
import CommutatorRig from '../../characters/CommutatorRig'

/**
 * The Commutator in the ending: the shared sculpted rig (characters/CommutatorRig.jsx), about 1.8 units tall.
 * `script(t)` → { pos:[x,y,z], rotY, salute }   salute: 0 blade lowered … 1 blade raised before his face
 */
export default function Commutator({ script, scale = 1 }) {
  const cur = useRef({ salute: 0 })
  const pose = (t, dt) => {
    const s = script(t) || {}
    const c = cur.current
    c.salute += ((s.salute || 0) - c.salute) * Math.min(1, dt * 4)
    return {
      pos: s.pos,
      rotY: s.rotY,
      bob: Math.sin(t * 1.4) * 0.012,
      armRx: THREE.MathUtils.lerp(0.25, -1.9, c.salute),
      armRz: THREE.MathUtils.lerp(-0.25, 0.35, c.salute),
    }
  }
  return <CommutatorRig pose={pose} scale={scale * 0.92} />
}
