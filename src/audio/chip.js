/**
 * Game audio for the levels: SNES-style dialogue sounds and the Retract Reef theme,
 * all synthesized with Web Audio. One shared context; mute is the same setting the
 * intro uses (localStorage 'winding-world:muted').
 */

const MUTE_KEY = 'winding-world:muted'
let ctx = null
let master = null // everything
let musicBus = null // background music (ducked under dialogue)
let sfxBus = null
let echo = null // SNES-style echo for plucks

export function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function audio() {
  if (ctx) return ctx
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  ctx = new Ctx()
  master = ctx.createGain()
  master.gain.value = readMuted() ? 0 : 0.8
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.ratio.value = 3
  master.connect(comp).connect(ctx.destination)
  musicBus = ctx.createGain()
  musicBus.gain.value = 0.38
  musicBus.connect(master)
  sfxBus = ctx.createGain()
  sfxBus.gain.value = 0.5
  sfxBus.connect(master)
  echo = ctx.createDelay(1)
  echo.delayTime.value = 0.24
  const fb = ctx.createGain()
  fb.gain.value = 0.33
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2400
  echo.connect(tone).connect(fb).connect(echo)
  const wet = ctx.createGain()
  wet.gain.value = 0.35
  tone.connect(wet).connect(musicBus)
  return ctx
}

/** Browsers start audio suspended until a click or key press. */
export function unlockAudio() {
  const c = audio()
  if (c && c.state === 'suspended') c.resume()
}

export function setMuted(m) {
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    /* storage unavailable: mute just won't persist */
  }
  if (!audio()) return
  master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05)
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

function blipAt(t, freq, { dur = 0.05, type = 'square', vol = 0.12, bus = sfxBus, slide = 0, out = null } = {}) {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(bus)
  if (out) g.connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}

// ---------------------------------------------------------------- dialogue

/** Voice per speaker: base pitch (MIDI) and wave. */
const VOICES = {
  Gyroid: { base: 79, type: 'square', spread: 3 },
  'Emmy Boundary': { base: 72, type: 'triangle', spread: 2 },
  'Count Null': { base: 52, type: 'sawtooth', spread: 1 },
  Narrator: { base: 67, type: 'triangle', spread: 1 },
}

/** The little chime when a dialogue box pops up. */
export function dialogOpen() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime + 0.01
  blipAt(t, hz(76), { dur: 0.07, type: 'square', vol: 0.09 })
  blipAt(t + 0.06, hz(83), { dur: 0.12, type: 'square', vol: 0.08 })
}

/** One text blip — call every couple of characters as the line types out. */
export function textBlip(speaker) {
  if (!audio() || ctx.state !== 'running') return
  const v = VOICES[speaker] || VOICES.Narrator
  const step = [0, 2, 4, 7][Math.floor(Math.random() * 4)] % (v.spread * 2 + 1)
  blipAt(ctx.currentTime, hz(v.base + step), { dur: 0.035, type: v.type, vol: v.type === 'sawtooth' ? 0.05 : 0.07 })
}

export function sfxCorrect() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime + 0.01
  ;[72, 76, 79, 84].forEach((m, i) => blipAt(t + i * 0.06, hz(m), { dur: 0.12, type: 'square', vol: 0.08 }))
}

export function sfxWrong() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime + 0.01
  blipAt(t, hz(52), { dur: 0.18, type: 'sawtooth', vol: 0.07, slide: 0.8 })
}

/** Dip the music under dialogue. */
export function duckMusic(on) {
  if (!audio()) return
  musicBus.gain.setTargetAtTime(on ? 0.2 : 0.38, ctx.currentTime, 0.15)
}

// ---------------------------------------------------------------- the Retract Reef theme

/*
 * 92 bpm, 16th-note grid, two 8-bar phrases (A, A′) in D dorian:
 *   Dm9 – G13 – Fmaj7 – C/E  |  B♭maj7 – C6 – Dm9 – A7sus4
 * Pad (triangle pair), pulse arpeggio through the echo, triangle bass, a sine lead
 * that enters in the second phrase, and soft noise hats.
 */
const BPM = 92
const STEP = 60 / BPM / 4
const CHORDS = [
  // [bass root, chord tones] per bar
  [38, [50, 53, 57, 60, 64]],
  [43, [50, 53, 55, 59, 64]],
  [41, [48, 52, 53, 57, 60]],
  [40, [48, 52, 55, 60, 64]],
  [46, [50, 53, 57, 58, 62]],
  [48, [52, 55, 57, 60, 64]],
  [38, [50, 53, 57, 60, 64]],
  [45, [52, 55, 57, 62, 64]],
]
const ARP = [0, 2, 4, 3, 1, 3, 4, 2] // index into chord tones, per 8th note
const LEAD = [
  // [bar, 16th, midi, length in 16ths] — second phrase only
  [0, 0, 74, 6], [0, 6, 76, 2], [0, 8, 77, 8],
  [1, 0, 76, 4], [1, 4, 74, 4], [1, 8, 71, 8],
  [2, 0, 72, 6], [2, 6, 74, 2], [2, 8, 76, 6], [2, 14, 77, 2],
  [3, 0, 76, 12],
  [4, 0, 77, 6], [4, 6, 76, 2], [4, 8, 74, 8],
  [5, 0, 72, 4], [5, 4, 74, 4], [5, 8, 76, 8],
  [6, 0, 77, 4], [6, 4, 81, 4], [6, 8, 79, 4], [6, 12, 77, 4],
  [7, 0, 76, 16],
]

let music = null

function noiseBuffer() {
  const b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

function padAt(t, notes, dur) {
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 1100
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.045, t + 0.6)
  g.gain.setValueAtTime(0.045, t + dur - 0.4)
  g.gain.linearRampToValueAtTime(0, t + dur + 0.3)
  f.connect(g).connect(musicBus)
  for (const n of notes) {
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = hz(n)
      o.detune.value = det
      o.connect(f)
      o.start(t)
      o.stop(t + dur + 0.4)
    }
  }
}

function leadAt(t, midi, dur) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = hz(midi)
  const vib = ctx.createOscillator()
  vib.frequency.value = 5.5
  const vd = ctx.createGain()
  vd.gain.setValueAtTime(0, t)
  vd.gain.linearRampToValueAtTime(dur > 0.4 ? 7 : 0, t + Math.min(dur, 0.4))
  vib.connect(vd).connect(o.detune)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.07, t + 0.03)
  g.gain.setValueAtTime(0.07, t + dur * 0.8)
  g.gain.linearRampToValueAtTime(0, t + dur)
  o.connect(g).connect(musicBus)
  g.connect(echo)
  o.start(t)
  vib.start(t)
  o.stop(t + dur + 0.05)
  vib.stop(t + dur + 0.05)
}

function hatAt(t, buf, vol) {
  const s = ctx.createBufferSource()
  s.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = 7000
  const g = ctx.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  s.connect(f).connect(g).connect(musicBus)
  s.start(t, Math.random() * 0.3)
  s.stop(t + 0.06)
}

/** Schedule one 16th-note step of the loop. */
function scheduleStep(step, t, buf) {
  const total = CHORDS.length * 16
  const phrase = Math.floor(step / total) % 2
  const s = step % total
  const bar = Math.floor(s / 16)
  const sixteenth = s % 16
  const [root, tones] = CHORDS[bar]
  if (sixteenth === 0) padAt(t, tones.slice(0, 4), STEP * 16)
  if (sixteenth % 4 === 0) blipAt(t, hz(root + (sixteenth === 8 ? 7 : 0) - 12 + 12), { dur: STEP * 3.2, type: 'triangle', vol: 0.11, bus: musicBus })
  if (sixteenth % 2 === 0) {
    const n = tones[ARP[(sixteenth / 2) % ARP.length]] + 12
    blipAt(t, hz(n), { dur: STEP * 1.6, type: 'square', vol: 0.025, bus: musicBus, out: echo })
  }
  if (sixteenth % 4 === 2) hatAt(t, buf, 0.03)
  if (phrase === 1) {
    for (const [lb, ls, midi, len] of LEAD) if (lb === bar && ls === sixteenth) leadAt(t, midi, STEP * len)
  }
}

/** Run a looping 16th-note scheduler; only one theme plays at a time. */
function startLoop(schedule, stepSec) {
  if (!audio() || music) return
  const buf = noiseBuffer()
  let step = 0
  let next = ctx.currentTime + 0.1
  const tick = () => {
    if (ctx.state !== 'running') {
      next = ctx.currentTime + 0.1
      return
    }
    while (next < ctx.currentTime + 0.25) {
      schedule(step, next, buf)
      step++
      next += stepSec
    }
  }
  music = { id: setInterval(tick, 40) }
  tick()
}

/** Start the Retract Reef theme (looping) — safe to call more than once. */
export function startReefMusic() {
  startLoop(scheduleStep, STEP)
}

/** Stop whichever level theme is playing. */
export function stopReefMusic() {
  if (!music) return
  clearInterval(music.id)
  music = null
  if (ctx) {
    musicBus.gain.cancelScheduledValues(ctx.currentTime)
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime)
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    setTimeout(() => musicBus && musicBus.gain.setValueAtTime(0.38, ctx.currentTime), 400)
  }
}
export const stopMusic = stopReefMusic

// ---------------------------------------------------------------- the Tidewarp Flats theme

/*
 * The reef theme's slower cousin: 80 bpm in A minor, 8 bars
 *   Am9 – Fmaj7 – G6 – Em7  |  Dm9 – Fmaj7/C – Gsus4 – E7sus4
 * Pads swell in and out like the tide (two-bar swells) over a wash of surf, a
 * sparse plucked arpeggio through the echo, a low triangle bass on beats 1 and 3,
 * and a slow sine lead in the second phrase. While the Tide Glass is out, a
 * clock-like tick plays on the beat.
 */
const TIDE_STEP = 60 / 80 / 4
const TIDE_CHORDS = [
  [45, [57, 60, 64, 67, 71]],
  [41, [57, 60, 64, 65, 69]],
  [43, [55, 59, 62, 64, 67]],
  [40, [55, 59, 62, 64, 67]],
  [38, [53, 57, 60, 62, 64]],
  [36, [53, 57, 60, 64, 67]],
  [43, [55, 60, 62, 67, 69]],
  [40, [56, 59, 62, 64, 69]],
]
const TIDE_ARP = [0, 2, 4, 2, 3, 1]
const TIDE_LEAD = [
  [0, 0, 76, 8], [0, 8, 72, 8],
  [1, 0, 74, 12], [1, 12, 72, 4],
  [2, 0, 71, 8], [2, 8, 74, 8],
  [3, 0, 71, 16],
  [4, 0, 72, 8], [4, 8, 76, 8],
  [5, 0, 77, 8], [5, 8, 76, 4], [5, 12, 72, 4],
  [6, 0, 74, 16],
  [7, 0, 76, 16],
]
let glassTick = false
/** The Tide Glass's clock tick over the music (on while the glass is in hand). */
export function setGlassTick(on) {
  glassTick = !!on
}

function swellAt(t, notes, dur) {
  // a pad that breathes: slow rise, slow fall — the tide coming in and going out
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(500, t)
  f.frequency.linearRampToValueAtTime(1500, t + dur * 0.5)
  f.frequency.linearRampToValueAtTime(600, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.004, t)
  g.gain.linearRampToValueAtTime(0.06, t + dur * 0.5)
  g.gain.linearRampToValueAtTime(0.004, t + dur + 0.2)
  f.connect(g).connect(musicBus)
  for (const n of notes) {
    for (const det of [-8, 8]) {
      const o = ctx.createOscillator()
      o.type = 'triangle'
      o.frequency.value = hz(n)
      o.detune.value = det
      o.connect(f)
      o.start(t)
      o.stop(t + dur + 0.3)
    }
  }
}

function surfAt(t, buf, dur) {
  // a soft wash of filtered noise: waves over the flats
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 700
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.035, t + dur * 0.4)
  g.gain.linearRampToValueAtTime(0, t + dur)
  src.connect(f).connect(g).connect(musicBus)
  src.start(t)
  src.stop(t + dur + 0.05)
}

function scheduleTide(step, t, buf) {
  const total = TIDE_CHORDS.length * 16
  const phrase = Math.floor(step / total) % 2
  const s = step % total
  const bar = Math.floor(s / 16)
  const k = s % 16
  const [root, tones] = TIDE_CHORDS[bar]
  if (k === 0 && bar % 2 === 0) {
    swellAt(t, tones.slice(0, 4), TIDE_STEP * 32)
    surfAt(t, buf, TIDE_STEP * 32)
  }
  if (k === 0 && bar % 2 === 1) swellAt(t, tones.slice(1, 5), TIDE_STEP * 16)
  if (k === 0 || k === 8) blipAt(t, hz(root - 12 + (k === 8 ? 7 : 0)), { dur: TIDE_STEP * 6, type: 'triangle', vol: 0.12, bus: musicBus })
  if (k % 3 === 0 && k < 15) {
    const n = tones[TIDE_ARP[(k / 3 + bar) % TIDE_ARP.length]] + 12
    blipAt(t, hz(n), { dur: TIDE_STEP * 2.4, type: 'triangle', vol: 0.05, bus: musicBus, out: echo })
  }
  if (glassTick && k % 4 === 0) blipAt(t, hz(k === 0 ? 96 : 91), { dur: 0.03, type: 'square', vol: 0.03, bus: musicBus })
  if (phrase === 1) {
    for (const [lb, ls, midi, len] of TIDE_LEAD) if (lb === bar && ls === k) leadAt(t, midi, TIDE_STEP * len)
  }
}

/** Start the Tidewarp Flats theme (looping). */
export function startTideMusic() {
  startLoop(scheduleTide, TIDE_STEP)
}

// ---------------------------------------------------------------- the Mirror Shoals theme

/*
 * 72 bpm in E lydian, glassy and still. Every two-bar motif is answered by its mirror
 * image — the same intervals turned upside down around the motif's first note — the
 * way the reefs answer each other across the channel. Celesta bells (sine + bright
 * partials, through the echo), a slow breathing pad, a soft low bass, and a faint
 * shimmer on the offbeats. 8 bars:
 *   Emaj7 – F♯/E – C♯m9 – Amaj7♯11 | Emaj7 – B6 – Amaj7 – B(sus4)
 */
const MIRROR_STEP = 60 / 72 / 4
const MIRROR_CHORDS = [
  [40, [56, 59, 63, 64]],
  [40, [54, 58, 61, 66]],
  [37, [56, 59, 61, 63]],
  [33, [56, 57, 61, 63]],
  [40, [56, 59, 63, 64]],
  [35, [54, 56, 59, 63]],
  [33, [56, 57, 61, 64]],
  [35, [54, 59, 61, 64]],
]
// motifs as [16th, semitones from the anchor note, length in 16ths]; odd bars play the mirror
const MIRROR_MOTIFS = [
  { anchor: 76, notes: [[0, 0, 3], [3, 4, 3], [6, 7, 2], [8, 11, 6], [14, 9, 2]] },
  { anchor: 78, notes: [[0, 0, 4], [4, 2, 2], [6, 6, 4], [10, 4, 6]] },
  { anchor: 76, notes: [[0, 0, 2], [2, 3, 2], [4, 7, 4], [8, 6, 4], [12, 2, 4]] },
  { anchor: 75, notes: [[0, 0, 6], [6, 4, 2], [8, 9, 8]] },
]

function celestaAt(t, midi, dur, vol = 0.07) {
  for (const [ratio, v, decay] of [[1, vol, 1.2], [2, vol * 0.4, 0.6], [4.01, vol * 0.15, 0.25]]) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(midi) * ratio
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.3, dur) * decay + 0.4)
    o.connect(g).connect(musicBus)
    g.connect(echo)
    o.start(t)
    o.stop(t + Math.max(0.3, dur) * decay + 0.5)
  }
}

function scheduleMirror(step, t, buf) {
  const total = MIRROR_CHORDS.length * 16
  const phrase = Math.floor(step / total) % 2
  const s = step % total
  const bar = Math.floor(s / 16)
  const k = s % 16
  const [root, tones] = MIRROR_CHORDS[bar]
  if (k === 0) padAt(t, tones, MIRROR_STEP * 16)
  if (k === 0 || k === 10) blipAt(t, hz(root - 12 + (k === 10 ? 7 : 0)), { dur: MIRROR_STEP * 8, type: 'triangle', vol: 0.09, bus: musicBus })
  if (k % 4 === 2) hatAt(t, buf, 0.012)
  // the motif on even bars, its mirror image (inverted around the anchor) on odd bars
  const m = MIRROR_MOTIFS[Math.floor(bar / 2) % MIRROR_MOTIFS.length]
  const mirrored = bar % 2 === 1
  for (const [at, iv, len] of m.notes) {
    if (at !== k) continue
    const midi = m.anchor + (mirrored ? -iv : iv) + (phrase === 1 ? 12 : 0)
    celestaAt(t, midi, MIRROR_STEP * len, phrase === 1 ? 0.05 : 0.07)
  }
}

/** Start the Mirror Shoals theme (looping). */
export function startMirrorMusic() {
  startLoop(scheduleMirror, MIRROR_STEP)
}

// ---------------------------------------------------------------- Count Null's theme (boss music)

/*
 * 132 bpm in C phrygian, built on the tritone. 8 bars, two phrases:
 *   Cm – D♭ – Cm – G♭(♭5) | A♭ – D♭ – Cm – G7♭9
 * Driving sawtooth bass in 8ths (octave jumps), staccato organ stabs, a low
 * menacing lead (C E♭ F♯ G … the tritone is Null's interval), a church-bell toll at
 * the top of each phrase, kick / snare / hats. The second phrase doubles the lead an
 * octave up through the echo.
 */
const NULL_STEP = 60 / 132 / 4
const NULL_CHORDS = [
  [36, [48, 51, 55]],
  [37, [49, 53, 56]],
  [36, [48, 51, 55]],
  [42, [48, 54, 57]],
  [44, [48, 51, 56]],
  [37, [49, 53, 56]],
  [36, [48, 51, 55]],
  [43, [47, 50, 53, 56]],
]
const NULL_LEAD = [
  // [bar, 16th, midi, length in 16ths]
  [0, 0, 60, 4], [0, 4, 63, 4], [0, 8, 66, 6], [0, 14, 67, 2],
  [1, 0, 65, 4], [1, 4, 63, 4], [1, 8, 61, 8],
  [2, 0, 60, 4], [2, 4, 63, 2], [2, 6, 66, 2], [2, 8, 67, 4], [2, 12, 66, 4],
  [3, 0, 66, 12], [3, 12, 63, 4],
  [4, 0, 68, 4], [4, 4, 67, 4], [4, 8, 63, 8],
  [5, 0, 65, 4], [5, 4, 61, 4], [5, 8, 60, 8],
  [6, 0, 63, 2], [6, 2, 66, 2], [6, 4, 67, 4], [6, 8, 72, 8],
  [7, 0, 71, 6], [7, 6, 68, 2], [7, 8, 67, 8],
]

function organAt(t, notes, dur) {
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 1800
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.05, t + 0.01)
  g.gain.setValueAtTime(0.05, t + dur * 0.7)
  g.gain.linearRampToValueAtTime(0, t + dur)
  f.connect(g).connect(musicBus)
  for (const n of notes) {
    for (const [mult, type] of [[1, 'square'], [2, 'sawtooth']]) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = hz(n) * mult
      o.connect(f)
      o.start(t)
      o.stop(t + dur + 0.02)
    }
  }
}

function sawBassAt(t, midi, dur) {
  const o = ctx.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = hz(midi)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.Q.value = 6
  f.frequency.setValueAtTime(1400, t)
  f.frequency.exponentialRampToValueAtTime(220, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.13, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(f).connect(g).connect(musicBus)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function kickAt(t) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(140, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.4, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
  o.connect(g).connect(musicBus)
  o.start(t)
  o.stop(t + 0.25)
}

function snareAt(t, buf) {
  const src = ctx.createBufferSource()
  src.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 1900
  f.Q.value = 0.8
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.16, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
  src.connect(f).connect(g).connect(musicBus)
  src.start(t, Math.random() * 0.3)
  src.stop(t + 0.18)
  blipAt(t, 190, { dur: 0.08, type: 'triangle', vol: 0.08, bus: musicBus, slide: 0.6 })
}

function bellAt(t, midi) {
  // inharmonic partials: a heavy, slightly sour church bell
  for (const [ratio, vol] of [[1, 0.09], [2.41, 0.045], [2.98, 0.03], [4.2, 0.02]]) {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(midi) * ratio
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6)
    o.connect(g).connect(musicBus)
    g.connect(echo)
    o.start(t)
    o.stop(t + 2.7)
  }
}

function nullLeadAt(t, midi, dur, high) {
  const o = ctx.createOscillator()
  o.type = 'sawtooth'
  o.frequency.value = hz(midi)
  const vib = ctx.createOscillator()
  vib.frequency.value = 6.2
  const vd = ctx.createGain()
  vd.gain.setValueAtTime(0, t)
  vd.gain.linearRampToValueAtTime(dur > 0.3 ? 12 : 0, t + Math.min(dur, 0.3))
  vib.connect(vd).connect(o.detune)
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = high ? 2600 : 1500
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(high ? 0.04 : 0.06, t + 0.02)
  g.gain.setValueAtTime(high ? 0.04 : 0.06, t + dur * 0.85)
  g.gain.linearRampToValueAtTime(0, t + dur)
  o.connect(f).connect(g).connect(musicBus)
  if (high) g.connect(echo)
  o.start(t)
  vib.start(t)
  o.stop(t + dur + 0.05)
  vib.stop(t + dur + 0.05)
}

function scheduleNull(step, t, buf) {
  const total = NULL_CHORDS.length * 16
  const phrase = Math.floor(step / total) % 2
  const s = step % total
  const bar = Math.floor(s / 16)
  const k = s % 16
  const [root, tones] = NULL_CHORDS[bar]
  if (s === 0) bellAt(t, 36)
  if (k % 2 === 0) sawBassAt(t, root + (k % 4 === 2 ? 12 : 0), NULL_STEP * 1.8)
  if (k === 0 || k === 6 || k === 10) organAt(t, tones, NULL_STEP * (k === 0 ? 3 : 1.5))
  if (k === 0 || k === 8 || (k === 14 && bar % 2 === 1)) kickAt(t)
  if (k === 4 || k === 12) snareAt(t, buf)
  if (k % 2 === 1) hatAt(t, buf, 0.025)
  for (const [lb, ls, midi, len] of NULL_LEAD) {
    if (lb !== bar || ls !== k) continue
    nullLeadAt(t, midi, NULL_STEP * len, false)
    if (phrase === 1) nullLeadAt(t, midi + 12, NULL_STEP * len, true)
  }
}

/** Count Null's boss theme (looping). */
export function startNullMusic() {
  startLoop(scheduleNull, NULL_STEP)
}

/** Cut straight from one theme to another (no fade-out gap). */
export function switchMusic(start) {
  if (music) {
    clearInterval(music.id)
    music = null
  }
  start()
}

// ---------------------------------------------------------------- the Fundamental Lash

let noise = null
function noiseSource(t, dur) {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource()
  s.buffer = noise
  s.start(t, Math.random() * 0.5)
  s.stop(t + dur + 0.02)
  return s
}

/** The swing: a short rising whoosh of filtered air. */
export function sfxWhoosh() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 1.4
  f.frequency.setValueAtTime(500, t)
  f.frequency.exponentialRampToValueAtTime(3200, t + 0.16)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.32, t + 0.07)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  noiseSource(t, 0.2).connect(f).connect(g).connect(sfxBus)
}

/** The crack as the lash snaps: a bright click with a tiny pitched snap. */
export function sfxCrack() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  const f = ctx.createBiquadFilter()
  f.type = 'highpass'
  f.frequency.value = 2500
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.55, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
  noiseSource(t, 0.06).connect(f).connect(g).connect(sfxBus)
  blipAt(t, 1900, { dur: 0.05, type: 'square', vol: 0.06, slide: 0.45 })
}

/** The lash lands on a spawn. */
export function sfxHit() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, 220, { dur: 0.12, type: 'square', vol: 0.12, slide: 0.5 })
  blipAt(t, 110, { dur: 0.14, type: 'triangle', vol: 0.18, slide: 0.6 })
}

/** A spawn collapses to a point: a falling chirp into nothing. */
export function sfxPop() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime + 0.04
  blipAt(t, 880, { dur: 0.22, type: 'square', vol: 0.07, slide: 0.12 })
  blipAt(t + 0.18, 1760, { dur: 0.06, type: 'triangle', vol: 0.06 })
}

/** Gyroid takes a hit. */
export function sfxHurt() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, 330, { dur: 0.18, type: 'sawtooth', vol: 0.08, slide: 0.55 })
}

// ---------------------------------------------------------------- Tidewarp Flats

/** A Snapper clips a ribbon: two claw clicks and a short tear. */
export function sfxSnip() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, 2400, { dur: 0.03, type: 'square', vol: 0.06 })
  blipAt(t + 0.07, 2600, { dur: 0.03, type: 'square', vol: 0.06 })
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 1800
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.25, t + 0.1)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  noiseSource(t + 0.1, 0.2).connect(f).connect(g).connect(sfxBus)
}

/** Grabbing the ribbon with the Spool. */
export function sfxGrab() {
  if (!audio() || ctx.state !== 'running') return
  blipAt(ctx.currentTime, hz(69), { dur: 0.08, type: 'triangle', vol: 0.12, slide: 1.5 })
}

/** Letting go (no stake). */
export function sfxRelease() {
  if (!audio() || ctx.state !== 'running') return
  blipAt(ctx.currentTime, hz(76), { dur: 0.08, type: 'triangle', vol: 0.1, slide: 0.66 })
}

/** The ribbon hooks onto a stake: a wooden thunk and a bell. */
export function sfxHook() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, 140, { dur: 0.1, type: 'triangle', vol: 0.2, slide: 0.6 })
  blipAt(t + 0.03, hz(84), { dur: 0.35, type: 'sine', vol: 0.08 })
}

/** A cut is re-tied. */
export function sfxTie() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, hz(72), { dur: 0.08, type: 'square', vol: 0.06 })
  blipAt(t + 0.08, hz(79), { dur: 0.14, type: 'square', vol: 0.06 })
}

/** A marker stone lights. */
export function sfxMarker() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  ;[79, 86].forEach((m, i) => blipAt(t + i * 0.09, hz(m), { dur: 0.4, type: 'sine', vol: 0.09, out: echo }))
}

/** Marking the frame where Null's 'deformation' tears. */
export function sfxTear() {
  if (!audio() || ctx.state !== 'running') return
  const t = ctx.currentTime
  blipAt(t, 180, { dur: 0.35, type: 'sawtooth', vol: 0.07, slide: 2.2 })
  blipAt(t + 0.05, 90, { dur: 0.3, type: 'square', vol: 0.05, slide: 0.5 })
}
