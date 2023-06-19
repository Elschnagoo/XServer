module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "\/tests\/main\.test\.ts$",
  coverageReporters: ["html", "text", "text-summary", "cobertura", "lcov"],
  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**","!**/tests/**"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["./node_modules/@grandlinex/core/jest.pre.config.js"],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
