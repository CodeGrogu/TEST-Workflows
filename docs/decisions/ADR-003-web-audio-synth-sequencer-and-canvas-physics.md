# ADR-003: Web Audio API Polyphonic Synthesizer, 8-Step Sequencer & Spatial Physics Canvas Engine

## Status
Accepted

## Date
2026-08-15

## Context
Quantum Studio v3.0 requires rich, tactile, and responsive multimedia interactions—including real-time sound synthesis, dynamic step sequencing, live audio spectrum visualization, and high-performance physics simulations—while maintaining zero external runtime dependencies and ensuring zero impact on initial page load times.

Key requirements:
1. Zero-dependency client-side audio synthesis (no heavy third-party audio bundles like Tone.js or Howler.js).
2. Real-time audio spectrum visualization connected to canvas rendering.
3. Multi-mode physics simulation running at 60+ FPS on standard hardware.
4. Clean separation of concerns with instant fallback when Web Audio is disabled or unsupported.

## Decision
1. Implement the Web Audio API natively using `AudioContext`, `createOscillator()`, `createGain()`, and `AnalyserNode` connected to a master gain bus.
2. Build an 8-step polyphonic sequencer with configurable BPM timing loop and individual tracks (`lead`, `pad`, `bass`).
3. Leverage Fast Fourier Transform (FFT) frequency data (`getByteFrequencyData`) to render dynamic neon spectrum waveforms on the canvas and calculate live energy telemetry in the HUD.
4. Implement multi-mode particle simulations (Quantum Constellation, Matrix 3.0, Vortex Warp, and Singularity Gravity Well) with requestAnimationFrame physics loops.

## Alternatives Considered

### Heavy External Audio Libraries (e.g. Tone.js, Howler.js)
- **Pros**: Higher-level abstraction for musical structures.
- **Cons**: Adds ~100KB–200KB of third-party JavaScript bundle size, increases build complexity, and introduces external maintenance overhead.
- **Rejected**: Native Web Audio API provides all needed capabilities with zero byte payload and instantaneous execution.

### Pre-rendered Audio Sample Files (MP3 / WAV)
- **Pros**: Exact acoustic instrument reproduction.
- **Cons**: Requires additional network requests, susceptible to latency/decoding delays, inflexible pitch shifting, and lacks dynamic procedural reaction.
- **Rejected**: Procedural synthesis enables infinite variation, instant response, and negligible bandwidth.

## Consequences
- Zero external runtime JavaScript dependencies.
- Real-time audio responsiveness (<10ms latency).
- Smooth 60 FPS canvas animation with live FFT spectrum integration.
- Full offline compatibility and instant page load speeds.
