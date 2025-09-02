// jest.config.ts or jest.config.js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './', // your project root
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // helpful if you're using CSS or images
    // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};

export default createJestConfig(customJestConfig);
