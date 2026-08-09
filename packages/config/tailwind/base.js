// StackLeo — shared base Tailwind CSS configuration, extended by apps/web
// and apps/admin via `presets: [baseConfig]`. Brand tokens (colors,
// typography, elevation) live here once, so every consuming app renders
// the same design system instead of redefining it locally. `content` is
// deliberately empty — each app supplies its own file globs, since Tailwind
// resolves `content` relative to the config file that declares it.

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        // Warm technology accent — the primary brand color across every
        // StackLeo surface (CTAs, links, focus rings, active states).
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Subtle elevation for cards/surfaces sitting on neutral backgrounds.
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
