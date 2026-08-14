# Master Implementation & Architecture Guide

> **Target Audience:** Any developer, DevOps engineer, or AI agent who has never seen this repository before and wants to reproduce, understand, or extend this exact architecture from scratch.

---

## 1. System Overview & Architecture

This repository contains an end-to-end modern cloud web application featuring:
1. **Interactive Frontend Engine**: HTML5 Canvas particle simulation (Quantum Net, Matrix Stream, Vortex Warp), Web Audio API polyphonic chord synthesizer, live telemetry HUD (FPS, particles, health status), and dynamic cyberpunk color auras.
2. **Dockerized Production Runtime**: Ultra-lightweight `nginx:alpine` container utilizing dynamic `${PORT}` substitution and a structured JSON `/health` telemetry endpoint.
3. **Infrastructure as Code (IaC)**: Declarative Render Blueprint (`render.yaml`) managing auto-deploy, zero-downtime rolling health checks, and service configurations.
4. **CI/CD Quality Gates**: 4-stage GitHub Actions pipeline enforcing linting (`ESLint 9`), automated testing (`node:test`), Docker Buildx compilation, and gated deployment.
5. **Continuous Health Monitoring**: Scheduled workflow probing `/health` every 15 minutes, with automated GitHub issue creation on failure.
6. **AI Agent Tooling & MCP**: Integration with Render Model Context Protocol (`render` MCP) for operational scoping and telemetry.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 GitHub Repository (main)                │
                  └───────────────┬─────────────────────────────────────────┘
                                  │ (Push / Pull Request)
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             GitHub Actions CI/CD Pipeline                                │
│                                                                                          │
│  ┌──────────────────────┐  ┌───────────────────────┐  ┌───────────────────────────────┐  │
│  │ 1. ESLint Gate (9.x) │  │ 2. Automated Unit/DOM │  │ 3. Docker Buildx Verification │  │
│  └──────────┬───────────┘  └───────────┬───────────┘  └───────────────┬───────────────┘  │
│             │                          │                              │                  │
│             └──────────────────────────┼──────────────────────────────┘                  │
│                                        ▼ (All Gates Pass & On main)                      │
│                            ┌───────────────────────┐                                     │
│                            │ 4. Deploy to Render   │                                     │
│                            └───────────┬───────────┘                                     │
└────────────────────────────────────────┼─────────────────────────────────────────────────┘
                                         │
                                         ▼ (Trigger Deploy Hook / Blueprint Sync)
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                Render Cloud Platform                                     │
│                                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Docker Web Service: interactive-hero-app (Free Plan)                             │   │
│   │                                                                                  │   │
│   │  ┌────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │ Nginx Alpine Container (0.0.0.0:${PORT})                                   │  │   │
│   │  │   ├── Static Assets (index.html, style.css, script.js)                     │  │   │
│   │  │   └── /health Endpoint (returns HTTP 200 JSON status)                      │  │   │
│   │  └────────────────────────────────────────────────────────────────────────────┘  │   │
│   └──────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────▲─────────────────────────────────────────────────┘
                                         │ (Every 15 Minutes Probe)
┌────────────────────────────────────────┴─────────────────────────────────────────────────┐
│                      Scheduled Uptime & Health Monitor Workflow                          │
│                                                                                          │
│  • Probes ${RENDER_APP_URL}/health                                                       │
│  • Success (200 OK) ────────► Records Latency & Closes Open Incidents                    │
│  • Failure (!= 200 / Timeout) ► Automatically opens GitHub Incident Issue               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Implementation from Scratch

### Phase 1: Application Structure & Modern Frontend

Create the core web application with semantic markup, dynamic design tokens, and modular JavaScript logic:

1. **`index.html`**:
   - Semantic HTML5 structure with Google Fonts (`Outfit`, `Space Grotesk`, `JetBrains Mono`).
   - `#bg-canvas` for hardware-accelerated animations and live audio spectrum rendering.
   - Dynamic Telemetry HUD (`#hud-fps`, `#hud-particles`, `#hud-audio-energy`, `#hud-status`).
   - 8-Step Interactive Cyber Sequencer HUD Drawer (`#sequencer-drawer`) with multi-track matrix and BPM tempo slider.
   - Snapshot Studio button (`#btn-snapshot`) for instant 1-click 4K wallpaper exports.
   - Holographic Glassmorphism stage card with 3D tilt, kinetic letters, and supernova burst triggers.
   - Floating Control Deck for particle modes and 5 dynamic theme color auras.

2. **`style.css`**:
   - Centralized CSS Custom Properties under `:root` and theme attributes (`[data-theme="violet"]`, `[data-theme="solar"]`, `[data-theme="matrix"]`, `[data-theme="gold"]`).
   - Backdrop-filter blurs (`backdrop-filter: blur(28px)`), luminous borders, and smooth cubic-bezier transitions.
   - Sequencer drawer grid styling, active step pulses, step tracker highlights, and range slider styles.
   - Mobile-responsive media queries adapting the stage and collapsing telemetry bars on smaller viewports.

3. **`script.js`**:
   - **Canvas Particle Engine**: Supports `constellation` (mesh network), `matrix` (falling characters), `vortex` (relativistic 3D spiral), and `singularity` (cursor gravitational field with relativistic orbital physics).
   - **Web Audio Synth & 8-Step Sequencer**: Generates polyphonic harmonic chords using `AudioContext`, an 8-step sequencer loop with BPM tempo control, and Fast Fourier Transform (FFT) frequency spectrum visualization via `AnalyserNode`.
   - **Live Telemetry Loop**: Measures instantaneous frame rate via `requestAnimationFrame`, live FFT audio energy %, and performs asynchronous `/health` status probes.
   - **Snapshot Exporter**: Canvas to PNG data URL pipeline with automatic download.

---

### Phase 2: Docker Containerization & Dynamic Port Binding

Cloud container platforms (including Render) assign dynamic port numbers via the `$PORT` environment variable. Standard Nginx defaults to port 80 and does not dynamically read environment variables without templating.

1. **`nginx.conf.template`**:
   Place Nginx configuration template using `${PORT}` variables:
   ```nginx
   server {
       listen ${PORT};
       server_name localhost;

       location / {
           root /usr/share/nginx/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       # Structured Health Check Endpoint
       location /health {
           access_log off;
           default_type application/json;
           return 200 '{"status":"UP","timestamp":"$time_iso8601","service":"interactive-hero-app"}\n';
       }

       error_page 500 502 503 504 /50x.html;
       location = /50x.html {
           root /usr/share/nginx/html;
       }
   }
   ```

2. **`Dockerfile`**:
   Utilize the official `nginx:alpine` image which natively executes `envsubst` on all files in `/etc/nginx/templates/*.template` prior to starting Nginx:
   ```dockerfile
   FROM nginx:alpine

   # Default fallback port if not supplied by host runtime
   ENV PORT=10000

   # Copy custom Nginx configuration template for dynamic envsubst
   COPY nginx.conf.template /etc/nginx/templates/default.conf.template

   # Copy application static assets into Nginx public root
   COPY . /usr/share/nginx/html

   # Expose application port
   EXPOSE ${PORT}

   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **`.dockerignore`**:
   Prevent local development artifacts from polluting the container image:
   ```text
   node_modules/
   .git/
   .github/
   tests/
   .agents/
   *.log
   ```

---

### Phase 3: Infrastructure as Code (IaC) with Render Blueprints

Render Blueprints allow infrastructure to be declared in code and tracked via Git.

Create **`render.yaml`** at the repository root:
```yaml
services:
  - type: web
    name: interactive-hero-app
    runtime: docker
    plan: free
    region: oregon
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: PORT
        value: 10000
```

**Key Parameters Explained**:
- `type: web`: Public HTTP web service with SSL termination.
- `runtime: docker`: Directs Render to build the root `Dockerfile`.
- `healthCheckPath: /health`: Render continuously probes `/health` during rolling deploys. A new deploy will only receive live traffic after returning `200 OK`, preventing downtime.
- `autoDeploy: true`: Automatically rebuilds upon new commits to the tracked branch.

---

### Phase 4: Testing & Code Quality Gates

1. **`package.json`**:
   ```json
   {
     "name": "interactive-hero-app",
     "version": "1.0.0",
     "type": "module",
     "scripts": {
       "test": "node --test tests/*.test.js",
       "lint": "eslint ."
     },
     "devDependencies": {
       "@eslint/js": "^9.20.0",
       "eslint": "^9.20.1",
       "globals": "^15.14.0"
     }
   }
   ```

2. **`eslint.config.mjs`** (ESLint 9 Flat Config):
   ```javascript
   import js from "@eslint/js";
   import globals from "globals";

   export default [
     js.configs.recommended,
     {
       languageOptions: {
         ecmaVersion: "latest",
         sourceType: "module",
         globals: {
           ...globals.browser,
           ...globals.node,
         },
       },
       rules: {
         "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
         "no-console": "off",
       },
     },
     {
       ignores: ["node_modules/", "dist/", "build/"],
     },
   ];
   ```

3. **`tests/app.test.js`**:
   Utilizes the built-in Node.js test runner (`node:test`) to perform automated assertions against:
   - DOM element and ID integrity in `index.html`.
   - CSS design tokens and theme variants in `style.css`.
   - JavaScript engine classes and health probe logic in `script.js`.
   - Nginx `${PORT}` substitution and `/health` route definition.
   - Render Blueprint `render.yaml` schema compliance.
   - Dockerfile base image and port instructions.

---

### Phase 5: GitHub Actions CI/CD Pipeline

Create **`.github/workflows/ci-cd.yml`**:
- Executes on every `pull_request` and `push` to `main`.
- Features 4 parallel and dependent jobs:
  1. `lint-and-format`: Runs ESLint 9.
  2. `automated-tests`: Runs `node:test` suite.
  3. `docker-build-check`: Uses `docker/setup-buildx-action` to build the Docker image without publishing.
  4. `deploy`: Depends on all three preceding jobs (`needs: [lint-and-format, automated-tests, docker-build-check]`). Executes only on `refs/heads/main` push events.

---

### Phase 6: Continuous Uptime Monitoring & Incident Alerting

Create **`.github/workflows/uptime-monitor.yml`**:
- Runs on a cron schedule (`*/15 * * * *` = every 15 minutes) and supports manual triggers (`workflow_dispatch`).
- Probes `${RENDER_APP_URL}/health` with a 10-second timeout.
- If status is `200 OK`: Logs response latency and automatically closes any existing open incident issues.
- If status is non-200 or connection fails: Uses `actions/github-script` to search for existing open incidents; if none exists, creates a new issue with label `['incident', 'uptime-alert']` detailing status code, latency, and response body.

---

## 3. How to Reproduce & Verify

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/CodeGrogu/TEST-Workflows.git
cd TEST-Workflows

# 2. Install dependencies
npm install

# 3. Run ESLint code quality gate
npm run lint

# 4. Run automated test suite
npm test
```

### Local Docker Testing
```bash
# Build the container locally
docker build -t interactive-hero-app .

# Run container on port 10000
docker run -p 10000:10000 -e PORT=10000 interactive-hero-app

# Probe health endpoint
curl http://localhost:10000/health
# Output: {"status":"UP","timestamp":"...","service":"interactive-hero-app"}
```

### Render Deployment Setup
1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect the GitHub repository `CodeGrogu/TEST-Workflows`.
4. Render detects `render.yaml` and deploys the Docker web service automatically.
5. In GitHub repository **Settings** > **Secrets and variables** > **Actions** > **Variables**, add:
   - `RENDER_APP_URL`: `https://interactive-hero-app.onrender.com`

---

## 4. Operational Checklist & Maintenance

| Check | Tool / Location | Success Criteria |
|---|---|---|
| **Code Quality** | `npm run lint` / GitHub Actions | 0 errors |
| **Unit & Smoke Tests** | `npm test` / GitHub Actions | All 6 tests passing |
| **Docker Build** | Buildx / GitHub Actions | Successful image compilation |
| **Rolling Deploy** | Render Blueprint (`render.yaml`) | `/health` returns 200 before routing traffic |
| **Uptime Probe** | `.github/workflows/uptime-monitor.yml` | 200 OK every 15m; automated issue on outage |
