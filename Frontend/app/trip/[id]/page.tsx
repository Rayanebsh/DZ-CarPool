'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Check,
  X,
  Loader2,
  Clock,
  AlertCircle,
  Minus,
  Plus,
  Shield,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const translations = {
  fr: {
    home: 'Accueil',
    searchResults: 'Résultats de recherche',
    tripFrom: 'Trajet de',
    to: 'vers',
    error: 'Erreur',
    tripNotFound: 'Trajet introuvable',
    backToResults: 'Retour aux résultats',
    verified: 'Vérifié',
    trips: 'trajets',
    trip: 'trajet',
    memberSince: 'Membre depuis',
    verifiedProfile: 'Profil vérifié',
    vehicleInfo: 'Informations du véhicule',
    seats: 'places',
    airConditioning: 'Climatisation',
    driverPreferences: 'Préférences du conducteur',
    tripFeatures: 'Caractéristiques du trajet',
    luggageAllowed: 'Bagages autorisés',
    comfortTrip: 'Trajet confort',
    confirmedPassengers: 'Passagers confirmés',
    pricePerSeat: 'Prix par place',
    available: 'disponible',
    availablePlural: 'disponibles',
    seatsToBook: 'Nombre de places à réserver',
    total: 'Total',
    departure: 'Départ',
    arrival: 'Arrivée',
    duration: 'Durée',
    bookNow: 'Réserver maintenant',
    booking: 'Réservation...',
    bookingConfirmed: 'Réservation confirmée ✓',
    full: 'Complet',
    noChargeYet: 'Vous ne serez pas débité immédiatement',
    bookingSuccess: 'Réservation réussie !',
    redirecting: 'Vous allez être redirigé vers vos réservations...',
    bookingError: 'Erreur',
    verificationRequired: 'Vérification requise',
    verificationMessage:
      "Vous devez vérifier votre carte d'identité pour effectuer une réservation",
    verifyNow: 'Vérifier maintenant',
    loginRequired: 'Connexion requise',
    loginMessage: 'Vous devez être connecté pour réserver',
    loginNow: 'Se connecter',
    emailVerificationRequired: 'Vérification email/téléphone requise',
    emailVerificationMessage:
      'Vous devez vérifier votre email et numéro de téléphone avant de réserver',
    verifyEmailPhone: 'Vérifier maintenant',
  },
  en: {
    home: 'Home',
    searchResults: 'Search Results',
    tripFrom: 'Trip from',
    to: 'to',
    error: 'Error',
    tripNotFound: 'Trip not found',
    backToResults: 'Back to results',
    verified: 'Verified',
    trips: 'trips',
    trip: 'trip',
    memberSince: 'Member since',
    verifiedProfile: 'Verified Profile',
    vehicleInfo: 'Vehicle Information',
    seats: 'seats',
    airConditioning: 'Air Conditioning',
    driverPreferences: 'Driver Preferences',
    tripFeatures: 'Trip Features',
    luggageAllowed: 'Luggage Allowed',
    comfortTrip: 'Comfort Trip',
    confirmedPassengers: 'Confirmed Passengers',
    pricePerSeat: 'Price per seat',
    available: 'available',
    availablePlural: 'available',
    seatsToBook: 'Number of seats to book',
    total: 'Total',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    bookNow: 'Book now',
    booking: 'Booking...',
    bookingConfirmed: 'Booking confirmed ✓',
    full: 'Full',
    noChargeYet: 'You will not be charged immediately',
    bookingSuccess: 'Booking successful!',
    redirecting: 'You will be redirected to your bookings...',
    bookingError: 'Error',
    verificationRequired: 'Verification Required',
    verificationMessage: 'You must verify your ID card to make a reservation',
    verifyNow: 'Verify now',
    loginRequired: 'Login Required',
    loginMessage: 'You must be logged in to book',
    loginNow: 'Log in',
    emailVerificationRequired: 'Email/Phone Verification Required',
    emailVerificationMessage:
      'You must verify your email and phone number before booking',
    verifyEmailPhone: 'Verify now',
  },
};

interface Preference {
  id: number;
  name_fr: string;
  name_en: string;
  icon?: string;
}

interface Passager {
  id: number;
  full_name: string;
  profile_picture: string | null;
  nbr_places: number;
}

interface TripDetails {
  id: number;
  ville_depart: string;
  ville_arrivee: string;
  adresse_depart?: string;
  adresse_arrivee?: string;
  date: string;
  heure_depart: string;
  heure_arrivee?: string;
  duree_estimee?: string;
  price: number;
  places_disponibles: number;
  is_confort: boolean;
  luggage_allowed: boolean;
  description?: string;
  conducteur_id: number;
  conducteur_name: string;
  conducteur_picture: string | null;
  conducteur_rating: number;
  conducteur_trips?: number;
  conducteur_verified?: boolean;
  conducteur_member_since?: string;
  vehicule_modele?: string;
  vehicule_annee?: number;
  vehicule_couleur?: string;
  vehicule_places?: number;
  vehicule_climatisation?: boolean;
  vehicule_photo?: string | null;
  preferences?: Preference[];
  passagers_reserves?: Passager[];
}

interface VerificationStatus {
  isAuthenticated: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  documentsVerified: boolean;
  canPerformAction: boolean;
  redirectUrl: string | null;
  message: string;
  errorType: 'login' | 'email_phone' | 'documents' | null;
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id;

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [tripData, setTripData] = useState<TripDetails | null>(null);

  const [nbr_places, setNbrPlaces] = useState(1);
  const [driverEnriched, setDriverEnriched] = useState<any>(null);
  const [passengersEnriched, setPassengersEnriched] = useState<any[]>([]);
  const [driverLoading, setDriverLoading] = useState(true);
  const [passengersLoading, setPassengersLoading] = useState(true);

  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      isAuthenticated: false,
      emailVerified: false,
      phoneVerified: false,
      documentsVerified: false,
      canPerformAction: false,
      redirectUrl: null,
      message: '',
      errorType: null,
    });
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    checkCompleteVerificationStatus();
  }, []);

  const checkCompleteVerificationStatus = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setVerificationStatus({
        isAuthenticated: false,
        emailVerified: false,
        phoneVerified: false,
        documentsVerified: false,
        canPerformAction: false,
        redirectUrl: '/login',
        message: t.loginMessage,
        errorType: 'login',
      });
      return;
    }

    try {
      const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          localStorage.removeItem('access_token');
          setVerificationStatus({
            isAuthenticated: false,
            emailVerified: false,
            phoneVerified: false,
            documentsVerified: false,
            canPerformAction: false,
            redirectUrl: '/login',
            message: t.loginMessage,
            errorType: 'login',
          });
          return;
        }
      }

      try {
        const docResponse = await fetch(
          `${API_BASE_URL}/api/v1/users/check-document-status/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (docResponse.ok) {
          const docData = await docResponse.json();
          const documentsVerified = docData.has_verified_document || false;

          if (!documentsVerified) {
            setVerificationStatus({
              isAuthenticated: true,
              emailVerified: true,
              phoneVerified: true,
              documentsVerified: false,
              canPerformAction: false,
              redirectUrl: '/documents',
              message: docData.message || t.verificationMessage,
              errorType: 'documents',
            });
            return;
          }

          setVerificationStatus({
            isAuthenticated: true,
            emailVerified: true,
            phoneVerified: true,
            documentsVerified: true,
            canPerformAction: true,
            redirectUrl: null,
            message: 'Compte entièrement vérifié',
            errorType: null,
          });
        } else {
          setVerificationStatus({
            isAuthenticated: true,
            emailVerified: true,
            phoneVerified: true,
            documentsVerified: false,
            canPerformAction: true,
            redirectUrl: null,
            message: 'Vérification partielle',
            errorType: null,
          });
        }
      } catch {
        setVerificationStatus({
          isAuthenticated: true,
          emailVerified: true,
          phoneVerified: true,
          documentsVerified: false,
          canPerformAction: true,
          redirectUrl: null,
          message: 'Erreur de vérification',
          errorType: null,
        });
      }
    } catch {
      setVerificationStatus({
        isAuthenticated: true,
        emailVerified: false,
        phoneVerified: false,
        documentsVerified: false,
        canPerformAction: true,
        redirectUrl: null,
        message: 'Erreur réseau',
        errorType: null,
      });
    }
  };

  // ✅ MODIF 1: NOUVELLE FONCTION pour détails (API 2)
  const fetchTripDetailsOnly = async () => {
    if (!tripId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/trajets/${tripId}/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (response.ok) {
        const detailsData = await response.json();
        return detailsData;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur détails:', error);
      return null;
    }
  };

  // ✅ MODIF 2: fetchTripDetails utilise MAINTENANT LES 2 APIs
  const fetchTripDetails = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);

      // 🔄 API 1: PLACES (inchangé)
      const placesResponse = await fetch(
        `${API_BASE_URL}/api/v1/trajets/${tripId}/places/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!placesResponse.ok) {
        const errorText = await placesResponse.text();
        setError(`${t.error} (Places): ${placesResponse.status}: ${errorText}`);
        return;
      }

      const placesData = await placesResponse.json();

      // 🔄 API 2: DÉTAILS (NOUVEAU)
      const detailsData = await fetchTripDetailsOnly();

      if (!detailsData) {
        setError(`${t.error} (Détails): Trajet introuvable`);
        return;
      }
      const driverPrice = Number(detailsData.price_driver); // "1020.00" -> 1020
      const platformPrice = Number(detailsData.price_platform); // "180.00"  -> 180
      // 🔄 FUSION des 2 APIs
      const mergedData: TripDetails = {
        ...detailsData,
        // Surcharger avec les données places (plus fraîches)
        id: detailsData.id,
        price: driverPrice + platformPrice,
        places_disponibles: placesData.places_disponibles,
      };
      console.log('🔥 mergedData =', mergedData);
      setTripData(mergedData);

      // 🔄 Driver & Passengers (inchangé)
      setDriverLoading(true);
      try {
        const driverResponse = await fetch(
          `${API_BASE_URL}/api/v1/trajets/${tripId}/driver_info/`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (driverResponse.ok) {
          const driverData = await driverResponse.json();
          setDriverEnriched(driverData);
        } else {
          // ✅ CORRECTION : Utiliser les données COMPLÈTES du conducteur
          const conducteur = detailsData.conducteur;

          if (conducteur) {
            setDriverEnriched({
              id: conducteur.id,
              full_name: `${conducteur.first_name} ${conducteur.last_name}`,
              profile_picture: conducteur.profile_picture,
              rating: parseFloat(conducteur.average_rating) || 5.0,
              trips_count:
                conducteur.trips_as_driver + conducteur.trips_as_passenger,
              trips_as_driver: conducteur.trips_as_driver,
              trips_as_passenger: conducteur.trips_as_passenger,
              is_verified:
                conducteur.documents?.some((doc: any) => doc.verified) || false,
              member_since: conducteur.date_joined,
            });
          }
        }
      } catch (err) {
        console.error('❌ Exception driver_info:', err);

        // ✅ FALLBACK : Utiliser conducteur complet même en cas d'erreur
        const conducteur = detailsData.conducteur;
        if (conducteur) {
          setDriverEnriched({
            id: conducteur.id,
            full_name: `${conducteur.first_name} ${conducteur.last_name}`,
            profile_picture: conducteur.profile_picture,
            rating: parseFloat(conducteur.average_rating) || 5.0,
            trips_count:
              conducteur.trips_as_driver + conducteur.trips_as_passenger,
            trips_as_driver: conducteur.trips_as_driver,
            trips_as_passenger: conducteur.trips_as_passenger,
            is_verified:
              conducteur.documents?.some((doc: any) => doc.verified) || false,
            member_since: conducteur.date_joined,
          });
        }
      } finally {
        setDriverLoading(false);
      }

      setPassengersLoading(true);
      try {
        const passengersResponse = await fetch(
          `${API_BASE_URL}/api/v1/trajets/${tripId}/passengers/`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (passengersResponse.ok) {
          const passengersData = await passengersResponse.json();
          setPassengersEnriched(passengersData.passengers || []);
        }
      } catch (err) {
        console.error('❌ Exception passengers:', err);
      } finally {
        setPassengersLoading(false);
      }
    } catch (error) {
      console.error('❌ Erreur chargement trajet:', error);
      setError('Impossible de charger les détails du trajet');
    } finally {
      setLoading(false);
    }
  };

  // ... (useEffect pour fetchTripDetails INCHANGÉ)
  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  // ✅ MODIF 3: handleBooking - SEULEMENT refresh places après réservation
  const handleBooking = async () => {
    if (!tripData) return;

    if (!verificationStatus.canPerformAction) {
      setShowVerificationWarning(true);
      setBookingError(verificationStatus.message);
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/reservations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trajet: tripData.id,
          nbr_places: nbr_places,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);

        // ✅ OPTIMISTE: mise à jour immédiate
        setTripData((prev) =>
          prev
            ? {
                ...prev,
                places_disponibles: prev.places_disponibles - nbr_places,
              }
            : null,
        );

        // ✅ RAPIDE: refresh SEULEMENT les places (API 1)
        setTimeout(async () => {
          try {
            const placesResponse = await fetch(
              `${API_BASE_URL}/api/v1/trajets/${tripData.id}/places/`,
            );
            if (placesResponse.ok) {
              const placesData = await placesResponse.json();
              console.log('🔄 Places mises à jour:', placesData);
              console.log('🔥 placesData =', placesData);
              console.log('keys:', Object.keys(placesData));
              setTripData((prev) =>
                prev
                  ? {
                      ...prev,
                      places_disponibles: placesData.places_disponibles,
                    }
                  : null,
              );
            }
          } catch (error) {
            console.error('Erreur refresh places:', error);
            fetchTripDetails(); // Fallback complet
          }
        }, 500);

        setTimeout(() => {
          router.push('/trips');
        }, 2000);
      } else {
        const errorData = await response.json();

        if (
          errorData.can_book === false ||
          errorData.action_required === 'upload_document'
        ) {
          setShowVerificationWarning(true);
          setBookingError(errorData.message || t.verificationMessage);
        } else {
          setBookingError(errorData.error || 'Erreur lors de la réservation');
        }
      }
    } catch (error) {
      console.error('Erreur de réservation:', error);
      setBookingError('Impossible de créer la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleVerificationRedirect = () => {
    if (verificationStatus.redirectUrl) {
      router.push(verificationStatus.redirectUrl);
    }
  };

  const getVerificationButtonText = (): string => {
    switch (verificationStatus.errorType) {
      case 'login':
        return t.loginNow;
      case 'email_phone':
        return t.verifyEmailPhone;
      case 'documents':
        return t.verifyNow;
      default:
        return t.verifyNow;
    }
  };

  const incrementPlaces = () => {
    if (tripData && nbr_places < tripData.places_disponibles) {
      setNbrPlaces(nbr_places + 1);
    }
  };

  const decrementPlaces = () => {
    if (nbr_places > 1) {
      setNbrPlaces(nbr_places - 1);
    }
  };

  const getProfilePictureUrl = (picture: string | null): string => {
    if (!picture) return '/placeholder.svg';
    if (picture.startsWith('http')) return picture;
    return `${API_BASE_URL}/api/v1${picture.startsWith('/') ? '' : '/'}${picture}`;
  };

  const formatRating = (rating: number | null | undefined): string => {
    if (rating === null || rating === undefined) return '5.0';
    return rating.toFixed(1);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatMemberSince = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-20">
            <div className="flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !tripData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-red-900 mb-2">{t.error}</h3>
              <p className="text-red-700 text-sm">{error || t.tripNotFound}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                {t.backToResults}
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.tripFrom} {tripData.ville_depart} {t.to}{' '}
                  {tripData.ville_arrivee}
                </h1>
                <p className="text-gray-600">
                  {formatDate(tripData.date)} {lang === 'fr' ? 'à' : 'at'}{' '}
                  {tripData.heure_depart}
                </p>
                {tripData.description && (
                  <p className="text-gray-600 mt-4">{tripData.description}</p>
                )}
              </div>

              {/* Driver Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {driverLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : driverEnriched ? (
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getProfilePictureUrl(
                          driverEnriched.profile_picture,
                        )}
                        alt={driverEnriched.full_name}
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-100 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/placeholder.svg';
                        }}
                      />
                      {driverEnriched.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-gray-900 truncate">
                          {driverEnriched.full_name}
                        </h2>
                        {driverEnriched.is_verified && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 flex-shrink-0">
                            <Check className="w-4 h-4" />
                            {t.verified}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-bold text-gray-900">
                            {formatRating(driverEnriched.rating)}
                          </span>
                        </div>
                        <span className="text-gray-600 font-medium">
                          ({driverEnriched.trips_count || 0}{' '}
                          {driverEnriched.trips_count > 1 ? t.trips : t.trip})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {driverEnriched.member_since && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {t.memberSince}{' '}
                              {formatMemberSince(driverEnriched.member_since)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Passengers */}
              {passengersLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                </div>
              ) : (
                passengersEnriched.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">
                      {t.confirmedPassengers} ({passengersEnriched.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {passengersEnriched.map((passenger) => (
                        <div
                          key={passenger.id}
                          className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                        >
                          <img
                            src={getProfilePictureUrl(
                              passenger.profile_picture,
                            )}
                            alt={passenger.full_name}
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-base truncate">
                              {passenger.full_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                {passenger.nbr_places}{' '}
                                {passenger.nbr_places > 1
                                  ? t.seats
                                  : lang === 'fr'
                                    ? 'place'
                                    : 'seat'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Vehicle Information */}
              {tripData.vehicule_modele && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t.vehicleInfo}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={getProfilePictureUrl(
                          tripData.vehicule_photo || null,
                        )}
                        alt={tripData.vehicule_modele}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {tripData.vehicule_modele}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {tripData.vehicule_annee &&
                            `${tripData.vehicule_annee} • `}
                          {tripData.vehicule_couleur}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {tripData.vehicule_places && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span>
                              {tripData.vehicule_places} {t.seats}
                            </span>
                          </div>
                        )}
                        {tripData.vehicule_climatisation && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span>{t.airConditioning}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Préférences du trajet */}
              {tripData.preferences && tripData.preferences.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t.driverPreferences}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tripData.preferences.map((pref) => (
                      <span
                        key={pref.id}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {pref.icon && (
                          <span className="mr-2 text-base">{pref.icon}</span>
                        )}
                        {lang === 'fr' ? pref.name_fr : pref.name_en}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trip Features */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t.tripFeatures}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    {tripData.luggage_allowed ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {t.luggageAllowed}
                    </span>
                  </div>
                  {tripData.is_confort && (
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {t.comfortTrip}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6 space-y-6">
                {/* Avertissement de vérification */}
                {showVerificationWarning &&
                  !verificationStatus.canPerformAction && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">
                            {verificationStatus.errorType === 'login' &&
                              t.loginRequired}
                            {verificationStatus.errorType === 'email_phone' &&
                              t.emailVerificationRequired}
                            {verificationStatus.errorType === 'documents' &&
                              t.verificationRequired}
                          </h4>
                          <p className="text-sm text-amber-700 mb-3">
                            {verificationStatus.message}
                          </p>
                          <button
                            onClick={handleVerificationRedirect}
                            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                          >
                            {getVerificationButtonText()}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {bookingSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">{t.bookingSuccess}</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {t.redirecting}
                    </p>
                  </div>
                )}

                {bookingError && verificationStatus.canPerformAction && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 text-red-800">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">
                          {t.bookingError}
                        </span>
                        <span className="text-sm text-red-700">
                          {bookingError}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      {t.pricePerSeat}
                    </span>
                    <span className="text-3xl font-bold text-gray-900">
                      {tripData.price} DA
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {tripData.places_disponibles}{' '}
                    {tripData.places_disponibles > 1
                      ? t.availablePlural
                      : t.available}
                  </div>
                </div>

                {/* Sélecteur de nombre de places */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    {t.seatsToBook}
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={decrementPlaces}
                      disabled={nbr_places <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-100 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-3xl font-bold text-gray-900">
                      {nbr_places}
                    </span>
                    <button
                      onClick={incrementPlaces}
                      disabled={nbr_places >= tripData.places_disponibles}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-100 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center py-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">{t.total}: </span>
                    <span className="text-2xl font-bold text-blue-900">
                      {tripData.price * nbr_places} DA
                    </span>
                  </div>
                </div>

                {/* Trip Summary */}
                <div className="space-y-3 py-4 border-y border-gray-200">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {tripData.ville_depart}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.departure}: {tripData.heure_depart}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {tripData.ville_arrivee}
                      </div>
                      {tripData.heure_arrivee && (
                        <div className="text-xs text-gray-500">
                          {t.arrival}: {tripData.heure_arrivee}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {formatDate(tripData.date)}
                    </span>
                  </div>
                  {tripData.duree_estimee && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {t.duration}: {tripData.duree_estimee}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={
                    bookingLoading ||
                    bookingSuccess ||
                    tripData.places_disponibles === 0
                  }
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.booking}
                    </span>
                  ) : bookingSuccess ? (
                    t.bookingConfirmed
                  ) : tripData.places_disponibles === 0 ? (
                    t.full
                  ) : (
                    t.bookNow
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  {t.noChargeYet}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
