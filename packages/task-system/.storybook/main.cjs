const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  webpackFinal: async (config) => {
    // Resolve TypeScript path aliases
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@components": path.resolve(__dirname, "../src/components"),
        "@hooks": path.resolve(__dirname, "../src/hooks"),
        "@utils": path.resolve(__dirname, "../src/utils"),
        "@services": path.resolve(__dirname, "../src/services"),
        "@constants": path.resolve(__dirname, "../src/constants"),
        "@contexts": path.resolve(__dirname, "../src/contexts"),
        "@translations": path.resolve(__dirname, "../src/translations"),
        "@task-types": path.resolve(__dirname, "../src/types"),
        "@models": path.resolve(__dirname, "../src/models"),
        "@screens": path.resolve(__dirname, "../src/screens"),
        "@runtime": path.resolve(__dirname, "../src/runtime"),
        "@fixtures": path.resolve(__dirname, "../src/fixtures"),
        
        // React Native Web aliases
        "react-native$": "react-native-web",
        "@react-native-community/datetimepicker": "react-native-web/dist/exports/View",
        "@react-native-community/slider": "react-native-web/dist/exports/View",
        
        // Mock @expo/vector-icons
        "@expo/vector-icons/MaterialIcons": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/Ionicons": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/FontAwesome": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/FontAwesome5": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/MaterialCommunityIcons": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/Feather": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/AntDesign": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons/Entypo": path.resolve(__dirname, "./mocks.ts"),
        "@expo/vector-icons": path.resolve(__dirname, "./mocks.ts"),
      },
      extensions: [
        ".web.tsx", ".web.ts", ".web.jsx", ".web.js",
        ".tsx", ".ts", ".jsx", ".js", ".json", ".mjs"
      ],
    };

    // Handle React Native modules
    config.module = {
      ...config.module,
      rules: [
        ...(config.module?.rules || []).filter((rule) => {
          // Remove existing babel-loader rules to avoid conflicts
          if (typeof rule === 'object' && rule && 'test' in rule) {
            return !rule.test?.toString().includes('tsx');
          }
          return true;
        }),
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  ["@babel/preset-react", { runtime: "automatic" }],
                  "@babel/preset-typescript",
                ],
                plugins: ["react-native-web"],
              },
            },
          ],
        },
        {
          test: /\.mdx$/,
          use: [
            {
              loader: '@mdx-js/loader',
              options: {
                jsx: true,
              },
            },
          ],
        },
      ],
    };

    return config;
  },
  docs: {
    autodocs: true,
  },
};
