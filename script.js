/**
 * Quantum Studio v3.0 Ultra
 * Cybernetic Audio-Visual Synthesizer, 8-Step Sequencer & Spatial Particle Simulator
 */

// ==========================================================================
// 1. Canvas Particle Engine & State
// ==========================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let burstParticles = [];
let matrixDrops = [];
let currentEngineMode = 'constellation'; // 'constellation' | 'matrix' | 'vortex' | 'singularity'
let currentTheme = 'neon';
let isMouseDown = false;

const themeColors = {
  neon: { p1: '#00f0ff', p2: '#ff007f', glow: 'rgba(0, 240, 255, 0.45)' },
  violet: { p1: '#a855f7', p2: '#3b82f6', glow: 'rgba(168, 85, 247, 0.5)' },
  solar: { p1: '#ff7e5f', p2: '#feb47b', glow: 'rgba(255, 126, 95, 0.5)' },
  matrix: { p1: '#00ff88', p2: '#00b4d8', glow: 'rgba(0, 255, 136, 0.5)' },
  gold: { p1: '#ffd700', p2: '#ff6b35', glow: 'rgba(255, 215, 0, 0.5)' },
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initEngine();
}
window.addEventListener('resize', resize);

const mouse = { x: null, y: null, radius: 180 };

class Particle {
  constructor(mode = 'constellation') {
    this.reset(mode);
  }

  reset(mode = 'constellation') {
    if (mode === 'vortex' || mode === 'singularity') {
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * Math.max(width, height) * 0.55 + 20;
      this.speed = (Math.random() * 2 + 1) * 0.02;
      this.size = Math.random() * 2.2 + 1;
      this.color = Math.random() > 0.4 ? themeColors[currentTheme].p1 : themeColors[currentTheme].p2;
    } else {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.3;
      this.vy = (Math.random() - 0.5) * 1.3;
      this.size = Math.random() * 2.5 + 1;
      this.color = Math.random() > 0.4 ? themeColors[currentTheme].p1 : themeColors[currentTheme].p2;
    }
  }

  update() {
    if (currentEngineMode === 'vortex') {
      this.angle += this.speed;
      this.radius -= 0.7;
      if (this.radius <= 5) {
        this.radius = Math.max(width, height) * 0.55;
      }
      const cx = width / 2;
      const cy = height / 2;
      this.x = cx + Math.cos(this.angle) * this.radius;
      this.y = cy + Math.sin(this.angle) * this.radius;
    } else if (currentEngineMode === 'singularity') {
      const targetX = mouse.x ?? width / 2;
      const targetY = mouse.y ?? height / 2;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);
      
      this.angle = (this.angle || Math.random() * Math.PI * 2) + 0.04;
      if (dist < 10) {
        this.x = targetX + Math.cos(this.angle) * (Math.random() * 300 + 50);
        this.y = targetY + Math.sin(this.angle) * (Math.random() * 300 + 50);
      } else {
        const force = Math.min(250 / (dist + 50), 4);
        this.vx = (this.vx || 0) * 0.95 + (dx / dist) * force;
        this.vy = (this.vy || 0) * 0.95 + (dy / dist) * force;
        this.x += this.vx;
        this.y += this.vy;
      }
    } else {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Cursor gravity interaction (repulsion vs attraction on mousedown)
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const direction = isMouseDown ? -1 : 1;
          this.x += (dx / dist) * force * 5.5 * direction;
          this.y += (dy / dist) * force * 5.5 * direction;
        }
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class BurstParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.size = Math.random() * 3.5 + 1.5;
    this.color = Math.random() > 0.5 ? themeColors[currentTheme].p1 : themeColors[currentTheme].p2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function initEngine() {
  particles = [];
  burstParticles = [];
  const count = Math.min(Math.floor((width * height) / 11000), 160);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(currentEngineMode));
  }

  matrixDrops = [];
  const columns = Math.floor(width / 24);
  for (let i = 0; i < columns; i++) {
    matrixDrops[i] = Math.random() * -100;
  }

  const hudParticles = document.getElementById('hud-particles');
  if (hudParticles) hudParticles.textContent = count;
}

const matrixChars = '010101010101XYZΩΨ∆§#%*<>~⚡✦';

function drawMatrixStream() {
  ctx.fillStyle = 'rgba(7, 9, 19, 0.16)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = themeColors[currentTheme].p1;
  ctx.font = '14px "JetBrains Mono", monospace';

  for (let i = 0; i < matrixDrops.length; i++) {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * 24;
    const y = matrixDrops[i] * 20;

    ctx.fillText(char, x, y);

    if (y > height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  }
}

// ==========================================================================
// 2. Web Audio Synthesizer & 8-Step Sequencer
// ==========================================================================
let audioEnabled = true;
let audioCtx = null;
let masterGain = null;
let analyserNode = null;
let analyserData = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4;

    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 64;
    analyserData = new Uint8Array(analyserNode.frequencyBinCount);

    masterGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

const audioMiniBars = document.getElementById('audio-mini-bars');
const hudAudioEnergy = document.getElementById('hud-audio-energy');

function triggerSynthesizerChord() {
  if (!audioEnabled) return;
  try {
    initAudioContext();
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = audioCtx.currentTime;

    if (audioMiniBars) {
      audioMiniBars.classList.add('active');
      setTimeout(() => audioMiniBars.classList.remove('active'), 1200);
    }

    chords.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12 / (index + 1), now + index * 0.035 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.035 + 1.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + index * 0.035);
      osc.stop(now + index * 0.035 + 1.2);
    });
  } catch {
    // Audio activation fallback
  }
}

// 8-Step Sequencer Engine
let isSeqPlaying = false;
let currentStepIndex = 0;
let seqIntervalId = null;
let bpm = 128;

function playSequencerNote(freq, type = 'sine', duration = 0.2) {
  if (!audioEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch {
    // Ignore audio error
  }
}

function runSequencerStep() {
  document.querySelectorAll('.seq-step').forEach(btn => btn.classList.remove('playing'));

  ['lead', 'pad', 'bass'].forEach(track => {
    const trackEl = document.getElementById(`steps-${track}`);
    if (!trackEl) return;
    const stepBtn = trackEl.querySelector(`.seq-step[data-step="${currentStepIndex}"]`);
    if (stepBtn) {
      stepBtn.classList.add('playing');
      if (stepBtn.classList.contains('active')) {
        const noteFreq = parseFloat(stepBtn.dataset.note);
        const oscType = track === 'bass' ? 'sawtooth' : track === 'lead' ? 'triangle' : 'sine';
        playSequencerNote(noteFreq, oscType, track === 'pad' ? 0.35 : 0.15);
      }
    }
  });

  currentStepIndex = (currentStepIndex + 1) % 8;
}

function toggleSequencerPlayback() {
  initAudioContext();
  isSeqPlaying = !isSeqPlaying;
  const btnPlay = document.getElementById('btn-seq-play');
  if (isSeqPlaying) {
    if (btnPlay) btnPlay.innerHTML = '<span>Stop Pattern</span>';
    const intervalMs = (60 / bpm / 2) * 1000;
    seqIntervalId = setInterval(runSequencerStep, intervalMs);
  } else {
    if (btnPlay) btnPlay.innerHTML = '<svg class="seq-play-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Play Pattern</span>';
    clearInterval(seqIntervalId);
    document.querySelectorAll('.seq-step').forEach(btn => btn.classList.remove('playing'));
  }
}

// Draw live audio spectrum ribbon
function drawAudioSpectrum() {
  if (!analyserNode || !analyserData) return;
  analyserNode.getByteFrequencyData(analyserData);

  let sum = 0;
  for (let i = 0; i < analyserData.length; i++) {
    sum += analyserData[i];
  }
  const avgEnergy = Math.round((sum / (analyserData.length * 255)) * 100);
  if (hudAudioEnergy) hudAudioEnergy.textContent = `${avgEnergy}%`;

  if (avgEnergy > 2) {
    ctx.save();
    ctx.strokeStyle = themeColors[currentTheme].p1;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = themeColors[currentTheme].p1;
    ctx.beginPath();

    const sliceWidth = width / analyserData.length;
    let x = 0;

    for (let i = 0; i < analyserData.length; i++) {
      const v = analyserData[i] / 255.0;
      const y = height - (v * 70);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ==========================================================================
// 3. Animation Loop & Telemetry
// ==========================================================================
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;
const hudFps = document.getElementById('hud-fps');

function animate() {
  const now = performance.now();
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
    if (hudFps) hudFps.textContent = fps;
  }

  if (currentEngineMode === 'matrix') {
    drawMatrixStream();
  } else {
    ctx.clearRect(0, 0, width, height);

    if (currentEngineMode === 'constellation') {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.strokeStyle = themeColors[currentTheme].p1;
            ctx.globalAlpha = (1 - dist / 115) * 0.22;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  burstParticles = burstParticles.filter(bp => bp.life > 0);
  burstParticles.forEach(bp => {
    bp.update();
    bp.draw();
  });

  drawAudioSpectrum();

  requestAnimationFrame(animate);
}

resize();
animate();

// ==========================================================================
// 4. Cursor Spotlight, 3D Tilt & Magnetic Physics
// ==========================================================================
const cursorGlow = document.getElementById('cursor-glow');
const cardWrapper = document.getElementById('card-wrapper');
const card = document.getElementById('glass-card');

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (cursorGlow) {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }

  if (cardWrapper) {
    const { innerWidth: w, innerHeight: h } = window;
    const dx = (e.clientX - w / 2) / (w / 2);
    const dy = (e.clientY - h / 2) / (h / 2);
    cardWrapper.style.transform = `rotateX(${-dy * 14}deg) rotateY(${dx * 16}deg) scale(1.02)`;
  }
});

window.addEventListener('mousedown', () => {
  isMouseDown = true;
  if (cursorGlow) cursorGlow.classList.add('pulling');
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
  if (cursorGlow) cursorGlow.classList.remove('pulling');
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
  isMouseDown = false;
  if (cardWrapper) cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
});

// ==========================================================================
// 5. Supernova Burst & Kinetic Letters
// ==========================================================================
function spawnSupernova(x, y) {
  for (let i = 0; i < 65; i++) {
    burstParticles.push(new BurstParticle(x, y));
  }
  if (cardWrapper) {
    cardWrapper.style.transform = 'scale(0.95)';
    setTimeout(() => {
      cardWrapper.style.transform = 'scale(1.03)';
    }, 100);
  }
  triggerSynthesizerChord();
}

const btnBurst = document.getElementById('btn-burst');
if (btnBurst) {
  btnBurst.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = btnBurst.getBoundingClientRect();
    spawnSupernova(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
}

if (card) {
  card.addEventListener('click', (e) => {
    spawnSupernova(e.clientX, e.clientY);
  });
}

const letters = document.querySelectorAll('.letter');
letters.forEach(letter => {
  const rot = (Math.random() - 0.5) * 22;
  letter.style.setProperty('--rot', rot);
});

// ==========================================================================
// 6. Audio Toggle, Modes, Themes & Snapshot
// ==========================================================================
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioBtnText = document.getElementById('audio-btn-text');

if (btnAudioToggle) {
  btnAudioToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    audioEnabled = !audioEnabled;
    if (audioBtnText) audioBtnText.textContent = audioEnabled ? 'Audio Synth: ON' : 'Audio Synth: OFF';
    btnAudioToggle.style.opacity = audioEnabled ? '1' : '0.6';
    if (audioEnabled) triggerSynthesizerChord();
  });
}

const modeSegments = document.querySelectorAll('.segment');
modeSegments.forEach(seg => {
  seg.addEventListener('click', () => {
    modeSegments.forEach(s => s.classList.remove('active'));
    seg.classList.add('active');
    currentEngineMode = seg.dataset.mode;
    initEngine();
    triggerSynthesizerChord();
  });
});

const themeChips = document.querySelectorAll('.theme-chip');
themeChips.forEach(chip => {
  chip.addEventListener('click', () => {
    themeChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentTheme = chip.dataset.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    initEngine();
    triggerSynthesizerChord();
  });
});

// Sequencer Drawer Toggles & Step Selection
const seqDrawer = document.getElementById('sequencer-drawer');
const btnToggleSeq = document.getElementById('btn-toggle-sequencer');
const btnCloseSeq = document.getElementById('btn-seq-close');
const btnSeqPlay = document.getElementById('btn-seq-play');
const bpmSlider = document.getElementById('bpm-slider');
const bpmVal = document.getElementById('bpm-val');

if (btnToggleSeq) {
  btnToggleSeq.addEventListener('click', () => {
    seqDrawer.classList.toggle('open');
    if (seqDrawer.classList.contains('open')) initAudioContext();
  });
}

if (btnCloseSeq) {
  btnCloseSeq.addEventListener('click', () => {
    seqDrawer.classList.remove('open');
  });
}

if (btnSeqPlay) {
  btnSeqPlay.addEventListener('click', toggleSequencerPlayback);
}

if (bpmSlider) {
  bpmSlider.addEventListener('input', (e) => {
    bpm = parseInt(e.target.value, 10);
    if (bpmVal) bpmVal.textContent = bpm;
    if (isSeqPlaying) {
      clearInterval(seqIntervalId);
      const intervalMs = (60 / bpm / 2) * 1000;
      seqIntervalId = setInterval(runSequencerStep, intervalMs);
    }
  });
}

document.querySelectorAll('.seq-step').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
      initAudioContext();
      playSequencerNote(parseFloat(btn.dataset.note));
    }
  });
});

// Snapshot Wallpaper Exporter
const btnSnapshot = document.getElementById('btn-snapshot');
if (btnSnapshot) {
  btnSnapshot.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `quantum-studio-v3-${currentTheme}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    spawnSupernova(mouse.x ?? width / 2, mouse.y ?? height / 2);
  } else if (e.key === 's' || e.key === 'S') {
    if (seqDrawer) seqDrawer.classList.toggle('open');
  } else if (e.key === 'm' || e.key === 'M') {
    if (btnAudioToggle) btnAudioToggle.click();
  }
});

// ==========================================================================
// 7. Live Telemetry & Health Probe
// ==========================================================================
async function probeHealthStatus() {
  const hudStatus = document.getElementById('hud-status');
  try {
    const res = await fetch('/health');
    if (res.ok) {
      if (hudStatus) {
        hudStatus.textContent = 'ONLINE';
        hudStatus.className = 'telemetry-val status-up';
      }
    }
  } catch {
    if (hudStatus) {
      hudStatus.textContent = 'LOCAL';
      hudStatus.className = 'telemetry-val';
    }
  }
}
probeHealthStatus();
