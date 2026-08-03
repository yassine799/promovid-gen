# Layout Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new overlay layout presets — Top Strip, Poster Stamp, Center Band — each with a frosted semi-transparent panel treatment, a live DOM preview, a canvas export renderer, and an SVG picker thumbnail.

**Architecture:** Each preset lives in two places: a JSX branch in `overlays.jsx` (DOM preview via CSS) and a canvas draw branch in `export.jsx` (frame-by-frame compositing via Canvas 2D). `form.jsx` holds the picker metadata. The live preview uses `backdrop-filter: blur(12px)`; the canvas export uses `rgba(10,10,16,0.x)` fills with no blur (Canvas 2D has no backdrop-filter equivalent). Both produce a visually consistent "frosted panel" result.

**Tech Stack:** React (JSX loaded via script tag), Canvas 2D, plain CSS-in-JS inline styles. No build step — files are served directly from `index.html`.

---

## File Map

| File | Change |
|---|---|
| `src/form.jsx` | Append 3 entries to `PRESETS` array |
| `src/overlays.jsx` | Add 3 `if (preset === ...)` branches in `Overlay`; add 3 `case` branches in `PresetThumb` |
| `src/export.jsx` | Add 3 `else if (preset === ...)` branches in `drawOverlay` |

---

## Task 1: Register the three new presets

**Files:**
- Modify: `src/form.jsx:15-21`

- [ ] **Step 1: Open `src/form.jsx` and find the `PRESETS` array (lines 15–21). Append three entries.**

Replace:
```js
const PRESETS = [
  { id: 'huge-center', label: 'Huge Center' },
  { id: 'top-bottom', label: 'Top + Bottom' },
  { id: 'stacked-bl', label: 'Stack BL' },
  { id: 'side-vert', label: 'Vertical' },
  { id: 'corner-tags', label: 'Corners' },
];
```

With:
```js
const PRESETS = [
  { id: 'huge-center', label: 'Huge Center' },
  { id: 'top-bottom', label: 'Top + Bottom' },
  { id: 'stacked-bl', label: 'Stack BL' },
  { id: 'side-vert', label: 'Vertical' },
  { id: 'corner-tags', label: 'Corners' },
  { id: 'top-strip', label: 'Top Strip' },
  { id: 'poster-stamp', label: 'Stamp' },
  { id: 'center-band', label: 'Mid Band' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/form.jsx
git commit -m "feat: register top-strip, poster-stamp, center-band presets"
```

---

## Task 2: Top Strip — DOM overlay + SVG thumbnail

**Files:**
- Modify: `src/overlays.jsx`

**Layout description:** Frosted dark bar locked to the top. Artist name (left-aligned) fills the upper part of the bar. Venue left / date+time right below it. CTA floats at the very bottom of the frame.

- [ ] **Step 1: In `src/overlays.jsx`, find the block `if (preset === 'corner-tags') { ... }` and its closing `}`.**
  Insert the following block **after** that closing `}` and **before** `return null;`:

```jsx
  if (preset === 'top-strip') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: 'rgba(10,10,16,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '5% 6% 4%',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
        }}>
          <ArtistMark size={1.8} textAlign="left" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.55em' }}>
            <MetaLine size={0.8} align="left">{venue}</MetaLine>
            <MetaLine size={0.8} align="right">{[dateStr, timeStr].filter(Boolean).join(' · ')}</MetaLine>
          </div>
        </div>
        {cta && (
          <div style={{ position: 'absolute', bottom: '5%', left: 0, right: 0 }}>
            <MetaLine size={0.8} align="center">{cta}</MetaLine>
          </div>
        )}
      </div>
    );
  }
```

- [ ] **Step 2: In the `PresetThumb` function's `switch(preset)` block, add a `case 'top-strip':` branch before `default:`.**

```jsx
    case 'top-strip':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="0" y="0" width="90" height="48" fill="rgba(255,255,255,0.08)"/>
          <rect x="0" y="48" width="90" height="0.8" fill="rgba(255,255,255,0.35)"/>
          <rect x="8" y="8" width="52" height="10" fill={hi}/>
          <rect x="8" y="21" width="40" height="10" fill={hi}/>
          <rect x="8" y="37" width="24" height="2.5" fill={dim}/>
          <rect x="58" y="37" width="24" height="2.5" fill={dim}/>
          <rect x="27" y="150" width="36" height="2.5" fill={dim}/>
        </svg>
      );
```

- [ ] **Step 3: Open the app in a browser (open `index.html` directly or via a local server). Select the "Top Strip" preset and verify:**
  - The picker thumbnail appears as an 8th option
  - Artist name renders left-aligned in a frosted bar at the top
  - Venue sits on the left of the meta row, date+time on the right
  - CTA (if set) appears at the bottom center

- [ ] **Step 4: Commit**

```bash
git add src/overlays.jsx
git commit -m "feat: add top-strip overlay and thumbnail"
```

---

## Task 3: Poster Stamp — DOM overlay + SVG thumbnail

**Files:**
- Modify: `src/overlays.jsx`

**Layout description:** Frosted inset box (9% margin each side, 14% top/bottom). Corner viewfinder ticks at all four corners. Artist name centered above a horizontal rule. Venue, date+time, CTA stacked and centered below the rule.

- [ ] **Step 1: In `src/overlays.jsx`, insert the following block after the `top-strip` block (still before `return null;`):**

```jsx
  if (preset === 'poster-stamp') {
    const tickStyle = (corner) => ({
      position: 'absolute',
      width: '14%', height: '6%',
      ...(corner.includes('top')    ? { top: 0 }    : { bottom: 0 }),
      ...(corner.includes('left')   ? { left: 0 }   : { right: 0 }),
      borderTop:    corner.includes('top')    ? '1.5px solid rgba(255,255,255,0.7)' : 'none',
      borderBottom: corner.includes('bottom') ? '1.5px solid rgba(255,255,255,0.7)' : 'none',
      borderLeft:   corner.includes('left')   ? '1.5px solid rgba(255,255,255,0.7)' : 'none',
      borderRight:  corner.includes('right')  ? '1.5px solid rgba(255,255,255,0.7)' : 'none',
    });
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div style={{
          position: 'absolute', inset: '14% 9%',
          background: 'rgba(10,10,16,0.68)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '8%',
          gap: '0.8em',
        }}>
          {['top-left','top-right','bottom-left','bottom-right'].map(c => (
            <div key={c} style={tickStyle(c)} />
          ))}
          <ArtistMark size={2.0} textAlign="center" />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.35)', width: '80%', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em', alignItems: 'center' }}>
            {venue && <MetaLine size={0.8} align="center">{venue}</MetaLine>}
            {(dateStr || timeStr) && (
              <MetaLine size={0.8} align="center">{[dateStr, timeStr].filter(Boolean).join(' · ')}</MetaLine>
            )}
            {cta && <MetaLine size={0.8} align="center">{cta}</MetaLine>}
          </div>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Add the `case 'poster-stamp':` thumbnail branch before `default:`:**

```jsx
    case 'poster-stamp':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="8" y="22" width="74" height="116" fill="rgba(255,255,255,0.07)"/>
          <polyline points="8,38 8,22 24,22" fill="none" stroke={hi} strokeWidth="1.3"/>
          <polyline points="66,22 82,22 82,38" fill="none" stroke={hi} strokeWidth="1.3"/>
          <polyline points="8,122 8,138 24,138" fill="none" stroke={hi} strokeWidth="1.3"/>
          <polyline points="66,138 82,138 82,122" fill="none" stroke={hi} strokeWidth="1.3"/>
          <rect x="15" y="48" width="60" height="11" fill={hi}/>
          <rect x="19" y="62" width="52" height="11" fill={hi}/>
          <rect x="15" y="82" width="60" height="0.8" fill={dim}/>
          <rect x="20" y="90" width="50" height="2.5" fill={dim}/>
          <rect x="24" y="97" width="42" height="2.5" fill={dim}/>
          <rect x="28" y="104" width="34" height="2.5" fill={dim}/>
        </svg>
      );
```

- [ ] **Step 3: Verify in browser. Select "Stamp" preset and confirm:**
  - Frosted inset box with visible margin on all sides
  - Corner L-ticks visible at all four corners
  - Artist name centered, horizontal rule below it, venue/date/CTA centered below rule

- [ ] **Step 4: Commit**

```bash
git add src/overlays.jsx
git commit -m "feat: add poster-stamp overlay and thumbnail"
```

---

## Task 4: Center Band — DOM overlay + SVG thumbnail

**Files:**
- Modify: `src/overlays.jsx`

**Layout description:** Frosted full-width band crossing the frame at ~38% from top. Artist name left-aligned inside the band. Venue left / date right float above the band. Time (if set) floats below. CTA at the very bottom.

- [ ] **Step 1: Insert the following block after the `poster-stamp` block (before `return null;`):**

```jsx
  if (preset === 'center-band') {
    return (
      <div className={`overlay ${animate ? 'fade-in' : ''}`}>
        <div style={{
          position: 'absolute', top: '10%', left: '6%', right: '6%',
          display: 'flex', justifyContent: 'space-between',
        }}>
          {venue && <MetaLine size={0.8} align="left">{venue}</MetaLine>}
          {dateStr && <MetaLine size={0.8} align="right">{dateStr}</MetaLine>}
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '38%',
          background: 'rgba(10,10,16,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          padding: '5% 6%',
        }}>
          <ArtistMark size={1.9} textAlign="left" />
        </div>
        {timeStr && (
          <div style={{ position: 'absolute', bottom: '18%', left: '6%', right: '6%' }}>
            <MetaLine size={0.8} align="left">{timeStr}</MetaLine>
          </div>
        )}
        {cta && (
          <div style={{ position: 'absolute', bottom: '5%', left: 0, right: 0 }}>
            <MetaLine size={0.8} align="center">{cta}</MetaLine>
          </div>
        )}
      </div>
    );
  }
```

- [ ] **Step 2: Add the `case 'center-band':` thumbnail branch before `default:`:**

```jsx
    case 'center-band':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none">
          <rect width="90" height="160" fill="#0f0f10"/>
          <rect x="8" y="24" width="28" height="2.5" fill={dim}/>
          <rect x="54" y="24" width="28" height="2.5" fill={dim}/>
          <rect x="0" y="58" width="90" height="44" fill="rgba(255,255,255,0.08)"/>
          <rect x="0" y="58" width="90" height="0.8" fill="rgba(255,255,255,0.35)"/>
          <rect x="0" y="102" width="90" height="0.8" fill="rgba(255,255,255,0.35)"/>
          <rect x="8" y="65" width="58" height="11" fill={hi}/>
          <rect x="8" y="79" width="46" height="10" fill={hi}/>
          <rect x="8" y="112" width="26" height="2.5" fill={dim}/>
          <rect x="28" y="150" width="34" height="2.5" fill={dim}/>
        </svg>
      );
```

- [ ] **Step 3: Verify in browser. Select "Mid Band" and confirm:**
  - Venue appears top-left, date top-right
  - A frosted full-width band crosses the center with artist name inside
  - Time (if set) appears below the band
  - CTA appears at the bottom

- [ ] **Step 4: Commit**

```bash
git add src/overlays.jsx
git commit -m "feat: add center-band overlay and thumbnail"
```

---

## Task 5: Top Strip — canvas export renderer

**Files:**
- Modify: `src/export.jsx`

**Context:** `drawOverlay(ctx, W, H, state, logoImg)` is a pure Canvas 2D function. It has `else if` branches per preset starting at line 97. Add a new branch at the end of the chain (before the closing `ctx.restore()`). Available variables: `x0` (left pad = `W*0.05`), `x1` (right pad = `W - W*0.05`), `innerW` (`W*0.90`), `safeTop`, `safeH`, `em` (`W/26`), `bottom`, `padX`, `padY`, `fillMeta`, `fillArtistMark`, `showLogo`, `showText`, `logoImg`, `venue`, `dateStr`, `timeStr`, `cta`, `artistName`, `wrapWords`, `setDisplay`, `setMono`.

- [ ] **Step 1: In `src/export.jsx`, find the line `else if (preset === 'corner-tags') {` block and its closing `}`. Add the following branch immediately after:**

```js
  else if (preset === 'top-strip') {
    const stripH = H * 0.18;
    ctx.fillStyle = 'rgba(10,10,16,0.72)';
    ctx.fillRect(0, 0, W, stripH);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(0, stripH, W, 1);
    ctx.fillStyle = '#ffffff';
    const tPad = W * 0.06;
    const tTop = H * 0.05;
    const markH = fillArtistMark(tPad, tTop, 1.8, 'left');
    const metaY = tTop + markH + 0.55 * 1.8 * em;
    fillMeta(venue, tPad, metaY, 0.8, 'left');
    fillMeta([dateStr, timeStr].filter(Boolean).join(' · '), W - tPad, metaY, 0.8, 'right');
    if (cta) fillMeta(cta, W / 2, H * 0.95 - 0.8 * em * 1.2, 0.8, 'center');
  }
```

- [ ] **Step 2: Open the app, load a video, fill in all fields (artist, venue, date, time, CTA), select "Top Strip", click "Render video", let it complete, download the MP4, and play it. Verify:**
  - Dark semi-transparent bar at top with artist name, venue/date text
  - CTA visible at the bottom
  - No browser console errors during export

- [ ] **Step 3: Commit**

```bash
git add src/export.jsx
git commit -m "feat: add top-strip canvas renderer for export"
```

---

## Task 6: Poster Stamp — canvas export renderer

**Files:**
- Modify: `src/export.jsx`

- [ ] **Step 1: After the `top-strip` else-if block, add:**

```js
  else if (preset === 'poster-stamp') {
    const boxL = W * 0.09, boxR = W * 0.91;
    const boxT = H * 0.14, boxB = H * 0.86;
    const bW = boxR - boxL, bH = boxB - boxT;

    ctx.fillStyle = 'rgba(10,10,16,0.68)';
    ctx.fillRect(boxL, boxT, bW, bH);

    // corner ticks
    const tkX = bW * 0.16, tkY = bH * 0.06;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = Math.max(1, W / 720);
    ctx.lineCap = 'square';
    [
      [boxL, boxT + tkY, boxL, boxT, boxL + tkX, boxT],
      [boxR - tkX, boxT, boxR, boxT, boxR, boxT + tkY],
      [boxL, boxB - tkY, boxL, boxB, boxL + tkX, boxB],
      [boxR - tkX, boxB, boxR, boxB, boxR, boxB - tkY],
    ].forEach(([ax, ay, bx, by, cx, cy]) => {
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
    });

    ctx.fillStyle = '#ffffff';

    // measure artist mark height
    let mH = 0;
    if (showLogo) mH += safeH * (logoMode === 'logo' ? 28 : 16) * 2.0 / 100;
    if (showLogo && showText) mH += 0.6 * 2.0 * em;
    if (showText && artistName) {
      setDisplay(2.0);
      mH += wrapWords(ctx, artistName, innerW * 0.97).length * (2.0 * fontScale * em * 0.95);
    }

    const gapEM = 0.8 * em;
    const metas = [venue, [dateStr, timeStr].filter(Boolean).join(' · '), cta].filter(Boolean);
    const totalInner = mH + gapEM + 1 + gapEM * 0.5 + metas.length * (0.8 * em * 1.5);
    let cy = boxT + (bH - totalInner) / 2;

    fillArtistMark(x0, cy, 2.0, 'center');
    cy += mH + gapEM;

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(boxL + bW * 0.1, cy, bW * 0.8, 1);
    ctx.fillStyle = '#ffffff';
    cy += 1 + gapEM * 0.5;

    metas.forEach(line => { fillMeta(line, W / 2, cy, 0.8, 'center'); cy += 0.8 * em * 1.5; });
  }
```

- [ ] **Step 2: Verify export with "Stamp" preset. Confirm:**
  - Dark inset box with L-shaped corner ticks visible
  - Artist name centered above divider line
  - Venue/date/CTA centered and stacked below divider

- [ ] **Step 3: Commit**

```bash
git add src/export.jsx
git commit -m "feat: add poster-stamp canvas renderer for export"
```

---

## Task 7: Center Band — canvas export renderer

**Files:**
- Modify: `src/export.jsx`

- [ ] **Step 1: After the `poster-stamp` else-if block, add:**

```js
  else if (preset === 'center-band') {
    // measure artist mark height to size the band
    let mH = 0;
    if (showLogo) mH += safeH * (logoMode === 'logo' ? 28 : 16) * 1.9 / 100;
    if (showLogo && showText) mH += 0.6 * 1.9 * em;
    if (showText && artistName) {
      setDisplay(1.9);
      mH += wrapWords(ctx, artistName, innerW * 0.97).length * (1.9 * fontScale * em * 0.95);
    }
    const bandPadV = H * 0.05;
    const bandTop = H * 0.38;
    const bandH = mH + 2 * bandPadV;

    ctx.fillStyle = 'rgba(10,10,16,0.72)';
    ctx.fillRect(0, bandTop, W, bandH);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, bandTop, W, 1);
    ctx.fillRect(0, bandTop + bandH, W, 1);

    ctx.fillStyle = '#ffffff';
    fillArtistMark(x0, bandTop + bandPadV, 1.9, 'left');

    // meta above band
    const metaAbove = H * 0.10;
    fillMeta(venue, x0, metaAbove, 0.8, 'left');
    fillMeta(dateStr, x1, metaAbove, 0.8, 'right');

    // time below band
    if (timeStr) fillMeta(timeStr, x0, bandTop + bandH + H * 0.02, 0.8, 'left');

    // cta
    if (cta) fillMeta(cta, W / 2, H * 0.95 - 0.8 * em * 1.2, 0.8, 'center');
  }
```

- [ ] **Step 2: Verify export with "Mid Band" preset. Confirm:**
  - Full-width dark band with artist name inside
  - Venue top-left, date top-right above the band
  - Time below the band (if set)
  - CTA at the bottom

- [ ] **Step 3: Commit**

```bash
git add src/export.jsx
git commit -m "feat: add center-band canvas renderer for export"
```

---

## Task 8: Final visual pass

- [ ] **Step 1: Open the app. Cycle through all 8 presets with a loaded video, artist name, logo, venue, date, time, and CTA all filled in. Confirm no preset breaks another — particularly that the original 5 still render correctly.**

- [ ] **Step 2: Test with logo set to "Both" mode on the three new presets. Confirm the logo renders inside the frosted panel as expected.**

- [ ] **Step 3: Toggle the 4:5 aspect ratio view for each new preset. Confirm the overlays don't look broken at the narrower crop.**

- [ ] **Step 4: Commit any final fixes, then tag the feature complete.**

```bash
git add -p   # stage only relevant files
git commit -m "fix: visual pass adjustments for new layout presets"
```
