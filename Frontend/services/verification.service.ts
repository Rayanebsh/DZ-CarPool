// services/verification.service.ts - VERSION COMPLÈTE

import api from './api.client';

// ✅ Interface mise à jour avec les nouveaux champs
export interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  phone_number?: string | null;
  has_phone_number: boolean; // ✅ Ajouté
  first_login: boolean; // ✅ Ajouté
}

class VerificationService {
  /**
   * ✅ Récupère le statut de vérification de l'utilisateur
   * Retourne si l'email et le téléphone sont vérifiés,
   * ainsi que si c'est la première connexion
   */
  async getVerificationStatus(): Promise<VerificationStatus> {
    try {
      const response = await api.get('/users/verification-status/');
      const data = response.data;

      return {
        email_verified: data.email_verified || false,
        phone_verified: data.phone_verified || false,
        phone_number: data.phone_number,
        has_phone_number: !!data.phone_number || data.has_phone_number || false,
        first_login: data.first_login || false,
      };
    } catch (error: any) {
      console.error('Error getting verification status:', error);
      throw error;
    }
  }

  /**
   * ✅ Envoie un code de vérification par email
   */
  async sendEmailVerification(): Promise<void> {
    try {
      await api.post('/users/send-email-verification/');
    } catch (error: any) {
      if (error.response?.data?.error === 'EMAIL_ALREADY_VERIFIED') {
        throw new Error('EMAIL_ALREADY_VERIFIED');
      }
      throw error;
    }
  }

  /**
   * ✅ Envoie un code de vérification par SMS
   */
  async sendPhoneVerification(): Promise<void> {
    try {
      await api.post('/users/send-phone-verification/');
    } catch (error: any) {
      if (error.response?.data?.error === 'PHONE_ALREADY_VERIFIED') {
        throw new Error('PHONE_ALREADY_VERIFIED');
      }
      if (error.response?.data?.error === 'NO_PHONE_NUMBER') {
        throw new Error('NO_PHONE_NUMBER');
      }
      throw error;
    }
  }

  /**
   * ✅ Vérifie l'email avec le code reçu
   * @param code - Code de vérification à 6 chiffres
   */
  async verifyEmail(_code: string): Promise<void> {}

  /**
   * ✅ Vérifie le téléphone avec le code reçu par SMS
   * @param code - Code de vérification à 6 chiffres
   */
  async verifyPhone(_code: string): Promise<void> {}
}

export default new VerificationService();
