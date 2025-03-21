module.exports = {
  testEnvironment: "jsdom",

  roots: ["<rootDir>/src"],

  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
};
