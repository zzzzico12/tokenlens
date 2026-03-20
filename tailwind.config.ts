/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0f1117", card: "#1a1d27", border: "#2a2d3a", hover: "#252836" },
        accent: { purple: "#7F77DD", teal: "#1D9E75", coral: "#D85A30", amber: "#EF9F27", blue: "#378ADD", pink: "#D4537E" },
        provider: { openai: "#10A37F", anthropic: "#D4A574", google: "#4285F4", aws: "#FF9900", azure: "#0078D4" },
      },
    },
  },
  plugins: [],
};
