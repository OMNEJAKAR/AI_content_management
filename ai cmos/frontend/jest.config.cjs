module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "pdfjs-dist/build/pdf.worker\\?url$": "<rootDir>/src/__mocks__/pdf.worker.mock.js",
    "pdfjs-dist/build/pdf$": "<rootDir>/src/__mocks__/pdfjs-dist.js",
    "pdfjs-dist/build/pdf.worker.js\\?url$": "<rootDir>/src/__mocks__/pdf.worker.mock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["**/__tests__/**/*.test.js?(x)", "**/*.test.js?(x)"],
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
