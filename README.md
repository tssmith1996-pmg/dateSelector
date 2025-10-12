# Date Range Filter for Power BI Visuals

A compact React + TypeScript date range control designed for Power BI custom visuals. The component keeps a small pill on the
canvas while projecting its calendar and preset popover outside the visual iframe through a lightweight postMessage portal. The
repo contains both the reusable library code (`/src`) and a Vite-powered demo (`/demo`) that simulates the Power BI host
handshake.

## Highlights

- **Pill-first UI** – Minimal pill with calendar icon, range text, and chevron. Clicking opens a rich popover.
- **Preset rail + calendar** – Presets highlight softly, preview the range, and require Apply to commit. A keyboard-accessible
  calendar supports click, hover preview, drag-like selection, and arrow/PageUp/PageDown navigation.
- **Outside-iframe rendering** – `OutsideFramePortal` negotiates a host overlay via `postMessage` and renders the popover into the
  parent DOM. A 150 ms timeout automatically falls back to an in-iframe portal if the host does not respond.
- **URL + messaging** – Applied ranges update `location.hash` (`from`/`to`) and emit `DATE_RANGE_CHANGED` messages to
  `window.parent`.
- **Accessibility** – Focus trap, live region announcements, ARIA-compliant buttons, and Monday-first calendar semantics.

## Repository layout

```
/src                 – Reusable component library
  ├─ components      – Pill, popover, calendar, presets
  ├─ portal          – Outside-frame portal implementation
  ├─ date            – Pure date helpers and presets
  └─ styles          – CSS tokens + component styles
/demo                – Vite demo with parent + iframe visual
  ├─ parent          – Host page exposing the overlay manager
  └─ visual          – Iframe entry that renders the filter
```

## Running the demo

1. Install dependencies for the demo workspace:
   ```bash
   cd demo
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173/parent/` in your browser. The parent page embeds the visual iframe, exposes the overlay host, and
   lets you toggle between outside-frame and in-iframe rendering paths. The “Last applied” panel and the `DATE_RANGE_CHANGED`
   log verify behaviour.

To build a static bundle, run `npm run build` from `/demo` and serve the generated files in `demo/dist`.

## Library usage

Install the library code into your Power BI custom visual (copy the `/src` folder or publish it as an internal package). Render
`<DateRangeFilter />` inside your visual entry point, pass any min/max clamps, and forward changes back to the host.

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

## Integration snippet

Drop the component into your visual and wire it to the parent overlay protocol:

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

In the report host (e.g., a custom Power BI add-in), add a small overlay manager similar to the demo: watch for
`DATE_PICKER_PORTAL_REQUEST`, create a floating container aligned to the pill, respond with `DATE_PICKER_PORTAL_READY`, and keep
its position in sync via subsequent geometry messages. If the host does not provide the overlay, the component automatically
falls back to an internal `document.body` portal so authors can still interact with the popover.

### Default ranges from Power BI settings

Use the visual’s *Defaults → Default preset* property to pick the initial range that should appear whenever the report loads or
when a user clears the filter. The property panel values map directly to the bundled preset identifiers (e.g. `today`,
`yesterday`, `last7`, `last30`, `thisMonth`, `lastMonth`, `mtd`, `qtd`, `ytd`, `lastYear`, `custom`). You can also pass a
`defaultRange={{ from, to }}` override if you need to seed the picker with a custom range that is not represented by a preset.
Both overrides respect `dataMin`/`dataMax` clamps and synchronise URL hash state and `DATE_RANGE_CHANGED` messages automatically.
