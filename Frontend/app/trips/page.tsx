'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Calendar, Clock, Users, Loader2, AlertCircle, 
  CheckCircle, XCircle, Ban, HourglassIcon, Globe, Car
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// 🌍 Traductions
const translations = {
  fr: {
    title: "Mes Réservations",
    noBookings: "Aucune réservation",
    noBookingsDesc: "Vous n'avez pas encore effectué de réservation",
    searchTrips: "Rechercher un trajet",
    loading: "Chargement...",
    error: "Erreur",
    retry: "Réessayer",
    status: {
      PENDING: "En attente",
      CONFIRMED: "Confirmée",
      REJECTED: "Refusée",
      CANCELLED: "Annulée"
    },
    statusDesc: {
      PENDING: "En attente de confirmation du conducteur",
      CONFIRMED: "Réservation confirmée par le conducteur",
      REJECTED: "Réservation refusée par le conducteur",
      CANCELLED: "Vous avez annulé cette réservation"
    },
    seats: "places",
    seat: "place",
    total: "Total",
    driver: "Conducteur",
    from: "De",
    to: "Vers",
    date: "Date",
    departure: "Départ",
    bookingDate: "Réservée le",
    cancel: "Annuler",
    cancelling: "Annulation...",
    confirmCancel: "Êtes-vous sûr de vouloir annuler cette réservation ?",
    cancelSuccess: "Réservation annulée avec succès",
    cancelError: "Erreur lors de l'annulation",
    viewDetails: "Voir les détails",
    contactDriver: "Contacter le conducteur"
  },
  en: {
    title: "My Bookings",
    noBookings: "No bookings",
    noBookingsDesc: "You haven't made any bookings yet",
    searchTrips: "Search for a trip",
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    status: {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled"
    },
    statusDesc: {
      PENDING: "Waiting for driver confirmation",
      CONFIRMED: "Booking confirmed by driver",
      REJECTED: "Booking rejected by driver",
      CANCELLED: "You cancelled this booking"
    },
    seats: "seats",
    seat: "seat",
    total: "Total",
    driver: "Driver",
    from: "From",
    to: "To",
    date: "Date",
    departure: "Departure",
    bookingDate: "Booked on",
    cancel: "Cancel",
    cancelling: "Cancelling...",
    confirmCancel: "Are you sure you want to cancel this booking?",
    cancelSuccess: "Booking cancelled successfully",
    cancelError: "Error cancelling booking",
    viewDetails: "View details",
    contactDriver: "Contact driver"
  }
};

interface Booking {
  id: number;
  trajet: {
    id: number;
    ville_depart: string;
    ville_arrivee: string;
    date: string;
    heure_depart: string;
    heure_arrivee?: string;
    price: number;
    conducteur: {
      id: number;
      nom: string;
      prenom: string;
      profile_picture?: string;
      rating?: number;
    };
  };
  nbr_places: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Charger la langue
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  // Charger les réservations
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reservations/my-bookings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Réservations chargées:', data);
        setBookings(data);
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setError('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm(t.confirmCancel)) return;

    setCancellingId(bookingId);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/reservations/${bookingId}/cancel/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert(t.cancelSuccess);
        fetchBookings(); // Recharger la liste
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || t.cancelError);
      }
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      alert(t.cancelError);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <Ban className="w-5 h-5 text-gray-600" />;
      case 'PENDING':
      default:
        return <HourglassIcon className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PENDING':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfilePictureUrl = (picture: string | undefined): string => {
    if (!picture) return '/placeholder.svg';
    if (picture.startsWith('http')) return picture;
    return `${API_BASE_URL}${picture.startsWith('/') ? '' : '/'}${picture}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-auto"
          >
            <Globe className="w-5 h-5" />
            <span className="font-medium">{lang.toUpperCase()}</span>
          </button>
        </div>
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{t.error}</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={fetchBookings}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  {t.retry}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des réservations */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t.noBookings}
            </h3>
            <p className="text-gray-600 mb-6">{t.noBookingsDesc}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              {t.searchTrips}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Info trajet */}
                  <div className="flex-1 space-y-4">
                    {/* Statut */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}
                      >
                        {getStatusIcon(booking.status)}
                        {t.status[booking.status]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {t.statusDesc[booking.status]}
                      </span>
                    </div>

                    {/* Itinéraire */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div className="w-px h-12 bg-gray-300"></div>
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {booking.trajet.ville_depart}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t.departure}: {booking.trajet.heure_depart}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {booking.trajet.ville_arrivee}
                          </div>
                          {booking.trajet.heure_arrivee && (
                            <div className="text-sm text-gray-500">
                              {booking.trajet.heure_arrivee}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date et places */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.trajet.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {booking.nbr_places}{' '}
                          {booking.nbr_places > 1 ? t.seats : t.seat}
                        </span>
                      </div>
                    </div>

                    {/* Date de réservation */}
                    <div className="text-xs text-gray-500">
                      {t.bookingDate}: {formatDateTime(booking.created_at)}
                    </div>
                  </div>

                  {/* Conducteur et actions */}
                  <div className="lg:w-80 space-y-4">
                    {/* Conducteur */}
                    {booking.trajet?.conducteur ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                          {t.driver}
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfilePictureUrl(
                              booking.trajet.conducteur.profile_picture
                            )}
                            alt={`${booking.trajet.conducteur.prenom || ''} ${booking.trajet.conducteur.nom || ''}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/placeholder.svg';
                            }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {booking.trajet.conducteur.prenom}{' '}
                              {booking.trajet.conducteur.nom}
                            </div>
                            {booking.trajet.conducteur.rating !== undefined && (
                              <div className="text-sm text-gray-600">
                                ⭐ {booking.trajet.conducteur.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">
                          {t.driver}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                          <AlertCircle className="w-4 h-4" />
                          {lang === 'fr' ? 'Information non disponible' : 'Information not available'}
                        </div>
                      </div>
                    )}

                    {/* Prix total */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        {t.total}
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {booking.trajet.price * booking.nbr_places} DA
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          router.push(`/trip/${booking.trajet.id}`)
                        }
                        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        {t.viewDetails}
                      </button>

                      {(booking.status === 'PENDING' ||
                        booking.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === booking.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t.cancelling}
                            </span>
                          ) : (
                            t.cancel
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}