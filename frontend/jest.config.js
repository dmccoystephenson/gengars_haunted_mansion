module.exports = {
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  transform: {
    '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform',
  },
  testEnvironment: 'jsdom',
}
