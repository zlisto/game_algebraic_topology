import { useFrame, useThree } from '@react-three/fiber'
import { Bloom as BloomFx, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sfxCorrect, sfxCrack, sfxHit, sfxPop, sfxWarpOpen, sfxWhoosh } from '../../audio/chip'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import Commutator from './Commutator'
import WorldSet, { petal, BREAK_AT, CROWN_AT, Fireworks, GLOW, HAVEN, NULL_AT, PLACE, PLACES, QUAY, QY, TOPY, mix, mix3, seg, smooth, sunDir } from './WorldSet'

/**
 * The ending movie, "The Crown Unwound" (script: ending.video.json). Story seconds:
 *   A  0–25   the Spire's summit at night: "It's proved." The Crown cracks and shatters (5.0);
 *             Null, bowed, tells them who he lost; Gyroid gives him a ring; the Commutator; Emmy
 *   B  25–51  the shards catch fire and fly; every folded place blooms back from its point
 *             (Reef 29.6, Haven 32.2, Bastion 37.4, Delta 40.4, torus & twin 43.4, Gardens 46.6),
 *             the Spire relights gold, and dawn breaks
 *   C  51–66  Haven's quay at dawn: "One delivery for Emmy Boundary." The Chart.
 *   D  66–70  Null alone at sunrise, looking through the ring
 *   E  70–80  fireworks; the camera rises over the restored world; title card
 */

const S = 0.7 // Gyroid and Emmy's scale
const NS = 0.8 // Null's
const face = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2])
const add = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]]
const NP = NULL_AT
// on the summit
const G_A = [NP[0] - 0.4, TOPY, NP[2] + 3.0]
const E_A = [NP[0] + 1.9, TOPY, NP[2] + 3.3]
const C_A = [NP[0] - 2.5, TOPY, NP[2] + 2.3]
// on Haven's quay
const G_Q = [QUAY[0] + 0.95, QY, QUAY[1] + 0.1]
const E_Q = [QUAY[0] - 0.95, QY, QUAY[1] + 0.1]
const C_Q = [QUAY[0] + 2.0, QY, QUAY[1] - 1.4]
const RUN_FROM = [-23, QY, 7.6]
const RUN = [51.2, 53.9]
const AT_QUAY = 51
// where Null's raised palm is (his group's frame, scale NS; the outro's ring sits here too)
const PALM = [0.45, 2.45, 0.55]
const PALM_SUN = [0.95, 2.5, 0.75] // at sunrise he holds it out at arm's length, clear of his hood
const nullPos = (t) => [NP[0], NP[1], NP[2] - 0.5 * smooth(seg(t, BREAK_AT, BREAK_AT + 0.4))]
const SUN_YAW = (() => {
  const d = sunDir(66)
  return Math.atan2(d.x, d.z)
})()
const nullYaw = (t) => (t > 65.5 ? SUN_YAW : 0)
// the kept ring in world space once Null has turned to the sunrise (for the last push-in)
const RING_W = (() => {
  const c = Math.cos(SUN_YAW)
  const sn = Math.sin(SUN_YAW)
  const [px, py, pz] = PALM_SUN.map((v) => v * NS)
  return [NP[0] + px * c + pz * sn, NP[1] + py, NP[2] - 0.5 - px * sn + pz * c]
})()
// over Null's shoulder, looking down the line to the sun: the sun sits in the ring's hole
const SUN_D = sunDir(66)
const ringCam = (d) => [RING_W[0] - SUN_D.x * d, RING_W[1] - SUN_D.y * d, RING_W[2] - SUN_D.z * d]
const ringLook = [RING_W[0] + SUN_D.x * 10, RING_W[1] + SUN_D.y * 10, RING_W[2] + SUN_D.z * 10]
const gyroAt = (t) => {
  if (t < AT_QUAY) return G_A
  const k = smooth(seg(t, RUN[0], RUN[1]))
  return [mix(RUN_FROM[0], G_Q[0], k), QY, mix(RUN_FROM[2], G_Q[2], k)]
}

// ---------------------------------------------------------------- the Crown breaks

const PIECES = 8
const GAP = 0.32
function CrownBreak({ tRef }) {
  const pieces = useRef([])
  const flash = useRef()
  const wave = useRef()
  const crack = useRef()
  const plan = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const a = ((i + 0.5) / PIECES) * (Math.PI * 2 - GAP)
        return { a, dir: [Math.cos(a), Math.sin(a)], up: 2 + (i % 3) * 0.8, spin: [(i % 2 ? 1 : -1) * (3 + i), 2 + (i % 3), 4 - (i % 4)] }
      }),
    [],
  )
  const arc = useMemo(() => new THREE.TorusGeometry(0.3 * NS, 0.022 * NS, 8, 14, (Math.PI * 2 - GAP) / PIECES), [])
  useFrame(({ clock }) => {
    const t = tRef.current
    const dt = t - BREAK_AT
    plan.forEach((p, i) => {
      const m = pieces.current[i]
      if (!m) return
      m.visible = dt >= 0 && dt < 3.2
      if (!m.visible) return
      // thrown outward and up, then falling past the summit's edge
      const out = 3.2 * dt
      m.position.set(CROWN_AT[0] + p.dir[0] * (0.25 + out), CROWN_AT[1] + p.up * dt - 4.9 * dt * dt, CROWN_AT[2] + p.dir[1] * (0.25 + out))
      m.rotation.set(p.spin[0] * dt, p.a + p.spin[1] * dt, p.spin[2] * dt)
    })
    const f = seg(t, BREAK_AT, BREAK_AT + 0.9)
    flash.current.visible = f > 0 && f < 1
    flash.current.scale.setScalar(1 + (1 - (1 - f) ** 3) * 7)
    flash.current.material.opacity = (1 - f) ** 2
    const w = seg(t, BREAK_AT, BREAK_AT + 1.1)
    wave.current.visible = w > 0 && w < 1
    wave.current.scale.setScalar(0.3 + w * 6)
    wave.current.material.opacity = 0.6 * (1 - w)
    // before it goes: the Crown strains, flickering white through the violet
    const strain = seg(t, 3.7, BREAK_AT) * (t < BREAK_AT ? 1 : 0)
    crack.current.intensity = strain * (6 + Math.max(0, Math.sin(clock.elapsedTime * 47)) * 14)
  })
  return (
    <>
      {plan.map((p, i) => (
        <group key={i} ref={(el) => (pieces.current[i] = el)}>
          <mesh geometry={arc} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#0d0a12" metalness={0.85} roughness={0.25} emissive="#8a3cff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          <mesh position={[0.3 * NS, 0.08, 0]} rotation={[0, 0, -0.12]}>
            <coneGeometry args={[0.02 * NS, 0.18, 6]} />
            <meshStandardMaterial color="#0d0a12" metalness={0.85} roughness={0.25} emissive="#8a3cff" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <sprite ref={flash} position={CROWN_AT}>
        <spriteMaterial map={GLOW} color="#f1e2ff" transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={wave} position={CROWN_AT} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.012, 6, 64]} />
        <meshBasicMaterial color="#e6d2ff" transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight ref={crack} position={CROWN_AT} color="#efe0ff" intensity={0} distance={8} />
    </>
  )
}

// ---------------------------------------------------------------- the ring Gyroid gives Null

const GIFT = [18.9, 20.6] // it floats from Gyroid's hand to Null's palm
function GiftRing({ tRef }) {
  const ref = useRef()
  const glint = useRef()
  useFrame(({ clock }) => {
    const t = tRef.current
    const on = t > 16.9 && t < GIFT[1]
    ref.current.visible = on
    if (!on) return
    const g = G_A
    const yaw = face(G_A, NP)
    const from = [g[0] + Math.sin(yaw) * 0.42, g[1] + 0.95, g[2] + Math.cos(yaw) * 0.42]
    const n = nullPos(t)
    const to = [n[0] + PALM[0] * NS, n[1] + PALM[1] * NS, n[2] + PALM[2] * NS]
    const k = smooth(seg(t, GIFT[0], GIFT[1]))
    const p = mix3(from, to, k)
    p[1] += Math.sin(k * Math.PI) * 0.5
    ref.current.position.set(...p)
    ref.current.rotation.set(Math.PI / 2 - 0.4, clock.elapsedTime * 1.5, 0)
    glint.current.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 6) * 0.2
  })
  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[0.13, 0.03, 10, 36]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <sprite ref={glint} scale={0.32}>
        <spriteMaterial map={GLOW} color="#ffd9a0" transparent opacity={0.5} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

// ---------------------------------------------------------------- the Chart

function chartTexture() {
  const W = 768
  const H = 512
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const bg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.65)
  bg.addColorStop(0, '#f6e6c4')
  bg.addColorStop(1, '#d9bf8e')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  g.strokeStyle = '#b07a2a'
  g.lineWidth = 10
  g.strokeRect(14, 14, W - 28, H - 28)
  g.lineWidth = 2
  g.strokeRect(30, 30, W - 60, H - 60)
  g.fillStyle = '#5a3a14'
  g.font = 'bold 34px Georgia, serif'
  g.textAlign = 'center'
  g.fillText('The Chart of the Winding World', W / 2, 66)
  g.font = 'italic 15px Georgia, serif'
  g.fillText('E. Boundary, cartographer · delivered by Gyroid, courier', W / 2, 92)
  // the map: world x ∈ [-62, 62] → canvas, z ∈ [-95, 50]
  const X = (x) => 70 + ((x + 62) / 124) * (W - 140)
  const Y = (z) => 110 + ((z + 95) / 145) * (H - 170)
  g.strokeStyle = '#5a3a14'
  g.fillStyle = '#5a3a14'
  g.lineWidth = 4
  const ring = (x, z, r) => {
    g.beginPath()
    g.arc(X(x), Y(z), r, 0, Math.PI * 2)
    g.stroke()
  }
  ring(0, 0, 10) // Ringed Isle
  ring(HAVEN[0], HAVEN[1], 16) // Haven Ring
  // the bouquet: three petals that meet only at the wedge point
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4
    g.beginPath()
    for (let k = 0; k <= 48; k++) {
      const [px, pz] = petal((k / 48) * Math.PI * 2, 22, 9)
      const x = px * Math.cos(a) - pz * Math.sin(a)
      const z = px * Math.sin(a) + pz * Math.cos(a)
      k ? g.lineTo(X(-54) + x, Y(-38) + z) : g.moveTo(X(-54) + x, Y(-38) + z)
    }
    g.stroke()
  }
  g.beginPath()
  g.arc(X(52), Y(-32), 15, 0, Math.PI * 2)
  g.stroke()
  g.beginPath()
  g.ellipse(X(52), Y(-32), 15, 5, 0, 0, Math.PI * 2)
  g.stroke()
  ring(44, 28, 12)
  ring(44, 28, 4)
  ring(53, 35, 6)
  ring(61, 35, 6)
  g.beginPath()
  g.arc(X(-6), Y(44), 14, 0, Math.PI * 2)
  g.fill()
  g.beginPath()
  g.moveTo(X(0) - 9, Y(-88) + 14)
  g.lineTo(X(0), Y(-88) - 18)
  g.lineTo(X(0) + 9, Y(-88) + 14)
  g.closePath()
  g.fill()
  g.font = 'italic 19px Georgia, serif'
  const lab = (s, x, z, dy = 30) => g.fillText(s, X(x), Y(z) + dy)
  lab('Retract Reef', 0, 0)
  lab('Haven Ring', HAVEN[0], HAVEN[1], 38)
  lab('Bouquet Bastion', -54, -38, 40)
  lab('Chain Delta', 52, -32, 38)
  lab('Torus & Twin', 50, 30, 34)
  lab('Cup Product Gardens', -6, 44, -22)
  lab('Postnikov Spire', 0, -88, 36)
  // the seal
  g.save()
  g.translate(W - 112, 128)
  g.rotate(-0.25)
  g.strokeStyle = '#a3261c'
  g.fillStyle = '#a3261c'
  g.lineWidth = 5
  g.beginPath()
  g.arc(0, 0, 46, 0, Math.PI * 2)
  g.stroke()
  g.font = 'bold 26px Georgia, serif'
  g.fillText('PROVED', 0, 9)
  g.restore()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

const UNROLL = [56.6, 57.5]
function Chart({ tRef }) {
  const scroll = useRef()
  const sheet = useRef()
  const tex = useMemo(chartTexture, [])
  useFrame(() => {
    const t = tRef.current
    // carried rolled up while he runs, held out on "One delivery", then it unrolls between them
    const g = gyroAt(t)
    const yaw = t < AT_QUAY ? face(G_A, NP) : t < RUN[1] ? face(RUN_FROM, G_Q) : -Math.PI / 2
    const reach = t > 54.2 ? 0.5 : 0.3
    scroll.current.visible = t >= AT_QUAY && t < UNROLL[0] + 0.1
    scroll.current.position.set(g[0] + Math.sin(yaw) * reach, g[1] + (t > 54.2 ? 0.92 : 0.8), g[2] + Math.cos(yaw) * reach)
    scroll.current.rotation.set(0, yaw + Math.PI / 2, Math.PI / 2)
    const k = smooth(seg(t, UNROLL[0], UNROLL[1]))
    sheet.current.visible = k > 0
    sheet.current.scale.set(Math.max(0.02, k), 1, 1)
    sheet.current.position.set(QUAY[0], QY + 1.85 + Math.sin(t * 1.5) * 0.03, QUAY[1] - 0.1)
  })
  return (
    <>
      <mesh ref={scroll}>
        <cylinderGeometry args={[0.06, 0.06, 0.56, 12]} />
        <meshStandardMaterial color="#e9d3a3" roughness={0.7} emissive="#ffcf7a" emissiveIntensity={0.15} />
      </mesh>
      <group ref={sheet} rotation={[0, 0.55, 0]} scale={0.72}>
        <mesh>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.12} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.76, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.08, 10]} />
            <meshStandardMaterial color="#b07a2a" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </>
  )
}

// ---------------------------------------------------------------- fireworks over Haven

const FW_COLORS = ['#ffd27a', '#3ecfbf', '#ff8a6a', '#c8a8ff', '#ffffff', '#7fe8dc']
export const BURSTS = Array.from({ length: 32 }, (_, i) => {
  const r = (k) => {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return { t: 58 + i * 0.85 + r(1) * 0.4, at: [-58 + r(2) * 40, 13 + r(3) * 10, -6 + r(4) * 26], color: FW_COLORS[i % FW_COLORS.length] }
})

// ---------------------------------------------------------------- camera

const N = NP
const towardNull = (p, d, h) => {
  const yaw = face(p, N)
  return [p[0] + Math.sin(yaw) * d, p[1] + h, p[2] + Math.cos(yaw) * d]
}
const MID_GN = [(G_A[0] + N[0]) / 2, TOPY, (G_A[2] + N[2]) / 2]
const SUN_XZ = [Math.sin(SUN_YAW), Math.cos(SUN_YAW)]
const P = (id) => PLACE[id].at
// [start, end, [from pos, from look], [to pos, to look]] — positions may be functions of t (tracking shots)
const SHOTS = [
  [0, 3.8, [[N[0] + 2.2, TOPY + 1.9, N[2] + 9.0], [N[0] - 0.2, TOPY + 0.95, N[2] + 1.5]], [[N[0] + 2.0, TOPY + 1.9, N[2] + 8.2], [N[0] - 0.2, TOPY + 1.0, N[2] + 1.5]]],
  [3.8, 5.0, [[N[0] + 1.3, TOPY + 2.6, N[2] + 2.8], CROWN_AT], [[N[0] + 0.9, TOPY + 2.6, N[2] + 2.0], CROWN_AT]],
  [5.0, 7.0, [[N[0] + 3.2, TOPY + 2.4, N[2] + 10], [N[0], TOPY + 1.6, N[2] + 0.5]], [[N[0] + 4.4, TOPY + 2.5, N[2] + 13.5], [N[0], TOPY + 1.6, N[2]]]],
  [7.0, 13.6, [[N[0] + 1.0, TOPY + 1.55, N[2] + 2.6], [N[0], TOPY + 1.95, N[2] - 0.5]], [[N[0] + 0.7, TOPY + 1.6, N[2] + 2.1], [N[0], TOPY + 2.0, N[2] - 0.5]]],
  [13.6, 16.6, [towardNull(E_A, 2.3, 1.25), [E_A[0], TOPY + 1.1, E_A[2]]], [towardNull(E_A, 2.0, 1.2), [E_A[0], TOPY + 1.12, E_A[2]]]],
  [16.6, 20.8, [[MID_GN[0] + 6.5, TOPY + 2.2, MID_GN[2] + 0.6], [MID_GN[0], TOPY + 1.6, MID_GN[2]]], [[MID_GN[0] + 6.0, TOPY + 2.1, MID_GN[2] + 0.2], [MID_GN[0], TOPY + 1.6, MID_GN[2]]]],
  [20.8, 23.0, [[C_A[0] + 2.3, TOPY + 1.15, C_A[2] + 0.1], [C_A[0], TOPY + 0.62, C_A[2]]], [[C_A[0] + 2.0, TOPY + 1.1, C_A[2] + 0.3], [C_A[0], TOPY + 0.66, C_A[2]]]],
  [23.0, 25.0, [towardNull(E_A, 2.6, 1.45), [E_A[0], TOPY + 0.8, E_A[2]]], [towardNull(E_A, 2.3, 1.4), [E_A[0], TOPY + 0.82, E_A[2]]]],
  [25.0, 28.8, [[N[0] + 2.0, TOPY + 7.5, N[2] - 8], [0, 0, -30]], [[N[0] + 1.0, TOPY + 13, N[2] - 14], [0, 0, -5]]],
  [28.8, 31.4, [[13, 7, 23], [-3, 0.5, 6]], [[9, 5.5, 19], [-2, 0.8, 3]]],
  [31.4, 37.0, [[HAVEN[0] + 15, 7.5, HAVEN[1] + 14], [HAVEN[0], 1.4, HAVEN[1]]], [[HAVEN[0] + 9, 4.2, HAVEN[1] + 11.5], [HAVEN[0] - 1, 1.2, HAVEN[1]]]],
  [37.0, 40.0, [[P('bastion')[0] + 17, 10, P('bastion')[2] + 15], [P('bastion')[0], 0.5, P('bastion')[2]]], [[P('bastion')[0] + 13, 7, P('bastion')[2] + 12], [P('bastion')[0], 0.8, P('bastion')[2]]]],
  [40.0, 43.0, [[P('delta')[0] - 22, 9, P('delta')[2] + 19], [P('delta')[0], 3.5, P('delta')[2]]], [[P('delta')[0] - 18, 7, P('delta')[2] + 16], [P('delta')[0], 4, P('delta')[2]]]],
  [43.0, 46.2, [[P('torus')[0] + 2, 13, P('torus')[2] + 27], [P('torus')[0] + 6, 0.5, P('torus')[2] + 3]], [[P('torus')[0] + 1, 11, P('torus')[2] + 24], [P('torus')[0] + 6, 0.8, P('torus')[2] + 3]]],
  [46.2, 48.6, [[P('gardens')[0] + 13, 8, P('gardens')[2] + 14], [P('gardens')[0], 0.3, P('gardens')[2]]], [[P('gardens')[0] + 10, 6.5, P('gardens')[2] + 11], [P('gardens')[0], 0.6, P('gardens')[2]]]],
  [48.6, 51.0, [[72, 26, 46], [-6, 0, -18]], [[86, 42, 34], [-10, 2, -26]]],
  [51.0, 54.2, [(t) => add(gyroAt(t), [3.4, 1.5, 3.6]), (t) => add(gyroAt(t), [-1.2, 0.8, -0.6])], [(t) => add(gyroAt(t), [3.2, 1.4, 3.2]), (t) => add(gyroAt(t), [-1.4, 0.8, -0.4])]],
  [54.2, 59.4, [[QUAY[0] + 2.8, QY + 1.55, QUAY[1] + 3.9], [QUAY[0] - 0.7, QY + 1.0, QUAY[1] - 0.2]], [[QUAY[0] + 2.2, QY + 1.5, QUAY[1] + 3.2], [QUAY[0] - 0.5, QY + 1.1, QUAY[1] - 0.2]]],
  [59.4, 61.4, [add(G_Q, [-2.1, 1.05, 1.2]), add(G_Q, [0, 0.72, 0])], [add(G_Q, [-1.85, 1.05, 1.05]), add(G_Q, [0, 0.74, 0])]],
  [61.4, 63.4, [add(E_Q, [2.1, 1.05, 1.2]), add(E_Q, [0, 0.74, 0])], [add(E_Q, [1.85, 1.05, 1.05]), add(E_Q, [0, 0.76, 0])]],
  [63.4, 66.2, [[QUAY[0] + 1.6, QY + 2.0, QUAY[1] + 5.6], [QUAY[0] - 0.6, QY + 1.0, QUAY[1] - 0.9]], [[QUAY[0] + 2.4, QY + 2.4, QUAY[1] + 6.4], [QUAY[0] - 0.8, QY + 1.2, QUAY[1] - 1.0]]],
  [66.2, 70.0, [ringCam(3.4), ringLook], [ringCam(2.1), ringLook]],
  [70.0, 76.5, [[QUAY[0] + 6, QY + 2.5, QUAY[1] + 9], [HAVEN[0], 2, HAVEN[1] - 4]], [[2, 34, 62], [-24, 6, -2]]],
  [76.5, 86, [[2, 34, 62], [-24, 6, -2]], [[-6, 37, 66], [-27, 6, -5]]],
]
const pick = (v, t) => (typeof v === 'function' ? v(t) : v)
function MovieCamera({ tRef }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = tRef.current
    const [a, b, from, to] = SHOTS.find((s) => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1]
    const k = smooth(seg(t, a, b))
    camera.position.set(...mix3(pick(from[0], t), pick(to[0], t), k))
    const shake = seg(t, BREAK_AT, BREAK_AT + 0.1) * (1 - seg(t, BREAK_AT + 0.1, BREAK_AT + 0.9)) * 0.35
    if (shake) camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake))
    look.set(...mix3(pick(from[1], t), pick(to[1], t), k))
    camera.lookAt(look)
  })
  return null
}

// ---------------------------------------------------------------- sound cues

const SFX = [
  [4.0, sfxCrack],
  [4.55, sfxCrack],
  [BREAK_AT, () => (sfxHit(), sfxWhoosh())],
  [GIFT[1], sfxCorrect],
  [25.2, sfxWhoosh],
  ...PLACES.map((p) => [p.t0, sfxPop]),
  [PLACE.torus.t0 + 0.5, sfxPop],
  [UNROLL[0], sfxWarpOpen],
  ...BURSTS.filter((_, i) => i % 3 === 0).map((b) => [b.t, sfxPop]),
]
function Cues({ tRef }) {
  const last = useRef(null)
  useFrame(() => {
    const t = tRef.current
    const p = last.current
    last.current = t
    if (p === null || t <= p) return
    for (const [at, fn] of SFX) if (p < at && t >= at && t - at < 0.5) fn()
  })
  return null
}

// ---------------------------------------------------------------- the scene

export default function EndingMovie({ tRef }) {
  const nullG = useRef()
  const held = useRef()
  const handBits = useRef(null)
  useFrame(() => {
    const t = tRef.current
    // once the Crown is gone, so are the orb and shards he held: his hand is empty (until the ring)
    if (!handBits.current) {
      handBits.current = []
      nullG.current.traverse((o) => {
        const g = o.geometry
        const type = g && g.type
        if (type === 'TetrahedronGeometry' || type === 'OctahedronGeometry' || type === 'DodecahedronGeometry') handBits.current.push(o)
        else if (type === 'SphereGeometry' && Math.abs(g.parameters.radius - 0.075) < 1e-4) handBits.current.push(o)
        else if (o.isPointLight && Math.abs(o.distance - 1.2) < 1e-4) handBits.current.push(o)
      })
    }
    for (const o of handBits.current) o.visible = t < BREAK_AT
    nullG.current.position.set(...nullPos(t))
    nullG.current.rotation.set(0.13 * smooth(seg(t, 6, 7.4)) * (1 - seg(t, 65.6, 66.4)), nullYaw(t), 0)
    held.current.visible = t >= GIFT[1]
    held.current.rotation.set(t > 65.5 ? -SUN_D.y : 0, 0, 0)
    held.current.scale.setScalar(t > 65.5 ? 1.5 : 1)
    held.current.position.set(...(t > 65.5 ? PALM_SUN : PALM))
  })
  const nullScript = () => {
    const t = tRef.current
    const broken = t >= BREAK_AT
    const strain = seg(t, 3.7, BREAK_AT)
    return {
      gesture: !broken ? 0.3 + strain * 0.7 : t > 65.6 ? 1 : t > GIFT[0] && t < 25.5 ? 1 : t > 25.5 ? 0.55 : 0,
      crown: broken ? 0 : 0.6 + strain * 0.4,
      crownY: broken ? 500 : (Math.random() - 0.5) * 0.05 * strain,
    }
  }
  const gyroScript = () => {
    const t = tRef.current
    const p = gyroAt(t)
    let rotY = face(G_A, NP)
    let run = 0
    if (t >= AT_QUAY) {
      run = t < RUN[1] ? 1 : 0
      rotY = t < RUN[1] ? face(RUN_FROM, G_Q) : -Math.PI / 2
    }
    const cast = (t > 16.8 && t < GIFT[1]) || (t > 54.2 && t < UNROLL[0]) ? 0.7 : 0
    return { pos: [p[0] / S, p[1] / S, p[2] / S], rotY, run, cast, whip: 0, loop: 0, loopDrop: 0 }
  }
  const emmyScript = () => {
    const t = tRef.current
    const talking = (a, b) => (t > a && t < b ? 1 : 0)
    if (t < AT_QUAY) {
      return {
        pos: [E_A[0] / S, E_A[1] / S, E_A[2] / S],
        rotY: face(E_A, NP),
        walk: 0,
        gesture: t > 23.2 && t < 51 ? 1 : 0,
        bow: t > 7 && t < 13.6 ? 0.5 : 0,
        talk: talking(13.6, 16.4) || talking(23.2, 25),
      }
    }
    return { pos: [E_Q[0] / S, E_Q[1] / S, E_Q[2] / S], rotY: Math.PI / 2, walk: 0, gesture: t > UNROLL[0] ? 0.7 : 0, bow: 0, talk: talking(56.6, 59.2) || talking(61.4, 63.2) }
  }
  const comScript = () => {
    const t = tRef.current
    if (t < AT_QUAY) return { pos: C_A, rotY: face(C_A, NP), salute: t > 20.8 && t < 22.4 ? 0.9 : 0 }
    return { pos: C_Q, rotY: face(C_Q, [QUAY[0], 0, QUAY[1] + 0.3]), salute: t > 63.4 ? 1 : 0 }
  }
  const fwT = () => tRef.current
  return (
    <>
      <WorldSet tRef={tRef} />
      <CrownBreak tRef={tRef} />
      <GiftRing tRef={tRef} />
      <Chart tRef={tRef} />
      <Fireworks getT={fwT} bursts={BURSTS} />
      <group ref={nullG} scale={NS}>
        <CountNull script={nullScript} />
        {/* Gyroid's ring, kept in his palm */}
        <group ref={held} position={PALM}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.13 / NS, 0.03 / NS, 10, 36]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <pointLight position={[NP[0], TOPY + 4, NP[2] + 3]} color="#c8b0ff" intensity={3} distance={12} />
      <group scale={S}>
        <Gyroid script={gyroScript} />
        <Emmy script={emmyScript} />
      </group>
      <Commutator script={comScript} scale={0.8} />
      <MovieCamera tRef={tRef} />
      <Cues tRef={tRef} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <BloomFx mipmapBlur intensity={0.9} luminanceThreshold={0.62} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  )
}
