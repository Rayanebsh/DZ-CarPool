'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import {
  MapPin,
  Minus,
  Plus,
  Clock,
  AlertTriangle,
  MapIcon,
  Calendar,
  Coffee,
  Loader2,
  Check,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { MapModal } from '@/components/map-modal';
import authService from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface PreferenceType {
  id: number;
  name: string;
  name_fr: string;
  name_en: string;
  category: string;
  icon?: string;
}

interface LocationData {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

interface WilayaInfo {
  name: string;
  prices: {
    essence_sans_plomb: number;
    gasoil: number;
    gpl: number;
    electrique?: number;
  };
}

interface FuelPricesData {
  last_updated: string;
  wilayas: {
    [code: string]: WilayaInfo;
  };
  consommation_moyenne: {
    essence_sans_plomb: number;
    gasoil: number;
    gpl: number;
    electrique: number;
  };
}

type FuelType = 'gasoil' | 'essence_sans_plomb' | 'gpl' | 'electrique';

const wilayaMapping: { [key: string]: string } = {
  alger: 'Alger',
  algiers: 'Alger',
  birkhadem: 'Alger',
  oran: 'Oran',
  constantine: 'Constantine',
  annaba: 'Annaba',
  blida: 'Blida',
  setif: 'Sétif',
  sétif: 'Sétif',
  tlemcen: 'Tlemcen',
  bejaia: 'Béjaïa',
  béjaïa: 'Béjaïa',
  bouira: 'Bouira',
  tamanrasset: 'Tamanrasset',
  ouargla: 'Ouargla',
  ghardaia: 'Ghardaïa',
  ghardaïa: 'Ghardaïa',
};

export default function OfferRidePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureCoords, setDepartureCoords] = useState<{
    lat: string;
    lon: string;
  } | null>(null);
  const [arrivalCoords, setArrivalCoords] = useState<{
    lat: string;
    lon: string;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(1200);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [comfortOption, setComfortOption] = useState(false);
  const [noSmoking] = useState(false);
  const [musicAllowed] = useState(true);
  const [smallLuggage] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // États pour le carburant
  const [fuelType, setFuelType] = useState<FuelType>('gasoil');
  const [fuelConsumption, setFuelConsumption] = useState<number>(8.0);
  const [fuelPricesData, setFuelPricesData] = useState<FuelPricesData | null>(
    null,
  );
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availablePreferences, setAllPreferences] = useState<PreferenceType[]>(
    [],
  );
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // ✅ Charger les prix du carburant au montage
  useEffect(() => {
    loadFuelPrices();
  }, []);

  const loadFuelPrices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/trajets/fuel-prices/`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FuelPricesData = await response.json();
      setFuelPricesData(data);
      console.log('✅ Prix carburants chargés:', data);
    } catch (error) {
      console.error('❌ Erreur chargement fuel prices:', error);
    }
  };

  // ✅ Calculer le prix suggéré
  useEffect(() => {
    if (distance && departure && fuelPricesData) {
      calculateSuggestedPrice();
    }
  }, [distance, departure, fuelType, fuelConsumption, fuelPricesData, seats]);

  const extractWilaya = (locationName: string): string | null => {
    if (!locationName) return null;
    const normalized = locationName.toLowerCase().trim().split(',')[0];
    return wilayaMapping[normalized] || 'Alger';
  };

  const getFuelPriceForWilaya = (
    wilayaName: string,
    fuelType: FuelType,
  ): number | null => {
    if (!fuelPricesData) return null;

    for (const [, info] of Object.entries(fuelPricesData.wilayas)) {
      if (info.name === wilayaName) {
        return info.prices[fuelType] ?? null;
      }
    }

    const prices = Object.values(fuelPricesData.wilayas)
      .map((w) => w.prices[fuelType])
      .filter((p): p is number => p !== undefined && p !== null);

    return prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 40;
  };

  const calculateSuggestedPrice = () => {
    if (!distance || !fuelPricesData) return;

    const wilaya = extractWilaya(departure);
    if (!wilaya) return;

    const fuelPrice = getFuelPriceForWilaya(wilaya, fuelType);
    if (!fuelPrice) return;

    const totalFuelCost = (distance * fuelConsumption * fuelPrice) / 100;
    const totalCost = totalFuelCost * 1.5;
    const pricePerSeat = Math.round(totalCost / seats / 10) * 10;

    setSuggestedPrice(pricePerSeat);
  };

  const calculateBreaks = (distanceKm: number): number => {
    if (distanceKm < 300) return 0;
    return Math.floor(distanceKm / 300);
  };

  const calculateTotalDuration = (
    baseMinutes: number,
    breaks: number,
  ): string => {
    const totalMinutes = baseMinutes + breaks * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  useEffect(() => {
    if (departureCoords && arrivalCoords) {
      calculateRealDistance();
    }
  }, [departureCoords, arrivalCoords]);

  const calculateRealDistance = async () => {
    if (!departureCoords || !arrivalCoords) return;

    setIsLoadingRoute(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${departureCoords.lon},${departureCoords.lat};${arrivalCoords.lon},${arrivalCoords.lat}?overview=full&geometries=geojson`,
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round(route.distance / 1000);
        const durationMinutes = Math.round(route.duration / 60);

        setDistance(distanceKm);

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        setDuration(`${hours}h ${minutes.toString().padStart(2, '0')}m`);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      fallbackDistanceCalculation();
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const fallbackDistanceCalculation = () => {
    if (!departureCoords || !arrivalCoords) return;

    const R = 6371;
    const lat1 = Number.parseFloat(departureCoords.lat);
    const lon1 = Number.parseFloat(departureCoords.lon);
    const lat2 = Number.parseFloat(arrivalCoords.lat);
    const lon2 = Number.parseFloat(arrivalCoords.lon);

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c * 1.3);

    setDistance(dist);

    const hours = Math.floor(dist / 90);
    const minutes = Math.round(((dist / 90) % 1) * 60);
    setDuration(`${hours}h ${minutes.toString().padStart(2, '0')}m`);
  };

  const handleDepartureChange = (value: string, location?: LocationData) => {
    setDeparture(value);
    if (location) {
      setDepartureCoords({ lat: location.lat, lon: location.lon });

      // ✅ AJOUT : Forcer la fermeture en retirant le focus
      setTimeout(() => {
        const input = document.activeElement as HTMLElement;
        if (input && input.tagName === 'INPUT') {
          input.blur();
        }
      }, 100);
    }
  };

  const handleArrivalChange = (value: string, location?: LocationData) => {
    setArrival(value);
    if (location) {
      setArrivalCoords({ lat: location.lat, lon: location.lon });

      // ✅ AJOUT : Forcer la fermeture en retirant le focus
      setTimeout(() => {
        const input = document.activeElement as HTMLElement;
        if (input && input.tagName === 'INPUT') {
          input.blur();
        }
      }, 100);
    }
  };

  // ✅ Calcul du prix CORRIGÉ avec option Comfort
  const basePrice = price;
  const finalPrice = comfortOption ? Math.round(basePrice * 1.3) : basePrice;
  const platformFee = Math.round(finalPrice * 0.15);
  const passengerPays = finalPrice + platformFee;

  const numberOfBreaks = distance ? calculateBreaks(distance) : 0;

  // ✅ Charger les préférences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const prefs = await authService.getPreferences();
        setAllPreferences(prefs);
        console.log('✅ Préférences récupérées:', prefs);
      } catch (err: any) {
        console.error('❌ Erreur fetch preferences:', err);
        setError('Impossible de charger les préférences');
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Voir partie 2 pour handleSubmit
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // ✅ 1. DOCS : Skip si erreur (anti-crash)
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const docResponse = await fetch(
            `${API_URL}/api/v1/users/check-document-status/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (docResponse.ok) {
            const docData = await docResponse.json();
            console.log('📋 DOCS OK:', docData);
            if (!docData.can_publish_trip) {
              alert(docData.message || 'Documents non validés');
              router.push('/documents');
              return;
            }
          } else {
            console.log('⚠️ DOCS endpoint HS, skip vérification');
          }
        }
      } catch {
        console.log('⚠️ DOCS check skip');
      }

      // ✅ 2. TRAJETS : Données corrigées
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Token manquant');

        // ✅ Calcul du prix final avec Comfort
        const finalSubmitPrice = comfortOption
          ? Math.round(price * 1.3)
          : price;

        const trajetData = {
          ville_depart: departure || 'Alger',
          ville_arrivee: arrival || 'Oran',
          adresse_depart: departure || 'Alger',
          adresse_arrivee: arrival || 'Oran',
          date: date || '2025-12-25',
          heure_depart: time || '14:00',
          nbr_places: seats || 1,
          price: finalSubmitPrice, // ✅ Prix avec Comfort appliqué
          distance: distance || 300,
          is_confort: comfortOption || false,
          fuel_type: fuelType || 'gasoil',
          fuel_consumption: fuelConsumption || 8.0,
          no_smoking: noSmoking || false,
          music_allowed: musicAllowed || true,
          small_luggage_only: smallLuggage || false,
          description: additionalDetails || '',
          luggage_allowed: !smallLuggage,
          preference_ids: selectedPreferences || [],
        };

        console.log('📤 TRAJET DATA:', trajetData);

        const response = await fetch(`${API_URL}/api/v1/trajets/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(trajetData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            '❌ TRAJETS ERROR:',
            response.status,
            errorText.substring(0, 300),
          );
          throw new Error(
            `Erreur ${response.status}: ${errorText.substring(0, 100)}`,
          );
        }

        const createdTrajet = await response.json();
        console.log('✅ Trajet créé:', createdTrajet);
        setSubmitSuccess(true);

        setTimeout(() => {
          router.push('/#hero');
        }, 2000);
      } catch (error: any) {
        console.error('❌ Erreur:', error);
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      departure,
      arrival,
      date,
      time,
      seats,
      price,
      comfortOption, // ✅ Ajouté
      additionalDetails,
      noSmoking,
      musicAllowed,
      smallLuggage,
      distance,
      fuelType,
      fuelConsumption,
      selectedPreferences,
      router,
    ],
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Publish a Trip' : 'Publier un trajet'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Share your journey, save money, and make new friends.'
              : "Partagez votre voyage, économisez de l'argent et faites de nouvelles rencontres."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapIcon className="w-5 h-5 text-[#FF5722]" />
                <h2 className="text-lg font-semibold">
                  {language === 'en' ? 'Itinerary' : 'Itinéraire'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en' ? 'DEPARTURE' : 'DÉPART'}
                  </Label>
                  <LocationAutocomplete
                    value={departure}
                    onChange={handleDepartureChange}
                    placeholder={language === 'en' ? 'Algiers' : 'Alger'}
                    className="mb-0"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en' ? 'ARRIVAL' : 'ARRIVÉE'}
                  </Label>
                  <LocationAutocomplete
                    value={arrival}
                    onChange={handleArrivalChange}
                    placeholder={language === 'en' ? 'Oran' : 'Oran'}
                    className="mb-0"
                  />
                </div>

                {isLoadingRoute && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF5722]" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'Calculating route...'
                        : "Calcul de l'itinéraire..."}
                    </span>
                  </div>
                )}

                {distance && duration && !isLoadingRoute && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {distance} km
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {language === 'en'
                              ? 'Driving time:'
                              : 'Temps de conduite:'}{' '}
                            {duration}
                          </p>
                        </div>
                      </div>
                    </div>

                    {numberOfBreaks > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <Coffee className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {language === 'en'
                              ? `${numberOfBreaks} break${numberOfBreaks > 1 ? 's' : ''} included`
                              : `${numberOfBreaks} pause${numberOfBreaks > 1 ? 's' : ''} incluse${numberOfBreaks > 1 ? 's' : ''}`}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                            {language === 'en'
                              ? `15 min every 300 km (${numberOfBreaks * 15} min total) • Total duration: ${calculateTotalDuration(parseInt(duration.split('h')[0]) * 60 + parseInt(duration.split('h')[1]), numberOfBreaks)}`
                              : `15 min toutes les 300 km (${numberOfBreaks * 15} min au total) • Durée totale: ${calculateTotalDuration(parseInt(duration.split('h')[0]) * 60 + parseInt(duration.split('h')[1]), numberOfBreaks)}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Date & Seats */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#FF5722]" />
                <h2 className="text-lg font-semibold">
                  {language === 'en' ? 'Date & Seats' : 'Date et places'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en' ? 'DEPARTURE DATE' : 'DATE DE DÉPART'}
                  </Label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-background rounded-lg border border-border">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      value={date ? `${date}T${time}` : ''}
                      onChange={(e) => {
                        const [dateVal, timeVal] = e.target.value.split('T');
                        setDate(dateVal);
                        setTime(timeVal);
                      }}
                      className="border-0 p-0 h-auto focus-visible:ring-0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en'
                      ? 'SEATS AVAILABLE'
                      : 'PLACES DISPONIBLES'}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-semibold">{seats}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setSeats(Math.min(8, seats + 1))}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Véhicule et Carburant */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-[#FF5722]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">
                  {language === 'en'
                    ? 'Vehicle Information'
                    : 'Informations véhicule'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en' ? 'FUEL TYPE' : 'TYPE DE CARBURANT'}
                  </Label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  >
                    <option value="gasoil">
                      {language === 'en' ? 'Diesel' : 'Gasoil'}
                    </option>
                    <option value="essence_sans_plomb">
                      {language === 'en'
                        ? 'Unleaded Petrol'
                        : 'Essence Sans Plomb'}
                    </option>
                    <option value="gpl">GPL</option>
                    <option value="electrique">
                      {language === 'en' ? 'Electric' : 'Électrique'}
                    </option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en' ? 'CONSUMPTION' : 'CONSOMMATION'} (
                    {fuelType === 'electrique' ? 'kWh/100km' : 'L/100km'})
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={fuelConsumption}
                    onChange={(e) =>
                      setFuelConsumption(parseFloat(e.target.value))
                    }
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Price & Options */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-[#FF5722]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">
                  {language === 'en' ? 'Price & Options' : 'Prix et options'}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                  <Checkbox
                    id="comfort"
                    checked={comfortOption}
                    onCheckedChange={(checked) =>
                      setComfortOption(checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="comfort"
                      className="font-medium cursor-pointer"
                    >
                      {language === 'en'
                        ? 'Comfort Trip (+30%)'
                        : 'Trajet Comfort (+30%)'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en'
                        ? 'Guarantee max 2 passengers in back seat & air conditioning.'
                        : "Garantie max 2 passagers à l'arrière et climatisation."}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {language === 'en'
                      ? 'DRIVER PRICE (PER SEAT)'
                      : 'PRIX CONDUCTEUR (PAR SIÈGE)'}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="100"
                      step="50"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="text-2xl font-semibold h-14"
                      required
                    />
                    <span className="text-muted-foreground">DZD</span>
                  </div>
                  {suggestedPrice && distance && (
                    <p className="text-xs text-[#0EA5E9] mt-2">
                      💡{' '}
                      {language === 'en'
                        ? `Suggested price based on fuel: ${suggestedPrice.toLocaleString()} DZD`
                        : `Prix suggéré basé sur le carburant: ${suggestedPrice.toLocaleString()} DZD`}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en'
                        ? 'PRICING BREAKDOWN'
                        : 'DÉTAIL DU PRIX'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'en' ? 'Driver Price' : 'Prix conducteur'}
                    </span>
                    <span className="font-medium">
                      {price.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {language === 'en'
                        ? 'Platform Fee (15%)'
                        : 'Frais plateforme (15%)'}
                    </span>
                    <span className="font-medium">
                      {platformFee.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-semibold">
                      {language === 'en'
                        ? 'Passenger Pays'
                        : 'Le passager paie'}
                    </span>
                    <span className="text-xl font-bold text-[#FF5722]">
                      {passengerPays.toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Preferences */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-[#FF5722]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">
                  {language === 'en'
                    ? 'Trip Preferences'
                    : 'Préférences de trajet'}
                </h2>
              </div>

              {availablePreferences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'en'
                    ? 'No preferences available. You can add them in your profile settings.'
                    : 'Aucune préférence disponible. Vous pouvez les ajouter dans les paramètres de votre profil.'}
                </p>
              ) : (
                <>
                  {Object.entries(
                    availablePreferences.reduce(
                      (acc: Record<string, PreferenceType[]>, pref) => {
                        if (!acc[pref.category]) acc[pref.category] = [];
                        acc[pref.category].push(pref);
                        return acc;
                      },
                      {},
                    ),
                  ).map(([category, prefs]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-medium mb-3">
                        {category === 'interests'
                          ? language === 'en'
                            ? 'Interests'
                            : "Centres d'intérêt"
                          : category === 'habits'
                            ? language === 'en'
                              ? 'Habits'
                              : 'Habitudes'
                            : language === 'en'
                              ? 'Driving Preferences'
                              : 'Préférences de conduite'}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {prefs.map((pref) => (
                          <button
                            key={pref.id}
                            onClick={(e) => {
                              e.preventDefault(); // <-- empêche le scroll/submit
                              setSelectedPreferences((prev) =>
                                prev.includes(pref.id)
                                  ? prev.filter((id) => id !== pref.id)
                                  : [...prev, pref.id],
                              );
                            }}
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
                  ))}
                </>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                {language === 'en'
                  ? 'ADDITIONAL DETAILS (OPTIONAL)'
                  : 'DÉTAILS SUPPLÉMENTAIRES (OPTIONNEL)'}
              </Label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Meeting point details, car model, etc.'
                    : 'Détails du point de rencontre, modèle de voiture, etc.'
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Sidebar Summary with Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="relative h-64 bg-gray-100 dark:bg-gray-900 group">
                  {departureCoords && arrivalCoords ? (
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(Number(departureCoords.lon), Number(arrivalCoords.lon)) - 0.5},${Math.min(Number(departureCoords.lat), Number(arrivalCoords.lat)) - 0.5},${Math.max(Number(departureCoords.lon), Number(arrivalCoords.lon)) + 0.5},${Math.max(Number(departureCoords.lat), Number(arrivalCoords.lat)) + 0.5}&layer=mapnik&marker=${departureCoords.lat},${departureCoords.lon}&marker=${arrivalCoords.lat},${arrivalCoords.lon}`}
                        style={{ border: 0 }}
                        title="Route Map"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() => setIsMapModalOpen(true)}
                            className="flex-1 bg-white hover:bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <MapIcon className="w-4 h-4" />
                            {language === 'en'
                              ? 'View Fullscreen'
                              : 'Voir en plein écran'}
                          </button>
                          <a
                            href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${departureCoords.lat}%2C${departureCoords.lon}%3B${arrivalCoords.lat}%2C${arrivalCoords.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#FF5722] hover:bg-[#E64A19] text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#FF5722]" />
                          <span className="font-semibold">{distance} km</span>
                          {numberOfBreaks > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <Coffee className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-gray-600">
                                {numberOfBreaks}×15min
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'en'
                            ? 'Select departure and arrival to view map'
                            : "Sélectionnez le départ et l'arrivée pour voir la carte"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">
                    {language === 'en' ? 'Trip Summary' : 'Résumé du trajet'}
                  </h3>

                  {departure && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{departure}</p>
                        {date && time && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(`${date}T${time}`).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'fr-FR',
                              { month: 'short', day: 'numeric' },
                            )}
                            , {time}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {arrival && duration && (
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{arrival}</p>
                        {date && time && duration && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              new Date(`${date}T${time}`).getTime() +
                                Number.parseInt(duration.split('h')[0]) *
                                  60 *
                                  60 *
                                  1000 +
                                Number.parseInt(duration.split('h')[1]) *
                                  60 *
                                  1000 +
                                numberOfBreaks * 15 * 60 * 1000,
                            ).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'fr-FR',
                              { month: 'short', day: 'numeric' },
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      {language === 'en'
                        ? 'Please check your car fluids before long trips.'
                        : 'Veuillez vérifier les liquides de votre voiture avant les longs trajets.'}
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {submitError}
                        </p>
                      </div>
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {language === 'en'
                            ? 'Trip published successfully!'
                            : 'Trajet publié avec succès !'}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-semibold"
                    disabled={
                      isSubmitting || !departure || !arrival || !date || !time
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {language === 'en' ? 'Publishing...' : 'Publication...'}
                      </>
                    ) : (
                      <>
                        {language === 'en'
                          ? 'Publish Trip →'
                          : 'Publier le trajet →'}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-medium bg-transparent"
                    onClick={() => window.history.back()}
                  >
                    {language === 'en' ? 'Cancel' : 'Annuler'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        departureCoords={departureCoords}
        arrivalCoords={arrivalCoords}
        departure={departure}
        arrival={arrival}
        distance={distance}
        duration={duration}
      />
    </div>
  );
}
