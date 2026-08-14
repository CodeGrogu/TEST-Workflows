# Interactive Hero App

Modern, interactive web application deployed on Render using Docker containerization, automated GitHub Actions CI/CD quality gates, and continuous health monitoring.

---

## Architecture & Infrastructure

- **Containerization**: Alpine Nginx container ([`Dockerfile`](./Dockerfile)) running dynamic `${PORT}` substitution with [`nginx.conf.template`](./nginx.conf.template).
- **Infrastructure as Code (IaC)**: Render Blueprint ([`render.yaml`](./render.yaml)) managing web service definition, zero-downtime health checking, and environment variables.
- **CI/CD Pipeline**: [GitHub Actions](.github/workflows/ci-cd.yml) enforcing linting (`ESLint`), automated unit tests (`node:test`), and Docker build validation before deploying.
- **Uptime Monitoring & Alerting**: [Scheduled Uptime Monitor](.github/workflows/uptime-monitor.yml) probing `/health` every 15 minutes, automatically opening GitHub incident issues upon downtime.

---

## Local Development

### Requirements
- Node.js >= 20.0.0
- npm >= 10.0.0

### Commands
```bash
# Install dependencies
npm install

# Run code linter
npm run lint

# Run automated tests
npm test
```

---

## CI/CD Workflow & Quality Gates

Every pull request and push to `main` executes:
1. **Linting Gate**: `npm run lint` (ESLint).
2. **Automated Unit Tests**: `npm test` verifying DOM structure, stylesheet properties, Nginx templates, and Render Blueprint IaC configuration.
3. **Docker Build Gate**: Verifies container build on the runner with Buildx.
4. **Deploy Gate**: Automatically triggers Render deployment upon passing all quality checks on `main`.

---

## Uptime & Monitoring Alerting Setup

### Option 1: GitHub Actions Incident Alerts (Built-in)
- Set repository variable `RENDER_APP_URL` (in **Settings** > **Secrets and variables** > **Actions** > **Variables**) with your live Render URL (e.g. `https://interactive-hero-app.onrender.com`).
- The scheduled monitor will probe `${RENDER_APP_URL}/health` every 15 minutes and create an incident issue with label `incident` if status is not `200 OK`.

### Option 2: UptimeRobot Integration
1. Create a free account at [UptimeRobot](https://uptimerobot.com).
2. Click **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Interactive Hero App`
   - **URL (or IP)**: `https://interactive-hero-app.onrender.com/health`
   - **Monitoring Interval**: `5 minutes`
3. Configure Alert Contacts: Select Email, Slack, Discord webhook, or SMS.
