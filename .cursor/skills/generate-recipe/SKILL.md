---
name: generate-recipe
description: >-
  Generate new recipe JSON files from any input: pasted URLs, conversation
  transcripts, photos of printed recipes, or raw text. Use when the user says
  "create a new recipe", "add recipe", "generate recipe", pastes a recipe URL,
  or shares recipe content in any format.
---

# Generate Recipe

Create a new recipe card by extracting data from any input and producing a valid JSON file in `src/recipes/`.

## Input handling

Accept whatever the user provides and normalize it into recipe data:

| Input type | How to handle |
|---|---|
| **URL** | Fetch the page with WebFetch, extract title, ingredients, and steps from the content |
| **Conversation / transcript** | Parse the text for recipe name, ingredients, and step-by-step instructions |
| **Image** (photo of cookbook, magazine, printout) | Read visible text and structure from the image |
| **Raw text** | Parse directly for recipe details |

If the input is ambiguous or incomplete, ask the user to clarify before generating. Prefer extracting what's available and confirming gaps rather than inventing content.

## Generation workflow

### 1. Extract recipe data

From the input, identify:
- Recipe title and one-line description
- Ingredient list with quantities
- Step-by-step cooking instructions
- Key metadata (protein, serving size, temps, times)

### 2. Build the JSON

Read [schema-reference.md](schema-reference.md) for the complete field reference and a full annotated example.

**Naming conventions:**

| Item | Convention | Example |
|---|---|---|
| Filename | kebab-case | `chicken-piccata.json` |
| `storageKey` | snake_case + `_checks_v1` | `chicken_piccata_checks_v1` |

**Structural rules:**

- **Slide 0** is always the Overview: `kicker: "Overview"`, `title: "What You're Making"`, no `checkboxLabel`. Include a short description paragraph, a spacer, a bulleted summary of the steps, and a callout with a key tip.
- **Slides 1+** are cooking steps: `kicker: "Step N"`, each **must** have a `checkboxLabel` (short imperative phrase summarizing the step).
- **Chips**: 3-4 total. First chip gets `"dot": true` for the primary identifier (usually the protein or main ingredient). Remaining chips cover serving size, key technique, or accompaniment.
- **Ingredients**: Each item uses `<strong>` around the quantity and ingredient name. Optional prep notes follow outside the strong tag.
- **Shopping list**: A simplified grocery-store version of the ingredients. Consolidate duplicates (e.g., "lemon zest" + "lemon juice" becomes "2 lemons"). Include `substitutes` array for ingredients that have common swaps. See schema-reference.md for the format.
- **Measurements per step**: Each step slide should include a `measurements` array listing the specific quantities used in that step. This renders as a compact reference table at the bottom of the card so the cook never has to flip back to the ingredients list. Only include measurements on steps that actually use measured ingredients -- skip technique-only steps (e.g., "Rest 20 minutes"). See schema-reference.md for the format.
- **Callouts**: Use for practical tips, common mistakes, or doneness cues. Not required on every slide -- only where genuinely useful.
- **Body blocks**: Use `p` for prose, `ul` for instruction lists (preferred for steps), `callout` for tips, `spacer` for visual breaks. See schema-reference.md for the type definitions.

**HTML in strings:** `<strong>`, `<em>`, `<br/>`, and HTML entities like `&amp;` are valid. Content is rendered as-is -- no escaping in body/ingredient fields.

**Hero image (optional):** When the source is a URL, set `"image": "https://..."` to the main finished-dish photo or the page’s `og:image` URL if that’s all that’s available. On the first `node generate.js` run, the build downloads it once into `src/images/<slug>.<ext>` (same kebab-case stem as the JSON filename, predictable extension from `Content-Type` or URL). That file is committed as the cache and is reused for both the recipe hero and the index thumbnail. If you omit `image` and there is no `src/images/<slug>.*` yet, the site shows a deterministic gradient + initial-letter placeholder until you add a URL or drop in an image file manually.

### 3. Write `imagePrompt` into the JSON

Before writing the file, generate the `imagePrompt` field and add it as the **second field** in the JSON (right after `"title"`).

The `imagePrompt` is a **2–4 sentence dish-specific subject paragraph** that describes only what the finished cooked dish looks like: real colors, real textures, honest doneness, how sauces pool or drip, what garnishes look like after cooking. It does **not** include photography terms, lighting, surface, camera angle, or props — the global house style in `generate.js` handles all of that.

**Rules:**
- Write as if a journalist is describing what they see on the plate
- Describe real doneness (medium-rare = rosy-red, not deep red; cream gravy = ivory-white)
- Note how sauces and glazes naturally behave (pool, drip, soak into starch)
- Include contrasting elements that make the dish visually interesting (dark crust / pale interior)
- No photography language whatsoever

**Reference:** `handoff/ART_DIRECTION.md` — "Subject Writing Rules" section

When the recipe card is built, this field powers the `📷 Prompt` button in the top nav. The button concatenates the global `IMAGE_STYLE` constant (in `generate.js`) with `recipe.imagePrompt` to produce the full prompt.

### 4. Write the file

```bash
# Write the JSON to src/recipes/
# Example: src/recipes/chicken-piccata.json
```

After writing, verify the JSON is valid by reading it back.

### 5. Build

Run a full build to regenerate all HTML, the index page, and the manifest:

```bash
node generate.js
```

This produces `dist/{slug}.html` plus an updated `dist/index.html`, copies `src/images/` to `dist/images/`, and may create a new cached file under `src/images/` when `image` is set.

### 6. Verify

After the build, confirm:
- [ ] `dist/{slug}.html` exists
- [ ] All required fields present: `title`, `imagePrompt`, `subtitle`, `storageKey`, `chips`, `ingredients`, `slides`
- [ ] At least one slide has a `checkboxLabel`
- [ ] `storageKey` doesn't duplicate an existing recipe's key
- [ ] Ingredients list is non-empty
- [ ] `📷 Prompt` button appears in the top nav of the built HTML

### 7. README

If the new recipe introduces any changes to the project structure or conventions, update `README.md` accordingly.

## Quick reference

Existing recipes for style reference:
- `src/recipes/chicken-piccata.json` -- 5 steps, pan sauce technique
- `src/recipes/lamb-breast-ribs.json` -- 7 steps, slow roast + crisp technique

Build commands:
- `node generate.js` -- full build (all recipes + index + manifest)
- `node generate.js src/recipes/foo.json` -- single recipe only (no index update)
- `npm run dev` -- dev server at localhost:4000 (rebuilds when recipe JSON / icons / recipe images / generate.js change; refresh browser manually)
