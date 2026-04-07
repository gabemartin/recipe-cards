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
  --background-primary:#18130d;
  --background-secondary:#221c14;
  --foreground-primary:rgba(255,255,255,.93);
  --foreground-secondary:#c2bdb2;
  --foreground-tertiary:#9a9488;
  --accent:#ff8b00;
  --accent-dark:#ff5800;
  --accent-glow:rgba(255,139,0,.18);
  --border:#3a3328;
  --border-strong:#504839;
  --surface-muted:#2a2318;
  --shadow-elevated:0 8px 24px rgba(0,0,0,.45);

  --radius-xl: 26px;
  --radius-lg: 20px;
  --radius-md: 16px;

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

  --chrome-header-bg: rgba(24,19,13,.88);
  --chrome-footer-fill: linear-gradient(to top, rgba(24,19,13,.94), rgba(24,19,13,.65));
}
html[data-theme="light"]{
  --background-primary:#ddd9ce;
  --background-secondary:#ece9e1;
  --foreground-primary:#1a1a17;
  --foreground-secondary:#4a4740;
  --foreground-tertiary:#7a766d;
  --accent:#d47400;
  --accent-dark:#b86200;
  --accent-glow:rgba(212,116,0,.14);
  --border:#c4bfb3;
  --border-strong:#a8a295;
  --surface-muted:#d5d0c5;
  --shadow-elevated:0 4px 12px rgba(0,0,0,.08);
  --focus: 0 0 0 3px rgba(212,116,0,.28);
  --chrome-header-bg: rgba(221,217,206,.88);
  --chrome-footer-fill: linear-gradient(to top, rgba(221,217,206,.94), rgba(221,217,206,.65));
}

*{ box-sizing:border-box; }
html,body{ height:100%; overflow-x:hidden; }
body{
  margin:0;
  font-family: var(--font);
  color: var(--foreground-primary);
  background: var(--background-primary);
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
  background: var(--chrome-header-bg);
  border-bottom: 1px solid var(--border);
}
.top-nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding: 12px 14px;
}
#openIngredients{
  white-space: nowrap;
  display:flex;
  align-items:center;
  gap:8px;
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
.brandrow .btn{
  display:inline-flex;
  align-items:center;
  gap:8px;
}

.titlecluster{
  display:flex;
  align-items:flex-start;
  gap:10px;
  min-width:0;
  flex:1;
}
.titlestack{
  min-width:0;
  flex:1;
}
a.btn{ text-decoration:none; color:inherit; }
.btn-back{
  flex-shrink:0;
  align-self:flex-start;
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
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  line-height:1.35;
}

.chiprow{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:center;
  justify-content:flex-start;
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
  border:1px solid var(--border);
  background: var(--surface-muted);
  border-radius: 999px;
  padding: 8px 10px;
  font-size: var(--text-xs);
  color: var(--foreground-secondary);
  white-space:nowrap;
}

.chip b{ color: var(--foreground-primary); font-weight: 800; }
.dot{
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.btn{
  appearance:none;
  border:1px solid var(--border);
  background: var(--surface-muted);
  color: var(--foreground-primary);
  padding: 10px 12px;
  border-radius: 14px;
  font-weight: 800;
  font-size: var(--text-sm);
  letter-spacing:.2px;
  box-shadow: var(--shadow-elevated);
  cursor:pointer;
  transition: transform .08s ease, background .2s ease, border-color .2s ease;
  user-select:none;
  -webkit-tap-highlight-color: transparent;
}
.btn:hover{ border-color: var(--border-strong); }
.btn:active{ transform: scale(.985); }
.btn:focus-visible{ outline:none; box-shadow: var(--shadow-elevated), var(--focus); }

.icon{
  flex-shrink:0;
  width:20px;
  height:20px;
  display:block;
}
.icon-inline{ width:18px; height:18px; }
.expand-btn .icon-expand{ width:22px; height:22px; }

.btn.primary{
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent-dark) 12%, transparent));
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
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
  border:1px solid var(--border);
  background: var(--surface-muted);
  overflow:hidden;
}
.bar{
  height:100%;
  width:0%;
  background: linear-gradient(90deg, var(--accent), var(--accent-dark));
  box-shadow: 0 10px 30px var(--accent-glow);
  border-radius: 999px;
  transition: width .18s ease;
}
.progtext{
  font-family: var(--mono);
  font-size: 12px;
  color: var(--foreground-secondary);
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
  overflow:hidden;
  touch-action: pan-y;
}
.swiper-slide{ height:auto; display:flex; }

.card{
  width:100%;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--background-secondary);
  box-shadow: var(--shadow-elevated);
  padding: 16px 16px 18px;
  display:flex;
  flex-direction:column;
  gap: 12px;
  position:relative;
  overflow:hidden;
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
  color: var(--foreground-tertiary);
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
  border:1px solid var(--border);
  background: var(--surface-muted);
  display:grid;
  place-items:center;
  cursor:pointer;
  color: var(--foreground-secondary);
  z-index:1;
  appearance:none;
  -webkit-tap-highlight-color: transparent;
  transition: background .15s ease, color .15s ease, transform .08s ease;
}
.expand-btn:hover{ border-color: var(--border-strong); color: var(--foreground-primary); }
.expand-btn:active{ transform: scale(.92); }
.expand-btn:focus-visible{ outline:none; box-shadow: var(--focus); }

.cardbody{ z-index:1; }
.p{
  margin:0;
  color: var(--foreground-primary);
  font-size: var(--text-base);
  line-height: 1.55;
}
.muted{
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

ul{
  margin: 0;
  padding-left: 18px;
  font-size: var(--text-base);
  line-height: 1.55;
  color: var(--foreground-primary);
}
li{ margin: 7px 0; }

.callout{
  margin-top:auto;
  border-radius: var(--radius-lg);
  border:1px solid var(--border);
  background: var(--surface-muted);
  padding: 12px 12px;
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  line-height: 1.45;
  z-index:1;
}
.callout strong{ color: var(--foreground-primary); }

.checkrow{
  display:flex;
  gap:10px;
  align-items:center;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  border:1px solid var(--border);
  background: var(--surface-muted);
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
  color: var(--foreground-primary);
  line-height: 1.25;
}

.bottombar,
.expanded-steps-footer{
  border-top: 1px solid var(--border);
  background: var(--chrome-footer-fill);
}
.bottombar{
  position: sticky;
  bottom:0;
  z-index: 10;
  backdrop-filter: blur(12px);
}
.expanded-steps-footer{
  flex: 0 0 auto;
  backdrop-filter: blur(14px);
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
  gap:8px;
  align-items:center;
}

.swiper-pagination-bullets.swiper-pagination-horizontal{ bottom: 8px; }
.swiper-pagination-bullet{
  width: 8px; height: 8px;
  background: var(--border-strong);
  opacity: 1;
}
.swiper-pagination-bullet-active{
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

dialog{
  width: min(520px, calc(100vw - 28px));
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--background-secondary);
  color: var(--foreground-primary);
  box-shadow: var(--shadow-elevated);
  padding: 0;
  overflow:hidden;
}
dialog::backdrop{
  background: rgba(0,0,0,.4);
  backdrop-filter: blur(2px);
}
dialog.expanded-steps-dialog{
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
  background: var(--background-primary);
  box-shadow: none;
}
dialog.expanded-steps-dialog:not([open]){ display: none; }
dialog.expanded-steps-dialog::backdrop{ background: rgba(0,0,0,.38); backdrop-filter: none; }
.expanded-steps-header{
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 14px;
  padding-right: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  background: var(--chrome-header-bg);
  backdrop-filter: blur(14px);
}
#dlg .expanded-steps-header{ justify-content: space-between; }
.expanded-steps-swiper{
  flex: 1;
  min-height: 0;
  overflow: hidden;
  touch-action: pan-y;
}
.expanded-steps-swiper .swiper-slide{
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
/* Reading scale on pane only (no universal * — compounds nested lists). */
.expanded-step-pane{
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  margin: 0 auto;
  font-size: 110%;
}
.expanded-step-pane .h{
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.2px;
}
.expanded-step-pane .kicker{
  font-size: var(--text-xs);
}
.expanded-step-pane .p{
  font-size: 1em;
}
.expanded-step-pane ul{
  font-size: 1em;
}
.expanded-step-pane .callout{
  font-size: 0.875em;
}
.expanded-step-pane .printnote{
  margin: 0;
  font-size: 0.875em;
}
.expanded-step-pane .checkrow label{
  font-size: 0.875em;
}
.expanded-steps-body{
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.x{
  width: 40px; height: 40px;
  border-radius: 14px;
  border:1px solid var(--border);
  background: var(--surface-muted);
  color: var(--foreground-primary);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  padding:0;
}
.x .icon-close{ width:22px; height:22px; }
.x:focus-visible{ outline:none; box-shadow: var(--focus); }

.printnote{
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  line-height:1.45;
}

/* ── Dialog toggle ────────────────────────────── */
.dlg-toggle{
  display: flex;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}
.dlg-toggle-btn{
  appearance: none;
  border: none;
  background: transparent;
  font-family: var(--font);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--foreground-tertiary);
  padding: 6px 14px;
  border-radius: calc(var(--radius-md) - 3px);
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;
}
.dlg-toggle-btn.active{
  background: var(--accent);
  color: #1a1200;
  box-shadow: 0 1px 4px rgba(0,0,0,.18);
}
.hidden-view{ display: none; }

/* ── Shopping list ────────────────────────────── */
.shop-list{
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.shop-item{
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  margin: 0; 
  margin-top: -1px;
  border: 1px solid var(--border);
  background: var(--surface-muted);
}
.shop-item input[type="checkbox"]{
  width: 24px;
  height: 24px;
  margin-top: 6px;
  accent-color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
}
.shop-item label{
  cursor: pointer;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--foreground-primary);
  line-height: 1.35;
}
.shop-item .subs{
  display: block;
  font-weight: 400;
  color: var(--foreground-tertiary);
  font-size: var(--text-xs);
  margin-top: 2px;
}

/* ── Per-step measurements ────────────────────── */
.measures{
  margin-top: 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-muted);
  overflow: hidden;
}
.measures-heading{
  margin: 0;
  padding: 8px 12px 6px;
  font-size: var(--text-xs);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--foreground-tertiary);
}
.measures-grid{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;
}
.measures-row{
  display: contents;
}
.measures-row > span{
  padding: 6px 12px;
  font-size: var(--text-sm);
  line-height: 1.35;
  border-top: 1px solid var(--border);
}
.measures-item{
  color: var(--foreground-primary);
  font-weight: 600;
}
.measures-qty{
  color: var(--foreground-secondary);
  text-align: right;
  white-space: nowrap;
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

// Heroicons v2 outline (MIT) — https://heroicons.com/
const HI_O =
  'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"';
const HI = {
  chevronLeft: `<svg class="icon" ${HI_O} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>`,
  chevronRight: `<svg class="icon" ${HI_O} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>`,
  arrowsPointingOut: `<svg class="icon icon-expand" ${HI_O} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>`,
  xMark: `<svg class="icon icon-close" ${HI_O} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`,
  queueList: `<svg class="icon icon-inline" ${HI_O} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 4.5h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 4.5h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`
};

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

function renderMeasurements(measurements) {
  if (!measurements?.length) return "";
  const rows = measurements.map(m =>
    `<span class="measures-row"><span class="measures-item">${m.item}</span><span class="measures-qty">${m.qty}</span></span>`
  ).join("\n");
  return `<div class="measures">
          <p class="measures-heading">Measurements</p>
          <div class="measures-grid">${rows}</div>
        </div>`;
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
  const measures = renderMeasurements(slide.measurements);

  return `
          <section class="swiper-slide">
            <article class="card">
              <div class="cardhead">
                <div>
                  <p class="kicker">${slide.kicker}</p>
                  <h2 class="h">${slide.title}</h2>
                </div>
                <button class="expand-btn" type="button" aria-label="View fullscreen">
                  ${HI.arrowsPointingOut}
                </button>
              </div>

              <div class="cardbody">
                ${checkbox}
        ${body}
        ${measures}
              </div>
            </article>
          </section>`.trimStart();
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function buildHTML(recipe) {
  const chips = recipe.chips.map(renderChip).join("\n            ");
  const slides = recipe.slides.map((s, i) => renderSlide(s, i)).join("\n");
  const expandedSlidesHtml = recipe.slides.map((s, i) => {
    const checkbox = s.checkboxLabel
      ? `<div class="checkrow">
              <input id="fsc${i}" type="checkbox" />
              <label for="fsc${i}">${s.checkboxLabel}</label>
            </div>`
      : "";
    const body = s.body.map(renderBodyBlock).join("\n          ");
    const measures = renderMeasurements(s.measurements);
    return `          <div class="swiper-slide">
            <div class="expanded-step-pane">
              <p class="kicker">${s.kicker}</p>
              <h2 class="h">${s.title}</h2>
              <div class="cardbody">
                ${checkbox}
          ${body}
          ${measures}
              </div>
            </div>
          </div>`;
  }).join("\n");
  const ingredientItems = recipe.ingredients.items
    .map(i => `<li>${i}</li>`)
    .join("\n        ");
  const ingredientsNoteHtml = recipe.ingredients.note?.trim()
    ? `<p class="p printnote">${recipe.ingredients.note}</p>\n          `
    : "";
  const ingredientsCalloutHtml = recipe.ingredients.callout?.trim()
    ? `<div class="callout">${recipe.ingredients.callout}</div>`
    : "";

  const shoppingListHtml = recipe.ingredients.shoppingList?.length
    ? `<ul class="shop-list">
              ${recipe.ingredients.shoppingList.map((entry, i) => {
                const subs = entry.substitutes?.length
                  ? `<span class="subs">Substitutes: ${entry.substitutes.join(", ")}</span>`
                  : "";
                return `<li class="shop-item">
                <input id="shop${i}" type="checkbox" />
                <label for="shop${i}">${entry.item}${subs}</label>
              </li>`;
              }).join("\n              ")}
            </ul>`
    : "";

  const checkIds = recipe.slides
    .map((s, i) => s.checkboxLabel ? `"c${i}"` : null)
    .filter(Boolean);

  const shopIds = (recipe.ingredients.shoppingList || [])
    .map((_, i) => `"shop${i}"`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>${recipe.title}</title>
  <meta name="description" content="${escapeAttr(recipe.subtitle)}" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#18130d" id="metaTheme" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${escapeAttr(recipe.title)}" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <script>
    (function(){var t=localStorage.getItem("recipe_cards_theme_v1");if(t==="light"){document.documentElement.dataset.theme="light";document.getElementById("metaTheme").content="#ddd9ce";}})();
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
  <style>${CSS}</style>
</head>

<body>
  <div class="app">
    <header class="safe-top">
      <nav class="top-nav">
        <a class="btn btn-back" id="backToIndex" href="index.html" aria-label="Back to all recipes">${HI.chevronLeft}</a>
        <button class="btn primary" id="openIngredients" type="button" aria-label="Open ingredients">
          ${HI.queueList}<span>Ingredients</span>
        </button>
      </nav>
      <div class="topbar">
        <div class="brandrow">
          <div class="titlecluster">
            <div class="titlestack">
              <h1 class="title">${recipe.title}</h1>
              <p class="subtitle">${recipe.subtitle}</p>
            </div>
          </div>
        </div>

        <div class="chiprow">
          <div class="chips">
            ${chips}
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
          ${HI.chevronLeft}<span>Prev</span>
        </button>
        <button class="btn primary" id="next" type="button" aria-label="Next step">
          <span>Next</span>${HI.chevronRight}
        </button>
      </div>
    </div>
  </div>

  <dialog id="dlg" class="expanded-steps-dialog">
    <div class="expanded-steps-header safe-top">
      <div class="dlg-toggle" id="dlgToggle">
        <button class="dlg-toggle-btn active" data-mode="ingredients" type="button">Ingredients</button>
        <button class="dlg-toggle-btn" data-mode="shopping" type="button">Shopping List</button>
      </div>
      <button class="x" id="closeDlg" type="button" aria-label="Close">${HI.xMark}</button>
    </div>
    <div class="expanded-steps-body">
      <div class="expanded-step-pane">
        <div class="cardbody">
          <div id="ingredientsView">
            ${ingredientsNoteHtml}<ul>
              ${ingredientItems}
            </ul>
            ${ingredientsCalloutHtml}
          </div>
          <div id="shoppingView" class="hidden-view">
            ${shoppingListHtml}
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <dialog id="expandedStepsDialog" class="expanded-steps-dialog">
    <div class="expanded-steps-header safe-top">
      <button class="x" id="closeExpandedStepsDialog" type="button" aria-label="Close fullscreen">${HI.xMark}</button>
    </div>
    <div class="swiper expanded-steps-swiper">
      <div class="swiper-wrapper">
${expandedSlidesHtml}
      </div>
    </div>
    <div class="expanded-steps-footer safe-bot">
      <div class="nav">
        <button class="btn" id="expandedStepsPrev" type="button" aria-label="Previous step">${HI.chevronLeft}<span>Prev</span></button>
        <button class="btn primary" id="expandedStepsNext" type="button" aria-label="Next step"><span>Next</span>${HI.chevronRight}</button>
      </div>
    </div>
  </dialog>

  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    const CHECK_KEYS = [${checkIds.join(",")}];
    const SHOP_KEYS = [${shopIds.join(",")}];
    const LS_KEY = ${JSON.stringify(recipe.storageKey)};
    const LS_SHOP = LS_KEY + "_shop";

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

    function loadShop(){
      try{
        const saved = JSON.parse(localStorage.getItem(LS_SHOP) || "{}");
        SHOP_KEYS.forEach(id => {
          const el = document.getElementById(id);
          if(!el) return;
          el.checked = !!saved[id];
          el.addEventListener("change", () => {
            saved[id] = el.checked;
            localStorage.setItem(LS_SHOP, JSON.stringify(saved));
          });
        });
      }catch(e){}
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
    loadShop();

    document.getElementById("prev").addEventListener("click", () => swiper.slidePrev());
    document.getElementById("next").addEventListener("click", () => swiper.slideNext());

    const dlg = document.getElementById("dlg");
    const ingredientsView = document.getElementById("ingredientsView");
    const shoppingView = document.getElementById("shoppingView");
    const toggleBtns = document.querySelectorAll("#dlgToggle .dlg-toggle-btn");
    const LS_MODE = LS_KEY + "_mode";

    function setDlgMode(mode){
      toggleBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
      ingredientsView.classList.toggle("hidden-view", mode !== "ingredients");
      shoppingView.classList.toggle("hidden-view", mode !== "shopping");
      try{ localStorage.setItem(LS_MODE, mode); }catch(e){}
    }

    toggleBtns.forEach(b => b.addEventListener("click", () => setDlgMode(b.dataset.mode)));

    document.getElementById("openIngredients").addEventListener("click", () => {
      var saved = "ingredients";
      try{ saved = localStorage.getItem(LS_MODE) || "ingredients"; }catch(e){}
      setDlgMode(saved);
      document.documentElement.style.overflow = "hidden";
      dlg.showModal();
    });
    document.getElementById("closeDlg").addEventListener("click", () => dlg.close());
    dlg.addEventListener("close", () => {
      document.documentElement.style.overflow = "";
    });
    dlg.addEventListener("click", (e) => {
      if (e.target !== dlg) return;
      dlg.close();
    });

    const expandedStepsDialog = document.getElementById("expandedStepsDialog");
    const expandedStepsSwiper = new Swiper(".expanded-steps-swiper", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 260,
      threshold: 8,
      grabCursor: true,
      keyboard: { enabled: true },
      a11y: { enabled: true }
    });

    function updateExpandedStepsNav() {
      document.getElementById("expandedStepsPrev").disabled = expandedStepsSwiper.isBeginning;
      document.getElementById("expandedStepsNext").disabled = expandedStepsSwiper.isEnd;
    }
    expandedStepsSwiper.on("slideChange", () => {
      swiper.slideTo(expandedStepsSwiper.activeIndex, 0);
      updateExpandedStepsNav();
    });
    updateExpandedStepsNav();

    function openExpandedSteps(idx) {
      expandedStepsSwiper.slideTo(idx, 0);
      updateExpandedStepsNav();
      document.documentElement.style.overflow = "hidden";
      expandedStepsDialog.showModal();
    }
    function closeExpandedSteps() {
      expandedStepsDialog.close();
      document.documentElement.style.overflow = "";
    }

    document.querySelectorAll(".expand-btn").forEach(btn => {
      btn.addEventListener("click", () => openExpandedSteps(swiper.activeIndex));
    });
    document.getElementById("closeExpandedStepsDialog").addEventListener("click", closeExpandedSteps);
    document.getElementById("expandedStepsPrev").addEventListener("click", () => expandedStepsSwiper.slidePrev());
    document.getElementById("expandedStepsNext").addEventListener("click", () => expandedStepsSwiper.slideNext());
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
        <div class="arrow" aria-hidden="true">${HI.chevronRight}</div>
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
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>Recipe Cards</title>
  <meta name="description" content="Phone-optimized step-by-step recipe cards." />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#18130d" id="metaTheme" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Recipe Cards" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <script>
    (function(){var t=localStorage.getItem("recipe_cards_theme_v1");if(t==="light"){document.documentElement.dataset.theme="light";document.getElementById("metaTheme").content="#ddd9ce";}})();
  </script>
  <style>
    :root{
      --background-primary:#18130d;
      --background-secondary:#221c14;
      --foreground-primary:rgba(255,255,255,.93);
      --foreground-secondary:#c2bdb2;
      --foreground-tertiary:#9a9488;
      --accent:#ff8b00;
      --accent-glow:rgba(255,139,0,.18);
      --border:#3a3328;
      --border-strong:#504839;
      --surface-muted:#2a2318;
      --shadow-elevated:0 8px 24px rgba(0,0,0,.45);
      --radius-xl:26px; --radius-lg:20px;
      --font:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
      --text-xs:12px; --text-sm:14px; --text-base:16px; --text-2xl:24px;
    }
    html[data-theme="light"]{
      --background-primary:#ddd9ce;
      --background-secondary:#ece9e1;
      --foreground-primary:#1a1a17;
      --foreground-secondary:#4a4740;
      --foreground-tertiary:#7a766d;
      --accent:#d47400;
      --accent-glow:rgba(212,116,0,.14);
      --border:#c4bfb3;
      --border-strong:#a8a295;
      --surface-muted:#d5d0c5;
      --shadow-elevated:0 4px 12px rgba(0,0,0,.08);
    }
    *{ box-sizing:border-box; }
    html,body{ height:100%; margin:0; overflow-x:hidden; }
    body{
      font-family:var(--font); color:var(--foreground-primary);
      background:var(--background-primary);
      -webkit-font-smoothing:antialiased;
      min-height:100%;
    }
    .wrap{ max-width:560px; margin:0 auto; padding:24px 14px 40px; padding-top:max(24px,env(safe-area-inset-top)); }
    .page-header{
      display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
      margin-bottom:24px;
    }
    .page-title{
      font-size:28px; font-weight:900; margin:0 0 4px;
      letter-spacing:.2px; line-height:1.1;
    }
    .page-sub{ color:var(--foreground-secondary); font-size:var(--text-sm); margin:0; line-height:1.4; }
    .theme-toggle{
      flex:0 0 auto; position:relative;
      width:44px; height:24px; border-radius:999px; border:none; padding:0;
      background:var(--border); cursor:pointer;
      transition:background .2s ease;
    }
    .theme-toggle[aria-checked="true"]{ background:var(--accent); }
    .theme-toggle::after{
      content:""; position:absolute; top:2px; left:2px;
      width:20px; height:20px; border-radius:999px;
      background:var(--foreground-primary);
      transition:transform .2s ease;
    }
    .theme-toggle[aria-checked="true"]::after{
      transform:translateX(20px);
      background:#fff;
    }
    .list{ display:flex; flex-direction:column; gap:12px; }
    .icard{
      display:flex; flex-direction:column; gap:12px;
      border-radius:var(--radius-xl); border:1px solid var(--border);
      background:var(--background-secondary);
      box-shadow:var(--shadow-elevated);
      padding:16px 16px 14px;
      text-decoration:none; color:inherit;
      transition:border-color .18s ease, transform .08s ease;
    }
    .icard:hover{ border-color:var(--border-strong); transform:translateY(-1px); }
    .icard:active{ transform:scale(.99); }
    .icard-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .kicker{
      margin:0 0 4px; text-transform:uppercase; letter-spacing:.18em;
      color:var(--foreground-tertiary); font-size:11px; font-weight:900;
    }
    .h{ margin:0; font-size:var(--text-2xl); font-weight:900; line-height:1.1; }
    .muted{ margin:6px 0 0; color:var(--foreground-secondary); font-size:var(--text-sm); line-height:1.35; }
    .arrow{
      flex:0 0 auto; width:40px; height:40px; border-radius:16px;
      border:1px solid var(--border); background:var(--surface-muted);
      display:flex; align-items:center; justify-content:center; color:var(--foreground-primary);
    }
    .arrow .icon{ width:22px; height:22px; }
    .chips{ display:flex; gap:8px; flex-wrap:wrap; }
    .chip{
      display:inline-flex; align-items:center; gap:8px;
      border:1px solid var(--border); background:var(--surface-muted);
      border-radius:999px; padding:6px 10px;
      font-size:var(--text-xs); color:var(--foreground-secondary); white-space:nowrap;
    }
    .chip b{ color:var(--foreground-primary); font-weight:800; }
    .dot{
      width:8px; height:8px; border-radius:999px;
      background:var(--accent); box-shadow:0 0 0 4px var(--accent-glow);
    }
    .empty{ color:var(--foreground-secondary); font-size:var(--text-sm); text-align:center; padding:40px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="page-header">
      <div>
        <h1 class="page-title">Recipe Cards</h1>
        <p class="page-sub">Tap a recipe to open the step-by-step card view.</p>
      </div>
      <button class="theme-toggle" type="button" role="switch" aria-checked="false" aria-label="Use light theme" id="themeToggle"></button>
    </div>
    <div class="list">
${cards || '      <p class="empty">No recipes yet.</p>'}
    </div>
  </div>
  <script>
    (function(){
      var KEY="recipe_cards_theme_v1",DARK_BG="#18130d",LIGHT_BG="#ddd9ce";
      var html=document.documentElement,btn=document.getElementById("themeToggle"),meta=document.getElementById("metaTheme");
      function isLight(){return html.dataset.theme==="light";}
      btn.setAttribute("aria-checked",String(isLight()));
      btn.addEventListener("click",function(){
        var next=isLight()?"dark":"light";
        if(next==="light"){html.dataset.theme="light";}else{delete html.dataset.theme;}
        localStorage.setItem(KEY,next);
        btn.setAttribute("aria-checked",String(next==="light"));
        meta.content=next==="light"?LIGHT_BG:DARK_BG;
      });
    })();
  </script>
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
