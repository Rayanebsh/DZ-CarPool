// services/auth.service.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';  // ✅ Ajouté /v1

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email_verified: boolean;
  phone_verified: boolean;
  profile_picture?: string;
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
  phone_number: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface GoogleAuthResponse extends AuthResponse {
  is_new_user: boolean;
  redirect_url: string;
}

class AuthService {
  // Login classique
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/login/`, data);
    this.setTokens(response.data.tokens);
    this.setUser(response.data.user);
    return response.data;
  }

  // Register classique
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/register/`, data);
    this.setTokens(response.data.tokens);
    this.setUser(response.data.user);
    return response.data;
  }

  // ✅ CORRIGÉ : Google OAuth
  async googleAuth(accessToken: string): Promise<GoogleAuthResponse> {
    try {
      console.log('🔵 Tentative de connexion Google...');
      console.log('🔵 URL:', `${API_URL}/users/google_auth/`);
      console.log('🔵 Token:', accessToken.substring(0, 20) + '...');
      
      // ✅ CORRECTION 1 : Parenthèses normales au lieu de backticks
      const response = await axios.post(`${API_URL}/users/google_auth/`, {
        access_token: accessToken
      });
      
      console.log('✅ Réponse reçue:', response.data);
      
      this.setTokens(response.data.tokens);
      this.setUser(response.data.user);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur Google Auth:', error.response?.data || error.message);
      throw error;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Upload document
  async uploadDocument(file: File, documentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);

    const response = await axios.post(
      `${API_URL}/users/upload_document/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    this.setUser(response.data);
    return response.data;
  }

  // Vérification email
  async sendEmailVerification(): Promise<void> {
    await axios.post(
      `${API_URL}/users/send_email_verification/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
  }

  async verifyEmail(code: string): Promise<void> {
    await axios.post(
      `${API_URL}/users/verify_email/`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
  }

  // Vérification téléphone
  async sendPhoneVerification(): Promise<void> {
    await axios.post(
      `${API_URL}/users/send_phone_verification/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
  }

  async verifyPhone(code: string): Promise<void> {
    await axios.post(
      `${API_URL}/users/verify_phone/`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
  }

  // Helpers
  private setTokens(tokens: { access: string; refresh: string }): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();