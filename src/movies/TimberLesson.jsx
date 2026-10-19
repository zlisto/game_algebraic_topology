import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { DevAdvance } from '../levels/w0/OverworldScene'
import { LiveLine } from '../levels/w0/FlatsScenery'
import { petalPath } from '../levels/w0/graphs'
import { GraphView, Yard } from '../levels/w0/TimberScene'
import layout from '../world/timberyard.json'

/**
 * "Felling Trees" (videos.json level-0-6-lesson): collapsing trees in graphs, slowly.
 *   A 0–10   one walkway with two different ends shrinks; the far platform slides onto the near
 *   B 10–20  a tree: amber walkways reach every platform; one more would close a loop — refused
 *   C 20–32  fell the tree: one platform, and the other walkways become petals
 *   D 32–40  the wrong cut: a loop shrinks — and its hole is gone
 *   E 40–48  χ = platforms − walkways, before and after; petals = 1 − χ
 *   F 48–56  how to play; G 56–62 summary
 * The diagram (TimberLessonOverlay) runs on the same clock.
 */

const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const ORIGIN = [-0.6, 0.4]
const ONE = layout.sites.find((s) => s.id === 'one_edge').graphs[0]
const THICKET = layout.sites.find((s) => s.id === 'spanning_tree').graphs[0]
const TREE = [0, 1, 2, 3]
const MARK_AT = [11, 12.5, 14, 15.5]

function LessonCamera() {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(1.2, 0, 0.6), [])
  useFrame(() => {
    camera.position.set(1.4, 11.5, 8.6)
    camera.lookAt(look)
  })
  return null
}

/** Re-renders only when the lesson's discrete state changes (which walkways are marked, felled or not). */
function useStage(tRef, fn) {
  const [stage, setStage] = useState(() => fn(tRef.current))
  const last = useRef(JSON.stringify(stage))
  useFrame(() => {
    const s = fn(tRef.current)
    const k = JSON.stringify(s)
    if (k !== last.current) {
      last.current = k
      setStage(s)
    }
  })
  return stage
}

export default function TimberLesson({ tRef }) {
  const kOne = useRef(0)
  const kThicket = useRef(0)
  const kWrong = useRef(0)
  const stage = useStage(tRef, (t) => ({
    show: t < 10 ? 'one' : t < 32 || (t >= 40 && t < 48) || t >= 56 ? 'thicket' : t < 40 ? 'wrong' : 'none',
    marked: TREE.filter((_, i) => t >= MARK_AT[i]),
    felled: t >= 20,
    refused: t >= 17 && t < 19.5,
    oneFelled: t >= 3,
  }))
  useFrame(() => {
    const t = tRef.current
    kOne.current = seg(t, 3, 6.5)
    kThicket.current = t >= 20 ? seg(t, 21, 24.5) : 0
    kWrong.current = seg(t, 34, 38)
  })
  // B: the refused walkway flashes red
  const refusedPts = () => {
    if (!stage.refused) return null
    const [a, b] = [THICKET.nodes[3], THICKET.nodes[4]]
    return [
      [a[0], a[1], 0.2],
      [b[0], b[1], 0.2],
    ]
  }
  // D: a lone loop that shrinks away — its hole goes with it
  const wrongLoop = () => {
    const k = kWrong.current
    if (k >= 0.999) return null
    return petalPath([0, 0.9], -Math.PI / 2, 32, 2.2 * (1 - k)).map(([x, z]) => [x, z, 0.14])
  }
  return (
    <>
      <Yard />
      <mesh position={[ORIGIN[0], -0.25, ORIGIN[1]]}>
        <cylinderGeometry args={[4.2, 4.2, 0.4, 48]} />
        <meshStandardMaterial color="#4a3324" roughness={0.85} />
      </mesh>

      {stage.show === 'one' && <GraphView graph={ONE} origin={ORIGIN} marked={[0]} tree={stage.oneFelled ? [0] : null} fellK={kOne} bitten={[]} current />}
      {stage.show === 'thicket' && <GraphView graph={THICKET} origin={ORIGIN} marked={stage.marked} tree={stage.felled ? TREE : null} fellK={kThicket} bitten={[]} current />}
      <group position={[ORIGIN[0], 0, ORIGIN[1]]}>
        <LiveLine getPts={refusedPts} color="#ff4a5a" width={10} />
        {stage.show === 'wrong' && (
          <>
            <LiveLine getPts={wrongLoop} color="#b070ff" width={9} />
            <mesh position={[0, 0.1, 0.9]}>
              <cylinderGeometry args={[0.42, 0.46, 0.2, 18]} />
              <meshStandardMaterial color="#a07040" roughness={0.7} />
            </mesh>
          </>
        )}
      </group>

      <LessonCamera />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.65} />
      </EffectComposer>
    </>
  )
}

// ---------------------------------------------------------------- the 2D diagram

const GOLD = '#ffd27a'
const INK = '#e8eefc'
const SOFT = '#9fb0d0'
const MATH = { fontFamily: "'Cambria Math', 'STIX Two Math', serif" }

function Card({ title, rows, foot }) {
  return (
    <svg viewBox="0 0 260 180" className="lesson-svg">
      <text x="130" y="30" textAnchor="middle" fill={GOLD} fontSize="17" style={MATH}>
        {title}
      </text>
      {rows.map(([a, b], i) => (
        <g key={i}>
          <text x="18" y={66 + i * 28} fill={INK} fontSize="14.5" style={MATH}>
            {a}
          </text>
          <text x="242" y={66 + i * 28} fill={SOFT} fontSize="12" textAnchor="end">
            {b}
          </text>
        </g>
      ))}
      {foot && (
        <text x="130" y="168" textAnchor="middle" fill={SOFT} fontSize="11.5">
          {foot}
        </text>
      )}
    </svg>
  )
}

function Diagram({ t }) {
  if (t < 10) return <Card title="shrink a walkway" rows={[['two different ends', 'one slides onto the other'], ['an edge ≃ a point', 'nothing is lost'], ['2 − 1 = 1 − 0', 'platforms − walkways']]} foot="Hatcher, Example 0.7" />
  if (t < 20) return <Card title="a tree" rows={[['reaches every platform', ''], ['never closes a loop', ''], ['5 platforms → 4 walkways', 'a tree has one fewer']]} foot="a tree shrinks to a point" />
  if (t < 32) return <Card title="fell the tree: X / T" rows={[['all platforms → one', ''], ['other walkways → loops', 'petals'], ['a bouquet of circles', 'S¹ ∨ S¹ ∨ S¹']]} foot="collapsing a contractible piece: Prop. 0.17" />
  if (t < 40) return <Card title="the wrong cut" rows={[['a loop has one end', 'both ends the same'], ['shrink it to a point…', ''], ['…and its hole is gone', 'a different space']]} foot="that's Null's move" />
  if (t < 48) return <Card title="χ = V − E" rows={[['before: 5 − 7', '= −2'], ['after: 1 − 3', '= −2'], ['petals = 1 − χ', '= 3']]} foot="felling a tree never changes χ" />
  return null
}

function Steps({ t }) {
  if (t >= 56)
    return (
      <div className="lesson-steps">
        <h4>Felling trees</h4>
        <p className="lesson-math">graph ≃ bouquet of 1 − χ circles</p>
        <p className="lesson-note">fell a tree that reaches every platform</p>
        <p className="lesson-math">never shrink a loop</p>
        <p className="lesson-note">a loop’s hole would die with it</p>
      </div>
    )
  const steps = [
    ['2', 'the Spool: click walkways to mark a tree', t < 50],
    ['✕', 'a walkway that closes a loop is refused', t >= 50 && t < 51.8],
    ['3', 'the Cell-Smith: click the gold root to fell', t >= 51.8 && t < 53.6],
    ['⚡', 'lash Loop-biters; restring a bitten petal (3)', t >= 53.6],
  ]
  return (
    <div className="lesson-steps">
      <h4>◎ Spool · ✦ Cell-Smith</h4>
      {steps.map(([k, label, on], i) => (
        <div key={i} className={`lesson-step ${on ? 'on' : ''}`}>
          <kbd>{k}</kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

/** The diagram beside the 3D demo. */
export function TimberLessonOverlay({ t }) {
  if (t >= 58.5) return null
  return <div className="lesson-card">{t >= 48 ? <Steps t={t} /> : <Diagram t={t} />}</div>
}
