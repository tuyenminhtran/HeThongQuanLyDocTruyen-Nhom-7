/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#111216",            // Warm obsidian charcoal (gentle on eyes, eliminates cold AI blue)
          card: "#181A20",          // Warm dark card surface
          elevated: "#20232B",      // Elevated card / hover state
          border: "#282B35",        // Soft warm border
          "border-hover": "#3D4150",// Subtle hover border
          text: "#EDE8DF",          // Natural warm paper cream (Kindle/Editorial paper feel)
          muted: "#9C988F",         // Warm sepia ash
        },
        gold: {
          DEFAULT: "#D97706",       // Warm ochre amber / vintage honey
          dim: "#B45309",           // Deep vintage ochre
          light: "#FDE68A",
          glow: "rgba(217, 119, 6, 0.12)", // Gentle warm reading lamp glow
        },
      },
      fontFamily: {
        serif: ["Lora", "Noto Serif", "Georgia", "serif"],
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        book: "0 14px 28px -4px rgba(0, 0, 0, 0.65), 0 10px 10px -5px rgba(0, 0, 0, 0.45)",
        "gold-glow": "0 0 25px -4px rgba(217, 119, 6, 0.25)",
        "card-hover": "0 20px 35px -8px rgba(0, 0, 0, 0.7)",
      },
      animation: {
        meteor: "meteor 5s linear infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
