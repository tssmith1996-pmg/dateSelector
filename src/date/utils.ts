export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function startOfWeek(date: Date, weekStartsOn: number = 1): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  return addDays(next, -diff);
}

export function endOfWeek(date: Date, weekStartsOn: number = 1): Date {
  const start = startOfWeek(date, weekStartsOn);
  return endOfDay(addDays(start, 6));
}

export function startOfMonth(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfDay(next);
}

export function endOfMonth(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(next);
}

export function startOfQuarter(date: Date): Date {
  const month = date.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  return startOfMonth(new Date(date.getFullYear(), quarterStartMonth, 1));
}

export function endOfQuarter(date: Date): Date {
  const start = startOfQuarter(date);
  return endOfMonth(addMonths(start, 2));
}

export function startOfYear(date: Date): Date {
  return startOfMonth(new Date(date.getFullYear(), 0, 1));
}

export function endOfYear(date: Date): Date {
  return endOfMonth(new Date(date.getFullYear(), 11, 1));
}

export function clamp(date: Date, min?: Date, max?: Date): Date {
  let value = date;
  if (min && isBefore(value, min)) {
    value = new Date(min);
  }
  if (max && isAfter(value, max)) {
    value = new Date(max);
  }
  return value;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function differenceInCalendarMonths(a: Date, b: Date): number {
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
}

export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const total = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
  for (let i = 0; i <= total; i += 1) {
    days.push(addDays(start, i));
  }
  return days;
}

export function startOfCalendar(date: Date, weekStartsOn: number = 1): Date {
  const first = startOfMonth(date);
  return startOfWeek(first, weekStartsOn);
}

export function endOfCalendar(date: Date, weekStartsOn: number = 1): Date {
  const last = endOfMonth(date);
  return endOfWeek(last, weekStartsOn);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }
  return startOfDay(parsed);
}

export function formatRange(from: Date, to: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: from.getFullYear() !== to.getFullYear() ? "numeric" : undefined,
  });

  const sameMonth = isSameMonth(from, to);
  const sameYear = from.getFullYear() === to.getFullYear();

  if (sameMonth && sameYear) {
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: "short",
    });
    return `${monthFormatter.format(from)} ${from.getDate()} – ${to.getDate()}, ${from.getFullYear()}`;
  }

  if (sameYear) {
    return `${formatter.format(from)} – ${formatter.format(to)}, ${from.getFullYear()}`;
  }

  return `${formatter.format(from)} – ${formatter.format(to)}`;
}

export function getToday(): Date {
  return startOfDay(new Date());
}

export function getMonthMatrix(month: Date, weekStartsOn: number = 1): Date[][] {
  const start = startOfCalendar(month, weekStartsOn);
  const end = endOfCalendar(month, weekStartsOn);
  const rows: Date[][] = [];
  let current = start;

  while (!isAfter(current, end)) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      row.push(current);
      current = addDays(current, 1);
    }
    rows.push(row);
  }

  return rows;
}

export function moveMonth(base: Date, offset: number): Date {
  const next = addMonths(base, offset);
  return startOfMonth(next);
}

export function moveYear(base: Date, offset: number): Date {
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + offset);
  return next;
}

export function compareAsc(a: Date, b: Date): number {
  const diff = a.getTime() - b.getTime();
  return diff === 0 ? 0 : diff < 0 ? -1 : 1;
}

export function normalizeRange(from: Date, to: Date): { from: Date; to: Date } {
  return compareAsc(from, to) <= 0
    ? { from: startOfDay(from), to: endOfDay(to) }
    : { from: startOfDay(to), to: endOfDay(from) };
}

export function ensureWithinRange(range: { from: Date; to: Date }, min?: Date, max?: Date) {
  return {
    from: clamp(range.from, min, max),
    to: clamp(range.to, min, max),
  };
}

