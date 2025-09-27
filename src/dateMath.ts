import {
  PresetContext,
  DateRange,
  PresetResolutionResult,
  SerializableDateRange,
} from "./types";

const UNIT_TO_DAYS: Record<string, number> = {
  days: 1,
  weeks: 7,
};

type DateUnit = "days" | "weeks" | "months" | "quarters" | "years";

type Anchor =
  | "TODAY"
  | "YESTERDAY"
  | "TOMORROW"
  | "STARTOFMONTH"
  | "ENDOFMONTH"
  | "STARTOFQUARTER"
  | "ENDOFQUARTER"
  | "STARTOFYEAR"
  | "ENDOFYEAR";

interface ParseResult {
  start: Date;
  end: Date;
}

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const RANGE_SEPARATOR = /\.\.|\s+TO\s+/i;

const PRESET_ALIAS: Record<string, string> = {
  YESTERDAY: "TODAY - 1 DAYS",
  TOMORROW: "TODAY + 1 DAYS",
  "LAST 7 DAYS": "TODAY - 6 DAYS..TODAY",
  "LAST 14 DAYS": "TODAY - 13 DAYS..TODAY",
  "LAST 30 DAYS": "TODAY - 29 DAYS..TODAY",
  "LAST 90 DAYS": "TODAY - 89 DAYS..TODAY",
  "LAST WEEK": "STARTOFWEEK - 1 WEEKS..ENDOFWEEK - 1 WEEKS",
  "THIS WEEK": "STARTOFWEEK..ENDOFWEEK",
  "THIS MONTH": "STARTOFMONTH..ENDOFMONTH",
  "LAST MONTH": "STARTOFMONTH - 1 MONTHS..ENDOFMONTH - 1 MONTHS",
  "THIS QUARTER": "STARTOFQUARTER..ENDOFQUARTER",
  "LAST QUARTER": "STARTOFQUARTER - 1 QUARTERS..ENDOFQUARTER - 1 QUARTERS",
  "YTD": "STARTOFYEAR..TODAY",
  "CURRENT YEAR": "STARTOFYEAR..ENDOFYEAR",
  "PREVIOUS YEAR": "STARTOFYEAR - 1 YEARS..ENDOFYEAR - 1 YEARS",
};

const START_OF_WEEK_TOKEN = "STARTOFWEEK";
const END_OF_WEEK_TOKEN = "ENDOFWEEK";

const isAnchor = (value: string): value is Anchor => {
  return (
    value === "TODAY" ||
    value === "YESTERDAY" ||
    value === "TOMORROW" ||
    value === "STARTOFMONTH" ||
    value === "ENDOFMONTH" ||
    value === "STARTOFQUARTER" ||
    value === "ENDOFQUARTER" ||
    value === "STARTOFYEAR" ||
    value === "ENDOFYEAR"
  );
};

const clampToScope = (date: Date, context: PresetContext): Date => {
  const result = new Date(date.getTime());
  if (context.min && result < context.min) {
    return new Date(context.min.getTime());
  }
  if (context.max && result > context.max) {
    return new Date(context.max.getTime());
  }
  return result;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfQuarter = (date: Date) => {
  const month = date.getMonth();
  const startMonth = month - (month % 3);
  return new Date(date.getFullYear(), startMonth, 1);
};
const endOfQuarter = (date: Date) => {
  const start = startOfQuarter(date);
  return new Date(start.getFullYear(), start.getMonth() + 3, 0);
};
const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);
const endOfYear = (date: Date) => new Date(date.getFullYear(), 12, 0);

const startOfWeek = (date: Date, firstDay: number) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diff = (day - firstDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
};

const endOfWeek = (date: Date, firstDay: number) => {
  const start = startOfWeek(date, firstDay);
  start.setDate(start.getDate() + 6);
  return start;
};

const shiftDate = (date: Date, amount: number, unit: DateUnit, firstDay: number) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  switch (unit) {
    case "days":
    case "weeks": {
      const days = amount * (UNIT_TO_DAYS[unit] ?? 1);
      result.setDate(result.getDate() + days);
      return result;
    }
    case "months": {
      const target = new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
      const endMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0);
      if (target.getDate() < date.getDate()) {
        return endMonth;
      }
      return target;
    }
    case "quarters": {
      return shiftDate(date, amount * 3, "months", firstDay);
    }
    case "years": {
      const target = new Date(date.getFullYear() + amount, date.getMonth(), date.getDate());
      if (date.getMonth() === 1 && date.getDate() === 29 && target.getMonth() === 2) {
        target.setDate(28);
      }
      return target;
    }
    default:
      return result;
  }
};

const parseUnit = (raw: string): DateUnit | null => {
  const normalized = raw.trim().toLowerCase();
  switch (normalized) {
    case "day":
    case "days":
      return "days";
    case "week":
    case "weeks":
      return "weeks";
    case "month":
    case "months":
      return "months";
    case "quarter":
    case "quarters":
      return "quarters";
    case "year":
    case "years":
      return "years";
    default:
      return null;
  }
};

const trimAndCollapse = (value: string) => value.trim().replace(/\s+/g, " ");

const parseAnchor = (token: string, context: PresetContext): Date => {
  const today = context.today;
  if (token === START_OF_WEEK_TOKEN) {
    return startOfWeek(today, context.firstDayOfWeek);
  }
  if (token === END_OF_WEEK_TOKEN) {
    return endOfWeek(today, context.firstDayOfWeek);
  }
  if (!isAnchor(token)) {
    return new Date(today.getTime());
  }

  switch (token) {
    case "TODAY":
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    case "YESTERDAY":
      return shiftDate(new Date(today), -1, "days", context.firstDayOfWeek);
    case "TOMORROW":
      return shiftDate(new Date(today), 1, "days", context.firstDayOfWeek);
    case "STARTOFMONTH":
      return startOfMonth(today);
    case "ENDOFMONTH":
      return endOfMonth(today);
    case "STARTOFQUARTER":
      return startOfQuarter(today);
    case "ENDOFQUARTER":
      return endOfQuarter(today);
    case "STARTOFYEAR":
      return startOfYear(today);
    case "ENDOFYEAR":
      return endOfYear(today);
    default:
      return new Date(today.getTime());
  }
};

const parseExpression = (
  expression: string,
  context: PresetContext,
  baseDate?: Date
): Date => {
  const normalized = expression.trim().toUpperCase();
  const alias = PRESET_ALIAS[normalized];
  if (alias) {
    const aliasResult = resolve(alias, context);
    return aliasResult.range?.start ?? clampToScope(context.today, context);
  }

  if (ISO_DATE_REGEX.test(normalized)) {
    const [year, month, day] = normalized.split("-").map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  const sanitized = normalized.replace(/([+-])/g, " $1 ");
  const tokens = sanitized.split(/\s+/);
  if (tokens.length === 0) {
    return clampToScope(context.today, context);
  }

  let anchorDate: Date;
  let cursor = 0;
  const peek = () => tokens[cursor];
  const consume = () => tokens[cursor++];

  const token = peek();
  if (!token) {
    return clampToScope(context.today, context);
  }

  if (token === START_OF_WEEK_TOKEN || token === END_OF_WEEK_TOKEN || isAnchor(token)) {
    consume();
    anchorDate = baseDate ?? parseAnchor(token, context);
  } else if (token === "START") {
    consume();
    const ofToken = consume();
    if (ofToken !== "OF" && !ofToken?.startsWith("OF")) {
      return clampToScope(context.today, context);
    }
    const rest = consume();
    const anchorToken = `STARTOF${rest ?? ""}`;
    anchorDate = baseDate ?? parseAnchor(anchorToken, context);
  } else if (token === "END") {
    consume();
    const ofToken = consume();
    if (ofToken !== "OF" && !ofToken?.startsWith("OF")) {
      return clampToScope(context.today, context);
    }
    const rest = consume();
    const anchorToken = `ENDOF${rest ?? ""}`;
    anchorDate = baseDate ?? parseAnchor(anchorToken, context);
  } else {
    anchorDate = baseDate ?? clampToScope(context.today, context);
  }

  while (cursor < tokens.length) {
    const signToken = consume();
    if (signToken !== "+" && signToken !== "-") {
      break;
    }

    const magnitudeToken = consume();
    if (!magnitudeToken) {
      break;
    }
    const magnitude = parseInt(magnitudeToken, 10);
    if (isNaN(magnitude)) {
      break;
    }

    const unitToken = consume();
    if (!unitToken) {
      break;
    }
    const unit = parseUnit(unitToken);
    if (!unit) {
      break;
    }

    const delta = signToken === "+" ? magnitude : -magnitude;
    anchorDate = shiftDate(anchorDate, delta, unit, context.firstDayOfWeek);
  }

  return anchorDate;
};

const resolve = (expression: string, context: PresetContext): PresetResolutionResult => {
  const normalized = trimAndCollapse(expression.toUpperCase());
  if (!normalized) {
    return { range: null, error: "Empty expression" };
  }

  const alias = PRESET_ALIAS[normalized];
  if (alias) {
    return resolve(alias, context);
  }

  const parts = normalized.split(RANGE_SEPARATOR).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { range: null, error: "Unable to parse expression" };
  }

  if (parts.length === 1) {
    const date = parseExpression(parts[0], context);
    const clamped = clampToScope(date, context);
    return { range: { start: clamped, end: clamped } };
  }

  const startExpression = parts[0];
  const endExpression = parts[parts.length - 1];

  let startDate = parseExpression(startExpression, context);
  let endDate = parseExpression(endExpression, context);

  if (endDate < startDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  startDate = clampToScope(startDate, context);
  endDate = clampToScope(endDate, context);

  return { range: { start: startDate, end: endDate } };
};

export const parseDateMath = (
  expression: string,
  context: PresetContext
): PresetResolutionResult => {
  try {
    return resolve(expression, context);
  } catch (error) {
    return { range: null, error: (error as Error).message };
  }
};

export const formatDateRange = (range: DateRange): string => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return `${formatter.format(range.start)} – ${formatter.format(range.end)}`;
};

export const serializeRange = (range: DateRange): SerializableDateRange => ({
  start: range.start.toISOString().substring(0, 10),
  end: range.end.toISOString().substring(0, 10),
});

export const deserializeRange = (value: SerializableDateRange): DateRange => ({
  start: new Date(value.start),
  end: new Date(value.end),
});

