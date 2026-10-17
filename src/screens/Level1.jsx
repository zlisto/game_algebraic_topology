import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useState } from 'react'
import * as THREE from 'three'

const WALKWAYS = [
  { id: 'north', label: 'North walkway', position: [0, 0.35, -1.6], size: [2.4, 0.55, 0.9] },
  { id: 'east', label: 'East walkway', position: [1.7, 0.35, 0.3], size: [0.9, 0.55, 2.2] },
  { id: 'west', label: 'West walkway', position: [-1.7, 0.35, 0.3], size: [0.9, 0.55, 2.2] },
]

function Spine({ position, size }) {
  return (
    <mesh position={[position[0], 0.06, position[2]]}>
      <boxGeometry args={[size[0] * 0.35, 0.08, size[2] * 0.35]} />
      <meshStandardMaterial color="#f0b27a" emissive="#6a4010" emissiveIntensity={0.5} />
    </mesh>
  )
}

function Walkway({ data, progress, active, onPointerDown }) {
  // progress 0 = thick walkway, 1 = collapsed onto spine
  const scaleY = THREE.MathUtils.lerp(1, 0.18, progress)
  const scaleXZ = THREE.MathUtils.lerp(1, 0.42, progress)
  const y = THREE.MathUtils.lerp(data.position[1], 0.12, progress)

  return (
    <group>
      <Spine position={data.position} size={data.size} />
      <mesh
        position={[data.position[0], y, data.position[2]]}
        scale={[scaleXZ, scaleY, scaleXZ]}
        onPointerDown={(e) => {
          e.stopPropagation()
          onPointerDown(data.id)
        }}
      >
        <boxGeometry args={data.size} />
        <meshStandardMaterial
          color={active ? '#5ee0d2' : progress >= 1 ? '#2f6b63' : '#3d5a66'}
          emissive={active ? '#1a6b63' : '#000000'}
          emissiveIntensity={active ? 0.7 : 0}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  )
}

function ReefScene({ progress, activeId, holding, onPointerDown, setProgress }) {
  useFrame((_, dt) => {
    if (!holding || !activeId) return
    setProgress((prev) => {
      const next = { ...prev }
      next[activeId] = Math.min(1, (next[activeId] || 0) + Math.min(dt, 0.05) * 0.55)
      return next
    })
  })

  return (
    <>
      <color attach="background" args={['#0a1216']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={1.15} />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#3ecfbf" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#152028" />
      </mesh>

      {/* beacon */}
      <mesh position={[0, 0.15, 1.8]}>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#3ecfbf" emissive="#1a6b63" emissiveIntensity={1.2} />
      </mesh>

      {WALKWAYS.map((w) => (
        <Walkway
          key={w.id}
          data={w}
          progress={progress[w.id] || 0}
          active={holding && activeId === w.id}
          onPointerDown={onPointerDown}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.3, 0]}
      />
    </>
  )
}

export default function Level1({ concept, onBackToTitle, onReplayIntro }) {
  const level = useMemo(() => {
    return (concept?.levels || []).find((l) => l.level_number === 1) || {
      title: 'A Good Deformation',
      goal: 'Deformation-retract the walkways onto their spines without tearing.',
      teaches: 'Continuous deformation versus tearing; deformation retractions.',
    }
  }, [concept])

  const [progress, setProgress] = useState({ north: 0, east: 0, west: 0 })
  const [activeId, setActiveId] = useState(null)
  const [holding, setHolding] = useState(false)

  const doneCount = WALKWAYS.filter((w) => (progress[w.id] || 0) >= 1).length
  const won = doneCount >= WALKWAYS.length

  return (
    <div
      className="screen"
      onPointerUp={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
    >
      <Canvas camera={{ position: [5.5, 4.2, 5.5], fov: 42 }} dpr={[1, 1.5]}>
        <ReefScene
          progress={progress}
          activeId={activeId}
          holding={holding && !won}
          onPointerDown={(id) => {
            if (won) return
            setActiveId(id)
            setHolding(true)
          }}
          setProgress={setProgress}
        />
      </Canvas>

      <div className="ui-overlay">
        <div className="hint">Hold a walkway to retract it onto its amber spine</div>
        <div className="hud-top">
          <button type="button" className="btn" onClick={onBackToTitle}>
            Title
          </button>
          <button type="button" className="btn" onClick={onReplayIntro}>
            Replay intro
          </button>
        </div>

        <div className="level-panel">
          <h2>Level 1 — {level.title}</h2>
          <p>{level.goal}</p>
          <ul className="progress-list">
            {WALKWAYS.map((w) => {
              const p = progress[w.id] || 0
              return (
                <li key={w.id} className={p >= 1 ? 'done' : ''}>
                  <span>{w.label}</span>
                  <span>{p >= 1 ? 'retracted' : `${Math.round(p * 100)}%`}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {won && (
        <div className="win-banner">
          <div className="win-card">
            <h2>Reef held</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
              Valid deformation retractions — spines stayed fixed. The route survives.
            </p>
            <div className="btn-row">
              <button type="button" className="btn primary" onClick={onBackToTitle}>
                Back to title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
