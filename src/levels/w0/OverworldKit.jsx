import ChaseCamera from './ChaseCamera'
import EmmyFollower from './EmmyFollower'
import { Star, WarpPortal } from './StarPortal'

/**
 * The open-overworld pieces a World 0 scene adds on top of its own world: the chase camera
 * (overhead while a puzzle is worked, via frameRef), the rewards, the Warp Portal, and Emmy
 * following along (`follower` — off in levels where Emmy walks the stations herself).
 * `portal.facing` defaults to facing back along the exit causeway (`exitFrom` → portal).
 */
export default function OverworldKit({ stateRef, camYawRef, talkingRef, frameRef, lockRef, walkable, stars = [], portal, exitFrom, follower = true, emmyRef }) {
  const facing = portal && exitFrom ? Math.atan2(portal.pos[0] - exitFrom[0], portal.pos[1] - exitFrom[1]) : 0
  return (
    <>
      {stars.map((st) => (
        <Star key={st.id} {...st} />
      ))}
      {portal && <WarpPortal facing={facing} {...portal} />}
      {follower && <EmmyFollower stateRef={stateRef} talkingRef={talkingRef} camYawRef={camYawRef} walkable={walkable} posRef={emmyRef} />}
      <ChaseCamera stateRef={stateRef} yawRef={camYawRef} overheadRef={frameRef} lockRef={lockRef} />
    </>
  )
}
