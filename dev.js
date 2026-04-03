#!/usr/bin/env node
/**
 * Zero-dependency dev server with live reload.
 * Serves dist/, watches src/ and generate.js, rebuilds + reloads on change.
 */

import { createServer } from "http";
import { readFileSync, watch, statSync, existsSync } from "fs";
import { join, extname } from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

const __dirname = import.meta.dirname ?? join(fileURLToPath(import.meta.url), "..");
const DIST = join(__dirname, "dist");
const PORT = parseInt(process.env.PORT, 10) || 4000;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const RELOAD_SNIPPET = `<script>new EventSource("/__reload").addEventListener("reload",()=>location.reload())</script>`;

// ─── SSE clients ─────────────────────────────────────────────────────────────

const clients = new Set();

function broadcast() {
  for (const res of clients) {
    res.write("event: reload\ndata: ok\n\n");
  }
}

// ─── Rebuild ─────────────────────────────────────────────────────────────────

let building = false;

function rebuild() {
  if (building) return;
  building = true;
  execFile(process.execPath, [join(__dirname, "generate.js")], (err, stdout, stderr) => {
    building = false;
    if (err) {
      console.error("\x1b[31m✗ Build failed\x1b[0m");
      if (stderr) console.error(stderr);
      return;
    }
    if (stdout) process.stdout.write(stdout);
    console.log("\x1b[32m↻ Reloading…\x1b[0m");
    broadcast();
  });
}

// ─── File watcher ────────────────────────────────────────────────────────────

let debounce;
function onChange() {
  clearTimeout(debounce);
  debounce = setTimeout(rebuild, 150);
}

watch(join(__dirname, "src"), { recursive: true }, onChange);
watch(join(__dirname, "generate.js"), onChange);

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  if (req.url === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(":\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let pathname = req.url.split("?")[0];
  if (pathname === "/") pathname = "/index.html";

  const filePath = join(DIST, pathname);

  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";
  let body = readFileSync(filePath);

  if (ext === ".html") {
    body = body.toString().replace("</body>", RELOAD_SNIPPET + "</body>");
  }

  res.writeHead(200, { "Content-Type": contentType });
  res.end(body);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  \x1b[31mPort ${PORT} is already in use.\x1b[0m Try: PORT=<number> npm run dev\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  \x1b[1mDev server running at\x1b[0m \x1b[36mhttp://localhost:${PORT}\x1b[0m\n`);
  rebuild();
});
