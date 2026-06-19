# Art Direction — Recipe Card Photography

## The Guiding Principle

**Honest food. Beautiful light.**

This is not food styling in the commercial sense. We do not spray oil on steak to make it glisten, undercook chicken so it looks pinker, or build architecture out of food that would collapse in real life. The food is photographed as it actually looks when cooked correctly by the recipe. The dish earns its beauty from what it is — not from illusion.

What we *do* control: where the light comes from, what surface it sits on, what objects are nearby, and what angle the camera is at. That is where the artistry lives. The food is accurate. The staging is editorial.

---

## The Two Layers (Architecture)

Every image prompt for this project is two pieces that combine:

**Layer 1 — Subject** (`imagePrompt` field in recipe JSON)
Describes the dish itself: real colors, real textures, honest doneness, how sauces actually pool, what a garnish looks like after it's been in a hot pan. Written as if a journalist is describing what they see in front of them. No photography language.

**Layer 2 — Style** (`IMAGE_STYLE` constant in `generate.js`)
Describes everything outside the food: surface, light direction, camera angle, props, color palette, mood, shooting spec. Global. Applies to all recipes equally. Update this string and rebuild to evolve the entire collection at once.

When used together, they produce a complete, ready-to-paste image generation prompt.

---

## Style Block (Current)

The current global style string, stored in `generate.js` as `IMAGE_STYLE` and embedded in every recipe card's HTML:

```
Shot on a dark, weathered walnut or charcoal slate surface — deep grain, imperfect texture, no fill light or reflectors. Single-source natural light from the upper left, angled low to rake across surfaces and cast deep organic shadows. Overhead flat lay or slight ¾ overhead — choose whichever reveals the dish's best silhouette and texture. Props are earned, not decorative: one vintage knife or fork, a small sauce vessel if the dish has one, a sprig of the herb actually used in the recipe, coarse salt where salt was used. Color palette: deep jewel tones — charcoal, burgundy, forest green, ochre, dark gold. No bright whites, no clinical backgrounds. Food is styled honestly: genuine doneness, real pooling and drips, no tweezered perfect garnish. Shot at 85mm equivalent, f/2.0–f/2.8, tack-sharp on the hero element, natural depth falloff. Mood: moody editorial. Honest food, beautiful light.
```

To update the style for all 28+ recipe cards: edit this string in `generate.js` and run `node generate.js`. Every card rebuilds with the new style embedded.

---

## Surface & Background

- **Primary:** Dark weathered walnut — deep grain, imperfect, warm brown with black veining
- **Secondary:** Charcoal slate — cool grey, matte, fine texture
- **Avoid:** White marble, bright light surfaces, seamless paper backgrounds, anything that reads as a photo studio

The surface is always visible — it's a character in the image, not a backdrop to eliminate.

---

## Lighting

- **Source:** Single natural or natural-looking window light, upper left
- **Angle:** Low and raking — light skims across surfaces, not floods them. Creates deep shadows in wood grain, sauce pools, crust texture
- **No fill:** No reflectors, no bounce cards, no second light source. Shadow is information
- **Color temp:** Warm (3200–4500K). The scene should feel like late afternoon or morning kitchen light
- **Avoid:** Ring lights, overhead studio panels, blown highlights, HDR, artificial food styling gloss

---

## Angle & Composition

- **Overhead (flat lay):** Best for dishes with flat geometry — enchiladas, pizza, grain bowls, smashburgers. Camera is directly above.
- **¾ overhead (45°–70°):** Best for dishes with height — steak, roast lamb, tacos stacked. Shows both the surface and the side of the food.
- **Never:** Eye-level product shots, extremely shallow angles that hide the top of the dish, or rotating the camera to an artificial diagonal just for visual interest.

Choose the angle that answers the question: *What does this dish look like when I'm about to eat it?*

---

## Props Doctrine

Props are earned. Every object in the frame must belong there — it was used in the recipe or it lives on a dinner table.

**Allowed:**
- The knife or fork you'd actually eat this with (vintage, one piece)
- A small sauce vessel (gravy boat, ramekin) if the recipe has a sauce served separately
- A sprig of the fresh herb actually called for in the recipe
- Coarse salt in a small pinch if salt is a key ingredient
- An empty wine glass or a full one if the recipe explicitly pairs with wine

**Not allowed:**
- Decorative items not related to the dish (pine cones, eucalyptus, etc. — unless they appeared in a specific seasonal session)
- Multiple props of the same type (not three forks arranged artfully)
- Fresh herbs that aren't in the recipe
- Color-pop vegetables added purely for visual contrast
- Anything that would confuse what dish is being photographed

---

## Color Palette

**Primary tones:** Charcoal, deep walnut brown, matte slate grey
**Accent tones:** Burgundy, forest green, ochre, dark gold
**Food tones:** Real — not enhanced. A medium-rare steak is rosy-red, not artificially pink. A cream gravy is ivory-white, not magazine-white.
**Avoid:** Bright whites, electric blues, clinical teals, neon accents

The overall image should feel like you could hang it on a wall without it looking like an ad.

---

## Food Styling Rules

### What We Do

- Cook the food correctly per the recipe; photograph what comes out
- Let sauces pool and drip naturally
- Show real doneness (medium-rare means medium-rare, not raw)
- Let the crust have texture — not perfectly uniform
- Allow realistic imperfection: a slightly uneven sear, a herb leaf that wilted in the pan

### What We Don't Do

- Undercook meat to make the color more dramatic
- Apply oil, lacquer, or glycerin to make food glisten artificially
- Use raw food to stand in for cooked food
- Stack food in structural arrangements that wouldn't survive plating in real life
- Add garnishes not in the recipe
- Use tweezers to place individual microgreens

---

## Subject Writing Rules (for `imagePrompt` field)

When writing the per-recipe subject paragraph:

**Include:**
- The dominant visual color of the dish (the sauce, the crust, the protein)
- Key textures: is the crust shattered or soft? Is the sauce glossy or matte? Is the interior revealed?
- How the dish is naturally plated by the recipe (plate, board, skillet, bowl)
- Any contrasting elements that make the dish visually interesting (dark crust / pale interior, red sauce / ivory cream)
- Natural behavior of sauces, glazes, broths (pooling, dripping, soaking into starch)

**Never include:**
- Lighting descriptions (`dramatic light`, `golden hour`)
- Surface/background descriptions (`on a dark wood board`)
- Camera/angle language (`overhead shot`, `shallow depth of field`)
- Prop language (`with a vintage knife`)
- Any language that implies staging or photography

**Length:** 2–4 sentences. Enough to describe the dish unambiguously but not so long it dilutes the style block.

---

## Evolution Path

This is v1 of the style. Future passes may refine:

- **Seasonal variation:** Swap pine cone props for fresh citrus in spring, etc. (only when earned by the recipe)
- **Hero cut vs. whole:** Some dishes photograph better whole (leg of lamb roast), others at the cut (steak). Add a rule for this once there are more examples.
- **Plating vessels:** As the recipe collection grows, establish preferred plate/bowl colors for different dish types.
- **Background texture catalogue:** Build a small set of 2–3 approved surface textures so all hero shots feel like they're from the same kitchen.

Iterate by updating `IMAGE_STYLE` in `generate.js` and rebuilding — never by editing individual recipe `imagePrompt` fields for style reasons.
