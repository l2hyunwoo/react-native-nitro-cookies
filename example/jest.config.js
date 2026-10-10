module.exports = {
  preset: "@react-native/jest-preset",
  moduleNameMapper: {
    "^react-native-nitro-cookies$": "<rootDir>/../package/src/index.tsx",
  },
  testMatch: ["**/src/__tests__/**/*.test.ts"],
};
