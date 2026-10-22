import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import CountNull, { CROWN_Y, NullCrown } from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import Commutator from './Commutator'
import StationSet, { FACADE, FACADE_R } from './StationSet'
import { BOSS_AT } from './stages'

/**
 * Outro movie for World 3 · Castle, "Null’s Last Lesson" (scripts.json castle-3-outro-v2):
 *   A  0–6     the Commutator kneels on the dais, unmasked; he begs
 *   B  6–13    the Crown's light comes down and Null steps out of it
 *   C  13–22   the claim: S³ → S², and Gyroid's cup reads only zeros
 *   H1 22–26   discarded: the Crown's beam strikes the Façade; the marshal's loops fade
 *   H2 26–33   the Façade folds (ring → ball → point → flash); the dais sinks; Gyroid drags him clear
 *   H3 33–41   reactions: the Commutator's dark loops, Gyroid, Emmy's guilt
 *   C2 41–47   Null rises on a violet ribbon to the Postnikov Spire
 *   D  47–55   dawn: resolve
 *   E  55–61   title card
 */

const S = 0.7
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const smooth = (x) => x * x * (3 - 2 * x)
const mix = (a, b, k) => a + (b - a) * k
const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]

const NULL_POS = [BOSS_AT[0] - 0.9, BOSS_AT[1] - 0.2]
const COMM_HOME = [BOSS_AT[0] + 0.9, BOSS_AT[1] + 0.6]
const COMM_SAFE = [1.1, -2.9]
const G_HOME = [0.7, -1.9]
const E_HOME = [-1.3, -1.4]
const SPIRE = [26, 0, -72]
const FAC_C = [FACADE[0], FACADE_R - 1.5, FACADE[2]] // the arch's center
const PROPS = { s3: [-1.2, 2.3, -4.4], s2: [1.2, 2.3, -4.4] }

// the Façade's fall: torus → ball (hole closes) → point (hangs) → flash
const fall = (t) => {
  const k = smooth(seg(t, 26.2, 28.2))
  return {
    corrupt: seg(t, 23.2, 26.2),
    R: FACADE_R * (1 - k),
    r: mix(1.5, 3.4, k),
    shrink: t < 29.6 ? 1 - smooth(seg(t, 28.3, 29.0)) * 0.97 : 0,
    flash: seg(t, 29.6, 30.4),
    beam: seg(t, 23.0, 23.5) * (1 - seg(t, 29.4, 29.6)),
  }
}
const nullRise = (t) => smooth(seg(t, 43.5, 47))
const nullAt = (t) => {
  const appear = seg(t, 7.2, 9.0)
  const hover = smooth(seg(t, 29.6, 31)) * 1.0
  const k = nullRise(t)
  return {
    pos: [mix(NULL_POS[0], SPIRE[0], k * k), 0.35 + hover + k * 40, mix(NULL_POS[1], SPIRE[2], k * k)],
    scale: 0.8 * appear,
  }
}
const commAt = (t) => {
  const k = smooth(seg(t, 28.6, 31.4))
  return [mix(COMM_HOME[0], COMM_SAFE[0], k), mix(COMM_HOME[1], COMM_SAFE[1], k)]
}
const GLOW = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.2, 'rgba(240,225,255,0.85)')
  r.addColorStop(0.5, 'rgba(180,140,255,0.25)')
  r.addColorStop(1, 'rgba(120,80,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()
const STONE = new THREE.Color('#3a3446')
const VIOLET = new THREE.Color('#8a3cff')
const WHITE = new THREE.Color('#ffffff')
const LILAC = new THREE.Color('#9a88b8')

/** The Façade, standing on its edge, as the Crown folds it to a point. */
function FoldingFacade({ tRef }) {
  const group = useRef()
  const mat = useRef()
  const flash = useRef()
  const clock = useRef()
  const SU = 72
  const SV = 20
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.3, SV, SU), [])
  useFrame(() => {
    const t = tRef.current
    const s = fall(t)
    const pos = geo.attributes.position
    const nor = geo.attributes.normal
    for (let j = 0; j <= SV; j++) {
      const v = (j / SV) * Math.PI * 2
      for (let i = 0; i <= SU; i++) {
        const u = (i / SU) * Math.PI * 2
        const idx = j * (SU + 1) + i
        const w = s.R + s.r * Math.cos(v)
        pos.setXYZ(idx, w * Math.cos(u), w * Math.sin(u), s.r * Math.sin(v))
        nor.setXYZ(idx, Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v))
      }
    }
    pos.needsUpdate = true
    nor.needsUpdate = true
    geo.computeBoundingSphere()
    group.current.visible = s.shrink > 0.001
    group.current.scale.setScalar(Math.max(0.0001, s.shrink))
    group.current.position.y = FAC_C[1] + s.corrupt * 1.5 * (1 - s.shrink * 0) + (1 - s.shrink) * 0.0
    const point = 1 - s.shrink
    mat.current.color.copy(STONE).lerp(LILAC, s.corrupt * 0.6).lerp(WHITE, point)
    mat.current.emissive.copy(STONE).lerp(VIOLET, s.corrupt * 0.6).lerp(WHITE, point)
    mat.current.emissiveIntensity = 0.05 + s.corrupt * 0.22 + Math.max(0, Math.sin(t * 22)) * 0.12 * s.corrupt + point * 6
    // the clock goes dark, then is swallowed with the ring
    clock.current.visible = s.R > FACADE_R * 0.6
    clock.current.position.y = s.R + s.r + 0.1
    clock.current.children[0].material.emissiveIntensity = 0.6 * (1 - s.corrupt)
    const f = s.flash
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(4 + (1 - (1 - f) ** 3) * 40)
    flash.current.material.opacity = (1 - f) ** 2
  })
  return (
    <group position={[FAC_C[0], 0, FAC_C[2]]}>
      {/* a key light, so the folding stone reads as a lit solid, not a flat disc */}
      <pointLight position={[7, FAC_C[1] + 6, 9]} intensity={2.6} decay={0} distance={45} color="#fff2e0" />
      <group ref={group} position={[0, FAC_C[1], 0]}>
        <mesh geometry={geo}>
          <meshStandardMaterial ref={mat} color="#3a3446" roughness={0.35} metalness={0.3} emissive="#3a3446" emissiveIntensity={0.1} />
        </mesh>
        <group ref={clock} position={[0, FACADE_R, 1.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.3, 40]} />
            <meshStandardMaterial color="#f2e8cc" emissive="#ffd27a" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>
      <sprite ref={flash} position={[0, FAC_C[1], 0]}>
        <spriteMaterial map={GLOW} color="#f4e8ff" transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * FACADE_R, -4.4, 0]}>
          <boxGeometry args={[3.6, 9.2, 3.6]} />
          <meshStandardMaterial color="#221e2c" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** A beam between two moving points (the Crown's, from Null's crown to the Façade). */
function Beam({ tRef, from, to, strength, color = '#c79bff', width = 0.35 }) {
  const ref = useRef()
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  useFrame(() => {
    const t = tRef.current
    const k = strength(t)
    ref.current.visible = k > 0.01
    if (!ref.current.visible) return
    a.set(...from(t))
    b.set(...to(t))
    const d = b.clone().sub(a)
    ref.current.position.copy(a).add(b).multiplyScalar(0.5)
    ref.current.quaternion.setFromUnitVectors(up, d.clone().normalize())
    const w = k * (0.7 + Math.sin(t * 40) * 0.3)
    ref.current.scale.set(w, d.length(), w)
  })
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[width * 0.4, width, 1, 12, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/** The Postnikov Spire on the horizon: rooms stacked into the clouds, the Crown's glow at the top. */
function Spire() {
  return (
    <group position={SPIRE}>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, -6 + i * 7, 0]} rotation={[0, i * 0.4, 0]}>
          <boxGeometry args={[9 - i * 0.7, 6.4, 9 - i * 0.7]} />
          <meshStandardMaterial color="#141024" emissive="#5a2a9a" emissiveIntensity={0.25 + i * 0.05} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 60, 0]}>
        <octahedronGeometry args={[2.2, 0]} />
        <meshStandardMaterial color="#b070ff" emissive="#ff40c0" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 58, 0]} color="#c58bff" intensity={40} distance={80} />
    </group>
  )
}

/** Null's two spheres: S³ (drawn as the 3-ball with its boundary glued, a few circles inside) → S². */
function MapProps({ tRef }) {
  const g = useRef()
  const s3 = useRef()
  const show = useRef(0)
  useFrame(() => {
    const t = tRef.current
    show.current = seg(t, 13.2, 14.2) * (1 - seg(t, 22.4, 23.2))
    g.current.visible = show.current > 0.01
    g.current.scale.setScalar(Math.max(0.001, show.current))
    if (s3.current) s3.current.rotation.y = t * 0.6
  })
  const fibres = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return Array.from({ length: 41 }, (_, j) => {
          const u = (j / 40) * Math.PI * 2
          const r = 0.32
          // circles tilted round the axis, linking one another
          const p = new THREE.Vector3(r * Math.cos(u), r * Math.sin(u), 0)
          p.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.9)
          p.applyAxisAngle(new THREE.Vector3(0, 1, 0), a)
          p.add(new THREE.Vector3(Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13))
          return [p.x, p.y, p.z]
        })
      }),
    [],
  )
  const labels = useWindow(tRef, 13.8, 22.4)
  const arrow = useMemo(() => [[PROPS.s3[0] + 0.6, PROPS.s3[1], PROPS.s3[2]], [PROPS.s2[0] - 0.55, PROPS.s2[1], PROPS.s2[2]]], [])
  return (
    <group ref={g}>
      <group ref={s3} position={PROPS.s3}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshStandardMaterial color="#6a4aa8" emissive="#8a3cff" emissiveIntensity={0.5} transparent opacity={0.35} depthWrite={false} />
        </mesh>
        {fibres.map((pts, i) => (
          <mesh key={i}>
            <tubeGeometry args={[new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), true), 48, 0.018, 6, true]} />
            <meshBasicMaterial color="#e0b8ff" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={PROPS.s2}>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#c8d4e0" emissive="#7fd6ff" emissiveIntensity={0.25} transparent opacity={0.55} />
      </mesh>
      <mesh position={[(arrow[0][0] + arrow[1][0]) / 2, arrow[0][1], arrow[0][2]]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, arrow[1][0] - arrow[0][0], 8]} />
        <meshBasicMaterial color="#c58bff" toneMapped={false} />
      </mesh>
      <mesh position={[arrow[1][0], arrow[1][1], arrow[1][2]]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.22, 10]} />
        <meshBasicMaterial color="#c58bff" toneMapped={false} />
      </mesh>
      {labels && <PropLabels />}
    </group>
  )
}

function PropLabels() {
  return (
    <>
      <Html position={[PROPS.s3[0], PROPS.s3[1] + 0.95, PROPS.s3[2]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="floor-tag" style={{ fontSize: '0.9rem' }}>S³</div>
      </Html>
      <Html position={[PROPS.s2[0], PROPS.s2[1] + 0.85, PROPS.s2[2]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="floor-tag" style={{ fontSize: '0.9rem' }}>S²</div>
      </Html>
      <Html position={[0, PROPS.s2[1] + 0.35, PROPS.s2[2]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="floor-tag" style={{ fontSize: '0.9rem', color: '#c58bff', borderColor: '#c58bff' }}>
          f
        </div>
      </Html>
    </>
  )
}

/** True while tRef is inside [a, b), as React state (drei's Html ignores a hidden parent group). */
function useWindow(tRef, a, b) {
  const [on, setOn] = useState(false)
  const last = useRef(false)
  useFrame(() => {
    const t = tRef.current
    const n = t >= a && t < b
    if (n !== last.current) {
      last.current = n
      setOn(n)
    }
  })
  return on
}

/** Gyroid's readings of f: they come back zero (f*: H²(S²) → H²(S³) = 0). */
function Readings({ tRef }) {
  const on = useWindow(tRef, 17.6, 22.6)
  if (!on) return null
  return (
    <group>
      <Html position={[0, PROPS.s3[1] - 0.75, PROPS.s3[2]]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="floor-tag" style={{ fontSize: '0.95rem', color: '#d0d0dc', borderColor: '#9a9aa8' }}>
          f* : H²(S²) → H²(S³) = 0
        </div>
      </Html>
    </group>
  )
}

const SHOTS = [
  [0, 6, [[3.2, 2.1, -2.2], [0.7, 1.0, -6.4]], [[2.8, 1.9, -2.9], [0.7, 0.95, -6.5]]],
  [6, 13, [[-3.2, 2.2, -1.2], [NULL_POS[0], 4.2, NULL_POS[1]]], [[-2.6, 2.0, -2.2], [NULL_POS[0], 1.9, NULL_POS[1]]]],
  [13, 19.4, [[0.3, 7.5, 4.5], [0, 0.72, -2.85]], [[0.4, 7.2, 4.1], [0, 0.8, -2.9]]], // high: the props above, Gyroid and Emmy clear of the caption
  [19.4, 22.6, [[-3.4, 2.2, -2.6], [NULL_POS[0], 2.0, NULL_POS[1]]], [[-3.0, 2.1, -3.0], [NULL_POS[0], 2.1, NULL_POS[1]]]],
  // H1: over Null's shoulder, the Crown turning on the Façade
  [22.6, 26.2, [[1.6, 1.5, -3.6], [-1.5, 5, -15]], [[1.9, 1.6, -3.2], [-1.4, 5.1, -15]]],
  // H2: past Null to the Façade as it folds
  [26.2, 30.6, [[2.4, 1.8, -2.6], [-1.2, 5.2, -15]], [[2.9, 2.0, -2.0], [-1.0, 5.0, -15]]],
  // H2b: Gyroid drags the marshal clear as the dais sinks
  [30.6, 33, [[6.5, 3.2, 1.6], [0.6, 1.6, -4.6]], [[6.0, 3.0, 1.6], [0.8, 1.6, -3.6]]],
  // H3: close on Gyroid and the Commutator
  [33, 38.2, [[-0.4, 1.5, -0.4], [1.3, 0.95, -2.8]], [[-0.1, 1.4, -0.8], [1.3, 0.95, -2.8]]],
  // H4: Emmy
  [38.2, 41.2, [[-0.6, 1.45, 0.9], [E_HOME[0], 1.05, E_HOME[1]]], [[-0.8, 1.4, 0.6], [E_HOME[0], 1.05, E_HOME[1]]]],
  // C2: Null rises toward the Spire
  [41.2, 47.2, [[2.5, 2.6, 2.5], [NULL_POS[0], 2.5, NULL_POS[1]]], null],
  // D: dawn behind the three of them, the Spire ahead
  [47.2, 51.4, [[0.2, 1.7, 2.6], [9, 3, -60]], [[0.1, 1.9, 3.4], [10, 5, -60]]],
  [51.4, 55, [[0.3, 1.7, 0.3], [8, -1.8, -24]], [[0.4, 1.7, 0.1], [8, -1.6, -24]]], // over Gyroid's shoulder, the Spire ahead of him
  [55, 65, [[0, 5, 14], [12, 14, -60]], [[0, 7, 16], [14, 18, -60]]],
]
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const sh = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, sh[0], sh[1]))
    if (!sh[3]) {
      // follow Null up into the sky
      const n = nullAt(t)
      const f = smooth(seg(t, 43.4, 44.6))
      camera.position.set(mix(sh[2][0][0], n.pos[0] + 3.5, f), mix(sh[2][0][1], n.pos[1] + 1.0, f), mix(sh[2][0][2], n.pos[2] + 6, f))
      look.set(n.pos[0], n.pos[1] + 1.4, n.pos[2])
    } else {
      camera.position.set(...mix3(sh[2][0], sh[3][0], k))
      look.set(...mix3(sh[2][1], sh[3][1], k))
    }
    const shake = seg(t, 29.6, 29.8) * (1 - seg(t, 29.8, 31)) * 0.5 + seg(t, 30.6, 30.8) * (1 - seg(t, 30.8, 33)) * 0.08
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake))
    camera.lookAt(look)
  })
  return null
}

export default function OutroMovie({ tRef }) {
  const nullG = useRef()
  const commG = useRef()
  const dais = useRef()
  const bigCrown = useRef()
  const descend = useRef()
  const sun = useRef()
  const dawn = useRef()
  const sky = useRef()
  const crownGlow = useRef(0.6)
  useFrame(({ clock }) => {
    const t = tRef.current
    const n = nullAt(t)
    nullG.current.position.set(...n.pos)
    nullG.current.scale.setScalar(Math.max(0.001, n.scale))
    nullG.current.visible = n.scale > 0.01 && t < 47
    // he faces the courier; then turns his back on his marshal to face the Façade
    nullG.current.rotation.y = t > 22.6 && t < 31 ? Math.PI : t > 43.5 ? Math.PI * 0.85 : 0.15
    // the big Crown over the dais comes down into him
    const k = seg(t, 6.4, 9.2)
    bigCrown.current.visible = k < 0.98
    bigCrown.current.position.set(BOSS_AT[0] + (NULL_POS[0] - BOSS_AT[0]) * k, mix(5.2, 0.35 + CROWN_Y * 0.8, k) + Math.sin(clock.elapsedTime * 1.1) * 0.15 * (1 - k), BOSS_AT[1] + (NULL_POS[1] - BOSS_AT[1]) * k)
    bigCrown.current.scale.setScalar(mix(3.2, 0.8, k))
    bigCrown.current.rotation.y = clock.elapsedTime * 0.5
    descend.current.visible = t > 6.2 && t < 9.6
    descend.current.material.opacity = 0.5 * seg(t, 6.2, 6.8) * (1 - seg(t, 9.0, 9.6))
    // the dais sinks as the Crown takes the floor beneath it
    const sink = smooth(seg(t, 29.4, 32))
    dais.current.position.y = -sink * 3
    dais.current.rotation.z = sink * 0.25
    const c = commAt(t)
    commG.current.position.set(c[0], 0.35 * (1 - seg(t, 28.6, 29.4)) - (t > 28.6 ? 0 : 0), c[1])
    commG.current.rotation.y = t > 33 ? -0.6 : 0
    crownGlow.current = 0.6 + seg(t, 22.6, 23.2) * 1.6 * (1 - seg(t, 30, 31))
    sun.current.visible = t > 47
    sun.current.position.y = -2 + seg(t, 47, 61) * 9
    dawn.current.intensity = t > 47 ? 1.8 * seg(t, 47, 49) : 0
    sky.current.visible = t > 47
    sky.current.material.opacity = 0.85 * seg(t, 47, 50)
  })
  const nullScript = () => {
    const t = tRef.current
    const speaking = (t > 7.6 && t < 12.6) || (t > 13.4 && t < 16.6) || (t > 19.6 && t < 30) || (t > 41.4 && t < 44.6)
    return { gesture: speaking ? 1 : 0.3, crown: t > 22.6 && t < 30 ? 1 : 0.6, crownY: 0 }
  }
  const commScript = () => {
    const t = tRef.current
    return {
      cloak: 0,
      crack: 1,
      kneel: t < 31.4 ? 1 : t < 35 ? 0.6 : 0.8,
      gesture: t > 3.6 && t < 6.4 ? 0.7 : 0,
      talk: (t > 3.6 && t < 6.4) || (t > 35.6 && t < 38) ? 1 : 0,
      loops: 1 - smooth(seg(t, 23.4, 30.2)),
    }
  }
  const gyroScript = () => {
    const t = tRef.current
    if (t < 27.6) return { pos: [G_HOME[0] / S, 0, G_HOME[1] / S], rotY: Math.PI, run: 0, cast: t > 16.8 && t < 19.4 ? 0.9 : 0, whip: 0, loop: 0, loopDrop: 0 }
    if (t < 28.6) {
      // the sprint in to the dais
      const k = smooth(seg(t, 27.6, 28.6))
      return { pos: [mix(G_HOME[0], COMM_HOME[0] + 0.2, k) / S, 0, mix(G_HOME[1], COMM_HOME[1] + 0.9, k) / S], rotY: Math.PI - 0.1, run: 1, cast: 0, whip: 0, loop: 0, loopDrop: 0 }
    }
    // dragging him back across the floor, then standing over him
    const c = commAt(t)
    const back = t < 31.4
    const side = smooth(seg(t, 31.4, 32.6)) // done dragging: he steps round beside him
    return { pos: [(c[0] - 0.1 + side * 0.9) / S, 0, (c[1] + 0.9 - side * 0.5) / S], rotY: back ? Math.PI : t > 47 ? Math.PI * 0.92 : -2.0, run: back ? 0.6 : 0, cast: 0, whip: back ? 0.5 : 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    const grief = t > 30 && t < 41.2
    const talk = (t > 0.6 && t < 3.4) || (t > 38.2 && t < 41) || (t > 47.6 && t < 51.4)
    const rotY = t > 38 && t < 41.2 ? 0.35 : t > 47 ? Math.PI * 0.92 : Math.PI
    return { pos: [E_HOME[0] / S, 0, E_HOME[1] / S], rotY, walk: 0, bow: grief && !talk ? 1 : 0, gesture: talk ? 0.7 : grief ? 1 : 0, talk: talk ? 1 : 0 }
  }
  // Null's ribbon of violet, rising to the Spire
  const ribbon = () => {
    const t = tRef.current
    if (t < 43.4 || t > 47.2) return null
    const k = seg(t, 43.4, 46.8)
    return Array.from({ length: 40 }, (_, i) => {
      const s = (i / 39) * k
      return [mix(NULL_POS[0], SPIRE[0], s * s) + Math.sin(s * 9) * 1.2, mix(NULL_POS[1], SPIRE[2], s * s), 0.6 + s * 40 + Math.sin(s * 7) * 0.8]
    })
  }
  const nullCrownAt = (t) => {
    const n = nullAt(t)
    return [n.pos[0], n.pos[1] + CROWN_Y * 0.8 + 0.1, n.pos[2]]
  }
  return (
    <>
      <StationSet crownGlow={crownGlow} dais={false} facade={false} />
      <fog attach="fog" args={['#080812', 40, 170]} />
      <FoldingFacade tRef={tRef} />
      <Spire />
      <group ref={dais} position={[0, 0, 0]}>
        <group position={[BOSS_AT[0], 0, BOSS_AT[1]]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[1.9, 2.1, 0.45, 8]} />
            <meshStandardMaterial color="#221c2e" roughness={0.3} metalness={0.5} flatShading />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.36, 0]}>
            <ringGeometry args={[1.55, 1.7, 8]} />
            <meshBasicMaterial color="#c9a24a" toneMapped={false} />
          </mesh>
        </group>
      </group>
      <group ref={bigCrown}>
        <NullCrown glowRef={crownGlow} />
      </group>
      <mesh ref={descend} position={[NULL_POS[0], 3.5, NULL_POS[1]]}>
        <cylinderGeometry args={[0.6, 1.1, 7, 16, 1, true]} />
        <meshBasicMaterial color="#c79bff" transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={nullG}>
        <CountNull script={nullScript} />
        {/* rim and fill lights that travel with him, so he never goes to a silhouette */}
        <pointLight position={[0, 2.6, 1.0]} intensity={10} distance={4} color="#d8c0ff" />
        <pointLight position={[0, 2.0, -1.6]} intensity={4} distance={5} color="#fff0e0" />
      </group>
      <group ref={commG} scale={0.95}>
        <Commutator script={commScript} />
      </group>
      <MapProps tRef={tRef} />
      <Readings tRef={tRef} />
      {/* Gyroid's cast at S², and the Crown's beam at the Façade */}
      <Beam tRef={tRef} from={() => [G_HOME[0], 1.0, G_HOME[1] - 0.2]} to={() => PROPS.s2} strength={(t) => seg(t, 16.8, 17.2) * (1 - seg(t, 19.0, 19.4)) * 0.5} color="#ffd27a" width={0.12} />
      <Beam tRef={tRef} from={nullCrownAt} to={() => [FAC_C[0], FAC_C[1] + 1, FAC_C[2]]} strength={(t) => fall(t).beam} />
      <LiveLine getPts={ribbon} color="#c58bff" width={10} />
      <mesh ref={sun} position={[60, -2, -110]}>
        <sphereGeometry args={[9, 32, 20]} />
        <meshBasicMaterial color="#ffb070" toneMapped={false} />
      </mesh>
      <directionalLight ref={dawn} position={[40, 8, -60]} color="#ffb88a" intensity={0} />
      {/* dawn: the sky warms behind the Spire */}
      <mesh ref={sky}>
        <sphereGeometry args={[150, 32, 16]} />
        <meshBasicMaterial color="#5a3456" side={THREE.BackSide} fog={false} transparent opacity={0} depthWrite={false} />
      </mesh>
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
