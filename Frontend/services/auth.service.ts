// services/auth.service.ts
import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_picture?: string;
  bio?: string;
  preferences?: number[];
  has_preferences?: boolean;
  preferences_count?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface GoogleAuthData {
  access_token: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  is_new_user?: boolean;
  has_preferences?: boolean;
  redirect_url?: string;
}

class AuthService {
  private tokenKey = 'access_token';
  private refreshKey = 'refresh_token';
  private userKey = 'user';

  // ========== STORAGE ==========
  setTokens(access: string, refresh: string) {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.refreshKey, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  removeTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }

  setUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // ========== AUTH METHODS ==========
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/login/`, data);
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/register/`, data);
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  async googleAuth(accessToken: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/google_auth/`, {
      access_token: accessToken,
    });
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  logout() {
    this.removeTokens();
  }

  // ========== USER METHODS ==========
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });

    const user = response.data;
    this.setUser(user);
    return user;
  }

  async checkPreferences(): Promise<{
    has_preferences: boolean;
    preferences_count: number;
    redirect_url: string;
  }> {
    const response = await axios.get(`${API_URL}/users/check_preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    return response.data;
  }

  // ========== PREFERENCES ==========
  async getPreferences(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/users/preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    return response.data;
  }

  async getUserPreferences(): Promise<{
    preference_ids: number[];
    preferences: any[];
    count: number;
  }> {
    const response = await axios.get(`${API_URL}/users/preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    return response.data;
  }

  async updatePreferences(preferenceIds: number[]): Promise<any> {
    const response = await axios.post(
      `${API_URL}/users/preferences/`,
      { preference_ids: preferenceIds },
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      },
    );

    const user = this.getStoredUser();
    if (user) {
      user.has_preferences = true;
      user.preferences_count = preferenceIds.length;
      this.setUser(user);
    }

    return response.data;
  }

  // ========== DOCUMENTS ==========
  async uploadDocument(file: File, documentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file_path', file);
    formData.append('document_type', documentType);

    const response = await axios.post(
      `${API_URL}/users/upload_document/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  // ========== TOKEN REFRESH ==========
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_URL}/users/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem(this.tokenKey, newAccessToken);

    return newAccessToken;
  }
}

const authService = new AuthService();
export default authService;
