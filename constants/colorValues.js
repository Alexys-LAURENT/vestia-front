/**
 * Vestia Color Tokens — Source de Vérité Unique
 *
 * Ce fichier est la seule source de vérité pour les couleurs.
 * Il est importé à la fois par :
 *   - constants/colors.ts  (usage TypeScript / React Native via Metro)
 *   - tailwind.config.js   (génération des classes NativeWind, contexte Node.js)
 *
 * IMPORTANT : Pas d'import React Native ici (doit fonctionner en Node.js pur)
 * Pour changer une couleur → modifier UNIQUEMENT ce fichier.
 */

// Light Mode - "Atelier Blanc"
const tintColorLight = '#1A1A1A' // Noir élégant
const accentLight = '#0A0A0A' // Noir profond

// Dark Mode - "Studio Noir"
const tintColorDark = '#E5E5E7' // Blanc doux
const accentDark = '#D4D4D6' // Gris très clair

const Colors = {
  light: {
    // Backgrounds
    background: '#FAFAFA',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#F5F5F5',

    // Text
    text: '#0A0A0A',
    textSecondary: '#404040',
    textTertiary: '#8A8A8A',

    // Accents
    tint: tintColorLight,
    accent: accentLight,
    accentSecondary: '#E8E8E8',
    accentAction: '#2F2F2F',

    // Icons & Tabs
    icon: '#404040',
    tabIconDefault: '#8A8A8A',
    tabIconSelected: tintColorLight,

    // UI Elements
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    onTint: '#FFFFFF',

    // Semantic
    success: '#059669',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  dark: {
    // Backgrounds
    background: '#111112',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#242426',

    // Text
    text: '#E5E5E7',
    textSecondary: '#9E9EA8',
    textTertiary: '#5E5E68',

    // Accents
    tint: tintColorDark,
    accent: accentDark,
    accentSecondary: '#26262A',
    accentAction: '#D4D4D6',

    // Icons & Tabs
    icon: '#9E9EA8',
    tabIconDefault: '#5E5E68',
    tabIconSelected: tintColorDark,

    // UI Elements
    border: '#2C2C2E',
    shadow: 'rgba(255, 255, 255, 0.04)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    onTint: '#111112',

    // Semantic
    success: '#059669',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
}

module.exports = { Colors }
