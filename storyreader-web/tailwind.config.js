/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#F4F6F9",            // Nền Slate sáng sạch sẽ, chuẩn giao diện TruyenQQ
          card: "#FFFFFF",          // Khung card màu trắng tinh, nổi khối rõ ràng
          elevated: "#F8FAFC",      // Khối nổi nhẹ hoặc hover
          border: "#E2E8F0",        // Đường viền Slate-200 sáng nét
          "border-hover": "#CBD5E1",// Viền sáng khi hover
          text: "#0F172A",          // Màu chữ Slate-900 đen đậm, cực kỳ rõ nét và dễ đọc
          muted: "#64748B",         // Màu chữ phụ Slate-500
        },
        gold: {
          DEFAULT: "#EA580C",       // Cam đậm rực rỡ chuẩn TruyenQQ (thay cho màu vàng tối khó nhìn)
          dim: "#C2410C",
          light: "#FFEDD5",
          glow: "rgba(234, 88, 12, 0.15)",
        },
        brand: {
          orange: "#F37021",        // Màu cam thương hiệu TruyenQQ
          blue: "#2563EB",          // Xanh dương nút Đăng nhập
          sky: "#0284C7",           // Xanh da trời nút Đăng ký
        },
      },
      fontFamily: {
        serif: ["Lora", "Noto Serif", "Georgia", "serif"],
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        book: "0 8px 20px -3px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.08)",
        "gold-glow": "0 0 20px -3px rgba(234, 88, 12, 0.2)",
        "card-hover": "0 12px 24px -4px rgba(0, 0, 0, 0.12)",
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
