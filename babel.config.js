module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Enable hot reloading for styles without breaking app state
      "react-native-reanimated/plugin",
    ],
  };
};
