# ADR-002: Infrastructure as Code with Render Blueprint and Gated GitHub Actions

## Status
Accepted

## Date
2026-08-14

## Context
Deployments and infrastructure provisioning must be automated, repeatable, and version-controlled. Any change pushed to `main` must pass strict quality controls (linting, automated unit tests, and Docker build checks) before triggering deployment. Additionally, health monitoring and incident reporting must be automated.

Key requirements:
1. Declarative Infrastructure as Code (IaC) checked into version control.
2. Gated CI/CD where failing tests or lints block deployment completely.
3. Automated uptime and health monitoring with real alert paths.

## Decision
1. Implement Render Blueprints via root `render.yaml` declaring service type, runtime, plan, and health check path.
2. Implement a 4-stage GitHub Actions CI/CD pipeline (`.github/workflows/ci-cd.yml`) where the `deploy` stage depends on `lint-and-format`, `automated-tests`, and `docker-build-check`.
3. Implement a 15-minute scheduled health probe workflow (`.github/workflows/uptime-monitor.yml`) that opens a GitHub Incident Issue on probe failure and closes it upon recovery.

## Alternatives Considered

### Manual Dashboard Deployment
- **Pros**: Quick to set up initially.
- **Cons**: High drift risk, no audit trail, prone to human error, lacks automated verification gates.
- **Rejected**: Violates production quality standards.

### Terraform for Render
- **Pros**: General IaC framework.
- **Cons**: Requires state file management, API credentials setup, and extra pipeline maintenance for a single service.
- **Rejected**: Render Blueprints natively provide Git-driven sync without external state storage.

## Consequences
- Every commit on `main` is validated through ESLint, Node.js unit tests, and Docker build.
- Infrastructure state is 100% represented in Git.
- Outages trigger automated GitHub issue alerts with latency diagnostics.
