// hooks/use-auth.ts
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoginData, RegisterData } from '@/services/auth.service';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = async (data: LoginData) => {
    try {
      await store.login(data);
      
      // ✅ Vérifier le statut de vérification
      const user = useAuthStore.getState().user;
      
      if (!user?.email_verified || !user?.phone_verified) {
        router.push('/verify');
      } else {
        router.push('/#hero');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await store.register(data);
      
      // ✅ Rediriger vers la vérification après inscription
      router.push('/verify');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    store.logout();
    router.push('/login');
  };

  return {
    user: store.user,
    loading: store.loading,
    error: store.error,
    isAuthenticated: store.isAuthenticated,
    login,
    register,
    logout,
    checkAuth: store.checkAuth,
    updateUser: store.updateUser,
  };
}