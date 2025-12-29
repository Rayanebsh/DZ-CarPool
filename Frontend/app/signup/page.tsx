'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import Image from 'next/image';
import authService from '@/services/auth.service';
import GoogleLoginButton from '@/components/google-login-button';

export default function SignupPage() {
  const { t, language, setLanguage } = useLanguage();
  const { register } = useAuth();
  const [userType, setUserType] = useState<'driver' | 'passenger'>('driver');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
  });
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(null);
  };

  const handleIdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdPhotoFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIdPhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      await register({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phoneNumber,
      });

      if (idPhotoFile) {
        try {
          await authService.uploadDocument(idPhotoFile, 'CNI');
        } catch (uploadError) {
          console.error('Erreur upload document:', uploadError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
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
            {t('forAlgeria')}
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              {t('trustedRideSharing')}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t('connectWithDrivers')}
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

      {/* Right Side - Signup Form */}
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('getStarted')}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {t('createAccountOrLogin')}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button className="flex-1 py-2.5 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm">
                {t('register')}
              </button>
              <Link
                href="/login"
                className="flex-1 py-2.5 text-sm font-medium rounded-md text-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t('login')}
              </Link>
            </div>

            {/* User Type Selection */}
            <div className="flex gap-3">
              <button
                onClick={() => setUserType('driver')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${userType === 'driver' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Car className="w-5 h-5" />
                <span className="text-sm font-medium">{t('imDriver')}</span>
              </button>
              <button
                onClick={() => setUserType('passenger')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${userType === 'passenger' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium">{t('imPassenger')}</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">{t('firstName')}</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="last_name">{t('lastName')}</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="passwordConfirm">{t('confirmPassword')}</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  {t('uploadIdPhoto')}{' '}
                  <span className="text-gray-400 font-normal">
                    ({t('optional')})
                  </span>
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    {idPhotoFile ? idPhotoFile.name : t('dragDropUpload')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {t('browseFile')}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIdPhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium"
              >
                {loading ? 'Inscription...' : t('createAccount')}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">{t('or')}</span>
                </div>
              </div>

              {/* ✅ GOOGLE LOGIN BUTTON */}
              <GoogleLoginButton
                text={t('continueWithGoogle')}
                onError={setError}
              />
            </form>

            <p className="text-center text-xs text-gray-500 leading-relaxed">
              {t('agreeTerms')}{' '}
              <Link href="/terms" className="text-[#FF5722] hover:underline">
                {t('termsOfService')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/privacy" className="text-[#FF5722] hover:underline">
                {t('privacyPolicy')}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
