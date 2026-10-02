/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fbf3f2",
          100: "#f3dcdc",
          400: "#a13a45",
          600: "#7a1e2b",
          700: "#651722",
          800: "#4e1119",
          900: "#380c12",
        },
        navy: {
          50: "#eef1f6",
          200: "#a9b8cf",
          600: "#233a5e",
          800: "#12233f",
          900: "#0b1626",
        },
        gold: {
          300: "#e4c877",
          500: "#c9a227",
          600: "#a9841c",
        },
        parchment: "#f7f4ee",
        ink: "#201a17",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        ledger: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(18,35,63,0.06) 28px)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,35,63,0.06), 0 8px 24px -8px rgba(18,35,63,0.18)",
      },
    },
  },
  plugins: [],
};
