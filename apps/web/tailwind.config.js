import baseConfig from "../../packages/config/tailwind/base.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [baseConfig],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};
