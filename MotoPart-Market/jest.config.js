module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  maxWorkers: 1,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  testMatch: [
    '**/test/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
