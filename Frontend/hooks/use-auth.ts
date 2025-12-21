import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  // Wrapper pour login avec redirection
  const login = async (data: any) => {
    await store.login(data);
    router.push('/#hero');
  };

  // Wrapper pour register avec redirection
  const register = async (data: any) => {
    await store.register(data);
    router.push('/verify');
  };

  // Wrapper pour logout avec redirection
  const logout = () => {
    store.logout();
    router.push('/login');
  };

  return {
    user: store.user,
    loading: store.loading,
    isAuthenticated: store.isAuthenticated,
    setUser: store.setUser,
    setIsAuthenticated: store.setIsAuthenticated,
    updateUser: store.updateUser,
    login,
    register,
    logout,
  };
}
