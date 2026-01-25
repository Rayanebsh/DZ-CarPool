import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'DZ-CarPool Tests',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  testEnvironment: 'jest-environment-jsdom',

  moduleDirectories: ['node_modules', '<rootDir>/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/stores/(.*)$': '<rootDir>/stores/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },

  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!app/**/*.tsx',
    '!components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!stores/preferences-store.ts',
    '!stores/documents.store.ts',
    '!stores/auth-store.ts',
    '!hooks/useWebSocket.ts',
    '!hooks/useNotifications.ts',
    '!hooks/use-toast.ts',
    '!app/contact/page.tsx',
    '!app/about/page.tsx',
    '!app/careers/page.tsx',
    '!app/admin/page.tsx',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],

  testTimeout: 10000,

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default createJestConfig(customJestConfig);
