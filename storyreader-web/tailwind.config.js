/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0A0D14",
          card: "#121722",
          elevated: "#1A202E",
          border: "#262E3D",
          "border-hover": "#374357",
          text: "#F1F5F9",
          muted: "#94A3B8",
        },
        gold: {
          DEFAULT: "#F59E0B",
          dim: "#D97706",
          light: "#FDE68A",
          glow: "rgba(245, 158, 11, 0.15)",
        },
      },
      fontFamily: {
        serif: ["Lora", "Noto Serif", "Georgia", "serif"],
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        book: "0 14px 28px -4px rgba(0, 0, 0, 0.65), 0 10px 10px -5px rgba(0, 0, 0, 0.45)",
        "gold-glow": "0 0 25px -4px rgba(245, 158, 11, 0.35)",
        "card-hover": "0 20px 35px -8px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};
