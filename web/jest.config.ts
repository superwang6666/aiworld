import nextJest from 'next/jest.js';

import type { Config } from 'jest';

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
    'lib/**/*.{ts,tsx}',
    '!components/**/*.d.ts',
    '!lib/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    // Global threshold (lower for now since not all components/lib modules are tested)
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    // Per-file thresholds — only for files that actually have real tests.
    // Don't add one for an untested file, it just fails the run.
    './lib/laws/weight-calculator.ts': {
      branches: 70,
      functions: 90,
      lines: 85,
      statements: 85,
    },
    './lib/tags/tag-manager.ts': {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: 95,
    },
    './lib/rules/rule-manager.ts': {
      // 只测了纯函数部分（calculateRuleDeletionScore/updateDeletionScores）；
      // toggleRule/deleteRule/generateRandomRule 是发请求的异步函数，未覆盖。
      branches: 10,
      functions: 25,
      lines: 15,
      statements: 15,
    },
    './lib/utils/toast-store.ts': {
      branches: 70,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/utils/rate-limit.ts': {
      branches: 80,
      functions: 75,
      lines: 85,
      statements: 85,
    },
  },
};

export default createJestConfig(config);
