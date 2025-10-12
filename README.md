
# Date Range Filter Power BI Visual

A compact React + TypeScript date range slicer that is ready to import directly into Power BI. The visual keeps a tiny pill on
the canvas while projecting its rich preset rail and calendar outside the iframe through a lightweight `postMessage` portal.
This repository now ships everything required to package the `.pbiviz` artifact, exercise the outside-iframe behaviour in a
demo shell, and consume the underlying component library in other projects.

## Highlights

- **Production Power BI visual** – `src/visual/visual.tsx` implements the `PresetDateSlicerVisual` class that wires the
  React component into Power BI’s filtering APIs, honours format pane defaults, and persists state between sessions.
- **Preset rail + calendar** – Presets preview their range, keyboard navigation is available throughout the calendar, and drag
  style selections are simulated through hover previews.
- **Outside-iframe rendering** – `OutsideFramePortal` negotiates a host overlay via `postMessage` and renders the popover into
  the parent DOM. If the host declines, the portal automatically falls back to an in-iframe rendering path.

- **Accessibility** – Focus trap, live region announcements, ARIA-compliant buttons, and Monday-first calendar semantics.

## Repository layout

```
/src                 – Reusable component library & Power BI entry point
  ├─ components      – Pill, popover, calendar, presets
  ├─ portal          – Outside-frame portal implementation
  ├─ date            – Pure date helpers and presets
  ├─ styles          – CSS tokens + component styles
  └─ visual          – Power BI `IVisual` implementation
/demo                – Vite demo with parent + iframe visual
```

## Building the Power BI visual

1. Install dependencies in the repository root:

   ```bash
   cd demo
   npm install
   ```

2. Package the visual for Power BI Desktop / Service:

   ```bash
   npm run package:visual
   ```

   The compiled `.pbiviz` file will be generated inside `dist/`. Import it into Power BI like any other custom visual.

3. (Optional) Run `npm run build` to emit TypeScript declaration files for the reusable component API.

### Configuring defaults inside Power BI

Open the *Defaults → Default preset* property in the visual format pane to pick the initial range that appears whenever the
report loads or a consumer clears the slicer. Values map directly to the bundled preset identifiers (`today`, `yesterday`,
`last7`, `last30`, `thisMonth`, `lastMonth`, `mtd`, `qtd`, `ytd`, `lastYear`, `custom`). The visual persists the last applied
range in the hidden *State* object so readers return to their previous selection. Optional *Limits → Minimum/Maximum date*
settings clamp the interactive calendar and preset ranges, preventing selections outside your dataset.

The `PresetDateSlicerVisual` mirrors any existing report filters on the bound date column and merges new ranges via
`applyJsonFilter`, ensuring the host model always stays synchronised.

## Running the demo

The Vite workspace still offers a quick way to observe the outside-iframe handshake.

1. Install dependencies for the demo workspace:

   ```bash
   cd demo
   npm install
   ```

2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173/parent/` in your browser. The parent page embeds the visual iframe, exposes the overlay host,
   and lets you toggle between outside-frame and in-iframe rendering paths. The “Last applied” panel and the
   `DATE_RANGE_CHANGED` log verify behaviour.

To build a static bundle, run `npm run build` from `/demo` and serve the generated files in `demo/dist`.

## Library usage

If you need the component outside the packaged visual, copy the `/src` folder or publish it as an internal package. Render
`<DateRangeFilter />` inside your host, pass any min/max clamps, and forward changes back to the parent shell.

```tsx
import { DateRangeFilter, PRESETS, toISODate } from "@your-scope/date-range-filter";

<DateRangeFilter
  presets={PRESETS}
  dataMin={new Date(2021, 0, 1)}
  dataMax={new Date()}
  defaultPresetId={settings.defaults.defaultPreset}
  onChange={({ from, to }, presetId) => {
    window.parent.postMessage(
      {
        type: "DATE_RANGE_CHANGED",
        range: { from: toISODate(from), to: toISODate(to) },
        presetId,
      },
      "*",
    );
  }}
/>
```

### Host overlay handshake

To allow the popover to escape the iframe, the host page must:

1. Listen for `DATE_PICKER_PORTAL_REQUEST` messages and create an absolutely positioned container above the report surface.
2. Reply with `DATE_PICKER_PORTAL_READY` containing a DOM id. The visual portals into that element.
3. Apply ongoing position updates from `DATE_PICKER_PORTAL_GEOMETRY` and remove the container on
   `DATE_PICKER_PORTAL_UNMOUNT`.

The demo’s `/demo/src/parent.tsx` file shows a minimal overlay manager that you can adapt to your host shell.

### Default ranges when embedding outside Power BI

External consumers of the library (outside the packaged Power BI visual) can still pass `defaultPresetId` or a `defaultRange`
override as shown above. Both overrides respect `dataMin`/`dataMax` clamps and synchronise URL hash state and
`DATE_RANGE_CHANGED` messages, mirroring the in-visual behaviour.
