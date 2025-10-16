import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider, ThemeOptions, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import { PickerSelectionState } from "@mui/x-date-pickers/internals";
import dayjs, { Dayjs } from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/en";

import { ensureWithinRange, normalizeRange } from "../date";
import { DateRange } from "../types/dateRange";
import { formatTemplate } from "../utils/localization";

import "../styles/calendar.css";

dayjs.extend(updateLocale);

type CalendarProps = {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  locale: string;
  dataMin?: Date;
  dataMax?: Date;
  weekStartsOn?: number;
  strings: {
    previousMonth: string;
    nextMonth: string;
    ariaLabelTemplate: string;
  };
};

const FALLBACK_LOCALE = "en";

const loadedLocales = new Set<string>([FALLBACK_LOCALE]);

function normalizeLocale(locale?: string): string {
  if (!locale) {
    return FALLBACK_LOCALE;
  }
  return locale.toLowerCase().replace("_", "-");
}

async function loadLocale(locale: string): Promise<string> {
  const normalized = normalizeLocale(locale);
  const candidates = [normalized, normalized.split("-")[0]].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (loadedLocales.has(candidate)) {
      dayjs.locale(candidate);
      return candidate;
    }

    try {
      await import(
        /* webpackChunkName: "dayjs-locale-[request]" */ `dayjs/locale/${candidate}.js`
      );
      loadedLocales.add(candidate);
      dayjs.locale(candidate);
      return candidate;
    } catch (error) {
      // Continue trying fallback candidates
    }
  }

  dayjs.locale(FALLBACK_LOCALE);
  return FALLBACK_LOCALE;
}

function toDayjs(date: Date | undefined, locale: string): Dayjs | null {
  if (!date) {
    return null;
  }
  return dayjs(date).locale(locale);
}

type DayjsRangeValue = [Dayjs | null, Dayjs | null];

function formatVisibleMonth(value: DayjsRangeValue | null, locale: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const start = value[0];
  if (!start) {
    return undefined;
  }

  return start.locale(locale).format("MMMM YYYY");
}

export const Calendar: React.FC<CalendarProps> = ({
  range,
  onRangeChange,
  locale,
  dataMin,
  dataMax,
  weekStartsOn,
  strings,
}) => {
  const [activeLocale, setActiveLocale] = useState<string>(FALLBACK_LOCALE);
  const [pickerValue, setPickerValue] = useState<DayjsRangeValue>([
    toDayjs(range.from, FALLBACK_LOCALE),
    toDayjs(range.to, FALLBACK_LOCALE),
  ]);
  const [visibleMonthLabel, setVisibleMonthLabel] = useState<string | undefined>(
    formatVisibleMonth(pickerValue, FALLBACK_LOCALE),
  );

  useEffect(() => {
    let isMounted = true;
    loadLocale(locale)
      .then((resolved) => {
        if (!isMounted) {
          return;
        }
        if (weekStartsOn != null) {
          dayjs.updateLocale(resolved, { weekStart: weekStartsOn });
        }
        setActiveLocale(resolved);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        if (weekStartsOn != null) {
          dayjs.updateLocale(FALLBACK_LOCALE, { weekStart: weekStartsOn });
        }
        setActiveLocale(FALLBACK_LOCALE);
      });

    return () => {
      isMounted = false;
    };
  }, [locale, weekStartsOn]);

  useEffect(() => {
    const nextValue: DayjsRangeValue = [
      toDayjs(range.from, activeLocale),
      toDayjs(range.to, activeLocale),
    ];
    setPickerValue(nextValue);
    setVisibleMonthLabel(formatVisibleMonth(nextValue, activeLocale));
  }, [range.from, range.to, activeLocale]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "var(--visual-accent, #2563eb)",
            contrastText: "var(--visual-accent-text, #ffffff)",
          },
          text: {
            primary: "var(--visual-text, #0f172a)",
            secondary: "var(--visual-text-muted, #64748b)",
          },
          background: {
            paper: "var(--visual-surface, #ffffff)",
          },
          divider: "var(--visual-border, rgba(15, 23, 42, 0.12))",
        },
        typography: {
          fontFamily: "inherit",
          fontSize: 14,
        },
        components: {
          MuiPickersCalendarHeader: {
            styleOverrides: {
              label: {
                color: "var(--visual-text, #0f172a)",
                fontWeight: 600,
              },
              switchViewButton: {
                color: "var(--visual-text, #0f172a)",
              },
            },
          },
          MuiPickersDay: {
            styleOverrides: {
              root: {
                fontSize: "1rem",
              },
              today: {
                borderColor: "var(--visual-accent, #2563eb)",
              },
              dayWithMargin: {
                margin: 0,
              },
            },
          },
          MuiDateRangePickerDay: {
            styleOverrides: {
              rangeIntervalDayHighlight: {
                backgroundColor: "var(--visual-accent, #2563eb)",
                color: "var(--visual-accent-text, #ffffff)",
              },
              rangeIntervalDayHighlightStart: {
                borderRadius: "var(--ds-radius-small, 6px) 0 0 var(--ds-radius-small, 6px)",
              },
              rangeIntervalDayHighlightEnd: {
                borderRadius: "0 var(--ds-radius-small, 6px) var(--ds-radius-small, 6px) 0",
              },
              rangeIntervalPreview: {
                borderColor: "var(--visual-accent, rgba(37, 99, 235, 0.3))",
              },
              rangeIntervalDayPreview: {
                borderColor: "var(--visual-accent, rgba(37, 99, 235, 0.3))",
              },
            },
          },
        },
      } as ThemeOptions),
    [],
  );

  const handleChange = useCallback(
    (value: DayjsRangeValue, _selectionState?: PickerSelectionState) => {
      setPickerValue(value);

      const [start, end] = value;
      if (!start && !end) {
        return;
      }

      if (start && !end) {
        const normalized = ensureWithinRange(
          normalizeRange(start.toDate(), start.toDate()),
          dataMin,
          dataMax,
        );
        onRangeChange(normalized);
        return;
      }

      if (start && end) {
        const normalized = ensureWithinRange(
          normalizeRange(start.toDate(), end.toDate()),
          dataMin,
          dataMax,
        );
        onRangeChange(normalized);
      }
    },
    [dataMax, dataMin, onRangeChange],
  );

  const minDate = useMemo(() => (dataMin ? dayjs(dataMin) : undefined), [dataMin]);
  const maxDate = useMemo(() => (dataMax ? dayjs(dataMax) : undefined), [dataMax]);

  const ariaLabel = useMemo(() => {
    if (!visibleMonthLabel) {
      return undefined;
    }
    return formatTemplate(strings.ariaLabelTemplate, visibleMonthLabel);
  }, [strings.ariaLabelTemplate, visibleMonthLabel]);

  const handleMonthChange = useCallback(
    (month: Dayjs) => {
      setVisibleMonthLabel(month.locale(activeLocale).format("MMMM YYYY"));
    },
    [activeLocale],
  );

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={activeLocale}
        localeText={{
          previousMonth: strings.previousMonth,
          nextMonth: strings.nextMonth,
        }}
      >
        <Box className="calendar" aria-label={ariaLabel}>
          <DateRangeCalendar
            value={pickerValue}
            onChange={handleChange}
            onMonthChange={handleMonthChange}
            minDate={minDate}
            maxDate={maxDate}
            calendars={2}
            slotProps={{
              previousIconButton: {
                "aria-label": strings.previousMonth,
              },
              nextIconButton: {
                "aria-label": strings.nextMonth,
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

