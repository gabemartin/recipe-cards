# Recipe Cards

Phone-optimized swipeable step-by-step recipe cards. Each recipe is a JSON file — run one command to generate a fully self-contained HTML page.

**Live site:** https://gabemartin.github.io/recipe-cards/

## How it works

- `src/recipes/*.json` — recipe data files
- `generate.js` — reads JSON, outputs standalone HTML to `dist/`
- `dist/` — generated output (not committed; built by CI)

No npm dependencies. Pure Node.js.

## Local setup

**Requirements:** Node.js 18+

```bash
git clone https://github.com/gabemartin/recipe-cards.git
cd recipe-cards

# Build all recipes + index
node generate.js

# Open in browser
open dist/index.html
```

### Dev server (recommended for local development)

```bash
npm run dev
```

Starts a local server at `http://localhost:4000` that:

- Serves the `dist/` directory
- Watches `src/` and `generate.js` for changes
- Rebuilds automatically on save
- Live-reloads the browser (no manual refresh needed)

Override the port with `PORT=8080 npm run dev`.

To build a single recipe:

```bash
node generate.js src/recipes/lamb-breast-ribs.json
```

## Adding a new recipe

1. Copy an existing recipe as a starting point:
   ```bash
   cp src/recipes/lamb-breast-ribs.json src/recipes/my-recipe.json
   ```

2. Edit `my-recipe.json` — see the schema below.

3. Build and preview:
   ```bash
   node generate.js
   open dist/my-recipe.html
   ```

4. Commit and push — GitHub Actions will deploy automatically.

## Recipe JSON schema

```jsonc
{
  "title": "Recipe Title",
  "subtitle": "One-line description shown in the header.",
  "storageKey": "unique_key_v1",       // localStorage key for checkboxes

  "chips": [
    { "dot": true, "label": "Cut",    "value": "Lamb breast" },  // dot = accent dot
    {              "label": "Temp",   "value": "300°F" }
  ],

  "ingredients": {
    "heading": "Ingredients (Lamb)",
    "note": "Short note shown under the heading.",
    "items": [
      "<strong>1 lb something</strong>, prepared however"
    ],
    "callout": "<strong>Tip:</strong> anything worth highlighting."
  },

  "slides": [
    {
      // Overview slide — no checkbox
      "kicker": "Overview",
      "title": "What You're Making",
      "body": [ ... ]
    },
    {
      // Step slide — has a checkbox
      "kicker": "Step 1",
      "title": "Season + Score",
      "checkboxLabel": "Pat dry, score fat, season heavily",
      "body": [ ... ]
    }
  ]
}
```

### Body block types

| Type | Fields | Renders as |
|------|--------|------------|
| `p` | `html` | Paragraph |
| `ul` | `items[]` (HTML strings) | Bulleted list |
| `callout` | `html` | Highlighted callout box |
| `spacer` | _(none)_ | 10px vertical gap |

HTML is passed through as-is, so you can use `<strong>`, `<em>`, `&amp;`, etc.

## GitHub Pages setup

The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

**One-time setup after creating the repo:**

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the first deploy will run automatically

The live URL will be `https://<username>.github.io/recipe-cards/`.
