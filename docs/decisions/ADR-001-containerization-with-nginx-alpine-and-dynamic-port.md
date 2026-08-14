# ADR-001: Containerization with Nginx Alpine and Dynamic Port Substitution

## Status
Accepted

## Date
2026-08-14

## Context
We need to deploy a modern, static and client-side interactive web application to the Render cloud platform with containerized runtime standards, zero cold-start overhead, and automated health probing.

Key requirements:
1. Production container image with minimal attack surface and footprint (<50MB).
2. Compatibility with cloud environments (Render, Cloud Run, ECS) where the listening port is dynamically injected via the `$PORT` environment variable.
3. Structured JSON `/health` endpoint for zero-downtime rolling deploys and external uptime monitors.

## Decision
Use `nginx:alpine` as the base image combined with Nginx's native environment template substitution mechanism (`/etc/nginx/templates/default.conf.template`).

## Alternatives Considered

### Node.js / Express Server
- **Pros**: Easy dynamic port binding via `process.env.PORT`.
- **Cons**: Substantially larger image size (~200MB+), higher memory overhead (~50MB+ vs ~5MB for Nginx), unnecessary Node runtime complexity for static assets.
- **Rejected**: Overkill for client-side assets; Nginx is faster and more resource-efficient.

### Python `http.server`
- **Pros**: Built-in to Python.
- **Cons**: Single-threaded, poor static caching, lacks custom headers and structured JSON endpoints without custom scripting.
- **Rejected**: Not production grade.

### Standard Nginx with Fixed Port 80
- **Pros**: Minimal configuration.
- **Cons**: Incompatible with Render's dynamic `$PORT` routing.
- **Rejected**: Fails runtime port binding on Render.

## Consequences
- Image builds fast and weighs ~23MB.
- `nginx.conf.template` automatically generates `/etc/nginx/conf.d/default.conf` on startup with the active runtime `$PORT`.
- Exposes structured `/health` endpoint returning `HTTP 200` with JSON status and ISO-8601 timestamp.
