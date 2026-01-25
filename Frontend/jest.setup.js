// ============================================
// jest.setup.js - À la RACINE du projet
// ============================================
import '@testing-library/jest-dom';

// ============================================
// 1. MOCK DE LOCALSTORAGE
// ============================================
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================
// 2. MOCK DE NEXT/NAVIGATION
// ============================================
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    pathname: '/',
    query: {},
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// ============================================
// 3. MOCK DE NEXT/IMAGE
// ============================================
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// ============================================
// 4. MOCK DE USE-AUTH
// ============================================
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    error: null,
    checkAuth: jest.fn().mockResolvedValue(undefined),
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue({ success: true }),
    isAuthenticated: false,
  })),
}));

// ============================================
// 5. MOCK DE GOOGLE OAUTH
// ============================================
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  useGoogleLogin: jest.fn(() => jest.fn()),
}));

// ============================================
// 6. MOCK DE WINDOW.MATCHMEDIA
// ============================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ============================================
// 7. MOCK DE INTERSECTIONOBSERVER
// ============================================
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// ============================================
// 8. MOCK DE RESIZEOBSERVER
// ============================================
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// ============================================
// 9. MOCK DE FETCH (pour les appels API)
// ============================================
global.fetch = jest.fn();

// ============================================
// 10. SUPPRESSION DES WARNINGS INUTILES
// ============================================
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('Error: Not implemented: HTMLFormElement.prototype.requestSubmit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ============================================
// 11. RESET DES MOCKS ENTRE CHAQUE TEST
// ============================================
beforeEach(() => {
  // Reset localStorage
  localStorageMock.clear();
  jest.clearAllMocks();
  
  // Reset navigation mocks
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
  mockPrefetch.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ============================================
// 12. EXPORT DES MOCKS POUR LES TESTS
// ============================================
export { mockPush, mockReplace, mockBack, mockPrefetch, localStorageMock };