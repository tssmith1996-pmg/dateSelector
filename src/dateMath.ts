import {
  addDays,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { DateRange } from './logic/state';
import { PresetContext } from './types';

export interface DateMathResult {
  range?: DateRange;
}

export interface SerializedRange {
  start: string;
  end: string;
}

const UNIT_TO_DAYS: Record<string, number> = {
  DAYS: 1,
  WEEKS: 7,
};

function clampDate(date: Date, context: PresetContext): Date {
  if (context.min && date < context.min) {
    return context.min;
  }
  if (context.max && date > context.max) {
    return context.max;
  }
  return date;
}

function clampRange(range: DateRange, context: PresetContext): DateRange {
  return {
    start: clampDate(range.start, context),
    end: clampDate(range.end, context),
  };
}

function resolveKeyword(keyword: string, context: PresetContext): Date {
  const today = startOfToday();
  switch (keyword) {
    case 'TODAY':
      return new Date(context.today.getTime());
    case 'YESTERDAY':
      return subDays(context.today, 1);
    case 'STARTOFMONTH':
      return startOfMonth(context.today);
    case 'STARTOFYEAR':
      return startOfYear(context.today);
    case 'STARTOFQUARTER':
      return startOfQuarter(context.today);
    default:
      return today;
  }
}

function applyOffset(base: Date, sign: string, amount: number, unit: string): Date {
  if (unit === 'MONTHS') {
    return sign === '+' ? subMonths(base, -amount) : subMonths(base, amount);
  }
  if (unit === 'YEARS') {
    return sign === '+' ? subYears(base, -amount) : subYears(base, amount);
  }
  const days = (UNIT_TO_DAYS[unit] ?? 1) * amount;
  return sign === '+' ? addDays(base, days) : subDays(base, days);
}

function parseEndpoint(token: string, context: PresetContext): Date {
  const pattern = /^(TODAY|YESTERDAY|STARTOFMONTH|STARTOFYEAR|STARTOFQUARTER)([+-])(\d+)\s+(DAYS|WEEKS|MONTHS|YEARS)$/;
  const simple = token.trim();
  if (simple === 'TODAY' || simple === 'YESTERDAY' || simple === 'STARTOFMONTH' || simple === 'STARTOFYEAR' || simple === 'STARTOFQUARTER') {
    return resolveKeyword(simple, context);
  }
  const match = pattern.exec(simple);
  if (match) {
    const [, keyword, sign, amount, unit] = match;
    const base = resolveKeyword(keyword, context);
    return applyOffset(base, sign, Number.parseInt(amount, 10), unit);
  }
  return resolveKeyword('TODAY', context);
}

export function parseDateMath(expression: string, context: PresetContext): DateMathResult {
  const value = expression.trim().toUpperCase();
  if (value.includes('..')) {
    const [startToken, endToken] = value.split('..');
    const start = parseEndpoint(startToken, context);
    const end = parseEndpoint(endToken, context);
    const range = clampRange({
      start: start <= end ? start : end,
      end: end >= start ? end : start,
    }, context);
    return { range };
  }

  if (value.startsWith('LAST ')) {
    const parts = value.replace('LAST ', '').split(' ');
    const amount = Number.parseInt(parts[0], 10);
    const unit = parts[1];
    if (Number.isFinite(amount)) {
      const end = context.today;
      let start: Date;
      if (unit === 'DAYS') {
        start = subDays(end, amount - 1);
      } else if (unit === 'MONTHS') {
        start = subMonths(end, amount - 1);
      } else if (unit === 'YEARS') {
        start = subYears(end, amount - 1);
      } else {
        start = subDays(end, (UNIT_TO_DAYS[unit] ?? 1) * amount - 1);
      }
      return { range: clampRange({ start, end }, context) };
    }
  }

  switch (value) {
    case 'TODAY':
      return { range: clampRange({ start: context.today, end: context.today }, context) };
    case 'YESTERDAY': {
      const date = subDays(context.today, 1);
      return { range: clampRange({ start: date, end: date }, context) };
    }
    case 'THIS MONTH': {
      const start = startOfMonth(context.today);
      const end = endOfMonth(context.today);
      return { range: clampRange({ start, end }, context) };
    }
    case 'LAST MONTH': {
      const anchor = subMonths(context.today, 1);
      return {
        range: clampRange({ start: startOfMonth(anchor), end: endOfMonth(anchor) }, context),
      };
    }
    case 'QTD': {
      const start = startOfQuarter(context.today);
      return { range: clampRange({ start, end: context.today }, context) };
    }
    case 'YTD': {
      const start = startOfYear(context.today);
      return { range: clampRange({ start, end: context.today }, context) };
    }
    case 'LAST YEAR': {
      const anchor = subYears(context.today, 1);
      return {
        range: clampRange({ start: startOfYear(anchor), end: endOfYear(anchor) }, context),
      };
    }
    default:
      return { range: clampRange({ start: context.today, end: context.today }, context) };
  }
}

export function serializeRange(range: DateRange): SerializedRange {
  return {
    start: range.start.toISOString().substring(0, 10),
    end: range.end.toISOString().substring(0, 10),
  };
}

export function deserializeRange(serialized: SerializedRange): DateRange {
  return {
    start: new Date(serialized.start),
    end: new Date(serialized.end),
  };
}
