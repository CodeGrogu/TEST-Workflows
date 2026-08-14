# Render MCP Guidelines & Rules

When managing infrastructure, deploying code, or inspecting services hosted on Render:

## 1. Tool Integration via Render MCP (`https://mcp.render.com/mcp`)
- Use the official Render MCP server for all service discovery, status monitoring, log querying, deployment management, and database checks.
- When multiple workspaces or teams exist on Render, always verify and switch to the relevant workspace context via `list_workspaces` / `select_workspace`.

## 2. Safe Deployment Protocol
- **Pre-Deploy Verification**: Confirm target service IDs, environment configurations, and branch names before triggering deploys.
- **Cache Management**: When updates involve updated package manifests or native builds, trigger a build with clear-cache enabled.
- **Verification**: Never assume a deploy succeeded solely because it was accepted; check build status and live health checks until `live` or `failed`.

## 3. Safe Database Access
- All database queries executed via Render MCP PostgreSQL tools must remain strictly **read-only** (`SELECT`, `EXPLAIN`, `WITH`).
- Never attempt destructive operations (`DROP`, `TRUNCATE`, `DELETE`, `UPDATE`) through the MCP database interface.

## 4. Observability & Incident Response
- When diagnosing errors, examine both runtime logs and performance metrics (CPU, RAM, HTTP status distribution) to pinpoint root causes (e.g. OOM kills vs. unhandled exceptions).
- Protect sensitive secrets and environment variable values when reporting diagnostics.
