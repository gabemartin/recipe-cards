# UI Style — Recipe Card Design Reference

## Stack

- Pure HTML/CSS/JS — no framework
- All styles are inlined in `generate.js` as the `CSS` string constant (lines ~16–1004)
- Dark/light mode via `html[data-theme="light"]` attribute; toggled client-side with `localStorage`
- Mobile-first; max-width 560px (card layout), 780px+ gets slightly larger type
- Swiper 11 CDN for the carousel

---

## Color Tokens

### Dark mode (default)

| Token | Value | Usage |
|---|---|---|
| `--background-primary` | `#18130d` | Page background |
| `--background-secondary` | `#221c14` | Card backgrounds |
| `--foreground-primary` | `rgba(255,255,255,.93)` | Body text, headings |
| `--foreground-secondary` | `#c2bdb2` | Subtitles, notes, muted text |
| `--foreground-tertiary` | `#9a9488` | Kickers, labels, placeholders |
| `--accent` | `#ff8b00` | Orange — primary CTA, progress bar, dot |
| `--accent-dark` | `#ff5800` | Gradient endpoint for accent |
| `--accent-glow` | `rgba(255,139,0,.18)` | Glow behind active pagination dot |
| `--border` | `#3a3328` | Default border on cards/chips |
| `--border-strong` | `#504839` | Hover/focus border |
| `--surface-muted` | `#2a2318` | Chip backgrounds, input fills |
| `--shadow-elevated` | `0 8px 24px rgba(0,0,0,.45)` | Card and button shadow |
| `--chrome-header-bg` | `rgba(24,19,13,.88)` | Sticky header blur background |
| `--chrome-footer-fill` | gradient `rgba(24,19,13,.94→.65)` | Footer blur background |

### Light mode overrides (`html[data-theme="light"]`)

| Token | Value |
|---|---|
| `--background-primary` | `#ddd9ce` |
| `--background-secondary` | `#ece9e1` |
| `--foreground-primary` | `#1a1a17` |
| `--accent` | `#d47400` |
| `--border` | `#c4bfb3` |

---

## Typography Scale

| Token | Value | Used for |
|---|---|---|
| `--text-xs` | 12px | Kickers, chip labels, shopping sub-labels |
| `--text-sm` | 14px | Buttons, callouts, check labels, notes |
| `--text-base` | 16px | Body text, bullet lists |
| `--text-lg` | 18px | Dialog headings, timer display |
| `--text-xl` | 20px | Expanded step headings |
| `--text-2xl` | 24px | Card step headings (`.h`), shopping item labels |
| `--text-3xl` | 30px | Large breakpoint heading override |

**Font stack:** `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
**Mono stack:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` — used for progress counter

**Heading weight:** 900 (`.h`, `.title`)
**Button weight:** 800 (`.btn`)
**Kicker:** 11px, weight 900, `text-transform: uppercase`, `letter-spacing: .18em`

---

## Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--radius-xl` | 26px | Recipe cards, hero image, main dialogs |
| `--radius-lg` | 20px | Callout boxes, checkrow, measures block |
| `--radius-md` | 16px | Ingredient/shopping toggle, shopping list items |

---

## Components

### `.btn` (base button)
- Border: `1px solid var(--border)`
- Background: `var(--surface-muted)`
- Padding: `10px 12px`, border-radius `14px`
- On hover: `border-color: var(--border-strong)`
- On active: `transform: scale(.985)`
- Focus ring: `box-shadow: var(--shadow-elevated), var(--focus)`

### `.btn.primary`
- Background: linear gradient from `color-mix(accent 22%)` to `color-mix(accent-dark 12%)`
- Border: `color-mix(accent 35%, transparent)`
- Used for: Next step button, Ingredients button

### `.chip`
- Pill shape (`border-radius: 999px`)
- Font: 12px, `var(--foreground-secondary)`
- Label in `<b>` → `var(--foreground-primary)`
- Optional `.dot` prefix: 8px circle, `var(--accent)` with `var(--accent-glow)` ring

### `.callout`
- Background: `var(--surface-muted)`, border: `var(--border)`
- Border-radius: `--radius-lg`
- Font: 14px, `var(--foreground-secondary)`
- `<strong>` inside callouts → `var(--foreground-primary)`
- Used for tips, warnings, doneness cues

### `.measures` (per-step measurement table)
- 2-column grid: ingredient name (left) + quantity (right, `text-align: right`, `white-space: nowrap`)
- Heading: 12px uppercase, `var(--foreground-tertiary)`
- Alts line: 12px, `var(--foreground-tertiary)`, shown below item name
- All rows separated by `border-top: 1px solid var(--border)`

### `.shop-item` (shopping list)
- Full-width item rows with 24px checkbox + label
- Label font: `var(--text-2xl)` (24px), weight 700
- Substitutes sub-label: 12px, `var(--foreground-tertiary)`

### `.checkrow` (step checkbox)
- 18px checkbox, `accent-color: var(--accent)`
- Label: 14px, weight 800

### `.copy-prompt-btn`
- Full-width, same `.btn` base
- `data-copied="true"` state: `border-color: color-mix(accent 45%, transparent)`
- Feedback text swaps for 1.8 seconds then reverts

### `#copyImagePrompt` (image prompt button)
- Same `.btn` base (no `.primary`)
- Appears in top nav only when `recipe.imagePrompt` is set
- On click: assembles `IMAGE_STYLE + "\n\n" + RECIPE.imagePrompt`, copies to clipboard
- Feedback: `"✓ Copied"` for 1.8s then reverts to `"📷 Prompt"`

---

## Layout Structure

```
<header class="safe-top">        ← sticky, backdrop-blur
  <nav class="top-nav">          ← flex, space-between
    [← back]  [.top-nav-actions: [📷 Prompt?] [Ingredients]]
  <div class="topbar">           ← title + subtitle + chips
  <div class="progresswrap">     ← progress bar + "1 / 5" counter

<div class="hero-wrap">          ← 16:10 aspect, max-height 220px
  [img or gradient fallback]

<main>
  <div class="swiper main-swiper">
    <section class="swiper-slide">
      <article class="card">
        .cardhead: kicker + h2 + expand button
        .cardbody: checkbox? + body blocks + measures + .step-actions

<div class="bottombar safe-bot">  ← sticky bottom, backdrop-blur
  .nav: [Prev] [Next]
  .tabbar: pin toggle + pinned recipe tabs
```

---

## Safe Area Handling

```css
.safe-top { padding-top: max(14px, env(safe-area-inset-top)); }
.safe-bot { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
```

Both the sticky header and sticky footer use these classes. Dialog headers also use `.safe-top` when fullscreen.

---

## Dark/Light Theme Toggle

Theme is persisted in `localStorage` under `"recipe_cards_theme_v1"`.

- `"dark"` → remove `data-theme` attribute from `<html>`, set `<meta name="theme-color">` to `#18130d`
- `"light"` → set `data-theme="light"` on `<html>`, set meta theme-color to `#ddd9ce`

No theme toggle button is present in the current UI — it must be added if needed. The persistence key is `recipe_cards_theme_v1`.

---

## Hero Image Fallback

When no `src/images/<slug>.*` file exists and no `image` URL is in the recipe JSON:

- Gradient placeholder: `hsl(seed 55% 38%)` → `hsl(seed+40 42% 24%)` (dark mode)
- Seed is a deterministic hash of the recipe slug → consistent across builds
- Large initial letter overlaid: `rgba(255,255,255,0.22)`, font-size `clamp(44px, 16vw, 80px)`

---

## Known Constraints

- No npm dependencies — `generate.js` is pure Node ESM, no install
- `dist/` is gitignored — GitHub Actions deploys from a build step
- Swiper is CDN-loaded in the HTML (not bundled)
- iOS / Safari require the three-tier copy fallback (ClipboardItem → writeText → execCommand)
- `viewport-fit=cover` + `maximum-scale=1` is intentional for the app-shell feel
- `touch-action: pan-y` on swipers prevents accidental horizontal swipe conflicts
