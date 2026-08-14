// Interactive Canvas Particles & Constellation Background
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 85;
const connectionDistance = 140;

const mouse = {
  x: null,
  y: null,
  radius: 180,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.9;
    this.vy = (Math.random() - 0.5) * 0.9;
    this.size = Math.random() * 2.2 + 0.8;
    this.baseAlpha = Math.random() * 0.6 + 0.2;
    this.alpha = this.baseAlpha;
    this.color = Math.random() > 0.5 ? '#80d0c7' : '#c471ed';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Mouse gentle repulsion / pull
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 1.5;
        this.x -= (dx / dist) * force;
        this.y -= (dy / dist) * force;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// Explosive burst particles on click
class BurstParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = Math.random() * 3.5 + 1.5;
    this.alpha = 1;
    this.decay = Math.random() * 0.025 + 0.015;
    const colors = ['#00f2fe', '#4facfe', '#9b51e0', '#f72585', '#ffffff'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

let burstParticles = [];

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Connect particles with glowing lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        const lineAlpha = (1 - dist / connectionDistance) * 0.28;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(142, 197, 252, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Draw regular particles
  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Draw burst particles
  burstParticles = burstParticles.filter(bp => bp.alpha > 0);
  burstParticles.forEach(bp => {
    bp.update();
    bp.draw();
  });

  requestAnimationFrame(animate);
}
animate();

// Cursor tracking spotlight
const cursorGlow = document.getElementById('cursor-glow');

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// 3D Parallax Tilt Effect on Card
const cardWrapper = document.getElementById('card-wrapper');
const card = document.getElementById('glass-card');

window.addEventListener('mousemove', (e) => {
  const { innerWidth: w, innerHeight: h } = window;
  const cx = w / 2;
  const cy = h / 2;

  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  const tiltX = -dy * 16;
  const tiltY = dx * 18;

  cardWrapper.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
});

window.addEventListener('mouseleave', () => {
  cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
});

// Interactive Letter Animations
const letters = document.querySelectorAll('.letter');
letters.forEach(letter => {
  const randomRot = (Math.random() - 0.5) * 20;
  letter.style.setProperty('--rot', randomRot);
});

// Web Audio API Synth for subtle futuristic chime chord on interaction
let audioCtx = null;

function playFuturisticChime() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major 9 shimmer
    const now = audioCtx.currentTime;

    chordFrequencies.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12 / (index + 1), now + index * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.04 + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 1.3);
    });
  } catch {
    // Audio might be blocked until user gesture, safe to ignore
  }
}

// Burst particles & Sound on Click
card.addEventListener('click', (e) => {
  const clickX = e.clientX;
  const clickY = e.clientY;

  for (let i = 0; i < 40; i++) {
    burstParticles.push(new BurstParticle(clickX, clickY));
  }

  // Micro bounce
  cardWrapper.style.transform = 'scale(0.95)';
  setTimeout(() => {
    cardWrapper.style.transform = 'scale(1.04)';
  }, 120);

  playFuturisticChime();
});
