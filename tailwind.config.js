/** @type {import('tailwindcss').Config} */
// Les valeurs de couleur sont définies dans constants/colorValues.js
// → Pour modifier une couleur, éditer CE SEUL fichier
const { Colors } = require('./constants/colorValues')

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light Mode - "Atelier Blanc"
        light: {
          bg: {
            primary: Colors.light.background,
            secondary: Colors.light.backgroundSecondary,
            tertiary: Colors.light.backgroundTertiary,
          },
          // Note: light.text (nested) supprimé car en double avec la clé plate ci-dessous
          accent: {
            primary: Colors.light.tint,
            secondary: Colors.light.accentSecondary,
            action: Colors.light.accentAction,
          },
          ui: {
            border: Colors.light.border,
            shadow: Colors.light.shadow,
            overlay: Colors.light.overlay,
          },
          // Clés plates (legacy — utilisées par les classes text-light-text, bg-light-background, etc.)
          background: Colors.light.background,
          backgroundSecondary: Colors.light.backgroundSecondary,
          backgroundTertiary: Colors.light.backgroundTertiary,
          text: Colors.light.text,
          textSecondary: Colors.light.textSecondary,
          textTertiary: Colors.light.textTertiary,
          tint: Colors.light.tint,
          icon: Colors.light.icon,
          tabIconDefault: Colors.light.tabIconDefault,
          tabIconSelected: Colors.light.tabIconSelected,
          border: Colors.light.border,
          inputBackground: Colors.light.backgroundSecondary,
          onTint: Colors.light.onTint,
        },
        // Dark Mode - "Studio Noir"
        dark: {
          bg: {
            primary: Colors.dark.background,
            secondary: Colors.dark.backgroundSecondary,
            tertiary: Colors.dark.backgroundTertiary,
          },
          accent: {
            primary: Colors.dark.tint,
            secondary: Colors.dark.accentSecondary,
            action: Colors.dark.accentAction,
          },
          ui: {
            border: Colors.dark.border,
            shadow: Colors.dark.shadow,
            overlay: Colors.dark.overlay,
          },
          // Clés plates
          background: Colors.dark.background,
          backgroundSecondary: Colors.dark.backgroundSecondary,
          backgroundTertiary: Colors.dark.backgroundTertiary,
          text: Colors.dark.text,
          textSecondary: Colors.dark.textSecondary,
          textTertiary: Colors.dark.textTertiary,
          tint: Colors.dark.tint,
          icon: Colors.dark.icon,
          tabIconDefault: Colors.dark.tabIconDefault,
          tabIconSelected: Colors.dark.tabIconSelected,
          border: Colors.dark.border,
          inputBackground: Colors.dark.backgroundSecondary,
          onTint: Colors.dark.onTint,
        },
        // Semantic Colors
        semantic: {
          success: Colors.light.success,
          error: Colors.light.error,
          warning: Colors.light.warning,
          info: Colors.light.info,
        },
        // Legacy support
        main: Colors.light.tint,
        secondary: Colors.light.accentSecondary,
        textPlaceholder: Colors.light.textTertiary,
      },
      fontFamily: {
        // Display/Editorial
        display: ['Georgia', 'serif'], // Playfair Display fallback
        // Body/Interface
        sans: ['System', 'ui-sans-serif', 'system-ui'],
        // Monospace
        mono: ['ui-monospace', 'monospace'],
      },
      fontSize: {
        hero: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        title: ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        heading: ['24px', { lineHeight: '1.3', letterSpacing: '0' }],
        subheading: ['20px', { lineHeight: '1.4', letterSpacing: '0' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0' }],
        micro: ['11px', { lineHeight: '1.3', letterSpacing: '0.03em' }],
        // Legacy support
        '2xs': '0.75rem',
        '3xs': '0.5rem',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        base: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        // Light mode shadows
        'light-sm': '0 1px 2px rgba(0,0,0,0.04)',
        'light-md': '0 4px 8px rgba(0,0,0,0.06)',
        'light-lg': '0 8px 16px rgba(0,0,0,0.08)',
        'light-xl': '0 16px 32px rgba(0,0,0,0.12)',
        // Dark mode shadows
        'dark-sm': '0 1px 2px rgba(255,255,255,0.02)',
        'dark-md': '0 4px 8px rgba(255,255,255,0.03)',
        'dark-lg': '0 8px 16px rgba(255,255,255,0.04)',
        'dark-xl': '0 16px 32px rgba(255,255,255,0.06)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        base: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
