'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import verificationService from '@/services/verification.service';
import authService from '@/services/auth.service';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const status = await verificationService.getVerificationStatus();
      setEmailVerified(status.email_verified);
      setPhoneVerified(status.phone_verified);

      // Si tout est vérifié, rediriger
      if (status.email_verified && status.phone_verified) {
        router.push('/dashboard');
        return;
      }

      // Envoyer les codes automatiquement si nécessaire
      await sendInitialCodes(status.email_verified, status.phone_verified);
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
      setError('Erreur lors de la vérification du statut');
    } finally {
      setLoading(false);
    }
  };

  const sendInitialCodes = async (emailAlreadyVerified: boolean, phoneAlreadyVerified: boolean) => {
    // Envoyer le code email si nécessaire
    if (!emailAlreadyVerified) {
      try {
        await verificationService.sendEmailVerification();
        setEmailSent(true);
        console.log('✅ Code email envoyé');
      } catch (err: any) {
        if (err.message === 'EMAIL_ALREADY_VERIFIED') {
          setEmailVerified(true);
          console.log('ℹ️ Email déjà vérifié, pas besoin de code');
        } else {
          console.error('❌ Erreur envoi code email:', err);
          // Ne pas bloquer si l'envoi échoue
        }
      }
    }

    // Envoyer le code téléphone si nécessaire
    if (!phoneAlreadyVerified) {
      try {
        await verificationService.sendPhoneVerification();
        setPhoneSent(true);
        console.log('✅ Code téléphone envoyé');
      } catch (err: any) {
        if (err.message === 'PHONE_ALREADY_VERIFIED') {
          setPhoneVerified(true);
          console.log('ℹ️ Téléphone déjà vérifié, pas besoin de code');
        } else if (err.message === 'NO_PHONE_NUMBER') {
          console.log('ℹ️ Aucun numéro de téléphone, vérification ignorée');
          setPhoneVerified(true); // Marquer comme "vérifié" pour éviter de bloquer
        } else {
          console.error('❌ Erreur envoi code téléphone:', err);
          // Ne pas bloquer si l'envoi échoue
        }
      }
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await verificationService.verifyEmail(emailCode);
      setEmailVerified(true);
      setSuccess('Email vérifié avec succès !');

      // Si tout est vérifié, rediriger
      if (phoneVerified) {
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code email invalide');
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await verificationService.verifyPhone(phoneCode);
      setPhoneVerified(true);
      setSuccess('Téléphone vérifié avec succès !');

      // Si tout est vérifié, rediriger
      if (emailVerified) {
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code téléphone invalide');
    }
  };

  const handleResendEmailCode = async () => {
    try {
      await verificationService.sendEmailVerification();
      setSuccess('Nouveau code email envoyé !');
    } catch (err: any) {
      if (err.message === 'EMAIL_ALREADY_VERIFIED') {
        setEmailVerified(true);
        setSuccess('Email déjà vérifié !');
      } else {
        setError('Erreur lors de l\'envoi du code');
      }
    }
  };

  const handleResendPhoneCode = async () => {
    try {
      await verificationService.sendPhoneVerification();
      setSuccess('Nouveau code téléphone envoyé !');
    } catch (err: any) {
      if (err.message === 'PHONE_ALREADY_VERIFIED') {
        setPhoneVerified(true);
        setSuccess('Téléphone déjà vérifié !');
      } else if (err.message === 'NO_PHONE_NUMBER') {
        setError('Aucun numéro de téléphone enregistré');
      } else {
        setError('Erreur lors de l\'envoi du code');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vérification de compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vérifiez votre email et téléphone pour continuer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Email Verification */}
          {!emailVerified && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📧 Vérification Email
              </h3>
              {emailSent && (
                <p className="text-sm text-gray-600 mb-4">
                  Un code a été envoyé à votre adresse email
                </p>
              )}
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Vérifier Email
                </button>
                <button
                  type="button"
                  onClick={handleResendEmailCode}
                  className="w-full text-center text-sm text-orange-600 hover:text-orange-500"
                >
                  Renvoyer le code
                </button>
              </form>
            </div>
          )}

          {emailVerified && (
            <div className="flex items-center text-green-600 border-b pb-6">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Email vérifié ✓</span>
            </div>
          )}

          {/* Phone Verification */}
          {!phoneVerified && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📱 Vérification Téléphone
              </h3>
              {phoneSent && (
                <p className="text-sm text-gray-600 mb-4">
                  Un code SMS a été envoyé à votre téléphone
                </p>
              )}
              <form onSubmit={handleVerifyPhone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Vérifier Téléphone
                </button>
                <button
                  type="button"
                  onClick={handleResendPhoneCode}
                  className="w-full text-center text-sm text-orange-600 hover:text-orange-500"
                >
                  Renvoyer le code
                </button>
              </form>
            </div>
          )}

          {phoneVerified && !emailVerified && (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Téléphone vérifié ✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}