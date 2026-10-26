/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#111622",            // Nền Slate than hiện đại, sáng sủa và dễ chịu cho mắt
          card: "#19202E",          // Khung card nổi bật rõ rệt trên nền
          elevated: "#232D3F",      // Trạng thái hover và khối nổi
          border: "#293448",        // Đường viền tinh tế, rõ nét
          "border-hover": "#42526E",// Viền sáng khi hover
          text: "#F8FAFC",          // Màu chữ sáng rõ ràng (Slate 50)
          muted: "#94A3B8",         // Màu chữ phụ trung tính (Slate 400)
        },
        gold: {
          DEFAULT: "#F59E0B",       // Vàng hổ phách tự nhiên, ấm áp
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
        book: "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "gold-glow": "0 0 20px -3px rgba(245, 158, 11, 0.2)",
        "card-hover": "0 12px 28px -4px rgba(0, 0, 0, 0.35)",
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
