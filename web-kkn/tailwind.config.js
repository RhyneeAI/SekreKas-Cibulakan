/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F1E1",
        primary: "#C68A3E",
        secondary: "#8B5E3C",
        success: "#6E7F4F",
        danger: "#A65B4A",
        text: "#4A3427",
        muted: "#8B7A6B",
        border: "#E3D9C4",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.45)", opacity: "0" },
        },
        "scan-line": {
          "0%": { top: "18%", opacity: "0.4" },
          "100%": { top: "78%", opacity: "1" },
        },
        "corner-pulse": {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
        "success-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "65%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "fade-in-down": "fade-in-down 0.4s ease-out both",
        "scale-in": "scale-in 0.35s ease-out both",
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "scan-line": "scan-line 2.2s ease-in-out infinite alternate",
        "corner-pulse": "corner-pulse 1.6s ease-in-out infinite",
        "success-pop": "success-pop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
