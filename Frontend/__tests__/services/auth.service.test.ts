import authService, {
  Preference,
  RidePreferences,
  User,
} from '@/services/auth.service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('AuthService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  // ----------------------
  // Token Management
  // ----------------------
  describe('Token Management', () => {
    test('setTokens() stores tokens in localStorage', () => {
      authService.setTokens('access123', 'refresh456');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'access123',
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'refresh456',
      );
    });

    test('getAccessToken() retrieves token from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('access123');

      const token = authService.getAccessToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
      expect(token).toBe('access123');
    });

    test('getAccessToken() returns null when no token', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const token = authService.getAccessToken();

      expect(token).toBeNull();
    });

    test('getRefreshToken() retrieves refresh token', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('refresh123');

      const token = authService.getRefreshToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('refresh_token');
      expect(token).toBe('refresh123');
    });

    test('removeTokens() clears all auth data', () => {
      authService.removeTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('isAuthenticated() returns true when token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('token123');

      expect(authService.isAuthenticated()).toBe(true);
    });

    test('isAuthenticated() returns false when no token', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  // ----------------------
  // Authentication
  // ----------------------
  describe('Authentication', () => {
    test('login() successfully authenticates user', async () => {
      const mockResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          phone_verified: true,
          email_verified: true,
        },
        tokens: {
          access: 'access_token_123',
          refresh: 'refresh_token_456',
        },
      };

      mock
        .onPost('http://localhost:8000/api/v1/users/login/')
        .reply(200, mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'access_token_123',
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_token_456',
      );
    });

    test('login() handles authentication errors', async () => {
      mock
        .onPost('http://localhost:8000/api/v1/users/login/')
        .reply(401, { error: 'Invalid credentials' });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong_password',
        }),
      ).rejects.toThrow();
    });

    test('login() handles network error', async () => {
      mock.onPost('http://localhost:8000/api/v1/users/login/').networkError();

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow();
    });

    test('logout() removes tokens and user', () => {
      const removeTokensSpy = jest.spyOn(authService, 'removeTokens');

      authService.logout();

      expect(removeTokensSpy).toHaveBeenCalled();
    });

    test('register() creates new user account', async () => {
      const mockResponse = {
        user: {
          id: 1,
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'User',
          phone_verified: false,
          email_verified: false,
        },
        tokens: {
          access: 'new_access_token',
          refresh: 'new_refresh_token',
        },
      };

      mock
        .onPost('http://localhost:8000/api/v1/users/register/')
        .reply(201, mockResponse);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
        first_name: 'New',
        last_name: 'User',
      });

      expect(result).toEqual(mockResponse);
    });

    test('register() handles validation error', async () => {
      mock
        .onPost('http://localhost:8000/api/v1/users/register/')
        .reply(400, { error: 'Invalid data' });

      await expect(
        authService.register({
          email: 'bad@example.com',
          password: '123',
          password_confirm: '456',
          first_name: 'Bad',
          last_name: 'User',
        }),
      ).rejects.toThrow();
    });

    test('googleAuth() authenticates with Google token', async () => {
      const mockResponse = {
        user: {
          id: 1,
          email: 'google@example.com',
          first_name: 'Google',
          last_name: 'User',
        },
        tokens: {
          access: 'google_access',
          refresh: 'google_refresh',
        },
        is_new_user: false,
      };

      mock
        .onPost('http://localhost:8000/api/v1/users/google_auth/')
        .reply(200, mockResponse);

      const result = await authService.googleAuth('google_token_123');

      expect(result).toEqual(mockResponse);
    });

    test('googleAuth() handles error', async () => {
      mock
        .onPost('http://localhost:8000/api/v1/users/google_auth/')
        .reply(400, { error: 'Invalid token' });

      await expect(authService.googleAuth('bad_token')).rejects.toThrow();
    });
  });

  // ----------------------
  // User Management
  // ----------------------
  describe('User Management', () => {
    test('getCurrentUser() fetches user data', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_verified: true,
        email_verified: true,
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock.onGet('http://localhost:8000/api/v1/users/me/').reply(200, mockUser);

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser),
      );
    });

    test('getCurrentUser() throws when not authenticated', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });

    test('getCurrentUser() throws on 401 from /me/', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/me/')
        .reply(401, { detail: 'Unauthorized' });

      await expect(authService.getCurrentUser()).rejects.toThrow();
    });

    test('setUser() stores user in localStorage', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_verified: true,
        email_verified: true,
      };

      authService.setUser(user);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(user),
      );
    });

    test('getStoredUser() retrieves user from localStorage', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(user));

      const result = authService.getStoredUser();

      expect(result).toEqual(user);
    });

    test('getStoredUser() returns null when no user', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = authService.getStoredUser();

      expect(result).toBeNull();
    });

    test('checkPreferences() returns data', async () => {
      const mockData = {
        has_preferences: true,
        preferences_count: 3,
        redirect_url: '/onboarding/preferences',
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/check_preferences/')
        .reply(200, mockData);

      const result = await authService.checkPreferences();

      expect(result).toEqual(mockData);
    });
  });

  // ----------------------
  // Preferences
  // ----------------------
  describe('Preferences', () => {
    test('getPreferences() fetches all system preferences (array)', async () => {
      const mockPreferences: Preference[] = [
        {
          id: 1,
          name: 'Non-fumeur',
          name_fr: 'Non-fumeur',
          name_en: 'Non-smoker',
          category: 'comfort',
        },
      ];

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/preferences/')
        .reply(200, mockPreferences);

      const result = await authService.getPreferences();

      expect(result).toEqual(mockPreferences);
    });

    test('getPreferences() handles object response with preferences key', async () => {
      const mockPreferences: Preference[] = [
        {
          id: 1,
          name: 'Music',
          name_fr: 'Musique',
          name_en: 'Music',
          category: 'atmosphere',
        },
      ];

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/preferences/')
        .reply(200, { preferences: mockPreferences });

      const result = await authService.getPreferences();

      expect(result).toEqual(mockPreferences);
    });

    test('getPreferences() returns empty array when no preferences field', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/preferences/')
        .reply(200, {});

      const result = await authService.getPreferences();

      expect(result).toEqual([]);
    });

    test('getPreferences() throws when not authenticated', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(authService.getPreferences()).rejects.toThrow();
    });

    test('getPreferences() handles error 500', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock.onGet('http://localhost:8000/api/v1/users/preferences/').reply(500);

      await expect(authService.getPreferences()).rejects.toThrow();
    });

    test('getAllPreferences() delegates to getPreferences', async () => {
      const spy = jest
        .spyOn(authService, 'getPreferences')
        .mockResolvedValue([] as Preference[]);

      const result = await authService.getAllPreferences();

      expect(spy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test('getUserPreferences() fetches user-specific preferences', async () => {
      const mockResponse = {
        preference_ids: [1, 2, 3],
        preferences: [
          { id: 1, name: 'Pref 1' },
          { id: 2, name: 'Pref 2' },
        ],
        count: 2,
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onGet('http://localhost:8000/api/v1/users/my-preferences/')
        .reply(200, mockResponse);

      const result = await authService.getUserPreferences();

      expect(result).toEqual(mockResponse);
    });

    test('getUserPreferences() throws when not authenticated', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(authService.getUserPreferences()).rejects.toThrow();
    });

    test('updatePreferences() saves user preferences and updates cached user', async () => {
      const preferenceIds = [1, 2, 3];
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_verified: true,
        email_verified: true,
      };

      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('token123') // token
        .mockReturnValueOnce(JSON.stringify(mockUser)); // user

      mock
        .onPost('http://localhost:8000/api/v1/users/preferences/')
        .reply(200, { success: true });

      await authService.updatePreferences(preferenceIds);

      expect(mock.history.post[0].data).toBe(
        JSON.stringify({ preference_ids: preferenceIds }),
      );

      const updatedUser = JSON.parse(
        (localStorage.setItem as jest.Mock).mock.calls.find(
          ([key]) => key === 'user',
        )[1] as string,
      );

      expect(updatedUser.has_preferences).toBe(true);
      expect(updatedUser.preferences_count).toBe(preferenceIds.length);
      expect(updatedUser.preferences).toEqual(preferenceIds);
    });

    test('updatePreferences() does not crash when no stored user', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('token123') // token
        .mockReturnValueOnce(null); // user

      mock
        .onPost('http://localhost:8000/api/v1/users/preferences/')
        .reply(200, { success: true });

      const result = await authService.updatePreferences([1, 2]);

      expect(result).toEqual({ success: true });
    });

    test('updatePreferences() throws when not authenticated', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(authService.updatePreferences([1, 2])).rejects.toThrow();
    });
  });

  // ----------------------
  // Ride Preferences & Onboarding
  // ----------------------
  describe('Ride preferences & onboarding', () => {
    test('saveRidePreferences() sends preferences', async () => {
      const prefs: RidePreferences = {
        smoking_allowed: false,
        pets_allowed: true,
        music_allowed: true,
        conversation_level: 'moderate',
        max_detour_minutes: 15,
      };

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');
      mock
        .onPost('http://localhost:8000/api/v1/users/ride-preferences/')
        .reply(200, { success: true });

      const result = await authService.saveRidePreferences(prefs);

      expect(result).toEqual({ success: true });
    });

    test('completeOnboarding() posts and updates cached user if present', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone_verified: true,
        email_verified: true,
      };

      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('token123') // token for header
        .mockReturnValueOnce(JSON.stringify(user)); // getStoredUser

      const setUserSpy = jest.spyOn(authService, 'setUser');

      mock
        .onPost('http://localhost:8000/api/v1/users/complete-onboarding/')
        .reply(200, { success: true });

      await authService.completeOnboarding();

      expect(setUserSpy).toHaveBeenCalledWith(user);
    });

    test('completeOnboarding() with no cached user does not crash', async () => {
      (localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('token123') // token
        .mockReturnValueOnce(null); // user

      const setUserSpy = jest.spyOn(authService, 'setUser');

      mock
        .onPost('http://localhost:8000/api/v1/users/complete-onboarding/')
        .reply(200, { success: true });

      await authService.completeOnboarding();

      expect(setUserSpy).not.toHaveBeenCalled();
    });
  });

  // ----------------------
  // Documents
  // ----------------------
  describe('Documents', () => {
    test('uploadDocument() uploads file and returns response', async () => {
      const file = new File(['dummy'], 'doc.png', { type: 'image/png' });

      (localStorage.getItem as jest.Mock).mockReturnValue('token123');

      mock
        .onPost('http://localhost:8000/api/v1/users/upload_document/')
        .reply(200, { success: true, id: 1 });

      const result = await authService.uploadDocument(file, 'ID_CARD');

      expect(result).toEqual({ success: true, id: 1 });
    });
  });

  // ----------------------
  // Token Refresh
  // ----------------------
  describe('Token Refresh', () => {
    test('refreshToken() gets new access token', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('refresh_token_123');

      mock
        .onPost('http://localhost:8000/api/v1/users/token/refresh/')
        .reply(200, { access: 'new_access_token' });

      const newToken = await authService.refreshToken();

      expect(newToken).toBe('new_access_token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'new_access_token',
      );
    });

    test('refreshToken() throws when no refresh token', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow(
        'No refresh token available',
      );
    });

    test('refreshToken() handles 401 error', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('refresh_token_123');

      mock
        .onPost('http://localhost:8000/api/v1/users/token/refresh/')
        .reply(401);

      await expect(authService.refreshToken()).rejects.toThrow();
    });

    test('refreshToken() handles network error', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('refresh_token_123');

      mock
        .onPost('http://localhost:8000/api/v1/users/token/refresh/')
        .networkError();

      await expect(authService.refreshToken()).rejects.toThrow();
    });
  });

  // ----------------------
  // Helpers: loadWithState & load
  // ----------------------
  describe('Helpers', () => {
    test('loadWithState() calls fetchFn and sets data, loading, and clears error', async () => {
      const fetchFn = jest.fn().mockResolvedValue([1, 2, 3]);
      const setData = jest.fn();
      const setLoading = jest.fn();
      const setError = jest.fn();

      await authService.loadWithState(fetchFn, setData, setLoading, setError);

      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setError).toHaveBeenCalledWith(null);
      expect(fetchFn).toHaveBeenCalled();
      expect(setData).toHaveBeenCalledWith([1, 2, 3]);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    test('loadWithState() handles error and sets error message', async () => {
      const fetchFn = jest
        .fn()
        .mockRejectedValue({ response: { data: { message: 'Custom error' } } });
      const setData = jest.fn();
      const setLoading = jest.fn();
      const setError = jest.fn();

      await authService.loadWithState(fetchFn, setData, setLoading, setError);

      expect(setError).toHaveBeenCalledWith('Custom error');
      expect(setLoading).toHaveBeenLastCalledWith(false);
      expect(setData).not.toHaveBeenCalled();
    });

    test('loadWithState() uses fallback error messages', async () => {
      const fetchFn = jest.fn().mockRejectedValue(new Error('Boom'));
      const setData = jest.fn();
      const setLoading = jest.fn();
      const setError = jest.fn();

      await authService.loadWithState(fetchFn, setData, setLoading, setError);

      expect(setError).toHaveBeenCalledWith('Boom');
    });

    test('load() sets data on success', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ value: 42 });
      const setData = jest.fn();

      await authService.load(fetchFn, setData);

      expect(fetchFn).toHaveBeenCalled();
      expect(setData).toHaveBeenCalledWith({ value: 42 });
    });

    test('load() logs error on failure', async () => {
      const fetchFn = jest.fn().mockRejectedValue(new Error('Failed'));
      const setData = jest.fn();
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await authService.load(fetchFn, setData);

      expect(consoleSpy).toHaveBeenCalled();
      expect(setData).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
