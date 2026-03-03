/**
 * Vestia Color Tokens — Re-export TypeScript
 *
 * Les valeurs sont définies dans constants/colorValues.js
 * (source de vérité partagée avec tailwind.config.js)
 *
 * Pour modifier une couleur → éditer constants/colorValues.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Colors: _Colors } = require('./colorValues') as {
  Colors: (typeof import('./colorValues'))['Colors']
}

export const Colors = _Colors
