'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import verificationService from '@/services/verification.service';

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
  const [hasPhoneNumber, setHasPhoneNumber] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  // ✅ Redirection UNIQUEMENT quand EMAIL vérifié ET (téléphone vérifié OU pas de téléphone)
  useEffect(() => {
    const canRedirect = emailVerified && phoneVerified;

    if (canRedirect && !loading) {
      console.log('✅ Tout est vérifié, redirection...');
      setTimeout(() => {
        if (isFirstLogin) {
          console.log('🎯 Première connexion → /preferences');
          router.push('/preferences');
        } else {
          console.log('🎯 Connexion habituelle → /');
          router.push('/');
        }
      }, 1500);
    }
  }, [
    emailVerified,
    phoneVerified,
    hasPhoneNumber,
    loading,
    isFirstLogin,
    router,
  ]);

  const checkVerificationStatus = async () => {
    try {
      const status = await verificationService.getVerificationStatus();
      setEmailVerified(status.email_verified);
      setPhoneVerified(status.phone_verified);
      setIsFirstLogin(status.first_login);
      setHasPhoneNumber(status.has_phone_number);

      console.log('📊 Statut de vérification:', status);
      console.log('🔑 Première connexion ?', status.first_login);
      console.log('📧 Email vérifié ?', status.email_verified);
      console.log('📱 Téléphone vérifié ?', status.phone_verified);
      console.log('📱 A un téléphone ?', status.has_phone_number);

      // ✅ Vérifier si tout est OK pour rediriger
      const isFullyVerified =
        status.email_verified &&
        (status.phone_verified || !status.has_phone_number);

      if (isFullyVerified) {
        console.log('✅ Déjà vérifié, redirection immédiate');
        if (status.first_login) {
          router.push('/preferences');
        } else {
          router.push('/');
        }
        return;
      }

      // Envoyer les codes automatiquement si nécessaire
      await sendInitialCodes(
        status.email_verified,
        status.phone_verified,
        status.has_phone_number,
      );
    } catch (err) {
      console.error('❌ Erreur vérification statut:', err);
      setError('Erreur lors de la vérification du statut');
    } finally {
      setLoading(false);
    }
  };

  const sendInitialCodes = async (
    emailAlreadyVerified: boolean,
    phoneAlreadyVerified: boolean,
    hasPhone: boolean,
  ) => {
    if (!emailAlreadyVerified) {
      try {
        await verificationService.sendEmailVerification();
        setEmailSent(true);
        console.log('✅ Code email envoyé');
      } catch (err: any) {
        if (err.message === 'EMAIL_ALREADY_VERIFIED') {
          setEmailVerified(true);
          console.log('ℹ️ Email déjà vérifié');
        } else {
          console.error('❌ Erreur envoi code email:', err);
        }
      }
    }

    if (!phoneAlreadyVerified && hasPhone) {
      try {
        await verificationService.sendPhoneVerification();
        setPhoneSent(true);
        console.log('✅ Code téléphone envoyé');
      } catch (err: any) {
        if (err.message === 'PHONE_ALREADY_VERIFIED') {
          setPhoneVerified(true);
          console.log('ℹ️ Téléphone déjà vérifié');
        } else if (err.message === 'NO_PHONE_NUMBER') {
          setHasPhoneNumber(false);
          console.log('ℹ️ Pas de téléphone enregistré');
        } else {
          console.error('❌ Erreur envoi code téléphone:', err);
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
      setSuccess('✅ Email vérifié avec succès !');
      console.log('✅ Email vérifié');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code email invalide');
      console.error('❌ Erreur vérification email:', err);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await verificationService.verifyPhone(phoneCode);
      setPhoneVerified(true);
      setSuccess('✅ Téléphone vérifié avec succès !');
      console.log('✅ Téléphone vérifié');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code téléphone invalide');
      console.error('❌ Erreur vérification téléphone:', err);
    }
  };

  const handleResendEmailCode = async () => {
    setError('');
    setSuccess('');
    try {
      await verificationService.sendEmailVerification();
      setSuccess('📧 Nouveau code email envoyé !');
    } catch (err: any) {
      if (err.message === 'EMAIL_ALREADY_VERIFIED') {
        setEmailVerified(true);
        setSuccess('✅ Email déjà vérifié !');
      } else {
        setError("Erreur lors de l'envoi du code");
      }
    }
  };

  const handleResendPhoneCode = async () => {
    setError('');
    setSuccess('');
    try {
      await verificationService.sendPhoneVerification();
      setSuccess('📱 Nouveau code SMS envoyé !');
    } catch (err: any) {
      if (err.message === 'PHONE_ALREADY_VERIFIED') {
        setPhoneVerified(true);
        setSuccess('✅ Téléphone déjà vérifié !');
      } else if (err.message === 'NO_PHONE_NUMBER') {
        setHasPhoneNumber(false);
        setError('Aucun numéro de téléphone enregistré');
      } else {
        setError("Erreur lors de l'envoi du code");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722] mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // ✅ Afficher l'écran de succès UNIQUEMENT si vraiment tout est vérifié
  if (emailVerified && (phoneVerified || !hasPhoneNumber)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Compte vérifié !
          </h2>
          <p className="text-gray-600">
            {isFirstLogin
              ? 'Configuration de vos préférences...'
              : 'Redirection en cours...'}
          </p>
        </div>
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
          {isFirstLogin
            ? 'Bienvenue ! Vérifiez votre email et téléphone pour commencer'
            : 'Vérifiez votre email et téléphone pour continuer'}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]"
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyEmail}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF5722] hover:bg-[#E64A19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                >
                  Vérifier Email
                </button>
                <button
                  onClick={handleResendEmailCode}
                  className="w-full text-center text-sm text-[#FF5722] hover:text-[#E64A19]"
                >
                  Renvoyer le code
                </button>
              </div>
            </div>
          )}

          {emailVerified && (
            <div className="flex items-center text-green-600 border-b pb-6">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Email vérifié ✓</span>
            </div>
          )}

          {!phoneVerified && hasPhoneNumber && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📱 Vérification Téléphone
              </h3>
              {phoneSent && (
                <p className="text-sm text-gray-600 mb-4">
                  Un code SMS a été envoyé à votre téléphone
                </p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]"
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyPhone}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF5722] hover:bg-[#E64A19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                >
                  Vérifier Téléphone
                </button>
                <button
                  onClick={handleResendPhoneCode}
                  className="w-full text-center text-sm text-[#FF5722] hover:text-[#E64A19]"
                >
                  Renvoyer le code
                </button>
              </div>
            </div>
          )}

          {/* ✅ Message si email vérifié mais pas de téléphone */}
          {emailVerified && !phoneVerified && !hasPhoneNumber && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">
                    Téléphone requis pour continuer
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Ajoutez un numéro de téléphone pour finaliser votre
                    inscription
                  </p>
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ajouter mon numéro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Message si téléphone non vérifié et pas d'email vérifié */}
          {!emailVerified && !phoneVerified && !hasPhoneNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-700">
                    Vous pourrez ajouter votre numéro de téléphone après la
                    vérification de votre email
                  </p>
                </div>
              </div>
            </div>
          )}

          {phoneVerified && !emailVerified && (
            <div className="flex items-center text-green-600">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Téléphone vérifié ✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
