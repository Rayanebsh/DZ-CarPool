'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { MapModal } from '@/components/map-modal';

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

export default function OfferRidePage() {
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
  const [noSmoking, setNoSmoking] = useState(false);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [smallLuggage, setSmallLuggage] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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

        console.log('Route calculated:', { distanceKm, durationMinutes });
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
    }
  };

  const handleArrivalChange = (value: string, location?: LocationData) => {
    setArrival(value);
    if (location) {
      setArrivalCoords({ lat: location.lat, lon: location.lon });
    }
  };

  const platformFee = Math.round(price * 0.15);
  const passengerPays = price + platformFee;
  const suggestedPrice = distance ? Math.round(distance * 2.5) : 1200;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Publishing ride:', {
      departure,
      arrival,
      date,
      time,
      seats,
      price,
      distance,
      duration,
      preferences: { comfortOption, noSmoking, musicAllowed, smallLuggage },
      additionalDetails,
    });
  };

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
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-semibold text-foreground">
                          {distance} km
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? 'Est. Duration:' : 'Durée est.:'}{' '}
                          {duration}
                        </p>
                      </div>
                    </div>
                    {distance && distance > 300 && (
                      <div className="text-xs text-[#0EA5E9] bg-[#0EA5E9]/10 px-3 py-1 rounded-full">
                        {language === 'en'
                          ? '15-min break included'
                          : 'Pause de 15 min incluse'}
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
                  {distance && (
                    <p className="text-xs text-[#0EA5E9] mt-2">
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
              <h2 className="text-lg font-semibold mb-4">
                {language === 'en'
                  ? 'Trip Preferences'
                  : 'Préférences du trajet'}
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="no-smoking"
                    checked={noSmoking}
                    onCheckedChange={(checked) =>
                      setNoSmoking(checked as boolean)
                    }
                  />
                  <Label htmlFor="no-smoking" className="cursor-pointer">
                    {language === 'en' ? 'No Smoking' : 'Non fumeur'}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="music"
                    checked={musicAllowed}
                    onCheckedChange={(checked) =>
                      setMusicAllowed(checked as boolean)
                    }
                  />
                  <Label htmlFor="music" className="cursor-pointer">
                    {language === 'en' ? 'Music Allowed' : 'Musique autorisée'}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="luggage"
                    checked={smallLuggage}
                    onCheckedChange={(checked) =>
                      setSmallLuggage(checked as boolean)
                    }
                  />
                  <Label htmlFor="luggage" className="cursor-pointer">
                    {language === 'en'
                      ? 'Small Luggage Only'
                      : 'Petits bagages uniquement'}
                  </Label>
                </div>
              </div>

              <div className="mt-6">
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Interactive Map */}
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
                      {/* Overlay with action buttons */}
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
                      {/* Quick info badge */}
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#FF5722]" />
                          <span className="font-semibold">{distance} km</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{duration}</span>
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
                              {
                                month: 'short',
                                day: 'numeric',
                              },
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
                                  1000,
                            ).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'fr-FR',
                              {
                                month: 'short',
                                day: 'numeric',
                              },
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

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#FF5722] hover:bg-[#FF5722]/90 text-white font-semibold"
                  >
                    {language === 'en'
                      ? 'Publish Trip →'
                      : 'Publier le trajet →'}
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

      {/* Map Modal */}
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
