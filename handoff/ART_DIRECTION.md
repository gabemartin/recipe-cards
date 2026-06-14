# Art Direction — Recipe Card Photography

## The Guiding Principle

**Honest food. Beautiful light.**

This is not food styling in the commercial sense. We do not spray oil on steak to make it glisten, undercook chicken so it looks pinker, or build architecture out of food that would collapse in real life. The food is photographed as it actually looks when cooked correctly by the recipe. The dish earns its beauty from what it is — not from illusion.

What we *do* control: where the light comes from, what surface it sits on, what objects are nearby, and what angle the camera is at. That is where the artistry lives. The food is accurate. The staging is editorial.

---

## The Two Layers (Architecture)

Every image prompt for this project is two pieces that combine:

**Layer 1 — Subject + Per-Recipe Style** (`imagePrompt` field in recipe JSON)
Describes the dish itself: real colors, real textures, honest doneness, how sauces actually pool, what a garnish looks like after it's been in a hot pan. Also includes per-recipe photography direction: the surface, light quality, camera angle, and mood appropriate to *this specific dish*. Written first as if a journalist is describing what they see, then as a precise photographic brief for the shoot.

**Layer 2 — Quality Principles + Technical Spec** (`IMAGE_STYLE` constant in `generate.js`)
Universal quality standards that apply to every image in the collection: honest food, earned props, technical camera spec. Does not prescribe a surface or lighting style — those live in the per-recipe `imagePrompt` so each dish gets photography that fits its character.

When used together, they produce a complete, ready-to-paste image generation prompt.

---

## Style Block (Current)

The current global style string, stored in `generate.js` as `IMAGE_STYLE` and embedded in every recipe card's HTML:

```
Honest food photography: real doneness, natural sauce behavior, no artificial food styling, no added ingredients not in the recipe, no digital manipulation. Shot at 85mm equivalent, f/2.0–f/2.8, tack-sharp on the hero element with natural depth falloff. Props are earned — only objects actually used in the recipe or found at a dinner table. Food is photographed as it comes out of the pan: genuine crust texture, real pooling and drips, natural imperfection.
```

To update quality standards across all 28+ recipe cards: edit this string in `generate.js` and run `node generate.js`. Every card rebuilds with the new style embedded.

---

## Photography Style Categories

The collection uses a range of surfaces, lighting, and moods — matched to each recipe's character. The dark walnut / charcoal slate treatment is one tool, used when the dish earns it. Recipes are grouped below by their visual treatment:

### Dark & Dramatic (charcoal slate, raking warm light)
Earns deep shadow and a dark backdrop because the food's richness, rendered fat, or mahogany crust is the point. A light background would undercut the drama.
- Lamb breast ribs — crackling rendered fat, mahogany crust
- Steakhouse sirloin tips — butter-basted sear, pink interior
- Lamb loin chops (cast iron) — mahogany sear, melting herb butter
- Jalapeño popper smashburger — cheese pull, jam smear, pub energy
- Honey garlic Cajun chicken thighs — cast iron, glazed dark skin, cream sauce

### Cast Iron Warm (medium oak table, golden light)
Cast iron skillet presented directly on worn oak, warm golden side light. Not dark but substantial — the skillet is the hero vessel.
- Chicken parmesan gnocchi — parmesan crust, cream sauce
- Rotisserie chicken spinach mushroom gnocchi — cream sauce, golden crust
- Lamb chop fond potatoes — glistening fond, dark slate variation

### Mediterranean Warm (rough wood, golden raking light, earned props)
Rustic, sun-drenched, like the olive oil / vine tomato / bread still life in IMG_0187. Props earn their place; light comes in from the side at a generous angle.
- Clams on toast — broth, shells, white wine
- Baked feta salmon pasta — terracotta dish, afternoon light
- Chicken piccata — pale terracotta surface, lemon warmth
- Italian spinach — earthenware bowl, family kitchen feel
- Sauce Sicilian Sunday — kitchen wood, parmesan, wine glass
- Leg of lamb with roasted garlic — walnut board, dramatic occasion

### Bright & Airy (marble/stone, daylight, overhead)
Clean, fresh, ingredient-forward. Inspired by the granola bowl and fig tart photos (IMG_0185, IMG_0184). Light surface, no dramatic shadow.
- Salmon farro grain bowls — white marble, vivid colors overhead
- Fish tacos — pale weathered wood, coastal colors
- Potato pancake brunch plate — white marble, morning light
- Butterflied lamb leg with rice & tzatziki — off-white platter, Mediterranean clean
- Salmon lemon bucatini — pale stone, pale elegant palette
- Salmon croquettes — linen or coastal wood, coastal cool
- Lemon herb rice — cream stone, supporting-cast simplicity
- Tzatziki sauce — white ceramic, cool pale stone
- Roasted sweet potatoes — linen or warm wood, orange color as star

### Comforting Home Kitchen (warm wood, soft light)
Baked dishes in their pans, warm table, soft light. Less dramatic than moody, more inviting.
- Chicken enchiladas — ceramic dish, kitchen table, red sauce hero
- Black bean sweet potato enchiladas — terracotta surface, bright and airy
- Country fried steak — warm aged pine, ivory gravy contrast

### Bold Editorial (non-neutral background)
Background color chosen to amplify the dish's dominant tone rather than recede to neutral.
- Caramelized banana milkshake — warm amber/butterscotch background
- Korean tteok & spicy pork ragù — dark charcoal bowl on grey stone, rust-red pop

---

## Surface & Background

- **No single required surface.** Match the surface to the dish category above.
- **Avoid:** White marble for dark, hearty meat dishes. Dark slate for delicate, bright dishes. Anything that fights with the food's natural palette.
- The surface is always visible — it's a character in the image, not a backdrop to eliminate.

---

## Lighting

- **Direction:** Single natural or natural-looking window light, usually upper left
- **Angle:** Choose based on the dish — raking low for textured surfaces (rendered fat, crust), more overhead for flat dishes (grain bowls, enchiladas)
- **No fill:** No reflectors, no bounce cards, no second light source. Shadow is information
- **Color temp:** Warm (3200–4500K) for most. Neutral-to-cool for Korean, grain bowls, tzatziki
- **Avoid:** Ring lights, overhead studio panels, blown highlights, HDR, artificial food styling gloss

---

## Angle & Composition

- **Overhead (flat lay):** Best for dishes with flat geometry — enchiladas, grain bowls, breakfast plates
- **¾ overhead (45°–70°):** Best for dishes with height — steak, roast lamb, pasta
- **Low ¾ angle:** Best for burgers and stacked dishes where height and drip are the story
- **Never:** Eye-level product shots, extremely shallow angles that hide the top of the dish

---

## Props Doctrine

Props are earned. Every object in the frame must belong there.

**Allowed:**
- The knife or fork you'd actually eat this with (vintage, one piece)
- A small sauce vessel (gravy boat, ramekin) if the recipe has a sauce served separately
- A sprig of the fresh herb actually called for in the recipe
- Coarse salt in a small pinch if salt is a key ingredient
- A wine glass (empty or filled) if wine is in the recipe
- Earned condiment jars (gochujang for Korean ragu, olive oil for Mediterranean dishes)

**Not allowed:**
- Decorative items not related to the dish
- Multiple props of the same type
- Fresh herbs not in the recipe
- Color-pop vegetables added purely for visual contrast

---

## Food Styling Rules

### What We Do

- Cook the food correctly per the recipe; photograph what comes out
- Let sauces pool and drip naturally
- Show real doneness (medium-rare means medium-rare, not raw)
- Let the crust have texture — not perfectly uniform
- Allow realistic imperfection: a slightly uneven sear, a herb leaf that wilted in the pan
- Cut or pull apart one piece to show the interior where that's the dish's visual payoff

### What We Don't Do

- Undercook meat to make the color more dramatic
- Apply oil, lacquer, or glycerin to make food glisten artificially
- Use raw food to stand in for cooked food
- Stack food in structural arrangements that wouldn't survive plating in real life
- Add garnishes not in the recipe
- Use tweezers to place individual microgreens

---

## Subject Writing Rules (for `imagePrompt` field)

Each recipe's `imagePrompt` is a complete photographic brief in two parts:

**Part 1 — Dish description (2–3 sentences):**
- Journalist voice: describe what's in front of you
- The dominant visual color, key textures, real doneness
- How sauces, glazes, and broths naturally behave
- Any contrasting elements (dark crust / pale interior, red sauce / ivory cream)
- The vessel or plating format the recipe produces

**Part 2 — Photography direction (1–2 sentences):**
- Surface choice (dark slate, pale marble, warm wood, etc.)
- Light quality and direction
- Camera angle (overhead, ¾, low ¾)
- Mood word if helpful (bold, airy, rustic, editorial)
- One or two earned props specific to the recipe

**Never include:**
- Artificial food styling (sprayed oil, glycerin, undercooked meat)
- Props not in the recipe
- Post-processing language (HDR, heavy editing)

**Length:** 4–6 sentences total across both parts.

---

## Evolution Notes

- v1: Single global surface/light prescription (dark walnut / charcoal slate for all recipes)
- v2 (current): Per-recipe photography direction in `imagePrompt`; `IMAGE_STYLE` holds quality principles + tech spec only. Surface and light are matched to each dish's character — dark moody for rich meat dishes, bright airy for grain bowls and coastal seafood, Mediterranean warm for Italian and Greek, bold editorial for desserts with dominant color.

To evolve the quality standards across all cards: edit `IMAGE_STYLE` in `generate.js` and rebuild.
To update a single recipe's photography direction: edit that recipe's `imagePrompt` field.
