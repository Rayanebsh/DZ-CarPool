// services/auth.service.ts
import apiClient from '@/lib/axios';

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture?: string;
  bio?: string;
  role: number;
  trips_as_driver: number;
  trips_as_passenger: number;
  average_rating: string;
  is_active: boolean;
  date_joined: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/users/register/', data);
    
    // Sauvegarder les tokens et l'utilisateur
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/users/login/', data);
    
    // Sauvegarder les tokens et l'utilisateur
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Upload de document
   */
  async uploadDocument(file: File, documentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file_path', file);
    formData.append('document_type', documentType);

    const response = await apiClient.post('/users/upload_document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default authService;