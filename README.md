# Preset Date Slicer (Power BI Custom Visual)

Preset Date Slicer is a Power BI custom visual that keeps slicer chrome off the canvas until you need it. A compact pill surfaces the currently applied range and preset, and expands into a two-column popup with rich presets, a keyboard-accessible calendar, and an optional comparison range.

## Highlights

- **Preset-first workflow** – Quickly jump between Today, Yesterday, Last 7/30 days, Month-to-date, Year-to-date, and Last Year. The preset bar mirrors the active selection so authors always know which rule is applied.
- **Comparison on demand** – Comparison mode is hidden by default and available behind a toggle. Turning it on reveals a second calendar so you can place a previous-period range next to the main range.
- **Inclusive calendars** – Date grids respect locale, week-start preference, min/max data bounds, and allow click, drag, or keyboard navigation. Continuous range highlighting keeps selection context obvious.
- **Clear, Apply, and Quick Today** – Apply is the only action that commits a filter back to the model. Clear resets the draft state to Custom, while the optional Today button immediately applies Today and closes the popup.
- **Format pane options** – Control the default preset, quick apply/clear buttons, comparison toggle visibility, locale, week start, pill size, and optional min/max clamps.

## Project structure

```
/ (root)
├── package.json
├── pbiviz.json
├── capabilities.json
├── styles/
│   ├── base.css
│   ├── calendar.css
│   └── popup.css
└── src/
    ├── components/
    │   ├── Calendar.tsx
    │   ├── ComparisonToggle.tsx
    │   ├── DateRangePill.tsx
    │   ├── FooterBar.tsx
    │   ├── Popup.tsx
    │   └── PresetList.tsx
    ├── logic/
    │   ├── dateUtils.ts
    │   ├── presets.ts
    │   └── state.ts
    ├── visual/
    │   ├── visual.ts
    │   └── visualHost.ts
    ├── global.d.ts
    └── index.ts
```

## Development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run linting and tests**
   ```bash
   npm run lint
   npm test
   ```
3. **Start the visual locally**
   ```bash
   npm start
   ```
   Attach `pbiviz start` to a sample report in Power BI Desktop (Developer Mode).
4. **Package for distribution**
   ```bash
   npm run package
   ```
   Bundled `.pbiviz` output is created in the `dist/` folder.

## Formatting pane

| Group      | Settings                                                                 |
|------------|--------------------------------------------------------------------------|
| Defaults   | Default preset, locale, week starts on                                   |
| Comparison | Show comparison toggle, comparison default on                            |
| Limits     | Minimum/maximum date clamps                                              |
| Pill       | Compact vs. expanded pill, show preset labels                            |
| Buttons    | Toggle Today quick-apply and Clear buttons                               |

State persistence is serialized into the hidden **State** object so bookmarks and sync slicer scenarios reopen with the correct ranges.

## Accessibility

- The popup traps focus and closes on <kbd>Esc</kbd> or outside click.
- Calendars expose `role="grid"` semantics, arrow key navigation, Page Up/Down for month/year jumps, and Home/End for week bounds.
- Active ranges use `aria-pressed`, while today exposes `aria-current="date"`.

## Comparison behaviour

- Comparison UI is hidden until toggled on via the preset column or the format pane setting.
- When active, the comparison range mirrors the length of the main range and defaults to the previous period.
- On narrow canvases the calendars stack vertically with a 16px gap; wider canvases show them side-by-side.

## License

MIT. See `LICENCE` for details.
