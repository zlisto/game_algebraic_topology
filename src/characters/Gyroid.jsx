import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Part, preloadModels } from './models'

preloadModels('gyroid')

/**
 * Gyroid — a jointed rig modeled on assets/characters/gyroid.png, its parts sculpted in Blender
 * (tools/gyroid_blender.py → public/models/gyroid.glb, one part per joint):
 * teal perforated sea-glass armor, amber visor, swept blond hair,
 * coral scarf, brass anchor spool on the hip.
 *
 * `script(t)` → { pos:[x,y,z], rotY, run, cast, loop, loopDrop }
 *   run / cast: 0..1 pose weights (idle fills the rest)
 *   loop: 0..1 radius of the anchored loop; loopDrop: 0..1 loop settles to the ground
 */





function Scarf({ runRef }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(0.24, 1.1, 2, 24), [])
  const base = useMemo(() => {
    const a = geo.attributes.position.array.slice()
    return a
  }, [geo])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const run = runRef.current
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1] // -0.55..0.55
      const u = (0.55 - by) / 1.1 // 0 at knot, 1 at tip
      const len = u * 1.1
      const stream = 0.35 + run * 0.65
      const x = bx + Math.sin(t * 6 - u * 5) * 0.12 * u
      const y = -len * (1 - stream) * 0.8 - len * 0.25 + Math.sin(t * 9 - u * 7) * 0.09 * u
      const z = -len * stream - 0.02
      pos.setXYZ(i, x, y, z)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })
  return (
    <mesh geometry={geo} position={[0, 0.02, -0.12]}>
      <meshStandardMaterial color="#e0604f" roughness={0.7} side={THREE.DoubleSide} emissive="#3a0d08" />
    </mesh>
  )
}

function AnchorLoop({ loopRef }) {
  const ring = useRef()
  const pins = useRef()
  useFrame(({ clock }) => {
    const { loop, loopDrop } = loopRef.current
    if (!ring.current) return
    const r = Math.max(0.001, loop * 2.4)
    ring.current.visible = loop > 0.001
    ring.current.scale.setScalar(r)
    ring.current.position.y = THREE.MathUtils.lerp(1.0, 0.04, loopDrop)
    ring.current.rotation.z = clock.elapsedTime * 0.6
    ring.current.material.emissiveIntensity = 2.2 + Math.sin(clock.elapsedTime * 5) * 0.4
    pins.current.visible = loopDrop > 0.6
    pins.current.scale.setScalar(Math.min(1, (loopDrop - 0.6) / 0.4))
  })
  return (
    <group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.018, 8, 96]} />
        <meshStandardMaterial color="#ffcf7a" emissive="#ffb347" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <group ref={pins}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4
          return (
            <mesh key={i} position={[Math.cos(a) * 2.4, 0.18, Math.sin(a) * 2.4]}>
              <coneGeometry args={[0.07, 0.4, 6]} />
              <meshStandardMaterial color="#ffb347" emissive="#ff9a1f" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

const lerp = THREE.MathUtils.lerp

export default function Gyroid({ script, scale = 1 }) {
  const root = useRef()
  const hips = useRef()
  const torso = useRef()
  const head = useRef()
  const j = {
    shL: useRef(), shR: useRef(), elL: useRef(), elR: useRef(),
    thL: useRef(), thR: useRef(), knL: useRef(), knR: useRef(),
  }
  const spool = useRef()
  // the visor glows brighter as he casts (the game's own material, swapped in by name)
  const visorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffb04a', emissive: '#ff9c2a', emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.15, toneMapped: false }), [])
  const runRef = useRef(0)
  const loopRef = useRef({ loop: 0, loopDrop: 0 })
  const cur = useRef({})

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const s = script(t)
    root.current.position.set(...s.pos)
    root.current.rotation.y = s.rotY
    runRef.current = s.run
    loopRef.current = { loop: s.loop || 0, loopDrop: s.loopDrop || 0 }

    const run = s.run
    const cast = s.cast * (1 - run)
    const idle = Math.max(0, 1 - run - cast)
    const ph = t * 11
    const sn = Math.sin(ph)
    const cs = Math.cos(ph)
    const breathe = Math.sin(t * 2.2)

    // target angles: idle / run / cast blended
    const tgt = {
      lean: idle * 0.04 + run * 0.32 + cast * -0.12,
      twist: run * sn * 0.18,
      bob: run * Math.abs(sn) * 0.08 + idle * breathe * 0.01,
      headX: idle * -0.05 + run * -0.22 + cast * -0.15,
      headY: idle * Math.sin(t * 0.7) * 0.15 + cast * 0.25,
      shLx: idle * 0.05 + run * sn * 0.9 + cast * -0.3,
      shLz: idle * 0.22 + run * 0.12 + cast * 1.1,
      shRx: idle * 0.05 + run * -sn * 0.9 + cast * -2.5,
      shRz: idle * -0.22 + run * -0.12 + cast * -0.15,
      elL: idle * -0.25 + run * -1.35 + cast * -0.35,
      elR: idle * -0.25 + run * -1.35 + cast * -0.1,
      thLx: idle * 0.08 + run * -sn * 0.95 + cast * -0.25,
      thLz: idle * 0.1 + cast * 0.22,
      thRx: idle * -0.12 + run * sn * 0.95 + cast * 0.35,
      thRz: idle * -0.1 + cast * -0.2,
      knL: idle * 0.12 + run * (0.25 + Math.max(0, cs) * 1.5) + cast * 0.35,
      knR: idle * 0.2 + run * (0.25 + Math.max(0, -cs) * 1.5) + cast * 0.15,
    }
    // whip: wind the lash arm up and back, then crack it forward and down (overrides the arm)
    const wp = s.whip || 0
    if (wp > 0) {
      const strike = wp < 0.3 ? 0 : (wp - 0.3) / 0.7
      tgt.shRx = wp < 0.3 ? lerp(0, -2.9, wp / 0.3) : lerp(-2.9, -0.7, Math.min(1, strike * 1.6))
      tgt.shRz = -0.25
      tgt.elR = wp < 0.3 ? -1.2 : -0.15
      tgt.twist = wp < 0.3 ? 0.35 : -0.3
      tgt.lean = 0.18
    }
    const k = Math.min(1, dt * (wp > 0 ? 30 : 14))
    const c = cur.current
    for (const key in tgt) c[key] = c[key] === undefined ? tgt[key] : lerp(c[key], tgt[key], k)

    hips.current.position.y = 1.04 + c.bob - cast * 0.08
    hips.current.rotation.y = c.twist
    torso.current.rotation.x = c.lean
    torso.current.rotation.y = -c.twist * 1.4
    torso.current.scale.y = 1 + breathe * 0.01
    head.current.rotation.x = c.headX
    head.current.rotation.y = c.headY
    j.shL.current.rotation.set(c.shLx, 0, c.shLz)
    j.shR.current.rotation.set(c.shRx, 0, c.shRz)
    j.elL.current.rotation.x = c.elL
    j.elR.current.rotation.x = c.elR
    j.thL.current.rotation.set(c.thLx, 0, c.thLz)
    j.thR.current.rotation.set(c.thRx, 0, c.thRz)
    j.knL.current.rotation.x = c.knL
    j.knR.current.rotation.x = c.knR
    spool.current.rotation.x += dt * (1 + run * 6 + (s.loop > 0 && s.loop < 1 ? 25 : 0))
    visorMat.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.2 + cast * 1.2
  })

  return (
    <group ref={root} scale={scale}>
      <AnchorLoop loopRef={loopRef} />
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      <group ref={hips} position={[0, 1.04, 0]}>
        <Part model="gyroid" name="gy_hips" />
        <group position={[0.24, -0.02, 0.05]}>
          <group ref={spool} rotation={[0, 0, Math.PI / 2]}>
            <Part model="gyroid" name="gy_spool" />
          </group>
        </group>

        {/* legs */}
        {[
          ['L', 0.13, j.thL, j.knL],
          ['R', -0.13, j.thR, j.knR],
        ].map(([side, x, th, kn]) => (
          <group key={side} ref={th} position={[x, -0.08, 0]}>
            <Part model="gyroid" name="gy_thigh" scale={[side === 'L' ? 1 : -1, 1, 1]} />
            <group ref={kn} position={[0, -0.5, 0]}>
              <Part model="gyroid" name="gy_shin" scale={[side === 'L' ? 1 : -1, 1, 1]} />
            </group>
          </group>
        ))}

        {/* torso */}
        <group ref={torso} position={[0, 0.08, 0]}>
          <Part model="gyroid" name="gy_torso" />
          {/* neck, scarf, head */}
          <group position={[0, 0.55, 0]}>
            <Part model="gyroid" name="gy_neck" />
            <Scarf runRef={runRef} />
            <group ref={head} position={[0, 0.14, 0]}>
              <Part model="gyroid" name="gy_head" mats={{ visor: visorMat }} />
            </group>
          </group>

          {/* arms */}
          {[
            ['L', 0.33, j.shL, j.elL],
            ['R', -0.33, j.shR, j.elR],
          ].map(([side, x, sh, el]) => {
            const m = [side === 'L' ? 1 : -1, 1, 1]
            return (
              <group key={side} position={[x, 0.45, 0]}>
                <Part model="gyroid" name="gy_pauldron" scale={m} />
                <group ref={sh}>
                  <Part model="gyroid" name="gy_upperarm" scale={m} />
                  <group ref={el} position={[0, -0.32, 0]}>
                    <Part model="gyroid" name="gy_forearm" scale={m} />
                  </group>
                </group>
              </group>
            )
          })}
        </group>
      </group>
    </group>
  )
}
