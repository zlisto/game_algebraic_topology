import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Part, preloadModels } from './models'

preloadModels('wren')

/**
 * Wren, Ansel's daughter (the prologue): a girl of about twelve in a yellow oilskin raincoat, hood up, a post
 * satchel across her body, red boots, a lantern in her left hand. Sculpted in Blender (tools/wren_blender.py →
 * public/models/wren.glb). About 1.3 units tall at scale 1, facing +z.
 *
 * `script(t)` → { pos:[x,y,z], rotY, walk 0..1, run 0..1, skip 0..1 (a child's hop-step), flail 0..1 (arms
 *   windmilling, legs kicking: losing her balance, falling), tilt (sideways lean, radians; negative leans to her +x),
 *   pitch (forward tumble, radians), lantern 0..1 (its glow), wave 0..1 (right hand up), visible }
 */
const lerp = THREE.MathUtils.lerp
const GLASS = new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 2.5, toneMapped: false })

export default function Wren({ script, scale = 1 }) {
  const root = useRef()
  const hips = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const lantern = useRef()
  const light = useRef()
  const cur = useRef({ walk: 0, run: 0, wave: 0, skip: 0, flail: 0 })
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t) || {}
    const c = cur.current
    const k = Math.min(1, dt * 6)
    c.walk = lerp(c.walk, s.walk || 0, k)
    c.run = lerp(c.run, s.run || 0, k)
    c.wave = lerp(c.wave, s.wave || 0, k)
    c.skip = lerp(c.skip, s.skip || 0, k)
    c.flail = lerp(c.flail, s.flail || 0, Math.min(1, dt * 10))
    root.current.visible = s.visible !== false
    if (s.pos) root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY || 0
    const f = c.run > 0.1 ? 12 : 7.5
    const amp = c.walk * 0.5 + c.run * 0.9
    const ph = Math.sin(t * f)
    // skipping: a hop on each step, the free knee kicked up in front, arms swinging high
    const sk = Math.sin(t * 13)
    const kick = (x) => -Math.max(0, x) * 1.1
    const fl = c.flail
    legL.current.rotation.x = ph * amp + c.skip * kick(sk) + Math.sin(t * 11) * 0.55 * fl
    legR.current.rotation.x = -ph * amp + c.skip * kick(-sk) - Math.sin(t * 11 + 1) * 0.55 * fl
    hips.current.position.y = 0.62 + Math.abs(Math.cos(t * f)) * 0.025 * (c.walk + c.run * 1.6) + Math.abs(Math.sin(t * 13)) * 0.11 * c.skip
    hips.current.rotation.x = c.run * 0.15 + (s.pitch || 0)
    hips.current.rotation.z = s.tilt || 0
    armR.current.rotation.x = -ph * amp * 0.8 - c.wave * 2.6 + sk * 0.8 * c.skip - fl * (2.3 + Math.sin(t * 14) * 0.9)
    armR.current.rotation.z = -0.12 - c.wave * 0.3 + Math.sin(t * 9) * 0.25 * c.wave + fl * 1.1
    armL.current.rotation.x = -0.35 + ph * amp * 0.4 - sk * 0.5 * c.skip - fl * (2.0 + Math.sin(t * 14 + 2.5) * 0.9)
    armL.current.rotation.z = -0.15 - fl * 1.1
    // the lantern swings from her hand
    lantern.current.rotation.x = 0.35 - ph * amp * 0.5 + Math.sin(t * 2.3) * 0.05
    const glow = s.lantern ?? 1
    GLASS.emissiveIntensity = 0.3 + glow * 1.6
    light.current.intensity = glow * 0.7
  })
  return (
    <group ref={root} scale={scale}>
      <group ref={hips} position={[0, 0.62, 0]}>
        <Part model="wren" name="wr_body" />
        {[[-0.07, legL], [0.07, legR]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0, 0]}>
            <Part model="wren" name="wr_leg" />
          </group>
        ))}
        <group ref={armR} position={[0.16, 0.42, 0]}>
          <Part model="wren" name="wr_arm" />
        </group>
        <group ref={armL} position={[-0.16, 0.42, 0]} rotation={[0, 0, -0.15]}>
          <Part model="wren" name="wr_arm" scale={[-1, 1, 1]} />
          <group ref={lantern} position={[0, -0.4, 0.0]}>
            <Part model="wren" name="wr_lantern" mats={{ glass: GLASS }} />
            <pointLight ref={light} position={[0, -0.1, 0]} color="#ffb347" distance={3.5} intensity={1} />
          </group>
        </group>
      </group>
    </group>
  )
}
