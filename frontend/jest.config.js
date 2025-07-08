const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // CI環境での安定性向上
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // タイムゾーンをJSTに固定してCI環境での一貫性を保つ
  setupFiles: ['<rootDir>/jest.timezone.js'],
}

module.exports = createJestConfig(customJestConfig)