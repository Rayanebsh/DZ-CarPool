'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  HourglassIcon,
  Globe,
  Car,
  Star,
  Smile,
  Car as CarIcon,
  Send,
  X,
} from 'lucide-react';
import { env } from 'process';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 🌍 Traductions
const translations = {
  fr: {
    title: 'Mes Réservations',
    noBookings: 'Aucune réservation',
    noBookingsDesc: "Vous n'avez pas encore effectué de réservation",
    searchTrips: 'Rechercher un trajet',
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    status: {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      REJECTED: 'Refusée',
      CANCELLED: 'Annulée',
    },
    statusDesc: {
      PENDING: 'En attente de confirmation du conducteur',
      CONFIRMED: 'Réservation confirmée par le conducteur',
      REJECTED: 'Réservation refusée par le conducteur',
      CANCELLED: 'Vous avez annulé cette réservation',
    },
    seats: 'places',
    seat: 'place',
    total: 'Total',
    driver: 'Conducteur',
    from: 'De',
    to: 'Vers',
    date: 'Date',
    departure: 'Départ',
    bookingDate: 'Réservée le',
    cancel: 'Annuler',
    cancelling: 'Annulation...',
    confirmCancel: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
    cancelSuccess: 'Réservation annulée avec succès',
    cancelError: "Erreur lors de l'annulation",
    viewDetails: 'Voir les détails',
    contactDriver: 'Contacter le conducteur',
    rateDriver: 'Noter le conducteur',
    viewRating: 'Voir ma note',
    rated: 'Noté',
    ratingSuccess: 'Note envoyée avec succès !',
    ratingDetails: 'Détails de la note',
    globalRating: 'Note globale',
    punctuality: 'Ponctualité',
    friendliness: 'Convivialité',
    driving: 'Conduite',
    rateTrip: 'Noter votre trajet',
    with: 'Avec',
    overallRating: 'Note globale *',
    rateAspects: 'Notez les aspects suivants (optionnel)',
    comment: 'Commentaire (optionnel)',
    commentPlaceholder: 'Partagez votre expérience...',
    characters: 'caractères',
    send: 'Envoyer',
    sending: 'Envoi...',
    selectRating: 'Veuillez sélectionner une note globale',
    veryBad: 'Très mauvais',
    bad: 'Mauvais',
    average: 'Moyen',
    good: 'Bien',
    excellent: 'Excellent',
  },
  en: {
    title: 'My Bookings',
    noBookings: 'No bookings',
    noBookingsDesc: "You haven't made any bookings yet",
    searchTrips: 'Search for a trip',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    status: {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
    },
    statusDesc: {
      PENDING: 'Waiting for driver confirmation',
      CONFIRMED: 'Booking confirmed by driver',
      REJECTED: 'Booking rejected by driver',
      CANCELLED: 'You cancelled this booking',
    },
    seats: 'seats',
    seat: 'seat',
    total: 'Total',
    driver: 'Driver',
    from: 'From',
    to: 'To',
    date: 'Date',
    departure: 'Departure',
    bookingDate: 'Booked on',
    cancel: 'Cancel',
    cancelling: 'Cancelling...',
    confirmCancel: 'Are you sure you want to cancel this booking?',
    cancelSuccess: 'Booking cancelled successfully',
    cancelError: 'Error cancelling booking',
    viewDetails: 'View details',
    contactDriver: 'Contact driver',
    rateDriver: 'Rate driver',
    viewRating: 'View my rating',
    rated: 'Rated',
    ratingSuccess: 'Rating submitted successfully!',
    ratingDetails: 'Rating details',
    globalRating: 'Overall rating',
    punctuality: 'Punctuality',
    friendliness: 'Friendliness',
    driving: 'Driving',
    rateTrip: 'Rate your trip',
    with: 'With',
    overallRating: 'Overall rating *',
    rateAspects: 'Rate the following aspects (optional)',
    comment: 'Comment (optional)',
    commentPlaceholder: 'Share your experience...',
    characters: 'characters',
    send: 'Send',
    sending: 'Sending...',
    selectRating: 'Please select an overall rating',
    veryBad: 'Very bad',
    bad: 'Bad',
    average: 'Average',
    good: 'Good',
    excellent: 'Excellent',
  },
};

interface Rating {
  id: number;
  note: number;
  ponctualite?: number;
  convivialite?: number;
  conduite?: number;
  comment?: string;
}

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
  rating?: Rating;
  can_rate?: boolean;
  has_rating?: boolean;
}

// Composant Modal de Rating
function RatingModal({
  booking,
  onClose,
  onSuccess,
  lang,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
  lang: 'fr' | 'en';
}) {
  const t = translations[lang];
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ponctualite, setPonctualite] = useState(0);
  const [convivialite, setConvivialite] = useState(0);
  const [conduite, setConduite] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t.selectRating);
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');

    try {
      // 🚀 VOICI L'API QUI ENVOIE LA NOTE
      const response = await fetch(
        `${API_BASE_URL}/api/v1/reservations/${booking.id}/rate/`, // ← API endpoint
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: rating, // Note globale (obligatoire)
            ponctualite: ponctualite || null, // Note ponctualité (optionnel)
            convivialite: convivialite || null, // Note convivialité (optionnel)
            conduite: conduite || null, // Note conduite (optionnel)
            comment: comment, // Commentaire (optionnel)
          }),
        },
      );

      if (response.ok) {
        onSuccess(); // Rafraîchit la liste
        onClose(); // Ferme le modal
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
    icon: Icon,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    icon?: any;
  }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= (hover || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return t.veryBad;
      case 2:
        return t.bad;
      case 3:
        return t.average;
      case 4:
        return t.good;
      case 5:
        return t.excellent;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t.rateTrip}
          </h2>
          {booking.trajet?.conducteur && (
            <p className="text-gray-600">
              {t.with} {booking.trajet.conducteur.prenom}{' '}
              {booking.trajet.conducteur.nom}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t.overallRating}
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {getRatingText(rating)}
            </p>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t.rateAspects}
          </h3>

          <StarRating
            value={ponctualite}
            onChange={setPonctualite}
            label={t.punctuality}
            icon={Clock}
          />

          <StarRating
            value={convivialite}
            onChange={setConvivialite}
            label={t.friendliness}
            icon={Smile}
          />

          <StarRating
            value={conduite}
            onChange={setConduite}
            label={t.driving}
            icon={CarIcon}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.comment}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={t.commentPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500 {t.characters}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t.send}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // États pour le rating
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedRating, setExpandedRating] = useState<number | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

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
      const response = await fetch(
        `${API_BASE_URL}/api/v1/reservations/my-bookings/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const bookingsData = await response.json();
        console.log('✅ Réservations chargées:', bookingsData);

        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking: any) => {
            let trajetId: number | null = null;

            if (
              booking.trajet &&
              typeof booking.trajet === 'object' &&
              booking.trajet.id
            ) {
              trajetId = booking.trajet.id;
            } else if (booking.trajet_id) {
              trajetId = booking.trajet_id;
            } else if (typeof booking.trajet === 'number') {
              trajetId = booking.trajet;
            }

            if (!trajetId) {
              return booking;
            }

            try {
              const trajetResponse = await fetch(
                `${API_BASE_URL}/api/v1/trajets/${trajetId}/`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (trajetResponse.ok) {
                const trajetDetails = await trajetResponse.json();
                return {
                  ...booking,
                  trajet: trajetDetails,
                };
              }
            } catch (err) {
              console.error(`Erreur fetch trajet ${trajetId}:`, err);
            }

            return booking;
          }),
        );

        setBookings(enrichedBookings);
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
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
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        alert(t.cancelSuccess);
        fetchBookings();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || t.cancelError);
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert(t.cancelError);
    } finally {
      setCancellingId(null);
    }
  };

  const handleRateDriver = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    alert(t.ratingSuccess);
    fetchBookings();
  };

  const canRate = (booking: Booking) => {
    // 🔍 Debug détaillé
    console.log(`\n🎯 canRate Check - Booking #${booking.id}:`);
    console.log(`  - status: ${booking.status}`);
    console.log(`  - has rating: ${!!booking.rating}`);
    console.log(`  - can_rate from API: ${booking.can_rate}`);
    console.log(`  - has_rating from API: ${booking.has_rating}`);

    // ✅ Utiliser UNIQUEMENT le champ can_rate de l'API
    const result = booking.can_rate === true;
    console.log(`  ✅ Result: ${result}`);

    return result;
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
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProfilePictureUrl = (picture: string | undefined): string => {
    if (!picture) return '/placeholder.svg';
    if (picture.startsWith('http')) return picture;
    return `${API_BASE_URL}/api/v1${picture.startsWith('/') ? '' : '/'}${picture}`;
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-20">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">{t.loading}</p>
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
                    <div className="flex-1 space-y-4">
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

                        {booking.rating && (
                          <button
                            onClick={() =>
                              setExpandedRating(
                                expandedRating === booking.id
                                  ? null
                                  : booking.id,
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm hover:bg-yellow-100 transition-colors"
                          >
                            <Star className="w-4 h-4 fill-yellow-400" />
                            {booking.rating.note}/5
                          </button>
                        )}
                      </div>

                      {expandedRating === booking.id && booking.rating && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {t.ratingDetails}
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {booking.rating.ponctualite && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-600">
                                  {t.punctuality}:
                                </span>
                                <span className="font-medium">
                                  {booking.rating.ponctualite}/5
                                </span>
                              </div>
                            )}

                            {booking.rating.convivialite && (
                              <div className="flex items-center gap-2">
                                <Smile className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-600">
                                  {t.friendliness}:
                                </span>
                                <span className="font-medium">
                                  {booking.rating.convivialite}/5
                                </span>
                              </div>
                            )}

                            {booking.rating.conduite && (
                              <div className="flex items-center gap-2">
                                <CarIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-600">
                                  {t.driving}:
                                </span>
                                <span className="font-medium">
                                  {booking.rating.conduite}/5
                                </span>
                              </div>
                            )}
                          </div>

                          {booking.rating.comment && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-700 italic">
                                "{booking.rating.comment}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

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

                      <div className="text-xs text-gray-500">
                        {t.bookingDate}: {formatDateTime(booking.created_at)}
                      </div>
                    </div>

                    <div className="lg:w-80 space-y-4">
                      {booking.trajet?.conducteur ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-700 mb-3">
                            {t.driver}
                          </div>
                          <div className="flex items-center gap-3">
                            <img
                              src={getProfilePictureUrl(
                                booking.trajet.conducteur.profile_picture,
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
                              {booking.trajet.conducteur.rating !==
                                undefined && (
                                <div className="text-sm text-gray-600">
                                  ⭐{' '}
                                  {booking.trajet.conducteur.rating.toFixed(1)}
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
                            {lang === 'fr'
                              ? 'Information non disponible'
                              : 'Information not available'}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          {t.total}
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {booking.trajet.price * booking.nbr_places} DA
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            router.push(`/trip/${booking.trajet.id}`)
                          }
                          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                          {t.viewDetails}
                        </button>

                        {canRate(booking) && (
                          <button
                            onClick={() => handleRateDriver(booking)}
                            className="w-full px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            {t.rateDriver}
                          </button>
                        )}

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

        {showRatingModal && selectedBooking && (
          <RatingModal
            booking={selectedBooking}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedBooking(null);
            }}
            onSuccess={handleRatingSuccess}
            lang={lang}
          />
        )}
      </div>
    </>
  );
}
