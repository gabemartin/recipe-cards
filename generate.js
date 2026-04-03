#!/usr/bin/env node
/**
 * Recipe Card Generator
 * Usage: node generate.js src/recipes/my-recipe.json
 *        node generate.js          (builds all recipes in src/recipes/)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
:root{
  --black-deep:#18130d;
  --black:#29281f;
  --darkestgrey:#5c5747;
  --darkgrey:#b7b2a4;
  --lightgrey:#ddd8cb;
  --white:#ffffff;
  --accent-dark:#ff5800;
  --accent:#ff8b00;

  --bg: var(--black-deep);
  --panel: rgba(255,255,255,.06);
  --panel-2: rgba(255,255,255,.08);
  --stroke: rgba(221,216,203,.20);
  --stroke-2: rgba(221,216,203,.28);
  --text: rgba(255,255,255,.92);
  --muted: rgba(221,216,203,.82);

  --radius-xl: 26px;
  --radius-lg: 20px;
  --radius-md: 16px;

  --shadow-lg: 0 22px 60px rgba(0,0,0,.55);
  --shadow-md: 0 14px 36px rgba(0,0,0,.38);

  --focus: 0 0 0 3px rgba(255,139,0,.24);

  --font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family: var(--font);
  color: var(--text);
  background:
    radial-gradient(900px 540px at 15% -5%, rgba(255,139,0,.14), transparent 55%),
    radial-gradient(900px 540px at 95% 0%, rgba(255,88,0,.12), transparent 56%),
    radial-gradient(900px 700px at 50% 120%, rgba(221,216,203,.10), transparent 55%),
    var(--bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x:hidden;
}

@supports (padding: max(0px)) {
  .safe-top{ padding-top: max(14px, env(safe-area-inset-top)); }
  .safe-bot{ padding-bottom: max(14px, env(safe-area-inset-bottom)); }
}

.app{
  max-width: 560px;
  margin: 0 auto;
  min-height: 100%;
  display:flex;
  flex-direction:column;
}

header{
  position: sticky;
  top:0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: linear-gradient(to bottom, rgba(24,19,13,.92), rgba(24,19,13,.55));
  border-bottom: 1px solid var(--stroke);
}

.topbar{
  padding: 14px 14px 12px;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.brandrow{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}

.title{
  margin:0;
  line-height:1.05;
  letter-spacing:.2px;
  font-weight: 850;
  font-size: 22px;
}

.subtitle{
  margin:6px 0 0;
  color: var(--muted);
  font-size: var(--text-sm);
  line-height:1.35;
}

.chiprow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:center;
  justify-content:space-between;
}

.chips{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.chip{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.05);
  border-radius: 999px;
  padding: 8px 10px;
  font-size: var(--text-xs);
  color: var(--muted);
  white-space:nowrap;
}

.chip b{ color: var(--text); font-weight: 800; }
.dot{
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(255,139,0,.16);
}

.actions{
  display:flex;
  gap:8px;
  align-items:center;
}

.btn{
  appearance:none;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 14px;
  font-weight: 800;
  font-size: var(--text-sm);
  letter-spacing:.2px;
  box-shadow: var(--shadow-md);
  cursor:pointer;
  transition: transform .08s ease, background .2s ease, border-color .2s ease;
  user-select:none;
  -webkit-tap-highlight-color: transparent;
}
.btn:hover{ background: rgba(255,255,255,.09); border-color: var(--stroke-2); }
.btn:active{ transform: scale(.985); }
.btn:focus-visible{ outline:none; box-shadow: var(--shadow-md), var(--focus); }

.btn.primary{
  background: linear-gradient(180deg, rgba(255,139,0,.22), rgba(255,88,0,.12));
  border-color: rgba(255,139,0,.35);
}

.progresswrap{
  display:flex;
  align-items:center;
  gap:10px;
  padding: 0 14px 12px;
}
.progress{
  position:relative;
  flex:1;
  height: 10px;
  border-radius: 999px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.04);
  overflow:hidden;
}
.bar{
  height:100%;
  width:0%;
  background: linear-gradient(90deg, var(--accent), var(--accent-dark));
  box-shadow: 0 10px 30px rgba(255,139,0,.18);
  border-radius: 999px;
  transition: width .18s ease;
}
.progtext{
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  min-width: 88px;
  text-align:right;
}

main{
  flex:1;
  padding: 14px;
  display:flex;
  flex-direction:column;
  gap: 12px;
}

.swiper{
  width:100%;
  min-height: 560px;
  padding: 6px 0 14px;
}
.swiper-slide{ height:auto; display:flex; }

.card{
  width:100%;
  border-radius: var(--radius-xl);
  border: 1px solid var(--stroke);
  background:
    radial-gradient(900px 380px at 30% -20%, rgba(255,139,0,.12), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.045));
  box-shadow: var(--shadow-lg);
  padding: 16px 16px 18px;
  display:flex;
  flex-direction:column;
  gap: 12px;
  position:relative;
  overflow:hidden;
}
.card::after{
  content:"";
  position:absolute;
  inset:-1px;
  background: radial-gradient(700px 220px at 90% 0%, rgba(221,216,203,.10), transparent 60%);
  pointer-events:none;
  mix-blend-mode: screen;
  opacity:.6;
}

.cardhead{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  z-index:1;
}
.kicker{
  margin:0 0 4px;
  text-transform:uppercase;
  letter-spacing:.18em;
  color: rgba(221,216,203,.72);
  font-size: 11px;
  font-weight: 900;
}
.h{
  margin:0;
  font-size: var(--text-2xl);
  line-height:1.1;
  font-weight: 900;
  letter-spacing:.2px;
}
.expand-btn{
  flex:0 0 auto;
  width: 46px; height: 46px;
  border-radius: 18px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  display:grid;
  place-items:center;
  cursor:pointer;
  color: var(--muted);
  z-index:1;
  appearance:none;
  -webkit-tap-highlight-color: transparent;
  transition: background .15s ease, color .15s ease, transform .08s ease;
}
.expand-btn:hover{ background: rgba(255,255,255,.11); color: var(--text); }
.expand-btn:active{ transform: scale(.92); }
.expand-btn:focus-visible{ outline:none; box-shadow: var(--focus); }

.cardbody{ z-index:1; }
.p{
  margin:0;
  color: var(--text);
  font-size: var(--text-base);
  line-height: 1.55;
}
.muted{
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}

ul{
  margin: 0;
  padding-left: 18px;
  font-size: var(--text-base);
  line-height: 1.55;
  color: var(--text);
}
li{ margin: 7px 0; }

.callout{
  margin-top:auto;
  border-radius: var(--radius-lg);
  border:1px solid var(--stroke);
  background: rgba(24,19,13,.35);
  padding: 12px 12px;
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.45;
  z-index:1;
}
.callout strong{ color: var(--text); }

.checkrow{
  display:flex;
  gap:10px;
  align-items:center;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.05);
}
.checkrow input{
  width: 18px; height: 18px;
  accent-color: var(--accent);
  cursor:pointer;
}
.checkrow label{
  cursor:pointer;
  font-weight: 800;
  font-size: var(--text-sm);
  color: var(--text);
  line-height: 1.25;
}

.bottombar{
  position: sticky;
  bottom:0;
  z-index: 10;
  border-top: 1px solid var(--stroke);
  background: linear-gradient(to top, rgba(24,19,13,.94), rgba(24,19,13,.65));
  backdrop-filter: blur(12px);
}
.nav{
  padding: 12px 14px;
  display:flex;
  gap:10px;
  align-items:center;
  justify-content:space-between;
}
.nav .btn{
  width: 46%;
  display:flex;
  justify-content:center;
  gap:10px;
  align-items:center;
}
.kbd{
  font-family: var(--mono);
  font-size: 11px;
  color: rgba(221,216,203,.75);
  border:1px solid var(--stroke);
  border-bottom-color: rgba(221,216,203,.10);
  background: rgba(255,255,255,.04);
  padding: 3px 7px;
  border-radius: 10px;
}

.swiper-pagination-bullets.swiper-pagination-horizontal{ bottom: 8px; }
.swiper-pagination-bullet{
  width: 8px; height: 8px;
  background: rgba(221,216,203,.32);
  opacity: 1;
}
.swiper-pagination-bullet-active{
  background: rgba(255,139,0,.92);
  box-shadow: 0 0 0 4px rgba(255,139,0,.14);
}

dialog{
  width: min(520px, calc(100vw - 28px));
  border: 1px solid var(--stroke);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(900px 380px at 30% -20%, rgba(255,139,0,.14), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06));
  color: var(--text);
  box-shadow: var(--shadow-lg);
  padding: 0;
  overflow:hidden;
}
dialog::backdrop{
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(3px);
}
dialog.fsdlg{
  inset: 0;
  margin: 0;
  padding: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  border: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(900px 540px at 15% -5%, rgba(255,139,0,.14), transparent 55%),
    radial-gradient(900px 540px at 95% 0%, rgba(255,88,0,.10), transparent 56%),
    var(--bg);
  box-shadow: none;
}
dialog.fsdlg:not([open]){ display: none; }
dialog.fsdlg::backdrop{ background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
.fstopbar{
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 14px;
  padding-right: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(24,19,13,.72);
  backdrop-filter: blur(14px);
}
.fs-swiper{
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.fs-swiper .swiper-slide{
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.fsslide{
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  margin: 0 auto;
}
.fsbottombar{
  flex: 0 0 auto;
  border-top: 1px solid var(--stroke);
  background: linear-gradient(to top, rgba(24,19,13,.94), rgba(24,19,13,.65));
  backdrop-filter: blur(14px);
}
.modal{
  padding: 16px;
  display:flex;
  flex-direction:column;
  gap: 12px;
}
.modalhead{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
}
.modal h3{
  margin:0;
  font-size: var(--text-xl);
  font-weight: 900;
  line-height:1.1;
}
.x{
  width: 40px; height: 40px;
  border-radius: 14px;
  border:1px solid var(--stroke);
  background: rgba(255,255,255,.06);
  color: var(--text);
  font-weight: 900;
  cursor:pointer;
}
.x:focus-visible{ outline:none; box-shadow: var(--focus); }

.printnote{
  color: var(--muted);
  font-size: var(--text-sm);
  line-height:1.45;
}

@media print{
  body{ background:#fff; color:#000; }
  header,.bottombar,.swiper-pagination{ display:none !important; }
  .app{ max-width: 100%; }
  main{ padding: 0; }
  .card{ box-shadow:none; border:1px solid #ccc; background:#fff; color:#000; page-break-inside: avoid; }
  .muted,.callout,.chip{ color:#333 !important; }
}
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function renderBodyBlock(block) {
  switch (block.type) {
    case "p":
      return `<p class="p">${block.html}</p>`;
    case "ul":
      return `<ul>${block.items.map(i => `<li>${i}</li>`).join("\n")}</ul>`;
    case "callout":
      return `<div class="callout">${block.html}</div>`;
    case "spacer":
      return `<div style="height:10px"></div>`;
    default:
      return `<!-- unknown block type: ${block.type} -->`;
  }
}

function renderChip({ dot, label, value }) {
  const inner = dot
    ? `<span class="dot"></span><b>${label}:</b> ${value}`
    : `<b>${label}:</b> ${value}`;
  return `<span class="chip">${inner}</span>`;
}

function renderSlide(slide, index) {
  const stepLabel = index === 0 ? "0" : String(index);

  const checkbox = slide.checkboxLabel
    ? `<div class="checkrow">
          <input id="c${index}" type="checkbox" />
          <label for="c${index}">${slide.checkboxLabel}</label>
        </div>`
    : "";

  const body = slide.body.map(renderBodyBlock).join("\n        ");

  return `
          <section class="swiper-slide">
            <article class="card">
              <div class="cardhead">
                <div>
                  <p class="kicker">${slide.kicker}</p>
                  <h2 class="h">${slide.title}</h2>
                </div>
                <button class="expand-btn" type="button" aria-label="View fullscreen">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
              </div>

              <div class="cardbody">
                ${checkbox}
        ${body}
              </div>
            </article>
          </section>`.trimStart();
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function buildHTML(recipe) {
  const chips = recipe.chips.map(renderChip).join("\n            ");
  const slides = recipe.slides.map((s, i) => renderSlide(s, i)).join("\n");
  const fsSlides = recipe.slides.map((s, i) => {
    const checkbox = s.checkboxLabel
      ? `<div class="checkrow">
              <input id="fsc${i}" type="checkbox" />
              <label for="fsc${i}">${s.checkboxLabel}</label>
            </div>`
      : "";
    const body = s.body.map(renderBodyBlock).join("\n          ");
    return `          <div class="swiper-slide">
            <div class="fsslide">
              <p class="kicker">${s.kicker}</p>
              <h2 class="h">${s.title}</h2>
              <div class="cardbody">
                ${checkbox}
          ${body}
              </div>
            </div>
          </div>`;
  }).join("\n");
  const ingredientItems = recipe.ingredients.items
    .map(i => `<li>${i}</li>`)
    .join("\n        ");

  // Collect checkbox IDs for the JS (slides that have a checkboxLabel)
  const checkIds = recipe.slides
    .map((s, i) => s.checkboxLabel ? `"c${i}"` : null)
    .filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${recipe.title}</title>
  <meta name="description" content="${escapeAttr(recipe.subtitle)}" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#18130d" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${escapeAttr(recipe.title)}" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
  <style>${CSS}</style>
</head>

<body>
  <div class="app">
    <header class="safe-top">
      <div class="topbar">
        <div class="brandrow">
          <div>
            <h1 class="title">${recipe.title}</h1>
            <p class="subtitle">${recipe.subtitle}</p>
          </div>
          <button class="btn primary" id="openIngredients" type="button" aria-label="Open ingredients">
            Ingredients
          </button>
        </div>

        <div class="chiprow">
          <div class="chips">
            ${chips}
          </div>
          <div class="actions">
            <button class="btn" id="resetChecks" type="button" aria-label="Reset checkmarks">Reset</button>
            <button class="btn" id="print" type="button" aria-label="Print recipe">Print</button>
          </div>
        </div>
      </div>

      <div class="progresswrap">
        <div class="progress" aria-label="Step progress">
          <div class="bar" id="bar"></div>
        </div>
        <div class="progtext" id="progtext">1 / ${recipe.slides.length}</div>
      </div>
    </header>

    <main>
      <div class="swiper main-swiper" aria-label="Recipe steps carousel">
        <div class="swiper-wrapper">
${slides}
        </div>
        <div class="swiper-pagination" aria-hidden="true"></div>
      </div>
    </main>

    <div class="bottombar safe-bot">
      <div class="nav">
        <button class="btn" id="prev" type="button" aria-label="Previous step">
          ‹ Prev <span class="kbd">←</span>
        </button>
        <button class="btn primary" id="next" type="button" aria-label="Next step">
          Next › <span class="kbd">→</span>
        </button>
      </div>
    </div>
  </div>

  <dialog id="dlg">
    <div class="modal">
      <div class="modalhead">
        <div>
          <h3>${recipe.ingredients.heading}</h3>
          <div class="printnote">${recipe.ingredients.note}</div>
        </div>
        <button class="x" id="closeDlg" type="button" aria-label="Close">✕</button>
      </div>
      <ul>
        ${ingredientItems}
      </ul>
      <div class="callout">${recipe.ingredients.callout}</div>
    </div>
  </dialog>

  <dialog id="fsDlg" class="fsdlg">
    <div class="fstopbar safe-top">
      <button class="x" id="closeFsDlg" type="button" aria-label="Close fullscreen">✕</button>
    </div>
    <div class="swiper fs-swiper">
      <div class="swiper-wrapper">
${fsSlides}
      </div>
    </div>
    <div class="fsbottombar safe-bot">
      <div class="nav">
        <button class="btn" id="fsPrev" type="button" aria-label="Previous step">‹ Prev</button>
        <button class="btn primary" id="fsNext" type="button" aria-label="Next step">Next ›</button>
      </div>
    </div>
  </dialog>

  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    const CHECK_KEYS = [${checkIds.join(",")}];
    const LS_KEY = ${JSON.stringify(recipe.storageKey)};

    function loadChecks(){
      try{
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        CHECK_KEYS.forEach(id => {
          const el = document.getElementById(id);
          if(!el) return;
          el.checked = !!saved[id];
          el.addEventListener("change", () => {
            saved[id] = el.checked;
            localStorage.setItem(LS_KEY, JSON.stringify(saved));
          });
        });
      }catch(e){}
    }

    function resetChecks(){
      CHECK_KEYS.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.checked = false;
      });
      localStorage.setItem(LS_KEY, JSON.stringify({}));
    }

    const swiper = new Swiper(".main-swiper", {
      slidesPerView: 1,
      spaceBetween: 14,
      speed: 260,
      grabCursor: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      keyboard: { enabled: true },
      a11y: { enabled: true }
    });

    const bar = document.getElementById("bar");
    const progtext = document.getElementById("progtext");

    function updateProgress(){
      const idx = swiper.activeIndex + 1;
      const total = swiper.slides.length;
      bar.style.width = (idx / total * 100) + "%";
      progtext.textContent = idx + " / " + total;
    }

    swiper.on("slideChange", updateProgress);
    updateProgress();
    loadChecks();

    document.getElementById("prev").addEventListener("click", () => swiper.slidePrev());
    document.getElementById("next").addEventListener("click", () => swiper.slideNext());

    const dlg = document.getElementById("dlg");
    document.getElementById("openIngredients").addEventListener("click", () => dlg.showModal());
    document.getElementById("closeDlg").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      const rect = dlg.getBoundingClientRect();
      const inside = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                     rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if(!inside) dlg.close();
    });

    const fsDlg = document.getElementById("fsDlg");
    const fsSwiper = new Swiper(".fs-swiper", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 260,
      threshold: 8,
      grabCursor: true,
      keyboard: { enabled: true },
      a11y: { enabled: true }
    });

    function updateFsNav() {
      document.getElementById("fsPrev").disabled = fsSwiper.isBeginning;
      document.getElementById("fsNext").disabled = fsSwiper.isEnd;
    }
    fsSwiper.on("slideChange", () => {
      swiper.slideTo(fsSwiper.activeIndex, 0);
      updateFsNav();
    });
    updateFsNav();

    function openFs(idx) {
      fsSwiper.slideTo(idx, 0);
      updateFsNav();
      document.documentElement.style.overflow = "hidden";
      fsDlg.showModal();
    }
    function closeFs() {
      fsDlg.close();
      document.documentElement.style.overflow = "";
    }

    document.querySelectorAll(".expand-btn").forEach(btn => {
      btn.addEventListener("click", () => openFs(swiper.activeIndex));
    });
    document.getElementById("closeFsDlg").addEventListener("click", closeFs);
    document.getElementById("fsPrev").addEventListener("click", () => fsSwiper.slidePrev());
    document.getElementById("fsNext").addEventListener("click", () => fsSwiper.slideNext());

    document.getElementById("resetChecks").addEventListener("click", () => resetChecks());
    document.getElementById("print").addEventListener("click", () => window.print());
  </script>
</body>
</html>`;
}

// ─── Index page ───────────────────────────────────────────────────────────────

function buildIndex(entries) {
  // entries: [{ name, recipe }]
  const cards = entries.map(({ name, recipe }) => {
    const stepCount = recipe.slides.filter(s => s.checkboxLabel).length;
    const chips = recipe.chips.slice(0, 3).map(renderChip).join("\n          ");
    return `
    <a class="icard" href="${name}.html">
      <div class="icard-head">
        <div>
          <p class="kicker">${stepCount} steps</p>
          <h2 class="h">${recipe.title}</h2>
          <p class="muted">${recipe.subtitle}</p>
        </div>
        <div class="arrow">›</div>
      </div>
      <div class="chips">
        ${chips}
      </div>
    </a>`.trimStart();
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Recipe Cards</title>
  <meta name="description" content="Phone-optimized step-by-step recipe cards." />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#18130d" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Recipe Cards" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <style>
    :root{
      --black-deep:#18130d; --accent:#ff8b00; --accent-dark:#ff5800;
      --stroke:rgba(221,216,203,.20); --stroke-2:rgba(221,216,203,.28);
      --text:rgba(255,255,255,.92); --muted:rgba(221,216,203,.82);
      --radius-xl:26px; --radius-lg:20px;
      --shadow-lg:0 22px 60px rgba(0,0,0,.55);
      --shadow-md:0 14px 36px rgba(0,0,0,.38);
      --font:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
      --text-xs:12px; --text-sm:14px; --text-base:16px; --text-2xl:24px;
    }
    *{ box-sizing:border-box; }
    html,body{ height:100%; margin:0; }
    body{
      font-family:var(--font); color:var(--text);
      background:
        radial-gradient(900px 540px at 15% -5%, rgba(255,139,0,.14), transparent 55%),
        radial-gradient(900px 540px at 95% 0%, rgba(255,88,0,.12), transparent 56%),
        var(--black-deep);
      -webkit-font-smoothing:antialiased;
      min-height:100%;
    }
    .wrap{ max-width:560px; margin:0 auto; padding:24px 14px 40px; padding-top:max(24px,env(safe-area-inset-top)); }
    .page-title{
      font-size:28px; font-weight:900; margin:0 0 4px;
      letter-spacing:.2px; line-height:1.1;
    }
    .page-sub{ color:var(--muted); font-size:var(--text-sm); margin:0 0 24px; line-height:1.4; }
    .list{ display:flex; flex-direction:column; gap:12px; }
    .icard{
      display:flex; flex-direction:column; gap:12px;
      border-radius:var(--radius-xl); border:1px solid var(--stroke);
      background:
        radial-gradient(900px 380px at 30% -20%, rgba(255,139,0,.10), transparent 55%),
        linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.045));
      box-shadow:var(--shadow-lg);
      padding:16px 16px 14px;
      text-decoration:none; color:inherit;
      transition:border-color .18s ease, transform .08s ease;
    }
    .icard:hover{ border-color:var(--stroke-2); transform:translateY(-1px); }
    .icard:active{ transform:scale(.99); }
    .icard-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .kicker{
      margin:0 0 4px; text-transform:uppercase; letter-spacing:.18em;
      color:rgba(221,216,203,.72); font-size:11px; font-weight:900;
    }
    .h{ margin:0; font-size:var(--text-2xl); font-weight:900; line-height:1.1; }
    .muted{ margin:6px 0 0; color:var(--muted); font-size:var(--text-sm); line-height:1.35; }
    .arrow{
      flex:0 0 auto; width:40px; height:40px; border-radius:16px;
      border:1px solid var(--stroke); background:rgba(255,255,255,.06);
      display:grid; place-items:center; font-size:22px; color:var(--text);
    }
    .chips{ display:flex; gap:8px; flex-wrap:wrap; }
    .chip{
      display:inline-flex; align-items:center; gap:8px;
      border:1px solid var(--stroke); background:rgba(255,255,255,.05);
      border-radius:999px; padding:6px 10px;
      font-size:var(--text-xs); color:var(--muted); white-space:nowrap;
    }
    .chip b{ color:var(--text); font-weight:800; }
    .dot{
      width:8px; height:8px; border-radius:999px;
      background:var(--accent); box-shadow:0 0 0 4px rgba(255,139,0,.16);
    }
    .empty{ color:var(--muted); font-size:var(--text-sm); text-align:center; padding:40px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1 class="page-title">Recipe Cards</h1>
    <p class="page-sub">Tap a recipe to open the step-by-step card view.</p>
    <div class="list">
${cards || '      <p class="empty">No recipes yet.</p>'}
    </div>
  </div>
</body>
</html>`;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function processFile(src) {
  const recipe = JSON.parse(readFileSync(src, "utf8"));
  const name = basename(src, ".json");
  const outDir = join(__dirname, "dist");
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${name}.html`);
  writeFileSync(out, buildHTML(recipe), "utf8");
  console.log(`  ✓ ${src} → dist/${name}.html`);
  return { name, recipe };
}

const args = process.argv.slice(2);

if (args.length > 0) {
  // Build specific files (no index update)
  args.forEach(processFile);
} else {
  // Build all recipes + regenerate index
  const recipesDir = join(__dirname, "src", "recipes");
  const files = readdirSync(recipesDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No recipe JSON files found in src/recipes/");
  } else {
    const entries = files.map(f => processFile(join(recipesDir, f)));
    const outDir = join(__dirname, "dist");
    writeFileSync(join(outDir, "index.html"), buildIndex(entries), "utf8");
    console.log(`  ✓ index → dist/index.html (${entries.length} recipe${entries.length === 1 ? "" : "s"})`);

    // Generate web app manifest
    const manifest = {
      name: "Recipe Cards",
      short_name: "Recipes",
      description: "Phone-optimized step-by-step recipe cards.",
      start_url: "./index.html",
      display: "standalone",
      background_color: "#18130d",
      theme_color: "#18130d",
      icons: [
        { src: "icons/chef-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "icons/chef-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        { src: "icons/chef-icon.png",     sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    };
    writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    console.log("  ✓ manifest.json");

    // Copy icons from src/icons/ → dist/icons/ if present
    const srcIconsDir = join(__dirname, "src", "icons");
    if (existsSync(srcIconsDir)) {
      const outIconsDir = join(outDir, "icons");
      mkdirSync(outIconsDir, { recursive: true });
      readdirSync(srcIconsDir).forEach(f => {
        writeFileSync(join(outIconsDir, f), readFileSync(join(srcIconsDir, f)));
      });
      console.log("  ✓ icons/");
    }
  }
}
