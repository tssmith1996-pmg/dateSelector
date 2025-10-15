module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  moduleNameMapper: {
    "^.+\\.(css)$": "<rootDir>/test/mocks/styleMock.js",
    "^.+\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/test/mocks/fileMock.js"
  },
  setupFilesAfterEnv: [],
};
