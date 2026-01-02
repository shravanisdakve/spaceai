/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // if you have module aliases in your project, configure them here
    // e.g., '^@/components/(.*)$': '<rootDir>/src/components/$1'
  },
};
