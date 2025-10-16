import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as PrimeCalendar, CalendarPassThroughOptions } from "primereact/calendar";
import { FormEvent } from "primereact/ts-helpers";

import { ensureWithinRange, normalizeRange } from "../date";
import { DateRange } from "../types/dateRange";
import { formatTemplate } from "../utils/localization";
import {
  FALLBACK_LOCALE,
  buildCalendarLocaleOptions,
  getLocaleWeekStart,
  normalizeLocaleTag,
  registerCalendarLocale,
} from "../utils/calendarLocale";

import "../styles/primereact.css";
import "../styles/calendar.css";

type Props = {
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

type RangeChangeEvent = FormEvent<(Date | null)[]>;

type DayLabelFormatter = Intl.DateTimeFormat;

type ViewDateChangeEvent = {
  value: Date;
};

function toCalendarValue(range: DateRange): (Date | null)[] {
  return [range.from ? new Date(range.from) : null, range.to ? new Date(range.to) : null];
}

function coerceDate(value: string | number | Date | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export const Calendar: React.FC<Props> = ({
  range,
  onRangeChange,
  locale,
  dataMin,
  dataMax,
  weekStartsOn,
  strings,
}) => {
  const normalizedLocale = useMemo(() => normalizeLocaleTag(locale), [locale]);
  const localeWeekStart = useMemo(() => getLocaleWeekStart(normalizedLocale), [normalizedLocale]);
  const localeOptions = useMemo(
    () => buildCalendarLocaleOptions(normalizedLocale, weekStartsOn, localeWeekStart),
    [localeWeekStart, normalizedLocale, weekStartsOn],
  );
  const fallbackOptions = useMemo(
    () => buildCalendarLocaleOptions(FALLBACK_LOCALE, weekStartsOn, localeWeekStart),
    [localeWeekStart, weekStartsOn],
  );
  const calendarLocale = useMemo(
    () => registerCalendarLocale(normalizedLocale, localeOptions, fallbackOptions),
    [fallbackOptions, localeOptions, normalizedLocale],
  );

  const monthLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(normalizedLocale, {
        month: "long",
        year: "numeric",
      }),
    [normalizedLocale],
  );

  const dayLabelFormatter: DayLabelFormatter = useMemo(
    () => new Intl.DateTimeFormat(normalizedLocale, { dateStyle: "full" }),
    [normalizedLocale],
  );

  const [viewDate, setViewDate] = useState<Date>(() => new Date(range.from));

  useEffect(() => {
    setViewDate(new Date(range.from));
  }, [range.from]);

  const ariaLabel = useMemo(() => {
    const monthLabel = monthLabelFormatter.format(viewDate);
    return formatTemplate(strings.ariaLabelTemplate, monthLabel);
  }, [monthLabelFormatter, strings.ariaLabelTemplate, viewDate]);

  const passThrough = useMemo<CalendarPassThroughOptions>(
    () => ({
      previousButton: {
        root: {
          "aria-label": strings.previousMonth,
          title: strings.previousMonth,
        },
      },
      nextButton: {
        root: {
          "aria-label": strings.nextMonth,
          title: strings.nextMonth,
        },
      },
      dayLabel: (options: { context?: { date?: Date | Date[] } }) => {
        const rawContext = options?.context?.date;
        const rawDate = Array.isArray(rawContext) ? rawContext[0] : rawContext;
        const parsed = coerceDate(rawDate as Date | string | number | null | undefined);
        if (!parsed) {
          return {};
        }
        return {
          "aria-label": dayLabelFormatter.format(parsed),
        };
      },
    }),
    [dayLabelFormatter, strings.nextMonth, strings.previousMonth],
  );

  const handleChange = useCallback(
    (event: RangeChangeEvent) => {
      const value = event.value ?? [];
      const start = value[0] ?? value[1] ?? null;
      const end = value[1] ?? value[0] ?? null;

      if (!start && !end) {
        return;
      }

      if (start && !end) {
        const normalized = ensureWithinRange(normalizeRange(start, start), dataMin, dataMax);
        onRangeChange(normalized);
        return;
      }

      if (start && end) {
        const normalized = ensureWithinRange(normalizeRange(start, end), dataMin, dataMax);
        onRangeChange(normalized);
      }
    },
    [dataMax, dataMin, onRangeChange],
  );

  const handleViewDateChange = useCallback((event: ViewDateChangeEvent) => {
    setViewDate(new Date(event.value));
  }, []);

  const calendarValue = useMemo(() => toCalendarValue(range), [range]);

  const minDate = useMemo(() => (dataMin ? new Date(dataMin) : undefined), [dataMin]);
  const maxDate = useMemo(() => (dataMax ? new Date(dataMax) : undefined), [dataMax]);

  return (
    <div className="calendar" aria-label={ariaLabel}>
      <PrimeCalendar
        value={calendarValue}
        onChange={handleChange}
        onViewDateChange={handleViewDateChange}
        selectionMode="range"
        numberOfMonths={2}
        inline
        locale={calendarLocale}
        minDate={minDate}
        maxDate={maxDate}
        pt={passThrough}
        panelClassName="calendar__panel"
        showOtherMonths
        selectOtherMonths
      />
    </div>
  );
};

