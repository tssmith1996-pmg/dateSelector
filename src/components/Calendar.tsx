import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as PrimeCalendar, CalendarPassThroughOptions } from "primereact/calendar";
import { addLocale } from "primereact/api";
import { FormEvent } from "primereact/ts-helpers";

import { ensureWithinRange, normalizeRange } from "../date";
import { DateRange } from "../types/dateRange";
import { formatTemplate } from "../utils/localization";

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

const FALLBACK_LOCALE = "en";

type IntlLocaleWeekInfo = {
  weekInfo?: { firstDay?: string | string[] };
};

const WEEKDAY_INDEX: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

function normalizeLocale(locale?: string): string {
  if (!locale) {
    return FALLBACK_LOCALE;
  }
  return locale.toLowerCase().replace("_", "-");
}

function getLocaleWeekStart(locale: string): number | undefined {
  const localeCtor = (Intl as unknown as { Locale?: new (tag: string) => IntlLocaleWeekInfo }).Locale;
  if (!localeCtor) {
    return undefined;
  }
  try {
    const info = new localeCtor(locale);
    const firstDay = info.weekInfo?.firstDay;
    if (Array.isArray(firstDay)) {
      const candidate = firstDay[0];
      if (typeof candidate === "string") {
        const key = candidate.toLowerCase();
        return key in WEEKDAY_INDEX ? WEEKDAY_INDEX[key as keyof typeof WEEKDAY_INDEX] : undefined;
      }
    }
    if (typeof firstDay === "string") {
      const key = firstDay.toLowerCase();
      return key in WEEKDAY_INDEX ? WEEKDAY_INDEX[key as keyof typeof WEEKDAY_INDEX] : undefined;
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
}

function buildLocaleOptions(locale: string, weekStartsOn?: number, defaultWeekStart?: number) {
  const formatterLocale = locale || FALLBACK_LOCALE;
  const baseSunday = new Date(Date.UTC(2021, 0, 3));
  const dayNames: string[] = [];
  const dayNamesShort: string[] = [];
  const dayNamesMin: string[] = [];

  const longDayFormatter = new Intl.DateTimeFormat(formatterLocale, { weekday: "long" });
  const shortDayFormatter = new Intl.DateTimeFormat(formatterLocale, { weekday: "short" });
  const narrowDayFormatter = new Intl.DateTimeFormat(formatterLocale, { weekday: "narrow" });

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(baseSunday);
    date.setDate(baseSunday.getDate() + index);
    dayNames.push(longDayFormatter.format(date));
    dayNamesShort.push(shortDayFormatter.format(date));
    dayNamesMin.push(narrowDayFormatter.format(date));
  }

  const monthNames: string[] = [];
  const monthNamesShort: string[] = [];

  const longMonthFormatter = new Intl.DateTimeFormat(formatterLocale, { month: "long" });
  const shortMonthFormatter = new Intl.DateTimeFormat(formatterLocale, { month: "short" });

  for (let month = 0; month < 12; month += 1) {
    const date = new Date(Date.UTC(2021, month, 1));
    monthNames.push(longMonthFormatter.format(date));
    monthNamesShort.push(shortMonthFormatter.format(date));
  }

  return {
    dayNames,
    dayNamesShort,
    dayNamesMin,
    monthNames,
    monthNamesShort,
    firstDayOfWeek: weekStartsOn ?? defaultWeekStart ?? 0,
  };
}

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
  const normalizedLocale = normalizeLocale(locale);

  const activeLocale = useMemo(() => {
    try {
      new Intl.DateTimeFormat(normalizedLocale).format(new Date());
      return normalizedLocale;
    } catch (error) {
      return FALLBACK_LOCALE;
    }
  }, [normalizedLocale]);

  const localeWeekStart = useMemo(() => getLocaleWeekStart(activeLocale), [activeLocale]);

  const localeOptions = useMemo(
    () => buildLocaleOptions(activeLocale, weekStartsOn, localeWeekStart),
    [activeLocale, localeWeekStart, weekStartsOn],
  );

  useEffect(() => {
    addLocale(normalizedLocale, localeOptions);
  }, [localeOptions, normalizedLocale]);

  const monthLabelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(activeLocale, {
        month: "long",
        year: "numeric",
      }),
    [activeLocale],
  );

  const dayLabelFormatter: DayLabelFormatter = useMemo(
    () => new Intl.DateTimeFormat(activeLocale, { dateStyle: "full" }),
    [activeLocale],
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
      dayLabel: (options) => {
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
        locale={normalizedLocale}
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

