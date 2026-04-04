#!/usr/bin/env node
/**
 * Zero-dependency dev server.
 * Serves dist/, watches recipe JSON + icons + generate.js, rebuilds on change (refresh the browser manually).
 */

import { createServer } from "http";
import { readFileSync, watchFile, readdirSync, statSync, existsSync } from "fs";
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

const RECIPES_DIR = join(__dirname, "src", "recipes");
const ICONS_DIR = join(__dirname, "src", "icons");
const GENERATE_JS = join(__dirname, "generate.js");

// ─── Rebuild ─────────────────────────────────────────────────────────────────

let building = false;

function rebuild() {
  if (building) return;
  building = true;
  execFile(process.execPath, [GENERATE_JS], (err, stdout, stderr) => {
    building = false;
    if (err) {
      console.error("\x1b[31m✗ Build failed\x1b[0m");
      if (stderr) console.error(stderr);
      return;
    }
    if (stdout) process.stdout.write(stdout);
    console.log("\x1b[32m✓ Build done — refresh the browser to see changes\x1b[0m");
  });
}

// ─── File watcher ────────────────────────────────────────────────────────────
// fs.watch on directories (especially recursive src/) can fire on macOS when generate.js
// only reads recipe/icon files, causing rebuild loops. watchFile uses mtime and ignores reads.

const watchedPaths = new Set();
let debounce;

function scheduleRebuild() {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    if (!building) rebuild();
  }, 250);
}

function watchPathWhenEdited(absPath) {
  if (watchedPaths.has(absPath)) return;
  watchedPaths.add(absPath);
  watchFile(absPath, { interval: 500 }, (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs) return;
    scheduleRebuild();
  });
}

function attachSourceWatchers() {
  if (existsSync(RECIPES_DIR)) {
    for (const name of readdirSync(RECIPES_DIR)) {
      if (name.endsWith(".json")) watchPathWhenEdited(join(RECIPES_DIR, name));
    }
  }
  if (existsSync(ICONS_DIR)) {
    for (const name of readdirSync(ICONS_DIR)) {
      if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
        watchPathWhenEdited(join(ICONS_DIR, name));
      }
    }
  }
  watchPathWhenEdited(GENERATE_JS);
}

attachSourceWatchers();
// Pick up newly added recipe JSON / icons without restarting dev (light scan).
setInterval(attachSourceWatchers, 4000);

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
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
  const body = readFileSync(filePath);

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
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
