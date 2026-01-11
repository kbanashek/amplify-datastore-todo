module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@orion/task-system": "./packages/task-system/src/index.ts",
            "@components": "./packages/task-system/src/components",
            "@hooks": "./packages/task-system/src/hooks",
            "@services": "./packages/task-system/src/services",
            "@utils": "./packages/task-system/src/utils",
            "@task-types": "./packages/task-system/src/types",
            "@constants": "./packages/task-system/src/constants",
            "@contexts": "./packages/task-system/src/contexts",
            "@translations": "./packages/task-system/src/translations",
            "@models": "./packages/task-system/src/models",
            "@screens": "./packages/task-system/src/screens",
            "@fixtures": "./packages/task-system/src/fixtures",
            "@runtime": "./packages/task-system/src/runtime",
            "@test-utils": "./packages/task-system/src/hooks/__tests__",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      ],
      // Enable hot reloading for styles without breaking app state
      "react-native-reanimated/plugin",
    ],
  };
};
