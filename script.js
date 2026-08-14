/**
 * Quantum Studio v2.0
 * Interactive Particle Engine, Web Audio Synthesizer & Telemetry HUD
 */

// ==========================================================================
// 1. Canvas Particle Engine & Modes
// ==========================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let burstParticles = [];
let matrixDrops = [];
let currentEngineMode = 'constellation'; // 'constellation' | 'matrix' | 'vortex'
let currentTheme = 'neon';

const themeColors = {
  neon: { p1: '#00f0ff', p2: '#ff007f', glow: 'rgba(0, 240, 255, 0.4)' },
  violet: { p1: '#a855f7', p2: '#3b82f6', glow: 'rgba(168, 85, 247, 0.4)' },
  solar: { p1: '#ff7e5f', p2: '#feb47b', glow: 'rgba(255, 126, 95, 0.4)' },
  matrix: { p1: '#00ff88', p2: '#00b4d8', glow: 'rgba(0, 255, 136, 0.4)' },
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initEngine();
}
window.addEventListener('resize', resize);

const mouse = { x: null, y: null, radius: 160 };

class Particle {
  constructor(isVortex = false) {
    this.reset(isVortex);
  }

  reset(isVortex = false) {
    if (isVortex) {
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * Math.max(width, height) * 0.6;
      this.speed = (Math.random() * 2 + 1) * 0.015;
      this.size = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? themeColors[currentTheme].p1 : themeColors[currentTheme].p2;
    } else {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.size = Math.random() * 2.5 + 1;
      this.color = Math.random() > 0.4 ? themeColors[currentTheme].p1 : themeColors[currentTheme].p2;
    }
  }

  update() {
    if (currentEngineMode === 'vortex') {
      this.angle += this.speed;
      this.radius -= 0.6;
      if (this.radius <= 5) {
        this.radius = Math.max(width, height) * 0.6;
      }
      const cx = width / 2;
      const cy = height / 2;
      this.x = cx + Math.cos(this.angle) * this.radius;
      this.y = cy + Math.sin(this.angle) * this.radius;
    } else {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      if (mouse.x != null && mouse.y != null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 5;
          this.y += (dy / dist) * force * 5;
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
    const speed = Math.random() * 7 + 3;
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
  const count = Math.min(Math.floor((width * height) / 12000), 140);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(currentEngineMode === 'vortex'));
  }

  // Matrix column drops
  matrixDrops = [];
  const columns = Math.floor(width / 24);
  for (let i = 0; i < columns; i++) {
    matrixDrops[i] = Math.random() * -100;
  }

  const hudParticles = document.getElementById('hud-particles');
  if (hudParticles) hudParticles.textContent = count;
}

const matrixChars = '010101010101XYZΩΨ∆§#%*<>~';

function drawMatrixStream() {
  ctx.fillStyle = 'rgba(7, 9, 19, 0.15)';
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

// Performance & FPS counter
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

    // Draw mesh connection lines if in constellation mode
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

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  // Update burst particles
  burstParticles = burstParticles.filter(bp => bp.life > 0);
  burstParticles.forEach(bp => {
    bp.update();
    bp.draw();
  });

  requestAnimationFrame(animate);
}

resize();
animate();

// ==========================================================================
// 2. Cursor Spotlight & 3D Tilt Stage
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

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
  if (cardWrapper) cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
});

// ==========================================================================
// 3. Web Audio Synthesizer Engine
// ==========================================================================
let audioEnabled = true;
let audioCtx = null;
const audioMiniBars = document.getElementById('audio-mini-bars');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioBtnText = document.getElementById('audio-btn-text');

function triggerSynthesizerChord() {
  if (!audioEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

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
      gain.connect(audioCtx.destination);

      osc.start(now + index * 0.035);
      osc.stop(now + index * 0.035 + 1.2);
    });
  } catch {
    // Graceful fallback if audio is not yet activated
  }
}

if (btnAudioToggle) {
  btnAudioToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    audioEnabled = !audioEnabled;
    if (audioBtnText) audioBtnText.textContent = audioEnabled ? 'Audio Synth: ON' : 'Audio Synth: OFF';
    btnAudioToggle.style.opacity = audioEnabled ? '1' : '0.6';
    if (audioEnabled) triggerSynthesizerChord();
  });
}

// ==========================================================================
// 4. Interactive Supernova Burst & Letters
// ==========================================================================
function spawnSupernova(x, y) {
  for (let i = 0; i < 55; i++) {
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

// Kinetic letter randomized tilt offsets
const letters = document.querySelectorAll('.letter');
letters.forEach(letter => {
  const rot = (Math.random() - 0.5) * 22;
  letter.style.setProperty('--rot', rot);
});

// ==========================================================================
// 5. Visual Mode Switcher & Theme Selector
// ==========================================================================
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

// ==========================================================================
// 6. Live Telemetry & Health Probe
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
    // If running in local file/offline mode
    if (hudStatus) {
      hudStatus.textContent = 'LOCAL';
      hudStatus.className = 'telemetry-val';
    }
  }
}
probeHealthStatus();
