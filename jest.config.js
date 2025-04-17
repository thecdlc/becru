module.exports = {
    testEnvironment: 'node',
    rootDir: '.',
    setupFilesAfterEnv: ['<rootDir>/tests/helpers/jest.setup.js'],
    globalSetup: '<rootDir>/tests/helpers/globalSetup.js',
    globalTeardown: '<rootDir>/tests/helpers/globalTeardown.js',
    coverageThreshold: { global: { lines: 80, branches: 80 } }
  };
  