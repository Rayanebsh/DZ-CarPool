// __tests__/app/layout.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import RootLayout from '@/app/layout';
import { useAuthStore } from '@/stores/auth-store';

// Mock Analytics
jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="analytics">Analytics</div>,
}));

// Mock GoogleOAuthProvider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => (
    <div data-testid="google-oauth-provider">{children}</div>
  ),
}));

// Mock LanguageProvider
jest.mock('@/contexts/language-context', () => ({
  LanguageProvider: ({ children }: any) => (
    <div data-testid="language-provider">{children}</div>
  ),
}));

// Mock auth store
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(),
}));

describe('RootLayout', () => {
  const mockCheckAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      checkAuth: mockCheckAuth,
    });
    
    // Mock env variable
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
  });

  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('wraps children with GoogleOAuthProvider', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
  });

  it('wraps children with LanguageProvider', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId('language-provider')).toBeInTheDocument();
  });

  it('includes Analytics component', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId('analytics')).toBeInTheDocument();
  });

  it('calls checkAuth on mount', async () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correct HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    const body = container.querySelector('body');

    expect(html).toBeInTheDocument();
    expect(html).toHaveAttribute('lang', 'en');
    expect(body).toBeInTheDocument();
  });

  it('handles missing Google Client ID gracefully', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    // Should still render without errors
    expect(screen.getByTestId('google-oauth-provider')).toBeInTheDocument();
  });

  it('maintains provider hierarchy', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="nested-child">Nested</div>
      </RootLayout>
    );

    // GoogleOAuthProvider wraps LanguageProvider
    const googleProvider = screen.getByTestId('google-oauth-provider');
    const languageProvider = screen.getByTestId('language-provider');
    
    expect(googleProvider).toContainElement(languageProvider);
    expect(languageProvider).toContainElement(screen.getByTestId('nested-child'));
  });
});