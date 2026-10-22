import { useMemo } from 'react'
import { LAND } from '../theme/palette'
import { StaticReef } from './ReefScenery'

/**
 * The open battle commons between a level's stations (sites with kind 'commons'): wide stone
 * plazas on rock pillars, ringed with a few standing stones and lanterns. Puzzle-free ground
 * for fighting the beasts that roam there.
 */
function Lantern({ p }) {
  return (
    <group position={[p[0], 0, p[1]]}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.9, 6]} />
        <meshStandardMaterial color={LAND.rock} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Commons({ site }) {
  const c = site.def.add[0]
  const r = c.type === 'circle' ? c.r : Math.min(c.x1 - c.x0, c.z1 - c.z0) / 2
  const dressing = useMemo(() => {
    const out = []
    const n = 5
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + site.pos[0] * 0.37
      out.push({ kind: i % 2 ? 'stone' : 'lantern', p: [Math.cos(a) * (r - 0.45), Math.sin(a) * (r - 0.45)], s: 0.5 + ((i * 37) % 7) / 10 })
    }
    return out
  }, [r, site.pos])
  return (
    <group>
      <StaticReef shapeDef={site.def} pos={site.pos} />
      {/* the plaza's rock pillar under the water line */}
      <mesh position={[site.pos[0], -1.9, site.pos[1]]}>
        <cylinderGeometry args={[r * 0.95, r * 0.55, 3.4, 18]} />
        <meshStandardMaterial color={LAND.rock} roughness={0.9} flatShading />
      </mesh>
      <group position={[site.pos[0], 0, site.pos[1]]}>
        {dressing.map((d, i) =>
          d.kind === 'lantern' ? (
            <Lantern key={i} p={d.p} />
          ) : (
            <mesh key={i} position={[d.p[0], d.s * 0.4, d.p[1]]} rotation={[0.1, i, 0.05]}>
              <boxGeometry args={[0.35, d.s * 0.8, 0.25]} />
              <meshStandardMaterial color={LAND.stoneDark || LAND.rock} roughness={0.7} flatShading />
            </mesh>
          ),
        )}
      </group>
    </group>
  )
}

export default function CommonsIslands({ sites }) {
  return (
    <>
      {sites
        .filter((s) => s.kind === 'commons')
        .map((s) => (
          <Commons key={s.id} site={s} />
        ))}
    </>
  )
}
