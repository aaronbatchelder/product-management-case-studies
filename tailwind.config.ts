import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fafafa",
        ink: "#1a1a1a",
        muted: "#666666",
        accent: "#0066ff",
        "accent-hover": "#0052cc",
        border: "#e5e5e5",
      },
      fontFamily: {
        mono: ["var(--font-ibm-plex-mono)", "IBM Plex Mono", "monospace"],
      },
      maxWidth: {
        content: "720px",
      },
      spacing: {
        section: "60px",
      },
    },
  },
  plugins: [],
};
export default config;
