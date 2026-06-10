export const amaniColors = {
  background: "#0B0B0F",
  surface: "#13131A",
  surfaceLight: "#1C1C25",
  primary: "#7C3AED",
  primaryHover: "#8B5CF6",
  accent: "#A855F7",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6"
} as const;

export const amaniLayout = {
  maxContentWidth: "1440px",
  radius: "8px",
  spacingUnit: "4px",
  mobilePadding: "16px",
  tabletPadding: "20px",
  desktopPadding: "32px"
} as const;

export const amaniBreakpoints = {
  smartphoneMax: "767px",
  tabletMin: "768px",
  tabletMax: "1023px",
  desktopMin: "1024px"
} as const;

export type AmaniColorToken = keyof typeof amaniColors;
