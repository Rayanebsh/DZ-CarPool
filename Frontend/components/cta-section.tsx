'use client';

import { Button } from '@/components/ui/button';
import { Car, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section id="cta" className="py-16 md:py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/pexels-pixabay-63324.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Become a Driver */}
          <div
            id="offer-ride"
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-10 text-center shadow-xl"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1E88E5] mx-auto mb-6">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('becomeDriver')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
              Offer a ride, share your journey, and cover your travel costs.
              Join our community of trusted drivers today.
            </p>
            <Link href="/offer-ride">
              <Button
                size="lg"
                className="bg-[#1E88E5] hover:bg-[#1976D2] text-white px-8"
              >
                {t('offerRide')}
              </Button>
            </Link>
          </div>

          {/* Find a Ride */}
          <div
            id="find-ride"
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-10 text-center shadow-xl"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#FF5722] mx-auto mb-6">
              <ThumbsUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('findRide')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
              Search for your destination and book a comfortable, affordable
              ride with our verified members.
            </p>
            <Link href="/find-ride">
              <Button
                size="lg"
                className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-8"
              >
                {t('findRide')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
