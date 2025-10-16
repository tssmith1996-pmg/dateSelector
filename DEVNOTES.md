# Date selector maintenance notes

## Locale registration

* `src/utils/calendarLocale.ts` centralizes locale normalization and PrimeReact locale registration. `normalizeLocaleTag` canonicalizes host/format pane input (underscores, casing, invalid tags) and always falls back to `en` if `Intl` cannot load the locale.
* `buildCalendarLocaleOptions` creates the `dayNames`, `monthNames`, and guaranteed `firstDayOfWeek`. The calendar component calls `registerCalendarLocale` during render so the PrimeReact calendar always sees a `firstDayOfWeek` value before it mounts.

## Dialog focus and background handling

* `src/components/Popover.tsx` now moves focus using `useLayoutEffect` and restores it on cleanup. This avoids Chrome's "Blocked aria-hidden" warning when `aria-modal="true"` is applied.
* `src/components/DateRangeFilter.tsx` sets `inert` on the visual root while the popover is open and restores the previous value when it closes. If the browser does not support `inert`, the plain attribute is toggled as a no-op.

## Calendar containment

* The PrimeReact calendar continues to render inline inside the popover (no portal). The locale registration changes ensure the inline calendar never throws on missing locale data, so it behaves the same inside the Power BI dialog.

