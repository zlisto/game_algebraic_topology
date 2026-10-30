import { useFrame } from '@react-three/fiber'
import { Part, preloadModels } from './models'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Lightning, cached, merge, piece } from './Beasts'

preloadModels('bestiary')
const KLEIN_FLASH = new THREE.MeshStandardMaterial({ color: '#3a1e4e', emissive: '#d070ff', emissiveIntensity: 2 })

/**
 * The topological bestiary (design/BESTIARY.md), past the Sphere and Torus. Each body IS its
 * surface, and its hit count is its invariant:
 *
 *   MobiusSpawn     — Möbius strip, π₁ = ℤ, 2 lashes. Cut down the middle it doesn't fall in two: it
 *                     becomes one band twice as long with two full twists, and runs twice as fast.
 *   ProjectiveSpawn — ℝP² as a cross-cap, π₁ = ℤ₂, 2 lashes in quick succession: one lash only flips
 *                     its orientation (2-torsion); leave it and it settles back.
 *   KleinSpawn      — Klein bottle, H₁ = ℤ ⊕ ℤ₂, 3 lashes: one for the free loop, then a torsion pair.
 *   BitorusSpawn    — genus-2 surface, H₁ = ℤ⁴, 4 lashes: each one cuts a generator; a side's eye goes
 *                     dark, then that side collapses, then the other.
 *   EarringSpawn    — the Hawaiian earring, circles of radius 1/n all tangent at one point; not a CW
 *                     complex. 5 lashes, each shattering the biggest ring; it shrinks and speeds up
 *                     until the accumulation point itself is struck.
 */

const VIOLET = '#b070ff'
const MAGENTA = '#e05cff'

function place(g, e, y, dieTime, size = 1) {
  g.visible = e.alive || e.dying > 0
  g.position.set(e.x, y, e.z)
  g.rotation.y = e.face
  g.scale.setScalar(size * (e.dying > 0 ? Math.max(0.001, e.dying / dieTime) : 1 + (e.flash > 0 ? 0.12 : 0)))
}

/** A parametric surface f(u, v) → [x, y, z] on [0,1]², as an indexed, double-sided-friendly geometry. */
export function surface(f, nu, nv) {
  const pos = []
  const idx = []
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) pos.push(...f(i / nu, j / nv))
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j
      const b = a + nv + 1
      idx.push(a, b, a + 1, a + 1, b, b + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const chitin = (extra = {}) => <meshPhysicalMaterial color="#1f1028" roughness={0.25} metalness={0.2} clearcoat={0.8} emissive="#3a0f5e" emissiveIntensity={0.35} side={THREE.DoubleSide} {...extra} />
const glow = (color = VIOLET, extra = {}) => <meshBasicMaterial color={color} toneMapped={false} {...extra} />

// ---------------------------------------------------------------- Möbius prowler

/** A band of `halfTwists` half-twists round a circle of radius R, half-width w. */
function band(R, w, halfTwists) {
  return (u, v) => {
    const a = u * Math.PI * 2
    const s = (v - 0.5) * 2 * w
    const t = (a * halfTwists) / 2
    return [(R + s * Math.cos(t)) * Math.cos(a), s * Math.sin(t), (R + s * Math.cos(t)) * Math.sin(a)]
  }
}

export function MobiusSpawn({ e }) {
  const g = useRef()
  const body = useRef()
  const cut = e.hp < (e.maxHp || 2)
  const whole = useMemo(() => surface(band(0.46, 0.22, 1), 96, 6), [])
  const long = useMemo(() => surface(band(0.7, 0.13, 4), 160, 4), [])
  // legs all along the single edge: v = 1 then (after the half twist) v = 0 — one boundary circle
  const legs = useMemo(() => {
    const f = band(0.46, 0.22, 1)
    return Array.from({ length: 26 }, (_, i) => f((i / 26) * 2 % 1, i < 13 ? 1 : 0))
  }, [])
  const legGeo = useMemo(() => cached('mobius-legs', () => merge(legs.map((p) => piece(new THREE.ConeGeometry(1, 1, 4), { p, s: [0.012, 0.06, 0.012] })))), [legs])
  const seam = useMemo(() => {
    const f = band(0.46, 0.22, 1)
    return new Float32Array(Array.from({ length: 97 }, (_, i) => f(i / 96, 0.5)).flat())
  }, [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.55 + Math.sin(t * 3) * 0.04, 0.5)
    // the band rocks and ripples as it crawls; it keeps its head to the front
    body.current.rotation.z = Math.sin(t * (cut ? 9 : 5)) * 0.12
    body.current.rotation.x = 0.35 + Math.sin(t * 3) * 0.08
  })
  return (
    <group ref={g}>
      <group ref={body}>
        <mesh geometry={cut ? long : whole}>{chitin({ color: '#3a1e4a', emissiveIntensity: e.flash > 0 ? 2 : cut ? 1.1 : 0.6 })}</mesh>
        <mesh geometry={cut ? long : whole} scale={1.04}>
          <meshBasicMaterial color="#c070ff" side={THREE.BackSide} transparent opacity={0.45} toneMapped={false} depthWrite={false} />
        </mesh>
        {!cut && (
          <>
            <line>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={seam} count={97} itemSize={3} />
              </bufferGeometry>
              <lineBasicMaterial color="#ff9cff" toneMapped={false} />
            </line>
            <mesh geometry={legGeo}>
              <meshStandardMaterial color="#3a2a48" />
            </mesh>
            {/* the head, reared up on a short neck where the loop closes on itself */}
            <mesh position={[0.46, 0.1, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.05, 0.07, 0.2, 8]} />
              {chitin({ color: '#3a1e4a', emissiveIntensity: 0.6 })}
            </mesh>
            <group position={[0.5, 0.24, 0]} scale={1.5}>
              <mesh scale={[0.11, 0.08, 0.13]}>
                <sphereGeometry args={[1, 14, 10]} />
                {chitin()}
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[0.06, -0.04, s * 0.05]} rotation={[0, 0, -2.4]} scale={[0.015, 0.07, 0.015]}>
                  <coneGeometry args={[1, 1, 4]} />
                  {glow('#f0a8ff')}
                </mesh>
              ))}
              {[-1, 1].map((s) => (
                <mesh key={`e${s}`} position={[0.09, 0.04, s * 0.04]}>
                  <sphereGeometry args={[0.024, 8, 6]} />
                  {glow('#ff6aff')}
                </mesh>
              ))}
            </group>
          </>
        )}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- projective specter

/** The cross-cap: an immersion of ℝP² that passes through itself along a segment. */
const crossCap = (u, v) => {
  const a = u * Math.PI * 2
  const b = v * (Math.PI / 2)
  const r = 0.36
  return [r * Math.cos(a) * Math.sin(2 * b), r * (Math.cos(b) ** 2 - Math.cos(a) ** 2 * Math.sin(b) ** 2) * 1.2, r * Math.sin(a) * Math.sin(2 * b)]
}

export function ProjectiveSpawn({ e }) {
  const g = useRef()
  const sheet = useRef()
  const mist = useRef()
  const seam = useRef()
  const clock2 = useRef()
  const seamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: MAGENTA, toneMapped: false }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.75 + Math.sin(t * 1.7) * 0.08, 0.5)
    // torsion: one lash leaves it mirror-flipped (e.flipped) until a second lash lands — or it settles back
    // torsion: one lash turns it upside down (seam cyan, a countdown ring); a second finishes it, else it rights itself
    const want = e.flipped ? 0 : Math.PI
    sheet.current.rotation.x += (want - sheet.current.rotation.x) * 0.15
    sheet.current.rotation.y = Math.sin(t * 0.8) * 0.4
    seamMat.color.set(e.flipped ? '#5cf0ff' : MAGENTA)
    clock2.current.visible = !!e.flipped
    if (e.flipped) clock2.current.scale.setScalar(Math.max(0.05, (e.torsionClock || 0) / 2.2))
    mist.current.rotation.y = -t * 0.6
  })
  return (
    <group ref={g}>
      <group ref={sheet} rotation={[Math.PI, 0, 0]} scale={1.35}>
        {/* the cross-cap, sculpted (tools/bestiary_blender.py): a bowl below, a split dome above */}
        <group rotation={[Math.PI, 0, 0]}>
          <Part model="bestiary" name="projective" />
        </group>
        {/* the line of self-intersection down its cleft (cyan once flipped) */}
        <group rotation={[Math.PI, 0, 0]}>
          <Part model="bestiary" name="projective_seam" mats={{ glow: seamMat }} />
        </group>
        <mesh ref={seam} visible={false}>
          <boxGeometry args={[0.01, 0.01, 0.01]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      {/* torsion countdown: shrinks to nothing as the 2.2 s window closes */}
      <mesh ref={clock2} position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[0.25, 0.025, 6, 32]} />
        {glow('#5cf0ff')}
      </mesh>
      <group ref={mist}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i) * 0.35, -0.3 - (i % 3) * 0.06, Math.sin(i) * 0.35]}>
            <sphereGeometry args={[0.06 + (i % 2) * 0.03, 8, 6]} />
            <meshBasicMaterial color="#a080ff" transparent opacity={0.2} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- Klein bottle sentinel

/** The classic "bottle" immersion of the Klein bottle (the neck passes back through the side). */
export const klein = (uu, vv) => {
  const u = uu * Math.PI
  const v = vv * Math.PI * 2
  const c = Math.cos(u)
  const s = Math.sin(u)
  const x = (-2 / 15) * c * (3 * Math.cos(v) - 30 * s + 90 * c ** 4 * s - 60 * c ** 6 * s + 5 * c * Math.cos(v) * s)
  const y =
    (-1 / 15) * s * (3 * Math.cos(v) - 3 * c ** 2 * Math.cos(v) - 48 * c ** 4 * Math.cos(v) + 48 * c ** 6 * Math.cos(v) - 60 * s + 5 * c * Math.cos(v) * s - 5 * c ** 3 * Math.cos(v) * s - 80 * c ** 5 * Math.cos(v) * s + 80 * c ** 7 * Math.cos(v) * s)
  const z = (2 / 15) * (3 + 5 * c * s) * Math.sin(v)
  const k = 0.16
  return [x * k, y * k, z * k]
}

export function KleinSpawn({ e }) {
  const g = useRef()
  const body = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.95 + Math.sin(t * 1.4) * 0.05, 0.6)
    body.current.rotation.z = Math.sin(t * 0.5) * 0.2 + (e.flipped ? Math.PI : 0) // the torsion pair: a single lash turns it over
  })
  return (
    <group ref={g}>
      {/* the bottle, sculpted (tools/bestiary_blender.py): a toothed bulb, its ribbed neck plunging back in through its side */}
      <group ref={body} scale={1.15}>
        <Part model="bestiary" name="klein" mats={e.flash > 0 ? { shell: KLEIN_FLASH } : undefined} />
      </group>
      {e.hp <= 2 && (
        // free loop severed: a crack glows across the body
        <mesh position={[0, 0.12, 0.16]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.3, 0.012, 0.012]} />
          {glow('#ffd27a')}
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------- bitorus

export function BitorusSpawn({ e }) {
  const g = useRef()
  const spin = useRef()
  const cuts = (e.maxHp || 4) - e.hp // generators cut so far: 0..3
  const RR = 0.36
  const r = 0.14
  const sides = [-1, 1]
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 0.85 + Math.sin(t * 2) * 0.05, 0.6)
    spin.current.rotation.y = Math.sin(t * 0.7) * 0.5
    spin.current.rotation.z += dt * (e.stun > 0 ? 3 : 0)
  })
  return (
    <group ref={g}>
      <group ref={spin} rotation={[-0.35, 0, 0]}>
        {sides.map((s, k) => {
          // left side loses its generators first: eye dark at 1 cut, ring gone at 2; then the right
          const lost = Math.max(0, Math.min(2, cuts - k * 2))
          return (
            <group key={s} position={[s * RR * 0.92, 0, 0]}>
              {lost < 2 && (
                <mesh>
                  <torusGeometry args={[RR, r, 14, 40]} />
                  <meshPhysicalMaterial color="#2a1222" roughness={0.3} clearcoat={0.7} emissive="#5a1650" emissiveIntensity={e.flash > 0 ? 2 : 0.35} />
                </mesh>
              )}
              {lost < 2 &&
                Array.from({ length: 9 }, (_, i) => {
                  const a = (i / 9) * Math.PI * 2 + 0.3
                  return (
                    <mesh key={i} position={[Math.cos(a) * (RR + r * 0.9), Math.sin(a) * (RR + r * 0.9), 0]} rotation={[0, 0, a - Math.PI / 2]}>
                      <coneGeometry args={[0.045, 0.18, 5]} />
                      <meshStandardMaterial color="#d8c8b0" roughness={0.5} />
                    </mesh>
                  )
                })}
              {/* the pupil in this hole: open, then dark once its first generator is cut (gone with its ring) */}
              {lost < 2 && (
              <>
              <mesh scale={[0.1, 0.12, 0.06]}>
                <sphereGeometry args={[1, 16, 12]} />
                {lost === 0 ? <meshStandardMaterial color="#ffd27a" emissive="#ff9a2a" emissiveIntensity={1.2} /> : <meshBasicMaterial color="#1a0a14" />}
              </mesh>
              <mesh position={[0, 0, 0.055]} scale={[0.02, 0.09, 0.02]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshBasicMaterial color="#120408" />
              </mesh>
              </>
              )}
            </group>
          )
        })}
        {/* the fleshy neck where the two handles join */}
        {cuts < 2 && (
          <mesh scale={[0.22, 0.3, 0.17]}>
            <sphereGeometry args={[1, 18, 14]} />
            <meshPhysicalMaterial color="#2a1222" roughness={0.3} clearcoat={0.7} emissive="#5a1650" emissiveIntensity={0.35} />
          </mesh>
        )}
        <Lightning radius={0.95} tilt={0.3} speed={1} seed={e.seed || 0} />
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- Hawaiian earring

export function EarringSpawn({ e }) {
  const g = useRef()
  const rings = useRef()
  const maxHp = e.maxHp || 5
  const gone = maxHp - e.hp // the biggest rings shatter first
  const N = 18
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + e.seed
    place(g.current, e, 1.3 + Math.sin(t * (2 + gone)) * 0.06, 0.8, 2 * (1 - gone * 0.12))
    rings.current.rotation.y = t * (0.6 + gone * 0.5)
    rings.current.children.forEach((m, i) => {
      if (m.material) m.material.opacity = 0.55 + 0.45 * Math.abs(Math.sin(t * (6 + i) + i))
    })
  })
  // circle n has radius R/n and passes through the shared point P at the bottom (its centre sits at R/n above P)
  const R = 0.62
  return (
    <group ref={g}>
      <group ref={rings}>
        {Array.from({ length: N }, (_, k) => {
          const n = k + 1
          if (n <= gone) return null
          const rn = R / n
          return (
            <mesh key={n} position={[0, rn - R / 2, 0]}>
              <torusGeometry args={[rn, 0.016 + 0.01 / n, 6, 64]} />
              <meshBasicMaterial color={n % 2 ? '#d090ff' : VIOLET} transparent opacity={0.9} toneMapped={false} />
            </mesh>
          )
        })}
      </group>
      {/* the accumulation point, where every ring meets — the last lash must land here */}
      <mesh position={[0, -R / 2, 0]}>
        <sphereGeometry args={[0.07 + gone * 0.015, 14, 12]} />
        {glow('#ffffff')}
      </mesh>
      {/* the spiked core, off to one side so the rings stay visible */}
      <mesh position={[R * 0.75, -R / 2 + 0.15, 0]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshPhysicalMaterial color="#120818" roughness={0.2} clearcoat={1} emissive="#3a0f5e" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
