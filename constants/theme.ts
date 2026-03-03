/**
 * Vestia Design System - Fashion Editorial Theme
 * "Vogue meets Tech" - Minimalist, elegant, editorial design
 *
 * Couleurs → constants/colorValues.js (source de vérité)
 */

import { Platform } from 'react-native'
export { Colors } from './colors'

// Typography System
export const Typography = {
  // Font Families
  family: {
    display: Platform.select({
      ios: 'Georgia', // Fallback serif (Playfair Display sera ajoutée via Google Fonts)
      android: 'serif',
      default: 'serif',
    }),
    body: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'system-ui',
    }),
  },

  // Font Sizes
  size: {
    hero: 48,
    title: 32,
    heading: 24,
    subheading: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
    micro: 11,
  },

  // Font Weights
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.03,
  },
}

// Spacing System (4px base unit)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
}

// Border Radius
export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
}

// Shadows
export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 32,
      elevation: 16,
    },
  },
  dark: {
    sm: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#FFF',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.06,
      shadowRadius: 32,
      elevation: 16,
    },
  },
}

// Animation Timings
export const Animation = {
  duration: {
    instant: 100,
    fast: 200,
    base: 300,
    slow: 500,
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as const,
    enter: [0.0, 0.0, 0.2, 1] as const,
    exit: [0.4, 0.0, 1, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
  },
}

// Legacy Fonts (kept for compatibility)
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
