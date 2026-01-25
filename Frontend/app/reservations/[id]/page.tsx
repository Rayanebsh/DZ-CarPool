'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Check,
  X,
  Loader2,
  Star,
} from 'lucide-react';

interface Passenger {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  rating?: number;
  total_trips?: number;
}

interface Trajet {
  id: number;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  heure_depart: string;
  prix_par_place: number;
}

interface Reservation {
  id: number;
  passager: number;
  passager_detail: Passenger;
  trajet: number;
  trajet_detail: Trajet;
  nbr_places: number;
  total_price: number;
  status: string;
  created_at: string;
}

export default function ReservationDetailPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const reservationId = params?.id;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (reservationId) fetchReservationDetails();
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/reservations/${reservationId}/`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) throw new Error('Erreur chargement réservation');

      const data = await response.json();
      console.log('📋 Réservation chargée:', data);
      setReservation(data);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/reservations/${reservationId}/confirm/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur confirmation');
      }

      const data = await response.json();
      console.log('✅ Réponse:', data);

      alert(
        language === 'en'
          ? 'Reservation confirmed successfully!'
          : 'Réservation confirmée avec succès !',
      );
      router.push('/messages');
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert(
        language === 'en'
          ? 'Error confirming reservation'
          : 'Erreur lors de la confirmation',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/reservations/${reservationId}/reject/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur rejet');
      }

      const data = await response.json();
      console.log('✅ Réponse:', data);

      alert(language === 'en' ? 'Reservation rejected' : 'Réservation refusée');
      router.push('/trips');
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert(
        language === 'en'
          ? 'Error rejecting reservation'
          : 'Erreur lors du rejet',
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">
            {language === 'en'
              ? 'Reservation not found'
              : 'Réservation introuvable'}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { color: string; label: { en: string; fr: string } };
    } = {
      PENDING: {
        color: 'bg-yellow-500',
        label: { en: 'Pending', fr: 'En attente' },
      },
      CONFIRMED: {
        color: 'bg-green-500',
        label: { en: 'Confirmed', fr: 'Confirmée' },
      },
      REJECTED: {
        color: 'bg-red-500',
        label: { en: 'Rejected', fr: 'Refusée' },
      },
      CANCELLED: {
        color: 'bg-gray-500',
        label: { en: 'Cancelled', fr: 'Annulée' },
      },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label[language]}
      </Badge>
    );
  };

  const passenger = reservation.passager_detail;
  const trajet = reservation.trajet_detail;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'en'
                ? 'Reservation Request'
                : 'Demande de réservation'}
            </h1>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Review the passenger details and trip information'
                : 'Consultez les détails du passager et du trajet'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Passenger Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {language === 'en' ? 'Passenger' : 'Passager'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF5722]/10 flex items-center justify-center overflow-hidden">
                    {passenger?.profile_picture ? (
                      <img
                        src={passenger.profile_picture}
                        alt={passenger.first_name[0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[#FF5722]">
                        {passenger?.first_name ? passenger.first_name[0] : '?'}{' '}
                        {passenger?.last_name}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {passenger?.first_name} {passenger?.last_name}
                    </h3>
                    {passenger?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {passenger.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{passenger?.email}</span>
                  </div>
                  {passenger?.phone_number && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{passenger.phone_number}</span>
                    </div>
                  )}
                </div>

                {passenger?.total_trips && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {language === 'en'
                        ? 'Total trips: '
                        : 'Trajets effectués: '}
                      <span className="font-semibold">
                        {passenger.total_trips}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trip Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {language === 'en' ? 'Trip Details' : 'Détails du trajet'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'en' ? 'Route' : 'Itinéraire'}
                  </p>
                  <p className="font-semibold text-lg">
                    {trajet?.ville_depart} → {trajet?.ville_arrivee}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{language === 'en' ? 'Date' : 'Date'}</span>
                    </div>
                    <p className="font-medium">
                      {trajet?.date_depart &&
                        new Date(trajet.date_depart).toLocaleDateString(
                          language === 'en' ? 'en-US' : 'fr-FR',
                        )}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{language === 'en' ? 'Time' : 'Heure'}</span>
                    </div>
                    <p className="font-medium">{trajet?.heure_depart}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {language === 'en'
                        ? 'Seats requested'
                        : 'Places demandées'}
                    </span>
                    <span className="font-semibold">
                      {reservation?.nbr_places}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {language === 'en' ? 'Price per seat' : 'Prix par place'}
                    </span>
                    <span className="font-semibold">
                      {trajet?.prix_par_place} DA
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">
                      {language === 'en' ? 'Total' : 'Total'}
                    </span>
                    <span className="font-bold text-lg text-[#FF5722]">
                      {reservation?.total_price} DA
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          <Card className="mt-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'en' ? 'Status' : 'Statut'}
                  </p>
                  {getStatusBadge(reservation?.status)}
                </div>

                {reservation?.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReject}
                      disabled={actionLoading}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {language === 'en' ? 'Reject' : 'Refuser'}
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {language === 'en' ? 'Accept' : 'Accepter'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
