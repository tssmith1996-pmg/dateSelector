export type Bounds = { min?: Date; max?: Date };

function clone(date?: Date): Date | undefined {
  return date ? new Date(date.getTime()) : undefined;
}

export function mergeBounds(existing: Bounds | undefined, next: Bounds | undefined): Bounds {
  const result: Bounds = {};
  if (next?.min) {
    result.min = clone(next.min);
  } else if (existing?.min) {
    result.min = clone(existing.min);
  }
  if (next?.max) {
    result.max = clone(next.max);
  } else if (existing?.max) {
    result.max = clone(existing.max);
  }
  return result;
}
