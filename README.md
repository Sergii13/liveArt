# LiveArt — Image Editor

Browser-based non-destructive image editor. Test task implementation.

## Quick start

```bash
npm i && npm run dev
```

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vuetify 4
- Pinia
- TypeScript
- Zod, VueUse, cropperjs, lodash-es

> **Note on Vuetify version:** the task lists Vuetify 3, but this project deliberately uses Vuetify 4 (latest stable). All required components (`VFileUpload`, `VSnackbarQueue`) are stable in v4, and the API used here is fully compatible with v3.

## Features

### Required

- **Load an image** — file upload with drag & drop (`VFileUpload`), or replace the current image in one click from the toolbar
- **Crop** — cropperjs over the original image, crop rect is stored in original-image coordinates
- **Live adjustments** — brightness / contrast / saturation sliders with real-time preview
- **Reset / view original** — one click returns to the unedited image; edits are fully non-destructive
- **Export** — downloads the edited result as PNG

### Bonus

- **Filters** — grayscale and sepia, implemented as intensity sliders (0–1), not just on/off toggles
- **Export operations as JSON** — downloads a self-contained "recipe" describing all applied operations
- **Import settings from JSON** — loads a previously exported recipe and replays it on the current image, proving the recipe is replayable

## How it works

### The edit model

The core idea: **pixels of the original are never modified**. All edits live in a separate
`EditDocument` object — a declarative "recipe":

```ts
{
  version: 1,
  crop: { x, y, width, height } | null,   // in original-image pixels
  adjustments: { brightness, contrast, saturation },  // 1 = neutral
  filters: { grayscale, sepia }           // 0 = off, 1 = full
}
```

The preview is always derived: `preview = apply(original, editDocument)`. From this single
decision the key requirements follow for free:

- **Non-destructive** — there is no code path that writes into the source image
- **Reset** — replace the document with an empty one
- **Export JSON** — serialize the document itself
- **Replay** — apply operations in a fixed order (crop → adjustments → filters) to reproduce the result deterministically

### The pipeline

Adjustments and filters map 1:1 to CSS/Canvas filter functions, so a single computed string

```
brightness(1.2) contrast(0.9) saturate(1.1) grayscale(0.4) sepia(0)
```

drives **both** the live preview (CSS `filter` on the image — GPU-accelerated, no canvas redraw
per slider tick) and the export (`ctx.filter` on canvas). One source of logic, two renderers.

Crop is applied via canvas only when the crop rect changes (a rare operation), producing the
preview base; sliders stay live on top of it.

### Export / import round-trip

Export produces two files: the rendered `*.png` and a `*.json` recipe. Importing the JSON back
validates it and applies the operations to the current image, restoring the exact same result —
demonstrating the replay property required by the task.

## Validations & extras

- **Boundary validation of imported JSON** — files are parsed with Zod (`safeParse`); schema
  violations produce a human-readable error listing each invalid field (shown in a dismissible
  alert). Value ranges are enforced by the schema (adjustments 0–2, filters 0–1)
- **Schema as the source of truth** — TypeScript types are inferred from Zod schemas
  (`z.infer`), so the runtime contract and the static types can never drift apart
- **SVG normalization** — uploaded SVGs are rasterized at load time (longest side ≥ 2048px), so
  preview, crop coordinates and export stay sharp and consistent
- **Preview zoom** — fit-to-screen by default, zoom buttons + mouse wheel (10%–800%). Zoom is
  view state, intentionally kept out of `EditDocument` (it is not an edit)
- **Notifications** — success actions go through a snackbar queue; import errors use a
  dismissible alert so long messages can actually be read
- **Adaptive layout** — controls live in a navigation drawer toggled from the header; on narrow
  screens it becomes an overlay. The stage always fills the available viewport height

## Design decisions & trade-offs

- **`EditDocument` (state object) over a command list** — a command list gives undo/redo but is
  overkill for three sliders and one crop; a flat document maps directly onto slider bindings
  and serializes trivially
- **Crop rect in original-image coordinates** — makes the recipe resolution-independent and
  replayable on the original at any size
- **Re-entering crop shows the original, not the cropped result** — intentional: the model
  stores a single crop rect against the original, so re-cropping adjusts that rect rather than
  cropping a crop
- **Libraries do the plumbing, the domain stays hand-written** — cropperjs (crop UI), VueUse
  (file dialogs, base64), Vuetify (all UI); the edit model, pipeline and coordinate handling are
  the actual work
