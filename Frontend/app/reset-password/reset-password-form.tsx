'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPasswordForm() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError(
        language === 'en'
          ? 'Invalid or missing reset token'
          : 'Jeton de réinitialisation invalide ou manquant',
      );
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, language]);

  const handleSubmit = async () => {
    setError(null);

    if (formData.password.length < 8) {
      setError(
        language === 'en'
          ? 'Password must be at least 8 characters'
          : 'Le mot de passe doit contenir au moins 8 caractères',
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(
        language === 'en'
          ? 'Passwords do not match'
          : 'Les mots de passe ne correspondent pas',
      );
      return;
    }

    if (!token) {
      setError(
        language === 'en'
          ? 'Invalid reset token'
          : 'Jeton de réinitialisation invalide',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: formData.password,
          new_password_confirm: formData.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Erreur lors de la réinitialisation',
        );
      }

      setSuccess(true);

      // Rediriger vers login après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 flex-col justify-between">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-25 h-25 rounded-lg bg-[#FF5722]">
              <Image
                src="/images/logo.png"
                alt="DZ-CarPool"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900">DZ-CarPool</span>
          </Link>

          <div className="inline-block px-6 py-2.5 bg-[#FF9B89] text-gray-900 rounded-full text-sm font-medium">
            {language === 'en' ? 'For Algeria' : "Pour l'Algérie"}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              {language === 'en'
                ? 'Create New Password'
                : 'Créer un nouveau mot de passe'}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {language === 'en'
                ? 'Choose a strong password to secure your account.'
                : 'Choisissez un mot de passe fort pour sécuriser votre compte.'}
            </p>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden">
            <Image
              src="/images/img.png"
              alt="Road journey"
              width={600}
              height={400}
              className="object-cover w-full"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="font-medium">
                {language === 'en' ? 'EN' : 'FR'}
              </span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            {!success ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {language === 'en'
                      ? 'Reset Your Password'
                      : 'Réinitialisez votre mot de passe'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {language === 'en'
                      ? 'Enter your new password below.'
                      : 'Entrez votre nouveau mot de passe ci-dessous.'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">
                      {language === 'en'
                        ? 'New Password'
                        : 'Nouveau mot de passe'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          language === 'en'
                            ? 'Enter new password'
                            : 'Entrez le nouveau mot de passe'
                        }
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {language === 'en'
                        ? 'Minimum 8 characters'
                        : 'Minimum 8 caractères'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">
                      {language === 'en'
                        ? 'Confirm Password'
                        : 'Confirmer le mot de passe'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={
                          language === 'en'
                            ? 'Confirm new password'
                            : 'Confirmez le nouveau mot de passe'
                        }
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !token}
                    className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium"
                  >
                    {loading
                      ? language === 'en'
                        ? 'Resetting...'
                        : 'Réinitialisation...'
                      : language === 'en'
                        ? 'Reset Password'
                        : 'Réinitialiser le mot de passe'}
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'en'
                      ? 'Back to Login'
                      : 'Retour à la connexion'}
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'en'
                      ? 'Password Reset Successful!'
                      : 'Réinitialisation réussie !'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en'
                      ? 'Your password has been successfully reset. You will receive a confirmation email shortly.'
                      : 'Votre mot de passe a été réinitialisé avec succès. Vous recevrez un email de confirmation sous peu.'}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3 justify-center">
                    <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-left text-green-900">
                      <p className="font-medium">
                        {language === 'en'
                          ? 'Redirecting to login...'
                          : 'Redirection vers la connexion...'}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white">
                    {language === 'en' ? 'Go to Login' : 'Aller à la connexion'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}