import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import verificationService from '@/services/verification.service';
import { useAuthStore } from '@/stores/auth-store';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

jest.mock('@/services/auth.service');
jest.mock('@/services/verification.service');
jest.mock('@/stores/auth-store');

const mockedVerificationService = verificationService as jest.Mocked<
  typeof verificationService
>;

describe('useAuth', () => {
  const mockPush = jest.fn();
  const mockStoreActions = {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock du router
    require('next/navigation').useRouter = jest.fn(() => ({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    }));

    // Mock du store
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      ...mockStoreActions,
    });
  });

  describe('login', () => {
    it('redirige vers /verify si email non vérifié', async () => {
      mockStoreActions.login.mockResolvedValue(undefined);
      mockedVerificationService.getVerificationStatus.mockResolvedValue({
        email_verified: false,
        phone_verified: false,
        has_phone_number: true,
        first_login: false,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({
          email: 'test@test.com',
          password: '123456',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/verify');
      });
    });

    it('redirige vers /preferences si première connexion', async () => {
      mockStoreActions.login.mockResolvedValue(undefined);
      mockedVerificationService.getVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: true,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({
          email: 'test@test.com',
          password: '123456',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/preferences');
      });
    });

    it('redirige vers / si tout est vérifié et utilisateur existant', async () => {
      mockStoreActions.login.mockResolvedValue(undefined);
      mockedVerificationService.getVerificationStatus.mockResolvedValue({
        email_verified: true,
        phone_verified: true,
        has_phone_number: true,
        first_login: false,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login({
          email: 'test@test.com',
          password: '123456',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('gère les erreurs de login', async () => {
      const error = new Error('Invalid credentials');
      mockStoreActions.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login({
            email: 'wrong@test.com',
            password: 'wrong',
          });
        }),
      ).rejects.toThrow('Invalid credentials');

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('redirige toujours vers /verify après inscription', async () => {
      mockStoreActions.register.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: 'new@test.com',
          password: '123456',
          password_confirm: '123456',
          first_name: 'John',
          last_name: 'Doe',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/verify');
    });

    it("gère les erreurs d'inscription", async () => {
      const error = new Error('Email already exists');
      mockStoreActions.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.register({
            email: 'new@test.com',
            password: '123456',
            password_confirm: '123456',
            first_name: 'John',
            last_name: 'Doe',
          });
        }),
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('déconnecte et redirige vers /login', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockStoreActions.logout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('determineRedirectUrl', () => {
    it("retourne /verify en cas d'erreur", async () => {
      mockedVerificationService.getVerificationStatus.mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useAuth());

      const url = await result.current.determineRedirectUrl();
      expect(url).toBe('/verify');
    });
  });
});
