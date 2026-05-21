import type {Config} from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./remotion/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          ink: "#070817",
          panel: "#101326",
          card: "#151a32",
          line: "rgba(255,255,255,0.12)",
          text: "#f7f7fb",
          muted: "#9aa3bc",
          cyan: "#38d8ff",
          blue: "#5f7cff",
          pink: "#ff4fd8",
          amber: "#ffd166",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(95,124,255,0.28)",
        card: "0 24px 80px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
