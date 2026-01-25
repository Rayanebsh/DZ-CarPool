import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth-store';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      loading: false,
      isAuthenticated: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  test('initial state is correct', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('setUser() updates user state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    } as any;

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  test('setIsAuthenticated() updates auth status', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setIsAuthenticated(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('setLoading() updates loading state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);
  });

  test('logout() clears all auth data', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      result.current.setUser({ id: 1, email: 'test@example.com' } as any);
      result.current.setIsAuthenticated(true);
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('updateUser() updates user and localStorage', () => {
    const { result } = renderHook(() => useAuthStore());
    const updatedUser = {
      id: 1,
      email: 'updated@example.com',
      first_name: 'Updated',
      last_name: 'User',
    } as any;

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
  });
});
