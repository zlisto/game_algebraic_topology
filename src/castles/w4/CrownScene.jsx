import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useRef } from 'react'
import CountNull from '../../characters/CountNull'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import OverworldKit from '../../levels/w0/OverworldKit'
import ReefGame from '../../levels/w0/ReefGame'
import { sfxCrack } from '../../audio/chip'
import Commutator from './Commutator'
import { Crown, Flash, Summit } from './CrownSet'
import { Panel } from './Demos4'
import { COMMUTATOR_HOME, NULL_AT, PANELS } from './stages'

/**
 * The Null Crown (World 4 castle, the final boss): the summit floor, Null's dais, the Crown above it,
 * the demonstration panels, the Commutator (once he has turned), and the fight itself (ReefGame).
 */

/** Null's dais: a stepped black hexagon and a tall split back, the gap shaped like a hole. */
function Dais() {
  return (
    <group position={[NULL_AT[0], 0, NULL_AT[1]]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2.1, 2.3, 0.4, 6]} />
        <meshStandardMaterial color="#120e1a" roughness={0.2} metalness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.2, 6]} />
        <meshStandardMaterial color="#1a1426" roughness={0.2} metalness={0.6} flatShading />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.9, 2.4, -1.5]} rotation={[0, 0, s * -0.12]}>
          <boxGeometry args={[0.45, 4.6, 0.3]} />
          <meshStandardMaterial color="#0e0b13" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 4.75, -1.5]}>
        <torusGeometry args={[0.95, 0.07, 8, 40, Math.PI]} />
        <meshBasicMaterial color="#a259ff" toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * The Commutator on the floor: every few seconds he picks a Crown shard, dashes to it and cuts it
 * down (through the game's own spawn list, so the wave counts stay honest).
 */
function CommutatorAgent({ present, spawnRef, playEnabled }) {
  const st = useRef({ x: COMMUTATOR_HOME[0], z: COMMUTATOR_HOME[1], rot: -2.2, timer: 2, dash: null, lunge: 0, walk: 0 })
  const slash = useRef(0)
  const slashAt = useRef([0, 1, 0])
  const flashG = useRef()
  useFrame((_, dt) => {
    const s = st.current
    slash.current = Math.max(0, slash.current - dt * 3)
    if (flashG.current) flashG.current.position.set(...slashAt.current)
    if (!present) return
    s.lunge = Math.max(0, s.lunge - dt * 2.5)
    if (s.dash) {
      const e = s.dash.e
      s.dash.t += dt
      const k = Math.min(1, s.dash.t / 0.4)
      const tx = e.x - Math.sin(s.rot) * 0.7
      const tz = e.z - Math.cos(s.rot) * 0.7
      s.x += (tx - s.x) * Math.min(1, k * 0.9)
      s.z += (tz - s.z) * Math.min(1, k * 0.9)
      s.rot = Math.atan2(e.x - s.x, e.z - s.z)
      s.walk = 1
      if (k >= 1) {
        s.lunge = 1
        slashAt.current = [e.x, 1.0, e.z]
        slash.current = 1
        sfxCrack()
        spawnRef.current?.remove((x) => x === e)
        s.dash = null
        s.timer = 0
      }
      return
    }
    s.walk = Math.max(0, s.walk - dt * 3)
    if (!playEnabled) return
    s.timer += dt
    if (s.timer < 3.6) return
    let found = null
    spawnRef.current?.remove((e) => {
      if (!found && e.type === 'shard' && e.alive) found = e
      return false
    })
    if (found) s.dash = { e: found, t: 0 }
    else s.timer = 2.4
    // keep inside the rim
    const r = Math.hypot(s.x, s.z)
    if (r > 7.6) (s.x *= 7.6 / r), (s.z *= 7.6 / r)
  })
  const script = () => {
    const s = st.current
    return { visible: present, pos: [s.x, 0, s.z], rotY: s.rot, lunge: s.lunge, walk: s.walk, glow: s.lunge }
  }
  return (
    <>
      <group scale={0.95}>
        <Commutator script={script} />
      </group>
      <group ref={flashG}>
        <Flash position={[0, 0, 0]} kRef={slash} size={3.2} color="#ff9ae8" />
      </group>
    </>
  )
}

/** Flashes fade on their own (the Crown's win sequence drives its own). */
function FlashDecay({ flashRef, hold }) {
  useFrame((_, dt) => {
    if (!hold) flashRef.current = Math.max(0, flashRef.current - dt * 1.4)
  })
  return null
}

export default function CrownScene({ panels, panelKind, panelStates, panelKey, crownRef, furyRef, flashRef, flashHold, commutator, nullScript, walkable, game, gameKey, stateRef, frameRef, camYawRef, spawnRef, playEnabled, tool, onEnemies, onHearts }) {
  return (
    <>
      <FlashDecay flashRef={flashRef} hold={flashHold} />
      <Summit furyRef={furyRef} />
      <Dais />
      <Crown stateRef={crownRef} />
      <Flash position={[NULL_AT[0], 4, NULL_AT[1] + 1]} kRef={flashRef} size={40} />
      <group position={[NULL_AT[0], 0.42, NULL_AT[1]]} scale={0.85}>
        <CountNull script={nullScript} />
      </group>
      {panels &&
        PANELS.map((at, i) => <Panel key={`${panelKey}:${i}`} at={at} item={panels[i]} state={panelStates[i]} kind={panelKind} />)}
      <CommutatorAgent present={commutator} spawnRef={spawnRef} playEnabled={playEnabled} />
      <ReefGame
        key={gameKey}
        camYawRef={camYawRef}
        elixirs
        stage={game}
        shape={walkable}
        playEnabled={playEnabled}
        spoolEnabled={false}
        tool={tool}
        sim={null}
        tRef={{ current: 0 }}
        stateRef={stateRef}
        spawnRef={spawnRef}
        ribbonApi={{ current: null }}
        onAction={() => {}}
        onStrokeStart={() => false}
        onStrokeMove={() => {}}
        onStrokeEnd={() => {}}
        onEnemies={onEnemies}
        onHearts={onHearts}
        onSpooling={() => {}}
      />
      <OverworldKit stateRef={stateRef} camYawRef={camYawRef} frameRef={frameRef} walkable={walkable} follower={false} />
      <DevAdvance />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.72} />
      </EffectComposer>
    </>
  )
}
