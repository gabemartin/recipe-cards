---
name: teardown
description: >-
  Remove a UI element or feature from generate.js and trace all its artifacts:
  HTML markup, CSS rules, JS handler functions, and event listeners.
  Optionally archives removed code via git for easy restoration.
  Use when the user says "remove", "delete", "tear down", "get rid of",
  "archive", "stash", "restore", or "bring back" a button, section,
  dialog, or other UI component.
---

# Teardown

Remove a UI element from `generate.js` and delete every artifact it depends on, without breaking the remaining UI.

## Artifact checklist

Every removal must sweep these four layers inside `generate.js`. Search for the element's `id`, `class`, and any visible text content.

| Layer | What to look for | How to find it |
|---|---|---|
| **HTML template** | The markup block (element + wrapper) | Grep for the `id` or `class` in the template literal |
| **CSS (inlined)** | Rules targeting the element or its wrapper class | Grep for `.className` in the `<style>` block (~lines 1-540) |
| **JS functions** | Handler functions only used by this element | Grep for the function name in the `<script>` block |
| **JS listeners** | `addEventListener` / `getElementById` calls wiring the element | Grep for the element's `id` string in the `<script>` block |

## Workflow

### 1. Identify the target

Confirm exactly which element(s) the user wants removed. Note the element's:
- `id` attribute(s)
- `class` name(s) unique to it
- Wrapper/parent element if it exists solely for this feature

### 2. Search for all references

Run four parallel searches across `generate.js`:

```
id name        → finds HTML, JS getElementById, listeners
class name     → finds HTML, CSS rules
function name  → finds JS handler definitions and call sites
visible text   → catches any remaining references
```

### 3. Check shared dependencies before deleting

Before removing a CSS rule or JS function, verify nothing else uses it:

- **CSS classes** (e.g. `.btn`): Grep the full file for other elements using the same class. Only delete the rule if zero other references remain.
- **JS functions**: Check if other listeners or code paths call the function.
- **Wrapper elements**: If the wrapper (e.g. a `<div>`) also holds other content, restructure rather than delete the whole wrapper.

### 4. Archive (optional)

Before deleting anything, tag the current commit so the pre-removal state has a name:

```bash
git tag archive/<feature-name>
```

- Lightweight tags are local-only, cheap, and easy to list (`git tag -l 'archive/*'`).
- The tag captures the full working state of `generate.js` before any code is deleted.
- If the user explicitly says they do not want an archive, skip this step.

### 5. Remove in order

1. **HTML** — Delete the markup. Adjust surrounding structure if the parent layout depended on the removed child (e.g. `justify-content: space-between` with only one child left).
2. **CSS** — Delete rules unique to the element. Update layout rules on parent containers if needed.
3. **JS** — Delete handler functions, then delete the `addEventListener` / `getElementById` lines.

### 6. Rebuild and verify

```bash
npm run build
```

Confirm the build succeeds and no errors reference removed IDs or classes.

## Restoring archived features

List available archives:

```bash
git tag -l 'archive/*'
```

View what was removed:

```bash
git diff archive/<name>..HEAD -- generate.js
```

Re-add the removed code:

```bash
git diff HEAD..archive/<name> -- generate.js | git apply
```

Clean up the tag after a successful restore:

```bash
git tag -d archive/<name>
```

## Known patterns

Track recurring teardown patterns here. Update this section when new patterns emerge.

### Buttons in `.chiprow` (Reset / Print)

- **Archive tag**: none (archived before skill had this step)
- **Removed**: `#resetChecks` button, `#print` button, `.actions` wrapper div
- **CSS deleted**: `.actions` rule block
- **CSS updated**: `.chiprow` `justify-content` changed from `space-between` to `flex-start`
- **JS deleted**: `resetChecks()` function, two `addEventListener` calls
- **Kept**: `.btn` / `.btn.primary` (shared with nav, ingredients, expanded dialog), `@media print` (browser print shortcut still works), `loadChecks()` (checkbox persistence still needed)

## Self-update rule

After each teardown, append a new entry under **Known patterns** documenting what was removed, what was kept and why, the archive tag name (or "none -- user declined"), and any non-obvious decisions. This builds a project-specific reference for future removals and restorations.
