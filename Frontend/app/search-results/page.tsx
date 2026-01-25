'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, MapPin, Clock, Briefcase, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';

// ✅ Use Next.js environment variable (not 'process' import)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 🌍 Traductions
const translations = {
  fr: {
    title: 'Résultats de recherche',
    filters: 'Filtres',
    reset: 'Réinitialiser',
    date: 'Date',
    maxPrice: 'Prix maximum',
    departureTime: 'Heure de départ',
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    preferences: 'Préférences',
    selected: 'sélectionnée',
    selectedPlural: 'sélectionnées',
    options: 'Options',
    comfort: 'Confort',
    applyFilters: 'Appliquer les filtres',
    errorTitle: 'Erreur de recherche',
    retry: 'Réessayer',
    noResults: 'Aucun trajet trouvé',
    noResultsDesc:
      'Essayez de modifier vos critères de recherche ou les filtres',
    tripsFound: 'trajet trouvé',
    tripsFoundPlural: 'trajets trouvés',
    match: 'Correspondance',
    luggage: 'Bagages',
    perSeat: 'par place',
    available: 'place dispo',
    availablePlural: 'places dispo',
    viewTrip: 'Voir le trajet',
    searchInfo: (from: string, to: string, date: string, places: number) =>
      `${from} → ${to} • ${date} • ${places} place${places > 1 ? 's' : ''}`,
  },
  en: {
    title: 'Search Results',
    filters: 'Filters',
    reset: 'Reset',
    date: 'Date',
    maxPrice: 'Maximum price',
    departureTime: 'Departure time',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    preferences: 'Preferences',
    selected: 'selected',
    selectedPlural: 'selected',
    options: 'Options',
    comfort: 'Comfort',
    applyFilters: 'Apply filters',
    errorTitle: 'Search error',
    retry: 'Retry',
    noResults: 'No trips found',
    noResultsDesc: 'Try modifying your search criteria or filters',
    tripsFound: 'trip found',
    tripsFoundPlural: 'trips found',
    match: 'Match',
    luggage: 'Luggage',
    perSeat: 'per seat',
    available: 'seat available',
    availablePlural: 'seats available',
    viewTrip: 'View trip',
    searchInfo: (from: string, to: string, date: string, places: number) =>
      `${from} → ${to} • ${date} • ${places} seat${places > 1 ? 's' : ''}`,
  },
};

interface Preference {
  id: number;
  name_fr: string;
  name_en: string;
}

interface Filters {
  date: string;
  priceRange: number[];
  departureTime: string;
  preferences: number[];
  isConfort: boolean;
}

interface Ride {
  id: number;
  conducteur_picture: string | null;
  conducteur_name: string;
  conducteur_rating: number;
  match_score?: number;
  heure_depart: string;
  ville_depart: string;
  ville_arrivee: string;
  date: string;
  is_confort: boolean;
  price: number;
  places_disponibles: number;
  luggage_allowed: boolean;
}

interface SearchData {
  ville_depart: string;
  ville_arrivee: string;
  date: string;
  nbr_places: number;
  price_max?: number;
  departure_time?: string;
  preference_ids?: number[];
  is_confort?: boolean;
}

// ✅ Extract the search logic into a separate component
function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Ride[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    date: searchParams.get('date') || '',
    priceRange: [500, 5000],
    departureTime: '',
    preferences: [],
    isConfort: false,
  });

  const [availablePreferences, setAvailablePreferences] = useState<
    Preference[]
  >([]);

  // ✅ Charger la langue depuis localStorage (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as 'fr' | 'en';
      if (savedLang) setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  // Charger les préférences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        console.log('🔄 Chargement des préférences...');
        const response = await fetch(`${API_BASE_URL}/api/v1/users/preferences/`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Préférences chargées:', data.length);
        setAvailablePreferences(data);
      } catch (error) {
        console.error('❌ Erreur chargement préférences:', error);
      }
    };

    fetchPreferences();
  }, []);

  const performSearch = async (filterOverrides: Partial<Filters> = {}) => {
    setLoading(true);
    setError(null);

    const depart = searchParams.get('from') || '';
    const arrivee = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';
    const places = searchParams.get('passengers') || '1';

    if (!depart || !arrivee) {
      setError('Paramètres de recherche manquants');
      setLoading(false);
      return;
    }

    const currentFilters = { ...filters, ...filterOverrides };

    const searchData: SearchData = {
      ville_depart: depart,
      ville_arrivee: arrivee,
      date: currentFilters.date || date,
      nbr_places: parseInt(places),
    };

    if (currentFilters.priceRange[1] < 5000) {
      searchData.price_max = currentFilters.priceRange[1];
    }

    if (currentFilters.departureTime) {
      searchData.departure_time = currentFilters.departureTime;
    }

    if (currentFilters.preferences.length > 0) {
      searchData.preference_ids = currentFilters.preferences;
    }

    if (currentFilters.isConfort) {
      searchData.is_confort = true;
    }

    try {
      console.log('🔍 Recherche:', searchData);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/trajets/intelligent-search/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchData),
        },
      );

      console.log('📡 Réponse:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Résultats:', data.count);
        setResults(data.results || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur:', response.status, errorData);
        setError(errorData.error || `Erreur ${response.status}`);
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    performSearch();
  };

  const resetFilters = () => {
    const defaultFilters: Filters = {
      date: searchParams.get('date') || '',
      priceRange: [500, 5000],
      departureTime: '',
      preferences: [],
      isConfort: false,
    };
    setFilters(defaultFilters);
    performSearch(defaultFilters);
  };

  const handlePreferenceToggle = (prefId: number) => {
    setFilters((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter((id) => id !== prefId)
        : [...prev.preferences, prefId],
    }));
  };

  const getProfilePictureUrl = (picture: string | null): string => {
    if (!picture) return '/placeholder.svg';
    if (picture.startsWith('http')) return picture;
    return `${API_BASE_URL}${picture.startsWith('/') ? '' : '/'}${picture}`;
  };

  const formatRating = (rating: number | string | null | undefined): string => {
    if (rating === null || rating === undefined) return '5.0';
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
    return isNaN(numRating) ? '5.0' : numRating.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filtres */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {t.filters}
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t.reset}
                </button>
              </div>

              <div className="space-y-6">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full h-11 px-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Prix Maximum */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    {t.maxPrice}: {filters.priceRange[1]} DA
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [500, parseInt(e.target.value)],
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>500 DA</span>
                    <span>5000 DA</span>
                  </div>
                </div>

                {/* Heure de départ */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    {t.departureTime}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['morning', 'afternoon', 'evening'].map((period) => (
                      <button
                        key={period}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            departureTime:
                              prev.departureTime === period ? '' : period,
                          }))
                        }
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                          filters.departureTime === period
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                        }`}
                      >
                        {t[period as keyof typeof t] as string}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Préférences */}
                {availablePreferences.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      {t.preferences} ({filters.preferences.length}{' '}
                      {filters.preferences.length > 1
                        ? t.selectedPlural
                        : t.selected}
                      )
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availablePreferences.map((pref) => (
                        <label
                          key={pref.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.preferences.includes(pref.id)}
                            onChange={() => handlePreferenceToggle(pref.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {lang === 'fr' ? pref.name_fr : pref.name_en}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    {t.options}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isConfort}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            isConfort: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{t.comfort}</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t.applyFilters}
                </button>
              </div>
            </div>
          </aside>

          {/* Résultats */}
          <div className="flex-1 space-y-4">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">
                      {t.errorTitle}
                    </h3>
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        performSearch();
                      }}
                      className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
                    >
                      {t.retry}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">{t.noResults}</p>
                <p className="text-gray-500 mt-2">{t.noResultsDesc}</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {results.length}{' '}
                  {results.length > 1 ? t.tripsFoundPlural : t.tripsFound}
                </div>
                {results.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Info conducteur */}
                      <div className="flex items-center gap-4">
                        <img
                          src={getProfilePictureUrl(ride.conducteur_picture)}
                          alt={ride.conducteur_name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/placeholder.svg';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {ride.conducteur_name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{formatRating(ride.conducteur_rating)}</span>
                          </div>
                          {ride.match_score && (
                            <div className="text-xs text-green-600 mt-1">
                              {t.match}: {Math.round(ride.match_score * 100)}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Détails trajet */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span>{ride.heure_depart}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {ride.ville_depart} → {ride.ville_arrivee}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(ride.date).toLocaleDateString(
                            lang === 'fr' ? 'fr-FR' : 'en-US',
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          {ride.luggage_allowed && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Briefcase className="w-4 h-4" />
                              <span>{t.luggage}</span>
                            </div>
                          )}
                          {ride.is_confort && (
                            <div className="text-xs text-blue-600 font-medium">
                              {t.comfort}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prix et action */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {ride.price} DA
                          </div>
                          <div className="text-sm text-gray-500">
                            {t.perSeat}
                          </div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {ride.places_disponibles}{' '}
                          {ride.places_disponibles > 1
                            ? t.availablePlural
                            : t.available}
                        </div>
                        <button
                          onClick={() => router.push(`/trip/${ride.id}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                        >
                          {t.viewTrip}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ✅ Main component with Suspense boundary
export default function SearchResultsPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <SearchResultsContent />
      </Suspense>
    </>
  );
}