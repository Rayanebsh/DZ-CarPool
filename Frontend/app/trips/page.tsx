'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Car,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TripsPage() {
  const { language } = useLanguage();
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const translations = {
    en: {
      pageTitle: 'My Trips',
      pageSubtitle: 'View and manage your trip history',
      asDriver: 'As Driver',
      asPassenger: 'As Passenger',
      allTrips: 'All Trips',
      filterByStatus: 'Filter by status',
      all: 'All',
      completed: 'Completed',
      upcoming: 'Upcoming',
      cancelled: 'Cancelled',
      sortBy: 'Sort by',
      dateNewest: 'Date (Newest)',
      dateOldest: 'Date (Oldest)',
      priceHighest: 'Price (Highest)',
      priceLowest: 'Price (Lowest)',
      from: 'From',
      to: 'To',
      date: 'Date',
      time: 'Time',
      passengers: 'Passengers',
      seats: 'seats',
      price: 'Price',
      perSeat: 'per seat',
      status: 'Status',
      viewDetails: 'View Details',
      driver: 'Driver',
      noTrips: 'No trips found',
      noTripsDesc: "You haven't booked or offered any trips yet.",
      startSearching: 'Start Searching',
      offerRide: 'Offer a Ride',
      completedStatus: 'Completed',
      upcomingStatus: 'Upcoming',
      cancelledStatus: 'Cancelled',
      pendingStatus: 'Pending',
    },
    fr: {
      pageTitle: 'Mes Trajets',
      pageSubtitle: "Voir et gérer l'historique de vos trajets",
      asDriver: 'En tant que Conducteur',
      asPassenger: 'En tant que Passager',
      allTrips: 'Tous les Trajets',
      filterByStatus: 'Filtrer par statut',
      all: 'Tous',
      completed: 'Terminés',
      upcoming: 'À venir',
      cancelled: 'Annulés',
      sortBy: 'Trier par',
      dateNewest: 'Date (Plus récent)',
      dateOldest: 'Date (Plus ancien)',
      priceHighest: 'Prix (Plus élevé)',
      priceLowest: 'Prix (Moins élevé)',
      from: 'De',
      to: 'À',
      date: 'Date',
      time: 'Heure',
      passengers: 'Passagers',
      seats: 'sièges',
      price: 'Prix',
      perSeat: 'par siège',
      status: 'Statut',
      viewDetails: 'Voir les détails',
      driver: 'Conducteur',
      noTrips: 'Aucun trajet trouvé',
      noTripsDesc: "Vous n'avez pas encore réservé ou proposé de trajets.",
      startSearching: 'Commencer la recherche',
      offerRide: 'Proposer un Trajet',
      completedStatus: 'Terminé',
      upcomingStatus: 'À venir',
      cancelledStatus: 'Annulé',
      pendingStatus: 'En attente',
    },
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key];
  };

  // Mock trips data - replace with real data from backend
  const mockTrips = {
    driver: [
      {
        id: 1,
        from: 'Algiers',
        to: 'Oran',
        date: '2024-01-20',
        time: '08:00',
        seats: 3,
        seatsBooked: 2,
        pricePerSeat: 1500,
        status: 'upcoming',
        passengers: [
          {
            name: 'Sarah Amrani',
            avatar: '/placeholder.svg?height=40&width=40',
          },
          {
            name: 'Karim Bouzid',
            avatar: '/placeholder.svg?height=40&width=40',
          },
        ],
      },
      {
        id: 2,
        from: 'Oran',
        to: 'Algiers',
        date: '2024-01-15',
        time: '14:00',
        seats: 3,
        seatsBooked: 3,
        pricePerSeat: 1500,
        status: 'completed',
        passengers: [
          {
            name: 'Amina Khaled',
            avatar: '/placeholder.svg?height=40&width=40',
          },
          {
            name: 'Mehdi Saidi',
            avatar: '/placeholder.svg?height=40&width=40',
          },
          {
            name: 'Faiza Benali',
            avatar: '/placeholder.svg?height=40&width=40',
          },
        ],
      },
      {
        id: 3,
        from: 'Algiers',
        to: 'Constantine',
        date: '2024-01-10',
        time: '09:00',
        seats: 2,
        seatsBooked: 0,
        pricePerSeat: 2000,
        status: 'cancelled',
        passengers: [],
      },
    ],
    passenger: [
      {
        id: 4,
        from: 'Annaba',
        to: 'Algiers',
        date: '2024-01-25',
        time: '10:00',
        pricePerSeat: 2500,
        status: 'upcoming',
        driver: {
          name: 'Yacine Boudiaf',
          avatar: '/placeholder.svg?height=40&width=40',
          rating: 4.9,
        },
      },
      {
        id: 5,
        from: 'Algiers',
        to: 'Tlemcen',
        date: '2024-01-12',
        time: '15:30',
        pricePerSeat: 2200,
        status: 'completed',
        driver: {
          name: 'Rachid Mansouri',
          avatar: '/placeholder.svg?height=40&width=40',
          rating: 4.7,
        },
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: t('completedStatus'),
      },
      upcoming: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        text: t('upcomingStatus'),
      },
      cancelled: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        text: t('cancelledStatus'),
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        text: t('pendingStatus'),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} hover:${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const renderDriverTrips = (trips: typeof mockTrips.driver) => {
    if (trips.length === 0) {
      return (
        <div className="text-center py-12">
          <Car className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noTrips')}
          </h3>
          <p className="text-gray-600 mb-6">{t('noTripsDesc')}</p>
          <Link href="/offer-ride">
            <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              {t('offerRide')}
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Trip Route */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-12 bg-gray-300" />
                      <div className="w-3 h-3 rounded-full bg-[#FF5722]" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">{t('from')}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {trip.from}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{t('to')}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {trip.to}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(trip.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{trip.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {trip.seatsBooked}/{trip.seats} {t('seats')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {trip.pricePerSeat} DA {t('perSeat')}
                      </span>
                    </div>
                  </div>

                  {/* Passengers */}
                  {trip.passengers.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        {t('passengers')}
                      </div>
                      <div className="flex -space-x-2">
                        {trip.passengers.map((passenger, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                            title={passenger.name}
                          >
                            <Image
                              src={passenger.avatar || '/placeholder.svg'}
                              alt={passenger.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end justify-between gap-4 lg:w-48">
                  <div>{getStatusBadge(trip.status)}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    {t('viewDetails')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPassengerTrips = (trips: typeof mockTrips.passenger) => {
    if (trips.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noTrips')}
          </h3>
          <p className="text-gray-600 mb-6">{t('noTripsDesc')}</p>
          <Link href="/">
            <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
              {t('startSearching')}
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Trip Route */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-12 bg-gray-300" />
                      <div className="w-3 h-3 rounded-full bg-[#FF5722]" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">{t('from')}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {trip.from}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{t('to')}</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {trip.to}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(trip.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{trip.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {trip.pricePerSeat} DA
                      </span>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF5722]">
                      <Image
                        src={trip.driver.avatar || '/placeholder.svg'}
                        alt={trip.driver.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">{t('driver')}</div>
                      <div className="font-medium text-gray-900">
                        {trip.driver.name}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ⭐ {trip.driver.rating}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end justify-between gap-4 lg:w-48">
                  <div>{getStatusBadge(trip.status)}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    {t('viewDetails')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('pageTitle')}
            </h1>
            <p className="text-gray-600">{t('pageSubtitle')}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="upcoming">{t('upcoming')}</SelectItem>
                <SelectItem value="completed">{t('completed')}</SelectItem>
                <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t('dateNewest')}</SelectItem>
                <SelectItem value="date-asc">{t('dateOldest')}</SelectItem>
                <SelectItem value="price-desc">{t('priceHighest')}</SelectItem>
                <SelectItem value="price-asc">{t('priceLowest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="driver" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="driver">{t('asDriver')}</TabsTrigger>
              <TabsTrigger value="passenger">{t('asPassenger')}</TabsTrigger>
            </TabsList>

            <TabsContent value="driver">
              {renderDriverTrips(mockTrips.driver)}
            </TabsContent>

            <TabsContent value="passenger">
              {renderPassengerTrips(mockTrips.passenger)}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
