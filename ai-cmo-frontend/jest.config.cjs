module.exports = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
  moduleNameMapper: {
    "^pdfjs-dist/.*$": "<rootDir>/__mocks__/emptyMock.js",
    "^franc$": "<rootDir>/__mocks__/emptyMock.js",
    "^cld3-asm$": "<rootDir>/__mocks__/emptyMock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transformIgnorePatterns: ["/node_modules/(?!pdfjs-dist)/"]
};
