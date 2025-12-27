// app/preferences/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import Image from 'next/image';

interface Preference {
  id: number;
  name_fr: string;
  name_en: string;
  category: string;
  icon: string;
  description: string;
}

export default function PreferencesPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [allPreferences, setAllPreferences] = useState<Preference[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data: any = await authService.getAllPreferences();

      console.log('✅ Préférences récupérées:', data);

      if (Array.isArray(data)) {
        setAllPreferences(data);
      } else if (
        data &&
        typeof data === 'object' &&
        data.preferences &&
        Array.isArray(data.preferences)
      ) {
        setAllPreferences(data.preferences);
      } else {
        console.warn('⚠️ Format de réponse inattendu:', data);
        setError('Format de données invalide');
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération préférences:', error);
      setError('Impossible de charger les préférences');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (preferenceId: number) => {
    setSelectedPreferences((prev) => {
      if (prev.includes(preferenceId)) {
        return prev.filter((id) => id !== preferenceId);
      } else {
        return [...prev, preferenceId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedPreferences.length === 0) {
      setError(
        language === 'en'
          ? 'Please select at least one preference'
          : 'Veuillez sélectionner au moins une préférence',
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await authService.updatePreferences(selectedPreferences);
      console.log('✅ Préférences sauvegardées');
      router.push('/#hero');
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde préférences:', error);
      setError(
        language === 'en'
          ? 'Error saving preferences'
          : 'Erreur lors de la sauvegarde des préférences',
      );
    } finally {
      setSaving(false);
    }
  };

  // Grouper les préférences par catégorie
  const groupedPreferences = allPreferences.reduce(
    (acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push(pref);
      return acc;
    },
    {} as Record<string, Preference[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5722] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'en'
              ? 'Loading preferences...'
              : 'Chargement des préférences...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="DZ-CarPool"
                width={200}
                height={72}
                className="h-14 w-auto"
              />
            </Link>

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
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === 'en'
              ? 'Tell us about yourself'
              : 'Parlez-nous de vous'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'en'
              ? 'Select your preferences to help us match you with the right travel companions'
              : 'Sélectionnez vos préférences pour nous aider à vous mettre en relation avec les bons compagnons de voyage'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        {allPreferences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {language === 'en'
                ? 'No preferences available'
                : 'Aucune préférence disponible'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {language === 'en'
                ? 'Check that preferences exist in the database'
                : 'Vérifiez que des préférences existent dans la base de données'}
            </p>
          </div>
        ) : (
          <>
            {/* Interests */}
            {groupedPreferences['interests'] && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === 'en' ? 'Interests' : "Centres d'intérêt"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groupedPreferences['interests'].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPreferences.includes(pref.id)
                          ? 'border-[#FF5722] bg-[#FF5722]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedPreferences.includes(pref.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{pref.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {language === 'en' ? pref.name_en : pref.name_fr}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Habits */}
            {groupedPreferences['habits'] && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === 'en' ? 'Habits' : 'Habitudes'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {groupedPreferences['habits'].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPreferences.includes(pref.id)
                          ? 'border-[#FF5722] bg-[#FF5722]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedPreferences.includes(pref.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{pref.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {language === 'en' ? pref.name_en : pref.name_fr}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Driving Preferences */}
            {groupedPreferences['driving'] && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === 'en'
                    ? 'Driving Preferences'
                    : 'Préférences de conduite'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groupedPreferences['driving'].map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPreferences.includes(pref.id)
                          ? 'border-[#FF5722] bg-[#FF5722]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedPreferences.includes(pref.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="text-3xl mb-2">{pref.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {language === 'en' ? pref.name_en : pref.name_fr}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={saving || selectedPreferences.length === 0}
            className="w-full md:w-1/2 h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white disabled:opacity-50"
          >
            {saving
              ? language === 'en'
                ? 'Saving...'
                : 'Sauvegarde...'
              : language === 'en'
                ? 'Continue'
                : 'Continuer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
