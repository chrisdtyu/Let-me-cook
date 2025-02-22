module.exports = {
  transform: {
    "^.+\\.(js|jsx|mjs|cjs)$": "babel-jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleFileExtensions: ["js", "jsx", "mjs", "cjs"],
  transformIgnorePatterns: ['/node_modules/(?!(@bundled-es-modules|msw))'], 
};