import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { readMuted, setMuted as setAudioMuted, startReefMusic, stopMusic, unlockAudio } from '../../audio/chip'
import CountNull from '../../characters/CountNull'
import Emmy from '../../characters/Emmy'
import Gyroid from '../../characters/Gyroid'
import Commutator from './Commutator'
import { BURSTS } from './EndingMovie'
import WorldSet, { Fireworks, NULL_AT, QUAY, QY } from './WorldSet'

/**
 * Screen 'credits': end credits scrolling over a slow fly-over of the restored Winding World
 * at sunrise. Esc / Enter (or Skip) goes on to the title; a "Back to title" button waits at the end.
 * ?screen=credits to test.
 */

const SCROLL_SEC = 95
const MATH_URL = 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html'

const PEOPLE = [
  {
    name: 'Tauhid Zaman',
    who: 'Human',
    roles: ['Creator', 'Director', 'Developer'],
  },
  {
    name: 'Claude',
    who: 'AI · Anthropic',
    roles: ['Game design', 'Programming', 'Story & dialogue', 'Level design', 'Procedural music & sound', 'Playtesting & critique agents'],
    note: 'A multi-agent team of Claude workers and critics: one agent builds a level, another plays it and tears it apart, and the fix goes back for review.',
  },
  {
    name: 'Cursor',
    who: 'AI development environment',
    roles: ['Development environment', 'Additional programming'],
  },
  {
    name: 'Google Gemini',
    who: 'AI · Google',
    roles: ['Concept art: the bestiary cards and world art'],
  },
]

const CAST = [
  ['Gyroid', 'a post-runner from Haven Ring'],
  ['Emmy Boundary', 'cartographer; she built the presses'],
  ['Count Null', 'who lost someone on a road that wound away'],
  ['The Commutator', 'Null’s marshal, who turned at the Crown'],
]

const WORLDS = [
  ['World 0 · Retract Reef', 'Homotopy, deformation retractions, homotopy equivalence, CW complexes', 'Hatcher, Chapter 0'],
  ['World 1 · Bouquet Bastion', 'The fundamental group, van Kampen’s theorem, covering spaces', 'Chapter 1'],
  ['World 2 · Chain Delta', 'Simplicial and singular homology, exact sequences, degree, Mayer–Vietoris', 'Chapter 2'],
  ['World 3 · Cup Product Gardens', 'Cohomology, cup products, Poincaré duality', 'Chapter 3'],
  ['World 4 · Postnikov Spire', 'Higher homotopy groups, Hurewicz, fibrations, Postnikov towers, obstruction theory', 'Chapter 4'],
]

// ---------------------------------------------------------------- the fly-over

function FlyCam() {
  const { camera, clock } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const a = -0.6 + clock.elapsedTime * 0.028
    camera.position.set(Math.cos(a) * 80, 36 + Math.sin(a * 2.1) * 6, -18 + Math.sin(a) * 72)
    look.set(Math.cos(a + 0.9) * 14, 0, -20 + Math.sin(a + 0.9) * 12)
    camera.lookAt(look)
  })
  return null
}

const FAR = { current: 999 } // story time long after the ending: everything restored, the sun up
const S = 0.7
function Restored() {
  const fwT = useMemo(() => {
    const t0 = performance.now()
    return () => 58 + (((performance.now() - t0) / 1000 + 6) % 24)
  }, [])
  return (
    <>
      <WorldSet tRef={FAR} />
      <Fireworks getT={fwT} bursts={BURSTS} />
      <group position={[NULL_AT[0], NULL_AT[1], NULL_AT[2]]} rotation={[0, 1.1, 0]} scale={0.8}>
        <CountNull script={() => ({ gesture: 0.55, crown: 0, crownY: 500 })} />
      </group>
      <group scale={S}>
        <Gyroid script={() => ({ pos: [(QUAY[0] + 0.95) / S, QY / S, (QUAY[1] + 0.1) / S], rotY: -Math.PI / 2, run: 0, cast: 0, whip: 0, loop: 0, loopDrop: 0 })} />
        <Emmy script={() => ({ pos: [(QUAY[0] - 0.95) / S, QY / S, (QUAY[1] + 0.1) / S], rotY: Math.PI / 2, walk: 0, gesture: 0.6, bow: 0, talk: 0 })} />
      </group>
      <Commutator script={() => ({ pos: [QUAY[0] + 2.0, QY, QUAY[1] - 1.4], rotY: -2.2, salute: 0 })} scale={0.8} />
      <FlyCam />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.65} luminanceSmoothing={0.2} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  )
}

// ---------------------------------------------------------------- the roll

const H = { fontFamily: 'var(--font-display)', color: '#ffd27a', fontSize: 13, letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 18px' }
const block = { margin: '0 auto 84px', maxWidth: 620 }

function Roll() {
  return (
    <>
      <div style={{ ...block, marginBottom: 110 }}>
        <div style={{ ...H, marginBottom: 10 }}>The End</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 76px)', margin: 0, color: '#fff4dc', lineHeight: 1.02 }}>Winding World</h1>
        <p style={{ fontStyle: 'italic', color: '#d8e4ee', fontSize: 18, margin: '12px 0 0' }}>Shape can change. Topology can’t.</p>
        <p style={{ color: '#a9bcc8', fontSize: 15, marginTop: 28 }}>An Arcade of Alexandria game</p>
      </div>

      <div style={block}>
        <div style={H}>Made by a human and AIs</div>
        {PEOPLE.map((p) => (
          <div key={p.name} style={{ marginBottom: 46 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.6vw, 36px)', color: '#fff4dc' }}>{p.name}</div>
            <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3ecfbf', margin: '4px 0 10px' }}>{p.who}</div>
            <div style={{ color: '#e8eef0', fontSize: 17, lineHeight: 1.7 }}>{p.roles.join(' · ')}</div>
            {p.note && <p style={{ color: '#a9bcc8', fontSize: 14, lineHeight: 1.6, margin: '10px auto 0', maxWidth: 480 }}>{p.note}</p>}
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={H}>The cast</div>
        {CAST.map(([n, d]) => (
          <div key={n} style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff4dc' }}>{n}</span>
            <div style={{ color: '#a9bcc8', fontSize: 14, fontStyle: 'italic' }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={H}>The worlds, and what they taught</div>
        {WORLDS.map(([w, what, ch]) => (
          <div key={w} style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: '#fff4dc' }}>{w}</div>
            <div style={{ color: '#e8eef0', fontSize: 15, lineHeight: 1.5 }}>{what}</div>
            <div style={{ color: '#8a9aa3', fontSize: 12, letterSpacing: '0.08em' }}>{ch}</div>
          </div>
        ))}
      </div>

      <div style={block}>
        <div style={H}>The mathematics</div>
        <p style={{ color: '#e8eef0', fontSize: 18, lineHeight: 1.6, margin: 0 }}>
          after Allen Hatcher, <i>Algebraic Topology</i>
          <br />
          (Cambridge University Press, 2002)
        </p>
        <p style={{ margin: '14px 0 0' }}>
          <a href={MATH_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#3ecfbf', fontSize: 15, pointerEvents: 'auto' }}>
            pi.math.cornell.edu/~hatcher/AT/ATpage.html
          </a>
        </p>
        <p style={{ color: '#a9bcc8', fontSize: 14, lineHeight: 1.6, margin: '18px auto 0', maxWidth: 500 }}>
          Every level’s mathematics traces back to the book’s chapters and pages.
        </p>
      </div>

      <div style={block}>
        <div style={H}>How it was made</div>
        <p style={{ color: '#e8eef0', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
          One person with the vision and the final say. A team of AI agents that designed, wrote, coded, composed, playtested and critiqued each other’s work, level by level, until it taught the mathematics faithfully and was fun to play.
        </p>
      </div>
    </>
  )
}

export default function Credits({ onNext, onBackToTitle }) {
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(readMuted)
  const toTitle = onBackToTitle || onNext
  const leave = useRef(toTitle)
  leave.current = toTitle

  useEffect(() => {
    unlockAudio()
    startReefMusic()
    const unlock = () => unlockAudio()
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        leave.current?.()
      }
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', onKey)
    const id = setTimeout(() => setDone(true), SCROLL_SEC * 1000)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', onKey)
      clearTimeout(id)
      stopMusic()
    }
  }, [])

  return (
    <div className="screen intro" style={{ background: '#060912' }}>
      <style>{`
        @keyframes ww-credits-roll { from { transform: translateY(60vh); } to { transform: translateY(-100%); } }
        @keyframes ww-credits-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
      <Canvas camera={{ position: [60, 30, 40], fov: 42, near: 0.1, far: 240 }} dpr={[1, 1.5]}>
        <Restored />
      </Canvas>
      {/* a soft dark column behind the text, so it reads over the sunrise */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(6,9,18,0) 12%, rgba(6,9,18,0.62) 34%, rgba(6,9,18,0.62) 66%, rgba(6,9,18,0) 88%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            padding: '0 16px',
            textAlign: 'center',
            animation: `ww-credits-roll ${SCROLL_SEC}s linear forwards`,
            opacity: done ? 0 : 1,
            transition: 'opacity 1s',
          }}
        >
          <Roll />
        </div>
      </div>

      {done && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 16px',
            animation: 'ww-credits-in 1.2s ease-out',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4.4vw, 46px)', color: '#fff4dc', margin: 0, lineHeight: 1.2 }}>Made by a human and AIs, together.</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 30px)', color: '#ffd27a', margin: '14px 0 34px' }}>Thanks for playing.</p>
          <button type="button" className="btn primary" onClick={toTitle} autoFocus>
            Back to title
          </button>
        </div>
      )}

      <div className="ui-overlay" style={{ pointerEvents: 'none' }}>
        <div className="hud-top" style={{ pointerEvents: 'auto' }}>
          <div />
          <div className="btn-row">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setMuted(!muted)
                setAudioMuted(!muted)
              }}
              aria-pressed={muted}
            >
              {muted ? '♪ Sound off' : '♪ Sound on'}
            </button>
            {!done && (
              <button type="button" className="btn ghost" onClick={() => setDone(true)}>
                Skip ▸
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
