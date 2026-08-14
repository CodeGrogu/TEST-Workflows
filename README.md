# Quantum Studio — Interactive Hero Web App

[![CI/CD Pipeline](https://github.com/CodeGrogu/TEST-Workflows/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/CodeGrogu/TEST-Workflows/actions/workflows/ci-cd.yml)
[![Uptime & Health Monitor](https://github.com/CodeGrogu/TEST-Workflows/actions/workflows/uptime-monitor.yml/badge.svg)](https://github.com/CodeGrogu/TEST-Workflows/actions/workflows/uptime-monitor.yml)

A modern, high-performance interactive web application deployed on [Render](https://render.com) using Docker containerization, declarative Infrastructure as Code (Render Blueprints), automated GitHub Actions CI/CD quality gates, and scheduled uptime health monitoring with automated incident alerting.

> 📖 **Looking for the complete architecture & step-by-step setup walkthrough?**  
> Read the [**Master Implementation Guide**](docs/IMPLEMENTATION_GUIDE.md) and [**Architecture Decision Records (ADRs)**](docs/decisions/).

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker (optional, for local container runs)

### Local Development Commands
```bash
# 1. Clone the repository
git clone https://github.com/CodeGrogu/TEST-Workflows.git
cd TEST-Workflows

# 2. Install dependencies
npm install

# 3. Run ESLint code quality gate
npm run lint

# 4. Run automated test suite
npm test
```

### Local Docker Run
```bash
# Build the production container image
docker build -t interactive-hero-app .

# Run container on port 10000
docker run -p 10000:10000 -e PORT=10000 interactive-hero-app

# Probe health endpoint
curl http://localhost:10000/health
```

---

## 🏛️ Architecture & Key Components

| Component | File / Path | Description |
|---|---|---|
| **Interactive UI & Stage** | [`index.html`](./index.html), [`style.css`](./style.css) | Canvas particle physics, Web Audio synth, HUD telemetry, dynamic themes. |
| **Logic & Engines** | [`script.js`](./script.js) | Multi-mode particle simulation, harmonic audio synthesizer, telemetry loops. |
| **Containerization** | [`Dockerfile`](./Dockerfile), [`nginx.conf.template`](./nginx.conf.template) | Lightweight `nginx:alpine` image with dynamic `${PORT}` substitution & `/health` endpoint. |
| **Infrastructure as Code (IaC)**| [`render.yaml`](./render.yaml) | Declarative Render Blueprint managing service specifications and zero-downtime health checking. |
| **CI/CD Quality Pipeline** | [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) | 4-stage pipeline: ESLint 9 $\rightarrow$ `node:test` $\rightarrow$ Docker Buildx $\rightarrow$ Render deploy. |
| **Uptime Monitoring** | [`.github/workflows/uptime-monitor.yml`](./.github/workflows/uptime-monitor.yml) | 15-minute cron health probe with automatic GitHub Incident Issue creation on failure. |

---

## 🛡️ CI/CD Quality Gates

Every Pull Request and push to `main` must pass:
1. **Linting Gate**: `npm run lint` (`eslint .` using flat ESLint 9 config).
2. **Automated Unit & DOM Tests**: `npm test` (`node:test` validating DOM structure, CSS tokens, Nginx templates, and Render Blueprint schema).
3. **Docker Build Gate**: `docker/setup-buildx-action` verifying container compilation.
4. **Deploy Gate**: Executes zero-touch deployment on Render only when all quality checks pass on `main`.

---

## 📡 Monitoring & Incident Alerting

### Built-in GitHub Actions Monitor
- The workflow probes `${RENDER_APP_URL}/health` every 15 minutes.
- **Incident Escalation**: If the endpoint returns non-200 or times out, it automatically opens an issue labeled `['incident', 'uptime-alert']` with detailed latency and response telemetry.
- **Automatic Resolution**: When the endpoint recovers (`200 OK`), any open incident issues are automatically closed.

### UptimeRobot Fallback Setup
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Add a new `HTTP(s)` monitor targeting `https://interactive-hero-app.onrender.com/health` with a 5-minute interval.
3. Configure notification contacts (Email, Slack, Discord, SMS).

---

## 📚 Documentation & Decisions

- 📘 [Master Implementation Guide](docs/IMPLEMENTATION_GUIDE.md): End-to-end guide detailing every phase from scratch.
- 📑 [ADR-001: Containerization with Nginx Alpine](docs/decisions/ADR-001-containerization-with-nginx-alpine-and-dynamic-port.md)
- 📑 [ADR-002: Infrastructure as Code & Gated CI/CD](docs/decisions/ADR-002-render-blueprint-iac-and-ci-cd-quality-gates.md)
