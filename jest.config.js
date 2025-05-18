/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/index.ts", "!**/*.d.ts"],

  // ← ignore any files under test/__temp__ or __temp_transform__
  testPathIgnorePatterns: [
    "<rootDir>/test/__temp__/",
    "<rootDir>/test/__temp_transform__/",
  ],
};
