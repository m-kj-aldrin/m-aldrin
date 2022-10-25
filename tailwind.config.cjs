/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.astro"],
  theme: {
    extend: {},
    spacing: {
      "2xs": "var(--space-3xs)",
      xs: "var(--space-2xs)",
      sm: "var(--space-xs)",
      base: "var(--space-s)",
      xl: "var(--space-m)",
      "2xl": "var(--space-l)",
      "3xl": "var(--space-xl)",
      "4xl": "var(--space-2xl)",
      "5xl": "var(--space-3xl)",
    },
    fontSize: {
      sm: "var(--step-1)",
      base: "var(--step-0)",
      xl: "var(--step-1)",
      "2xl": "var(--step-3)",
      "3xl": "var(--step-4)",
      "4xl": "var(--step-5)",
      "5xl": "var(--step-7)",
    },
    colors: {
      current: "currentColor",
      blk: "hsl(var(--col-blk) / var(--tw-bg-opacity,1))",
      wht: "hsl(var(--col-wht) / var(--tw-bg-opacity,1))",
      prim: "hsl(var(--col-prim) / var(--tw-bg-opacity,1))",
      second: "hsl(var(--col-second) / var(--tw-bg-opacity,1))",
      ternary: "hsl(var(--col-ternary) / var(--tw-bg-opacity,1))",
    },
  },
  plugins: [],
};
