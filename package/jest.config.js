module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/example/',
    '<rootDir>/nitrogen/',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-nitro-modules)/)',
  ],
};
