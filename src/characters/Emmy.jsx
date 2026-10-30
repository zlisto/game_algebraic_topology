import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Part, preloadModels } from './models'

preloadModels('emmy')
// the goggles' amber lenses glow in every light
const LENS = new THREE.MeshBasicMaterial({ color: '#ffb347', toneMapped: false })

/**
 * Emmy Boundary — a jointed figure modeled on assets/characters/emmy-boundary.png, sculpted in Blender
 * (tools/emmy_blender.py → public/models/emmy.glb, one part per joint):
 * a long blue-and-indigo patchwork coat of triangles with gold seams and a high collar,
 * brass shoulder plates and gauntlets, a tool belt with pouches, dark teal trousers,
 * brown boots, a cloud of silver curls, round amber goggles and gold hoops, and the
 * glowing triangle (her maker's mark) she conjures above her palm.
 *
 * `script(t)` → { pos:[x,y,z], rotY, walk, gesture, bow, talk }
 *   walk:    0 standing … 1 walking
 *   gesture: 0 hands at rest … 1 palm raised with the glowing triangle
 *   bow:     0 … 1 head lowered (the confession)
 *   talk:    0 … 1 a small speaking nod
 */


export default function Emmy({ script, scale = 1 }) {
  const root = useRef()
  const hips = useRef()
  const torso = useRef()
  const head = useRef()
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const foreL = useRef()
  const mark = useRef()
  const cur = useRef({ walk: 0, gesture: 0, bow: 0 })
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    const c = cur.current
    const k = Math.min(1, dt * 6)
    c.walk += ((s.walk || 0) - c.walk) * k
    c.gesture += ((s.gesture || 0) - c.gesture) * Math.min(1, dt * 4)
    c.bow += ((s.bow || 0) - c.bow) * Math.min(1, dt * 3)
    root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY || 0
    const step = Math.sin(t * 7.5) * c.walk
    legL.current.rotation.x = step * 0.5
    legR.current.rotation.x = -step * 0.5
    hips.current.position.y = 0.82 + Math.abs(Math.cos(t * 7.5)) * 0.03 * c.walk
    torso.current.rotation.x = 0.04 + c.bow * 0.12
    head.current.rotation.x = c.bow * 0.45 - (s.talk || 0) * Math.max(0, Math.sin(t * 9)) * 0.06
    head.current.rotation.y = Math.sin(t * 0.6) * 0.12 * (1 - c.bow)
    // left hand on her hip, right palm raised for the mark (or swinging when she walks)
    armL.current.rotation.z = 0.55 - c.gesture * 0.1
    armL.current.rotation.x = -step * 0.3
    foreL.current.rotation.x = -1.2
    armR.current.rotation.x = -c.gesture * 1.1 + step * 0.3
    armR.current.rotation.z = -0.25 - c.gesture * 0.2
    mark.current.visible = c.gesture > 0.4
    mark.current.position.y = 0.55 + Math.sin(t * 2) * 0.03
    mark.current.rotation.y = t * 1.4
    mark.current.scale.setScalar(Math.max(0.01, (c.gesture - 0.4) / 0.6))
  })

  return (
    // scale sizes her like Gyroid's prop does; her script's pos stays in the parent's units
    <group ref={root} scale={scale}>
      <group ref={hips} position={[0, 0.82, 0]}>
        {/* legs: teal trousers into brown boots */}
        {[
          [legL, -0.1],
          [legR, 0.1],
        ].map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0, 0]}>
            <Part model="emmy" name="em_leg" />
          </group>
        ))}
        <group ref={torso}>
          {/* the patchwork coat, collar, tunic, tool belt, brass shoulder plates and neck */}
          <Part model="emmy" name="em_torso" />
          {/* arms: coat sleeves, brass gauntlets */}
          <group ref={armL} position={[-0.25, 0.42, 0]}>
            <Part model="emmy" name="em_sleeve" scale={[-1, 1, 1]} />
            <group ref={foreL} position={[0, -0.3, 0]}>
              <Part model="emmy" name="em_forearm" scale={[-1, 1, 1]} />
            </group>
          </group>
          <group ref={armR} position={[0.25, 0.42, 0]}>
            <Part model="emmy" name="em_sleeve" />
            <group position={[0, -0.3, 0]}>
              <Part model="emmy" name="em_forearm" />
            </group>
            {/* her maker's mark, above the raised palm */}
            <group ref={mark} position={[0, -0.6, 0.0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.09, 0.012, 3, 3]} />
                <meshBasicMaterial color="#ffd27a" toneMapped={false} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.085, 3]} />
                <meshBasicMaterial color="#7fe8dc" transparent opacity={0.55} toneMapped={false} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
          <group ref={head} position={[0, 0.72, 0]}>
            <Part model="emmy" name="em_head" mats={{ lens: LENS }} />
          </group>
        </group>
      </group>
    </group>
  )
}
