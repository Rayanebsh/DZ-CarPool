// services/auth.service.ts - VERSION COMPLÈTE
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  is_staff: boolean;
  is_active: boolean;
  average_rating?: number;
  date_joined: string;
  first_login: boolean;
}

export interface Preference {
  id: number;
  name: string;
  name_fr: string;
  name_en: string;
  category: string;
  icon?: string;
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

export interface RidePreferences {
  smoking_allowed?: boolean;
  pets_allowed?: boolean;
  music_allowed?: boolean;
  conversation_level?: 'quiet' | 'moderate' | 'chatty';
  max_detour_minutes?: number;
  preferred_departure_time?: string;
}

class AuthService {
  private tokenKey = 'access_token';
  private refreshKey = 'refresh_token';
  private userKey = 'user';

  // ========== STORAGE ==========
  setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.refreshKey, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  removeTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }

  setUser(user: User): void {
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
    const response = await axios.post(`${API_URL}/api/v1/users/login/`, data);
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/v1/users/register/`, data);
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  async googleAuth(accessToken: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/v1/users/google_auth/`, {
      access_token: accessToken,
    });
    const authData: AuthResponse = response.data;

    this.setTokens(authData.tokens.access, authData.tokens.refresh);
    this.setUser(authData.user);

    return authData;
  }

  logout(): void {
    this.removeTokens();
  }

  // ========== USER METHODS ==========
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/api/v1/users/me/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/json',
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
    const response = await axios.get(`${API_URL}/api/v1/users/check_preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    return response.data;
  }

  // ========== PREFERENCES ==========

  /**
   * ✅ Récupère TOUTES les préférences disponibles dans le système
   * Cette méthode est utilisée pour afficher la liste complète des préférences
   * lors de la création d'un trajet ou la configuration du profil
   */
  async getPreferences(): Promise<Preference[]> {
    const response = await axios.get(`${API_URL}/api/v1/users/preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });

    // Le backend peut retourner soit un array direct, soit un objet avec preferences
    return Array.isArray(response.data)
      ? response.data
      : response.data.preferences || [];
  }

  /**
   * ✅ Alias pour getPreferences() - pour la compatibilité avec l'ancien code
   */
  async getAllPreferences(): Promise<Preference[]> {
    return this.getPreferences();
  }

  /**
   * ✅ Récupère les préférences de l'utilisateur connecté uniquement
   * Retourne les IDs et les objets complets des préférences
   */
  async getUserPreferences(): Promise<{
    preference_ids: number[];
    preferences: Preference[];
    count: number;
  }> {
    const response = await axios.get(`${API_URL}/api/v1/users/my-preferences/`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
    return response.data;
  }

  /**
   * ✅ Met à jour les préférences de l'utilisateur
   * @param preferenceIds - Liste des IDs de préférences à associer
   */
  async updatePreferences(preferenceIds: number[]): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/v1/users/preferences/`,
      { preference_ids: preferenceIds },
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      },
    );

    // Mettre à jour le cache local de l'utilisateur
    const user = this.getStoredUser();
    if (user) {
      user.has_preferences = true;
      user.preferences_count = preferenceIds.length;
      user.preferences = preferenceIds;
      this.setUser(user);
    }

    return response.data;
  }

  // ========== ONBOARDING & RIDE PREFERENCES ==========

  /**
   * ✅ Sauvegarde les préférences de covoiturage
   * @param preferences - Préférences de trajet (fumeur, animaux, musique, etc.)
   */
  async saveRidePreferences(preferences: RidePreferences): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/v1/users/ride-preferences/`,
      preferences,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  /**
   * ✅ Marque l'onboarding comme terminé
   * Ceci met first_login à false pour l'utilisateur
   */
  async completeOnboarding(): Promise<void> {
    await axios.post(
      `${API_URL}/api/v1/users/complete-onboarding/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Mettre à jour le cache local
    const user = this.getStoredUser();
    if (user) {
      this.setUser(user);
    }
  }

  // ========== DOCUMENTS ==========
  async uploadDocument(file: File, documentType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file_path', file);
    formData.append('document_type', documentType);

    const response = await axios.post(
      `${API_URL}/api/v1/users/upload_document/`,
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

    const response = await axios.post(`${API_URL}/api/v1/users/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem(this.tokenKey, newAccessToken);

    return newAccessToken;
  }

  // ========== CUSTOM HOOKS HELPERS ==========

  /**
   * ✅ HELPER : Pour simplifier le chargement de données avec gestion d'état
   *
   * Exemple d'utilisation :
   * ```typescript
   * const [preferences, setPreferences] = useState<Preference[]>([]);
   * const [loading, setLoading] = useState(true);
   * const [error, setError] = useState<string | null>(null);
   *
   * useEffect(() => {
   *   authService.loadWithState(
   *     () => authService.getPreferences(),
   *     setPreferences,
   *     setLoading,
   *     setError
   *   );
   * }, []);
   * ```
   */
  async loadWithState<T>(
    fetchFn: () => Promise<T>,
    setData: (data: T) => void,
    setLoading?: (loading: boolean) => void,
    setError?: (error: string | null) => void,
  ): Promise<void> {
    try {
      if (setLoading) setLoading(true);
      if (setError) setError(null);

      const data = await fetchFn();
      setData(data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      if (setError) {
        setError(
          error.response?.data?.message ||
            error.message ||
            'Une erreur est survenue',
        );
      }
    } finally {
      if (setLoading) setLoading(false);
    }
  }

  /**
   * ✅ HELPER : Version simplifiée sans gestion d'erreur
   * Pour les cas où vous voulez juste charger des données
   */
  async load<T>(
    fetchFn: () => Promise<T>,
    setData: (data: T) => void,
  ): Promise<void> {
    try {
      const data = await fetchFn();
      setData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}

const authService = new AuthService();
export default authService;
