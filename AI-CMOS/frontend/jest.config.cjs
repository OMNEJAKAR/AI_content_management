module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },

  // 🆕 Added this section
transformIgnorePatterns: [
  "node_modules/(?!(franc|trigram-utils|n-gram|collapse-white-space|cld3-asm)/)"
],


  moduleNameMapper: {
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],

  testMatch: [
    "**/__tests__/**/*.test.js?(x)",
    "**/*.test.js?(x)"
  ],

  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/setupTests.js"
  ],

  globals: {
    "import.meta": {
      env: {
        VITE_API_URL: "http://localhost:5050"
      }
    }
  }
};
