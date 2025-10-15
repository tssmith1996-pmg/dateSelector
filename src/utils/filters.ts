import * as models from "powerbi-models";

function normalizeIdentifier(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  let result = value.trim();
  if (!result) {
    return undefined;
  }
  if (result.endsWith(".")) {
    result = result.slice(0, -1);
  }
  if (
    (result.startsWith("'") && result.endsWith("'")) ||
    (result.startsWith("\"") && result.endsWith("\""))
  ) {
    result = result.slice(1, -1);
  }
  if (result.startsWith("[") && result.endsWith("]")) {
    result = result.slice(1, -1);
  }
  result = result.replace(/''/g, "'");
  return result || undefined;
}

export function parseTargetFromQueryName(
  queryName?: string,
): models.IFilterColumnTarget | undefined {
  if (!queryName) {
    return undefined;
  }

  const bracketMatches = [...queryName.matchAll(/\[([^\]]+)\]/g)];
  if (bracketMatches.length > 0) {
    const firstMatch = bracketMatches[0];
    const matchIndex = firstMatch.index ?? queryName.indexOf("[");
    const tablePart = normalizeIdentifier(queryName.slice(0, matchIndex));
    const columnPart = normalizeIdentifier(firstMatch[1]);
    if (tablePart && columnPart) {
      return { table: tablePart, column: columnPart };
    }
  }

  const dotSegments = queryName.split(".");
  if (dotSegments.length >= 2) {
    const column = normalizeIdentifier(dotSegments.pop());
    const table = normalizeIdentifier(dotSegments.join("."));
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
