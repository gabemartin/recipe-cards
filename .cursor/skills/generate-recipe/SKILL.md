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
- **Callouts**: Use for practical tips, common mistakes, or doneness cues. Not required on every slide -- only where genuinely useful.
- **Body blocks**: Use `p` for prose, `ul` for instruction lists (preferred for steps), `callout` for tips, `spacer` for visual breaks. See schema-reference.md for the type definitions.

**HTML in strings:** `<strong>`, `<em>`, `<br/>`, and HTML entities like `&amp;` are valid. Content is rendered as-is -- no escaping in body/ingredient fields.

### 3. Write the file

```bash
# Write the JSON to src/recipes/
# Example: src/recipes/chicken-piccata.json
```

After writing, verify the JSON is valid by reading it back.

### 4. Build

Run a full build to regenerate all HTML, the index page, and the manifest:

```bash
node generate.js
```

This produces `dist/{slug}.html` plus an updated `dist/index.html`.

### 5. Verify

After the build, confirm:
- [ ] `dist/{slug}.html` exists
- [ ] All required fields present: `title`, `subtitle`, `storageKey`, `chips`, `ingredients`, `slides`
- [ ] At least one slide has a `checkboxLabel`
- [ ] `storageKey` doesn't duplicate an existing recipe's key
- [ ] Ingredients list is non-empty

### 6. README

If the new recipe introduces any changes to the project structure or conventions, update `README.md` accordingly.

## Quick reference

Existing recipes for style reference:
- `src/recipes/chicken-piccata.json` -- 5 steps, pan sauce technique
- `src/recipes/lamb-breast-ribs.json` -- 7 steps, slow roast + crisp technique

Build commands:
- `node generate.js` -- full build (all recipes + index + manifest)
- `node generate.js src/recipes/foo.json` -- single recipe only (no index update)
- `npm run dev` -- dev server at localhost:4000 (rebuilds when recipe JSON / icons / generate.js change; refresh browser manually)
