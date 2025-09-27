# Aurora Date Picker (Power BI Custom Visual)

Aurora Date Picker is a Power BI slicer built to deliver the rich presets, multi-range filtering, and styling flexibility showcased by best-in-class date pickers—while remaining lightweight and fully accessible. The visual is implemented from scratch using React, custom date-math utilities, and CSS Modules.

## Highlights

- **Selection modes** – Toggle between single-date, range, start-only, or end-only entry. Optional multi-range mode renders removable chips and applies all selected periods as a unioned filter.
- **Display flexibility** – Switch between popup trigger and always-on-canvas layouts without rebinding your field.
- **Preset engine** – Ship built-ins such as Today, Last Week, Year to Date, and Current Year. Add custom expressions (JSON) or drive defaults from the data model via expressions like `TODAY - 6 DAYS..TODAY` or `STARTOFMONTH - 1 MONTHS`.
- **Relative date parser** – Grammar supports `TODAY +/- N {days|weeks|months|quarters|years}`, `STARTOF{Month|Quarter|Year}`, `ENDOF…`, and combined ranges with `..` or `TO`.
- **Holidays & weekends** – Paste comma/line-separated ISO dates with optional labels; toggle weekend styling colors.
- **Themes & formatting** – Fifteen theme JSON presets provide instant restyling of colors and shapes. Fine-tune font, padding, border radius, and accent behavior from the formatting pane.
- **Accessibility** – ARIA-compliant calendar grid, keyboard navigation, and high-contrast theme options. Popup mode respects Escape and focus trapping.
- **Power BI integration** – Uses the selection/filter API, persists state for bookmarks and sync slicer, and serializes configuration through formatting objects.

## Visual States

Aurora Date Picker ships with multiple interaction patterns that adapt to report layouts. The SVG mockups below mirror the Power BI rendering pipeline so you can see exactly how each state appears inside a report canvas.

### Popup trigger

![Popup trigger state showing compact button and summary](readme_files/state-popup-trigger.svg)

### Popup · single date selection

![Popup single date calendar with one day chosen](readme_files/state-single-date.svg)

### Range selection preview

![Range selection preview with anchor and hovered end date](readme_files/state-range-selection.svg)

### Multi-range with removable chips

![Multiple ranges applied with removable chips below the calendar](readme_files/state-multi-range.svg)

### Canvas layout with presets

![Always-on canvas calendar with preset buttons, weekends, and holidays](readme_files/state-canvas.svg)

The canvas layout now mirrors the Power BI experience shown above. The sidebar summarizes the active selection, highlights min/max data bounds, and stacks presets vertically, while the right panel adds a toolbar with "Today", "Clear", and "Apply" actions, manual date fields, the calendar grid, and multi-range chips.

#### Canvas wireframe

![Annotated wireframe showing sidebar, toolbar, inputs, and calendar grid](readme_files/canvas-wireframe.svg)

Use this wireframe when aligning your Power BI report canvas: place the preset column at ~220px width, reserve the top toolbar row for quick actions, and position the date fields directly above the calendar for the cleanest balance between controls and grid real estate.

## Project Structure

```
/ (root)
├── package.json
├── pbiviz.json
├── capabilities.json
├── tsconfig.json
├── jest.config.cjs
├── assets/
│   ├── icon.svg
│   └── themes/*.json (15 presets)
├── src/
│   ├── index.ts
│   ├── visual.tsx
│   ├── dateMath.ts
│   ├── presets.ts
│   ├── types.ts
│   ├── calendar/
│   │   ├── Calendar.tsx
│   │   ├── CalendarGrid.tsx
│   │   ├── DayCell.tsx
│   │   ├── PresetBar.tsx
│   │   ├── ChipsBar.tsx
│   │   └── Popup.tsx
│   └── styles/
│       ├── calendar.module.css
│       ├── buttons.module.css
│       └── chips.module.css
└── test/
    ├── dateMath.spec.ts
    ├── presets.spec.ts
    ├── serialization.spec.ts
    └── mocks/styleMock.js
```

## Getting Started

1. **Install prerequisites**
   - Node.js 18+
   - [Power BI Visuals Tools (`pbiviz` CLI)](https://www.npmjs.com/package/powerbi-visuals-tools)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run linting and tests**
   ```bash
   npm run lint
   npm test
   ```

4. **Launch the visual locally**
   ```bash
   npm start
   ```
   This hosts the visual with live reload. Attach `pbiviz start` to a sample report in Power BI Desktop (Developer Mode).

5. **Package for distribution**
   ```bash
   npm run package
   ```
   Output `.pbiviz` artifacts land in the `dist/` folder (signed if you configure a certificate in `pbiviz.json`).

## Configuration Overview

### Data binding

Bind a single Date column to the **Date** field well. The visual respects model-supplied min/max and serializes state so bookmarks, sync slicer, and refresh scenarios keep their selections.

### Formatting pane objects

- **General** – Switch between popup/canvas, selection mode, multi-range, and first-day-of-week. Optional min/max clamps accept ISO strings.
- **Presets** – Toggle the preset bar, provide custom preset JSON, and set default preset or expression.
- **Calendar Styles** – Adjust weekend highlighting, colors, font family/size, padding, radius, today outline, and theme preset name (matching a JSON file in `assets/themes`).
- **Holidays** – Provide a comma/line-separated list of dates (`YYYY-MM-DD|Optional Label`).
- **State** – Internal persisted payload (read-only) for troubleshooting bookmarks/sync slicer scenarios.

### Adding custom presets

Supply an array of objects in the **Preset list (JSON)** property:

```json
[
  { "key": "last3m", "label": "Last 3 Months", "expression": "STARTOFMONTH - 2 MONTHS..ENDOFMONTH" },
  { "key": "qtd", "label": "Quarter to Date", "expression": "STARTOFQUARTER..TODAY" }
]
```

### Holiday sources

Paste text such as:

```
2024-01-01|New Year
2024-05-27|Memorial Day
2024-07-04
```

Each date is decorated with a marker and tooltip.

### Themes

Choose a theme name that matches one of the JSON files in `assets/themes`. The visual loads the token set at runtime to adjust colors and chip styling instantly. You can also bundle your own JSON file (matching the schema) in the same folder and reference its filename (without extension).

## Demo Report Scenarios

1. **Executive Overview** – Place the visual in popup mode with presets (Today, Last Week, Last 30 Days) to drive KPI cards.
2. **Financial Close Tracker** – Use canvas mode, multi-range enabled, and a holiday list to monitor blackout periods.
3. **Subscription Analysis** – Provide default selection `LAST 90 DAYS` with a custom preset `Rolling 6 Months`. Combine with chips to compare seasons.

## Testing Philosophy

- `test/dateMath.spec.ts` ensures the relative date grammar behaves as expected for anchored ranges.
- `test/presets.spec.ts` validates preset merging and resolution, preventing duplicate keys.
- `test/serialization.spec.ts` covers serialization of ranges/state for bookmarks and sync slicer compatibility.

Run `npm test` to execute the suite via Jest + ts-jest.

## Build & Packaging Commands

```bash
# install dependencies
npm install

# lint source files
npm run lint

# execute unit tests
npm test

# live development host
npm start

# production build (.pbiviz)
npm run package
```

## License

MIT License. See `LICENCE` for details.

## Support

Create an issue or discussion in your repository of choice, or extend the visual by editing the TypeScript/React components in `src/` and bundling via `pbiviz package`.
