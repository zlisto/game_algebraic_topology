import CommutatorRig from '../../characters/CommutatorRig'

/**
 * The Commutator in World 3 (and the World 1 intro): the shared sculpted rig (characters/CommutatorRig.jsx),
 * a little larger here, as he towers over the Counterfeit Station.
 * `script()` → { gesture 0..1 (rapier raised), cloak 0..1 (the disguise), crack 0..1 (helm cracked),
 *                kneel 0..1, loops 0..1 (his ribbon loops: 1 full, 0 folded away), talk 0|1 }
 */
export default function Commutator({ script, scale = 1 }) {
  const pose = (t) => {
    const s = script() || {}
    return {
      armRx: -0.3 - (s.gesture || 0) * 1.9,
      armRz: -0.15 - Math.sin(t * 1.3) * 0.04,
      cloak: s.cloak ?? 0,
      crack: s.crack || 0,
      kneel: s.kneel || 0,
      loops: s.loops ?? 1,
      nod: s.talk ? Math.sin(t * 9) * 0.015 : 0,
    }
  }
  return <CommutatorRig pose={pose} scale={scale * 1.15} />
}
