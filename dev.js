#!/usr/bin/env node
/**
 * Zero-dependency dev server.
 * Serves dist/, watches recipe JSON + icons + recipe images + generate.js, rebuilds on change (refresh the browser manually).
 */

import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, watchFile, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { networkInterfaces } from "os";

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
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const RECIPES_DIR = join(__dirname, "src", "recipes");
const ICONS_DIR = join(__dirname, "src", "icons");
const IMAGES_DIR = join(__dirname, "src", "images");
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
  if (existsSync(IMAGES_DIR)) {
    for (const name of readdirSync(IMAGES_DIR)) {
      if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
        watchPathWhenEdited(join(IMAGES_DIR, name));
      }
    }
  }
  watchPathWhenEdited(GENERATE_JS);
}

attachSourceWatchers();
// Pick up newly added recipe JSON / icons without restarting dev (light scan).
setInterval(attachSourceWatchers, 4000);

// ─── Image upload ─────────────────────────────────────────────────────────────

function getRecipeSlugs() {
  if (!existsSync(RECIPES_DIR)) return [];
  return readdirSync(RECIPES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

const UPLOAD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Add Recipe Image</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#1a1a1a;color:#f0f0f0;padding:24px;min-height:100vh}
h1{font-size:1.4rem;margin-bottom:8px}
p.sub{color:#888;font-size:.9rem;margin-bottom:24px}
label{display:block;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:#aaa;margin-bottom:6px}
select{width:100%;padding:12px;border:1px solid #444;border-radius:8px;background:#2a2a2a;color:#f0f0f0;font-size:1rem;margin-bottom:20px;appearance:none}
.drop{border:2px dashed #555;border-radius:12px;padding:40px 24px;text-align:center;cursor:pointer;transition:border-color .2s;margin-bottom:20px;color:#888}
.drop.over{border-color:#e8760a}
.drop.filled{border-color:#4CAF50;padding:0;overflow:hidden}
.drop.filled img{width:100%;border-radius:10px;display:block}
input[type=file]{display:none}
button{width:100%;padding:14px;background:#e8760a;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer}
button:disabled{opacity:.4;cursor:default}
.msg{margin-top:16px;padding:12px 16px;border-radius:8px;text-align:center;font-weight:500;display:none}
.msg.ok{background:#1a3a1a;color:#4CAF50;display:block}
.msg.err{background:#3a1a1a;color:#f66;display:block}
</style>
</head>
<body>
<h1>Add Recipe Image</h1>
<p class="sub">Choose a recipe, pick a photo, save.</p>
<label>Recipe</label>
<select id="slug">%%SLUG_OPTIONS%%</select>
<label>Photo</label>
<div class="drop" id="drop" onclick="document.getElementById('fi').click()">
  Tap to choose a photo<br><small style="opacity:.6;font-size:.8rem;margin-top:6px;display:block">or paste / drag &amp; drop</small>
</div>
<input type="file" id="fi" accept="image/*">
<button id="btn" disabled onclick="go()">Save Image</button>
<div class="msg" id="msg"></div>
<script>
let dataUrl=null;
const drop=document.getElementById('drop');
const btn=document.getElementById('btn');
function setImage(file){
  const r=new FileReader();
  r.onload=e=>{
    dataUrl=e.target.result;
    drop.innerHTML='<img src="'+dataUrl+'">';
    drop.classList.add('filled');
    btn.disabled=false;
  };
  r.readAsDataURL(file);
}
document.getElementById('fi').addEventListener('change',e=>{if(e.target.files[0])setImage(e.target.files[0])});
drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('over')});
drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');if(e.dataTransfer.files[0])setImage(e.dataTransfer.files[0])});
document.addEventListener('paste',e=>{
  const item=[...e.clipboardData.items].find(i=>i.type.startsWith('image/'));
  if(item)setImage(item.getAsFile());
});
async function go(){
  btn.disabled=true;
  const msg=document.getElementById('msg');
  msg.className='msg';
  try{
    const r=await fetch('/_upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:document.getElementById('slug').value,dataUrl})});
    const j=await r.json();
    if(r.ok){msg.textContent='\\u2713 Saved! Refresh the recipe page to see the image.';msg.className='msg ok';}
    else{msg.textContent=j.error||'Upload failed';msg.className='msg err';}
  }catch(e){msg.textContent='Upload failed';msg.className='msg err';}
  btn.disabled=false;
}
</script>
</body>
</html>`;

async function handleUpload(req, res) {
  if (req.method === "GET") {
    const options = getRecipeSlugs()
      .map((s) => `<option value="${s}">${s}</option>`)
      .join("");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(UPLOAD_HTML.replace("%%SLUG_OPTIONS%%", options));
    return;
  }

  if (req.method === "POST") {
    try {
      const { slug, dataUrl } = JSON.parse(await readBody(req));
      if (!slug || !dataUrl) throw new Error("Missing slug or image data");
      if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Invalid slug");

      const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/s);
      if (!match) throw new Error("Invalid image data URL");
      const rawExt = match[1];
      const ext = rawExt === "jpeg" ? "jpg" : rawExt;
      const data = Buffer.from(match[2], "base64");

      mkdirSync(IMAGES_DIR, { recursive: true });
      const dest = join(IMAGES_DIR, `${slug}.${ext}`);
      writeFileSync(dest, data);
      scheduleRebuild();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, file: `src/images/${slug}.${ext}` }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
}

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  let pathname = req.url.split("?")[0];

  if (pathname === "/_upload") {
    await handleUpload(req, res);
    return;
  }

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

function getLanIP() {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return null;
}

server.listen(PORT, "0.0.0.0", () => {
  const lanIP = getLanIP();
  console.log(`\n  \x1b[1mDev server running at\x1b[0m \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  if (lanIP) console.log(`  \x1b[1mNetwork:\x1b[0m              \x1b[36mhttp://${lanIP}:${PORT}\x1b[0m`);
  console.log();
  rebuild();
});
