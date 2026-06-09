import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/config/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/providers/**/*.{ts,tsx}",
    "./src/services/**/*.{ts,tsx}",
    "./src/types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--amani-background)",
        surface: "var(--amani-surface)",
        "surface-light": "var(--amani-surface-light)",
        border: "var(--amani-border)",
        focus: "var(--amani-focus)",
        primary: {
          DEFAULT: "var(--amani-primary)",
          hover: "var(--amani-primary-hover)"
        },
        accent: "var(--amani-accent)",
        "text-primary": "var(--amani-text-primary)",
        "text-secondary": "var(--amani-text-secondary)",
        success: "var(--amani-success)",
        warning: "var(--amani-warning)",
        danger: "var(--amani-danger)",
        info: "var(--amani-info)"
      },
      borderRadius: {
        amani: "var(--amani-radius)"
      },
      maxWidth: {
        content: "1440px"
      },
      screens: {
        smartphone: "390px",
        tablet: "768px",
        desktop: "1024px"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
