/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light Mode - "Atelier Blanc"
        light: {
          bg: {
            primary: "#FAFAFA",
            secondary: "#FFFFFF",
            tertiary: "#F5F5F5",
          },
          text: {
            primary: "#0A0A0A",
            secondary: "#404040",
            tertiary: "#8A8A8A",
          },
          accent: {
            primary: "#1A1A1A",
            secondary: "#E8E8E8",
            action: "#2F2F2F",
          },
          ui: {
            border: "#E0E0E0",
            shadow: "rgba(0, 0, 0, 0.06)",
            overlay: "rgba(0, 0, 0, 0.4)",
          },
          // Legacy support
          background: "#FAFAFA",
          backgroundSecondary: "#FFFFFF",
          backgroundTertiary: "#F5F5F5",
          text: "#0A0A0A",
          textSecondary: "#404040",
          textTertiary: "#8A8A8A",
          tint: "#1A1A1A",
          icon: "#404040",
          tabIconDefault: "#8A8A8A",
          tabIconSelected: "#1A1A1A",
          border: "#E0E0E0",
          inputBackground: "#FFFFFF",
        },
        // Dark Mode - "Studio Noir"
        dark: {
          bg: {
            primary: "#0A0A0A",
            secondary: "#1A1A1A",
            tertiary: "#252525",
          },
          text: {
            primary: "#FAFAFA",
            secondary: "#B8B8B8",
            tertiary: "#707070",
          },
          accent: {
            primary: "#FFFFFF",
            secondary: "#2A2A2A",
            action: "#E8E8E8",
          },
          ui: {
            border: "#2F2F2F",
            shadow: "rgba(255, 255, 255, 0.04)",
            overlay: "rgba(0, 0, 0, 0.6)",
          },
          // Legacy support
          background: "#0A0A0A",
          backgroundSecondary: "#1A1A1A",
          backgroundTertiary: "#252525",
          text: "#FAFAFA",
          textSecondary: "#B8B8B8",
          textTertiary: "#707070",
          tint: "#FFFFFF",
          icon: "#B8B8B8",
          tabIconDefault: "#707070",
          tabIconSelected: "#FFFFFF",
          border: "#2F2F2F",
          inputBackground: "#1A1A1A",
        },
        // Semantic Colors
        semantic: {
          success: "#059669",
          error: "#DC2626",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
        // Legacy support
        main: "#1A1A1A",
        secondary: "#E8E8E8",
        textPlaceholder: "#8A8A8A",
      },
      fontFamily: {
        // Display/Editorial
        display: ["Georgia", "serif"], // Playfair Display fallback
        // Body/Interface
        sans: ["System", "ui-sans-serif", "system-ui"],
        // Monospace
        mono: ["ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        title: ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        heading: ["24px", { lineHeight: "1.3", letterSpacing: "0" }],
        subheading: ["20px", { lineHeight: "1.4", letterSpacing: "0" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0" }],
        micro: ["11px", { lineHeight: "1.3", letterSpacing: "0.03em" }],
        // Legacy support
        "2xs": "0.75rem",
        "3xs": "0.5rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "96px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        full: "9999px",
      },
      boxShadow: {
        // Light mode shadows
        "light-sm": "0 1px 2px rgba(0,0,0,0.04)",
        "light-md": "0 4px 8px rgba(0,0,0,0.06)",
        "light-lg": "0 8px 16px rgba(0,0,0,0.08)",
        "light-xl": "0 16px 32px rgba(0,0,0,0.12)",
        // Dark mode shadows
        "dark-sm": "0 1px 2px rgba(255,255,255,0.02)",
        "dark-md": "0 4px 8px rgba(255,255,255,0.03)",
        "dark-lg": "0 8px 16px rgba(255,255,255,0.04)",
        "dark-xl": "0 16px 32px rgba(255,255,255,0.06)",
      },
      transitionDuration: {
        instant: "100ms",
        fast: "200ms",
        base: "300ms",
        slow: "500ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        enter: "cubic-bezier(0.0, 0.0, 0.2, 1)",
        exit: "cubic-bezier(0.4, 0.0, 1, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
