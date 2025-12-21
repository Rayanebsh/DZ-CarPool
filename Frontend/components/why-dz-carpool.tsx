'use client';

import { Wallet, Users, Shield, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function WhyDZCarPool() {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Wallet,
      title: t('saveMoney'),
      description: t('saveMoneyDesc'),
    },
    {
      icon: Users,
      title: t('trustedCommunity'),
      description: t('trustedCommunityDesc'),
    },
    {
      icon: Shield,
      title: t('safeTravel'),
      description: t('safeTravelDesc'),
    },
    {
      icon: Calendar,
      title: t('convenience'),
      description: t('convenienceDesc'),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('whyTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('whySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#FF5722]/10 mb-4">
                <benefit.icon className="w-6 h-6 text-[#FF5722]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
