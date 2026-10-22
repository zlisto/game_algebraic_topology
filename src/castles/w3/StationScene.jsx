import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { DevAdvance } from '../../levels/w0/OverworldScene'
import OverworldKit from '../../levels/w0/OverworldKit'
import ReefGame from '../../levels/w0/ReefGame'
import Commutator from './Commutator'
import { Panel } from './Demos'
import StationSet from './StationSet'
import { BOSS_AT, PANELS } from './stages'

/** The Counterfeit Station's concourse in play: the set, the Commutator on his dais, the panels, the game. */
export default function StationScene({ trial, round, panelStates, showPanels, bossScript, crownGlow, walkable, game, gameKey, stateRef, frameRef, camYawRef, spawnRef, playEnabled, tool, onEnemies, onHearts }) {
  return (
    <>
      <StationSet crownGlow={crownGlow} />
      <group position={[BOSS_AT[0], 0.35, BOSS_AT[1]]} scale={0.95}>
        <Commutator script={bossScript} />
      </group>
      {showPanels && PANELS.map((at, i) => <Panel key={`${trial}:${String(round)}:${i}`} at={at} trial={trial} exhibit={round[i]} state={panelStates[i]} />)}
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
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.68} />
      </EffectComposer>
    </>
  )
}
