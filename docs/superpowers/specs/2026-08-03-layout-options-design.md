# Layout Options — Design Spec
_2026-08-03_

## Overview

Add three new overlay layout presets to the tour promo video generator, bringing the total from 5 to 8. All new presets share a **frosted/semi-transparent** treatment for their background panels.

---

## New Presets

### 1. Top Strip (`top-strip`)

A frosted dark bar locked to the top of the frame. The video fills the rest of the canvas unobstructed.

**Layout:**
- Full-width frosted bar (`rgba(10,10,16,0.72)`), height enough to hold two lines of artist text + one meta line (~56px in the 9:16 canvas coordinate space)
- Single 0.8px rule at the bottom edge of the bar (`rgba(255,255,255,0.3)`)
- Inside the bar (left-aligned):
  - `ArtistMark` at size ~2.0, `textAlign="left"`
  - Below that: venue on the left, date+time on the right (same row, `MetaLine` size 0.8)
- CTA: `MetaLine` at the very bottom center of the frame, outside the bar

**Thumbnail:** SVG shows a top rectangle block with two wide bars (artist name) and two narrow bars (meta left/right), plus a dot row at the bottom (CTA).

---

### 2. Poster Stamp (`poster-stamp`)

A frosted inset box centered in the frame with corner viewfinder tick marks. Artist name above a divider; venue/date/CTA below it.

**Layout:**
- Inset box with ~9% margin on each side, ~14% top/bottom (`rgba(10,10,16,0.68)`)
- Corner ticks: L-shaped polylines at all 4 corners, ~16px legs, `rgba(255,255,255,0.7)`, stroke 1.3px
- Inside (all center-aligned):
  - `ArtistMark` at size ~2.2, `textAlign="center"`, positioned in the upper half of the box
  - 0.8px horizontal rule across the box interior
  - Below the rule: `MetaLine` for venue, `MetaLine` for date+time, optional `MetaLine` for CTA

**Thumbnail:** SVG shows an inset rectangle with corner L-marks, two wide bars (artist), a thin divider, and three narrow bars (meta).

---

### 3. Center Band (`center-band`)

A frosted full-width horizontal band crossing the vertical center of the frame. Artist name lives inside it; venue/date split above and below; CTA at the foot.

**Layout:**
- Full-width frosted band (`rgba(10,10,16,0.72)`), vertically centered, tall enough for two lines of artist text
- 0.8px rules at top and bottom edges of the band (`rgba(255,255,255,0.35)`)
- Inside the band (left-aligned):
  - `ArtistMark` at size ~2.0, `textAlign="left"`
- Above the band: venue left, date right — `MetaLine` size 0.8
- Below the band: time left (or second meta line), secondary info right — `MetaLine` size 0.8
- CTA: `MetaLine` at the very bottom center

**Thumbnail:** SVG shows a mid-frame wide band with two text bars inside, narrow bars above/below, and a dot row at the foot.

---

## Architecture

All changes are confined to two files:

### `src/overlays.jsx`

1. Add three new `if (preset === '...')` branches inside `Overlay` — one per preset.
2. Add three new `case '...'` branches inside `PresetThumb`.
3. No new props, no new state. All three presets use the existing `{ preset, data, fontFamily, bodyFontFamily, fontScale, animate }` interface.

The frosted panel is a plain `<div>` with `background: rgba(10,10,16,0.72)` and `backdropFilter: 'blur(12px)'`. This sits inside the existing `.overlay` > `.safe` structure.

### `src/form.jsx`

Append three entries to the `PRESETS` array:

```js
{ id: 'top-strip',    label: 'Top Strip'  },
{ id: 'poster-stamp', label: 'Stamp'      },
{ id: 'center-band',  label: 'Mid Band'   },
```

No other changes to `form.jsx`.

---

## Component details

### Frosted panel styling

```js
{
  background: 'rgba(10,10,16,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
}
```

Applied to the enclosing div of each frosted region. The `.overlay` div already covers the full canvas with `position:absolute; inset:0`, so the frosted child just needs width/height to define its region.

### Corner tick marks (Poster Stamp only)

Rendered as an absolutely-positioned `<svg>` covering the full inset box, with four `<polyline>` elements. Tick leg length: 16% of the box width. Stroke: `rgba(255,255,255,0.7)`, width 1.5px.

### Existing shared components

`ArtistMark` and `MetaLine` are already defined inside `Overlay` and work for all presets — no modifications needed.

---

## Out of scope

- No animation changes (all presets use the existing `fade-in` class via `animate` prop)
- No new data fields
- No changes to export, preview, or app state
- No responsive/aspect-ratio-specific layout variants for the new presets (existing behavior: 9:16 canvas, 4:5 crop-safe zone shown as overlay)
