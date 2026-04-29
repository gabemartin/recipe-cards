#!/usr/bin/env node
/**
 * Recipe Card Generator
 * Usage: node generate.js src/recipes/my-recipe.json
 *        node generate.js          (builds all recipes in src/recipes/)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "fs";
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
  overflow-x:auto;
  overflow-y:hidden;
  -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
  -ms-overflow-style:none;
  overscroll-behavior-x:contain;
}
.chiprow::-webkit-scrollbar{ display:none; }

.chips{
  display:flex;
  gap:8px;
  flex-wrap:nowrap;
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
.copy-prompt-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:100%;
}
.copy-prompt-label{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.copy-prompt-btn[data-copied="true"]{
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}

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

.hero-wrap{
  padding: 0 14px 12px;
}
.hero-img{
  aspect-ratio: 16 / 10;
  width: 100%;
  max-height: 220px;
  overflow: hidden;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: var(--surface-muted);
}
.hero-img img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.hero-fallback{
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  background: linear-gradient(
    135deg,
    hsl(var(--hero-seed) 55% 38%),
    hsl(calc(var(--hero-seed) + 40) 52% 24%)
  );
}
.hero-fallback::before{
  content: attr(data-initial);
  font-size: clamp(44px, 16vw, 80px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.22);
  letter-spacing: -0.03em;
  line-height: 1;
  user-select: none;
  pointer-events: none;
}
html[data-theme="light"] .hero-fallback{
  background: linear-gradient(
    135deg,
    hsl(var(--hero-seed) 42% 52%),
    hsl(calc(var(--hero-seed) + 40) 38% 40%)
  );
}
html[data-theme="light"] .hero-fallback::before{
  color: rgba(0, 0, 0, 0.12);
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
.step-actions{
  margin-top: 14px;
  display:flex;
}
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
.copy-fallback-dialog{
  padding: 0;
}
.copy-fallback-dialog .copy-fallback-body{
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.copy-fallback-dialog .copy-fallback-title{
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 900;
}
.copy-fallback-dialog .copy-fallback-note{
  margin: 0;
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  line-height: 1.45;
}
.copy-fallback-dialog textarea{
  width: 100%;
  min-height: 280px;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
  color: var(--foreground-primary);
  padding: 12px;
  font: 16px/1.45 var(--mono);
}
.copy-fallback-actions{
  display: flex;
  gap: 10px;
}
.copy-fallback-actions .btn{
  flex: 1;
  justify-content: center;
}
.copy-fallback-actions .hidden-view{
  display: none;
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
  justify-content: space-between;
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
.pane-main{
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pane-sidebar{
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 768px) {
  .expanded-step-pane{
    flex-direction: row;
    align-items: flex-start;
    max-width: 1100px;
    gap: clamp(20px, 3vw, 40px);
    padding: clamp(16px, 2.5vw, 32px);
    font-size: clamp(100%, 1.8vw, 135%);
  }
  .expanded-step-pane .h{ font-size: clamp(var(--text-2xl), 3vw, var(--text-3xl)); }
  .expanded-step-pane .kicker{ font-size: var(--text-sm); }
  .pane-main{
    flex: 1;
    min-width: 0;
  }
  .pane-sidebar{
    width: clamp(260px, 32%, 380px);
    flex-shrink: 0;
    position: sticky;
    top: clamp(16px, 2.5vw, 32px);
    align-self: flex-start;
  }
  .pane-sidebar .measures-qty{
    white-space: normal;
  }
}
.pane-sidebar .callout{ margin-top: 0; }
.pane-sidebar .step-actions{ margin-top: 0; }
.pane-sidebar .measures{ margin-top: 0; }
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

.cook-timer{
  display: flex;
  align-items: center;
  gap: 10px;
}
.cook-timer-display{
  font-size: var(--text-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--foreground-primary);
  min-width: 48px;
}
.cook-timer-btn{
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 0 12px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-muted);
  color: var(--foreground-primary);
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.cook-timer-btn:focus-visible{ outline: none; box-shadow: var(--focus); }
.cook-timer-btn[data-state="running"]{
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

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
.measures-alts{
  display: block;
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--foreground-tertiary);
  margin-top: 1px;
}
.measures-qty{
  color: var(--foreground-secondary);
  text-align: right;
  white-space: nowrap;
}

.body-list {
  background: var(--background-secondary);
  padding: 24px 44px;
  border-radius: var(--radius-md);
  margin: 10px 0 10px 0;
}

@media (min-width: 640px) {
  .app{ max-width: 780px; }
  .title{ font-size: clamp(22px,3.5vw,30px); }
  .hero-img{ max-height: clamp(220px,28vw,360px); }
  .h{ font-size: clamp(24px,3.5vw,32px); }
  .p, ul{ font-size: var(--text-lg); }
}
@media print{
  body{ background:#fff; color:#000; }
  header,.bottombar,.swiper-pagination{ display:none !important; }
  .app{ max-width: 100%; }
  main{ padding: 0; }
  .card{ box-shadow:none; border:1px solid #ccc; background:#fff; color:#000; page-break-inside: avoid; }
  .muted,.callout,.chip{ color:#333 !important; }
  .expand-btn,.step-actions{ display:none !important; }
}
/* ── Pull-to-refresh ──────────────────────────────── */
#ptr{
  position:fixed;top:0;left:50%;z-index:200;
  width:44px;height:44px;border-radius:50%;
  background:var(--surface-muted);
  border:1px solid var(--border);
  box-shadow:var(--shadow-elevated);
  display:grid;place-items:center;
  pointer-events:none;
  transform:translate(-50%,-56px);
  color:var(--foreground-tertiary);
  transition:border-color .15s,color .15s;
}
#ptr.armed{
  border-color:color-mix(in srgb,var(--accent) 55%,transparent);
  color:var(--accent);
}
.ptr-icon{width:22px;height:22px;display:block;}
#ptr.refreshing .ptr-icon{animation:ptr-spin .7s linear infinite;}
@keyframes ptr-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
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

/** Deterministic hue 0–359 for gradient placeholders from slug. */
function slugHash(slug) {
  let h = 0;
  for (const c of String(slug || "")) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 360;
}

function titleInitial(title) {
  const t = String(title || "").trim();
  if (!t) return "?";
  try {
    const m = t.match(/\p{L}/u);
    if (m) return m[0].toUpperCase();
  } catch (_) {
    /* \p{L} unsupported — fall through */
  }
  const ch = t[0];
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
}

function renderRecipeHero(recipe, slug, imageFile) {
  if (imageFile) {
    return `<div class="hero-wrap">
      <div class="hero-img">
        <img src="images/${escapeAttr(imageFile)}" alt="${escapeAttr(recipe.title)}" loading="lazy" decoding="async" />
      </div>
    </div>`;
  }
  const initial = escapeAttr(titleInitial(recipe.title));
  const seed = slugHash(slug);
  return `<div class="hero-wrap">
    <div class="hero-img hero-fallback" data-initial="${initial}" style="--hero-seed:${seed}" role="img" aria-label="${escapeAttr(recipe.title)} — placeholder"></div>
  </div>`;
}

function renderIndexThumb(recipe, slug, imageFile) {
  if (imageFile) {
    return `<div class="icard-thumb">
      <img src="images/${escapeAttr(imageFile)}" alt="" loading="lazy" decoding="async" />
    </div>`;
  }
  const initial = escapeAttr(titleInitial(recipe.title));
  const seed = slugHash(slug);
  return `<div class="icard-thumb icard-thumb--fallback" data-initial="${initial}" style="--thumb-seed:${seed}" role="img" aria-label="${escapeAttr(recipe.title)} — placeholder"></div>`;
}

function renderBodyBlock(block) {
  switch (block.type) {
    case "p":
      return `<p class="p">${block.html}</p>`;
    case "ul":
      return `<ul class="body-list">${block.items.map(i => `<li>${i}</li>`).join("\n")}</ul>`;
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
  const rows = measurements.map(m => {
    const alts = m.alts?.length
      ? `<span class="measures-alts">Alternatives: ${m.alts.join(", ")}</span>`
      : "";
    return `<span class="measures-row"><span class="measures-item">${m.item}${alts}</span><span class="measures-qty">${m.qty}</span></span>`;
  }).join("\n");
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

function renderPromptButton({ label, kind, id = "", stepIndex = null, extraClass = "" }) {
  const className = ["btn", "copy-prompt-btn", extraClass].filter(Boolean).join(" ");
  const attrs = [
    `class="${className}"`,
    `type="button"`,
    `data-prompt-kind="${kind}"`,
    `data-default-label="${escapeAttr(label)}"`
  ];

  if (id) attrs.push(`id="${id}"`);
  if (stepIndex !== null) attrs.push(`data-step-index="${stepIndex}"`);

  return `<button ${attrs.join(" ")}><span class="copy-prompt-label">${label}</span></button>`;
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
  const promptButton = renderPromptButton({
    label: index === 0 ? "Copy Recipe Prompt" : "Copy Prompt",
    kind: index === 0 ? "start" : "step",
    stepIndex: index
  });

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
                <div class="step-actions">${promptButton}</div>
              </div>
            </article>
          </section>`.trimStart();
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function buildHTML(recipe, slug, imageFile) {
  const chips = recipe.chips.map(renderChip).join("\n            ");
  const slides = recipe.slides.map((s, i) => renderSlide(s, i)).join("\n");
  const expandedSlidesHtml = recipe.slides.map((s, i) => {
    const checkbox = s.checkboxLabel
      ? `<div class="checkrow">
              <input id="fsc${i}" type="checkbox" />
              <label for="fsc${i}">${s.checkboxLabel}</label>
            </div>`
      : "";
    const mainBody = s.body.filter(b => b.type !== "callout").map(renderBodyBlock).join("\n          ");
    const sidebarCallouts = s.body.filter(b => b.type === "callout").map(renderBodyBlock).join("\n          ");
    const measures = renderMeasurements(s.measurements);
    const promptButton = renderPromptButton({
      label: i === 0 ? "Copy Recipe Prompt" : "Copy Prompt",
      kind: i === 0 ? "start" : "step",
      stepIndex: i
    });
    return `          <div class="swiper-slide">
            <div class="expanded-step-pane">
              <div class="pane-main">
                <p class="kicker">${s.kicker}</p>
                <h2 class="h">${s.title}</h2>
                <div class="cardbody">
                  ${checkbox}
          ${mainBody}
                </div>
              </div>
              <div class="pane-sidebar">
                <div class="step-actions">${promptButton}</div>
          ${measures}
          ${sidebarCallouts}
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
  const recipeJson = JSON.stringify(recipe).replace(/</g, "\\u003c");
  const heroHtml = renderRecipeHero(recipe, slug, imageFile);

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>${recipe.title}</title>
  <meta name="description" content="${escapeAttr(recipe.subtitle)}" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#ddd9ce" id="metaTheme" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${escapeAttr(recipe.title)}" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <script>
    (function(){var t=localStorage.getItem("recipe_cards_theme_v1"),m=document.getElementById("metaTheme");if(t==="dark"){document.documentElement.removeAttribute("data-theme");m.content="#18130d";}else{document.documentElement.dataset.theme="light";m.content="#ddd9ce";}})();
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
  <style>${CSS}</style>
</head>

<body>
  <div id="ptr" aria-hidden="true"><svg class="ptr-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></div>
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
${heroHtml}

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
            ${ingredientsNoteHtml}
            <ul>
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
      <div class="cook-timer" id="cookTimer">
        <span class="cook-timer-display" id="cookTimerDisplay">0:00</span>
        <button class="cook-timer-btn" id="cookTimerBtn" data-state="idle" type="button" aria-label="Start timer">Start</button>
      </div>
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

  <dialog id="copyPromptDialog" class="copy-fallback-dialog">
    <div class="copy-fallback-body">
      <h2 class="copy-fallback-title">Copy Prompt</h2>
      <p class="copy-fallback-note">Automatic copy didn't work in this context. Tap Share / Copy, or press and hold in the text box to copy manually.</p>
      <textarea id="copyPromptText" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
      <div class="copy-fallback-actions">
        <button class="btn primary" id="sharePromptText" type="button">Share / Copy</button>
        <button class="btn" id="closeCopyPromptDialog" type="button">Done</button>
      </div>
    </div>
  </dialog>

  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    const RECIPE = ${recipeJson};
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

    function cleanText(value){
      return String(value || "")
        .replace(/\\r/g, "")
        .replace(/\\u00a0/g, " ")
        .replace(/[ \\t]+\\n/g, "\\n")
        .replace(/\\n[ \\t]+/g, "\\n")
        .replace(/[ \\t]{2,}/g, " ")
        .replace(/\\n{3,}/g, "\\n\\n")
        .trim();
    }

    function htmlToText(html){
      const temp = document.createElement("div");
      temp.innerHTML = html || "";
      return cleanText(temp.textContent || temp.innerText || "");
    }

    function loadSavedState(key){
      try{
        return JSON.parse(localStorage.getItem(key) || "{}") || {};
      }catch(e){
        return {};
      }
    }

    function formatMeasurement(measurement){
      const alts = measurement.alts?.length ? " (alternatives: " + measurement.alts.join(", ") + ")" : "";
      return measurement.item + ": " + measurement.qty + alts;
    }

    function getBlockLines(block){
      switch(block.type){
        case "p":
          return [htmlToText(block.html)];
        case "ul":
          return block.items.map(item => htmlToText(item));
        case "callout":
          return ["Callout: " + htmlToText(block.html)];
        default:
          return [];
      }
    }

    function getIngredientsLines(){
      const lines = [];
      if (RECIPE.ingredients.heading) lines.push("Heading: " + RECIPE.ingredients.heading);
      if (RECIPE.ingredients.note) lines.push("Note: " + htmlToText(RECIPE.ingredients.note));
      RECIPE.ingredients.items.forEach(item => {
        lines.push("- " + htmlToText(item));
      });
      if (RECIPE.ingredients.callout) lines.push("- Callout: " + htmlToText(RECIPE.ingredients.callout));
      return lines;
    }

    function getShoppingLines(shopState){
      return (RECIPE.ingredients.shoppingList || []).map((entry, index) => {
        const checked = shopState["shop" + index] ? "[x]" : "[ ]";
        const subs = entry.substitutes?.length ? " (substitutes: " + entry.substitutes.join(", ") + ")" : "";
        return checked + " " + entry.item + subs;
      });
    }

    function getCheckpointLines(checkState){
      return RECIPE.slides
        .map((slide, index) => {
          if (!slide.checkboxLabel) return "";
          const checked = checkState["c" + index] ? "[x]" : "[ ]";
          return checked + " " + slide.kicker + " - " + slide.title + ": " + slide.checkboxLabel;
        })
        .filter(Boolean);
    }

    function getStepsLines(currentIndex, checkState){
      return RECIPE.slides.map((slide, index) => {
        const lines = [];
        const current = index === currentIndex ? " [CURRENT]" : "";

        lines.push((index + 1) + ". " + slide.kicker + " - " + slide.title + current);

        if (slide.checkboxLabel) {
          const checked = checkState["c" + index] ? "done" : "not done";
          lines.push("   Checkpoint: " + slide.checkboxLabel + " (" + checked + ")");
        }

        if (slide.measurements?.length) {
          lines.push("   Measurements:");
          slide.measurements.forEach(measurement => {
            lines.push("   - " + formatMeasurement(measurement));
          });
        }

        const blockLines = slide.body.flatMap(getBlockLines);
        if (blockLines.length) {
          lines.push("   Instructions:");
          blockLines.forEach(line => {
            lines.push("   - " + line);
          });
        }

        return lines.join("\\n");
      }).join("\\n\\n");
    }

    function buildPrompt(kind, stepIndex){
      const checkState = loadSavedState(LS_KEY);
      const shopState = loadSavedState(LS_SHOP);
      const safeStepIndex = Math.max(0, Math.min(stepIndex ?? 0, RECIPE.slides.length - 1));
      const currentSlide = RECIPE.slides[safeStepIndex];
      const nextSlide = RECIPE.slides[safeStepIndex + 1];
      const lines = [];

      if (kind === "start") {
        lines.push("You are helping me start cooking this recipe.");
        lines.push("Use the recipe below as the source of truth unless I tell you I changed something.");
        lines.push("I have not started cooking yet, so help me prep, sequence the work, and answer questions as I go.");
      } else {
        lines.push("You are helping me cook this recipe and answer questions about my current step.");
        lines.push("Use the full recipe and my current position below as the source of truth unless I tell you I changed something.");
        lines.push("");
        lines.push("Current position:");
        lines.push("- I am on slide " + (safeStepIndex + 1) + " of " + RECIPE.slides.length + ".");
        lines.push("- Current step: " + currentSlide.kicker + " - " + currentSlide.title + ".");
        if (currentSlide.checkboxLabel) {
          lines.push("- Current checkpoint: " + currentSlide.checkboxLabel + " (" + (checkState["c" + safeStepIndex] ? "done" : "not done yet") + ").");
        }
        if (nextSlide) {
          lines.push("- Next step after this: " + nextSlide.kicker + " - " + nextSlide.title + ".");
        }
      }

      lines.push("");
      lines.push("Recipe: " + RECIPE.title);
      lines.push("Subtitle: " + RECIPE.subtitle);
      lines.push("");
      lines.push("Quick facts:");
      RECIPE.chips.forEach(chip => lines.push("- " + chip.label + ": " + chip.value));
      lines.push("");
      lines.push("Ingredients:");
      lines.push(...getIngredientsLines());

      const shoppingLines = getShoppingLines(shopState);
      if (shoppingLines.length) {
        lines.push("");
        lines.push("Shopping list status:");
        lines.push(...shoppingLines);
      }

      const checkpointLines = getCheckpointLines(checkState);
      if (checkpointLines.length) {
        lines.push("");
        lines.push("Checkpoint status:");
        lines.push(...checkpointLines);
      }

      lines.push("");
      lines.push("Recipe steps:");
      lines.push(getStepsLines(kind === "start" ? -1 : safeStepIndex, checkState));
      lines.push("");

      if (kind === "start") {
        lines.push('When I ask "what\\'s next?", tell me the first actions to take.');
        lines.push("If I share a photo later, judge it against the relevant step in this recipe.");
      } else {
        lines.push('When I ask "what\\'s next?", tell me the next actions from my current step.');
        lines.push("If I share a photo, judge whether it looks ready for this step and tell me whether to keep going or stop.");
      }

      return cleanText(lines.join("\\n"));
    }

    function shouldPreferLegacyCopy(){
      const ua = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
      return isIOS || isTouchMac;
    }

    function legacyCopyText(text){
      const textarea = document.createElement("textarea");
      const previousFocus = document.activeElement;
      const preferIOSSelection = shouldPreferLegacyCopy();

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      textarea.style.opacity = "0";
      textarea.style.fontSize = "16px";
      textarea.style.pointerEvents = "none";
      textarea.setAttribute("aria-hidden", "true");

      document.body.appendChild(textarea);
      if (preferIOSSelection) {
        const range = document.createRange();
        range.selectNodeContents(textarea);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, 999999);
      } else {
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
      }

      let copied = false;
      try{
        copied = document.execCommand("copy");
      }catch(e){}

      window.getSelection()?.removeAllRanges();
      textarea.remove();
      if (previousFocus?.focus) previousFocus.focus();
      if (!copied) throw new Error("Copy failed");
    }

    async function copyText(text){
      // Tier 1: ClipboardItem API — preserves Safari's user-gesture context even with a Promise
      if (window.isSecureContext && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        try{
          await navigator.clipboard.write([
            new ClipboardItem({ "text/plain": Promise.resolve(new Blob([text], { type: "text/plain" })) })
          ]);
          return;
        }catch(e){ console.warn("[copy] ClipboardItem failed:", e); }
      }

      // Tier 2: writeText — simpler, works in most secure contexts
      if (window.isSecureContext && navigator.clipboard?.writeText) {
        try{
          await navigator.clipboard.writeText(text);
          return;
        }catch(e){ console.warn("[copy] writeText failed:", e); }
      }

      // Tier 3: execCommand — legacy; throws if it returns false
      legacyCopyText(text);
    }

    function setButtonFeedback(button, label){
      const text = button.querySelector(".copy-prompt-label");
      if (!text) return;

      window.clearTimeout(button._copyTimer);
      button.dataset.copied = label === "Copied" ? "true" : "false";
      text.textContent = label;
      button._copyTimer = window.setTimeout(() => {
        text.textContent = button.dataset.defaultLabel || "Copy Prompt";
        button.dataset.copied = "false";
      }, 1800);
    }

    const copyPromptDialog = document.getElementById("copyPromptDialog");
    const copyPromptText = document.getElementById("copyPromptText");
    const sharePromptTextBtn = document.getElementById("sharePromptText");
    const closeCopyPromptDialogBtn = document.getElementById("closeCopyPromptDialog");
    let activePromptText = "";

    function openCopyPromptDialog(text){
      activePromptText = text;
      copyPromptText.value = text;
      sharePromptTextBtn.classList.toggle("hidden-view", typeof navigator.share !== "function");
      document.documentElement.style.overflow = "hidden";
      copyPromptDialog.showModal();
      copyPromptText.focus();
      copyPromptText.select();
      copyPromptText.setSelectionRange(0, copyPromptText.value.length);
    }

    function closeCopyPromptDialog(){
      copyPromptDialog.close();
      document.documentElement.style.overflow = "";
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

    // ── Stopwatch timer ─────────────────────────────────────────────────────
    const LS_TIMER = "cook_timer_v1";
    const TIMER_MAX_MS = 3600000;
    const cookTimerDisplay = document.getElementById("cookTimerDisplay");
    const cookTimerBtn = document.getElementById("cookTimerBtn");
    let timerRAF = null;

    function loadTimerState() {
      try { return JSON.parse(localStorage.getItem(LS_TIMER) || "null"); } catch(e) { return null; }
    }
    function saveTimerState(obj) {
      try { localStorage.setItem(LS_TIMER, JSON.stringify(obj)); } catch(e) {}
    }
    function clearTimerState() {
      try { localStorage.removeItem(LS_TIMER); } catch(e) {}
    }
    function fmtTimer(ms) {
      const s = Math.floor(Math.min(ms, TIMER_MAX_MS) / 1000);
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }
    function tickTimer() {
      const t = loadTimerState();
      if (!t || t.state !== "running") return;
      const elapsed = Date.now() - t.startEpoch;
      cookTimerDisplay.textContent = fmtTimer(elapsed);
      if (elapsed >= TIMER_MAX_MS) {
        saveTimerState({ state: "stopped", elapsed: TIMER_MAX_MS });
        applyTimerUI();
        return;
      }
      timerRAF = requestAnimationFrame(tickTimer);
    }
    function applyTimerUI() {
      cancelAnimationFrame(timerRAF);
      const t = loadTimerState();
      const state = t?.state || "idle";
      if (state === "running") {
        cookTimerDisplay.textContent = fmtTimer(Date.now() - t.startEpoch);
        cookTimerBtn.textContent = "Stop";
        cookTimerBtn.dataset.state = "running";
        timerRAF = requestAnimationFrame(tickTimer);
      } else if (state === "stopped") {
        cookTimerDisplay.textContent = fmtTimer(t.elapsed);
        cookTimerBtn.textContent = "Reset";
        cookTimerBtn.dataset.state = "stopped";
      } else {
        cookTimerDisplay.textContent = "0:00";
        cookTimerBtn.textContent = "Start";
        cookTimerBtn.dataset.state = "idle";
      }
    }
    cookTimerBtn.addEventListener("click", () => {
      const t = loadTimerState();
      const state = t?.state || "idle";
      if (state === "idle") {
        saveTimerState({ state: "running", startEpoch: Date.now() });
      } else if (state === "running") {
        saveTimerState({ state: "stopped", elapsed: Date.now() - t.startEpoch });
      } else {
        clearTimerState();
      }
      applyTimerUI();
    });
    // ────────────────────────────────────────────────────────────────────────

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
      applyTimerUI();
    }
    function closeExpandedSteps() {
      cancelAnimationFrame(timerRAF);
      expandedStepsDialog.close();
      document.documentElement.style.overflow = "";
    }

    document.querySelectorAll(".expand-btn").forEach(btn => {
      btn.addEventListener("click", () => openExpandedSteps(swiper.activeIndex));
    });
    document.getElementById("closeExpandedStepsDialog").addEventListener("click", closeExpandedSteps);
    document.getElementById("expandedStepsPrev").addEventListener("click", () => expandedStepsSwiper.slidePrev());
    document.getElementById("expandedStepsNext").addEventListener("click", () => expandedStepsSwiper.slideNext());
    closeCopyPromptDialogBtn.addEventListener("click", closeCopyPromptDialog);
    copyPromptDialog.addEventListener("click", (e) => {
      if (e.target !== copyPromptDialog) return;
      closeCopyPromptDialog();
    });
    sharePromptTextBtn.addEventListener("click", async () => {
      if (typeof navigator.share !== "function") return;
      try{
        await navigator.share({ title: RECIPE.title, text: activePromptText });
      }catch(e){}
    });

    document.querySelectorAll(".copy-prompt-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const kind = button.dataset.promptKind;
        const stepIndex = kind === "step"
          ? Number(button.dataset.stepIndex || (expandedStepsDialog.open ? expandedStepsSwiper.activeIndex : swiper.activeIndex))
          : null;
        const promptText = buildPrompt(kind, stepIndex);

        try{
          await copyText(promptText);
          setButtonFeedback(button, "Copied");
        }catch(e){
          console.warn("[copy] All clipboard methods failed, opening dialog:", e);
          openCopyPromptDialog(promptText);
        }
      });
    });

    // Pull to refresh
    (function(){
      var THRESHOLD=72,MAX_EXTRA=40;
      var ptr=document.getElementById("ptr");
      var startY=0,dragging=false,armed=false;
      function setY(dy){
        var extra=dy>THRESHOLD?Math.min(dy-THRESHOLD,MAX_EXTRA)*0.25:0;
        var t=Math.min(dy/THRESHOLD,1);
        ptr.style.transform="translate(-50%,"+(-56+68*t+extra)+"px)";
        armed=dy>=THRESHOLD;
        ptr.classList.toggle("armed",armed);
      }
      function reset(){
        ptr.style.transition="transform .25s ease";
        ptr.style.transform="translate(-50%,-56px)";
        ptr.classList.remove("armed");
        armed=false;
        setTimeout(function(){ptr.style.transition="";},250);
      }
      document.addEventListener("touchstart",function(e){
        if(window.scrollY>0)return;
        if(document.querySelector("dialog[open]"))return;
        startY=e.touches[0].clientY;
        dragging=false;
      },{passive:true});
      document.addEventListener("touchmove",function(e){
        if(document.querySelector("dialog[open]"))return;
        if(window.scrollY>0){dragging=false;return;}
        var dy=e.touches[0].clientY-startY;
        if(dy<=2){dragging=false;return;}
        dragging=true;
        setY(dy);
      },{passive:true});
      document.addEventListener("touchend",function(){
        if(!dragging)return;
        dragging=false;
        if(armed){ptr.classList.add("refreshing");setTimeout(function(){window.location.reload();},300);}
        else reset();
      });
    })();
  </script>
</body>
</html>`;
}

// ─── Index page ───────────────────────────────────────────────────────────────

function buildIndex(entries) {
  // entries: [{ name, recipe, imageFile }]
  const cards = entries.map(({ name, recipe, imageFile }) => {
    const stepCount = recipe.slides.filter(s => s.checkboxLabel).length;
    const chips = recipe.chips.slice(0, 3).map(renderChip).join("\n          ");
    const thumb = renderIndexThumb(recipe, name, imageFile);
    return `
    <a class="icard" href="${name}.html">
      ${thumb}
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
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>Recipe Cards</title>
  <meta name="description" content="Phone-optimized step-by-step recipe cards." />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#ddd9ce" id="metaTheme" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Recipe Cards" />
  <link rel="apple-touch-icon" href="icons/chef-icon.png" />
  <script>
    (function(){var t=localStorage.getItem("recipe_cards_theme_v1"),m=document.getElementById("metaTheme");if(t==="dark"){document.documentElement.removeAttribute("data-theme");m.content="#18130d";}else{document.documentElement.dataset.theme="light";m.content="#ddd9ce";}})();
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
    .wrap{ max-width:1200px; margin:0 auto; padding:clamp(20px,5vw,48px); padding-top:max(clamp(20px,5vw,48px),env(safe-area-inset-top)); padding-bottom:clamp(40px,6vw,64px); }
    .page-header{
      display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
      margin-bottom:24px;
    }
    .page-title{
      font-size:clamp(24px,4vw,42px); font-weight:900; margin:0 0 4px;
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
    .list{ display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr)); gap:clamp(10px,2vw,18px); }
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
    .icard-thumb{
      aspect-ratio:16/10;
      width:100%;
      max-height:clamp(140px,22vw,260px);
      border-radius:var(--radius-lg);
      overflow:hidden;
      border:1px solid var(--border);
      background:var(--surface-muted);
    }
    .icard-thumb img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .icard-thumb--fallback{
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      background:linear-gradient(135deg,hsl(var(--thumb-seed) 55% 38%),hsl(calc(var(--thumb-seed) + 40) 52% 24%));
    }
    .icard-thumb--fallback::before{
      content:attr(data-initial);
      font-size:clamp(28px,10vw,48px);
      font-weight:900;
      color:rgba(255,255,255,.22);
      letter-spacing:-.03em;
      line-height:1;
      user-select:none;
    }
    html[data-theme="light"] .icard-thumb--fallback{
      background:linear-gradient(135deg,hsl(var(--thumb-seed) 42% 52%),hsl(calc(var(--thumb-seed) + 40) 38% 40%));
    }
    html[data-theme="light"] .icard-thumb--fallback::before{
      color:rgba(0,0,0,.12);
    }
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
    .chips{ display:flex; gap:8px; flex-wrap:nowrap; overflow-x:auto; overflow-y:hidden; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; overscroll-behavior-x:contain; }
    .chips::-webkit-scrollbar{ display:none; }
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
    #ptr{position:fixed;top:0;left:50%;z-index:200;width:44px;height:44px;border-radius:50%;background:var(--surface-muted);border:1px solid var(--border);box-shadow:var(--shadow-elevated);display:grid;place-items:center;pointer-events:none;transform:translate(-50%,-56px);color:var(--foreground-tertiary);transition:border-color .15s,color .15s;}
    #ptr.armed{border-color:color-mix(in srgb,var(--accent) 55%,transparent);color:var(--accent);}
    .ptr-icon{width:22px;height:22px;display:block;}
    #ptr.refreshing .ptr-icon{animation:ptr-spin .7s linear infinite;}
    @keyframes ptr-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div id="ptr" aria-hidden="true"><svg class="ptr-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></div>
  <div class="wrap">
    <div class="page-header">
      <div>
        <h1 class="page-title">Recipe Cards</h1>
        <p class="page-sub">Tap a recipe to open the step-by-step card view.</p>
      </div>
      <button class="theme-toggle" type="button" role="switch" aria-checked="true" aria-label="Switch between light and dark theme" id="themeToggle"></button>
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
    (function(){
      var THRESHOLD=72,MAX_EXTRA=40;
      var ptr=document.getElementById("ptr");
      var startY=0,dragging=false,armed=false;
      function setY(dy){
        var extra=dy>THRESHOLD?Math.min(dy-THRESHOLD,MAX_EXTRA)*0.25:0;
        var t=Math.min(dy/THRESHOLD,1);
        ptr.style.transform="translate(-50%,"+(-56+68*t+extra)+"px)";
        armed=dy>=THRESHOLD;
        ptr.classList.toggle("armed",armed);
      }
      function reset(){
        ptr.style.transition="transform .25s ease";
        ptr.style.transform="translate(-50%,-56px)";
        ptr.classList.remove("armed");
        armed=false;
        setTimeout(function(){ptr.style.transition="";},250);
      }
      document.addEventListener("touchstart",function(e){
        if(window.scrollY>0)return;
        startY=e.touches[0].clientY;
        dragging=false;
      },{passive:true});
      document.addEventListener("touchmove",function(e){
        if(window.scrollY>0){dragging=false;return;}
        var dy=e.touches[0].clientY-startY;
        if(dy<=2){dragging=false;return;}
        dragging=true;
        setY(dy);
      },{passive:true});
      document.addEventListener("touchend",function(){
        if(!dragging)return;
        dragging=false;
        if(armed){ptr.classList.add("refreshing");setTimeout(function(){window.location.reload();},300);}
        else reset();
      });
    })();
  </script>
</body>
</html>`;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const CACHED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function findLocalCachedImage(slug) {
  const dir = join(__dirname, "src", "images");
  if (!existsSync(dir)) return null;
  for (const ext of CACHED_IMAGE_EXTS) {
    const filename = `${slug}${ext}`;
    if (existsSync(join(dir, filename))) return filename;
  }
  return null;
}

function extFromContentType(ct) {
  const base = (ct || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif"
  };
  return map[base] || null;
}

function extFromImageUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const m = pathname.match(/\.(jpe?g|png|webp|avif|gif)(?:\?|$)/);
    if (!m) return ".jpg";
    const e = m[1];
    return e === "jpeg" || e === "jpg" ? ".jpg" : `.${e}`;
  } catch (_) {
    return ".jpg";
  }
}

/** Resolve `src/images/<slug>.<ext>`: use existing cache, else fetch `recipe.image` once into the repo. */
async function resolveImage(slug, recipe) {
  const existing = findLocalCachedImage(slug);
  if (existing) return existing;

  const raw = recipe?.image;
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url || !/^https?:\/\//i.test(url)) return null;

  const imagesDir = join(__dirname, "src", "images");
  mkdirSync(imagesDir, { recursive: true });

  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (e) {
    console.warn(`  ⚠ Could not fetch image for "${slug}": ${e.message || e}`);
    return null;
  }
  if (!res.ok) {
    console.warn(`  ⚠ Could not fetch image for "${slug}": HTTP ${res.status}`);
    return null;
  }

  const ct = res.headers.get("content-type") || "";
  const ext = extFromContentType(ct) || extFromImageUrl(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `${slug}${ext}`;
  writeFileSync(join(imagesDir, filename), buffer);
  console.log(`  ✓ cached image → src/images/${filename}`);
  return filename;
}

function copyImagesToDist(outDir) {
  const srcImagesDir = join(__dirname, "src", "images");
  if (!existsSync(srcImagesDir)) return;
  const outImagesDir = join(outDir, "images");
  mkdirSync(outImagesDir, { recursive: true });
  for (const f of readdirSync(srcImagesDir)) {
    if (f === ".gitkeep" || f.startsWith(".")) continue;
    const abs = join(srcImagesDir, f);
    if (!statSync(abs).isFile()) continue;
    writeFileSync(join(outImagesDir, f), readFileSync(abs));
  }
  console.log("  ✓ images/");
}

async function processFile(src) {
  const recipe = JSON.parse(readFileSync(src, "utf8"));
  const name = basename(src, ".json");
  const imageFile = await resolveImage(name, recipe);
  const outDir = join(__dirname, "dist");
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${name}.html`);
  writeFileSync(out, buildHTML(recipe, name, imageFile), "utf8");
  console.log(`  ✓ ${src} → dist/${name}.html`);
  return { name, recipe, imageFile };
}

async function main() {
  const args = process.argv.slice(2);
  const outDir = join(__dirname, "dist");

  if (args.length > 0) {
    for (const src of args) {
      await processFile(src);
    }
    copyImagesToDist(outDir);
    return;
  }

  const recipesDir = join(__dirname, "src", "recipes");
  const files = readdirSync(recipesDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No recipe JSON files found in src/recipes/");
    return;
  }

  const entries = [];
  for (const f of files) {
    entries.push(await processFile(join(recipesDir, f)));
  }

  writeFileSync(join(outDir, "index.html"), buildIndex(entries), "utf8");
  console.log(`  ✓ index → dist/index.html (${entries.length} recipe${entries.length === 1 ? "" : "s"})`);

  const manifest = {
    name: "Recipe Cards",
    short_name: "Recipes",
    description: "Phone-optimized step-by-step recipe cards.",
    start_url: "./index.html",
    display: "standalone",
    background_color: "#ddd9ce",
    theme_color: "#ddd9ce",
    icons: [
      { src: "icons/chef-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "icons/chef-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      { src: "icons/chef-icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  };
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log("  ✓ manifest.json");

  const srcIconsDir = join(__dirname, "src", "icons");
  if (existsSync(srcIconsDir)) {
    const outIconsDir = join(outDir, "icons");
    mkdirSync(outIconsDir, { recursive: true });
    readdirSync(srcIconsDir).forEach(f => {
      writeFileSync(join(outIconsDir, f), readFileSync(join(srcIconsDir, f)));
    });
    console.log("  ✓ icons/");
  }

  copyImagesToDist(outDir);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
