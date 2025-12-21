'use client';

import {
  Search,
  CheckCircle,
  UsersIcon,
  Car,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function HowItWorks() {
  const { t } = useLanguage();

  const passengerSteps = [
    {
      icon: Search,
      title: t('searchForRide'),
      description: t('searchForRideDesc'),
    },
    {
      icon: CheckCircle,
      title: t('bookConnect'),
      description: t('bookConnectDesc'),
    },
    {
      icon: UsersIcon,
      title: t('travelShare'),
      description: t('travelShareDesc'),
    },
  ];

  const driverSteps = [
    {
      icon: Car,
      title: t('publishRide'),
      description: t('publishRideDesc'),
    },
    {
      icon: UserPlus,
      title: t('approveConnect'),
      description: t('approveConnectDesc'),
    },
    {
      icon: Wallet,
      title: t('driveEarn'),
      description: t('driveEarnDesc'),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('howTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* For Passengers */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <h3 className="text-2xl font-bold text-brand mb-8">
              {t('forPassengers')}
            </h3>
            <div className="space-y-6">
              {passengerSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF5722]/10">
                      <step.icon className="w-6 h-6 text-[#FF5722]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Drivers */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <h3 className="text-2xl font-bold text-brand mb-8">
              {t('forDrivers')}
            </h3>
            <div className="space-y-6">
              {driverSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF5722]/10">
                      <step.icon className="w-6 h-6 text-[#FF5722]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
