'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, Users, Check, X } from 'lucide-react';
import Image from 'next/image';

// Mock trip data
const tripData = {
  id: 1,
  driver: {
    name: 'Karim Lamin',
    rating: 4.8,
    trips: 192,
    memberSince: 'June 2021',
    verified: true,
    image: '/driver-profile.png',
  },
  vehicle: {
    model: 'Volkswagen Golf 7',
    year: '2019',
    color: 'Yellow',
    seats: 4,
    airConditioning: true,
    image: '/images/pexels-pixabay-63324.jpg',
  },
  trip: {
    from: 'Algiers',
    to: 'Oran',
    date: 'Monday, 28 December at 8:00',
    departure: '08:00',
    arrival: '12:30',
    duration: '4h 30m',
    price: 1200,
    seatsLeft: 2,
  },
  features: {
    nonSmoking: true,
    musicPreference: true,
    petsAllowed: false,
    conversation: true,
  },
  passengers: [
    { name: 'Ahmed A.', image: '/passenger-1.jpg' },
    { name: 'Fatima Z.', image: '/passenger-2.jpg' },
  ],
};

export default function TripDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span>Home</span> / <span>Search Results</span> /{' '}
          <span className="text-gray-900">Algiers to Oran</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Trip From Algiers to Oran
              </h1>
              <p className="text-gray-600">{tripData.trip.date}</p>
            </div>

            {/* Driver Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <Image
                  src={tripData.driver.image || '/placeholder.svg'}
                  alt={tripData.driver.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {tripData.driver.name}
                    </h2>
                    {tripData.driver.verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {tripData.driver.rating} ({tripData.driver.trips} trips)
                      </span>
                    </div>
                    <span>Member since {tripData.driver.memberSince}</span>
                  </div>
                  <Button
                    variant="link"
                    className="text-[#FF5722] hover:text-[#E64A19] p-0 h-auto mt-2"
                  >
                    Verified Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={tripData.vehicle.image || '/placeholder.svg'}
                    alt={tripData.vehicle.model}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {tripData.vehicle.model}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {tripData.vehicle.year} • {tripData.vehicle.color}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{tripData.vehicle.seats} seats</span>
                    </div>
                    {tripData.vehicle.airConditioning && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Air conditioning</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Features & Rules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trip Features & Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {tripData.features.nonSmoking ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">Non-Smoking</span>
                </div>
                <div className="flex items-center gap-3">
                  {tripData.features.musicPreference ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Music Preference
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {tripData.features.petsAllowed ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">Pets Allowed</span>
                </div>
                <div className="flex items-center gap-3">
                  {tripData.features.conversation ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">Conversation</span>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Passengers
              </h3>
              <div className="flex items-center gap-4">
                {tripData.passengers.map((passenger, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Image
                      src={passenger.image || '/placeholder.svg'}
                      alt={passenger.name}
                      width={48}
                      height={48}
                      className="rounded-full mb-1"
                    />
                    <span className="text-xs text-gray-600">
                      {passenger.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Price per seat</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {tripData.trip.price} DZD
                  </span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {tripData.trip.seatsLeft} seats available
                </div>
              </div>

              {/* Trip Summary */}
              <div className="space-y-3 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {tripData.trip.from}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tripData.trip.departure}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {tripData.trip.to}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tripData.trip.arrival}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{tripData.trip.date}</span>
                </div>
              </div>

              <Button className="w-full h-12 bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-base">
                Book Now
              </Button>

              <p className="text-xs text-center text-gray-500">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
