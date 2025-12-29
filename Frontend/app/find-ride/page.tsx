'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

// Définir les types
interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface Errors {
  from?: string;
  to?: string;
  date?: string;
}

export default function FindRidePage() {
  const router = useRouter();

  const [searchData, setSearchData] = useState<SearchData>({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });

  const [errors, setErrors] = useState<Errors>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Errors = {};
    if (!searchData.from) newErrors.from = 'Ville de départ requise';
    if (!searchData.to) newErrors.to = "Ville d'arrivée requise";
    if (!searchData.date) newErrors.date = 'Date requise';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Rediriger vers la page de résultats avec les paramètres
    const params = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      date: searchData.date,
      passengers: searchData.passengers.toString(),
    });

    router.push(`/search-results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trouvez votre trajet
            </h1>
            <p className="text-lg text-gray-600">
              Des milliers de trajets disponibles partout en Algérie
            </p>
          </div>

          {/* Formulaire de recherche */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Départ */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Départ
                </label>
                <input
                  type="text"
                  value={searchData.from}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, from: e.target.value }))
                  }
                  placeholder="Alger, Oran, Constantine..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.from ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.from && (
                  <p className="text-red-500 text-sm mt-1">{errors.from}</p>
                )}
              </div>

              {/* Arrivée */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Arrivée
                </label>
                <input
                  type="text"
                  value={searchData.to}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, to: e.target.value }))
                  }
                  placeholder="Oran, Constantine, Tlemcen..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.to ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.to && (
                  <p className="text-red-500 text-sm mt-1">{errors.to}</p>
                )}
              </div>

              {/* Date et Passagers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={searchData.date}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Passagers
                  </label>
                  <select
                    value={searchData.passengers}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        passengers: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bouton de recherche */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                <Search className="w-5 h-5" />
                Rechercher des trajets
              </button>
            </form>
          </div>

          {/* Info supplémentaire */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              💡 Notre système intelligent trouve les trajets les plus proches
              de vos critères, même s'ils ne correspondent pas exactement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
