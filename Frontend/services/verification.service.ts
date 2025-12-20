// services/verification.service.ts
import apiClient from './api.client';

export interface VerificationResponse {
  message: string;
  expires_at: string;
}

export interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  email: string;
  phone_number: string;
}

class VerificationService {
  /**
   * Envoie un code de vérification par email
   */
  async sendEmailVerification(): Promise<VerificationResponse> {
    try {
      const response = await apiClient.post('/users/send_email_verification/');
      return response.data;
    } catch (error: any) {
      // Gérer le cas où l'email est déjà vérifié
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || error.response?.data?.error;
        if (message?.includes('déjà vérifié')) {
          console.log('ℹ️ Email déjà vérifié');
          throw new Error('EMAIL_ALREADY_VERIFIED');
        }
      }
      throw error;
    }
  }

  /**
   * Vérifie le code email
   */
  async verifyEmail(code: string): Promise<{ message: string; email_verified: boolean }> {
    const response = await apiClient.post('/users/verify_email/', { code });
    return response.data;
  }

  /**
   * Envoie un code de vérification par téléphone
   */
  async sendPhoneVerification(): Promise<VerificationResponse> {
    try {
      const response = await apiClient.post('/users/send_phone_verification/');
      return response.data;
    } catch (error: any) {
      // Gérer le cas où le téléphone est déjà vérifié
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || error.response?.data?.error;
        if (message?.includes('déjà vérifié')) {
          console.log('ℹ️ Téléphone déjà vérifié');
          throw new Error('PHONE_ALREADY_VERIFIED');
        }
        if (message?.includes('Aucun numéro')) {
          console.log('ℹ️ Aucun numéro de téléphone');
          throw new Error('NO_PHONE_NUMBER');
        }
      }
      throw error;
    }
  }

  /**
   * Vérifie le code téléphone
   */
  async verifyPhone(code: string): Promise<{ message: string; phone_verified: boolean }> {
    const response = await apiClient.post('/users/verify_phone/', { code });
    return response.data;
  }

  /**
   * Récupère le statut de vérification
   */
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await apiClient.get('/users/verification_status/');
    return response.data;
  }
}

export default new VerificationService();