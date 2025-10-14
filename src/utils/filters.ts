import * as models from "powerbi-models";

export function parseTargetFromQueryName(
  queryName?: string,
): models.IFilterColumnTarget | undefined {
  if (!queryName) {
    return undefined;
  }

  const bracketMatch = queryName.match(/^(.*)\[([^\]]+)\]$/);
  if (bracketMatch) {
    const [, table, column] = bracketMatch;
    if (table && column) {
      return { table, column };
    }
  }

  const dotSegments = queryName.split(".");
  if (dotSegments.length >= 2) {
    const column = dotSegments.pop();
    const table = dotSegments.join(".");
    if (table && column) {
      return { table, column };
    }
  }

  return undefined;
}

export function toDateOnlyIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function extentFromValues(values: unknown[]): { min?: Date; max?: Date } {
  if (!values || values.length === 0) {
    return {};
  }

  const dates = values
    .map((value) => {
      if (value instanceof Date) {
        return new Date(value.getTime());
      }
      if (value == null) {
        return undefined;
      }
      const parsed = new Date(value as any);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    })
    .filter((value): value is Date => !!value && !Number.isNaN(value.getTime()));

  if (dates.length === 0) {
    return {};
  }

  dates.sort((a, b) => a.getTime() - b.getTime());

  return { min: dates[0], max: dates[dates.length - 1] };
}
