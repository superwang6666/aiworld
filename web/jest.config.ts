import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    '!components/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    // Global threshold (lower for now since not all components are tested)
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    // Per-file thresholds for tested components
    './components/RuleCard.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './components/ArchiveManager.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './components/workflow/RulesDisplay.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
