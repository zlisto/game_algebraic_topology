import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { INTRO_BEATS, INTRO_TOTAL } from '../data/introScript'

function CollapseWorld({ phase }) {
  const group = useRef()
  const spheres = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      position: [
        Math.sin(i * 1.7) * (2.2 + (i % 3) * 0.35),
        Math.cos(i * 0.9) * 1.1,
        Math.cos(i * 1.3) * 1.8 - 1,
      ],
      scale: 0.25 + (i % 4) * 0.08,
    }))
  }, [])

  useFrame((_, dt) => {
    if (!group.current) return
    group.current.rotation.y += dt * (phase === 'collapse' ? 0.35 : 0.12)
  })

  const collapsing = phase === 'collapse' || phase === 'escape' || phase === 'handoff'
  const holeScale = collapsing ? 0.15 : 1

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <torusGeometry args={[2.4, 0.08, 12, 64]} />
        <meshStandardMaterial
          color="#3ecfbf"
          emissive="#1a6b63"
          emissiveIntensity={phase === 'world' ? 0.6 : 1.2}
        />
      </mesh>

      {spheres.map((s) => (
        <mesh key={s.id} position={s.position} scale={s.scale * (collapsing ? 0.55 : 1)}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={collapsing ? '#3a2048' : '#2a3540'}
            emissive={collapsing ? '#6b2d8a' : '#000000'}
            emissiveIntensity={collapsing ? 0.8 : 0}
            wireframe={collapsing && s.id % 2 === 0}
          />
          {/* “hole” cue */}
          <mesh scale={[holeScale, holeScale, holeScale]} position={[0.35, 0.2, 0.4]}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshBasicMaterial color="#0a1012" />
          </mesh>
        </mesh>
      ))}

      {/* Null Crown cue */}
      <mesh position={[0, 2.1, -1.2]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.55, 0.06, 8, 6]} />
        <meshStandardMaterial
          color="#1a1218"
          emissive="#7a3cff"
          emissiveIntensity={phase === 'threat' || phase === 'collapse' ? 2.2 : 0.4}
        />
      </mesh>
      <mesh position={[0, 2.1, -1.2]}>
        <coneGeometry args={[0.12, 0.45, 5]} />
        <meshStandardMaterial color="#0d0a10" emissive="#5a2a9a" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

function IntroScene({ phase }) {
  return (
    <>
      <color attach="background" args={['#070b0e']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} color="#cfe8e4" />
      <pointLight position={[-2, 2, 2]} intensity={phase === 'collapse' ? 2 : 0.8} color="#a86bff" />
      <CollapseWorld phase={phase} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#0c1216" />
      </mesh>
    </>
  )
}

export default function IntroCutscene({ onSkipIntro, onIntroDone }) {
  const [elapsed, setElapsed] = useState(0)
  const started = useRef(performance.now())

  useEffect(() => {
    let raf
    const tick = () => {
      const t = (performance.now() - started.current) / 1000
      setElapsed(t)
      if (t >= INTRO_TOTAL) {
        onIntroDone?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onIntroDone])

  const beat =
    INTRO_BEATS.find((b) => elapsed >= b.t && elapsed < b.t + b.duration) ||
    INTRO_BEATS[INTRO_BEATS.length - 1]

  return (
    <div className="screen">
      <Canvas camera={{ position: [0, 1.2, 6.5], fov: 45 }} dpr={[1, 1.5]}>
        <IntroScene phase={beat.phase} />
      </Canvas>

      <div className="ui-overlay">
        <div className="hud-top">
          <div />
          <button type="button" className="btn" onClick={onSkipIntro}>
            Skip intro
          </button>
        </div>
        <div className="hud-bottom">
          <div className="caption">
            <span className="speaker">{beat.speaker}</span>
            <p>{beat.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
