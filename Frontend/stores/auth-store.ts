'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService, {
  User,
  LoginData,
  RegisterData,
} from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      setLoading: (loading) => set({ loading }),

      login: async (data) => {
        try {
          const response = await authService.login(data);
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Erreur de connexion');
        }
      },

      register: async (data) => {
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.error ||
            error.response?.data?.email?.[0] ||
            "Erreur d'inscription";
          throw new Error(errorMsg);
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedUser) => {
        set({ user: updatedUser });
        authService.setUser(updatedUser);
      },

      checkAuth: async () => {
        try {
          set({ loading: true });
          if (authService.isAuthenticated()) {
            const storedUser = authService.getStoredUser();
            if (storedUser) {
              set({
                user: storedUser,
                isAuthenticated: true,
                loading: false,
              });
            } else {
              const currentUser = await authService.getCurrentUser();
              set({
                user: currentUser,
                isAuthenticated: true,
                loading: false,
              });
            }
          } else {
            set({ loading: false });
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
