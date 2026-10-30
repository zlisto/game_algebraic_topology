import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { createElement, useMemo, useRef } from 'react'
import Gyroid from '../characters/Gyroid'
import Emmy from '../characters/Emmy'
import CountNull from '../characters/CountNull'
import Commutator from '../castles/w3/Commutator'
import { SPAWN_VIEW } from '../levels/w0/ReefGame'
import { VIEW } from '../codex/CodexMenu'

/**
 * Dev only: one model on a turntable, lit like the game, for checking Blender rebuilds.
 *   ?screen=modelview&m=gyroid|emmy|null|commutator|<beast type>&yaw=0&dist=4&h=1&pose=idle|run|gesture
 */
const q = () => new URLSearchParams(window.location.search)

function Cam({ dist, h, look }) {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.set(0, h, dist)
    camera.lookAt(0, look, 0)
  })
  return null
}

function Turn({ yaw, spin, children }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (spin) g.current.rotation.y += dt * 0.6
  })
  return (
    <group ref={g} rotation={[0, yaw, 0]}>
      {children}
    </group>
  )
}

export default function ModelView() {
  const p = q()
  const m = p.get('m') || 'gyroid'
  const yaw = parseFloat(p.get('yaw') || '0')
  const pose = p.get('pose') || 'idle'
  const spin = p.get('spin') === '1'
  const beast = useMemo(() => ({ x: 0, z: 0, face: 0, alive: true, dying: 0, flash: 0, seed: 1, hp: 3, maxHp: 3, type: m, axis: 0, turns: 2, beam: 0 }), [m])
  const run = pose === 'run' ? 1 : 0
  const g = pose === 'gesture' ? 1 : 0
  let body = null
  let fit = { dist: 4, h: 1.2, look: 0.9 }
  if (m === 'gyroid') body = <Gyroid script={() => ({ pos: [0, 0, 0], rotY: 0, run, cast: g, whip: 0, loop: 0, loopDrop: 0 })} />
  else if (m === 'emmy') body = <Emmy script={() => ({ pos: [0, 0, 0], rotY: 0, walk: run, gesture: g, bow: 0, talk: 0 })} />
  else if (m === 'null') {
    body = <CountNull script={() => ({ gesture: g, crown: 0.3 })} />
    fit = { dist: 7, h: 2.2, look: 1.7 }
  } else if (m === 'commutator') body = <Commutator script={() => ({ gesture: g, cloak: 1, crack: 0 })} />
  else if (VIEW[m] || SPAWN_VIEW[m]) {
    body = createElement(VIEW[m] || SPAWN_VIEW[m], { e: beast })
    fit = { dist: 3.2, h: 1.4, look: 0.7 }
  }
  const dist = parseFloat(p.get('dist') || fit.dist)
  const h = parseFloat(p.get('h') || fit.h)
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d0f18' }}>
      <Canvas camera={{ fov: 40 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#14172a']} />
        <Cam dist={dist} h={h} look={fit.look} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#b8a8ff', '#0a0612', 0.7]} />
        <directionalLight position={[3, 6, 5]} intensity={1.6} />
        <pointLight position={[-3, 2, 2]} intensity={8} distance={10} color="#a259ff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3, 48]} />
          <meshStandardMaterial color="#2a2d3d" />
        </mesh>
        <Turn yaw={yaw} spin={spin}>
          {body}
        </Turn>
      </Canvas>
      <div style={{ position: 'fixed', left: 12, top: 10, color: '#9aa0b1', font: '13px sans-serif' }}>{m}</div>
    </div>
  )
}
