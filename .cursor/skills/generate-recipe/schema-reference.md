# Recipe JSON Schema Reference

## Top-level fields

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Recipe name, used as page `<title>` and H1 |
| `subtitle` | string | yes | One-line description shown in the header and meta description |
| `storageKey` | string | yes | `localStorage` key for checkbox persistence. Format: `snake_case_checks_v1` |
| `chips` | array | yes | 3-4 quick-info pills shown in the header |
| `ingredients` | object | yes | Ingredients modal content |
| `slides` | array | yes | Swiper carousel slides (overview + steps) |

## Chips

```json
{ "dot": true, "label": "Protein", "value": "2 lbs chicken tenders" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `dot` | boolean | no | If `true`, renders an accent dot before the label. Use on the first chip only. |
| `label` | string | yes | Bold label (e.g., "Protein", "Serves", "Temp") |
| `value` | string | yes | Value text |

## Ingredients

```json
{
  "heading": "Ingredients (Lamb)",
  "note": "Short note shown under the heading.",
  "items": [
    "<strong>1 lb something</strong>, prepared however"
  ],
  "callout": "<strong>Tip:</strong> anything worth highlighting."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `heading` | string | yes | Modal heading |
| `note` | string | no | Note shown below the heading |
| `items` | string[] | yes | Each item is an HTML string. Wrap quantity + ingredient name in `<strong>`. |
| `callout` | string | no | Highlighted callout box at the bottom of the ingredient list |
| `shoppingList` | array | yes | Simplified grocery list with optional substitutes (see below) |

### Shopping list

The shopping list simplifies the detailed ingredient list into what you actually buy at the store. Consolidate related items (e.g., "lemon zest" and "lemon juice" become "2 lemons"). Include common substitutes where applicable.

```json
"shoppingList": [
  { "item": "2 lemons" },
  { "item": "Garlic (1 head)", "substitutes": ["Garlic paste", "Jarred minced garlic"] },
  { "item": "Angel hair pasta (8 oz)", "substitutes": ["Spaghettini", "Linguine"] }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `item` | string | yes | What to buy. Include quantity when relevant. Plain text (no HTML). |
| `substitutes` | string[] | no | Common substitutions. Only include when there are realistic swaps. |

**Rules for building the shopping list:**

- Consolidate: If a recipe uses lemon zest, lemon juice, and lemon garnish, list "3 lemons" (not three separate entries).
- Simplify: "4 tbsp butter (divided)" becomes "Butter (1 stick)". Think store packaging.
- Skip pantry staples that most kitchens already have (salt, pepper, olive oil) only if they appear in trivially small amounts. If the recipe uses a meaningful quantity, include them.
- Substitutes are for ingredients the shopper might not find or might prefer to swap. Common examples: fresh herb vs dried, specific pasta shape vs alternatives, specialty ingredients vs everyday alternatives.

## Slides

### Overview slide (always first)

```json
{
  "kicker": "Overview",
  "title": "What You're Making",
  "body": [...]
}
```

No `checkboxLabel` on the overview slide.

### Step slides

```json
{
  "kicker": "Step 1",
  "title": "Season + Score",
  "checkboxLabel": "Pat dry, score fat, season heavily",
  "measurements": [
    { "item": "Kosher salt", "qty": "~1½ tbsp" },
    { "item": "Black pepper", "qty": "~1 tsp" },
    { "item": "Oregano", "qty": "~1 tsp" },
    { "item": "Rosemary", "qty": "1 tbsp fresh", "alts": ["Dried rosemary (1 tsp)"] },
    { "item": "Garlic", "qty": "3–5 cloves", "alts": ["Garlic paste"] },
    { "item": "Lemon zest", "qty": "from 1 lemon" }
  ],
  "body": [...]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `kicker` | string | yes | Small uppercase label. `"Overview"` or `"Step N"`. |
| `title` | string | yes | Step title. Short and descriptive. |
| `checkboxLabel` | string | no | If set, renders a persistent checkbox. Required on all step slides. Short imperative phrase. |
| `measurements` | array | no | Per-step ingredient quantities. Renders as a compact reference table below the step body. |
| `body` | array | yes | Array of body blocks (see below) |

### Measurements

Each entry in `measurements` shows the quantity of an ingredient used in that specific step:

```json
{ "item": "Jalapeño", "qty": "1", "alts": ["Serrano", "Cayenne"] }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `item` | string | yes | Ingredient name. Plain text (no HTML). |
| `qty` | string | yes | Quantity used in this step specifically. |
| `alts` | string[] | no | Alternative ingredients (1-3 entries). Shown below the item name in the measurements table. |

**Rules:**

- Only add measurements to steps that use measured ingredients. Skip technique-only steps (rest, slice, plate).
- If an ingredient is split across steps (e.g., "4 tbsp butter, divided"), show the per-step amount (e.g., "2 tbsp" in one step, "2 tbsp" in another).
- Skip trivial amounts like "salt and pepper to taste" unless the recipe specifies a precise measurement.
- The Overview slide never gets measurements.
- Add `alts` for ingredients with genuine common swaps: fresh herbs (dried), specific peppers (other peppers), specific pasta shapes, specialty dairy, etc. Do not add alts for basic staples (salt, pepper, oil, butter, flour).

## Body block types

### Paragraph

```json
{ "type": "p", "html": "Descriptive text with <strong>bold</strong> for emphasis." }
```

### Bulleted list (preferred for step instructions)

```json
{ "type": "ul", "items": [
  "Do <strong>this thing</strong> first.",
  "Then do <strong>this</strong>."
]}
```

### Callout (tips, warnings, doneness cues)

```json
{ "type": "callout", "html": "<strong>Key rule:</strong> Explanation of why this matters." }
```

### Spacer (10px vertical gap)

```json
{ "type": "spacer" }
```

## Full example

```json
{
  "title": "Chicken Piccata",
  "subtitle": "Pan-seared tenders in a light lemon-caper butter sauce. Served over angel hair.",
  "storageKey": "chicken_piccata_checks_v1",
  "chips": [
    { "dot": true, "label": "Protein", "value": "2 lbs chicken tenders" },
    {              "label": "Serves",  "value": "~4" },
    {              "label": "Sauce",   "value": "Lemon + capers" },
    {              "label": "Pasta",   "value": "Angel hair" }
  ],
  "ingredients": {
    "heading": "Ingredients",
    "note": "Light, silky sauce—not thick like gravy. Lemon does the heavy lifting.",
    "items": [
      "<strong>2 lbs chicken tenders</strong> (or sliced breasts)",
      "<strong>1½–2 tsp kosher salt</strong>",
      "<strong>1–1½ tsp black pepper</strong>",
      "<strong>~¾ cup all-purpose flour</strong> (for dredging)",
      "<strong>2–3 tbsp olive oil</strong>",
      "<strong>4 tbsp butter</strong> (divided: 2 tbsp for searing, 2 tbsp for finishing)",
      "<strong>1–1½ tsp garlic</strong> (fresh minced or roasted paste)",
      "<strong>½ cup fresh lemon juice</strong>",
      "<strong>1½ cups chicken broth</strong> (bouillon + water is fine)",
      "<strong>3–4 tbsp capers</strong> (drained)",
      "<strong>~8 oz angel hair pasta</strong>",
      "Parmesan + parsley (optional, for serving)"
    ],
    "callout": "<strong>Key rule:</strong> Sauce should be light and silky—not heavy. If it's too thick, it's reduced too far.",
    "shoppingList": [
      { "item": "2 lbs chicken tenders", "substitutes": ["Boneless skinless chicken breasts, sliced thin"] },
      { "item": "Kosher salt" },
      { "item": "Black pepper" },
      { "item": "All-purpose flour" },
      { "item": "Olive oil" },
      { "item": "Butter (1 stick)" },
      { "item": "Garlic (1 head)", "substitutes": ["Garlic paste", "Jarred minced garlic"] },
      { "item": "3 lemons" },
      { "item": "Chicken broth (1 can/box)", "substitutes": ["Bouillon cubes + water"] },
      { "item": "Capers (1 jar)" },
      { "item": "Angel hair pasta (8 oz)", "substitutes": ["Spaghettini", "Linguine"] },
      { "item": "Parmesan (optional)" },
      { "item": "Fresh parsley (optional)" }
    ]
  },
  "slides": [
    {
      "kicker": "Overview",
      "title": "What You're Making",
      "body": [
        {
          "type": "p",
          "html": "Chicken seared in batches for a proper crust, then a bright pan sauce built from the fond. Butter finish makes it glossy without being heavy."
        },
        { "type": "spacer" },
        {
          "type": "ul",
          "items": [
            "<strong>Season + dredge</strong> chicken in flour",
            "<strong>Sear in batches</strong>—don't crowd the pan",
            "<strong>Build sauce</strong> from the pan drippings",
            "<strong>Butter-finish</strong> for silky texture",
            "<strong>Toss pasta in sauce</strong>, plate chicken on top"
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Lesson learned:</strong> Pasta + sauce first, then chicken on top = best result."
        }
      ]
    },
    {
      "kicker": "Step 1",
      "title": "Prep Chicken",
      "checkboxLabel": "Pat dry, season, dredge in flour",
      "measurements": [
        { "item": "Chicken tenders", "qty": "2 lbs" },
        { "item": "Kosher salt", "qty": "1½–2 tsp" },
        { "item": "Black pepper", "qty": "1–1½ tsp" },
        { "item": "All-purpose flour", "qty": "~¾ cup" }
      ],
      "body": [
        {
          "type": "ul",
          "items": [
            "Pat chicken <strong>very dry</strong> with paper towels.",
            "Season both sides with <strong>salt + pepper</strong>.",
            "Lightly <strong>dredge in flour</strong>—shake off all excess. Thin coating only."
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Why dry matters:</strong> Moisture = steam = no crust. Dry chicken browns; wet chicken stews."
        }
      ]
    },
    {
      "kicker": "Step 2",
      "title": "Sear Chicken (in Batches)",
      "checkboxLabel": "Sear all chicken, set aside",
      "measurements": [
        { "item": "Olive oil", "qty": "1 tbsp per batch" },
        { "item": "Butter", "qty": "1 tbsp per batch" }
      ],
      "body": [
        {
          "type": "ul",
          "items": [
            "Heat skillet to <strong>medium-high</strong>.",
            "Add <strong>1 tbsp olive oil + 1 tbsp butter</strong>.",
            "Wait until butter melts and foam <strong>settles</strong>—that's your cue.",
            "Add chicken in a <strong>single layer</strong> (don't crowd).",
            "Cook <strong>2–3 min first side</strong>—don't move it.",
            "Flip → cook <strong>2 min second side</strong>.",
            "Remove to plate. <strong>Repeat</strong> for remaining batches."
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Crowding kills browning.</strong> Work in batches. Foam settling = correct temp."
        }
      ]
    },
    {
      "kicker": "Step 3",
      "title": "Build the Sauce",
      "checkboxLabel": "Garlic, lemon, broth, capers",
      "body": [
        {
          "type": "ul",
          "items": [
            "Lower heat to <strong>medium</strong>.",
            "Add <strong>garlic</strong> → cook <strong>10–15 sec</strong> (don't brown).",
            "Add <strong>lemon juice + chicken broth</strong>.",
            "<strong>Scrape the pan</strong>—that fond is flavor.",
            "Add <strong>capers</strong>.",
            "Simmer <strong>2–4 min</strong> until slightly reduced."
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Scraping the pan is important.</strong> All those browned bits = the sauce's backbone."
        }
      ]
    },
    {
      "kicker": "Step 4",
      "title": "Butter Finish",
      "checkboxLabel": "Swirl in 2 tbsp butter until glossy",
      "body": [
        {
          "type": "ul",
          "items": [
            "Reduce heat to <strong>low</strong>.",
            "Add <strong>2 tbsp cold butter</strong>.",
            "<strong>Swirl the pan</strong> (don't stir aggressively) until butter is fully melted and sauce looks glossy."
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Target texture:</strong> Light, silky, slightly thickened. Not heavy. Not gravy. If it's too thick, add a splash of broth."
        }
      ]
    },
    {
      "kicker": "Step 5",
      "title": "Combine + Serve",
      "checkboxLabel": "Pasta in sauce, chicken on top",
      "body": [
        {
          "type": "ul",
          "items": [
            "Add <strong>cooked angel hair</strong> to the pan → toss to coat in sauce.",
            "Plate the pasta.",
            "Return chicken to pan briefly to warm, <strong>or</strong> place directly on top of pasta.",
            "Spoon extra sauce over everything.",
            "Finish with <strong>parmesan + parsley</strong> if using."
          ]
        },
        {
          "type": "callout",
          "html": "<strong>Order matters:</strong> Pasta in sauce first, chicken on top. Better coverage, better bite."
        }
      ]
    }
  ]
}
```

## Naming conventions

| Item | Rule | Example |
|---|---|---|
| Filename | kebab-case, `.json` extension | `lamb-breast-ribs.json` |
| `storageKey` | snake_case + `_checks_v1` suffix | `lamb_ribs_checks_v1` |
| `title` | Title case, the dish name | `"Crispy Lemon Lamb Breast Ribs"` |
| `subtitle` | One sentence, ends with period | `"Slow-rendered at 300°F, then blasted hot for crisp edges."` |

## HTML conventions in content strings

- `<strong>` for ingredient quantities, key actions, and emphasis
- `<em>` for occasional italic emphasis
- `<br/>` for line breaks within a callout
- `&amp;` for literal ampersands
- No other HTML tags are needed; content is rendered as-is
