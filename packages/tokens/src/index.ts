export const COLORS = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#1A1D23",
  textMuted: "#4A505C",
  border: "#E2DDD2",
  primary: "#0B4F6C",
  primaryText: "#FFFFFF",
  indicatorBackground: "#FFF3D6",
  indicatorBorder: "#E8A317",
  indicatorText: "#6B4200",
} as const;

export const FONTS = {
  family: {
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  size: {
    small: "0.875rem",
    body: "1rem",
    large: "1.25rem",
    title: "1.75rem",
    hero: "2.25rem",
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;

export const SHADOW = {
  card: "0 1px 2px rgba(26, 29, 35, 0.06), 0 4px 16px rgba(26, 29, 35, 0.06)",
} as const;

type TokenGroup = Readonly<Record<string, string | number>>;

const toKebabCase = (name: string): string =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const appendGroup = (
  target: Record<string, string>,
  prefix: string,
  group: TokenGroup,
  unit: string,
): void => {
  for (const [name, value] of Object.entries(group)) {
    target[`--${prefix}-${toKebabCase(name)}`] = typeof value === "number" ? `${value}${unit}` : value;
  }
};

export function toCssVariables(): Readonly<Record<string, string>> {
  const variables: Record<string, string> = {};
  appendGroup(variables, "color", COLORS, "");
  appendGroup(variables, "font", FONTS.family, "");
  appendGroup(variables, "text", FONTS.size, "");
  appendGroup(variables, "space", SPACING, "px");
  appendGroup(variables, "radius", RADIUS, "px");
  appendGroup(variables, "shadow", SHADOW, "");
  return variables;
}
