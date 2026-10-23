import { useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import { PatrolSpawn } from '../../characters/Spawn'
import Commutator from '../../castles/w3/Commutator'
import { Flash, ShotCamera, mix, seg, smooth } from '../../castles/w1/fx'
import { LiveLine } from '../../levels/w0/FlatsScenery'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import { Clouds, FloatingRocks } from '../../world/Dressing'
import Seascape from '../../world/Seascape'
import BastionSet, { KEEP, LAND_H as H, PETALS, PETAL_R } from './BastionSet'
import video from './video.json'

/**
 * World 1's intro (video.json, screen 'world1'). Dawn after Haven folded: Gyroid and Emmy follow
 * Null's violet trail up the Winding Way to Wayfall Landing, and Bouquet Bastion opens below them:
 * Endpoint Gardens, the Winding Road's helix, two loop districts tied at the Basepoint Beacon
 * (S¹ ∨ S¹), the Commutator's patrols walking a b a⁻¹ b⁻¹, and his Keep. Then Null fills the sky.
 *   A  0–10.8   the Way at dawn, Null's trail
 *   B  10.8–13  the Landing: the Bastion revealed
 *   C  13–25.6  fly-over: Gardens → the bouquet and its beacon → patrols → the Keep
 *   D  25.6–41.6 Null in the sky; the violet district dims under the Crown
 *   E  41.6–51.4 the answer; Emmy points to Endpoint Gardens (level 1-1)
 *   F  51.4–58  title
 */

const S = 0.7
const NULL_Z = -80
const NULL_SCALE = 10
const caps = video.captions
const spans = (who) => caps.filter((c) => c.speaker === who).map((c) => [c.t - 0.1, c.end])
const within = (t, sp) => sp.some(([a, b]) => t > a && t < b)
const E_TALK = spans('Emmy Boundary')
const G_TALK = spans('Gyroid')
const N_TALK = spans('Count Null')

/** How much of Null's storm is in the sky (0 dawn … 1 violet). */
const nullness = (t) => smooth(seg(t, 25.4, 27.4)) * (1 - smooth(seg(t, 40.6, 43)))
/** Null's height off the sea: he comes down out of the clouds, then folds himself away. */
const nullY = (t) => mix(70, 4, smooth(seg(t, 25.6, 27.6)))
const nullFold = (t) => smooth(seg(t, 40.2, 41.3)) // 1 = folded to a point

// ---- walking up the Way: both from z = 19 to the Landing's edge
const WALK_END = 10.4
const walkZ = (t, z1) => mix(19, z1, Math.min(1, t / WALK_END))
const G_END = [0.6, -1.7]
const E_END = [-0.75, -1.3]

// ---- the camera
const at = (t) => (walkZ(t, G_END[1]) + walkZ(t, E_END[1])) / 2
const SHOTS = [
  [0, 5.3, [[5, H + 3.2, 29], [0, H + 1, 15]], [[3.4, H + 2.4, 21], [0, H + 1.2, 8]]],
  // walking toward us: the camera backs up the Way ahead of them
  [5.3, 10.8, (t) => [[1.3, H + 1.55, at(t) - 3.6], [0, H + 1.05, at(t) + 0.5]]],
  // the reveal: up over their heads, the Bastion below
  [10.8, 13, [[0.3, H + 1.7, 2.4], [0, H + 1.3, -8]], [[0, H + 7, 6], [0, 0, -32]]],
  [13, 17.3, [[-12, 10, -6], [-7, 1, -24]], [[-9, 13, -17], [0, 4, -36]]],
  [17.3, 21, [[-5, 25, -12], [0, 0, -38]], [[13, 22, -18], [0, 0, -38]]],
  [21, 24.4, [[-3, 19, -10], [0, -2, -38]], [[3, 18, -12], [0, -2, -38]]],
  [24.4, 25.6, [[11, 8, -40], [0, 8, -64]], [[8, 9, -44], [0, 9, -64]]],
  // Null comes down behind the Keep
  [25.6, 27.2, (t) => [[mix(7, 6.5, seg(t, 25.6, 27.2)), 10, -16], [0, nullY(t) + 26, NULL_Z]]],
  [27.2, 31.2, [[0, 30, -34], [0, 31.5, NULL_Z]], [[0, 30.5, -38], [0, 31.8, NULL_Z]]],
  [31.2, 35.7, [[-3, H + 0.6, 5.5], [0.4, H + 6.2, -30]], [[-2.8, H + 0.6, 5.0], [0.4, H + 6.2, -30]]],
  [35.7, 37.2, [[30, 13, -6], [7, 14, -50]], [[28, 13.5, -4], [6, 14.5, -51]]],
  // the violet district goes grey under the Crown's shadow (framed above the caption)
  [37.2, 40.2, [[24, 22, -12], [7, -4, -40]], [[22, 24, -10], [6, -4, -40]]],
  [40.2, 41.6, [[0, 14, -20], [0, 24, NULL_Z]], [[0, 14, -22], [0, 24, NULL_Z]]],
  // the answer, from in front of them on the Landing's edge
  [41.6, 45.2, [[0.5, H + 1.45, 2.6], [-0.1, H + 0.3, -12]], [[0.4, H + 1.45, 2.2], [-0.1, H + 0.3, -12]]],
  [45.2, 49.3, [[2.2, H + 2.1, 2.6], [-8, 0, -14]], [[1.9, H + 2.0, 2.2], [-8, 0, -14]]],
  [49.3, 51.4, [[-1.9, H + 1.5, 2.3], [0.6, H + 0.2, -12]], [[-1.7, H + 1.5, 1.9], [0.6, H + 0.2, -12]]],
  [51.4, 60, [[0, H + 4, 9], [0, 2, -30]], [[0, 22, 24], [0, 0, -34]]],
]

/** A sky dome: deep blue above, a warm dawn band at the horizon; Null's storm turns it violet. */
function SkyDome({ tRef }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color('#0b0d22') },
      mid: { value: new THREE.Color('#2a2450') },
      horizon: { value: new THREE.Color('#ff9a6a') },
      stormTop: { value: new THREE.Color('#12061e') },
      stormMid: { value: new THREE.Color('#3a1460') },
      stormHorizon: { value: new THREE.Color('#9a3aff') },
      k: { value: 0 },
      dawn: { value: 0 },
    }),
    [],
  )
  useFrame(() => {
    const t = tRef.current
    uniforms.k.value = nullness(t)
    uniforms.dawn.value = smooth(seg(t, 41, 52))
  })
  return (
    <mesh scale={190}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial
        ref={mat}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          uniform vec3 top, mid, horizon, stormTop, stormMid, stormHorizon; uniform float k, dawn;
          varying vec3 vP;
          void main(){
            float h = vP.y;
            // the dawn sits north-east, so it glows beside the Bastion
            float east = 0.55 + 0.45 * max(0.0, dot(normalize(vec2(vP.x, vP.z)), normalize(vec2(0.7, -0.7))));
            vec3 hz = mix(horizon, horizon * 1.15 + vec3(0.06, 0.05, 0.0), dawn);
            vec3 a = mix(mix(mid, hz, east * (1.0 - smoothstep(0.0, 0.22, h))), top, smoothstep(0.12, 0.65, h));
            vec3 b = mix(mix(stormMid, stormHorizon, 1.0 - smoothstep(0.0, 0.25, h)), stormTop, smoothstep(0.15, 0.7, h));
            vec3 c = mix(a, b, k);
            if (h < 0.0) c = mix(c, vec3(0.05, 0.05, 0.1), smoothstep(0.0, -0.2, h));
            gl_FragColor = vec4(c, 1.0);
          }`}
      />
    </mesh>
  )
}

/** Fog, lights and their storm tint. */
function Weather({ tRef }) {
  const fog = useRef()
  const amb = useRef()
  const sun = useRef()
  const storm = useRef()
  const dawnFog = useMemo(() => new THREE.Color('#3a2c4c'), [])
  const stormFog = useMemo(() => new THREE.Color('#2a1046'), [])
  useFrame(({ scene }) => {
    const t = tRef.current
    const k = nullness(t)
    if (scene.fog) scene.fog.color.copy(dawnFog).lerp(stormFog, k)
    amb.current.intensity = 0.55 - 0.15 * k
    sun.current.intensity = (1.1 + 0.4 * smooth(seg(t, 41, 52))) * (1 - 0.6 * k)
    storm.current.intensity = 2.2 * k
  })
  return (
    <>
      <fog ref={fog} attach="fog" args={['#3a2c4c', 60, 175]} />
      <ambientLight ref={amb} intensity={0.55} />
      <hemisphereLight args={['#b8c4ff', '#201428', 0.5]} />
      <directionalLight ref={sun} position={[40, 12, -30]} intensity={1.1} color="#ffc49a" />
      <directionalLight ref={storm} position={[0, 40, -80]} intensity={0} color="#b080ff" />
      <directionalLight position={[-10, 14, 30]} intensity={0.35} color="#9ab0ff" />
    </>
  )
}

/** Null's violet trail: it runs up the Way, over the Bastion, past the Keep and away north. */
function NullTrail({ tRef }) {
  const pts = useMemo(() => {
    const out = []
    for (let i = 0; i <= 200; i++) {
      const u = i / 200
      let x
      let y
      let z
      if (u < 0.35) {
        z = mix(70, 0, u / 0.35)
        x = 0
        y = H + 2.6
      } else {
        const v = (u - 0.35) / 0.65
        z = mix(0, -110, v)
        x = Math.sin(v * Math.PI) * 6
        y = H + 2.6 + Math.sin(v * Math.PI * 0.9) * 9 + v * 10
      }
      out.push([x, z, y])
    }
    return out
  }, [])
  const live = () => {
    const t = tRef.current
    if (t > 41.5) return null
    const tt = performance.now() / 1000
    return pts.map(([x, z, y], i) => [x + Math.sin(i * 0.35 + tt * 2) * 0.25, z, y + Math.sin(i * 0.22 + tt * 1.4) * 0.3])
  }
  return (
    <>
      <LiveLine getPts={live} color="#b070ff" width={5} opacity={0.9} />
      <LiveLine getPts={() => { const p = live(); return p && p.map(([x, z, y]) => [x, z, y + 0.25]) }} color="#ff8ad8" width={1.5} opacity={0.6} />
    </>
  )
}

// ---- the Commutator's patrol: one file of guards walking his word a b a⁻¹ b⁻¹ round the two districts
const PATROL_PERIOD = 36 // story seconds for the whole word
function petalPoint(k, s) {
  // k: 0 a, 1 b, 2 a⁻¹, 3 b⁻¹ ; s 0..1 along that letter, starting and ending at the beacon
  const p = PETALS[k % 2]
  const back = k >= 2
  const u = back ? 1 - s : s
  const th0 = k % 2 === 0 ? 0 : Math.PI // the beacon's angle seen from that district's centre
  const th = th0 + (k % 2 === 0 ? -1 : 1) * u * Math.PI * 2
  return [p.c[0] + Math.cos(th) * PETAL_R, p.c[1] + Math.sin(th) * PETAL_R]
}
function patrolAt(w) {
  const x = ((w % 4) + 4) % 4
  const k = Math.floor(x)
  return { k, p: petalPoint(k, x - k) }
}
const GS = 2.4 // guard scale
function Patrol({ tRef }) {
  const guards = useMemo(() => [0, 1, 2].map((i) => ({ x: 0, z: 0, face: 0, alive: true, dying: 0, flash: 0, seed: i * 1.7, hp: 3, maxHp: 3 })), [])
  useFrame(() => {
    const t = tRef.current
    guards.forEach((e, i) => {
      const w = 0.35 + (t / PATROL_PERIOD) * 4 - i * 0.07
      const { p } = patrolAt(w)
      const { p: q } = patrolAt(w + 0.01)
      e.x = p[0] / GS
      e.z = p[1] / GS
      e.face = Math.atan2(q[0] - p[0], q[1] - p[1])
    })
  })
  const ribbon = () => {
    const t = tRef.current
    const w0 = 0.35 + (t / PATROL_PERIOD) * 4
    const out = []
    for (let j = 0; j <= 80; j++) {
      const { p } = patrolAt(w0 - 0.14 - j * 0.012)
      out.push([p[0], p[1], 0.9 + Math.sin(j * 0.5 + t * 3) * 0.12])
    }
    return out
  }
  return (
    <>
      <group scale={GS}>
        {guards.map((e, i) => (
          <PatrolSpawn key={i} e={e} />
        ))}
      </group>
      <LiveLine getPts={ribbon} color="#ffd27a" width={4} opacity={0.85} />
    </>
  )
}

export default function BastionIntroScene({ tRef }) {
  const violetDim = useRef(0)
  const redDim = useRef(0)
  const beamDim = useRef(0)
  const nullG = useRef()
  useFrame(() => {
    const t = tRef.current
    // the Crown's shadow passes over the violet district while Null promises to fold it, then lifts
    violetDim.current = smooth(seg(t, 36.2, 39)) * (1 - smooth(seg(t, 40, 41.5)))
    redDim.current = 0.35 * smooth(seg(t, 37.4, 39.4)) * (1 - smooth(seg(t, 40, 41.5)))
    beamDim.current = smooth(seg(t, 25.6, 27)) * (1 - smooth(seg(t, 40.5, 42)))
    const g = nullG.current
    const f = nullFold(t)
    g.visible = t > 25.5 && f < 0.995
    g.position.y = nullY(t)
    g.scale.setScalar(NULL_SCALE * Math.max(0.002, 1 - f))
  })

  const nullScript = useMemo(
    () => () => {
      const t = tRef.current
      return { gesture: within(t, N_TALK) ? 0.85 : t > 36 && t < 40.4 ? 1 : 0.15, crown: t > 35.8 && t < 40.4 ? 1 : 0.6, crownY: 0 }
    },
    [tRef],
  )
  const emmy = () => {
    const t = tRef.current
    const walking = t < WALK_END
    const talk = within(t, E_TALK)
    const pointing = t > 45.1 && t < 49.4
    return {
      pos: [walking ? -0.75 : E_END[0], H, walking ? walkZ(t, E_END[1]) : E_END[1]],
      rotY: pointing ? -2.45 : t > 49.3 ? Math.PI + 0.35 : Math.PI,
      walk: walking ? 1 : 0,
      bow: t > 31 && t < 40 ? 0.25 : 0,
      gesture: pointing ? 1 : talk ? 0.5 : 0,
      talk: talk ? 1 : 0,
    }
  }
  const gyro = () => {
    const t = tRef.current
    const walking = t < WALK_END
    const talk = within(t, G_TALK)
    const ready = t > 49.3
    return {
      pos: [walking ? 0.6 : G_END[0], H, walking ? walkZ(t, G_END[1]) : G_END[1]],
      rotY: ready ? Math.PI - 0.35 : Math.PI,
      run: walking ? 0.42 : 0,
      cast: ready ? 0.7 : talk ? 0.3 : 0.05,
      whip: 0,
      loop: 0,
      loopDrop: 0,
    }
  }
  const commutator = () => {
    const t = tRef.current
    return { gesture: t > 21.5 && t < 25.8 ? 1 : 0, cloak: 0, crack: 0, kneel: t > 26.4 && t < 41 ? 0.6 : 0, loops: 1, talk: 0 }
  }

  return (
    <>
      <SkyDome tRef={tRef} />
      <Weather tRef={tRef} />
      <Stars radius={150} depth={30} count={1400} factor={3} fade speed={0.2} />
      <Sparkles count={220} scale={[60, 10, 70]} position={[0, 3, -30]} size={2.6} speed={0.3} color="#ffb070" />
      <Clouds area={[0, -40, 120, 120]} count={18} y={22} opacity={0.3} />
      <FloatingRocks center={[0, 0, -34]} radius={[34, 48]} count={10} />
      <Seascape y={-0.9} depth={2.2} area={[0, -20, 150, 170]} seed={202} palette={{ water: '#132a4a', sand: '#3a4458', weed: '#3a2a5a' }} lanterns={18} />
      <BastionSet violetDimRef={violetDim} redDimRef={redDim} beamRef={beamDim} />
      <NullTrail tRef={tRef} />
      <Patrol tRef={tRef} />
      <group position={[KEEP[0], 8.25, KEEP[1] + 3.2]} scale={1.25}>
        <Commutator script={commutator} />
      </group>
      <group ref={nullG} position={[0, 70, NULL_Z]} scale={NULL_SCALE}>
        <CountNull script={nullScript} />
      </group>
      <Flash tRef={tRef} position={[0, 30, NULL_Z + 2]} flash={(t) => seg(t, 25.8, 27.6)} size={60} color="#c8a0ff" />
      <Flash tRef={tRef} position={[0, 34, NULL_Z + 2]} flash={(t) => seg(t, 41.1, 42.6)} size={40} color="#f4e8ff" />
      <Emmy scale={S} script={emmy} />
      <Gyroid scale={S} script={gyro} />
      <ShotCamera tRef={tRef} shots={SHOTS} shake={(t) => (t > 25.8 && t < 27 ? 0.25 : 0)} />
      <DevAdvance />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
