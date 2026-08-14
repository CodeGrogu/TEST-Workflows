import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("HTML Structure Integrity", () => {
  const htmlPath = path.join(rootDir, "index.html");
  assert.ok(fs.existsSync(htmlPath), "index.html must exist");
  
  const content = fs.readFileSync(htmlPath, "utf-8");
  assert.ok(content.includes("<!DOCTYPE html>"), "Must include valid DOCTYPE");
  assert.ok(content.includes('<canvas id="bg-canvas"'), "Must include background canvas element");
  assert.ok(content.includes('class="glass-card"'), "Must include glass-card stage element");
  assert.ok(content.includes('class="hero-text"'), "Must include hero-text element");
  assert.ok(content.includes('<meta name="viewport"'), "Must include viewport meta tag for responsive design");
});

test("CSS Design System & Stylesheet", () => {
  const cssPath = path.join(rootDir, "style.css");
  assert.ok(fs.existsSync(cssPath), "style.css must exist");
  
  const content = fs.readFileSync(cssPath, "utf-8");
  assert.ok(content.includes(":root"), "Must define CSS custom properties");
  assert.ok(content.includes("#bg-canvas"), "Must style the canvas layer");
  assert.ok(content.includes(".glass-card"), "Must style the glass card component");
});

test("Nginx Template Configuration", () => {
  const nginxPath = path.join(rootDir, "nginx.conf.template");
  assert.ok(fs.existsSync(nginxPath), "nginx.conf.template must exist");
  
  const content = fs.readFileSync(nginxPath, "utf-8");
  assert.ok(content.includes("listen ${PORT};"), "Must listen on dynamic ${PORT}");
  assert.ok(content.includes("location /health"), "Must expose /health endpoint");
  assert.ok(content.includes("application/json"), "Must return application/json for health check");
});

test("Render Blueprint IaC Specification", () => {
  const blueprintPath = path.join(rootDir, "render.yaml");
  assert.ok(fs.existsSync(blueprintPath), "render.yaml must exist");
  
  const content = fs.readFileSync(blueprintPath, "utf-8");
  assert.ok(content.includes("services:"), "Must define services");
  assert.ok(content.includes("type: web"), "Must define web service");
  assert.ok(content.includes("runtime: docker"), "Must use docker runtime");
  assert.ok(content.includes("healthCheckPath: /health"), "Must declare /health check path");
});

test("Dockerfile Container Spec", () => {
  const dockerPath = path.join(rootDir, "Dockerfile");
  assert.ok(fs.existsSync(dockerPath), "Dockerfile must exist");
  
  const content = fs.readFileSync(dockerPath, "utf-8");
  assert.ok(content.includes("FROM nginx:alpine"), "Must use nginx:alpine base");
  assert.ok(content.includes("ENV PORT=10000"), "Must set default PORT");
});
