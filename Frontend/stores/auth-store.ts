// stores/auth.store.ts
'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService, {
  User,
  LoginData,
  RegisterData,
  AuthResponse,
} from '@/services/auth.service';

interface AuthState {
  // État
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions basiques
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions authentification
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  googleAuth: (accessToken: string) => Promise<AuthResponse>;
  logout: () => void;

  // Actions utilisateur
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Actions documents
  uploadDocument: (file: File, documentType: string) => Promise<any>;
  checkDocumentStatus: () => Promise<{
    can_publish_trip: boolean;
    has_verified_documents: boolean;
    message: string;
  }>;

  // Reset
  reset: () => void;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== SETTERS ==========
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // ========== LOGIN ==========
      login: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.login(data);

          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
          });

          return response;
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            'Erreur de connexion';
          set({ error: errorMsg, loading: false });
          throw new Error(errorMsg);
        }
      },

      // ========== REGISTER ==========
      register: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.register(data);

          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
          });

          return response;
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.error ||
            error.response?.data?.email?.[0] ||
            error.response?.data?.detail ||
            "Erreur d'inscription";
          set({ error: errorMsg, loading: false });
          throw new Error(errorMsg);
        }
      },

      // ========== GOOGLE AUTH ==========
      googleAuth: async (accessToken: string) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.googleAuth(accessToken);

          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
          });

          return response;
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.error || 'Erreur authentification Google';
          set({ error: errorMsg, loading: false });
          throw new Error(errorMsg);
        }
      },

      // ========== LOGOUT ==========
      logout: () => {
        authService.logout();
        set({
          ...initialState,
          loading: false,
        });
      },

      // ========== UPDATE USER ==========
      updateUser: (updatedUser) => {
        set({ user: updatedUser });
        authService.setUser(updatedUser);
      },

      // ========== CHECK AUTH ==========
      checkAuth: async () => {
        try {
          set({ loading: true });

          if (authService.isAuthenticated()) {
            try {
              const currentUser = await authService.getCurrentUser();
              set({
                user: currentUser,
                isAuthenticated: true,
                loading: false,
              });
            } catch (error) {
              console.warn('Failed to fetch current user:', error);
              const storedUser = authService.getStoredUser();
              if (storedUser) {
                set({
                  user: storedUser,
                  isAuthenticated: true,
                  loading: false,
                });
              } else {
                throw error;
              }
            }
          } else {
            set({ loading: false, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Erreur chargement utilisateur:', error);
          authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      // ========== REFRESH USER ==========
      refreshUser: async () => {
        try {
          const currentUser = await authService.getCurrentUser();
          set({ user: currentUser });
        } catch (error) {
          console.error('Erreur refresh user:', error);
          throw error;
        }
      },

      // ========== UPLOAD DOCUMENT ==========
      uploadDocument: async (file: File, documentType: string) => {
        try {
          const result = await authService.uploadDocument(file, documentType);
          // Refresh user to get updated documents
          await get().refreshUser();
          return result;
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.error || 'Erreur upload document';
          throw new Error(errorMsg);
        }
      },

      // ========== CHECK DOCUMENT STATUS ==========
      checkDocumentStatus: async () => {
        try {
          const token = authService.getAccessToken();
          if (!token) throw new Error('Non authentifié');

          const response = await fetch(
            `${API_URL}/api/v1/users/check-document-status/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (!response.ok) {
            throw new Error('Erreur vérification documents');
          }

          return await response.json();
        } catch (error: any) {
          console.error('Erreur check document status:', error);
          throw error;
        }
      },

      // ========== RESET ==========
      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
