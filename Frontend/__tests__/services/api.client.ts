import apiClient from '@/services/api.client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('API Client', () => {
  let mockApiClient: MockAdapter;
  let mockAxios: MockAdapter;
  const API_URL = 'http://localhost:8000/api/v1';

  const originalHref = window.location.href;

  beforeEach(() => {
    mockApiClient = new MockAdapter(apiClient);
    mockAxios = new MockAdapter(axios);
    localStorage.clear();
    jest.clearAllMocks();

    // Mock window.location.href pour éviter les erreurs jsdom
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' },
    });
  });

  afterEach(() => {
    mockApiClient.restore();
    mockAxios.restore();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: originalHref },
    });
  });

  // ----------------------
  // Request Interceptor
  // ----------------------
  describe('Request Interceptor', () => {
    test('adds Authorization header when token exists', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('test_token_123');

      mockApiClient.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test_token_123');
        return [200, { success: true }];
      });

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ success: true });
    });

    test('does not add Authorization header when no token', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      mockApiClient.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true }];
      });

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ success: true });
    });
  });

  // ----------------------
  // Response Interceptor - Token Refresh
  // ----------------------
  describe('Response Interceptor - Token Refresh', () => {
    test('refreshes token on 401 error and retries request', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('expired_token') // pour la requête initiale
        .mockReturnValueOnce('refresh_token_123'); // pour refresh

      // Premier GET via apiClient renvoie 401
      mockApiClient.onGet('/protected').replyOnce(401);

      // Appel de refresh via axios (pas apiClient) -> succès
      mockAxios.onPost(`${API_URL}/users/token/refresh/`).replyOnce(200, {
        access: 'new_access_token',
        refresh: 'new_refresh_token',
      });

      // Retry via apiClient -> succès
      mockApiClient.onGet('/protected').replyOnce(200, { data: 'success' });

      const response = await apiClient.get('/protected');

      expect(response.data).toEqual({ data: 'success' });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'new_access_token',
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'new_refresh_token',
      );
    });

    test('refreshes token when server does not return new refresh token', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('expired_token')
        .mockReturnValueOnce('refresh_token_123');

      mockApiClient.onGet('/protected').replyOnce(401);

      mockAxios.onPost(`${API_URL}/users/token/refresh/`).replyOnce(200, {
        access: 'new_access_token_only',
        // pas de refresh dans data
      });

      mockApiClient
        .onGet('/protected')
        .replyOnce(200, { data: 'ok_without_refresh' });

      const response = await apiClient.get('/protected');

      expect(response.data).toEqual({ data: 'ok_without_refresh' });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'new_access_token_only',
      );
      // aucun nouvel appel à setItem pour refresh_token
      expect(
        (localStorage.setItem as jest.Mock).mock.calls.filter(
          ([key]) => key === 'refresh_token',
        ).length,
      ).toBe(0);
    });

    test('redirects to login when no refresh token', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('expired_token') // access
        .mockReturnValueOnce(null); // refresh

      mockApiClient.onGet('/protected').replyOnce(401);

      await expect(apiClient.get('/protected')).rejects.toThrow();

      expect(window.location.href).toBe('/login');
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('redirects to login when refresh call fails', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('expired_token')
        .mockReturnValueOnce('refresh_token_123');

      mockApiClient.onGet('/protected').replyOnce(401);

      // Refresh échoue (erreur 500, par ex.)
      mockAxios.onPost(`${API_URL}/users/token/refresh/`).replyOnce(500, {});

      await expect(apiClient.get('/protected')).rejects.toThrow();

      expect(window.location.href).toBe('/login');
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('does not retry if _retry already true', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('expired_token');

      // On force une réponse 401 mais on simule que _retry est déjà à true
      mockApiClient.onGet('/protected-once').replyOnce((config) => {
        // simuler un objet error de axios
        const error: any = new Error('Unauthorized');
        error.config = { ...config, _retry: true };
        error.response = { status: 401 };
        throw error;
      });

      await expect(apiClient.get('/protected-once')).rejects.toThrow(
        'Unauthorized',
      );

      // pas d'appel au refresh via axios
      expect(
        mockAxios.history.post.find((r) =>
          r.url?.includes('/users/token/refresh/'),
        ),
      ).toBeUndefined();
    });
  });

  // ----------------------
  // Base Configuration
  // ----------------------
  describe('Base Configuration', () => {
    test('uses correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe(API_URL);
    });

    test('has correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe(
        'application/json',
      );
    });

    test('has correct timeout', () => {
      expect(apiClient.defaults.timeout).toBe(10000);
    });
  });
});
