// babel.config.js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // <= ICI en preset, pas dans plugins
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
