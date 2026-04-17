## Commands

```bash
npm run build          # Generate all dist/*.html from src/recipes/*.json
npm run dev            # Dev server at http://localhost:4000 + LAN URL (rebuilds on change; refresh browser manually)
npm run build:watch    # Rebuild on file change (no live reload)
node generate.js src/recipes/foo.json  # Build a single recipe
```

## Architecture

```
src/recipes/*.json  →  generate.js  →  dist/*.html
src/icons/          →  dist/icons/   (PWA icons, referenced in manifest)
src/images/         →  dist/images/ (recipe hero + index thumbnails, named `<slug>.<ext>`)
```

- `generate.js` — sole build artifact; inlines all CSS, Swiper CDN JS, and wires up localStorage checkboxes into each HTML file
- `dev.js` — zero-dep HTTP server bound to `0.0.0.0` (accessible from other devices on the network); polls mtimes on recipe JSON, icons, recipe images, and `generate.js`, rebuilds on real edits (no auto browser reload; avoids macOS `fs.watch` rebuild loops)
- `dist/` is gitignored; GitHub Actions deploys it

## Recipe JSON Schema

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Card heading |
| `subtitle` | yes | One-liner below title |
| `storageKey` | yes | localStorage key for checkbox state (use `recipename_checks_v1`) |
| `image` | no | HTTPS URL of a hero photo; on first full build, `generate.js` downloads and saves `src/images/<slug>.<ext>`. Omit or drop a file manually there — if missing, a gradient placeholder is shown |
| `chips[]` | yes | Quick-info pills; first chip can have `"dot": true` |
| `ingredients.heading` | yes | |
| `ingredients.note` | no | Italicized note below heading |
| `ingredients.items[]` | yes | HTML strings |
| `ingredients.callout` | no | Highlighted callout box |
| `ingredients.shoppingList[]` | yes | Simplified grocery list: `{ "item": "2 lemons", "substitutes": ["Lime"] }` |
| `slides[]` | yes | Swiper slides |

**Slide fields:** `kicker` (small label), `title`, `checkboxLabel` (optional — renders a persistent checkbox), `measurements[]` (optional — per-step quantities: `{ "item": "Garlic", "qty": "3 cloves", "alts": ["Garlic paste"] }`), `body[]`

**Body block types:**
- `{ "type": "p", "html": "..." }` — paragraph
- `{ "type": "ul", "items": ["..."] }` — bullet list (HTML strings)
- `{ "type": "callout", "html": "..." }` — orange-bordered callout box
- `{ "type": "spacer" }` — vertical gap

## Recipe Generation

See `.cursor/skills/generate-recipe/SKILL.md` for the full workflow to create new recipes from URLs, images, or raw text.

## Gotchas

- No npm dependencies — `generate.js` is pure Node ESM, no install needed
- `dist/` is gitignored; run `npm run build` before testing locally
- Swiper is loaded from CDN in the generated HTML
- PORT env var overrides default 4000: `PORT=5000 npm run dev`
