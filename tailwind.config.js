/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#1C1815",
          card: "#262019",
          border: "#3A322A",
          text: "#EDE6D6",
          muted: "#9C9284",
        },
        gold: {
          DEFAULT: "#C9A227",
          dim: "#8A7020",
        },
      },
      fontFamily: {
        serif: ["Noto Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
