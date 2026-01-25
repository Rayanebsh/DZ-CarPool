'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/users/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi de l'email");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'email");
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
                ? 'Recover Your Account'
                : 'Récupérez votre compte'}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {language === 'en'
                ? "We'll send you a link to reset your password securely."
                : 'Nous vous enverrons un lien pour réinitialiser votre mot de passe en toute sécurité.'}
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
                      ? 'Forgot Password?'
                      : 'Mot de passe oublié ?'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {language === 'en'
                      ? "Enter your email address and we'll send you a link to reset your password."
                      : 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      {language === 'en' ? 'Email Address' : 'Adresse email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        language === 'en'
                          ? 'you@example.com'
                          : 'vous@exemple.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium"
                  >
                    {loading
                      ? language === 'en'
                        ? 'Sending...'
                        : 'Envoi en cours...'
                      : language === 'en'
                        ? 'Send Reset Link'
                        : 'Envoyer le lien'}
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
                      ? 'Check Your Email'
                      : 'Vérifiez votre email'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {language === 'en'
                      ? `We've sent a password reset link to ${email}`
                      : `Nous avons envoyé un lien de réinitialisation à ${email}`}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-left text-blue-900">
                      <p className="font-medium mb-1">
                        {language === 'en'
                          ? "Didn't receive the email?"
                          : "Vous n'avez pas reçu l'email ?"}
                      </p>
                      <p className="text-blue-700">
                        {language === 'en'
                          ? 'Check your spam folder or try again in a few minutes.'
                          : 'Vérifiez votre dossier spam ou réessayez dans quelques minutes.'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {language === 'en'
                    ? 'Try Another Email'
                    : 'Essayer un autre email'}
                </Button>
                <Link
                  href="/login"
                  className="block text-sm text-gray-600 hover:text-gray-900"
                >
                  {language === 'en'
                    ? 'Back to Login'
                    : 'Retour à la connexion'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
