// hooks/use-auth.ts
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { LoginData, RegisterData } from '@/services/auth.service';
import verificationService from '@/services/verification.service';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  /**
   * ✅ Détermine la bonne redirection selon le statut de l'utilisateur
   */
  const determineRedirectUrl = async (): Promise<string> => {
    try {
      const status = await verificationService.getVerificationStatus();

      console.log('📊 Détermination de la redirection:', {
        email_verified: status.email_verified,
        phone_verified: status.phone_verified,
        has_phone_number: status.has_phone_number,
        first_login: status.first_login,
      });

      // 1️⃣ Si email OU téléphone non vérifié → /verify
      if (
        !status.email_verified ||
        (!status.phone_verified && status.has_phone_number)
      ) {
        console.log('🔄 Redirection: /verify (vérification nécessaire)');
        return '/verify';
      }

      // 2️⃣ Si tout vérifié + première connexion → /preferences
      if (status.first_login) {
        console.log('🔄 Redirection: /preferences (première connexion)');
        return '/preferences';
      }

      // 3️⃣ Sinon → / (accueil)
      console.log('🔄 Redirection: / (utilisateur existant)');
      return '/';
    } catch (error) {
      console.error('❌ Erreur détermination redirection:', error);
      // Par défaut, rediriger vers /verify en cas d'erreur
      return '/verify';
    }
  };

  const login = async (data: LoginData) => {
    await store.login(data);

    // ✅ Déterminer la redirection intelligente
    const redirectUrl = await determineRedirectUrl();
    router.push(redirectUrl);
  };

  const register = async (data: RegisterData) => {
    await store.register(data);

    // ✅ Après inscription, toujours rediriger vers /verify
    // Car l'utilisateur doit vérifier son email et téléphone
    router.push('/verify');
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
    determineRedirectUrl, // ✅ Exposer pour utilisation dans GoogleLoginButton
  };
}
