export type RgbColor = { r: number; g: number; b: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseHexColor(hex: string): RgbColor | undefined {
  const normalized = hex.replace(/[^0-9a-f]/gi, "").toLowerCase();
  if (normalized.length === 3) {
    const r = Number.parseInt(normalized[0] + normalized[0], 16);
    const g = Number.parseInt(normalized[1] + normalized[1], 16);
    const b = Number.parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
  }
  return undefined;
}

function parseRgbColor(rgbString: string): RgbColor | undefined {
  const match = rgbString
    .trim()
    .match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*(?:\.\d+)?))?\)$/i);
  if (!match) {
    return undefined;
  }
  const r = clamp(Number.parseInt(match[1], 10), 0, 255);
  const g = clamp(Number.parseInt(match[2], 10), 0, 255);
  const b = clamp(Number.parseInt(match[3], 10), 0, 255);
  return { r, g, b };
}

export function parseColor(color: string | undefined): RgbColor | undefined {
  if (!color) {
    return undefined;
  }
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    return parseHexColor(trimmed);
  }
  if (trimmed.toLowerCase().startsWith("rgb")) {
    return parseRgbColor(trimmed);
  }
  return undefined;
}

export function toHex({ r, g, b }: RgbColor): string {
  const toChannel = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`;
}

export function toRgbaString(color: string, alpha: number): string {
  const parsed = parseColor(color);
  if (!parsed) {
    return color;
  }
  const normalizedAlpha = clamp(alpha, 0, 1);
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${normalizedAlpha})`;
}

export function getContrastingTextColor(color: string, fallback: string = "#000000"): string {
  const parsed = parseColor(color);
  if (!parsed) {
    return fallback;
  }
  const luminance = (0.299 * parsed.r + 0.587 * parsed.g + 0.114 * parsed.b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

export function mixColors(baseColor: string, mixColor: string, amount: number): string {
  const base = parseColor(baseColor);
  const mix = parseColor(mixColor);
  if (!base || !mix) {
    return baseColor;
  }
  const ratio = clamp(amount, 0, 1);
  const r = base.r * (1 - ratio) + mix.r * ratio;
  const g = base.g * (1 - ratio) + mix.g * ratio;
  const b = base.b * (1 - ratio) + mix.b * ratio;
  return toHex({ r, g, b });
}

export function lighten(color: string, amount: number): string {
  return mixColors(color, "#ffffff", amount);
}

export function darken(color: string, amount: number): string {
  return mixColors(color, "#000000", amount);
}
