/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: "#3b82f6",
        secondary: "#e5e7eb",
        textPlaceholder: "#a1a1aa",
        light: {
          text: "#000000",
          textSecondary: "#4b5563",
          textTertiary: "#9BA3AB",
          background: "#f8fafc",
          backgroundSecondary: "#ffffff",
          backgroundTertiary: "#f1f1f1",
          tint: "#0a7ea4",
          icon: "#687076",
          tabIconDefault: "#687076",
          tabIconSelected: "#0a7ea4",
          border: "rgba(0, 0, 0, 0.1)",
          inputBackground: "#f4f4f5",
        },
        dark: {
          text: "#ffffff",
          textSecondary: "#d1d5db",
          textTertiary: "#9BA3AB",
          background: "#000000",
          backgroundSecondary: "#080808",
          backgroundTertiary: "#121212",
          tint: "#ffffff",
          icon: "#9BA1A6",
          tabIconDefault: "#9BA1A6",
          tabIconSelected: "#ffffff",
          border: "rgba(255, 255, 255, 0.1)",
          inputBackground: "#262626",
        },
      },
      fontSize: {
        "2xs": "0.75rem", // 12px
        "3xs": "0.5rem", // 8px
      },
    },
  },
  darkMode: "class", // Enable manual dark mode
  plugins: [],
};
