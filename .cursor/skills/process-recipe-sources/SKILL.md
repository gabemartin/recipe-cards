---
name: process-recipe-sources
description: >-
  Scan the src/recipe-sources/ directory for new PDFs, images, or .paprikarecipes files, process them into JSON recipes using the generate-recipe skill, log their processing timestamps, and automatically commit and push to the main branch to publish.
---

# Process Recipe Sources

Use this skill when the user asks to "scan sources", "process new recipes", or "check recipe sources". It automates the batch conversion of raw recipe files into structured JSON and handles deployment.

## 1. Scan and Deduplicate

List all files in `src/recipe-sources/`.

Read `src/recipe-sources/.processed-log.json`. This file tracks the last modified timestamp of processed files.

Format:
```json
{
  "filename.pdf": "2024-03-24T12:34:56Z"
}
```

Compare the files in the directory with the log. If a file is missing from the log, or its modification time is newer than the logged timestamp, it needs processing. Skip all others.

## 2. Parse Formats

For each file that needs processing, extract its content:

- **`.paprikarecipes`**: This is a standard zip containing a gzip-compressed JSON file. Extract it using the shell:
  `unzip -p "src/recipe-sources/Filename.paprikarecipes" | gzip -d -c`
  Parse the resulting JSON to get the recipe data.
- **`.pdf`**: Read the file directly using the `Read` tool, which natively converts PDFs to text.
- **Images**: Use vision capabilities to read the recipe text and structure from the image.

## 3. Generate Recipes

For each parsed file, act as if the user provided this content directly to the `generate-recipe` skill.
Follow the `.cursor/skills/generate-recipe/SKILL.md` guidelines to create a new `src/recipes/filename.json` file.

Make sure to map the parsed data correctly to the recipe schema, avoiding any duplicate `storageKey` values.

## 4. Update Log

After successfully generating the recipe JSON for a source file, update `src/recipe-sources/.processed-log.json` with the file's current modification timestamp and save it.

## 5. Auto-Publish (Commit & Push)

Once all files are processed, the recipes are generated, and the log is updated:
1. Stage the new/modified `src/recipes/*.json` files.
2. Stage `src/recipe-sources/.processed-log.json`.
3. Stage any build artifacts if a build was run (e.g., `dist/*.html`, `index.html` — refer to `generate-recipe` skill).
4. Commit with a concise message, e.g., "Add recipes from sources".
5. Push to the `main` branch.

**IMPORTANT:** Keep the user's involvement to an absolute minimum. Do not ask for confirmation before committing and pushing unless there is a conflict, a schema error, or the user explicitly requested "scan sources but do not publish". Just do it and report back a summary of the newly published recipes.
