import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo } from 'react'
import * as THREE from 'three'
import MathText from '../../screens/MathText'
import { seg, smooth, mix3 } from '../../levels/w2/movieKit'

/** Camera that eases through `shots`: [start, end, [fromPos, fromLook], [toPos, toLook]]. */
export function ShotCamera({ tRef, shots }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = shots.find((s) => t >= s[0] && t < s[1]) || shots[shots.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(from[0], to[0], k))
    look.set(...mix3(from[1], to[1], k))
    camera.lookAt(look)
  })
  return null
}

export function MovieFx() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
      <Vignette offset={0.25} darkness={0.6} />
    </EffectComposer>
  )
}

/** A lesson side card: title plus short lines ($…$ for math). */
export function LessonCard({ title, lines }) {
  return (
    <div className="lesson-card">
      <h3 className="lesson-title">{title}</h3>
      {lines.map((l) => (
        <p key={l}>
          <MathText text={l} />
        </p>
      ))}
    </div>
  )
}

/** Lesson overlay from a list of [from, to, title, lines] beats plus a closing summary. */
export function LessonBeats({ t, beats, summary }) {
  return (
    <div className="lesson-overlay">
      {beats.map(([a, b, title, lines]) => t >= a && t < b && <LessonCard key={title} title={title} lines={lines} />)}
      {summary && t >= summary.t && (
        <div className="lesson-card lesson-steps">
          <h3 className="lesson-title">{summary.title}</h3>
          <ul>
            {summary.items.map((i) => (
              <li key={i}>
                <MathText text={i} />
              </li>
            ))}
          </ul>
          <p className="lesson-note">{summary.cite}</p>
        </div>
      )}
    </div>
  )
}

/** Is t inside any of the [a, b] windows? (for talk/gesture timing) */
export const within = (t, spans) => spans.some(([a, b]) => t > a && t < b)

/** The standard lesson layout used across World 2: the deck sits left of centre, above the captions. */
export const LESSON_SHOTS = [
  [0, 58, [[-0.4, 11.6, 11.8], [2.2, -0.8, 1.8]], [[0.4, 11.2, 11.4], [2.2, -0.8, 1.8]]],
  [58, 64, [[3, 8, 11], [1.6, -0.4, 1.6]], [[2, 8.2, 11.4], [1.6, -0.4, 1.6]]],
  [64, 80, [[0, 10, 13], [1.4, 0, 1]], [[0, 12, 16], [1.4, 0, 1]]],
]
