/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{ts,tsx}",
    "./screens/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
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
    },
  },
  plugins: [],
};
