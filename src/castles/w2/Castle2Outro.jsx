import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { startFogMusic, startGardensMusic, startNullMusic } from '../../audio/chip'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { Throne } from '../../levels/w0/CastleScene'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { DeltaHall, Retractor } from './Castle2Scene'
import { NULL_AT } from './stagesCastle2'

/**
 * Outro movie for World 2 · Castle, "Twins" (videos2.js OUTRO_VIDEO):
 *   A  0–7      the Retractor seizes; the ball stays whole
 *   B  7–15     Null raises twin islands out of the Delta: a torus with a town on it, and S¹ ∨ S¹ ∨ S²
 *   C  15–23    meters over both light row by row: H₀ = ℤ, H₁ = ℤ², H₂ = ℤ, the same on both
 *   D  23–31.4  “I’ll fold the one you love less.” He chooses the torus.
 *   H1 31.4–34  the Crown’s beam lances out to the torus
 *   H2 34–42    the fold: windows go dark, houses sink, the hole draws shut to a thread; then he
 *               closes his hand and it stops, the torus grey with one light left
 *   H3 42–49.4  Gyroid runs to the rim; Emmy pleads
 *   C2 49.4–56  Null's taunt; he rises north on a violet ribbon, carrying both twins toward the Gardens
 *   D2 56–64    dawn: classes must multiply
 *   E  64–70    “World 2 complete”
 * (The torus is the one Null threatens to finish; 3-4's cup product saves it.)
 */

export const OUTRO_START = startNullMusic
export const OUTRO_MUSIC = [
  { t: 31.4, start: startFogMusic },
  { t: 56, start: startGardensMusic },
]

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
// the torus sits straight out past a gap in the palisade (the plates stand every 20°), so the rim shots can see it
const TT = [22 * Math.cos((-130 * Math.PI) / 180), 22 * Math.sin((-130 * Math.PI) / 180)] // the torus island
const TB = [-TT[0], TT[1]] // the bouquet island
const ISLE = 1.5 // island scale
const GY = [1.4, 2.5] // Gyroid, on the floor
const EM = [-1.4, 3.0] // Emmy
const G_EDGE = (() => {
  const l = Math.hypot(TT[0], TT[1])
  return [(TT[0] / l) * 7.4, (TT[1] / l) * 7.4]
})()
const TO_T = (() => {
  const dx = TT[0] - G_EDGE[0]
  const dz = TT[1] - G_EDGE[1]
  const l = Math.hypot(dx, dz)
  return [dx / l, dz / l]
})()
// H3: Emmy runs to Gyroid's side at the rim, then turns to plead with Null
const EM2 = [G_EDGE[0] - TO_T[0] * 0.6 + TO_T[1] * 1.1, G_EDGE[1] - TO_T[1] * 0.6 - TO_T[0] * 1.1]
const EM_FACE = (() => {
  const dx = NULL_AT[0] - EM2[0]
  const dz = NULL_AT[1] - EM2[1]
  const l = Math.hypot(dx, dz)
  return [dx / l, dz / l]
})()
const NULL_FACE_T = Math.atan2(TT[0] - NULL_AT[0], TT[1] - NULL_AT[1])

/** Where the twins (and Null) are: rising out of the water, then carried off north. */
const rise = (t) => smooth(seg(t, 7.6, 12))
const away = (t) => smooth(seg(t, 53.4, 56.2))
const islandY = (t) => mix(-5.5, -0.9, rise(t)) + away(t) * 13
// north-west, toward the Gardens, clear of the engine
const TT_FAR = [-34, -60]
const TB_FAR = [-20, -66]
const NULL_FAR = [-26, 17, -56]
const nullAt = (t) => {
  const k = away(t)
  return [mix(NULL_AT[0], NULL_FAR[0], k) + Math.sin(k * 3) * 2, mix(0.3, NULL_FAR[1], k), mix(NULL_AT[1], NULL_FAR[2], k)]
}

// the torus's fold: R (from the tube's center to the hole's center) shrinks toward the tube radius
const TUBE = 1.0
const fold = (t) => {
  const k = smooth(seg(t, 35, 40.4))
  return {
    corrupt: seg(t, 34, 39),
    R: mix(3, TUBE * 1.09, k), // halted with a thread of a hole left
    beam: seg(t, 31.8, 32.3) * (1 - seg(t, 40.3, 40.6)),
    halt: seg(t, 40.4, 40.7) * (1 - seg(t, 40.7, 42)),
  }
}

const STONE = new THREE.Color('#8a96b0')
const GREY = new THREE.Color('#2e3038')
const VIOLET = new THREE.Color('#8a3cff')

/** The torus island: a town on a ring of land, lit windows and lanterns, until the Crown takes it. */
function TorusIsland({ tRef }) {
  const group = useRef()
  const mat = useRef()
  const windows = useRef()
  const houses = useRef()
  const glow = useRef()
  const SEG_U = 72
  const SEG_V = 24
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.3, SEG_V, SEG_U), [])
  useFrame(() => {
    const t = tRef.current
    const s = fold(t)
    const pos = geo.attributes.position
    const nor = geo.attributes.normal
    for (let j = 0; j <= SEG_V; j++) {
      const v = (j / SEG_V) * Math.PI * 2
      for (let i = 0; i <= SEG_U; i++) {
        const u = (i / SEG_U) * Math.PI * 2
        const idx = j * (SEG_U + 1) + i
        const w = s.R + TUBE * Math.cos(v)
        pos.setXYZ(idx, w * Math.cos(u), TUBE * Math.sin(v) * 0.9, w * Math.sin(u))
        nor.setXYZ(idx, Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u))
      }
    }
    pos.needsUpdate = true
    nor.needsUpdate = true
    geo.computeBoundingSphere()
    group.current.position.set(mix(TT[0], TT_FAR[0], away(t)), islandY(t), mix(TT[1], TT_FAR[1], away(t)))
    group.current.rotation.y = t * 0.05
    group.current.scale.setScalar(ISLE * (1 - away(t) * 0.4))
    mat.current.color.copy(STONE).lerp(GREY, s.corrupt)
    mat.current.emissive.copy(STONE).lerp(VIOLET, s.corrupt * (1 - seg(t, 40.4, 44) * 0.7))
    mat.current.emissiveIntensity = 0.3 + s.corrupt * 0.1 + Math.max(0, Math.sin(t * 22)) * 0.15 * s.corrupt * (t < 40.4 ? 1 : 0) + s.halt * 2
    const n = windows.current.children.length
    windows.current.children.forEach((w, i) => {
      const a = (i / n) * Math.PI * 2
      const rr = s.R + (i % 2 ? 0.45 : -0.45) * TUBE
      w.position.set(Math.cos(a) * rr, TUBE * 0.5, Math.sin(a) * rr)
      w.rotation.y = -a
      // the lights go out one by one as the violet takes them; one stays lit
      w.visible = i === 0 || s.corrupt < (i % 9) / 9 + 0.04
    })
    houses.current.children.forEach((h, i) => {
      const a = (i / houses.current.children.length) * Math.PI * 2 + 0.2
      const sink = Math.max(0.25, 1 - s.corrupt * 0.9)
      h.position.set(Math.cos(a) * s.R, TUBE * 0.55 + 0.22 * sink - 0.05, Math.sin(a) * s.R)
      h.rotation.y = -a
      h.scale.set(1, sink, 1)
    })
    glow.current.intensity = 6 * (1 - s.corrupt) + s.halt * 40
  })
  return (
    <group ref={group}>
      {/* the islet underneath */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[4.6, 5.2, 0.9, 40]} />
        <meshStandardMaterial color="#1c2040" roughness={0.7} />
      </mesh>
      <mesh geometry={geo}>
        <meshStandardMaterial ref={mat} color="#566070" roughness={0.55} metalness={0.15} emissive="#566070" emissiveIntensity={0.12} />
      </mesh>
      <group ref={windows}>
        {Array.from({ length: 36 }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.1, 0.08, 0.04]} />
            <meshBasicMaterial color="#ffb860" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={houses}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.2, 0.28, 0.18]} />
            <meshStandardMaterial color="#5a5048" roughness={0.7} emissive="#ffb860" emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
      <pointLight ref={glow} position={[0, 2.5, 0]} color="#ffb860" intensity={6} distance={14} />
    </group>
  )
}

/** S¹ ∨ S¹ ∨ S²: two rings and a ball, all tied at one point, on an islet. */
function BouquetIsland({ tRef }) {
  const group = useRef()
  useFrame(() => {
    const t = tRef.current
    group.current.position.set(mix(TB[0], TB_FAR[0], away(t)), islandY(t), mix(TB[1], TB_FAR[1], away(t)))
    group.current.rotation.y = -0.9 + Math.sin(t * 0.2) * 0.15
    group.current.scale.setScalar(ISLE * (1 - away(t) * 0.4))
  })
  const stone = <meshStandardMaterial color="#566070" roughness={0.5} metalness={0.2} emissive="#ffd27a" emissiveIntensity={0.18} />
  const P = 1.0 // height of the wedge point
  return (
    <group ref={group}>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[4.2, 4.8, 0.9, 40]} />
        <meshStandardMaterial color="#1c2040" roughness={0.7} />
      </mesh>
      <mesh position={[-1.25, P, 0]}>
        <torusGeometry args={[1.25, 0.2, 12, 48]} />
        {stone}
      </mesh>
      <mesh position={[1.25, P, 0]}>
        <torusGeometry args={[1.25, 0.2, 12, 48]} />
        {stone}
      </mesh>
      <mesh position={[0, P + 1.1, 0]}>
        <sphereGeometry args={[1.1, 32, 20]} />
        <meshStandardMaterial color="#566070" roughness={0.4} metalness={0.2} emissive="#ffd27a" emissiveIntensity={0.15} transparent opacity={0.85} />
      </mesh>
      {/* the wedge point */}
      <mesh position={[0, P, 0]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <meshBasicMaterial color="#fff2c4" toneMapped={false} />
      </mesh>
      <mesh position={[0, P / 2 - 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.14, P + 0.2, 8]} />
        <meshStandardMaterial color="#2a2238" />
      </mesh>
    </group>
  )
}

const ROWS = [
  [15.6, 'H₀ = ℤ'],
  [16.9, 'H₁ = ℤ²'],
  [18.2, 'H₂ = ℤ'],
]
const METER = {
  minWidth: 132,
  padding: '6px 10px',
  background: 'rgba(10, 6, 22, 0.86)',
  border: '1px solid #ffd27a',
  borderRadius: 7,
  color: '#fff2c4',
  fontSize: 14,
  lineHeight: 1.5,
  textAlign: 'center',
  boxShadow: '0 0 16px rgba(255, 210, 122, 0.35)',
}
/** The census meters over both islands, lighting row by row. */
function Meters({ tRef }) {
  const [n, setN] = useState(-1)
  useFrame(() => {
    const t = tRef.current
    const k = t < 15 || t > 31.4 ? -1 : ROWS.filter(([at]) => t >= at).length
    if (k !== n) setN(k)
  })
  if (n < 0) return null
  return (
    <>
      {[
        [TT, 'the torus T'],
        [TB, 'S¹ ∨ S¹ ∨ S²'],
      ].map(([p, name]) => (
        <Html key={name} position={[p[0], 7.2, p[1]]} center zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
          <div style={METER}>
            <div style={{ fontWeight: 800, color: '#ffd27a', marginBottom: 2 }}>{name}</div>
            {ROWS.map(([, row], i) => (
              <div key={row} style={{ opacity: i < n ? 1 : 0.15 }}>
                {row}
              </div>
            ))}
          </div>
        </Html>
      ))}
    </>
  )
}

/** The Crown's beam, from over Null's head to the torus island. */
function CrownBeam({ tRef }) {
  const ref = useRef()
  const from = useMemo(() => new THREE.Vector3(NULL_AT[0], 3.7, NULL_AT[1]), [])
  const to = useMemo(() => new THREE.Vector3(TT[0], 0.6, TT[1]), [])
  const { mid, quat, len } = useMemo(() => {
    const d = to.clone().sub(from)
    return { mid: from.clone().add(to).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len: d.length() }
  }, [from, to])
  useFrame(() => {
    const t = tRef.current
    const b = fold(t).beam
    ref.current.visible = b > 0.01
    const w = b * (0.7 + Math.sin(t * 40) * 0.3)
    ref.current.scale.set(w, 1, w)
  })
  return (
    <mesh ref={ref} position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.16, 0.5, len, 12, 1, true]} />
      <meshBasicMaterial color="#c79bff" transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/** Far to the north, the Cup Product Gardens: lanterns that light in pairs. */
function GardensGlow({ tRef }) {
  const g = useRef()
  useFrame(() => {
    const t = tRef.current
    const k = seg(t, 52, 56) * (1 - seg(t, 63, 66) * 0.5)
    g.current.visible = k > 0
    g.current.children.forEach((m, i) => {
      m.material.opacity = k * (0.55 + 0.45 * Math.max(0, Math.sin(t * 2 + Math.floor(i / 2) * 1.3)))
    })
  })
  const spots = useMemo(() => Array.from({ length: 24 }, (_, i) => [((i * 37) % 40) - 50 + (i % 2) * 1.2, 1 + ((i * 13) % 7) * 0.6, -84 - ((i * 23) % 14)]), [])
  return (
    <group ref={g}>
      {spots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshBasicMaterial color={i % 2 ? '#7fe8dc' : '#ffd27a'} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Dawn: a warm wash over the night sky, from behind the Gardens. */
function DawnSky({ tRef }) {
  const m = useRef()
  useFrame(() => {
    const k = seg(tRef.current, 56, 63)
    m.current.visible = k > 0
    m.current.material.opacity = k * 0.32
  })
  return (
    <mesh ref={m} position={[-20, -20, -60]}>
      <sphereGeometry args={[120, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshBasicMaterial color="#ff9a6a" side={THREE.BackSide} transparent opacity={0} depthWrite={false} fog={false} />
    </mesh>
  )
}

const SHOTS = [
  [0, 7, [[5.5, 2.2, 3.5], [0, 6.0, -15.5]], [[4.6, 2.4, 1.5], [0, 6.2, -15.5]]],
  [7, 15, [[0, 16, 21], [0, 0, -14]], [[0, 15, 19], [0, 0.5, -14]]],
  [15, 23, [[0, 13.5, 16], [0, 1.5, -16]], [[0, 13, 15], [0, 1.5, -16]]],
  [23, 26.4, [[0.9, 2.5, -3.6], [NULL_AT[0], 2.1, NULL_AT[1]]], [[0.6, 2.4, -4.3], [NULL_AT[0], 2.2, NULL_AT[1]]]],
  [26.4, 29, [[GY[0] + 0.3, 1.35, GY[1] - 1.9], [GY[0], 1.05, GY[1]]], [[GY[0] + 0.2, 1.3, GY[1] - 1.6], [GY[0], 1.05, GY[1]]]],
  [29, 31.4, [[0.6, 2.4, -4.3], [NULL_AT[0], 2.2, NULL_AT[1]]], [[0.4, 2.3, -4.7], [NULL_AT[0], 2.2, NULL_AT[1]]]],
  [31.4, 34, [[NULL_AT[0] - 0.6, 5.6, NULL_AT[1] + 3.6], [TT[0], 0, TT[1]]], [[NULL_AT[0] - 1.0, 5.9, NULL_AT[1] + 3.0], [TT[0], 0.4, TT[1]]]],
  [34, 42, [[TT[0] - 8, 10, TT[1] + 15], [TT[0] + 0.5, -2.2, TT[1] - 2]], [[TT[0] - 6.5, 9, TT[1] + 12.5], [TT[0] + 0.5, -2.2, TT[1] - 2]]],
  // H3: behind Gyroid and Emmy at the rim, the halted torus beyond them
  [42, 45.8, [[G_EDGE[0] - TO_T[0] * 5.2, 3.0, G_EDGE[1] - TO_T[1] * 5.2], [G_EDGE[0] + TO_T[0] * 9, -1.0, G_EDGE[1] + TO_T[1] * 9]], [[G_EDGE[0] - TO_T[0] * 4.4, 2.8, G_EDGE[1] - TO_T[1] * 4.4], [G_EDGE[0] + TO_T[0] * 9, -1.0, G_EDGE[1] + TO_T[1] * 9]]],
  [45.8, 49.4, [[EM2[0] + EM_FACE[0] * 1.9 + 0.3, 1.4, EM2[1] + EM_FACE[1] * 1.9], [EM2[0], 1.05, EM2[1]]], [[EM2[0] + EM_FACE[0] * 1.6 + 0.2, 1.35, EM2[1] + EM_FACE[1] * 1.6], [EM2[0], 1.05, EM2[1]]]],
  [49.4, 53.2, [[0.9, 2.5, -3.6], [NULL_AT[0], 2.1, NULL_AT[1]]], [[0.6, 2.4, -4.3], [NULL_AT[0], 2.2, NULL_AT[1]]]],
  [53.2, 56, [[-12, 4, 7], [-16, 4, -30]], [[-13, 4.5, 9], [-24, 8, -50]]],
  [56, 60.4, [[0.5, 1.55, 0.2], [0, 1.0, 3.6]], [[0.25, 1.5, 0.8], [0, 1.0, 3.6]]],
  [60.4, 64, [[0.95, 1.35, 1.9], [0.7, 1.05, 3.6]], [[0.85, 1.3, 2.2], [0.7, 1.08, 3.6]]],
  [64, 72, [[0, 10, 22], [0, 4, -20]], [[0, 12, 28], [0, 5, -20]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(from[0], to[0], k))
    if (t >= 53.2 && t < 56) {
      // C2: ride along just behind Null as he carries the twins away
      const n = nullAt(t)
      const kk = away(t)
      const tp = [mix(TT[0], TT_FAR[0], kk), islandY(t), mix(TT[1], TT_FAR[1], kk)]
      camera.position.set(n[0] + 3.0, n[1] + 1.6, n[2] + 5.0)
      look.set(...mix3(n, tp, 0.55))
      look.y += 0.8
      camera.lookAt(look)
      return
    }
    const shake = seg(t, 0.2, 0.5) * (1 - seg(t, 0.5, 2)) * 0.12 + seg(t, 40.4, 40.6) * (1 - seg(t, 40.6, 41.6)) * 0.3 + seg(t, 42.6, 42.9) * (1 - seg(t, 42.9, 44)) * 0.06
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake))
    look.set(...mix3(from[1], to[1], k))
    camera.lookAt(look)
  })
  return null
}

export default function Castle2Outro({ tRef }) {
  const engine = useRef({ squeeze: 0.95, seized: false })
  const nullG = useRef()
  const dawn = useRef()
  const sun = useRef()
  const nullLight = useRef()
  useFrame(() => {
    const t = tRef.current
    engine.current.seized = t > 0.4
    engine.current.squeeze = t > 0.4 ? 0 : 0.95
    // Null: turns to the twins, faces the torus while the Crown fires, then rises north with them
    const k = away(t)
    nullG.current.position.set(...nullAt(t))
    nullG.current.rotation.y = t > 31.4 && t < 49.4 ? NULL_FACE_T : t >= 53.4 ? Math.PI : 0
    nullG.current.visible = t < 56.2
    nullLight.current.intensity = t > 53 && t < 56.2 ? 14 : 0
    dawn.current.intensity = seg(t, 56, 60) * 2.2
    sun.current.visible = t > 56
    sun.current.position.y = 1 + seg(t, 56, 66) * 6
  })
  // C2: the violet ribbon he rides north
  const ribbon = () => {
    const t = tRef.current
    if (t < 53.4 || t > 56.2) return null
    const k = away(t)
    return Array.from({ length: 40 }, (_, i) => {
      const s = (i / 39) * k
      return [mix(NULL_AT[0], NULL_FAR[0], s) + Math.sin(s * 3) * 2, mix(NULL_AT[1], NULL_FAR[2], s), mix(0.6, NULL_FAR[1], s) + Math.sin(s * 9) * 0.4]
    })
  }
  const nullScript = () => {
    const t = tRef.current
    return { gesture: (t > 7.4 && t < 15) || (t > 23 && t < 40.4) || (t > 49.4 && t < 53.2) ? 1 : 0.3, crown: t > 31 && t < 41 ? 1 : 0.7, crownY: 0 }
  }
  const gyroScript = () => {
    const t = tRef.current
    if (t >= 56) return { pos: [0.7 / S, 0, 3.6 / S], rotY: Math.PI, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    if (t < 41.8) return { pos: [GY[0] / S, 0, GY[1] / S], rotY: t > 31.4 ? Math.atan2(TT[0] - GY[0], TT[1] - GY[1]) : Math.PI, run: 0, cast: t < 4 ? 0.6 : 0, whip: 0, loop: 0, loopDrop: 0 }
    // he runs to the rim, toward the torus
    const k = smooth(seg(t, 41.8, 43))
    return { pos: [mix(GY[0], G_EDGE[0], k) / S, 0, mix(GY[1], G_EDGE[1], k) / S], rotY: Math.atan2(TO_T[0], TO_T[1]), run: k > 0 && k < 1 ? 1 : 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    if (t >= 56) return { pos: [-0.7 / S, 0, 3.6 / S], rotY: Math.PI, walk: 0, bow: 0, gesture: t > 56.4 && t < 60.4 ? 0.6 : 0, talk: t > 56.4 && t < 60.4 ? 1 : 0 }
    const grief = t > 36 && t < 41.8
    const plead = t > 45.8 && t < 49.4
    if (t >= 41.8) {
      // she runs to Gyroid's side at the rim, then turns on Null
      const k = smooth(seg(t, 41.8, 43.4))
      const toNull = Math.atan2(EM_FACE[0], EM_FACE[1])
      return {
        pos: [mix(EM[0], EM2[0], k) / S, 0, mix(EM[1], EM2[1], k) / S],
        rotY: t > 45.6 ? toNull : Math.atan2(EM2[0] - EM[0], EM2[1] - EM[1]),
        walk: k > 0 && k < 1 ? 1 : 0,
        bow: 0,
        gesture: plead ? 1 : 0,
        talk: plead ? 1 : 0,
      }
    }
    return {
      pos: [EM[0] / S, 0, EM[1] / S],
      rotY: Math.PI + (grief ? -0.35 : 0),
      walk: 0,
      bow: grief ? 1 : 0,
      gesture: plead ? 1 : t > 3.8 && t < 6.8 ? 0.6 : t > 19.2 && t < 22.8 ? 0.5 : 0,
      talk: (t > 3.8 && t < 6.8) || (t > 19.2 && t < 22.8) || plead ? 1 : 0,
    }
  }
  return (
    <>
      <DeltaHall />
      <Retractor stateRef={engine} />
      <Throne />
      <TorusIsland tRef={tRef} />
      <BouquetIsland tRef={tRef} />
      <Meters tRef={tRef} />
      <CrownBeam tRef={tRef} />
      <GardensGlow tRef={tRef} />
      <LiveLine getPts={ribbon} color="#c58bff" width={10} />
      <mesh ref={sun} position={[-24, 1, -80]}>
        <sphereGeometry args={[6, 32, 20]} />
        <meshBasicMaterial color="#ffb070" toneMapped={false} />
      </mesh>
      <DawnSky tRef={tRef} />
      <directionalLight ref={dawn} position={[-20, 8, -30]} color="#ffb88a" intensity={0} />
      <group ref={nullG} scale={0.8}>
        <CountNull script={nullScript} />
        <pointLight ref={nullLight} position={[0, 2.6, 2]} color="#d8c0ff" intensity={0} distance={9} />
      </group>
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <MovieCamera tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
