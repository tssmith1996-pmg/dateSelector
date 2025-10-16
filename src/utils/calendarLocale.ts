import { addLocale } from "primereact/api";

export const FALLBACK_LOCALE = "en";

const WEEKDAY_INDEX: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

type IntlLocaleWeekInfo = {
  weekInfo?: { firstDay?: string | string[] };
};

type IntlLocaleConstructor = new (tag: string) => IntlLocaleWeekInfo & { toString(): string };

const IntlLocaleCtor = (Intl as unknown as { Locale?: IntlLocaleConstructor }).Locale;

function canonicalizeLocale(locale: string): string | undefined {
  if (IntlLocaleCtor) {
    try {
      return new IntlLocaleCtor(locale).toString();
    } catch (error) {
      // Fall back to DateTimeFormat canonicalization.
    }
  }
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([locale]);
    return supported[0] ?? undefined;
  } catch (error) {
    return undefined;
  }
}

function resolveLocale(locale: string): string | undefined {
  try {
    const formatter = new Intl.DateTimeFormat(locale);
    return formatter.resolvedOptions().locale;
  } catch (error) {
    return undefined;
  }
}

function matchesResolvedLocale(candidate: string): string | undefined {
  const resolved = resolveLocale(candidate);
  if (!resolved) {
    return undefined;
  }
  const canonicalCandidate = canonicalizeLocale(candidate) ?? candidate;
  return resolved.toLowerCase() === canonicalCandidate.toLowerCase() ? canonicalCandidate : undefined;
}

export function normalizeLocaleTag(locale?: string): string {
  if (!locale) {
    return FALLBACK_LOCALE;
  }
  const sanitized = locale.trim().replace(/_/g, "-");
  if (!sanitized) {
    return FALLBACK_LOCALE;
  }
  const candidates = [sanitized];
  const canonical = canonicalizeLocale(sanitized);
  if (canonical) {
    candidates.unshift(canonical);
  }
  for (const candidate of candidates) {
    const match = matchesResolvedLocale(candidate);
    if (match) {
      return match;
    }
  }
  return FALLBACK_LOCALE;
}

export function getLocaleWeekStart(locale: string): number | undefined {
  if (!IntlLocaleCtor) {
    return undefined;
  }
  try {
    const info = new IntlLocaleCtor(locale);
    const firstDay = info.weekInfo?.firstDay;
    const normalize = (value: string) => {
      const key = value.toLowerCase();
      return key in WEEKDAY_INDEX ? WEEKDAY_INDEX[key as keyof typeof WEEKDAY_INDEX] : undefined;
    };
    if (Array.isArray(firstDay)) {
      for (const candidate of firstDay) {
        if (typeof candidate === "string") {
          const resolved = normalize(candidate);
          if (typeof resolved === "number") {
            return resolved;
          }
        }
      }
    } else if (typeof firstDay === "string") {
      return normalize(firstDay);
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
}

export function buildCalendarLocaleOptions(
  locale: string,
  weekStartsOn?: number,
  defaultWeekStart?: number,
) {
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

export function getLocaleRegistrationKeys(locale: string): string[] {
  const keys = new Set<string>();
  if (locale) {
    keys.add(locale);
    keys.add(locale.replace(/_/g, "-"));
    keys.add(locale.toLowerCase());
    keys.add(locale.replace(/_/g, "-").toLowerCase());
  }
  return Array.from(keys);
}

export function registerCalendarLocale(
  locale: string,
  options: ReturnType<typeof buildCalendarLocaleOptions>,
  fallbackOptions: ReturnType<typeof buildCalendarLocaleOptions>,
): string {
  const keys = getLocaleRegistrationKeys(locale);
  keys.forEach((key) => addLocale(key, options));
  addLocale(FALLBACK_LOCALE, fallbackOptions);
  return keys[0] ?? locale ?? FALLBACK_LOCALE;
}

