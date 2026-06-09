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
        background: "#0B0B0F",
        surface: "#13131A",
        "surface-light": "#1C1C25",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6"
        },
        accent: "#A855F7",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6"
      },
      borderRadius: {
        amani: "8px"
      },
      maxWidth: {
        content: "1440px"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
